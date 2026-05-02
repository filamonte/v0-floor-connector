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
    <section className="border border-[#d9cdc2] bg-white p-5 shadow-[0_18px_48px_-44px_rgba(57,43,30,0.2)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#2b2118]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#665446]">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      <Link
        href={href}
        className="mt-6 inline-flex border border-[#e2d4c5] bg-[#fbf5ee] px-4 py-2 text-sm font-medium text-[#5f4d40] transition hover:border-[#a4581a] hover:bg-white hover:text-[#2b2118]"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
