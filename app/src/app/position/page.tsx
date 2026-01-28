"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePool, usePosition, useWalletBalance } from "@/hooks/useProgram";
import { getPositionPDA } from "@/lib/program";

export default function PositionPage() {
  const { connected, publicKey } = useWallet();
  const [showValues, setShowValues] = useState(true);

  const { stats } = usePool();
  const { position, decrypted, loading } = usePosition();
  const { balance } = useWalletBalance();

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold mb-4">View Your Position</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Connect your wallet to view your private lending position details.
          </p>
          <WalletMultiButton />
        </motion.div>
      </div>
    );
  }

  const positionPDA = publicKey ? getPositionPDA(publicKey) : null;
  const hasPosition = position && position.isActive;

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Position</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
              View and manage your private lending position
            </p>
          </div>
          <button
            onClick={() => setShowValues(!showValues)}
            className="btn btn-secondary"
          >
            {showValues ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Values
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Values
              </>
            )}
          </button>
        </div>

        {/* Position Status Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
                <Lock className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <div>
                <h2 className="font-semibold">Position Status</h2>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  {hasPosition ? "Active" : "No Active Position"}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${hasPosition
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
                }`}
            >
              {hasPosition ? "Active" : "None"}
            </span>
          </div>

          {/* Position Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Collateral */}
            <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
              <p className="stat-label mb-2">Collateral Deposited</p>
              {loading ? (
                <div className="skeleton h-8 w-32" />
              ) : showValues ? (
                <p className="text-2xl font-bold text-[var(--color-success)] font-mono">
                  {decrypted?.collateral.toFixed(4) ?? "0"} SOL
                </p>
              ) : (
                <p className="text-2xl font-bold text-[var(--color-text-muted)] font-mono">
                  ••••••
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--color-text-tertiary)]">
                <Lock className="w-3 h-3" />
                <span>Encrypted on-chain</span>
              </div>
            </div>

            {/* Debt */}
            <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
              <p className="stat-label mb-2">Amount Borrowed</p>
              {loading ? (
                <div className="skeleton h-8 w-32" />
              ) : showValues ? (
                <p className="text-2xl font-bold text-[var(--color-warning)] font-mono">
                  {decrypted?.debt.toFixed(4) ?? "0"} SOL
                </p>
              ) : (
                <p className="text-2xl font-bold text-[var(--color-text-muted)] font-mono">
                  ••••••
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--color-text-tertiary)]">
                <Lock className="w-3 h-3" />
                <span>Encrypted on-chain</span>
              </div>
            </div>

            {/* Health Factor */}
            <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
              <p className="stat-label mb-2">Health Factor</p>
              {loading ? (
                <div className="skeleton h-8 w-24" />
              ) : showValues ? (
                <p
                  className={`text-2xl font-bold font-mono ${decrypted && decrypted.healthFactor < 1.2
                      ? "text-[var(--color-error)]"
                      : "text-[var(--color-success)]"
                    }`}
                >
                  {decrypted?.healthFactor === Infinity
                    ? "∞ (No Debt)"
                    : decrypted?.healthFactor.toFixed(2) ?? "-"}
                </p>
              ) : (
                <p className="text-2xl font-bold text-[var(--color-text-muted)] font-mono">
                  ••••
                </p>
              )}
              <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                Liquidation at &lt;1.0
              </p>
            </div>

            {/* Available to Borrow */}
            <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
              <p className="stat-label mb-2">Available to Borrow</p>
              {loading ? (
                <div className="skeleton h-8 w-32" />
              ) : showValues ? (
                <p className="text-2xl font-bold text-[var(--color-info)] font-mono">
                  {decrypted?.maxBorrow.toFixed(4) ?? "0"} SOL
                </p>
              ) : (
                <p className="text-2xl font-bold text-[var(--color-text-muted)] font-mono">
                  ••••••
                </p>
              )}
              <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                Max LTV: {stats?.ltvRatio ?? 75}%
              </p>
            </div>
          </div>
        </div>

        {/* Health Warning */}
        {hasPosition && decrypted && decrypted.healthFactor < 1.5 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-[var(--color-warning)] bg-[var(--color-warning)]/5 mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[var(--color-warning)] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[var(--color-warning)] mb-1">
                  Low Health Factor Warning
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Your position is approaching liquidation threshold. Consider
                  repaying some debt or adding more collateral.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Position Details */}
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Position Details</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-tertiary)]">Position Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {positionPDA?.toBase58().slice(0, 8)}...
                  {positionPDA?.toBase58().slice(-8)}
                </span>
                <a
                  href={`https://explorer.solana.com/address/${positionPDA?.toBase58()}?cluster=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-tertiary)]">Interest Rate</span>
              <span className="font-mono">{stats?.interestRate ?? 5}% APR</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-tertiary)]">Last Updated</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="font-mono text-sm">
                  {position?.lastUpdate
                    ? new Date(position.lastUpdate * 1000).toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-[var(--color-text-tertiary)]">Wallet Balance</span>
              <span className="font-mono">{balance.toFixed(4)} SOL</span>
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="card bg-[var(--color-accent-muted)] border-[var(--color-border-accent)]">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-[var(--color-accent)] flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Privacy Protection</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Your position data is encrypted using Inco Lightning. The
                collateral amount, borrowed amount, and health factor are stored
                as encrypted bytes on-chain. Only your wallet can decrypt and
                view this information.
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                <strong>What&apos;s public:</strong> Position exists, last update
                timestamp
                <br />
                <strong>What&apos;s private:</strong> All amounts, health factor,
                liquidation status
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Link href="/lend" className="btn btn-primary flex-1">
            Manage Position
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="btn btn-secondary flex-1">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
