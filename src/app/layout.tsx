import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Manager - 台美跨境投資管理工具",
  description: "為台灣留學生和投資人設計的個人資產管理工具。追蹤美股、台股、加密貨幣和現金資產。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CurrencyProvider>
          <AppShell>
            {children}
          </AppShell>
        </CurrencyProvider>
        <Toaster />
      </body>
    </html>
  );
}
