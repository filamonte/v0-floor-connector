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
  itemClassName = "rounded-[4px] border border-[#d1d5db] bg-white px-4 py-3 shadow-[0_1px_0_rgba(9,9,11,0.035)]",
  labelClassName = "text-xs font-semibold uppercase tracking-[0.18em] text-[#005eb8]"
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

  const secondaryCardClassName = `${itemClassName} min-w-0`;

  return (
    <div className="space-y-3">
      {purposeItems.length > 0 ? (
        <div className="max-w-[68ch]">
          {purposeItems.map((item) => (
            <div
              key={item.key}
              className="text-[13px] leading-5 text-[var(--text-secondary)]"
            >
              {item.content}
            </div>
          ))}
        </div>
      ) : null}

      {nextActionItems.map((item) => (
        <div
          key={item.key}
          className="min-w-0 rounded-[4px] border border-[#c7d2e2] bg-[#f7fbff] px-4 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
            {item.label}
          </p>
          <div className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">
            {item.content}
          </div>
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
              <div className="mt-1.5 text-[13px] leading-5 text-[var(--text-secondary)]">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
