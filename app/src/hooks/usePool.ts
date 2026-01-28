"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getPoolPDA, PROGRAM_ID, bpsToPercent } from "@/lib/constants";
import type { Pool, ProtocolStats } from "@/types";

interface UsePoolResult {
  pool: Pool | null;
  stats: ProtocolStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Pool account data layout (matches Anchor serialization)
const POOL_SIZE = 8 + 32 + 32 + 32 + 2 + 2 + 2 + 8 + 8 + 8 + 1 + 1; // discriminator + fields

function deserializePool(data: Buffer): Pool {
  let offset = 8; // Skip discriminator

  const authority = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  const collateralMint = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  const borrowMint = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  const ltvRatio = data.readUInt16LE(offset);
  offset += 2;

  const interestRate = data.readUInt16LE(offset);
  offset += 2;

  const liquidationThreshold = data.readUInt16LE(offset);
  offset += 2;

  const totalDeposits = data.readBigUInt64LE(offset);
  offset += 8;

  const totalBorrows = data.readBigUInt64LE(offset);
  offset += 8;

  const activePositions = data.readBigUInt64LE(offset);
  offset += 8;

  const bump = data.readUInt8(offset);
  offset += 1;

  const isActive = data.readUInt8(offset) === 1;

  return {
    authority,
    collateralMint,
    borrowMint,
    ltvRatio,
    interestRate,
    liquidationThreshold,
    totalDeposits,
    totalBorrows,
    activePositions,
    bump,
    isActive,
  };
}

export function usePool(): UsePoolResult {
  const { connection } = useConnection();
  const [pool, setPool] = useState<Pool | null>(null);
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [poolPDA] = getPoolPDA();
      const accountInfo = await connection.getAccountInfo(poolPDA);

      if (!accountInfo) {
        // Pool not initialized yet
        setPool(null);
        setStats(null);
        return;
      }

      const poolData = deserializePool(Buffer.from(accountInfo.data));
      setPool(poolData);

      // Derive public stats from pool
      setStats({
        totalValueLocked: poolData.totalDeposits,
        totalBorrowed: poolData.totalBorrows,
        activeLoans: poolData.activePositions,
        ltvRatio: bpsToPercent(poolData.ltvRatio),
        interestRate: bpsToPercent(poolData.interestRate),
        liquidationThreshold: bpsToPercent(poolData.liquidationThreshold),
      });
    } catch (err) {
      console.error("Failed to fetch pool:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch pool"));
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    fetchPool();

    // Subscribe to account changes
    const [poolPDA] = getPoolPDA();
    const subscriptionId = connection.onAccountChange(poolPDA, () => {
      fetchPool();
    });

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, fetchPool]);

  return {
    pool,
    stats,
    loading,
    error,
    refetch: fetchPool,
  };
}
