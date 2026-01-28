"use client";

import { FC, useState } from "react";
import { usePosition } from "@/hooks";
import { formatSol } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  StatCard,
  HealthIndicator,
  PrivacyBadge,
  Skeleton,
} from "@/components/ui";

export const PositionOverview: FC = () => {
  const { position, decodedPosition, encryptionKey, loading, initializeEncryption } =
    usePosition();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await initializeEncryption();
    } catch (err) {
      console.error("Failed to unlock:", err);
    } finally {
      setUnlocking(false);
    }
  };

  // No position yet
  if (!position && !loading) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[var(--shadow-bg-tertiary)] flex items-center justify-center mx-auto mb-4">
          <NoPositionIcon className="w-8 h-8 text-[var(--shadow-text-muted)]" />
        </div>
        <h3 className="text-title mb-2">No Active Position</h3>
        <p className="text-[var(--shadow-text-secondary)] mb-6 max-w-sm mx-auto">
          Start by depositing collateral to open your first position
        </p>
        <Button onClick={() => (window.location.href = "/lend")}>
          Deposit Collateral
        </Button>
      </Card>
    );
  }

  // Position exists but not decrypted
  if (position && !encryptionKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Position</CardTitle>
          <PrivacyBadge />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[var(--shadow-accent-subtle)] flex items-center justify-center mx-auto mb-4">
              <LockIcon className="w-8 h-8 text-[var(--shadow-accent)]" />
            </div>
            <h3 className="text-title mb-2">Position Locked</h3>
            <p className="text-[var(--shadow-text-secondary)] mb-6 max-w-sm mx-auto">
              Sign a message to decrypt your position data. This proves you own
              this wallet.
            </p>
            <Button onClick={handleUnlock} loading={unlocking}>
              Unlock Position
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Position decrypted
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Your Position</CardTitle>
          <PrivacyBadge />
        </div>
        <span className="text-xs text-[var(--shadow-text-muted)]">
          Visible only to you
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                label="Collateral"
                value={
                  decodedPosition
                    ? `${formatSol(decodedPosition.collateral)} SOL`
                    : "---"
                }
                isPrivate
              />
              <StatCard
                label="Borrowed"
                value={
                  decodedPosition
                    ? `${formatSol(decodedPosition.debt)} SOL`
                    : "---"
                }
                isPrivate
              />
            </div>

            {decodedPosition && (
              <HealthIndicator healthFactor={decodedPosition.healthFactor} />
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => (window.location.href = "/position")}
              >
                Manage Position
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

function NoPositionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
