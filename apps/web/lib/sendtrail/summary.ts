import type {
  ContractSignatureEventType,
  DocumentDeliveryChannel,
  DocumentDeliveryEventType,
  DocumentDeliverySubjectType,
  PaymentEventType,
  PortalRecordViewSubjectType
} from "@floorconnector/types";

export type SendTrailTone =
  | "sent"
  | "viewed"
  | "acted"
  | "failed"
  | "pending"
  | "unknown";

export type SendTrailItemType =
  | "estimate_sent"
  | "contract_signature_requested"
  | "invoice_payment_requested"
  | "change_order_review_requested"
  | "portal_view"
  | "notification_delivery"
  | "communication_message";

export type SendTrailSourceRecord = {
  id: string;
  type: DocumentDeliverySubjectType | "change_order" | "project";
  label: string;
  href: string;
};

export type SendTrailDeliveryEventInput = {
  id: string;
  subjectType: DocumentDeliverySubjectType;
  subjectId: string;
  eventType: DocumentDeliveryEventType;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  channel: DocumentDeliveryChannel;
  provider: string | null;
  eventNote: string | null;
  createdAt: string;
};

export type SendTrailSignatureEventInput = {
  id: string;
  contractId: string;
  eventType: ContractSignatureEventType;
  actorType: string;
  occurredAt: string;
};

export type SendTrailPaymentEventInput = {
  id: string;
  invoiceId: string;
  eventType: PaymentEventType;
  actorType: string;
  gatewayProvider: string | null;
  occurredAt: string;
};

export type SendTrailPortalViewInput = {
  id: string;
  subjectType: PortalRecordViewSubjectType;
  subjectId: string;
  viewedAt: string;
};

export type SendTrailCommunicationMessageInput = {
  id: string;
  subjectType: string;
  subjectId: string;
  direction: string;
  deliveryStatus: string;
  channelKind: string;
  occurredAt: string;
};

export type SendTrailItem = {
  id: string;
  type: SendTrailItemType;
  tone: SendTrailTone;
  label: string;
  statusLabel: string;
  target: string;
  occurredAt: string;
  sourceLabel: string;
  sourceHref: string;
  helperCopy: string;
};

export type SendTrailSummary = {
  items: SendTrailItem[];
  latestItem: SendTrailItem | null;
  counts: {
    total: number;
    sent: number;
    viewed: number;
    acted: number;
    failed: number;
    pending: number;
    unknown: number;
  };
  attentionCount: number;
  nextMove: {
    label: string;
    href: string;
    reason: string;
  };
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getRecordKey(type: SendTrailSourceRecord["type"], id: string) {
  return `${type}:${id}`;
}

function getSourceRecord(
  recordsByKey: Map<string, SendTrailSourceRecord>,
  type: SendTrailSourceRecord["type"],
  id: string
) {
  return recordsByKey.get(getRecordKey(type, id));
}

function getFallbackHref(type: SendTrailSourceRecord["type"], id: string) {
  switch (type) {
    case "estimate":
      return `/estimates/${id}`;
    case "contract":
      return `/contracts/${id}`;
    case "invoice":
      return `/invoices/${id}`;
    case "change_order":
      return `/change-orders/${id}`;
    case "warranty_document":
      return `/warranty-documents/${id}`;
    case "project":
      return `/projects/${id}`;
    default:
      return "/communications";
  }
}

function getFallbackLabel(type: SendTrailSourceRecord["type"]) {
  switch (type) {
    case "estimate":
      return "Estimate";
    case "contract":
      return "Contract";
    case "invoice":
      return "Invoice";
    case "change_order":
      return "Change order";
    case "warranty_document":
      return "Warranty document";
    case "project":
      return "Project";
    default:
      return "Source record";
  }
}

function buildSource(
  recordsByKey: Map<string, SendTrailSourceRecord>,
  type: SendTrailSourceRecord["type"],
  id: string
) {
  const record = getSourceRecord(recordsByKey, type, id);

  return {
    sourceLabel: record?.label ?? getFallbackLabel(type),
    sourceHref: record?.href ?? getFallbackHref(type, id)
  };
}

function getTarget(input: {
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientRole?: string | null;
}) {
  return (
    input.recipientName ??
    input.recipientEmail ??
    input.recipientRole ??
    "Customer"
  );
}

function toneForDelivery(eventType: DocumentDeliveryEventType): SendTrailTone {
  if (eventType === "failed" || eventType === "bounced") {
    return "failed";
  }

  if (
    eventType === "viewed" ||
    eventType === "opened" ||
    eventType === "clicked"
  ) {
    return "viewed";
  }

  if (eventType === "sent" || eventType === "delivery_recorded") {
    return "sent";
  }

  if (eventType === "send_requested") {
    return "pending";
  }

  return "unknown";
}

function toneForSignature(
  eventType: ContractSignatureEventType
): SendTrailTone {
  if (
    eventType === "signer_signed" ||
    eventType === "contractor_countersigned" ||
    eventType === "signature_completed"
  ) {
    return "acted";
  }

  if (eventType === "signer_viewed") {
    return "viewed";
  }

  if (eventType === "signer_declined" || eventType === "signature_voided") {
    return "failed";
  }

  if (eventType === "signature_requested") {
    return "pending";
  }

  return "unknown";
}

function toneForPayment(eventType: PaymentEventType): SendTrailTone {
  if (eventType === "payment_succeeded") {
    return "acted";
  }

  if (eventType === "payment_failed" || eventType === "payment_voided") {
    return "failed";
  }

  if (eventType === "payment_requested" || eventType === "checkout_started") {
    return "pending";
  }

  return "unknown";
}

function typeForDelivery(
  event: SendTrailDeliveryEventInput
): SendTrailItemType {
  if (event.subjectType === "estimate") {
    return "estimate_sent";
  }

  if (event.subjectType === "contract") {
    return "contract_signature_requested";
  }

  if (event.subjectType === "invoice") {
    return "invoice_payment_requested";
  }

  return "notification_delivery";
}

function statusForTone(tone: SendTrailTone) {
  switch (tone) {
    case "acted":
      return "Acted";
    case "failed":
      return "Needs review";
    case "pending":
      return "Pending";
    case "sent":
      return "Sent";
    case "viewed":
      return "Viewed";
    default:
      return "Unknown";
  }
}

function buildNextMove(summary: {
  latestItem: SendTrailItem | null;
  failedItems: SendTrailItem[];
  pendingItems: SendTrailItem[];
  viewedItems: SendTrailItem[];
  sentItems: SendTrailItem[];
}) {
  const failed = summary.failedItems[0];

  if (failed) {
    return {
      label: "Review send issue",
      href: failed.sourceHref,
      reason: `${failed.sourceLabel} has Send Trail evidence that needs review.`
    };
  }

  const pending = summary.pendingItems[0];

  if (pending) {
    return {
      label: "Review pending send",
      href: pending.sourceHref,
      reason: `${pending.sourceLabel} has a requested or pending customer action.`
    };
  }

  const viewed = summary.viewedItems[0];

  if (viewed) {
    return {
      label: "Open viewed record",
      href: viewed.sourceHref,
      reason: `${viewed.sourceLabel} has customer view activity ready for follow-up.`
    };
  }

  const sent = summary.sentItems[0];

  if (sent) {
    return {
      label: "Open sent record",
      href: sent.sourceHref,
      reason: `${sent.sourceLabel} has delivery proof available.`
    };
  }

  return {
    label: "Review Send Trail",
    href: "/communications",
    reason: "No document send or delivery proof is available yet."
  };
}

export function deriveSendTrailSummary(input: {
  sourceRecords?: SendTrailSourceRecord[];
  deliveryEvents?: SendTrailDeliveryEventInput[];
  signatureEvents?: SendTrailSignatureEventInput[];
  paymentEvents?: SendTrailPaymentEventInput[];
  portalViews?: SendTrailPortalViewInput[];
  communicationMessages?: SendTrailCommunicationMessageInput[];
}): SendTrailSummary {
  const recordsByKey = new Map(
    (input.sourceRecords ?? []).map((record) => [
      getRecordKey(record.type, record.id),
      record
    ])
  );

  const deliveryItems = (input.deliveryEvents ?? []).map(
    (event): SendTrailItem => {
      const tone = toneForDelivery(event.eventType);
      const source = buildSource(
        recordsByKey,
        event.subjectType,
        event.subjectId
      );
      const target = getTarget(event);

      return {
        id: `delivery:${event.id}`,
        type: typeForDelivery(event),
        tone,
        label: `${source.sourceLabel} ${formatLabel(event.eventType)}`,
        statusLabel: statusForTone(tone),
        target,
        occurredAt: event.createdAt,
        sourceLabel: source.sourceLabel,
        sourceHref: source.sourceHref,
        helperCopy: `${formatLabel(event.channel)} delivery evidence for ${target}${event.provider ? ` through ${event.provider}` : ""}.`
      };
    }
  );

  const signatureItems = (input.signatureEvents ?? []).map(
    (event): SendTrailItem => {
      const tone = toneForSignature(event.eventType);
      const source = buildSource(recordsByKey, "contract", event.contractId);

      return {
        id: `signature:${event.id}`,
        type: "contract_signature_requested",
        tone,
        label: `${source.sourceLabel} ${formatLabel(event.eventType)}`,
        statusLabel: statusForTone(tone),
        target: formatLabel(event.actorType),
        occurredAt: event.occurredAt,
        sourceLabel: source.sourceLabel,
        sourceHref: source.sourceHref,
        helperCopy:
          "Signature Trail activity is visible here as delivery proof context, while signature truth stays on the contract."
      };
    }
  );

  const paymentItems = (input.paymentEvents ?? []).map(
    (event): SendTrailItem => {
      const tone = toneForPayment(event.eventType);
      const source = buildSource(recordsByKey, "invoice", event.invoiceId);

      return {
        id: `payment:${event.id}`,
        type: "invoice_payment_requested",
        tone,
        label: `${source.sourceLabel} ${formatLabel(event.eventType)}`,
        statusLabel: statusForTone(tone),
        target: formatLabel(event.actorType),
        occurredAt: event.occurredAt,
        sourceLabel: source.sourceLabel,
        sourceHref: source.sourceHref,
        helperCopy: `${event.gatewayProvider ? `${event.gatewayProvider} ` : ""}Payment Trail activity is visible here as delivery proof context.`
      };
    }
  );

  const portalViewItems = (input.portalViews ?? []).map(
    (view): SendTrailItem => {
      const source = buildSource(
        recordsByKey,
        view.subjectType,
        view.subjectId
      );

      return {
        id: `portal-view:${view.id}`,
        type: "portal_view",
        tone: "viewed",
        label: `${source.sourceLabel} viewed`,
        statusLabel: "Viewed",
        target: "Customer Access",
        occurredAt: view.viewedAt,
        sourceLabel: source.sourceLabel,
        sourceHref: source.sourceHref,
        helperCopy:
          "Customer Access view evidence shows the customer opened this record in the portal."
      };
    }
  );

  const communicationItems = (input.communicationMessages ?? []).map(
    (message): SendTrailItem => {
      const type =
        message.subjectType === "change_order" ? "change_order" : "project";
      const source = buildSource(recordsByKey, type, message.subjectId);
      const tone =
        message.deliveryStatus === "failed"
          ? "failed"
          : message.deliveryStatus === "sent"
            ? "sent"
            : message.direction === "inbound"
              ? "acted"
              : "unknown";

      return {
        id: `message:${message.id}`,
        type: "communication_message",
        tone,
        label: `${source.sourceLabel} message`,
        statusLabel: statusForTone(tone),
        target: formatLabel(message.direction),
        occurredAt: message.occurredAt,
        sourceLabel: source.sourceLabel,
        sourceHref: source.sourceHref,
        helperCopy: `${formatLabel(message.channelKind)} message evidence from MessageCenter.`
      };
    }
  );

  const items = [
    ...deliveryItems,
    ...signatureItems,
    ...paymentItems,
    ...portalViewItems,
    ...communicationItems
  ].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const counts = {
    total: items.length,
    sent: items.filter((item) => item.tone === "sent").length,
    viewed: items.filter((item) => item.tone === "viewed").length,
    acted: items.filter((item) => item.tone === "acted").length,
    failed: items.filter((item) => item.tone === "failed").length,
    pending: items.filter((item) => item.tone === "pending").length,
    unknown: items.filter((item) => item.tone === "unknown").length
  };
  const failedItems = items.filter((item) => item.tone === "failed");
  const pendingItems = items.filter((item) => item.tone === "pending");
  const viewedItems = items.filter((item) => item.tone === "viewed");
  const sentItems = items.filter((item) => item.tone === "sent");
  const latestItem = items[0] ?? null;

  return {
    items,
    latestItem,
    counts,
    attentionCount: counts.failed + counts.pending,
    nextMove: buildNextMove({
      latestItem,
      failedItems,
      pendingItems,
      viewedItems,
      sentItems
    })
  };
}
