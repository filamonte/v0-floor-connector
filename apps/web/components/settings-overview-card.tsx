import Link from "next/link";
import type { ReactNode } from "react";

type SettingsOverviewCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  children?: ReactNode;
};

export function SettingsOverviewCard({
  title,
  description,
  href,
  ctaLabel,
  children
}: SettingsOverviewCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-[#e3d6c7] bg-white/94 p-6 shadow-[0_20px_60px_-44px_rgba(57,43,30,0.24)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#2b2118]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#665446]">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      <Link
        href={href}
        className="mt-6 inline-flex rounded-full border border-[#e2d4c5] bg-[#fbf5ee] px-4 py-2 text-sm font-medium text-[#5f4d40] transition hover:border-[#a4581a] hover:bg-white hover:text-[#2b2118]"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
