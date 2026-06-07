import type {
  CommunicationMessageDeliveryStatus,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  CommunicationMessageSenderType,
  CommunicationThreadStatus
} from "@floorconnector/types";

export type PortalProjectCommunicationThread = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  subjectType: string;
  subjectId: string;
  threadStatus: CommunicationThreadStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  updatedAt: string;
};

export type PortalProjectCommunicationMessage = {
  id: string;
  threadId: string;
  senderType: CommunicationMessageSenderType;
  direction: CommunicationMessageDirection;
  messageKind: CommunicationMessageKind;
  deliveryStatus: CommunicationMessageDeliveryStatus;
  body: string;
  occurredAt: string;
  createdAt: string;
};

export type PortalProjectCommunicationConversation = {
  thread: PortalProjectCommunicationThread;
  messages: PortalProjectCommunicationMessage[];
  latestMessage: PortalProjectCommunicationMessage | null;
  latestCustomerReply: PortalProjectCommunicationMessage | null;
  latestContractorMessage: PortalProjectCommunicationMessage | null;
  replyAllowed: boolean;
  customerActionRequired: boolean;
  contractorReviewPending: boolean;
  statusLabel: string;
  statusTone: "attention" | "complete" | "neutral";
  statusDetail: string;
  trustIndicators: string[];
};

export type PortalProjectCommunicationSummary = {
  conversationCount: number;
  messageCount: number;
  replyableConversationCount: number;
  customerActionCount: number;
  contractorReviewCount: number;
  latestMessageAt: string | null;
  conversations: PortalProjectCommunicationConversation[];
  emptyStateMessage: string;
  primaryStatusLabel: string;
  primaryStatusDetail: string;
  historyBoundaryMessage: string;
};

function compareNewest(left: string | null, right: string | null) {
  return (right ?? "").localeCompare(left ?? "");
}

function compareMessages(
  left: PortalProjectCommunicationMessage,
  right: PortalProjectCommunicationMessage
) {
  const occurredComparison = left.occurredAt.localeCompare(right.occurredAt);

  if (occurredComparison !== 0) {
    return occurredComparison;
  }

  return left.createdAt.localeCompare(right.createdAt);
}

function isAfter(
  left: PortalProjectCommunicationMessage | null,
  right: PortalProjectCommunicationMessage | null
) {
  if (!left || !right) {
    return false;
  }

  return compareMessages(left, right) > 0;
}

function isCustomerReply(message: PortalProjectCommunicationMessage) {
  return (
    message.senderType === "portal_user" || message.direction === "inbound"
  );
}

function isContractorMessage(message: PortalProjectCommunicationMessage) {
  return (
    message.senderType === "organization_user" ||
    message.direction === "outbound"
  );
}

function getLatestMessage(
  messages: PortalProjectCommunicationMessage[],
  predicate: (message: PortalProjectCommunicationMessage) => boolean
) {
  return messages.filter(predicate).at(-1) ?? null;
}

function pluralizeConversation(count: number) {
  return `${count} conversation${count === 1 ? "" : "s"}`;
}

export function derivePortalProjectCommunicationSummary(input: {
  threads: PortalProjectCommunicationThread[];
  messages: PortalProjectCommunicationMessage[];
}): PortalProjectCommunicationSummary {
  const messagesByThreadId = new Map<
    string,
    PortalProjectCommunicationMessage[]
  >();

  for (const message of input.messages) {
    const current = messagesByThreadId.get(message.threadId) ?? [];
    current.push(message);
    messagesByThreadId.set(message.threadId, current);
  }

  const conversations = input.threads
    .map((thread): PortalProjectCommunicationConversation => {
      const messages = (messagesByThreadId.get(thread.id) ?? []).sort(
        compareMessages
      );
      const latestMessage = messages[messages.length - 1] ?? null;
      const latestCustomerReply = getLatestMessage(messages, isCustomerReply);
      const latestContractorMessage = getLatestMessage(
        messages,
        isContractorMessage
      );
      const replyAllowed =
        messages.length > 0 && thread.threadStatus !== "archived";
      const contractorReviewPending =
        replyAllowed &&
        latestCustomerReply !== null &&
        (thread.threadStatus === "waiting_on_contractor" ||
          latestContractorMessage === null ||
          isAfter(latestCustomerReply, latestContractorMessage));
      const customerActionRequired =
        replyAllowed &&
        thread.threadStatus === "waiting_on_customer" &&
        !contractorReviewPending;
      const statusLabel =
        thread.threadStatus === "archived"
          ? "History only"
          : customerActionRequired
            ? "Waiting on you"
            : contractorReviewPending
              ? "Contractor reviewing"
              : latestContractorMessage
                ? "Shared update"
                : "Open history";
      const statusTone = customerActionRequired
        ? "attention"
        : contractorReviewPending
          ? "complete"
          : "neutral";
      const statusDetail =
        thread.threadStatus === "archived"
          ? "This customer-visible conversation is closed and kept here as project history."
          : customerActionRequired
            ? "Your contractor is waiting for a customer-visible reply in this project conversation."
            : contractorReviewPending
              ? "Your latest portal reply is saved in shared project history for contractor review."
              : latestContractorMessage
                ? "Your contractor shared this project update in customer-visible history."
                : "This project conversation is available as customer-visible history.";

      return {
        thread,
        messages,
        latestMessage,
        latestCustomerReply,
        latestContractorMessage,
        replyAllowed,
        customerActionRequired,
        contractorReviewPending,
        statusLabel,
        statusTone,
        statusDetail,
        trustIndicators: [
          "Project-linked history",
          "Customer-visible only",
          "No separate email or SMS"
        ]
      };
    })
    .filter((conversation) => conversation.messages.length > 0)
    .sort((left, right) =>
      compareNewest(
        left.latestMessage?.occurredAt ?? left.thread.lastMessageAt,
        right.latestMessage?.occurredAt ?? right.thread.lastMessageAt
      )
    );

  const latestMessageAt = conversations[0]?.latestMessage?.occurredAt ?? null;
  const customerActionCount = conversations.filter(
    (conversation) => conversation.customerActionRequired
  ).length;
  const contractorReviewCount = conversations.filter(
    (conversation) => conversation.contractorReviewPending
  ).length;
  const replyableConversationCount = conversations.filter(
    (conversation) => conversation.replyAllowed
  ).length;
  const primaryStatusLabel =
    customerActionCount > 0
      ? `${pluralizeConversation(customerActionCount)} waiting on you`
      : contractorReviewCount > 0
        ? "Your latest reply is recorded"
        : conversations.length > 0
          ? "Shared communication history is available"
          : "No shared communication yet";
  const primaryStatusDetail =
    customerActionCount > 0
      ? "Reply in the project conversation when your contractor needs a customer response."
      : contractorReviewCount > 0
        ? "Your portal reply is saved to the same project communication history your contractor reviews."
        : conversations.length > 0
          ? "Customer-visible project messages are grouped here so the latest shared context is easy to find."
          : "Customer-visible project communication will appear here after your contractor shares it.";

  return {
    conversationCount: conversations.length,
    messageCount: conversations.reduce(
      (total, conversation) => total + conversation.messages.length,
      0
    ),
    replyableConversationCount,
    customerActionCount,
    contractorReviewCount,
    latestMessageAt,
    conversations,
    emptyStateMessage:
      "No customer-visible project conversation is available yet. Your contractor can start one from their project communication history.",
    primaryStatusLabel,
    primaryStatusDetail,
    historyBoundaryMessage:
      "This section shows customer-visible messages from canonical project communication history. Internal notes, provider metadata, and contractor-only details are not shown here."
  };
}
