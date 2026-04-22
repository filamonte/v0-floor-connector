import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { AppShellMobileNav } from "@/components/app-shell-mobile-nav";
import { ContractorNotificationsCenter } from "@/components/contractor-notifications-center";
import { GlobalSearch } from "@/components/global-search";
import { OrganizationBrandLink } from "@/components/organization-brand-link";
import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ProtectedAppTopNav } from "@/components/protected-app-top-nav";
import { SignOutForm } from "@/components/sign-out-form";
import { listContractorNotifications } from "@/lib/notifications/data";

type ContractorAppShellProps = {
  children: ReactNode;
  user: User;
  organizationContext: ActiveOrganizationContext | null;
};

export async function ContractorAppShell({
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
  const notifications = await (organizationContext
    ? listContractorNotifications()
    : Promise.resolve({ totalCount: 0, sections: [], visibleItems: [] }));

  return (
    <div className="min-h-screen bg-[#f3eee8] text-slate-950">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-[#d9cdc2] bg-white">
          <div className="hidden lg:block">
            <ProtectedAppTopNav
              currentRole={organizationContext?.membership.role}
              notifications={notifications}
              organizationName={organizationName}
              organizationLogoUrl={organizationContext?.organization.logoUrl}
              organizationStatus={organizationStatus}
              userEmail={user.email ?? "Authenticated user"}
              timestampLabel={timestampLabel}
              homeHref="/dashboard"
            />
          </div>

          <div className="border-b border-[#d9cdc2] bg-white px-5 py-3 lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <OrganizationBrandLink
                href="/dashboard"
                organizationName={organizationName}
                logoUrl={organizationContext?.organization.logoUrl}
                supportingLabel="Shared contractor workspace"
                navigationLabel="Dashboard home"
                className="min-w-0 flex-1"
              />
              <div className="flex shrink-0 items-center gap-2 pt-1">
                <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                <SignOutForm className="border-[#17120f] bg-[#17120f] px-3 py-2 text-[#ffd7bb] hover:border-[#17120f] hover:bg-[#2a1c13]" />
              </div>
            </div>
            <div className="mt-3 space-y-3 border-t border-[#ebe0d6] pt-3">
              <ProtectedAppBreadcrumbs organizationName={organizationName} />
              <div className="flex flex-wrap items-center gap-2">
                <ContractorNotificationsCenter
                  notifications={notifications}
                  compact
                />
                <GlobalSearch
                  compact
                  buttonLabel="Search"
                  buttonClassName="inline-flex h-9 items-center gap-2 rounded-[4px] border border-[#e2d4c5] bg-[#fbf5ee] px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b5442] transition hover:border-[#ef7d32] hover:bg-white hover:text-[#221a14]"
                />
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
