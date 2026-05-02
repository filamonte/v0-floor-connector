import Link from "next/link";

type ManagerDashboardItem = {
  href: string;
  title: string;
  subtitle: string;
  meta?: string | null;
  badge?: string | null;
  trailing?: string | null;
};

type ManagerDashboardCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  items: ManagerDashboardItem[];
  emptyTitle: string;
  emptyDescription: string;
};

export function ManagerDashboardCard({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  items,
  emptyTitle,
  emptyDescription
}: ManagerDashboardCardProps) {
  return (
    <section className="flex h-full flex-col border border-[#d9cdc2] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#e8ded5] px-3 py-2.5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#221a14]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6f6256]">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center border border-[#d9cdc2] bg-[#fbf7f2] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#594839] transition hover:border-[#ef7d32] hover:bg-white"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[#eee4dc]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={`${item.href}:${item.title}`}
              href={item.href}
              className="group flex items-start justify-between gap-3 px-3 py-2.5 transition hover:bg-[#fbf7f2]"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#221a14] transition group-hover:text-[#a4581a]">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <span className="inline-flex shrink-0 border border-[#d9cdc2] bg-[#fbf7f2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#594839]">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{item.subtitle}</p>
                {item.meta ? (
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#8f7f72]">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              {item.trailing ? (
                <p className="shrink-0 text-sm font-semibold text-slate-900">
                  {item.trailing}
                </p>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="px-3 py-4">
            <p className="text-sm font-semibold text-[#221a14]">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-[#6f6256]">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
