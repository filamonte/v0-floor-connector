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
    <section className="rounded-[2rem] border border-slate-200/90 bg-white/88 p-6 shadow-[0_24px_80px_-44px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
        {title}
      </p>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
