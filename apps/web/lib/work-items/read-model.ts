import type { WorkItem, WorkItemPriority } from "@floorconnector/types";

export type WorkItemQueueFilter = "open" | "assigned" | "due" | "all";

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
  return workItem.status === "open" && Boolean(workItem.dueAt && workItem.dueAt <= nowIso);
}

export function sortWorkItemsForQueue<T extends Pick<WorkItem, "dueAt" | "priority" | "createdAt" | "title">>(
  workItems: T[]
) {
  return [...workItems].sort((left, right) => {
    const dueComparison = dueSortValue(left.dueAt).localeCompare(
      dueSortValue(right.dueAt)
    );

    if (dueComparison !== 0) {
      return dueComparison;
    }

    const priorityComparison = priorityRank[left.priority] - priorityRank[right.priority];

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
    ? openItems.filter((item) => item.assignedPersonId === input.assignedPersonId)
    : openItems;

  return sortWorkItemsForQueue(scopedItems).slice(0, input.limit);
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
