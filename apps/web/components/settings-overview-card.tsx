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
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/92 p-6 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.32)]">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      <Link
        href={href}
        className="mt-6 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
