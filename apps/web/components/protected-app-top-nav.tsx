"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { MembershipRole } from "@floorconnector/types";

import { OrganizationBrandLink } from "@/components/organization-brand-link";
import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ContractorNotificationsCenter } from "@/components/contractor-notifications-center";
import { UniversalCreateMenu } from "@/components/universal-create-menu";
import { useProtectedNavigationState } from "@/lib/navigation/navigation-client";
import type { ContractorNotificationsSummary } from "@/lib/notifications/types";

const utilityIconFrameStyle = {
  width: "32px",
  height: "32px"
} as const;

const shellIconStyle = {
  width: "16px",
  height: "16px",
  flexShrink: 0
} as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      className={["h-4 w-4 transition", open ? "rotate-180" : ""].join(" ")}
      style={shellIconStyle}
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

function UtilityIconFrame({
  children,
  href,
  label,
  active = false
}: {
  children: ReactNode;
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-[4px] border transition",
        active
          ? "border-[#ef7d32] bg-[#ef7d32]/20 text-white"
          : "border-white/14 bg-white/8 text-[#f7e8db] hover:border-[#ef7d32] hover:bg-white/12 hover:text-white"
      ].join(" ")}
      style={utilityIconFrameStyle}
    >
      {children}
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" className="h-4 w-4" style={shellIconStyle} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 10 3l6.5 5.5" />
      <path d="M5.5 7.5V17h9V7.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" className="h-4 w-4" style={shellIconStyle} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="12" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="12" width="5" height="5" rx="1" />
      <rect x="12" y="12" width="5" height="5" rx="1" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" className="h-4 w-4" style={shellIconStyle} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4M15.7 15.7l-1.4-1.4M5.7 5.7 4.3 4.3" />
    </svg>
  );
}

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
  const {
    pathname,
    activeItem,
    activeSection,
    sections: menuSections,
    projectLauncherHref,
    isItemActive
  } = useProtectedNavigationState(currentRole);
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const quickLinks = useMemo(
    () =>
      ["/projects", "/cost-items-database", "/time-cards"]
        .map((href) =>
          menuSections.flatMap((section) => section.items).find((item) => item.href === href)
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [menuSections]
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div ref={shellRef} className="relative border-b border-[#d9cdc2] bg-white">
      <div className="grid items-center gap-4 bg-[#2f3d33] px-5 py-1.5 text-white xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0 text-[12px] font-medium text-[#f3e7dc]">
          <ProtectedAppBreadcrumbs organizationName={organizationName} variant="dark" />
        </div>

        <div className="hidden min-w-0 justify-center xl:flex">
          <p className="truncate text-[13px] font-semibold tracking-[0.03em] text-white">
            {organizationName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isItemActive(item) ? "page" : undefined}
              className={[
                "inline-flex h-8 items-center rounded-[4px] border px-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
                isItemActive(item)
                  ? "border-[#ef7d32] bg-[#ef7d32]/20 text-white"
                  : "border-white/14 bg-white/8 text-[#f7e8db] hover:border-[#ef7d32] hover:bg-white/12 hover:text-white"
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
          <UtilityIconFrame
            href={homeHref}
            label="Open dashboard home"
            active={pathname === homeHref}
          >
            <HomeIcon />
          </UtilityIconFrame>
          <UtilityIconFrame
            href="/dashboard"
            label="Open dashboard launcher"
            active={pathname === "/dashboard"}
          >
            <GridIcon />
          </UtilityIconFrame>
          <UtilityIconFrame
            href="/settings"
            label="Open settings"
            active={pathname === "/settings" || pathname.startsWith("/settings/")}
          >
            <GearIcon />
          </UtilityIconFrame>
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
              href={projectLauncherHref}
              aria-current={pathname.startsWith("/projects") ? "page" : undefined}
              className={[
                "flex min-h-[64px] min-w-[220px] flex-1 items-center justify-between px-4 text-[#221a14] transition 2xl:min-w-[198px] 2xl:flex-none",
                pathname.startsWith("/projects")
                  ? "bg-[#fff4e8]"
                  : "hover:bg-[#fff7f0]"
              ].join(" ")}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a65b25]">
                  Select a Project
                </p>
                <p className="mt-1 text-[13px] font-medium">
                  {projectLauncherHref === "/projects"
                    ? "Open project queue"
                    : "Return to recent project"}
                </p>
              </div>
              <Chevron open={false} />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
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
                  {activeSection ? `Menu - ${activeSection.label}` : "Menu"}
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

      <div
        id={menuId}
        aria-hidden={!menuOpen}
        className={[
          "overflow-hidden border-t border-[#d9cdc2] bg-white text-[#221a14] shadow-[0_30px_60px_-40px_rgba(34,26,20,0.28)] transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          menuOpen
            ? "max-h-[720px] opacity-100"
            : "pointer-events-none max-h-0 -translate-y-3 opacity-0"
        ].join(" ")}
      >
        <div
          className={[
            "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menuOpen ? "translate-y-0" : "-translate-y-2"
          ].join(" ")}
        >
          <div className="border-b border-[#eee2d7] bg-[#fbf6f0] px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a65b25]">
                  Contractor control panel
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#221a14]">
                  {activeItem ? `${activeItem.label} is active` : "Open a module"}
                </h3>
                <p className="mt-1 max-w-3xl text-sm text-[#6f6256]">
                  Grouped navigation stays aligned across the dashboard launcher,
                  header menu, and any contextual sidebar.
                </p>
              </div>
              <div className="rounded-[4px] border border-[#e6d9cc] bg-white px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b6d45]">
                  Current section
                </p>
                <p className="mt-1 text-sm font-semibold text-[#221a14]">
                  {activeSection?.label ?? "Dashboard"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-5">
            {menuSections.map((section, index) => {
              const isSectionActive = activeSection?.id === section.id;

              return (
                <section
                  key={section.id}
                  className={[
                    "border-b border-[#eee2d7] px-6 py-6 transition-colors xl:min-h-[280px] xl:border-b-0",
                    index < menuSections.length - 1 ? "xl:border-r xl:border-[#eee2d7]" : "",
                    isSectionActive ? "bg-[#fffaf5]" : "bg-white"
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                        {section.label}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[#6f6256]">
                        {section.description}
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                        isSectionActive
                          ? "bg-[#221a14] text-[#ffd7bb]"
                          : "bg-[#f2e7dc] text-[#8f5b32]"
                      ].join(" ")}
                    >
                      {section.items.length} modules
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {section.items.map((item) => {
                      const isActive = isItemActive(item);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={[
                            "group block rounded-[8px] border px-3 py-3 transition",
                            isActive
                              ? "border-[#ef7d32] bg-[#fff4e8] shadow-[inset_0_0_0_1px_rgba(239,125,50,0.16)]"
                              : "border-transparent text-[#3d342d] hover:border-[#edd9c7] hover:bg-[#fff8f2] hover:text-[#221a14]"
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p
                                className={[
                                  "text-[13px] font-semibold",
                                  isActive ? "text-[#221a14]" : ""
                                ].join(" ")}
                              >
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-[#6f6256]">
                                {item.description}
                              </p>
                            </div>
                            <span
                              className={[
                                "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                item.status === "live"
                                  ? "bg-[#ecf7ef] text-[#2f6a3e]"
                                  : "bg-[#f3ebe4] text-[#8f5b32]"
                              ].join(" ")}
                            >
                              {item.status === "live" ? "Live" : "Coming soon"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
