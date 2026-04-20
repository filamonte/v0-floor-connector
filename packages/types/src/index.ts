export type ProfileId = string;
export type OrganizationId = string;
export type MembershipId = string;
export type OpportunityId = string;
export type CustomerId = string;
export type ProjectId = string;
export type EstimateId = string;
export type JobId = string;
export type JobAssignmentId = string;
export type InvoiceId = string;
export type PaymentId = string;
export type PaymentEventId = string;
export type ScheduleOfValuesId = string;
export type TemplateId = string;
export type PlatformTemplateSeedId = string;
export type ContractId = string;
export type ContractRevisionId = string;
export type ContractSignerId = string;
export type ContractSignatureEventId = string;
export type ChangeOrderId = string;
export type CatalogItemId = string;
export type PlatformCatalogItemSeedId = string;
export type PlatformUserRoleId = string;
export type VendorId = string;
export type PersonId = string;
export type ComplianceRecordId = string;
export type TimePunchEventId = string;
export type TimeCardId = string;
export type DailyLogId = string;
export type FieldNoteId = string;
export type ExecutionAttachmentId = string;
export type PortalAccessGrantId = string;
export type PortalProjectAccessId = string;
export type PortalRecordViewId = string;

export type MembershipRole = "owner" | "admin" | "manager" | "member";
export type ProjectStatus =
  | "lead"
  | "estimating"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "completed";
export type EstimateStatus = "draft" | "sent" | "approved" | "rejected";
export type SiteAssessmentStatus = "pending" | "scheduled" | "completed";
export type CommercialReadinessStatus =
  | "not_ready"
  | "waiting_on_estimate_approval"
  | "waiting_on_contract"
  | "waiting_on_internal_approval"
  | "waiting_on_signature"
  | "waiting_on_deposit"
  | "waiting_on_financing"
  | "ready_to_schedule";
export type ContractInternalApprovalStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected";
export type SignatureReadinessStatus =
  | "draft"
  | "ready_to_send"
  | "out_for_signature"
  | "signed";
export type FinancingStatus =
  | "not_applicable"
  | "offered"
  | "prequalified"
  | "pending"
  | "approved"
  | "declined";
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
  | "completed";
export type JobAssignmentRole = "lead" | "crew" | "subcontractor";
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "void";
export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "void";
export type ChangeOrderStatus = "draft" | "sent" | "approved" | "rejected";
export type ContractSignerRole = "customer" | "contractor";
export type ContractSignerStatus =
  | "pending"
  | "viewed"
  | "signed"
  | "declined"
  | "voided";
export type ContractSignatureEventType =
  | "signature_requested"
  | "signer_viewed"
  | "signer_signed"
  | "signer_declined"
  | "contractor_countersigned"
  | "signature_completed"
  | "signature_voided"
  | "provider_sync";
export type ContractSignatureActorType =
  | "portal_user"
  | "organization_user"
  | "provider"
  | "system";
export type PaymentStatus = "pending" | "recorded" | "void";
export type PaymentSource = "manual" | "customer_portal";
export type PaymentRecordedVia = "contractor_app" | "customer_portal" | "system";
export type PaymentEventType =
  | "payment_requested"
  | "checkout_started"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_voided"
  | "provider_sync";
export type PaymentEventActorType =
  | "portal_user"
  | "organization_user"
  | "provider"
  | "system";
export type TaxBehavior = "exclusive" | "inclusive" | "none";
export type TemplateType = "estimate" | "invoice" | "contract";
export type DocumentTemplateStatus = "active" | "archived";
export type CatalogItemType = "material" | "service" | "system";
export type InvoiceWorkflowRole = "standard" | "deposit";
export type WorkforcePersonType = "employee" | "subcontractor_worker";
export type VendorType = "subcontractor" | "supplier" | "other";
export type ComplianceSubjectType = "person" | "vendor";
export type ComplianceRecordType =
  | "license"
  | "insurance"
  | "certification"
  | "training"
  | "background_check"
  | "other";
export type ComplianceStatus =
  | "valid"
  | "expiring"
  | "expired"
  | "missing_information";
export type TimePunchEventType =
  | "punch_in"
  | "punch_out"
  | "break_start"
  | "break_end";
export type TimePunchSource = "web" | "mobile" | "admin_adjustment";
export type TimeLocationCaptureMethod =
  | "gps"
  | "network"
  | "manual"
  | "unknown";
export type TimeCardStatus = "open" | "completed" | "edited" | "flagged";
export type TimeCardEntryMode =
  | "derived_from_punches"
  | "manual"
  | "adjusted";
export type DailyLogStatus = "draft" | "finalized";
export type FieldNoteType =
  | "general"
  | "labor"
  | "material"
  | "equipment"
  | "blocker"
  | "issue"
  | "punch_list";
export type FieldNoteStatus = "open" | "noted" | "resolved";
export type FieldNoteVisibility = "internal";
export type ExecutionAttachmentSubjectType = "daily_log" | "field_note";
export type ExecutionAttachmentType = "photo" | "file";
export type PortalAccessGrantStatus = "invited" | "active" | "revoked";
export type PortalProjectAccessStatus = "active" | "revoked";
export type PortalRecordViewSubjectType =
  | "project"
  | "estimate"
  | "contract"
  | "invoice"
  | "change_order";
export type CommercialReadinessBlocker =
  | "site_assessment_incomplete"
  | "estimate_not_approved"
  | "contract_missing"
  | "contract_internal_approval_pending"
  | "contract_signature_pending"
  | "deposit_required"
  | "financing_pending"
  | "financing_declined";

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
  logoUrl: string | null;
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
  siteAssessmentStatus: SiteAssessmentStatus;
  siteAssessmentScheduledAt: string | null;
  siteAssessmentCompletedAt: string | null;
  requirementsSummary: string | null;
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
  defaultRetainagePercentage: string;
  externalTaxProvider: string | null;
  externalTaxProviderConfig: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationWorkflowSettings {
  organizationId: OrganizationId;
  approvedEstimateContractTemplateId: TemplateId | null;
  requireContractInternalApproval: boolean;
  requireContractSignatureBeforeJobScheduling: boolean;
  requireDepositBeforeJobScheduling: boolean;
  requireFinancingApprovalBeforeJobScheduling: boolean;
  defaultDepositPercentage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformFinancialDefaults {
  defaultTaxRate: string;
  defaultTaxBehavior: TaxBehavior;
  defaultRetainagePercentage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformWorkflowDefaults {
  approvedEstimateContractSeedId: PlatformTemplateSeedId | null;
  requireContractInternalApproval: boolean;
  requireContractSignatureBeforeJobScheduling: boolean;
  requireDepositBeforeJobScheduling: boolean;
  requireFinancingApprovalBeforeJobScheduling: boolean;
  defaultDepositPercentage: string;
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
  commercialReadinessStatus: CommercialReadinessStatus;
  financingStatus: FinancingStatus;
  readyToScheduleAt: string | null;
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
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  scheduleNotes: string | null;
  crewVendorId: VendorId | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobAssignment {
  id: JobAssignmentId;
  organizationId: OrganizationId;
  jobId: JobId;
  personId: PersonId | null;
  vendorId: VendorId | null;
  role: JobAssignmentRole;
  assignedStartAt: string | null;
  assignedEndAt: string | null;
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
  workflowRole: InvoiceWorkflowRole;
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
  internalApprovalStatus: ContractInternalApprovalStatus;
  signatureReadinessStatus: SignatureReadinessStatus;
  title: string;
  renderedSubject: string | null;
  renderedContent: string;
  generatedFromEstimateReference: string | null;
  signatureProvider: string | null;
  signatureProviderReference: string | null;
  signatureStartedAt: string | null;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signatureDeclinedAt: string | null;
  signatureVoidedAt: string | null;
  internalApprovedAt: string | null;
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

export interface ContractSigner {
  id: ContractSignerId;
  organizationId: OrganizationId;
  contractId: ContractId;
  signerRole: ContractSignerRole;
  signerStatus: ContractSignerStatus;
  customerId: CustomerId | null;
  portalUserId: ProfileId | null;
  organizationUserId: ProfileId | null;
  displayName: string;
  email: string;
  signerOrder: number;
  viewedAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSignatureEvent {
  id: ContractSignatureEventId;
  organizationId: OrganizationId;
  contractId: ContractId;
  contractSignerId: ContractSignerId | null;
  eventType: ContractSignatureEventType;
  actorType: ContractSignatureActorType;
  actorUserId: ProfileId | null;
  portalUserId: ProfileId | null;
  providerEventId: string | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface ChangeOrder {
  id: ChangeOrderId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId;
  contractId: ContractId | null;
  invoiceId: InvoiceId | null;
  appliedInvoiceLineItemId: string | null;
  status: ChangeOrderStatus;
  title: string;
  description: string | null;
  scopeChangeNotes: string | null;
  priceAdjustment: string;
  decisionNote: string | null;
  sentAt: string | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: PaymentId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  paymentSource: PaymentSource;
  recordedVia: PaymentRecordedVia;
  gatewayProvider: string | null;
  gatewayPaymentIntentReference: string | null;
  gatewayCheckoutSessionReference: string | null;
  gatewayStatus: string | null;
  paymentMethodSummary: string | null;
  payerUserId: ProfileId | null;
  payerEmail: string | null;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: PaymentEventId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  paymentId: PaymentId | null;
  eventType: PaymentEventType;
  actorType: PaymentEventActorType;
  actorUserId: ProfileId | null;
  portalUserId: ProfileId | null;
  gatewayProvider: string | null;
  providerEventId: string | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
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

export interface PlatformCatalogItemSeed {
  id: PlatformCatalogItemSeedId;
  itemType: CatalogItemType;
  seedKey: string;
  name: string;
  description: string | null;
  unit: string;
  defaultUnitPrice: string;
  isActive: boolean;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: VendorId;
  organizationId: OrganizationId;
  name: string;
  vendorType: VendorType;
  isLaborProvider: boolean;
  primaryContactName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string | null;
  taxIdentifierLast4: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: PersonId;
  organizationId: OrganizationId;
  membershipUserId: ProfileId | null;
  vendorId: VendorId | null;
  personType: WorkforcePersonType;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  trade: string | null;
  classification: string | null;
  isAssignable: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceRecord {
  id: ComplianceRecordId;
  organizationId: OrganizationId;
  subjectType: ComplianceSubjectType;
  subjectId: string;
  recordType: ComplianceRecordType;
  name: string;
  issuingAuthority: string | null;
  referenceNumber: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  status: ComplianceStatus;
  documentFileId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimePunchEvent {
  id: TimePunchEventId;
  organizationId: OrganizationId;
  personId: PersonId;
  projectId: ProjectId | null;
  jobId: JobId | null;
  eventType: TimePunchEventType;
  occurredAt: string;
  source: TimePunchSource;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  locationCaptureMethod: TimeLocationCaptureMethod;
  geofenceSnapshot: Record<string, unknown> | null;
  supersedesEventId: TimePunchEventId | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeCard {
  id: TimeCardId;
  organizationId: OrganizationId;
  personId: PersonId;
  projectId: ProjectId | null;
  jobId: JobId | null;
  workDate: string;
  sourcePunchInEventId: TimePunchEventId;
  sourcePunchOutEventId: TimePunchEventId | null;
  punchInAt: string;
  punchOutAt: string | null;
  breakMinutes: number;
  workedMinutes: number;
  status: TimeCardStatus;
  entryMode: TimeCardEntryMode;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: DailyLogId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  jobId: JobId | null;
  logDate: string;
  status: DailyLogStatus;
  summary: string | null;
  workCompleted: string | null;
  workPlannedNext: string | null;
  delaysOrBlockers: string | null;
  safetyNotes: string | null;
  weatherSummary: string | null;
  weatherConditions: string | null;
  temperatureHighF: number | null;
  temperatureLowF: number | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldNote {
  id: FieldNoteId;
  organizationId: OrganizationId;
  dailyLogId: DailyLogId;
  projectId: ProjectId;
  jobId: JobId | null;
  personId: PersonId | null;
  timeCardId: TimeCardId | null;
  noteType: FieldNoteType;
  title: string;
  body: string | null;
  status: FieldNoteStatus;
  visibility: FieldNoteVisibility;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionAttachment {
  id: ExecutionAttachmentId;
  organizationId: OrganizationId;
  subjectType: ExecutionAttachmentSubjectType;
  subjectId: string;
  attachmentType: ExecutionAttachmentType;
  storagePath: string;
  fileName: string;
  mimeType: string;
  caption: string | null;
  uploadedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalAccessGrant {
  id: PortalAccessGrantId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  userId: ProfileId;
  status: PortalAccessGrantStatus;
  invitedEmail: string | null;
  invitedByUserId: ProfileId | null;
  activatedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalProjectAccess {
  id: PortalProjectAccessId;
  organizationId: OrganizationId;
  portalAccessGrantId: PortalAccessGrantId;
  projectId: ProjectId;
  status: PortalProjectAccessStatus;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalRecordView {
  id: PortalRecordViewId;
  organizationId: OrganizationId;
  portalUserId: ProfileId;
  customerId: CustomerId;
  projectId: ProjectId;
  subjectType: PortalRecordViewSubjectType;
  subjectId: string;
  viewedAt: string;
}

export interface DailyLogLaborSummaryEntry {
  personId: PersonId;
  personDisplayName: string | null;
  jobId: JobId | null;
  jobLabel: string | null;
  timeCardCount: number;
  workedMinutes: number;
}

export interface DailyLogLaborSummary {
  dailyLogId: DailyLogId;
  projectId: ProjectId;
  logDate: string;
  peopleOnSiteCount: number;
  totalWorkedMinutes: number;
  totalHoursWorked: number;
  totalTimeCardCount: number;
  entries: DailyLogLaborSummaryEntry[];
}

export interface CatalogItem {
  id: CatalogItemId;
  organizationId: OrganizationId;
  sourceSeedId: PlatformCatalogItemSeedId | null;
  sourceSeedKey: string | null;
  itemType: CatalogItemType;
  name: string;
  description: string | null;
  unit: string;
  defaultUnitPrice: string;
  status: DocumentTemplateStatus;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
