import Link from "next/link";
import type { ReactNode } from "react";

import { getStatusBadgeClassName } from "@floorconnector/ui";

export const portalHeroPanelClassName =
  "rounded-xl border border-[var(--border-warm)] bg-white p-6 shadow-[0_14px_38px_-34px_rgba(55,65,81,0.22)] sm:p-7";

export const portalStatePanelClassName =
  "rounded-xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-5 sm:px-6";

export const portalInsetPanelClassName =
  "rounded-xl border border-[var(--border-warm)] bg-white px-4 py-4";

export const portalMetricPanelClassName =
  "min-w-0 rounded-lg border border-[var(--border-warm)] bg-white/85 px-4 py-3";

export const portalReviewCardClassName =
  "min-w-0 rounded-xl border border-[var(--border-warm)] bg-white px-5 py-4 transition hover:border-[var(--graphite-light)]/30 hover:bg-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]";

export const portalDocumentPanelClassName =
  "rounded-xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-5 sm:px-6";

export const portalActionBoxClassName =
  "space-y-4 rounded-xl border border-[var(--border-warm)] bg-[var(--highlight)] p-4";

export const portalSummaryItemClassName =
  "rounded-xl border border-[var(--border-warm)] bg-white/90 px-4 py-4 shadow-[0_12px_32px_-30px_rgba(55,65,81,0.32)]";

export const portalSummaryLabelClassName =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]";

export function PortalTrustStrip({
  eyebrow,
  title,
  description,
  items
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: ReactNode;
  }>;
}) {
  return (
    <section className="mt-4 rounded-xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 shadow-[0_14px_36px_-34px_rgba(40,32,27,0.32)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--copper)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-base font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[var(--border-warm)] bg-white px-3.5 py-3"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {item.label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function PortalStatusBadge({
  status,
  children,
  className = ""
}: {
  status: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        getStatusBadgeClassName(status),
        className
      ].join(" ")}
    >
      {children ?? status.replaceAll("_", " ")}
    </span>
  );
}

export function PortalSecondaryLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex max-w-full items-center justify-center rounded-md border border-[var(--border-warm)] bg-white px-3.5 py-2 text-center text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
