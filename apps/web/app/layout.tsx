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
  title: "FloorConnector | The Operating System for Specialty Surface Contractors",
  description:
    "Investor-facing overview of FloorConnector, a vertical SaaS operating system and transaction platform for specialty surface contractors."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} bg-[--background]`}>
      <body className="bg-[--background]">{children}</body>
    </html>
  );
}
