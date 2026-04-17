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
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))] px-6 py-8 text-sm leading-6 text-slate-600">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
