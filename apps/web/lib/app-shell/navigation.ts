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
    href: "/jobs",
    label: "Jobs",
    minRole: "member"
  },
  {
    href: "/leads",
    label: "Leads",
    minRole: "member"
  },
  {
    href: "/estimates",
    label: "Estimates",
    minRole: "member"
  },
  {
    href: "/invoices",
    label: "Invoices",
    minRole: "member"
  },
  {
    href: "/customers",
    label: "Customers",
    minRole: "member"
  },
  {
    href: "/materials",
    label: "Materials",
    minRole: "member"
  },
  {
    href: "/settings",
    label: "Settings",
    minRole: "member"
  }
] as const;

export function getProtectedAppSectionLabel(pathname: string) {
  const match = protectedAppNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  if (match) {
    return match.label;
  }

  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return "Projects";
  }

  if (pathname === "/contracts" || pathname.startsWith("/contracts/")) {
    return "Contracts";
  }

  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return "Contractor Workspace";
  }

  return "App";
}
