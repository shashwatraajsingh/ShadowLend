"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Lock,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { usePool, usePosition, useWalletBalance } from "@/hooks/useProgram";
import { useLending } from "@/hooks/useLending";
import { AnimatedTabs } from "@/components/ui/AnimatedTabs";
import { EncryptedText } from "@/components/ui/EncryptedText";

type Action = "deposit" | "borrow" | "repay" | "withdraw";

const actions: { id: Action; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "deposit", label: "Deposit", icon: () => <span className="text-sm">↓</span> },
  { id: "borrow", label: "Borrow", icon: () => <span className="text-sm">↑</span> },
  { id: "repay", label: "Repay", icon: () => <span className="text-sm">↓</span> },
  { id: "withdraw", label: "Withdraw", icon: () => <span className="text-sm">↑</span> },
];

export default function LendPage() {
  const { connected, publicKey } = useWallet();
  const [activeAction, setActiveAction] = useState<Action>("deposit");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { stats, refetch: refetchPool } = usePool();
  const { decrypted, encryptionKey, initializeEncryption, refetch: refetchPosition } = usePosition();
  const { balance, refetch: refetchBalance } = useWalletBalance();
  const {
    depositCollateral,
    borrow,
    repay,
    withdrawCollateral,
    isPoolInitialized,
    poolLoading,
    initializePool
  } = useLending();

  const getMaxAmount = useCallback(() => {
    switch (activeAction) {
      case "deposit":
        return balance > 0.01 ? balance - 0.01 : 0;
      case "borrow":
        return decrypted?.maxBorrow ?? 0;
      case "repay":
        return Math.min(balance > 0.01 ? balance - 0.01 : 0, decrypted?.debt ?? 0);
      case "withdraw":
        return decrypted?.collateral ?? 0;
      default:
        return 0;
    }
  }, [activeAction, balance, decrypted]);

  const handleSubmit = async () => {
    if (!publicKey || !amount || parseFloat(amount) <= 0) return;

    try {
      setLoading(true);
      const loadingToast = toast.loading("Processing transaction...", {
        description: "Preparing your transaction...",
      });

      // Get or derive encryption key on-demand (only prompts wallet if not already derived)
      let key = encryptionKey;
      if (!key) {
        toast.loading("Signing for encryption...", {
          id: loadingToast,
          description: "Please sign the message to enable encryption.",
        });
        key = await initializeEncryption();
      }

      toast.loading("Processing transaction...", {
        id: loadingToast,
        description: "Encrypting state and interacting with Solana...",
      });

      // Initialize pool if not already initialized
      if (!isPoolInitialized) {
        toast.loading("Initializing lending pool...", {
          id: loadingToast,
          description: "Creating the lending pool on Solana...",
        });
        try {
          await initializePool();
          await refetchPool();
        } catch (poolErr) {
          // Pool might already exist or we don't have permission
          console.warn("Pool initialization skipped or failed:", poolErr);
          // Continue anyway - the pool might already exist
        }
      }

      let signature: string;

      switch (activeAction) {
        case "deposit":
          signature = await depositCollateral(amount, key);
          break;
        case "borrow":
          signature = await borrow(amount, key);
          break;
        case "repay":
          signature = await repay(amount, key);
          break;
        case "withdraw":
          signature = await withdrawCollateral(amount, key);
          break;
        default:
          throw new Error("Unknown action");
      }

      await Promise.all([refetchPool(), refetchPosition(), refetchBalance()]);
      setAmount("");

      toast.success("Transaction Confirmed", {
        id: loadingToast,
        description: `Successfully executed ${activeAction} for ${amount} SOL`,
        action: {
          label: "View Explorer",
          onClick: () => window.open(`https://explorer.solana.com/tx/${signature}?cluster=testnet`),
        },
      });

    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction Failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-8 glass rounded-2xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Shield className="w-10 h-10 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Connect to Lend</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Connect your wallet to access encrypted lending pools.
          </p>
          <WalletMultiButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Lend & Borrow</h1>
          <p className="text-[var(--color-text-secondary)]">
            Manage your completely private position
          </p>
        </div>

        <AnimatedTabs
          tabs={actions}
          activeTab={activeAction}
          onChange={(id) => setActiveAction(id as Action)}
          className="mb-8"
        />

        {/* Pool not initialized warning */}
        {!poolLoading && !isPoolInitialized && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-1">Pool Not Initialized</h4>
              <p className="text-xs text-yellow-200/70">
                The lending pool hasn&apos;t been created yet. Your first deposit will automatically initialize the pool on Solana.
              </p>
            </div>
          </motion.div>
        )}

        <div className="card shadow-lg border-[var(--color-border-accent)]">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Amount</label>
              <button
                onClick={() => setAmount(getMaxAmount().toFixed(4))}
                className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors uppercase tracking-wide"
              >
                Max: {getMaxAmount().toFixed(4)} SOL
              </button>
            </div>

            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-4xl font-mono font-bold placeholder-[var(--color-text-muted)] focus:outline-none transition-all py-2 border-b border-[var(--color-border)] focus:border-[var(--color-accent)]"
                min="0"
                step="0.0001"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-medium text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-accent)] transition-colors">
                SOL
              </span>
            </div>
          </div>

          <div className="glass-subtle rounded-xl p-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[var(--color-bg-primary)] rounded-lg">
                <Lock className="w-4 h-4 text-[var(--color-accent)]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Privacy Guarantee</h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {activeAction === "deposit" && "Your deposit amount is encrypted before it leaves your device."}
                  {activeAction === "borrow" && "Borrow amounts are hidden from public observers. Only you know your debt."}
                  {activeAction === "repay" && "Repayments update your encrypted balance without revealing history."}
                  {activeAction === "withdraw" && "Withdrawals use zero-knowledge proofs to verify solvency."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <InfoRow
              label="Current Collateral"
              value={decrypted?.collateral.toFixed(4) ?? "0"}
              isEncrypted
            />
            <InfoRow
              label="Current Debt"
              value={decrypted?.debt.toFixed(4) ?? "0"}
              isEncrypted
            />
            <InfoRow
              label="Health Factor"
              value={decrypted?.healthFactor === Infinity ? "∞" : decrypted?.healthFactor.toFixed(2) ?? "-"}
              valueClass={decrypted && decrypted.healthFactor < 1.2 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}
            />
            {activeAction === "borrow" && (
              <InfoRow label="Max LTV" value={`${stats?.ltvRatio ?? 75}%`} />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="btn btn-primary w-full btn-lg relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Encrypting & Signing...
              </span>
            ) : (
              <span className="font-semibold">
                {activeAction === "deposit" && "Deposit Collateral"}
                {activeAction === "borrow" && "Borrow SOL"}
                {activeAction === "repay" && "Repay Loan"}
                {activeAction === "withdraw" && "Withdraw Collateral"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isEncrypted = false,
  valueClass = ""
}: {
  label: string;
  value: string;
  isEncrypted?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-[var(--color-text-tertiary)]">{label}</span>
      <div className="flex items-center gap-2">
        {isEncrypted ? (
          <EncryptedText text={`${value} SOL`} className="font-mono font-medium text-sm" onHover />
        ) : (
          <span className={`font-mono font-medium text-sm ${valueClass}`}>{value}</span>
        )}
      </div>
    </div>
  );
}
