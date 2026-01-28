"use client";

import { FC, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePool, usePosition, useLending } from "@/hooks";
import { formatSol, parseSolToLamports, bpsToPercent } from "@/lib/constants";
import { deriveEncryptionKey, type EncryptionKeyPair } from "@/lib/encryption";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  PrivacyBadge,
  HealthIndicator,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type ActionType = "deposit" | "borrow" | "repay" | "withdraw";

interface LendingFormProps {
  initialAction?: ActionType;
}

export const LendingForm: FC<LendingFormProps> = ({ initialAction = "deposit" }) => {
  const { publicKey, signMessage } = useWallet();
  const { pool, stats } = usePool();
  const { position, decodedPosition, encryptionKey, initializeEncryption } = usePosition();
  const { txState, depositCollateral, borrow, repay, withdrawCollateral, openPosition, resetTxState } = useLending();

  const [action, setAction] = useState<ActionType>(initialAction);
  const [amount, setAmount] = useState("");
  const [encKey, setEncKey] = useState<EncryptionKeyPair | null>(encryptionKey);

  useEffect(() => {
    setEncKey(encryptionKey);
  }, [encryptionKey]);

  const needsPosition = !position && (action === "deposit" || action === "borrow");
  const needsEncryption = !encKey;

  const handleAction = async () => {
    if (!publicKey || !amount) return;

    try {
      // Ensure we have encryption key
      let key = encKey;
      if (!key && signMessage) {
        key = await deriveEncryptionKey(signMessage);
        setEncKey(key);
      }
      if (!key) {
        throw new Error("Failed to derive encryption key");
      }

      // Open position if needed
      if (needsPosition) {
        await openPosition();
      }

      // Execute action
      switch (action) {
        case "deposit":
          await depositCollateral(amount, key);
          break;
        case "borrow":
          await borrow(amount, key);
          break;
        case "repay":
          await repay(amount, key);
          break;
        case "withdraw":
          await withdrawCollateral(amount, key);
          break;
      }

      setAmount("");
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const getButtonLabel = () => {
    if (txState.status === "pending") return "Preparing...";
    if (txState.status === "confirming") return "Confirming...";
    if (needsEncryption) return "Sign & Continue";
    if (needsPosition) return "Create Position & Deposit";

    switch (action) {
      case "deposit":
        return "Deposit Collateral";
      case "borrow":
        return "Borrow";
      case "repay":
        return "Repay";
      case "withdraw":
        return "Withdraw";
    }
  };

  const getMaxAmount = () => {
    if (!decodedPosition) return "0";
    switch (action) {
      case "withdraw":
        return formatSol(decodedPosition.collateral);
      case "repay":
        return formatSol(decodedPosition.debt);
      default:
        return "";
    }
  };

  const estimateNewHealth = () => {
    if (!decodedPosition || !pool || !amount) return null;

    const amountLamports = BigInt(parseSolToLamports(amount));
    let newCollateral = decodedPosition.collateral;
    let newDebt = decodedPosition.debt;

    switch (action) {
      case "deposit":
        newCollateral += amountLamports;
        break;
      case "borrow":
        newDebt += amountLamports;
        break;
      case "repay":
        newDebt = newDebt > amountLamports ? newDebt - amountLamports : BigInt(0);
        break;
      case "withdraw":
        newCollateral = newCollateral > amountLamports ? newCollateral - amountLamports : BigInt(0);
        break;
    }

    if (newDebt === BigInt(0)) return Infinity;

    const numerator = newCollateral * BigInt(pool.liquidationThreshold);
    const denominator = newDebt * BigInt(10000);
    return Number((numerator * BigInt(100)) / denominator);
  };

  const newHealth = estimateNewHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lend & Borrow</CardTitle>
        <PrivacyBadge />
      </CardHeader>
      <CardContent>
        {/* Action tabs */}
        <div className="flex rounded-lg bg-[var(--shadow-bg-tertiary)] p-1 mb-6">
          {(["deposit", "borrow", "repay", "withdraw"] as const).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAction(a);
                setAmount("");
                resetTxState();
              }}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all",
                action === a
                  ? "bg-[var(--shadow-bg-elevated)] text-[var(--shadow-text-primary)] shadow-sm"
                  : "text-[var(--shadow-text-tertiary)] hover:text-[var(--shadow-text-secondary)]"
              )}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--shadow-text-secondary)]">
                Amount
              </label>
              {(action === "repay" || action === "withdraw") && decodedPosition && (
                <button
                  onClick={() => setAmount(getMaxAmount())}
                  className="text-xs text-[var(--shadow-accent)] hover:underline"
                >
                  Max: {getMaxAmount()} SOL
                </button>
              )}
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              suffix="SOL"
            />
          </div>

          {/* Info section */}
          <div className="p-4 rounded-lg bg-[var(--shadow-bg-tertiary)] space-y-3">
            {stats && (
              <>
                <InfoRow
                  label="LTV Ratio"
                  value={`${bpsToPercent(pool?.ltvRatio ?? 0).toFixed(0)}%`}
                />
                <InfoRow
                  label="Interest Rate"
                  value={`${stats.interestRate.toFixed(2)}% APR`}
                />
                <InfoRow
                  label="Liquidation Threshold"
                  value={`${stats.liquidationThreshold.toFixed(0)}%`}
                />
              </>
            )}

            {decodedPosition && newHealth !== null && amount && (
              <div className="pt-3 border-t border-[var(--shadow-border)]">
                <InfoRow
                  label="Current Health"
                  value={
                    decodedPosition.healthFactor === Infinity
                      ? "Safe"
                      : `${decodedPosition.healthFactor.toFixed(0)}%`
                  }
                />
                <InfoRow
                  label="After Transaction"
                  value={newHealth === Infinity ? "Safe" : `${newHealth.toFixed(0)}%`}
                  highlight={newHealth < 120}
                />
              </div>
            )}
          </div>

          {/* Privacy notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--shadow-accent-subtle)] border border-[var(--shadow-border-accent)]">
            <LockIcon className="w-4 h-4 text-[var(--shadow-accent)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--shadow-text-secondary)]">
              Your position data will be encrypted on-chain. Only you can view
              the exact amounts. The protocol verifies your position health
              without revealing values.
            </p>
          </div>

          {/* Error display */}
          {txState.status === "error" && (
            <div className="p-3 rounded-lg bg-[var(--shadow-error-muted)] border border-[var(--shadow-error)] text-sm text-[var(--shadow-error)]">
              {txState.error}
            </div>
          )}

          {/* Success display */}
          {txState.status === "success" && txState.signature && (
            <div className="p-3 rounded-lg bg-[var(--shadow-success-muted)] border border-[var(--shadow-success)]">
              <p className="text-sm text-[var(--shadow-success)] mb-1">
                Transaction successful!
              </p>
              <a
                href={`https://explorer.solana.com/tx/${txState.signature}?cluster=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--shadow-text-secondary)] hover:underline"
              >
                View on Explorer
              </a>
            </div>
          )}

          {/* Submit button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAction}
            loading={txState.status === "pending" || txState.status === "confirming"}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {getButtonLabel()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const InfoRow: FC<InfoRowProps> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[var(--shadow-text-tertiary)]">{label}</span>
    <span
      className={cn(
        "font-medium",
        highlight
          ? "text-[var(--shadow-warning)]"
          : "text-[var(--shadow-text-primary)]"
      )}
    >
      {value}
    </span>
  </div>
);

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  );
}
