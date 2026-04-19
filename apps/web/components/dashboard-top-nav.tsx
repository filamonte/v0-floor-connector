"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MembershipRole } from "@floorconnector/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/leads", label: "Leads" },
  { href: "/contracts", label: "Contracts" },
  { href: "/invoices", label: "Invoices" },
  { href: "/time", label: "Time" },
  { href: "/settings", label: "Settings", minRole: "admin" as const }
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type DashboardTopNavProps = {
  currentRole?: MembershipRole;
};

export function DashboardTopNav({ currentRole }: DashboardTopNavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (!("minRole" in item)) return true;
    if (!currentRole) return false;
    if (item.minRole === "admin") {
      return currentRole === "admin" || currentRole === "owner";
    }
    return true;
  });

  return (
    <nav className="flex items-center gap-1" aria-label="Main navigation">
      {visibleItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
