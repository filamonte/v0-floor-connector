import { buildDocumentPrintHref } from "../document-engine/print";

export type PortalSharedDocumentType =
  | "estimate"
  | "contract"
  | "invoice"
  | "change_order";

export type PortalSharedDocumentTone =
  | "neutral"
  | "attention"
  | "complete"
  | "warning";

export type PortalSharedDocument = {
  key: string;
  id: string;
  type: PortalSharedDocumentType;
  label: string;
  reference: string;
  statusLabel: string;
  tone: PortalSharedDocumentTone;
  primaryHref: string;
  printHref?: string;
  actionLabel: string;
  helperText: string;
  customerActionRequired?: boolean;
  completed?: boolean;
  updatedAt?: string | null;
};

type PortalSharedEstimate = {
  id: string;
  referenceNumber?: string | null;
  status: string;
  totalAmount?: string | number | null;
  updatedAt?: string | null;
};

type PortalSharedContract = {
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

type PortalSharedInvoice = {
  id: string;
  referenceNumber?: string | null;
  workflowRole?: string | null;
  status: string;
  balanceDueAmount?: string | number | null;
  latestPaymentEventType?: string | null;
  latestPaymentEventAt?: string | null;
  updatedAt?: string | null;
};

type PortalSharedChangeOrder = {
  id: string;
  title?: string | null;
  status: string;
  priceAdjustment?: string | number | null;
  updatedAt?: string | null;
};

export type PortalSharedDocumentsInput = {
  estimates?: PortalSharedEstimate[];
  contracts?: PortalSharedContract[];
  invoices?: PortalSharedInvoice[];
  changeOrders?: PortalSharedChangeOrder[];
};

export type PortalSharedDocuments = {
  documents: PortalSharedDocument[];
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

function isOpenInvoice(invoice: PortalSharedInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_requested" ||
    invoice.latestPaymentEventType === "checkout_started" ||
    invoice.latestPaymentEventType === "payment_failed" ||
    (invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount ?? 0) > 0)
  );
}

function getSortTimestamp(document: PortalSharedDocument) {
  return document.updatedAt ? new Date(document.updatedAt).getTime() || 0 : 0;
}

function getDocumentRank(document: PortalSharedDocument) {
  switch (document.type) {
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

function sortDocuments(documents: PortalSharedDocument[]) {
  return [...documents].sort((left, right) => {
    if (left.customerActionRequired !== right.customerActionRequired) {
      return left.customerActionRequired ? -1 : 1;
    }

    const rightTime = getSortTimestamp(right);
    const leftTime = getSortTimestamp(left);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    const rankDelta = getDocumentRank(left) - getDocumentRank(right);

    if (rankDelta !== 0) {
      return rankDelta;
    }

    return left.key.localeCompare(right.key);
  });
}

function mapEstimates(
  estimates: PortalSharedEstimate[]
): PortalSharedDocument[] {
  return estimates.map((estimate) => {
    const total = formatMoneyLabel(estimate.totalAmount);
    const isReadyForReview = estimate.status === "sent";
    const completed = estimate.status === "approved";

    return {
      key: `estimate-${estimate.id}`,
      id: estimate.id,
      type: "estimate",
      label: "Estimate",
      reference: estimate.referenceNumber ?? "Estimate",
      statusLabel: formatStatusLabel(estimate.status),
      tone: isReadyForReview
        ? "attention"
        : completed
          ? "complete"
          : estimate.status === "rejected"
            ? "warning"
            : "neutral",
      primaryHref: `/portal/estimates/${estimate.id}`,
      printHref: buildDocumentPrintHref({
        subjectType: "estimate",
        subjectId: estimate.id,
        audience: "portal"
      }),
      actionLabel: isReadyForReview ? "Review estimate" : "Open",
      helperText: isReadyForReview
        ? `Ready for your review${total ? ` with total ${total}` : ""}.`
        : completed
          ? "This estimate is approved and available to review or save."
          : estimate.status === "rejected"
            ? "This estimate is marked for contractor revision."
            : "This estimate is shared with you.",
      customerActionRequired: isReadyForReview || undefined,
      completed: completed || undefined,
      updatedAt: estimate.updatedAt
    };
  });
}

function mapContracts(
  contracts: PortalSharedContract[]
): PortalSharedDocument[] {
  return contracts.map((contract) => {
    const completed = contract.status === "signed";
    const needsAttention =
      contract.status !== "signed" && contract.status !== "void";
    const helperText = completed
      ? "This contract is signed and available to review or save."
      : contract.customerSignedAt && !contract.contractorCountersignedAt
        ? "Your signature is recorded. Contractor countersign may still be pending."
        : contract.customerViewedAt
          ? "This contract has been viewed and is still in progress."
          : contract.sentAt
            ? "This contract is ready for review or signature."
            : "This contract is shared with you.";

    return {
      key: `contract-${contract.id}`,
      id: contract.id,
      type: "contract",
      label: "Contract",
      reference: contract.title ?? "Contract",
      statusLabel: formatStatusLabel(contract.status),
      tone: needsAttention
        ? "attention"
        : completed
          ? "complete"
          : contract.status === "declined"
            ? "warning"
            : "neutral",
      primaryHref: `/portal/contracts/${contract.id}`,
      printHref: buildDocumentPrintHref({
        subjectType: "contract",
        subjectId: contract.id,
        audience: "portal"
      }),
      actionLabel: needsAttention ? "Review contract" : "Open",
      helperText,
      customerActionRequired: needsAttention || undefined,
      completed: completed || undefined,
      updatedAt: contract.updatedAt
    };
  });
}

function mapInvoices(invoices: PortalSharedInvoice[]): PortalSharedDocument[] {
  return invoices.map((invoice) => {
    const balance = formatMoneyLabel(invoice.balanceDueAmount);
    const needsAttention = isOpenInvoice(invoice);
    const completed =
      invoice.status === "paid" || Number(invoice.balanceDueAmount ?? 0) <= 0;
    const isDeposit = invoice.workflowRole === "deposit";
    const label = isDeposit ? "Deposit invoice" : "Invoice";
    const helperText =
      invoice.latestPaymentEventType === "payment_failed"
        ? "A recent payment attempt failed. Review this invoice."
        : invoice.latestPaymentEventType === "checkout_started"
          ? "Payment is in progress. Review this invoice for current status."
          : invoice.latestPaymentEventType === "payment_requested"
            ? "Payment has been requested for this invoice."
            : completed
              ? `${label} is paid and available to review or save.`
              : `${label} has an open balance${balance ? ` of ${balance}` : ""}.`;

    return {
      key: `invoice-${invoice.id}`,
      id: invoice.id,
      type: "invoice",
      label,
      reference: invoice.referenceNumber ?? "Invoice",
      statusLabel: formatStatusLabel(invoice.status),
      tone:
        invoice.latestPaymentEventType === "payment_failed"
          ? "warning"
          : needsAttention
            ? "attention"
            : completed
              ? "complete"
              : "neutral",
      primaryHref: `/portal/invoices/${invoice.id}`,
      printHref: buildDocumentPrintHref({
        subjectType: "invoice",
        subjectId: invoice.id,
        audience: "portal"
      }),
      actionLabel: needsAttention ? "Review or pay invoice" : "Open",
      helperText,
      customerActionRequired: needsAttention || undefined,
      completed: completed || undefined,
      updatedAt: invoice.latestPaymentEventAt ?? invoice.updatedAt
    };
  });
}

function mapChangeOrders(
  changeOrders: PortalSharedChangeOrder[]
): PortalSharedDocument[] {
  return changeOrders.map((changeOrder) => {
    const adjustment = formatMoneyLabel(changeOrder.priceAdjustment);
    const needsAttention = changeOrder.status === "sent";
    const completed = changeOrder.status === "approved";

    return {
      key: `change-order-${changeOrder.id}`,
      id: changeOrder.id,
      type: "change_order",
      label: "Change order",
      reference: changeOrder.title ?? "Change order",
      statusLabel: formatStatusLabel(changeOrder.status),
      tone: needsAttention
        ? "attention"
        : completed
          ? "complete"
          : changeOrder.status === "rejected"
            ? "warning"
            : "neutral",
      primaryHref: `/portal/change-orders/${changeOrder.id}`,
      actionLabel: needsAttention ? "Review change order" : "Open",
      helperText: needsAttention
        ? `Ready for your review${adjustment ? ` with adjustment ${adjustment}` : ""}.`
        : completed
          ? "This change order is approved."
          : changeOrder.status === "rejected"
            ? "This change order was rejected."
            : "This change order is shared with you.",
      customerActionRequired: needsAttention || undefined,
      completed: completed || undefined,
      updatedAt: changeOrder.updatedAt
    };
  });
}

export function derivePortalSharedDocuments(
  input: PortalSharedDocumentsInput
): PortalSharedDocuments {
  return {
    documents: sortDocuments([
      ...mapEstimates(input.estimates ?? []),
      ...mapContracts(input.contracts ?? []),
      ...mapChangeOrders(input.changeOrders ?? []),
      ...mapInvoices(input.invoices ?? [])
    ]),
    emptyStateMessage:
      "No documents shared yet. Estimates, contracts, invoices, and change orders will appear here when your contractor shares them."
  };
}
