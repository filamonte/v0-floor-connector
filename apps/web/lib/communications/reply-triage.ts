import type {
  CommunicationChannelKind,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  CommunicationMessageVisibility,
  CommunicationThreadStatus
} from "@floorconnector/types";

export type CommunicationReplyTriageThread = {
  id: string;
  threadStatus: CommunicationThreadStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

export type CommunicationReplyTriageMessage = {
  id: string;
  threadId: string;
  senderType: "organization_user" | "portal_user" | "system";
  direction: CommunicationMessageDirection;
  channelKind: CommunicationChannelKind;
  messageKind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  body: string;
  occurredAt: string;
  createdAt: string;
};

export type CommunicationReplyTriageItem = {
  threadId: string;
  needsResponse: boolean;
  latestCustomerReplyAt: string | null;
  latestCustomerReplyPreview: string | null;
  latestContractorResponseAt: string | null;
  source: "message_history" | "thread_status" | "quiet";
};

export type CommunicationReplyTriageSummary = {
  items: CommunicationReplyTriageItem[];
  needsResponseCount: number;
  latestCustomerReplyAt: string | null;
};

function truncatePreview(value: string | null | undefined) {
  const normalized = (value ?? "").trim().replace(/\s+/g, " ");

  if (normalized.length <= 120) {
    return normalized || null;
  }

  return `${normalized.slice(0, 117)}...`;
}

function isPortalCustomerReply(message: CommunicationReplyTriageMessage) {
  return (
    message.senderType === "portal_user" &&
    message.direction === "inbound" &&
    message.channelKind === "portal" &&
    message.messageKind === "customer_message" &&
    message.visibility === "customer_visible"
  );
}

function isContractorCustomerVisibleResponse(
  message: CommunicationReplyTriageMessage
) {
  return (
    message.senderType === "organization_user" &&
    message.direction === "outbound" &&
    message.messageKind === "customer_message" &&
    message.visibility === "customer_visible"
  );
}

function compareOccurredAt(
  left: CommunicationReplyTriageMessage,
  right: CommunicationReplyTriageMessage
) {
  const occurredComparison = right.occurredAt.localeCompare(left.occurredAt);

  if (occurredComparison !== 0) {
    return occurredComparison;
  }

  return right.createdAt.localeCompare(left.createdAt);
}

export function deriveCommunicationReplyTriage(input: {
  threads: CommunicationReplyTriageThread[];
  messages: CommunicationReplyTriageMessage[];
}): CommunicationReplyTriageSummary {
  const messagesByThreadId = new Map<
    string,
    CommunicationReplyTriageMessage[]
  >();

  for (const message of input.messages) {
    const messages = messagesByThreadId.get(message.threadId) ?? [];
    messages.push(message);
    messagesByThreadId.set(message.threadId, messages);
  }

  const items = input.threads.map((thread): CommunicationReplyTriageItem => {
    const messages = (messagesByThreadId.get(thread.id) ?? []).sort(
      compareOccurredAt
    );
    const latestCustomerReply =
      messages.find((message) => isPortalCustomerReply(message)) ?? null;
    const latestCustomerReplyAt = latestCustomerReply?.occurredAt ?? null;
    const latestContractorResponse =
      latestCustomerReplyAt == null
        ? null
        : (messages.find(
            (message) =>
              isContractorCustomerVisibleResponse(message) &&
              message.occurredAt > latestCustomerReplyAt
          ) ?? null);
    const hasOpenReplyFromMessages =
      latestCustomerReplyAt != null && latestContractorResponse == null;
    const needsResponse =
      hasOpenReplyFromMessages ||
      (latestCustomerReplyAt == null &&
        thread.threadStatus === "waiting_on_contractor");

    return {
      threadId: thread.id,
      needsResponse,
      latestCustomerReplyAt,
      latestCustomerReplyPreview:
        truncatePreview(latestCustomerReply?.body) ??
        (needsResponse ? truncatePreview(thread.lastMessagePreview) : null),
      latestContractorResponseAt: latestContractorResponse?.occurredAt ?? null,
      source: hasOpenReplyFromMessages
        ? "message_history"
        : needsResponse
          ? "thread_status"
          : "quiet"
    };
  });

  return {
    items,
    needsResponseCount: items.filter((item) => item.needsResponse).length,
    latestCustomerReplyAt:
      items
        .map((item) => item.latestCustomerReplyAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? null
  };
}
