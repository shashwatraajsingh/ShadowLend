"use client";

import { FC } from "react";

export const HowItWorksSection: FC = () => {
  return (
    <section className="py-24 px-6 bg-[var(--shadow-bg-secondary)]">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-headline mb-4">How It Works</h2>
          <p className="text-[var(--shadow-text-secondary)] max-w-xl mx-auto">
            Confidential lending in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-8 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[2px] bg-gradient-to-r from-[var(--shadow-accent)] via-[var(--shadow-border)] to-[var(--shadow-accent)]" />

          <div className="grid md:grid-cols-4 gap-8">
            <Step
              number={1}
              title="Connect Wallet"
              description="Connect your Phantom or Solflare wallet to get started"
            />
            <Step
              number={2}
              title="Deposit Collateral"
              description="Deposit SOL as collateral. Amount is encrypted on-chain"
            />
            <Step
              number={3}
              title="Borrow Privately"
              description="Borrow against your collateral. Loan details visible only to you"
            />
            <Step
              number={4}
              title="Manage Position"
              description="Repay, withdraw, or add more collateral anytime"
            />
          </div>
        </div>

        {/* Privacy diagram */}
        <div className="mt-20 p-8 rounded-2xl border border-[var(--shadow-border)] bg-[var(--shadow-bg-primary)]">
          <h3 className="text-title text-center mb-8">
            Public vs Private Data
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Public */}
            <div className="p-6 rounded-xl bg-[var(--shadow-bg-tertiary)] border border-[var(--shadow-border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--shadow-success-muted)] flex items-center justify-center">
                  <EyeIcon className="w-4 h-4 text-[var(--shadow-success)]" />
                </div>
                <span className="font-medium text-[var(--shadow-text-primary)]">
                  Public (Everyone can see)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-[var(--shadow-text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Total protocol TVL (aggregate)
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Number of active loans
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Interest rates
                </li>
              </ul>
            </div>

            {/* Private */}
            <div className="p-6 rounded-xl bg-[var(--shadow-accent-subtle)] border border-[var(--shadow-border-accent)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--shadow-accent)] flex items-center justify-center">
                  <LockIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-[var(--shadow-text-primary)]">
                  Private (Only you can see)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-[var(--shadow-text-secondary)]">
                <li className="flex items-center gap-2">
                  <LockSmallIcon />
                  Your collateral amount
                </li>
                <li className="flex items-center gap-2">
                  <LockSmallIcon />
                  Your borrowed amount
                </li>
                <li className="flex items-center gap-2">
                  <LockSmallIcon />
                  Your health factor
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: FC<StepProps> = ({ number, title, description }) => {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--shadow-accent)] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 relative z-10">
        {number}
      </div>
      <h3 className="font-semibold text-[var(--shadow-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--shadow-text-secondary)]">
        {description}
      </p>
    </div>
  );
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[var(--shadow-success)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l4 4 6-6" />
    </svg>
  );
}

function LockSmallIcon() {
  return (
    <svg className="w-4 h-4 text-[var(--shadow-accent)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="7" width="8" height="6" rx="1" />
      <path d="M6 7V5a2 2 0 014 0v2" />
    </svg>
  );
}
