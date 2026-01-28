"use client";

import { FC } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { truncateAddress } from "@/lib/constants";

export const Header: FC = () => {
  const { connected, publicKey } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--shadow-border)] bg-[var(--shadow-bg-primary)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--shadow-accent)] to-purple-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-[var(--shadow-text-primary)] group-hover:text-[var(--shadow-accent)] transition-colors">
            ShadowLend
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {connected && (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/lend">Lend</NavLink>
              <NavLink href="/position">Position</NavLink>
            </>
          )}
          <NavLink href="/docs">Docs</NavLink>
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-4">
          {connected && publicKey && (
            <span className="hidden sm:block text-sm text-[var(--shadow-text-tertiary)] font-mono">
              {truncateAddress(publicKey.toBase58())}
            </span>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: FC<NavLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-[var(--shadow-text-secondary)] hover:text-[var(--shadow-text-primary)] hover:bg-[var(--shadow-bg-secondary)] rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
};
