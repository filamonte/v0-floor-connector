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
    ? `${organizationContext.organization.slug} · ${organizationContext.membership.status}`
    : "Initialization pending";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3efe6_0%,#eef2f7_42%,#e6ebf2_100%)] text-slate-950">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f4ee]/88 backdrop-blur">
          <div className="mx-auto w-full max-w-[1500px] px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-700">
                    FloorConnector
                  </p>
                  <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-5">
                    <div className="min-w-0">
                      <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        Contractor workspace
                      </h1>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Sales, contracts, billing, workforce, and execution stay connected here instead of getting split across separate tools.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 shadow-sm">
                        {organizationName}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 shadow-sm">
                        {organizationContext
                          ? `${organizationContext.membership.role} access`
                          : "Waiting for organization context"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:hidden">
                  <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                  <SignOutForm className="border-slate-900 bg-slate-950 px-4 py-2 text-white hover:border-slate-950 hover:bg-slate-800" />
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm">
                    {organizationStatus}
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm">
                    {user.email ?? "Authenticated user"}
                  </div>
                  <SignOutForm className="border-slate-900 bg-slate-950 text-white hover:border-slate-950 hover:bg-slate-800" />
                </div>
              </div>

              <div className="hidden lg:block">
                <ProtectedAppTopNav currentRole={organizationContext?.membership.role} />
              </div>

              <ProtectedAppWorkspaceBand organizationName={organizationName} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-[1500px]">
            {!organizationContext ? (
              <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-6 text-amber-900">
                Your account is authenticated, but no active organization context is available yet. If this is a brand-new account, sign out and sign back in once to refresh the app against the newly created tenant records.
              </section>
            ) : null}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
