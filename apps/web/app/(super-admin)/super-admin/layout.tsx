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
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--graphite)_0,var(--graphite)_172px,#eef2f7_172px,#e6ebf2_100%)]">
      <ProtectedSurfaceHeader
        title="Platform Admin"
        description="Global defaults, starter records, tenant governance, and modular platform controls."
        user={user}
        headingLevel="h2"
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
              <div className="rounded-lg border border-white/10 bg-white/[0.08] px-5 py-5 text-sm text-white/72">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Platform access
                </p>
                <p className="mt-3 text-base font-semibold text-white">
                  {scope.email ?? "Platform admin"}
                </p>
                <p className="mt-2 leading-6">
                  Global scope · starter defaults, module policy, and tenant
                  oversight
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
