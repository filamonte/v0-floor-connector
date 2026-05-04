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
    <div className="rounded-lg border border-dashed border-[#d1d5db] bg-[#f8fafc] px-6 py-8 text-sm leading-6 text-[#4b5563]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#171717] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-[#4b5563]">{description}</p>
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
