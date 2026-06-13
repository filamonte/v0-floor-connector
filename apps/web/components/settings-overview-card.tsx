import Link from "next/link";
import type { ReactNode } from "react";

import {
  industrialPanelClassName,
  industrialPrimaryActionClassName,
  industrialSecondaryActionClassName
} from "@/components/industrial-os-primitives";

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
      className={["group overflow-hidden", industrialPanelClassName].join(" ")}
    >
      <div
        className={["h-[3px]", neutral ? "bg-[#27272a]" : "bg-[#005eb8]"].join(
          " "
        )}
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
            "mt-6 text-sm",
            neutral
              ? industrialSecondaryActionClassName
              : industrialPrimaryActionClassName
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
