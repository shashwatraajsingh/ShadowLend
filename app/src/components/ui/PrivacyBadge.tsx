"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";

interface PrivacyBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export const PrivacyBadge: FC<PrivacyBadgeProps> = ({
  className,
  size = "md",
}) => {
  return (
    <span
      className={cn(
        "privacy-badge inline-flex items-center gap-1.5",
        size === "sm" && "text-[11px] px-2 py-1",
        className
      )}
    >
      <LockIcon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>Encrypted</span>
    </span>
  );
};

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 7V5a3.5 3.5 0 1 1 7 0v2M3 7h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
