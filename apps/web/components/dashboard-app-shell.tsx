import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { AppShellMobileNav } from "@/components/app-shell-mobile-nav";
import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ProtectedAppNav } from "@/components/protected-app-nav";
import { SignOutForm } from "@/components/sign-out-form";

type DashboardAppShellProps = {
  children: ReactNode;
  user: User;
  organizationContext: ActiveOrganizationContext | null;
};

export function DashboardAppShell({
  children,
  user,
  organizationContext
}: DashboardAppShellProps) {
  const organizationName =
    organizationContext?.organization.displayName ?? "Organization setup pending";
  const organizationStatus = organizationContext
    ? `${organizationContext.organization.slug} · ${organizationContext.membership.status}`
    : "Initialization pending";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3efe6_0%,#f8f8f8_42%,#e5e5e5_100%)] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-800/80 bg-[#171b21] text-slate-100 lg:flex">
          <div className="border-b border-white/10 px-6 py-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8cb5bb]">
              FloorConnector
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Contractor OS
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Project-centered workflow for estimates, contracts, jobs, invoices, and cash collection.
            </p>
          </div>

          <div className="flex-1 px-4 py-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Active organization
              </p>
              <p className="mt-3 text-base font-semibold text-white">{organizationName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {organizationContext
                  ? `${organizationContext.membership.role} access · ${organizationContext.membership.status}`
                  : "Waiting for tenant initialization"}
              </p>
            </div>

            <div className="mt-6">
              <ProtectedAppNav
                currentRole={organizationContext?.membership.role}
                variant="sidebar"
              />
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/10 px-4 py-4 text-sm text-slate-300">
              <p className="font-medium text-white">{user.email ?? "Authenticated user"}</p>
              <p className="mt-1">{organizationStatus}</p>
            </div>
            <div className="mt-4">
              <SignOutForm className="w-full justify-center border-white/15 bg-white text-slate-950 hover:border-white hover:bg-slate-100" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#f7f4ee]/88 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                    FloorConnector
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-700">
                    {organizationName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                  <SignOutForm className="border-slate-900 bg-slate-950 px-4 py-2 text-white hover:border-slate-950 hover:bg-slate-800" />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
                    Workspace
                  </p>
                  <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    {organizationName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {organizationContext
                      ? `Signed in as ${user.email ?? "authenticated user"} with ${organizationContext.membership.role} access.`
                      : "Your session is active, but the application is still waiting for organization context."}
                  </p>
                  <div className="mt-3">
                    <ProtectedAppBreadcrumbs organizationName={organizationName} />
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm sm:block">
                    {organizationStatus}
                  </div>
                  <div className="hidden lg:block">
                    <SignOutForm className="border-slate-900 bg-slate-950 text-white hover:border-slate-950 hover:bg-slate-800" />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="overflow-x-auto pb-1">
                  <ProtectedAppNav
                    currentRole={organizationContext?.membership.role}
                    variant="mobile"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            {!organizationContext ? (
              <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-6 text-amber-900">
                Your account is authenticated, but no active organization context is available yet. If this is a brand-new account, sign out and sign back in once to refresh the app against the newly created tenant records.
              </section>
            ) : null}

            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
