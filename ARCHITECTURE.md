# ShadowLend Architecture

## Overview

ShadowLend is a confidential lending protocol on Solana that uses Inco Lightning for encrypted on-chain state. Users can deposit collateral and borrow against it while keeping their position details (collateral amount, debt, health factor) private.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                       │
│                                                                             │
│   ┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │ Connect │ -> │   Deposit    │ -> │    Borrow    │ -> │   Repay/    │  │
│   │ Wallet  │    │  Collateral  │    │  (Private)   │    │  Withdraw   │  │
│   └─────────┘    └──────────────┘    └──────────────┘    └─────────────┘  │
│                         │                   │                   │          │
│                         ▼                   ▼                   ▼          │
│              ┌──────────────────────────────────────────────────────────┐  │
│              │                    ENCRYPTION LAYER                      │  │
│              │        Client-side encryption using Inco SDK            │  │
│              │     Amount -> Encrypted Bytes (32-byte ciphertext)      │  │
│              └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOLANA BLOCKCHAIN                                    │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐│
│   │                      SHADOWLEND PROGRAM                                ││
│   │                                                                        ││
│   │   ┌──────────────┐    ┌──────────────────┐    ┌───────────────────┐  ││
│   │   │     Pool     │    │     Position     │    │      Vault       │   ││
│   │   │   (Public)   │    │   (Encrypted)    │    │   (SOL Store)    │   ││
│   │   │              │    │                  │    │                  │   ││
│   │   │ - Authority  │    │ - Owner         │    │ - PDA Account    │   ││
│   │   │ - TVL        │    │ - Pool          │    │ - Holds SOL      │   ││
│   │   │ - Borrows    │    │ - EncCollateral │    │                  │   ││
│   │   │ - Positions  │    │ - EncDebt       │    │                  │   ││
│   │   │ - LTV/Rate   │    │ - LastUpdate    │    │                  │   ││
│   │   └──────────────┘    └──────────────────┘    └───────────────────┘  ││
│   │                                                                        ││
│   │                        INSTRUCTIONS                                    ││
│   │   ┌────────────────┬────────────────┬────────────────┬──────────────┐ ││
│   │   │ initialize_pool│ deposit        │ borrow         │ repay        │ ││
│   │   │ open_position  │ withdraw       │ liquidate      │ close        │ ││
│   │   └────────────────┴────────────────┴────────────────┴──────────────┘ ││
│   └───────────────────────────────────────────────────────────────────────┘│
│                                      │                                      │
│                                      ▼                                      │
│   ┌───────────────────────────────────────────────────────────────────────┐│
│   │                        INCO LIGHTNING                                  ││
│   │                                                                        ││
│   │   - Encrypted state storage                                           ││
│   │   - Confidential computation                                          ││
│   │   - Proof generation for borrow/withdraw eligibility                  ││
│   │   - MPC-based decryption for position owners                          ││
│   └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

## Privacy Model

### What's Public (Visible to Everyone)
- Pool exists and is active
- Total Value Locked (TVL) - aggregated, anonymous
- Total borrowed amount - aggregated
- Number of active positions
- Interest rate and LTV parameters
- Position exists for a given wallet

### What's Private (Visible Only to Position Owner)
- Collateral amount
- Debt amount
- Health factor
- Liquidation status
- Transaction history details

## Account Structures

### Pool Account (Public)

```rust
pub struct Pool {
    pub authority: Pubkey,              // Pool admin
    pub collateral_mint: Pubkey,        // Collateral token (SOL)
    pub borrow_mint: Pubkey,            // Borrow token (SOL)
    pub ltv_ratio: u16,                 // Max LTV (7500 = 75%)
    pub interest_rate: u16,             // Annual rate (500 = 5%)
    pub liquidation_threshold: u16,     // (8000 = 80%)
    pub total_deposits: u64,            // Public aggregate
    pub total_borrows: u64,             // Public aggregate
    pub active_positions: u64,          // Count
    pub bump: u8,
    pub is_active: bool,
}
```

### Position Account (Encrypted)

```rust
pub struct Position {
    pub owner: Pubkey,                      // Position owner
    pub pool: Pubkey,                       // Parent pool
    pub encrypted_collateral: [u8; 32],     // Inco ciphertext
    pub encrypted_debt: [u8; 32],           // Inco ciphertext
    pub last_update: i64,                   // Timestamp
    pub is_active: bool,
    pub bump: u8,
}
```

## Encryption Flow

### Deposit Flow

```
1. User enters deposit amount (e.g., 10 SOL)
2. Frontend encrypts: encrypt(10 SOL) -> [32 bytes ciphertext]
3. Transaction:
   - Transfer 10 SOL to vault PDA
   - Store ciphertext in position.encrypted_collateral
4. Pool.total_deposits += 10 SOL (public aggregate)
5. User can decrypt their position client-side
```

### Borrow Flow

```
1. User requests borrow amount (e.g., 5 SOL)
2. Frontend generates Inco proof:
   - Proves: decrypt(encrypted_collateral) * LTV >= decrypt(encrypted_debt) + 5
   - WITHOUT revealing actual values
3. Transaction:
   - Verify Inco proof on-chain
   - Transfer 5 SOL from vault to user
   - Update encrypted_debt ciphertext
4. Pool.total_borrows += 5 SOL
```

### Decryption Flow

```
1. Frontend reads position.encrypted_collateral and encrypted_debt
2. Wallet signs a message proving ownership
3. Inco MPC network decrypts values for owner only
4. Frontend displays: Collateral: 10 SOL, Debt: 5 SOL, Health: 1.5
```

## PDA Derivation

```typescript
// Pool PDA
[pool] = findProgramAddressSync([Buffer.from("pool")], PROGRAM_ID);

// Position PDA (per user)
[position] = findProgramAddressSync(
  [Buffer.from("position"), owner.toBuffer()],
  PROGRAM_ID
);

// Vault PDA (holds collateral)
[vault] = findProgramAddressSync(
  [Buffer.from("vault"), pool.toBuffer()],
  PROGRAM_ID
);
```

## Frontend Architecture

```
app/src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── dashboard/page.tsx        # User dashboard
│   ├── lend/page.tsx             # Deposit/Borrow actions
│   ├── position/page.tsx         # Position details
│   └── layout.tsx                # Root layout
├── components/
│   ├── layout/
│   │   └── Navbar.tsx            # Navigation
│   └── providers/
│       └── WalletProvider.tsx    # Solana wallet adapter
├── hooks/
│   └── useProgram.ts             # On-chain data fetching
└── lib/
    └── program.ts                # Program constants & PDAs
```

## Data Flow

### Reading Pool Stats (Public)

```typescript
const { connection } = useConnection();
const poolPDA = getPoolPDA();
const accountInfo = await connection.getAccountInfo(poolPDA);
// Deserialize public fields
const tvl = totalDeposits / LAMPORTS_PER_SOL;
```

### Reading Position (Private)

```typescript
const { publicKey } = useWallet();
const positionPDA = getPositionPDA(publicKey);
const accountInfo = await connection.getAccountInfo(positionPDA);
// Get encrypted fields
const encryptedCollateral = position.encryptedCollateral;
// Decrypt via Inco SDK
const collateral = await incoClient.decrypt(encryptedCollateral);
```

## Security Considerations

1. **Proof Verification**: Borrow and withdrawal operations require valid Inco proofs
2. **Liquidation Privacy**: Liquidators can only see IF a position is underwater, not the exact amounts
3. **Aggregate Leakage**: TVL is public but individual contributions are hidden
4. **Timing Analysis**: Transaction timing could reveal patterns; consider batching

## Deployment

### Local Development

```bash
# Terminal 1: Start Solana validator
solana-test-validator

# Terminal 2: Deploy program
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
anchor build --no-idl
anchor deploy

# Terminal 3: Start frontend
cd app && npm run dev
```

### Devnet Deployment

```bash
# Configure for devnet
solana config set --url devnet
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Update frontend to use devnet program ID
```

## Future Improvements

1. **SPL Token Support**: Support USDC, USDT as collateral/borrow assets
2. **Variable Interest Rates**: Dynamic rates based on utilization
3. **Multi-Collateral**: Multiple collateral types per position
4. **Governance**: DAO-controlled protocol parameters
5. **Cross-Chain**: Bridge encrypted positions to other chains

## References

- [Inco Lightning Documentation](https://docs.inco.network)
- [Arcium C-SPL Standard](https://docs.arcium.network)
- [Solana Anchor Framework](https://www.anchor-lang.com)
