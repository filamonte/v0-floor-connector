import type { ReactNode } from "react";

import { ProtectedSurfaceHeader } from "@/components/protected-surface-header";
import { requireAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const user = await requireAuthenticatedUser("/portal");

  return (
    <>
      <ProtectedSurfaceHeader
        title="Customer Portal"
        description="Foundation shell for customer-facing access and shared job communication."
        user={user}
      />
      {children}
    </>
  );
}
