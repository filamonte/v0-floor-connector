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
      <section className="border border-[#d9cdc2] bg-white p-6 shadow-[0_24px_80px_-46px_rgba(57,43,30,0.26)] sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a4581a]">
          {eyebrow}
        </p>
        <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-[#221a14] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-[#6f6256]">{description}</p>
          </div>
          {meta ? <div className="xl:max-w-sm">{meta}</div> : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="border border-[#d9cdc2] bg-white p-4 shadow-[0_20px_60px_-44px_rgba(57,43,30,0.22)]">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f7f72]">
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
