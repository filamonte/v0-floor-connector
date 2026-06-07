import {
  derivePortalCustomerNextStep,
  type PortalCustomerNextStep
} from "./next-step";

export type PortalProjectStatusTone = "neutral" | "attention" | "complete";

export type PortalProjectStatusRecordType =
  | "estimate"
  | "contract"
  | "invoice"
  | "change_order";

export type PortalProjectStageKey =
  | "project"
  | "estimate"
  | "contract"
  | "change_order"
  | "invoice"
  | "schedule";

export type PortalProjectStageState =
  | "complete"
  | "current"
  | "waiting"
  | "not_shared";

export type PortalProjectStage = {
  key: PortalProjectStageKey;
  label: string;
  state: PortalProjectStageState;
  statusLabel: string;
  helperText: string;
  tone: PortalProjectStatusTone;
  href?: string;
  customerActionRequired?: boolean;
};

export type PortalProjectStatusRecord = {
  id: string;
  type: PortalProjectStatusRecordType;
  typeLabel: string;
  title: string;
  statusLabel: string;
  helperText: string;
  href: string;
  tone: PortalProjectStatusTone;
  updatedAt?: string | null;
};

export type PortalProjectStatusAttentionItem = {
  label: string;
  description: string;
  href: string;
  tone: PortalProjectStatusTone;
  source: PortalProjectStatusRecordType | "project";
};

type PortalStatusEstimate = {
  id: string;
  referenceNumber?: string | null;
  status: string;
  totalAmount?: string | number | null;
  updatedAt?: string | null;
};

type PortalStatusContract = {
  id: string;
  title?: string | null;
  status: string;
  customerViewedAt?: string | null;
  customerSignedAt?: string | null;
  contractorCountersignedAt?: string | null;
  sentAt?: string | null;
  signedAt?: string | null;
  updatedAt?: string | null;
};

type PortalStatusInvoice = {
  id: string;
  referenceNumber?: string | null;
  workflowRole?: string | null;
  status: string;
  totalAmount?: string | number | null;
  balanceDueAmount?: string | number | null;
  latestPaymentEventType?: string | null;
  latestPaymentEventAt?: string | null;
  updatedAt?: string | null;
};

type PortalStatusChangeOrder = {
  id: string;
  title?: string | null;
  status: string;
  priceAdjustment?: string | number | null;
  updatedAt?: string | null;
};

type PortalStatusJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  updatedAt?: string | null;
};

export type PortalProjectStatusWindowInput = {
  projectId: string;
  projectName?: string | null;
  projectStatus?: string | null;
  estimates?: PortalStatusEstimate[];
  contracts?: PortalStatusContract[];
  invoices?: PortalStatusInvoice[];
  changeOrders?: PortalStatusChangeOrder[];
  jobs?: PortalStatusJob[];
};

export type PortalProjectStatusWindow = {
  statusLabel: string;
  statusTone: PortalProjectStatusTone;
  primaryMessage: string;
  customerNextStep: PortalCustomerNextStep;
  currentStage: PortalProjectStage;
  stageSummary: PortalProjectStage[];
  sharedRecords: PortalProjectStatusRecord[];
  attentionItems: PortalProjectStatusAttentionItem[];
  completedItems: PortalProjectStatusAttentionItem[];
  emptyStateMessage: string;
};

function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatMoneyLabel(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function isOpenInvoice(invoice: PortalStatusInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_requested" ||
    invoice.latestPaymentEventType === "checkout_started" ||
    invoice.latestPaymentEventType === "payment_failed" ||
    (invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount ?? 0) > 0)
  );
}

function getRecordRank(record: PortalProjectStatusRecord) {
  switch (record.type) {
    case "estimate":
      return 0;
    case "contract":
      return 1;
    case "change_order":
      return 2;
    case "invoice":
      return 3;
  }
}

function sortRecords(records: PortalProjectStatusRecord[]) {
  return [...records].sort((left, right) => {
    const rankDelta = getRecordRank(left) - getRecordRank(right);

    if (rankDelta !== 0) {
      return rankDelta;
    }

    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;

    return rightTime - leftTime;
  });
}

function sortByMostRecent<T extends { updatedAt?: string | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;

    return rightTime - leftTime;
  });
}

function getMostRecent<T extends { updatedAt?: string | null }>(
  items: T[]
): T | null {
  return sortByMostRecent(items)[0] ?? null;
}

function mapEstimates(
  estimates: PortalStatusEstimate[]
): PortalProjectStatusRecord[] {
  return estimates.map((estimate) => {
    const total = formatMoneyLabel(estimate.totalAmount);
    const isPending = estimate.status === "sent";
    const isComplete = estimate.status === "approved";

    return {
      id: estimate.id,
      type: "estimate",
      typeLabel: "Estimate",
      title: estimate.referenceNumber ?? "Estimate",
      statusLabel: formatStatusLabel(estimate.status),
      helperText: isPending
        ? "Review this proposal and approve or request changes."
        : isComplete
          ? "This proposal has been approved."
          : "This proposal is shared for review.",
      href: `/portal/estimates/${estimate.id}`,
      tone: isPending ? "attention" : isComplete ? "complete" : "neutral",
      updatedAt: estimate.updatedAt,
      ...(total
        ? {
            helperText: `${isPending ? "Review this proposal and approve or request changes." : isComplete ? "This proposal has been approved." : "This proposal is shared for review."} Total ${total}.`
          }
        : {})
    };
  });
}

function mapContracts(
  contracts: PortalStatusContract[]
): PortalProjectStatusRecord[] {
  return contracts.map((contract) => {
    const isComplete = contract.status === "signed";
    const isAttention =
      contract.status !== "signed" && contract.status !== "void";
    const helperText = isComplete
      ? "Contract signing is complete."
      : contract.customerSignedAt && !contract.contractorCountersignedAt
        ? "Your signature is recorded. Contractor countersign may still be pending."
        : contract.customerViewedAt
          ? "This contract has been viewed and is still in motion."
          : contract.sentAt
            ? "This contract is waiting for review or signature."
            : "This contract is shared for review.";

    return {
      id: contract.id,
      type: "contract",
      typeLabel: "Contract",
      title: contract.title ?? "Contract",
      statusLabel: formatStatusLabel(contract.status),
      helperText,
      href: `/portal/contracts/${contract.id}`,
      tone: isAttention ? "attention" : isComplete ? "complete" : "neutral",
      updatedAt: contract.updatedAt
    };
  });
}

function mapChangeOrders(
  changeOrders: PortalStatusChangeOrder[]
): PortalProjectStatusRecord[] {
  return changeOrders.map((changeOrder) => {
    const adjustment = formatMoneyLabel(changeOrder.priceAdjustment);
    const isPending = changeOrder.status === "sent";
    const isComplete = changeOrder.status === "approved";

    return {
      id: changeOrder.id,
      type: "change_order",
      typeLabel: "Change order",
      title: changeOrder.title ?? "Change order",
      statusLabel: formatStatusLabel(changeOrder.status),
      helperText: isPending
        ? `Review this scope change${adjustment ? ` (${adjustment})` : ""}.`
        : isComplete
          ? "This change order has been approved."
          : changeOrder.status === "rejected"
            ? "This change order was rejected."
            : "This scope change is shared for review.",
      href: `/portal/change-orders/${changeOrder.id}`,
      tone: isPending ? "attention" : isComplete ? "complete" : "neutral",
      updatedAt: changeOrder.updatedAt
    };
  });
}

function mapInvoices(
  invoices: PortalStatusInvoice[]
): PortalProjectStatusRecord[] {
  return invoices.map((invoice) => {
    const balance = formatMoneyLabel(invoice.balanceDueAmount);
    const isAttention = isOpenInvoice(invoice);
    const isComplete =
      invoice.status === "paid" || Number(invoice.balanceDueAmount ?? 0) <= 0;
    const isDeposit = invoice.workflowRole === "deposit";
    const helperText =
      invoice.latestPaymentEventType === "payment_failed"
        ? "A recent payment attempt failed. Review this invoice."
        : invoice.latestPaymentEventType === "checkout_started"
          ? "Payment is currently in progress."
          : invoice.latestPaymentEventType === "payment_requested"
            ? "Payment has been requested."
            : isComplete
              ? isDeposit
                ? "Deposit is fully paid."
                : "Invoice is fully paid."
              : `${isDeposit ? "Deposit" : "Invoice"} balance due${balance ? `: ${balance}` : ""}.`;

    return {
      id: invoice.id,
      type: "invoice",
      typeLabel: isDeposit ? "Deposit invoice" : "Invoice",
      title: invoice.referenceNumber ?? "Invoice",
      statusLabel: formatStatusLabel(invoice.status),
      helperText,
      href: `/portal/invoices/${invoice.id}`,
      tone: isAttention ? "attention" : isComplete ? "complete" : "neutral",
      updatedAt: invoice.updatedAt
    };
  });
}

function toAttentionItem(
  record: PortalProjectStatusRecord
): PortalProjectStatusAttentionItem {
  return {
    label:
      record.type === "invoice"
        ? "Review or pay invoice"
        : record.type === "contract"
          ? "Review contract"
          : record.type === "change_order"
            ? "Review change order"
            : "Review estimate",
    description: `${record.typeLabel}: ${record.helperText}`,
    href: record.href,
    tone: record.tone,
    source: record.type
  };
}

function toCompletedItem(
  record: PortalProjectStatusRecord
): PortalProjectStatusAttentionItem {
  return {
    label: `${record.typeLabel} complete`,
    description: `${record.title}: ${record.helperText}`,
    href: record.href,
    tone: "complete",
    source: record.type
  };
}

function deriveProjectStage(input: PortalProjectStatusWindowInput) {
  return {
    key: "project",
    label: "Project shared",
    state: "complete",
    statusLabel: formatStatusLabel(input.projectStatus),
    helperText:
      "This customer portal workspace is connected to the shared project record.",
    tone: "complete",
    href: `/portal/projects/${input.projectId}`
  } satisfies PortalProjectStage;
}

function deriveEstimateStage(
  estimates: PortalStatusEstimate[]
): PortalProjectStage {
  const sentEstimate = getMostRecent(
    estimates.filter((estimate) => estimate.status === "sent")
  );

  if (sentEstimate) {
    return {
      key: "estimate",
      label: "Estimate",
      state: "current",
      statusLabel: "Ready for review",
      helperText:
        "The proposal is shared and waiting for your approval or revision request.",
      tone: "attention",
      href: `/portal/estimates/${sentEstimate.id}`,
      customerActionRequired: true
    };
  }

  const approvedEstimate = getMostRecent(
    estimates.filter((estimate) => estimate.status === "approved")
  );

  if (approvedEstimate) {
    return {
      key: "estimate",
      label: "Estimate",
      state: "complete",
      statusLabel: "Approved",
      helperText:
        "Your approved proposal remains connected to the next shared project steps.",
      tone: "complete",
      href: `/portal/estimates/${approvedEstimate.id}`
    };
  }

  const latestEstimate = getMostRecent(estimates);

  if (latestEstimate) {
    return {
      key: "estimate",
      label: "Estimate",
      state: latestEstimate.status === "rejected" ? "waiting" : "current",
      statusLabel: formatStatusLabel(latestEstimate.status),
      helperText:
        latestEstimate.status === "rejected"
          ? "The proposal was sent back for contractor follow-up."
          : "A proposal record is shared for this project.",
      tone: latestEstimate.status === "rejected" ? "neutral" : "attention",
      href: `/portal/estimates/${latestEstimate.id}`,
      customerActionRequired: latestEstimate.status !== "rejected"
    };
  }

  return {
    key: "estimate",
    label: "Estimate",
    state: "not_shared",
    statusLabel: "Not shared yet",
    helperText:
      "Proposal details will appear here when your contractor shares them.",
    tone: "neutral"
  };
}

function deriveContractStage(
  contracts: PortalStatusContract[],
  estimateStage: PortalProjectStage
): PortalProjectStage {
  const activeContract = getMostRecent(
    contracts.filter(
      (contract) => contract.status !== "signed" && contract.status !== "void"
    )
  );

  if (activeContract) {
    return {
      key: "contract",
      label: "Contract",
      state: "current",
      statusLabel: formatStatusLabel(activeContract.status),
      helperText: activeContract.customerSignedAt
        ? "Your signature is recorded. Contractor countersign may still be pending."
        : "The contract is shared for review or signature.",
      tone: "attention",
      href: `/portal/contracts/${activeContract.id}`,
      customerActionRequired: !activeContract.customerSignedAt
    };
  }

  const signedContract = getMostRecent(
    contracts.filter((contract) => contract.status === "signed")
  );

  if (signedContract) {
    return {
      key: "contract",
      label: "Contract",
      state: "complete",
      statusLabel: "Signed",
      helperText: "Contract signing is complete for the shared project record.",
      tone: "complete",
      href: `/portal/contracts/${signedContract.id}`
    };
  }

  if (estimateStage.state === "complete") {
    return {
      key: "contract",
      label: "Contract",
      state: "waiting",
      statusLabel: "Waiting on contractor",
      helperText:
        "Your approved estimate is on record. A contract will appear here when it is shared.",
      tone: "neutral"
    };
  }

  return {
    key: "contract",
    label: "Contract",
    state: "not_shared",
    statusLabel: "Not shared yet",
    helperText:
      "Contract status will appear here when your contractor shares it.",
    tone: "neutral"
  };
}

function deriveChangeOrderStage(
  changeOrders: PortalStatusChangeOrder[]
): PortalProjectStage {
  const pendingChangeOrder = getMostRecent(
    changeOrders.filter((changeOrder) => changeOrder.status === "sent")
  );

  if (pendingChangeOrder) {
    return {
      key: "change_order",
      label: "Changes",
      state: "current",
      statusLabel: "Ready for review",
      helperText: "A scope or price change is waiting for your decision.",
      tone: "attention",
      href: `/portal/change-orders/${pendingChangeOrder.id}`,
      customerActionRequired: true
    };
  }

  const latestChangeOrder = getMostRecent(changeOrders);

  if (latestChangeOrder) {
    const isApproved = latestChangeOrder.status === "approved";

    return {
      key: "change_order",
      label: "Changes",
      state: isApproved ? "complete" : "waiting",
      statusLabel: formatStatusLabel(latestChangeOrder.status),
      helperText: isApproved
        ? "The latest shared change order has been approved."
        : "The latest shared change order is recorded for contractor follow-up.",
      tone: isApproved ? "complete" : "neutral",
      href: `/portal/change-orders/${latestChangeOrder.id}`
    };
  }

  return {
    key: "change_order",
    label: "Changes",
    state: "not_shared",
    statusLabel: "None shared",
    helperText:
      "Scope changes will appear here only if your contractor shares them.",
    tone: "neutral"
  };
}

function deriveInvoiceStage(
  invoices: PortalStatusInvoice[],
  contractStage: PortalProjectStage,
  estimateStage: PortalProjectStage
): PortalProjectStage {
  const openInvoice = getMostRecent(invoices.filter(isOpenInvoice));

  if (openInvoice) {
    return {
      key: "invoice",
      label: "Billing",
      state: "current",
      statusLabel:
        openInvoice.latestPaymentEventType === "payment_failed"
          ? "Payment needs review"
          : "Open balance",
      helperText:
        "A shared invoice has an open balance, payment request, or payment status to review.",
      tone: "attention",
      href: `/portal/invoices/${openInvoice.id}`,
      customerActionRequired: true
    };
  }

  const settledInvoice = getMostRecent(
    invoices.filter(
      (invoice) =>
        invoice.status === "paid" || Number(invoice.balanceDueAmount ?? 0) <= 0
    )
  );

  if (settledInvoice) {
    return {
      key: "invoice",
      label: "Billing",
      state: "complete",
      statusLabel: "Current",
      helperText: "The latest shared invoice is paid or has no open balance.",
      tone: "complete",
      href: `/portal/invoices/${settledInvoice.id}`
    };
  }

  if (invoices.length > 0) {
    const latestInvoice = getMostRecent(invoices);

    return {
      key: "invoice",
      label: "Billing",
      state: "waiting",
      statusLabel: formatStatusLabel(latestInvoice?.status),
      helperText:
        "A billing record is shared, but no customer payment action is open.",
      tone: "neutral",
      href: latestInvoice ? `/portal/invoices/${latestInvoice.id}` : undefined
    };
  }

  if (
    contractStage.state === "complete" ||
    estimateStage.state === "complete"
  ) {
    return {
      key: "invoice",
      label: "Billing",
      state: "waiting",
      statusLabel: "Not requested yet",
      helperText:
        "Invoices or deposits will appear here when your contractor shares them.",
      tone: "neutral"
    };
  }

  return {
    key: "invoice",
    label: "Billing",
    state: "not_shared",
    statusLabel: "Not shared yet",
    helperText: "Billing records will appear here when they are shared.",
    tone: "neutral"
  };
}

function deriveScheduleStage(
  jobs: PortalStatusJob[],
  contractStage: PortalProjectStage,
  estimateStage: PortalProjectStage
): PortalProjectStage {
  const activeJob = getMostRecent(
    jobs.filter((job) => job.dispatchStatus === "in_progress")
  );

  if (activeJob) {
    return {
      key: "schedule",
      label: "Schedule / work",
      state: "current",
      statusLabel: "Work in progress",
      helperText:
        "Your contractor has marked work as underway on this shared project.",
      tone: "neutral"
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
      key: "schedule",
      label: "Schedule / work",
      state: "current",
      statusLabel: "Scheduled",
      helperText:
        "A customer-safe schedule update is visible for this project.",
      tone: "neutral"
    };
  }

  const completedJob = getMostRecent(
    jobs.filter((job) => job.dispatchStatus === "completed")
  );

  if (completedJob) {
    return {
      key: "schedule",
      label: "Schedule / work",
      state: "complete",
      statusLabel: "Work complete",
      helperText:
        "The latest shared work status is complete. Closeout or warranty records may follow.",
      tone: "complete"
    };
  }

  if (
    contractStage.state === "complete" ||
    estimateStage.state === "complete"
  ) {
    return {
      key: "schedule",
      label: "Schedule / work",
      state: "waiting",
      statusLabel: "Waiting on contractor",
      helperText:
        "Schedule or work updates will appear when your contractor shares them.",
      tone: "neutral"
    };
  }

  return {
    key: "schedule",
    label: "Schedule / work",
    state: "not_shared",
    statusLabel: "Not shared yet",
    helperText: "Schedule visibility will appear here when it is shared.",
    tone: "neutral"
  };
}

function deriveStageSummary(
  input: PortalProjectStatusWindowInput
): PortalProjectStage[] {
  const projectStage = deriveProjectStage(input);
  const estimateStage = deriveEstimateStage(input.estimates ?? []);
  const contractStage = deriveContractStage(
    input.contracts ?? [],
    estimateStage
  );
  const changeOrderStage = deriveChangeOrderStage(input.changeOrders ?? []);
  const invoiceStage = deriveInvoiceStage(
    input.invoices ?? [],
    contractStage,
    estimateStage
  );
  const scheduleStage = deriveScheduleStage(
    input.jobs ?? [],
    contractStage,
    estimateStage
  );

  return [
    projectStage,
    estimateStage,
    contractStage,
    changeOrderStage,
    invoiceStage,
    scheduleStage
  ];
}

function selectCurrentStage(stages: PortalProjectStage[]) {
  return (
    stages.find((stage) => stage.customerActionRequired) ??
    [...stages].reverse().find((stage) => stage.state === "current") ??
    stages.find((stage) => stage.state === "waiting") ??
    [...stages].reverse().find((stage) => stage.state === "complete") ??
    stages[0]
  );
}

export function derivePortalProjectStatusWindow(
  input: PortalProjectStatusWindowInput
): PortalProjectStatusWindow {
  const customerNextStep = derivePortalCustomerNextStep({
    projectId: input.projectId,
    projectName: input.projectName,
    estimates: input.estimates,
    contracts: input.contracts,
    changeOrders: input.changeOrders,
    invoices: input.invoices
  });
  const sharedRecords = sortRecords([
    ...mapEstimates(input.estimates ?? []),
    ...mapContracts(input.contracts ?? []),
    ...mapChangeOrders(input.changeOrders ?? []),
    ...mapInvoices(input.invoices ?? [])
  ]);
  const attentionItems = sharedRecords
    .filter((record) => record.tone === "attention")
    .map(toAttentionItem);
  const completedItems = sharedRecords
    .filter((record) => record.tone === "complete")
    .map(toCompletedItem);
  const projectStatusLabel = formatStatusLabel(input.projectStatus);
  const stageSummary = deriveStageSummary(input);
  const currentStage = selectCurrentStage(stageSummary);

  if (sharedRecords.length === 0) {
    return {
      statusLabel: projectStatusLabel,
      statusTone: "neutral",
      primaryMessage:
        "Your contractor has shared the project workspace. No estimate, contract, invoice, or change order is available here yet.",
      customerNextStep,
      currentStage,
      stageSummary,
      sharedRecords,
      attentionItems,
      completedItems,
      emptyStateMessage:
        "No project records have been shared yet. When your contractor shares an estimate, contract, invoice, or change order, it will appear here."
    };
  }

  if (attentionItems.length > 0) {
    return {
      statusLabel: "Needs your attention",
      statusTone: "attention",
      primaryMessage:
        "One or more shared project records needs review, signature, approval, or payment follow-through.",
      customerNextStep,
      currentStage,
      stageSummary,
      sharedRecords,
      attentionItems,
      completedItems,
      emptyStateMessage:
        "No project records have been shared yet. When your contractor shares an estimate, contract, invoice, or change order, it will appear here."
    };
  }

  if (completedItems.length > 0) {
    return {
      statusLabel: "Shared records are current",
      statusTone: "complete",
      primaryMessage:
        "The shared records available in the portal do not need customer action right now.",
      customerNextStep,
      currentStage,
      stageSummary,
      sharedRecords,
      attentionItems,
      completedItems,
      emptyStateMessage:
        "No project records have been shared yet. When your contractor shares an estimate, contract, invoice, or change order, it will appear here."
    };
  }

  return {
    statusLabel: projectStatusLabel,
    statusTone: "neutral",
    primaryMessage:
      "Shared project records are available for review, but no customer action is currently open.",
    customerNextStep,
    currentStage,
    stageSummary,
    sharedRecords,
    attentionItems,
    completedItems,
    emptyStateMessage:
      "No project records have been shared yet. When your contractor shares an estimate, contract, invoice, or change order, it will appear here."
  };
}
