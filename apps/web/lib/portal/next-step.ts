export type PortalCustomerNextStepTone = "neutral" | "attention" | "complete";

export type PortalCustomerNextStepSource =
  | "estimate"
  | "contract"
  | "invoice"
  | "change_order"
  | "project"
  | "none";

export type PortalCustomerNextStep = {
  label: string;
  description: string;
  href: string;
  tone: PortalCustomerNextStepTone;
  reason: string;
  source: PortalCustomerNextStepSource;
};

type PortalNextStepEstimate = {
  id: string;
  status: string;
  referenceNumber?: string | null;
  updatedAt?: string | null;
};

type PortalNextStepContract = {
  id: string;
  status: string;
  title?: string | null;
  currentUserCanSign?: boolean;
  updatedAt?: string | null;
};

type PortalNextStepChangeOrder = {
  id: string;
  status: string;
  title?: string | null;
  updatedAt?: string | null;
};

type PortalNextStepInvoice = {
  id: string;
  status: string;
  referenceNumber?: string | null;
  balanceDueAmount?: string | number | null;
  latestPaymentEventType?: string | null;
  updatedAt?: string | null;
};

export type PortalCustomerNextStepInput = {
  projectId: string;
  projectName?: string | null;
  estimates?: PortalNextStepEstimate[];
  contracts?: PortalNextStepContract[];
  changeOrders?: PortalNextStepChangeOrder[];
  invoices?: PortalNextStepInvoice[];
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

function isOpenInvoice(invoice: PortalNextStepInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_requested" ||
    invoice.latestPaymentEventType === "checkout_started" ||
    (invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount ?? 0) > 0)
  );
}

export function derivePortalCustomerNextStep(
  input: PortalCustomerNextStepInput
): PortalCustomerNextStep {
  const sentEstimate = getMostRecent(
    (input.estimates ?? []).filter((estimate) => estimate.status === "sent")
  );

  if (sentEstimate) {
    const reference = sentEstimate.referenceNumber ?? "the estimate";

    return {
      label: "Review estimate",
      description:
        "This proposal is shared for your review. Approving or rejecting it updates the contractor's project record.",
      href: `/portal/estimates/${sentEstimate.id}`,
      tone: "attention",
      reason: `${reference} is waiting for customer review.`,
      source: "estimate"
    };
  }

  const signableContract = getMostRecent(
    (input.contracts ?? []).filter(
      (contract) =>
        contract.currentUserCanSign ||
        (contract.status !== "signed" && contract.status !== "void")
    )
  );

  if (signableContract) {
    const canSign = Boolean(signableContract.currentUserCanSign);
    const title = signableContract.title ?? "the contract";

    return {
      label: canSign ? "Sign contract" : "Review contract",
      description: canSign
        ? "This contract is waiting for your signature on the shared project record."
        : "This contract is still in motion, so it is the next shared record to review.",
      href: `/portal/contracts/${signableContract.id}`,
      tone: "attention",
      reason: `${title} is ${signableContract.status.replaceAll("_", " ")}.`,
      source: "contract"
    };
  }

  const pendingChangeOrder = getMostRecent(
    (input.changeOrders ?? []).filter(
      (changeOrder) => changeOrder.status === "sent"
    )
  );

  if (pendingChangeOrder) {
    const title = pendingChangeOrder.title ?? "the change order";

    return {
      label: "Review change order",
      description:
        "This scope change is shared for your decision on the same project record.",
      href: `/portal/change-orders/${pendingChangeOrder.id}`,
      tone: "attention",
      reason: `${title} is waiting for customer review.`,
      source: "change_order"
    };
  }

  const openInvoice = getMostRecent(
    (input.invoices ?? []).filter(isOpenInvoice)
  );

  if (openInvoice) {
    const reference = openInvoice.referenceNumber ?? "the invoice";

    return {
      label: "Review/pay invoice",
      description:
        "This invoice has an open balance or active payment request on the shared project record.",
      href: `/portal/invoices/${openInvoice.id}`,
      tone: "attention",
      reason: `${reference} needs billing review.`,
      source: "invoice"
    };
  }

  return {
    label: "No action needed",
    description:
      "No estimate, contract, change order, or invoice currently needs your action.",
    href: `/portal/projects/${input.projectId}`,
    tone: "complete",
    reason: input.projectName
      ? `${input.projectName} is shared for status review.`
      : "The shared project is available for status review.",
    source: "none"
  };
}
