import type { ReactNode } from "react";
import Link from "next/link";

export type RecordWorkspaceStage = {
  label: string;
  tone?: "active" | "pending" | "complete";
};

export type RecordWorkspaceSection = {
  id: string;
  label: string;
  href?: string;
};

type RecordWorkspaceShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string | null;
  referenceLabel?: string | null;
  referenceValue?: string | null;
  statusBadge?: string | null;
  stages?: RecordWorkspaceStage[];
  sections: RecordWorkspaceSection[];
  actionSlot?: ReactNode;
  footerActionLabel?: string;
  footerActionHref?: string;
  footerMeta?: ReactNode;
  children: ReactNode;
};

function toneClasses(tone: RecordWorkspaceStage["tone"]) {
  switch (tone) {
    case "active":
      return "border-[#ef7d32] bg-[#fff4e8] text-[#8f4a18]";
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}

export function RecordWorkspaceShell({
  backHref,
  backLabel,
  title,
  subtitle,
  referenceLabel,
  referenceValue,
  statusBadge,
  stages = [],
  sections,
  actionSlot,
  footerActionLabel,
  footerActionHref,
  footerMeta,
  children
}: RecordWorkspaceShellProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-[28px] border border-[#d8e0eb] bg-[#233a64] text-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.6)]">
        <div className="border-b border-white/12 px-5 py-5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#dce7fb] transition hover:text-white"
          >
            <span aria-hidden="true">{"<"}</span>
            <span>{backLabel}</span>
          </Link>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {sections.map((section) => (
            <a
              key={section.id}
              href={section.href ?? `#${section.id}`}
              className="flex items-center rounded-[14px] px-4 py-3 text-[15px] font-medium text-[#e6eefc] transition hover:bg-white/8 hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </nav>

        {footerActionLabel && footerActionHref ? (
          <div className="border-t border-white/12 px-4 py-4">
            <Link
              href={footerActionHref}
              className="inline-flex w-full items-center justify-center rounded-[14px] bg-[#ef6d2e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d95c1f]"
            >
              {footerActionLabel}
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="space-y-5">
        <section className="rounded-[28px] border border-[#d8e0eb] bg-white px-6 py-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-[#17243b]">
                  {title}
                </h1>
                {statusBadge ? (
                  <span className="inline-flex rounded-full border border-[#fde2ce] bg-[#fff4e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a65724]">
                    {statusBadge}
                  </span>
                ) : null}
              </div>
              {subtitle ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p>
              ) : null}
              {referenceLabel && referenceValue ? (
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {referenceLabel}: <span className="text-[#17243b]">{referenceValue}</span>
                </p>
              ) : null}
            </div>

            {actionSlot ? <div className="shrink-0">{actionSlot}</div> : null}
          </div>

          {stages.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {stages.map((stage) => (
                <span
                  key={stage.label}
                  className={[
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                    toneClasses(stage.tone)
                  ].join(" ")}
                >
                  {stage.label}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-5">{children}</section>

        {footerMeta ? (
          <div className="rounded-[24px] border border-[#d8e0eb] bg-white px-5 py-4 text-sm leading-6 text-slate-500 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]">
            {footerMeta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
