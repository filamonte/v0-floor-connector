export type PortalSafeStatusTone = "neutral" | "attention" | "complete";

export type PortalSafeStatusSourceCategory =
  | "project"
  | "estimate"
  | "contract"
  | "change_order"
  | "invoice"
  | "payment"
  | "schedule"
  | "none";

export type PortalSafeStatusExplanation = {
  headline: string;
  shortExplanation: string;
  customerActionLabel: string | null;
  customerActionHref: string | null;
  statusTone: PortalSafeStatusTone;
  sourceCategory: PortalSafeStatusSourceCategory;
  safeNextStep: string;
};

type PortalSafeStatusEstimate = {
  id: string;
  status: string;
  referenceNumber?: string | null;
  updatedAt?: string | null;
};

type PortalSafeStatusContract = {
  id: string;
  status: string;
  title?: string | null;
  currentUserCanSign?: boolean;
  customerSignedAt?: string | null;
  contractorCountersignedAt?: string | null;
  sentAt?: string | null;
  updatedAt?: string | null;
};

type PortalSafeStatusChangeOrder = {
  id: string;
  status: string;
  title?: string | null;
  updatedAt?: string | null;
};

type PortalSafeStatusInvoice = {
  id: string;
  status: string;
  referenceNumber?: string | null;
  workflowRole?: string | null;
  balanceDueAmount?: string | number | null;
  latestPaymentEventType?: string | null;
  latestPaymentEventAt?: string | null;
  updatedAt?: string | null;
};

type PortalSafeStatusJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  updatedAt?: string | null;
};

export type PortalSafeStatusExplanationInput = {
  projectId: string;
  projectName?: string | null;
  projectStatus?: string | null;
  estimates?: PortalSafeStatusEstimate[];
  contracts?: PortalSafeStatusContract[];
  changeOrders?: PortalSafeStatusChangeOrder[];
  invoices?: PortalSafeStatusInvoice[];
  jobs?: PortalSafeStatusJob[];
};

function getSortTimestamp(value: string | null | undefined) {
  return value ? new Date(value).getTime() || 0 : 0;
}

function getMostRecent<T extends { updatedAt?: string | null }>(
  items: T[]
): T | null {
  return (
    [...items].sort(
      (left, right) =>
        getSortTimestamp(right.updatedAt) - getSortTimestamp(left.updatedAt)
    )[0] ?? null
  );
}

function hasOpenBalance(invoice: PortalSafeStatusInvoice) {
  return Number(invoice.balanceDueAmount ?? 0) > 0;
}

function isOpenInvoice(invoice: PortalSafeStatusInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_requested" ||
    invoice.latestPaymentEventType === "checkout_started" ||
    invoice.latestPaymentEventType === "payment_failed" ||
    (invoice.status !== "paid" &&
      invoice.status !== "void" &&
      hasOpenBalance(invoice))
  );
}

function isInvoiceSettled(invoice: PortalSafeStatusInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_succeeded" ||
    invoice.status === "paid" ||
    !hasOpenBalance(invoice)
  );
}

function hasSignedContract(contracts: PortalSafeStatusContract[]) {
  return contracts.some(
    (contract) =>
      contract.status === "signed" ||
      (contract.customerSignedAt && contract.contractorCountersignedAt)
  );
}

function hasApprovedEstimate(estimates: PortalSafeStatusEstimate[]) {
  return estimates.some((estimate) => estimate.status === "approved");
}

function hasActiveSchedule(jobs: PortalSafeStatusJob[]) {
  return jobs.some((job) =>
    ["scheduled", "in_progress", "completed"].includes(job.dispatchStatus)
  );
}

function projectLabel(input: PortalSafeStatusExplanationInput) {
  return input.projectName?.trim() || "Your project";
}

export function derivePortalSafeStatusExplanation(
  input: PortalSafeStatusExplanationInput
): PortalSafeStatusExplanation {
  const contracts = input.contracts ?? [];
  const invoices = input.invoices ?? [];
  const jobs = input.jobs ?? [];
  const estimates = input.estimates ?? [];
  const changeOrders = input.changeOrders ?? [];

  const sentEstimate = getMostRecent(
    estimates.filter((estimate) => estimate.status === "sent")
  );

  if (sentEstimate) {
    return {
      headline: "Estimate ready for review",
      shortExplanation:
        "Your contractor shared a proposal for this project. Reviewing it keeps the same project record moving forward.",
      customerActionLabel: "Review estimate",
      customerActionHref: `/portal/estimates/${sentEstimate.id}`,
      statusTone: "attention",
      sourceCategory: "estimate",
      safeNextStep:
        "Review the shared estimate and approve it or request changes from the portal."
    };
  }

  const activeContract = getMostRecent(
    contracts.filter(
      (contract) => contract.status !== "signed" && contract.status !== "void"
    )
  );

  if (activeContract) {
    const canSign = Boolean(activeContract.currentUserCanSign);

    return {
      headline: canSign
        ? "Contract ready for signature"
        : "Contract ready for review",
      shortExplanation: canSign
        ? "This contract is waiting for your signature on the shared project record."
        : "A contract is shared for this project and may still be moving through review.",
      customerActionLabel: canSign ? "Sign contract" : "Review contract",
      customerActionHref: `/portal/contracts/${activeContract.id}`,
      statusTone: "attention",
      sourceCategory: "contract",
      safeNextStep: canSign
        ? "Open the contract, review the terms, and sign when ready."
        : "Open the contract to review the latest shared status."
    };
  }

  const pendingChangeOrder = getMostRecent(
    changeOrders.filter((changeOrder) => changeOrder.status === "sent")
  );

  if (pendingChangeOrder) {
    return {
      headline: "Change order ready for review",
      shortExplanation:
        "A scope or price change is shared for your decision on this same project.",
      customerActionLabel: "Review change order",
      customerActionHref: `/portal/change-orders/${pendingChangeOrder.id}`,
      statusTone: "attention",
      sourceCategory: "change_order",
      safeNextStep:
        "Open the change order to approve it or send it back for contractor follow-up."
    };
  }

  const paymentInProgressInvoice = getMostRecent(
    invoices.filter(
      (invoice) => invoice.latestPaymentEventType === "checkout_started"
    )
  );

  if (paymentInProgressInvoice) {
    return {
      headline: "Payment in progress",
      shortExplanation:
        "Checkout activity has started for a shared invoice. Open the invoice for the current payment status.",
      customerActionLabel: "Review payment",
      customerActionHref: `/portal/invoices/${paymentInProgressInvoice.id}`,
      statusTone: "attention",
      sourceCategory: "payment",
      safeNextStep:
        "Open the invoice to confirm whether checkout is still in progress or needs another attempt."
    };
  }

  const paymentNeedsReviewInvoice = getMostRecent(
    invoices.filter(
      (invoice) => invoice.latestPaymentEventType === "payment_failed"
    )
  );

  if (paymentNeedsReviewInvoice) {
    return {
      headline: "Payment needs review",
      shortExplanation:
        "A recent payment attempt did not complete for a shared invoice. Open the invoice for the current customer-safe status.",
      customerActionLabel: "Review payment",
      customerActionHref: `/portal/invoices/${paymentNeedsReviewInvoice.id}`,
      statusTone: "attention",
      sourceCategory: "payment",
      safeNextStep:
        "Open the invoice to review the payment status and available next action."
    };
  }

  const openInvoice = getMostRecent(invoices.filter(isOpenInvoice));

  if (openInvoice) {
    const isPartiallyPaid = openInvoice.status === "partially_paid";

    return {
      headline: isPartiallyPaid
        ? "Payment partially complete"
        : "Payment requested",
      shortExplanation: isPartiallyPaid
        ? "A payment has been recorded, and this invoice still shows a remaining balance."
        : "A shared invoice has an open balance or payment request for this project.",
      customerActionLabel: "Review or pay invoice",
      customerActionHref: `/portal/invoices/${openInvoice.id}`,
      statusTone: "attention",
      sourceCategory: "invoice",
      safeNextStep:
        "Open the invoice to review the balance, payment status, and available payment action."
    };
  }

  const inProgressJob = getMostRecent(
    jobs.filter((job) => job.dispatchStatus === "in_progress")
  );

  if (inProgressJob) {
    return {
      headline: "Work is in progress",
      shortExplanation:
        "Your contractor has marked work as underway on this project.",
      customerActionLabel: null,
      customerActionHref: null,
      statusTone: "neutral",
      sourceCategory: "schedule",
      safeNextStep:
        "Check this project workspace for shared documents, schedule context, and billing updates."
    };
  }

  const scheduledJob = getMostRecent(
    jobs.filter(
      (job) =>
        job.dispatchStatus === "scheduled" ||
        Boolean(job.scheduledStartAt || job.scheduledDate)
    )
  );

  if (scheduledJob) {
    return {
      headline: "Work is scheduled",
      shortExplanation:
        "The project has scheduled work visible from the shared project record.",
      customerActionLabel: null,
      customerActionHref: null,
      statusTone: "neutral",
      sourceCategory: "schedule",
      safeNextStep:
        "Review the project workspace for the latest shared schedule and document status."
    };
  }

  const allInvoicesSettled =
    invoices.length === 0 || invoices.every(isInvoiceSettled);
  const latestCompletedJob = getMostRecent(
    jobs.filter((job) => job.dispatchStatus === "completed")
  );

  if (latestCompletedJob && allInvoicesSettled) {
    return {
      headline: "Project records are current",
      shortExplanation:
        "The latest shared work and billing records do not need customer action right now.",
      customerActionLabel: null,
      customerActionHref: null,
      statusTone: "complete",
      sourceCategory: "project",
      safeNextStep:
        "Keep this project workspace available for shared documents, warranty records, or future updates."
    };
  }

  if (
    (hasSignedContract(contracts) || hasApprovedEstimate(estimates)) &&
    allInvoicesSettled &&
    !hasActiveSchedule(jobs)
  ) {
    return {
      headline: "Your project is ready for scheduling",
      shortExplanation:
        "The shared commercial records are current, and the next visible step is scheduling work with your contractor.",
      customerActionLabel: null,
      customerActionHref: null,
      statusTone: "neutral",
      sourceCategory: "schedule",
      safeNextStep:
        "Watch this project workspace for schedule updates from your contractor."
    };
  }

  return {
    headline: "Project records are being prepared",
    shortExplanation: `${projectLabel(input)} is shared in your portal, but there is no customer action open right now.`,
    customerActionLabel: null,
    customerActionHref: null,
    statusTone: "neutral",
    sourceCategory: "none",
    safeNextStep:
      "Check back here for shared estimates, contracts, invoices, schedule updates, or warranty records."
  };
}
