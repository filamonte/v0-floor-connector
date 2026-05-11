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
          ? "rounded-lg border-[var(--border-warm)] shadow-[0_14px_34px_-32px_rgba(15,23,42,0.24)]"
          : "border-[var(--border-warm)] shadow-[0_18px_48px_-44px_rgba(57,43,30,0.2)]"
      ].join(" ")}
    >
      <h2
        className={[
          "text-xl font-semibold tracking-tight",
          neutral ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
        ].join(" ")}
      >
        {title}
      </h2>
      <p
        className={[
          "mt-3 text-sm leading-6",
          neutral ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
        ].join(" ")}
      >
        {description}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
      <Link
        href={href}
        className={[
          "mt-6 inline-flex px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2",
          neutral
            ? "rounded-md border border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
            : "border border-[var(--border-warm)] bg-[var(--cream)] text-[var(--text-secondary)] hover:border-[var(--copper)] hover:bg-white hover:text-[var(--text-primary)]"
        ].join(" ")}
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
