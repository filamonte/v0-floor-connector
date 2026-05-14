import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { AppShellMobileNav } from "@/components/app-shell-mobile-nav";
import { ContractorNotificationsCenter } from "@/components/contractor-notifications-center";
import { DevQaTools } from "@/components/dev-qa-tools";
import { EarlyAccessHelpButton } from "@/components/early-access-help-button";
import { GlobalSearch } from "@/components/global-search";
import { OrganizationBrandLink } from "@/components/organization-brand-link";
import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ProtectedAppTopNav } from "@/components/protected-app-top-nav";
import { SignOutForm } from "@/components/sign-out-form";
import { signOutAction } from "@/lib/auth/actions";
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
  const showDevTools =
    process.env.NODE_ENV !== "production" &&
    process.env.FLOORCONNECTOR_SHOW_DEV_QA_TOOLS === "1";

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--text-primary)] print:bg-white">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--border-warm)] bg-white print:hidden">
          <div className="hidden lg:block">
            <ProtectedAppTopNav
              currentRole={organizationContext?.membership.role}
              notifications={notifications}
              organizationName={organizationName}
              organizationLogoUrl={organizationContext?.organization.logoUrl}
              organizationBrandAccentColor={organizationContext?.organization.brandAccentColor}
              organizationStatus={organizationStatus}
              userEmail={user.email ?? "Authenticated user"}
              timestampLabel={timestampLabel}
              homeHref="/dashboard"
              signOutAction={signOutAction}
            />
          </div>

          <div className="border-b border-[var(--border-warm)] bg-white px-5 py-3 lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <OrganizationBrandLink
                href="/dashboard"
                organizationName={organizationName}
                logoUrl={organizationContext?.organization.logoUrl}
                brandAccentColor={organizationContext?.organization.brandAccentColor}
                supportingLabel="Shared contractor workspace"
                navigationLabel="Dashboard home"
                className="min-w-0 flex-1"
              />
              <div className="flex shrink-0 items-center gap-2 pt-1">
                <AppShellMobileNav currentRole={organizationContext?.membership.role} />
                <SignOutForm className="border-[var(--graphite)] bg-[var(--graphite)] px-3 py-2 text-white hover:border-[var(--graphite-light)] hover:bg-[var(--graphite-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2" />
              </div>
            </div>
            <div className="mt-3 space-y-3 border-t border-[var(--border-warm)] pt-3">
              <ProtectedAppBreadcrumbs organizationName={organizationName} />
              <div className="flex flex-wrap items-center gap-2">
                <ContractorNotificationsCenter
                  notifications={notifications}
                  compact
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 py-3 sm:px-5 sm:py-4 print:p-0">
          <div className="mx-auto w-full max-w-[1680px] print:max-w-none">
            {!organizationContext ? (
              <section className="mb-4 rounded-[4px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Your account is authenticated, but no active organization context is
                available yet. If this is a brand-new account, sign out and sign back in
                once to refresh the app against the newly created tenant records.
              </section>
            ) : null}

            {children}
            {organizationContext ? (
              <div className="print:hidden">
                <EarlyAccessHelpButton />
              </div>
            ) : null}
            {showDevTools ? (
              <div className="print:hidden">
                <DevQaTools signOutAction={signOutAction} />
              </div>
            ) : null}
          </div>
        </main>

        <footer className="border-t border-[var(--border-warm)] bg-white px-3 py-2 sm:px-5 print:hidden">
          <div className="mx-auto flex w-full max-w-[1680px] justify-end">
            <GlobalSearch
              compact
              buttonLabel="Global Search"
              buttonClassName="inline-flex h-10 min-w-[220px] max-w-full items-center justify-between rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:bg-white hover:text-[var(--text-primary)] xl:min-w-[280px]"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
