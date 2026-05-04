import Link from "next/link";

export type DashboardPriorityItem = {
  key: string;
  label: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  countLabel: string;
  status: string;
};

type PriorityStripProps = {
  items: DashboardPriorityItem[];
};

export function PriorityStrip({ items }: PriorityStripProps) {
  return (
    <section
      aria-labelledby="dashboard-priority-strip-title"
      className="rounded-lg border border-[#d1d5db] bg-white"
    >
      <div className="grid gap-px bg-[#e2e5e9] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.15fr)]">
        <div className="bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Priority strip
          </p>
          <h2
            id="dashboard-priority-strip-title"
            className="mt-1 text-[20px] font-semibold tracking-tight text-[#171717]"
          >
            Decide what needs attention first
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#4b5563]">
            These are the highest-signal dashboard queues from the existing contractor
            workflow data.
          </p>
        </div>

        <div className="grid gap-px bg-[#e2e5e9] sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex min-h-[132px] flex-col bg-white px-4 py-4 transition hover:bg-[#f8fafc]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-5 text-[#171717] group-hover:text-slate-950">
                    {item.title}
                  </h3>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-md border border-[#d1d5db] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4b5563]"
                  ].join(" ")}
                >
                  {item.countLabel}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#4b5563]">
                {item.detail}
              </p>
              <p className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                {item.actionLabel}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
