export const APP_NAME = "FloorConnector";

export const APP_NAMES = {
  umbrella: "FloorConnector",
  contractor: "FloorConnector App",
  portal: "FloorConnector Portal",
  superAdmin: "FloorConnector Super Admin",
  marketing: "FloorConnector Marketing"
} as const;

export const PLATFORM_SURFACE_SEGMENTS = {
  marketing: "/",
  contractorApp: "/app",
  portal: "/portal",
  superAdmin: "/super-admin"
} as const;

export const ROUTE_GROUPS = {
  marketing: "(marketing)",
  contractorApp: "(app)",
  portal: "(portal)",
  superAdmin: "(super-admin)"
} as const;

export const MODULE_KEYS = [
  "marketing",
  "contractor_app",
  "customer_portal",
  "super_admin",
  "customers",
  "jobs",
  "estimates",
  "invoices",
  "scheduling",
  "messaging",
  "documents",
  "billing",
  "integrations"
] as const;

export const STORAGE_BUCKET_NAMES = {
  organizationAssets: "organization-assets",
  documents: "documents",
  projectFiles: "project-files",
  jobPhotos: "job-photos",
  avatars: "avatars",
  tempUploads: "temp-uploads",
  exports: "exports"
} as const;

export const PLATFORM_SURFACES = [
  "marketing",
  "contractor_app",
  "customer_portal",
  "super_admin"
] as const;

export const FEATURE_FLAG_KEYS = [
  "surface_marketing",
  "surface_contractor_app",
  "surface_customer_portal",
  "surface_super_admin",
  "module_customers",
  "module_jobs",
  "module_estimates",
  "module_invoices",
  "module_scheduling",
  "module_messaging",
  "module_documents",
  "module_billing",
  "integration_quickbooks",
  "integration_companycam",
  "integration_signwell",
  "observability_sentry",
  "analytics_posthog"
] as const;
