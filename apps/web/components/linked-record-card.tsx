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
      className="block rounded-lg border border-[#e2e5e9] bg-white px-5 py-4 transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-[#171717]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[#4b5563]">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="sm:text-right">{badge}</div> : null}
      </div>
      {meta ? <p className="mt-3 text-sm leading-6 text-[#6b7280]">{meta}</p> : null}
    </Link>
  );
}
