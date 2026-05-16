import Link from "next/link";

type AppEmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AppEmptyState({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel
}: AppEmptyStateProps) {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-6 text-sm leading-6 text-[var(--text-secondary)] sm:px-6 sm:py-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {eyebrow}
      </p>
      <h3 className="mt-3 whitespace-normal break-words text-xl font-semibold tracking-tight text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl whitespace-normal break-words text-[var(--text-secondary)] [overflow-wrap:anywhere]">
        {description}
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
