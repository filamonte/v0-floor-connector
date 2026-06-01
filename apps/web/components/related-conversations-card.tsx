import type { CommunicationThread } from "@floorconnector/types";
import Link from "next/link";

import { DetailPanel } from "@/components/detail-panel";
import {
  deriveRecordCommunicationContinuitySummary,
  filterRecordCommunicationContinuityThreads,
  type RecordCommunicationContinuitySource
} from "@/lib/communications/record-continuity";

type RelatedConversationThread = Pick<
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

type RelatedConversationsCardProps = {
  source: RecordCommunicationContinuitySource;
  organizationId?: string | null;
  subjectId?: string | null;
  projectId?: string | null;
  description: string;
  countLabel: string;
  emptyMessage: string;
  actionClassName: string;
  threads: ReadonlyArray<RelatedConversationThread>;
};

export function RelatedConversationsCard({
  source,
  organizationId,
  subjectId,
  projectId,
  description,
  countLabel,
  emptyMessage,
  actionClassName,
  threads
}: RelatedConversationsCardProps) {
  const scopedThreads = filterRecordCommunicationContinuityThreads({
    target: {
      organizationId,
      source,
      subjectId,
      projectId
    },
    threads
  });
  const summary = deriveRecordCommunicationContinuitySummary({
    source,
    threads: scopedThreads
  });

  return (
    <DetailPanel title="Communication Continuity" description={description}>
      <div className="space-y-3 text-sm leading-6 text-slate-600">
        <p>
          {countLabel}: {summary.threadCount}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Customer-visible
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {summary.customerVisibleCount}
            </p>
          </div>
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Internal only
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {summary.internalCount}
            </p>
          </div>
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Open
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {summary.openCount}
            </p>
          </div>
        </div>
        <p>
          This record shows communication continuity only. Review full message
          history, reply state, delivery context, and unread notification triage
          from the shared communications workspace.
        </p>
        {summary.latestThread ? (
          <>
            <p>
              Latest activity:{" "}
              <span className="font-medium text-slate-950">
                {summary.latestActivityAt
                  ? new Date(summary.latestActivityAt).toLocaleString()
                  : "No activity timestamp stored yet."}
              </span>
            </p>
            <p>
              Latest thread summary:{" "}
              <span className="font-medium text-slate-950">
                {summary.latestPreview}
              </span>
            </p>
            <div className="space-y-2">
              {summary.recentItems.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-[6px] border border-slate-200 bg-slate-50/80 px-3 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <span>{item.sourceLabel}</span>
                    <span aria-hidden="true">/</span>
                    <span>{item.statusLabel}</span>
                    <span aria-hidden="true">/</span>
                    <span>{item.boundaryLabel}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-800">
                    {item.snippet}
                  </p>
                </Link>
              ))}
            </div>
            <div className="pt-1">
              <Link
                href={summary.communicationsHref}
                className={actionClassName}
              >
                View communication activity
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>{emptyMessage}</p>
            <div className="pt-1">
              <Link
                href={summary.communicationsHref}
                className={actionClassName}
              >
                View communication activity
              </Link>
            </div>
          </>
        )}
      </div>
    </DetailPanel>
  );
}
