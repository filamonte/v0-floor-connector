"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { MembershipRole } from "@floorconnector/types";

import { ProtectedAppBreadcrumbs } from "@/components/protected-app-breadcrumbs";
import { ContractorNotificationsCenter } from "@/components/contractor-notifications-center";
import {
  FloorConnectorIcon,
  getFloorConnectorIconNameForNavigationKey
} from "@/components/fc-icons";
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
        "inline-flex h-8 w-8 items-center justify-center rounded-[4px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
        active
          ? "border-[var(--copper)] bg-[var(--copper)]/20 text-white"
          : "border-white/14 bg-white/8 text-[var(--cream)] hover:border-[var(--copper)] hover:bg-white/12 hover:text-white"
      ].join(" ")}
      style={utilityIconFrameStyle}
    >
      {children}
    </Link>
  );
}

type ProtectedAppTopNavProps = {
  currentRole?: MembershipRole;
  notifications: ContractorNotificationsSummary;
  organizationName: string;
  organizationLogoUrl?: string | null;
  organizationBrandAccentColor?: string | null;
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
          menuSections
            .flatMap((section) => section.items)
            .find((item) => item.href === href)
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
    <div ref={shellRef} className="relative bg-[var(--graphite)] text-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
        <div className="min-w-[220px] flex-1 text-[12px] font-medium text-[var(--cream)]">
          <ProtectedAppBreadcrumbs
            organizationName={organizationName}
            variant="dark"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isItemActive(item) ? "page" : undefined}
              className={[
                "inline-flex h-8 items-center rounded-[3px] border px-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
                isItemActive(item)
                  ? "border-[var(--copper)] bg-[var(--copper)]/20 text-white"
                  : "border-white/14 bg-white/8 text-[var(--cream)] hover:border-[var(--copper)] hover:bg-white/12 hover:text-white"
              ].join(" ")}
            >
              <FloorConnectorIcon
                name={getFloorConnectorIconNameForNavigationKey(item.key)}
                className="mr-2 h-3.5 w-3.5"
              />
              {item.label}
            </Link>
          ))}
          <UtilityIconFrame
            href={homeHref}
            label="Open dashboard home"
            active={pathname === homeHref}
          >
            <FloorConnectorIcon name="dashboard" className="h-4 w-4" />
          </UtilityIconFrame>
          <UtilityIconFrame
            href="/settings"
            label="Open settings"
            active={
              pathname === "/settings" || pathname.startsWith("/settings/")
            }
          >
            <FloorConnectorIcon name="settings" className="h-4 w-4" />
          </UtilityIconFrame>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <Link
          href={projectLauncherHref}
          aria-current={pathname.startsWith("/projects") ? "page" : undefined}
          className={[
            "inline-flex h-10 min-w-[190px] items-center justify-between rounded-[3px] border px-3 text-left text-[var(--cream)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
            pathname.startsWith("/projects")
              ? "border-[var(--copper)] bg-[var(--copper)]/20 text-white"
              : "border-white/14 bg-white/8 hover:border-[var(--copper)] hover:bg-white/12 hover:text-white"
          ].join(" ")}
        >
          <span className="min-w-0">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--copper-light)]">
              Project
            </span>
            <span className="mt-0.5 block truncate text-[12px] font-semibold">
              {projectLauncherHref === "/projects"
                ? "Open project queue"
                : "Recent project"}
            </span>
          </span>
          <Chevron open={false} />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className={[
            "inline-flex h-10 min-w-[180px] items-center justify-between rounded-[3px] border px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
            menuOpen
              ? "border-[var(--copper)] bg-[var(--copper)]/20 text-white"
              : "border-white/14 bg-white/8 text-[var(--cream)] hover:border-[var(--copper)] hover:bg-white/12 hover:text-white"
          ].join(" ")}
        >
          <span className="min-w-0">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--copper-light)]">
              Menu
            </span>
            <span className="mt-0.5 block truncate text-[12px] font-semibold">
              {activeItem?.label ?? "Dashboard"}
            </span>
          </span>
          <Chevron open={menuOpen} />
        </button>

        <UniversalCreateMenu
          idBase="top-nav-universal-create-menu"
          buttonLabel="Quick create"
          buttonClassName="inline-flex h-10 items-center rounded-[3px] border border-[var(--copper)] bg-[var(--copper)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--copper-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]"
          panelClassName="mt-3"
        />
        <ContractorNotificationsCenter notifications={notifications} />

        <div className="relative ml-auto">
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
              "flex h-10 items-center gap-3 rounded-[4px] border px-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
              accountMenuOpen
                ? "border-[var(--copper)] bg-white/12"
                : "border-white/14 bg-white/8 hover:border-[var(--copper)] hover:bg-white/12"
            ].join(" ")}
          >
            <span className="min-w-0 text-right">
              <span className="block max-w-[230px] truncate text-[13px] font-semibold text-white">
                {userEmail}
              </span>
              <span className="mt-0.5 block text-[11px] text-white/55">
                {timestampLabel}
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-white/12 text-[13px] font-semibold text-white">
              {organizationStatus.charAt(0).toUpperCase()}
            </span>
            <Chevron open={accountMenuOpen} />
          </button>

          {accountMenuOpen ? (
            <div
              id={accountMenuId}
              className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[280px] border border-[var(--border-warm)] bg-white p-2 text-[var(--text-primary)] shadow-[0_24px_70px_-36px_rgba(34,26,20,0.55)]"
            >
              <div className="border-b border-[var(--border-warm)] px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {userEmail}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">
                  {organizationName} - {organizationStatus}
                </p>
              </div>

              <div className="py-2">
                <Link
                  href="/settings/profile"
                  onClick={() => setAccountMenuOpen(false)}
                  className="block rounded-[4px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--copper)]"
                >
                  Profile / Account settings
                </Link>
                <Link
                  href="/settings/organization"
                  onClick={() => setAccountMenuOpen(false)}
                  className="block rounded-[4px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--copper)]"
                >
                  Organization settings
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setAccountMenuOpen(false)}
                  className="block rounded-[4px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--copper)]"
                >
                  Settings home
                </Link>
              </div>

              <form
                action={signOutAction}
                className="border-t border-[var(--border-warm)] pt-2"
              >
                <button
                  type="submit"
                  className="block w-full rounded-[4px] px-3 py-2 text-left text-sm font-semibold text-[var(--copper)] transition hover:bg-[var(--highlight)] hover:text-[var(--copper-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--copper)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      <div
        id={menuId}
        aria-hidden={!menuOpen}
        className={[
          "overflow-hidden border-t border-[var(--border-warm)] bg-white text-[var(--text-primary)] shadow-[0_30px_60px_-40px_rgba(34,26,20,0.28)] transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
          <div className="border-b border-[var(--border-warm)] bg-[var(--cream)] px-5 py-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {activeItem ? activeItem.label : "Open a module"}
                </h3>
              </div>
              <div className="border border-[var(--border-warm)] bg-white px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
                  Current section
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
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
                    "border-b border-[var(--border-warm)] px-4 py-4 transition-colors xl:min-h-[248px] xl:border-b-0",
                    index < menuSections.length - 1
                      ? "xl:border-r xl:border-[var(--border-warm)]"
                      : "",
                    isSectionActive ? "bg-[var(--highlight)]" : "bg-white"
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
                        {section.label}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                        {section.description}
                      </p>
                    </div>
                    <span
                      className={[
                        "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                        isSectionActive
                          ? "bg-[var(--graphite)] text-[var(--cream)]"
                          : "bg-[var(--cream)] text-[var(--copper)]"
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
                            "group block border px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--copper)]",
                            isActive
                              ? "border-[var(--copper)] bg-[var(--cream)]"
                              : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-warm)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-2">
                              <span
                                aria-hidden="true"
                                className={[
                                  "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border",
                                  isActive
                                    ? "border-[var(--copper)] bg-white text-[var(--copper)]"
                                    : "border-[var(--border-warm)] bg-white text-[var(--text-tertiary)] group-hover:text-[var(--copper)]"
                                ].join(" ")}
                              >
                                <FloorConnectorIcon
                                  name={getFloorConnectorIconNameForNavigationKey(
                                    item.key
                                  )}
                                  className="h-3.5 w-3.5"
                                />
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={[
                                    "text-[13px] font-semibold",
                                    isActive ? "text-[var(--text-primary)]" : ""
                                  ].join(" ")}
                                >
                                  {item.label}
                                </p>
                              </div>
                            </div>
                            {item.status === "foundation" ? (
                              <span className="shrink-0 px-2 py-1 text-[10px] font-medium text-[var(--text-tertiary)]">
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
