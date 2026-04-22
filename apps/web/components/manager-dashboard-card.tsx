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
    <section className="flex h-full flex-col rounded-[1.4rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fffdf9,#ffffff)] shadow-[0_18px_42px_-36px_rgba(57,43,30,0.24)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#efe3d6] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a4581a]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-[#2b2118]">
            {title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6c594a]">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center rounded-full border border-[#e2d4c5] bg-[#fbf5ee] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b5442] transition hover:border-[#c59a6b] hover:bg-white hover:text-[#2b2118]"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[#efe4d7]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={`${item.href}:${item.title}`}
              href={item.href}
              className="group flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-[#fdf7ef] sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#2b2118] transition group-hover:text-[#a4581a]">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <span className="inline-flex shrink-0 rounded-full border border-[#eadfce] bg-[#fbf5ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#755f4d]">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-[#665446]">{item.subtitle}</p>
                {item.meta ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#a4581a]">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              {item.trailing ? (
                <p className="shrink-0 text-sm font-semibold text-[#3d3025]">
                  {item.trailing}
                </p>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="px-5 py-8 sm:px-6">
            <p className="text-sm font-semibold text-[#2b2118]">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[#6c594a]">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
