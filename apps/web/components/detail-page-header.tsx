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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          {backLabel}
        </Link>
        {actions}
      </div>
    </div>
  );
}
