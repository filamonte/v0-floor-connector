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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2.4rem]">
              {title}
            </h2>
            <p className="max-w-[65ch] text-sm leading-6 text-[var(--text-secondary)] sm:text-[0.95rem]">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:max-w-[26rem] lg:items-end">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-md border border-[var(--border-warm)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
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
