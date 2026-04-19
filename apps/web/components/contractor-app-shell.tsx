import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Home,
  Star,
  FolderKanban,
  Clock,
  BookUser,
  MessageCircle,
  Settings,
  Search
} from "lucide-react";

import type { ActiveOrganizationContext } from "@/lib/organizations/active-context";
import { AppShellMobileNav } from "@/components/app-shell-mobile-nav";
import { SignOutForm } from "@/components/sign-out-form";

type ContractorAppShellProps = {
  children: ReactNode;
  user: User;
  organizationContext: ActiveOrganizationContext | null;
};

export function ContractorAppShell({
  children,
  user,
  organizationContext
}: ContractorAppShellProps) {
  const organizationName =
    organizationContext?.organization.displayName ?? "Your Company";

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Primary Header - Dark Blue */}
      <header className="bg-[#1e3a5f] text-white">
        <div className="flex h-12 items-center justify-between px-4">
          {/* Left: Logo & Project Selector */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-white/10">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold">FloorConnector</span>
            </Link>

            <button className="flex items-center gap-2 rounded border border-white/20 bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
              Select a Project
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div className="hidden items-center gap-1 lg:flex">
              <span className="rounded bg-white/10 px-2 py-1 text-xs">MENU</span>
              <span className="text-xs text-white/70">Dashboard</span>
              <svg
                className="h-3 w-3 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Center: Main Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white"
            >
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Projects
            </Link>
            <Link
              href="/time"
              className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white"
            >
              Time Cards
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white"
            >
              Directory
            </Link>
          </nav>

          {/* Right: Support & User */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 text-xs text-white/80 lg:flex">
              <Link href="#" className="hover:text-white">
                Free Online Training
              </Link>
              <Link href="#" className="text-blue-300 hover:text-white">
                Daily Webinars
              </Link>
              <Link href="#" className="text-blue-300 hover:text-white">
                Contractor University
              </Link>
            </div>

            <button className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white">
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden text-right text-xs lg:block">
                <div className="font-medium">{user.email?.split("@")[0] ?? "User"}</div>
                <div className="text-white/60">
                  {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold uppercase">
                {(user.email?.[0] ?? "U")}
              </div>
            </div>

            <div className="lg:hidden">
              <AppShellMobileNav currentRole={organizationContext?.membership.role} />
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Header - White */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="flex h-10 items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900">
              <Home className="h-4 w-4" />
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="font-medium text-neutral-900">Dashboard</span>
          </div>

          <div className="text-sm font-semibold text-[#1e3a5f]">
            {organizationName}
          </div>

          <div className="flex items-center gap-3">
            <button className="text-neutral-500 hover:text-neutral-700">
              <Settings className="h-4 w-4" />
            </button>
            <span className="text-neutral-300">/</span>
            <button className="text-neutral-500 hover:text-neutral-700">
              <MessageCircle className="h-4 w-4" />
            </button>
            <span className="text-neutral-300">/</span>
            <button className="text-neutral-500 hover:text-neutral-700">
              <Search className="h-4 w-4" />
            </button>
            <span className="text-neutral-300">/</span>
            <button className="flex items-center gap-1 rounded border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              <Settings className="h-3 w-3" />
              Customize
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-neutral-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2 rounded border border-neutral-200 bg-neutral-50 px-3 py-1.5">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="flex-1 bg-transparent text-sm text-neutral-600 placeholder:text-neutral-400 focus:outline-none"
          />
          <span className="text-xs text-neutral-400">Ask Clark</span>
        </div>
      </div>

      <main className="p-4">
        {!organizationContext ? (
          <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account is authenticated, but no active organization context is
            available yet. Sign out and sign back in to refresh.
          </section>
        ) : null}

        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white">
        <div className="flex h-10 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <button className="text-neutral-500 hover:text-neutral-700">
              <FolderKanban className="h-5 w-5" />
            </button>
            <button className="text-neutral-500 hover:text-neutral-700">
              <BookUser className="h-5 w-5" />
            </button>
            <button className="text-neutral-500 hover:text-neutral-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button className="text-neutral-500 hover:text-neutral-700">
              <Clock className="h-5 w-5" />
            </button>
            <button className="text-neutral-500 hover:text-neutral-700">
              <Home className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded border border-neutral-200 bg-neutral-50 px-3 py-1">
              <Search className="h-4 w-4 text-neutral-400" />
              <span className="text-xs text-neutral-400">Search here...</span>
            </div>
            <span className="text-xs text-neutral-500">Ask Clark</span>
            <div className="flex items-center gap-2">
              <button className="text-neutral-500 hover:text-neutral-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="text-neutral-500 hover:text-neutral-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="text-neutral-500 hover:text-neutral-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="text-neutral-500 hover:text-neutral-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
