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
    <section className="flex h-full flex-col border border-[#e2dcd5] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#e2dcd5] bg-[#f8f6f4] px-4 py-2.5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-0.5 text-[15px] font-semibold text-[#221a14]">
            {title}
          </h3>
          <p className="mt-1 text-[12px] leading-4 text-[#5f564d]">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center border border-[#e2dcd5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#5f564d] transition hover:border-[#ef7d32] hover:text-[#221a14]"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[#f0ebe6]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={`${item.href}:${item.title}`}
              href={item.href}
              className="group flex items-start justify-between gap-3 px-4 py-2.5 transition hover:bg-[#faf8f6]"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-[13px] font-semibold text-[#221a14] transition group-hover:text-[#ef7d32]">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <span className="inline-flex shrink-0 bg-[#ef7d32] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[12px] leading-4 text-[#5f564d]">{item.subtitle}</p>
                {item.meta ? (
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              {item.trailing ? (
                <p className="shrink-0 text-[13px] font-semibold text-[#221a14]">
                  {item.trailing}
                </p>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="px-4 py-4">
            <p className="text-[13px] font-semibold text-[#221a14]">{emptyTitle}</p>
            <p className="mt-1.5 text-[12px] leading-5 text-[#5f564d]">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
