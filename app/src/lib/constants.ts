import { PublicKey } from "@solana/web3.js";

// Program ID - Update this after deployment
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "8dBNWFxxdvHmoZWKuS1rGzGGmBxdXxHXauYAiTPM4Zan"
);

// Pool seed
export const POOL_SEED = Buffer.from("pool");

// Position seed prefix
export const POSITION_SEED = Buffer.from("position");

// Vault seed prefix
export const VAULT_SEED = Buffer.from("vault");

// Derive pool PDA
export function getPoolPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([POOL_SEED], PROGRAM_ID);
}

// Derive position PDA for a user
export function getPositionPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [POSITION_SEED, owner.toBuffer()],
    PROGRAM_ID
  );
}

// Derive vault PDA
export function getVaultPDA(pool: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, pool.toBuffer()],
    PROGRAM_ID
  );
}

// Lamports per SOL
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Format lamports to SOL string
export function formatSol(lamports: number | bigint): string {
  const sol = Number(lamports) / LAMPORTS_PER_SOL;
  return sol.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

// Parse SOL to lamports
export function parseSolToLamports(sol: string): number {
  const parsed = parseFloat(sol);
  if (isNaN(parsed)) return 0;
  return Math.floor(parsed * LAMPORTS_PER_SOL);
}

// Basis points to percentage
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

// Truncate public key for display
export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
