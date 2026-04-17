"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { compareMembershipRoles } from "@floorconnector/domain";
import type { MembershipRole } from "@floorconnector/types";

import { protectedAppNavItems } from "@/lib/app-shell/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ProtectedAppNavProps = {
  currentRole?: MembershipRole;
  variant?: "sidebar" | "mobile" | "drawer";
};

const sectionLabels = {
  overview: "Overview",
  pipeline: "Revenue workflow",
  operations: "Operations",
  finance: "Finance",
  admin: "Administration"
} as const;

export function ProtectedAppNav({
  currentRole,
  variant = "sidebar"
}: ProtectedAppNavProps) {
  const pathname = usePathname();
  const visibleItems = protectedAppNavItems.filter((item) => {
    if (!currentRole) {
      return item.minRole === "member";
    }

    return compareMembershipRoles(currentRole, item.minRole) <= 0;
  });

  const groupedItems = Object.entries(sectionLabels)
    .map(([section, label]) => ({
      section,
      label,
      items: visibleItems.filter((item) => item.section === section)
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav
      aria-label="Application navigation"
      className={
        variant === "sidebar"
          ? "flex flex-col gap-6"
          : variant === "drawer"
            ? "flex flex-col gap-6"
            : "flex min-w-max items-center gap-2"
      }
    >
      {variant === "mobile"
        ? visibleItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })
        : groupedItems.map((group) => (
            <div key={group.section}>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {group.label}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-white text-slate-950 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.55)]"
                          : "text-slate-300 hover:bg-white/8 hover:text-white"
                      ].join(" ")}
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-700" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
    </nav>
  );
}
