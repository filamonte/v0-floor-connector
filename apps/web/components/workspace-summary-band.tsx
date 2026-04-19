import type { ReactNode } from "react";

type WorkspaceSummaryBandItem = {
  key: string;
  label: ReactNode;
  content: ReactNode;
  className?: string;
};

type WorkspaceSummaryBandProps = {
  items: WorkspaceSummaryBandItem[];
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
};

export function WorkspaceSummaryBand({
  items,
  className = "grid gap-4 lg:grid-cols-2 2xl:grid-cols-4",
  itemClassName = "rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5",
  labelClassName = "text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
}: WorkspaceSummaryBandProps) {
  return (
    <div className={className}>
      {items.map((item) => (
        <div
          key={item.key}
          className={item.className ? `${itemClassName} ${item.className}` : itemClassName}
        >
          <p className={labelClassName}>{item.label}</p>
          <div className="mt-3">{item.content}</div>
        </div>
      ))}
    </div>
  );
}
