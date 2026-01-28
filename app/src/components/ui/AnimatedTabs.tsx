"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface AnimatedTabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function AnimatedTabs({ tabs, activeTab, onChange, className }: AnimatedTabsProps) {
    return (
        <div className={cn("flex gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl relative", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative z-10 flex-1 flex items-center justify-center gap-2 py-3",
                            "rounded-lg font-medium text-sm transition-colors duration-200",
                            isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-[var(--color-bg-elevated)] rounded-lg shadow-sm"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
