"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { PrivacyBadge } from "./PrivacyBadge";
import { Skeleton } from "./Skeleton";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  isPrivate?: boolean;
  loading?: boolean;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export const StatCard: FC<StatCardProps> = ({
  label,
  value,
  subValue,
  isPrivate = false,
  loading = false,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-[var(--shadow-bg-secondary)] border border-[var(--shadow-border)]",
        "rounded-[14px] p-5 transition-colors hover:border-[var(--shadow-border-hover)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{label}</span>
        {isPrivate && <PrivacyBadge size="sm" />}
      </div>

      {loading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <div className="flex items-baseline gap-3">
          <span className="stat-value">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-sm font-medium",
                trend.direction === "up" && "text-[var(--shadow-success)]",
                trend.direction === "down" && "text-[var(--shadow-error)]",
                trend.direction === "neutral" && "text-[var(--shadow-text-tertiary)]"
              )}
            >
              {trend.direction === "up" && "+"}
              {trend.value}
            </span>
          )}
        </div>
      )}

      {subValue && !loading && (
        <p className="text-sm text-[var(--shadow-text-tertiary)] mt-1">
          {subValue}
        </p>
      )}
    </div>
  );
};
