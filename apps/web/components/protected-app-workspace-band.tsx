"use client";

import { usePathname } from "next/navigation";

import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { getProtectedAppWorkspaceSummary } from "@/lib/app-shell/navigation";

type ProtectedAppWorkspaceBandProps = {
  organizationName: string;
};

export function ProtectedAppWorkspaceBand({
  organizationName
}: ProtectedAppWorkspaceBandProps) {
  const pathname = usePathname();
  const summary = getProtectedAppWorkspaceSummary(pathname);

  return (
    <div className="rounded-[1.9rem] border border-slate-200 bg-white/80 px-5 py-4 shadow-[0_22px_54px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:px-6">
      <ProtectedAppBreadcrumbs organizationName={organizationName} />
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
            {summary.sectionLabel}
          </p>
          <h2 className="mt-2 truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            {summary.currentLabel}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {summary.sectionDescription}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            Canonical shared records
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            {organizationName}
          </span>
        </div>
      </div>
    </div>
  );
}
