import Link from "next/link";
import type { ReactNode } from "react";

type ScheduleContextMetric = {
  label: string;
  value: ReactNode;
};

type ScheduleContextDetailRow = {
  label: string;
  value: ReactNode;
};

type ScheduleContextAction = {
  href: string;
  label: string;
  variant?: "default" | "subtle";
};

export function ScheduleContextMetrics({
  items,
  columns = 3
}: {
  items: ScheduleContextMetric[];
  columns?: 2 | 3;
}) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ScheduleContextFocusCard({
  eyebrow,
  title,
  titleHref,
  statusLabel,
  summary,
  detailRows
}: {
  eyebrow: string;
  title: string;
  titleHref: string;
  statusLabel: string;
  summary: ReactNode;
  detailRows?: ScheduleContextDetailRow[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {eyebrow}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Link
          href={titleHref}
          className="font-semibold text-slate-950 transition hover:text-brand-700"
        >
          {title}
        </Link>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
          {statusLabel}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{summary}</p>
      {detailRows?.map((row) => (
        <p key={row.label} className="mt-1 text-sm leading-6 text-slate-500">
          {row.label}: {row.value}
        </p>
      ))}
    </div>
  );
}

function getNoticeClassName(tone: "neutral" | "warning" | "positive") {
  switch (tone) {
    case "warning":
      return "border-amber-200 bg-amber-50/80";
    case "positive":
      return "border-emerald-200 bg-emerald-50/80";
    default:
      return "border-dashed border-slate-300 bg-slate-50";
  }
}

function getNoticeEyebrowClassName(tone: "neutral" | "warning" | "positive") {
  switch (tone) {
    case "warning":
      return "text-amber-800";
    case "positive":
      return "text-emerald-800";
    default:
      return "text-slate-500";
  }
}

type ScheduleContextNoticeBaseProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  tone?: "neutral" | "warning" | "positive";
};

export function ScheduleContextNoticeBase({
  children,
  eyebrow,
  title,
  tone = "neutral"
}: ScheduleContextNoticeBaseProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${getNoticeClassName(tone)}`}
    >
      {eyebrow ? (
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${getNoticeEyebrowClassName(
            tone
          )}`}
        >
          {eyebrow}
        </p>
      ) : null}
      {title ? <p className="mt-2 font-semibold text-slate-950">{title}</p> : null}
      <div className={`${eyebrow || title ? "mt-2" : ""} text-slate-600`}>{children}</div>
    </div>
  );
}

export function ScheduleContextNotice(props: ScheduleContextNoticeBaseProps) {
  return <ScheduleContextNoticeBase {...props} />;
}

function getActionClassName(variant: ScheduleContextAction["variant"] = "default") {
  if (variant === "subtle") {
    return "inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700";
  }

  return "inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";
}

export function ScheduleContextActions({ actions }: { actions: ScheduleContextAction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link key={`${action.href}:${action.label}`} href={action.href} className={getActionClassName(action.variant)}>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
