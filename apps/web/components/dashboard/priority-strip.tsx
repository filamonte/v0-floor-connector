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
      className="rounded-lg border border-[var(--border-warm)] bg-white"
    >
      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.15fr)]">
        <div className="bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Priority strip
          </p>
          <h2
            id="dashboard-priority-strip-title"
            className="mt-1 text-[20px] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Decide what needs attention first
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            These are the highest-signal dashboard queues from the existing contractor
            workflow data.
          </p>
        </div>

        <div className="grid gap-px bg-[var(--border-warm)] sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex min-h-[132px] flex-col bg-white px-4 py-4 transition hover:bg-[var(--highlight)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)] group-hover:text-[var(--graphite-dark)]">
                    {item.title}
                  </h3>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]"
                  ].join(" ")}
                >
                  {item.countLabel}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                {item.detail}
              </p>
              <p className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {item.actionLabel}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
