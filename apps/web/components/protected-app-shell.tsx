import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ProtectedAppNav } from "@/components/protected-app-nav";
import { SignOutForm } from "@/components/sign-out-form";

type ProtectedAppShellProps = {
  children: ReactNode;
  user: User;
  organizationContext: ActiveOrganizationContext | null;
};

export function ProtectedAppShell({
  children,
  user,
  organizationContext
}: ProtectedAppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-5 sm:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                FloorConnector App
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {organizationContext?.organization.displayName ??
                  "Organization setup pending"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {organizationContext
                  ? `Signed in as ${user.email ?? "authenticated user"} with ${organizationContext.membership.role} access.`
                  : "Your session is active, but the application is still waiting for organization context."}
              </p>
              <div className="mt-4">
                <ProtectedAppBreadcrumbs
                  organizationName={
                    organizationContext?.organization.displayName ?? null
                  }
                />
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">
                  {organizationContext?.organization.displayName ??
                    "No active organization"}
                </p>
                <p className="mt-1 break-all">
                  {user.email ?? "Authenticated user"}
                </p>
              </div>
              <SignOutForm />
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <ProtectedAppNav
              currentRole={organizationContext?.membership.role}
            />
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {organizationContext
                ? `${organizationContext.organization.slug} · ${organizationContext.membership.status}`
                : "Initialization pending"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-12">
        {!organizationContext ? (
          <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-6 text-amber-900">
            Your account is authenticated, but no active organization context is
            available yet. If this is a brand-new account, sign out and sign
            back in once to refresh the app against the newly created tenant
            records.
          </section>
        ) : null}

        {children}
      </main>
    </div>
  );
}
