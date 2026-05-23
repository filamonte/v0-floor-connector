export type SettingsNavItem = {
  href: string;
  label: string;
  description: string;
  adminOnly?: boolean;
};

export const contractorSettingsNavItems: readonly SettingsNavItem[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    description: "Personal account identity and current company context."
  },
  {
    href: "/settings",
    label: "Overview",
    description: "Review the current company control footprint.",
    adminOnly: true
  },
  {
    href: "/settings/organization",
    label: "Company Profile",
    description: "Profile, identity, and company-level organization details.",
    adminOnly: true
  },
  {
    href: "/settings/templates",
    label: "Document Templates",
    description:
      "Organization-owned estimate, invoice, and contract templates.",
    adminOnly: true
  },
  {
    href: "/settings/company-documents",
    label: "Company Documents",
    description: "Business documents, SOPs, policies, and agreements.",
    adminOnly: true
  },
  {
    href: "/settings/catalogs",
    label: "Catalog Items",
    description:
      "Catalog Items, Systems, Add-ons / Options, and inventory behavior.",
    adminOnly: true
  },
  {
    href: "/settings/system-layers",
    label: "System Layers",
    description: "Finish products and floor system template administration.",
    adminOnly: true
  },
  {
    href: "/settings/selected-systems",
    label: "Selected Systems",
    description:
      "Admin validation for selected floor systems on real workflow records.",
    adminOnly: true
  },
  {
    href: "/settings/financial",
    label: "Financial",
    description: "Tax, retainage, billing defaults, and tax-code settings.",
    adminOnly: true
  },
  {
    href: "/settings/workflows",
    label: "GateKeeper Defaults",
    description: "Contract generation and Ready Check defaults.",
    adminOnly: true
  },
  {
    href: "/settings/operational-intelligence",
    label: "Next Move",
    description: "Built-in My Work suggestion thresholds and urgency.",
    adminOnly: true
  },
  {
    href: "/settings/automation",
    label: "Automation",
    description:
      "Automation readiness plus future notification-only preferences on canonical settings.",
    adminOnly: true
  },
  {
    href: "/settings/export",
    label: "Data Export",
    description: "Tenant-scoped CSV and JSON exports for canonical records.",
    adminOnly: true
  },
  {
    href: "/settings/admin",
    label: "Admin",
    description: "Organization members, roles, and admin-facing controls.",
    adminOnly: true
  },
  {
    href: "/settings/modules",
    label: "Feature Controls",
    description: "Company-level feature overrides within platform policy.",
    adminOnly: true
  }
] as const;

export const platformAdminNavItems: readonly SettingsNavItem[] = [
  {
    href: "/super-admin",
    label: "Overview",
    description: "Platform-wide configuration health and rollout posture."
  },
  {
    href: "/super-admin/platform",
    label: "Starter Settings",
    description: "Global financial and workflow baselines inherited by tenants."
  },
  {
    href: "/super-admin/templates",
    label: "Starter Templates",
    description: "Platform-managed starter document templates for adoption."
  },
  {
    href: "/super-admin/catalogs",
    label: "Starter Catalogs",
    description: "Reusable seeded items available for organization adoption."
  },
  {
    href: "/super-admin/modules",
    label: "Feature Controls",
    description: "Platform feature policy and module availability rules."
  },
  {
    href: "/super-admin/packages",
    label: "Packages",
    description: "Read-only package, plan, billing, and activation readiness."
  },
  {
    href: "/super-admin/billing",
    label: "Billing",
    description:
      "SaaS billing configuration, Checkout readiness, webhook health, and tenant status."
  },
  {
    href: "/super-admin/groups",
    label: "Contractor Groups",
    description: "Platform segmentation for cohorts and future targeting."
  },
  {
    href: "/super-admin/operations",
    label: "Operations",
    description:
      "Read-only system health, audit activity, and support readiness."
  },
  {
    href: "/super-admin/early-access",
    label: "Early Access",
    description:
      "Onboarding visibility, first workflow progress, and activation control."
  },
  {
    href: "/super-admin/admin",
    label: "Platform Control Room",
    description: "Platform admins, tenant oversight, and system governance."
  }
] as const;
