import type { MembershipRole } from "@floorconnector/types";

export type ProtectedAppNavItem = {
  href: string;
  label: string;
  minRole: MembershipRole;
  section: "overview" | "pipeline" | "operations" | "finance" | "admin";
};

export const protectedAppNavItems: readonly ProtectedAppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    minRole: "member",
    section: "overview"
  },
  {
    href: "/leads",
    label: "Leads",
    minRole: "member",
    section: "pipeline"
  },
  {
    href: "/customers",
    label: "Customers",
    minRole: "member",
    section: "pipeline"
  },
  {
    href: "/projects",
    label: "Projects",
    minRole: "member",
    section: "pipeline"
  },
  {
    href: "/estimates",
    label: "Estimates",
    minRole: "member",
    section: "pipeline"
  },
  {
    href: "/contracts",
    label: "Contracts",
    minRole: "member",
    section: "pipeline"
  },
  {
    href: "/jobs",
    label: "Jobs",
    minRole: "member",
    section: "operations"
  },
  {
    href: "/invoices",
    label: "Invoices",
    minRole: "member",
    section: "finance"
  },
  {
    href: "/materials",
    label: "Materials",
    minRole: "member",
    section: "operations"
  },
  {
    href: "/settings",
    label: "Settings",
    minRole: "admin",
    section: "admin"
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
