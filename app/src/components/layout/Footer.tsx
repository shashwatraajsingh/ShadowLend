"use client";

import { FC } from "react";

export const Footer: FC = () => {
  return (
    <footer className="border-t border-[var(--shadow-border)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--shadow-accent)] to-purple-600 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
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
            <span className="text-sm text-[var(--shadow-text-tertiary)]">
              ShadowLend - Private DeFi on Solana
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-[var(--shadow-text-tertiary)]">
            <a
              href="#"
              className="hover:text-[var(--shadow-text-primary)] transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="hover:text-[var(--shadow-text-primary)] transition-colors"
            >
              GitHub
            </a>
            <a
              href="#"
              className="hover:text-[var(--shadow-text-primary)] transition-colors"
            >
              Twitter
            </a>
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-2 text-xs text-[var(--shadow-text-muted)]">
            <span>Powered by</span>
            <span className="font-medium text-[var(--shadow-text-tertiary)]">
              Solana
            </span>
            <span>+</span>
            <span className="font-medium text-[var(--shadow-text-tertiary)]">
              Inco Lightning
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
