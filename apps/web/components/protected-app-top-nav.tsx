"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { MembershipRole } from "@floorconnector/types";

import { ContractorNotificationsCenter } from "@/components/contractor-notifications-center";
import {
  FloorConnectorIcon,
  getFloorConnectorIconNameForNavigationKey
} from "@/components/fc-icons";
import { GlobalSearch } from "@/components/global-search";
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
          ? "border-[var(--copper)] bg-[var(--copper)] text-white"
          : "border-white/15 bg-white/[0.06] text-zinc-200 hover:border-[var(--copper)] hover:bg-white/10 hover:text-white"
      ].join(" ")}
      style={utilityIconFrameStyle}
    >
      {children}
    </Link>
  );
}

function HomeSlashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="14"
      height="14"
      className="h-3.5 w-3.5"
      style={{ width: "14px", height: "14px", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 7-6 7 6" />
      <path d="M5.5 8.5V17h9V8.5" />
      <path d="M8 17v-5h4v5" />
    </svg>
  );
}

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "FC"
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
  organizationLogoUrl,
  organizationBrandAccentColor,
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
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const menuId = "protected-app-top-nav-menu";
  const accountMenuId = "protected-app-account-menu";
  const projectMenuId = "protected-app-project-menu";
  const organizationInitials = getInitials(organizationName);
  const userInitials = getInitials(userEmail.split("@")[0] ?? userEmail);
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
  const projectCommandLinks = useMemo(
    () => [
      {
        href: projectLauncherHref,
        label:
          projectLauncherHref === "/projects"
            ? "Project command center"
            : "Recent Project Workspace",
        description:
          projectLauncherHref === "/projects"
            ? "Review all active projects and lifecycle queues."
            : "Return to the last Project Workspace opened in this session."
      },
      {
        href: "/projects?status=approved",
        label: "Approved projects",
        description: "Review commercial handoffs moving toward operations."
      },
      {
        href: "/schedule",
        label: "CrewBoard / schedule",
        description: "Continue timing, crew, and field handoff review."
      },
      {
        href: "/leads",
        label: "Sales opportunities",
        description: "Open upstream Lead Intake and Opportunity Workspace."
      }
    ],
    [projectLauncherHref]
  );

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setProjectMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !accountMenuOpen && !projectMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setAccountMenuOpen(false);
        setProjectMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountMenuOpen(false);
        setProjectMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen, menuOpen, projectMenuOpen]);

  return (
    <div
      ref={shellRef}
      className="relative bg-[linear-gradient(180deg,#18181b_0%,#202024_100%)] text-white shadow-none"
    >
      <div className="mx-auto flex min-h-14 w-full max-w-[1680px] items-center justify-between gap-4 border-b border-white/10 px-4 py-2 sm:px-5">
        <Link
          href={homeHref}
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite-dark)]"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-[var(--copper)] bg-[var(--copper)] text-sm font-extrabold text-white shadow-none"
            style={
              organizationBrandAccentColor
                ? {
                    backgroundColor: organizationBrandAccentColor,
                    borderColor: organizationBrandAccentColor
                  }
                : undefined
            }
          >
            {organizationLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organizationLogoUrl}
                alt={`${organizationName} logo`}
                className="h-full w-full object-contain"
              />
            ) : (
              organizationInitials
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-tight tracking-tight text-white">
              FloorConnector
            </span>
            <span className="block truncate text-[10px] leading-tight text-white/50">
              Specialty Flooring Systems
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <p className="truncate text-sm font-semibold tracking-wide text-white/70">
            {organizationName}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden flex-col items-end leading-tight xl:flex">
            <Link
              href="/trainings"
              className="text-[11px] font-medium text-blue-200 hover:underline"
            >
              Free Online Training
            </Link>
            <span className="mt-0.5 text-[10px] text-white/50">
              {timestampLabel}
            </span>
          </div>
          <div className="hidden h-8 w-px bg-white/10 xl:block" />
          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen((open) => !open);
              setMenuOpen(false);
              setProjectMenuOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            aria-controls={accountMenuId}
            className="flex min-w-0 items-center gap-3 rounded-[5px] border border-transparent px-1 py-1 text-left transition hover:border-white/12 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite-dark)]"
          >
            <span className="hidden min-w-0 text-right leading-tight sm:block">
              <span className="block max-w-[230px] truncate text-sm font-semibold text-white">
                {userEmail}
              </span>
              <span className="block text-[10px] text-white/50">
                {organizationStatus}
              </span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[var(--copper)] text-sm font-bold text-white shadow-none">
              {userInitials}
            </span>
            <Chevron open={accountMenuOpen} />
          </button>

          {accountMenuOpen ? (
            <div
              id={accountMenuId}
              className="absolute right-4 top-[3.75rem] z-40 w-[280px] border border-[var(--border-warm)] bg-white p-2 text-[var(--text-primary)] shadow-[0_24px_70px_-36px_rgba(34,26,20,0.55)]"
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

      <div className="mx-auto flex min-h-10 w-full max-w-[1680px] flex-wrap items-center gap-3 border-b border-white/10 px-4 py-1.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 pr-1 text-zinc-200 sm:pr-3">
          <Link
            href={homeHref}
            aria-label="Dashboard home"
            className="text-white/45 transition hover:text-white/75"
          >
            <HomeSlashIcon />
          </Link>
          <span className="text-white/25">/</span>
          <span className="truncate text-sm font-semibold text-white">
            {activeItem?.label ?? "Dashboard"}
          </span>
        </div>

        <div className="hidden h-5 w-px bg-white/10 sm:block" />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProjectMenuOpen((open) => !open);
              setMenuOpen(false);
              setAccountMenuOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={projectMenuOpen}
            aria-controls={projectMenuId}
            aria-current={pathname.startsWith("/projects") ? "page" : undefined}
            className={[
              "inline-flex h-8 min-w-[190px] items-center justify-between gap-2 rounded-[4px] border px-2.5 text-left text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
              pathname.startsWith("/projects") || projectMenuOpen
                ? "border-[#005eb8] bg-[#005eb8] text-white"
                : "border-white/15 bg-white/[0.06] hover:border-[#005eb8] hover:bg-white/10 hover:text-white"
            ].join(" ")}
          >
            <FloorConnectorIcon
              name="projects"
              className="h-3.5 w-3.5 text-white/70"
            />
            <span className="min-w-0 truncate text-xs font-semibold">
              {projectLauncherHref === "/projects"
                ? "Projects command"
                : "Recent project"}
            </span>
            <Chevron open={projectMenuOpen} />
          </button>

          {projectMenuOpen ? (
            <div
              id={projectMenuId}
              role="menu"
              className="absolute left-0 top-10 z-50 w-[340px] max-w-[calc(100vw-2rem)] border border-[#cfd6df] bg-white p-2 text-[#0f172a] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.55)]"
            >
              <div className="border-b border-[#e5e7eb] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005eb8]">
                  Project command
                </p>
                <p className="mt-1 text-sm leading-5 text-[#475569]">
                  Existing routes only. Project work still happens in the owning
                  workspace.
                </p>
              </div>
              <div className="py-2">
                {projectCommandLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setProjectMenuOpen(false)}
                    className="block rounded-[4px] border border-transparent px-3 py-2.5 transition hover:border-[#c7d2e2] hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#005eb8]"
                  >
                    <span className="block text-sm font-semibold text-[#0f172a]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#475569]">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-[#e5e7eb] px-3 py-2">
                <Link
                  href="/projects?compose=1"
                  role="menuitem"
                  onClick={() => setProjectMenuOpen(false)}
                  className="inline-flex min-h-8 w-full items-center justify-center rounded-[4px] border border-[#005eb8] bg-[#005eb8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#003d7c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8]"
                >
                  New project
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            setMenuOpen((open) => !open);
            setProjectMenuOpen(false);
            setAccountMenuOpen(false);
          }}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className={[
            "inline-flex h-8 items-center justify-between gap-2 rounded-[4px] border px-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
            menuOpen
              ? "border-[var(--copper)] bg-[var(--copper)] text-white"
              : "border-white/15 bg-white/[0.06] text-zinc-200 hover:border-[var(--copper)] hover:bg-white/10 hover:text-white"
          ].join(" ")}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
            Menu
          </span>
          <Chevron open={menuOpen} />
        </button>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden sm:block">
            <GlobalSearch
              compact
              buttonLabel="Search"
              buttonClassName="inline-flex h-8 min-w-[170px] max-w-full items-center justify-between rounded-[4px] border border-white/15 bg-white/[0.06] px-2.5 text-xs font-medium text-zinc-200 transition hover:border-[var(--copper)] hover:bg-white/10 hover:text-white"
            />
          </div>
          <UniversalCreateMenu
            idBase="top-nav-universal-create-menu"
            buttonLabel="Create"
            buttonClassName="inline-flex h-8 items-center rounded-[4px] border border-[var(--copper)] bg-[var(--copper)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--copper-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]"
            panelClassName="mt-2"
          />
          <ContractorNotificationsCenter
            notifications={notifications}
            compact
          />
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

      <div className="mx-auto flex h-8 w-full max-w-[1680px] items-center gap-1 overflow-x-auto border-b border-white/10 bg-[#242428] px-4 sm:px-5">
        <span className="mr-2 select-none text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Pinned
        </span>
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isItemActive(item) ? "page" : undefined}
            className={[
              "inline-flex h-7 items-center rounded-[3px] px-2.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)]",
              isItemActive(item)
                ? "bg-[var(--copper)] text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            ].join(" ")}
          >
            <FloorConnectorIcon
              name={getFloorConnectorIconNameForNavigationKey(item.key)}
              className="mr-1.5 h-3 w-3 text-blue-200"
            />
            {item.label}
          </Link>
        ))}
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
                        "rounded-[3px] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
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
