import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContracts } from "@/lib/contracts/data";
import { listCustomers } from "@/lib/customers/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { listOpportunities } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

const reviewAreas = [
  {
    href: "/leads",
    label: "Leads",
    description: "Review intake, qualification, and lead-to-estimate handoff."
  },
  {
    href: "/projects",
    label: "Projects",
    description: "Validate project-centered continuity across customer, estimate, contract, and field work."
  },
  {
    href: "/contracts",
    label: "Contracts",
    description: "Check approved-estimate contract generation, editing, and lock behavior."
  },
  {
    href: "/jobs",
    label: "Jobs",
    description: "Follow execution status, job detail progression, and invoice readiness."
  },
  {
    href: "/invoices",
    label: "Invoices",
    description: "Validate invoice creation, balances, and payment recording."
  },
  {
    href: "/customers",
    label: "Customers",
    description: "Review canonical customer records, tax exemption, and retainage defaults."
  }
] as const;

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const [
    organizationContext,
    opportunities,
    customers,
    projects,
    estimates,
    contracts,
    jobs,
    invoices
  ] = await Promise.all([
    getActiveOrganizationContext(user.id),
    listOpportunities(),
    listCustomers(),
    listProjects(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices()
  ]);

  const approvedEstimates = estimates.filter((estimate) => estimate.status === "approved");
  const signedContracts = contracts.filter((contract) => contract.status === "signed");
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const activeJobs = jobs.filter(
    (job) => job.status === "scheduled" || job.status === "in_progress"
  );
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const overdueInvoices = invoices.filter((invoice) => {
    if (!invoice.dueDate) {
      return false;
    }

    return invoice.status !== "paid" && invoice.status !== "void" && invoice.dueDate < "2026-04-16";
  });

  const nextProjects = projects.slice(0, 4);
  const nextJobs = jobs
    .slice()
    .sort((left, right) => {
      if (!left.scheduledDate && !right.scheduledDate) {
        return 0;
      }

      if (!left.scheduledDate) {
        return 1;
      }

      if (!right.scheduledDate) {
        return -1;
      }

      return left.scheduledDate.localeCompare(right.scheduledDate);
    })
    .slice(0, 5);

  const nextActions = [
    approvedEstimates[0]
      ? {
          href: `/estimates/${approvedEstimates[0].id}`,
          label: "Generate contract",
          description: `${approvedEstimates[0].referenceNumber} is approved and ready to move into contract review.`
        }
      : null,
    completedJobs[0]
      ? {
          href: `/jobs/${completedJobs[0].id}`,
          label: "Create invoice",
          description: `${completedJobs[0].project?.name ?? "Completed job"} has moved through execution and is ready for billing follow-up.`
        }
      : null,
    openInvoices[0]
      ? {
          href: `/invoices/${openInvoices[0].id}`,
          label: "Record payment",
          description: `${openInvoices[0].referenceNumber} still has an open balance and needs a finance touchpoint.`
        }
      : null
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    description: string;
  }>;

  const dashboardStats = [
    {
      title: "Open leads",
      value: opportunities.length,
      href: "/leads",
      description: "Pre-project work waiting on qualification and estimating."
    },
    {
      title: "Active projects",
      value: projects.length,
      href: "/projects",
      description: "Operational hubs connecting the full commercial-to-field workflow."
    },
    {
      title: "Jobs moving",
      value: activeJobs.length,
      href: "/jobs",
      description: "Scheduled and in-progress work that needs operational visibility."
    },
    {
      title: "Overdue invoices",
      value: overdueInvoices.length,
      href: "/invoices",
      description: "Receivables that need collections and payment follow-up."
    }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Dashboard"
      title="Run the day from one connected workspace"
      description="Review live tenant-scoped work across intake, estimating, execution, workforce, and billing without bouncing between disconnected modules."
      summary={
        <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))] px-5 py-5 text-sm leading-6 text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">
            Workspace status
          </p>
          <p className="mt-3 font-medium text-slate-950">
            {organizationContext?.organization.displayName ?? "Organization setup pending"}
          </p>
          <p className="mt-2">
            {organizationContext
              ? `${organizationContext.membership.role} access · ${organizationContext.membership.status}`
              : "Waiting for active organization context."}
          </p>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Use the top navigation to move between major operating areas, then use this command bar to jump directly into the queues that need attention most.
          </p>
        ),
        filterSlot: reviewAreas.map((area) => (
          <Link
            key={area.href}
            href={area.href}
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            {area.label}
          </Link>
        )),
        actionSlot: (
          <>
            <Link
              href="/leads"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Review leads
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open projects
            </Link>
          </>
        )
      }}
    >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                Today&apos;s operating view
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Counts that frame the day
              </h3>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-slate-500">
              These summary cards stay wide and scannable so the dashboard reads like an operating overview instead of a cramped report.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.98))] px-5 py-5 transition hover:border-brand-200 hover:bg-white"
              >
                <p className="text-sm font-medium text-slate-950">{stat.title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{stat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(290px,0.9fr)]">
          <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                  Next best actions
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Workflow moves that need attention
                </h3>
              </div>
              <Link href="/projects" className="text-sm font-medium text-brand-800">
                View all projects
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {nextActions.length > 0 ? (
                nextActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-5 transition hover:border-brand-200 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-semibold text-slate-950">{action.label}</p>
                      <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">
                        Review
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{action.description}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
                  No urgent workflow transitions are waiting right now. Use the project and job queues to review active work.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-[#1b2128] p-8 text-slate-100 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8cb5bb]">
              Workflow pulse
            </p>
            <dl className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-slate-300">Approved estimates</dt>
                <dd className="text-xl font-semibold text-white">{approvedEstimates.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-slate-300">Signed contracts</dt>
                <dd className="text-xl font-semibold text-white">{signedContracts.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-slate-300">Completed jobs</dt>
                <dd className="text-xl font-semibold text-white">{completedJobs.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-slate-300">Open invoices</dt>
                <dd className="text-xl font-semibold text-white">{openInvoices.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-slate-300">Customers</dt>
                <dd className="text-xl font-semibold text-white">{customers.length}</dd>
              </div>
            </dl>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm leading-6 text-slate-300">
              Projects should remain the operating root. Leads, estimates, contracts, jobs, and invoices are all easier to validate when the handoff stays visible in project context.
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                  Active projects
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Connected work ready for review
                </h3>
              </div>
              <Link href="/projects" className="text-sm font-medium text-brand-800">
                Browse all
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {nextProjects.length > 0 ? (
                nextProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-5 transition hover:border-brand-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-950">{project.name}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {project.customer?.name ?? "Unknown customer"}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {project.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
                  No projects exist yet. Start from leads or customer records to open the first project workflow.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                  Jobs starting soon
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Operational work queue
                </h3>
              </div>
              <Link href="/jobs" className="text-sm font-medium text-brand-800">
                Open jobs
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {nextJobs.length > 0 ? (
                nextJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-5 transition hover:border-brand-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {job.project?.name ?? "Untitled job"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {job.customer?.name ?? "Unknown customer"}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {job.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {job.scheduledDate
                        ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}`
                        : "Not yet scheduled"}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
                  No jobs are live yet. Approved estimates will show up here once work moves into execution.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
            Workspace context
          </p>
          {organizationContext ? (
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <div>
                <p className="font-medium text-slate-950">Signed-in user</p>
                <p className="mt-1 break-all">{user.email ?? "Authenticated user"}</p>
              </div>
              <div>
                <p className="font-medium text-slate-950">Organization</p>
                <p className="mt-1">{organizationContext.organization.displayName}</p>
              </div>
              <div>
                <p className="font-medium text-slate-950">Role</p>
                <p className="mt-1 capitalize">{organizationContext.membership.role}</p>
              </div>
              <div>
                <p className="font-medium text-slate-950">Membership</p>
                <p className="mt-1 capitalize">{organizationContext.membership.status}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-600">
              No active organization context was found for this user. If bootstrap just ran, sign out and back in to refresh the tenant session.
            </p>
          )}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
            Review areas
          </p>
          <div className="mt-5 space-y-4">
            {reviewAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="block rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <p className="text-sm font-medium text-slate-950">{area.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{area.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
            Truthfulness rule
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Protected routes should either show live Supabase-backed business records or an explicit empty state. Materials and settings remain honest empty-state surfaces until their canonical workflows are built.
          </p>
        </section>
      </aside>
    </div>
    </ContractorWorkspacePage>
  );
}
