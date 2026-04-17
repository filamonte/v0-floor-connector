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
      className="block rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] px-5 py-4 transition hover:border-brand-200 hover:bg-white"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-slate-950">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="sm:text-right">{badge}</div> : null}
      </div>
      {meta ? <p className="mt-3 text-sm leading-6 text-slate-500">{meta}</p> : null}
    </Link>
  );
}
