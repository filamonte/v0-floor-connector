"use client";

import { usePathname } from "next/navigation";

import { getProtectedAppSectionLabel } from "@/lib/app-shell/navigation";

type ProtectedAppBreadcrumbsProps = {
  organizationName: string | null;
};

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-white"
      fill="currentColor"
    >
      <path d="M10 3.5 2 10h2v6h4v-4h4v4h4v-6h2l-8-6.5Z" />
    </svg>
  );
}

export function ProtectedAppBreadcrumbs({
  organizationName
}: ProtectedAppBreadcrumbsProps) {
  const pathname = usePathname();
  const sectionLabel = getProtectedAppSectionLabel(pathname);

  void organizationName;

  return (
    <div
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-[13px] text-white/90"
    >
      <HomeIcon />
      <span aria-hidden="true" className="text-white/45">
        /
      </span>
      <span className="font-medium">{sectionLabel}</span>
    </div>
  );
}
