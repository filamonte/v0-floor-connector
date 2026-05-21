import { compareMembershipRoles } from "@floorconnector/domain";
import type { MembershipRole } from "@floorconnector/types";

export type NavigationSectionId =
  | "project-management"
  | "financials"
  | "people"
  | "documents"
  | "settings";

export type NavigationItemStatus = "live" | "foundation";

export type NavigationItem = {
  key: string;
  label: string;
  href: string;
  description: string;
  minRole: MembershipRole;
  status: NavigationItemStatus;
  matchPaths?: string[];
};

export type NavigationSection = {
  id: NavigationSectionId;
  label: string;
  description: string;
  items: NavigationItem[];
};

export const navigationSections: readonly NavigationSection[] = [
  {
    id: "project-management",
    label: "Project Management",
    description:
      "Run active work, daily execution, and field coordination from one place.",
    items: [
      {
        key: "projects",
        label: "Projects",
        href: "/projects",
        description: "Open the active project workspace and pipeline.",
        minRole: "member",
        status: "live"
      },
      {
        key: "daily-logs",
        label: "Daily Logs",
        href: "/daily-logs",
        description: "Review field logs and day-by-day project activity.",
        minRole: "member",
        status: "live"
      },
      {
        key: "schedule",
        label: "Schedule",
        href: "/schedule",
        description:
          "Check scheduled work, near-term dates, and production flow.",
        minRole: "member",
        status: "live"
      },
      {
        key: "equipment",
        label: "Equipment",
        href: "/equipment",
        description: "Manage owned and rented equipment assets.",
        minRole: "member",
        status: "live"
      },
      {
        key: "to-dos",
        label: "To-Dos",
        href: "/to-dos",
        description: "Track follow-up tasks and next actions across teams.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "work-orders",
        label: "Work Orders",
        href: "/work-orders",
        description:
          "Manage active work orders tied to the job execution chain.",
        minRole: "member",
        status: "live",
        matchPaths: ["/jobs"]
      },
      {
        key: "inspections",
        label: "Inspections",
        href: "/inspections",
        description:
          "Review inspection workflows and project readiness checkpoints.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "punchlists",
        label: "Punchlists",
        href: "/punchlists",
        description:
          "Open corrective and closeout items tied to projects and jobs.",
        minRole: "member",
        status: "live"
      },
      {
        key: "service-tickets",
        label: "Service Tickets",
        href: "/service-tickets",
        description:
          "Track internal service and warranty continuity against customers, projects, and jobs.",
        minRole: "member",
        status: "live"
      },
      {
        key: "permits",
        label: "Permits",
        href: "/permits",
        description:
          "Track permit status, submissions, and required approvals.",
        minRole: "member",
        status: "foundation"
      }
    ]
  },
  {
    id: "financials",
    label: "Financials",
    description:
      "Keep estimates, billing, and cash activity connected to the same project chain.",
    items: [
      {
        key: "financials-home",
        label: "Financials Home",
        href: "/financials",
        description:
          "Open the cross-project financial control panel and section entry point.",
        minRole: "member",
        status: "live"
      },
      {
        key: "estimates",
        label: "Estimates",
        href: "/estimates",
        description: "Open commercial scope, pricing, and proposal work.",
        minRole: "member",
        status: "live"
      },
      {
        key: "cost-items-database",
        label: "Cost Library",
        href: "/cost-items-database",
        description:
          "Manage the shared cost item, system, and inventory workspace.",
        minRole: "member",
        status: "live",
        matchPaths: [
          "/cost-items-database/items",
          "/cost-items-database/inventory",
          "/cost-items-database/systems"
        ]
      },
      {
        key: "change-orders",
        label: "Change Orders",
        href: "/change-orders",
        description: "Review scope changes and downstream billing impact.",
        minRole: "member",
        status: "live"
      },
      {
        key: "invoices",
        label: "Invoices",
        href: "/invoices",
        description: "Manage billing records and payment readiness.",
        minRole: "member",
        status: "live"
      },
      {
        key: "payments",
        label: "Payments",
        href: "/payments",
        description:
          "Review collections, posted payments, and balance activity.",
        minRole: "member",
        status: "live"
      },
      {
        key: "accounts-receivable",
        label: "Accounts Receivable",
        href: "/financials/accounts-receivable",
        description:
          "Define receivable follow-up, collections, and open-balance workflow.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "accounts-payable",
        label: "Accounts Payable",
        href: "/financials/accounts-payable",
        description:
          "Define vendor-bill, payable, and outgoing-payment workflow.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "expenses",
        label: "Expenses",
        href: "/expenses",
        description: "Capture and review job-related expenses.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "purchase-orders",
        label: "Purchase Orders",
        href: "/purchase-orders",
        description: "Track purchasing activity and ordered materials.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "sub-contracts",
        label: "Sub-Contracts",
        href: "/sub-contracts",
        description: "Manage subcontractor agreements and commitments.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "bills",
        label: "Bills",
        href: "/bills",
        description: "Review payable-side billing and vendor obligations.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "transaction-log",
        label: "Transaction Log",
        href: "/transaction-log",
        description:
          "Trace financial activity and audit movement across records.",
        minRole: "member",
        status: "foundation"
      }
    ]
  },
  {
    id: "people",
    label: "People",
    description:
      "Review directory records, workforce continuity, and shared team-facing work.",
    items: [
      {
        key: "directory",
        label: "Directory",
        href: "/directory",
        description:
          "Open the unified read-only directory for customer accounts, workforce records, vendors, and leads.",
        minRole: "member",
        status: "live",
        matchPaths: ["/people"]
      },
      {
        key: "opportunities",
        label: "Opportunities",
        href: "/opportunities",
        description:
          "Run lead and opportunity follow-up before work becomes a project.",
        minRole: "member",
        status: "live",
        matchPaths: ["/leads"]
      },
      {
        key: "time-cards",
        label: "Time Cards",
        href: "/time-cards",
        description:
          "Review workforce time and record canonical punch activity.",
        minRole: "member",
        status: "live",
        matchPaths: ["/time", "/time-cards"]
      },
      {
        key: "calendar",
        label: "Calendar",
        href: "/calendar",
        description:
          "Open customer-facing and internal appointment scheduling.",
        minRole: "member",
        status: "live",
        matchPaths: ["/appointments"]
      },
      {
        key: "crew-schedule",
        label: "Crew Schedule",
        href: "/crew-schedule",
        description: "Review crew-specific scheduling and assignment planning.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "incidents",
        label: "Incidents",
        href: "/incidents",
        description: "Capture incident reports and related follow-up work.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "safety-meetings",
        label: "Safety Meetings",
        href: "/safety-meetings",
        description:
          "Track safety meeting records and compliance follow-through.",
        minRole: "member",
        status: "foundation"
      }
    ]
  },
  {
    id: "documents",
    label: "Documents",
    description:
      "Keep project files, reports, and shared document workflows grouped consistently.",
    items: [
      {
        key: "files",
        label: "Files & Photos",
        href: "/files",
        description: "Open shared files, photos, and execution attachments.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "reports",
        label: "Reports",
        href: "/reports",
        description:
          "Review read-only internal beta summaries over canonical records.",
        minRole: "member",
        status: "live"
      },
      {
        key: "forms-checklists",
        label: "Forms & Checklists",
        href: "/forms-checklists",
        description:
          "Manage structured forms, checklists, and repeatable field records.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "rfi-notices",
        label: "RFI & Notices",
        href: "/rfi-notices",
        description:
          "Handle information requests, notices, and formal communication records.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "submittals",
        label: "Submittals",
        href: "/submittals",
        description:
          "Review submitted documents and downstream approval state.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "equipment-logs",
        label: "Equipment Logs",
        href: "/equipment-logs",
        description: "Track equipment usage, issues, and maintenance notes.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "notes",
        label: "Notes",
        href: "/notes",
        description:
          "Capture general shared notes that support job and project continuity.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "communications",
        label: "Communications",
        href: "/communications",
        description:
          "Review canonical communication threads and unread workflow alerts.",
        minRole: "member",
        status: "live"
      },
      {
        key: "gatekeeper",
        label: "GateKeeper",
        href: "/gatekeeper",
        description:
          "Review GateKeeper operational memory and assistant suggestions.",
        minRole: "member",
        status: "live"
      },
      {
        key: "document-writer",
        label: "Document Writer",
        href: "/document-writer",
        description:
          "Create structured written project and customer-facing documents.",
        minRole: "member",
        status: "foundation"
      }
    ]
  },
  {
    id: "settings",
    label: "Company Controls",
    description:
      "Configure organization defaults, catalog data, and support surfaces.",
    items: [
      {
        key: "settings",
        label: "Company Controls",
        href: "/settings",
        description:
          "Open organization settings and shared system configuration.",
        minRole: "admin",
        status: "live"
      },
      {
        key: "trainings",
        label: "Trainings",
        href: "/trainings",
        description: "Track training records and completion status.",
        minRole: "member",
        status: "foundation"
      },
      {
        key: "support",
        label: "Support",
        href: "/support",
        description: "Access support guidance and operational help resources.",
        minRole: "member",
        status: "foundation"
      }
    ]
  }
] as const;

export const navigationItems = navigationSections.flatMap(
  (section) => section.items
);

function isVisibleForRole(item: NavigationItem, currentRole?: MembershipRole) {
  if (!currentRole) {
    return item.minRole === "member";
  }

  return compareMembershipRoles(currentRole, item.minRole) <= 0;
}

function matchesPath(pathname: string, candidate: string) {
  return pathname === candidate || pathname.startsWith(`${candidate}/`);
}

export function isNavigationItemActive(pathname: string, item: NavigationItem) {
  if (matchesPath(pathname, item.href)) {
    return true;
  }

  return (
    item.matchPaths?.some((matchPath) => matchesPath(pathname, matchPath)) ??
    false
  );
}

export function getVisibleNavigationSections(currentRole?: MembershipRole) {
  return navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isVisibleForRole(item, currentRole))
    }))
    .filter((section) => section.items.length > 0);
}

export function getVisibleNavigationItems(currentRole?: MembershipRole) {
  return navigationItems.filter((item) => isVisibleForRole(item, currentRole));
}

export function getNavigationItemByHref(href: string) {
  return navigationItems.find((item) => item.href === href) ?? null;
}

export function getNavigationItemByPathname(pathname: string) {
  return (
    navigationItems.find((item) => {
      return isNavigationItemActive(pathname, item);
    }) ?? null
  );
}

export function getNavigationSectionByPathname(pathname: string) {
  const activeItem = getNavigationItemByPathname(pathname);

  if (!activeItem) {
    return null;
  }

  return navigationSections.find((section) =>
    section.items.some((item) => item.key === activeItem.key)
  );
}
