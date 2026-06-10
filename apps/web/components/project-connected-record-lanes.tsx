import Link from "next/link";
import { RecordWorkspaceSection, StatusBadge } from "@floorconnector/ui";

import { secondaryActionClassName } from "@/components/action-hierarchy";

export type ProjectConnectedRecordLane = {
  title: string;
  status: string;
  keyFact: string;
  href?: string;
  actionLabel?: string;
  note?: string;
  blocker?: string;
};

type ProjectConnectedRecordLanesProps = {
  lanes: ProjectConnectedRecordLane[];
};

export function ProjectConnectedRecordLanes({
  lanes
}: ProjectConnectedRecordLanesProps) {
  return (
    <RecordWorkspaceSection
      id="connected-record-lanes"
      eyebrow="Connected records"
      title="Connected record lanes"
      description="Each lane shows where this project sits in the lifecycle and sends full editing back to the focused canonical workspace."
      meta={
        <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          {lanes.length} lanes
        </span>
      }
    >
      <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-2 xl:grid-cols-3">
        {lanes.map((lane) => (
          <article
            key={lane.title}
            className="flex min-h-[176px] flex-col bg-white px-4 py-3 text-sm leading-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {lane.title}
                </h3>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {lane.keyFact}
                </p>
              </div>
              {renderStatusBadge(lane.status)}
            </div>
            {lane.blocker ? (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-950">
                {lane.blocker}
              </p>
            ) : null}
            {lane.note ? (
              <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                {lane.note}
              </p>
            ) : null}
            <div className="mt-auto pt-4">
              {lane.href && lane.actionLabel ? (
                <Link href={lane.href} className={secondaryActionClassName}>
                  {lane.actionLabel}
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 text-sm font-medium text-[var(--text-secondary)]">
                  No action yet
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </RecordWorkspaceSection>
  );
}

function renderStatusBadge(label: string) {
  return <StatusBadge status={label}>{label}</StatusBadge>;
}
