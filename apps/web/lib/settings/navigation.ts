export type SettingsNavItem = {
  href: string;
  label: string;
  description: string;
};

export const contractorSettingsNavItems: readonly SettingsNavItem[] = [
  {
    href: "/settings",
    label: "Overview",
    description: "Review the current organization configuration footprint."
  },
  {
    href: "/settings/organization",
    label: "Organization",
    description: "Profile, identity, and tenant-level organization details."
  },
  {
    href: "/settings/templates",
    label: "Document Templates",
    description: "Organization-owned estimate, invoice, and contract templates."
  },
  {
    href: "/settings/catalogs",
    label: "Catalog Items",
    description: "Catalog Items, Systems, Add-ons / Options, and inventory behavior."
  },
  {
    href: "/settings/financial",
    label: "Financial",
    description: "Tax, retainage, billing defaults, and tax-code settings."
  },
  {
    href: "/settings/workflows",
    label: "Workflows",
    description: "Contract generation and commercial readiness defaults."
  },
  {
    href: "/settings/automation",
    label: "Automation",
    description:
      "Automation readiness plus future notification-only preferences on canonical settings."
  },
  {
    href: "/settings/admin",
    label: "Admin",
    description: "Organization members, roles, and admin-facing controls."
  },
  {
    href: "/settings/modules",
    label: "Modules",
    description: "Organization-level feature overrides within platform policy."
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
    label: "Platform Defaults",
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
    label: "Module Controls",
    description: "Platform feature policy and module availability rules."
  },
  {
    href: "/super-admin/admin",
    label: "Platform Admin",
    description: "Platform admins, tenant oversight, and system governance."
  }
] as const;
