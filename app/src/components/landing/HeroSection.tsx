"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export const HeroSection: FC = () => {
  const { connected } = useWallet();
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--shadow-accent)] opacity-[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600 opacity-[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--shadow-accent-subtle)] border border-[var(--shadow-border-accent)] mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--shadow-accent)] animate-pulse" />
          <span className="text-sm font-medium text-[var(--shadow-accent)]">
            Built on Solana + Inco Lightning
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-display mb-6">
          <span className="text-[var(--shadow-text-primary)]">Private DeFi</span>
          <br />
          <span className="gradient-text">Lending on Solana</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-[var(--shadow-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Deposit collateral, borrow assets, and manage positions with complete
          privacy. Your financial data stays encrypted and visible only to you.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {connected ? (
            <Button
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="min-w-[200px]"
            >
              Go to Dashboard
              <ArrowIcon />
            </Button>
          ) : (
            <WalletMultiButton />
          )}
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 text-sm text-[var(--shadow-text-muted)]">
          <div className="flex items-center gap-2">
            <ShieldIcon />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <LockIcon />
            <span>Non-custodial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span>Audited contracts</span>
          </div>
        </div>
      </div>
    </section>
  );
};

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7.5 3.5-1.5 6-4 6-7.5V4L8 1.5z" />
      <path d="M5.5 8l2 2 3-3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3.5 8.5l3 3 6-6" />
    </svg>
  );
}
