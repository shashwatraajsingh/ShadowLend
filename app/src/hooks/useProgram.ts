"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getPoolPDA, getPositionPDA, PROGRAM_ID } from "@/lib/program";
import {
  decryptAmount,
  deriveEncryptionKey,
  computeHealthFactor,
  type EncryptionKeyPair,
} from "@/lib/encryption";

// Pool account structure (deserialize from on-chain data)
export interface PoolState {
    authority: PublicKey;
    collateralMint: PublicKey;
    borrowMint: PublicKey;
    ltvRatio: number;
    interestRate: number;
    liquidationThreshold: number;
    totalDeposits: number; // In lamports
    totalBorrows: number;
    activePositions: number;
    isActive: boolean;
}

// Position account structure
export interface PositionState {
    owner: PublicKey;
    pool: PublicKey;
    encryptedCollateral: Uint8Array;
    encryptedDebt: Uint8Array;
    lastUpdate: number;
    isActive: boolean;
}

// Decrypted position (after client-side decryption)
export interface DecryptedPosition {
    collateral: number; // SOL
    debt: number; // SOL
    healthFactor: number;
    maxBorrow: number; // Available to borrow
}

// Pool stats for public display
export interface PoolStats {
    tvl: number; // Total SOL locked
    totalBorrowed: number;
    activePositions: number;
    ltvRatio: number;
    interestRate: number;
    utilizationRate: number;
}

export function usePool() {
    const { connection } = useConnection();
    const [pool, setPool] = useState<PoolState | null>(null);
    const [stats, setStats] = useState<PoolStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPool = useCallback(async () => {
        try {
            setLoading(true);
            const poolPDA = getPoolPDA();

            // Check if program exists
            const programInfo = await connection.getAccountInfo(PROGRAM_ID);

            if (!programInfo) {
                // Program not deployed - return demo stats
                setStats({
                    tvl: 0,
                    totalBorrowed: 0,
                    activePositions: 0,
                    ltvRatio: 75,
                    interestRate: 5,
                    utilizationRate: 0,
                });
                setLoading(false);
                return;
            }

            const accountInfo = await connection.getAccountInfo(poolPDA);

            if (!accountInfo) {
                // Pool not initialized
                setStats({
                    tvl: 0,
                    totalBorrowed: 0,
                    activePositions: 0,
                    ltvRatio: 75,
                    interestRate: 5,
                    utilizationRate: 0,
                });
                setLoading(false);
                return;
            }

            // Deserialize pool data
            const data = accountInfo.data;

            // Skip 8-byte discriminator
            let offset = 8;

            const authority = new PublicKey(data.slice(offset, offset + 32));
            offset += 32;

            const collateralMint = new PublicKey(data.slice(offset, offset + 32));
            offset += 32;

            const borrowMint = new PublicKey(data.slice(offset, offset + 32));
            offset += 32;

            const ltvRatio = data.readUInt16LE(offset);
            offset += 2;

            const interestRate = data.readUInt16LE(offset);
            offset += 2;

            const liquidationThreshold = data.readUInt16LE(offset);
            offset += 2;

            const totalDeposits = Number(data.readBigUInt64LE(offset));
            offset += 8;

            const totalBorrows = Number(data.readBigUInt64LE(offset));
            offset += 8;

            const activePositions = Number(data.readBigUInt64LE(offset));
            offset += 8;

            const poolState: PoolState = {
                authority,
                collateralMint,
                borrowMint,
                ltvRatio,
                interestRate,
                liquidationThreshold,
                totalDeposits,
                totalBorrows,
                activePositions,
                isActive: data[offset + 1] === 1,
            };

            setPool(poolState);

            // Calculate public stats
            const tvlSol = totalDeposits / LAMPORTS_PER_SOL;
            const borrowedSol = totalBorrows / LAMPORTS_PER_SOL;
            const utilization = totalDeposits > 0
                ? (totalBorrows / totalDeposits) * 100
                : 0;

            setStats({
                tvl: tvlSol,
                totalBorrowed: borrowedSol,
                activePositions,
                ltvRatio: ltvRatio / 100,
                interestRate: interestRate / 100,
                utilizationRate: utilization,
            });

            setError(null);
        } catch (err) {
            console.error("Failed to fetch pool:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch pool");

            // Set default stats on error
            setStats({
                tvl: 0,
                totalBorrowed: 0,
                activePositions: 0,
                ltvRatio: 75,
                interestRate: 5,
                utilizationRate: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [connection]);

    useEffect(() => {
        fetchPool();

        // Refresh every 30 seconds
        const interval = setInterval(fetchPool, 30000);
        return () => clearInterval(interval);
    }, [fetchPool]);

    return { pool, stats, loading, error, refetch: fetchPool };
}

export function usePosition() {
    const { connection } = useConnection();
    const { publicKey, signMessage } = useWallet();
    const [position, setPosition] = useState<PositionState | null>(null);
    const [decrypted, setDecrypted] = useState<DecryptedPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [encryptionKey, setEncryptionKey] = useState<EncryptionKeyPair | null>(null);

    // Derive encryption key when wallet connects
    useEffect(() => {
        async function deriveKey() {
            if (signMessage && publicKey && !encryptionKey) {
                try {
                    const key = await deriveEncryptionKey(signMessage);
                    setEncryptionKey(key);
                } catch (err) {
                    console.error("Failed to derive encryption key:", err);
                }
            }
        }
        deriveKey();
    }, [signMessage, publicKey, encryptionKey]);

    const fetchPosition = useCallback(async () => {
        if (!publicKey) {
            setPosition(null);
            setDecrypted(null);
            return;
        }

        try {
            setLoading(true);
            const positionPDA = getPositionPDA(publicKey);
            const accountInfo = await connection.getAccountInfo(positionPDA);

            if (!accountInfo) {
                // No position exists
                setPosition(null);
                setDecrypted(null);
                setLoading(false);
                return;
            }

            // Deserialize position data
            const data = accountInfo.data;
            let offset = 8; // Skip discriminator

            const owner = new PublicKey(data.slice(offset, offset + 32));
            offset += 32;

            const pool = new PublicKey(data.slice(offset, offset + 32));
            offset += 32;

            // Skip length prefix for encrypted data (4 bytes each)
            offset += 4;
            const encryptedCollateral = data.slice(offset, offset + 32);
            offset += 32;

            offset += 4;
            const encryptedDebt = data.slice(offset, offset + 32);
            offset += 32;

            const lastUpdate = Number(data.readBigInt64LE(offset));
            offset += 8;

            const isActive = data[offset] === 1;

            const positionState: PositionState = {
                owner,
                pool,
                encryptedCollateral: new Uint8Array(encryptedCollateral),
                encryptedDebt: new Uint8Array(encryptedDebt),
                lastUpdate,
                isActive,
            };

            setPosition(positionState);

            // Decrypt position data using the encryption key
            if (encryptionKey) {
                const decryptedData = decryptPosition(positionState, encryptionKey);
                setDecrypted(decryptedData);
            } else {
                // No encryption key yet, show zeros
                setDecrypted({
                    collateral: 0,
                    debt: 0,
                    healthFactor: Infinity,
                    maxBorrow: 0,
                });
            }

            setError(null);
        } catch (err) {
            console.error("Failed to fetch position:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch position");
        } finally {
            setLoading(false);
        }
    }, [connection, publicKey, encryptionKey]);

    useEffect(() => {
        fetchPosition();

        // Refresh every 30 seconds
        const interval = setInterval(fetchPosition, 30000);
        return () => clearInterval(interval);
    }, [fetchPosition]);

    return { position, decrypted, loading, error, refetch: fetchPosition };
}

// Decrypt position using the user's encryption key
function decryptPosition(
    position: PositionState,
    encryptionKey: EncryptionKeyPair
): DecryptedPosition {
    // Check if position has data
    const hasCollateralData = position.encryptedCollateral.some((b) => b !== 0);
    const hasDebtData = position.encryptedDebt.some((b) => b !== 0);

    if (!hasCollateralData && !hasDebtData) {
        return {
            collateral: 0,
            debt: 0,
            healthFactor: Infinity,
            maxBorrow: 0,
        };
    }

    // Decrypt collateral and debt
    const collateralLamports = hasCollateralData
        ? decryptAmount(position.encryptedCollateral, encryptionKey)
        : BigInt(0);
    const debtLamports = hasDebtData
        ? decryptAmount(position.encryptedDebt, encryptionKey)
        : BigInt(0);

    // Convert to SOL
    const collateral = collateralLamports !== null
        ? Number(collateralLamports) / LAMPORTS_PER_SOL
        : 0;
    const debt = debtLamports !== null
        ? Number(debtLamports) / LAMPORTS_PER_SOL
        : 0;

    // Calculate health factor (using 80% liquidation threshold = 8000 bps)
    const LIQUIDATION_THRESHOLD = 8000;
    const LTV_RATIO = 7500; // 75%

    const healthFactor = debt > 0
        ? computeHealthFactor(
            collateralLamports ?? BigInt(0),
            debtLamports ?? BigInt(0),
            LIQUIDATION_THRESHOLD
          ) / 100 // Convert from percentage to ratio
        : Infinity;

    // Calculate max borrow (collateral * LTV - current debt)
    const maxBorrowLamports = collateralLamports !== null && debtLamports !== null
        ? (collateralLamports * BigInt(LTV_RATIO) / BigInt(10000)) - debtLamports
        : BigInt(0);
    const maxBorrow = maxBorrowLamports > 0
        ? Number(maxBorrowLamports) / LAMPORTS_PER_SOL
        : 0;

    return {
        collateral,
        debt,
        healthFactor,
        maxBorrow,
    };
}

// Hook for wallet SOL balance
export function useWalletBalance() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const fetchBalance = useCallback(async () => {
        if (!publicKey) {
            setBalance(0);
            return;
        }

        try {
            setLoading(true);
            const lamports = await connection.getBalance(publicKey);
            setBalance(lamports / LAMPORTS_PER_SOL);
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        } finally {
            setLoading(false);
        }
    }, [connection, publicKey]);

    useEffect(() => {
        fetchBalance();

        // Refresh every 10 seconds
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    return { balance, loading, refetch: fetchBalance };
}
