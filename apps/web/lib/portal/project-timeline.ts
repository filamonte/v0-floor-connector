export type PortalProjectTimelineTone =
  | "neutral"
  | "attention"
  | "complete"
  | "warning";

export type PortalProjectTimelineSource =
  | "estimate"
  | "contract"
  | "invoice"
  | "change_order"
  | "project"
  | "appointment"
  | "warranty"
  | "none";

export type PortalProjectTimelineItem = {
  key: string;
  label: string;
  description: string;
  occurredAt?: string | null;
  tone: PortalProjectTimelineTone;
  href?: string;
  source: PortalProjectTimelineSource;
  customerActionRequired?: boolean;
};

type PortalTimelineProject = {
  id: string;
  name?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PortalTimelineEstimate = {
  id: string;
  referenceNumber?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PortalTimelineContract = {
  id: string;
  title?: string | null;
  status: string;
  customerViewedAt?: string | null;
  customerSignedAt?: string | null;
  contractorCountersignedAt?: string | null;
  sentAt?: string | null;
  viewedAt?: string | null;
  signedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PortalTimelineInvoice = {
  id: string;
  referenceNumber?: string | null;
  workflowRole?: string | null;
  status: string;
  balanceDueAmount?: string | number | null;
  latestPaymentEventType?: string | null;
  latestPaymentEventAt?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PortalTimelineChangeOrder = {
  id: string;
  title?: string | null;
  status: string;
  sentAt?: string | null;
  customerViewedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PortalTimelineAppointment = {
  id: string;
  title?: string | null;
  appointmentType?: string | null;
  status: string;
  startsAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PortalTimelineWarrantyDocument = {
  id: string;
  title?: string | null;
  status: string;
  currentUserSignerStatus?: string | null;
  currentUserCanAct?: boolean;
  latestSignatureEventType?: string | null;
  latestSignatureEventAt?: string | null;
  issuedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PortalProjectTimelineInput = {
  project?: PortalTimelineProject | null;
  estimates?: PortalTimelineEstimate[];
  contracts?: PortalTimelineContract[];
  invoices?: PortalTimelineInvoice[];
  changeOrders?: PortalTimelineChangeOrder[];
  appointments?: PortalTimelineAppointment[];
  warrantyDocuments?: PortalTimelineWarrantyDocument[];
};

export type PortalProjectTimeline = {
  timelineItems: PortalProjectTimelineItem[];
  emptyStateMessage: string;
};

function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "current";
  }

  return status.replaceAll("_", " ");
}

function getSortTimestamp(value: string | null | undefined) {
  return value ? new Date(value).getTime() || 0 : 0;
}

function getSourceRank(source: PortalProjectTimelineSource) {
  switch (source) {
    case "estimate":
      return 0;
    case "contract":
      return 1;
    case "change_order":
      return 2;
    case "invoice":
      return 3;
    case "appointment":
      return 4;
    case "warranty":
      return 5;
    case "project":
      return 6;
    case "none":
      return 7;
  }
}

function sortTimelineItems(items: PortalProjectTimelineItem[]) {
  return [...items].sort((left, right) => {
    const rightTime = getSortTimestamp(right.occurredAt);
    const leftTime = getSortTimestamp(left.occurredAt);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    const sourceDelta =
      getSourceRank(left.source) - getSourceRank(right.source);

    if (sourceDelta !== 0) {
      return sourceDelta;
    }

    return left.key.localeCompare(right.key);
  });
}

function estimateTimelineItem(
  estimate: PortalTimelineEstimate
): PortalProjectTimelineItem {
  const reference = estimate.referenceNumber ?? "Estimate";
  const href = `/portal/estimates/${estimate.id}`;

  if (estimate.status === "sent") {
    return {
      key: `estimate-${estimate.id}-ready`,
      label: "Estimate ready for review",
      description: `${reference} is shared for your review.`,
      occurredAt: estimate.updatedAt ?? estimate.createdAt,
      tone: "attention",
      href,
      source: "estimate",
      customerActionRequired: true
    };
  }

  if (estimate.status === "approved") {
    return {
      key: `estimate-${estimate.id}-approved`,
      label: "Estimate approved",
      description: `${reference} has been approved.`,
      occurredAt: estimate.updatedAt ?? estimate.createdAt,
      tone: "complete",
      href,
      source: "estimate"
    };
  }

  if (estimate.status === "rejected") {
    return {
      key: `estimate-${estimate.id}-rejected`,
      label: "Estimate needs revision",
      description: `${reference} was marked for contractor revision.`,
      occurredAt: estimate.updatedAt ?? estimate.createdAt,
      tone: "warning",
      href,
      source: "estimate"
    };
  }

  return {
    key: `estimate-${estimate.id}-shared`,
    label: "Estimate shared",
    description: `${reference} is available in your project workspace.`,
    occurredAt: estimate.updatedAt ?? estimate.createdAt,
    tone: "neutral",
    href,
    source: "estimate"
  };
}

function contractTimelineItem(
  contract: PortalTimelineContract
): PortalProjectTimelineItem {
  const title = contract.title ?? "Contract";
  const href = `/portal/contracts/${contract.id}`;

  if (contract.status === "signed") {
    return {
      key: `contract-${contract.id}-signed`,
      label: "Contract signed",
      description: `${title} is signed.`,
      occurredAt:
        contract.signedAt ??
        contract.contractorCountersignedAt ??
        contract.customerSignedAt ??
        contract.updatedAt,
      tone: "complete",
      href,
      source: "contract"
    };
  }

  if (contract.status === "declined") {
    return {
      key: `contract-${contract.id}-declined`,
      label: "Contract declined",
      description: `${title} was declined and may need contractor follow-up.`,
      occurredAt: contract.updatedAt ?? contract.customerViewedAt,
      tone: "warning",
      href,
      source: "contract"
    };
  }

  if (contract.status !== "void") {
    return {
      key: `contract-${contract.id}-ready`,
      label: "Contract ready for review",
      description: contract.customerViewedAt
        ? `${title} has been viewed and is still in progress.`
        : `${title} is shared for review or signature.`,
      occurredAt:
        contract.sentAt ??
        contract.viewedAt ??
        contract.customerViewedAt ??
        contract.updatedAt ??
        contract.createdAt,
      tone: "attention",
      href,
      source: "contract",
      customerActionRequired: true
    };
  }

  return {
    key: `contract-${contract.id}-shared`,
    label: "Contract shared",
    description: `${title} is available for review.`,
    occurredAt: contract.updatedAt ?? contract.createdAt,
    tone: "neutral",
    href,
    source: "contract"
  };
}

function isOpenInvoice(invoice: PortalTimelineInvoice) {
  return (
    invoice.latestPaymentEventType === "payment_requested" ||
    invoice.latestPaymentEventType === "checkout_started" ||
    invoice.latestPaymentEventType === "payment_failed" ||
    (invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount ?? 0) > 0)
  );
}

function invoiceTimelineItem(
  invoice: PortalTimelineInvoice
): PortalProjectTimelineItem {
  const reference = invoice.referenceNumber ?? "Invoice";
  const href = `/portal/invoices/${invoice.id}`;
  const isDeposit = invoice.workflowRole === "deposit";
  const invoiceLabel = isDeposit ? "Deposit" : "Invoice";

  if (invoice.latestPaymentEventType === "payment_failed") {
    return {
      key: `invoice-${invoice.id}-payment-failed`,
      label: "Payment needs review",
      description: `${reference} has a recent payment attempt that did not complete.`,
      occurredAt: invoice.latestPaymentEventAt ?? invoice.updatedAt,
      tone: "warning",
      href,
      source: "invoice",
      customerActionRequired: true
    };
  }

  if (invoice.latestPaymentEventType === "checkout_started") {
    return {
      key: `invoice-${invoice.id}-checkout-started`,
      label: "Payment in progress",
      description: `${reference} has checkout activity in progress.`,
      occurredAt: invoice.latestPaymentEventAt ?? invoice.updatedAt,
      tone: "attention",
      href,
      source: "invoice",
      customerActionRequired: true
    };
  }

  if (
    invoice.latestPaymentEventType === "payment_succeeded" ||
    invoice.status === "paid" ||
    Number(invoice.balanceDueAmount ?? 0) <= 0
  ) {
    return {
      key: `invoice-${invoice.id}-paid`,
      label: `${invoiceLabel} paid`,
      description: `${reference} is paid or no longer shows an open balance.`,
      occurredAt: invoice.latestPaymentEventAt ?? invoice.updatedAt,
      tone: "complete",
      href,
      source: "invoice"
    };
  }

  if (isOpenInvoice(invoice)) {
    return {
      key: `invoice-${invoice.id}-ready`,
      label: `${invoiceLabel} ready for payment`,
      description:
        invoice.latestPaymentEventType === "payment_requested"
          ? `${reference} has a payment request ready for review.`
          : `${reference} has an open balance to review.`,
      occurredAt:
        invoice.latestPaymentEventAt ?? invoice.updatedAt ?? invoice.createdAt,
      tone: "attention",
      href,
      source: "invoice",
      customerActionRequired: true
    };
  }

  return {
    key: `invoice-${invoice.id}-shared`,
    label: `${invoiceLabel} shared`,
    description: `${reference} is available in your project workspace.`,
    occurredAt: invoice.updatedAt ?? invoice.createdAt,
    tone: "neutral",
    href,
    source: "invoice"
  };
}

function changeOrderTimelineItem(
  changeOrder: PortalTimelineChangeOrder
): PortalProjectTimelineItem {
  const title = changeOrder.title ?? "Change order";
  const href = `/portal/change-orders/${changeOrder.id}`;

  if (changeOrder.status === "approved") {
    return {
      key: `change-order-${changeOrder.id}-approved`,
      label: "Change order approved",
      description: `${title} has been approved.`,
      occurredAt: changeOrder.approvedAt ?? changeOrder.updatedAt,
      tone: "complete",
      href,
      source: "change_order"
    };
  }

  if (changeOrder.status === "rejected") {
    return {
      key: `change-order-${changeOrder.id}-rejected`,
      label: "Change order rejected",
      description: `${title} was rejected and may need contractor follow-up.`,
      occurredAt: changeOrder.rejectedAt ?? changeOrder.updatedAt,
      tone: "warning",
      href,
      source: "change_order"
    };
  }

  if (changeOrder.status === "sent") {
    return {
      key: `change-order-${changeOrder.id}-ready`,
      label: "Change order ready for review",
      description: `${title} is shared for your decision.`,
      occurredAt:
        changeOrder.sentAt ??
        changeOrder.customerViewedAt ??
        changeOrder.updatedAt,
      tone: "attention",
      href,
      source: "change_order",
      customerActionRequired: true
    };
  }

  return {
    key: `change-order-${changeOrder.id}-shared`,
    label: "Change order shared",
    description: `${title} is available in your project workspace.`,
    occurredAt: changeOrder.updatedAt ?? changeOrder.createdAt,
    tone: "neutral",
    href,
    source: "change_order"
  };
}

function appointmentTimelineItem(
  appointment: PortalTimelineAppointment
): PortalProjectTimelineItem {
  return {
    key: `appointment-${appointment.id}-shared`,
    label: "Appointment shared",
    description:
      appointment.title?.trim() ||
      `${formatStatusLabel(appointment.appointmentType)} appointment is visible on this project.`,
    occurredAt: appointment.updatedAt ?? appointment.createdAt,
    tone: "neutral",
    source: "appointment"
  };
}

function warrantyTimelineItem(
  warrantyDocument: PortalTimelineWarrantyDocument
): PortalProjectTimelineItem {
  const title = warrantyDocument.title ?? "Warranty document";
  const href = `/portal/warranty-documents/${warrantyDocument.id}`;

  if (warrantyDocument.currentUserCanAct) {
    return {
      key: `warranty-${warrantyDocument.id}-ready`,
      label: "Warranty document ready for review",
      description: `${title} is ready for your signature review.`,
      occurredAt:
        warrantyDocument.latestSignatureEventAt ??
        warrantyDocument.issuedAt ??
        warrantyDocument.updatedAt,
      tone: "attention",
      href,
      source: "warranty",
      customerActionRequired: true
    };
  }

  if (
    warrantyDocument.status === "signed" ||
    warrantyDocument.currentUserSignerStatus === "signed"
  ) {
    return {
      key: `warranty-${warrantyDocument.id}-signed`,
      label: "Warranty document signed",
      description: `${title} has a recorded signature.`,
      occurredAt:
        warrantyDocument.latestSignatureEventAt ??
        warrantyDocument.updatedAt ??
        warrantyDocument.createdAt,
      tone: "complete",
      href,
      source: "warranty"
    };
  }

  return {
    key: `warranty-${warrantyDocument.id}-shared`,
    label: "Warranty document shared",
    description: `${title} is available in your project workspace.`,
    occurredAt:
      warrantyDocument.issuedAt ??
      warrantyDocument.updatedAt ??
      warrantyDocument.createdAt,
    tone: "neutral",
    href,
    source: "warranty"
  };
}

function projectTimelineItem(
  project: PortalTimelineProject
): PortalProjectTimelineItem {
  return {
    key: `project-${project.id}-shared`,
    label: "Project shared",
    description: `${project.name ?? "This project"} is available in your customer portal${
      project.status ? ` with status ${formatStatusLabel(project.status)}` : ""
    }.`,
    occurredAt: project.createdAt ?? project.updatedAt,
    tone: "neutral",
    href: `/portal/projects/${project.id}`,
    source: "project"
  };
}

export function derivePortalProjectTimeline(
  input: PortalProjectTimelineInput
): PortalProjectTimeline {
  const timelineItems = sortTimelineItems([
    ...(input.estimates ?? []).map(estimateTimelineItem),
    ...(input.contracts ?? []).map(contractTimelineItem),
    ...(input.changeOrders ?? []).map(changeOrderTimelineItem),
    ...(input.invoices ?? []).map(invoiceTimelineItem),
    ...(input.appointments ?? []).map(appointmentTimelineItem),
    ...(input.warrantyDocuments ?? []).map(warrantyTimelineItem),
    ...(input.project ? [projectTimelineItem(input.project)] : [])
  ]);

  return {
    timelineItems,
    emptyStateMessage:
      "No timeline activity yet. Shared estimates, contracts, invoices, change orders, appointments, or warranty documents will appear here when available."
  };
}
