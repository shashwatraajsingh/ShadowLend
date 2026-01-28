"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Private Collateral",
    description:
      "Your deposit amounts are encrypted on-chain. Only you can view your true collateral value.",
  },
  {
    icon: EyeOff,
    title: "Hidden Positions",
    description:
      "Loan balances and health factors remain confidential. No one can track your positions.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Built on Solana for sub-second transactions with minimal gas fees.",
  },
];

const stats = [
  { value: "$0", label: "Total Value Locked" },
  { value: "0", label: "Active Positions" },
  { value: "75%", label: "Max LTV" },
];

const steps = [
  "Connect your Phantom or Solflare wallet",
  "Deposit SOL as private collateral",
  "Borrow up to 75% LTV confidentially",
  "Repay anytime, withdraw collateral",
];

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent)] opacity-10 blur-[128px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 opacity-10 blur-[128px] rounded-full" />
        </div>

        <div className="container relative pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent-muted)] border border-[var(--color-border-accent)] mb-8"
            >
              <Shield className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                Powered by Inco Lightning
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Private DeFi</span>
              <br />
              Lending on Solana
            </h1>

            <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto">
              Lend and borrow with complete privacy. Your collateral, loan
              amounts, and health factors are encrypted on-chain and visible
              only to you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              {connected ? (
                <Link href="/dashboard" className="btn btn-primary btn-lg">
                  Enter App
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <WalletMultiButton />
              )}
              <Link
                href="#how-it-works"
                className="btn btn-secondary btn-lg"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="stat-value text-gradient">{stat.value}</div>
                  <div className="stat-label mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Diagram Section */}
      <section className="py-20 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How Privacy Works
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              ShadowLend uses Inco Lightning to encrypt your position data
              directly on the blockchain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Diagram */}
            <div className="glass rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
                    <Eye className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Public View</h4>
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      What everyone sees on-chain
                    </p>
                  </div>
                </div>
                <div className="card bg-[var(--color-bg-tertiary)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Collateral</span>
                    <span className="font-mono text-[var(--color-text-muted)]">••••••</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[var(--color-text-secondary)]">Borrowed</span>
                    <span className="font-mono text-[var(--color-text-muted)]">••••••</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[var(--color-text-secondary)]">Health</span>
                    <span className="font-mono text-[var(--color-text-muted)]">••••</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 border-[var(--color-border-accent)]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Your View</h4>
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      Decrypted with your wallet
                    </p>
                  </div>
                </div>
                <div className="card bg-[var(--color-bg-tertiary)] border-[var(--color-border-accent)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Collateral</span>
                    <span className="font-mono text-[var(--color-success)]">10.5 SOL</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[var(--color-text-secondary)]">Borrowed</span>
                    <span className="font-mono text-[var(--color-warning)]">5.25 SOL</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[var(--color-text-secondary)]">Health</span>
                    <span className="font-mono text-[var(--color-success)]">1.52</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why ShadowLend?</h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              The first truly private lending protocol on Solana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card group hover:border-[var(--color-border-accent)]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 border-t border-[var(--color-border)]"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Four simple steps to private DeFi lending
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 py-4"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--color-accent)] font-semibold">
                    {i + 1}
                  </span>
                </div>
                <p className="text-lg">{step}</p>
                <CheckCircle2 className="w-5 h-5 text-[var(--color-text-muted)] ml-auto" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            {connected ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[var(--color-accent)]" />
              <span className="font-bold">ShadowLend</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Built for privacy. Powered by Solana & Inco Lightning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
