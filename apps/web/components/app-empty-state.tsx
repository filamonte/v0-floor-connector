import Link from "next/link";
import { getEmptyStateCopy, type EmptyStateKind } from "@floorconnector/ui";

type AppEmptyStateProps = {
  kind?: EmptyStateKind;
  eyebrow?: string;
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AppEmptyState({
  kind,
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel
}: AppEmptyStateProps) {
  const copy = kind ? getEmptyStateCopy(kind) : null;
  const resolvedEyebrow = eyebrow ?? copy?.eyebrow ?? "No records";
  const resolvedTitle = title ?? copy?.title ?? "Nothing is recorded here yet";
  const resolvedDescription =
    description ??
    copy?.description ??
    "Create the canonical record first, then use the owning workspace for follow-through.";

  return (
    <div className="min-w-0 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-6 text-sm leading-6 text-[var(--text-secondary)] sm:px-6 sm:py-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {resolvedEyebrow}
      </p>
      <h3 className="mt-3 whitespace-normal break-words text-xl font-semibold tracking-tight text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-2xl">
        {resolvedTitle}
      </h3>
      <p className="mt-3 max-w-2xl whitespace-normal break-words text-[var(--text-secondary)] [overflow-wrap:anywhere]">
        {resolvedDescription}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex max-w-full items-center justify-center rounded-[4px] bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--copper-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 [overflow-wrap:anywhere]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
