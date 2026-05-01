"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const menuId = "protected-app-top-nav-menu";
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
      {/* Sub-header band - matches CF pattern with breadcrumb left, org name center, utility icons right */}
      <div className="grid items-center gap-4 bg-[#2f3d33] px-5 py-2 text-white xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0 text-[12px] font-medium text-[#f3e7dc]">
          <ProtectedAppBreadcrumbs organizationName={organizationName} variant="dark" />
        </div>

        <div className="hidden min-w-0 justify-center xl:flex">
          <p className="truncate text-[14px] font-semibold tracking-[0.02em] text-white">
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
                "inline-flex h-7 items-center gap-1.5 border px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
                isItemActive(item)
                  ? "border-[#ef7d32] bg-[#ef7d32] text-white"
                  : "border-white/20 bg-white/10 text-[#f7e8db] hover:border-[#ef7d32] hover:bg-[#ef7d32]/20 hover:text-white"
              ].join(" ")}
            >
              <span className="text-[#ef7d32]">&#9733;</span>
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

      {/* Main header row - matches CF: Logo | Project Selector | MENU | Quick Links | User */}
      <div className="flex border-b border-[#ebe0d6] bg-white 2xl:items-stretch">
        <div className="flex min-w-0 shrink-0 items-center border-r border-[#ebe0d6] px-4 py-2 2xl:py-0">
          <OrganizationBrandLink
            href={homeHref}
            organizationName={organizationName}
            logoUrl={organizationLogoUrl}
            navigationLabel="Dashboard home"
            className="w-full max-w-[200px] 2xl:max-w-[220px]"
          />
        </div>

        {/* Project selector - matches CF pattern */}
        <Link
          href={projectLauncherHref}
          aria-current={pathname.startsWith("/projects") ? "page" : undefined}
          className={[
            "flex min-h-[56px] min-w-[180px] shrink-0 items-center justify-between gap-3 border-r border-[#ebe0d6] px-4 text-[#221a14] transition 2xl:min-w-[200px]",
            pathname.startsWith("/projects")
              ? "bg-[#fff4e8]"
              : "hover:bg-[#faf6f2]"
          ].join(" ")}
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8a7a6c]">
              Select a Project
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#221a14]">
              {projectLauncherHref === "/projects"
                ? "Open project queue"
                : "Return to project"}
            </p>
          </div>
          <Chevron open={false} />
        </Link>

        {/* MENU dropdown trigger - matches CF pattern */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className={[
            "flex min-h-[56px] min-w-[140px] shrink-0 items-center justify-between gap-3 border-r border-[#ebe0d6] px-4 text-left transition 2xl:min-w-[160px]",
            menuOpen ? "bg-[#f5f0eb] text-[#221a14]" : "text-[#221a14] hover:bg-[#faf6f2]"
          ].join(" ")}
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8a7a6c]">
              Menu
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#221a14]">
              {activeItem?.label ?? "Dashboard"}
            </p>
          </div>
          <Chevron open={menuOpen} />
        </button>

        {/* Right side: Quick create, notifications, user info */}
        <div className="flex flex-1 items-center justify-end gap-4 px-4 py-2">
          <UniversalCreateMenu
            idBase="top-nav-universal-create-menu"
            buttonLabel="Quick create"
            buttonClassName="inline-flex h-9 items-center gap-1.5 border border-[#ef7d32] bg-[#ef7d32] px-3 text-[12px] font-semibold text-white transition hover:bg-[#d86b28]"
          />
          <ContractorNotificationsCenter notifications={notifications} />

          <div className="hidden items-center gap-3 border-l border-[#ebe0d6] pl-4 lg:flex">
            <div className="min-w-0 text-right">
              <p className="truncate text-[13px] font-medium text-[#221a14]">{userEmail}</p>
              <p className="mt-0.5 text-[11px] text-[#9a8b80]">{timestampLabel}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center bg-[#2f3d33] text-[14px] font-semibold text-white">
              {organizationStatus.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Menu mega-dropdown panel - matches CF grouped columns layout */}
      <div
        id={menuId}
        aria-hidden={!menuOpen}
        className={[
          "absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-[#d9cdc2] bg-white text-[#221a14] shadow-[0_20px_40px_-20px_rgba(34,26,20,0.25)] transition-[max-height,opacity,transform] duration-200 ease-out",
          menuOpen
            ? "max-h-[600px] opacity-100"
            : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
        ].join(" ")}
      >
        <div
          className={[
            "transition duration-200 ease-out",
            menuOpen ? "translate-y-0" : "-translate-y-1"
          ].join(" ")}
        >

          {/* Grid of grouped module columns - matches CF mega menu */}
          <div className="grid gap-0 md:grid-cols-3 xl:grid-cols-5">
            {menuSections.map((section, index) => {
              const isSectionActive = activeSection?.id === section.id;

              return (
                <section
                  key={section.id}
                  className={[
                    "border-b border-[#eee2d7] px-5 py-5 transition-colors md:border-b-0",
                    index < menuSections.length - 1 ? "md:border-r md:border-[#eee2d7]" : "",
                    isSectionActive ? "bg-[#fffaf5]" : "bg-white"
                  ].join(" ")}
                >
                  <h3 className="text-[13px] font-semibold text-[#221a14]">
                    {section.label}
                  </h3>

                  <div className="mt-3 space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = isItemActive(item);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={[
                            "group flex items-center gap-2 px-2 py-2 text-[13px] transition",
                            isActive
                              ? "bg-[#fff4e8] font-medium text-[#221a14]"
                              : "text-[#4d4139] hover:bg-[#faf6f2] hover:text-[#221a14]"
                          ].join(" ")}
                        >
                          {isActive ? (
                            <span className="text-[#ef7d32]">&#9733;</span>
                          ) : (
                            <span className="text-[#c5b8ab]">&#8226;</span>
                          )}
                          <span>{item.label}</span>
                          {item.status !== "live" && (
                            <span className="ml-auto text-[10px] text-[#9a8b80]">Soon</span>
                          )}
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
