import type { MembershipRole } from "@floorconnector/types";

export type ProtectedAppNavItem = {
  href: string;
  label: string;
  minRole: MembershipRole;
};

export const protectedAppNavItems: readonly ProtectedAppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    minRole: "member"
  },
  {
    href: "/customers",
    label: "Customers",
    minRole: "member"
  },
  {
    href: "/projects",
    label: "Projects",
    minRole: "member"
  },
  {
    href: "/estimates",
    label: "Estimates",
    minRole: "member"
  },
  {
    href: "/jobs",
    label: "Jobs",
    minRole: "member"
  },
  {
    href: "/settings",
    label: "Settings",
    minRole: "admin"
  }
] as const;

export function getProtectedAppSectionLabel(pathname: string) {
  const match = protectedAppNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  if (match) {
    return match.label;
  }

  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return "Contractor Workspace";
  }

  return "App";
}
