import type { ReactNode } from "react";

import { ProtectedSurfaceHeader } from "@/components/protected-surface-header";
import { SettingsSurfaceLayout } from "@/components/settings-surface-layout";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { platformAdminNavItems } from "@/lib/settings/navigation";
import { requirePlatformAdminUser } from "@/lib/platform-admin/access";

export const dynamic = "force-dynamic";

type SuperAdminLayoutProps = {
  children: ReactNode;
};

export default async function SuperAdminLayout({
  children
}: SuperAdminLayoutProps) {
  const scope = await requirePlatformAdminUser("/super-admin");
  const user = await requireAuthenticatedUser("/super-admin");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3efe6_0%,#eef2f7_42%,#e6ebf2_100%)]">
      <ProtectedSurfaceHeader
        title="Platform Admin"
        description="Global defaults, starter records, tenant governance, and modular platform controls."
        user={user}
      />
      <main className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <SettingsSurfaceLayout
            eyebrow="Super Admin"
            title="Platform configuration"
            description="Manage the global layer that seeds contractor organizations, defines modular platform behavior, and governs cross-tenant defaults without collapsing tenant ownership."
            navItems={platformAdminNavItems}
            tone="neutral"
            meta={
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/90 px-5 py-5 text-sm text-slate-600">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Platform access
                </p>
                <p className="mt-3 text-base font-semibold text-slate-950">
                  {scope.email ?? "Platform admin"}
                </p>
                <p className="mt-2 leading-6">
                  Global scope · starter defaults, module policy, and tenant oversight
                </p>
              </div>
            }
          >
            {children}
          </SettingsSurfaceLayout>
        </div>
      </main>
    </div>
  );
}
