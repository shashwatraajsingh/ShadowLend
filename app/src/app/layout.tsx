import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWalletProvider } from "@/components/providers/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ShadowLend | Confidential DeFi Lending on Solana",
  description:
    "Private lending and borrowing protocol on Solana with encrypted positions powered by Inco Lightning.",
  keywords: [
    "DeFi",
    "Solana",
    "Privacy",
    "Lending",
    "Borrowing",
    "Inco",
    "Confidential",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-[var(--color-bg-primary)] min-h-screen" suppressHydrationWarning>
        <AppWalletProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Toaster />
        </AppWalletProvider>
      </body>
    </html>
  );
}
