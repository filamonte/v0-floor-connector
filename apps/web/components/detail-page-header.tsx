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
    <div className="space-y-5">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[#171717] sm:text-[2.4rem]">
              {title}
            </h2>
            <p className="max-w-[65ch] text-sm leading-6 text-[#4b5563] sm:text-[0.95rem]">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:max-w-[26rem] lg:items-end">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-md border border-[#d1d5db] bg-white px-3.5 py-2 text-sm font-medium text-[#4b5563] transition hover:border-[#9ca3af] hover:bg-[#f8fafc] hover:text-[#171717]"
          >
            {backLabel}
          </Link>
          {actions ? (
            <div className="flex flex-wrap items-start gap-2.5 lg:justify-end">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
