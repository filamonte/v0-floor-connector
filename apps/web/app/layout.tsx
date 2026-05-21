import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import { ReactNode } from "react";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Prata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "FloorConnector | Operating System for Epoxy Flooring and Concrete Polishing Contractors",
  description:
    "FloorConnector helps epoxy flooring and concrete polishing contractors run leads, estimates, jobs, invoices, and payments from one connected system."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
