import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsSectionCard({
  eyebrow,
  title,
  description,
  children
}: SettingsSectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}
