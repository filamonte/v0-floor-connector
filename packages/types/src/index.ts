export type ProfileId = string;
export type OrganizationId = string;
export type MembershipId = string;
export type OpportunityId = string;
export type CustomerId = string;
export type ProjectId = string;
export type EstimateId = string;
export type JobId = string;
export type InvoiceId = string;
export type PaymentId = string;
export type ScheduleOfValuesId = string;
export type TemplateId = string;
export type PlatformTemplateSeedId = string;
export type ContractId = string;
export type ContractRevisionId = string;

export type MembershipRole = "owner" | "admin" | "manager" | "member";
export type ProjectStatus =
  | "lead"
  | "estimating"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "completed";
export type EstimateStatus = "draft" | "sent" | "approved" | "rejected";
export type OpportunityStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "site_assessment_scheduled"
  | "site_assessment_complete"
  | "estimating"
  | "proposal_sent"
  | "won"
  | "lost"
  | "converted";
export type JobStatus =
  | "unscheduled"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "canceled";
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "void";
export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "void";
export type PaymentStatus = "recorded" | "void";
export type TaxBehavior = "exclusive" | "inclusive" | "none";
export type TemplateType = "estimate" | "invoice" | "contract";
export type DocumentTemplateStatus = "active" | "archived";

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
  isTaxExempt: boolean;
  taxExemptionReason: string | null;
  taxExemptionReference: string | null;
  taxExemptionExpiresOn: string | null;
  retainagePercentageDefault: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: OpportunityId;
  organizationId: OrganizationId;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  status: OpportunityStatus;
  title: string;
  source: string | null;
  serviceType: string | null;
  prospectName: string;
  prospectCompanyName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string | null;
  notes: string | null;
  qualifiedAt: string | null;
  convertedAt: string | null;
  lostAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationFinancialSettings {
  organizationId: OrganizationId;
  defaultTaxRate: string;
  defaultTaxBehavior: TaxBehavior;
  externalTaxProvider: string | null;
  externalTaxProviderConfig: Record<string, unknown> | null;
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
  templateId: TemplateId | null;
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

export interface Invoice {
  id: InvoiceId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId;
  estimateId: EstimateId | null;
  jobId: JobId | null;
  templateId: TemplateId | null;
  referenceNumber: string;
  billingModel: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  taxRateApplied: string;
  taxBehaviorApplied: TaxBehavior;
  customerTaxExemptSnapshot: boolean;
  subtotalAmount: string;
  taxableSalesAmount: string;
  exemptSalesAmount: string;
  taxAmount: string;
  taxCollectedAmount: string;
  discountAmount: string;
  retainagePercentage: string;
  retainageHeldAmount: string;
  totalAmount: string;
  balanceDueAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: InvoiceId;
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

export interface Contract {
  id: ContractId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId;
  estimateId: EstimateId | null;
  templateId: TemplateId | null;
  status: ContractStatus;
  title: string;
  renderedSubject: string | null;
  renderedContent: string;
  generatedFromEstimateReference: string | null;
  signatureProvider: string | null;
  signatureProviderReference: string | null;
  signatureStartedAt: string | null;
  lockedAt: string | null;
  editLockReason: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractRevision {
  id: ContractRevisionId;
  organizationId: OrganizationId;
  contractId: ContractId;
  revisionNumber: number;
  title: string;
  renderedSubject: string | null;
  renderedContent: string;
  editSummary: string | null;
  createdAt: string;
}

export interface Payment {
  id: PaymentId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleOfValues {
  id: ScheduleOfValuesId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId;
  estimateId: EstimateId;
  billingModel: string;
  sourceEstimateStatus: EstimateStatus;
  retainagePercentageDefault: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleOfValueItem {
  id: string;
  scheduleOfValuesId: ScheduleOfValuesId;
  organizationId: OrganizationId;
  estimateLineItemId: string;
  name: string;
  description: string | null;
  scheduledValueAmount: string;
  percentComplete: string;
  priorBilledAmount: string;
  currentBilledAmount: string;
  retainagePercentage: string;
  retainageHeldAmount: string;
  retainageReleasedAmount: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformTemplateSeed {
  id: PlatformTemplateSeedId;
  templateType: TemplateType;
  seedKey: string;
  name: string;
  description: string | null;
  subjectTemplate: string | null;
  bodyTemplate: string;
  schemaVersion: number;
  isDefault: boolean;
  isActive: boolean;
  mergeFieldManifest: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: TemplateId;
  organizationId: OrganizationId;
  templateType: TemplateType;
  sourceSeedId: PlatformTemplateSeedId | null;
  sourceSeedKey: string | null;
  name: string;
  description: string | null;
  subjectTemplate: string | null;
  bodyTemplate: string;
  schemaVersion: number;
  status: DocumentTemplateStatus;
  isDefault: boolean;
  mergeFieldManifest: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
