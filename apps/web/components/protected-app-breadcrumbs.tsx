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
      className="flex flex-wrap items-center gap-2 text-sm text-[--muted]"
    >
      <span className="font-medium text-white">
        {organizationName ?? "Organization"}
      </span>
      <span aria-hidden="true" className="text-[--line-strong]">
        /
      </span>
      <span>{sectionLabel}</span>
    </div>
  );
}
