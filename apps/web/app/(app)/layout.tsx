import type { ReactNode } from "react";

import { ProtectedAppShell } from "@/components/protected-app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

export const dynamic = "force-dynamic";

type ProtectedAppLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAppLayout({
  children
}: ProtectedAppLayoutProps) {
  const user = await requireAuthenticatedUser();
  const organizationContext = await getActiveOrganizationContext(user.id);

  return (
    <ProtectedAppShell user={user} organizationContext={organizationContext}>
      {children}
    </ProtectedAppShell>
  );
}
