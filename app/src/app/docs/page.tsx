import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--shadow-bg-primary)]">
      <Header />

      <main className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-headline mb-8">Documentation</h1>

          <div className="prose prose-invert max-w-none">
            {/* Architecture */}
            <section className="mb-12">
              <h2 className="text-title text-[var(--shadow-text-primary)] mb-4">
                Architecture Overview
              </h2>
              <div className="p-6 rounded-xl bg-[var(--shadow-bg-secondary)] border border-[var(--shadow-border)]">
                <pre className="text-sm text-[var(--shadow-text-secondary)] overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        ShadowLend Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │   Frontend  │────▶│  Encryption  │────▶│  Solana Program │  │
│  │  (Next.js)  │     │   (Client)   │     │    (Anchor)     │  │
│  └─────────────┘     └──────────────┘     └─────────────────┘  │
│         │                   │                      │            │
│         │                   │                      │            │
│         ▼                   ▼                      ▼            │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │   Wallet    │     │    Inco      │     │      Pool       │  │
│  │  Adapter    │     │  Lightning   │     │    Account      │  │
│  └─────────────┘     │   (MPC)      │     │   (Public)      │  │
│                      └──────────────┘     └─────────────────┘  │
│                             │                      │            │
│                             ▼                      ▼            │
│                      ┌──────────────┐     ┌─────────────────┐  │
│                      │    Proofs    │     │    Position     │  │
│                      │ (ZK Verify)  │     │    Account      │  │
│                      └──────────────┘     │  (Encrypted)    │  │
│                                           └─────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
                </pre>
              </div>
            </section>

            {/* Confidential Data Flow */}
            <section className="mb-12">
              <h2 className="text-title text-[var(--shadow-text-primary)] mb-4">
                Confidential Data Flow
              </h2>
              <div className="space-y-4 text-[var(--shadow-text-secondary)]">
                <p>
                  ShadowLend encrypts sensitive position data before storing it
                  on-chain:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    <strong>Key Derivation:</strong> User signs a domain-specific
                    message to derive an encryption keypair
                  </li>
                  <li>
                    <strong>Encryption:</strong> Collateral and debt amounts are
                    encrypted client-side using the derived key
                  </li>
                  <li>
                    <strong>On-chain Storage:</strong> Encrypted values (32-byte
                    ciphertexts) are stored in the Position account
                  </li>
                  <li>
                    <strong>Proof Generation:</strong> For operations that require
                    health checks, Inco Lightning generates proofs
                  </li>
                  <li>
                    <strong>Decryption:</strong> Only the position owner can decrypt
                    their data using their wallet signature
                  </li>
                </ol>
              </div>
            </section>

            {/* Smart Contracts */}
            <section className="mb-12">
              <h2 className="text-title text-[var(--shadow-text-primary)] mb-4">
                Smart Contract Structure
              </h2>
              <div className="p-6 rounded-xl bg-[var(--shadow-bg-secondary)] border border-[var(--shadow-border)]">
                <pre className="text-sm text-[var(--shadow-text-secondary)] overflow-x-auto">
{`programs/shadow-lend/src/lib.rs

┌──────────────────────────────────────────────────────┐
│                    Pool Account                       │
├──────────────────────────────────────────────────────┤
│  authority: Pubkey          (32 bytes)               │
│  collateral_mint: Pubkey    (32 bytes)               │
│  borrow_mint: Pubkey        (32 bytes)               │
│  ltv_ratio: u16             (2 bytes) - basis points │
│  interest_rate: u16         (2 bytes) - basis points │
│  liquidation_threshold: u16 (2 bytes)                │
│  total_deposits: u64        (8 bytes) - PUBLIC       │
│  total_borrows: u64         (8 bytes) - PUBLIC       │
│  active_positions: u64      (8 bytes) - PUBLIC       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  Position Account                     │
├──────────────────────────────────────────────────────┤
│  owner: Pubkey                    (32 bytes)         │
│  pool: Pubkey                     (32 bytes)         │
│  encrypted_collateral: [u8; 32]   (32 bytes) PRIVATE │
│  encrypted_debt: [u8; 32]         (32 bytes) PRIVATE │
│  last_update: i64                 (8 bytes)          │
│  is_active: bool                  (1 byte)           │
└──────────────────────────────────────────────────────┘

Instructions:
├── initialize_pool     - Create lending pool
├── open_position       - Create user position
├── deposit_collateral  - Add collateral (encrypted)
├── borrow              - Borrow against collateral
├── repay               - Repay borrowed amount
├── withdraw_collateral - Remove collateral
├── liquidate           - Liquidate unhealthy position
└── close_position      - Close empty position`}
                </pre>
              </div>
            </section>

            {/* Privacy Model */}
            <section className="mb-12">
              <h2 className="text-title text-[var(--shadow-text-primary)] mb-4">
                Privacy Model
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-[var(--shadow-bg-secondary)] border border-[var(--shadow-border)]">
                  <h3 className="font-semibold text-[var(--shadow-success)] mb-3">
                    Public Data
                  </h3>
                  <ul className="text-sm text-[var(--shadow-text-secondary)] space-y-2">
                    <li>- Total Value Locked (aggregate)</li>
                    <li>- Total Borrowed (aggregate)</li>
                    <li>- Number of active positions</li>
                    <li>- Pool configuration (LTV, rates)</li>
                    <li>- Position existence (not values)</li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-[var(--shadow-accent-subtle)] border border-[var(--shadow-border-accent)]">
                  <h3 className="font-semibold text-[var(--shadow-accent)] mb-3">
                    Private Data (Encrypted)
                  </h3>
                  <ul className="text-sm text-[var(--shadow-text-secondary)] space-y-2">
                    <li>- Individual collateral amounts</li>
                    <li>- Individual debt amounts</li>
                    <li>- Position health factors</li>
                    <li>- Transaction amounts (in position)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Integration */}
            <section className="mb-12">
              <h2 className="text-title text-[var(--shadow-text-primary)] mb-4">
                Inco Lightning Integration
              </h2>
              <div className="text-[var(--shadow-text-secondary)] space-y-4">
                <p>
                  Inco Lightning provides confidential computation for operations
                  that require verifying position health without revealing values:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    <strong>Borrow Verification:</strong> Proves collateral ×
                    LTV {">="} debt + borrow_amount
                  </li>
                  <li>
                    <strong>Withdrawal Verification:</strong> Proves remaining
                    collateral maintains healthy position
                  </li>
                  <li>
                    <strong>Liquidation Verification:</strong> Proves health
                    factor is below liquidation threshold
                  </li>
                </ul>
                <p className="text-sm text-[var(--shadow-text-muted)] mt-4">
                  Note: The current implementation includes placeholder proof
                  verification. Production deployment requires full Inco Lightning
                  MPC integration.
                </p>
              </div>
            </section>

            {/* Development */}
            <section className="mb-12">
              <h2 className="text-title text-[var(--shadow-text-primary)] mb-4">
                Local Development
              </h2>
              <div className="p-6 rounded-xl bg-[var(--shadow-bg-secondary)] border border-[var(--shadow-border)]">
                <pre className="text-sm text-[var(--shadow-text-secondary)] overflow-x-auto">
{`# Prerequisites
- Solana CLI >= 1.16
- Anchor >= 0.29.0
- Node.js >= 18

# Start local validator
solana-test-validator

# Build and deploy program
cd programs/shadow-lend
anchor build
anchor deploy

# Run frontend
cd app
npm install
npm run dev

# Open http://localhost:3000`}
                </pre>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
