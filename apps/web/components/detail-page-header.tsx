import type { ReactNode } from "react";
import Link from "next/link";

type DetailPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
};

export function DetailPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions
}: DetailPageHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Matches CF detail page header - clean, minimal, white background */}
      <div className="flex flex-col gap-4 border border-[#e2dcd5] bg-white px-4 py-4 lg:flex-row lg:items-start lg:justify-between sm:px-5">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-[#221a14] sm:text-[24px]">
            {title}
          </h2>
          <p className="mt-2 max-w-[65ch] text-[13px] leading-5 text-[#5f564d]">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end lg:flex-shrink-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 border border-[#e2dcd5] bg-white px-3 py-2 text-[13px] font-medium text-[#5f564d] transition hover:border-[#d0c4b8] hover:bg-[#faf8f6] hover:text-[#221a14]"
          >
            <span>&larr;</span>
            {backLabel}
          </Link>
          {actions ? (
            <div className="flex flex-wrap items-start gap-2 lg:justify-end">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
