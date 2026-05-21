import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";

export type CloseoutTrailTone = "ready" | "attention" | "blocked" | "neutral";

export type CloseoutTrailChecklistState =
  | "complete"
  | "attention"
  | "blocked"
  | "not_applicable"
  | "unknown";

export type CloseoutTrailNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type CloseoutTrailChecklistItem = {
  id:
    | "contract"
    | "jobs"
    | "daily_logs"
    | "job_notes"
    | "field_evidence"
    | "change_orders"
    | "invoices"
    | "customer_access"
    | "warranty_service";
  label: string;
  state: CloseoutTrailChecklistState;
  detail: string;
  href?: string;
};

export type CloseoutTrailSummary = {
  closeoutTone: CloseoutTrailTone;
  closeoutStatusLabel: string;
  primaryMessage: string;
  nextMove: CloseoutTrailNextMove;
  checklistItems: CloseoutTrailChecklistItem[];
  blockers: string[];
  highlights: string[];
  linkedCounts: {
    completedJobs: number;
    openJobs: number;
    unresolvedJobNotes: number;
    dailyLogs: number;
    evidenceItems: number;
    openInvoices: number;
    unpaidBalance: number;
    unresolvedChangeOrders: number;
    signedContracts: number;
    warrantyOrServiceItems: number;
  };
};

export type CloseoutTrailJob = {
  id: string;
  dispatchStatus: string;
};

export type CloseoutTrailContract = {
  id: string;
  status: string;
};

export type CloseoutTrailInvoice = {
  id: string;
  status: string;
  balanceDueAmount: string | number;
};

export type CloseoutTrailChangeOrder = {
  id: string;
  status: string;
};

export type CloseoutTrailInput = {
  projectId: string;
  jobs: CloseoutTrailJob[];
  contracts: CloseoutTrailContract[];
  invoices: CloseoutTrailInvoice[];
  changeOrders: CloseoutTrailChangeOrder[];
  fieldTrail: FieldTrailSummary;
  messageCenter: MessageCenterSummary;
  customerAccessCount: number;
  warrantyOrServiceItemCount: number;
  scheduleHref: string;
  dailyLogsHref: string;
  fieldTrailHref: string;
  messageCenterHref: string;
  serviceWarrantyHref: string;
};

function hasOpenBalance(invoice: CloseoutTrailInvoice) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function isCompletedJob(job: CloseoutTrailJob) {
  return job.dispatchStatus === "completed";
}

function isOpenJob(job: CloseoutTrailJob) {
  return (
    job.dispatchStatus !== "completed" && job.dispatchStatus !== "cancelled"
  );
}

function isSignedContract(contract: CloseoutTrailContract) {
  return contract.status === "signed";
}

function isUnresolvedChangeOrder(changeOrder: CloseoutTrailChangeOrder) {
  return changeOrder.status === "draft" || changeOrder.status === "sent";
}

function buildChecklistItem(
  item: CloseoutTrailChecklistItem
): CloseoutTrailChecklistItem {
  return item;
}

function buildNextMove(input: {
  latestContract: CloseoutTrailContract | null;
  unsignedContract: CloseoutTrailContract | null;
  openJob: CloseoutTrailJob | null;
  completedJobs: number;
  fieldTrail: FieldTrailSummary;
  openInvoice: CloseoutTrailInvoice | null;
  unresolvedChangeOrder: CloseoutTrailChangeOrder | null;
  warrantyOrServiceItemCount: number;
  scheduleHref: string;
  dailyLogsHref: string;
  fieldTrailHref: string;
  serviceWarrantyHref: string;
  projectId: string;
}): CloseoutTrailNextMove {
  if (input.unsignedContract) {
    return {
      label: "Review Signature Trail",
      href: `/contracts/${input.unsignedContract.id}`,
      reason:
        "The contract still needs signature follow-through before closeout."
    };
  }

  if (!input.latestContract) {
    return {
      label: "Review contract",
      href: "/contracts",
      reason: "No contract is connected yet, so closeout proof is incomplete."
    };
  }

  if (input.openJob) {
    return {
      label: "Review job or CrewBoard",
      href:
        input.openJob.dispatchStatus === "unscheduled" ||
        input.openJob.dispatchStatus === "scheduled"
          ? input.scheduleHref
          : `/jobs/${input.openJob.id}`,
      reason: "At least one job is still open before project closeout."
    };
  }

  if (input.fieldTrail.openBlockerCount > 0) {
    return {
      label: "Review FieldTrail",
      href: input.fieldTrailHref,
      reason: `${input.fieldTrail.openBlockerCount} open Job Note${
        input.fieldTrail.openBlockerCount === 1 ? "" : "s"
      } need attention.`
    };
  }

  if (input.completedJobs > 0 && input.fieldTrail.dailyLogCount === 0) {
    return {
      label: "Review Daily Job Logs",
      href: input.dailyLogsHref,
      reason: "Completed work has no Daily Job Log captured on the project yet."
    };
  }

  if (input.openInvoice) {
    return {
      label: "Review Payment Trail",
      href: `/invoices/${input.openInvoice.id}`,
      reason: "An invoice still has an open balance before closeout."
    };
  }

  if (input.unresolvedChangeOrder) {
    return {
      label: "Review change order",
      href: `/change-orders/${input.unresolvedChangeOrder.id}`,
      reason: "A project change order is still draft or sent."
    };
  }

  if (input.warrantyOrServiceItemCount > 0) {
    return {
      label: "Review warranty/service handoff",
      href: input.serviceWarrantyHref,
      reason:
        "Closeout signals are clear enough to review the connected warranty or service handoff."
    };
  }

  return {
    label: "Ready for closeout review",
    href: `/projects/${input.projectId}#closeouttrail`,
    reason:
      "The current records do not show a blocking closeout issue, so review the proof package."
  };
}

export function deriveCloseoutTrailSummary(
  input: CloseoutTrailInput
): CloseoutTrailSummary {
  const completedJobs = input.jobs.filter(isCompletedJob);
  const openJobs = input.jobs.filter(isOpenJob);
  const signedContracts = input.contracts.filter(isSignedContract);
  const latestContract = input.contracts[0] ?? null;
  const unsignedContract =
    input.contracts.find((contract) => !isSignedContract(contract)) ?? null;
  const openInvoices = input.invoices.filter(hasOpenBalance);
  const unresolvedChangeOrders = input.changeOrders.filter(
    isUnresolvedChangeOrder
  );
  const unpaidBalance = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );

  const checklistItems: CloseoutTrailChecklistItem[] = [
    buildChecklistItem({
      id: "contract",
      label: "Contract signed",
      state:
        signedContracts.length > 0
          ? "complete"
          : input.contracts.length > 0
            ? "blocked"
            : "unknown",
      detail:
        signedContracts.length > 0
          ? `${signedContracts.length} signed contract${
              signedContracts.length === 1 ? "" : "s"
            } connected.`
          : input.contracts.length > 0
            ? "Contract exists but signature is still open."
            : "No contract is connected yet.",
      href: latestContract ? `/contracts/${latestContract.id}` : "/contracts"
    }),
    buildChecklistItem({
      id: "jobs",
      label: "Jobs completed",
      state:
        input.jobs.length === 0
          ? "unknown"
          : openJobs.length > 0
            ? "attention"
            : "complete",
      detail:
        input.jobs.length === 0
          ? "No jobs are connected yet."
          : openJobs.length > 0
            ? `${openJobs.length} job${
                openJobs.length === 1 ? "" : "s"
              } still open.`
            : "All connected jobs are marked complete.",
      href: openJobs[0] ? `/jobs/${openJobs[0].id}` : input.scheduleHref
    }),
    buildChecklistItem({
      id: "daily_logs",
      label: "Daily Job Logs captured",
      state:
        input.fieldTrail.dailyLogCount > 0
          ? "complete"
          : completedJobs.length > 0
            ? "attention"
            : "unknown",
      detail:
        input.fieldTrail.dailyLogCount > 0
          ? `${input.fieldTrail.dailyLogCount} Daily Job Log${
              input.fieldTrail.dailyLogCount === 1 ? "" : "s"
            } captured.`
          : completedJobs.length > 0
            ? "Completed work has no Daily Job Log yet."
            : "Daily Job Logs will appear when field work is captured.",
      href: input.fieldTrail.latestDailyLog
        ? `/daily-logs/${input.fieldTrail.latestDailyLog.id}`
        : input.dailyLogsHref
    }),
    buildChecklistItem({
      id: "job_notes",
      label: "Job Notes resolved",
      state: input.fieldTrail.openBlockerCount > 0 ? "attention" : "complete",
      detail:
        input.fieldTrail.openBlockerCount > 0
          ? `${input.fieldTrail.openBlockerCount} open blocker or issue note${
              input.fieldTrail.openBlockerCount === 1 ? "" : "s"
            }.`
          : "No open blocker or issue notes are showing.",
      href: input.fieldTrailHref
    }),
    buildChecklistItem({
      id: "field_evidence",
      label: "Field evidence attached",
      state:
        input.fieldTrail.attachmentCount > 0
          ? "complete"
          : completedJobs.length > 0
            ? "attention"
            : "unknown",
      detail:
        input.fieldTrail.attachmentCount > 0
          ? `${input.fieldTrail.attachmentCount} evidence item${
              input.fieldTrail.attachmentCount === 1 ? "" : "s"
            } attached.`
          : completedJobs.length > 0
            ? "Completed work has no field evidence attached yet."
            : "Evidence will appear when Daily Job Logs or Job Notes have files.",
      href: input.fieldTrailHref
    }),
    buildChecklistItem({
      id: "change_orders",
      label: "Change orders resolved",
      state:
        input.changeOrders.length === 0
          ? "not_applicable"
          : unresolvedChangeOrders.length > 0
            ? "attention"
            : "complete",
      detail:
        input.changeOrders.length === 0
          ? "No change orders are connected."
          : unresolvedChangeOrders.length > 0
            ? `${unresolvedChangeOrders.length} change order${
                unresolvedChangeOrders.length === 1 ? "" : "s"
              } still draft or sent.`
            : "Connected change orders are resolved.",
      href: unresolvedChangeOrders[0]
        ? `/change-orders/${unresolvedChangeOrders[0].id}`
        : "/change-orders"
    }),
    buildChecklistItem({
      id: "invoices",
      label: "Invoices paid or open",
      state:
        input.invoices.length === 0
          ? "unknown"
          : openInvoices.length > 0
            ? "attention"
            : "complete",
      detail:
        input.invoices.length === 0
          ? "No invoices are connected yet."
          : openInvoices.length > 0
            ? `${openInvoices.length} invoice${
                openInvoices.length === 1 ? "" : "s"
              } still have an open balance.`
            : "Connected invoices do not show an open balance.",
      href: openInvoices[0] ? `/invoices/${openInvoices[0].id}` : "/invoices"
    }),
    buildChecklistItem({
      id: "customer_access",
      label: "Customer Access visible",
      state: input.customerAccessCount > 0 ? "complete" : "unknown",
      detail:
        input.customerAccessCount > 0
          ? `${input.customerAccessCount} customer contact${
              input.customerAccessCount === 1 ? "" : "s"
            } can access this project.`
          : "No active Customer Access is visible for this project.",
      href: input.messageCenterHref
    }),
    buildChecklistItem({
      id: "warranty_service",
      label: "Warranty/service handoff",
      state:
        input.warrantyOrServiceItemCount > 0 ? "complete" : "not_applicable",
      detail:
        input.warrantyOrServiceItemCount > 0
          ? `${input.warrantyOrServiceItemCount} warranty or service item${
              input.warrantyOrServiceItemCount === 1 ? "" : "s"
            } connected.`
          : "No warranty or service handoff is connected yet.",
      href: input.serviceWarrantyHref
    })
  ];

  const blockers = [
    ...(unsignedContract
      ? ["Contract signature is still open before closeout."]
      : []),
    ...(openJobs.length > 0
      ? [
          `${openJobs.length} job${openJobs.length === 1 ? "" : "s"} still open.`
        ]
      : []),
    ...(input.fieldTrail.openBlockerCount > 0
      ? [
          `${input.fieldTrail.openBlockerCount} Job Note${
            input.fieldTrail.openBlockerCount === 1 ? "" : "s"
          } need resolution.`
        ]
      : []),
    ...(openInvoices.length > 0
      ? [
          `${openInvoices.length} invoice${
            openInvoices.length === 1 ? "" : "s"
          } still have an open balance.`
        ]
      : []),
    ...(unresolvedChangeOrders.length > 0
      ? [
          `${unresolvedChangeOrders.length} change order${
            unresolvedChangeOrders.length === 1 ? "" : "s"
          } still need resolution.`
        ]
      : [])
  ];
  const highlights = [
    ...(signedContracts.length > 0
      ? ["Signature Trail has a signed contract."]
      : []),
    ...(completedJobs.length > 0
      ? [
          `${completedJobs.length} completed job${
            completedJobs.length === 1 ? "" : "s"
          } connected.`
        ]
      : []),
    ...(input.fieldTrail.dailyLogCount > 0
      ? [
          `${input.fieldTrail.dailyLogCount} Daily Job Log${
            input.fieldTrail.dailyLogCount === 1 ? "" : "s"
          } captured.`
        ]
      : []),
    ...(input.fieldTrail.attachmentCount > 0
      ? [
          `${input.fieldTrail.attachmentCount} field evidence item${
            input.fieldTrail.attachmentCount === 1 ? "" : "s"
          } attached.`
        ]
      : []),
    ...(input.messageCenter.latestActivityAt
      ? ["MessageCenter has connected communication history."]
      : [])
  ];
  const hasAttentionChecklist = checklistItems.some(
    (item) => item.state === "attention"
  );
  const hasUnknownRequiredChecklist = checklistItems.some(
    (item) =>
      item.state === "unknown" &&
      item.id !== "customer_access" &&
      item.id !== "warranty_service"
  );
  const closeoutTone: CloseoutTrailTone = blockers.some((blocker) =>
    blocker.includes("Contract signature")
  )
    ? "blocked"
    : blockers.length > 0 || hasAttentionChecklist
      ? "attention"
      : completedJobs.length > 0 && !hasUnknownRequiredChecklist
        ? "ready"
        : "neutral";
  const closeoutStatusLabel =
    closeoutTone === "blocked"
      ? "Blocked"
      : closeoutTone === "attention"
        ? "Needs review"
        : closeoutTone === "ready"
          ? "Ready for review"
          : "Building proof";
  const primaryMessage =
    closeoutTone === "blocked"
      ? "Closeout is blocked by a required agreement signal."
      : closeoutTone === "attention"
        ? "Closeout has a few records that need review."
        : closeoutTone === "ready"
          ? "Closeout proof looks ready from the current project records."
          : "Closeout proof will get clearer as field, billing, and handoff records connect.";

  return {
    closeoutTone,
    closeoutStatusLabel,
    primaryMessage,
    nextMove: buildNextMove({
      latestContract,
      unsignedContract,
      openJob: openJobs[0] ?? null,
      completedJobs: completedJobs.length,
      fieldTrail: input.fieldTrail,
      openInvoice: openInvoices[0] ?? null,
      unresolvedChangeOrder: unresolvedChangeOrders[0] ?? null,
      warrantyOrServiceItemCount: input.warrantyOrServiceItemCount,
      scheduleHref: input.scheduleHref,
      dailyLogsHref: input.dailyLogsHref,
      fieldTrailHref: input.fieldTrailHref,
      serviceWarrantyHref: input.serviceWarrantyHref,
      projectId: input.projectId
    }),
    checklistItems,
    blockers,
    highlights,
    linkedCounts: {
      completedJobs: completedJobs.length,
      openJobs: openJobs.length,
      unresolvedJobNotes: input.fieldTrail.openBlockerCount,
      dailyLogs: input.fieldTrail.dailyLogCount,
      evidenceItems: input.fieldTrail.attachmentCount,
      openInvoices: openInvoices.length,
      unpaidBalance,
      unresolvedChangeOrders: unresolvedChangeOrders.length,
      signedContracts: signedContracts.length,
      warrantyOrServiceItems: input.warrantyOrServiceItemCount
    }
  };
}
