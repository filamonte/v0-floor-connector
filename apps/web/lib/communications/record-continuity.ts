import type { CommunicationThread } from "@floorconnector/types";

export type RecordCommunicationContinuitySource =
  CommunicationThread["subjectType"];

export type RecordCommunicationContinuityThread = Pick<
  CommunicationThread,
  | "id"
  | "projectId"
  | "subjectType"
  | "lastMessageAt"
  | "lastMessagePreview"
  | "lastMessageVisibility"
  | "threadStatus"
  | "updatedAt"
>;

export type RecordCommunicationContinuitySummary = {
  threadCount: number;
  customerVisibleCount: number;
  internalCount: number;
  openCount: number;
  latestThread: RecordCommunicationContinuityThread | null;
  latestActivityAt: string | null;
  latestPreview: string;
  communicationsHref: string;
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

export function deriveRecordCommunicationContinuitySummary(input: {
  source: RecordCommunicationContinuitySource;
  threads: ReadonlyArray<RecordCommunicationContinuityThread>;
}): RecordCommunicationContinuitySummary {
  const latestThread =
    input.threads.find((thread) => thread.lastMessageAt) ??
    input.threads[0] ??
    null;

  return {
    threadCount: input.threads.length,
    customerVisibleCount: input.threads.filter(
      (thread) => thread.lastMessageVisibility === "customer_visible"
    ).length,
    internalCount: input.threads.filter(
      (thread) => thread.lastMessageVisibility === "internal"
    ).length,
    openCount: input.threads.filter((thread) => thread.threadStatus === "open")
      .length,
    latestThread,
    latestActivityAt: latestThread
      ? (latestThread.lastMessageAt ?? latestThread.updatedAt)
      : null,
    latestPreview: latestThread?.lastMessagePreview ?? "No preview stored yet.",
    communicationsHref: latestThread
      ? buildRecordCommunicationHref({
          source: latestThread.subjectType,
          threadId: latestThread.id
        })
      : buildRecordCommunicationHref({ source: input.source })
  };
}
