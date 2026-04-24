import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Search } from "lucide-react";

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
    <div className="min-h-screen bg-[#f3f4f6] text-[#1f2937]">
      <div className="flex min-h-screen flex-col">
        {/* CF-style Header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
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

          {/* Mobile header */}
          <div className="border-b border-[#e5e7eb] bg-[#28456f] px-4 py-2 lg:hidden">
            <div className="flex items-center justify-between">
              <OrganizationBrandLink
                href="/dashboard"
                organizationName={organizationName}
                logoUrl={organizationContext?.organization.logoUrl}
                supportingLabel="Contractor workspace"
                navigationLabel="Dashboard home"
                className="max-w-[200px]"
                variant="light"
              />
              <div className="flex items-center gap-2">
                <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                <SignOutForm className="border-white/20 bg-white/10 px-3 py-1.5 text-[13px] text-white hover:bg-white/20" />
              </div>
            </div>
            <div className="mt-2 border-t border-white/10 pt-2">
              <ProtectedAppBreadcrumbs organizationName={organizationName} variant="dark" />
            </div>
          </div>
        </header>

        {/* CF-style Left Sidebar Navigation */}
        <div className="flex flex-1">
          {/* Sidebar - hidden on mobile, visible on desktop */}
          <aside className="hidden w-[52px] flex-col border-r border-[#e5e7eb] bg-[#28456f] lg:flex">
            {/* Icon-only sidebar matching CF screenshots */}
            <nav className="flex flex-col items-center gap-1 py-2">
              {/* These would be the sidebar icons from the CF screenshots */}
            </nav>
          </aside>

          {/* Main content area */}
          <main className="flex-1 bg-[#f3f4f6]">
            <div className="h-full">
              {!organizationContext ? (
                <section className="mx-4 mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-5 text-amber-900">
                  Your account is authenticated, but no active organization context is
                  available yet. If this is a brand-new account, sign out and sign back in
                  once to refresh the app against the newly created tenant records.
                </section>
              ) : null}

              {children}
            </div>
          </main>
        </div>

        {/* CF-style Footer */}
        <footer className="border-t border-[#e5e7eb] bg-white px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Bottom nav icons (mobile style from CF) */}
            <div className="flex items-center gap-4">
              {/* Footer icons would go here */}
            </div>
            
            {/* Search bar */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                placeholder="Search here..."
                className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-9 pr-3 text-[13px] text-[#374151] outline-none focus:border-[#28456f]"
              />
            </div>

            {/* Ask Clark AI */}
            <div className="flex items-center gap-4 text-[13px] text-[#6b7280]">
              <span>Ask Clark</span>
              {/* Additional footer icons */}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
