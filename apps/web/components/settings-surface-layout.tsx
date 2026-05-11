import type { ReactNode } from "react";

import type { SettingsNavItem } from "@/lib/settings/navigation";
import { SettingsNav } from "@/components/settings-nav";

type SettingsSurfaceLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  navItems: readonly SettingsNavItem[];
  meta?: ReactNode;
  tone?: "warm" | "neutral";
  children: ReactNode;
};

export function SettingsSurfaceLayout({
  eyebrow,
  title,
  description,
  navItems,
  meta,
  tone = "warm",
  children
}: SettingsSurfaceLayoutProps) {
  const neutral = tone === "neutral";

  return (
    <div className="space-y-6">
      <section
        className={[
          "border bg-white p-6 sm:p-8",
          neutral
            ? "rounded-lg border-[var(--border-warm)] shadow-[0_18px_44px_-38px_rgba(15,23,42,0.28)]"
            : "border-[var(--border-warm)] shadow-[0_24px_80px_-46px_rgba(57,43,30,0.26)]"
        ].join(" ")}
      >
        <p
          className={[
            "text-[11px] font-semibold uppercase tracking-[0.24em]",
            neutral ? "text-[var(--text-tertiary)]" : "text-[var(--copper)]"
          ].join(" ")}
        >
          {eyebrow}
        </p>
        <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1
              className={[
                "text-3xl font-semibold tracking-tight sm:text-4xl",
                neutral ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
              ].join(" ")}
            >
              {title}
            </h1>
            <p
              className={[
                "mt-4 text-base leading-7",
                neutral ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
              ].join(" ")}
            >
              {description}
            </p>
          </div>
          {meta ? <div className="xl:max-w-sm">{meta}</div> : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div
            className={[
              "border bg-white p-4",
              neutral
                ? "rounded-lg border-[var(--border-warm)] shadow-[0_14px_34px_-32px_rgba(15,23,42,0.24)]"
                : "border-[var(--border-warm)] shadow-[0_20px_60px_-44px_rgba(57,43,30,0.22)]"
            ].join(" ")}
          >
            <p
              className={[
                "px-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
                neutral ? "text-[var(--text-tertiary)]" : "text-[var(--text-tertiary)]"
              ].join(" ")}
            >
              Configuration areas
            </p>
            <div className="mt-4">
              <SettingsNav items={navItems} tone={tone} />
            </div>
          </div>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
