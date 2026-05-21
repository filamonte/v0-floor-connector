"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { MembershipRole } from "@floorconnector/types";

import {
  getNavigationItemByPathname,
  getNavigationSectionByPathname,
  getVisibleNavigationSections,
  isNavigationItemActive,
  type NavigationItem
} from "@/lib/navigation/navigation-config";

const LAST_NAV_KEY_STORAGE_KEY = "fc:last-nav-key";
const LAST_PROJECT_HREF_STORAGE_KEY = "fc:last-project-href";

function isProjectWorkspacePath(pathname: string) {
  return pathname === "/projects" || pathname.startsWith("/projects/");
}

function normalizeProjectWorkspaceHref(href: string | null) {
  if (!href) {
    return null;
  }

  return isProjectWorkspacePath(href) ? href : null;
}

export function useProtectedNavigationState(currentRole?: MembershipRole) {
  const pathname = usePathname();
  const activeItem = useMemo(() => getNavigationItemByPathname(pathname), [pathname]);
  const activeSection = useMemo(() => getNavigationSectionByPathname(pathname), [pathname]);
  const sections = useMemo(() => getVisibleNavigationSections(currentRole), [currentRole]);
  const [recentModuleKey, setRecentModuleKey] = useState<string | null>(null);
  const [recentProjectHref, setRecentProjectHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setRecentModuleKey(window.sessionStorage.getItem(LAST_NAV_KEY_STORAGE_KEY));
    setRecentProjectHref(
      normalizeProjectWorkspaceHref(
        window.sessionStorage.getItem(LAST_PROJECT_HREF_STORAGE_KEY)
      )
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !activeItem) {
      return;
    }

    window.sessionStorage.setItem(LAST_NAV_KEY_STORAGE_KEY, activeItem.key);
    setRecentModuleKey(activeItem.key);
  }, [activeItem]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isProjectWorkspacePath(pathname)) {
      window.sessionStorage.setItem(LAST_PROJECT_HREF_STORAGE_KEY, pathname);
      setRecentProjectHref(pathname);
      return;
    }

    setRecentProjectHref(
      normalizeProjectWorkspaceHref(
        window.sessionStorage.getItem(LAST_PROJECT_HREF_STORAGE_KEY)
      )
    );
  }, [pathname]);

  const isItemActive = (item: NavigationItem) => isNavigationItemActive(pathname, item);

  return {
    pathname,
    activeItem,
    activeSection,
    sections,
    recentModuleKey,
    recentProjectHref,
    projectLauncherHref:
      isProjectWorkspacePath(pathname) ? pathname : recentProjectHref ?? "/projects",
    isItemActive
  };
}
