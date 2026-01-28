import { PublicKey } from "@solana/web3.js";

// Program ID - Update after deployment
export const PROGRAM_ID = new PublicKey(
    "8dBNWFxxdvHmoZWKuS1rGzGGmBxdXxHXauYAiTPM4Zan"
);

// PDAs
export const getPoolPDA = () => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool")],
        PROGRAM_ID
    );
    return pda;
};

export const getPositionPDA = (owner: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), owner.toBuffer()],
        PROGRAM_ID
    );
    return pda;
};

export const getVaultPDA = (pool: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), pool.toBuffer()],
        PROGRAM_ID
    );
    return pda;
};

// Account Sizes (for rent calculation)
export const POOL_SIZE = 8 + 32 + 32 + 32 + 2 + 2 + 2 + 8 + 8 + 8 + 1 + 1;
export const POSITION_SIZE = 8 + 32 + 32 + 32 + 32 + 8 + 1 + 1;

// Instruction discriminators (first 8 bytes of sha256 hash of instruction name)
export const INSTRUCTIONS = {
    initializePool: Buffer.from([
        // anchor discriminator for "initialize_pool"
        0x5f, 0x64, 0x0e, 0x68, 0x17, 0x4b, 0x3f, 0x6c,
    ]),
    openPosition: Buffer.from([
        0x87, 0x80, 0x22, 0x50, 0x66, 0x2c, 0xfe, 0xef,
    ]),
    depositCollateral: Buffer.from([
        0x2c, 0x01, 0x6a, 0x40, 0x7b, 0x5c, 0x4e, 0x90,
    ]),
    borrow: Buffer.from([
        0x22, 0x8d, 0x2e, 0x2f, 0x7a, 0x9e, 0x8b, 0x34,
    ]),
    repay: Buffer.from([
        0xd8, 0x5b, 0x0e, 0x98, 0x8c, 0x2d, 0x6f, 0x1a,
    ]),
    withdrawCollateral: Buffer.from([
        0xb7, 0x12, 0x46, 0x95, 0x61, 0xa4, 0x0a, 0xce,
    ]),
    liquidate: Buffer.from([
        0xdf, 0x04, 0x70, 0x52, 0x86, 0xb4, 0x1a, 0x7e,
    ]),
    closePosition: Buffer.from([
        0x7b, 0x86, 0x51, 0x0a, 0x07, 0x44, 0x1c, 0xb4,
    ]),
};

// Interest rate model constants
export const INTEREST_RATE_BASE = 300; // 3% base rate in basis points
export const INTEREST_RATE_SLOPE = 200; // 2% slope
export const LTV_RATIO = 7500; // 75%
export const LIQUIDATION_THRESHOLD = 8000; // 80%
