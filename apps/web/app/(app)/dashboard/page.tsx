import Link from "next/link";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

const modulePlaceholders = [
  {
    title: "Organization Context",
    description:
      "This area will become the organization-aware entry point once membership and tenant selection are introduced."
  },
  {
    title: "Role Routing",
    description:
      "Future logic can route authenticated users into the right contractor, portal, or super admin experience."
  },
  {
    title: "Workspace Modules",
    description:
      "CRM, estimating, scheduling, billing, and documents will plug into this protected shell later."
  }
] as const;

const surfaceLinks = [
  {
    href: "/app",
    label: "Contractor App",
    description:
      "Protected scaffold for the contractor-facing product surface."
  },
  {
    href: "/portal",
    label: "Customer Portal",
    description:
      "Protected scaffold for the future customer-facing access experience."
  },
  {
    href: "/super-admin",
    label: "Super Admin",
    description:
      "Protected scaffold for platform-level administration and controls."
  }
] as const;

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Dashboard
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Organization-aware shell confirmed.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            This protected `/dashboard` route is now the authenticated app home.
            It reflects the signed-in session, the active organization, and the
            current membership context while keeping real product modules out of
            scope for now.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <p className="text-sm font-medium text-emerald-900">
                Session status
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Active and protected. Authentication, session persistence, and
                redirect protection are all working on this route.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-900">Signed-in user</p>
              <p className="mt-2 break-all text-sm leading-6 text-slate-700">
                {user?.email ?? "Authenticated user"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-900">
                Organization role
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {organizationContext?.membership.role ?? "No active membership"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-900">
                Active organization
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {organizationContext?.organization.displayName ??
                  "No active organization"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                Organization Context
              </p>
              {organizationContext ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Organization name
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {organizationContext.organization.displayName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Organization slug
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {organizationContext.organization.slug}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Membership role
                    </p>
                    <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                      {organizationContext.membership.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Membership status
                    </p>
                    <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                      {organizationContext.membership.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Tenant status
                    </p>
                    <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                      {organizationContext.organization.tenantStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      Lifecycle state
                    </p>
                    <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                      {organizationContext.organization.lifecycleState}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  No active organization context was found for this user. If
                  bootstrap just ran, signing out and back in should reload the
                  session against the new tenant records.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                Bootstrap Check
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                This panel confirms the authenticated user is attached to a real
                organization and membership instead of only having an auth
                session.
              </p>
              <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">
                {organizationContext
                  ? "Active organization context loaded successfully."
                  : "Active organization context is still missing."}
              </div>
            </section>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Future Modules
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {modulePlaceholders.map((module) => (
                <section
                  key={module.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4"
                >
                  <h3 className="text-sm font-medium text-slate-950">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {module.description}
                  </p>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            No business dashboard has been built yet. This page exists to
            verify the signed-in app shell, organization context, and role-aware
            foundation before real modules are added.
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Next Surfaces
          </p>
          <div className="mt-6 space-y-4">
            {surfaceLinks.map((surface) => (
              <Link
                key={surface.href}
                href={surface.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <p className="text-sm font-medium text-slate-950">
                  {surface.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {surface.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            These routes are protected and accessible now through the shared app
            shell, but they are still foundation placeholders rather than real
            product modules.
          </div>
        </aside>
      </div>
  );
}
