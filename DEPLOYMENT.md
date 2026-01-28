# ShadowLend Deployment Guide

## Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI 0.29.0

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd app
npm install

# Anchor (if not installed)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.29.0
avm use 0.29.0
```

### 2. Set Solana Path

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 3. Build the Program

```bash
cd programs/shadow-lend
cargo update -p blake3 --precise 1.5.0  # Fix dependency issue
cd ../..
anchor build --no-idl
```

### 4. Start Local Validator

```bash
# Terminal 1
solana-test-validator
```

### 5. Deploy Program

```bash
# Terminal 2
anchor deploy
```

### 6. Start Frontend

```bash
# Terminal 3
cd app
npm run dev
```

Open http://localhost:3000

## Devnet Deployment

```bash
# Configure CLI
solana config set --url devnet

# Get devnet SOL
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Update program ID in:
# - Anchor.toml
# - app/src/lib/program.ts
```

## Environment Variables

Create `app/.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=ShdwLend111111111111111111111111111111111111
```

## Project Structure

```
inco-hackathon/
├── programs/
│   └── shadow-lend/
│       ├── Cargo.toml
│       └── src/lib.rs          # Anchor program
├── app/
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities
│   └── public/
│       └── idl/               # Program IDL
├── Anchor.toml
├── Cargo.toml
├── ARCHITECTURE.md
└── README.md
```

## Troubleshooting

### "constant_time_eq" Edition 2024 Error

```bash
cd programs/shadow-lend
cargo update -p blake3 --precise 1.5.0
```

### Program Not Found

Ensure the program ID in `app/src/lib/program.ts` matches the deployed program:

```bash
# Get program ID from keypair
solana address -k target/deploy/shadow_lend-keypair.json
```

### Wallet Not Connecting

1. Ensure you're on the correct network (localnet/devnet)
2. Clear wallet cache and refresh
3. Check browser console for errors

## Testing

```bash
# Run Anchor tests
anchor test

# Run frontend tests
cd app && npm test
```

## Production Checklist

- [ ] Update program ID with actual deployed address
- [ ] Configure production RPC endpoint
- [ ] Enable security headers in Next.js
- [ ] Set up monitoring and logging
- [ ] Audit smart contract
- [ ] Test all user flows on devnet
