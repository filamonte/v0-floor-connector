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

export type PortalProjectStatusWindowInput = {
  projectId: string;
  projectName?: string | null;
  projectStatus?: string | null;
  estimates?: PortalStatusEstimate[];
  contracts?: PortalStatusContract[];
  invoices?: PortalStatusInvoice[];
  changeOrders?: PortalStatusChangeOrder[];
};

export type PortalProjectStatusWindow = {
  statusLabel: string;
  statusTone: PortalProjectStatusTone;
  primaryMessage: string;
  customerNextStep: PortalCustomerNextStep;
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

  if (sharedRecords.length === 0) {
    return {
      statusLabel: projectStatusLabel,
      statusTone: "neutral",
      primaryMessage:
        "Your contractor has shared the project workspace. No estimate, contract, invoice, or change order is available here yet.",
      customerNextStep,
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
    sharedRecords,
    attentionItems,
    completedItems,
    emptyStateMessage:
      "No project records have been shared yet. When your contractor shares an estimate, contract, invoice, or change order, it will appear here."
  };
}
