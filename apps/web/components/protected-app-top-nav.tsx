"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MembershipRole } from "@floorconnector/types";

import { OrganizationBrandLink } from "@/components/organization-brand-link";
import { UniversalCreateMenu } from "@/components/universal-create-menu";
import {
  getProtectedAppActiveItem,
  getProtectedAppSectionGroups,
  type ProtectedAppNavItem
} from "@/lib/app-shell/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={["h-5 w-5 transition", open ? "rotate-180" : ""].join(" ")}
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

function ChatIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8 text-[#202d4b]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18H7l-4 3v-3H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z" />
      <path d="M17 16h1a2 2 0 0 0 2-2V8l4-3v9a2 2 0 0 1-2 2h-1v3l-4-3Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mr-1.5 inline h-3.5 w-3.5 text-[#d86d2a]"
      fill="currentColor"
    >
      <path d="m10 2.2 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.4l5-.7L10 2.2Z" />
    </svg>
  );
}

type MenuColumn = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

type ProtectedAppTopNavProps = {
  currentRole?: MembershipRole;
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
        getItem(items, "/schedule"),
        getItem(items, "/jobs"),
        getItem(items, "/daily-logs"),
        getItem(items, "/materials")
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
        getItem(items, "/time", "Time Cards")
      ].filter(Boolean) as MenuColumn["items"]
    },
    {
      title: "Documents",
      items: [
        getItem(items, "/customers"),
        getItem(items, "/projects", "Files & Photos"),
        getItem(items, "/daily-logs", "Reports")
      ].filter(Boolean) as MenuColumn["items"]
    },
    {
      title: "Settings & Support",
      items: [
        getItem(items, "/settings", "Settings"),
        getItem(items, "/dashboard", "Dashboard")
      ].filter(Boolean) as MenuColumn["items"]
    }
  ].filter((column) => column.items.length > 0);
}

function getShortcutItems(items: readonly ProtectedAppNavItem[]) {
  return [
    getItem(items, "/projects"),
    getItem(items, "/schedule"),
    getItem(items, "/time", "Time Cards"),
    getItem(items, "/people", "Directory")
  ].filter(Boolean) as Array<{ label: string; href: string }>;
}

export function ProtectedAppTopNav({
  currentRole,
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
  const shortcutItems = useMemo(() => getShortcutItems(allItems), [allItems]);
  const menuColumns = useMemo(() => buildMenuColumns(allItems), [allItems]);

  return (
    <div className="border-b border-[#d8dee8] bg-white">
      <div className="flex min-h-[78px] items-stretch">
        <div className="flex w-[262px] shrink-0 items-center border-r border-[#d8dee8] px-4">
          <OrganizationBrandLink
            href={homeHref}
            organizationName={organizationName}
            logoUrl={organizationLogoUrl}
            supportingLabel="Shared contractor workspace"
            className="w-full"
          />
        </div>

        <Link
          href="/projects"
          className="flex w-[198px] shrink-0 items-center justify-between border-r border-[#d8dee8] px-4 text-[#111827] transition hover:bg-[#fafbfd]"
        >
          <div>
            <p className="text-[11px] font-medium text-[#111827]">Select a Project</p>
          </div>
          <span className="text-[#273957]">
            <Chevron open={false} />
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={[
            "flex w-[178px] shrink-0 items-center justify-between border-r border-[#d8dee8] px-4 text-left transition",
            menuOpen ? "bg-[#eef2f6]" : "hover:bg-[#fafbfd]"
          ].join(" ")}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[#6b7280]">Menu</p>
            <p className="mt-0.5 text-[13px] font-medium text-[#111827]">
              {activeItem?.label ?? "Dashboard"}
            </p>
          </div>
          <span className="text-[#273957]">
            <Chevron open={menuOpen} />
          </span>
        </button>

        <nav
          aria-label="Primary application navigation"
          className="flex min-w-0 flex-1 items-center gap-5 px-4"
        >
          {shortcutItems.map((item, index) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "text-[13px] font-medium transition",
                  isActive ? "text-[#c96a2b]" : "text-[#1f2f4f] hover:text-[#0f1d36]"
                ].join(" ")}
              >
                {index === 0 ? <StarIcon /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center border-l border-[#d8dee8] px-4">
          <UniversalCreateMenu
            buttonLabel="Create"
            buttonClassName="h-10 border-[#233a64] bg-[#233a64] px-4 py-2 text-[13px]"
          />
        </div>

        <div className="hidden shrink-0 items-stretch border-l border-[#d8dee8] xl:flex">
          <div className="flex w-[182px] items-center px-4">
            <div className="text-[12px] leading-5 text-[#334155]">
              <p>
                <Link href="/dashboard" className="hover:text-[#0f1d36]">
                  Free Online Training
                </Link>
              </p>
              <p>
                <Link href="/time" className="hover:text-[#0f1d36]">
                  Daily Webinars
                </Link>
              </p>
              <p>
                <Link href="/people" className="hover:text-[#0f1d36]">
                  Contractor University
                </Link>
              </p>
            </div>
          </div>

          <div className="flex w-[98px] items-center justify-center border-l border-[#d8dee8] px-3">
            <div className="flex items-center gap-1.5">
              <div className="shrink-0">
                <ChatIcon />
              </div>
              <div className="text-[13px] font-medium text-[#111827]">
                <p>Live Chat</p>
              </div>
            </div>
          </div>

          <div className="flex w-[182px] items-center justify-between border-l border-[#d8dee8] px-4">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#111827]">
                {organizationName}
              </p>
              <p className="truncate text-[12px] text-[#7a8799]">{userEmail}</p>
              <p className="mt-1 text-[12px] text-[#7a8799]">{timestampLabel}</p>
            </div>
            <div className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2f8] text-[16px] font-medium text-[#31456b]">
              {organizationStatus.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[#d8dee8] bg-white">
          <div className="grid gap-0 xl:grid-cols-5">
            {menuColumns.map((column) => (
              <section
                key={column.title}
                className="border-b border-[#eceff4] px-6 py-5 xl:min-h-[370px] xl:border-b-0 xl:border-r xl:border-[#eceff4]"
              >
                <h3 className="text-[13px] font-semibold text-[#111827]">{column.title}</h3>
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
                          "block text-[13px] leading-6 transition",
                          isActive
                            ? "font-semibold text-[#1f2f4f]"
                            : "text-[#4b5563] hover:text-[#1f2f4f]"
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

          <div className="grid gap-0 border-t border-[#eceff4] bg-[#f6f7f9] sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Refer Us (Earn $$$)", href: "/dashboard" },
              { label: "Submit an Issue", href: "/settings" },
              { label: "What's New", href: "/dashboard" },
              { label: "Make a Suggestion", href: "/settings" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 border-b border-[#eceff4] px-6 py-4 text-[14px] font-medium text-[#1f2f4f] transition hover:bg-white sm:border-b-0 sm:border-r last:border-r-0"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#f1c9ad] bg-white text-[12px] text-[#e57d32]">
                  !
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
