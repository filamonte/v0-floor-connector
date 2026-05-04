import Link from "next/link";
import type { ReactNode } from "react";

type SettingsOverviewCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  tone?: "warm" | "neutral";
  children?: ReactNode;
};

export function SettingsOverviewCard({
  title,
  description,
  href,
  ctaLabel,
  tone = "warm",
  children
}: SettingsOverviewCardProps) {
  const neutral = tone === "neutral";

  return (
    <section
      className={[
        "border bg-white p-5",
        neutral
          ? "rounded-lg border-[#e2e5e9] shadow-[0_14px_34px_-32px_rgba(15,23,42,0.24)]"
          : "border-[#d9cdc2] shadow-[0_18px_48px_-44px_rgba(57,43,30,0.2)]"
      ].join(" ")}
    >
      <h2
        className={[
          "text-xl font-semibold tracking-tight",
          neutral ? "text-[#111827]" : "text-[#2b2118]"
        ].join(" ")}
      >
        {title}
      </h2>
      <p
        className={[
          "mt-3 text-sm leading-6",
          neutral ? "text-[#4b5563]" : "text-[#665446]"
        ].join(" ")}
      >
        {description}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
      <Link
        href={href}
        className={[
          "mt-6 inline-flex px-4 py-2 text-sm font-medium transition",
          neutral
            ? "rounded-md border border-[#d1d5db] bg-white text-[#374151] hover:border-[#9ca3af] hover:bg-[#f8fafc] hover:text-[#111827]"
            : "border border-[#e2d4c5] bg-[#fbf5ee] text-[#5f4d40] hover:border-[#a4581a] hover:bg-white hover:text-[#2b2118]"
        ].join(" ")}
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
