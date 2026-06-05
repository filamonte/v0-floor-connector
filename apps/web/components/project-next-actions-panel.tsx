import Link from "next/link";

import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import type {
  ProjectNextActionItem,
  ProjectNextActionSeverity,
  ProjectNextActionsSummary
} from "@/lib/projects/project-next-actions";

type ProjectNextActionsPanelProps = {
  summary: ProjectNextActionsSummary;
};

const severityClassNames: Record<ProjectNextActionSeverity, string> = {
  blocked: "border-rose-200 bg-rose-50 text-rose-950",
  attention: "border-amber-200 bg-amber-50 text-amber-950",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-950",
  monitoring:
    "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]"
};

const panelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]";

const panelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]";

export function ProjectNextActionsPanel({
  summary
}: ProjectNextActionsPanelProps) {
  const [headline, ...supportingActions] = summary.actions;

  return (
    <section
      id="project-next-actions"
      aria-labelledby="project-next-actions-title"
      className={panelClassName}
    >
      <div className={`${panelHeaderClassName} px-4 py-4 sm:px-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              Project next actions
            </p>
            <h2
              id="project-next-actions-title"
              className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]"
            >
              {headline.headline}
            </h2>
            <p className="mt-2 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
              {headline.reason}
            </p>
            <p className="mt-3 inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Act in {headline.owningWorkspace}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <SeverityBadge severity={headline.severity}>
              {headline.currentStage}
            </SeverityBadge>
            <Link
              href={headline.primaryHref}
              className={primaryActionClassName}
            >
              {headline.primaryActionLabel}
            </Link>
            {headline.secondaryHref && headline.secondaryActionLabel ? (
              <Link
                href={headline.secondaryHref}
                className={secondaryActionClassName}
              >
                {headline.secondaryActionLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="bg-white px-4 py-4 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Source records
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Project diagnoses the current handoff; the source records below are
            the canonical records that explain the action.
          </p>
          {headline.linkedRecords.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {headline.linkedRecords.map((record) => (
                <Link
                  key={record.id}
                  href={record.href}
                  className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-5 transition hover:border-[var(--copper)] hover:bg-white"
                >
                  <p className="font-semibold text-[var(--text-primary)]">
                    {record.label}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {record.status.replaceAll("_", " ")}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6 text-[var(--text-secondary)]">
              No linked source record is currently driving this action.
            </p>
          )}
        </article>

        <article className="bg-white px-4 py-4 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Supporting actions
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            These are secondary handoffs to the workspace that owns the next
            move, not dashboard queues or project-local workflow copies.
          </p>
          {supportingActions.length > 0 ? (
            <div className="mt-3 space-y-3">
              {supportingActions.map((action) => (
                <ProjectNextActionRow key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6 text-[var(--text-secondary)]">
              The primary next action is the only project-owned action derived
              from current linked records.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}

function ProjectNextActionRow({ action }: { action: ProjectNextActionItem }) {
  return (
    <div className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3 text-sm leading-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)]">
            {action.headline}
          </p>
          <p className="mt-1 text-[var(--text-secondary)]">{action.reason}</p>
        </div>
        <SeverityBadge severity={action.severity}>
          {action.currentStage}
        </SeverityBadge>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
        Act in {action.owningWorkspace}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={action.primaryHref} className={secondaryActionClassName}>
          {action.primaryActionLabel}
        </Link>
        {action.secondaryHref && action.secondaryActionLabel ? (
          <Link
            href={action.secondaryHref}
            className={secondaryActionClassName}
          >
            {action.secondaryActionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
  children
}: {
  severity: ProjectNextActionSeverity;
  children: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        severityClassNames[severity]
      ].join(" ")}
    >
      {children}
    </span>
  );
}
