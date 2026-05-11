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
    <div className="rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-6 py-8 text-sm leading-6 text-[var(--text-secondary)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-[4px] bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--copper-light)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
