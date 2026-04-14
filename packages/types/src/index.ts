export type ProfileId = string;
export type OrganizationId = string;
export type MembershipId = string;
export type CustomerId = string;
export type ProjectId = string;
export type EstimateId = string;
export type JobId = string;

export type MembershipRole = "owner" | "admin" | "manager" | "member";
export type ProjectStatus =
  | "lead"
  | "estimating"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "completed";
export type EstimateStatus = "draft" | "sent" | "approved" | "rejected";
export type JobStatus =
  | "unscheduled"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "canceled";

export type MembershipStatus =
  | "invited"
  | "active"
  | "inactive"
  | "suspended";

export interface Profile {
  id: ProfileId;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  lifecycleState: string;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: OrganizationId;
  slug: string;
  legalName: string;
  displayName: string;
  tenantStatus: string;
  lifecycleState: string;
  primaryContactUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  id: MembershipId;
  organizationId: OrganizationId;
  profileId: ProfileId;
  role: MembershipRole;
  status: MembershipStatus;
  invitationEmail: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  suspendedAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: CustomerId;
  organizationId: OrganizationId;
  name: string;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: ProjectId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  name: string;
  status: ProjectStatus;
  description: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Estimate {
  id: EstimateId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId;
  referenceNumber: string;
  status: EstimateStatus;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateLineItem {
  id: string;
  estimateId: EstimateId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unitPrice: string;
  lineTotal: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: JobId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId;
  estimateId: EstimateId | null;
  status: JobStatus;
  scheduledDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
