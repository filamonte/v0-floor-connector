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
  replyAllowed: boolean;
};

export type PortalProjectCommunicationSummary = {
  conversationCount: number;
  messageCount: number;
  latestMessageAt: string | null;
  conversations: PortalProjectCommunicationConversation[];
  emptyStateMessage: string;
};

function compareNewest(left: string | null, right: string | null) {
  return (right ?? "").localeCompare(left ?? "");
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
        (left, right) => left.occurredAt.localeCompare(right.occurredAt)
      );
      const latestMessage = messages[messages.length - 1] ?? null;

      return {
        thread,
        messages,
        latestMessage,
        replyAllowed: messages.length > 0 && thread.threadStatus !== "archived"
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

  return {
    conversationCount: conversations.length,
    messageCount: conversations.reduce(
      (total, conversation) => total + conversation.messages.length,
      0
    ),
    latestMessageAt,
    conversations,
    emptyStateMessage:
      "No customer-visible project conversation is available yet. Your contractor can start one from their project communication history."
  };
}
