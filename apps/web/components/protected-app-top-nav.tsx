"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  ClipboardList,
  FileText,
  Briefcase,
  Clock,
  Users,
  Settings,
  DollarSign,
  FileCheck,
  Receipt,
  CreditCard,
  Building,
  HardHat,
  Package,
  FolderOpen,
  FileImage,
  BarChart3,
  CheckSquare,
  AlertCircle,
  Car,
  Wrench,
  StickyNote,
  Mail,
  Pencil,
  Lightbulb,
  Bug,
  HelpCircle,
  Gift,
  ChevronDown,
  Star,
  MessageSquare
} from "lucide-react";

import type { MembershipRole } from "@floorconnector/types";

import { OrganizationBrandLink } from "@/components/organization-brand-link";
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

type MenuColumn = {
  title: string;
  items: Array<{ label: string; href: string; icon?: ReactNode; starred?: boolean }>;
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
        { label: "Projects", href: "/projects", icon: <Home className="h-4 w-4" />, starred: true },
        { label: "Daily Logs", href: "/daily-logs", icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Schedule", href: "/schedule", icon: <Calendar className="h-4 w-4" /> },
        { label: "To-Do's", href: "/jobs", icon: <CheckSquare className="h-4 w-4" /> },
        { label: "Work Orders", href: "/jobs", icon: <Briefcase className="h-4 w-4" /> },
        { label: "Inspections", href: "/projects", icon: <FileCheck className="h-4 w-4" /> },
        { label: "Punchlists", href: "/punchlists", icon: <CheckSquare className="h-4 w-4" /> },
        { label: "Service Tickets", href: "/jobs", icon: <Wrench className="h-4 w-4" /> },
        { label: "Permits", href: "/projects", icon: <FileText className="h-4 w-4" /> },
      ]
    },
    {
      title: "Financials",
      items: [
        { label: "Estimates", href: "/estimates", icon: <FileText className="h-4 w-4" /> },
        { label: "Bid Manager", href: "/estimates", icon: <Briefcase className="h-4 w-4" /> },
        { label: "Change Orders", href: "/change-orders", icon: <FileText className="h-4 w-4" /> },
        { label: "Invoices", href: "/invoices", icon: <Receipt className="h-4 w-4" /> },
        { label: "Payments", href: "/payments", icon: <CreditCard className="h-4 w-4" /> },
        { label: "Expenses", href: "/payments", icon: <DollarSign className="h-4 w-4" /> },
        { label: "Purchase Orders", href: "/vendors", icon: <Package className="h-4 w-4" /> },
        { label: "Sub-Contracts", href: "/contracts", icon: <FileCheck className="h-4 w-4" /> },
        { label: "Bills", href: "/invoices", icon: <Receipt className="h-4 w-4" /> },
        { label: "Transaction Log", href: "/payments", icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Takeoffs (Preview)", href: "/estimates", icon: <Pencil className="h-4 w-4" /> },
      ]
    },
    {
      title: "People",
      items: [
        { label: "Directory", href: "/people", icon: <Users className="h-4 w-4" />, starred: true },
        { label: "Opportunities", href: "/leads", icon: <Lightbulb className="h-4 w-4" /> },
        { label: "Time Cards", href: "/time", icon: <Clock className="h-4 w-4" />, starred: true },
        { label: "Calendar", href: "/schedule", icon: <Calendar className="h-4 w-4" /> },
        { label: "Crew Schedule", href: "/schedule", icon: <Users className="h-4 w-4" /> },
        { label: "Incidents", href: "/people", icon: <AlertCircle className="h-4 w-4" /> },
        { label: "Safety Meetings", href: "/people", icon: <HardHat className="h-4 w-4" /> },
      ]
    },
    {
      title: "Documents",
      items: [
        { label: "Files & Photos", href: "/projects", icon: <FileImage className="h-4 w-4" /> },
        { label: "Reports", href: "/projects", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Forms & Checklists", href: "/projects", icon: <CheckSquare className="h-4 w-4" /> },
        { label: "RFI & Notices", href: "/projects", icon: <FileText className="h-4 w-4" /> },
        { label: "Submittals", href: "/projects", icon: <FolderOpen className="h-4 w-4" /> },
        { label: "Vehicle Logs", href: "/projects", icon: <Car className="h-4 w-4" /> },
        { label: "Equipment Logs", href: "/projects", icon: <Wrench className="h-4 w-4" /> },
        { label: "Notes", href: "/projects", icon: <StickyNote className="h-4 w-4" /> },
        { label: "Send Email", href: "/projects", icon: <Mail className="h-4 w-4" /> },
        { label: "Document Writer", href: "/projects", icon: <Pencil className="h-4 w-4" /> },
      ]
    },
    {
      title: "Settings & Support",
      items: [
        { label: "Enable/Disable Features", href: "/settings/modules", icon: <Settings className="h-4 w-4" /> },
        { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
        { label: "Cost Items Database", href: "/cost-items-database", icon: <Package className="h-4 w-4" /> },
        { label: "Trainings", href: "/settings", icon: <HardHat className="h-4 w-4" /> },
        { label: "Support", href: "/settings", icon: <HelpCircle className="h-4 w-4" /> },
      ]
    }
  ];
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

  return (
    <div className="bg-white">
      {/* CF-style dark navy header bar */}
      <div className="flex items-center justify-between bg-[#28456f] px-3 py-1.5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <OrganizationBrandLink
            href={homeHref}
            organizationName={organizationName}
            logoUrl={organizationLogoUrl}
            navigationLabel="Dashboard home"
            className="max-w-[180px]"
            variant="light"
          />
          
          {/* Project Selector */}
          <button
            type="button"
            className="flex items-center gap-2 rounded border border-white/20 bg-white/10 px-3 py-1.5 text-[13px] text-white hover:bg-white/20"
          >
            <span>Select a Project</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={[
                "flex items-center gap-2 rounded border px-3 py-1.5 text-[13px]",
                menuOpen
                  ? "border-[#f97316] bg-[#f97316] text-white"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              ].join(" ")}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">MENU</span>
              <span className="font-medium">{activeItem?.label ?? "Dashboard"}</span>
              <ChevronDown className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-1">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-white hover:text-[#f97316]"
          >
            <Star className="h-3.5 w-3.5 fill-[#f97316] text-[#f97316]" />
            <span>Projects</span>
          </Link>
          <Link
            href="/time"
            className="px-3 py-1.5 text-[13px] text-white hover:text-[#f97316]"
          >
            Time Cards
          </Link>
          <Link
            href="/people"
            className="px-3 py-1.5 text-[13px] text-white hover:text-[#f97316]"
          >
            Directory
          </Link>
        </div>

        {/* Right Side - Training, Live Chat, User */}
        <div className="flex items-center gap-4">
          <div className="text-right text-[11px] text-white/80">
            <div className="text-[#4db8ff] hover:underline cursor-pointer">Free Online Training</div>
            <div className="text-[#4db8ff] hover:underline cursor-pointer">Daily Webinars</div>
            <div className="text-[#4db8ff] hover:underline cursor-pointer">Contractor University</div>
          </div>
          
          <button className="flex items-center gap-1.5 text-white hover:text-[#f97316]">
            <MessageSquare className="h-5 w-5" />
            <span className="text-[12px]">Live Chat</span>
          </button>

          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <div className="text-right">
              <div className="text-[13px] font-medium text-white">{userEmail.split('@')[0]}</div>
              <div className="text-[11px] text-white/60">{timestampLabel}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#1a365d] text-[14px] font-bold text-white">
              {userEmail.charAt(0).toUpperCase()}{userEmail.split('@')[0].slice(-1).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary breadcrumb bar - CF style */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f8fafc] px-3 py-1.5">
        <div className="flex items-center gap-2 text-[13px]">
          <Link href="/dashboard" className="flex items-center gap-1 text-[#28456f] hover:text-[#f97316]">
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="font-medium text-[#28456f]">{activeItem?.label ?? "Dashboard"}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#28456f]">
          {organizationName}
        </div>
        <div className="flex items-center gap-2">
          <ContractorNotificationsCenter notifications={notifications} />
        </div>
      </div>

      {/* Mega Menu - CF style */}
      {menuOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-[#e5e7eb] bg-white shadow-lg">
          <div className="mx-auto max-w-[1400px] px-4">
            <div className="grid grid-cols-5 gap-0 divide-x divide-[#e5e7eb] py-4">
              {menuColumns.map((column) => (
                <div key={column.title} className="px-4">
                  <h3 className="mb-3 text-[13px] font-semibold text-[#1f2937]">
                    {column.title}
                  </h3>
                  <div className="space-y-0.5">
                    {column.items.map((item, idx) => {
                      const isActive = isActivePath(pathname, item.href);

                      return (
                        <Link
                          key={`${item.href}-${idx}`}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={[
                            "flex items-center gap-2 rounded px-2 py-1.5 text-[13px]",
                            isActive
                              ? "bg-[#f97316]/10 font-medium text-[#f97316]"
                              : "text-[#374151] hover:bg-[#f3f4f6] hover:text-[#28456f]"
                          ].join(" ")}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          {item.starred && (
                            <Star className="ml-auto h-3 w-3 fill-[#f97316] text-[#f97316]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions - CF style */}
            <div className="grid grid-cols-4 gap-0 border-t border-[#e5e7eb] bg-[#fafafa]">
              <Link
                href="/referral"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 border-r border-[#e5e7eb] px-4 py-3 text-[13px] font-medium text-[#28456f] hover:bg-[#f3f4f6] hover:text-[#f97316]"
              >
                <Gift className="h-4 w-4 text-[#f97316]" />
                Refer Us (Earn $$$)
              </Link>
              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 border-r border-[#e5e7eb] px-4 py-3 text-[13px] font-medium text-[#28456f] hover:bg-[#f3f4f6] hover:text-[#f97316]"
              >
                <Bug className="h-4 w-4 text-[#ef4444]" />
                Submit an Issue
              </Link>
              <Link
                href="/whats-new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 border-r border-[#e5e7eb] px-4 py-3 text-[13px] font-medium text-[#28456f] hover:bg-[#f3f4f6] hover:text-[#f97316]"
              >
                <HelpCircle className="h-4 w-4 text-[#8b5cf6]" />
                {"What's New"}
              </Link>
              <Link
                href="/suggestion"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-[#28456f] hover:bg-[#f3f4f6] hover:text-[#f97316]"
              >
                <Lightbulb className="h-4 w-4 text-[#f59e0b]" />
                Make a Suggestion
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
