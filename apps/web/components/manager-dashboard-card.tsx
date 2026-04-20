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
    <section className="flex h-full flex-col rounded border border-neutral-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
            {title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-white"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-neutral-100">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={`${item.href}:${item.title}`}
              href={item.href}
              className="group flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50 sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-neutral-950 transition group-hover:text-orange-600">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <span className="inline-flex shrink-0 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{item.subtitle}</p>
                {item.meta ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              {item.trailing ? (
                <p className="shrink-0 text-sm font-semibold text-neutral-900">
                  {item.trailing}
                </p>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="px-5 py-8 sm:px-6">
            <p className="text-sm font-semibold text-neutral-900">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
