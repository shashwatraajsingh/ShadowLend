"use client";

import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: FC<CardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
}) => {
  return (
    <div
      className={cn(
        "rounded-[14px] border transition-colors",
        variant === "default" &&
          "bg-[var(--shadow-bg-secondary)] border-[var(--shadow-border)]",
        variant === "glass" && "glass-card",
        variant === "elevated" &&
          "bg-[var(--shadow-bg-elevated)] border-[var(--shadow-border-hover)]",
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-4 border-b border-[var(--shadow-border)]",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle: FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-[var(--shadow-text-primary)]",
        className
      )}
    >
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn("pt-4", className)}>{children}</div>;
};
