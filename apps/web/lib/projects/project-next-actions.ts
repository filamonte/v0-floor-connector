export type ProjectNextActionSeverity =
  | "blocked"
  | "attention"
  | "ready"
  | "monitoring";

export type ProjectNextActionLinkedRecord = {
  id: string;
  label: string;
  href: string;
  status: string;
};

export type ProjectNextActionItem = {
  id: string;
  projectId: string;
  currentStage: string;
  owningWorkspace: string;
  headline: string;
  reason: string;
  severity: ProjectNextActionSeverity;
  primaryActionLabel: string;
  primaryHref: string;
  secondaryActionLabel?: string;
  secondaryHref?: string;
  linkedRecords: ProjectNextActionLinkedRecord[];
};

export type ProjectNextActionsSummary = {
  projectId: string;
  headline: ProjectNextActionItem;
  actions: ProjectNextActionItem[];
};

type ProjectNextActionReadiness = {
  isReadyToSchedule: boolean;
  blockers: string[];
  depositInvoiceId?: string | null;
  depositRequired?: boolean;
  depositSatisfied?: boolean;
};

type ProjectNextActionEstimate = {
  id: string;
  status: string;
  referenceNumber?: string | null;
  updatedAt?: string | null;
};

type ProjectNextActionContract = {
  id: string;
  status: string;
  internalApprovalStatus?: string | null;
  referenceNumber?: string | null;
  title?: string | null;
  sentAt?: string | null;
  viewedAt?: string | null;
  signedAt?: string | null;
  updatedAt?: string | null;
};

type ProjectNextActionInvoice = {
  id: string;
  status: string;
  workflowRole?: string | null;
  referenceNumber?: string | null;
  balanceDueAmount: string | number;
  dueDate?: string | null;
  updatedAt?: string | null;
};

type ProjectNextActionJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate?: string | null;
  updatedAt?: string | null;
};

type ProjectNextActionFieldNote = {
  id: string;
  dailyLogId: string;
  noteType: string;
  status: string;
  title: string;
  updatedAt?: string | null;
};

export type BuildProjectNextActionsInput = {
  project: {
    id: string;
    name: string;
  };
  todayIsoDate: string;
  readinessSnapshot: ProjectNextActionReadiness | null;
  estimates: ProjectNextActionEstimate[];
  contracts: ProjectNextActionContract[];
  invoices: ProjectNextActionInvoice[];
  jobs: ProjectNextActionJob[];
  fieldNotes?: ProjectNextActionFieldNote[];
};

function newestByUpdatedAt<T extends { updatedAt?: string | null }>(
  items: T[]
) {
  return (
    [...items].sort((left, right) =>
      (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "")
    )[0] ?? null
  );
}

function isOpenInvoice(invoice: ProjectNextActionInvoice) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function buildJobCreateHref(input: {
  projectId: string;
  estimateId?: string | null;
  contractId?: string | null;
}) {
  const searchParams = new URLSearchParams({
    projectId: input.projectId,
    compose: "1"
  });

  if (input.estimateId) {
    searchParams.set("estimateId", input.estimateId);
  }

  if (input.contractId) {
    searchParams.set("contractId", input.contractId);
  }

  return `/jobs?${searchParams.toString()}`;
}

function buildScheduleHref(projectId: string, jobs: ProjectNextActionJob[]) {
  const searchParams = new URLSearchParams({
    projectId,
    view: "unscheduled",
    action: "schedule"
  });

  if (jobs.length === 1) {
    searchParams.set("jobId", jobs[0].id);
  }

  return `/schedule?${searchParams.toString()}`;
}

function linkedRecord(input: ProjectNextActionLinkedRecord) {
  return input;
}

function compareActions(
  left: ProjectNextActionItem,
  right: ProjectNextActionItem
) {
  const order: Record<ProjectNextActionSeverity, number> = {
    blocked: 4,
    attention: 3,
    ready: 2,
    monitoring: 1
  };

  if (order[right.severity] !== order[left.severity]) {
    return order[right.severity] - order[left.severity];
  }

  return left.id.localeCompare(right.id);
}

export function buildProjectNextActions(
  input: BuildProjectNextActionsInput
): ProjectNextActionsSummary {
  const approvedEstimate =
    input.estimates.find((estimate) => estimate.status === "approved") ?? null;
  const latestEstimate = newestByUpdatedAt(input.estimates);
  const signedContract =
    input.contracts.find((contract) => contract.status === "signed") ?? null;
  const latestContract = newestByUpdatedAt(input.contracts);
  const openInvoices = input.invoices.filter(isOpenInvoice);
  const depositInvoice =
    (input.readinessSnapshot?.depositInvoiceId
      ? input.invoices.find(
          (invoice) => invoice.id === input.readinessSnapshot?.depositInvoiceId
        )
      : null) ??
    input.invoices.find((invoice) => invoice.workflowRole === "deposit") ??
    null;
  const unscheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const activeJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const todayJobs = input.jobs.filter(
    (job) =>
      job.scheduledDate === input.todayIsoDate ||
      job.dispatchStatus === "in_progress"
  );
  const openBlockers = (input.fieldNotes ?? []).filter(
    (note) =>
      note.status === "open" &&
      (note.noteType === "blocker" || note.noteType === "issue")
  );
  const actions: ProjectNextActionItem[] = [];
  const push = (action: ProjectNextActionItem) => {
    if (!actions.some((existing) => existing.id === action.id)) {
      actions.push(action);
    }
  };

  if (openBlockers.length > 0) {
    const blocker = openBlockers[0];
    push({
      id: `${input.project.id}:open-field-blocker`,
      projectId: input.project.id,
      currentStage: "Field blocker",
      owningWorkspace: "Daily Log / FieldTrail",
      headline: "Resolve the open field blocker",
      reason:
        openBlockers.length === 1
          ? blocker.title
          : `${openBlockers.length} open blocker or issue notes are still attached to this project.`,
      severity: "blocked",
      primaryActionLabel: "Open Daily Log",
      primaryHref: `/daily-logs/${blocker.dailyLogId}#job-notes`,
      secondaryActionLabel: "Review project field work",
      secondaryHref: `/projects/${input.project.id}#fieldtrail`,
      linkedRecords: [
        linkedRecord({
          id: blocker.id,
          label: "Field note",
          href: `/daily-logs/${blocker.dailyLogId}#job-notes`,
          status: blocker.status
        })
      ]
    });
  }

  if (approvedEstimate && input.contracts.length === 0) {
    push({
      id: `${input.project.id}:approved-estimate-no-contract`,
      projectId: input.project.id,
      currentStage: "Contract handoff",
      owningWorkspace: "Contract Workspace",
      headline: "Generate the contract from approved scope",
      reason: approvedEstimate.referenceNumber
        ? `Estimate ${approvedEstimate.referenceNumber} is approved, but no canonical contract exists yet.`
        : "An approved estimate exists, but no canonical contract exists yet.",
      severity: "blocked",
      primaryActionLabel: "Generate contract",
      primaryHref: `/contracts?estimateId=${approvedEstimate.id}`,
      secondaryActionLabel: "Review estimate",
      secondaryHref: `/estimates/${approvedEstimate.id}`,
      linkedRecords: [
        linkedRecord({
          id: approvedEstimate.id,
          label: "Approved estimate",
          href: `/estimates/${approvedEstimate.id}`,
          status: approvedEstimate.status
        })
      ]
    });
  }

  if (
    latestContract &&
    (latestContract.status === "draft" ||
      latestContract.internalApprovalStatus === "pending")
  ) {
    push({
      id: `${input.project.id}:contract-prep`,
      projectId: input.project.id,
      currentStage: "Contract prep",
      owningWorkspace: "Contract Workspace",
      headline:
        latestContract.internalApprovalStatus === "pending"
          ? "Clear internal contract approval"
          : "Send the draft contract for signature",
      reason:
        latestContract.internalApprovalStatus === "pending"
          ? "The contract exists, but internal approval is still pending before send."
          : "The contract exists as a draft and still needs the contract workspace send flow.",
      severity: "blocked",
      primaryActionLabel: "Open contract",
      primaryHref: `/contracts/${latestContract.id}`,
      linkedRecords: [
        linkedRecord({
          id: latestContract.id,
          label: "Contract",
          href: `/contracts/${latestContract.id}`,
          status: latestContract.status
        })
      ]
    });
  }

  if (
    latestContract &&
    !latestContract.signedAt &&
    (latestContract.status === "sent" || latestContract.status === "viewed")
  ) {
    push({
      id: `${input.project.id}:signature-pending`,
      projectId: input.project.id,
      currentStage: "Signature",
      owningWorkspace: "Contract Workspace",
      headline:
        latestContract.status === "viewed"
          ? "Follow up on the viewed unsigned contract"
          : "Follow up on the sent unsigned contract",
      reason:
        latestContract.status === "viewed"
          ? "The customer has viewed the contract, but signature is still pending."
          : "The contract has been sent and still needs signature before operations can rely on it.",
      severity: "blocked",
      primaryActionLabel: "Open contract",
      primaryHref: `/contracts/${latestContract.id}`,
      linkedRecords: [
        linkedRecord({
          id: latestContract.id,
          label: "Unsigned contract",
          href: `/contracts/${latestContract.id}`,
          status: latestContract.status
        })
      ]
    });
  }

  if (
    signedContract &&
    input.readinessSnapshot &&
    !input.readinessSnapshot.isReadyToSchedule &&
    input.readinessSnapshot.blockers.some((blocker) =>
      ["deposit_required", "financing_pending", "financing_declined"].includes(
        blocker
      )
    )
  ) {
    const financialBlocker = input.readinessSnapshot.blockers.find((blocker) =>
      ["deposit_required", "financing_pending", "financing_declined"].includes(
        blocker
      )
    );
    push({
      id: `${input.project.id}:financial-readiness`,
      projectId: input.project.id,
      currentStage: "Financial readiness",
      owningWorkspace:
        financialBlocker === "deposit_required" && depositInvoice
          ? "Invoice Workspace"
          : "Project Readiness",
      headline:
        financialBlocker === "deposit_required"
          ? "Resolve deposit readiness"
          : "Resolve financing readiness",
      reason:
        financialBlocker === "deposit_required"
          ? "The contract is signed, but the required deposit is not satisfied yet."
          : "The contract is signed, but financing status still blocks the operational handoff.",
      severity: "blocked",
      primaryActionLabel:
        financialBlocker === "deposit_required" && depositInvoice
          ? "Open deposit invoice"
          : "Review project readiness",
      primaryHref:
        financialBlocker === "deposit_required" && depositInvoice
          ? `/invoices/${depositInvoice.id}`
          : `/projects/${input.project.id}#project-readiness-blockers`,
      secondaryActionLabel: "Open contract",
      secondaryHref: `/contracts/${signedContract.id}`,
      linkedRecords: [
        linkedRecord({
          id: signedContract.id,
          label: "Signed contract",
          href: `/contracts/${signedContract.id}`,
          status: signedContract.status
        }),
        ...(depositInvoice
          ? [
              linkedRecord({
                id: depositInvoice.id,
                label: "Deposit invoice",
                href: `/invoices/${depositInvoice.id}`,
                status: depositInvoice.status
              })
            ]
          : [])
      ]
    });
  }

  if (input.readinessSnapshot?.isReadyToSchedule && input.jobs.length === 0) {
    push({
      id: `${input.project.id}:ready-no-job`,
      projectId: input.project.id,
      currentStage: "Job creation",
      owningWorkspace: "Jobs Manager",
      headline: "Create the first job",
      reason:
        "Commercial readiness is clear, but no canonical job exists for scheduling or field execution.",
      severity: "ready",
      primaryActionLabel: "Create job",
      primaryHref: buildJobCreateHref({
        projectId: input.project.id,
        estimateId: approvedEstimate?.id ?? latestEstimate?.id,
        contractId: signedContract?.id ?? latestContract?.id
      }),
      secondaryActionLabel: "Open schedule",
      secondaryHref: `/schedule?projectId=${input.project.id}`,
      linkedRecords: [
        ...(signedContract
          ? [
              linkedRecord({
                id: signedContract.id,
                label: "Signed contract",
                href: `/contracts/${signedContract.id}`,
                status: signedContract.status
              })
            ]
          : [])
      ]
    });
  }

  if (
    input.readinessSnapshot?.isReadyToSchedule &&
    unscheduledJobs.length > 0
  ) {
    push({
      id: `${input.project.id}:unscheduled-job`,
      projectId: input.project.id,
      currentStage: "Scheduling",
      owningWorkspace: "CrewBoard",
      headline: "Schedule the ready job work",
      reason:
        unscheduledJobs.length === 1
          ? "One canonical job exists and still needs schedule placement."
          : `${unscheduledJobs.length} canonical jobs exist and still need schedule placement.`,
      severity: "attention",
      primaryActionLabel: "Open CrewBoard",
      primaryHref: buildScheduleHref(input.project.id, unscheduledJobs),
      secondaryActionLabel: "Open jobs",
      secondaryHref: `/jobs?projectId=${input.project.id}`,
      linkedRecords: unscheduledJobs.slice(0, 3).map((job) =>
        linkedRecord({
          id: job.id,
          label: "Unscheduled job",
          href: `/jobs/${job.id}`,
          status: job.dispatchStatus
        })
      )
    });
  }

  if (todayJobs.length > 0) {
    const job = activeJobs[0] ?? todayJobs[0];
    push({
      id: `${input.project.id}:today-or-active-job`,
      projectId: input.project.id,
      currentStage: activeJobs.length > 0 ? "Execution" : "Scheduled today",
      owningWorkspace: activeJobs.length > 0 ? "Job Workspace" : "CrewBoard",
      headline:
        activeJobs.length > 0
          ? "Monitor active field work"
          : "Review today's scheduled work",
      reason:
        activeJobs.length > 0
          ? "A job is in progress, so daily logs, field notes, and billing handoff should stay current."
          : "A job is scheduled for today. Confirm crew and field readiness from the job or schedule workspace.",
      severity: "monitoring",
      primaryActionLabel: "Open job",
      primaryHref: `/jobs/${job.id}`,
      secondaryActionLabel: "Open schedule",
      secondaryHref: `/schedule?projectId=${input.project.id}`,
      linkedRecords: [
        linkedRecord({
          id: job.id,
          label: "Current job",
          href: `/jobs/${job.id}`,
          status: job.dispatchStatus
        })
      ]
    });
  }

  if (openInvoices.length > 0) {
    const invoice = openInvoices[0];
    const totalOpen = openInvoices.reduce(
      (sum, item) => sum + Number(item.balanceDueAmount),
      0
    );
    push({
      id: `${input.project.id}:open-ar`,
      projectId: input.project.id,
      currentStage: "Accounts receivable",
      owningWorkspace:
        openInvoices.length === 1 ? "Invoice Workspace" : "Accounts Receivable",
      headline: "Follow the open project balance",
      reason:
        openInvoices.length === 1
          ? `${formatMoney(invoice.balanceDueAmount)} remains open on ${invoice.referenceNumber ?? "the project invoice"}.`
          : `${formatMoney(totalOpen)} remains open across ${openInvoices.length} project invoices.`,
      severity: "attention",
      primaryActionLabel:
        openInvoices.length === 1 ? "Open invoice" : "Open Accounts Receivable",
      primaryHref:
        openInvoices.length === 1
          ? `/invoices/${invoice.id}`
          : "/financials/accounts-receivable",
      secondaryActionLabel:
        openInvoices.length === 1 ? "Open Accounts Receivable" : "Open invoice",
      secondaryHref:
        openInvoices.length === 1
          ? "/financials/accounts-receivable"
          : `/invoices/${invoice.id}`,
      linkedRecords: openInvoices.slice(0, 3).map((item) =>
        linkedRecord({
          id: item.id,
          label:
            item.workflowRole === "deposit" ? "Deposit invoice" : "Invoice",
          href: `/invoices/${item.id}`,
          status: item.status
        })
      )
    });
  }

  if (actions.length === 0) {
    push({
      id: `${input.project.id}:review-project`,
      projectId: input.project.id,
      currentStage: "Project review",
      owningWorkspace: "Project Workspace",
      headline: "Review project continuity",
      reason:
        "No blocking next action is visible from the loaded project records. Continue from the Project Workspace or linked record lanes.",
      severity: "monitoring",
      primaryActionLabel: "Review connected records",
      primaryHref: `/projects/${input.project.id}#connected-record-lanes`,
      linkedRecords: []
    });
  }

  const sortedActions = actions.sort(compareActions).slice(0, 5);

  return {
    projectId: input.project.id,
    headline: sortedActions[0],
    actions: sortedActions
  };
}
