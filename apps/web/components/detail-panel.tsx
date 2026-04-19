import type { ReactNode } from "react";

type DetailPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DetailPanel({
  title,
  description,
  children
}: DetailPanelProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white/88 p-7 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.32)] backdrop-blur sm:p-8">
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
          {title}
        </p>
        {description ? (
          <p className="max-w-[65ch] text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
