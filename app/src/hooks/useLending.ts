"use client";

import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  PROGRAM_ID,
  getPoolPDA,
  getPositionPDA,
  getVaultPDA,
  parseSolToLamports,
} from "@/lib/constants";
import {
  encryptAmount,
  generateBorrowProof,
  generateWithdrawalProof,
  type EncryptionKeyPair,
} from "@/lib/encryption";
import type { TransactionState } from "@/types";
import { usePool } from "./usePool";
import { usePosition } from "./usePosition";

interface UseLendingResult {
  // Transaction state
  txState: TransactionState;

  // Actions
  openPosition: () => Promise<string>;
  depositCollateral: (
    amount: string,
    encryptionKey: EncryptionKeyPair
  ) => Promise<string>;
  borrow: (
    amount: string,
    encryptionKey: EncryptionKeyPair
  ) => Promise<string>;
  repay: (
    amount: string,
    encryptionKey: EncryptionKeyPair
  ) => Promise<string>;
  withdrawCollateral: (
    amount: string,
    encryptionKey: EncryptionKeyPair
  ) => Promise<string>;
  closePosition: () => Promise<string>;

  // Reset state
  resetTxState: () => void;
}

// Instruction discriminators (first 8 bytes of sha256("global:<instruction_name>"))
const DISCRIMINATORS = {
  openPosition: Buffer.from([135, 128, 47, 77, 15, 152, 240, 49]),
  depositCollateral: Buffer.from([138, 147, 160, 52, 220, 190, 117, 13]),
  borrow: Buffer.from([228, 253, 131, 202, 207, 116, 166, 78]),
  repay: Buffer.from([234, 103, 67, 82, 247, 168, 156, 32]),
  withdrawCollateral: Buffer.from([115, 135, 168, 106, 139, 214, 138, 150]),
  closePosition: Buffer.from([123, 134, 81, 0, 49, 68, 98, 98]),
};

export function useLending(): UseLendingResult {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { pool, refetch: refetchPool } = usePool();
  const { position, decodedPosition, refetch: refetchPosition } = usePosition();

  const [txState, setTxState] = useState<TransactionState>({
    type: "deposit",
    status: "idle",
  });

  const resetTxState = useCallback(() => {
    setTxState({ type: "deposit", status: "idle" });
  }, []);

  const executeTransaction = useCallback(
    async (
      instruction: TransactionInstruction,
      type: TransactionState["type"]
    ): Promise<string> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      setTxState({ type, status: "pending" });

      try {
        const transaction = new Transaction().add(instruction);
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        setTxState({ type, status: "confirming" });

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        setTxState({ type, status: "success", signature });

        // Refetch data
        await Promise.all([refetchPool(), refetchPosition()]);

        return signature;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Transaction failed";
        setTxState({ type, status: "error", error: errorMessage });
        throw err;
      }
    },
    [connection, publicKey, sendTransaction, refetchPool, refetchPosition]
  );

  const openPosition = useCallback(async (): Promise<string> => {
    if (!publicKey) throw new Error("Wallet not connected");

    const [poolPDA] = getPoolPDA();
    const [positionPDA] = getPositionPDA(publicKey);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: poolPDA, isSigner: false, isWritable: false },
        { pubkey: poolPDA, isSigner: false, isWritable: true },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: DISCRIMINATORS.openPosition,
    });

    return executeTransaction(instruction, "deposit");
  }, [publicKey, executeTransaction]);

  const depositCollateral = useCallback(
    async (
      amountSol: string,
      encryptionKey: EncryptionKeyPair
    ): Promise<string> => {
      if (!publicKey || !pool) throw new Error("Wallet not connected or pool not loaded");

      const amount = parseSolToLamports(amountSol);
      if (amount <= 0) throw new Error("Invalid amount");

      const [poolPDA] = getPoolPDA();
      const [positionPDA] = getPositionPDA(publicKey);
      const [vaultPDA] = getVaultPDA(poolPDA);

      // Encrypt the amount
      const encryptedAmount = encryptAmount(BigInt(amount), encryptionKey);

      // Build instruction data: discriminator + amount (u64) + encrypted_amount ([u8; 32])
      const data = Buffer.alloc(8 + 8 + 32);
      DISCRIMINATORS.depositCollateral.copy(data, 0);
      data.writeBigUInt64LE(BigInt(amount), 8);
      Buffer.from(encryptedAmount).copy(data, 16);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: positionPDA, isSigner: false, isWritable: true },
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      return executeTransaction(instruction, "deposit");
    },
    [publicKey, pool, executeTransaction]
  );

  const borrow = useCallback(
    async (
      amountSol: string,
      encryptionKey: EncryptionKeyPair
    ): Promise<string> => {
      if (!publicKey || !pool || !position) {
        throw new Error("Wallet not connected or position not loaded");
      }

      const amount = parseSolToLamports(amountSol);
      if (amount <= 0) throw new Error("Invalid amount");

      const [poolPDA] = getPoolPDA();
      const [positionPDA] = getPositionPDA(publicKey);
      const [vaultPDA] = getVaultPDA(poolPDA);

      // Calculate new debt (existing + new borrow)
      const currentDebt = decodedPosition?.debt ?? BigInt(0);
      const newDebt = currentDebt + BigInt(amount);
      const encryptedNewDebt = encryptAmount(newDebt, encryptionKey);

      // Generate Inco proof
      const proof = await generateBorrowProof(
        position.encryptedCollateral,
        position.encryptedDebt,
        BigInt(amount),
        pool.ltvRatio
      );

      // Build instruction data: discriminator + amount + encrypted_new_debt + proof_len + proof
      const data = Buffer.alloc(8 + 8 + 32 + 4 + proof.length);
      let offset = 0;
      DISCRIMINATORS.borrow.copy(data, offset);
      offset += 8;
      data.writeBigUInt64LE(BigInt(amount), offset);
      offset += 8;
      Buffer.from(encryptedNewDebt).copy(data, offset);
      offset += 32;
      data.writeUInt32LE(proof.length, offset);
      offset += 4;
      Buffer.from(proof).copy(data, offset);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: false },
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: positionPDA, isSigner: false, isWritable: true },
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      return executeTransaction(instruction, "borrow");
    },
    [publicKey, pool, position, decodedPosition, executeTransaction]
  );

  const repay = useCallback(
    async (
      amountSol: string,
      encryptionKey: EncryptionKeyPair
    ): Promise<string> => {
      if (!publicKey || !pool || !decodedPosition) {
        throw new Error("Wallet not connected or position not loaded");
      }

      const amount = parseSolToLamports(amountSol);
      if (amount <= 0) throw new Error("Invalid amount");

      const [poolPDA] = getPoolPDA();
      const [positionPDA] = getPositionPDA(publicKey);
      const [vaultPDA] = getVaultPDA(poolPDA);

      // Calculate new debt after repayment
      const newDebt =
        decodedPosition.debt > BigInt(amount)
          ? decodedPosition.debt - BigInt(amount)
          : BigInt(0);
      const encryptedNewDebt = encryptAmount(newDebt, encryptionKey);

      // Build instruction data
      const data = Buffer.alloc(8 + 8 + 32);
      DISCRIMINATORS.repay.copy(data, 0);
      data.writeBigUInt64LE(BigInt(amount), 8);
      Buffer.from(encryptedNewDebt).copy(data, 16);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: positionPDA, isSigner: false, isWritable: true },
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      return executeTransaction(instruction, "repay");
    },
    [publicKey, pool, decodedPosition, executeTransaction]
  );

  const withdrawCollateral = useCallback(
    async (
      amountSol: string,
      encryptionKey: EncryptionKeyPair
    ): Promise<string> => {
      if (!publicKey || !pool || !position || !decodedPosition) {
        throw new Error("Wallet not connected or position not loaded");
      }

      const amount = parseSolToLamports(amountSol);
      if (amount <= 0) throw new Error("Invalid amount");

      const [poolPDA] = getPoolPDA();
      const [positionPDA] = getPositionPDA(publicKey);
      const [vaultPDA] = getVaultPDA(poolPDA);

      // Calculate new collateral after withdrawal
      const newCollateral =
        decodedPosition.collateral > BigInt(amount)
          ? decodedPosition.collateral - BigInt(amount)
          : BigInt(0);
      const encryptedNewCollateral = encryptAmount(newCollateral, encryptionKey);

      // Generate withdrawal proof
      const proof = await generateWithdrawalProof(
        position.encryptedCollateral,
        position.encryptedDebt,
        BigInt(amount),
        pool.ltvRatio
      );

      // Build instruction data
      const data = Buffer.alloc(8 + 8 + 32 + 4 + proof.length);
      let offset = 0;
      DISCRIMINATORS.withdrawCollateral.copy(data, offset);
      offset += 8;
      data.writeBigUInt64LE(BigInt(amount), offset);
      offset += 8;
      Buffer.from(encryptedNewCollateral).copy(data, offset);
      offset += 32;
      data.writeUInt32LE(proof.length, offset);
      offset += 4;
      Buffer.from(proof).copy(data, offset);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: positionPDA, isSigner: false, isWritable: true },
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      return executeTransaction(instruction, "withdraw");
    },
    [publicKey, pool, position, decodedPosition, executeTransaction]
  );

  const closePosition = useCallback(async (): Promise<string> => {
    if (!publicKey) throw new Error("Wallet not connected");

    const [poolPDA] = getPoolPDA();
    const [positionPDA] = getPositionPDA(publicKey);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: poolPDA, isSigner: false, isWritable: true },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: true },
      ],
      programId: PROGRAM_ID,
      data: DISCRIMINATORS.closePosition,
    });

    return executeTransaction(instruction, "withdraw");
  }, [publicKey, executeTransaction]);

  return {
    txState,
    openPosition,
    depositCollateral,
    borrow,
    repay,
    withdrawCollateral,
    closePosition,
    resetTxState,
  };
}
