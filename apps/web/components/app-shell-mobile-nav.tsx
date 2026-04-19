"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MembershipRole } from "@floorconnector/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/leads", label: "Leads" },
  { href: "/contracts", label: "Contracts" },
  { href: "/invoices", label: "Invoices" },
  { href: "/time", label: "Time" },
  { href: "/settings", label: "Settings", minRole: "admin" as const }
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppShellMobileNavProps = {
  currentRole?: MembershipRole;
};

export function AppShellMobileNav({ currentRole }: AppShellMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (!("minRole" in item)) return true;
    if (!currentRole) return false;
    if (item.minRole === "admin") {
      return currentRole === "admin" || currentRole === "owner";
    }
    return true;
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50"
        aria-expanded={isOpen}
        aria-controls="mobile-app-navigation"
      >
        {isOpen ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="mobile-app-navigation"
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg"
          >
            {visibleItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    "block px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-neutral-100 font-medium text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
