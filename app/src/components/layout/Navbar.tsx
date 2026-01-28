"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Shield, LayoutDashboard, Wallet, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lend", label: "Lend & Borrow", icon: ArrowLeftRight },
    { href: "/position", label: "My Position", icon: Wallet },
];

export function Navbar() {
    const pathname = usePathname();
    const { connected } = useWallet();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <nav className="container flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <Shield className="w-8 h-8 text-[var(--color-accent)]" />
                        <motion.div
                            className="absolute inset-0 bg-[var(--color-accent)] opacity-30 blur-lg"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Shadow<span className="text-gradient">Lend</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                {connected && (
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Wallet Button */}
                <div className="flex items-center gap-4">
                    <WalletMultiButton />
                </div>
            </nav>
        </header>
    );
}
