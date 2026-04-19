import Link from "next/link";

import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import { DashboardProjectCard } from "@/components/dashboard-project-card";
import { DashboardActionCard } from "@/components/dashboard-action-card";
import { DashboardInvoiceRow } from "@/components/dashboard-invoice-row";
import { DashboardCommandBar } from "@/components/dashboard-command-bar";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContracts } from "@/lib/contracts/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { listOpportunities } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const [
    organizationContext,
    opportunities,
    projects,
    estimates,
    contracts,
    jobs,
    invoices
  ] = await Promise.all([
    getActiveOrganizationContext(user.id),
    listOpportunities(),
    listProjects(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices()
  ]);

  const approvedEstimates = estimates.filter((e) => e.status === "approved");
  const signedContracts = contracts.filter((c) => c.status === "signed");
  const activeJobs = jobs.filter(
    (j) => j.status === "scheduled" || j.status === "in_progress"
  );
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const openInvoices = invoices.filter(
    (i) => i.status !== "paid" && i.status !== "void"
  );
  const overdueInvoices = invoices.filter((i) => {
    if (!i.dueDate) return false;
    return i.status !== "paid" && i.status !== "void" && i.dueDate < "2026-04-16";
  });

  const recentProjects = projects.slice(0, 4);
  const recentInvoices = invoices.slice(0, 5);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.totalAmount ?? 0), 0);

  const outstandingAmount = openInvoices.reduce(
    (sum, i) => sum + ((i.totalAmount ?? 0) - (i.paidAmount ?? 0)),
    0
  );

  const nextActions = [
    approvedEstimates[0]
      ? {
          href: `/estimates/${approvedEstimates[0].id}`,
          title: "Generate contract",
          description: `${approvedEstimates[0].referenceNumber} is approved and ready for contract.`,
          badge: "Review",
          badgeColor: "blue" as const
        }
      : null,
    completedJobs[0]
      ? {
          href: `/jobs/${completedJobs[0].id}`,
          title: "Create invoice",
          description: `${completedJobs[0].project?.name ?? "Completed job"} is ready for billing.`,
          badge: "Action",
          badgeColor: "green" as const
        }
      : null,
    openInvoices[0]
      ? {
          href: `/invoices/${openInvoices[0].id}`,
          title: "Record payment",
          description: `${openInvoices[0].referenceNumber} has an open balance.`,
          badge: "Finance",
          badgeColor: "amber" as const
        }
      : null
  ].filter(Boolean) as Array<{
    href: string;
    title: string;
    description: string;
    badge: string;
    badgeColor: "blue" | "green" | "amber";
  }>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back, {organizationContext?.organization.displayName ?? "your workspace"} overview
          </p>
        </div>
        <DashboardCommandBar />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Open Leads"
          value={opportunities.length}
          href="/leads"
          trend={opportunities.length > 0 ? "neutral" : undefined}
          description="Awaiting qualification"
        />
        <DashboardMetricCard
          title="Active Projects"
          value={projects.length}
          href="/projects"
          trend={projects.length > 0 ? "up" : undefined}
          description="In progress"
        />
        <DashboardMetricCard
          title="Jobs in Motion"
          value={activeJobs.length}
          href="/jobs"
          description="Scheduled or active"
        />
        <DashboardMetricCard
          title="Overdue Invoices"
          value={overdueInvoices.length}
          href="/invoices"
          trend={overdueInvoices.length > 0 ? "down" : undefined}
          description="Need attention"
          variant={overdueInvoices.length > 0 ? "warning" : "default"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Active Projects
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Your current work in progress
                </p>
              </div>
              <Link
                href="/projects"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <DashboardProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    customer={project.customer?.name ?? "Unknown customer"}
                    status={project.status}
                  />
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-neutral-500">
                  No projects yet. Start by creating a lead or project.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Recent Invoices
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Latest billing activity
                </p>
              </div>
              <Link
                href="/invoices"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <DashboardInvoiceRow
                    key={invoice.id}
                    id={invoice.id}
                    referenceNumber={invoice.referenceNumber ?? "—"}
                    customer={invoice.customer?.name ?? "Unknown"}
                    amount={invoice.totalAmount ?? 0}
                    status={invoice.status}
                    dueDate={invoice.dueDate ?? undefined}
                  />
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-neutral-500">
                  No invoices yet. Create one from a completed job.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">
              Quick Stats
            </h2>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Approved Estimates</dt>
                <dd className="text-sm font-semibold text-neutral-900">
                  {approvedEstimates.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Signed Contracts</dt>
                <dd className="text-sm font-semibold text-neutral-900">
                  {signedContracts.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Completed Jobs</dt>
                <dd className="text-sm font-semibold text-neutral-900">
                  {completedJobs.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Open Invoices</dt>
                <dd className="text-sm font-semibold text-neutral-900">
                  {openInvoices.length}
                </dd>
              </div>
              <div className="h-px bg-neutral-100" />
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Total Revenue</dt>
                <dd className="text-sm font-semibold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Outstanding</dt>
                <dd className="text-sm font-semibold text-amber-600">
                  ${outstandingAmount.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">
                Next Actions
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Recommended workflow steps
              </p>
            </div>
            <div className="divide-y divide-neutral-100">
              {nextActions.length > 0 ? (
                nextActions.map((action) => (
                  <DashboardActionCard
                    key={action.href}
                    href={action.href}
                    title={action.title}
                    description={action.description}
                    badge={action.badge}
                    badgeColor={action.badgeColor}
                  />
                ))
              ) : (
                <div className="px-5 py-6 text-center text-sm text-neutral-500">
                  No pending actions right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-900 bg-neutral-900 p-5 text-white">
            <h2 className="text-sm font-semibold">Workflow Status</h2>
            <p className="mt-2 text-xs text-neutral-400">
              Your pipeline at a glance
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Leads</span>
                <span className="text-sm font-medium">{opportunities.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min((opportunities.length / 10) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Projects</span>
                <span className="text-sm font-medium">{projects.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800">
                <div
                  className="h-1.5 rounded-full bg-green-500"
                  style={{
                    width: `${Math.min((projects.length / 10) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Jobs</span>
                <span className="text-sm font-medium">{activeJobs.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800">
                <div
                  className="h-1.5 rounded-full bg-amber-500"
                  style={{
                    width: `${Math.min((activeJobs.length / 10) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
