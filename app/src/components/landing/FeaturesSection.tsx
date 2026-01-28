"use client";

import { FC } from "react";
import { Card } from "@/components/ui";

export const FeaturesSection: FC = () => {
  return (
    <section className="py-24 px-6 border-t border-[var(--shadow-border)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-headline mb-4">
            Privacy-First <span className="gradient-text">Lending</span>
          </h2>
          <p className="text-[var(--shadow-text-secondary)] max-w-xl mx-auto">
            Traditional DeFi exposes your entire financial position. ShadowLend
            keeps your data encrypted while maintaining full functionality.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<EncryptIcon />}
            title="Encrypted Positions"
            description="Your collateral and debt amounts are encrypted on-chain. Only you can view your position details."
          />
          <FeatureCard
            icon={<ProofIcon />}
            title="Zero-Knowledge Proofs"
            description="Inco Lightning verifies your position health without revealing actual values to anyone."
          />
          <FeatureCard
            icon={<SpeedIcon />}
            title="Solana Speed"
            description="Sub-second finality and minimal fees. Privacy doesn't mean slow."
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="group hover:border-[var(--shadow-border-accent)] transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-[var(--shadow-accent-subtle)] flex items-center justify-center mb-4 group-hover:bg-[var(--shadow-accent)] transition-colors">
        <div className="text-[var(--shadow-accent)] group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-title mb-2">{title}</h3>
      <p className="text-[var(--shadow-text-secondary)] text-sm leading-relaxed">
        {description}
      </p>
    </Card>
  );
};

function EncryptIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function ProofIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
