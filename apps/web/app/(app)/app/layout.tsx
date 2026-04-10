import type { ReactNode } from "react";

import { ProtectedSurfaceHeader } from "@/components/protected-surface-header";
import { requireAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ContractorAppLayoutProps = {
  children: ReactNode;
};

export default async function ContractorAppLayout({
  children
}: ContractorAppLayoutProps) {
  const user = await requireAuthenticatedUser("/app");

  return (
    <>
      <ProtectedSurfaceHeader
        title="Contractor Workspace"
        description="Foundation shell for the internal contractor-facing application."
        user={user}
      />
      {children}
    </>
  );
}
