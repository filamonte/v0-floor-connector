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
      className="block min-w-0 rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] sm:px-5"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="min-w-0">
          <h3 className="whitespace-normal break-words text-base font-medium text-[var(--text-primary)] [overflow-wrap:anywhere]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="min-w-0">{badge}</div> : null}
      </div>
      {meta ? (
        <p className="mt-3 whitespace-normal break-words text-sm leading-6 text-[var(--text-secondary)] [overflow-wrap:anywhere]">
          {meta}
        </p>
      ) : null}
    </Link>
  );
}
