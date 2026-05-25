import type { DocumentReadinessSummary } from "@/lib/document-readiness/readiness";

type DocumentReadinessCardProps = {
  readiness: DocumentReadinessSummary;
};

const toneClassNames: Record<DocumentReadinessSummary["statusTone"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-950",
  attention: "border-amber-200 bg-amber-50 text-amber-950",
  blocked: "border-rose-200 bg-rose-50 text-rose-950",
  complete: "border-sky-200 bg-sky-50 text-sky-950",
  neutral:
    "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-primary)]"
};

export function DocumentReadinessCard({
  readiness
}: DocumentReadinessCardProps) {
  return (
    <div className="rounded-[8px] border border-[var(--border-warm)] bg-white px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Document readiness
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
            {readiness.safeDeliveryReadinessLabel}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {readiness.recommendedNextAction}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClassNames[readiness.statusTone]}`}
        >
          {readiness.stateLabel}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-[6px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Template
          </dt>
          <dd className="mt-1 font-medium text-[var(--text-primary)]">
            {readiness.templateAvailabilityLabel}
          </dd>
        </div>
        <div className="rounded-[6px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Context
          </dt>
          <dd className="mt-1 font-medium text-[var(--text-primary)]">
            {readiness.requiredContextLabel}
          </dd>
        </div>
        <div className="rounded-[6px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Preview
          </dt>
          <dd className="mt-1 font-medium text-[var(--text-primary)]">
            {readiness.safePreviewLabel}
          </dd>
        </div>
      </dl>

      {readiness.missingFields.length > 0 ? (
        <div className="mt-4 rounded-[6px] border border-[var(--border-warm)] bg-white px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Readiness notes
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--text-secondary)]">
            {readiness.missingFields.map((issue) => (
              <li key={issue.key}>
                <span className="font-medium text-[var(--text-primary)]">
                  {issue.severity === "blocker" ? "Needs fix" : "Note"}:
                </span>{" "}
                {issue.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
