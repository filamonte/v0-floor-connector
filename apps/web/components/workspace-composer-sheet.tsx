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
  openHref,
  closeHref,
  openLabel,
  children
}: WorkspaceComposerSheetProps) {
  if (!open) {
    return (
      <aside
        id={id}
        className="border border-[#dde3eb] bg-[#fbfcfe] p-5 sm:p-6 xl:sticky xl:top-28"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f7d92]">
          Composer
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[#17243b]">{title}</h3>
        <p className="mt-2 text-[14px] leading-6 text-slate-600">{description}</p>
        <div className="mt-5 rounded-[4px] border border-[#e5ebf2] bg-white px-4 py-3 text-[13px] leading-6 text-slate-500">
          Open the composer when you are ready to create a new record. The manager
          stays focused on review until then.
        </div>
        <Link
          href={openHref}
          className="mt-5 inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#1b2d4d]"
        >
          {openLabel}
        </Link>
      </aside>
    );
  }

  return (
    <aside
      id={id}
      className="border border-[#d7deea] bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)] sm:p-6 xl:sticky xl:top-28"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f7d92]">
            Composer
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#17243b]">{title}</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-600">{description}</p>
        </div>
        <Link
          href={closeHref}
          className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-2 text-[12px] font-medium text-[#41536f] transition hover:bg-white"
        >
          Close
        </Link>
      </div>

      <div className="mt-5">{children}</div>
    </aside>
  );
}
