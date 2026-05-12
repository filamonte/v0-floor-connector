import type { RecordRevisionListItem } from "@/lib/revisions/types";

type RevisionTimelineProps = {
  revisions: RecordRevisionListItem[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function RevisionTimeline({ revisions }: RevisionTimelineProps) {
  return (
    <section className="rounded-md border border-[var(--border-warm)] bg-white">
      <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          History
        </p>
        <h2 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
          Revision history
        </h2>
        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
          Snapshots preserve what changed over time without creating duplicate records. Compare and restore are reserved for a later workflow.
        </p>
      </div>

      {revisions.length === 0 ? (
        <div className="px-4 py-5 text-sm text-[var(--text-secondary)]">
          No revision snapshots have been captured yet. The first snapshot is created when this record is created, edited, sent, or loaded after the revision system is available.
        </div>
      ) : (
        <ol className="divide-y divide-[var(--border-warm)]">
          {revisions.map((revision) => (
            <li key={revision.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Revision {revision.revisionNumber}
                    </h3>
                    {revision.isCurrent ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                        Current
                      </span>
                    ) : null}
                    <span className="rounded-full bg-[var(--highlight)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      {revision.displayKind}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {formatDateTime(revision.createdAt)}
                    {revision.createdByUserId ? ` by ${revision.createdByUserId}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 text-xs text-[var(--text-tertiary)]">
                  <span className="rounded-[3px] border border-[var(--border-warm)] px-2 py-1">
                    Compare later
                  </span>
                  <span className="rounded-[3px] border border-[var(--border-warm)] px-2 py-1">
                    Restore later
                  </span>
                </div>
              </div>

              {revision.revisionReason ? (
                <p className="mt-3 text-sm text-[var(--text-primary)]">{revision.revisionReason}</p>
              ) : null}

              {revision.displaySummary.length > 0 ? (
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {revision.displaySummary.map((item) => (
                    <div
                      key={`${revision.id}-${item.label}`}
                      className="rounded-[4px] border border-[var(--border-warm)] bg-[var(--surface)] px-3 py-2"
                    >
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
