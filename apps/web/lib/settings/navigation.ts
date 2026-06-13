export type SettingsNavItem = {
  href: string;
  label: string;
  description: string;
  group?: string;
  adminOnly?: boolean;
};

export const contractorSettingsNavItems: readonly SettingsNavItem[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    group: "Company Controls",
    description: "Personal account identity and current company context."
  },
  {
    href: "/settings",
    label: "Overview",
    group: "Company Controls",
    description: "Review the current company control footprint.",
    adminOnly: true
  },
  {
    href: "/settings/organization",
    label: "Company Profile",
    group: "Company Controls",
    description: "Profile, identity, and company-level organization details.",
    adminOnly: true
  },
  {
    href: "/settings/admin",
    label: "Users / Access",
    group: "Users / Access",
    description: "Organization members, roles, and access guardrails.",
    adminOnly: true
  },
  {
    href: "/settings/workflows",
    label: "Workflow Defaults",
    group: "Workflow Defaults",
    description: "Contract generation, Ready Check, and guidance defaults.",
    adminOnly: true
  },
  {
    href: "/settings/operational-intelligence",
    label: "Next Move",
    group: "Workflow Defaults",
    description: "Built-in My Work suggestion thresholds and urgency.",
    adminOnly: true
  },
  {
    href: "/settings/automation",
    label: "Automation Readiness",
    group: "Workflow Defaults",
    description:
      "Automation readiness plus future notification-only preferences.",
    adminOnly: true
  },
  {
    href: "/settings/financial",
    label: "Financial Defaults",
    group: "Financial",
    description: "Tax, retainage, billing defaults, and tax-code settings.",
    adminOnly: true
  },
  {
    href: "/settings/templates",
    label: "Estimate Templates",
    group: "Sales / Estimate",
    description:
      "Organization-owned estimate, invoice, and contract templates.",
    adminOnly: true
  },
  {
    href: "/settings/catalogs",
    label: "Catalog Items",
    group: "Sales / Estimate",
    description:
      "Catalog Items, Systems, Add-ons / Options, and inventory behavior.",
    adminOnly: true
  },
  {
    href: "/settings/system-layers",
    label: "System Layers",
    group: "Sales / Estimate",
    description: "Finish products and floor system template administration.",
    adminOnly: true
  },
  {
    href: "/settings/selected-systems",
    label: "Selected Systems",
    group: "Sales / Estimate",
    description:
      "Admin validation for selected floor systems on real workflow records.",
    adminOnly: true
  },
  {
    href: "/settings/company-documents",
    label: "Company Documents",
    group: "Templates",
    description: "Business documents, SOPs, policies, and agreements.",
    adminOnly: true
  },
  {
    href: "/settings/modules",
    label: "Company Feature Controls",
    group: "Portal / Admin boundaries",
    description:
      "Company-level feature overrides inside platform-owned policy.",
    adminOnly: true
  },
  {
    href: "/settings/export",
    label: "Data Export",
    group: "Portal / Admin boundaries",
    description: "Tenant-scoped CSV and JSON exports for canonical records.",
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
    label: "Platform Starter Settings",
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
    label: "Platform Feature Policy",
    description: "Platform feature policy and module availability rules."
  },
  {
    href: "/super-admin/packages",
    label: "Packages",
    description: "Read-only package, plan, billing, and activation readiness."
  },
  {
    href: "/super-admin/billing",
    label: "Platform Billing",
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
    description:
      "Platform admins, tenant lifecycle oversight, and system governance."
  }
] as const;
