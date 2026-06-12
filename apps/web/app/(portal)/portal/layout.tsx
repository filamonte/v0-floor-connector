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
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--graphite-dark)_0,var(--graphite-dark)_168px,var(--cream)_168px,rgba(255,255,255,0.98)_460px)] print:bg-white">
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
      <div className="border-y border-slate-200 bg-white/80 text-slate-700 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-4 sm:px-10">
          <Link
            href="/portal"
            className="inline-flex items-center rounded-[4px] border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[var(--graphite)] transition hover:border-[var(--copper)] hover:text-[var(--copper-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
          >
            Portal home
          </Link>
          <p className="text-sm leading-6 text-slate-600">
            Your access stays scoped to the projects your contractor has
            explicitly shared.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 print:max-w-none print:p-0">
        {children}
      </main>
    </div>
  );
}
