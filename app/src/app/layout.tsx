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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased text-slate-100" suppressHydrationWarning>
        <AppWalletProvider>
          <Navbar />
          <div className="relative z-0">
            {children}
          </div>
          <Toaster />
        </AppWalletProvider>
      </body>
    </html>
  );
}
