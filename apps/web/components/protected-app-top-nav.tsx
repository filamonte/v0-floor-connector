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
  signOutAction: (formData: FormData) => void | Promise<void>;
};

export function ProtectedAppTopNav({
  currentRole,
  notifications,
  organizationName,
  organizationLogoUrl,
  organizationStatus,
  userEmail,
  timestampLabel,
  homeHref,
  signOutAction
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const menuId = "protected-app-top-nav-menu";
  const accountMenuId = "protected-app-account-menu";
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
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !accountMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen, menuOpen]);

  return (
    <div ref={shellRef} className="relative border-b border-[#d9cdc2] bg-white">
      <div className="grid items-center gap-3 bg-[#111111] px-4 py-1.5 text-white xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
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
                "inline-flex h-8 items-center rounded-[3px] border px-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
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

      <div className="flex border-b border-[#d9cdc2] bg-white 2xl:items-stretch">
        <div className="flex min-w-0 flex-1 items-center px-5 py-3 2xl:py-0">
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
                "flex min-h-[58px] min-w-[200px] flex-1 items-center justify-between px-4 text-[#221a14] transition 2xl:min-w-[210px] 2xl:flex-none",
                pathname.startsWith("/projects")
                  ? "bg-[#f8f1ea]"
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
                "flex min-h-[58px] min-w-[174px] flex-1 items-center justify-between border-l border-[#ebe0d6] px-4 text-left transition 2xl:min-w-[184px] 2xl:flex-none",
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
                idBase="top-nav-universal-create-menu"
                buttonLabel="Quick create"
                buttonClassName="inline-flex h-10 items-center rounded-[3px] border border-[#ef7d32] bg-[#ef7d32] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#de6c22]"
              />
              <ContractorNotificationsCenter notifications={notifications} />
            </div>

            <div className="relative border-l border-[#ebe0d6] pl-3">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen((open) => !open);
                  setMenuOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls={accountMenuId}
                className={[
                  "flex items-center gap-3 rounded-[4px] border px-2 py-1.5 text-left transition",
                  accountMenuOpen
                    ? "border-[#ef7d32] bg-[#fff7f0]"
                    : "border-transparent hover:border-[#edd9c7] hover:bg-[#fffaf5]"
                ].join(" ")}
              >
                <span className="min-w-0 text-right">
                  <span className="block max-w-[230px] truncate text-[13px] font-semibold text-[#221a14]">
                    {userEmail}
                  </span>
                  <span className="mt-1 block text-[11px] text-[#9a8b80]">{timestampLabel}</span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-[#111111] text-[15px] font-semibold text-white">
                  {organizationStatus.charAt(0).toUpperCase()}
                </span>
                <Chevron open={accountMenuOpen} />
              </button>

              {accountMenuOpen ? (
                <div
                  id={accountMenuId}
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[280px] border border-[#d9cdc2] bg-white p-2 text-[#221a14] shadow-[0_24px_70px_-36px_rgba(34,26,20,0.55)]"
                >
                  <div className="border-b border-[#eee2d7] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-[#221a14]">{userEmail}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#7a6656]">
                      {organizationName} - {organizationStatus}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/settings/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-[4px] px-3 py-2 text-sm font-medium text-[#3d342d] transition hover:bg-[#fff7f0] hover:text-[#221a14]"
                    >
                      Profile / Account settings
                    </Link>
                    <Link
                      href="/settings/organization"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-[4px] px-3 py-2 text-sm font-medium text-[#3d342d] transition hover:bg-[#fff7f0] hover:text-[#221a14]"
                    >
                      Organization settings
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-[4px] px-3 py-2 text-sm font-medium text-[#3d342d] transition hover:bg-[#fff7f0] hover:text-[#221a14]"
                    >
                      Settings home
                    </Link>
                  </div>

                  <form action={signOutAction} className="border-t border-[#eee2d7] pt-2">
                    <button
                      type="submit"
                      className="block w-full rounded-[4px] px-3 py-2 text-left text-sm font-semibold text-[#8b3f16] transition hover:bg-[#fff1e7] hover:text-[#5c260b]"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : null}
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
            ? "max-h-[min(620px,calc(100vh-7rem))] overflow-y-auto opacity-100"
            : "pointer-events-none max-h-0 -translate-y-3 opacity-0"
        ].join(" ")}
      >
        <div
          className={[
            "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menuOpen ? "translate-y-0" : "-translate-y-2"
          ].join(" ")}
        >
          <div className="border-b border-[#eee2d7] bg-[#fbf7f2] px-5 py-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-[#221a14]">
                  {activeItem ? activeItem.label : "Open a module"}
                </h3>
              </div>
              <div className="border border-[#e6d9cc] bg-white px-3 py-2 text-right">
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
                    "border-b border-[#eee2d7] px-4 py-4 transition-colors xl:min-h-[248px] xl:border-b-0",
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
                        "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                        isSectionActive
                          ? "bg-[#111111] text-[#ffd7bb]"
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
                            "group block border px-3 py-2.5 transition",
                            isActive
                              ? "border-[#ef7d32] bg-[#fbf1e6]"
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
                            </div>
                            {item.status === "foundation" ? (
                              <span className="shrink-0 px-2 py-1 text-[10px] font-medium text-[#9a8c80]">
                                Soon
                              </span>
                            ) : null}
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
