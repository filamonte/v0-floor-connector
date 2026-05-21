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
        "group overflow-hidden rounded-lg border bg-white shadow-[0_18px_48px_-40px_rgba(34,26,20,0.28)]",
        neutral ? "border-slate-200" : "border-[var(--border-warm)]"
      ].join(" ")}
    >
      <div
        className={[
          "h-1",
          neutral ? "bg-[var(--graphite)]" : "bg-[var(--copper)]"
        ].join(" ")}
      />
      <div className="p-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
        {children ? <div className="mt-5">{children}</div> : null}
        <Link
          href={href}
          className={[
            "mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2",
            neutral
              ? "border border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
              : "border border-[var(--copper-light)] bg-[var(--copper)] text-white hover:border-[var(--copper)] hover:bg-[var(--copper-dark)]"
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
