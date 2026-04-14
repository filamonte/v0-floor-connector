"use client";

import { usePathname } from "next/navigation";

import { getProtectedAppSectionLabel } from "@/lib/app-shell/navigation";

type ProtectedAppBreadcrumbsProps = {
  organizationName: string | null;
};

export function ProtectedAppBreadcrumbs({
  organizationName
}: ProtectedAppBreadcrumbsProps) {
  const pathname = usePathname();
  const sectionLabel = getProtectedAppSectionLabel(pathname);

  return (
    <div
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
    >
      <span className="font-medium text-slate-700">
        {organizationName ?? "Organization"}
      </span>
      <span aria-hidden="true" className="text-slate-400">
        /
      </span>
      <span>{sectionLabel}</span>
    </div>
  );
}
