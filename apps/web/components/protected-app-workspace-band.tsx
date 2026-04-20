"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";

type ProtectedAppWorkspaceBandProps = {
  organizationName: string;
};

function UtilityIcon({
  children,
  href
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 15 15 5" />
      <path d="M8 5h7v7" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="12" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="12" width="5" height="5" rx="1" />
      <rect x="12" y="12" width="5" height="5" rx="1" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3" />
      <path d="M4 17a6 6 0 0 1 12 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4M15.7 15.7l-1.4-1.4M5.7 5.7 4.3 4.3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

export function ProtectedAppWorkspaceBand({
  organizationName
}: ProtectedAppWorkspaceBandProps) {
  const pathname = usePathname();

  return (
    <div className="bg-[#111111] px-5 py-2.5 text-white sm:px-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="min-w-0">
          <ProtectedAppBreadcrumbs organizationName={organizationName} />
        </div>

        <div className="truncate text-center text-[13px] font-semibold tracking-[0.01em] text-white sm:text-[15px]">
          {organizationName}
        </div>

        <div className="flex items-center justify-end gap-1">
          <UtilityIcon href="/projects">
            <ArrowIcon />
          </UtilityIcon>
          <UtilityIcon href="/daily-logs">
            <GridIcon />
          </UtilityIcon>
          <UtilityIcon href="/time">
            <ClockIcon />
          </UtilityIcon>
          <UtilityIcon href="/people">
            <PersonIcon />
          </UtilityIcon>
          <UtilityIcon href="/settings">
            <GearIcon />
          </UtilityIcon>
          {pathname !== "/dashboard" ? (
            <span className="hidden text-[11px] text-white/45 sm:inline">Active</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
