import Link from "next/link";

export type OperationalGuidanceTone =
  | "attention"
  | "ready"
  | "waiting"
  | "field"
  | "neutral";

export type OperationalGuidanceItem = {
  id: string;
  title: string;
  description: string;
  why: string;
  href?: string | null;
  actionLabel?: string | null;
  badge?: string | null;
  secondaryHref?: string | null;
  secondaryLabel?: string | null;
};

export type OperationalGuidanceBucket = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  tone: OperationalGuidanceTone;
  items: OperationalGuidanceItem[];
};

function getBucketClassName(tone: OperationalGuidanceTone) {
  switch (tone) {
    case "attention":
      return "border-amber-200 bg-amber-50/80 text-amber-950";
    case "ready":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
    case "waiting":
      return "border-[#e3d6c7] bg-[#fbf4ea] text-[#5f4d3d]";
    case "field":
      return "border-slate-200 bg-slate-50/90 text-slate-900";
    case "neutral":
      return "border-slate-200 bg-white text-slate-900";
  }
}

export function OperationalGuidanceSection({
  title,
  description,
  buckets
}: {
  title: string;
  description: string;
  buckets: OperationalGuidanceBucket[];
}) {
  return (
    <section
      aria-labelledby="operational-guidance-title"
      className="rounded-lg border border-[var(--border-warm)] bg-white"
    >
      <div className="border-b border-[var(--border-warm)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Operational cockpit
        </p>
        <h2
          id="operational-guidance-title"
          className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
        >
          {title}
        </h2>
        <p className="mt-1 max-w-[74ch] text-xs leading-5 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-2 xl:grid-cols-4">
        {buckets.map((bucket) => (
          <article key={bucket.key} className="bg-white">
            <div
              className={[
                "min-h-full border px-4 py-4",
                getBucketClassName(bucket.tone)
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                    {bucket.eyebrow}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold">{bucket.title}</h3>
                </div>
                <span className="shrink-0 rounded-md border border-current/20 bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                  {bucket.items.length}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 opacity-85">
                {bucket.description}
              </p>

              {bucket.items.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {bucket.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-current/15 bg-white/70 px-3 py-3 text-sm leading-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-semibold">{item.title}</p>
                        {item.badge ? (
                          <span className="rounded-md border border-current/20 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 opacity-85">
                        {item.description}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
                        Why: {item.why}
                      </p>
                      {(item.href && item.actionLabel) ||
                      (item.secondaryHref && item.secondaryLabel) ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.href && item.actionLabel ? (
                            <Link
                              href={item.href}
                              className="inline-flex h-8 items-center rounded-full border border-current/20 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition hover:bg-white/70"
                            >
                              {item.actionLabel}
                            </Link>
                          ) : null}
                          {item.secondaryHref && item.secondaryLabel ? (
                            <Link
                              href={item.secondaryHref}
                              className="inline-flex h-8 items-center rounded-full border border-current/20 bg-white/60 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition hover:bg-white"
                            >
                              {item.secondaryLabel}
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-current/25 bg-white/45 px-3 py-3 text-sm leading-5">
                  <p className="font-semibold">{bucket.emptyTitle}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    {bucket.emptyDescription}
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
