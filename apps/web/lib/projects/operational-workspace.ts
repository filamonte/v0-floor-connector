export type ProjectOperationalSeverity =
  | "critical"
  | "warning"
  | "ready"
  | "neutral";

export type ProjectOperationalAttentionSignal = {
  id: string;
  severity: ProjectOperationalSeverity;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  source: string;
};

type ProjectOperationalInvoice = {
  id: string;
  status: string;
  workflowRole?: string | null;
  totalAmount: string | number;
  balanceDueAmount: string | number;
  retainageHeldAmount?: string | number | null;
  dueDate?: string | null;
};

type ProjectOperationalJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate?: string | null;
};

type ProjectOperationalChangeOrder = {
  id: string;
  status: string;
  priceAdjustment: string | number;
};

type ProjectOperationalDailyLog = {
  id: string;
  status: string;
  logDate: string;
  summary?: string | null;
};

type ProjectOperationalFieldNote = {
  id: string;
  dailyLogId: string;
  noteType: string;
  status: string;
  title: string;
};

type ProjectOperationalTimelineItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  needsAttention: boolean;
};

export type ProjectOperationalWorkspaceInput = {
  projectId: string;
  todayIsoDate: string;
  readiness: {
    isReadyToSchedule: boolean;
    blockers: string[];
    depositRequired: boolean;
    depositSatisfied: boolean;
    contractStatus?: string | null;
  } | null;
  approvedEstimateTotalAmount?: string | number | null;
  invoices: ProjectOperationalInvoice[];
  jobs: ProjectOperationalJob[];
  jobAssignmentCountsByJobId?: Map<string, number>;
  changeOrders: ProjectOperationalChangeOrder[];
  dailyLogs: ProjectOperationalDailyLog[];
  fieldNotes: ProjectOperationalFieldNote[];
  totalWorkedMinutes: number;
  progressBillingExposureAmount?: string | number | null;
  latestPaymentEventType?: string | null;
  timelineAttentionItems?: ProjectOperationalTimelineItem[];
};

export type ProjectOperationalWorkspaceSummary = {
  attentionSignals: ProjectOperationalAttentionSignal[];
  financial: {
    contractValue: number;
    approvedChangeOrderImpact: number;
    invoicedAmount: number;
    paidAmount: number;
    outstandingBalance: number;
    overdueExposure: number;
    unpaidDepositAmount: number;
    retainageHeldAmount: number;
    progressBillingExposure: number;
    paymentRiskLabel: string;
  };
  schedule: {
    jobCount: number;
    scheduledJobCount: number;
    unscheduledJobCount: number;
    inProgressJobCount: number;
    missingCrewJobCount: number;
    agingReadyJobCount: number;
    nextActionLabel: string;
    nextActionHref: string;
  };
  execution: {
    dailyLogCount: number;
    latestDailyLogHref: string | null;
    latestDailyLogLabel: string;
    openBlockerCount: number;
    unresolvedFieldNoteCount: number;
    totalWorkedMinutes: number;
  };
  changeOrders: {
    openReviewCount: number;
    approvedImpact: number;
    pendingImpact: number;
  };
};

function toNumber(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

function isOpenInvoice(invoice: ProjectOperationalInvoice) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    toNumber(invoice.balanceDueAmount) > 0
  );
}

function isOverdue(invoice: ProjectOperationalInvoice, todayIsoDate: string) {
  return Boolean(
    isOpenInvoice(invoice) && invoice.dueDate && invoice.dueDate < todayIsoDate
  );
}

function compareIsoDesc(
  left: string | null | undefined,
  right: string | null | undefined
) {
  return (right ?? "").localeCompare(left ?? "");
}

function addSignal(
  signals: ProjectOperationalAttentionSignal[],
  signal: ProjectOperationalAttentionSignal | null
) {
  if (signal) {
    signals.push(signal);
  }
}

function compareSignals(
  left: ProjectOperationalAttentionSignal,
  right: ProjectOperationalAttentionSignal
) {
  const order: Record<ProjectOperationalSeverity, number> = {
    critical: 4,
    warning: 3,
    ready: 2,
    neutral: 1
  };

  if (order[right.severity] !== order[left.severity]) {
    return order[right.severity] - order[left.severity];
  }

  return left.id.localeCompare(right.id);
}

export function deriveProjectOperationalWorkspaceSummary(
  input: ProjectOperationalWorkspaceInput
): ProjectOperationalWorkspaceSummary {
  const openInvoices = input.invoices.filter(isOpenInvoice);
  const overdueInvoices = input.invoices.filter((invoice) =>
    isOverdue(invoice, input.todayIsoDate)
  );
  const unpaidDepositInvoices = input.invoices.filter(
    (invoice) => invoice.workflowRole === "deposit" && isOpenInvoice(invoice)
  );
  const failedOrVoidedPayment =
    input.latestPaymentEventType === "payment_failed" ||
    input.latestPaymentEventType === "payment_voided";
  const approvedChangeOrders = input.changeOrders.filter(
    (changeOrder) => changeOrder.status === "approved"
  );
  const openChangeOrders = input.changeOrders.filter((changeOrder) =>
    ["draft", "sent", "viewed"].includes(changeOrder.status)
  );
  const unscheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const scheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "scheduled"
  );
  const inProgressJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const missingCrewJobs = input.jobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (input.jobAssignmentCountsByJobId?.get(job.id) ?? 0) === 0
  );
  const openBlockerNotes = input.fieldNotes.filter(
    (note) =>
      note.status === "open" &&
      (note.noteType === "blocker" || note.noteType === "issue")
  );
  const latestDailyLog =
    [...input.dailyLogs].sort((left, right) =>
      compareIsoDesc(left.logDate, right.logDate)
    )[0] ?? null;

  const financial = {
    contractValue: toNumber(input.approvedEstimateTotalAmount),
    approvedChangeOrderImpact: approvedChangeOrders.reduce(
      (sum, changeOrder) => sum + toNumber(changeOrder.priceAdjustment),
      0
    ),
    invoicedAmount: input.invoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.totalAmount),
      0
    ),
    paidAmount: input.invoices.reduce(
      (sum, invoice) =>
        sum +
        Math.max(
          0,
          toNumber(invoice.totalAmount) - toNumber(invoice.balanceDueAmount)
        ),
      0
    ),
    outstandingBalance: openInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.balanceDueAmount),
      0
    ),
    overdueExposure: overdueInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.balanceDueAmount),
      0
    ),
    unpaidDepositAmount: unpaidDepositInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.balanceDueAmount),
      0
    ),
    retainageHeldAmount: input.invoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.retainageHeldAmount),
      0
    ),
    progressBillingExposure: toNumber(input.progressBillingExposureAmount),
    paymentRiskLabel: failedOrVoidedPayment
      ? "Payment failure or void needs review"
      : overdueInvoices.length > 0
        ? "Overdue balance needs collection"
        : unpaidDepositInvoices.length > 0
          ? "Deposit collection is still open"
          : openInvoices.length > 0
            ? "Open balance needs follow-up"
            : "No open payment risk"
  };

  const attentionSignals: ProjectOperationalAttentionSignal[] = [];

  for (const blocker of input.readiness?.blockers ?? []) {
    addSignal(attentionSignals, {
      id: `readiness:${blocker}`,
      severity: "critical",
      title: "Readiness gate is holding",
      detail: blocker.replaceAll("_", " "),
      href: `/projects/${input.projectId}`,
      actionLabel: "Review readiness",
      source: "Ready Check"
    });
  }

  addSignal(
    attentionSignals,
    unpaidDepositInvoices[0]
      ? {
          id: `deposit:${unpaidDepositInvoices[0].id}`,
          severity: "critical",
          title: "Deposit remains unpaid",
          detail: `${toNumber(
            unpaidDepositInvoices[0].balanceDueAmount
          ).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
          })} is still open on the deposit invoice.`,
          href: `/invoices/${unpaidDepositInvoices[0].id}`,
          actionLabel: "Open deposit invoice",
          source: "Invoice Workspace"
        }
      : null
  );

  addSignal(
    attentionSignals,
    overdueInvoices[0]
      ? {
          id: `overdue:${overdueInvoices[0].id}`,
          severity: "warning",
          title: "Overdue invoice exposure",
          detail: `${overdueInvoices.length} overdue invoice${
            overdueInvoices.length === 1 ? "" : "s"
          } with ${financial.overdueExposure.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
          })} open.`,
          href: `/invoices/${overdueInvoices[0].id}`,
          actionLabel: "Open overdue invoice",
          source: "Accounts Receivable"
        }
      : null
  );

  addSignal(
    attentionSignals,
    failedOrVoidedPayment
      ? {
          id: `payment:${input.latestPaymentEventType}`,
          severity: "warning",
          title: "Recent payment evidence needs review",
          detail: `Latest Payment Trail event is ${input.latestPaymentEventType?.replaceAll(
            "_",
            " "
          )}.`,
          href: openInvoices[0]
            ? `/invoices/${openInvoices[0].id}`
            : "/payments",
          actionLabel: openInvoices[0] ? "Open invoice" : "Open payments",
          source: "Payment Trail"
        }
      : null
  );

  addSignal(
    attentionSignals,
    input.readiness?.isReadyToSchedule && unscheduledJobs.length > 0
      ? {
          id: "schedule:ready-unscheduled",
          severity: "warning",
          title: "Ready work is not scheduled",
          detail: `${unscheduledJobs.length} ready job${
            unscheduledJobs.length === 1 ? "" : "s"
          } still need schedule placement.`,
          href: `/schedule?projectId=${input.projectId}&view=unscheduled&action=schedule`,
          actionLabel: "Open CrewBoard",
          source: "CrewBoard"
        }
      : null
  );

  addSignal(
    attentionSignals,
    missingCrewJobs.length > 0
      ? {
          id: "schedule:missing-crew",
          severity: "warning",
          title: "Crew assignment is incomplete",
          detail: `${missingCrewJobs.length} active or planned job${
            missingCrewJobs.length === 1 ? "" : "s"
          } have no assignment rows yet.`,
          href: `/schedule?projectId=${input.projectId}&crew=unassigned`,
          actionLabel: "Review crew",
          source: "CrewBoard"
        }
      : null
  );

  addSignal(
    attentionSignals,
    openBlockerNotes[0]
      ? {
          id: `field:${openBlockerNotes[0].id}`,
          severity: "critical",
          title: "Open field blocker",
          detail:
            openBlockerNotes.length === 1
              ? openBlockerNotes[0].title
              : `${openBlockerNotes.length} blocker or issue notes remain open.`,
          href: `/daily-logs/${openBlockerNotes[0].dailyLogId}#job-notes`,
          actionLabel: "Open Daily Log",
          source: "FieldTrail"
        }
      : null
  );

  addSignal(
    attentionSignals,
    openChangeOrders[0]
      ? {
          id: `change-order:${openChangeOrders[0].id}`,
          severity: "warning",
          title: "Change order is still in review",
          detail: `${openChangeOrders.length} change order${
            openChangeOrders.length === 1 ? "" : "s"
          } may affect scope, billing, or schedule.`,
          href: `/change-orders/${openChangeOrders[0].id}`,
          actionLabel: "Open change order",
          source: "Change Order Workspace"
        }
      : null
  );

  for (const item of input.timelineAttentionItems ?? []) {
    addSignal(
      attentionSignals,
      item.needsAttention
        ? {
            id: `timeline:${item.id}`,
            severity: "warning",
            title: item.title,
            detail: item.summary,
            href: item.href,
            actionLabel: "Open source",
            source: "Project Command Timeline"
          }
        : null
    );
  }

  return {
    attentionSignals: attentionSignals.sort(compareSignals).slice(0, 8),
    financial,
    schedule: {
      jobCount: input.jobs.length,
      scheduledJobCount: scheduledJobs.length,
      unscheduledJobCount: unscheduledJobs.length,
      inProgressJobCount: inProgressJobs.length,
      missingCrewJobCount: missingCrewJobs.length,
      agingReadyJobCount: input.readiness?.isReadyToSchedule
        ? unscheduledJobs.length
        : 0,
      nextActionLabel:
        unscheduledJobs.length > 0
          ? "Schedule ready work"
          : missingCrewJobs.length > 0
            ? "Assign crew"
            : input.jobs.length > 0
              ? "Review schedule"
              : "Create job",
      nextActionHref:
        unscheduledJobs.length > 0
          ? `/schedule?projectId=${input.projectId}&view=unscheduled&action=schedule`
          : `/schedule?projectId=${input.projectId}`
    },
    execution: {
      dailyLogCount: input.dailyLogs.length,
      latestDailyLogHref: latestDailyLog
        ? `/daily-logs/${latestDailyLog.id}`
        : null,
      latestDailyLogLabel: latestDailyLog
        ? latestDailyLog.summary?.trim() || latestDailyLog.logDate
        : "No Daily Job Log yet",
      openBlockerCount: openBlockerNotes.length,
      unresolvedFieldNoteCount: input.fieldNotes.filter(
        (note) => note.status === "open"
      ).length,
      totalWorkedMinutes: input.totalWorkedMinutes
    },
    changeOrders: {
      openReviewCount: openChangeOrders.length,
      approvedImpact: financial.approvedChangeOrderImpact,
      pendingImpact: openChangeOrders.reduce(
        (sum, changeOrder) => sum + toNumber(changeOrder.priceAdjustment),
        0
      )
    }
  };
}
