import Link from "next/link";

export type ProjectCommandCenterMapTone =
  | "positive"
  | "warning"
  | "critical"
  | "neutral";

export type ProjectCommandCenterMapItem = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
  tone: ProjectCommandCenterMapTone;
};

export type ProjectAiCopilotTone =
  | "ready"
  | "attention"
  | "blocked"
  | "neutral";

export type ProjectAiCopilotStatusItem = {
  label: string;
  value: string;
};

export type ProjectAiCopilotRecommendedAction = {
  id: string;
  title: string;
  detail: string;
  reason: string;
  href: string;
  label: string;
  priority: string;
};

export type ProjectAiCopilotDraftActionItem = {
  id: string;
  title: string;
  audience: string;
  subject: string;
  draftBody: string;
  operationalReason: string;
  reviewSafetyNote: string;
  reviewHref: string;
};

export type ProjectAiCopilotSummaryView = {
  stage: string;
  tone: ProjectAiCopilotTone;
  executiveSummary: string;
  reviewBoundary: string;
  statusItems: ProjectAiCopilotStatusItem[];
  recommendedNextActions: ProjectAiCopilotRecommendedAction[];
};

export type ProjectAiCopilotFieldSummaryView = {
  pmSummary: string;
  riskIndicators: string[];
};

export type ProjectCommandCenterMapSectionProps = {
  items: ProjectCommandCenterMapItem[];
};

export type ProjectAiOperationalCopilotSectionProps = {
  summary: ProjectAiCopilotSummaryView | null;
  fieldSummary: ProjectAiCopilotFieldSummaryView | null;
  draftActions: ProjectAiCopilotDraftActionItem[];
  providerEnhancementNote: string;
};

const projectWorkspacePanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]";

const projectWorkspacePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]";

function getCommandSummaryToneClassName(
  tone: ProjectCommandCenterMapTone = "neutral"
) {
  switch (tone) {
    case "positive":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

function getAiOperationalCopilotToneClassName(tone: ProjectAiCopilotTone) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

export function ProjectCommandCenterMapSection({
  items
}: ProjectCommandCenterMapSectionProps) {
  return (
    <section
      aria-labelledby="project-command-center-map-title"
      className={projectWorkspacePanelClassName}
    >
      <div
        className={[
          "flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between sm:px-5",
          projectWorkspacePanelHeaderClassName
        ].join(" ")}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
            Command center map
          </p>
          <h2
            id="project-command-center-map-title"
            className="mt-1 text-lg font-semibold text-[var(--text-primary)]"
          >
            Status, timeline, guidance, and action lanes
          </h2>
          <p className="mt-1 max-w-[74ch] text-sm leading-6 text-[var(--text-secondary)]">
            Use this map to scan the project without losing the source of truth:
            status comes from readiness, timeline comes from linked records,
            Copilot explains review-first next moves, and lanes open the
            canonical workspaces.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          No automatic actions
        </span>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <a
            key={item.eyebrow}
            href={item.href}
            className={[
              "flex min-h-[168px] flex-col px-4 py-4 text-sm leading-6 transition hover:bg-white",
              getCommandSummaryToneClassName(item.tone)
            ].join(" ")}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
              {item.eyebrow}
            </p>
            <p className="mt-2 font-semibold">{item.title}</p>
            <p className="mt-2 opacity-80">{item.description}</p>
            <span className="mt-auto pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--copper)]">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ProjectAiOperationalCopilotSection({
  summary,
  fieldSummary,
  draftActions,
  providerEnhancementNote
}: ProjectAiOperationalCopilotSectionProps) {
  if (!summary || !fieldSummary) {
    return (
      <section
        id="ai-operational-copilot"
        className={projectWorkspacePanelClassName}
      >
        <div
          className={`${projectWorkspacePanelHeaderClassName} px-4 py-4 sm:px-5`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
            AI Operational Copilot
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Copilot summaries are disabled
          </h3>
          <p className="mt-2 max-w-[74ch] text-sm leading-6 text-[var(--text-secondary)]">
            Organization workflow settings are keeping Copilot summaries quiet
            for this workspace. ProjectPulse, readiness gates, workflow cues,
            and connected records remain available from canonical project data.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="ai-operational-copilot"
      className={projectWorkspacePanelClassName}
    >
      <div
        className={`${projectWorkspacePanelHeaderClassName} px-4 py-4 sm:px-5`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              AI Operational Copilot
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Project guidance
            </h3>
            <p className="mt-2 max-w-[74ch] text-sm leading-6 text-[var(--text-secondary)]">
              Copilot explains what the timeline and readiness signals mean,
              then prepares review-first next moves. {summary.executiveSummary}
            </p>
          </div>
          <span
            className={[
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
              getAiOperationalCopilotToneClassName(summary.tone)
            ].join(" ")}
          >
            {summary.stage}
          </span>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
          {providerEnhancementNote}
        </p>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="bg-white px-4 py-4 sm:px-5">
          <div className="grid gap-3 md:grid-cols-2">
            {summary.statusItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {item.label}
                </p>
                <p className="mt-1 text-sm leading-5 text-[var(--text-primary)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Recommended next actions
            </p>
            <div className="mt-3 space-y-3">
              {summary.recommendedNextActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-slate-950">
                      {action.title}
                    </p>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      {action.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{action.detail}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Why: {action.reason}
                  </p>
                  <Link
                    href={action.href}
                    className="mt-3 inline-flex h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white"
                  >
                    {action.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-px bg-[var(--border-warm)]">
          <div className="bg-white px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Review-first draft composer
            </p>
            {draftActions.length > 0 ? (
              <div className="mt-3 space-y-3">
                {draftActions.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-slate-950">
                        {action.title}
                      </p>
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {action.audience}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {action.subject}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-primary)]">
                      {action.draftBody}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Why: {action.operationalReason}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {action.reviewSafetyNote}
                    </p>
                    <Link
                      href={action.reviewHref}
                      className="mt-3 inline-flex h-8 items-center rounded-full border border-[#e4d7ca] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32] transition hover:bg-[#fbf5ee]"
                    >
                      Review draft
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Draft actions are disabled
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  Summaries can stay visible while organization settings keep
                  Copilot draft text out of the workspace.
                </p>
              </div>
            )}
          </div>
          <div className="bg-white px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Field summary
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
              {fieldSummary.pmSummary}
            </p>
            {fieldSummary.riskIndicators.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                {fieldSummary.riskIndicators.map((risk) => (
                  <li key={risk}>- {risk}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600 sm:px-5">
            {summary.reviewBoundary}
          </div>
        </div>
      </div>
    </section>
  );
}
