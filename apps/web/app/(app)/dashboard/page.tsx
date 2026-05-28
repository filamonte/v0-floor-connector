import { redirect } from "next/navigation";

import { ContractorDashboardSurface } from "@/components/dashboard/contractor-dashboard-surface";
import type { OperationalGuidanceBucket } from "@/components/operational-guidance-section";
import { UniversalCaptureWorkItemForm } from "@/components/work-items/universal-capture-work-item-form";
import {
  deriveAiOperationalDashboardDigest,
  type AiOperationalDigestPriority,
  type AiOperationalDigestSignal
} from "@/lib/ai-operational-copilot/dashboard-digest";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listDashboardProjectCueFieldNotes } from "@/lib/field-notes/data";
import { listContractorNotificationsForContext } from "@/lib/notifications/data";
import { getBillingSetupState } from "@/lib/onboarding/billing-setup";
import { isOrganizationActivatedForProductionAction } from "@/lib/organizations/activation-guard";
import { listLeadFollowUpQueue } from "@/lib/opportunities/follow-up-data";
import { labelLeadFollowUpBucket } from "@/lib/opportunities/follow-up-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { hasCompanyProfileFields } from "@/lib/organizations/setup-status";
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
import { listDashboardRecentPayments } from "@/lib/payments/data";
import { listPeople } from "@/lib/people/data";
import { countOpenPunchlistItemsForDashboard } from "@/lib/punchlists/data";
import {
  getDashboardOperationalCockpitReadModel,
  getDashboardOverviewReadModel
} from "@/lib/dashboard/operational-cockpit-read-model";
import { getDashboardProgressBillingSummaryReadModel } from "@/lib/dashboard/progress-billing-summary-read-model";
import { getDashboardProjectCueInputReadModel } from "@/lib/dashboard/project-cue-input-read-model";
import { mapProjectCuesToDashboardPreviewItems } from "@/lib/dashboard/project-cue-preview";
import {
  buildProjectCues,
  selectHighestPriorityProjectCues
} from "@/lib/projects/cues";
import { getDashboardProjectFinancialReadinessSummaries } from "@/lib/projects/readiness";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  normalizeWorkflowGuidancePreferences,
  shouldShowAiDashboardDigest
} from "@/lib/workflow-guidance/preferences";
import {
  createWorkItemAction,
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

function groupByProjectId<T extends { projectId?: string | null }>(items: T[]) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    if (!item.projectId) {
      continue;
    }

    const existing = grouped.get(item.projectId);

    if (existing) {
      existing.push(item);
    } else {
      grouped.set(item.projectId, [item]);
    }
  }

  return grouped;
}

function mapProjectCuePriority(
  priority: "critical" | "high" | "medium"
): AiOperationalDigestPriority {
  return priority === "medium" ? "normal" : priority;
}

function inferDigestCategoryFromProjectCue(
  cue: ReturnType<typeof buildProjectCues>[number]
): AiOperationalDigestSignal["category"] {
  if (cue.id.includes("deposit") || /invoice|payment/i.test(cue.title)) {
    return "financial_follow_up";
  }

  if (/contract|signature/i.test(cue.title)) {
    return "signature_follow_up";
  }

  if (/schedule|job creation|ready/i.test(cue.title)) {
    return "ready_to_move";
  }

  if (/field|blocker|daily log/i.test(cue.title)) {
    return "field_execution_review";
  }

  return "needs_attention";
}

function inferDigestDraftActionType(
  category: AiOperationalDigestSignal["category"]
): AiOperationalDigestSignal["draftActionType"] {
  switch (category) {
    case "financial_follow_up":
      return "deposit_payment_reminder";
    case "signature_follow_up":
      return "contract_signature_reminder";
    case "ready_to_move":
      return "scheduling_readiness_coordination";
    case "field_execution_review":
      return "blocker_escalation_summary";
    case "needs_attention":
    case "suggested_draft_action":
      return undefined;
  }
}

function inferDigestActionKind(
  category: AiOperationalDigestSignal["category"]
): AiOperationalDigestSignal["actionKind"] {
  switch (category) {
    case "financial_follow_up":
      return "payment";
    case "signature_follow_up":
      return "signature";
    case "ready_to_move":
      return "schedule";
    case "field_execution_review":
      return "field";
    case "needs_attention":
    case "suggested_draft_action":
      return "review";
  }
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
    cue.sourceValue
      ? `${cue.sourceLabel}: ${cue.sourceValue}`
      : cue.sourceLabel,
    formatCueThresholdLabel(cue.thresholdLabel),
    cue.triggeredAtLabel
  ].filter(Boolean);
  const contextMeta = [cue.customerName, cue.projectName]
    .filter(Boolean)
    .join(" - ");

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
        "Sent estimates that crossed the company suggestion threshold. These are derived from saved estimate records.",
      href: "/estimates",
      actionLabel: "Open estimates",
      emptyTitle: "No estimate Next Move suggestions need attention.",
      emptyDescription:
        "Sent estimates will appear here when they pass the configured follow-up threshold.",
      items: groups.estimates.slice(0, 5).map(mapOperationalCueToDashboardItem)
    },
    {
      key: "my-contracts",
      eyebrow: "My Contracts",
      title: "Signature follow-up",
      description:
        "Sent or viewed contracts that remain unsigned under the company suggestion rules.",
      href: "/contracts",
      actionLabel: "Open contracts",
      emptyTitle: "No contract Next Move suggestions need attention.",
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
      emptyTitle: "No invoice Next Move suggestions need attention.",
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
      emptyTitle: "No job Next Move suggestions need attention.",
      emptyDescription:
        "Ready unscheduled jobs and near-term scheduled jobs missing crew will appear here.",
      items: groups.jobs.slice(0, 5).map(mapOperationalCueToDashboardItem)
    }
  ];
}

type DashboardPageProps = {
  searchParams?: Promise<{
    capture?: string;
    fresh?: string;
    myWork?: string;
  }>;
};

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const forceFreshOnboarding =
    process.env.NODE_ENV !== "production" &&
    resolvedSearchParams.fresh === "true";
  const user = await requireAuthenticatedUser("/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (
    !organizationContext ||
    !hasCompanyProfileFields(organizationContext.organization)
  ) {
    redirect("/setup/company");
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = addDaysDateKey(today, 1);
  const nowIso = new Date().toISOString();
  const [
    leadFollowUpQueue,
    openPunchlistCount,
    recentPayments,
    notifications,
    progressBillingSummaryReadModel,
    billingSetupState,
    fieldNotes,
    operationalCueDashboard,
    operationalCockpitReadModel,
    dashboardOverviewReadModel,
    dashboardProjectCueInputReadModel,
    people,
    workflowSettings
  ] = await Promise.all([
    listLeadFollowUpQueue({ upcomingDays: 7 }),
    countOpenPunchlistItemsForDashboard(),
    listDashboardRecentPayments(5),
    listContractorNotificationsForContext(
      user.id,
      organizationContext.organization.id
    ),
    getDashboardProgressBillingSummaryReadModel({
      organizationId: organizationContext.organization.id
    }),
    getBillingSetupState(organizationContext.organization.id),
    listDashboardProjectCueFieldNotes(),
    getOperationalCueDashboard({
      organizationId: organizationContext.organization.id,
      currentUserId: user.id
    }),
    getDashboardOperationalCockpitReadModel({
      organizationId: organizationContext.organization.id,
      today
    }),
    getDashboardOverviewReadModel({
      organizationId: organizationContext.organization.id,
      userId: user.id,
      today,
      tomorrow,
      nowIso
    }),
    getDashboardProjectCueInputReadModel({
      organizationId: organizationContext.organization.id,
      today
    }),
    listPeople(),
    getOrganizationWorkflowSettings(organizationContext.organization.id)
  ]);
  const guidancePreferences = normalizeWorkflowGuidancePreferences(
    workflowSettings.workflowGuidancePreferences
  );

  const activeProjects = dashboardProjectCueInputReadModel.activeProjects;
  const projectReadinessSnapshots =
    await getDashboardProjectFinancialReadinessSummaries({
      organizationId: organizationContext.organization.id,
      projectIds: activeProjects.map((project) => project.id)
    });
  const estimatesByProjectId = groupByProjectId(
    dashboardProjectCueInputReadModel.estimatesForProjectCues
  );
  const contractsByProjectId = groupByProjectId(
    dashboardProjectCueInputReadModel.contractsForProjectCues
  );
  const invoicesByProjectId = groupByProjectId(
    dashboardProjectCueInputReadModel.invoicesForProjectCues
  );
  const jobsByProjectId = groupByProjectId(
    dashboardProjectCueInputReadModel.jobsForProjectCues
  );
  const fieldNotesByProjectId = groupByProjectId(fieldNotes);
  const derivedProjectCues = activeProjects.flatMap((project) =>
    buildProjectCues({
      project,
      readinessSnapshot: projectReadinessSnapshots.get(project.id) ?? null,
      estimates: estimatesByProjectId.get(project.id) ?? [],
      contracts: contractsByProjectId.get(project.id) ?? [],
      invoices: invoicesByProjectId.get(project.id) ?? [],
      jobs: jobsByProjectId.get(project.id) ?? [],
      fieldNotes: fieldNotesByProjectId.get(project.id) ?? []
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
  const openInvoices = dashboardProjectCueInputReadModel.openInvoicePreviews;
  const overdueInvoices =
    dashboardProjectCueInputReadModel.overdueInvoicePreviews;
  const openInvoiceCount = dashboardProjectCueInputReadModel.openInvoiceCount;
  const overdueInvoiceCount =
    dashboardProjectCueInputReadModel.overdueInvoiceCount;
  const dueLeadFollowUps = leadFollowUpQueue.filter(
    (item) => item.bucket === "overdue" || item.bucket === "due_today"
  );
  const leadFollowUpsForDashboard = leadFollowUpQueue.slice(0, 5);
  const estimatesAwaitingAction =
    dashboardProjectCueInputReadModel.estimatesAwaitingAction;
  const contractsAwaitingAction =
    dashboardProjectCueInputReadModel.contractsAwaitingAction;
  const projectsNeedingAttention =
    dashboardProjectCueInputReadModel.projectsNeedingAttention;
  const readyProjectsWithoutJobs = activeProjects
    .filter((project) => {
      const readinessSnapshot = projectReadinessSnapshots.get(project.id);
      const projectJobs = jobsByProjectId.get(project.id) ?? [];

      return readinessSnapshot?.isReadyToSchedule && projectJobs.length === 0;
    })
    .slice(0, 5);
  const jobsNeedingScheduling =
    dashboardProjectCueInputReadModel.jobsNeedingScheduling;
  const jobsTodayOrInProgress =
    dashboardProjectCueInputReadModel.jobsTodayOrInProgress;
  const currentUserPerson = dashboardOverviewReadModel.currentUserPerson;
  const showUniversalCapture = resolvedSearchParams.capture === "1";
  const assignablePeople = people
    .filter((person) => person.isActive && person.isAssignable)
    .map((person) => ({
      id: person.id,
      displayName: person.displayName
    }));
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
  const showingCompanyWorkItems =
    dashboardWorkItemQueue.mode === "company_fallback";
  const upcomingAppointments =
    dashboardOverviewReadModel.assignedUpcomingAppointments;
  const companyUpcomingAppointments =
    dashboardOverviewReadModel.companyUpcomingAppointments;
  const dashboardAppointments =
    currentUserPerson && upcomingAppointments.length > 0
      ? upcomingAppointments
      : companyUpcomingAppointments;
  const appointmentFollowUpActions =
    dashboardOverviewReadModel.appointmentFollowUps.slice(
      0,
      Math.max(0, 5 - dashboardAppointments.length)
    );
  const appointmentDashboardItems = [
    ...dashboardAppointments,
    ...appointmentFollowUpActions
  ];
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
  const progressBillingReadyCount =
    progressBillingSummaryReadModel.readyToBillCount;
  const onboardingSteps = [
    {
      key: "project",
      label: "Create your first project",
      description:
        "Everything starts from the project once customer and job context are real.",
      href: "/projects?compose=1#project-create",
      actionLabel: "Create project",
      complete: dashboardProjectCueInputReadModel.projectTotalCount > 0
    },
    {
      key: "estimate",
      label: "Create your first estimate",
      description:
        "Estimates are created from projects and carry priced scope toward contracts.",
      href: "/estimates?compose=1#estimate-create",
      actionLabel: "Create estimate",
      complete: dashboardProjectCueInputReadModel.estimateTotalCount > 0
    },
    {
      key: "contract",
      label: "Generate your first contract",
      description:
        "Contracts are generated from approved estimates on the same project chain.",
      href: "/contracts?compose=1",
      actionLabel: "Generate contract",
      complete: dashboardProjectCueInputReadModel.contractTotalCount > 0
    },
    {
      key: "invoice-or-job",
      label: "Optional: create an invoice or job",
      description:
        "Invoices and jobs stay connected to projects, contracts, payments, and execution.",
      href:
        dashboardProjectCueInputReadModel.jobTotalCount > 0
          ? "/invoices?compose=1#invoice-create"
          : "/jobs?compose=1#job-create",
      actionLabel:
        dashboardProjectCueInputReadModel.jobTotalCount > 0
          ? "Create invoice"
          : "Create job",
      complete:
        dashboardProjectCueInputReadModel.invoiceTotalCount > 0 ||
        dashboardProjectCueInputReadModel.jobTotalCount > 0
    }
  ];
  const openReceivables = dashboardProjectCueInputReadModel.openReceivables;
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
            searchText: [
              item.title,
              item.description,
              item.badge,
              item.category
            ].join(" ")
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
  const firstReadyProjectWithoutJob = readyProjectsWithoutJobs[0] ?? null;
  const firstJobNeedingScheduling = jobsNeedingScheduling[0] ?? null;
  const firstJobTodayOrInProgress = jobsTodayOrInProgress[0] ?? null;
  const cockpitApprovedEstimatesReadyForContract =
    operationalCockpitReadModel.approvedEstimatesReadyForContract;
  const cockpitWaitingContracts = operationalCockpitReadModel.waitingContracts;
  const cockpitSentEstimates = operationalCockpitReadModel.sentEstimates;
  const cockpitOpenInvoices = operationalCockpitReadModel.openInvoices;
  const cockpitOverdueInvoices = operationalCockpitReadModel.overdueInvoices;
  const cockpitUnscheduledJobs = operationalCockpitReadModel.unscheduledJobs;
  const cockpitJobsTodayOrInProgress =
    operationalCockpitReadModel.jobsTodayOrInProgress;
  const cockpitAppointmentFollowUps =
    operationalCockpitReadModel.appointmentFollowUps;
  const cockpitEquipmentWarnings =
    operationalCockpitReadModel.equipmentWarnings;
  const cockpitHighPriorityServiceTickets =
    operationalCockpitReadModel.highPriorityServiceTickets;
  const cockpitStaleOpenServiceTickets =
    operationalCockpitReadModel.staleOpenServiceTickets;
  const cockpitServiceTicketsMissingServiceJob =
    operationalCockpitReadModel.serviceTicketsMissingServiceJob;
  const cockpitUnscheduledServiceJobs =
    operationalCockpitReadModel.unscheduledServiceJobs;
  const cockpitUpcomingServiceJobs =
    operationalCockpitReadModel.upcomingServiceJobs;
  const cockpitInProgressServiceJobs =
    operationalCockpitReadModel.inProgressServiceJobs;
  const cockpitWarrantyDocumentsNeedingSignature =
    operationalCockpitReadModel.warrantyDocumentsNeedingSignature;
  const aiOperationalDigestSignals: AiOperationalDigestSignal[] = [
    ...projectCues.map((cue) => {
      const category = inferDigestCategoryFromProjectCue(cue);

      return {
        id: `project-cue-${cue.id}`,
        category,
        title: cue.title,
        summary: cue.projectName
          ? `${cue.projectName}: ${cue.description}`
          : cue.description,
        reason: cue.reason,
        priority: mapProjectCuePriority(cue.priority),
        href: cue.href,
        linkedRecordLabel: cue.projectName || "Project suggestion",
        sourceSignals: ["Project cue", "Ready Check", "Project Workspace"],
        recommendedNextStep: cue.actionLabel,
        draftActionAvailable:
          category === "financial_follow_up" ||
          category === "signature_follow_up" ||
          category === "ready_to_move" ||
          category === "field_execution_review",
        draftActionType: inferDigestDraftActionType(category),
        actionKind: inferDigestActionKind(category)
      };
    }),
    ...cockpitOverdueInvoices.map((invoice) => ({
      id: `digest-overdue-invoice-${invoice.id}`,
      category: "financial_follow_up" as const,
      title: `${invoice.referenceNumber} overdue`,
      summary: `${invoice.customer?.name ?? "Unknown customer"} / ${invoice.project?.name ?? "Unknown project"}`,
      reason: `Overdue balance ${formatCurrency(invoice.balanceDueAmount)} was due ${formatShortDate(invoice.dueDate)}.`,
      priority: "critical" as const,
      href: `/invoices/${invoice.id}`,
      linkedRecordLabel: invoice.project?.name ?? invoice.referenceNumber,
      sourceSignals: ["Invoice", "Payment Trail", "Operational Cockpit"],
      recommendedNextStep: "Open invoice",
      draftActionAvailable: true,
      draftActionType: "deposit_payment_reminder" as const,
      actionKind: "payment" as const
    })),
    ...cockpitWaitingContracts.map((contract) => ({
      id: `digest-waiting-contract-${contract.id}`,
      category: "signature_follow_up" as const,
      title: `${contract.title} needs signature follow-up`,
      summary: `${contract.customer?.name ?? "Unknown customer"} / ${contract.project?.name ?? "Unknown project"}`,
      reason:
        "Signature state still blocks downstream readiness or scheduling handoff.",
      priority: "high" as const,
      href: `/contracts/${contract.id}`,
      linkedRecordLabel: contract.project?.name ?? contract.title,
      sourceSignals: ["Contract", "Signature Trail", "Operational Cockpit"],
      recommendedNextStep: "Open contract",
      draftActionAvailable: true,
      draftActionType: "contract_signature_reminder" as const,
      actionKind: "signature" as const
    })),
    ...readyProjectsWithoutJobs.map((project) => ({
      id: `digest-ready-project-${project.id}`,
      category: "ready_to_move" as const,
      title: `${project.name} is ready for job creation`,
      summary: `${project.customer?.name ?? "Unknown customer"} is commercially clear but does not have a job yet.`,
      reason:
        "Ready Check is clear and Schedule needs a canonical job before date or crew assignment.",
      priority: "normal" as const,
      href: `/projects/${project.id}`,
      linkedRecordLabel: project.name,
      sourceSignals: ["Ready Check", "Project Workspace", "CrewBoard"],
      recommendedNextStep: "Open project",
      draftActionAvailable: true,
      draftActionType: "scheduling_readiness_coordination" as const,
      actionKind: "schedule" as const
    })),
    ...cockpitUnscheduledJobs.map((job) => ({
      id: `digest-unscheduled-job-${job.id}`,
      category: "ready_to_move" as const,
      title: `${job.project?.name ?? "Job"} needs schedule placement`,
      summary: `${job.customer?.name ?? "Unknown customer"} / ${job.estimate?.referenceNumber ?? "Project job"}`,
      reason:
        "The canonical job exists but still needs date and crew follow-through.",
      priority: "normal" as const,
      href:
        buildScheduleHref({
          projectId: job.projectId,
          view: "unscheduled",
          action: "schedule",
          jobId: job.id
        }) + "#schedule-action",
      linkedRecordLabel: job.project?.name ?? "Job",
      sourceSignals: ["Job", "CrewBoard", "Operational Cockpit"],
      recommendedNextStep: "Open schedule",
      draftActionAvailable: true,
      draftActionType: "scheduling_readiness_coordination" as const,
      actionKind: "schedule" as const
    })),
    ...cockpitEquipmentWarnings.map((item) => ({
      id: `digest-${item.id}`,
      category: "field_execution_review" as const,
      title: item.title,
      summary: item.description,
      reason: item.why,
      priority:
        item.badge === "Blocked" ? ("high" as const) : ("normal" as const),
      href: item.href,
      linkedRecordLabel: item.title,
      sourceSignals: ["Equipment readiness", "Job", "Operational Cockpit"],
      recommendedNextStep: item.actionLabel,
      draftActionAvailable: item.badge === "Blocked",
      draftActionType:
        item.badge === "Blocked"
          ? ("blocker_escalation_summary" as const)
          : undefined,
      actionKind: "field" as const
    }))
  ].slice(0, 24);
  const aiOperationalDigest = shouldShowAiDashboardDigest(guidancePreferences)
    ? deriveAiOperationalDashboardDigest({
        derivedAt: nowIso,
        signals: aiOperationalDigestSignals
      })
    : null;
  const operationalCockpitBuckets: OperationalGuidanceBucket[] = [
    {
      key: "needs-attention",
      eyebrow: "Needs attention",
      title: "Act before work stalls",
      description:
        "Items in this bucket already have evidence from saved records or Next Move suggestions.",
      emptyTitle: "No urgent attention items are active.",
      emptyDescription:
        "When notifications, project Next Move suggestions, overdue invoices, or due lead follow-ups appear, they will land here first.",
      tone: "attention",
      items: [
        ...notifications.visibleItems.slice(0, 2).map((item) => ({
          id: `notification-${item.id}`,
          title: item.title,
          description: item.description,
          why: item.badge,
          href: item.href,
          actionLabel: "Open",
          secondaryHref: item.contextHref ?? null,
          secondaryLabel: item.contextLabel ?? null,
          badge: item.category.replaceAll("-", " ")
        })),
        ...projectCues.slice(0, 2).map((cue) => ({
          id: `project-cue-${cue.id}`,
          title: cue.title,
          description: cue.projectName
            ? `${cue.projectName}: ${cue.description}`
            : cue.description,
          why: cue.reason,
          href: cue.href,
          actionLabel: cue.actionLabel,
          badge: cue.priority
        })),
        ...cockpitOverdueInvoices.map((invoice) => ({
          id: `overdue-invoice-${invoice.id}`,
          title: invoice.referenceNumber,
          description: `${invoice.customer?.name ?? "Unknown customer"} / ${invoice.project?.name ?? "Unknown project"}`,
          why: `Overdue balance ${formatCurrency(invoice.balanceDueAmount)} was due ${formatShortDate(invoice.dueDate)}.`,
          href: `/invoices/${invoice.id}`,
          actionLabel: "Open invoice",
          secondaryHref: invoice.project
            ? `/projects/${invoice.project.id}`
            : null,
          secondaryLabel: invoice.project ? "Open project" : null,
          badge: "Overdue"
        })),
        ...cockpitHighPriorityServiceTickets.map((ticket) => ({
          id: `service-ticket-priority-${ticket.id}`,
          title: ticket.title,
          description: `${ticket.customer?.name ?? "Unknown customer"} / ${ticket.project?.name ?? "No project linked"}`,
          why: `${labelize(ticket.priority)} priority ${labelize(ticket.ticketType)} ticket is still ${labelize(ticket.status)}.`,
          href: `/service-tickets/${ticket.id}`,
          actionLabel: "Open ticket",
          secondaryHref: ticket.project
            ? `/projects/${ticket.project.id}`
            : null,
          secondaryLabel: ticket.project ? "Open project" : null,
          badge: labelize(ticket.priority)
        })),
        ...cockpitServiceTicketsMissingServiceJob.map((ticket) => ({
          id: `service-ticket-no-job-${ticket.id}`,
          title: ticket.title,
          description: `${ticket.customer?.name ?? "Unknown customer"} / ${ticket.project?.name ?? "No project linked"}`,
          why: "This service/warranty ticket has project context but no linked canonical service job yet.",
          href: `/service-tickets/${ticket.id}`,
          actionLabel: "Open ticket",
          secondaryHref: ticket.project
            ? `/projects/${ticket.project.id}`
            : null,
          secondaryLabel: ticket.project ? "Open project" : null,
          badge: "Needs job"
        })),
        ...cockpitStaleOpenServiceTickets.map((ticket) => ({
          id: `service-ticket-stale-${ticket.id}`,
          title: ticket.title,
          description: `${ticket.customer?.name ?? "Unknown customer"} / reported ${formatShortDate(ticket.reportedOn)}`,
          why: "Open service/warranty work older than 14 days should stay visible for triage.",
          href: `/service-tickets/${ticket.id}`,
          actionLabel: "Open ticket",
          secondaryHref: ticket.project
            ? `/projects/${ticket.project.id}`
            : null,
          secondaryLabel: ticket.project ? "Open project" : null,
          badge: "Stale"
        }))
      ].slice(0, 5)
    },
    {
      key: "ready-to-move",
      eyebrow: "Ready to move",
      title: "Clear handoffs",
      description:
        "Commercial or operational records are far enough along for the next canonical workspace.",
      emptyTitle: "No handoffs are waiting right now.",
      emptyDescription:
        "Approved estimates needing contracts and ready projects needing jobs will show here.",
      tone: "ready",
      items: [
        ...readyProjectsWithoutJobs.slice(0, 3).map((project) => {
          const readinessSnapshot =
            projectReadinessSnapshots.get(project.id) ?? null;

          return {
            id: `ready-project-${project.id}`,
            title: project.name,
            description: `${project.customer?.name ?? "Unknown customer"} is commercially clear but does not have a job yet.`,
            why: "Readiness is clear, and Schedule needs a canonical job before date or crew assignment.",
            href: `/projects/${project.id}`,
            actionLabel: "Open project",
            secondaryHref: `/jobs?projectId=${project.id}&compose=1${
              readinessSnapshot?.estimateId
                ? `&estimateId=${readinessSnapshot.estimateId}`
                : ""
            }${
              readinessSnapshot?.contractId
                ? `&contractId=${readinessSnapshot.contractId}`
                : ""
            }`,
            secondaryLabel: "Create job",
            badge: "Ready"
          };
        }),
        ...cockpitApprovedEstimatesReadyForContract.map((estimate) => ({
          id: `approved-estimate-${estimate.id}`,
          title: estimate.referenceNumber,
          description: `${estimate.project?.name ?? "Project"} has approved scope ready for contract generation.`,
          why: "Approved estimate scope should flow forward instead of being recreated downstream.",
          href: `/estimates/${estimate.id}`,
          actionLabel: "Open estimate",
          secondaryHref: `/contracts?estimateId=${estimate.id}`,
          secondaryLabel: "Generate contract",
          badge: "Approved"
        }))
      ].slice(0, 5)
    },
    {
      key: "waiting",
      eyebrow: "Waiting",
      title: "Customer, payment, or signature",
      description:
        "These records are live, but progress depends on approval, signature, collection, or customer follow-through.",
      emptyTitle: "Nothing is currently waiting on customer or payment action.",
      emptyDescription:
        "Sent estimates, unsigned contracts, and open invoices will appear here when they need review.",
      tone: "waiting",
      items: [
        ...cockpitWaitingContracts.map((contract) => ({
          id: `waiting-contract-${contract.id}`,
          title: contract.title,
          description: `${contract.customer?.name ?? "Unknown customer"} / ${contract.project?.name ?? "Unknown project"}`,
          why: "Signature state still blocks downstream readiness or scheduling handoff.",
          href: `/contracts/${contract.id}`,
          actionLabel: "Open contract",
          secondaryHref: contract.project
            ? `/projects/${contract.project.id}`
            : null,
          secondaryLabel: contract.project ? "Open project" : null,
          badge: labelize(contract.status)
        })),
        ...cockpitSentEstimates.map((estimate) => ({
          id: `waiting-estimate-${estimate.id}`,
          title: estimate.referenceNumber,
          description: `${estimate.customer?.name ?? "Unknown customer"} / ${estimate.project?.name ?? "Unknown project"}`,
          why: "Customer estimate approval is needed before contract and downstream work should proceed.",
          href: `/estimates/${estimate.id}`,
          actionLabel: "Open estimate",
          secondaryHref: estimate.project
            ? `/projects/${estimate.project.id}`
            : null,
          secondaryLabel: estimate.project ? "Open project" : null,
          badge: "Sent"
        })),
        ...cockpitOpenInvoices.map((invoice) => ({
          id: `waiting-invoice-${invoice.id}`,
          title: invoice.referenceNumber,
          description: `${invoice.customer?.name ?? "Unknown customer"} / ${invoice.project?.name ?? "Unknown project"}`,
          why: `${formatCurrency(invoice.balanceDueAmount)} remains open on the canonical invoice/payment chain.`,
          href: `/invoices/${invoice.id}`,
          actionLabel: "Open invoice",
          secondaryHref: invoice.project
            ? `/projects/${invoice.project.id}`
            : null,
          secondaryLabel: invoice.project ? "Open project" : null,
          badge: isOverdueInvoice(invoice.dueDate, today)
            ? "Overdue"
            : labelize(invoice.status)
        })),
        ...cockpitWarrantyDocumentsNeedingSignature.map((document) => ({
          id: `warranty-document-signature-${document.id}`,
          title: document.title,
          description: `${document.customer?.name ?? "Unknown customer"} / ${document.project?.name ?? document.serviceTicket?.title ?? "Warranty document"}`,
          why:
            document.signatureSummary.requestedSignerCount > 0
              ? `${document.signatureSummary.requestedSignerCount} signer request${document.signatureSummary.requestedSignerCount === 1 ? "" : "s"} recorded internally; portal signing and email are still deferred.`
              : "Draft warranty document needs internal signer routing or issue review before customer-facing signing exists.",
          href: `/warranty-documents/${document.id}`,
          actionLabel: "Open warranty",
          secondaryHref: document.serviceTicket
            ? `/service-tickets/${document.serviceTicket.id}`
            : document.project
              ? `/projects/${document.project.id}`
              : null,
          secondaryLabel: document.serviceTicket
            ? "Open ticket"
            : document.project
              ? "Open project"
              : null,
          badge:
            document.signatureSummary.requestedSignerCount > 0
              ? "Requested"
              : labelize(document.status)
        }))
      ].slice(0, 5)
    },
    {
      key: "field-production",
      eyebrow: "Field / production",
      title: "Schedule, crew, and day-of work",
      description:
        "Production follow-up stays on canonical jobs, appointments, schedule, and project records.",
      emptyTitle: "No field or production follow-up is active.",
      emptyDescription:
        "Unscheduled jobs, live jobs, equipment readiness warnings, and follow-up appointments will appear here.",
      tone: "field",
      items: [
        ...cockpitEquipmentWarnings.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          why: item.why,
          href: item.href,
          actionLabel: item.actionLabel,
          secondaryHref: item.secondaryHref,
          secondaryLabel: item.secondaryLabel,
          badge: item.badge
        })),
        ...cockpitUnscheduledJobs.map((job) => ({
          id: `unscheduled-job-${job.id}`,
          title: job.project?.name ?? "Untitled job",
          description: `${job.customer?.name ?? "Unknown customer"} / ${job.estimate?.referenceNumber ?? "Project job"}`,
          why: "The job exists but still needs schedule and crew follow-through.",
          href:
            buildScheduleHref({
              projectId: job.projectId,
              view: "unscheduled",
              action: "schedule",
              jobId: job.id
            }) + "#schedule-action",
          actionLabel: "Open schedule",
          secondaryHref: job.project ? `/projects/${job.project.id}` : null,
          secondaryLabel: job.project ? "Open project" : null,
          badge: "Unscheduled"
        })),
        ...cockpitUnscheduledServiceJobs.map((job) => ({
          id: `unscheduled-service-job-${job.id}`,
          title: job.serviceTicket?.title ?? job.project?.name ?? "Service job",
          description: `${job.customer?.name ?? "Unknown customer"} / ${job.project?.name ?? "Unknown project"}`,
          why: "A service/warranty visit exists as a canonical job, but still needs schedule placement.",
          href:
            buildScheduleHref({
              projectId: job.projectId,
              view: "unscheduled",
              action: "schedule",
              jobId: job.id
            }) + "#schedule-action",
          actionLabel: "Open schedule",
          secondaryHref: job.serviceTicket
            ? `/service-tickets/${job.serviceTicket.id}`
            : null,
          secondaryLabel: job.serviceTicket ? "Open ticket" : null,
          badge: "Service job"
        })),
        ...cockpitInProgressServiceJobs.map((job) => ({
          id: `in-progress-service-job-${job.id}`,
          title: job.serviceTicket?.title ?? job.project?.name ?? "Service job",
          description: `${job.customer?.name ?? "Unknown customer"} / ${job.scheduledDate ? formatShortDate(job.scheduledDate) : "In progress"}`,
          why: "Active service/warranty field work should stay visible in the operating cockpit.",
          href: `/jobs/${job.id}`,
          actionLabel: "Open job",
          secondaryHref: job.serviceTicket
            ? `/service-tickets/${job.serviceTicket.id}`
            : null,
          secondaryLabel: job.serviceTicket ? "Open ticket" : null,
          badge: "In progress"
        })),
        ...cockpitUpcomingServiceJobs.map((job) => ({
          id: `upcoming-service-job-${job.id}`,
          title: job.serviceTicket?.title ?? job.project?.name ?? "Service job",
          description: `${job.customer?.name ?? "Unknown customer"} / ${job.scheduledDate ? formatShortDate(job.scheduledDate) : "Upcoming"}`,
          why: "Scheduled follow-up service work now runs through the same job and schedule spine as production.",
          href:
            buildScheduleHref({
              projectId: job.projectId,
              view: "upcoming",
              action: "schedule",
              jobId: job.id
            }) + "#schedule-action",
          actionLabel: "Open schedule",
          secondaryHref: job.serviceTicket
            ? `/service-tickets/${job.serviceTicket.id}`
            : null,
          secondaryLabel: job.serviceTicket ? "Open ticket" : null,
          badge: "Upcoming"
        })),
        ...cockpitJobsTodayOrInProgress.map((job) => ({
          id: `active-job-${job.id}`,
          title: job.project?.name ?? "Untitled job",
          description: `${job.customer?.name ?? "Unknown customer"} / ${job.scheduledDate ? formatShortDate(job.scheduledDate) : labelize(job.dispatchStatus)}`,
          why: "Today and live execution should stay visible without becoming dashboard-owned workflow state.",
          href: `/jobs/${job.id}`,
          actionLabel: "Open job",
          secondaryHref: job.project ? `/projects/${job.project.id}` : null,
          secondaryLabel: job.project ? "Open project" : null,
          badge: job.dispatchStatus === "in_progress" ? "In progress" : "Today"
        })),
        ...cockpitAppointmentFollowUps.map((appointment) => ({
          id: `appointment-follow-up-${appointment.id}`,
          title: appointment.title,
          description:
            appointment.customer?.name ??
            appointment.opportunity?.title ??
            "Lead appointment",
          why: `${labelize(appointment.status)} appointment may need human follow-up.`,
          href: `/appointments/${appointment.id}`,
          actionLabel: "Open appointment",
          badge: "Follow-up"
        }))
      ].slice(0, 5)
    }
  ];
  const isProductionActionLocked = organizationContext
    ? !isOrganizationActivatedForProductionAction({
        id: organizationContext.organization.id,
        tenantStatus: organizationContext.organization.tenantStatus,
        lifecycleState: organizationContext.organization.lifecycleState
      })
    : false;
  const hasSavedBillingMethod = Boolean(
    billingSetupState.stripePaymentMethodId
  );
  const shouldSuggestBillingSetup =
    !hasSavedBillingMethod &&
    (isProductionActionLocked ? billingSetupState.canCollectCardNow : true);

  return (
    <ContractorDashboardSurface
      header={{
        organizationName:
          organizationContext?.organization.displayName ??
          "Organization setup pending",
        currentRole: organizationContext?.membership.role ?? "member",
        roleLabel: organizationContext?.membership.role ?? "member",
        activeProjectCount: activeProjects.length,
        openReceivablesLabel: formatCurrency(openReceivables)
      }}
      earlyAccess={{
        isLocked: isProductionActionLocked,
        statusLabel: isProductionActionLocked
          ? "Early access"
          : "Account active",
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
              title: `${overdueInvoiceCount} overdue invoice${overdueInvoiceCount === 1 ? "" : "s"}`,
              detail: `${firstOverdueInvoice.referenceNumber} is overdue and still has ${formatCurrency(firstOverdueInvoice.balanceDueAmount)} due.`,
              href: `/invoices/${firstOverdueInvoice.id}`,
              actionLabel: "Open overdue invoice",
              countLabel: String(overdueInvoiceCount),
              status: "overdue"
            }
          : firstOpenInvoice
            ? {
                key: "collections",
                label: "Collections",
                title: `${openInvoiceCount} open invoice${openInvoiceCount === 1 ? "" : "s"}`,
                detail: `${firstOpenInvoice.referenceNumber} has ${formatCurrency(firstOpenInvoice.balanceDueAmount)} remaining.`,
                href: `/invoices/${firstOpenInvoice.id}`,
                actionLabel: "Open invoice",
                countLabel: String(openInvoiceCount),
                status: "open"
              }
            : {
                key: "collections",
                label: "Collections",
                title: "No open receivables",
                detail:
                  "Paid and void invoices are clear from the dashboard collection queue.",
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
              detail:
                "Draft, sent, and rejected estimate queues are clear right now.",
              href: "/estimates",
              actionLabel: "Open estimates",
              countLabel: "0",
              status: "complete"
            },
        firstReadyProjectWithoutJob
          ? {
              key: "execution",
              label: "Execution",
              title: `${readyProjectsWithoutJobs.length} project${readyProjectsWithoutJobs.length === 1 ? "" : "s"} ready for job creation`,
              detail: `${firstReadyProjectWithoutJob.name} is commercially clear; create the canonical job before placing work on schedule.`,
              href: `/projects/${firstReadyProjectWithoutJob.id}`,
              actionLabel: "Open ready project",
              countLabel: String(readyProjectsWithoutJobs.length),
              status: "ready"
            }
          : firstJobNeedingScheduling
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
                  detail:
                    "Unscheduled and live job queues are clear from the dashboard.",
                  href: "/schedule",
                  actionLabel: "Open schedule",
                  countLabel: "0",
                  status: "complete"
                }
      ]}
      universalCapture={
        showUniversalCapture ? (
          <UniversalCaptureWorkItemForm
            action={createWorkItemAction}
            returnTo="/dashboard?capture=1#universal-capture"
            defaultAssignedPersonId={currentUserPerson?.id ?? null}
            assignablePeople={assignablePeople}
          />
        ) : null
      }
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
          label: "Schedule handoffs",
          value: String(
            readyProjectsWithoutJobs.length + jobsNeedingScheduling.length
          ),
          detail:
            "Ready projects need job creation; unscheduled jobs need date and crew follow-through.",
          href:
            readyProjectsWithoutJobs.length > 0
              ? `/projects/${readyProjectsWithoutJobs[0].id}`
              : "/schedule?view=unscheduled"
        },
        {
          key: "appointments-today",
          label: "Appointments today",
          value: String(dashboardOverviewReadModel.appointmentsTodayCount),
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
      lifecycleSteps={[
        {
          key: "opportunity",
          label: "Opportunity",
          value: String(dueLeadFollowUps.length),
          detail:
            dueLeadFollowUps.length > 0
              ? "Follow-up due before the customer and project handoff stalls."
              : `${dashboardOverviewReadModel.opportunityCount} opportunity records in the commercial queue.`,
          href: dueLeadFollowUps.length > 0 ? "/leads?followUp=due" : "/leads",
          tone: dueLeadFollowUps.length > 0 ? "attention" : "quiet"
        },
        {
          key: "customer-project",
          label: "Customer / project",
          value: String(activeProjects.length),
          detail:
            activeProjects.length > 0
              ? "Active projects anchor the downstream estimate, contract, job, invoice, and payment chain."
              : "Create a project to anchor the operational workflow.",
          href: "/projects",
          tone: activeProjects.length > 0 ? "active" : "quiet"
        },
        {
          key: "estimate-contract",
          label: "Estimate / contract",
          value: String(
            estimatesAwaitingAction.length + contractsAwaitingAction.length
          ),
          detail:
            estimatesAwaitingAction.length + contractsAwaitingAction.length > 0
              ? "Commercial records need send, approval, or signature follow-through."
              : `${dashboardOverviewReadModel.approvedEstimateCount} approved estimate${dashboardOverviewReadModel.approvedEstimateCount === 1 ? "" : "s"} ready for downstream handoff.`,
          href:
            estimatesAwaitingAction.length > 0
              ? "/estimates"
              : contractsAwaitingAction.length > 0
                ? "/contracts"
                : "/estimates?status=approved",
          tone:
            estimatesAwaitingAction.length + contractsAwaitingAction.length > 0
              ? "attention"
              : dashboardOverviewReadModel.approvedEstimateCount > 0
                ? "ready"
                : "quiet"
        },
        {
          key: "job-schedule",
          label: "Job / schedule",
          value: String(
            readyProjectsWithoutJobs.length +
              jobsNeedingScheduling.length +
              jobsTodayOrInProgress.length
          ),
          detail:
            readyProjectsWithoutJobs.length > 0
              ? "Commercially clear projects need canonical jobs before schedule placement."
              : jobsNeedingScheduling.length > 0
                ? "Ready jobs need date and crew follow-through on the canonical job chain."
                : jobsTodayOrInProgress.length > 0
                  ? "Today and in-progress work is active in the schedule workspace."
                  : "No urgent schedule handoff is active right now.",
          href:
            readyProjectsWithoutJobs.length > 0
              ? `/projects/${readyProjectsWithoutJobs[0].id}`
              : jobsNeedingScheduling.length > 0
                ? "/schedule?view=unscheduled"
                : "/schedule",
          tone:
            readyProjectsWithoutJobs.length > 0
              ? "ready"
              : jobsNeedingScheduling.length > 0
                ? "attention"
                : jobsTodayOrInProgress.length > 0
                  ? "active"
                  : "quiet"
        },
        {
          key: "invoice-payment",
          label: "Invoice / payment",
          value: formatCurrency(openReceivables),
          detail:
            overdueInvoiceCount > 0
              ? "Overdue balances need collection follow-through from invoice workspaces."
              : openInvoiceCount > 0
                ? "Open receivables remain tied to invoices and payments."
                : "No open receivables are currently blocking cash collection.",
          href:
            overdueInvoiceCount > 0 || openInvoiceCount > 0
              ? "/invoices"
              : "/payments",
          tone:
            overdueInvoiceCount > 0
              ? "attention"
              : openInvoiceCount > 0
                ? "active"
                : "ready"
        }
      ]}
      aiOperationalDigest={aiOperationalDigest}
      operationalCockpitBuckets={operationalCockpitBuckets}
      attentionWidget={attentionWidget}
      projectCueWidget={{
        key: "project-cues",
        eyebrow: "Next Move",
        title: "Project suggestions",
        description:
          "Suggested actions from current project records only. Open the project Next Move panel or an existing workflow to review before creating anything.",
        href: "/projects",
        actionLabel: "Open projects",
        emptyTitle: "No Next Move suggestions need attention right now.",
        emptyDescription:
          "When GateKeeper, deposit, field, contract, or schedule context needs review, Next Move suggestions will surface here.",
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
        href: "/field/work-items",
        actionLabel: "Open my work",
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
            workItem.assignedPerson
              ? ` - ${workItem.assignedPerson.displayName}`
              : ""
          }`,
          href: `/field/work-items/${workItem.id}`,
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
              "Company remains the full organization safety net for derived Next Move suggestions.",
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
            widgets: buildMyWorkDashboardWidgets(
              myWorkQueueModes.queues.mine.cues
            )
          },
          {
            mode: "unresolved",
            label: "Unresolved",
            href: buildMyWorkModeHref("unresolved"),
            description: "Needs responsible person",
            emptyTitle:
              "All current attention items have a responsible role/person.",
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
              estimate.status === "draft"
                ? "Send estimate"
                : "Approve estimate",
            badge: labelize(estimate.status),
            trailing: formatCurrency(estimate.totalAmount),
            contextHref: estimate.project
              ? `/projects/${estimate.project.id}`
              : null,
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
            contextHref: contract.project
              ? `/projects/${contract.project.id}`
              : null,
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
          key: "ready-to-schedule-projects",
          eyebrow: "Schedule Ready",
          title: "Projects ready for job creation",
          description:
            "These projects cleared Ready Check but still need a job before schedule timing and crew assignment can happen.",
          href:
            readyProjectsWithoutJobs.length > 0
              ? `/projects/${readyProjectsWithoutJobs[0].id}`
              : "/projects",
          actionLabel: "Open project",
          emptyTitle: "No ready projects are waiting for job creation.",
          emptyDescription:
            "Once contract, deposit, financing, and GateKeeper checks clear, projects without jobs will appear here before they enter Schedule.",
          items: readyProjectsWithoutJobs.map((project) => {
            const readinessSnapshot =
              projectReadinessSnapshots.get(project.id) ?? null;

            return {
              id: project.id,
              title: project.name,
              subtitle: project.customer?.name ?? "Unknown customer",
              meta: readinessSnapshot?.contractId
                ? "Ready to schedule - create the job, then place it on Schedule"
                : "Ready to schedule - review project handoff",
              href: `/projects/${project.id}`,
              actionLabel: "Open project",
              badge: "Ready to schedule",
              bridgeHref: `/jobs?projectId=${project.id}&compose=1${
                readinessSnapshot?.estimateId
                  ? `&estimateId=${readinessSnapshot.estimateId}`
                  : ""
              }${
                readinessSnapshot?.contractId
                  ? `&contractId=${readinessSnapshot.contractId}`
                  : ""
              }`,
              bridgeLabel: "Create job",
              searchText: buildSearchText(
                project.name,
                project.customer?.name,
                project.customer?.companyName,
                project.status,
                "ready to schedule"
              )
            };
          })
        },
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
            "As unscheduled jobs enter the execution queue, they will surface here for operational follow-through. Projects that are ready but do not have jobs yet appear in the ready-to-schedule project queue above.",
          items: jobsNeedingScheduling.map((job) => ({
            id: job.id,
            title: job.project?.name ?? "Untitled job",
            subtitle: `${job.customer?.name ?? "Unknown customer"} - ${job.estimate?.referenceNumber ?? "Created from project chain"}`,
            meta: "Unscheduled - set the work date, then assign crew from the same job record",
            href:
              buildScheduleHref({
                projectId: job.projectId,
                view: "unscheduled",
                action: "schedule",
                jobId: job.id
              }) + "#schedule-action",
            actionLabel: "Open schedule panel",
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
              appointment.status === "canceled" ||
              appointment.status === "no_show";
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
          items: (overdueInvoices.length > 0
            ? overdueInvoices
            : openInvoices.slice(0, 5)
          ).map((invoice) => ({
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
            badge: isOverdueInvoice(invoice.dueDate, today)
              ? "Overdue"
              : "Open",
            trailing: formatCurrency(invoice.balanceDueAmount),
            contextHref: invoice.project
              ? `/projects/${invoice.project.id}`
              : null,
            contextLabel: invoice.project ? "Open project" : null,
            searchText: buildSearchText(
              invoice.referenceNumber,
              invoice.customer?.name,
              invoice.project?.name,
              invoice.status,
              invoice.dueDate
            )
          }))
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
            contextHref: payment.project
              ? `/projects/${payment.project.id}`
              : null,
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
      startHereForceVisible={
        forceFreshOnboarding ||
        dashboardProjectCueInputReadModel.projectTotalCount === 0
      }
      shortcuts={[
        {
          key: "cost-items-database",
          label: "Cost Library",
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
          metric: `${dashboardOverviewReadModel.scheduledAppointmentCount} scheduled`
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
          metric: `${dashboardProjectCueInputReadModel.estimateTotalCount} total`
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
          metric: `${dashboardOverviewReadModel.customerCount} records`
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
    />
  );
}
