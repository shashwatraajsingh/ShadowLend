"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-[var(--color-bg-elevated)] group-[.toaster]:text-[var(--color-text-primary)] group-[.toaster]:border-[var(--color-border)] group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-[var(--color-text-secondary)]",
                    actionButton:
                        "group-[.toast]:bg-[var(--color-accent)] group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-[var(--color-bg-tertiary)] group-[.toast]:text-[var(--color-text-secondary)]",
                },
            }}
        />
    );
}
