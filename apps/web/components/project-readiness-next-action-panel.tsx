import Link from "next/link";
import { ActionBar } from "@floorconnector/ui";

import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";

export type ProjectReadinessNextAction = {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  blockerCopy?: string;
};

export type ProjectReadinessBlockerItem = {
  id: string;
  title: string;
  detail: string;
  href?: string;
  actionLabel?: string;
  tone: "blocked" | "warning" | "ready";
};

type ProjectReadinessNextActionPanelProps = {
  showNextBestActionGuidance: boolean;
  nextAction: ProjectReadinessNextAction;
  readinessLabel: string;
  readinessDetail: string;
  isReadyToSchedule: boolean;
  readyToScheduleAt: string | null;
  blockers: ProjectReadinessBlockerItem[];
  hasActiveBlockers: boolean;
  meta: string;
};

const projectWorkspacePanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]";

const projectWorkspacePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]";

export function ProjectReadinessNextActionPanel({
  showNextBestActionGuidance,
  nextAction,
  readinessLabel,
  readinessDetail,
  isReadyToSchedule,
  readyToScheduleAt,
  blockers,
  hasActiveBlockers,
  meta
}: ProjectReadinessNextActionPanelProps) {
  return (
    <>
      {showNextBestActionGuidance ? (
        <ActionBar
          title={nextAction.title}
          description={
            <div className="space-y-2">
              <p>{nextAction.description}</p>
              {nextAction.blockerCopy ? (
                <p className="font-medium text-amber-900">
                  {nextAction.blockerCopy}
                </p>
              ) : null}
            </div>
          }
          statusLabel={readinessLabel}
          statusTone={
            isReadyToSchedule
              ? "success"
              : hasActiveBlockers
                ? "warning"
                : "neutral"
          }
          nextActionLabel="Next step"
          primaryAction={
            nextAction.primaryLabel && nextAction.primaryHref ? (
              <Link
                href={nextAction.primaryHref}
                className={getWorkspaceActionLinkClassName("primary")}
              >
                {nextAction.primaryLabel}
              </Link>
            ) : undefined
          }
          secondaryActions={
            nextAction.secondaryLabel && nextAction.secondaryHref ? (
              <Link
                href={nextAction.secondaryHref}
                className={getWorkspaceActionLinkClassName("secondary")}
              >
                {nextAction.secondaryLabel}
              </Link>
            ) : nextAction.secondaryLabel ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                {nextAction.secondaryLabel}
              </span>
            ) : undefined
          }
          meta={meta}
        />
      ) : null}

      <ProjectReadinessBlockersPanel
        readinessLabel={readinessLabel}
        readinessDetail={readinessDetail}
        readyToScheduleAt={readyToScheduleAt}
        blockers={blockers}
      />
    </>
  );
}

function ProjectReadinessBlockersPanel({
  readinessLabel,
  readinessDetail,
  readyToScheduleAt,
  blockers
}: {
  readinessLabel: string;
  readinessDetail: string;
  readyToScheduleAt: string | null;
  blockers: ProjectReadinessBlockerItem[];
}) {
  const hasBlockers = blockers.length > 0;

  return (
    <section
      id="project-readiness-blockers"
      aria-labelledby="project-readiness-blockers-title"
      className={projectWorkspacePanelClassName}
    >
      <div
        className={[
          "flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between sm:px-5",
          projectWorkspacePanelHeaderClassName
        ].join(" ")}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Readiness + blockers
          </p>
          <h2
            id="project-readiness-blockers-title"
            className="mt-1 text-lg font-semibold text-[var(--text-primary)]"
          >
            {readinessLabel}
          </h2>
          <p className="mt-1 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
            {readinessDetail}
          </p>
        </div>
        <span
          className={[
            "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
            hasBlockers
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          ].join(" ")}
        >
          {hasBlockers
            ? `${blockers.length} ${blockers.length === 1 ? "blocker" : "blockers"}`
            : readyToScheduleAt
              ? `Ready ${formatDateTime(readyToScheduleAt)}`
              : "Clear"}
        </span>
      </div>

      {hasBlockers ? (
        <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-2">
          {blockers.map((blocker) => (
            <article
              key={blocker.id}
              className={[
                "flex min-h-[156px] flex-col px-4 py-4 text-sm leading-6",
                blocker.tone === "blocked"
                  ? "bg-rose-50 text-rose-950"
                  : "bg-amber-50 text-amber-950"
              ].join(" ")}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                {blocker.tone === "blocked" ? "Blocked" : "Needs review"}
              </p>
              <h3 className="mt-2 text-sm font-semibold">{blocker.title}</h3>
              <p className="mt-2 opacity-85">{blocker.detail}</p>
              <div className="mt-auto pt-4">
                {blocker.href && blocker.actionLabel ? (
                  <Link
                    href={blocker.href}
                    className={getWorkspaceActionLinkClassName("secondary")}
                  >
                    {blocker.actionLabel}
                  </Link>
                ) : (
                  <span className="inline-flex h-9 items-center justify-center rounded-[4px] border border-current/20 bg-white/70 px-3 text-sm font-medium">
                    Resolve in project
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-t border-[var(--border-warm)] bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-950 sm:px-5">
          Commercial, scheduling, billing, and closeout blockers are currently
          clear in the Project Workspace. Scheduling still happens through the
          canonical job and schedule chain.
        </div>
      )}
    </section>
  );
}

function getWorkspaceActionLinkClassName(tone: "primary" | "secondary") {
  switch (tone) {
    case "primary":
      return primaryActionClassName;
    default:
      return secondaryActionClassName;
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
