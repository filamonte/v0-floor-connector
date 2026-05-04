import Link from "next/link";
import { getStatusBadgeClassName } from "@floorconnector/ui";

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
    <section className="flex h-full flex-col rounded-lg border border-[#e2e5e9] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#e2e5e9] px-3 py-2.5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#4b5563]">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center rounded-md border border-[#d1d5db] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4b5563] transition hover:border-[#9ca3af] hover:bg-[#f8fafc] hover:text-[#221a14]"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[#e2e5e9]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={`${item.href}:${item.title}`}
              href={item.href}
              className="group flex items-start justify-between gap-3 px-3 py-2.5 transition hover:bg-[#f8fafc]"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#171717] transition group-hover:text-slate-950">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <span
                      className={[
                        "inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        getStatusBadgeClassName(item.badge)
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{item.subtitle}</p>
                {item.meta ? (
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
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
            <p className="text-sm font-semibold text-[#171717]">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-[#4b5563]">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
