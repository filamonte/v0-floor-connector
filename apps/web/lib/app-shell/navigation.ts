import type { MembershipRole } from "@floorconnector/types";

import {
  getNavigationItemByPathname,
  getNavigationSectionByPathname,
  getVisibleNavigationItems,
  getVisibleNavigationSections,
  navigationItems,
  navigationSections,
  type NavigationItem
} from "@/lib/navigation/navigation-config";

export type ProtectedAppNavItem = NavigationItem;

export const protectedAppSectionLabels = Object.fromEntries(
  navigationSections.map((section) => [section.id, section.label])
) as Record<(typeof navigationSections)[number]["id"], string>;

export const protectedAppNavItems: readonly ProtectedAppNavItem[] = navigationItems;

export function getVisibleProtectedAppNavItems(currentRole?: MembershipRole) {
  return getVisibleNavigationItems(currentRole);
}

export function getProtectedAppActiveItem(pathname: string) {
  return getNavigationItemByPathname(pathname);
}

export function getProtectedAppSectionGroups(currentRole?: MembershipRole) {
  return getVisibleNavigationSections(currentRole);
}

export function getProtectedAppSectionLabel(pathname: string) {
  const activeItem = getProtectedAppActiveItem(pathname);

  if (activeItem) {
    return activeItem.label;
  }

  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return "Contractor Workspace";
  }

  return "App";
}

export function getProtectedAppWorkspaceSummary(pathname: string) {
  const activeItem = getProtectedAppActiveItem(pathname);
  const activeSection = getNavigationSectionByPathname(pathname);

  return {
    sectionLabel: activeSection?.label ?? "Dashboard",
    sectionDescription:
      activeSection?.description ??
      "Run the contractor workspace from one shared navigation system.",
    currentLabel:
      activeItem?.label ??
      (pathname === "/app" || pathname.startsWith("/app/")
        ? "Contractor workspace"
        : "Workspace")
  };
}
