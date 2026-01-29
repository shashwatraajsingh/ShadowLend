"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function Navbar() {
    const { connected } = useWallet();

    return (
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f0518]/70 backdrop-blur-xl">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-gradient-to-br from-white/10 to-transparent group-hover:border-primary/50 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <span className="material-symbols-outlined text-white">shield</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-glow-purple transition-all">
                        Shadow<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Lend</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                {connected && (
                    <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
                        <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">grid_view</span>
                            Dashboard
                        </Link>
                        <Link href="/lend" className="hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-[20px] group-hover:text-secondary transition-colors">swap_horiz</span>
                            Lend &amp; Borrow
                        </Link>
                        <Link href="/position" className="hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-[20px] group-hover:text-accent transition-colors">account_balance_wallet</span>
                            My Position
                        </Link>
                    </nav>
                )}

                {/* Wallet Button */}
                <div className="flex items-center gap-4">
                    <WalletMultiButton />
                </div>
            </div>
        </header>
    );
}
