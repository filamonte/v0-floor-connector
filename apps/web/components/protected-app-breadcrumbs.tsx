"use client";

import { usePathname } from "next/navigation";

import { getProtectedAppSectionLabel } from "@/lib/app-shell/navigation";

const breadcrumbIconStyle = {
  width: "16px",
  height: "16px",
  flexShrink: 0
} as const;

type ProtectedAppBreadcrumbsProps = {
  organizationName: string | null;
  variant?: "light" | "dark";
};

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      className="h-4 w-4"
      style={breadcrumbIconStyle}
      fill="currentColor"
    >
      <path d="M10 3.5 2 10h2v6h4v-4h4v4h4v-6h2l-8-6.5Z" />
    </svg>
  );
}

export function ProtectedAppBreadcrumbs({
  organizationName,
  variant = "light"
}: ProtectedAppBreadcrumbsProps) {
  const pathname = usePathname();
  const sectionLabel = getProtectedAppSectionLabel(pathname);

  void organizationName;

  return (
    <div
      aria-label="Breadcrumb"
      className={[
        "flex min-w-0 flex-wrap items-center gap-1.5 text-[12px]",
        variant === "dark" ? "text-white/92" : "text-[#6f6256]"
      ].join(" ")}
    >
      <HomeIcon />
      <span
        aria-hidden="true"
        className={variant === "dark" ? "text-white/45" : "text-[#b28a6b]"}
      >
        /
      </span>
      <span
        className={[
          "min-w-0 truncate font-medium",
          variant === "dark" ? "text-white" : "text-[#221a14]"
        ].join(" ")}
      >
        {sectionLabel}
      </span>
    </div>
  );
}
