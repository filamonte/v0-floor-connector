import type { ReactNode } from "react";

import type { SettingsNavItem } from "@/lib/settings/navigation";
import { SettingsNav } from "@/components/settings-nav";

type SettingsSurfaceLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  navItems: readonly SettingsNavItem[];
  meta?: ReactNode;
  children: ReactNode;
};

export function SettingsSurfaceLayout({
  eyebrow,
  title,
  description,
  navItems,
  meta,
  children
}: SettingsSurfaceLayoutProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          {eyebrow}
        </p>
        <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
          </div>
          {meta ? <div className="xl:max-w-sm">{meta}</div> : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[2rem] border border-slate-200 bg-white/88 p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.42)] backdrop-blur">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Configuration areas
            </p>
            <div className="mt-4">
              <SettingsNav items={navItems} />
            </div>
          </div>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
