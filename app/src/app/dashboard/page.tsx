"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Percent,
  Activity,
  Lock,
  Shield,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePool, usePosition, useWalletBalance } from "@/hooks/useProgram";
import { EncryptedText } from "@/components/ui/EncryptedText";
import { HealthGauge } from "@/components/ui/HealthGauge";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const [showPrivate, setShowPrivate] = useState(true);

  const { stats, loading: poolLoading, refetch: refetchPool } = usePool();
  const { decrypted, loading: positionLoading, refetch: refetchPosition } = usePosition();
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useWalletBalance();

  const loading = poolLoading || positionLoading || balanceLoading;

  const handleRefresh = () => {
    refetchPool();
    refetchPosition();
    refetchBalance();
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-8 rounded-2xl glass shadow-2xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Shield className="w-10 h-10 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Connect your wallet to access the dashboard and manage your private
            lending positions on Inco.
          </p>
          <WalletMultiButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
              Protocol overview and your private positions
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Public Protocol Stats */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[var(--color-text-tertiary)]" />
            <h2 className="text-lg font-semibold">Protocol Statistics</h2>
            <span className="text-xs text-[var(--color-text-muted)] ml-2">
              Public on-chain data
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Total Value Locked"
              value={stats ? `${stats.tvl.toFixed(2)} SOL` : "-"}
              loading={poolLoading}
            />
            <StatCard
              icon={Users}
              label="Active Positions"
              value={stats?.activePositions.toString() ?? "-"}
              loading={poolLoading}
            />
            <StatCard
              icon={Percent}
              label="Interest Rate"
              value={stats ? `${stats.interestRate}%` : "-"}
              loading={poolLoading}
            />
            <StatCard
              icon={Activity}
              label="Utilization"
              value={stats ? `${stats.utilizationRate.toFixed(1)}%` : "-"}
              loading={poolLoading}
            />
          </div>
        </section>

        {/* Private Position Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-semibold">Your Position</h2>
              <span className="privacy-badge">
                <Lock className="w-3 h-3" />
                Private
              </span>
            </div>
            <button
              onClick={() => setShowPrivate(!showPrivate)}
              className="btn btn-ghost text-sm"
            >
              {showPrivate ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Reveal
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 card">
              <div className="grid grid-cols-2 gap-6">
                <PrivateStatCard
                  label="Collateral Deposited"
                  value={decrypted ? `${decrypted.collateral.toFixed(4)} SOL` : "0 SOL"}
                  hidden={!showPrivate}
                  loading={positionLoading}
                  color="success"
                />
                <PrivateStatCard
                  label="Amount Borrowed"
                  value={decrypted ? `${decrypted.debt.toFixed(4)} SOL` : "0 SOL"}
                  hidden={!showPrivate}
                  loading={positionLoading}
                  color="warning"
                />
                <PrivateStatCard
                  label="Available to Borrow"
                  value={decrypted ? `${decrypted.maxBorrow.toFixed(4)} SOL` : "0 SOL"}
                  hidden={!showPrivate}
                  loading={positionLoading}
                  color="info"
                />
                <div className="flex flex-col justify-end">
                  <p className="stat-label mb-2">Net Value</p>
                  {loading ? (
                    <div className="skeleton h-8 w-24" />
                  ) : !showPrivate || !decrypted ? (
                    <p className="text-xl font-bold font-mono text-[var(--color-text-muted)]">••••••</p>
                  ) : (
                    <p className="text-xl font-bold font-mono">
                      {(decrypted.collateral - decrypted.debt).toFixed(4)} SOL
                    </p>
                  )}
                </div>
              </div>

              <div className="divider" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                  <Shield className="w-4 h-4" />
                  <span>Encrypted via Inco Lightning</span>
                </div>
                <Link href="/lend" className="btn btn-primary">
                  Manage Position <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Health Factor Gauge */}
            <div className="card flex flex-col items-center justify-center">
              <HealthGauge value={decrypted ? decrypted.healthFactor : 0} />
            </div>
          </div>
        </section>

        {/* Wallet Balance */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--color-text-tertiary)]" />
            <h2 className="text-lg font-semibold">Wallet</h2>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-tertiary)] mb-1">
                  Connected Wallet
                </p>
                <p className="font-mono text-sm bg-[var(--color-bg-tertiary)] px-3 py-1 rounded-md">
                  {publicKey?.toBase58()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-text-tertiary)] mb-1">
                  SOL Balance
                </p>
                {balanceLoading ? (
                  <div className="skeleton h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {balance.toFixed(4)} SOL
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  loading: boolean;
}

function StatCard({ icon: Icon, label, value, loading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </div>
      </div>
      {loading ? (
        <div className="skeleton h-8 w-20 mb-1" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
      <p className="stat-label">{label}</p>
    </motion.div>
  );
}

interface PrivateStatCardProps {
  label: string;
  value: string;
  hidden: boolean;
  loading: boolean;
  color?: string;
}

function PrivateStatCard({ label, value, hidden, loading, color }: PrivateStatCardProps) {
  const colorMap: Record<string, string> = {
    success: "text-[var(--color-success)]",
    warning: "text-[var(--color-warning)]",
    error: "text-[var(--color-error)]",
    info: "text-[var(--color-info)]",
  };
  const colorClass = color ? colorMap[color] ?? "" : "";

  return (
    <div>
      <p className="stat-label mb-2">{label}</p>
      {loading ? (
        <div className="skeleton h-8 w-24" />
      ) : hidden ? (
        <p className="text-xl font-bold font-mono text-[var(--color-text-muted)] tracking-widest">
          ••••••
        </p>
      ) : (
        <EncryptedText
          text={value}
          className={`text-xl font-bold font-mono ${colorClass}`}
          enabled={false}
        />
      )}
    </div>
  );
}
