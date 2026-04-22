"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MembershipRole } from "@floorconnector/types";

import { OrganizationBrandLink } from "@/components/organization-brand-link";
import { GlobalSearch } from "@/components/global-search";
import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ContractorNotificationsCenter } from "@/components/contractor-notifications-center";
import { UniversalCreateMenu } from "@/components/universal-create-menu";
import {
  getProtectedAppActiveItem,
  getProtectedAppSectionGroups,
  type ProtectedAppNavItem
} from "@/lib/app-shell/navigation";
import type { ContractorNotificationsSummary } from "@/lib/notifications/types";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={["h-4 w-4 transition", open ? "rotate-180" : ""].join(" ")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7 5 5 5-5" />
    </svg>
  );
}

function UtilityIcon({
  children,
  href,
  label
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/14 bg-white/8 text-[#f7e8db] transition hover:border-[#ef7d32] hover:bg-white/12 hover:text-white"
    >
      {children}
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 10 3l6.5 5.5" />
      <path d="M5.5 7.5V17h9V7.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="12" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="12" width="5" height="5" rx="1" />
      <rect x="12" y="12" width="5" height="5" rx="1" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3" />
      <path d="M4 17a6 6 0 0 1 12 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4M15.7 15.7l-1.4-1.4M5.7 5.7 4.3 4.3" />
    </svg>
  );
}

type MenuColumn = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

type MenuFooterAction = {
  label: string;
  href: string;
};

type ProtectedAppTopNavProps = {
  currentRole?: MembershipRole;
  notifications: ContractorNotificationsSummary;
  organizationName: string;
  organizationLogoUrl?: string | null;
  organizationStatus: string;
  userEmail: string;
  timestampLabel: string;
  homeHref: string;
};

function getItem(items: readonly ProtectedAppNavItem[], href: string, fallbackLabel?: string) {
  const match = items.find((item) => item.href === href);

  if (!match) {
    return null;
  }

  return {
    href: match.href,
    label: fallbackLabel ?? match.label
  };
}

function buildMenuColumns(items: readonly ProtectedAppNavItem[]): MenuColumn[] {
  return [
    {
      title: "Project Management",
      items: [
        getItem(items, "/projects"),
        getItem(items, "/daily-logs"),
        getItem(items, "/schedule"),
        getItem(items, "/jobs", "Work Orders"),
        getItem(items, "/change-orders", "Change Orders")
      ].filter(Boolean) as MenuColumn["items"]
    },
    {
      title: "Financials",
      items: [
        getItem(items, "/estimates"),
        getItem(items, "/contracts"),
        getItem(items, "/invoices"),
        getItem(items, "/payments")
      ].filter(Boolean) as MenuColumn["items"]
    },
    {
      title: "People",
      items: [
        getItem(items, "/people", "Directory"),
        getItem(items, "/leads", "Opportunities"),
        getItem(items, "/time", "Time Cards"),
        getItem(items, "/vendors"),
        getItem(items, "/customers", "Customers")
      ].filter(Boolean) as MenuColumn["items"]
    },
    {
      title: "Documents",
      items: [
        getItem(items, "/materials", "Materials"),
        getItem(items, "/projects", "Project Files")
      ].filter(Boolean) as MenuColumn["items"]
    },
    {
      title: "Settings & Support",
      items: [getItem(items, "/settings", "Settings")].filter(Boolean) as MenuColumn["items"]
    }
  ].filter((column) => column.items.length > 0);
}

function getMenuFooterActions(items: readonly ProtectedAppNavItem[]): MenuFooterAction[] {
  return [
    getItem(items, "/dashboard", "Dashboard home"),
    getItem(items, "/projects", "Project board"),
    getItem(items, "/schedule", "Schedule board"),
    getItem(items, "/payments", "Payments manager"),
    getItem(items, "/settings", "Settings")
  ].filter(Boolean) as MenuFooterAction[];
}

export function ProtectedAppTopNav({
  currentRole,
  notifications,
  organizationName,
  organizationLogoUrl,
  organizationStatus,
  userEmail,
  timestampLabel,
  homeHref
}: ProtectedAppTopNavProps) {
  const pathname = usePathname();
  const activeItem = getProtectedAppActiveItem(pathname);
  const groups = getProtectedAppSectionGroups(currentRole);
  const [menuOpen, setMenuOpen] = useState(false);

  const allItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const menuColumns = useMemo(() => buildMenuColumns(allItems), [allItems]);
  const menuFooterActions = useMemo(() => getMenuFooterActions(allItems), [allItems]);

  return (
    <div className="border-b border-[#d9cdc2] bg-white">
      <div className="grid items-center gap-4 bg-[#2f3d33] px-5 py-1.5 text-white xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0 text-[12px] font-medium text-[#f3e7dc]">
          <ProtectedAppBreadcrumbs organizationName={organizationName} variant="dark" />
        </div>

        <div className="hidden min-w-0 justify-center xl:flex">
          <p className="truncate text-[13px] font-semibold tracking-[0.03em] text-white">
            {organizationName}
          </p>
        </div>

        <div className="flex items-center gap-1.5 xl:justify-end">
          <UtilityIcon href={homeHref} label="Open dashboard home">
            <HomeIcon />
          </UtilityIcon>
          <UtilityIcon href="/schedule" label="Open schedule">
            <GridIcon />
          </UtilityIcon>
          <UtilityIcon href="/time" label="Open time cards">
            <ClockIcon />
          </UtilityIcon>
          <UtilityIcon href="/people" label="Open people">
            <PersonIcon />
          </UtilityIcon>
          <UtilityIcon href="/settings" label="Open settings">
            <GearIcon />
          </UtilityIcon>
        </div>
      </div>

      <div className="flex border-t border-white/5 border-b border-[#ebe0d6] 2xl:items-stretch">
        <div className="flex min-w-0 flex-1 items-center px-6 py-3 2xl:py-0">
          <OrganizationBrandLink
            href={homeHref}
            organizationName={organizationName}
            logoUrl={organizationLogoUrl}
            navigationLabel="Dashboard home"
            className="w-full max-w-[360px] 2xl:max-w-[400px]"
          />
        </div>

        <div className="flex shrink-0 flex-col border-l border-[#ebe0d6] 2xl:min-w-[920px]">
          <div className="flex flex-wrap items-stretch">
            <Link
              href="/projects"
              className="flex min-h-[64px] min-w-[220px] flex-1 items-center justify-between px-4 text-[#221a14] transition hover:bg-[#fff7f0] 2xl:min-w-[198px] 2xl:flex-none"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a65b25]">
                  Select a Project
                </p>
                <p className="mt-1 text-[13px] font-medium">Open project queue</p>
              </div>
              <Chevron open={false} />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={[
                "flex min-h-[64px] min-w-[186px] flex-1 items-center justify-between border-l border-[#ebe0d6] px-4 text-left transition 2xl:min-w-[166px] 2xl:flex-none",
                menuOpen ? "bg-[#f2ebe4] text-[#221a14]" : "text-[#221a14] hover:bg-[#fff7f0]"
              ].join(" ")}
            >
              <div>
                <p
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.18em]",
                    menuOpen ? "text-[#8f5b32]" : "text-[#a65b25]"
                  ].join(" ")}
                >
                  Menu
                </p>
                <p className="mt-1 text-[13px] font-medium">
                  {activeItem?.label ?? "Dashboard"}
                </p>
              </div>
              <Chevron open={menuOpen} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-[#ebe0d6] px-4 py-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <UniversalCreateMenu
                buttonLabel="Quick create"
                buttonClassName="inline-flex h-10 items-center rounded-[4px] border border-[#ef7d32] bg-[#ef7d32] px-4 py-2 text-[13px] font-semibold text-[#1f140d] transition hover:bg-[#f08b47]"
              />
              <ContractorNotificationsCenter notifications={notifications} />
              <GlobalSearch
                buttonClassName="inline-flex h-10 min-w-[220px] max-w-full items-center justify-between rounded-[4px] border border-[#dbcfc4] bg-[#fbf7f2] px-3.5 text-[13px] font-medium text-[#55473b] transition hover:border-[#ef7d32] hover:bg-white hover:text-[#221a14] xl:min-w-[250px]"
              />
            </div>

            <div className="flex items-center gap-3 border-l border-[#ebe0d6] pl-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-[13px] font-semibold text-[#221a14]">{userEmail}</p>
                <p className="mt-1 text-[11px] text-[#9a8b80]">{timestampLabel}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17120f] text-[15px] font-semibold text-[#ffd7bb]">
                {organizationStatus.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[#d9cdc2] bg-white text-[#221a14] shadow-[0_30px_60px_-40px_rgba(34,26,20,0.28)]">
          <div className="grid gap-0 xl:grid-cols-5">
            {menuColumns.map((column) => (
              <section
                key={column.title}
                className="border-b border-[#eee2d7] px-6 py-6 xl:min-h-[250px] xl:border-b-0 xl:border-r xl:border-[#eee2d7]"
              >
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                  {column.title}
                </h3>
                <div className="mt-4 space-y-2">
                  {column.items.map((item) => {
                    const isActive = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "block rounded-[4px] px-3 py-2 text-[13px] transition",
                          isActive
                            ? "bg-[#fff4e8] font-semibold text-[#221a14]"
                            : "text-[#3d342d] hover:bg-[#fff8f2] hover:text-[#221a14]"
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          {menuFooterActions.length > 0 ? (
            <div className="grid gap-px border-t border-[#eee2d7] bg-[#eee2d7] xl:grid-cols-4">
              {menuFooterActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setMenuOpen(false)}
                  className="bg-[#f8f4ef] px-6 py-4 text-sm font-semibold text-[#221a14] transition hover:bg-[#fff8f2] hover:text-[#8e4515]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
