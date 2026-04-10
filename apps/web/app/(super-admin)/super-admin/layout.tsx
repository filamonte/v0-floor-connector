import type { ReactNode } from "react";

import { ProtectedSurfaceHeader } from "@/components/protected-surface-header";
import { requireAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type SuperAdminLayoutProps = {
  children: ReactNode;
};

export default async function SuperAdminLayout({
  children
}: SuperAdminLayoutProps) {
  const user = await requireAuthenticatedUser("/super-admin");

  return (
    <>
      <ProtectedSurfaceHeader
        title="Platform Admin"
        description="Foundation shell for platform-wide operational controls."
        user={user}
      />
      {children}
    </>
  );
}
