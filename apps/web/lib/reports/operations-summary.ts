export type ReportsTone = "good" | "attention" | "blocked" | "neutral";

export type ReportsProjectInput = {
  id: string;
  name: string;
  status: string;
  commercialReadinessStatus: string;
  customer?: { name: string } | null;
};

export type ReportsJobInput = {
  id: string;
  projectId: string;
  dispatchStatus: string;
  scheduledDate: string | null;
  updatedAt: string;
  project?: { name: string } | null;
  customer?: { name: string } | null;
};

export type ReportsJobAssignmentInput = {
  id: string;
  jobId: string;
  personId: string | null;
  vendorId: string | null;
};

export type ReportsContractInput = {
  id: string;
  projectId: string;
  referenceNumber: string;
  status: string;
  updatedAt: string;
  project?: { name: string; status?: string } | null;
  customer?: { name: string } | null;
};

export type ReportsInvoiceInput = {
  id: string;
  projectId: string;
  referenceNumber: string;
  status: string;
  dueDate: string | null;
  balanceDueAmount: string | number;
  customer?: { name: string } | null;
  project?: { name: string } | null;
};

export type ReportsFieldNoteInput = {
  id: string;
  projectId: string;
  dailyLogId: string;
  noteType: string;
  status: string;
  title: string;
  updatedAt: string;
  project?: { name: string } | null;
};

export type ReportsDailyLogInput = {
  id: string;
  projectId: string;
  jobId: string | null;
  logDate: string;
};

export type ReportsAttachmentInput = {
  id: string;
  subjectType: string;
  subjectId: string;
  attachmentType: string;
};

export type ReportsScheduleWarningInput = {
  jobId: string;
  warnings: Array<{ id: string }>;
};

export type ReportsCollectionsInput = {
  openReceivableAmount: string | number;
  overdueReceivableAmount: string | number;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  pendingPaymentAmount: string | number;
  pendingEventCount: number;
  failedOrVoidedEventCount: number;
};

export type ReportsListItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  tone: ReportsTone;
};

export type ReportsMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  href: string;
  tone: ReportsTone;
};

export type OperationsReportingSummary = {
  counts: {
    openProjects: number;
    projectsNeedingAttention: number;
    readyCheckAttention: number;
    unscheduledJobs: number;
    jobsScheduledToday: number;
    upcomingJobs: number;
    jobsMissingCrew: number;
    scheduleWarnings: number;
    inProgressJobs: number;
    completedJobsAwaitingCloseout: number;
    projectsMissingRecentDailyLogs: number;
    fieldBlockers: number;
    contractsWaitingSignature: number;
    openReceivables: number;
    overdueInvoices: number;
    paymentAttention: number;
    closeoutAttention: number;
    proofGaps: number;
  };
  amounts: {
    openReceivables: string;
    overdueReceivables: string;
    pendingPayments: string;
  };
  metrics: ReportsMetric[];
  lists: {
    projectsNeedingNextMove: ReportsListItem[];
    jobsNeedingSchedulingOrCrew: ReportsListItem[];
    invoicesNeedingCollection: ReportsListItem[];
    contractsWaitingSignature: ReportsListItem[];
    fieldBlockers: ReportsListItem[];
    closeoutProofAttention: ReportsListItem[];
  };
};

function money(value: string | number) {
  return Number(value).toFixed(2);
}

function isOpenProject(project: ReportsProjectInput) {
  return !["completed", "cancelled", "archived"].includes(project.status);
}

function isReadyCheckAttention(project: ReportsProjectInput) {
  return (
    isOpenProject(project) &&
    project.commercialReadinessStatus !== "ready_to_schedule"
  );
}

function isJobMissingCrew(
  job: ReportsJobInput,
  assignmentsByJobId: Map<string, ReportsJobAssignmentInput[]>
) {
  return (
    job.dispatchStatus !== "unscheduled" &&
    job.dispatchStatus !== "completed" &&
    (assignmentsByJobId.get(job.id) ?? []).length === 0
  );
}

function isOpenBlocker(note: ReportsFieldNoteInput) {
  return (
    note.status === "open" &&
    (note.noteType === "blocker" || note.noteType === "issue")
  );
}

function isWaitingSignature(contract: ReportsContractInput) {
  return contract.status === "sent" || contract.status === "viewed";
}

function isOpenInvoice(invoice: ReportsInvoiceInput) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function sortByNewest<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

function buildJobAssignmentMap(assignments: ReportsJobAssignmentInput[]) {
  const assignmentsByJobId = new Map<string, ReportsJobAssignmentInput[]>();

  for (const assignment of assignments) {
    const existing = assignmentsByJobId.get(assignment.jobId) ?? [];
    existing.push(assignment);
    assignmentsByJobId.set(assignment.jobId, existing);
  }

  return assignmentsByJobId;
}

function getProjectLabel(project?: { name: string } | null) {
  return project?.name ?? "No project";
}

function getCustomerLabel(customer?: { name: string } | null) {
  return customer?.name ?? "Unknown customer";
}

function getProjectDailyLogDates(dailyLogs: ReportsDailyLogInput[]) {
  const datesByProjectId = new Map<string, string[]>();

  for (const dailyLog of dailyLogs) {
    const existing = datesByProjectId.get(dailyLog.projectId) ?? [];
    existing.push(dailyLog.logDate);
    datesByProjectId.set(dailyLog.projectId, existing);
  }

  return datesByProjectId;
}

function getProjectsMissingRecentDailyLogs(input: {
  jobs: ReportsJobInput[];
  dailyLogs: ReportsDailyLogInput[];
  todayIso: string;
}) {
  const datesByProjectId = getProjectDailyLogDates(input.dailyLogs);
  const activeProjectIds = new Set(
    input.jobs
      .filter((job) => job.dispatchStatus === "in_progress")
      .map((job) => job.projectId)
  );

  return [...activeProjectIds].filter(
    (projectId) =>
      !(datesByProjectId.get(projectId) ?? []).includes(input.todayIso)
  );
}

function getAttachmentSubjectKeys(attachments: ReportsAttachmentInput[]) {
  return new Set(
    attachments.map(
      (attachment) => `${attachment.subjectType}:${attachment.subjectId}`
    )
  );
}

function getProjectsWithFieldHistoryButNoEvidence(input: {
  dailyLogs: ReportsDailyLogInput[];
  fieldNotes: ReportsFieldNoteInput[];
  attachments: ReportsAttachmentInput[];
}) {
  const attachmentSubjectKeys = getAttachmentSubjectKeys(input.attachments);
  const projectsWithHistory = new Set<string>();
  const projectsWithEvidence = new Set<string>();

  for (const dailyLog of input.dailyLogs) {
    projectsWithHistory.add(dailyLog.projectId);

    if (attachmentSubjectKeys.has(`daily_log:${dailyLog.id}`)) {
      projectsWithEvidence.add(dailyLog.projectId);
    }
  }

  for (const note of input.fieldNotes) {
    projectsWithHistory.add(note.projectId);

    if (attachmentSubjectKeys.has(`field_note:${note.id}`)) {
      projectsWithEvidence.add(note.projectId);
    }
  }

  return [...projectsWithHistory].filter(
    (projectId) => !projectsWithEvidence.has(projectId)
  );
}

function metric(input: ReportsMetric): ReportsMetric {
  return input;
}

export function deriveOperationsReportingSummary(input: {
  todayIso: string;
  projects: ReportsProjectInput[];
  jobs: ReportsJobInput[];
  jobAssignments: ReportsJobAssignmentInput[];
  scheduleWarnings: ReportsScheduleWarningInput[];
  contracts: ReportsContractInput[];
  invoices: ReportsInvoiceInput[];
  dailyLogs: ReportsDailyLogInput[];
  fieldNotes: ReportsFieldNoteInput[];
  attachments: ReportsAttachmentInput[];
  collections: ReportsCollectionsInput;
}): OperationsReportingSummary {
  const assignmentsByJobId = buildJobAssignmentMap(input.jobAssignments);
  const openProjects = input.projects.filter(isOpenProject);
  const readyCheckProjects = input.projects.filter(isReadyCheckAttention);
  const unscheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const inProgressJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const upcomingJobs = input.jobs.filter(
    (job) =>
      job.scheduledDate !== null &&
      job.scheduledDate > input.todayIso &&
      job.dispatchStatus !== "completed"
  );
  const todayJobs = input.jobs.filter(
    (job) =>
      job.scheduledDate === input.todayIso && job.dispatchStatus !== "completed"
  );
  const missingCrewJobs = input.jobs.filter((job) =>
    isJobMissingCrew(job, assignmentsByJobId)
  );
  const completedJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "completed"
  );
  const completedProjectIds = new Set(
    completedJobs.map((job) => job.projectId)
  );
  const completedJobsAwaitingCloseout = completedJobs.filter((job) => {
    const project = input.projects.find(
      (candidate) => candidate.id === job.projectId
    );
    return project?.status !== "completed";
  });
  const projectsMissingRecentDailyLogs = getProjectsMissingRecentDailyLogs({
    jobs: input.jobs,
    dailyLogs: input.dailyLogs,
    todayIso: input.todayIso
  });
  const openFieldBlockers = input.fieldNotes.filter(isOpenBlocker);
  const waitingContracts = input.contracts.filter(isWaitingSignature);
  const openInvoices = input.invoices.filter(isOpenInvoice);
  const overdueInvoices = openInvoices.filter(
    (invoice) => invoice.dueDate !== null && invoice.dueDate < input.todayIso
  );
  const scheduleWarningCount = input.scheduleWarnings.reduce(
    (sum, warningGroup) => sum + warningGroup.warnings.length,
    0
  );
  const paymentAttention =
    input.collections.pendingEventCount +
    input.collections.failedOrVoidedEventCount;
  const proofGapProjectIds = getProjectsWithFieldHistoryButNoEvidence({
    dailyLogs: input.dailyLogs,
    fieldNotes: input.fieldNotes,
    attachments: input.attachments
  });
  const closeoutAttentionProjectIds = new Set<string>([
    ...completedJobsAwaitingCloseout.map((job) => job.projectId),
    ...openFieldBlockers.map((note) => note.projectId),
    ...openInvoices.map((invoice) => invoice.projectId),
    ...proofGapProjectIds
  ]);

  return {
    counts: {
      openProjects: openProjects.length,
      projectsNeedingAttention: readyCheckProjects.length,
      readyCheckAttention: readyCheckProjects.length,
      unscheduledJobs: unscheduledJobs.length,
      jobsScheduledToday: todayJobs.length,
      upcomingJobs: upcomingJobs.length,
      jobsMissingCrew: missingCrewJobs.length,
      scheduleWarnings: scheduleWarningCount,
      inProgressJobs: inProgressJobs.length,
      completedJobsAwaitingCloseout: completedJobsAwaitingCloseout.length,
      projectsMissingRecentDailyLogs: projectsMissingRecentDailyLogs.length,
      fieldBlockers: openFieldBlockers.length,
      contractsWaitingSignature: waitingContracts.length,
      openReceivables: input.collections.openInvoiceCount,
      overdueInvoices:
        input.collections.overdueInvoiceCount || overdueInvoices.length,
      paymentAttention,
      closeoutAttention: closeoutAttentionProjectIds.size,
      proofGaps: proofGapProjectIds.filter((projectId) =>
        completedProjectIds.has(projectId)
      ).length
    },
    amounts: {
      openReceivables: money(input.collections.openReceivableAmount),
      overdueReceivables: money(input.collections.overdueReceivableAmount),
      pendingPayments: money(input.collections.pendingPaymentAmount)
    },
    metrics: [
      metric({
        id: "open-projects",
        label: "Open Projects",
        value: openProjects.length,
        detail: "Active project records",
        href: "/projects",
        tone: openProjects.length > 0 ? "neutral" : "good"
      }),
      metric({
        id: "ready-check-attention",
        label: "Ready Check Attention",
        value: readyCheckProjects.length,
        detail: "Projects not ready to schedule",
        href: "/projects",
        tone: readyCheckProjects.length > 0 ? "blocked" : "good"
      }),
      metric({
        id: "needs-scheduling",
        label: "Needs Scheduling",
        value: unscheduledJobs.length,
        detail: "Jobs waiting on CrewBoard",
        href: "/schedule?view=unscheduled",
        tone: unscheduledJobs.length > 0 ? "attention" : "good"
      }),
      metric({
        id: "missing-crew",
        label: "Missing Crew",
        value: missingCrewJobs.length,
        detail: "Scheduled or active jobs without assignments",
        href: "/schedule?crew=unassigned",
        tone: missingCrewJobs.length > 0 ? "attention" : "good"
      }),
      metric({
        id: "field-blockers",
        label: "Field Blockers",
        value: openFieldBlockers.length,
        detail: "Open blocker or issue Job Notes",
        href: "/daily-logs",
        tone: openFieldBlockers.length > 0 ? "blocked" : "good"
      }),
      metric({
        id: "waiting-signature",
        label: "Waiting Signature",
        value: waitingContracts.length,
        detail: "Contracts in Signature Trail follow-up",
        href: "/contracts",
        tone: waitingContracts.length > 0 ? "attention" : "good"
      }),
      metric({
        id: "open-receivables",
        label: "Open Receivables",
        value: money(input.collections.openReceivableAmount),
        detail: `${input.collections.openInvoiceCount} unpaid invoice${
          input.collections.openInvoiceCount === 1 ? "" : "s"
        }`,
        href: "/financials/accounts-receivable",
        tone: input.collections.openInvoiceCount > 0 ? "attention" : "good"
      }),
      metric({
        id: "payment-attention",
        label: "Payment Attention",
        value: paymentAttention,
        detail: "Pending, failed, or voided Payment Trail items",
        href: "/payments",
        tone: paymentAttention > 0 ? "attention" : "good"
      }),
      metric({
        id: "closeout-attention",
        label: "Closeout Attention",
        value: closeoutAttentionProjectIds.size,
        detail: "Projects with closeout or proof review signals",
        href: "/projects",
        tone: closeoutAttentionProjectIds.size > 0 ? "attention" : "good"
      })
    ],
    lists: {
      projectsNeedingNextMove: readyCheckProjects
        .slice(0, 6)
        .map((project) => ({
          id: project.id,
          title: project.name,
          subtitle: getCustomerLabel(project.customer),
          meta: project.commercialReadinessStatus.replaceAll("_", " "),
          href: `/projects/${project.id}`,
          tone: "blocked"
        })),
      jobsNeedingSchedulingOrCrew: [...unscheduledJobs, ...missingCrewJobs]
        .filter(
          (job, index, jobs) =>
            jobs.findIndex((candidate) => candidate.id === job.id) === index
        )
        .slice(0, 6)
        .map((job) => ({
          id: job.id,
          title: getProjectLabel(job.project),
          subtitle: getCustomerLabel(job.customer),
          meta:
            job.dispatchStatus === "unscheduled"
              ? "Needs scheduling"
              : "Missing crew",
          href:
            job.dispatchStatus === "unscheduled"
              ? `/schedule?view=unscheduled&jobId=${job.id}`
              : `/schedule?crew=unassigned&jobId=${job.id}`,
          tone: "attention"
        })),
      invoicesNeedingCollection: openInvoices
        .slice()
        .sort(
          (left, right) =>
            Number(right.balanceDueAmount) - Number(left.balanceDueAmount)
        )
        .slice(0, 6)
        .map((invoice) => ({
          id: invoice.id,
          title: invoice.referenceNumber,
          subtitle: `${getCustomerLabel(invoice.customer)} / ${getProjectLabel(
            invoice.project
          )}`,
          meta: money(invoice.balanceDueAmount),
          href: `/invoices/${invoice.id}`,
          tone:
            invoice.dueDate !== null && invoice.dueDate < input.todayIso
              ? "blocked"
              : "attention"
        })),
      contractsWaitingSignature: sortByNewest(waitingContracts)
        .slice(0, 6)
        .map((contract) => ({
          id: contract.id,
          title: contract.referenceNumber,
          subtitle: `${getCustomerLabel(contract.customer)} / ${getProjectLabel(
            contract.project
          )}`,
          meta: contract.status.replaceAll("_", " "),
          href: `/contracts/${contract.id}`,
          tone: "attention"
        })),
      fieldBlockers: sortByNewest(openFieldBlockers)
        .slice(0, 6)
        .map((note) => ({
          id: note.id,
          title: note.title,
          subtitle: getProjectLabel(note.project),
          meta: note.noteType.replaceAll("_", " "),
          href: `/daily-logs/${note.dailyLogId}`,
          tone: "blocked"
        })),
      closeoutProofAttention: [
        ...completedJobsAwaitingCloseout.map((job) => ({
          id: `job:${job.id}`,
          title: getProjectLabel(job.project),
          subtitle: getCustomerLabel(job.customer),
          meta: "Completed job awaiting closeout review",
          href: `/projects/${job.projectId}`,
          tone: "attention" as ReportsTone
        })),
        ...proofGapProjectIds.slice(0, 6).map((projectId) => {
          const project = input.projects.find(
            (candidate) => candidate.id === projectId
          );

          return {
            id: `proof:${projectId}`,
            title: project?.name ?? "Project proof",
            subtitle: getCustomerLabel(project?.customer),
            meta: "Field history without attached evidence",
            href: `/projects/${projectId}`,
            tone: "attention" as ReportsTone
          };
        })
      ].slice(0, 6)
    }
  };
}
