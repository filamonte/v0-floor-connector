import type { CommunicationThread } from "@floorconnector/types";
import Link from "next/link";

import { DetailPanel } from "@/components/detail-panel";

type RelatedConversationSource =
  | "project"
  | "customer"
  | "contract"
  | "invoice"
  | "change_order"
  | "estimate";

type RelatedConversationThread = Pick<
  CommunicationThread,
  "id" | "lastMessageAt" | "lastMessagePreview" | "updatedAt"
>;

type RelatedConversationsCardProps = {
  source: RelatedConversationSource;
  description: string;
  countLabel: string;
  emptyMessage: string;
  actionClassName: string;
  threads: ReadonlyArray<RelatedConversationThread>;
};

function buildCommunicationsHref(input: {
  source: RelatedConversationSource;
  threadId?: string;
}) {
  const searchParams = new URLSearchParams({ source: input.source });

  if (input.threadId) {
    searchParams.set("threadId", input.threadId);
  }

  return `/communications?${searchParams.toString()}`;
}

export function RelatedConversationsCard({
  source,
  description,
  countLabel,
  emptyMessage,
  actionClassName,
  threads
}: RelatedConversationsCardProps) {
  const latestThread = threads.find((thread) => thread.lastMessageAt) ?? threads[0] ?? null;

  return (
    <DetailPanel title="Related Conversations" description={description}>
      <div className="space-y-3 text-sm leading-6 text-slate-600">
        <p>
          {countLabel}: {threads.length}
        </p>
        <p>
          Detail pages show conversation summaries only. Review message history, reply, and triage
          unread notifications from the shared communications workspace.
        </p>
        {latestThread ? (
          <>
            <p>
              Latest activity:{" "}
              <span className="font-medium text-slate-950">
                {new Date(latestThread.lastMessageAt ?? latestThread.updatedAt).toLocaleString()}
              </span>
            </p>
            <p>
              Latest thread summary:{" "}
              <span className="font-medium text-slate-950">
                {latestThread.lastMessagePreview ?? "No preview stored yet."}
              </span>
            </p>
            <div className="pt-1">
              <Link
                href={buildCommunicationsHref({
                  source,
                  threadId: latestThread.id
                })}
                className={actionClassName}
              >
                Open thread in communications
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>{emptyMessage}</p>
            <div className="pt-1">
              <Link href={buildCommunicationsHref({ source })} className={actionClassName}>
                Open communications queue
              </Link>
            </div>
          </>
        )}
      </div>
    </DetailPanel>
  );
}
