import {
  derivePortalSharedDocuments,
  type PortalSharedDocument,
  type PortalSharedDocumentsInput,
  type PortalSharedDocumentTone
} from "./shared-documents";

export type PortalCloseoutHandoffTone =
  | "neutral"
  | "attention"
  | "complete"
  | "warning";

export type PortalCloseoutHandoffActionSource =
  | "contract"
  | "change_order"
  | "invoice"
  | "warranty"
  | "project"
  | "none";

type PortalCloseoutContract = NonNullable<
  PortalSharedDocumentsInput["contracts"]
>[number];

type PortalCloseoutInvoice = NonNullable<
  PortalSharedDocumentsInput["invoices"]
>[number];

type PortalCloseoutChangeOrder = NonNullable<
  PortalSharedDocumentsInput["changeOrders"]
>[number];

type PortalCloseoutWarrantyDocument = {
  id: string;
  title?: string | null;
  status: string;
  currentUserSignerStatus?: string | null;
  currentUserCanAct?: boolean;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  updatedAt?: string | null;
};

export type PortalCloseoutHandoffInput = PortalSharedDocumentsInput & {
  projectId: string;
  projectName?: string | null;
  projectStatus?: string | null;
  warrantyDocuments?: PortalCloseoutWarrantyDocument[];
};

export type PortalCloseoutNextAction = {
  label: string;
  description: string;
  href: string;
  tone: PortalCloseoutHandoffTone;
  source: PortalCloseoutHandoffActionSource;
};

export type PortalCloseoutProgressItem = {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone: PortalCloseoutHandoffTone;
};

export type PortalCloseoutDocumentPackageItem = {
  key: string;
  label: string;
  reference: string;
  statusLabel: string;
  helperText: string;
  href: string;
  printHref?: string;
  tone: PortalSharedDocumentTone;
  customerActionRequired?: boolean;
};

export type PortalCloseoutPaymentSummary = {
  invoiceCount: number;
  paidInvoiceCount: number;
  openInvoiceCount: number;
  failedPaymentCount: number;
  pendingPaymentCount: number;
  outstandingBalanceLabel: string;
  statusLabel: string;
  helperText: string;
  tone: PortalCloseoutHandoffTone;
};

export type PortalCloseoutWarrantySummary = {
  visibleWarrantyCount: number;
  signedWarrantyCount: number;
  actionRequiredCount: number;
  statusLabel: string;
  helperText: string;
  href: string | null;
  tone: PortalCloseoutHandoffTone;
};

export type PortalCloseoutHandoff = {
  statusLabel: string;
  statusTone: PortalCloseoutHandoffTone;
  primaryMessage: string;
  nextAction: PortalCloseoutNextAction;
  progressItems: PortalCloseoutProgressItem[];
  documentPackageItems: PortalCloseoutDocumentPackageItem[];
  paymentSummary: PortalCloseoutPaymentSummary;
  warrantySummary: PortalCloseoutWarrantySummary;
  customerSafeBoundary: string;
  emptyStateMessage: string;
};

function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function parseMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function isContractOpen(contract: PortalCloseoutContract) {
  return contract.status !== "signed" && contract.status !== "void";
}

function isChangeOrderPending(changeOrder: PortalCloseoutChangeOrder) {
  return changeOrder.status === "sent";
}

function isInvoiceOpen(invoice: PortalCloseoutInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_requested" ||
    invoice.latestPaymentEventType === "checkout_started" ||
    invoice.latestPaymentEventType === "payment_failed" ||
    (invoice.status !== "paid" &&
      invoice.status !== "void" &&
      parseMoney(invoice.balanceDueAmount) > 0)
  );
}

function isInvoicePaid(invoice: PortalCloseoutInvoice) {
  return invoice.status === "paid" || parseMoney(invoice.balanceDueAmount) <= 0;
}

function toDocumentPackageItem(
  document: PortalSharedDocument
): PortalCloseoutDocumentPackageItem {
  return {
    key: document.key,
    label: document.label,
    reference: document.reference,
    statusLabel: document.statusLabel,
    helperText: document.helperText,
    href: document.primaryHref,
    printHref: document.printHref,
    tone: document.tone,
    customerActionRequired: document.customerActionRequired
  };
}

function warrantyDocumentPackageItems(
  warrantyDocuments: PortalCloseoutWarrantyDocument[]
): PortalCloseoutDocumentPackageItem[] {
  return warrantyDocuments.map((document) => ({
    key: `warranty-${document.id}`,
    label: "Warranty",
    reference: document.title ?? "Warranty document",
    statusLabel: formatStatusLabel(document.status),
    helperText: document.currentUserCanAct
      ? "This warranty document is ready for your review."
      : document.currentUserSignerStatus === "signed" ||
          document.status === "signed"
        ? "This warranty document is signed and available for your records."
        : "This warranty document is shared with you.",
    href: `/portal/warranty-documents/${document.id}`,
    printHref: `/portal/warranty-documents/${document.id}/print`,
    tone: document.currentUserCanAct
      ? "attention"
      : document.status === "signed" ||
          document.currentUserSignerStatus === "signed"
        ? "complete"
        : "neutral",
    customerActionRequired: document.currentUserCanAct || undefined
  }));
}

function derivePaymentSummary(
  invoices: PortalCloseoutInvoice[]
): PortalCloseoutPaymentSummary {
  const invoiceCount = invoices.length;
  const paidInvoiceCount = invoices.filter(isInvoicePaid).length;
  const openInvoices = invoices.filter(isInvoiceOpen);
  const openInvoiceCount = openInvoices.length;
  const failedPaymentCount = invoices.filter(
    (invoice) => invoice.latestPaymentEventType === "payment_failed"
  ).length;
  const pendingPaymentCount = invoices.filter(
    (invoice) =>
      invoice.latestPaymentEventType === "payment_requested" ||
      invoice.latestPaymentEventType === "checkout_started"
  ).length;
  const outstandingBalance = invoices.reduce(
    (total, invoice) =>
      total + Math.max(parseMoney(invoice.balanceDueAmount), 0),
    0
  );

  if (failedPaymentCount > 0) {
    return {
      invoiceCount,
      paidInvoiceCount,
      openInvoiceCount,
      failedPaymentCount,
      pendingPaymentCount,
      outstandingBalanceLabel: formatMoney(outstandingBalance),
      statusLabel: "Payment needs review",
      helperText:
        "A recent payment attempt did not complete. Review the invoice before closeout.",
      tone: "warning"
    };
  }

  if (openInvoiceCount > 0) {
    return {
      invoiceCount,
      paidInvoiceCount,
      openInvoiceCount,
      failedPaymentCount,
      pendingPaymentCount,
      outstandingBalanceLabel: formatMoney(outstandingBalance),
      statusLabel: "Balance open",
      helperText:
        "One or more shared invoices still shows a balance or payment request.",
      tone: "attention"
    };
  }

  if (invoiceCount > 0) {
    return {
      invoiceCount,
      paidInvoiceCount,
      openInvoiceCount,
      failedPaymentCount,
      pendingPaymentCount,
      outstandingBalanceLabel: formatMoney(outstandingBalance),
      statusLabel: "Invoices current",
      helperText:
        "Shared invoices are paid or no longer show an open customer balance.",
      tone: "complete"
    };
  }

  return {
    invoiceCount,
    paidInvoiceCount,
    openInvoiceCount,
    failedPaymentCount,
    pendingPaymentCount,
    outstandingBalanceLabel: formatMoney(0),
    statusLabel: "No invoices shared",
    helperText:
      "Invoices and payment confirmations will appear here when your contractor shares them.",
    tone: "neutral"
  };
}

function deriveWarrantySummary(
  warrantyDocuments: PortalCloseoutWarrantyDocument[]
): PortalCloseoutWarrantySummary {
  const visibleWarrantyCount = warrantyDocuments.length;
  const signedWarrantyCount = warrantyDocuments.filter(
    (document) =>
      document.status === "signed" ||
      document.currentUserSignerStatus === "signed"
  ).length;
  const actionRequiredCount = warrantyDocuments.filter(
    (document) => document.currentUserCanAct
  ).length;
  const firstActionable = warrantyDocuments.find(
    (document) => document.currentUserCanAct
  );
  const firstVisible = firstActionable ?? warrantyDocuments[0] ?? null;

  if (actionRequiredCount > 0) {
    return {
      visibleWarrantyCount,
      signedWarrantyCount,
      actionRequiredCount,
      statusLabel: "Warranty ready for review",
      helperText:
        "A warranty or service handoff document is waiting for your review.",
      href: firstActionable
        ? `/portal/warranty-documents/${firstActionable.id}`
        : null,
      tone: "attention"
    };
  }

  if (
    visibleWarrantyCount > 0 &&
    signedWarrantyCount === visibleWarrantyCount
  ) {
    return {
      visibleWarrantyCount,
      signedWarrantyCount,
      actionRequiredCount,
      statusLabel: "Warranty complete",
      helperText:
        "Warranty documents shared in the portal are signed or available for your records.",
      href: firstVisible
        ? `/portal/warranty-documents/${firstVisible.id}`
        : null,
      tone: "complete"
    };
  }

  if (visibleWarrantyCount > 0) {
    return {
      visibleWarrantyCount,
      signedWarrantyCount,
      actionRequiredCount,
      statusLabel: "Warranty shared",
      helperText:
        "Warranty documents are available here when your contractor has issued them.",
      href: firstVisible
        ? `/portal/warranty-documents/${firstVisible.id}`
        : null,
      tone: "neutral"
    };
  }

  return {
    visibleWarrantyCount,
    signedWarrantyCount,
    actionRequiredCount,
    statusLabel: "Warranty not shared yet",
    helperText:
      "Warranty or service handoff documents will appear here when your contractor shares them.",
    href: null,
    tone: "neutral"
  };
}

function deriveNextAction(input: {
  projectId: string;
  contracts: PortalCloseoutContract[];
  changeOrders: PortalCloseoutChangeOrder[];
  invoices: PortalCloseoutInvoice[];
  warrantyDocuments: PortalCloseoutWarrantyDocument[];
}): PortalCloseoutNextAction {
  const openContract = input.contracts.find(isContractOpen);

  if (openContract) {
    return {
      label: "Review contract",
      description:
        "Complete contract review or signature before the project closeout handoff is complete.",
      href: `/portal/contracts/${openContract.id}`,
      tone: "attention",
      source: "contract"
    };
  }

  const pendingChangeOrder = input.changeOrders.find(isChangeOrderPending);

  if (pendingChangeOrder) {
    return {
      label: "Review change order",
      description:
        "This scope change needs your decision before the closeout record is current.",
      href: `/portal/change-orders/${pendingChangeOrder.id}`,
      tone: "attention",
      source: "change_order"
    };
  }

  const paymentIssue = input.invoices.find(
    (invoice) => invoice.latestPaymentEventType === "payment_failed"
  );

  if (paymentIssue) {
    return {
      label: "Review payment",
      description:
        "A recent payment attempt did not complete. Review the invoice for current payment status.",
      href: `/portal/invoices/${paymentIssue.id}`,
      tone: "warning",
      source: "invoice"
    };
  }

  const openInvoice = input.invoices.find(isInvoiceOpen);

  if (openInvoice) {
    return {
      label: "Review/pay invoice",
      description:
        "An invoice or deposit still has an open balance or payment request.",
      href: `/portal/invoices/${openInvoice.id}`,
      tone: "attention",
      source: "invoice"
    };
  }

  const warrantyAction = input.warrantyDocuments.find(
    (document) => document.currentUserCanAct
  );

  if (warrantyAction) {
    return {
      label: "Review warranty",
      description:
        "A warranty or service handoff document is ready for your review.",
      href: `/portal/warranty-documents/${warrantyAction.id}`,
      tone: "attention",
      source: "warranty"
    };
  }

  return {
    label: "Review closeout records",
    description:
      "Your shared documents, payment status, and warranty handoff are available for review.",
    href: `/portal/projects/${input.projectId}`,
    tone: "complete",
    source: "none"
  };
}

export function derivePortalCloseoutHandoff(
  input: PortalCloseoutHandoffInput
): PortalCloseoutHandoff {
  const estimates = input.estimates ?? [];
  const contracts = input.contracts ?? [];
  const invoices = input.invoices ?? [];
  const changeOrders = input.changeOrders ?? [];
  const warrantyDocuments = input.warrantyDocuments ?? [];
  const sharedDocuments = derivePortalSharedDocuments({
    estimates,
    contracts,
    invoices,
    changeOrders
  });
  const documentPackageItems = [
    ...sharedDocuments.documents.map(toDocumentPackageItem),
    ...warrantyDocumentPackageItems(warrantyDocuments)
  ];
  const paymentSummary = derivePaymentSummary(invoices);
  const warrantySummary = deriveWarrantySummary(warrantyDocuments);
  const openContractCount = contracts.filter(isContractOpen).length;
  const signedContractCount = contracts.filter(
    (contract) => contract.status === "signed"
  ).length;
  const pendingChangeOrderCount =
    changeOrders.filter(isChangeOrderPending).length;
  const approvedChangeOrderCount = changeOrders.filter(
    (changeOrder) => changeOrder.status === "approved"
  ).length;
  const nextAction = deriveNextAction({
    projectId: input.projectId,
    contracts,
    changeOrders,
    invoices,
    warrantyDocuments
  });
  const attentionCount =
    openContractCount +
    pendingChangeOrderCount +
    paymentSummary.openInvoiceCount +
    paymentSummary.failedPaymentCount +
    warrantySummary.actionRequiredCount;
  const hasSharedRecords = documentPackageItems.length > 0;
  const statusTone: PortalCloseoutHandoffTone =
    paymentSummary.failedPaymentCount > 0
      ? "warning"
      : attentionCount > 0
        ? "attention"
        : hasSharedRecords
          ? "complete"
          : "neutral";
  const statusLabel =
    statusTone === "warning"
      ? "Closeout needs payment review"
      : statusTone === "attention"
        ? "Closeout needs your attention"
        : statusTone === "complete"
          ? "Closeout records ready"
          : "Closeout package not ready yet";

  return {
    statusLabel,
    statusTone,
    primaryMessage:
      statusTone === "complete"
        ? "The customer-safe records shared in the portal are ready for your files."
        : statusTone === "neutral"
          ? "Your contractor is still preparing customer-safe closeout records for this project."
          : "Review the highlighted shared record so the closeout handoff can stay current.",
    nextAction,
    progressItems: [
      {
        key: "contract",
        label: "Contract",
        value:
          contracts.length > 0
            ? `${signedContractCount}/${contracts.length} signed`
            : "Not shared",
        detail:
          openContractCount > 0
            ? "Contract review or signature is still open."
            : contracts.length > 0
              ? "Shared contract records are complete or no longer active."
              : "A signed contract will appear here when it is shared.",
        tone: openContractCount > 0 ? "attention" : "complete"
      },
      {
        key: "changes",
        label: "Change orders",
        value:
          changeOrders.length > 0
            ? `${approvedChangeOrderCount}/${changeOrders.length} approved`
            : "None shared",
        detail:
          pendingChangeOrderCount > 0
            ? "A scope change is waiting for customer review."
            : "Approved change orders stay listed with the project records.",
        tone: pendingChangeOrderCount > 0 ? "attention" : "neutral"
      },
      {
        key: "payment",
        label: "Payment",
        value: paymentSummary.outstandingBalanceLabel,
        detail: paymentSummary.helperText,
        tone: paymentSummary.tone
      },
      {
        key: "warranty",
        label: "Warranty",
        value:
          warrantySummary.visibleWarrantyCount > 0
            ? `${warrantySummary.signedWarrantyCount}/${warrantySummary.visibleWarrantyCount} signed`
            : "Not shared",
        detail: warrantySummary.helperText,
        tone: warrantySummary.tone
      }
    ],
    documentPackageItems,
    paymentSummary,
    warrantySummary,
    customerSafeBoundary:
      "This closeout handoff shows customer-safe commercial records, payment status, schedule context, and warranty documents. Contractor-only field notes, Daily Job Log details, execution attachments, internal blockers, provider diagnostics, and private proof remain internal.",
    emptyStateMessage:
      "No closeout records are shared yet. Contracts, approved changes, invoices, receipts, and warranty documents will appear here when they are available in your portal."
  };
}
