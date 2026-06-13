import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const uiFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title:
    "FloorConnector | Operating System for Epoxy Flooring and Concrete Polishing Contractors",
  description:
    "FloorConnector helps epoxy flooring and concrete polishing contractors run leads, estimates, jobs, invoices, and payments from one connected system."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={uiFont.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
