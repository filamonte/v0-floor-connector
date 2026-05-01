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
    <div className="border border-dashed border-[#e2dcd5] bg-[#faf8f6] px-6 py-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#ef7d32]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-[16px] font-semibold text-[#221a14]">
        {title}
      </h3>
      <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#5f564d]">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex bg-[#ef7d32] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d86b28]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
