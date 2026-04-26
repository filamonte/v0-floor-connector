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
  itemClassName = "border border-[#d7c7b4] bg-[#fbf7f1] px-4 py-3",
  labelClassName = "text-xs font-semibold uppercase tracking-[0.24em] text-[#a4581a]"
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

  const secondaryCardClassName = `${itemClassName} border-[#d7c7b4] bg-[#fbf7f1] px-4 py-3`;

  return (
    <div className="space-y-3">
      {purposeItems.length > 0 ? (
        <div className="max-w-[68ch]">
          {purposeItems.map((item) => (
            <div key={item.key} className="text-[13px] leading-5 text-[#665446]">
              {item.content}
            </div>
          ))}
        </div>
      ) : null}

      {nextActionItems.map((item) => (
        <div
          key={item.key}
          className="border border-[#d7c7b4] bg-[#fbf7f1] px-4 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
            {item.label}
          </p>
          <div className="mt-2 text-[13px] leading-5 text-[#665446]">{item.content}</div>
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
              <div className="mt-1.5 text-[13px] leading-5 text-[#665446]">{item.content}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
