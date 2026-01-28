"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: FC<SkeletonProps> = ({
  className,
  variant = "text",
  width,
  height,
}) => {
  return (
    <div
      className={cn(
        "skeleton",
        variant === "text" && "h-4 rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Stat skeleton for dashboard
export const StatSkeleton: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
};

// Card skeleton
export const CardSkeleton: FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "bg-[var(--shadow-bg-secondary)] border border-[var(--shadow-border)] rounded-[14px] p-6",
        className
      )}
    >
      <div className="space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};
