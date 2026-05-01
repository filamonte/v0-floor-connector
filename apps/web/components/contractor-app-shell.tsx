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
    <div className="min-h-screen bg-[#f5f3f0] text-[#221a14]">
      <div className="flex min-h-screen flex-col">
        {/* Sticky header - matches CF visual hierarchy */}
        <header className="sticky top-0 z-30 border-b border-[#e2dcd5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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

          {/* Mobile header - matches CF compact mobile pattern */}
          <div className="border-b border-[#e2dcd5] bg-white px-4 py-2.5 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <OrganizationBrandLink
                href="/dashboard"
                organizationName={organizationName}
                logoUrl={organizationContext?.organization.logoUrl}
                navigationLabel="Dashboard home"
                className="min-w-0 flex-1"
              />
              <div className="flex shrink-0 items-center gap-2">
                <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                <SignOutForm className="border-[#2f3d33] bg-[#2f3d33] px-3 py-2 text-white hover:bg-[#3d4d41]" />
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[#e2dcd5] pt-2.5">
              <ProtectedAppBreadcrumbs organizationName={organizationName} />
              <div className="ml-auto flex items-center gap-2">
                <ContractorNotificationsCenter
                  notifications={notifications}
                  compact
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area - matches CF padding and max-width */}
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto w-full max-w-[1400px]">
            {!organizationContext ? (
              <section className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] leading-5 text-amber-900">
                Your account is authenticated, but no active organization context is
                available yet. If this is a brand-new account, sign out and sign back in
                once to refresh the app against the newly created tenant records.
              </section>
            ) : null}

            {children}
          </div>
        </main>

        {/* Footer bar - matches CF minimal footer with global search */}
        <footer className="border-t border-[#e2dcd5] bg-white px-5 py-2.5 sm:px-8">
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
            <p className="hidden text-[11px] text-[#8a7a6c] sm:block">
              FloorConnector
            </p>
            <GlobalSearch
              compact
              buttonLabel="Search"
              buttonClassName="inline-flex h-9 min-w-[180px] max-w-full items-center justify-between gap-2 border border-[#e2dcd5] bg-white px-3 text-[12px] font-medium text-[#5f564d] transition hover:border-[#ef7d32] hover:bg-[#faf8f6] hover:text-[#221a14] xl:min-w-[240px]"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
