export type OrganizationId = string;

export type UserRole =
  | "platform_admin"
  | "company_owner"
  | "company_admin"
  | "estimator"
  | "project_manager"
  | "crew_lead"
  | "crew_member"
  | "subcontractor"
  | "customer";
