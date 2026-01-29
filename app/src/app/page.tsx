"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <>
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <main className="pt-40 pb-20 relative z-0">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center py-24 relative">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md text-cyan-300 px-5 py-2 rounded-full text-xs font-bold mb-10 tracking-wide uppercase shadow-lg">
            <span className="material-symbols-outlined text-[16px] animate-pulse">bolt</span>
            Powered by Inco Lightning
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-12 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary text-glow-purple block md:inline mb-2 md:mb-0">Private DeFi</span>
            <span className="text-white drop-shadow-lg"> Lending</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-16 font-light tracking-wide">
            Lend and borrow with complete privacy. Your collateral, loan amounts, and health factors are <span className="text-white font-medium">encrypted on-chain</span> and visible only to you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
            {connected ? (
              <Link href="/dashboard" className="group w-full sm:w-auto relative bg-gradient-to-r from-primary to-cyan-500 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full"></div>
                <span className="relative flex items-center justify-center gap-2">
                  Enter App
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </Link>
            ) : (
              <button className="group w-full sm:w-auto relative bg-gradient-to-r from-primary to-cyan-500 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full"></div>
                <span className="relative flex items-center justify-center gap-2">
                  Enter App
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </button>
            )}
            <button className="w-full sm:w-auto glass-card hover:bg-white/10 px-10 py-4 rounded-2xl font-bold transition-all border border-white/10 hover:border-cyan-400/30 text-white hover:text-cyan-200">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-all duration-300 group">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2 group-hover:text-glow-cyan transition-all">$0</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/80 font-bold">Total Value Locked</div>
            </div>
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-all duration-300 group">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2 group-hover:text-glow-cyan transition-all">0</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-purple-400/80 font-bold">Active Positions</div>
            </div>
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-all duration-300 group">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2 group-hover:text-glow-cyan transition-all">75%</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-pink-400/80 font-bold">Max LTV</div>
            </div>
          </div>
        </section>

        {/* How Privacy Works Section */}
        <section className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">How Privacy Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">ShadowLend uses Inco Lightning to encrypt your position data directly on the blockchain.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Public View */}
            <div className="glass-card p-10 rounded-[24px] relative overflow-hidden group border-white/5 hover:border-white/10 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none"></div>
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">visibility</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-200">Public View</h3>
                  <p className="text-sm text-slate-500 mt-1">What everyone sees on-chain</p>
                </div>
              </div>
              <div className="space-y-8 relative">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-slate-500 font-medium tracking-wide">Collateral</span>
                  <div className="flex gap-1">
                    <span className="text-purple-500/40 text-lg font-mono redacted-blur tracking-widest bg-purple-900/20 px-2 rounded">88.88 SOL</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-slate-500 font-medium tracking-wide">Borrowed</span>
                  <div className="flex gap-1">
                    <span className="text-purple-500/40 text-lg font-mono redacted-blur tracking-widest bg-purple-900/20 px-2 rounded">42.21 USDC</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium tracking-wide">Health</span>
                  <div className="flex gap-1">
                    <span className="text-purple-500/40 text-lg font-mono redacted-blur tracking-widest bg-purple-900/20 px-2 rounded">1.45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Your View */}
            <div className="glass-card p-10 rounded-[24px] relative overflow-hidden group border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 pointer-events-none"></div>
              <div className="flex items-center gap-5 mb-10 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <span className="material-symbols-outlined text-cyan-300 text-3xl">lock_open</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white text-glow-cyan">Your View</h3>
                  <p className="text-sm text-cyan-400/80 mt-1">Decrypted with your wallet</p>
                </div>
              </div>
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-center border-b border-cyan-500/10 pb-6">
                  <span className="text-slate-400 font-medium tracking-wide">Collateral</span>
                  <span className="text-cyan-300 font-bold text-xl font-mono tracking-tight text-glow-cyan">10.5 SOL</span>
                </div>
                <div className="flex justify-between items-center border-b border-cyan-500/10 pb-6">
                  <span className="text-slate-400 font-medium tracking-wide">Borrowed</span>
                  <span className="text-cyan-300 font-bold text-xl font-mono tracking-tight text-glow-cyan">5.25 SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium tracking-wide">Health</span>
                  <span className="text-emerald-400 font-bold text-xl font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">1.52</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">Get Started in Minutes</h2>
            <p className="text-slate-400">Four simple steps to private DeFi lending</p>
          </div>
          <div className="max-w-4xl mx-auto glass-card rounded-[24px] border border-white/10 overflow-hidden divide-y divide-white/5">
            {[
              "Connect your Phantom or Solflare wallet",
              "Deposit SOL as private collateral",
              "Borrow up to 75% LTV confidentially",
              "Repay anytime, withdraw collateral"
            ].map((step, i) => (
              <div key={i} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-colors group cursor-default">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                  {i + 1}
                </div>
                <span className="text-lg font-medium text-slate-200">{step}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            {connected ? (
              <Link href="/dashboard" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/25 inline-flex items-center gap-2">
                Go to Dashboard
                <span className="material-symbols-outlined">arrow_right_alt</span>
              </Link>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </section>

        {/* Why ShadowLend Section */}
        <section className="container mx-auto px-6 py-32 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Why ShadowLend?</h2>
          <p className="text-slate-500 mb-20 text-lg">The first truly private lending protocol on Solana</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="glass-card p-10 rounded-[24px] text-left hover:border-cyan-500/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
                <span className="material-symbols-outlined text-cyan-400 text-3xl">encrypted</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">Private Collateral</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Your deposit amounts are encrypted on-chain. Only you can view your true collateral value.</p>
            </div>
            <div className="glass-card p-10 rounded-[24px] text-left hover:border-purple-500/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                <span className="material-symbols-outlined text-purple-400 text-3xl">visibility_off</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">Hidden Positions</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Loan balances and health factors remain confidential. No one can track your positions.</p>
            </div>
            <div className="glass-card p-10 rounded-[24px] text-left hover:border-pink-500/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(244,114,182,0.1)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-colors">
                <span className="material-symbols-outlined text-pink-400 text-3xl">bolt</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white group-hover:text-pink-300 transition-colors">Instant Settlement</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Built on Solana for sub-second transactions with minimal gas fees.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-[#0f0518]/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors">security</span>
            <span className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">Shadow<span className="text-primary">Lend</span></span>
          </div>
          <p className="text-slate-600 text-sm">© 2024 ShadowLend Protocol. All rights reserved.</p>
          <div className="flex gap-8 text-slate-500">
            <a className="hover:text-cyan-400 transition-colors duration-300 text-sm font-medium" href="#">Twitter</a>
            <a className="hover:text-cyan-400 transition-colors duration-300 text-sm font-medium" href="#">Discord</a>
            <a className="hover:text-cyan-400 transition-colors duration-300 text-sm font-medium" href="#">Docs</a>
          </div>
        </div>
      </footer>
    </>
  );
}
