"use client";

import { FC, InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--shadow-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-field",
              error && "border-[var(--shadow-error)] focus:border-[var(--shadow-error)]",
              suffix && "pr-16",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--shadow-text-tertiary)] font-medium">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--shadow-error)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--shadow-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
