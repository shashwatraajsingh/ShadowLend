# ShadowLend

**Confidential Lending & Borrowing on Solana**

A privacy-first DeFi protocol that allows users to lend and borrow with complete privacy. Your collateral amounts, loan balances, and health factors are encrypted on-chain and visible only to you.

![ShadowLend Landing Page](docs/landing.png)

## 🔒 Privacy Features

- **Private Collateral**: Deposit amounts encrypted on-chain using Inco Lightning
- **Hidden Loan Balances**: Only you can see how much you've borrowed
- **Confidential Health Factor**: Liquidation threshold computed privately
- **Public Aggregates**: Only TVL and position count visible to observers

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER WALLET                              │
│                    (Phantom / Solflare)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│                                                                  │
│   Landing → Dashboard → Lend/Borrow → Position Details          │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              ▼                         ▼                        │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │  Solana RPC Client  │  │  Client-Side Encryption Layer   │  │
│  │  (Public State)     │  │  (Inco SDK Decryption)          │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SOLANA BLOCKCHAIN                            │
│  ┌───────────────────┬───────────────────┬─────────────────────┐│
│  │   Pool State      │   Position State  │   Vault             ││
│  │   (Public)        │   (Encrypted)     │   (SOL Storage)     ││
│  │   - TVL           │   - EncCollateral │                     ││
│  │   - Positions     │   - EncDebt       │                     ││
│  └───────────────────┴───────────────────┴─────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Frontend Only (Demo Mode)

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000

### Full Stack (With Program)

```bash
# Terminal 1: Start validator
solana-test-validator

# Terminal 2: Build & deploy
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
cd programs/shadow-lend && cargo update -p blake3 --precise 1.5.0 && cd ../..
anchor build --no-idl
anchor deploy

# Terminal 3: Frontend
cd app && npm run dev
```

## 📁 Project Structure

```
├── programs/shadow-lend/
│   ├── Cargo.toml
│   └── src/lib.rs              # Anchor program
├── app/
│   ├── src/
│   │   ├── app/                # Pages (Landing, Dashboard, Lend, Position)
│   │   ├── components/         # UI components
│   │   ├── hooks/              # usePool, usePosition, useWalletBalance
│   │   └── lib/                # Program constants & PDAs
│   └── public/idl/             # Program IDL
├── Anchor.toml
├── ARCHITECTURE.md             # Technical deep-dive
└── DEPLOYMENT.md               # Setup instructions
```

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, TailwindCSS |
| Blockchain | Solana, Anchor 0.29.0 |
| Privacy | Inco Lightning (encrypted state) |
| Wallets | Phantom, Solflare |
| Design | Custom design system (Stripe/Linear inspired) |

## 🎨 Design System

- **Theme**: Deep charcoal dark mode
- **Accent**: Muted violet (#8b5cf6)
- **Typography**: Inter font family
- **Components**: Glass panels, gradient buttons, micro-animations
- **Privacy UI**: Lock icons, blur toggles, encryption indicators

## 📋 Features

### Landing Page
- Clear value proposition
- Privacy diagram (Public vs Your View)
- Feature cards with hover effects
- Step-by-step onboarding

### Dashboard
- Protocol stats (TVL, Positions, Utilization)
- Private position summary with hide/reveal
- Wallet balance display
- Quick actions

### Lend & Borrow
- Deposit/Borrow/Repay/Withdraw tabs
- Real-time balance updates
- Privacy indicators
- Health factor warnings
- Transaction status tracking

### Position Details
- Full position breakdown
- Health factor monitoring
- Explorer links
- Privacy explanation panel

## 🔧 Smart Contract

### Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize_pool` | Create lending pool with LTV/rate config |
| `open_position` | Create user position account |
| `deposit_collateral` | Deposit SOL as private collateral |
| `borrow` | Borrow against collateral (requires Inco proof) |
| `repay` | Repay outstanding debt |
| `withdraw_collateral` | Withdraw collateral (requires proof) |
| `liquidate` | Liquidate unhealthy position |
| `close_position` | Close empty position |

### Privacy Model

```
Public Data:              Private Data (Owner Only):
- Pool exists             - Collateral amount
- TVL aggregate           - Debt amount  
- Position count          - Health factor
- Interest rate           - Liquidation status
```

## 📄 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design & data flow
- [Deployment Guide](./DEPLOYMENT.md) - Setup & troubleshooting

## 🛡️ Security

- Encrypted position state via Inco Lightning
- Proof verification for borrow/withdraw
- PDA-based account derivation
- No centralized backend

## 📜 License

MIT

---

**Built for privacy. Powered by Solana & Inco Lightning.**
