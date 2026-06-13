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
  const scopeLabel = neutral
    ? "Platform control scope"
    : "Contractor organization scope";

  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-[4px] border p-5 shadow-none sm:p-6",
          neutral
            ? "border-[#27272a] bg-[#09090b] text-white"
            : "border-[#27272a] bg-[#09090b] text-white"
        ].join(" ")}
      >
        <p
          className={[
            "text-[11px] font-semibold uppercase tracking-[0.24em]",
            neutral ? "text-slate-300" : "text-[#8fc7ff]"
          ].join(" ")}
        >
          {eyebrow}
        </p>
        <p className="mt-3 inline-flex rounded-[4px] border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
          {scopeLabel}
        </p>
        <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-white/72">
              {description}
            </p>
          </div>
          {meta ? <div className="xl:max-w-sm">{meta}</div> : null}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div
            className={[
              "rounded-[4px] border bg-white p-3 shadow-none",
              neutral ? "border-slate-200" : "border-[var(--border-warm)]"
            ].join(" ")}
          >
            <p
              className={[
                "px-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
                neutral
                  ? "text-[var(--text-tertiary)]"
                  : "text-[var(--text-tertiary)]"
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
