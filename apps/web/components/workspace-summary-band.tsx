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
  const purposeItems = items.filter((item) =>
    ["purpose", "review-purpose", "what-this-page-is-for"].includes(item.key)
  );
  const nextActionItems = items.filter((item) =>
    ["next-action", "preferred-next-action", "next-step"].includes(item.key)
  );
  const secondaryItems = items.filter(
    (item) => !purposeItems.includes(item) && !nextActionItems.includes(item)
  );

  const secondaryCardClassName = `${itemClassName} border-slate-200/70 bg-slate-50/40 px-4 py-4`;

  return (
    <div className="space-y-5">
      {purposeItems.length > 0 ? (
        <div className="max-w-[68ch]">
          {purposeItems.map((item) => (
            <div key={item.key} className="text-sm leading-6 text-slate-600">
              {item.content}
            </div>
          ))}
        </div>
      ) : null}

      {nextActionItems.map((item) => (
        <div
          key={item.key}
          className="rounded-[1.9rem] border border-brand-200/85 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,1))] px-6 py-6 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.34)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">
            {item.label}
          </p>
          <div className="mt-4.5">{item.content}</div>
        </div>
      ))}

      {secondaryItems.length > 0 ? (
        <div className={className}>
          {secondaryItems.map((item) => (
            <div
              key={item.key}
              className={
                item.className
                  ? `${secondaryCardClassName} ${item.className}`
                  : secondaryCardClassName
              }
            >
              <p className={labelClassName}>{item.label}</p>
              <div className="mt-2 text-sm leading-6 text-slate-600">{item.content}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
