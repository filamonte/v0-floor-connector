import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type ContractorAppLayoutProps = {
  children: ReactNode;
};

export default async function ContractorAppLayout({
  children
}: ContractorAppLayoutProps) {
  return children;
}
