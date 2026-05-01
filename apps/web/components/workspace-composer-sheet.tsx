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
      className="fixed inset-0 z-50 flex justify-end bg-[#221a14]/60 backdrop-blur-[2px]"
    >
      <Link
        href={closeHref}
        aria-label={`Close ${openLabel}`}
        className="absolute inset-0"
      >
        <span className="sr-only">Close</span>
      </Link>
      <aside className="relative z-10 flex h-full w-full max-w-[920px] flex-col overflow-hidden border-l border-[#e2dcd5] bg-[#faf8f6] shadow-[-32px_0_80px_-48px_rgba(34,26,20,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e2dcd5] bg-[#2f3d33] px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#ef7d32]">
              Quick create
            </p>
            <h3 className="mt-1 text-[20px] font-semibold text-white">
              {title}
            </h3>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#c5d1c8]">
              {description}
            </p>
          </div>
          <Link
            href={closeHref}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#3d4e41] bg-[#253029] text-[13px] font-medium text-[#c5d1c8] transition hover:border-[#ef7d32] hover:text-white"
          >
            X
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="border border-[#e2dcd5] bg-white p-4 sm:p-6">
            {children}
          </div>
        </div>
      </aside>
    </div>
  );
}
