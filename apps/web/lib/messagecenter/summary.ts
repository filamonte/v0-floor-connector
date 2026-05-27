import type {
  MessageCenterCommunicationMessage,
  MessageCenterCommunicationThread,
  MessageCenterDeliveryEvent,
  MessageCenterPaymentEvent,
  MessageCenterSignatureEvent
} from "./data";

type MessageCenterRecord = {
  id: string;
  label: string;
  href: string;
};

export type MessageCenterTimelineItem = {
  id: string;
  kind: "message" | "send" | "signature" | "payment";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  occurredAt: string;
  tone: "neutral" | "positive" | "warning" | "critical";
};

export type MessageCenterSummary = {
  latestActivityAt: string | null;
  threadCount: number;
  messageCount: number;
  customerVisibleMessageCount?: number;
  internalMessageCount?: number;
  sendTrailCount: number;
  signatureTrailCount: number;
  paymentTrailCount: number;
  customerAccessCount: number;
  attentionCount: number;
  latestSendTrail: MessageCenterTimelineItem | null;
  latestSignatureTrail: MessageCenterTimelineItem | null;
  latestPaymentTrail: MessageCenterTimelineItem | null;
  latestCustomerMessage?: MessageCenterTimelineItem | null;
  nextMove: {
    label: string;
    href: string;
    detail: string;
  };
  timeline: MessageCenterTimelineItem[];
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function truncateBody(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= 140) {
    return normalized;
  }

  return `${normalized.slice(0, 137)}...`;
}

function getThreadHref(thread: MessageCenterCommunicationThread | undefined) {
  if (!thread) {
    return "/communications";
  }

  const searchParams = new URLSearchParams({
    source: thread.subjectType,
    threadId: thread.id
  });

  return `/communications?${searchParams.toString()}`;
}

function getDeliveryTone(
  event: MessageCenterDeliveryEvent
): MessageCenterTimelineItem["tone"] {
  if (event.eventType === "failed" || event.eventType === "bounced") {
    return "critical";
  }

  if (
    event.eventType === "opened" ||
    event.eventType === "clicked" ||
    event.eventType === "viewed"
  ) {
    return "positive";
  }

  return event.eventType === "send_requested" ? "warning" : "neutral";
}

function getSignatureTone(
  event: MessageCenterSignatureEvent
): MessageCenterTimelineItem["tone"] {
  if (
    event.eventType === "signature_completed" ||
    event.eventType === "signer_signed" ||
    event.eventType === "contractor_countersigned"
  ) {
    return "positive";
  }

  if (
    event.eventType === "signer_declined" ||
    event.eventType === "signature_voided"
  ) {
    return "critical";
  }

  return event.eventType === "signature_requested" ? "warning" : "neutral";
}

function getPaymentTone(
  event: MessageCenterPaymentEvent
): MessageCenterTimelineItem["tone"] {
  const eventType = event.eventType;

  if (
    eventType.includes("failed") ||
    eventType.includes("void") ||
    eventType.includes("canceled")
  ) {
    return "critical";
  }

  if (
    eventType.includes("succeeded") ||
    eventType.includes("completed") ||
    eventType.includes("recorded")
  ) {
    return "positive";
  }

  return eventType.includes("requested") || eventType.includes("started")
    ? "warning"
    : "neutral";
}

function latest(
  items: MessageCenterTimelineItem[],
  kind: MessageCenterTimelineItem["kind"]
) {
  return items.find((item) => item.kind === kind) ?? null;
}

function buildNextMove(input: {
  timeline: MessageCenterTimelineItem[];
  attentionCount: number;
  latestCustomerMessage: MessageCenterTimelineItem | null;
  projectId: string;
}) {
  if (input.attentionCount > 0) {
    return {
      label: "Review MessageCenter",
      href: "#messagecenter",
      detail: `${input.attentionCount} communication item${
        input.attentionCount === 1 ? "" : "s"
      } need follow-up.`
    };
  }

  if (input.latestCustomerMessage) {
    return {
      label: "Open customer thread",
      href: input.latestCustomerMessage.href,
      detail: "Latest customer communication is ready to review."
    };
  }

  const latestItem = input.timeline[0] ?? null;

  if (latestItem) {
    return {
      label: "Open latest activity",
      href: latestItem.href,
      detail: `${latestItem.eyebrow} is the most recent communication touch.`
    };
  }

  return {
    label: "Open communications",
    href: `/communications?source=project`,
    detail:
      "No communication history exists yet. Start with the project thread when follow-up is needed."
  };
}

export function deriveMessageCenterSummary(input: {
  projectId: string;
  threads: MessageCenterCommunicationThread[];
  messages: MessageCenterCommunicationMessage[];
  deliveryEvents: MessageCenterDeliveryEvent[];
  signatureEvents: MessageCenterSignatureEvent[];
  paymentEvents: MessageCenterPaymentEvent[];
  estimates: MessageCenterRecord[];
  contracts: MessageCenterRecord[];
  invoices: MessageCenterRecord[];
  customerAccessCount: number;
}): MessageCenterSummary {
  const threadsById = new Map(
    input.threads.map((thread) => [thread.id, thread])
  );
  const estimateById = new Map(
    input.estimates.map((record) => [record.id, record])
  );
  const contractById = new Map(
    input.contracts.map((record) => [record.id, record])
  );
  const invoiceById = new Map(
    input.invoices.map((record) => [record.id, record])
  );

  const messageItems = input.messages.map(
    (message): MessageCenterTimelineItem => {
      const thread = threadsById.get(message.threadId);
      const isCustomer =
        message.senderType === "portal_user" || message.direction === "inbound";

      return {
        id: `message:${message.id}`,
        kind: "message",
        eyebrow: "MessageCenter",
        title: isCustomer ? "Customer message" : "Internal message",
        description: truncateBody(message.body),
        href: getThreadHref(thread),
        occurredAt: message.occurredAt,
        tone: isCustomer ? "warning" : "neutral"
      };
    }
  );

  const deliveryItems = input.deliveryEvents.map(
    (event): MessageCenterTimelineItem => {
      const record =
        event.subjectType === "estimate"
          ? estimateById.get(event.subjectId)
          : event.subjectType === "contract"
            ? contractById.get(event.subjectId)
            : event.subjectType === "invoice"
              ? invoiceById.get(event.subjectId)
              : null;
      const recipient =
        event.recipientName ?? event.recipientEmail ?? "Customer";

      return {
        id: `send:${event.id}`,
        kind: "send",
        eyebrow: "Send Trail",
        title: record
          ? `${record.label}`
          : `${formatLabel(event.subjectType)} send`,
        description: `${formatLabel(event.eventType)} via ${formatLabel(event.channel)} for ${recipient}.`,
        href: record?.href ?? "/communications",
        occurredAt: event.createdAt,
        tone: getDeliveryTone(event)
      };
    }
  );

  const signatureItems = input.signatureEvents.map(
    (event): MessageCenterTimelineItem => {
      const contract = contractById.get(event.contractId);

      return {
        id: `signature:${event.id}`,
        kind: "signature",
        eyebrow: "Signature Trail",
        title: contract?.label ?? "Contract signature",
        description: `${formatLabel(event.eventType)} by ${formatLabel(event.actorType)}.`,
        href: contract?.href ?? "/contracts",
        occurredAt: event.occurredAt,
        tone: getSignatureTone(event)
      };
    }
  );

  const paymentItems = input.paymentEvents.map(
    (event): MessageCenterTimelineItem => {
      const invoice = invoiceById.get(event.invoiceId);

      return {
        id: `payment:${event.id}`,
        kind: "payment",
        eyebrow: "Payment Trail",
        title: invoice?.label ?? "Invoice payment",
        description: `${formatLabel(event.eventType)}${event.gatewayProvider ? ` through ${event.gatewayProvider}` : ""}.`,
        href: invoice?.href ?? "/payments",
        occurredAt: event.occurredAt,
        tone: getPaymentTone(event)
      };
    }
  );

  const timeline = [
    ...messageItems,
    ...deliveryItems,
    ...signatureItems,
    ...paymentItems
  ].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const attentionCount = timeline.filter(
    (item) => item.tone === "critical" || item.tone === "warning"
  ).length;
  const latestCustomerMessage =
    messageItems.find((item) => item.title === "Customer message") ?? null;

  return {
    latestActivityAt: timeline[0]?.occurredAt ?? null,
    threadCount: input.threads.length,
    messageCount: input.messages.length,
    customerVisibleMessageCount: input.messages.filter(
      (message) => message.visibility === "customer_visible"
    ).length,
    internalMessageCount: input.messages.filter(
      (message) => message.visibility === "internal"
    ).length,
    sendTrailCount: input.deliveryEvents.length,
    signatureTrailCount: input.signatureEvents.length,
    paymentTrailCount: input.paymentEvents.length,
    customerAccessCount: input.customerAccessCount,
    attentionCount,
    latestSendTrail: latest(timeline, "send"),
    latestSignatureTrail: latest(timeline, "signature"),
    latestPaymentTrail: latest(timeline, "payment"),
    latestCustomerMessage,
    nextMove: buildNextMove({
      timeline,
      attentionCount,
      latestCustomerMessage,
      projectId: input.projectId
    }),
    timeline
  };
}
