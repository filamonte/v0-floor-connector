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
  variant?: "sidebar" | "mobile";
};

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

  return (
    <nav
      aria-label="Application navigation"
      className={
        variant === "sidebar"
          ? "flex flex-col gap-1"
          : "flex min-w-max items-center gap-2"
      }
    >
      {visibleItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              variant === "sidebar"
                ? "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition"
                : "rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-white text-black"
                : "text-[--muted] hover:bg-[--surface-strong] hover:text-white"
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
