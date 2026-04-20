import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { AppShellMobileNav } from "@/components/app-shell-mobile-nav";
import { ProtectedAppTopNav } from "@/components/protected-app-top-nav";
import { ProtectedAppWorkspaceBand } from "@/components/protected-app-workspace-band";
import { SignOutForm } from "@/components/sign-out-form";

type ContractorAppShellProps = {
  children: ReactNode;
  user: User;
  organizationContext: ActiveOrganizationContext | null;
};

export function ContractorAppShell({
  children,
  user,
  organizationContext
}: ContractorAppShellProps) {
  const organizationName =
    organizationContext?.organization.displayName ?? "Organization setup pending";
  const organizationStatus = organizationContext
    ? `${organizationContext.organization.slug} - ${organizationContext.membership.status}`
    : "Initialization pending";
  const timestampLabel = new Date().toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-950">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-[#d8dee8] bg-white">
          <div className="hidden lg:block">
            <ProtectedAppTopNav
              currentRole={organizationContext?.membership.role}
              organizationName={organizationName}
              organizationStatus={organizationStatus}
              userEmail={user.email ?? "Authenticated user"}
              timestampLabel={timestampLabel}
            />
            <ProtectedAppWorkspaceBand organizationName={organizationName} />
          </div>

          <div className="border-b border-[#d8dee8] bg-white px-5 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#243a67]">
                  FloorConnector
                </p>
                <p className="mt-1 text-[13px] text-[#475569]">{organizationName}</p>
              </div>
              <div className="flex items-center gap-2">
                <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                <SignOutForm className="border-[#d7ddea] bg-[#f4f7fb] px-3 py-2 text-[#233a64] hover:border-[#c8d1df] hover:bg-white" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-4 sm:px-8 sm:py-5">
          <div className="mx-auto w-full max-w-[1500px]">
            {!organizationContext ? (
              <section className="mb-4 rounded-[4px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Your account is authenticated, but no active organization context is
                available yet. If this is a brand-new account, sign out and sign back in
                once to refresh the app against the newly created tenant records.
              </section>
            ) : null}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
