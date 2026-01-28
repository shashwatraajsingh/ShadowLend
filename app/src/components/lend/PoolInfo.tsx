"use client";

import { FC } from "react";
import { usePool } from "@/hooks";
import { formatSol, bpsToPercent } from "@/lib/constants";
import { Card } from "@/components/ui";

export const PoolInfo: FC = () => {
  const { pool, stats, loading } = usePool();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-48 bg-[var(--shadow-bg-tertiary)] rounded-lg" />
      </Card>
    );
  }

  if (!pool) {
    return (
      <Card className="text-center py-8">
        <p className="text-[var(--shadow-text-secondary)]">
          Pool not initialized
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-6">Pool Information</h3>

      <div className="space-y-4">
        {/* Utilization bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--shadow-text-secondary)]">
              Utilization
            </span>
            <span className="text-sm font-medium">
              {stats && stats.totalValueLocked > 0
                ? `${((Number(stats.totalBorrowed) / Number(stats.totalValueLocked)) * 100).toFixed(1)}%`
                : "0%"}
            </span>
          </div>
          <div className="h-2 bg-[var(--shadow-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--shadow-accent)] rounded-full transition-all"
              style={{
                width:
                  stats && stats.totalValueLocked > 0
                    ? `${Math.min((Number(stats.totalBorrowed) / Number(stats.totalValueLocked)) * 100, 100)}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--shadow-border)] space-y-3">
          <InfoRow
            label="Available Liquidity"
            value={`${formatSol(stats ? stats.totalValueLocked - stats.totalBorrowed : BigInt(0))} SOL`}
          />
          <InfoRow
            label="Total Deposits"
            value={`${formatSol(stats?.totalValueLocked ?? BigInt(0))} SOL`}
          />
          <InfoRow
            label="Total Borrowed"
            value={`${formatSol(stats?.totalBorrowed ?? BigInt(0))} SOL`}
          />
          <InfoRow
            label="LTV Ratio"
            value={`${bpsToPercent(pool.ltvRatio).toFixed(0)}%`}
          />
          <InfoRow
            label="Interest Rate"
            value={`${bpsToPercent(pool.interestRate).toFixed(2)}% APR`}
          />
          <InfoRow
            label="Liquidation Threshold"
            value={`${bpsToPercent(pool.liquidationThreshold).toFixed(0)}%`}
          />
        </div>
      </div>
    </Card>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[var(--shadow-text-tertiary)]">{label}</span>
    <span className="font-medium text-[var(--shadow-text-primary)]">{value}</span>
  </div>
);
