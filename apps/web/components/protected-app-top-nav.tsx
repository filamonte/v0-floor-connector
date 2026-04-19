"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MembershipRole } from "@floorconnector/types";

import {
  getProtectedAppActiveSection,
  getProtectedAppSectionGroups
} from "@/lib/app-shell/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ProtectedAppTopNavProps = {
  currentRole?: MembershipRole;
};

export function ProtectedAppTopNav({
  currentRole
}: ProtectedAppTopNavProps) {
  const pathname = usePathname();
  const activeSection = getProtectedAppActiveSection(pathname);
  const groups = getProtectedAppSectionGroups(currentRole);
  const activeGroup =
    groups.find((group) => group.section === activeSection) ?? groups[0];

  return (
    <div className="space-y-4">
      <nav
        aria-label="Primary application navigation"
        className="flex flex-wrap items-center gap-2"
      >
        {groups.map((group) => {
          const isActive = group.section === activeGroup?.section;

          return (
            <Link
              key={group.section}
              href={group.items[0]?.href ?? "/dashboard"}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
              ].join(" ")}
            >
              {group.label}
            </Link>
          );
        })}
      </nav>

      {activeGroup ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/88 px-4 py-4 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
                {activeGroup.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {activeGroup.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeGroup.items.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-brand-700 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
