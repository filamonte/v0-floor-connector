"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  Camera,
  ChevronDown,
  ClipboardList,
  DollarSign,
  FileText,
  FolderOpen,
  HardHat,
  Home,
  Lightbulb,
  MessageCircle,
  Settings,
  Star,
  Users,
  Video
} from "lucide-react";

import type { MembershipRole } from "@floorconnector/types";

type CFContractorHeaderProps = {
  organizationName: string;
  organizationLogoUrl?: string | null;
  userDisplayName: string;
  userId: string;
  timestampLabel: string;
  homeHref: string;
  currentRole?: MembershipRole;
};

type MenuColumn = {
  title: string;
  items: Array<{ label: string; href: string; starred?: boolean }>;
};

const MENU_COLUMNS: MenuColumn[] = [
  {
    title: "Project Management",
    items: [
      { label: "Projects", href: "/projects", starred: true },
      { label: "Daily Logs", href: "/daily-logs" },
      { label: "Schedule", href: "/schedule" },
      { label: "To-Do's", href: "/jobs" },
      { label: "Work Orders", href: "/jobs" },
      { label: "Inspections", href: "/punchlists" },
      { label: "Punchlists", href: "/punchlists" },
      { label: "Service Tickets", href: "/jobs" },
      { label: "Permits", href: "/projects" }
    ]
  },
  {
    title: "Financials",
    items: [
      { label: "Estimates", href: "/estimates" },
      { label: "Bid Manager", href: "/estimates" },
      { label: "Change Orders", href: "/change-orders" },
      { label: "Invoices", href: "/invoices" },
      { label: "Payments", href: "/payments" },
      { label: "Expenses", href: "/payments" },
      { label: "Purchase Orders", href: "/vendors" },
      { label: "Sub-Contracts", href: "/contracts" },
      { label: "Bills", href: "/invoices" },
      { label: "Transaction Log", href: "/payments" },
      { label: "Takeoffs (Preview)", href: "/estimates" }
    ]
  },
  {
    title: "People",
    items: [
      { label: "Directory", href: "/people", starred: true },
      { label: "Opportunities", href: "/leads" },
      { label: "Time Cards", href: "/time", starred: true },
      { label: "Leads", href: "/leads" },
      { label: "Calendar", href: "/schedule" },
      { label: "Crew Schedule", href: "/schedule" },
      { label: "Incidents", href: "/daily-logs" },
      { label: "Safety Meetings", href: "/daily-logs" }
    ]
  },
  {
    title: "Documents",
    items: [
      { label: "Files & Photos", href: "/materials" },
      { label: "Reports", href: "/projects" },
      { label: "Forms & Checklists", href: "/punchlists" },
      { label: "RFI & Notices", href: "/projects" },
      { label: "Submittals", href: "/projects" },
      { label: "Vehicle Logs", href: "/daily-logs" },
      { label: "Equipment Logs", href: "/materials" },
      { label: "Notes", href: "/projects" },
      { label: "Send Email", href: "/people" },
      { label: "Document Writer", href: "/contracts" }
    ]
  },
  {
    title: "Settings & Support",
    items: [
      { label: "Enable/Disable Features", href: "/settings/modules" },
      { label: "Settings", href: "/settings" },
      { label: "Cost Items Database", href: "/settings/catalogs" },
      { label: "Trainings", href: "/settings" },
      { label: "Support", href: "/settings" }
    ]
  }
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CFContractorHeader({
  organizationName,
  organizationLogoUrl,
  userDisplayName,
  userId,
  timestampLabel,
  homeHref,
  currentRole
}: CFContractorHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItem = useMemo(() => {
    for (const column of MENU_COLUMNS) {
      for (const item of column.items) {
        if (isActivePath(pathname, item.href)) {
          return item;
        }
      }
    }
    return { label: "Dashboard", href: "/dashboard" };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Top bar - dark blue */}
      <div className="flex h-[52px] items-center justify-between bg-[#28456f] px-4">
        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-3">
          {organizationLogoUrl ? (
            <img
              src={organizationLogoUrl}
              alt={organizationName}
              className="h-8 max-w-[160px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#f97316] text-[12px] font-bold text-white">
                {organizationName.charAt(0)}
              </div>
              <span className="text-[14px] font-semibold text-white">{organizationName}</span>
            </div>
          )}
        </Link>

        {/* Center nav items */}
        <div className="flex items-center gap-1">
          {/* Project selector */}
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/90 hover:text-white"
          >
            <span>Select a Project</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Menu dropdown */}
          <div className="relative ml-4 border-l border-white/20 pl-4">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/90 hover:text-white"
            >
              <span className="text-[10px] uppercase tracking-wider text-white/60">Menu</span>
              <span className="font-medium">{activeItem.label}</span>
              <ChevronDown className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Quick links */}
          <div className="ml-4 flex items-center gap-1 border-l border-white/20 pl-4">
            <Link
              href="/projects"
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white/90 hover:text-white"
            >
              <Star className="h-4 w-4 fill-[#f97316] text-[#f97316]" />
              <span>Projects</span>
            </Link>
            <Link
              href="/time"
              className="px-3 py-2 text-[13px] text-white/90 hover:text-white"
            >
              Time Cards
            </Link>
            <Link
              href="/people"
              className="px-3 py-2 text-[13px] text-white/90 hover:text-white"
            >
              Directory
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Training links */}
          <div className="flex items-center gap-3 border-r border-white/20 pr-4 text-[11px] text-white/80">
            <span>Free Online Training</span>
            <Link href="#" className="text-[#60a5fa] underline">Daily Webinars</Link>
            <Link href="#" className="text-[#60a5fa] underline">Contractor University</Link>
          </div>

          {/* Live Chat */}
          <button className="flex items-center gap-2 text-white/90 hover:text-white">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[12px]">Live Chat</span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <div className="text-right">
              <div className="text-[13px] font-medium text-white">{userDisplayName}</div>
              <div className="text-[11px] text-white/60">User ({userId})</div>
              <div className="text-[11px] text-white/60">{timestampLabel}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-[14px] font-semibold text-white">
              {userDisplayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary bar - breadcrumb/location */}
      <div className="flex h-[36px] items-center justify-between border-b border-[#d9cdc2] bg-[#3d5a80] px-4">
        <div className="flex items-center gap-2 text-[12px] text-white/90">
          <Link href={homeHref} className="hover:text-white">
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-white/50">/</span>
          <span>{activeItem.label}</span>
        </div>
        <div className="text-[13px] font-medium text-white">{organizationName}</div>
        <div className="flex items-center gap-2 text-white/70">
          <button className="p-1 hover:text-white"><FileText className="h-4 w-4" /></button>
          <button className="p-1 hover:text-white"><Video className="h-4 w-4" /></button>
          <button className="p-1 hover:text-white"><Lightbulb className="h-4 w-4" /></button>
          <button className="p-1 hover:text-white"><Settings className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Mega menu dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 z-40 border-b border-[#d9cdc2] bg-white shadow-lg">
            <div className="grid grid-cols-5 gap-0">
              {MENU_COLUMNS.map((column) => (
                <div key={column.title} className="border-r border-[#e8e0d8] px-5 py-5 last:border-r-0">
                  <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8a6c52]">
                    {column.title}
                  </h3>
                  <nav className="space-y-1">
                    {column.items.map((item) => {
                      const isActive = isActivePath(pathname, item.href);
                      return (
                        <Link
                          key={`${column.title}-${item.label}`}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 text-[13px] ${
                            isActive
                              ? "bg-[#fff4e8] font-medium text-[#28456f]"
                              : "text-[#3d342d] hover:bg-[#f8f4ef]"
                          }`}
                        >
                          {item.starred && <Star className="h-3.5 w-3.5 fill-[#f97316] text-[#f97316]" />}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="grid grid-cols-4 gap-px border-t border-[#e8e0d8] bg-[#e8e0d8]">
              <button className="flex items-center gap-2 bg-[#f8f4ef] px-5 py-3 text-[13px] font-medium text-[#28456f] hover:bg-white">
                <DollarSign className="h-4 w-4 text-[#f97316]" />
                Refer Us (Earn $$$)
              </button>
              <button className="flex items-center gap-2 bg-[#f8f4ef] px-5 py-3 text-[13px] font-medium text-[#28456f] hover:bg-white">
                <HardHat className="h-4 w-4 text-[#ef4444]" />
                Submit an Issue
              </button>
              <button className="flex items-center gap-2 bg-[#f8f4ef] px-5 py-3 text-[13px] font-medium text-[#28456f] hover:bg-white">
                <Lightbulb className="h-4 w-4 text-[#8b5cf6]" />
                What&apos;s New
              </button>
              <button className="flex items-center gap-2 bg-[#f8f4ef] px-5 py-3 text-[13px] font-medium text-[#28456f] hover:bg-white">
                <Lightbulb className="h-4 w-4 text-[#f97316]" />
                Make a Suggestion
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
