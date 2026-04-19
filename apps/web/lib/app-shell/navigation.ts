import { compareMembershipRoles } from "@floorconnector/domain";
import type { MembershipRole } from "@floorconnector/types";

export type ProtectedAppNavItem = {
  href: string;
  label: string;
  minRole: MembershipRole;
  section: "overview" | "pipeline" | "operations" | "finance" | "admin";
};

export const protectedAppSectionLabels = {
  overview: "Overview",
  pipeline: "Revenue workflow",
  operations: "Operations",
  finance: "Finance",
  admin: "Administration"
} as const;

const protectedAppSectionDescriptions = {
  overview: "Run the day from one dashboard-first operating view.",
  pipeline: "Move commercial work from customer through contract without losing continuity.",
  operations: "Track crews, time, vendors, materials, and field execution from one shared system.",
  finance: "Keep billing, payments, and cash collection connected to the same project chain.",
  admin: "Manage settings and organization rules without splitting the operating model."
} as const;

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
    href: "/time",
    label: "Time",
    minRole: "member",
    section: "operations"
  },
  {
    href: "/daily-logs",
    label: "Daily Logs",
    minRole: "member",
    section: "operations"
  },
  {
    href: "/people",
    label: "People",
    minRole: "member",
    section: "operations"
  },
  {
    href: "/vendors",
    label: "Vendors",
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

export function getVisibleProtectedAppNavItems(currentRole?: MembershipRole) {
  return protectedAppNavItems.filter((item) => {
    if (!currentRole) {
      return item.minRole === "member";
    }

    return compareMembershipRoles(currentRole, item.minRole) <= 0;
  });
}

export function getProtectedAppActiveItem(pathname: string) {
  return protectedAppNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
}

export function getProtectedAppActiveSection(pathname: string) {
  return getProtectedAppActiveItem(pathname)?.section ?? "overview";
}

export function getProtectedAppSectionGroups(currentRole?: MembershipRole) {
  const visibleItems = getVisibleProtectedAppNavItems(currentRole);

  return Object.entries(protectedAppSectionLabels)
    .map(([section, label]) => ({
      section: section as ProtectedAppNavItem["section"],
      label,
      description:
        protectedAppSectionDescriptions[section as keyof typeof protectedAppSectionDescriptions],
      items: visibleItems.filter((item) => item.section === section)
    }))
    .filter((group) => group.items.length > 0);
}

export function getProtectedAppSectionLabel(pathname: string) {
  const match = getProtectedAppActiveItem(pathname);

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

export function getProtectedAppWorkspaceSummary(pathname: string) {
  const activeItem = getProtectedAppActiveItem(pathname);
  const activeSection = getProtectedAppActiveSection(pathname);

  return {
    sectionLabel: protectedAppSectionLabels[activeSection],
    sectionDescription: protectedAppSectionDescriptions[activeSection],
    currentLabel:
      activeItem?.label ??
      (pathname === "/app" || pathname.startsWith("/app/")
        ? "Contractor workspace"
        : "Workspace")
  };
}
