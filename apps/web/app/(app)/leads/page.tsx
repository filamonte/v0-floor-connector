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
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "upcoming":
      return "border-[var(--border-medium)] bg-[var(--highlight)] text-[var(--graphite)]";
    case "no_follow_up":
      return "border-[#d9cdc2] bg-[#fbf7f2] text-[#594839]";
  }
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

  return (
    <ContractorWorkspacePage
      eyebrow="Sales"
      title={`Leads & Opportunities for ${organizationContext.organization.displayName}`}
      description="Run Lead Intake and active Sales Opportunity follow-up from one board, while preserving the existing /leads route and canonical opportunities records."
      summary={
        <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">
              All opportunities
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#221a14]">
              {opportunities.length}
            </p>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">
              My opportunities
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#221a14]">
              {myOpportunities.length}
            </p>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">
              New intake
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#221a14]">
              {newIntake.length}
            </p>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">
              Proposal sent
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#221a14]">
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
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9cdc2] bg-white px-4 py-2.5 text-sm text-[#221a14] outline-none transition placeholder:text-[#9a8b80] focus:border-[#c59a6b]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9cdc2] bg-white px-4 py-2.5 text-sm font-medium text-[#594839] transition hover:border-[#ef7d32] hover:bg-[#fbf7f2]"
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
                    ? "bg-[#171717] text-white"
                    : "border border-[#d9cdc2] bg-white text-[#594839] hover:bg-[#fbf7f2]"
                ].join(" ")}
              >
                <span>{item.label}</span>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-[#f2e7dc] text-[#8f5b32]"
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
            className="inline-flex items-center rounded-[3px] border border-[#ef7d32] bg-[#ef7d32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#de6c22]"
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

        <section className="order-2 grid gap-3 xl:auto-rows-fr xl:grid-cols-2">
          <ManagerDashboardCard
            eyebrow="Contact now"
            title="New intake to contact"
            description="Fresh inquiries that still need the first outreach touch before they become qualified sales opportunities."
            actionHref={buildLeadsHref({
              q: query,
              view,
              followUp: followUpView
            })}
            actionLabel="Open new leads"
            items={newIntake.slice(0, 5).map((opportunity) => ({
              href: `/leads/${opportunity.id}`,
              title: opportunity.title,
              subtitle:
                opportunity.primaryContact?.displayName ??
                opportunity.prospectName,
              meta: opportunity.source
                ? `Source: ${opportunity.source}`
                : (opportunity.jobType ?? null),
              trailing: opportunity.siteName ?? "Site pending"
            }))}
            emptyTitle="No new intake needs first contact."
            emptyDescription="New Lead Intake will surface here as soon as an opportunity is created."
          />

          <ManagerDashboardCard
            eyebrow="Next tasks"
            title="Immediate sales follow-up"
            description="Real scheduled sales work from opportunity-linked appointments and assessments."
            actionHref={buildLeadsHref({ q: query, view, followUp: "due" })}
            actionLabel="Review tasks"
            items={nextTasks.slice(0, 5).map((activity) => ({
              href: `/leads/${activity.opportunityId}`,
              title: activity.title,
              subtitle: activity.assignedLabel,
              meta: `${activity.label} - ${formatDateLabel(activity.startsAt)}`,
              trailing: "Scheduled"
            }))}
            emptyTitle="No upcoming lead tasks are scheduled."
            emptyDescription="Scheduled follow-up and assessment work will show here once it is on the shared calendar."
          />

          <ManagerDashboardCard
            eyebrow="Upcoming"
            title="Upcoming tasks and assessments"
            description="Keep the next round of sales follow-up visible without inventing a separate task engine."
            actionHref={buildLeadsHref({
              q: query,
              view,
              followUp: followUpView
            })}
            actionLabel="Open sales board"
            items={nextTasks.slice(5, 10).map((activity) => ({
              href: `/leads/${activity.opportunityId}`,
              title: activity.title,
              subtitle: activity.assignedLabel,
              meta: `${activity.label} - ${formatDateLabel(activity.startsAt)}`,
              trailing: "Upcoming"
            }))}
            emptyTitle="No later lead tasks are scheduled."
            emptyDescription="When more scheduled lead work is on the calendar, it will appear here."
          />

          <section className="border border-[#d9cdc2] bg-white">
            <div className="border-b border-[#e8ded5] px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                Funnel
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#221a14]">
                Opportunity stage funnel
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#6f6256]">
                Real opportunity stages only, so the sales view stays honest to
                the current workflow.
              </p>
            </div>
            <div className="space-y-2 px-4 py-3">
              {stageFunnel.map((stage, index) => (
                <div key={stage.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-[#221a14]">
                      {stage.label}
                    </span>
                    <span className="text-[#8f7f72]">{stage.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#f2e7dc]">
                    <div
                      className="h-full rounded-full bg-[#171717]"
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
        </section>

        <section className="order-1 overflow-hidden border border-[#d9cdc2] bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-[#e8ded5] px-4 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                Opportunity records
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#221a14]">
                {view === "my" ? "Assigned opportunities" : "All opportunities"}
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              {visibleOpportunities.length} visible
            </p>
          </div>

          {visibleOpportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f7f3ef] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
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
                      <tr key={opportunity.id} className="hover:bg-[#fbf7f2]">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/leads/${opportunity.id}`}
                            className="font-semibold text-[#221a14] transition hover:text-[#a4581a]"
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
                          <span className="inline-flex rounded-[3px] border border-[#d9cdc2] bg-[#fbf7f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#594839]">
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
                              className="inline-flex items-center rounded-[4px] border border-[#d9cdc2] bg-white px-3 py-2 text-sm font-medium text-[#594839] transition hover:border-[#ef7d32] hover:bg-[#fbf7f2] hover:text-[#221a14]"
                            >
                              {actionLabel}
                            </Link>
                            {followUpItem ? (
                              <Link
                                href={`/leads/${opportunity.id}?workItemCue=follow_up#work-items`}
                                className="text-xs font-medium text-[#a4581a] transition hover:text-[#221a14]"
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
