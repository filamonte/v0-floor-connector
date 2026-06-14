import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { OpportunityQuickCreateForm } from "@/components/opportunity-quick-create-form";
import { PerspectiveSwitcher } from "@/components/perspectives/perspective-switcher";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listAppointments } from "@/lib/appointments/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { quickCreateOpportunityAction } from "@/lib/opportunities/actions";
import { listOpportunities } from "@/lib/opportunities/data";
import { formatOpportunityStatusLabel } from "@/lib/opportunities/schemas";
import {
  parsePerspectiveView,
  type PerspectiveView
} from "@/lib/perspectives/types";
import { listLeadFollowUpQueue } from "@/lib/opportunities/follow-up-data";
import {
  labelLeadFollowUpBucket,
  type LeadFollowUpBucket
} from "@/lib/opportunities/follow-up-read-model";

type LeadFollowUpView = "all" | "due" | "overdue" | "no_follow_up";

type LeadsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    view?: PerspectiveView;
    followUp?: LeadFollowUpView;
    error?: string;
    message?: string;
  }>;
};

type LeadActivity = {
  opportunityId: string;
  title: string;
  startsAt: string;
  label: string;
  assignedLabel: string;
};

type SalesCommandLaneItem = {
  href: string;
  title: string;
  subtitle: string;
  meta?: string | null;
  trailing?: string | null;
};

type SalesCommandLane = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  items: SalesCommandLaneItem[];
  emptyTitle: string;
  emptyDescription: string;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function buildLeadsHref(input: {
  q?: string;
  view?: PerspectiveView;
  followUp?: LeadFollowUpView;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "company") {
    searchParams.set("view", input.view);
  }

  if (input.followUp && input.followUp !== "all") {
    searchParams.set("followUp", input.followUp);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/leads?${query}` : "/leads";
}

function getFollowUpBadgeClasses(bucket: LeadFollowUpBucket) {
  switch (bucket) {
    case "overdue":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "due_today":
      return "border-[#c7d2e2] bg-[#f8fafc] text-[#0f172a]";
    case "upcoming":
      return "border-[var(--border-medium)] bg-[var(--highlight)] text-[var(--graphite)]";
    case "no_follow_up":
      return "border-[#cbd5e1] bg-white text-[#334155]";
  }
}

function getOpportunityContactLabel(
  opportunity: Awaited<ReturnType<typeof listOpportunities>>[number]
) {
  return (
    opportunity.primaryContact?.displayName ??
    opportunity.prospectName ??
    "Contact pending"
  );
}

function getOpportunityContextLabel(
  opportunity: Awaited<ReturnType<typeof listOpportunities>>[number]
) {
  return (
    opportunity.primaryContact?.companyName ??
    opportunity.prospectCompanyName ??
    opportunity.customer?.name ??
    opportunity.siteName ??
    "Company or site pending"
  );
}

function getMissingOpportunityInfo(
  opportunity: Awaited<ReturnType<typeof listOpportunities>>[number]
) {
  const missing: string[] = [];

  if (!opportunity.customerId) {
    missing.push("Customer");
  }

  if (!opportunity.projectId) {
    missing.push("Project");
  }

  if (
    !opportunity.requirementsSummary?.trim() &&
    opportunity.siteAssessmentStatus !== "completed"
  ) {
    missing.push("Requirements");
  }

  if (!opportunity.nextFollowUpAt) {
    missing.push("Follow-up");
  }

  return missing;
}

function buildOpportunityLaneItem(
  opportunity: Awaited<ReturnType<typeof listOpportunities>>[number],
  input: {
    meta?: string | null;
    trailing?: string | null;
  } = {}
): SalesCommandLaneItem {
  return {
    href: `/leads/${opportunity.id}`,
    title: opportunity.title,
    subtitle: getOpportunityContactLabel(opportunity),
    meta: input.meta ?? getOpportunityContextLabel(opportunity),
    trailing: input.trailing ?? formatOpportunityStatusLabel(opportunity.status)
  };
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/leads");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Lead records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [opportunities, appointments, leadFollowUps] = await Promise.all([
    listOpportunities(),
    listAppointments(),
    listLeadFollowUpQueue({ includeNoFollowUp: true, upcomingDays: 3650 })
  ]);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view = parsePerspectiveView(resolvedSearchParams.view);
  const followUpView = resolvedSearchParams.followUp ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const followUpByOpportunityId = new Map(
    leadFollowUps.map((item) => [item.opportunityId, item])
  );
  const dueFollowUps = leadFollowUps.filter(
    (item) => item.bucket === "overdue" || item.bucket === "due_today"
  );
  const overdueFollowUps = leadFollowUps.filter(
    (item) => item.bucket === "overdue"
  );
  const noFollowUps = leadFollowUps.filter(
    (item) => item.bucket === "no_follow_up"
  );
  const myLeadIds = new Set(
    appointments
      .filter(
        (appointment) =>
          appointment.opportunityId &&
          appointment.assignedPerson?.membershipUserId === user.id
      )
      .map((appointment) => appointment.opportunityId as string)
  );

  const leadActivities: LeadActivity[] = [
    ...appointments
      .filter(
        (appointment) =>
          appointment.opportunityId && appointment.status === "scheduled"
      )
      .map((appointment) => ({
        opportunityId: appointment.opportunityId as string,
        title: appointment.title,
        startsAt: appointment.startsAt,
        label: formatStatusLabel(appointment.appointmentType),
        assignedLabel: appointment.assignedPerson?.displayName ?? "Unassigned"
      })),
    ...opportunities
      .filter((opportunity) => opportunity.siteAssessmentScheduledAt)
      .map((opportunity) => ({
        opportunityId: opportunity.id,
        title: `${opportunity.title} site assessment`,
        startsAt: opportunity.siteAssessmentScheduledAt as string,
        label: "site assessment",
        assignedLabel: "Opportunity workflow"
      }))
  ].sort((left, right) => left.startsAt.localeCompare(right.startsAt));

  const nextActivityByOpportunity = new Map<string, LeadActivity>();
  for (const activity of leadActivities) {
    if (!nextActivityByOpportunity.has(activity.opportunityId)) {
      nextActivityByOpportunity.set(activity.opportunityId, activity);
    }
  }

  const visibleOpportunities = opportunities.filter((opportunity) => {
    const matchesView =
      view === "company" ? true : myLeadIds.has(opportunity.id);
    const followUpItem = followUpByOpportunityId.get(opportunity.id);
    const matchesFollowUp =
      followUpView === "all"
        ? true
        : followUpView === "due"
          ? followUpItem?.bucket === "overdue" ||
            followUpItem?.bucket === "due_today"
          : followUpView === "overdue"
            ? followUpItem?.bucket === "overdue"
            : followUpItem?.bucket === "no_follow_up";
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            opportunity.title,
            opportunity.primaryContact?.displayName ?? opportunity.prospectName,
            opportunity.primaryContact?.companyName ??
              opportunity.prospectCompanyName ??
              "",
            opportunity.jobType ?? "",
            opportunity.source ?? "",
            opportunity.siteName ?? "",
            opportunity.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesView && matchesFollowUp && matchesQuery;
  });

  const newIntake = opportunities.filter(
    (opportunity) => opportunity.status === "new"
  );
  const proposalSentOpportunities = opportunities.filter(
    (opportunity) => opportunity.status === "proposal_sent"
  );
  const myOpportunities = opportunities.filter((opportunity) =>
    myLeadIds.has(opportunity.id)
  );
  const nextTasks = leadActivities.filter(
    (activity) => new Date(activity.startsAt) >= new Date()
  );
  const stageFunnel = [
    { key: "new", label: "New intake", count: newIntake.length },
    {
      key: "contacted",
      label: "Contacted",
      count: opportunities.filter((o) => o.status === "contacted").length
    },
    {
      key: "qualified",
      label: "Qualified opportunity",
      count: opportunities.filter((o) => o.status === "qualified").length
    },
    {
      key: "site_assessment_scheduled",
      label: "Site visit scheduled",
      count: opportunities.filter(
        (o) => o.status === "site_assessment_scheduled"
      ).length
    },
    {
      key: "estimating",
      label: "Estimating",
      count: opportunities.filter((o) => o.status === "estimating").length
    },
    {
      key: "proposal_sent",
      label: "Proposal sent",
      count: proposalSentOpportunities.length
    },
    {
      key: "won",
      label: "Won",
      count: opportunities.filter((o) => o.status === "won").length
    }
  ];
  const qualificationOpportunities = opportunities.filter((opportunity) =>
    ["new", "contacted", "qualified"].includes(opportunity.status)
  );
  const siteVisitOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.status === "site_assessment_scheduled" ||
      opportunity.siteAssessmentStatus === "scheduled"
  );
  const estimateWaitingOpportunities = opportunities.filter((opportunity) =>
    ["site_assessment_complete", "estimating", "proposal_sent"].includes(
      opportunity.status
    )
  );
  const missingInfoOpportunities = opportunities.filter((opportunity) => {
    if (["won", "lost", "converted"].includes(opportunity.status)) {
      return false;
    }

    return getMissingOpportunityInfo(opportunity).length > 0;
  });
  const salesCommandLanes: SalesCommandLane[] = [
    {
      key: "qualification",
      eyebrow: "Qualification",
      title: "Qualify intake",
      description:
        "First inquiries and contacted opportunities that need sales qualification before estimate work.",
      actionHref: buildLeadsHref({ q: query, view, followUp: followUpView }),
      actionLabel: "Open intake",
      items: qualificationOpportunities.slice(0, 4).map((opportunity) =>
        buildOpportunityLaneItem(opportunity, {
          meta: opportunity.source
            ? `Source: ${opportunity.source}`
            : (opportunity.jobType ?? "Source pending")
        })
      ),
      emptyTitle: "No intake is waiting on qualification.",
      emptyDescription:
        "New Lead Intake and early Sales Opportunities will appear here when they need first qualification."
    },
    {
      key: "follow-up",
      eyebrow: "Follow-up",
      title: "Contact next",
      description:
        "Due and overdue follow-up from the existing opportunity follow-up queue.",
      actionHref: buildLeadsHref({ q: query, view, followUp: "due" }),
      actionLabel: "Review due",
      items: dueFollowUps.slice(0, 4).map((item) => ({
        href: `/leads/${item.opportunityId}`,
        title: item.title,
        subtitle: item.contactName ?? "Contact pending",
        meta: item.nextFollowUpAt
          ? `${labelLeadFollowUpBucket(item.bucket)} - ${formatDateLabel(
              item.nextFollowUpAt
            )}`
          : labelLeadFollowUpBucket(item.bucket),
        trailing: item.projectName ?? item.customerName ?? item.companyName
      })),
      emptyTitle: "No due follow-up is waiting.",
      emptyDescription:
        "Overdue and due-today opportunity follow-up will collect here from the canonical follow-up fields."
    },
    {
      key: "site-visit",
      eyebrow: "Site visit",
      title: "Assess next",
      description:
        "Scheduled site assessments and visits that keep sales context moving toward estimate handoff.",
      actionHref: buildLeadsHref({ q: query, view, followUp: followUpView }),
      actionLabel: "Open visits",
      items: siteVisitOpportunities.slice(0, 4).map((opportunity) =>
        buildOpportunityLaneItem(opportunity, {
          meta: opportunity.siteAssessmentScheduledAt
            ? `Visit: ${formatDateLabel(opportunity.siteAssessmentScheduledAt)}`
            : "Visit scheduled",
          trailing: opportunity.siteName ?? "Site pending"
        })
      ),
      emptyTitle: "No site visits are waiting.",
      emptyDescription:
        "Scheduled opportunity site visits will appear here without creating a separate scheduling lane."
    },
    {
      key: "estimate-handoff",
      eyebrow: "Estimate",
      title: "Waiting on estimate",
      description:
        "Assessed, estimating, and proposal-sent opportunities that need estimating ownership or proposal follow-through.",
      actionHref: "/estimates",
      actionLabel: "Open estimates",
      items: estimateWaitingOpportunities.slice(0, 4).map((opportunity) =>
        buildOpportunityLaneItem(opportunity, {
          meta: opportunity.projectId
            ? "Project context linked"
            : "Project context pending",
          trailing:
            opportunity.status === "proposal_sent"
              ? "Proposal sent"
              : "Estimate handoff"
        })
      ),
      emptyTitle: "No opportunity is waiting on estimate work.",
      emptyDescription:
        "Completed assessments and estimating handoffs will show here when sales context is ready for the estimate workspace."
    },
    {
      key: "missing-info",
      eyebrow: "Missing info",
      title: "Complete context",
      description:
        "Open opportunities missing customer, project, requirements, or follow-up context before handoff.",
      actionHref: buildLeadsHref({ q: query, view, followUp: "no_follow_up" }),
      actionLabel: "Fill gaps",
      items: missingInfoOpportunities.slice(0, 4).map((opportunity) =>
        buildOpportunityLaneItem(opportunity, {
          meta: `Missing: ${getMissingOpportunityInfo(opportunity).join(", ")}`,
          trailing: opportunity.siteName ?? "Context gap"
        })
      ),
      emptyTitle: "No obvious context gaps in active opportunities.",
      emptyDescription:
        "Missing customer, project, requirement, or follow-up fields will surface here from the existing opportunity record."
    }
  ];

  return (
    <ContractorWorkspacePage
      eyebrow="Sales"
      title={`Leads & Opportunities for ${organizationContext.organization.displayName}`}
      description="Run Lead Intake and active Sales Opportunity follow-up from one board, while preserving the existing /leads route and canonical opportunities records."
      headerTone="dark"
      summary={
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-white/10 bg-white/10 xl:grid-cols-4">
          <div className="bg-white/[0.075] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8fc7ff]">
              All opportunities
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {opportunities.length}
            </p>
          </div>
          <div className="bg-white/[0.075] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8fc7ff]">
              My opportunities
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {myOpportunities.length}
            </p>
          </div>
          <div className="bg-white/[0.075] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8fc7ff]">
              New intake
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {newIntake.length}
            </p>
          </div>
          <div className="bg-white/[0.075] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8fc7ff]">
              Proposal sent
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {proposalSentOpportunities.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This board keeps first inquiries visible as Lead Intake, then tracks
            active Sales Opportunities through qualification, site visit,
            estimating, and proposal follow-up.
          </p>
        ),
        searchSlot: (
          <form action="/leads" className="flex flex-col gap-2 sm:flex-row">
            {view !== "company" ? (
              <input type="hidden" name="view" value={view} />
            ) : null}
            {followUpView !== "all" ? (
              <input type="hidden" name="followUp" value={followUpView} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search opportunity, contact, company, source, job type, or site"
              className="min-w-0 flex-1 rounded-[4px] border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[#005eb8]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] transition hover:border-[#005eb8] hover:bg-[#eef6ff]"
            >
              Search
            </button>
            {query.length > 0 ||
            view !== "company" ||
            followUpView !== "all" ||
            showComposer ? (
              <Link
                href="/leads"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: [
          <PerspectiveSwitcher
            key="perspective"
            value={view}
            hrefForView={(nextView) =>
              buildLeadsHref({
                q: query,
                view: nextView,
                followUp: followUpView,
                compose: showComposer ? "1" : undefined
              })
            }
          />,
          ...(
            [
              {
                key: "all",
                label: "All follow-up",
                count: leadFollowUps.length
              },
              { key: "due", label: "Due", count: dueFollowUps.length },
              {
                key: "overdue",
                label: "Overdue",
                count: overdueFollowUps.length
              },
              {
                key: "no_follow_up",
                label: "No follow-up",
                count: noFollowUps.length
              }
            ] as const
          ).map((item) => {
            const isActive = followUpView === item.key;

            return (
              <Link
                key={`follow-up-${item.key}`}
                href={buildLeadsHref({
                  q: query,
                  view,
                  followUp: item.key,
                  compose: showComposer ? "1" : undefined
                })}
                className={[
                  "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[#005eb8] text-white"
                    : "border border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#eef6ff]"
                ].join(" ")}
              >
                <span>{item.label}</span>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-[#f1f5f9] text-[#334155]"
                  ].join(" ")}
                >
                  {item.count}
                </span>
              </Link>
            );
          })
        ],
        actionSlot: (
          <Link
            href={
              buildLeadsHref({
                q: query,
                view,
                followUp: followUpView,
                compose: "1"
              }) + "#lead-create"
            }
            className="inline-flex items-center rounded-[3px] border border-[#005eb8] bg-[#005eb8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f9e]"
          >
            New intake
          </Link>
        )
      }}
    >
      <div className="flex flex-col gap-3">
        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <section className="order-1 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[repeat(5,minmax(0,1fr))]">
          {salesCommandLanes.map((lane) => (
            <ManagerDashboardCard
              key={lane.key}
              eyebrow={lane.eyebrow}
              title={lane.title}
              description={lane.description}
              actionHref={lane.actionHref}
              actionLabel={lane.actionLabel}
              items={lane.items}
              emptyTitle={lane.emptyTitle}
              emptyDescription={lane.emptyDescription}
            />
          ))}
        </section>

        <section className="order-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.4fr)]">
          <section className="border border-[#d1d5db] bg-white">
            <div className="border-b border-[#e5e7eb] px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
                Funnel
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
                Opportunity stage funnel
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Real opportunity stages only, so the sales view stays honest to
                the current workflow.
              </p>
            </div>
            <div className="space-y-2 px-4 py-3">
              {stageFunnel.map((stage, index) => (
                <div key={stage.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-[var(--text-primary)]">
                      {stage.label}
                    </span>
                    <span className="text-[var(--text-tertiary)]">
                      {stage.count}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-[3px] bg-[#f1f5f9]">
                    <div
                      className="h-full rounded-[3px] bg-[#005eb8]"
                      style={{
                        width: `${Math.max(
                          8,
                          opportunities.length > 0
                            ? (stage.count / opportunities.length) *
                                (100 - index * 6)
                            : 8
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-[#d1d5db] bg-white">
            <div className="border-b border-[#e5e7eb] px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
                Activity
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
                Scheduled sales work
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Opportunity-linked appointments and assessments from the
                existing calendar and sales fields.
              </p>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {nextTasks.slice(0, 6).length > 0 ? (
                nextTasks.slice(0, 6).map((activity) => (
                  <Link
                    key={`${activity.opportunityId}:${activity.startsAt}`}
                    href={`/leads/${activity.opportunityId}`}
                    className="block px-4 py-3 transition hover:bg-[#f8fafc]"
                  >
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {activity.assignedLabel}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#005eb8]">
                      {activity.label} - {formatDateLabel(activity.startsAt)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="m-4 rounded-[4px] border border-dashed border-[#cbd5e1] bg-[#f9fafb] px-3 py-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No scheduled sales work is waiting.
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
                    Site visits and opportunity appointments will appear here
                    when they are tied to real sales records.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="order-2 overflow-hidden rounded-[4px] border border-[#cfd6df] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
                Sales command surface
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
                {view === "my" ? "Assigned opportunities" : "All opportunities"}
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#475569]">
                Intake, qualification, site visits, and estimating handoff
                remain on the canonical opportunity chain.
              </p>
            </div>
            <p className="shrink-0 rounded-[4px] border border-[#c7d2e2] bg-white px-3 py-1.5 text-sm font-semibold leading-6 text-[#0f172a]">
              {visibleOpportunities.length} visible
            </p>
          </div>

          {visibleOpportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f9fafb] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  <tr>
                    <th className="px-4 py-2.5">Opportunity</th>
                    <th className="px-4 py-2.5">Primary contact</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Follow-up / next step</th>
                    <th className="px-4 py-2.5">Assigned</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {visibleOpportunities.map((opportunity) => {
                    const nextActivity = nextActivityByOpportunity.get(
                      opportunity.id
                    );
                    const followUpItem = followUpByOpportunityId.get(
                      opportunity.id
                    );
                    const actionHref =
                      opportunity.status === "lost"
                        ? `/leads/${opportunity.id}`
                        : opportunity.projectId
                          ? `/estimates?projectId=${opportunity.projectId}&opportunityId=${opportunity.id}`
                          : `/leads/${opportunity.id}`;
                    const actionLabel =
                      opportunity.status === "lost"
                        ? "Open opportunity"
                        : "Start estimate";

                    return (
                      <tr key={opportunity.id} className="hover:bg-[#f8fafc]">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/leads/${opportunity.id}`}
                            className="font-semibold text-[var(--text-primary)] transition hover:text-[#005eb8]"
                          >
                            {opportunity.title}
                          </Link>
                          <p className="mt-0.5 text-sm leading-5 text-slate-500">
                            {opportunity.jobType ??
                              opportunity.serviceType ??
                              "Job type pending"}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-slate-700">
                            {opportunity.primaryContact?.displayName ??
                              opportunity.prospectName}
                          </p>
                          <p className="mt-0.5 text-sm leading-5 text-slate-500">
                            {opportunity.primaryContact?.companyName ??
                              opportunity.prospectCompanyName ??
                              opportunity.siteName ??
                              "No company or site saved"}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex rounded-[3px] border border-[#cbd5e1] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155]">
                            {formatOpportunityStatusLabel(opportunity.status)}
                          </span>
                          {followUpItem ? (
                            <span
                              className={[
                                "mt-2 inline-flex rounded-[3px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                                getFollowUpBadgeClasses(followUpItem.bucket)
                              ].join(" ")}
                            >
                              {labelLeadFollowUpBucket(followUpItem.bucket)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5">
                          {followUpItem &&
                          followUpItem.bucket !== "no_follow_up" ? (
                            <>
                              <p className="font-medium text-slate-700">
                                {labelLeadFollowUpBucket(followUpItem.bucket)}
                              </p>
                              <p className="mt-0.5 text-sm leading-5 text-slate-500">
                                {formatDateLabel(
                                  followUpItem.nextFollowUpAt as string
                                )}
                              </p>
                              {followUpItem.nextFollowUpNote ? (
                                <p className="mt-0.5 max-w-sm text-sm leading-5 text-slate-500">
                                  {followUpItem.nextFollowUpNote}
                                </p>
                              ) : null}
                              {followUpItem.lastCommunicationAt ? (
                                <p className="mt-0.5 text-xs leading-5 text-slate-400">
                                  Last touch{" "}
                                  {formatDateLabel(
                                    followUpItem.lastCommunicationAt
                                  )}
                                </p>
                              ) : null}
                            </>
                          ) : nextActivity ? (
                            <>
                              <p className="font-medium text-slate-700">
                                {nextActivity.label}
                              </p>
                              <p className="mt-0.5 text-sm leading-5 text-slate-500">
                                {formatDateLabel(nextActivity.startsAt)}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm leading-5 text-slate-500">
                              {opportunity.status === "lost"
                                ? "Reopen this opportunity before it can move forward."
                                : "No follow-up date set. Add one from the Opportunity Workspace when the next touch is known."}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {nextActivity?.assignedLabel ?? "Unassigned"}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <Link
                              href={actionHref}
                              className="inline-flex items-center rounded-[4px] border border-[#cbd5e1] bg-white px-3 py-2 text-sm font-medium text-[#0f172a] transition hover:border-[#005eb8] hover:bg-[#eef6ff]"
                            >
                              {actionLabel}
                            </Link>
                            {followUpItem ? (
                              <Link
                                href={`/leads/${opportunity.id}?workItemCue=follow_up#work-items`}
                                className="text-xs font-medium text-[#005eb8] transition hover:text-[#003d7c]"
                              >
                                Create work item
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={
                  opportunities.length > 0
                    ? "No matching opportunities"
                    : "No opportunities yet"
                }
                title={
                  opportunities.length > 0
                    ? "Adjust the lead filters"
                    : "Create the first intake"
                }
                description={
                  opportunities.length > 0
                    ? "Try a broader search or switch between all leads and assigned leads."
                    : "Start here with Lead Intake while the customer and scope are still being qualified. The opportunity can then move into the shared customer, project, estimate, and billing chain."
                }
                actionHref={
                  buildLeadsHref({
                    q: query,
                    view,
                    followUp: followUpView,
                    compose: "1"
                  }) + "#lead-create"
                }
                actionLabel="Create your first intake"
              />
            </div>
          )}
        </section>
      </div>

      <WorkspaceComposerSheet
        id="lead-create"
        title="Quick create Lead Intake"
        description="Capture the minimum intake context here, create the canonical opportunity, and then qualify it in the Opportunity Workspace before you start an estimate."
        open={showComposer}
        openHref={buildLeadsHref({
          q: query,
          view,
          followUp: followUpView,
          compose: "1"
        })}
        closeHref={buildLeadsHref({ q: query, view, followUp: followUpView })}
        openLabel="Open Lead Intake quick create"
      >
        <OpportunityQuickCreateForm action={quickCreateOpportunityAction} />
      </WorkspaceComposerSheet>
    </ContractorWorkspacePage>
  );
}
