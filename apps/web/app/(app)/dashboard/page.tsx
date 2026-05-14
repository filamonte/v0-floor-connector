import { redirect } from "next/navigation";

import { ContractorDashboardSurface } from "@/components/dashboard/contractor-dashboard-surface";
import { listAppointments } from "@/lib/appointments/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateChangeOrderAction } from "@/lib/change-orders/actions";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import {
  listApprovedEstimatesForContracts,
  listContracts
} from "@/lib/contracts/data";
import { quickCreateCustomerAction } from "@/lib/customers/actions";
import { listCustomers } from "@/lib/customers/data";
import { quickCreateEstimateAction } from "@/lib/estimates/actions";
import { listEstimates } from "@/lib/estimates/data";
import { listFieldNotes } from "@/lib/field-notes/data";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import { listInvoices } from "@/lib/invoices/data";
import { quickCreateJobAction } from "@/lib/jobs/actions";
import { listJobs } from "@/lib/jobs/data";
import { listContractorNotifications } from "@/lib/notifications/data";
import { getBillingSetupState } from "@/lib/onboarding/billing-setup";
import { isOrganizationActivatedForProductionAction } from "@/lib/organizations/activation-guard";
import { quickCreateOpportunityAction } from "@/lib/opportunities/actions";
import { listOpportunities } from "@/lib/opportunities/data";
import { listLeadFollowUpQueue } from "@/lib/opportunities/follow-up-data";
import { labelLeadFollowUpBucket } from "@/lib/opportunities/follow-up-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { hasCompanyProfileFields } from "@/lib/organizations/setup-status";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getOperationalCueDashboard } from "@/lib/operational-cues/data";
import { applyCueStates } from "@/lib/cue-states/apply";
import { buildProjectCueIdentity } from "@/lib/cue-states/identity";
import { listWorkflowCueStatesForIdentities } from "@/lib/cue-states/data";
import { groupOperationalCuesBySubject } from "@/lib/operational-cues/derive";
import {
  buildMyWorkQueueModes,
  isMyWorkQueueMode,
  type MyWorkQueueMode
} from "@/lib/operational-cues/my-work-queues";
import type { OperationalCue } from "@/lib/operational-cues/types";
import { listPayments } from "@/lib/payments/data";
import { listPeople } from "@/lib/people/data";
import { listPunchlistItems } from "@/lib/punchlists/data";
import { listProgressBillingWorkspaces } from "@/lib/progress-billing/data";
import { mapProjectCuesToDashboardPreviewItems } from "@/lib/dashboard/project-cue-preview";
import { quickCreateProjectAction } from "@/lib/projects/actions";
import { buildProjectCues, selectHighestPriorityProjectCues } from "@/lib/projects/cues";
import { listProjects } from "@/lib/projects/data";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { filterUpcomingAssignedAppointments } from "@/lib/schedule/read-model";
import {
  completeWorkItemAction,
  dismissWorkItemAction
} from "@/lib/work-items/actions";
import { listDashboardWorkItems } from "@/lib/work-items/data";
import { selectDashboardWorkItemQueue } from "@/lib/work-items/read-model";

function formatCurrency(value: number | string, maximumFractionDigits = 0) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits
  });
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "No timestamp";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function isOverdueInvoice(dueDate: string | null, today: string) {
  return Boolean(dueDate && dueDate < today);
}

function addDaysDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildSearchText(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function formatCueThresholdLabel(label: string | null) {
  return label?.replace(/^Rule threshold:/, "Threshold:") ?? null;
}

function mapOperationalCueToDashboardItem(cue: OperationalCue) {
  const responsibilityMeta =
    cue.responsibility.resolutionStatus === "person_resolved" ||
    cue.responsibility.resolutionStatus === "user_resolved"
      ? [
          `Responsible: ${cue.responsibility.displayLabel}`,
          `Role: ${cue.responsibility.strategyLabel}`
        ]
      : [`Responsible: ${cue.responsibility.displayLabel}`];
  const sourceMeta = [
    ...responsibilityMeta,
    cue.sourceValue ? `${cue.sourceLabel}: ${cue.sourceValue}` : cue.sourceLabel,
    formatCueThresholdLabel(cue.thresholdLabel),
    cue.triggeredAtLabel
  ].filter(Boolean);
  const contextMeta = [cue.customerName, cue.projectName].filter(Boolean).join(" - ");

  return {
    id: `${cue.cueKey}:${cue.subjectId}`,
    title: cue.title,
    subtitle: cue.explanation,
    meta: [contextMeta || "Organization-wide cue", cue.reason].join(" - "),
    supportingMeta: sourceMeta.join(" - "),
    href: cue.actionHref,
    actionLabel: cue.actionLabel,
    badge: cue.urgency,
    contextHref: null,
    contextLabel: null,
    searchText: buildSearchText(
      cue.title,
      cue.message,
      cue.reason,
      cue.explanation,
      cue.sourceLabel,
      cue.sourceValue,
      cue.thresholdLabel,
      cue.triggeredAtLabel,
      cue.ownerStrategyLabel,
      cue.ownerResolutionStatus,
      cue.responsibility.displayLabel,
      cue.responsibility.resolutionStatus,
      cue.customerName,
      cue.projectName,
      cue.urgency,
      cue.cueKey
    )
  };
}

function buildMyWorkDashboardWidgets(cues: OperationalCue[]) {
  const groups = groupOperationalCuesBySubject(cues);

  return [
    {
      key: "my-estimates",
      eyebrow: "My Estimates",
      title: "Estimate follow-up",
      description:
        "Sent estimates that crossed the tenant cue threshold. These are derived from saved estimate records.",
      href: "/estimates",
      actionLabel: "Open estimates",
      emptyTitle: "No estimate cues need attention.",
      emptyDescription:
        "Sent estimates will appear here when they pass the configured follow-up threshold.",
      items: groups.estimates.slice(0, 5).map(mapOperationalCueToDashboardItem)
    },
    {
      key: "my-contracts",
      eyebrow: "My Contracts",
      title: "Signature follow-up",
      description:
        "Sent or viewed contracts that remain unsigned under the tenant cue rules.",
      href: "/contracts",
      actionLabel: "Open contracts",
      emptyTitle: "No contract cues need attention.",
      emptyDescription:
        "Unsigned sent or viewed contracts will appear here when follow-up is due.",
      items: groups.contracts.slice(0, 5).map(mapOperationalCueToDashboardItem)
    },
    {
      key: "my-invoices",
      eyebrow: "My Invoices",
      title: "Collections follow-up",
      description:
        "Overdue invoices and unpaid deposit invoices from the shared billing chain.",
      href: "/invoices",
      actionLabel: "Open invoices",
      emptyTitle: "No invoice cues need attention.",
      emptyDescription:
        "Overdue balances and unpaid deposits will appear here when configured thresholds are crossed.",
      items: groups.invoices.slice(0, 5).map(mapOperationalCueToDashboardItem)
    },
    {
      key: "my-jobs",
      eyebrow: "My Jobs",
      title: "Schedule and crew follow-up",
      description:
        "Ready unscheduled jobs and scheduled jobs missing crew from saved job records.",
      href: "/jobs",
      actionLabel: "Open jobs",
      emptyTitle: "No job cues need attention.",
      emptyDescription:
        "Ready unscheduled jobs and near-term scheduled jobs missing crew will appear here.",
      items: groups.jobs.slice(0, 5).map(mapOperationalCueToDashboardItem)
    }
  ];
}

type DashboardPageProps = {
  searchParams?: Promise<{
    fresh?: string;
    myWork?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const forceFreshOnboarding =
    process.env.NODE_ENV !== "production" && resolvedSearchParams.fresh === "true";
  const user = await requireAuthenticatedUser("/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext || !hasCompanyProfileFields(organizationContext.organization)) {
    redirect("/setup/company");
  }

  const [
    customers,
    opportunities,
    estimates,
    approvedEstimates,
    projects,
    contracts,
    jobs,
    appointments,
    leadFollowUpQueue,
    people,
    punchlistItems,
    invoices,
    payments,
    notifications,
    progressBillingWorkspaces,
    financialSettings,
    workflowSettings,
    billingSetupState,
    fieldNotes,
    operationalCueDashboard
  ] = await Promise.all([
    listCustomers(),
    listOpportunities(),
    listEstimates(),
    listApprovedEstimatesForContracts(),
    listProjects(),
    listContracts(),
    listJobs(),
    listAppointments(),
    listLeadFollowUpQueue({ upcomingDays: 7 }),
    listPeople(),
    listPunchlistItems(),
    listInvoices(),
    listPayments(),
    listContractorNotifications(),
    listProgressBillingWorkspaces(),
    getOrganizationFinancialSettings(organizationContext.organization.id),
    getOrganizationWorkflowSettings(organizationContext.organization.id),
    getBillingSetupState(organizationContext.organization.id),
    listFieldNotes(),
    getOperationalCueDashboard({
      organizationId: organizationContext.organization.id,
      currentUserId: user.id
    })
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = addDaysDateKey(today, 1);
  const activeProjects = projects.filter((project) => project.status !== "completed");
  const projectReadinessSnapshots = new Map(
    await Promise.all(
      activeProjects.map(async (project) => [
        project.id,
        await getProjectFinancialReadinessSnapshot({
          organizationId: project.organizationId,
          projectId: project.id
        })
      ] as const)
    )
  );
  const derivedProjectCues = activeProjects.flatMap((project) =>
      buildProjectCues({
        project,
        readinessSnapshot: projectReadinessSnapshots.get(project.id) ?? null,
        estimates: estimates.filter((estimate) => estimate.projectId === project.id),
        contracts: contracts.filter((contract) => contract.projectId === project.id),
        invoices: invoices.filter((invoice) => invoice.projectId === project.id),
        jobs: jobs.filter((job) => job.projectId === project.id),
        fieldNotes: fieldNotes.filter((fieldNote) => fieldNote.projectId === project.id)
      })
    );
  const projectCueStates = await listWorkflowCueStatesForIdentities({
    companyId: organizationContext.organization.id,
    currentUserId: user.id,
    identities: derivedProjectCues.map((cue) =>
      buildProjectCueIdentity(organizationContext.organization.id, cue)
    )
  });
  const projectCues = selectHighestPriorityProjectCues(
    applyCueStates({
      cues: derivedProjectCues,
      states: projectCueStates,
      currentUserId: user.id,
      now: new Date(),
      companyId: organizationContext.organization.id
    }).visibleCues,
    5
  );
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const overdueInvoices = openInvoices
    .filter((invoice) => isOverdueInvoice(invoice.dueDate, today))
    .sort((left, right) =>
      (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31")
    );
  const dueLeadFollowUps = leadFollowUpQueue.filter(
    (item) => item.bucket === "overdue" || item.bucket === "due_today"
  );
  const leadFollowUpsForDashboard = leadFollowUpQueue.slice(0, 5);
  const estimatesAwaitingAction = estimates
    .filter((estimate) => ["draft", "sent", "rejected"].includes(estimate.status))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
  const contractsAwaitingAction = contracts
    .filter((contract) => ["draft", "sent", "viewed"].includes(contract.status))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
  const projectsNeedingAttention = activeProjects.slice(0, 5);
  const jobsNeedingScheduling = jobs
    .filter((job) => job.dispatchStatus === "unscheduled")
    .slice(0, 5);
  const jobsTodayOrInProgress = jobs
    .filter(
      (job) => job.dispatchStatus === "in_progress" || job.scheduledDate === today
    )
    .sort((left, right) => {
      if (left.dispatchStatus === "in_progress" && right.dispatchStatus !== "in_progress") {
        return -1;
      }

      if (left.dispatchStatus !== "in_progress" && right.dispatchStatus === "in_progress") {
        return 1;
      }

      return (left.scheduledStartAt ?? left.updatedAt).localeCompare(
        right.scheduledStartAt ?? right.updatedAt
      );
    })
    .slice(0, 5);
  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const currentUserPerson =
    people.find((person) => person.membershipUserId === user.id && person.isActive) ??
    null;
  const myWorkQueueModes = buildMyWorkQueueModes({
    cues: operationalCueDashboard.cues,
    currentUserId: user.id,
    currentPersonId: currentUserPerson?.id ?? null,
    membershipRole: organizationContext.membership.role
  });
  const selectedMyWorkMode = isMyWorkQueueMode(resolvedSearchParams.myWork)
    ? resolvedSearchParams.myWork
    : myWorkQueueModes.selectedDefaultMode;
  const buildMyWorkModeHref = (mode: MyWorkQueueMode) => {
    const params = new URLSearchParams();

    if (forceFreshOnboarding) {
      params.set("fresh", "true");
    }

    params.set("myWork", mode);

    return `/dashboard?${params.toString()}`;
  };
  const companyWorkItems = await listDashboardWorkItems({ limit: 5 });
  const assignedWorkItems = currentUserPerson
    ? await listDashboardWorkItems({
        assignedPersonId: currentUserPerson.id,
        limit: 5
      })
    : [];
  const dashboardWorkItemQueue = selectDashboardWorkItemQueue({
    assignedPersonId: currentUserPerson?.id ?? null,
    assignedItems: assignedWorkItems,
    companyItems: companyWorkItems
  });
  const showingCompanyWorkItems = dashboardWorkItemQueue.mode === "company_fallback";
  const appointmentsToday = scheduledAppointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.startsAt);
      return appointmentDate.toISOString().slice(0, 10) === today;
    })
    .slice(0, 5);
  const upcomingAppointments = filterUpcomingAssignedAppointments({
    appointments: scheduledAppointments,
    nowIso: new Date().toISOString(),
    assignedPersonId: currentUserPerson?.id ?? null,
    limit: 5
  });
  const companyUpcomingAppointments = filterUpcomingAssignedAppointments({
    appointments: scheduledAppointments,
    nowIso: new Date().toISOString(),
    limit: 5
  });
  const dashboardAppointments =
    currentUserPerson && upcomingAppointments.length > 0
      ? upcomingAppointments
      : companyUpcomingAppointments;
  const appointmentFollowUpActions = appointments
    .filter((appointment) => appointment.status === "canceled" || appointment.status === "no_show")
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, Math.max(0, 5 - dashboardAppointments.length));
  const appointmentDashboardItems = [...dashboardAppointments, ...appointmentFollowUpActions];
  const showingCompanyAppointments =
    !currentUserPerson || upcomingAppointments.length === 0;
  const appointmentDashboardTitle = showingCompanyAppointments
    ? "Company upcoming appointments"
    : "My upcoming appointments";
  const appointmentDashboardDescription = showingCompanyAppointments
    ? currentUserPerson
      ? "No appointments are assigned to your linked people record right now, so this falls back to the company appointment queue."
      : "No active people record is linked to your user yet, so this shows the company appointment queue with assignee labels."
    : "Assigned lead, customer, and project appointment blocks stay visible from the home board.";
  const appointmentDashboardEyebrow = showingCompanyAppointments
    ? "Company schedule"
    : "My schedule";
  const appointmentDashboardEmptyTitle = showingCompanyAppointments
    ? "No upcoming company appointments are scheduled right now."
    : "No assigned appointments are scheduled right now.";
  const appointmentDashboardEmptyDescription = showingCompanyAppointments
    ? "Lead visits and follow-up appointments will surface here once they are scheduled."
    : "When appointments are assigned to your linked people record, they will surface here.";
  const openPunchlistCount = punchlistItems.filter(
    (item) => item.status === "open" || item.status === "in_progress"
  ).length;
  const progressBillingReadyCount = progressBillingWorkspaces.filter(
    (workspace) => workspace.status === "ready_to_bill"
  ).length;
  const onboardingSteps = [
    {
      key: "project",
      label: "Create your first project",
      description:
        "Everything starts from the project once customer and job context are real.",
      href: "/projects?compose=1#project-create",
      actionLabel: "Create project",
      complete: projects.length > 0
    },
    {
      key: "estimate",
      label: "Create your first estimate",
      description:
        "Estimates are created from projects and carry priced scope toward contracts.",
      href: "/estimates?compose=1#estimate-create",
      actionLabel: "Create estimate",
      complete: estimates.length > 0
    },
    {
      key: "contract",
      label: "Generate your first contract",
      description:
        "Contracts are generated from approved estimates on the same project chain.",
      href: "/contracts?compose=1",
      actionLabel: "Generate contract",
      complete: contracts.length > 0
    },
    {
      key: "invoice-or-job",
      label: "Optional: create an invoice or job",
      description:
        "Invoices and jobs stay connected to projects, contracts, payments, and execution.",
      href: jobs.length > 0 ? "/invoices?compose=1#invoice-create" : "/jobs?compose=1#job-create",
      actionLabel: jobs.length > 0 ? "Create invoice" : "Create job",
      complete: invoices.length > 0 || jobs.length > 0
    }
  ];
  const recentPayments = payments.filter((payment) => payment.status !== "void").slice(0, 5);
  const openReceivables = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );
  const attentionWidget =
    notifications.visibleItems.length > 0
      ? {
          key: "contractor-attention",
          eyebrow: "Action awareness",
          title: "High-signal attention",
          description:
            "The same shell-level awareness feed is surfaced here so schedule, collections, contracts, appointments, punchlists, and billing pressure are visible from the home board.",
          href: notifications.visibleItems[0]?.href ?? "/dashboard",
          actionLabel: "Open first item",
          emptyTitle: "No high-signal attention items are active right now.",
          emptyDescription:
            "As real contractor workflow pressure builds, it will surface here and in the shared header attention center.",
          items: notifications.visibleItems.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.description,
            meta: item.badge,
            href: item.href,
            actionLabel: "Open",
            badge: item.category.replaceAll("-", " "),
            contextHref: item.contextHref ?? null,
            contextLabel: item.contextLabel ?? null,
            searchText: [item.title, item.description, item.badge, item.category].join(" ")
          }))
        }
      : {
          key: "contractor-attention",
          eyebrow: "Action awareness",
          title: "High-signal attention",
          description:
            "The same shell-level awareness feed is surfaced here so schedule, collections, contracts, appointments, punchlists, and billing pressure are visible from the home board.",
          href: "/dashboard",
          actionLabel: "Stay on dashboard",
          emptyTitle: "No high-signal attention items are active right now.",
          emptyDescription:
            "As real contractor workflow pressure builds, it will surface here and in the shared header attention center.",
          items: []
        };
  const primaryAttentionItem = notifications.visibleItems[0] ?? null;
  const firstOverdueInvoice = overdueInvoices[0] ?? null;
  const firstOpenInvoice = openInvoices[0] ?? null;
  const firstEstimateAwaitingAction = estimatesAwaitingAction[0] ?? null;
  const firstJobNeedingScheduling = jobsNeedingScheduling[0] ?? null;
  const firstJobTodayOrInProgress = jobsTodayOrInProgress[0] ?? null;
  const isProductionActionLocked = organizationContext
    ? !isOrganizationActivatedForProductionAction({
        id: organizationContext.organization.id,
        tenantStatus: organizationContext.organization.tenantStatus,
        lifecycleState: organizationContext.organization.lifecycleState
      })
    : false;
  const hasSavedBillingMethod = Boolean(billingSetupState.stripePaymentMethodId);
  const shouldSuggestBillingSetup =
    !hasSavedBillingMethod &&
    (isProductionActionLocked ? billingSetupState.canCollectCardNow : true);

  return (
    <ContractorDashboardSurface
      header={{
        organizationName:
          organizationContext?.organization.displayName ?? "Organization setup pending",
        currentRole: organizationContext?.membership.role ?? "member",
        roleLabel: organizationContext?.membership.role ?? "member",
        activeProjectCount: activeProjects.length,
        openReceivablesLabel: formatCurrency(openReceivables)
      }}
      earlyAccess={{
        isLocked: isProductionActionLocked,
        statusLabel: isProductionActionLocked ? "Early access" : "Account active",
        href: "/setup/pending-activation",
        setupHref: shouldSuggestBillingSetup ? "/setup/billing" : undefined,
        setupCtaLabel: shouldSuggestBillingSetup
          ? isProductionActionLocked
            ? "Finish billing setup"
            : "Add billing method"
          : undefined,
        setupMessage: isProductionActionLocked
          ? shouldSuggestBillingSetup
            ? "Finish setup to unlock full access. You can keep creating internal records now, and payment collection will unlock after your account is active."
            : undefined
          : "Account active. Production external actions are available from the existing guarded workflows.",
        billingStatusLabel: hasSavedBillingMethod
          ? "Billing method saved"
          : "No billing method saved yet"
      }}
      priorityItems={[
        primaryAttentionItem
          ? {
              key: "attention",
              label: "Attention",
              title: primaryAttentionItem.title,
              detail: primaryAttentionItem.description,
              href: primaryAttentionItem.href,
              actionLabel: "Open first attention item",
              countLabel: String(notifications.visibleItems.length),
              status: "needs_action"
            }
          : {
              key: "attention",
              label: "Attention",
              title: "No high-signal attention items",
              detail: "The shared attention feed is clear right now.",
              href: "/dashboard",
              actionLabel: "Stay on dashboard",
              countLabel: "0",
              status: "complete"
            },
        firstOverdueInvoice
          ? {
              key: "collections",
              label: "Collections",
              title: `${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? "" : "s"}`,
              detail: `${firstOverdueInvoice.referenceNumber} is overdue and still has ${formatCurrency(firstOverdueInvoice.balanceDueAmount)} due.`,
              href: `/invoices/${firstOverdueInvoice.id}`,
              actionLabel: "Open overdue invoice",
              countLabel: String(overdueInvoices.length),
              status: "overdue"
            }
          : firstOpenInvoice
            ? {
                key: "collections",
                label: "Collections",
                title: `${openInvoices.length} open invoice${openInvoices.length === 1 ? "" : "s"}`,
                detail: `${firstOpenInvoice.referenceNumber} has ${formatCurrency(firstOpenInvoice.balanceDueAmount)} remaining.`,
                href: `/invoices/${firstOpenInvoice.id}`,
                actionLabel: "Open invoice",
                countLabel: String(openInvoices.length),
                status: "open"
              }
            : {
                key: "collections",
                label: "Collections",
                title: "No open receivables",
                detail: "Paid and void invoices are clear from the dashboard collection queue.",
                href: "/payments",
                actionLabel: "Open payments",
                countLabel: "$0",
                status: "paid"
              },
        firstEstimateAwaitingAction
          ? {
              key: "estimates",
              label: "Commercial",
              title: `${estimatesAwaitingAction.length} estimate${estimatesAwaitingAction.length === 1 ? "" : "s"} awaiting action`,
              detail: `${firstEstimateAwaitingAction.referenceNumber} is ${labelize(firstEstimateAwaitingAction.status)} for ${firstEstimateAwaitingAction.project?.name ?? "an active project"}.`,
              href: `/estimates/${firstEstimateAwaitingAction.id}`,
              actionLabel: "Open estimate",
              countLabel: String(estimatesAwaitingAction.length),
              status: firstEstimateAwaitingAction.status
            }
          : {
              key: "estimates",
              label: "Commercial",
              title: "No estimates need action",
              detail: "Draft, sent, and rejected estimate queues are clear right now.",
              href: "/estimates",
              actionLabel: "Open estimates",
              countLabel: "0",
              status: "complete"
            },
        firstJobNeedingScheduling
          ? {
              key: "execution",
              label: "Execution",
              title: `${jobsNeedingScheduling.length} job${jobsNeedingScheduling.length === 1 ? "" : "s"} need scheduling`,
              detail: `${firstJobNeedingScheduling.project?.name ?? "A job"} is ready for date and crew follow-through.`,
              href: `/jobs/${firstJobNeedingScheduling.id}`,
              actionLabel: "Open unscheduled job",
              countLabel: String(jobsNeedingScheduling.length),
              status: "needs_action"
            }
          : firstJobTodayOrInProgress
            ? {
                key: "execution",
                label: "Execution",
                title: `${jobsTodayOrInProgress.length} job${jobsTodayOrInProgress.length === 1 ? "" : "s"} today or live`,
                detail: `${firstJobTodayOrInProgress.project?.name ?? "A job"} is ${firstJobTodayOrInProgress.dispatchStatus === "in_progress" ? "in progress" : "scheduled today"}.`,
                href: `/jobs/${firstJobTodayOrInProgress.id}`,
                actionLabel: "Open job",
                countLabel: String(jobsTodayOrInProgress.length),
                status:
                  firstJobTodayOrInProgress.dispatchStatus === "in_progress"
                    ? "in_progress"
                    : "scheduled"
              }
            : {
                key: "execution",
                label: "Execution",
                title: "No urgent execution queue",
                detail: "Unscheduled and live job queues are clear from the dashboard.",
                href: "/schedule",
                actionLabel: "Open schedule",
                countLabel: "0",
                status: "complete"
              }
      ]}
      metrics={[
        {
          key: "leads-follow-up",
          label: "Lead follow-ups due",
          value: String(dueLeadFollowUps.length),
          detail:
            "Overdue and due-today opportunity follow-up from the internal queue.",
          href: "/leads?followUp=due"
        },
        {
          key: "estimates-awaiting-action",
          label: "Estimates awaiting action",
          value: String(estimatesAwaitingAction.length),
          detail:
            "Draft, sent, or rejected estimate work that still needs commercial attention.",
          href: "/estimates"
        },
        {
          key: "jobs-needing-schedule",
          label: "Jobs needing schedule",
          value: String(jobsNeedingScheduling.length),
          detail:
            "Execution records already exist, but planned dates still need to be assigned.",
          href: "/schedule?view=unscheduled"
        },
        {
          key: "appointments-today",
          label: "Appointments today",
          value: String(appointmentsToday.length),
          detail:
            "Site visits, estimate meetings, and follow-up blocks stay visible without becoming a second job scheduler.",
          href: "/appointments"
        },
        {
          key: "jobs-today",
          label: "Jobs today / live",
          value: String(jobsTodayOrInProgress.length),
          detail:
            "Today's scheduled work and active in-progress jobs stay visible from one surface.",
          href: "/schedule?view=today"
        }
      ]}
      attentionWidget={attentionWidget}
      projectCueWidget={{
        key: "project-cues",
        eyebrow: "Project guidance",
        title: "Suggested project actions",
        description:
          "Suggested actions from current project records only. Open the project cue panel or an existing workflow to review before creating anything.",
        href: "/projects",
        actionLabel: "Open projects",
        emptyTitle: "No project cues need attention right now.",
        emptyDescription:
          "When readiness, deposit, field, contract, or schedule context needs review, project cues will surface here.",
        items: mapProjectCuesToDashboardPreviewItems(projectCues)
      }}
      workItemsWidget={{
        key: "work-items",
        eyebrow: showingCompanyWorkItems ? "Company work" : "My work",
        title: showingCompanyWorkItems ? "Open work items" : "My work items",
        description: showingCompanyWorkItems
          ? currentUserPerson
            ? "No assigned work items are open for your linked people record right now, so this falls back to the company queue."
            : "No active people record is linked to your user yet, so this shows open company work items with assignee labels."
          : "Manual internal work items assigned to your linked people record.",
        href: "/dashboard",
        actionLabel: "Dashboard",
        emptyTitle: "No open work items yet.",
        emptyDescription:
          "Create manual work items from a lead workspace when a contractor-owned action needs an owner or due date.",
        items: dashboardWorkItemQueue.items.map((workItem) => ({
          id: workItem.id,
          workItemId: workItem.id,
          title: workItem.title,
          subtitle:
            workItem.customer?.name ??
            workItem.project?.name ??
            workItem.assignedPerson?.displayName ??
            "Internal contractor action",
          meta: `${labelize(workItem.kind)} - ${workItem.dueAt ? formatDateTime(workItem.dueAt) : "no due date"}${
            workItem.assignedPerson ? ` - ${workItem.assignedPerson.displayName}` : ""
          }`,
          href: workItem.linkPath ?? "/dashboard",
          actionLabel: "Open",
          badge: labelize(workItem.priority),
          contextHref: workItem.linkPath,
          contextLabel: workItem.linkPath ? "Open source" : null,
          searchText: buildSearchText(
            workItem.title,
            workItem.description,
            workItem.kind,
            workItem.priority,
            workItem.assignedPerson?.displayName,
            workItem.customer?.name,
            workItem.project?.name
          )
        }))
      }}
      workItemActions={{
        complete: completeWorkItemAction,
        dismiss: dismissWorkItemAction
      }}
      myWorkQueueModes={{
        defaultMode: myWorkQueueModes.selectedDefaultMode,
        selectedMode: selectedMyWorkMode,
        caveats: myWorkQueueModes.caveats,
        modes: [
          {
            mode: "company",
            label: "Company",
            href: buildMyWorkModeHref("company"),
            description: "All attention items",
            emptyTitle: "No company attention items right now.",
            emptyDescription:
              "Company remains the full organization safety net for derived My Work cues.",
            count: myWorkQueueModes.counts.company,
            widgets: buildMyWorkDashboardWidgets(
              myWorkQueueModes.queues.company.cues
            )
          },
          {
            mode: "mine",
            label: "Mine",
            href: buildMyWorkModeHref("mine"),
            description: "Items resolved to you",
            emptyTitle: "No attention items are currently resolved to you.",
            emptyDescription:
              "Mine is a convenience filter over responsibility metadata, not task assignment.",
            count: myWorkQueueModes.counts.mine,
            widgets: buildMyWorkDashboardWidgets(myWorkQueueModes.queues.mine.cues)
          },
          {
            mode: "unresolved",
            label: "Unresolved",
            href: buildMyWorkModeHref("unresolved"),
            description: "Needs responsible person",
            emptyTitle: "All current attention items have a responsible role/person.",
            emptyDescription:
              "Unresolved shows strategy-only, organization queue, and unavailable record-owner fallbacks.",
            count: myWorkQueueModes.counts.unresolved,
            widgets: buildMyWorkDashboardWidgets(
              myWorkQueueModes.queues.unresolved.cues
            )
          }
        ]
      }}
      commercialWidgets={[
        {
          key: "leads",
          eyebrow: "Commercial follow-up",
          title: "Lead follow-ups due",
          description:
            "Overdue, due-today, and near-term opportunity follow-up stays visible without creating a separate reminder system.",
          href: "/leads?followUp=due",
          actionLabel: "Open leads",
          emptyTitle: "No lead follow-ups are due right now.",
          emptyDescription:
            "Set the next follow-up date from lead detail and due items will surface here.",
          items: leadFollowUpsForDashboard.map((lead) => ({
            id: lead.opportunityId,
            title: lead.title || lead.contactName || "Untitled lead",
            subtitle:
              lead.customerName ??
              lead.companyName ??
              lead.contactName ??
              "Prospect not linked to a customer yet",
            meta: `${labelLeadFollowUpBucket(lead.bucket)} - ${formatDateTime(
              lead.nextFollowUpAt
            )}${
              lead.lastCommunicationAt
                ? ` - Last touch ${formatDateTime(lead.lastCommunicationAt)}`
                : ""
            }${lead.nextFollowUpNote ? ` - ${lead.nextFollowUpNote}` : ""}`,
            href: `/leads/${lead.opportunityId}`,
            actionLabel: "Open lead",
            badge: labelLeadFollowUpBucket(lead.bucket),
            contextHref: lead.projectId ? `/projects/${lead.projectId}` : null,
            contextLabel: lead.projectId ? "Open project" : null,
            bridgeHref: `/leads/${lead.opportunityId}?workItemCue=follow_up#work-items`,
            bridgeLabel: "Create work item",
            searchText: buildSearchText(
              lead.title,
              lead.contactName,
              lead.customerName,
              lead.companyName,
              lead.status
            )
          }))
        },
        {
          key: "estimates",
          eyebrow: "Proposal queue",
          title: "Estimates awaiting action",
          description:
            "Draft scope, send-estimate follow-up, and revision work stay visible so the commercial handoff keeps moving.",
          href: "/estimates",
          actionLabel: "Open estimates",
          emptyTitle: "No estimates need immediate action.",
          emptyDescription:
            "Next step after the customer and project are ready: create your first estimate from the existing quick-create path.",
          items: estimatesAwaitingAction.map((estimate) => ({
            id: estimate.id,
            title: estimate.referenceNumber,
            subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
            meta: `${labelize(estimate.status)} - updated ${formatDateTime(estimate.updatedAt)}`,
            href: `/estimates/${estimate.id}`,
            actionLabel:
              estimate.status === "draft" ? "Send estimate" : "Approve estimate",
            badge: labelize(estimate.status),
            trailing: formatCurrency(estimate.totalAmount),
            contextHref: estimate.project ? `/projects/${estimate.project.id}` : null,
            contextLabel: estimate.project ? "Open project" : null,
            searchText: buildSearchText(
              estimate.referenceNumber,
              estimate.customer?.name,
              estimate.project?.name,
              estimate.status
            )
          }))
        },
        {
          key: "contracts",
          eyebrow: "Signature queue",
          title: "Contracts awaiting send or signature",
          description:
            "Draft contracts, sent records, and viewed signature work stay tied to the same project and estimate handoff.",
          href: "/contracts",
          actionLabel: "Open contracts",
          emptyTitle: "No contracts are waiting on send or signature.",
          emptyDescription:
            "Drafts, sent contracts, and viewed signature records will appear here when they need the next commercial handoff.",
          items: contractsAwaitingAction.map((contract) => ({
            id: contract.id,
            title: contract.title,
            subtitle: `${contract.customer?.name ?? "Unknown customer"} - ${contract.project?.name ?? "Unknown project"}`,
            meta: `${labelize(contract.status)} - project readiness still depends on this commercial step`,
            href: `/contracts/${contract.id}`,
            actionLabel:
              contract.status === "draft" ? "Send contract" : "Open contract",
            badge: labelize(contract.status),
            contextHref: contract.project ? `/projects/${contract.project.id}` : null,
            contextLabel: contract.project ? "Open project" : null,
            searchText: buildSearchText(
              contract.title,
              contract.customer?.name,
              contract.project?.name,
              contract.estimate?.referenceNumber,
              contract.status
            )
          }))
        }
      ]}
      operationsWidgets={[
        {
          key: "projects",
          eyebrow: "Project continuity",
          title: "Projects needing attention",
          description:
            "Projects stay as the operational root, with the dashboard surfacing where continuity or next-step follow-through still matters.",
          href: "/projects",
          actionLabel: "Open projects",
          emptyTitle: "No active projects need attention right now.",
          emptyDescription:
            "Create your first project to anchor estimates, contracts, jobs, invoices, and payments to one operational hub.",
          items: projectsNeedingAttention.map((project) => ({
            id: project.id,
            title: project.name,
            subtitle: project.customer?.name ?? "Unknown customer",
            meta: `${labelize(project.status)} - open the project workspace for estimates, contracts, jobs, invoices, and continuity`,
            href: `/projects/${project.id}`,
            actionLabel: "Open project",
            badge: labelize(project.status),
            searchText: buildSearchText(
              project.name,
              project.customer?.name,
              project.customer?.companyName,
              project.status
            )
          }))
        },
        {
          key: "jobs-needing-schedule",
          eyebrow: "Scheduling pressure",
          title: "Jobs needing scheduling",
          description:
            "These jobs already exist on the project chain, but the schedule and crew handoff still need to happen.",
          href: "/schedule?view=unscheduled",
          actionLabel: "Open schedule",
          emptyTitle: "No jobs are waiting for scheduling.",
          emptyDescription:
            "As unscheduled jobs enter the execution queue, they will surface here for operational follow-through.",
          items: jobsNeedingScheduling.map((job) => ({
            id: job.id,
            title: job.project?.name ?? "Untitled job",
            subtitle: `${job.customer?.name ?? "Unknown customer"} - ${job.estimate?.referenceNumber ?? "Created from project chain"}`,
            meta: "Unscheduled - set the work date, then assign crew from the same job record",
            href: `/jobs/${job.id}`,
            actionLabel: "Open job",
            badge: "Needs schedule",
            contextHref: job.project ? `/projects/${job.project.id}` : null,
            contextLabel: job.project ? "Open project" : null,
            searchText: buildSearchText(
              job.project?.name,
              job.customer?.name,
              job.estimate?.referenceNumber,
              job.dispatchStatus
            )
          }))
        },
        {
          key: "jobs-today",
          eyebrow: "Execution today",
          title: "Jobs today / in progress",
          description:
            "Today's work stays visible from one home surface without turning the dashboard into a separate dispatch system.",
          href: "/schedule?view=today",
          actionLabel: "Open today",
          emptyTitle: "No jobs are scheduled for today right now.",
          emptyDescription:
            "Once near-term work is scheduled or crews are in progress, it will surface here for day-of follow-through.",
          items: jobsTodayOrInProgress.map((job) => ({
            id: job.id,
            title: job.project?.name ?? "Untitled job",
            subtitle: `${job.customer?.name ?? "Unknown customer"} - ${job.estimate?.referenceNumber ?? "Created from project chain"}`,
            meta: `${
              job.dispatchStatus === "in_progress"
                ? "in progress"
                : `scheduled ${formatShortDate(job.scheduledDate)}`
            } - crew and schedule stay on the same job record`,
            href: `/jobs/${job.id}`,
            actionLabel:
              job.dispatchStatus === "in_progress"
                ? "Open live job"
                : "Open scheduled job",
            badge:
              job.dispatchStatus === "in_progress"
                ? "In progress"
                : job.scheduledDate === today
                  ? "Today"
                  : "Scheduled",
            contextHref: job.project ? `/projects/${job.project.id}` : null,
            contextLabel: job.project ? "Open project" : null,
            searchText: buildSearchText(
              job.project?.name,
              job.customer?.name,
              job.estimate?.referenceNumber,
              job.dispatchStatus,
              job.scheduledDate
            )
          }))
        },
        {
          key: "appointments",
          eyebrow: appointmentDashboardEyebrow,
          title: appointmentDashboardTitle,
          description: appointmentDashboardDescription,
          href: "/schedule?item=appointments",
          actionLabel: "Open appointments",
          emptyTitle: appointmentDashboardEmptyTitle,
          emptyDescription: appointmentDashboardEmptyDescription,
          items: appointmentDashboardItems.map((appointment) => {
            const appointmentDateKey = new Date(appointment.startsAt)
              .toISOString()
              .slice(0, 10);
            const needsFollowUp =
              appointment.status === "canceled" || appointment.status === "no_show";
            const timingBadge =
              appointmentDateKey === today
                ? "Today"
                : appointmentDateKey === tomorrow
                  ? "Tomorrow"
                  : appointment.customerVisible
                    ? "Customer-visible"
                    : labelize(appointment.status);

            return {
            id: appointment.id,
            title: appointment.title,
            subtitle:
              appointment.customer?.name ??
              appointment.opportunity?.title ??
              "Lead appointment",
            meta: `${formatDateTime(appointment.startsAt)} - ${
              appointment.assignedPerson?.displayName ?? "Unassigned"
            }${
              needsFollowUp
                ? ` - ${labelize(appointment.status)} appointment may need follow-up`
                : ""
            }`,
            href: `/appointments/${appointment.id}`,
            actionLabel: "Open appointment",
            badge: needsFollowUp ? "Needs follow-up" : timingBadge,
            contextHref: appointment.projectId
              ? `/projects/${appointment.projectId}`
              : appointment.opportunityId
                ? `/leads/${appointment.opportunityId}`
                : appointment.customerId
                  ? `/customers/${appointment.customerId}`
                  : null,
            contextLabel: appointment.projectId
              ? "Open project"
              : appointment.opportunityId
                ? "Open lead"
                : appointment.customerId
                  ? "Open customer"
                  : null,
            bridgeHref: needsFollowUp
              ? `/appointments/${appointment.id}?workItemCue=appointment_follow_up#work-items`
              : appointment.status === "scheduled"
                ? `/appointments/${appointment.id}?workItemCue=confirmation_prep#work-items`
                : null,
            bridgeLabel: needsFollowUp
              ? "Create follow-up item"
              : appointment.status === "scheduled"
                ? "Create prep item"
                : null,
            searchText: buildSearchText(
              appointment.title,
              appointment.customer?.name,
              appointment.opportunity?.title,
              appointment.assignedPerson?.displayName,
              appointment.location,
              appointment.status
            )
          };
          })
        }
      ]}
      financeWidgets={[
        {
          key: "unpaid-invoices",
          eyebrow: "Collections watch",
          title: "Unpaid / overdue invoices",
          description:
            "Keep collection pressure visible on the dashboard, but continue the real billing work in the invoice workspace and payments manager.",
          href: "/payments",
          actionLabel: "Open payments",
          emptyTitle: "No unpaid or overdue invoices need attention right now.",
          emptyDescription:
            "Invoices will appear after estimate approval, contract readiness, and job or billing context move forward on the same project chain.",
          items: (overdueInvoices.length > 0 ? overdueInvoices : openInvoices.slice(0, 5)).map(
            (invoice) => ({
              id: invoice.id,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: `${
                isOverdueInvoice(invoice.dueDate, today)
                  ? "overdue"
                  : labelize(invoice.status)
              } - due ${formatShortDate(invoice.dueDate)}`,
              href: `/invoices/${invoice.id}`,
              actionLabel: "Open invoice",
              badge: isOverdueInvoice(invoice.dueDate, today) ? "Overdue" : "Open",
              trailing: formatCurrency(invoice.balanceDueAmount),
              contextHref: invoice.project ? `/projects/${invoice.project.id}` : null,
              contextLabel: invoice.project ? "Open project" : null,
              searchText: buildSearchText(
                invoice.referenceNumber,
                invoice.customer?.name,
                invoice.project?.name,
                invoice.status,
                invoice.dueDate
              )
            })
          )
        },
        {
          key: "recent-payments",
          eyebrow: "Cash movement",
          title: "Recent payment activity",
          description:
            "Recent payment rows keep cash movement visible without pulling finance out of the same invoice and project chain.",
          href: "/payments",
          actionLabel: "Open payments",
          emptyTitle: "No recent payment activity has posted yet.",
          emptyDescription:
            "As recorded and pending payments move through the payment chain, they will surface here.",
          items: recentPayments.map((payment) => ({
            id: payment.id,
            title: payment.invoice?.referenceNumber ?? "Payment activity",
            subtitle: `${payment.customer?.name ?? "Unknown customer"} - ${payment.project?.name ?? "Unknown project"}`,
            meta: `${labelize(payment.status)} - ${formatDateTime(payment.createdAt)}`,
            href: `/invoices/${payment.invoiceId}`,
            actionLabel: "Open invoice",
            badge:
              payment.paymentSource === "customer_portal"
                ? "Portal"
                : labelize(payment.paymentSource),
            trailing: formatCurrency(payment.amount),
            contextHref: payment.project ? `/projects/${payment.project.id}` : null,
            contextLabel: payment.project ? "Open project" : null,
            searchText: buildSearchText(
              payment.invoice?.referenceNumber,
              payment.customer?.name,
              payment.project?.name,
              payment.status,
              payment.paymentMethod,
              payment.paymentSource
            )
          }))
        }
      ]}
      onboardingSteps={onboardingSteps}
      startHereForceVisible={forceFreshOnboarding || projects.length === 0}
      shortcuts={[
        {
          key: "cost-items-database",
          label: "Cost items database",
          description:
            "Open the catalog, systems, and optional inventory workspace that feeds estimates without changing pricing logic.",
          href: "/cost-items-database",
          metric: "Module"
        },
        {
          key: "appointments",
          label: "Appointments",
          description:
            "Run commercial and customer-facing visits from the same lead, customer, and project chain.",
          href: "/appointments",
          metric: `${scheduledAppointments.length} scheduled`
        },
        {
          key: "schedule",
          label: "Schedule manager",
          description:
            "Cross-project schedule review, crew visibility, and near-term board scanning.",
          href: "/schedule",
          metric: `${jobsNeedingScheduling.length} unscheduled`
        },
        {
          key: "payments",
          label: "Payments manager",
          description:
            "Recorded, pending, failed, and open collection activity on the same billing chain.",
          href: "/payments",
          metric: formatCurrency(openReceivables)
        },
        {
          key: "projects",
          label: "Projects",
          description:
            "Open the operational root for estimate approval, contract handoff, billing readiness, and execution continuity.",
          href: "/projects",
          metric: `${activeProjects.length} active`
        },
        {
          key: "estimates",
          label: "Estimates",
          description:
            "Review estimate pipeline, send estimate follow-up, and approved work ready for contract handoff.",
          href: "/estimates",
          metric: `${estimates.length} total`
        },
        {
          key: "punchlists",
          label: "Punchlists",
          description:
            "Review project and job closeout items on the same execution chain.",
          href: "/punchlists",
          metric: `${openPunchlistCount} active`
        },
        {
          key: "progress-billing",
          label: "Progress billing",
          description:
            "Open progress billing from approved scope and turn billable progress into invoices.",
          href: "/progress-billing",
          metric: `${progressBillingReadyCount} ready`
        },
        {
          key: "customers",
          label: "Customers",
          description:
            "Open the customer account records that anchor projects and billing defaults.",
          href: "/customers",
          metric: `${customers.length} records`
        }
      ]}
      placeholders={[
        {
          key: "advanced-scheduling",
          title: "Advanced dispatch controls",
          description:
            "The shared schedule workspace is live, but drag-and-drop rescheduling, deeper crew-calendar coordination, and fuller dispatch controls are still missing.",
          priority: "High"
        },
        {
          key: "time-clock-system",
          title: "Workforce approvals and management",
          description:
            "The contractor-side time home is live on punch events and time cards, while approvals, payroll-adjacent review, and broader workforce management remain later depth.",
          priority: "High"
        }
      ]}
      quickCreate={{
        defaultRetainagePercentage:
          financialSettings?.defaultRetainagePercentage ?? "0.00",
        customerOptions: customers,
        opportunityOptions: opportunities.map((opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          contactName:
            opportunity.primaryContact?.displayName ?? opportunity.prospectName,
          customerName: opportunity.customer?.name ?? null,
          jobType: opportunity.jobType,
          siteName: opportunity.siteName,
          status: opportunity.status
        })),
        projectOptions: projects.map((project) => ({
          id: project.id,
          name: project.name,
          customerName: project.customer?.name ?? null
        })),
        approvedEstimateOptions: approvedEstimates.map((estimate) => ({
          id: estimate.id,
          referenceNumber: estimate.referenceNumber,
          projectName: estimate.project?.name ?? null
        })),
        contractOptions: contracts.map((contract) => ({
          id: contract.id,
          projectId: contract.projectId,
          title: contract.title,
          status: contract.status
        })),
        invoiceOptions: invoices.map((invoice) => ({
          id: invoice.id,
          projectId: invoice.projectId,
          referenceNumber: invoice.referenceNumber,
          status: invoice.status
        })),
        actions: {
          lead: quickCreateOpportunityAction,
          customer: quickCreateCustomerAction,
          project: quickCreateProjectAction,
          estimate: quickCreateEstimateAction,
          contract: quickCreateContractFromEstimateAction,
          job: quickCreateJobAction,
          invoice: quickCreateInvoiceAction,
          changeOrder: quickCreateChangeOrderAction
        },
        preferredContractTemplateId:
          workflowSettings?.approvedEstimateContractTemplateId ?? "",
        requireContractInternalApproval:
          workflowSettings?.requireContractInternalApproval ?? false
      }}
    />
  );
}

