import type { ReactNode } from "react";

import { SettingsSurfaceLayout } from "@/components/settings-surface-layout";
import { contractorSettingsNavItems } from "@/lib/settings/navigation";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";

export default async function ContractorSettingsLayout({
  children
}: {
  children: ReactNode;
}) {
  const scope = await requireOrganizationAdminScope("/settings");

  return (
    <SettingsSurfaceLayout
      eyebrow="Organization Settings"
      title={`${scope.organization.displayName} administration`}
      description="Manage the organization-owned configuration layer that powers templates, reusable items, financial defaults, workflow behavior, and feature overrides without breaking the shared platform model."
      navItems={contractorSettingsNavItems}
      meta={
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/90 px-5 py-5 text-sm text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Tenant scope
          </p>
          <p className="mt-3 text-base font-semibold text-slate-950">
            {scope.organization.legalName}
          </p>
          <p className="mt-2 leading-6">
            {scope.membershipRole} access · slug `{scope.organization.slug}`
          </p>
        </div>
      }
    >
      {children}
    </SettingsSurfaceLayout>
  );
}
