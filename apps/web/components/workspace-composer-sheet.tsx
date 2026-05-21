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
      className="fixed inset-0 z-50 flex justify-end bg-[#111827]/55 backdrop-blur-[2px]"
    >
      <Link
        href={closeHref}
        aria-label={`Close ${openLabel}`}
        className="absolute inset-0"
      >
        <span className="sr-only">Close</span>
      </Link>
      <aside className="relative z-10 flex h-full w-full max-w-[920px] flex-col overflow-hidden border-l border-[#e2e5e9] bg-[#f4f5f7] shadow-[-32px_0_80px_-48px_rgba(17,24,39,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e5e9] bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Quick create
            </p>
            <h3 className="mt-2 text-[1.85rem] font-semibold tracking-tight text-[#171717]">
              {title}
            </h3>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#4b5563]">
              {description}
            </p>
          </div>
          <Link
            href={closeHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-[13px] font-medium text-[#4b5563] transition hover:border-[#9ca3af] hover:bg-[#f8fafc] hover:text-[#171717]"
          >
            X
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="rounded-lg border border-[#e2e5e9] bg-white p-4 sm:p-6">
            {children}
          </div>
        </div>
      </aside>
    </div>
  );
}
