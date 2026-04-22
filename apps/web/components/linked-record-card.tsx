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
      className="block rounded-[1.5rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fcf7f0,#ffffff)] px-5 py-4 transition hover:border-[#d8b28a] hover:bg-white"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-[#2b2118]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[#665446]">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="sm:text-right">{badge}</div> : null}
      </div>
      {meta ? <p className="mt-3 text-sm leading-6 text-[#7a6656]">{meta}</p> : null}
    </Link>
  );
}
