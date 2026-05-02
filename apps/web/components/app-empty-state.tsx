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
    <div className="rounded-[8px] border border-dashed border-[#d9cdc2] bg-[#fbf7f2] px-6 py-8 text-sm leading-6 text-[#6f6256]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4581a]">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#221a14] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-[#6f6256]">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-[4px] bg-[#ef7d32] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#de6c22]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
