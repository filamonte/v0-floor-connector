import type { ReactNode } from "react";
import Link from "next/link";

type WorkspaceComposerSheetProps = {
  id?: string;
  title: string;
  description: string;
  open: boolean;
  openHref: string;
  closeHref: string;
  openLabel: string;
  children: ReactNode;
};

export function WorkspaceComposerSheet({
  id,
  title,
  description,
  open,
  closeHref,
  openLabel,
  children
}: WorkspaceComposerSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex justify-end bg-[#122033]/55 backdrop-blur-[2px]"
    >
      <Link
        href={closeHref}
        aria-label={`Close ${openLabel}`}
        className="absolute inset-0"
      >
        <span className="sr-only">Close</span>
      </Link>
      <aside className="relative z-10 flex h-full w-full max-w-[920px] flex-col overflow-hidden border-l border-[#d6dce6] bg-[#f8fbff] shadow-[-32px_0_80px_-48px_rgba(15,23,42,0.6)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#dde5ef] bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#486180]">
              Quick create
            </p>
            <h3 className="mt-2 text-[1.85rem] font-semibold tracking-[-0.02em] text-[#183153]">
              {title}
            </h3>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#5c6d83]">
              {description}
            </p>
          </div>
          <Link
            href={closeHref}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d7e0ea] bg-white text-[13px] font-medium text-[#4b5d75] transition hover:border-[#a8b8cc] hover:bg-[#f5f8fc]"
          >
            X
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="rounded-[1.5rem] border border-[#dde5ef] bg-white p-4 shadow-[0_18px_48px_-42px_rgba(15,23,42,0.55)] sm:p-6">
            {children}
          </div>
        </div>
      </aside>
    </div>
  );
}
