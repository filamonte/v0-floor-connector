import Link from "next/link";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCustomers } from "@/lib/customers/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

const surfaceLinks = [
  {
    href: "/leads",
    label: "Leads",
    description:
      "Opportunity intake is planned here, but this route still shows an explicit empty-state placeholder instead of fake pipeline data."
  },
  {
    href: "/materials",
    label: "Materials",
    description:
      "Reusable catalog and assemblies will live here once the shared master-data layer is implemented."
  },
  {
    href: "/settings",
    label: "Settings",
    description:
      "Organization settings remain intentionally minimal until the next admin workflow pass."
  }
] as const;

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const [organizationContext, customers, projects, estimates, jobs, invoices] =
    await Promise.all([
      getActiveOrganizationContext(user.id),
      listCustomers(),
      listProjects(),
      listEstimates(),
      listJobs(),
      listInvoices()
    ]);

  const approvedEstimates = estimates.filter((estimate) => estimate.status === "approved");
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );

  const dashboardStats = [
    {
      title: "Customers",
      value: customers.length,
      href: "/customers",
      description: "Tenant-scoped customer records available for active work."
    },
    {
      title: "Projects",
      value: projects.length,
      href: "/projects",
      description: "Live operational projects tied to canonical customer records."
    },
    {
      title: "Approved estimates",
      value: approvedEstimates.length,
      href: "/estimates",
      description: "Commercial work ready for contract generation and handoff."
    },
    {
      title: "Open invoices",
      value: openInvoices.length,
      href: "/invoices",
      description: "Receivables still waiting on payment or follow-up."
    }
  ] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Dashboard
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Live contractor workspace foundation.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This dashboard reflects the signed-in session, active organization, and
          live tenant-scoped business records already available inside the contractor app.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-medium text-emerald-900">Session status</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Active and protected. Authentication, session persistence, tenant scoping,
              and redirect protection are all working on this route.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-medium text-slate-900">Signed-in user</p>
            <p className="mt-2 break-all text-sm leading-6 text-slate-700">
              {user?.email ?? "Authenticated user"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-medium text-slate-900">Organization role</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {organizationContext?.membership.role ?? "No active membership"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-medium text-slate-900">Active organization</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {organizationContext?.organization.displayName ?? "No active organization"}
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
                  <p className="text-sm font-medium text-slate-950">Organization name</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {organizationContext.organization.displayName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Organization slug</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {organizationContext.organization.slug}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Membership role</p>
                  <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                    {organizationContext.membership.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Membership status</p>
                  <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                    {organizationContext.membership.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Tenant status</p>
                  <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                    {organizationContext.organization.tenantStatus}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Lifecycle state</p>
                  <p className="mt-2 text-sm capitalize leading-6 text-slate-600">
                    {organizationContext.organization.lifecycleState}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                No active organization context was found for this user. If bootstrap just ran,
                signing out and back in should reload the session against the new tenant records.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Workflow Readiness
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              These live counts show where the current tenant has work ready for the next step.
            </p>
            <dl className="mt-4 space-y-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700">
              <div className="flex items-center justify-between gap-4">
                <dt>Approved estimates</dt>
                <dd>{approvedEstimates.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Active jobs</dt>
                <dd>{jobs.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Completed jobs</dt>
                <dd>{completedJobs.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Open invoices</dt>
                <dd>{openInvoices.length}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Live Record Queues
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <p className="text-sm font-medium text-slate-950">{stat.title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{stat.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          This is still a foundation dashboard, but it now reports real tenant-scoped records
          instead of placeholder module content.
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
              <p className="text-sm font-medium text-slate-950">{surface.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{surface.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
          Surfaces without live business workflows still render explicit empty-state placeholders
          instead of fake records.
        </div>
      </aside>
    </div>
  );
}
