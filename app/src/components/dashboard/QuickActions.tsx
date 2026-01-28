"use client";

import { FC } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export const QuickActions: FC = () => {
  return (
    <Card padding="none">
      <div className="p-6 border-b border-[var(--shadow-border)]">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        <Link href="/lend?action=deposit">
          <ActionCard
            icon={<DepositIcon />}
            label="Deposit"
            description="Add collateral"
          />
        </Link>
        <Link href="/lend?action=borrow">
          <ActionCard
            icon={<BorrowIcon />}
            label="Borrow"
            description="Get a loan"
          />
        </Link>
        <Link href="/lend?action=repay">
          <ActionCard
            icon={<RepayIcon />}
            label="Repay"
            description="Pay back loan"
          />
        </Link>
        <Link href="/lend?action=withdraw">
          <ActionCard
            icon={<WithdrawIcon />}
            label="Withdraw"
            description="Remove collateral"
          />
        </Link>
      </div>
    </Card>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
}

const ActionCard: FC<ActionCardProps> = ({ icon, label, description }) => {
  return (
    <div className="p-4 rounded-xl bg-[var(--shadow-bg-tertiary)] border border-[var(--shadow-border)] hover:border-[var(--shadow-border-accent)] hover:bg-[var(--shadow-bg-elevated)] transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-[var(--shadow-accent-subtle)] flex items-center justify-center mb-3 group-hover:bg-[var(--shadow-accent)] transition-colors">
        <div className="text-[var(--shadow-accent)] group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <p className="font-medium text-[var(--shadow-text-primary)]">{label}</p>
      <p className="text-xs text-[var(--shadow-text-tertiary)]">{description}</p>
    </div>
  );
};

function DepositIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3v14M3 10l7-7 7 7" />
    </svg>
  );
}

function BorrowIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 17V3M3 10l7 7 7-7" />
    </svg>
  );
}

function RepayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 5l-5 5-5-5M5 15l5-5 5 5" />
    </svg>
  );
}

function WithdrawIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="6" width="12" height="10" rx="1" />
      <path d="M8 6V4a2 2 0 014 0v2" />
      <path d="M10 10v3" />
    </svg>
  );
}
