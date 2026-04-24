import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CalendarDays, Clock3, FileText, FolderOpen, ListChecks, MoreVertical, Package2, PenSquare, Plane, RefreshCcw, ScrollText, ShieldCheck, SquareStack, UserCircle2, Lock } from "lucide-react";

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
  activeSectionId?: string;
  actionSlot?: ReactNode;
  footerActionLabel?: string;
  footerActionHref?: string;
  footerMeta?: ReactNode;
  children: ReactNode;
};

const sectionIcons: Record<string, typeof FileText> = {
  details: FileText,
  items: SquareStack,
  terms: ScrollText,
  "scope-of-work": ListChecks,
  scope: ListChecks,
  bidding: ShieldCheck,
  files: FolderOpen,
  "cover-sheet": Package2,
  notes: PenSquare,
  "review-send": Plane
};

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
  activeSectionId,
  actionSlot,
  footerActionLabel,
  footerActionHref,
  footerMeta,
  children
}: RecordWorkspaceShellProps) {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 bg-[#f5f7fa] xl:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="flex flex-col bg-[#1e3a5f] text-white">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Home / Estimates</p>
          <Link href={backHref} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {sections.map((section) => {
            const Icon = sectionIcons[section.id] ?? FileText;
            const isActive = activeSectionId === section.id;

            return (
              <Link
                key={section.id}
                href={section.href ?? "#"}
                className={
                  isActive
                    ? "flex h-10 items-center gap-3 border-l-[3px] border-[#ef7d32] bg-white/10 px-4 text-sm font-semibold text-white"
                    : "flex h-10 items-center gap-3 border-l-[3px] border-transparent px-4 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                }
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>

        {footerActionLabel ? (
          <div className="p-4">
            <Link
              href={footerActionHref ?? "#"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#ef7d32] px-4 text-sm font-semibold text-white transition hover:bg-[#de6c22]"
            >
              <Plane className="h-4 w-4" />
              {footerActionLabel}
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-orange-100 bg-[#ef7d32] text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-slate-900">{title}</h1>
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {statusBadge ? (
                    <span className="rounded-md bg-orange-50 px-3 py-1 text-sm font-semibold text-[#ef7d32]">{statusBadge}</span>
                  ) : null}
                  {referenceLabel && referenceValue ? (
                    <span className="text-sm font-medium text-slate-700">
                      {referenceLabel} <span className="font-semibold">{referenceValue}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              {stages.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {stages.map((stage, index) => {
                    const toneClasses =
                      stage.tone === "active"
                        ? "border-[#ef7d32] bg-[#ef7d32] text-white"
                        : stage.tone === "complete"
                          ? "border-slate-300 bg-white text-slate-600"
                          : "border-slate-300 bg-white text-slate-400";

                    return (
                      <div key={stage.label} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold ${toneClasses}`}>
                            {index + 1}
                          </div>
                          <span className="max-w-[92px] truncate text-sm font-medium text-slate-700">{stage.label}</span>
                        </div>
                        {index < stages.length - 1 ? <div className="hidden h-[2px] w-12 bg-slate-300 lg:block" /> : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <button type="button" className="rounded-md border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-md border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
                  <Lock className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-md border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {actionSlot ? <div className="mt-4">{actionSlot}</div> : null}
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>

        <footer className="flex h-12 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="font-semibold italic text-slate-700">Created:</span>
              <CalendarDays className="h-4 w-4" />
              04/21/2026
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              10:04 PM
            </span>
            <span className="inline-flex items-center gap-2">
              By
              <UserCircle2 className="h-4 w-4" />
              Jeff Filamonte
            </span>
            {footerMeta}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f]" />
              Save Estimate as Template
            </label>
            <button type="button" className="inline-flex items-center gap-2 font-medium text-slate-700">
              <Clock3 className="h-4 w-4" />
              Timeline
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
