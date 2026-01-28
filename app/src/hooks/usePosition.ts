"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getPositionPDA, getPoolPDA, bpsToPercent } from "@/lib/constants";
import {
  deriveEncryptionKey,
  decryptAmount,
  computeHealthFactor,
  type EncryptionKeyPair,
} from "@/lib/encryption";
import type { Position, DecodedPosition } from "@/types";
import { usePool } from "./usePool";

interface UsePositionResult {
  position: Position | null;
  decodedPosition: DecodedPosition | null;
  encryptionKey: EncryptionKeyPair | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  initializeEncryption: () => Promise<EncryptionKeyPair>;
}

// Position account data layout
const POSITION_SIZE = 8 + 32 + 32 + 32 + 32 + 8 + 1 + 1; // discriminator + fields

function deserializePosition(data: Buffer): Position {
  let offset = 8; // Skip discriminator

  const owner = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  const pool = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  const encryptedCollateral = new Uint8Array(data.subarray(offset, offset + 32));
  offset += 32;

  const encryptedDebt = new Uint8Array(data.subarray(offset, offset + 32));
  offset += 32;

  const lastUpdate = data.readBigInt64LE(offset);
  offset += 8;

  const isActive = data.readUInt8(offset) === 1;
  offset += 1;

  const bump = data.readUInt8(offset);

  return {
    owner,
    pool,
    encryptedCollateral,
    encryptedDebt,
    lastUpdate,
    isActive,
    bump,
  };
}

export function usePosition(): UsePositionResult {
  const { connection } = useConnection();
  const { publicKey, signMessage } = useWallet();
  const { pool } = usePool();

  const [position, setPosition] = useState<Position | null>(null);
  const [decodedPosition, setDecodedPosition] = useState<DecodedPosition | null>(
    null
  );
  const [encryptionKey, setEncryptionKey] = useState<EncryptionKeyPair | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initializeEncryption = useCallback(async () => {
    if (!signMessage) {
      throw new Error("Wallet does not support message signing");
    }

    try {
      const key = await deriveEncryptionKey(signMessage);
      setEncryptionKey(key);
      return key;
    } catch (err) {
      console.error("Failed to derive encryption key:", err);
      throw err;
    }
  }, [signMessage]);

  const fetchPosition = useCallback(async () => {
    if (!publicKey) {
      setPosition(null);
      setDecodedPosition(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [positionPDA] = getPositionPDA(publicKey);
      const accountInfo = await connection.getAccountInfo(positionPDA);

      if (!accountInfo) {
        setPosition(null);
        setDecodedPosition(null);
        return;
      }

      const positionData = deserializePosition(Buffer.from(accountInfo.data));
      setPosition(positionData);

      // Decrypt position data if we have the encryption key
      if (encryptionKey && pool) {
        const collateral = decryptAmount(
          positionData.encryptedCollateral,
          encryptionKey
        );
        const debt = decryptAmount(positionData.encryptedDebt, encryptionKey);

        if (collateral !== null && debt !== null) {
          const healthFactor = computeHealthFactor(
            collateral,
            debt,
            pool.liquidationThreshold
          );

          setDecodedPosition({
            owner: positionData.owner,
            pool: positionData.pool,
            collateral,
            debt,
            healthFactor,
            lastUpdate: new Date(Number(positionData.lastUpdate) * 1000),
            isActive: positionData.isActive,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch position:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch position")
      );
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, encryptionKey, pool]);

  useEffect(() => {
    fetchPosition();

    if (!publicKey) return;

    // Subscribe to position changes
    const [positionPDA] = getPositionPDA(publicKey);
    const subscriptionId = connection.onAccountChange(positionPDA, () => {
      fetchPosition();
    });

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey, fetchPosition]);

  // Re-decode when encryption key becomes available
  useEffect(() => {
    if (encryptionKey && position && pool) {
      const collateral = decryptAmount(position.encryptedCollateral, encryptionKey);
      const debt = decryptAmount(position.encryptedDebt, encryptionKey);

      if (collateral !== null && debt !== null) {
        const healthFactor = computeHealthFactor(
          collateral,
          debt,
          pool.liquidationThreshold
        );

        setDecodedPosition({
          owner: position.owner,
          pool: position.pool,
          collateral,
          debt,
          healthFactor,
          lastUpdate: new Date(Number(position.lastUpdate) * 1000),
          isActive: position.isActive,
        });
      }
    }
  }, [encryptionKey, position, pool]);

  return {
    position,
    decodedPosition,
    encryptionKey,
    loading,
    error,
    refetch: fetchPosition,
    initializeEncryption,
  };
}
