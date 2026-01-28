/**
 * IDL Type Definitions for ShadowLend Program
 * Generated from Anchor program
 */

import { PublicKey } from "@solana/web3.js";

export interface Pool {
  authority: PublicKey;
  collateralMint: PublicKey;
  borrowMint: PublicKey;
  ltvRatio: number; // basis points
  interestRate: number; // basis points
  liquidationThreshold: number; // basis points
  totalDeposits: bigint;
  totalBorrows: bigint;
  activePositions: bigint;
  bump: number;
  isActive: boolean;
}

export interface Position {
  owner: PublicKey;
  pool: PublicKey;
  encryptedCollateral: Uint8Array; // 32 bytes
  encryptedDebt: Uint8Array; // 32 bytes
  lastUpdate: bigint;
  isActive: boolean;
  bump: number;
}

// Decoded position with decrypted values (visible only to owner)
export interface DecodedPosition {
  owner: PublicKey;
  pool: PublicKey;
  collateral: bigint;
  debt: bigint;
  healthFactor: number;
  lastUpdate: Date;
  isActive: boolean;
}

// Public protocol statistics (visible to everyone)
export interface ProtocolStats {
  totalValueLocked: bigint;
  totalBorrowed: bigint;
  activeLoans: bigint;
  ltvRatio: number;
  interestRate: number;
  liquidationThreshold: number;
}

// Transaction types
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "borrow"
  | "repay"
  | "liquidate";

export interface TransactionState {
  type: TransactionType;
  status: "idle" | "pending" | "confirming" | "success" | "error";
  signature?: string;
  error?: string;
}
