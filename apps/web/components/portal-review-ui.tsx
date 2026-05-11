import Link from "next/link";
import type { ReactNode } from "react";

import { getStatusBadgeClassName } from "@floorconnector/ui";

export const portalHeroPanelClassName =
  "rounded-2xl border border-[var(--border-warm)] bg-white p-7 shadow-[0_18px_52px_-44px_rgba(55,65,81,0.2)] sm:p-8";

export const portalStatePanelClassName =
  "rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-6 py-6";

export const portalInsetPanelClassName =
  "rounded-xl border border-[var(--border-warm)] bg-white px-4 py-4";

export const portalReviewCardClassName =
  "rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-4 transition hover:border-[var(--graphite-light)]/30 hover:bg-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]";

export const portalDocumentPanelClassName =
  "rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-6 py-6";

export const portalActionBoxClassName =
  "space-y-4 rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] p-4";

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
      className="inline-flex items-center rounded-md border border-[var(--border-warm)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
