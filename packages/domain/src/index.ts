import type {
  ComplianceRecordType,
  ComplianceStatus,
  ComplianceSubjectType,
  DailyLogStatus,
  ExecutionAttachmentSubjectType,
  ExecutionAttachmentType,
  FieldNoteStatus,
  FieldNoteType,
  FieldNoteVisibility,
  GateKeeperActionSuggestionStatus,
  GateKeeperActionSuggestionType,
  GateKeeperArtifactReviewStatus,
  GateKeeperArtifactType,
  CommercialReadinessBlocker,
  CommercialReadinessStatus,
  ContractSignatureActorType,
  ContractSignatureEventType,
  ContractSignerRole,
  ContractSignerStatus,
  ContractStatus,
  ChangeOrderStatus,
  ContractInternalApprovalStatus,
  DocumentSignatureEventType,
  DocumentSignatureSubjectType,
  DocumentSignerRole,
  DocumentSignerStatus,
  DocumentTemplateStatus,
  EquipmentOperationalStatus,
  EquipmentOwnershipStatus,
  EquipmentAssignmentStatus,
  EquipmentType,
  EstimateStatus,
  FinancingStatus,
  InvoiceStatus,
  InvoiceWorkflowRole,
  JobStatus,
  JobAssignmentRole,
  MembershipRole,
  MembershipStatus,
  PaymentEventActorType,
  PaymentEventType,
  PaymentRecordedVia,
  PaymentSource,
  VendorType,
  PaymentStatus,
  PortalAccessGrantStatus,
  PortalProjectAccessStatus,
  PortalRecordViewSubjectType,
  ProjectStatus,
  OpportunityStatus,
  SignatureReadinessStatus,
  SiteAssessmentStatus,
  TemplateType,
  TimeCardEntryMode,
  TimeCardStatus,
  TimeLocationCaptureMethod,
  TimePunchEventType,
  TimePunchSource,
  WorkforcePersonType
} from "@floorconnector/types";

export const trialPolicy = {
  withCardDays: 14,
  withoutCardDays: 3,
  graceDays: 7
} as const;

export const membershipRoles = [
  "owner",
  "admin",
  "manager",
  "member"
] as const satisfies readonly MembershipRole[];

export const membershipStatuses = [
  "invited",
  "active",
  "inactive",
  "suspended"
] as const satisfies readonly MembershipStatus[];

export const projectStatuses = [
  "lead",
  "estimating",
  "approved",
  "scheduled",
  "in_progress",
  "completed"
] as const satisfies readonly ProjectStatus[];

export const estimateStatuses = [
  "draft",
  "sent",
  "approved",
  "rejected"
] as const satisfies readonly EstimateStatus[];

export const siteAssessmentStatuses = [
  "pending",
  "scheduled",
  "completed"
] as const satisfies readonly SiteAssessmentStatus[];

export const commercialReadinessStatuses = [
  "not_ready",
  "waiting_on_estimate_approval",
  "waiting_on_contract",
  "waiting_on_internal_approval",
  "waiting_on_signature",
  "waiting_on_deposit",
  "waiting_on_financing",
  "ready_to_schedule"
] as const satisfies readonly CommercialReadinessStatus[];

export const contractInternalApprovalStatuses = [
  "not_required",
  "pending",
  "approved",
  "rejected"
] as const satisfies readonly ContractInternalApprovalStatus[];

export const contractInternalApprovalTransitions: Record<
  ContractInternalApprovalStatus,
  readonly ContractInternalApprovalStatus[]
> = {
  not_required: [],
  pending: ["approved", "rejected"],
  approved: ["pending", "rejected"],
  rejected: ["pending", "approved"]
};

export const signatureReadinessStatuses = [
  "draft",
  "ready_to_send",
  "out_for_signature",
  "signed"
] as const satisfies readonly SignatureReadinessStatus[];

export const financingStatuses = [
  "not_applicable",
  "offered",
  "prequalified",
  "pending",
  "approved",
  "declined"
] as const satisfies readonly FinancingStatus[];

export const opportunityStatuses = [
  "new",
  "contacted",
  "qualified",
  "site_assessment_scheduled",
  "site_assessment_complete",
  "estimating",
  "proposal_sent",
  "won",
  "lost",
  "converted"
] as const satisfies readonly OpportunityStatus[];

export const jobStatuses = [
  "unscheduled",
  "scheduled",
  "in_progress",
  "completed"
] as const satisfies readonly JobStatus[];

export const jobAssignmentRoles = [
  "lead",
  "crew",
  "subcontractor"
] as const satisfies readonly JobAssignmentRole[];

export const invoiceStatuses = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "void"
] as const satisfies readonly InvoiceStatus[];

export const contractStatuses = [
  "draft",
  "sent",
  "viewed",
  "signed",
  "void"
] as const satisfies readonly ContractStatus[];

export const changeOrderStatuses = [
  "draft",
  "sent",
  "approved",
  "rejected"
] as const satisfies readonly ChangeOrderStatus[];

export const contractSignerRoles = [
  "customer",
  "contractor"
] as const satisfies readonly ContractSignerRole[];

export const contractSignerStatuses = [
  "pending",
  "viewed",
  "signed",
  "declined",
  "voided"
] as const satisfies readonly ContractSignerStatus[];

export const contractSignatureEventTypes = [
  "signature_requested",
  "signer_viewed",
  "signer_signed",
  "signer_declined",
  "contractor_countersigned",
  "signature_completed",
  "signature_voided",
  "provider_sync"
] as const satisfies readonly ContractSignatureEventType[];

export const contractSignatureActorTypes = [
  "portal_user",
  "organization_user",
  "provider",
  "system"
] as const satisfies readonly ContractSignatureActorType[];

export const contractSignerStatusTransitions: Record<
  ContractSignerStatus,
  readonly ContractSignerStatus[]
> = {
  pending: ["viewed", "signed", "declined", "voided"],
  viewed: ["signed", "declined", "voided"],
  signed: [],
  declined: ["voided"],
  voided: []
};

export const documentSignatureSubjectTypes = [
  "warranty_document"
] as const satisfies readonly DocumentSignatureSubjectType[];

export const documentSignerRoles = [
  "customer",
  "contractor"
] as const satisfies readonly DocumentSignerRole[];

export const documentSignerStatuses = [
  "pending",
  "requested",
  "viewed",
  "signed",
  "declined",
  "voided"
] as const satisfies readonly DocumentSignerStatus[];

export const documentSignerStatusTransitions: Record<
  DocumentSignerStatus,
  readonly DocumentSignerStatus[]
> = {
  pending: ["requested", "voided"],
  requested: ["viewed", "signed", "declined", "voided"],
  viewed: ["signed", "declined", "voided"],
  signed: [],
  declined: ["voided"],
  voided: []
};

export const documentSignatureEventTypes = [
  "signature_requested",
  "viewed",
  "signed",
  "declined",
  "voided"
] as const satisfies readonly DocumentSignatureEventType[];

export const paymentStatuses = [
  "pending",
  "recorded",
  "void"
] as const satisfies readonly PaymentStatus[];

export const paymentSources = [
  "manual",
  "customer_portal"
] as const satisfies readonly PaymentSource[];

export const paymentRecordedViaValues = [
  "contractor_app",
  "customer_portal",
  "system"
] as const satisfies readonly PaymentRecordedVia[];

export const paymentEventTypes = [
  "payment_requested",
  "checkout_started",
  "payment_succeeded",
  "payment_failed",
  "payment_voided",
  "provider_sync"
] as const satisfies readonly PaymentEventType[];

export const paymentEventActorTypes = [
  "portal_user",
  "organization_user",
  "provider",
  "system"
] as const satisfies readonly PaymentEventActorType[];

export const paymentStatusTransitions: Record<
  PaymentStatus,
  readonly PaymentStatus[]
> = {
  pending: ["recorded", "void"],
  recorded: ["void"],
  void: []
};

export const taxBehaviors = ["exclusive", "inclusive", "none"] as const;

export const templateTypes = [
  "estimate",
  "invoice",
  "contract",
  "warranty"
] as const satisfies readonly TemplateType[];

export const documentTemplateStatuses = [
  "active",
  "archived"
] as const satisfies readonly DocumentTemplateStatus[];

export const invoiceWorkflowRoles = [
  "standard",
  "deposit"
] as const satisfies readonly InvoiceWorkflowRole[];

export const workforcePersonTypes = [
  "employee",
  "subcontractor_worker"
] as const satisfies readonly WorkforcePersonType[];

export const vendorTypes = [
  "subcontractor",
  "supplier",
  "other"
] as const satisfies readonly VendorType[];

export const equipmentTypes = [
  "grinder",
  "polisher",
  "vacuum",
  "dust_collector",
  "shot_blaster",
  "scarifier",
  "scraper",
  "mixer",
  "sprayer",
  "trailer",
  "truck",
  "generator",
  "moisture_meter",
  "testing_tool",
  "coating_tool",
  "burnisher",
  "hand_tool",
  "kit",
  "other"
] as const satisfies readonly EquipmentType[];

export const equipmentOwnershipStatuses = [
  "owned",
  "rented",
  "leased",
  "subcontractor_owned",
  "other"
] as const satisfies readonly EquipmentOwnershipStatus[];

export const equipmentOperationalStatuses = [
  "available",
  "assigned",
  "in_use",
  "maintenance",
  "out_of_service",
  "retired"
] as const satisfies readonly EquipmentOperationalStatus[];

export const equipmentAssignmentStatuses = [
  "planned",
  "assigned",
  "in_use",
  "returned",
  "canceled"
] as const satisfies readonly EquipmentAssignmentStatus[];

export const complianceSubjectTypes = [
  "person",
  "vendor"
] as const satisfies readonly ComplianceSubjectType[];

export const complianceRecordTypes = [
  "license",
  "insurance",
  "certification",
  "training",
  "background_check",
  "other"
] as const satisfies readonly ComplianceRecordType[];

export const complianceStatuses = [
  "valid",
  "expiring",
  "expired",
  "missing_information"
] as const satisfies readonly ComplianceStatus[];

export const timePunchEventTypes = [
  "punch_in",
  "punch_out",
  "break_start",
  "break_end"
] as const satisfies readonly TimePunchEventType[];

export const timePunchSources = [
  "web",
  "mobile",
  "admin_adjustment"
] as const satisfies readonly TimePunchSource[];

export const timeLocationCaptureMethods = [
  "gps",
  "network",
  "manual",
  "unknown"
] as const satisfies readonly TimeLocationCaptureMethod[];

export const timeCardStatuses = [
  "open",
  "completed",
  "edited",
  "flagged"
] as const satisfies readonly TimeCardStatus[];

export const timeCardEntryModes = [
  "derived_from_punches",
  "manual",
  "adjusted"
] as const satisfies readonly TimeCardEntryMode[];

export const dailyLogStatuses = [
  "draft",
  "finalized"
] as const satisfies readonly DailyLogStatus[];

export const fieldNoteTypes = [
  "general",
  "labor",
  "material",
  "equipment",
  "blocker",
  "issue",
  "punch_list"
] as const satisfies readonly FieldNoteType[];

export const fieldNoteStatuses = [
  "open",
  "noted",
  "resolved"
] as const satisfies readonly FieldNoteStatus[];

export const fieldNoteVisibilities = [
  "internal"
] as const satisfies readonly FieldNoteVisibility[];

export const executionAttachmentSubjectTypes = [
  "daily_log",
  "field_note"
] as const satisfies readonly ExecutionAttachmentSubjectType[];

export const executionAttachmentTypes = [
  "photo",
  "file"
] as const satisfies readonly ExecutionAttachmentType[];

export const portalAccessGrantStatuses = [
  "invited",
  "active",
  "revoked"
] as const satisfies readonly PortalAccessGrantStatus[];

export const portalProjectAccessStatuses = [
  "active",
  "revoked"
] as const satisfies readonly PortalProjectAccessStatus[];

export const portalRecordViewSubjectTypes = [
  "project",
  "estimate",
  "contract",
  "invoice",
  "change_order"
] as const satisfies readonly PortalRecordViewSubjectType[];

export const gateKeeperArtifactTypes = [
  "call_summary",
  "transcript_placeholder",
  "extracted_requirement",
  "extracted_commitment",
  "risk_signal",
  "workflow_observation",
  "onboarding_note"
] as const satisfies readonly GateKeeperArtifactType[];

export const gateKeeperArtifactReviewStatuses = [
  "proposed",
  "accepted",
  "rejected",
  "dismissed"
] as const satisfies readonly GateKeeperArtifactReviewStatus[];

export const gateKeeperActionSuggestionTypes = [
  "create_opportunity",
  "update_opportunity",
  "schedule_site_assessment",
  "create_task_later",
  "send_followup_later",
  "update_project_notes",
  "flag_estimate_review",
  "flag_invoice_review",
  "flag_contract_review"
] as const satisfies readonly GateKeeperActionSuggestionType[];

export const gateKeeperActionSuggestionStatuses = [
  "proposed",
  "approved",
  "rejected",
  "dismissed",
  "superseded"
] as const satisfies readonly GateKeeperActionSuggestionStatus[];

export const membershipRoleRank: Record<MembershipRole, number> = {
  owner: 0,
  admin: 1,
  manager: 2,
  member: 3
};

export const projectStatusRank: Record<ProjectStatus, number> = {
  lead: 0,
  estimating: 1,
  approved: 2,
  scheduled: 3,
  in_progress: 4,
  completed: 5
};

export const estimateStatusRank: Record<EstimateStatus, number> = {
  draft: 0,
  sent: 1,
  approved: 2,
  rejected: 3
};

export const siteAssessmentStatusRank: Record<SiteAssessmentStatus, number> = {
  pending: 0,
  scheduled: 1,
  completed: 2
};

export const commercialReadinessStatusRank: Record<
  CommercialReadinessStatus,
  number
> = {
  not_ready: 0,
  waiting_on_estimate_approval: 1,
  waiting_on_contract: 2,
  waiting_on_internal_approval: 3,
  waiting_on_signature: 4,
  waiting_on_deposit: 5,
  waiting_on_financing: 6,
  ready_to_schedule: 7
};

export const opportunityStatusRank: Record<OpportunityStatus, number> = {
  new: 0,
  contacted: 1,
  qualified: 2,
  site_assessment_scheduled: 3,
  site_assessment_complete: 4,
  estimating: 5,
  proposal_sent: 6,
  won: 7,
  lost: 8,
  converted: 9
};

export const jobStatusRank: Record<JobStatus, number> = {
  unscheduled: 0,
  scheduled: 1,
  in_progress: 2,
  completed: 3
};

export const invoiceStatusRank: Record<InvoiceStatus, number> = {
  draft: 0,
  sent: 1,
  partially_paid: 2,
  paid: 3,
  void: 4
};

export const contractStatusRank: Record<ContractStatus, number> = {
  draft: 0,
  sent: 1,
  viewed: 2,
  signed: 3,
  void: 4
};

export const changeOrderStatusRank: Record<ChangeOrderStatus, number> = {
  draft: 0,
  sent: 1,
  approved: 2,
  rejected: 3
};

export const estimateStatusTransitions: Record<
  EstimateStatus,
  readonly EstimateStatus[]
> = {
  draft: ["sent", "approved", "rejected"],
  sent: ["approved", "rejected"],
  approved: [],
  rejected: []
};

export const contractStatusTransitions: Record<
  ContractStatus,
  readonly ContractStatus[]
> = {
  draft: ["sent", "void"],
  sent: ["viewed", "void"],
  viewed: ["signed", "void"],
  signed: [],
  void: []
};

export const changeOrderStatusTransitions: Record<
  ChangeOrderStatus,
  readonly ChangeOrderStatus[]
> = {
  draft: ["sent"],
  sent: ["approved", "rejected"],
  approved: [],
  rejected: ["draft"]
};

export function isMembershipRole(value: string): value is MembershipRole {
  return membershipRoles.includes(value as MembershipRole);
}

export function isMembershipStatus(value: string): value is MembershipStatus {
  return membershipStatuses.includes(value as MembershipStatus);
}

export function compareMembershipRoles(
  left: MembershipRole,
  right: MembershipRole
) {
  return membershipRoleRank[left] - membershipRoleRank[right];
}

export function compareProjectStatuses(
  left: ProjectStatus,
  right: ProjectStatus
) {
  return projectStatusRank[left] - projectStatusRank[right];
}

export function compareEstimateStatuses(
  left: EstimateStatus,
  right: EstimateStatus
) {
  return estimateStatusRank[left] - estimateStatusRank[right];
}

export function compareSiteAssessmentStatuses(
  left: SiteAssessmentStatus,
  right: SiteAssessmentStatus
) {
  return siteAssessmentStatusRank[left] - siteAssessmentStatusRank[right];
}

export function compareCommercialReadinessStatuses(
  left: CommercialReadinessStatus,
  right: CommercialReadinessStatus
) {
  return (
    commercialReadinessStatusRank[left] - commercialReadinessStatusRank[right]
  );
}

export function compareOpportunityStatuses(
  left: OpportunityStatus,
  right: OpportunityStatus
) {
  return opportunityStatusRank[left] - opportunityStatusRank[right];
}

export function compareJobStatuses(left: JobStatus, right: JobStatus) {
  return jobStatusRank[left] - jobStatusRank[right];
}

export function compareInvoiceStatuses(
  left: InvoiceStatus,
  right: InvoiceStatus
) {
  return invoiceStatusRank[left] - invoiceStatusRank[right];
}

export function compareContractStatuses(
  left: ContractStatus,
  right: ContractStatus
) {
  return contractStatusRank[left] - contractStatusRank[right];
}

export function compareChangeOrderStatuses(
  left: ChangeOrderStatus,
  right: ChangeOrderStatus
) {
  return changeOrderStatusRank[left] - changeOrderStatusRank[right];
}

export function canTransitionEstimateStatus(
  from: EstimateStatus,
  to: EstimateStatus
) {
  return estimateStatusTransitions[from].includes(to);
}

export function canTransitionContractStatus(
  from: ContractStatus,
  to: ContractStatus
) {
  return contractStatusTransitions[from].includes(to);
}

export function canTransitionChangeOrderStatus(
  from: ChangeOrderStatus,
  to: ChangeOrderStatus
) {
  return changeOrderStatusTransitions[from].includes(to);
}

export function canTransitionContractInternalApprovalStatus(
  from: ContractInternalApprovalStatus,
  to: ContractInternalApprovalStatus
) {
  return contractInternalApprovalTransitions[from].includes(to);
}

export function canTransitionContractSignerStatus(
  from: ContractSignerStatus,
  to: ContractSignerStatus
) {
  return contractSignerStatusTransitions[from].includes(to);
}

export function canTransitionDocumentSignerStatus(
  from: DocumentSignerStatus,
  to: DocumentSignerStatus
) {
  return documentSignerStatusTransitions[from].includes(to);
}

export function canTransitionPaymentStatus(
  from: PaymentStatus,
  to: PaymentStatus
) {
  return paymentStatusTransitions[from].includes(to);
}

export type ContractWorkflowGateInput = {
  status: ContractStatus;
  internalApprovalStatus: ContractInternalApprovalStatus;
  requireContractInternalApproval: boolean;
  signatureStartedAt: string | null;
  lockedAt: string | null;
};

export type ContractWorkflowGateResult = {
  canSend: boolean;
  isLocked: boolean;
  sendBlockers: string[];
};

export type ContractSignatureWorkflowSummaryInput = {
  status: ContractStatus;
  signatureReadinessStatus: SignatureReadinessStatus;
  signatureStartedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signatureDeclinedAt: string | null;
  signatureVoidedAt: string | null;
  signers: ReadonlyArray<{
    signerRole: ContractSignerRole;
    signerStatus: ContractSignerStatus;
  }>;
};

export type ContractSignatureWorkflowSummaryResult = {
  customerSignerCount: number;
  contractorSignerCount: number;
  pendingCustomerSignerCount: number;
  pendingContractorSignerCount: number;
  viewedCustomerSignerCount: number;
  signedCustomerSignerCount: number;
  signedContractorSignerCount: number;
  declinedSignerCount: number;
  anyCustomerInteraction: boolean;
  requiresCountersign: boolean;
  allCustomerSignersSigned: boolean;
  allRequiredSignersSigned: boolean;
  canCustomerAct: boolean;
  canContractorCountersign: boolean;
  isDeclined: boolean;
  isVoided: boolean;
  isCompleted: boolean;
};

export function computeContractWorkflowGate(
  input: ContractWorkflowGateInput
): ContractWorkflowGateResult {
  const sendBlockers: string[] = [];
  const isLocked =
    input.lockedAt !== null ||
    input.signatureStartedAt !== null ||
    input.status === "sent" ||
    input.status === "viewed" ||
    input.status === "signed" ||
    input.status === "void";

  if (input.status !== "draft") {
    sendBlockers.push("contract_not_in_draft");
  }

  if (isLocked) {
    sendBlockers.push("contract_locked");
  }

  if (input.requireContractInternalApproval) {
    if (input.internalApprovalStatus === "pending") {
      sendBlockers.push("internal_approval_pending");
    }

    if (input.internalApprovalStatus === "rejected") {
      sendBlockers.push("internal_approval_rejected");
    }
  }

  return {
    canSend: sendBlockers.length === 0,
    isLocked,
    sendBlockers
  };
}

export function computeContractSignatureWorkflowSummary(
  input: ContractSignatureWorkflowSummaryInput
): ContractSignatureWorkflowSummaryResult {
  const customerSigners = input.signers.filter(
    (signer) => signer.signerRole === "customer"
  );
  const contractorSigners = input.signers.filter(
    (signer) => signer.signerRole === "contractor"
  );
  const pendingCustomerSignerCount = customerSigners.filter(
    (signer) => signer.signerStatus === "pending"
  ).length;
  const actionableCustomerSignerCount = customerSigners.filter(
    (signer) =>
      signer.signerStatus === "pending" || signer.signerStatus === "viewed"
  ).length;
  const pendingContractorSignerCount = contractorSigners.filter(
    (signer) => signer.signerStatus === "pending"
  ).length;
  const actionableContractorSignerCount = contractorSigners.filter(
    (signer) =>
      signer.signerStatus === "pending" || signer.signerStatus === "viewed"
  ).length;
  const viewedCustomerSignerCount = customerSigners.filter(
    (signer) => signer.signerStatus === "viewed"
  ).length;
  const signedCustomerSignerCount = customerSigners.filter(
    (signer) => signer.signerStatus === "signed"
  ).length;
  const signedContractorSignerCount = contractorSigners.filter(
    (signer) => signer.signerStatus === "signed"
  ).length;
  const declinedSignerCount = input.signers.filter(
    (signer) => signer.signerStatus === "declined"
  ).length;
  const customerSignerCount = customerSigners.length;
  const contractorSignerCount = contractorSigners.length;
  const requiresCountersign = contractorSignerCount > 0;
  const allCustomerSignersSigned =
    customerSignerCount > 0 &&
    signedCustomerSignerCount === customerSignerCount;
  const allRequiredSignersSigned =
    allCustomerSignersSigned &&
    (!requiresCountersign ||
      signedContractorSignerCount === contractorSignerCount);
  const anyCustomerInteraction =
    input.customerSignedAt !== null ||
    customerSigners.some(
      (signer) =>
        signer.signerStatus === "viewed" ||
        signer.signerStatus === "signed" ||
        signer.signerStatus === "declined"
    );
  const isDeclined =
    input.signatureDeclinedAt !== null ||
    input.signers.some((signer) => signer.signerStatus === "declined");
  const isVoided =
    input.status === "void" ||
    input.signatureVoidedAt !== null ||
    input.signers.some((signer) => signer.signerStatus === "voided");
  const isCompleted =
    input.status === "signed" ||
    input.signatureReadinessStatus === "signed" ||
    (input.signatureStartedAt !== null && allRequiredSignersSigned);

  return {
    customerSignerCount,
    contractorSignerCount,
    pendingCustomerSignerCount,
    pendingContractorSignerCount,
    viewedCustomerSignerCount,
    signedCustomerSignerCount,
    signedContractorSignerCount,
    declinedSignerCount,
    anyCustomerInteraction,
    requiresCountersign,
    allCustomerSignersSigned,
    allRequiredSignersSigned,
    canCustomerAct:
      !isVoided &&
      !isCompleted &&
      !isDeclined &&
      actionableCustomerSignerCount > 0,
    canContractorCountersign:
      !isVoided &&
      !isCompleted &&
      !isDeclined &&
      requiresCountersign &&
      allCustomerSignersSigned &&
      actionableContractorSignerCount > 0,
    isDeclined,
    isVoided,
    isCompleted
  };
}

export type CommercialReadinessInput = {
  estimateStatus: EstimateStatus | null;
  siteAssessmentStatus: SiteAssessmentStatus | null;
  hasContract: boolean;
  contractInternalApprovalStatus: ContractInternalApprovalStatus | null;
  contractStatus: ContractStatus | null;
  requireContractInternalApproval: boolean;
  requireContractSignatureBeforeJobScheduling: boolean;
  requireDepositBeforeJobScheduling: boolean;
  requireFinancingApprovalBeforeJobScheduling: boolean;
  financingStatus: FinancingStatus;
  depositInvoiceStatus: InvoiceStatus | null;
  depositInvoiceRole: InvoiceWorkflowRole | null;
};

export type InvoicePaymentWorkflowGateInput = {
  invoiceStatus: InvoiceStatus;
  balanceDueAmount: string;
};

export type InvoicePaymentWorkflowGateResult = {
  canRequestPayment: boolean;
  canStartCheckout: boolean;
  canRecordSuccess: boolean;
  hasBalanceDue: boolean;
  isSettled: boolean;
  requestBlockers: string[];
};

export function computeInvoicePaymentWorkflowGate(
  input: InvoicePaymentWorkflowGateInput
): InvoicePaymentWorkflowGateResult {
  const balanceDue = Number(input.balanceDueAmount);
  const hasBalanceDue = balanceDue > 0;
  const requestBlockers: string[] = [];

  if (input.invoiceStatus === "draft") {
    requestBlockers.push("invoice_not_sent");
  }

  if (input.invoiceStatus === "void") {
    requestBlockers.push("invoice_void");
  }

  if (!hasBalanceDue || input.invoiceStatus === "paid") {
    requestBlockers.push("no_balance_due");
  }

  return {
    canRequestPayment: requestBlockers.length === 0,
    canStartCheckout: requestBlockers.length === 0,
    canRecordSuccess: requestBlockers.length === 0,
    hasBalanceDue,
    isSettled: !hasBalanceDue || input.invoiceStatus === "paid",
    requestBlockers
  };
}

export type CommercialReadinessResult = {
  blockers: CommercialReadinessBlocker[];
  isReadyToSchedule: boolean;
  status: CommercialReadinessStatus;
};

export function computeCommercialReadiness(
  input: CommercialReadinessInput
): CommercialReadinessResult {
  const blockers: CommercialReadinessBlocker[] = [];

  if (
    input.siteAssessmentStatus &&
    input.siteAssessmentStatus !== "completed" &&
    (input.estimateStatus === null || input.estimateStatus === "draft")
  ) {
    blockers.push("site_assessment_incomplete");
  }

  if (input.estimateStatus !== "approved") {
    blockers.push("estimate_not_approved");
  }

  if (!input.hasContract) {
    blockers.push("contract_missing");
  }

  if (
    input.hasContract &&
    input.requireContractInternalApproval &&
    input.contractInternalApprovalStatus !== "approved"
  ) {
    blockers.push("contract_internal_approval_pending");
  }

  if (
    input.hasContract &&
    input.requireContractSignatureBeforeJobScheduling &&
    input.contractStatus !== "signed"
  ) {
    blockers.push("contract_signature_pending");
  }

  if (input.requireDepositBeforeJobScheduling) {
    const depositPaid =
      input.depositInvoiceRole === "deposit" &&
      input.depositInvoiceStatus === "paid";

    if (!depositPaid) {
      blockers.push("deposit_required");
    }
  }

  if (input.requireFinancingApprovalBeforeJobScheduling) {
    if (input.financingStatus === "declined") {
      blockers.push("financing_declined");
    } else if (input.financingStatus !== "approved") {
      blockers.push("financing_pending");
    }
  }

  const status: CommercialReadinessStatus =
    blockers.length === 0
      ? "ready_to_schedule"
      : blockers.includes("estimate_not_approved")
        ? "waiting_on_estimate_approval"
        : blockers.includes("contract_missing")
          ? "waiting_on_contract"
          : blockers.includes("contract_internal_approval_pending")
            ? "waiting_on_internal_approval"
            : blockers.includes("contract_signature_pending")
              ? "waiting_on_signature"
              : blockers.includes("deposit_required")
                ? "waiting_on_deposit"
                : blockers.includes("financing_pending") ||
                    blockers.includes("financing_declined")
                  ? "waiting_on_financing"
                  : "not_ready";

  return {
    blockers,
    isReadyToSchedule: blockers.length === 0,
    status
  };
}

export type TimePunchEventDerivationInput = {
  id: string;
  eventType: TimePunchEventType;
  occurredAt: string;
  projectId: string | null;
  jobId: string | null;
  serviceTicketId: string | null;
  notes: string | null;
};

export type DerivedTimeCardSnapshot = {
  workDate: string;
  projectId: string | null;
  jobId: string | null;
  serviceTicketId: string | null;
  sourcePunchInEventId: string;
  sourcePunchOutEventId: string | null;
  punchInAt: string;
  punchOutAt: string | null;
  breakMinutes: number;
  workedMinutes: number;
  status: TimeCardStatus;
  entryMode: TimeCardEntryMode;
  notes: string | null;
};

export type DailyLogLaborSummaryDerivationInput = {
  personId: string;
  personDisplayName: string | null;
  jobId: string | null;
  jobLabel: string | null;
  workedMinutes: number;
};

export type DerivedDailyLogLaborSummaryEntry = {
  personId: string;
  personDisplayName: string | null;
  jobId: string | null;
  jobLabel: string | null;
  timeCardCount: number;
  workedMinutes: number;
};

export type DerivedDailyLogLaborSummary = {
  peopleOnSiteCount: number;
  totalWorkedMinutes: number;
  totalHoursWorked: number;
  totalTimeCardCount: number;
  entries: DerivedDailyLogLaborSummaryEntry[];
};

function toEpochMilliseconds(value: string) {
  return new Date(value).getTime();
}

function toUtcWorkDate(value: string) {
  return value.slice(0, 10);
}

function diffMinutes(start: string, end: string) {
  const milliseconds = toEpochMilliseconds(end) - toEpochMilliseconds(start);

  return Math.max(0, Math.floor(milliseconds / 60000));
}

export function deriveTimeCardsFromPunchEvents(
  events: readonly TimePunchEventDerivationInput[]
): DerivedTimeCardSnapshot[] {
  const sortedEvents = [...events].sort((left, right) => {
    const occurredComparison = left.occurredAt.localeCompare(right.occurredAt);

    if (occurredComparison !== 0) {
      return occurredComparison;
    }

    return left.id.localeCompare(right.id);
  });

  const derivedCards: DerivedTimeCardSnapshot[] = [];
  let currentCard: DerivedTimeCardSnapshot | null = null;
  let breakStartedAt: string | null = null;
  let lastEventAt: string | null = null;

  function pushCurrentCard(statusOverride?: TimeCardStatus) {
    if (!currentCard) {
      return;
    }

    let breakMinutes = currentCard.breakMinutes;

    if (breakStartedAt && lastEventAt && lastEventAt >= breakStartedAt) {
      breakMinutes += diffMinutes(breakStartedAt, lastEventAt);
    }

    const effectiveEnd =
      currentCard.punchOutAt ?? lastEventAt ?? currentCard.punchInAt;
    const totalMinutes = diffMinutes(currentCard.punchInAt, effectiveEnd);

    derivedCards.push({
      ...currentCard,
      breakMinutes,
      workedMinutes: Math.max(0, totalMinutes - breakMinutes),
      status: statusOverride ?? currentCard.status
    });

    currentCard = null;
    breakStartedAt = null;
    lastEventAt = null;
  }

  for (const event of sortedEvents) {
    lastEventAt = event.occurredAt;

    switch (event.eventType) {
      case "punch_in": {
        if (currentCard) {
          pushCurrentCard("flagged");
        }

        currentCard = {
          workDate: toUtcWorkDate(event.occurredAt),
          projectId: event.projectId,
          jobId: event.jobId,
          serviceTicketId: event.serviceTicketId,
          sourcePunchInEventId: event.id,
          sourcePunchOutEventId: null,
          punchInAt: event.occurredAt,
          punchOutAt: null,
          breakMinutes: 0,
          workedMinutes: 0,
          status: "open",
          entryMode: "derived_from_punches",
          notes: event.notes
        };
        breakStartedAt = null;
        break;
      }
      case "break_start": {
        if (!currentCard || breakStartedAt) {
          if (currentCard) {
            currentCard.status = "flagged";
          }
          break;
        }

        breakStartedAt = event.occurredAt;
        break;
      }
      case "break_end": {
        if (!currentCard || !breakStartedAt) {
          if (currentCard) {
            currentCard.status = "flagged";
          }
          break;
        }

        currentCard.breakMinutes += diffMinutes(
          breakStartedAt,
          event.occurredAt
        );
        breakStartedAt = null;
        break;
      }
      case "punch_out": {
        if (!currentCard) {
          break;
        }

        if (breakStartedAt) {
          currentCard.breakMinutes += diffMinutes(
            breakStartedAt,
            event.occurredAt
          );
          breakStartedAt = null;
          currentCard.status = "flagged";
        }

        currentCard.punchOutAt = event.occurredAt;
        currentCard.sourcePunchOutEventId = event.id;
        currentCard.status =
          currentCard.status === "flagged" ? "flagged" : "completed";
        pushCurrentCard(currentCard.status);
        break;
      }
      default: {
        break;
      }
    }
  }

  if (currentCard) {
    pushCurrentCard(currentCard.status);
  }

  return derivedCards;
}

export function deriveDailyLogLaborSummary(
  entries: readonly DailyLogLaborSummaryDerivationInput[]
): DerivedDailyLogLaborSummary {
  const groupedEntries = new Map<string, DerivedDailyLogLaborSummaryEntry>();
  const peopleOnSite = new Set<string>();
  let totalWorkedMinutes = 0;

  for (const entry of entries) {
    peopleOnSite.add(entry.personId);
    totalWorkedMinutes += entry.workedMinutes;

    const key = `${entry.personId}::${entry.jobId ?? "no-job"}`;
    const existing = groupedEntries.get(key);

    if (existing) {
      existing.timeCardCount += 1;
      existing.workedMinutes += entry.workedMinutes;
      continue;
    }

    groupedEntries.set(key, {
      personId: entry.personId,
      personDisplayName: entry.personDisplayName,
      jobId: entry.jobId,
      jobLabel: entry.jobLabel,
      timeCardCount: 1,
      workedMinutes: entry.workedMinutes
    });
  }

  const derivedEntries = [...groupedEntries.values()].sort((left, right) => {
    if (right.workedMinutes !== left.workedMinutes) {
      return right.workedMinutes - left.workedMinutes;
    }

    if ((left.personDisplayName ?? "") !== (right.personDisplayName ?? "")) {
      return (left.personDisplayName ?? "").localeCompare(
        right.personDisplayName ?? ""
      );
    }

    return (left.jobLabel ?? "").localeCompare(right.jobLabel ?? "");
  });

  return {
    peopleOnSiteCount: peopleOnSite.size,
    totalWorkedMinutes,
    totalHoursWorked: Math.round((totalWorkedMinutes / 60) * 100) / 100,
    totalTimeCardCount: entries.length,
    entries: derivedEntries
  };
}
