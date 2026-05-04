import Link from "next/link";
import type { ReactNode } from "react";

import { getStatusBadgeClassName } from "@floorconnector/ui";

export const portalHeroPanelClassName =
  "rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_52px_-44px_rgba(15,23,42,0.3)] sm:p-8";

export const portalStatePanelClassName =
  "rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-6";

export const portalInsetPanelClassName =
  "rounded-xl border border-slate-200 bg-white px-4 py-4";

export const portalReviewCardClassName =
  "rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:bg-slate-50";

export const portalDocumentPanelClassName =
  "rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-6";

export const portalActionBoxClassName =
  "space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4";

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
      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
