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
      eyebrow="Settings"
      title={`${organizationContext.organization.displayName} settings`}
      description="Review your personal account context and, when permitted, manage the organization-owned configuration layer that powers the contractor workspace."
      navItems={navItems}
      meta={
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/90 px-5 py-5 text-sm text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Current context
          </p>
          <p className="mt-3 text-base font-semibold text-slate-950">
            {organizationContext.organization.legalName}
          </p>
          <p className="mt-2 leading-6">
            {organizationContext.membership.role} access · slug{" "}
            <code>{organizationContext.organization.slug}</code>
          </p>
        </div>
      }
    >
      {children}
    </SettingsSurfaceLayout>
  );
}
