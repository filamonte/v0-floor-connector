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
};

export function ProtectedAppNav({ currentRole }: ProtectedAppNavProps) {
  const pathname = usePathname();
  const visibleItems = protectedAppNavItems.filter((item) => {
    if (!currentRole) {
      return item.minRole === "member";
    }

    return compareMembershipRoles(currentRole, item.minRole) <= 0;
  });

  return (
    <nav
      aria-label="Application navigation"
      className="flex flex-wrap items-center gap-2"
    >
      {visibleItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-brand-700 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-950"
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
