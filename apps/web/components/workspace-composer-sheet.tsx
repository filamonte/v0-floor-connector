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
  icon?: ReactNode;
};

function DefaultIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-orange-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function WorkspaceComposerSheet({
  id,
  title,
  description,
  open,
  openHref,
  closeHref,
  openLabel,
  children,
  icon
}: WorkspaceComposerSheetProps) {
  if (!open) {
    return (
      <aside
        id={id}
        className="rounded border border-neutral-200 bg-neutral-50 p-5 sm:p-6 xl:sticky xl:top-28"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-50">
            {icon ?? <DefaultIcon />}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Composer
            </p>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-6 text-neutral-600">{description}</p>
        <div className="mt-5 rounded border border-neutral-200 bg-white px-4 py-3 text-[13px] leading-6 text-neutral-500">
          Open the composer when you are ready to create a new record. The manager
          stays focused on review until then.
        </div>
        <Link
          href={openHref}
          className="mt-5 inline-flex items-center rounded border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-neutral-800"
        >
          {openLabel}
        </Link>
      </aside>
    );
  }

  return (
    <aside
      id={id}
      className="rounded border border-neutral-200 bg-white p-5 shadow-lg sm:p-6 xl:sticky xl:top-28"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-50">
            {icon ?? <DefaultIcon />}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Composer
            </p>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
      <p className="mt-3 text-[14px] leading-6 text-neutral-600">{description}</p>

      <div className="mt-5">{children}</div>
    </aside>
  );
}
