import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { DevQaTools } from "@/components/dev-qa-tools";
import { EarlyAccessHelpButton } from "@/components/early-access-help-button";
import { ProtectedAppTopNav } from "@/components/protected-app-top-nav";
import { signOutAction } from "@/lib/auth/actions";
import { listContractorNotificationsForContext } from "@/lib/notifications/data";

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
    organizationContext?.organization.displayName ??
    "Organization setup pending";
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
    ? listContractorNotificationsForContext(
        user.id,
        organizationContext.organization.id
      )
    : Promise.resolve({ totalCount: 0, sections: [], visibleItems: [] }));
  const showDevTools =
    process.env.NODE_ENV !== "production" &&
    process.env.FLOORCONNECTOR_SHOW_DEV_QA_TOOLS === "1";

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--text-primary)] print:bg-white">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 print:hidden">
          <ProtectedAppTopNav
            currentRole={organizationContext?.membership.role}
            notifications={notifications}
            organizationName={organizationName}
            organizationLogoUrl={organizationContext?.organization.logoUrl}
            organizationBrandAccentColor={
              organizationContext?.organization.brandAccentColor
            }
            organizationStatus={organizationStatus}
            userEmail={user.email ?? "Authenticated user"}
            timestampLabel={timestampLabel}
            homeHref="/dashboard"
            signOutAction={signOutAction}
          />
        </header>

        <main className="flex-1 bg-[linear-gradient(180deg,#ffffff_0%,var(--cream)_26%,#f9fafb_100%)] px-3 py-3 sm:px-5 sm:py-4 print:p-0">
          <div className="mx-auto w-full max-w-[1680px] print:max-w-none">
            {!organizationContext ? (
              <section className="mb-4 rounded-[4px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Your account is authenticated, but no active organization
                context is available yet. If this is a brand-new account, sign
                out and sign back in once to refresh the app against the newly
                created tenant records.
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
      </div>
    </div>
  );
}
