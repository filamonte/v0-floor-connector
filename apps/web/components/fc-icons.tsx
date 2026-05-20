import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CloudSun,
  CreditCard,
  FileStack,
  FileText,
  FolderKanban,
  GitBranch,
  Hammer,
  LayoutDashboard,
  Package,
  Receipt,
  Search,
  ScrollText,
  Settings,
  ShieldCheck,
  Target,
  User,
  Users,
  Wrench
} from "lucide-react";

export const floorConnectorIconMap = {
  dashboard: LayoutDashboard,
  opportunities: Target,
  customers: Users,
  projects: FolderKanban,
  estimates: FileText,
  contracts: ScrollText,
  changeOrders: GitBranch,
  jobs: Hammer,
  schedule: CalendarDays,
  invoices: Receipt,
  payments: CreditCard,
  people: User,
  vendors: Building2,
  dailyLogs: ClipboardList,
  time: Clock3,
  materials: Package,
  settings: Settings,
  notifications: Bell,
  globalSearch: Search,
  progressBilling: BarChart3,
  equipment: Wrench,
  serviceWarranty: ShieldCheck,
  bidRfp: BriefcaseBusiness,
  documents: FileStack,
  weather: CloudSun,
  inspections: ClipboardCheck
} satisfies Record<string, LucideIcon>;

export type FloorConnectorIconKey = keyof typeof floorConnectorIconMap;

export function getFloorConnectorIconNameForNavigationKey(
  key: string
): FloorConnectorIconKey {
  switch (key) {
    case "projects":
      return "projects";
    case "daily-logs":
      return "dailyLogs";
    case "schedule":
    case "calendar":
    case "crew-schedule":
      return "schedule";
    case "work-orders":
      return "jobs";
    case "inspections":
    case "forms-checklists":
      return "inspections";
    case "punchlists":
      return "dailyLogs";
    case "service-tickets":
      return "serviceWarranty";
    case "financials-home":
      return "progressBilling";
    case "estimates":
      return "estimates";
    case "cost-items-database":
      return "materials";
    case "contracts":
    case "sub-contracts":
      return "contracts";
    case "change-orders":
      return "changeOrders";
    case "invoices":
    case "bills":
      return "invoices";
    case "payments":
      return "payments";
    case "accounts-receivable":
    case "accounts-payable":
    case "expenses":
    case "transaction-log":
      return "progressBilling";
    case "purchase-orders":
      return "materials";
    case "directory":
      return "people";
    case "opportunities":
      return "opportunities";
    case "time-cards":
      return "time";
    case "files":
    case "submittals":
    case "document-writer":
      return "documents";
    case "reports":
      return "progressBilling";
    case "rfi-notices":
    case "communications":
      return "notifications";
    case "equipment-logs":
      return "equipment";
    case "settings":
      return "settings";
    default:
      return "dashboard";
  }
}

type FloorConnectorIconProps = {
  name: FloorConnectorIconKey;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
};

export function FloorConnectorIcon({
  name,
  className,
  size = 16,
  "aria-hidden": ariaHidden = true
}: FloorConnectorIconProps) {
  const Icon = floorConnectorIconMap[name];

  return (
    <Icon
      aria-hidden={ariaHidden}
      className={className}
      size={size}
      strokeWidth={1.8}
    />
  );
}
