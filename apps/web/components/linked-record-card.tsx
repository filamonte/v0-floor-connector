import type { ReactNode } from "react";
import Link from "next/link";

type LinkedRecordCardProps = {
  href: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  badge?: ReactNode;
};

export function LinkedRecordCard({
  href,
  title,
  subtitle,
  meta,
  badge
}: LinkedRecordCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-[var(--border-warm)] bg-white px-5 py-4 transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-[var(--text-primary)]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="sm:text-right">{badge}</div> : null}
      </div>
      {meta ? <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{meta}</p> : null}
    </Link>
  );
}
