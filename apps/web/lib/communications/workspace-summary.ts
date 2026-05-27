import type {
  ContractorCommunicationContextEvent,
  ContractorCommunicationThreadListItem,
  ContractorCommunicationThreadSummary
} from "./contractor-data";

export type CommunicationWorkspaceLaneKey =
  | "customer"
  | "project"
  | "commercial"
  | "finance"
  | "closeout"
  | "internal";

export type CommunicationWorkspaceLane = {
  key: CommunicationWorkspaceLaneKey;
  label: string;
  count: number;
  attentionCount: number;
  href: string;
  detail: string;
};

export type CommunicationWorkspaceAttentionItem = {
  key: string;
  label: string;
  detail: string;
  href: string;
  occurredAt: string;
  tone: "warning" | "critical";
};

export type CommunicationWorkspaceSummary = {
  primaryStatus: string;
  primaryDetail: string;
  customerVisibleThreadCount: number;
  internalThreadCount: number;
  followUpCount: number;
  financeContextCount: number;
  closeoutEvidenceContextCount: number;
  latestCustomerActivityAt: string | null;
  latestContextActivityAt: string | null;
  lanes: CommunicationWorkspaceLane[];
  attentionItems: CommunicationWorkspaceAttentionItem[];
  recentContextEvents: ContractorCommunicationContextEvent[];
};

const STALE_OPEN_THREAD_DAYS = 7;

function latest(values: Array<string | null | undefined>) {
  return (
    values
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => left.localeCompare(right))
      .at(-1) ?? null
  );
}

function getLaneKey(
  thread: ContractorCommunicationThreadListItem
): CommunicationWorkspaceLaneKey {
  if (thread.lastMessageVisibility === "internal") {
    return "internal";
  }

  switch (thread.subject.type) {
    case "customer":
    case "opportunity":
    case "appointment":
      return "customer";
    case "project":
      return "project";
    case "estimate":
    case "contract":
    case "change_order":
      return "commercial";
    case "invoice":
    case "payment":
      return "finance";
    default:
      return "project";
  }
}

function getLaneHref(key: CommunicationWorkspaceLaneKey) {
  switch (key) {
    case "customer":
      return "/communications?source=customer";
    case "project":
      return "/communications?source=project";
    case "commercial":
      return "/communications?source=contract";
    case "finance":
      return "/communications?source=invoice";
    case "closeout":
      return "/communications";
    case "internal":
      return "/communications?view=recent";
  }
}

function getLaneDetail(key: CommunicationWorkspaceLaneKey, count: number) {
  if (count === 0) {
    switch (key) {
      case "customer":
        return "No customer relationship threads yet.";
      case "project":
        return "No project-linked threads yet.";
      case "commercial":
        return "No estimate, contract, or change-order threads yet.";
      case "finance":
        return "No invoice or payment threads yet.";
      case "closeout":
        return "No closeout or shared-evidence activity yet.";
      case "internal":
        return "No internal-only thread context yet.";
    }
  }

  switch (key) {
    case "customer":
      return "Customer and intake conversation context.";
    case "project":
      return "Project-level coordination and handoff context.";
    case "commercial":
      return "Estimate, contract, and change-order context.";
    case "finance":
      return "Invoice, payment, and collections context.";
    case "closeout":
      return "Delivery proof and shared-evidence handoff context.";
    case "internal":
      return "Internal-only coordination that stays out of the portal.";
  }
}

function isStaleOpenThread(
  thread: ContractorCommunicationThreadListItem,
  now: Date
) {
  if (thread.threadStatus !== "open" || !thread.lastActivityAt) {
    return false;
  }

  const lastActivityAt = new Date(thread.lastActivityAt).getTime();
  const staleBefore =
    now.getTime() - STALE_OPEN_THREAD_DAYS * 24 * 60 * 60 * 1000;

  return Number.isFinite(lastActivityAt) && lastActivityAt < staleBefore;
}

function buildThreadAttentionItems(input: {
  threads: ContractorCommunicationThreadListItem[];
  now: Date;
}): CommunicationWorkspaceAttentionItem[] {
  return input.threads.flatMap((thread) => {
    const href = `/communications?source=${thread.subject.type}&threadId=${thread.id}`;

    if (thread.needsResponse) {
      return [
        {
          key: `needs-response:${thread.id}`,
          label: "Customer response waiting",
          detail: `${thread.subject.label} has customer-originated unread communication.`,
          href,
          occurredAt: thread.lastUnreadAt ?? thread.lastActivityAt,
          tone: "warning" as const
        }
      ];
    }

    if (thread.unreadCount > 0) {
      return [
        {
          key: `unread:${thread.id}`,
          label: "Unread communication activity",
          detail: `${thread.subject.label} has unread communication notifications.`,
          href,
          occurredAt: thread.lastUnreadAt ?? thread.lastActivityAt,
          tone: "warning" as const
        }
      ];
    }

    if (isStaleOpenThread(thread, input.now)) {
      return [
        {
          key: `stale:${thread.id}`,
          label: "Open thread is getting stale",
          detail: `${thread.subject.label} has no recent stored communication activity.`,
          href,
          occurredAt: thread.lastActivityAt,
          tone: "warning" as const
        }
      ];
    }

    return [];
  });
}

function buildEventAttentionItems(
  events: ContractorCommunicationContextEvent[]
): CommunicationWorkspaceAttentionItem[] {
  return events
    .filter((event) => event.tone === "critical" || event.tone === "warning")
    .map((event) => ({
      key: `event:${event.id}`,
      label:
        event.tone === "critical"
          ? "Delivery issue"
          : "Review delivery context",
      detail: event.description,
      href: event.href,
      occurredAt: event.occurredAt,
      tone: event.tone === "critical" ? "critical" : "warning"
    }));
}

export function deriveCommunicationWorkspaceSummary(input: {
  threads: ContractorCommunicationThreadListItem[];
  threadSummary: ContractorCommunicationThreadSummary;
  contextEvents: ContractorCommunicationContextEvent[];
  notificationCount: number;
  now?: Date;
}): CommunicationWorkspaceSummary {
  const now = input.now ?? new Date();
  const customerVisibleThreads = input.threads.filter(
    (thread) => thread.lastMessageVisibility === "customer_visible"
  );
  const internalThreads = input.threads.filter(
    (thread) => thread.lastMessageVisibility === "internal"
  );
  const financeThreads = input.threads.filter(
    (thread) =>
      thread.subject.type === "invoice" || thread.subject.type === "payment"
  );
  const closeoutEvents = input.contextEvents.filter(
    (event) =>
      event.kind === "shared_evidence" ||
      event.sourceType === "warranty_document"
  );
  const laneKeys: CommunicationWorkspaceLaneKey[] = [
    "customer",
    "project",
    "commercial",
    "finance",
    "closeout",
    "internal"
  ];
  const attentionItems = [
    ...buildThreadAttentionItems({ threads: input.threads, now }),
    ...buildEventAttentionItems(input.contextEvents)
  ].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

  const lanes = laneKeys.map((key) => {
    const count =
      key === "closeout"
        ? closeoutEvents.length
        : input.threads.filter((thread) => getLaneKey(thread) === key).length;
    const attentionCount =
      key === "closeout"
        ? closeoutEvents.filter(
            (event) => event.tone === "critical" || event.tone === "warning"
          ).length
        : input.threads.filter(
            (thread) =>
              getLaneKey(thread) === key &&
              (thread.needsResponse || thread.unreadCount > 0)
          ).length;

    return {
      key,
      label:
        key === "closeout"
          ? "Closeout & evidence"
          : key === "customer"
            ? "Customer conversations"
            : key === "project"
              ? "Project threads"
              : key === "commercial"
                ? "Commercial records"
                : key === "finance"
                  ? "Finance & collections"
                  : "Internal coordination",
      count,
      attentionCount,
      href: getLaneHref(key),
      detail: getLaneDetail(key, count)
    };
  });

  const followUpCount =
    input.threadSummary.needsResponseCount +
    input.contextEvents.filter((event) => event.tone === "critical").length;
  const primaryStatus =
    followUpCount > 0
      ? "Follow-up needed"
      : input.threadSummary.totalCount > 0 || input.contextEvents.length > 0
        ? "Communication continuity active"
        : "No communication history yet";

  return {
    primaryStatus,
    primaryDetail:
      followUpCount > 0
        ? `Customer replies, unread items, or delivery issues need review before the workflow can be treated as quiet. ${input.notificationCount} unread communication notification${input.notificationCount === 1 ? "" : "s"} are currently open.`
        : "Threads, document delivery proof, and shared-evidence activity are connected back to source records without sending anything from this workspace.",
    customerVisibleThreadCount: customerVisibleThreads.length,
    internalThreadCount: internalThreads.length,
    followUpCount,
    financeContextCount: financeThreads.length,
    closeoutEvidenceContextCount: closeoutEvents.length,
    latestCustomerActivityAt: latest(
      customerVisibleThreads.map((thread) => thread.lastActivityAt)
    ),
    latestContextActivityAt: latest([
      ...input.threads.map((thread) => thread.lastActivityAt),
      ...input.contextEvents.map((event) => event.occurredAt)
    ]),
    lanes,
    attentionItems,
    recentContextEvents: input.contextEvents.slice(0, 6)
  };
}
