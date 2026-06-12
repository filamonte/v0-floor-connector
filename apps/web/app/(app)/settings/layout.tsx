import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SettingsSurfaceLayout } from "@/components/settings-surface-layout";
import { contractorSettingsNavItems } from "@/lib/settings/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

export default async function ContractorSettingsLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await requireAuthenticatedUser("/settings");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    redirect("/dashboard?error=No+active+organization+is+available.");
  }

  const isOrganizationAdmin = ["owner", "admin"].includes(
    organizationContext.membership.role
  );
  const navItems = isOrganizationAdmin
    ? contractorSettingsNavItems
    : contractorSettingsNavItems.filter((item) => !item.adminOnly);

  return (
    <SettingsSurfaceLayout
      eyebrow="Company Controls"
      title={`${organizationContext.organization.displayName} controls`}
      description="Manage company-owned configuration, workflow defaults, templates, billing defaults, team access, and feature overrides for this contractor organization. Platform policy, starter records, tenant activation, and operator controls live in Super Admin."
      navItems={navItems}
      tone="neutral"
      meta={
        <div className="rounded-lg border border-white/10 bg-white/[0.08] px-5 py-5 text-sm text-white/72">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8fc7ff]">
            Current context
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {organizationContext.organization.legalName}
          </p>
          <p className="mt-2 leading-6">
            {organizationContext.membership.role} access · slug{" "}
            <code className="text-white">
              {organizationContext.organization.slug}
            </code>
          </p>
        </div>
      }
    >
      {children}
    </SettingsSurfaceLayout>
  );
}
