import type { ReactNode } from "react";

type ContextFactsListItem = {
  label: ReactNode;
  value: ReactNode;
};

type ContextFactsListProps = {
  items: ContextFactsListItem[];
  className?: string;
};

export function ContextFactsList({
  items,
  className = "space-y-4 text-sm leading-6 text-slate-600"
}: ContextFactsListProps) {
  return (
    <dl className={className}>
      {items.map((item, index) => (
        <div key={index}>
          <dt className="font-medium text-slate-950">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
