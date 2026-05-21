import type { ReactNode } from "react";
import Link from "next/link";

import { ProtectedSurfaceHeader } from "@/components/protected-surface-header";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--cream),rgba(255,255,255,0.98))] print:bg-white">
      <div className="print:hidden">
        <ProtectedSurfaceHeader
          title="Customer Portal"
          description="Review the projects, proposals, contracts, and invoices your contractor has shared with you."
          user={user}
          brandHref="/portal"
          brandName="FloorConnector"
          brandSupportingLabel="Shared customer portal"
          headingLevel="h2"
        />
      </div>
      <div className="border-b border-[var(--border-warm)] bg-white/70 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-4 sm:px-10">
          <Link
            href="/portal"
            className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
          >
            Portal home
          </Link>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Your access stays scoped to the projects your contractor has explicitly shared.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 print:max-w-none print:p-0">
        {children}
      </main>
    </div>
  );
}
