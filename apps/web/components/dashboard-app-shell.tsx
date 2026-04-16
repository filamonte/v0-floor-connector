import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
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
    <div className="min-h-screen bg-[--background] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-[--line] bg-[--surface] lg:flex">
          {/* Logo */}
          <div className="border-b border-[--line] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">FloorConnector</p>
                <p className="text-xs text-[--muted]">Contractor Hub</p>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="border-b border-[--line] px-4 py-4">
            <div className="rounded-lg border border-[--line] bg-[--background] p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
                Organization
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {organizationName}
              </p>
              <p className="mt-0.5 text-xs text-[--muted]">
                {organizationContext
                  ? `${organizationContext.membership.role} · ${organizationContext.membership.status}`
                  : "Pending"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4">
            <ProtectedAppNav
              currentRole={organizationContext?.membership.role}
              variant="sidebar"
            />
          </div>

          {/* User */}
          <div className="border-t border-[--line] px-4 py-4">
            <div className="rounded-lg border border-[--line] bg-[--background] p-3">
              <p className="truncate text-sm font-medium text-white">
                {user.email ?? "Authenticated user"}
              </p>
              <p className="mt-0.5 text-xs text-[--muted]">{organizationStatus}</p>
            </div>
            <div className="mt-3">
              <SignOutForm className="w-full justify-center border-[--line] bg-[--background] text-white hover:bg-[--surface-strong]" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-[--line] bg-[--surface]/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <ProtectedAppBreadcrumbs organizationName={organizationName} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden rounded-lg border border-[--line] bg-[--background] px-3 py-1.5 text-xs text-[--muted] sm:block">
                    {organizationStatus}
                  </div>
                  <SignOutForm className="border-[--line] bg-[--background] text-white hover:bg-[--surface-strong]" />
                </div>
              </div>

              {/* Mobile Nav */}
              <div className="lg:hidden">
                <div className="overflow-x-auto pb-1">
                  <ProtectedAppNav
                    currentRole={organizationContext?.membership.role}
                    variant="mobile"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-6 py-6">
            {!organizationContext && (
              <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-200">
                Your account is authenticated, but no active organization context
                is available yet. If this is a brand-new account, sign out and
                sign back in once to refresh.
              </div>
            )}

            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
