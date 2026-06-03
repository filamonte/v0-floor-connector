import type {
  MembershipRole,
  PersonId,
  WorkItem,
  WorkItemPriority
} from "@floorconnector/types";

export type WorkItemQueueFilter = "open" | "assigned" | "due" | "all";
export type WorkItemDueState = "none" | "upcoming" | "overdue";
export type WorkItemFieldState =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "completed";
export type EstimateWorkItemType =
  | "generate_estimate"
  | "review_estimate"
  | "request_missing_info"
  | "approve_send"
  | "follow_up_customer";
export type MobileAssignedWorkItemGroupKey =
  | "blocked"
  | "overdue"
  | "today"
  | "upcoming"
  | "completed";

export type ContextRichWorkItemPreview = {
  id: string;
  title: string;
  instructionsSummary: string | null;
  measurementNotes: string | null;
  assignedPersonId: string | null;
  dueAt: string | null;
  dueState: WorkItemDueState;
  priority: WorkItemPriority;
  status: WorkItem["status"];
  sourceType: WorkItem["sourceType"];
  sourceId: string | null;
  customerId: string | null;
  projectId: string | null;
  attachmentCount: number | null;
};

export type EstimateWorkQueue<T extends WorkItem = WorkItem> = {
  assigned: T[];
  waitingOnMe: T[];
  readyForReview: T[];
  blocked: T[];
  followUpsDue: T[];
};

const priorityRank: Record<WorkItemPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3
};

function dueSortValue(value: string | null) {
  return value ?? "9999-12-31T23:59:59.999Z";
}

export function isOpenWorkItem(workItem: Pick<WorkItem, "status">) {
  return workItem.status === "open";
}

export function isDueWorkItem(
  workItem: Pick<WorkItem, "status" | "dueAt">,
  nowIso: string
) {
  return (
    workItem.status === "open" &&
    Boolean(workItem.dueAt && workItem.dueAt <= nowIso)
  );
}

function trimString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getMetadataNumber(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function isEstimateWorkItemType(value: unknown): value is EstimateWorkItemType {
  return (
    value === "generate_estimate" ||
    value === "review_estimate" ||
    value === "request_missing_info" ||
    value === "approve_send" ||
    value === "follow_up_customer"
  );
}

export function getWorkItemMeasurementNotes(
  workItem: Pick<WorkItem, "metadata">
) {
  return trimString(workItem.metadata.measurementNotes);
}

export function getWorkItemAttachmentCount(
  workItem: Pick<WorkItem, "metadata">
) {
  return getMetadataNumber(workItem.metadata.attachmentCount);
}

export function getEstimateWorkItemType(
  workItem: Pick<WorkItem, "metadata">
): EstimateWorkItemType | null {
  return isEstimateWorkItemType(workItem.metadata.estimateWorkType)
    ? workItem.metadata.estimateWorkType
    : null;
}

export function isEstimateWorkItem(
  workItem: Pick<WorkItem, "kind" | "metadata" | "sourceType">
) {
  return (
    getEstimateWorkItemType(workItem) !== null ||
    workItem.metadata.estimateWork === true ||
    (workItem.kind === "estimate_follow_up" &&
      (workItem.sourceType === "opportunity" ||
        workItem.sourceType === "estimate"))
  );
}

export function getWorkItemFieldState(
  workItem: Pick<WorkItem, "metadata" | "status">
): WorkItemFieldState {
  if (workItem.status === "completed") {
    return "completed";
  }

  if (
    workItem.metadata.fieldState === "in_progress" ||
    workItem.metadata.fieldState === "blocked"
  ) {
    return workItem.metadata.fieldState;
  }

  if (
    workItem.metadata.blocked === true ||
    trimString(workItem.metadata.blockerReason)
  ) {
    return "blocked";
  }

  return "not_started";
}

export function getWorkItemBlockerReason(workItem: Pick<WorkItem, "metadata">) {
  return trimString(workItem.metadata.blockerReason);
}

export function getWorkItemCompletionNote(
  workItem: Pick<WorkItem, "metadata">
) {
  return trimString(workItem.metadata.completionNote);
}

export function canActOnAssignedWorkItem(input: {
  workItem: Pick<WorkItem, "assignedPersonId">;
  currentPersonId: PersonId | null;
  membershipRole: MembershipRole;
}) {
  if (
    input.currentPersonId &&
    input.workItem.assignedPersonId === input.currentPersonId
  ) {
    return true;
  }

  return ["owner", "admin", "manager"].includes(input.membershipRole);
}

export function getWorkItemDueState(
  workItem: Pick<WorkItem, "status" | "dueAt">,
  nowIso: string
): WorkItemDueState {
  if (workItem.status !== "open" || !workItem.dueAt) {
    return "none";
  }

  return workItem.dueAt < nowIso ? "overdue" : "upcoming";
}

export function buildContextRichWorkItemPreview(
  workItem: WorkItem,
  nowIso: string
): ContextRichWorkItemPreview {
  return {
    id: workItem.id,
    title: workItem.title,
    instructionsSummary: trimString(workItem.description),
    measurementNotes: getWorkItemMeasurementNotes(workItem),
    assignedPersonId: workItem.assignedPersonId,
    dueAt: workItem.dueAt,
    dueState: getWorkItemDueState(workItem, nowIso),
    priority: workItem.priority,
    status: workItem.status,
    sourceType: workItem.sourceType,
    sourceId: workItem.sourceId,
    customerId: workItem.customerId,
    projectId: workItem.projectId,
    attachmentCount: getWorkItemAttachmentCount(workItem)
  };
}

export function sortWorkItemsForQueue<
  T extends Pick<WorkItem, "dueAt" | "priority" | "createdAt" | "title">
>(workItems: T[]) {
  return [...workItems].sort((left, right) => {
    const dueComparison = dueSortValue(left.dueAt).localeCompare(
      dueSortValue(right.dueAt)
    );

    if (dueComparison !== 0) {
      return dueComparison;
    }

    const priorityComparison =
      priorityRank[left.priority] - priorityRank[right.priority];

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    const createdComparison = left.createdAt.localeCompare(right.createdAt);

    if (createdComparison !== 0) {
      return createdComparison;
    }

    return left.title.localeCompare(right.title);
  });
}

export function filterDashboardWorkItems<T extends WorkItem>(input: {
  workItems: T[];
  assignedPersonId?: string | null;
  limit: number;
}) {
  const openItems = input.workItems.filter(isOpenWorkItem);
  const scopedItems = input.assignedPersonId
    ? openItems.filter(
        (item) => item.assignedPersonId === input.assignedPersonId
      )
    : openItems;

  return sortWorkItemsForQueue(scopedItems).slice(0, input.limit);
}

export function selectOpenWorkItemsByProject<T extends WorkItem>(input: {
  workItems: T[];
  projectId: string;
}) {
  return sortWorkItemsForQueue(
    input.workItems.filter(
      (workItem) =>
        isOpenWorkItem(workItem) && workItem.projectId === input.projectId
    )
  );
}

export function selectOpenWorkItemsByJob<T extends WorkItem>(input: {
  workItems: T[];
  jobId: string;
}) {
  return sortWorkItemsForQueue(
    input.workItems.filter(
      (workItem) =>
        isOpenWorkItem(workItem) &&
        workItem.sourceType === "job" &&
        workItem.sourceId === input.jobId
    )
  );
}

export function selectAssignedWorkItems<T extends WorkItem>(input: {
  workItems: T[];
  assignedPersonId: string;
}) {
  return sortWorkItemsForQueue(
    input.workItems.filter(
      (workItem) =>
        isOpenWorkItem(workItem) &&
        workItem.assignedPersonId === input.assignedPersonId
    )
  );
}

export function selectOverdueWorkItems<T extends WorkItem>(input: {
  workItems: T[];
  nowIso: string;
}) {
  return sortWorkItemsForQueue(
    input.workItems.filter((workItem) => isDueWorkItem(workItem, input.nowIso))
  );
}

export function selectBlockedWorkItems<T extends WorkItem>(input: {
  workItems: T[];
}) {
  return sortWorkItemsForQueue(
    input.workItems.filter(
      (workItem) =>
        isOpenWorkItem(workItem) &&
        (workItem.metadata.blocked === true ||
          typeof workItem.metadata.blockerReason === "string")
    )
  );
}

export function buildEstimateWorkQueue<T extends WorkItem>(input: {
  workItems: T[];
  currentPersonId?: string | null;
  nowIso: string;
  limit?: number;
}): EstimateWorkQueue<T> {
  const limit = input.limit ?? 5;
  const estimateWorkItems = input.workItems.filter(
    (workItem) => isOpenWorkItem(workItem) && isEstimateWorkItem(workItem)
  );
  const assigned = input.currentPersonId
    ? estimateWorkItems.filter(
        (workItem) => workItem.assignedPersonId === input.currentPersonId
      )
    : [];
  const waitingOnMe = assigned.filter((workItem) => {
    const type = getEstimateWorkItemType(workItem);

    return (
      type === "generate_estimate" ||
      type === "review_estimate" ||
      type === "approve_send" ||
      workItem.metadata.waitingOnCurrentOwner === true
    );
  });
  const readyForReview = estimateWorkItems.filter((workItem) => {
    const type = getEstimateWorkItemType(workItem);

    return (
      type === "review_estimate" ||
      type === "approve_send" ||
      workItem.metadata.estimateWorkStatus === "ready_for_review"
    );
  });
  const blocked = estimateWorkItems.filter(
    (workItem) => getWorkItemFieldState(workItem) === "blocked"
  );
  const followUpsDue = estimateWorkItems.filter(
    (workItem) =>
      getEstimateWorkItemType(workItem) === "follow_up_customer" &&
      isDueWorkItem(workItem, input.nowIso)
  );

  return {
    assigned: sortWorkItemsForQueue(assigned).slice(0, limit),
    waitingOnMe: sortWorkItemsForQueue(waitingOnMe).slice(0, limit),
    readyForReview: sortWorkItemsForQueue(readyForReview).slice(0, limit),
    blocked: sortWorkItemsForQueue(blocked).slice(0, limit),
    followUpsDue: sortWorkItemsForQueue(followUpsDue).slice(0, limit)
  };
}

function isSameDateKey(leftIso: string, rightIso: string) {
  return leftIso.slice(0, 10) === rightIso.slice(0, 10);
}

function sortCompletedWorkItems<
  T extends Pick<WorkItem, "completedAt" | "updatedAt" | "createdAt">
>(workItems: T[]) {
  return [...workItems].sort((left, right) =>
    (right.completedAt ?? right.updatedAt ?? right.createdAt).localeCompare(
      left.completedAt ?? left.updatedAt ?? left.createdAt
    )
  );
}

export function groupMobileAssignedWorkItems<T extends WorkItem>(input: {
  workItems: T[];
  nowIso: string;
  completedLimit?: number;
}): Record<MobileAssignedWorkItemGroupKey, T[]> {
  const groups: Record<MobileAssignedWorkItemGroupKey, T[]> = {
    blocked: [],
    overdue: [],
    today: [],
    upcoming: [],
    completed: []
  };

  for (const workItem of input.workItems) {
    if (workItem.status === "completed") {
      groups.completed.push(workItem);
      continue;
    }

    if (!isOpenWorkItem(workItem)) {
      continue;
    }

    if (getWorkItemFieldState(workItem) === "blocked") {
      groups.blocked.push(workItem);
      continue;
    }

    if (workItem.dueAt && workItem.dueAt < input.nowIso) {
      groups.overdue.push(workItem);
      continue;
    }

    if (workItem.dueAt && isSameDateKey(workItem.dueAt, input.nowIso)) {
      groups.today.push(workItem);
      continue;
    }

    groups.upcoming.push(workItem);
  }

  return {
    blocked: sortWorkItemsForQueue(groups.blocked),
    overdue: sortWorkItemsForQueue(groups.overdue),
    today: sortWorkItemsForQueue(groups.today),
    upcoming: sortWorkItemsForQueue(groups.upcoming),
    completed: sortCompletedWorkItems(groups.completed).slice(
      0,
      input.completedLimit ?? 10
    )
  };
}

export function selectDashboardWorkItemQueue<T extends WorkItem>(input: {
  assignedPersonId?: string | null;
  assignedItems: T[];
  companyItems: T[];
}) {
  if (input.assignedPersonId && input.assignedItems.length > 0) {
    return {
      items: input.assignedItems,
      mode: "assigned" as const
    };
  }

  return {
    items: input.companyItems,
    mode: "company_fallback" as const
  };
}
