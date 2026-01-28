"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  healthFactor: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const HealthIndicator: FC<HealthIndicatorProps> = ({
  healthFactor,
  size = "md",
  showLabel = true,
  className,
}) => {
  const getHealthStatus = () => {
    if (healthFactor === Infinity || healthFactor > 200) {
      return { label: "Safe", color: "var(--shadow-success)", level: 100 };
    }
    if (healthFactor >= 150) {
      return { label: "Healthy", color: "var(--shadow-success)", level: 80 };
    }
    if (healthFactor >= 120) {
      return { label: "Moderate", color: "var(--shadow-warning)", level: 60 };
    }
    if (healthFactor >= 100) {
      return { label: "At Risk", color: "var(--shadow-warning)", level: 40 };
    }
    return { label: "Critical", color: "var(--shadow-error)", level: 20 };
  };

  const status = getHealthStatus();
  const displayValue =
    healthFactor === Infinity ? "---" : `${healthFactor.toFixed(0)}%`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--shadow-text-secondary)]">
            Health Factor
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative bg-[var(--shadow-bg-tertiary)] rounded-full overflow-hidden",
          size === "sm" && "h-1.5",
          size === "md" && "h-2",
          size === "lg" && "h-3"
        )}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(status.level, 100)}%`,
            backgroundColor: status.color,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-semibold",
            size === "sm" && "text-lg",
            size === "md" && "text-xl",
            size === "lg" && "text-2xl"
          )}
          style={{ color: status.color }}
        >
          {displayValue}
        </span>
        <span className="text-xs text-[var(--shadow-text-muted)]">
          Liquidation at 100%
        </span>
      </div>
    </div>
  );
};
