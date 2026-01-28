"use client";

import { FC } from "react";
import { usePool } from "@/hooks";
import { formatSol } from "@/lib/constants";
import { StatCard } from "@/components/ui";

export const ProtocolStats: FC = () => {
  const { stats, loading } = usePool();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Value Locked"
        value={stats ? `${formatSol(stats.totalValueLocked)} SOL` : "0 SOL"}
        loading={loading}
      />
      <StatCard
        label="Total Borrowed"
        value={stats ? `${formatSol(stats.totalBorrowed)} SOL` : "0 SOL"}
        loading={loading}
      />
      <StatCard
        label="Active Loans"
        value={stats ? stats.activeLoans.toString() : "0"}
        loading={loading}
      />
      <StatCard
        label="Interest Rate"
        value={stats ? `${stats.interestRate.toFixed(2)}%` : "0%"}
        subValue="Annual"
        loading={loading}
      />
    </div>
  );
};
