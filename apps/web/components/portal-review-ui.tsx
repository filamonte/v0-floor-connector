import Link from "next/link";
import type { ReactNode } from "react";

import { getStatusBadgeClassName } from "@floorconnector/ui";
import {
  industrialMutedPanelClassName,
  industrialPanelClassName,
  industrialRailClassName,
  industrialSecondaryActionClassName
} from "@/components/industrial-os-primitives";

export const portalHeroPanelClassName = [
  industrialPanelClassName,
  "p-5 sm:p-6"
].join(" ");

export const portalStatePanelClassName = [
  industrialMutedPanelClassName,
  "px-5 py-5 sm:px-6"
].join(" ");

export const portalInsetPanelClassName = [
  industrialPanelClassName,
  "px-4 py-4"
].join(" ");

export const portalMetricPanelClassName = [
  industrialPanelClassName,
  "min-w-0 px-4 py-3"
].join(" ");

export const portalReviewCardClassName =
  "min-w-0 rounded-[4px] border border-[#d1d5db] bg-white px-5 py-4 transition hover:border-[#005eb8] hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8]";

export const portalDocumentPanelClassName = [
  industrialMutedPanelClassName,
  "px-5 py-5 sm:px-6"
].join(" ");

export const portalActionBoxClassName = [
  industrialRailClassName,
  "space-y-4 p-4"
].join(" ");

export const portalSummaryItemClassName = [
  industrialPanelClassName,
  "px-4 py-4"
].join(" ");

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
    <section className="mt-4 rounded-[4px] border border-[#d1d5db] bg-[#f9fafb] px-5 py-4 shadow-none">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#005eb8]">
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
              className="rounded-[4px] border border-[#d1d5db] bg-white px-3.5 py-3"
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
        "inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
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
      className={[
        industrialSecondaryActionClassName,
        "max-w-full text-center text-sm font-medium"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
