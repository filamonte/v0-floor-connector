import type { CommunicationThread } from "@floorconnector/types";

export type RecordCommunicationContinuitySource =
  CommunicationThread["subjectType"];

export type RecordCommunicationContinuityThread = Pick<
  CommunicationThread,
  | "id"
  | "organizationId"
  | "projectId"
  | "subjectType"
  | "subjectId"
  | "lastMessageAt"
  | "lastMessagePreview"
  | "lastMessageVisibility"
  | "threadStatus"
  | "updatedAt"
>;

export type RecordCommunicationContinuityTarget = {
  organizationId?: string | null;
  source: RecordCommunicationContinuitySource;
  subjectId?: string | null;
  projectId?: string | null;
};

export type RecordCommunicationContinuityItem = {
  id: string;
  source: RecordCommunicationContinuitySource;
  sourceLabel: string;
  statusLabel: string;
  boundaryLabel: string;
  snippet: string;
  activityAt: string | null;
  href: string;
};

export type RecordCommunicationContinuitySummary = {
  threadCount: number;
  customerVisibleCount: number;
  internalCount: number;
  openCount: number;
  latestThread: RecordCommunicationContinuityThread | null;
  latestActivityAt: string | null;
  latestPreview: string;
  communicationsHref: string;
  recentItems: RecordCommunicationContinuityItem[];
};

export function buildRecordCommunicationHref(input: {
  source: RecordCommunicationContinuitySource;
  threadId?: string;
}) {
  const searchParams = new URLSearchParams({ source: input.source });

  if (input.threadId) {
    searchParams.set("threadId", input.threadId);
  }

  return `/communications?${searchParams.toString()}`;
}

export function filterProjectCommunicationContinuityThreads(input: {
  projectId: string;
  threads: ReadonlyArray<RecordCommunicationContinuityThread>;
}) {
  return input.threads.filter((thread) => thread.projectId === input.projectId);
}

function formatSourceLabel(source: RecordCommunicationContinuitySource) {
  switch (source) {
    case "change_order":
      return "Change order";
    default:
      return source.replaceAll("_", " ");
  }
}

function formatThreadStatusLabel(
  status: RecordCommunicationContinuityThread["threadStatus"]
) {
  switch (status) {
    case "waiting_on_contractor":
      return "Needs response";
    case "waiting_on_customer":
      return "Waiting on customer";
    default:
      return status.replaceAll("_", " ");
  }
}

function formatBoundaryLabel(
  visibility: RecordCommunicationContinuityThread["lastMessageVisibility"]
) {
  return visibility === "internal" ? "Internal only" : "Customer-visible";
}

function getThreadActivityAt(thread: RecordCommunicationContinuityThread) {
  return thread.lastMessageAt ?? thread.updatedAt ?? null;
}

function sortByThreadActivity(
  left: RecordCommunicationContinuityThread,
  right: RecordCommunicationContinuityThread
) {
  return (getThreadActivityAt(right) ?? "").localeCompare(
    getThreadActivityAt(left) ?? ""
  );
}

export function filterRecordCommunicationContinuityThreads(input: {
  target: RecordCommunicationContinuityTarget;
  threads: ReadonlyArray<RecordCommunicationContinuityThread>;
}) {
  return input.threads.filter((thread) => {
    if (
      input.target.organizationId &&
      thread.organizationId !== input.target.organizationId
    ) {
      return false;
    }

    if (
      input.target.subjectId &&
      (thread.subjectType !== input.target.source ||
        thread.subjectId !== input.target.subjectId)
    ) {
      return false;
    }

    if (input.target.projectId && thread.projectId !== input.target.projectId) {
      return false;
    }

    return true;
  });
}

export function buildRecordCommunicationContinuityItems(
  threads: ReadonlyArray<RecordCommunicationContinuityThread>
): RecordCommunicationContinuityItem[] {
  return [...threads].sort(sortByThreadActivity).map((thread) => ({
    id: thread.id,
    source: thread.subjectType,
    sourceLabel: formatSourceLabel(thread.subjectType),
    statusLabel: formatThreadStatusLabel(thread.threadStatus),
    boundaryLabel: formatBoundaryLabel(thread.lastMessageVisibility),
    snippet: thread.lastMessagePreview ?? "No preview stored yet.",
    activityAt: getThreadActivityAt(thread),
    href: buildRecordCommunicationHref({
      source: thread.subjectType,
      threadId: thread.id
    })
  }));
}

export function deriveRecordCommunicationContinuitySummary(input: {
  source: RecordCommunicationContinuitySource;
  threads: ReadonlyArray<RecordCommunicationContinuityThread>;
}): RecordCommunicationContinuitySummary {
  const sortedThreads = [...input.threads].sort(sortByThreadActivity);
  const latestThread = sortedThreads[0] ?? null;
  const recentItems = buildRecordCommunicationContinuityItems(sortedThreads);

  return {
    threadCount: sortedThreads.length,
    customerVisibleCount: sortedThreads.filter(
      (thread) => thread.lastMessageVisibility === "customer_visible"
    ).length,
    internalCount: sortedThreads.filter(
      (thread) => thread.lastMessageVisibility === "internal"
    ).length,
    openCount: sortedThreads.filter((thread) => thread.threadStatus === "open")
      .length,
    latestThread,
    latestActivityAt: latestThread ? getThreadActivityAt(latestThread) : null,
    latestPreview: latestThread?.lastMessagePreview ?? "No preview stored yet.",
    communicationsHref: latestThread
      ? buildRecordCommunicationHref({
          source: latestThread.subjectType,
          threadId: latestThread.id
        })
      : buildRecordCommunicationHref({ source: input.source }),
    recentItems
  };
}
