import type { InvoiceStatus, InvoiceWorkflowRole } from "@floorconnector/types";

export type BillingReadinessTone = "neutral" | "attention" | "warning";

export type BillingReadinessLane =
  | "ready_to_invoice"
  | "missing_prerequisites"
  | "draft_review"
  | "already_in_billing";

export type BillingReadinessJobInput = {
  id: string;
  projectId: string | null;
  customerId?: string | null;
  scheduledDate: string | null;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName?: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
  } | null;
};

export type BillingReadinessInvoiceInput = {
  id: string;
  jobId?: string | null;
  projectId?: string | null;
  referenceNumber: string;
  workflowRole: InvoiceWorkflowRole;
  status: InvoiceStatus;
  balanceDueAmount: string;
  updatedAt: string;
};

export type BillingReadinessItem = {
  id: string;
  lane: BillingReadinessLane;
  tone: BillingReadinessTone;
  title: string;
  detail: string;
  customerName: string;
  projectName: string;
  sourceHref: string;
  sourceLabel: string;
  actionHref: string;
  actionLabel: string;
  invoiceReference: string | null;
  blockers: string[];
  updatedAt: string;
};

export type BillingReadinessSummaryCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: BillingReadinessTone;
};

export type BillingReadinessCommand = {
  summaryCards: BillingReadinessSummaryCard[];
  readyToInvoice: BillingReadinessItem[];
  missingPrerequisites: BillingReadinessItem[];
  draftReview: BillingReadinessItem[];
  alreadyInBilling: BillingReadinessItem[];
  nextMove: {
    label: string;
    href: string;
    reason: string;
  };
};

function hasOpenInvoice(invoice: BillingReadinessInvoiceInput) {
  return invoice.status !== "void";
}

function invoiceSort(left: BillingReadinessItem, right: BillingReadinessItem) {
  return right.updatedAt.localeCompare(left.updatedAt);
}

function buildInvoiceByJobId(invoices: BillingReadinessInvoiceInput[]) {
  const result = new Map<string, BillingReadinessInvoiceInput>();

  for (const invoice of invoices.filter(hasOpenInvoice)) {
    if (!invoice.jobId || result.has(invoice.jobId)) {
      continue;
    }

    result.set(invoice.jobId, invoice);
  }

  return result;
}

function getJobBlockers(job: BillingReadinessJobInput) {
  return [
    job.customer ? null : "Customer context is missing.",
    job.project ? null : "Project context is missing.",
    job.estimate
      ? null
      : "No estimate context is attached to this completed job."
  ].filter((blocker): blocker is string => Boolean(blocker));
}

function buildReadyJobItem(
  job: BillingReadinessJobInput,
  invoice: BillingReadinessInvoiceInput | null
): BillingReadinessItem {
  const blockers = getJobBlockers(job);
  const lane: BillingReadinessLane =
    blockers.length > 0
      ? "missing_prerequisites"
      : invoice
        ? "already_in_billing"
        : "ready_to_invoice";

  return {
    id: `job:${job.id}`,
    lane,
    tone:
      lane === "missing_prerequisites"
        ? "warning"
        : lane === "ready_to_invoice"
          ? "attention"
          : "neutral",
    title:
      lane === "ready_to_invoice"
        ? "Completed job ready for invoice review"
        : lane === "already_in_billing"
          ? "Completed job already has billing"
          : "Completed job missing billing prerequisites",
    detail: invoice
      ? `${invoice.referenceNumber} is already linked to this completed job.`
      : blockers.length > 0
        ? blockers[0]
        : "Completion, customer, project, and estimate context are present; review billing from the canonical invoice workflow.",
    customerName:
      job.customer?.companyName ?? job.customer?.name ?? "Unknown customer",
    projectName: job.project?.name ?? "No project",
    sourceHref: `/jobs/${job.id}`,
    sourceLabel: "Job Workspace",
    actionHref: invoice
      ? `/invoices/${invoice.id}`
      : `/invoices?jobId=${job.id}`,
    actionLabel: invoice ? "Open invoice" : "Review invoice creation",
    invoiceReference: invoice?.referenceNumber ?? null,
    blockers,
    updatedAt: job.updatedAt
  };
}

function buildDraftInvoiceItem(
  invoice: BillingReadinessInvoiceInput
): BillingReadinessItem {
  return {
    id: `invoice:${invoice.id}`,
    lane: "draft_review",
    tone: "attention",
    title: "Draft invoice needs billing review",
    detail:
      invoice.workflowRole === "deposit"
        ? "Deposit draft is part of readiness-sensitive billing; review before sending."
        : "Draft invoice is not collectible until reviewed and sent.",
    customerName: "Canonical invoice",
    projectName: invoice.projectId ? "Project-linked invoice" : "No project",
    sourceHref: `/invoices/${invoice.id}`,
    sourceLabel: "Invoice Workspace",
    actionHref: `/invoices/${invoice.id}`,
    actionLabel: "Open draft",
    invoiceReference: invoice.referenceNumber,
    blockers: [],
    updatedAt: invoice.updatedAt
  };
}

function buildSummaryCards(input: {
  readyToInvoice: BillingReadinessItem[];
  missingPrerequisites: BillingReadinessItem[];
  draftReview: BillingReadinessItem[];
  alreadyInBilling: BillingReadinessItem[];
}): BillingReadinessSummaryCard[] {
  return [
    {
      id: "ready-to-invoice",
      label: "Ready to invoice",
      value: String(input.readyToInvoice.length),
      detail:
        input.readyToInvoice.length > 0
          ? "Completed jobs have enough canonical context for billing review."
          : "No completed jobs are waiting for invoice review.",
      tone: input.readyToInvoice.length > 0 ? "attention" : "neutral"
    },
    {
      id: "missing-prerequisites",
      label: "Missing prerequisites",
      value: String(input.missingPrerequisites.length),
      detail:
        input.missingPrerequisites.length > 0
          ? "Completed work is blocked by missing billing context."
          : "No completed jobs are missing billing prerequisites.",
      tone: input.missingPrerequisites.length > 0 ? "warning" : "neutral"
    },
    {
      id: "draft-review",
      label: "Draft review",
      value: String(input.draftReview.length),
      detail:
        input.draftReview.length > 0
          ? "Draft invoices need review before collection can begin."
          : "No draft invoices are waiting in the billing review lane.",
      tone: input.draftReview.length > 0 ? "attention" : "neutral"
    },
    {
      id: "already-in-billing",
      label: "Already in billing",
      value: String(input.alreadyInBilling.length),
      detail:
        input.alreadyInBilling.length > 0
          ? "Completed jobs already have linked canonical invoice records."
          : "No completed jobs have linked billing in this read model.",
      tone: "neutral"
    }
  ];
}

export function buildBillingReadinessCommand(input: {
  completedJobs: BillingReadinessJobInput[];
  invoices: BillingReadinessInvoiceInput[];
}): BillingReadinessCommand {
  const invoiceByJobId = buildInvoiceByJobId(input.invoices);
  const jobItems = input.completedJobs.map((job) =>
    buildReadyJobItem(job, invoiceByJobId.get(job.id) ?? null)
  );
  const draftReview = input.invoices
    .filter((invoice) => invoice.status === "draft")
    .map(buildDraftInvoiceItem)
    .sort(invoiceSort);
  const readyToInvoice = jobItems
    .filter((item) => item.lane === "ready_to_invoice")
    .sort(invoiceSort);
  const missingPrerequisites = jobItems
    .filter((item) => item.lane === "missing_prerequisites")
    .sort(invoiceSort);
  const alreadyInBilling = jobItems
    .filter((item) => item.lane === "already_in_billing")
    .sort(invoiceSort);
  const nextItem =
    missingPrerequisites[0] ?? readyToInvoice[0] ?? draftReview[0];

  return {
    summaryCards: buildSummaryCards({
      readyToInvoice,
      missingPrerequisites,
      draftReview,
      alreadyInBilling
    }),
    readyToInvoice: readyToInvoice.slice(0, 8),
    missingPrerequisites: missingPrerequisites.slice(0, 8),
    draftReview: draftReview.slice(0, 8),
    alreadyInBilling: alreadyInBilling.slice(0, 8),
    nextMove: nextItem
      ? {
          label: nextItem.actionLabel,
          href: nextItem.actionHref,
          reason: nextItem.detail
        }
      : {
          label: "Review invoices",
          href: "/invoices",
          reason:
            "No completed-job billing readiness or draft invoice review item is active."
        }
  };
}
