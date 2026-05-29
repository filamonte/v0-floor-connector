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
  actionLabel: string;
  boundaryLabel: string;
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

export type CommunicationDeliveryProofRecordGroup = {
  key: string;
  sourceType: ContractorCommunicationContextEvent["sourceRecord"]["type"];
  sourceId: string;
  sourceLabel: string;
  sourceHref: string;
  communicationsHref: string;
  proofCount: number;
  reviewCount: number;
  needsReview: boolean;
  latestEventAt: string;
  latestProofStateLabel: string;
  latestDescription: string;
  proofSourceLabels: string[];
  proofBoundaryLabels: string[];
  audienceLabels: string[];
};

export type CommunicationWorkspaceSummary = {
  primaryStatus: string;
  primaryDetail: string;
  workflowCoverageCount: number;
  workflowCoverageLabel: string;
  workflowCoverageDetail: string;
  customerBoundaryLabel: string;
  customerBoundaryDetail: string;
  notificationReviewLabel: string;
  notificationReviewDetail: string;
  deliveryProofLabel: string;
  deliveryProofDetail: string;
  deliveryProofReviewCount: number;
  latestDeliveryProof: ContractorCommunicationContextEvent | null;
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
  deliveryProofRecordGroups: CommunicationDeliveryProofRecordGroup[];
};

const STALE_OPEN_THREAD_DAYS = 7;
const OPERATIONAL_WORKFLOW_SUBJECTS = [
  "opportunity",
  "customer",
  "project",
  "estimate",
  "contract",
  "change_order",
  "invoice",
  "payment"
] as const;

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

function getLaneActionLabel(key: CommunicationWorkspaceLaneKey) {
  switch (key) {
    case "customer":
      return "Review relationship handoff";
    case "project":
      return "Review project continuity";
    case "commercial":
      return "Review commercial decisions";
    case "finance":
      return "Review payment pressure";
    case "closeout":
      return "Review proof context";
    case "internal":
      return "Review internal notes";
  }
}

function getLaneBoundaryLabel(key: CommunicationWorkspaceLaneKey) {
  switch (key) {
    case "internal":
      return "Internal-only";
    case "closeout":
      return "Proof visibility";
    default:
      return "Customer workflow";
  }
}

function formatWorkflowCoverage(count: number) {
  return `${count}/${OPERATIONAL_WORKFLOW_SUBJECTS.length} workflow stages linked`;
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
          detail: thread.customerReplyNeedsResponse
            ? `${thread.subject.label} has a portal customer reply waiting for contractor follow-up.`
            : `${thread.subject.label} has customer-originated unread communication.`,
          href,
          occurredAt:
            thread.latestCustomerReplyAt ??
            thread.lastUnreadAt ??
            thread.lastActivityAt,
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

function unique(values: string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function formatPlural(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function getDeliveryProofCommunicationHref(
  sourceType: CommunicationDeliveryProofRecordGroup["sourceType"]
) {
  if (sourceType === "warranty_document") {
    return "/communications";
  }

  return `/communications?source=${sourceType}`;
}

export function deriveDeliveryProofRecordGroups(
  events: ReadonlyArray<ContractorCommunicationContextEvent>
): CommunicationDeliveryProofRecordGroup[] {
  const eventsByRecordKey = new Map<
    string,
    ContractorCommunicationContextEvent[]
  >();

  for (const event of events) {
    const key = `${event.sourceRecord.type}:${event.sourceRecord.id}`;
    eventsByRecordKey.set(key, [...(eventsByRecordKey.get(key) ?? []), event]);
  }

  return [...eventsByRecordKey.entries()]
    .map(([key, groupEvents]) => {
      const sortedEvents = [...groupEvents].sort((left, right) =>
        right.occurredAt.localeCompare(left.occurredAt)
      );
      const latestEvent = sortedEvents[0];
      const reviewCount = sortedEvents.filter(
        (event) => event.needsReview
      ).length;

      return {
        key,
        sourceType: latestEvent.sourceRecord.type,
        sourceId: latestEvent.sourceRecord.id,
        sourceLabel: latestEvent.sourceRecord.label,
        sourceHref: latestEvent.sourceRecord.href,
        communicationsHref: getDeliveryProofCommunicationHref(
          latestEvent.sourceRecord.type
        ),
        proofCount: sortedEvents.length,
        reviewCount,
        needsReview: reviewCount > 0,
        latestEventAt: latestEvent.occurredAt,
        latestProofStateLabel: latestEvent.proofStateLabel,
        latestDescription:
          reviewCount > 0
            ? `${latestEvent.sourceRecord.label} has ${formatPlural(
                reviewCount,
                "proof item"
              )} that need review.`
            : `${latestEvent.proofStateLabel} across ${formatPlural(
                sortedEvents.length,
                "proof event"
              )}.`,
        proofSourceLabels: unique(
          sortedEvents.map((event) => event.proofSourceLabel)
        ),
        proofBoundaryLabels: unique(
          sortedEvents.map((event) => event.proofBoundaryLabel)
        ),
        audienceLabels: unique(
          sortedEvents.map((event) =>
            event.audience === "customer" ? "Customer-facing" : "Internal"
          )
        )
      } satisfies CommunicationDeliveryProofRecordGroup;
    })
    .sort((left, right) => {
      if (left.needsReview !== right.needsReview) {
        return left.needsReview ? -1 : 1;
      }

      return right.latestEventAt.localeCompare(left.latestEventAt);
    });
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
  const workflowCoverageCount = new Set(
    input.threads
      .map((thread) => thread.subject.type)
      .filter((type) =>
        OPERATIONAL_WORKFLOW_SUBJECTS.includes(
          type as (typeof OPERATIONAL_WORKFLOW_SUBJECTS)[number]
        )
      )
  ).size;
  const criticalContextCount = input.contextEvents.filter(
    (event) => event.tone === "critical"
  ).length;
  const deliveryProofReviewCount = input.contextEvents.filter(
    (event) => event.needsReview
  ).length;
  const deliveryProofRecordGroups = deriveDeliveryProofRecordGroups(
    input.contextEvents
  );
  const latestDeliveryProof =
    [...input.contextEvents].sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt)
    )[0] ?? null;
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
      actionLabel: getLaneActionLabel(key),
      boundaryLabel: getLaneBoundaryLabel(key),
      detail: getLaneDetail(key, count)
    };
  });

  const followUpCount =
    input.threadSummary.needsResponseCount + criticalContextCount;
  const customerReplyCount = input.threads.filter(
    (thread) => thread.customerReplyNeedsResponse
  ).length;
  const primaryStatus =
    followUpCount > 0
      ? "Follow-up needed"
      : input.threadSummary.totalCount > 0 || input.contextEvents.length > 0
        ? "Communication continuity active"
        : "No communication history yet";

  return {
    primaryStatus,
    primaryDetail:
      customerReplyCount > 0
        ? `${customerReplyCount} portal customer repl${
            customerReplyCount === 1 ? "y is" : "ies are"
          } waiting for contractor follow-up. Existing notification read-state remains separate from this derived reply triage.`
        : followUpCount > 0
          ? `Customer replies, unread items, or delivery issues need review before the workflow can be treated as quiet. ${input.notificationCount} unread communication notification${input.notificationCount === 1 ? "" : "s"} are currently open.`
          : "Threads, document delivery proof, and shared-evidence activity are connected back to source records without sending anything from this workspace.",
    workflowCoverageCount,
    workflowCoverageLabel: formatWorkflowCoverage(workflowCoverageCount),
    workflowCoverageDetail:
      workflowCoverageCount > 0
        ? "Coverage is derived from existing communication thread source records across opportunity, customer, project, estimate, contract, change order, invoice, and payment."
        : "No canonical workflow source records have communication threads yet.",
    customerBoundaryLabel:
      customerVisibleThreads.length > 0
        ? `${customerVisibleThreads.length} customer-visible / ${internalThreads.length} internal`
        : internalThreads.length > 0
          ? `${internalThreads.length} internal-only`
          : "No boundary signals yet",
    customerBoundaryDetail:
      "Customer-visible and internal-only labels come from stored message visibility; portal-owned copies are not created here.",
    notificationReviewLabel:
      input.notificationCount > 0
        ? `${input.notificationCount} unread review signal${
            input.notificationCount === 1 ? "" : "s"
          }`
        : "No unread review signals",
    notificationReviewDetail:
      "Notification review reflects per-user read state only and stays separate from derived reply triage.",
    deliveryProofLabel:
      input.contextEvents.length > 0
        ? `${input.contextEvents.length} proof event${
            input.contextEvents.length === 1 ? "" : "s"
          }`
        : "No proof events yet",
    deliveryProofDetail:
      deliveryProofReviewCount > 0
        ? `${deliveryProofReviewCount} delivery proof item${
            deliveryProofReviewCount === 1 ? "" : "s"
          } need review.`
        : latestDeliveryProof
          ? `${latestDeliveryProof.proofStateLabel} on ${latestDeliveryProof.title.toLowerCase()}.`
          : "No delivery proof yet. Evidence appears here only after existing send, delivery, or shared-evidence records are present.",
    deliveryProofReviewCount,
    latestDeliveryProof,
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
    recentContextEvents: input.contextEvents.slice(0, 6),
    deliveryProofRecordGroups
  };
}
