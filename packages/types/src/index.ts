export type ProfileId = string;
export type OrganizationId = string;
export type MembershipId = string;
export type ContactId = string;
export type CustomerContactId = string;
export type OpportunityId = string;
export type CustomerId = string;
export type ProjectId = string;
export type EstimateId = string;
export type EstimateCustomerEventId = string;
export type NotificationEventId = string;
export type NotificationId = string;
export type NotificationDeliveryId = string;
export type EstimateCommercialSnapshotId = string;
export type EstimateCommercialSnapshotItemId = string;
export type JobId = string;
export type JobAssignmentId = string;
export type InvoiceId = string;
export type InvoiceEventId = string;
export type PaymentId = string;
export type PaymentEventId = string;
export type ScheduleOfValuesId = string;
export type TemplateId = string;
export type PlatformTemplateSeedId = string;
export type PlatformStarterPackId = string;
export type PlatformStarterPackItemId = string;
export type PlatformStarterPackAssignmentId = string;
export type PlatformStarterPackProvisioningRunId = string;
export type PlatformStarterPackProvisioningRunItemId = string;
export type PlatformStarterPackProvisioningAttemptId = string;
export type PlatformPackageDefinitionId = string;
export type PlatformPackageDefinitionVersionId = string;
export type PlatformPackageDefinitionAuditEventId = string;
export type ContractorPackageAssignmentId = string;
export type ContractorPackageAssignmentAuditEventId = string;
export type ContractorPackageBillingMappingId = string;
export type ContractorPackageBillingMappingAuditEventId = string;
export type ContractorPackageBillingSupportReviewId = string;
export type ContractorPackageBillingSupportReviewEventId = string;
export type ContractorGroupId = string;
export type ContractorGroupMembershipId = string;
export type ContractorGroupAuditEventId = string;
export type WorkItemId = string;
export type ContractId = string;
export type ContractRevisionId = string;
export type ContractSignerId = string;
export type ContractSignatureEventId = string;
export type ChangeOrderId = string;
export type ChangeOrderEventId = string;
export type RecordRevisionId = string;
export type CommunicationThreadId = string;
export type CommunicationMessageId = string;
export type CommunicationPreferenceId = string;
export type GateKeeperArtifactId = string;
export type GateKeeperActionSuggestionId = string;
export type CatalogItemId = string;
export type InventoryItemId = string;
export type InventoryTransactionId = string;
export type CostItemComponentId = string;
export type TaxCodeId = string;
export type PlatformCatalogItemSeedId = string;
export type PlatformUserRoleId = string;
export type VendorId = string;
export type EquipmentAssetId = string;
export type JobEquipmentRequirementId = string;
export type EquipmentAssignmentId = string;
export type PersonId = string;
export type ComplianceRecordId = string;
export type TimePunchEventId = string;
export type TimeCardId = string;
export type ServiceTicketId = string;
export type WarrantyDocumentId = string;
export type DocumentSignerId = string;
export type DocumentSignatureEventId = string;
export type DocumentDeliveryEventId = string;
export type DailyLogId = string;
export type FieldNoteId = string;
export type ExecutionAttachmentId = string;
export type PortalEvidenceGrantId = string;
export type EstimateAttachmentId = string;
export type PunchlistItemId = string;
export type AppointmentId = string;
export type PortalAccessGrantId = string;
export type PortalProjectAccessId = string;
export type PortalRecordViewId = string;
export type OpportunityMeasurementId = string;
export type OpportunityAttachmentId = string;
export type OpportunityObservationId = string;

export type MembershipRole = "owner" | "admin" | "manager" | "member";
export type ContactKind =
  | "customer_contact"
  | "billing_contact"
  | "portal_contact"
  | "vendor_contact"
  | "employee"
  | "general_inquiry";
export type ProjectStatus =
  | "lead"
  | "estimating"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "completed";
export type EstimateStatus = "draft" | "sent" | "approved" | "rejected";
export type EstimateCustomerEventType =
  | "sent"
  | "viewed"
  | "comment_added"
  | "approved"
  | "rejected";
export type EstimateCustomerEventActorType =
  | "organization_user"
  | "portal_user"
  | "system";
export type NotificationEventCategory =
  | "estimates"
  | "contracts"
  | "invoices"
  | "change_orders"
  | "payments"
  | "communication"
  | "system";
export type NotificationEventSeverity = "critical" | "warning" | "neutral";
export type NotificationActorType =
  | "organization_user"
  | "portal_user"
  | "provider"
  | "system";
export type NotificationChannel = "in_app" | "email" | "sms";
export type NotificationDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "failed";
export type CanonicalRecordSubjectType =
  | "opportunity"
  | "appointment"
  | "customer"
  | "project"
  | "estimate"
  | "contract"
  | "invoice"
  | "change_order"
  | "payment";
export type GateKeeperSubjectType =
  | CanonicalRecordSubjectType
  | "job"
  | "person"
  | "vendor";
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
export type RecordRevisionSubjectType =
  | "estimate"
  | "invoice"
  | "contract"
  | "change_order";
export type RecordRevisionKind =
  | "created"
  | "edited"
  | "sent"
  | "status_change"
  | "system_snapshot"
  | "pre_signature"
  | "pre_payment"
  | "manual";
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
export type PaymentRecordedVia =
  | "contractor_app"
  | "customer_portal"
  | "system";
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
export type InvoiceEventType =
  | "sent"
  | "viewed"
  | "payment_requested"
  | "paid"
  | "failed"
  | "voided";
export type ChangeOrderEventType = "sent" | "viewed" | "approved" | "rejected";
export type CommunicationMessageSenderType =
  | "organization_user"
  | "portal_user"
  | "system";
export type CommunicationThreadCategory =
  | "operational"
  | "sales"
  | "support"
  | "billing"
  | "field"
  | "success"
  | "unknown";
export type CommunicationChannelKind =
  | "phone"
  | "sms"
  | "email"
  | "web_chat"
  | "portal"
  | "internal_note"
  | "assistant_note"
  | "unknown";
export type CommunicationThreadStatus =
  | "open"
  | "waiting_on_customer"
  | "waiting_on_contractor"
  | "closed"
  | "archived";
export type CommunicationMessageDirection =
  | "inbound"
  | "outbound"
  | "internal"
  | "system";
export type CommunicationMessageSourceKind =
  | "human"
  | "assistant"
  | "system"
  | "provider_placeholder";
export type CommunicationMessageKind =
  | "customer_message"
  | "manual_call"
  | "manual_email_note"
  | "manual_text_note"
  | "voicemail"
  | "internal_note"
  | "appointment_note"
  | "appointment_confirmation"
  | "appointment_reminder";
export type CommunicationMessageVisibility = "internal" | "customer_visible";
export type CommunicationMessageDeliveryStatus = "logged" | "draft" | "sent";
export type CommunicationPreferenceSubjectType =
  | "customer"
  | "customer_contact"
  | "contact";
export type CommunicationPreferenceChannel = "email" | "sms";
export type CommunicationPreferenceMessageCategory =
  | "appointment_confirmation"
  | "appointment_reminder";
export type CommunicationPreferenceStatus =
  | "allowed"
  | "opted_out"
  | "suppressed";
export type CommunicationPreferenceSource =
  | "manual"
  | "portal"
  | "provider"
  | "import"
  | "system";
export type GateKeeperArtifactType =
  | "call_summary"
  | "transcript_placeholder"
  | "extracted_requirement"
  | "extracted_commitment"
  | "risk_signal"
  | "workflow_observation"
  | "onboarding_note";
export type GateKeeperArtifactReviewStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "dismissed";
export type GateKeeperActionSuggestionType =
  | "create_opportunity"
  | "update_opportunity"
  | "schedule_site_assessment"
  | "create_task_later"
  | "send_followup_later"
  | "update_project_notes"
  | "flag_estimate_review"
  | "flag_invoice_review"
  | "flag_contract_review";
export type GateKeeperActionSuggestionStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "dismissed"
  | "superseded";
export type WorkItemStatus = "open" | "completed" | "dismissed";
export type WorkItemPriority = "low" | "normal" | "high" | "urgent";
export type WorkItemKind =
  | "manual"
  | "lead_follow_up"
  | "appointment_confirmation_prep"
  | "appointment_follow_up"
  | "estimate_follow_up"
  | "invoice_follow_up"
  | "human_handoff";
export type WorkItemSourceType =
  | "opportunity"
  | "appointment"
  | "customer"
  | "project"
  | "estimate"
  | "contract"
  | "change_order"
  | "job"
  | "invoice"
  | "payment"
  | "communication_thread"
  | "notification_event"
  | "workflow_error_event";
export type WorkItemVisibility = "internal";
export type TaxBehavior = "exclusive" | "inclusive" | "none";
export type InventoryTransactionType =
  | "purchase"
  | "adjustment"
  | "job_usage"
  | "return"
  | "waste"
  | "transfer";
export type CostItemComponentType =
  | "inventory"
  | "labor"
  | "equipment"
  | "subcontractor"
  | "fee"
  | "other";
export type TemplateType = "estimate" | "invoice" | "contract" | "warranty";
export type DocumentTemplateStatus = "active" | "archived";
export type CatalogItemType =
  | "material"
  | "labor"
  | "service"
  | "equipment"
  | "subcontractor"
  | "other"
  | "system";
export type InvoiceWorkflowRole = "standard" | "deposit";
export type WorkforcePersonType = "employee" | "subcontractor_worker";
export type VendorType = "subcontractor" | "supplier" | "other";
export type EquipmentType =
  | "grinder"
  | "polisher"
  | "vacuum"
  | "dust_collector"
  | "shot_blaster"
  | "scarifier"
  | "scraper"
  | "mixer"
  | "sprayer"
  | "trailer"
  | "truck"
  | "generator"
  | "moisture_meter"
  | "testing_tool"
  | "coating_tool"
  | "burnisher"
  | "hand_tool"
  | "kit"
  | "other";
export type EquipmentOwnershipStatus =
  | "owned"
  | "rented"
  | "leased"
  | "subcontractor_owned"
  | "other";
export type EquipmentOperationalStatus =
  | "available"
  | "assigned"
  | "in_use"
  | "maintenance"
  | "out_of_service"
  | "retired";
export type EquipmentAssignmentStatus =
  | "planned"
  | "assigned"
  | "in_use"
  | "returned"
  | "canceled";
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
export type TimeCardEntryMode = "derived_from_punches" | "manual" | "adjusted";
export type TimeCardReviewStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "rejected";
export type ServiceTicketSourceType =
  | "internal"
  | "closeout_follow_up"
  | "punchlist_conversion"
  | "customer_reported_future"
  | "other";
export type ServiceTicketType =
  | "warranty"
  | "service"
  | "callback"
  | "inspection"
  | "other";
export type ServiceTicketStatus =
  | "open"
  | "scheduled"
  | "in_progress"
  | "resolved"
  | "closed"
  | "canceled";
export type ServiceTicketPriority = "low" | "normal" | "high" | "urgent";
export type WarrantyDocumentStatus =
  | "draft"
  | "issued"
  | "sent"
  | "viewed"
  | "signed"
  | "void";
export type DocumentSignatureSubjectType = "warranty_document";
export type DocumentSignerRole = "customer" | "contractor";
export type DocumentSignerStatus =
  | "pending"
  | "requested"
  | "viewed"
  | "signed"
  | "declined"
  | "voided";
export type DocumentSignatureEventType =
  | "signature_requested"
  | "viewed"
  | "signed"
  | "declined"
  | "voided";
export type DocumentDeliverySubjectType =
  | "warranty_document"
  | "estimate"
  | "invoice"
  | "contract";
export type DocumentDeliveryEventType =
  | "delivery_recorded"
  | "send_requested"
  | "sent"
  | "viewed"
  | "failed"
  | "bounced"
  | "opened"
  | "clicked";
export type DocumentDeliveryChannel =
  | "internal"
  | "portal"
  | "email"
  | "print"
  | "manual";
export type DailyLogStatus = "draft" | "finalized";
export type PunchlistStatus = "open" | "in_progress" | "resolved" | "closed";
export type AppointmentType =
  | "site_visit"
  | "customer_meeting"
  | "estimate_appointment"
  | "follow_up"
  | "internal";
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "canceled"
  | "no_show";
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
export type OpportunityAttachmentType = "photo" | "file";
export type PortalAccessGrantStatus = "invited" | "active" | "revoked";
export type PortalProjectAccessStatus = "active" | "revoked";
export type PortalEvidenceGrantSubjectType = "execution_attachment";
export type PortalEvidenceGrantStatus = "shared" | "revoked";
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

export type MembershipStatus = "invited" | "active" | "inactive" | "suspended";
export type MeasurementCaptureMethod =
  | "manual"
  | "onsite"
  | "photo_derived"
  | "imported";
export type OpportunityObservationSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

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
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  primaryTrade: string | null;
  brandAccentColor: string | null;
  timeZone: string | null;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
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

export interface Contact {
  id: ContactId;
  organizationId: OrganizationId;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  contactKind: ContactKind;
  notes: string | null;
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

export interface CustomerContact {
  id: CustomerContactId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  contactId: ContactId;
  relationshipLabel: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: OpportunityId;
  organizationId: OrganizationId;
  primaryContactId: ContactId | null;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  status: OpportunityStatus;
  title: string;
  source: string | null;
  sourceDetail: string | null;
  serviceType: string | null;
  jobType: string | null;
  siteName: string | null;
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
  nextFollowUpAt: string | null;
  nextFollowUpNote: string | null;
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

export type AutomationNotificationPreferenceCategory =
  | "customer_message_received"
  | "estimate_awaiting_approval"
  | "contract_awaiting_signature"
  | "contract_signed"
  | "deposit_paid_ready_to_schedule"
  | "payment_failed"
  | "invoice_overdue"
  | "change_order_approved"
  | "schedule_reminder"
  | "crew_assignment_reminder";

export type AutomationNotificationPreferenceRole =
  | "owner"
  | "admin"
  | "manager"
  | "member";

export type OperationalCueKey =
  | "estimate_sent_followup"
  | "contract_sent_unsigned"
  | "contract_viewed_unsigned"
  | "invoice_overdue"
  | "deposit_invoice_unpaid"
  | "job_ready_unscheduled"
  | "job_scheduled_missing_crew";

export type OperationalCueSubjectType =
  | "estimate"
  | "contract"
  | "invoice"
  | "job";
export type OperationalCueUrgency = "normal" | "high" | "critical";
export type OperationalCueOwnerStrategy =
  | "record_owner"
  | "organization"
  | "estimator"
  | "project_manager"
  | "billing_owner"
  | "scheduler";
export type OrganizationResponsibilityRoleKey =
  | "estimator"
  | "project_manager"
  | "billing_owner"
  | "scheduler";

export interface OrganizationOperationalCueRule {
  id: string;
  organizationId: OrganizationId;
  cueKey: OperationalCueKey;
  subjectType: OperationalCueSubjectType;
  enabled: boolean;
  thresholdDays: number | null;
  urgency: OperationalCueUrgency;
  ownerStrategy: OperationalCueOwnerStrategy;
  escalationDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponsibilityRoleDefault {
  id: string;
  organizationId: OrganizationId;
  roleKey: OrganizationResponsibilityRoleKey;
  personId: PersonId;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationNotificationPreference {
  category: AutomationNotificationPreferenceCategory;
  enabledForFutureExecution: boolean;
  notifyRoles: AutomationNotificationPreferenceRole[];
}

export type WorkflowGuidanceMode = "guided" | "flexible" | "manual";

export interface WorkflowGuidancePreferences {
  workflowMode: WorkflowGuidanceMode;
  showNextBestActions: boolean;
  showReadinessGuidance: boolean;
  strictReadinessEnforcement: boolean;
  allowOneOffInvoiceShortcuts: boolean;
  showShortcutCleanupPrompts: boolean;
  showWorkflowExplanationCopy: boolean;
  enableAiSuggestions: boolean;
  enableAiSummaries: boolean;
  enableAiDrafting: boolean;
  enableAiDashboardDigest: boolean;
  enableAiProviderEnhancements: boolean;
  enableAiFormPrefillSuggestions: boolean;
  enableAiWorkItemRecommendations: boolean;
  requireConfirmationBeforeAiActions: boolean;
}

export interface AutomationNotificationTemplateContextField {
  key: string;
  label: string;
  description: string;
}

export interface AutomationNotificationTemplateDefinition {
  category: AutomationNotificationPreferenceCategory;
  displayName: string;
  intendedRecipients: AutomationNotificationPreferenceRole[];
  triggerSource: string;
  sampleSubject: string;
  sampleBody: string;
  requiredCanonicalContextFields: AutomationNotificationTemplateContextField[];
  executionAvailable: false;
}

export type AutomationPlanningReadinessStatus =
  | "planning_ready"
  | "needs_preferences"
  | "needs_sample_context"
  | "needs_preferences_and_sample_context";

export interface AutomationPlanningSummary {
  category: AutomationNotificationPreferenceCategory;
  displayName: string;
  preferenceSummary: string;
  eligibilitySummary: string;
  templateSummary: string;
  readinessStatus: AutomationPlanningReadinessStatus;
  blockers: string[];
  nextSafeImplementationStep: string;
  executionAvailable: boolean;
}

export interface OrganizationWorkflowSettings {
  organizationId: OrganizationId;
  approvedEstimateContractTemplateId: TemplateId | null;
  requireContractInternalApproval: boolean;
  requireContractSignatureBeforeJobScheduling: boolean;
  requireDepositBeforeJobScheduling: boolean;
  requireFinancingApprovalBeforeJobScheduling: boolean;
  defaultDepositPercentage: string;
  defaultEstimateTermsHtml: string | null;
  defaultEstimateInclusionsHtml: string | null;
  defaultEstimateExclusionsHtml: string | null;
  defaultEstimateScopeSummaryHtml: string | null;
  nextEstimateNumber: number;
  nextInvoiceNumber: number;
  nextChangeOrderNumber: number;
  nextContractNumber: number;
  automationNotificationPreferences: AutomationNotificationPreference[];
  workflowGuidancePreferences: WorkflowGuidancePreferences;
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
  defaultEstimateTermsHtml: string | null;
  defaultEstimateInclusionsHtml: string | null;
  defaultEstimateExclusionsHtml: string | null;
  defaultEstimateScopeSummaryHtml: string | null;
  defaultEstimateStartNumber: number;
  defaultInvoiceStartNumber: number;
  defaultChangeOrderStartNumber: number;
  defaultContractStartNumber: number;
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
  operationalActivatedAt: string | null;
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
  opportunityId: OpportunityId;
  customerId: CustomerId;
  projectId: ProjectId;
  templateId: TemplateId | null;
  referenceNumber: string;
  title: string | null;
  status: EstimateStatus;
  estimateDate: string | null;
  expirationDate: string | null;
  projectType: string | null;
  sector: string | null;
  subtotalAmount: string;
  taxableSalesAmount: string;
  exemptSalesAmount: string;
  taxRateApplied: string;
  taxBehaviorApplied: TaxBehavior;
  customerTaxExemptSnapshot: boolean;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes: string | null;
  content: EstimateWorkspaceContent;
  sentAt: string | null;
  sentByUserId: ProfileId | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  approvedByPortalUserId: ProfileId | null;
  rejectedAt: string | null;
  rejectedByPortalUserId: ProfileId | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateCustomerEvent {
  id: EstimateCustomerEventId;
  organizationId: OrganizationId;
  estimateId: EstimateId;
  customerId: CustomerId;
  projectId: ProjectId;
  eventType: EstimateCustomerEventType;
  actorType: EstimateCustomerEventActorType;
  organizationUserId: ProfileId | null;
  portalUserId: ProfileId | null;
  eventNote: string | null;
  emailRecipient: string | null;
  emailTrackingToken: string | null;
  emailOpenedAt: string | null;
  emailClickedAt: string | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface NotificationEvent {
  id: NotificationEventId;
  organizationId: OrganizationId;
  category: NotificationEventCategory;
  severity: NotificationEventSeverity;
  eventType: string;
  subjectType: CanonicalRecordSubjectType;
  subjectId: string;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  actorType: NotificationActorType;
  actorUserId: ProfileId | null;
  portalUserId: ProfileId | null;
  title: string;
  message: string;
  linkPath: string;
  groupKey: string | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface Notification {
  id: NotificationId;
  organizationId: OrganizationId;
  notificationEventId: NotificationEventId;
  userId: ProfileId;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDelivery {
  id: NotificationDeliveryId;
  organizationId: OrganizationId;
  notificationEventId: NotificationEventId;
  communicationMessageId: CommunicationMessageId | null;
  channel: NotificationChannel;
  provider: string | null;
  status: NotificationDeliveryStatus;
  recipientUserId: ProfileId | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  trackingToken: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  payload: Record<string, unknown> | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationPreference {
  id: CommunicationPreferenceId;
  organizationId: OrganizationId;
  subjectType: CommunicationPreferenceSubjectType;
  subjectId: string;
  channel: CommunicationPreferenceChannel;
  messageCategory: CommunicationPreferenceMessageCategory;
  status: CommunicationPreferenceStatus;
  source: CommunicationPreferenceSource;
  reason: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItem {
  id: WorkItemId;
  organizationId: OrganizationId;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  kind: WorkItemKind;
  dueAt: string | null;
  assignedPersonId: PersonId | null;
  sourceType: WorkItemSourceType | null;
  sourceId: string | null;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  linkPath: string | null;
  visibility: WorkItemVisibility;
  dedupeKey: string | null;
  metadata: Record<string, unknown>;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  completedByUserId: ProfileId | null;
  completedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateCommercialSnapshot {
  id: EstimateCommercialSnapshotId;
  organizationId: OrganizationId;
  estimateId: EstimateId;
  customerId: CustomerId;
  projectId: ProjectId;
  snapshotVersion: number;
  templateId: TemplateId | null;
  estimateReferenceNumber: string;
  estimateTitle: string | null;
  estimateStatus: EstimateStatus;
  estimateDate: string | null;
  expirationDate: string | null;
  projectType: string | null;
  sector: string | null;
  subtotalAmount: string;
  taxableSalesAmount: string;
  exemptSalesAmount: string;
  taxRateApplied: string;
  taxBehaviorApplied: TaxBehavior;
  customerTaxExemptSnapshot: boolean;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes: string | null;
  termsHtml: string | null;
  inclusionsHtml: string | null;
  exclusionsHtml: string | null;
  scopeSummaryHtml: string | null;
  notesHtml: string | null;
  contentSnapshot: Record<string, unknown> | null;
  customerNameSnapshot: string;
  customerCompanyNameSnapshot: string | null;
  customerPhoneSnapshot: string | null;
  customerEmailSnapshot: string | null;
  customerAddressLine1Snapshot: string | null;
  customerAddressLine2Snapshot: string | null;
  customerCitySnapshot: string | null;
  customerStateRegionSnapshot: string | null;
  customerPostalCodeSnapshot: string | null;
  customerCountryCodeSnapshot: string | null;
  serviceAddressLine1Snapshot: string | null;
  serviceAddressLine2Snapshot: string | null;
  serviceCitySnapshot: string | null;
  serviceStateRegionSnapshot: string | null;
  servicePostalCodeSnapshot: string | null;
  serviceCountryCodeSnapshot: string | null;
  projectNameSnapshot: string;
  approvedAt: string;
  approvedByUserId: ProfileId | null;
  sourceEstimateUpdatedAt: string;
  createdAt: string;
}

export interface EstimateCommercialSnapshotItem {
  id: EstimateCommercialSnapshotItemId;
  estimateCommercialSnapshotId: EstimateCommercialSnapshotId;
  organizationId: OrganizationId;
  estimateId: EstimateId;
  estimateLineItemId: string;
  catalogItemId: CatalogItemId | null;
  taxCodeId: TaxCodeId | null;
  sourceType: "manual" | "catalog_item" | "system_component";
  sourceSystemId: CatalogItemId | null;
  sourceComponentId: string | null;
  itemType: CatalogItemType | null;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  baseUnitCost: string;
  baseUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  taxable: boolean;
  taxRateSnapshot: string;
  discountAmount: string;
  lineSubtotal: string;
  taxAmount: string;
  costCode: string | null;
  groupName: string | null;
  assignedTo: string | null;
  lineTotal: string;
  sortOrder: number;
  createdAt: string;
}

export interface EstimateScopeItem {
  id: string;
  text: string;
  includeInOutput: boolean;
  sortOrder: number;
}

export interface EstimateItemGroup {
  id: string;
  label: string;
  sortOrder: number;
}

export interface EstimateWorkspaceItemRow {
  rowKey: string;
  groupId: string | null;
  baseUnitPrice: string;
  markupPercent: string;
  taxCode: "taxable" | "non-taxable";
  assignedTo: string | null;
}

export interface EstimateWorkspaceContent {
  termsHtml: string | null;
  inclusionsHtml: string | null;
  exclusionsHtml: string | null;
  notesHtml: string | null;
  scopeSummaryHtml: string | null;
  scopeItems: EstimateScopeItem[];
  itemGroups: EstimateItemGroup[];
  itemRows: EstimateWorkspaceItemRow[];
}

export interface EstimateLineItem {
  id: string;
  estimateId: EstimateId;
  organizationId: OrganizationId;
  catalogItemId: CatalogItemId | null;
  taxCodeId?: TaxCodeId | null;
  sourceType: "manual" | "catalog_item" | "system_component";
  sourceSystemId: CatalogItemId | null;
  sourceComponentId: string | null;
  itemType: CatalogItemType | null;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  baseUnitCost: string;
  baseUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  taxable: boolean;
  taxRateSnapshot?: string;
  discountAmount?: string;
  lineSubtotal?: string;
  taxAmount?: string;
  costCode: string | null;
  groupName: string | null;
  assignedTo: string | null;
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
  serviceTicketId: ServiceTicketId | null;
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

export interface EstimateAttachment {
  id: EstimateAttachmentId;
  organizationId: OrganizationId;
  estimateId: EstimateId;
  attachmentType: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number | null;
  caption: string | null;
  uploadedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateWorkspaceDefaults {
  termsHtml: string | null;
  inclusionsHtml: string | null;
  exclusionsHtml: string | null;
  scopeSummaryHtml: string | null;
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
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: InvoiceId;
  organizationId: OrganizationId;
  estimateLineItemId?: string | null;
  lineageType?:
    | "estimate_snapshot_item"
    | "sov_item"
    | "change_order_snapshot_item"
    | "invoice_only_adjustment"
    | null;
  estimateSnapshotItemId?: string | null;
  scheduleOfValueItemId: string | null;
  changeOrderSnapshotItemId?: string | null;
  invoiceOnlyAdjustmentKind?:
    | "manual_catalog_item"
    | "explicit_adjustment"
    | null;
  catalogItemId: CatalogItemId | null;
  taxCodeId?: TaxCodeId | null;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  taxable: boolean;
  baseUnitCost: string | null;
  baseUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  taxRateSnapshot?: string;
  discountAmount?: string;
  lineSubtotal?: string;
  taxAmount?: string;
  costCode: string | null;
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
  referenceNumber: string;
  status: ContractStatus;
  internalApprovalStatus: ContractInternalApprovalStatus;
  signatureReadinessStatus: SignatureReadinessStatus;
  title: string;
  renderedSubject: string | null;
  renderedContent: string;
  generatedFromEstimateReference: string | null;
  sentPdfStoragePath: string | null;
  sentPdfFileName: string | null;
  sentPdfMimeType: string | null;
  sentPdfGeneratedAt: string | null;
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
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordRevision {
  id: RecordRevisionId;
  organizationId: OrganizationId;
  subjectType: RecordRevisionSubjectType;
  subjectId: string;
  revisionNumber: number;
  isCurrent: boolean;
  revisionReason: string | null;
  revisionKind: RecordRevisionKind;
  snapshot: Record<string, unknown>;
  createdByUserId: ProfileId | null;
  createdAt: string;
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
  referenceNumber: string;
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

export interface ChangeOrderEvent {
  id: ChangeOrderEventId;
  organizationId: OrganizationId;
  changeOrderId: ChangeOrderId;
  customerId: CustomerId;
  projectId: ProjectId;
  eventType: ChangeOrderEventType;
  actorType: NotificationActorType;
  actorUserId: ProfileId | null;
  portalUserId: ProfileId | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
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

export interface InvoiceEvent {
  id: InvoiceEventId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  customerId: CustomerId;
  projectId: ProjectId;
  eventType: InvoiceEventType;
  actorType: NotificationActorType;
  actorUserId: ProfileId | null;
  portalUserId: ProfileId | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface CommunicationThread {
  id: CommunicationThreadId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId | null;
  appointmentId: AppointmentId | null;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  subjectType: CanonicalRecordSubjectType;
  subjectId: string;
  createdByUserId: ProfileId | null;
  threadCategory: CommunicationThreadCategory;
  channelKind: CommunicationChannelKind;
  threadStatus: CommunicationThreadStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageVisibility: CommunicationMessageVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationMessage {
  id: CommunicationMessageId;
  organizationId: OrganizationId;
  threadId: CommunicationThreadId;
  opportunityId: OpportunityId | null;
  appointmentId: AppointmentId | null;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  senderType: CommunicationMessageSenderType;
  senderUserId: ProfileId | null;
  direction: CommunicationMessageDirection;
  sourceKind: CommunicationMessageSourceKind;
  channelKind: CommunicationChannelKind;
  messageKind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  deliveryStatus: CommunicationMessageDeliveryStatus;
  body: string;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface GateKeeperArtifact {
  id: GateKeeperArtifactId;
  organizationId: OrganizationId;
  communicationThreadId: CommunicationThreadId | null;
  communicationMessageId: CommunicationMessageId | null;
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
  artifactType: GateKeeperArtifactType;
  contentText: string | null;
  content: Record<string, unknown>;
  confidence: string | null;
  reviewStatus: GateKeeperArtifactReviewStatus;
  reviewedByUserId: ProfileId | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface GateKeeperActionSuggestion {
  id: GateKeeperActionSuggestionId;
  organizationId: OrganizationId;
  sourceArtifactId: GateKeeperArtifactId | null;
  communicationThreadId: CommunicationThreadId | null;
  communicationMessageId: CommunicationMessageId | null;
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
  suggestionType: GateKeeperActionSuggestionType;
  title: string;
  rationale: string | null;
  proposedPayload: Record<string, unknown>;
  status: GateKeeperActionSuggestionStatus;
  reviewedByUserId: ProfileId | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
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
  estimateCommercialSnapshotItemId: EstimateCommercialSnapshotItemId | null;
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
  internalNotes: string | null;
  unit: string;
  defaultUnitCost: string;
  defaultUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  taxable: boolean;
  vendorId: VendorId | null;
  category: string | null;
  costCode: string | null;
  sku: string | null;
  photoStoragePath: string | null;
  isActive: boolean;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PlatformStarterPackStatus = "draft" | "published" | "archived";
export type PlatformStarterPackItemType = "template_seed" | "catalog_seed";
export type PlatformStarterPackAssignmentType =
  | "all_organizations"
  | "organization"
  | "onboarding_profile"
  | "region"
  | "trade_segment"
  | "plan_tier"
  | "future_contractor_group";
export type PlatformStarterPackAssignmentStatus =
  | "draft"
  | "active"
  | "inactive";
export type PlatformStarterPackProvisioningRunStatus =
  | "draft"
  | "approved"
  | "running"
  | "completed"
  | "completed_with_warnings"
  | "failed"
  | "voided";
export type PlatformStarterPackProvisioningVoidStrategy =
  | "audit_only"
  | "archive_unused_future"
  | "detach_lineage_future";
export type PlatformStarterPackProvisioningRunItemAction =
  | "would_create"
  | "skipped_existing"
  | "created"
  | "blocked"
  | "failed"
  | "voided";
export type PlatformStarterPackProvisioningRunItemStatus =
  | "pending"
  | "completed"
  | "skipped"
  | "blocked"
  | "failed"
  | "voided";
export type PlatformStarterPackProvisioningDestinationRecordType =
  | "document_template"
  | "catalog_item";
export type PlatformStarterPackProvisioningAttemptType = "execute";
export type PlatformStarterPackProvisioningAttemptOutcome =
  | "rejected"
  | "blocked"
  | "failed_before_execution"
  | "already_completed";
export type PlatformPackageDefinitionStatus =
  | "draft"
  | "review"
  | "published"
  | "deprecated"
  | "archived";
export type PlatformPackageDefinitionAuditEventType =
  | "package_definition_created"
  | "package_definition_updated"
  | "package_definition_reviewed"
  | "package_definition_approved"
  | "package_definition_published"
  | "package_definition_deprecated"
  | "package_definition_archived"
  | "package_version_created"
  | "package_version_updated"
  | "package_version_reviewed"
  | "package_version_approved"
  | "package_version_published"
  | "package_version_deprecated"
  | "package_version_archived";
export type ContractorPackageAssignmentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "active"
  | "superseded"
  | "canceled"
  | "archived";
export type ContractorPackageAssignmentAuditEventType =
  | "package_assignment_drafted"
  | "package_assignment_updated"
  | "package_assignment_reviewed"
  | "package_assignment_approved"
  | "package_assignment_scheduled"
  | "package_assignment_activated"
  | "package_assignment_superseded"
  | "package_assignment_canceled"
  | "package_assignment_archived";
export type ContractorPackageBillingProvider =
  | "stripe"
  | "manual_review"
  | "unknown";
export type ContractorPackageBillingProviderEnvironment =
  | "sandbox"
  | "test"
  | "production"
  | "unknown";
export type ContractorPackageBillingState =
  | "not_started"
  | "mapped"
  | "verified"
  | "active"
  | "mismatch_detected"
  | "suspended"
  | "deprecated"
  | "archived";
export type ContractorPackageBillingReconciliationState =
  | "not_started"
  | "pending_provider"
  | "pending_verification"
  | "verified"
  | "mismatch_detected"
  | "support_review_required"
  | "suspended"
  | "archived";
export type ContractorPackageBillingTrialOrEarlyAccessState =
  | "none"
  | "trial"
  | "early_access"
  | "trial_and_early_access"
  | "unknown";
export type ContractorPackageBillingTermsMarker =
  | "none"
  | "custom"
  | "grandfathered"
  | "custom_and_grandfathered"
  | "unknown";
export type ContractorPackageBillingMappingAuditEventType =
  | "billing_mapping_created"
  | "billing_mapping_updated"
  | "billing_mapping_reviewed"
  | "billing_mapping_verified"
  | "billing_mapping_mismatch_detected"
  | "billing_mapping_support_review_requested"
  | "billing_mapping_suspended"
  | "billing_mapping_deprecated"
  | "billing_mapping_archived"
  | "provider_reference_observed"
  | "provider_reference_reconciled";
export type ContractorPackageBillingSupportReviewStatus =
  | "pending_review"
  | "awaiting_evidence"
  | "awaiting_provider_confirmation"
  | "approved_for_resolution"
  | "resolution_blocked"
  | "resolved"
  | "archived";
export type ContractorPackageBillingSupportReviewResolutionCategory =
  | "provider_state_mismatch"
  | "duplicate_provider_subscription"
  | "orphaned_provider_subscription"
  | "stale_provider_mapping"
  | "invalid_environment_mix"
  | "unsupported_custom_contract"
  | "webhook_replay_issue"
  | "missing_provider_customer"
  | "missing_provider_subscription"
  | "manual_support_override_required";
export type ContractorPackageBillingSupportReviewEventType =
  | "support_review_created"
  | "support_review_updated"
  | "support_review_evidence_added"
  | "support_review_provider_confirmation_requested"
  | "support_review_provider_confirmation_received"
  | "support_review_approved_for_resolution"
  | "support_review_resolution_blocked"
  | "support_review_resolved"
  | "support_review_archived";
export type ContractorGroupStatus = "active" | "inactive" | "archived";
export type ContractorGroupType =
  | "trade_segment"
  | "onboarding"
  | "beta"
  | "internal"
  | "future_plan"
  | "future_entitlement"
  | "regional"
  | "custom";
export type ContractorGroupAssignmentSource =
  | "manual"
  | "targeting_preview"
  | "future_auto_assignment";
export type ContractorGroupAuditEventType =
  | "group_created"
  | "group_updated"
  | "group_archived"
  | "group_activated"
  | "group_deactivated"
  | "organization_assigned"
  | "organization_removed"
  | "assignment_source_changed";

export interface ContractorGroupMembership {
  id: ContractorGroupMembershipId;
  contractorGroupId: ContractorGroupId;
  organizationId: OrganizationId;
  organizationName: string | null;
  organizationSlug: string | null;
  organizationTenantStatus: string | null;
  assignedByUserId: ProfileId | null;
  assignmentSource: ContractorGroupAssignmentSource;
  notes: string | null;
  createdAt: string;
}

export interface ContractorGroup {
  id: ContractorGroupId;
  key: string;
  name: string;
  description: string | null;
  status: ContractorGroupStatus;
  groupType: ContractorGroupType;
  membershipCount: number;
  memberships: ContractorGroupMembership[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractorGroupAuditEvent {
  id: ContractorGroupAuditEventId;
  contractorGroupId: ContractorGroupId | null;
  contractorGroupKey: string | null;
  contractorGroupName: string | null;
  organizationId: OrganizationId | null;
  organizationName: string | null;
  organizationSlug: string | null;
  membershipId: ContractorGroupMembershipId | null;
  actorUserId: ProfileId | null;
  eventType: ContractorGroupAuditEventType;
  assignmentSource: ContractorGroupAssignmentSource | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface PlatformStarterPackItem {
  id: PlatformStarterPackItemId;
  starterPackId: PlatformStarterPackId;
  itemType: PlatformStarterPackItemType;
  templateSeedId: PlatformTemplateSeedId | null;
  catalogSeedId: PlatformCatalogItemSeedId | null;
  sortOrder: number;
  isRequired: boolean;
  templateSeed: PlatformTemplateSeed | null;
  catalogSeed: PlatformCatalogItemSeed | null;
  createdAt: string;
}

export interface PlatformStarterPackAssignment {
  id: PlatformStarterPackAssignmentId;
  starterPackId: PlatformStarterPackId;
  assignmentType: PlatformStarterPackAssignmentType;
  organizationId: OrganizationId | null;
  organizationName: string | null;
  organizationSlug: string | null;
  assignmentKey: string | null;
  label: string | null;
  status: PlatformStarterPackAssignmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStarterPack {
  id: PlatformStarterPackId;
  packKey: string;
  name: string;
  description: string | null;
  status: PlatformStarterPackStatus;
  segmentKey: string | null;
  templateSeedCount: number;
  catalogSeedCount: number;
  assignmentCount: number;
  activeAssignmentCount: number;
  items: PlatformStarterPackItem[];
  assignments: PlatformStarterPackAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStarterPackProvisioningRun {
  id: PlatformStarterPackProvisioningRunId;
  starterPackId: PlatformStarterPackId;
  starterPackName: string | null;
  starterPackKey: string | null;
  organizationId: OrganizationId;
  organizationName: string | null;
  organizationSlug: string | null;
  requestedByUserId: ProfileId | null;
  approvedByUserId: ProfileId | null;
  status: PlatformStarterPackProvisioningRunStatus;
  dryRunSnapshot: Record<string, unknown>;
  confirmationText: string | null;
  idempotencyKey: string | null;
  requestedAt: string;
  approvedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  voidedAt: string | null;
  voidedByUserId: ProfileId | null;
  voidReason: string | null;
  voidStrategy: PlatformStarterPackProvisioningVoidStrategy | null;
  voidReadinessSnapshot: Record<string, unknown>;
  errorMessage: string | null;
  itemCount: number;
  destinationRecordCount?: number;
  pendingItemCount?: number;
  completedItemCount?: number;
  skippedItemCount?: number;
  blockedItemCount?: number;
  failedItemCount?: number;
  wouldCreateItemCount?: number;
  skippedExistingItemCount?: number;
  createdItemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStarterPackProvisioningRunItem {
  id: PlatformStarterPackProvisioningRunItemId;
  runId: PlatformStarterPackProvisioningRunId;
  starterPackItemId: PlatformStarterPackItemId | null;
  sourceItemType: PlatformStarterPackItemType;
  sourceTemplateSeedId: PlatformTemplateSeedId | null;
  sourceCatalogSeedId: PlatformCatalogItemSeedId | null;
  destinationRecordType: PlatformStarterPackProvisioningDestinationRecordType;
  destinationRecordId: string | null;
  action: PlatformStarterPackProvisioningRunItemAction;
  status: PlatformStarterPackProvisioningRunItemStatus;
  sourceSnapshot: Record<string, unknown>;
  destinationSnapshot: Record<string, unknown>;
  reason: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStarterPackProvisioningRunDetail extends PlatformStarterPackProvisioningRun {
  items: PlatformStarterPackProvisioningRunItem[];
}

export interface PlatformStarterPackProvisioningAttempt {
  id: PlatformStarterPackProvisioningAttemptId;
  runId: PlatformStarterPackProvisioningRunId | null;
  starterPackId: PlatformStarterPackId | null;
  starterPackName: string | null;
  starterPackKey: string | null;
  organizationId: OrganizationId | null;
  organizationName: string | null;
  organizationSlug: string | null;
  attemptedByUserId: ProfileId | null;
  attemptType: PlatformStarterPackProvisioningAttemptType;
  outcome: PlatformStarterPackProvisioningAttemptOutcome;
  reasonCode: string;
  safeMessage: string;
  reviewStatus: string | null;
  runStatus: PlatformStarterPackProvisioningRunStatus | null;
  metadata: Record<string, unknown>;
  attemptedAt: string;
}

export interface PlatformPackageDefinition {
  id: PlatformPackageDefinitionId;
  packageKey: string;
  displayName: string;
  description: string | null;
  status: PlatformPackageDefinitionStatus;
  intendedAudience: string | null;
  segmentSummary: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface PlatformPackageDefinitionVersion {
  id: PlatformPackageDefinitionVersionId;
  packageDefinitionId: PlatformPackageDefinitionId;
  packageKey: string | null;
  packageDisplayName: string | null;
  versionNumber: number;
  versionLabel: string | null;
  status: PlatformPackageDefinitionStatus;
  commercialSummary: string | null;
  moduleVisibilityIntent: Record<string, unknown> | null;
  usageLimitIntent: Record<string, unknown> | null;
  entitlementIntent: Record<string, unknown> | null;
  billingProviderIntent: Record<string, unknown> | null;
  starterPackDefaultIntent: Record<string, unknown> | null;
  contractorGroupTargetingIntent: Record<string, unknown> | null;
  publishedSnapshot: Record<string, unknown> | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deprecatedAt: string | null;
  archivedAt: string | null;
}

export interface PlatformPackageDefinitionAuditEvent {
  id: PlatformPackageDefinitionAuditEventId;
  packageDefinitionId: PlatformPackageDefinitionId;
  packageDefinitionVersionId: PlatformPackageDefinitionVersionId | null;
  eventType: PlatformPackageDefinitionAuditEventType;
  actorUserId: ProfileId | null;
  reason: string | null;
  confirmationText: string | null;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface ContractorPackageAssignment {
  id: ContractorPackageAssignmentId;
  companyId: OrganizationId;
  companyName: string | null;
  companySlug: string | null;
  packageDefinitionId: PlatformPackageDefinitionId | null;
  packageDefinitionKey: string | null;
  packageDefinitionName: string | null;
  packageDefinitionVersionId: PlatformPackageDefinitionVersionId | null;
  packageDefinitionVersionLabel: string | null;
  packageDefinitionVersionNumber: number | null;
  packageDefinitionVersionStatus: PlatformPackageDefinitionStatus | null;
  status: ContractorPackageAssignmentStatus;
  lifecycleState: ContractorPackageAssignmentStatus;
  effectiveAt: string | null;
  scheduledFor: string | null;
  activatedAt: string | null;
  supersededAt: string | null;
  canceledAt: string | null;
  supersedesAssignmentId: ContractorPackageAssignmentId | null;
  supersededByAssignmentId: ContractorPackageAssignmentId | null;
  assignmentSnapshot: Record<string, unknown> | null;
  billingImpactSnapshot: Record<string, unknown> | null;
  entitlementModuleImpactSnapshot: Record<string, unknown> | null;
  starterPackImplicationSnapshot: Record<string, unknown> | null;
  cancellationReason: string | null;
  supersessionReason: string | null;
  grandfatheredContract: boolean;
  customContractLabel: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ContractorPackageAssignmentAuditEvent {
  id: ContractorPackageAssignmentAuditEventId;
  contractorPackageAssignmentId: ContractorPackageAssignmentId;
  companyId: OrganizationId;
  packageDefinitionId: PlatformPackageDefinitionId | null;
  packageDefinitionVersionId: PlatformPackageDefinitionVersionId | null;
  eventType: ContractorPackageAssignmentAuditEventType;
  actorUserId: ProfileId | null;
  reason: string | null;
  confirmationText: string | null;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface ContractorPackageBillingMapping {
  id: ContractorPackageBillingMappingId;
  contractorPackageAssignmentId: ContractorPackageAssignmentId | null;
  companyId: OrganizationId | null;
  packageDefinitionId: PlatformPackageDefinitionId | null;
  packageDefinitionVersionId: PlatformPackageDefinitionVersionId | null;
  billingProvider: ContractorPackageBillingProvider;
  providerEnvironment: ContractorPackageBillingProviderEnvironment;
  providerCustomerReference: string | null;
  providerProductReference: string | null;
  providerPriceReference: string | null;
  providerSubscriptionReference: string | null;
  providerSubscriptionItemReference: string | null;
  billingState: ContractorPackageBillingState;
  reconciliationState: ContractorPackageBillingReconciliationState;
  trialOrEarlyAccessState: ContractorPackageBillingTrialOrEarlyAccessState | null;
  customOrGrandfatheredTermsMarker: ContractorPackageBillingTermsMarker | null;
  expectedProviderStateSnapshot: Record<string, unknown> | null;
  observedProviderStateSnapshot: Record<string, unknown> | null;
  mappingSnapshot: Record<string, unknown> | null;
  mismatchSummary: string | null;
  lastVerifiedAt: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ContractorPackageBillingMappingAuditEvent {
  id: ContractorPackageBillingMappingAuditEventId;
  contractorPackageBillingMappingId: ContractorPackageBillingMappingId | null;
  contractorPackageAssignmentId: ContractorPackageAssignmentId | null;
  companyId: OrganizationId | null;
  packageDefinitionId: PlatformPackageDefinitionId | null;
  packageDefinitionVersionId: PlatformPackageDefinitionVersionId | null;
  eventType: ContractorPackageBillingMappingAuditEventType;
  actorUserId: ProfileId | null;
  reason: string | null;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
}

export interface ContractorPackageBillingSupportReview {
  id: ContractorPackageBillingSupportReviewId;
  contractorPackageBillingMappingId: ContractorPackageBillingMappingId | null;
  contractorPackageAssignmentId: ContractorPackageAssignmentId | null;
  companyId: OrganizationId | null;
  packageDefinitionId: PlatformPackageDefinitionId | null;
  packageDefinitionVersionId: PlatformPackageDefinitionVersionId | null;
  reviewStatus: ContractorPackageBillingSupportReviewStatus;
  resolutionCategory: ContractorPackageBillingSupportReviewResolutionCategory;
  providerEnvironment: ContractorPackageBillingProviderEnvironment;
  providerReferenceSummary: Record<string, unknown> | null;
  reconciliationEvidenceSnapshot: Record<string, unknown> | null;
  webhookEvidenceSnapshot: Record<string, unknown> | null;
  operatorEvidenceSnapshot: Record<string, unknown> | null;
  rollbackRecoverySnapshot: Record<string, unknown> | null;
  supportSummary: string | null;
  blockedReason: string | null;
  escalationReason: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ContractorPackageBillingSupportReviewEvent {
  id: ContractorPackageBillingSupportReviewEventId;
  supportReviewId: ContractorPackageBillingSupportReviewId;
  contractorPackageBillingMappingId: ContractorPackageBillingMappingId | null;
  contractorPackageAssignmentId: ContractorPackageAssignmentId | null;
  companyId: OrganizationId | null;
  eventType: ContractorPackageBillingSupportReviewEventType;
  actorUserId: ProfileId | null;
  reason: string | null;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
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

export interface EquipmentAsset {
  id: EquipmentAssetId;
  organizationId: OrganizationId;
  vendorId: VendorId | null;
  name: string;
  assetTag: string | null;
  serialNumber: string | null;
  equipmentType: EquipmentType;
  ownershipStatus: EquipmentOwnershipStatus;
  operationalStatus: EquipmentOperationalStatus;
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  purchaseDate: string | null;
  purchaseCost: string | null;
  rentalStartDate: string | null;
  rentalEndDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobEquipmentRequirement {
  id: JobEquipmentRequirementId;
  organizationId: OrganizationId;
  jobId: JobId;
  equipmentType: EquipmentType;
  quantity: number;
  required: boolean;
  notes: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentAssignment {
  id: EquipmentAssignmentId;
  organizationId: OrganizationId;
  equipmentAssetId: EquipmentAssetId;
  jobId: JobId;
  projectId: ProjectId | null;
  assignedDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  assignmentStatus: EquipmentAssignmentStatus;
  notes: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
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
  serviceTicketId: ServiceTicketId | null;
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
  serviceTicketId: ServiceTicketId | null;
  workDate: string;
  sourcePunchInEventId: TimePunchEventId;
  sourcePunchOutEventId: TimePunchEventId | null;
  punchInAt: string;
  punchOutAt: string | null;
  breakMinutes: number;
  workedMinutes: number;
  status: TimeCardStatus;
  entryMode: TimeCardEntryMode;
  reviewStatus: TimeCardReviewStatus;
  reviewedByUserId: ProfileId | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTicket {
  id: ServiceTicketId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId | null;
  jobId: JobId | null;
  sourceType: ServiceTicketSourceType;
  ticketType: ServiceTicketType;
  status: ServiceTicketStatus;
  priority: ServiceTicketPriority;
  title: string;
  description: string | null;
  reportedOn: string;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
  resolutionSummary: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyDocument {
  id: WarrantyDocumentId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  projectId: ProjectId | null;
  jobId: JobId | null;
  serviceTicketId: ServiceTicketId | null;
  documentTemplateId: TemplateId | null;
  status: WarrantyDocumentStatus;
  title: string;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
  renderedContent: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  issuedAt: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSigner {
  id: DocumentSignerId;
  organizationId: OrganizationId;
  subjectType: DocumentSignatureSubjectType;
  subjectId: WarrantyDocumentId;
  signerRole: DocumentSignerRole;
  signerName: string;
  signerEmail: string;
  status: DocumentSignerStatus;
  signedAt: string | null;
  declinedAt: string | null;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSignatureEvent {
  id: DocumentSignatureEventId;
  organizationId: OrganizationId;
  subjectType: DocumentSignatureSubjectType;
  subjectId: WarrantyDocumentId;
  signerId: DocumentSignerId | null;
  eventType: DocumentSignatureEventType;
  eventNote: string | null;
  metadata: Record<string, unknown>;
  createdByUserId: ProfileId | null;
  createdAt: string;
}

export interface DocumentDeliveryEvent {
  id: DocumentDeliveryEventId;
  organizationId: OrganizationId;
  subjectType: DocumentDeliverySubjectType;
  subjectId: WarrantyDocumentId | EstimateId | InvoiceId | ContractId;
  eventType: DocumentDeliveryEventType;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  channel: DocumentDeliveryChannel;
  provider: string | null;
  providerMessageId: string | null;
  providerEventId: string | null;
  relatedNotificationEventId: string | null;
  eventNote: string | null;
  metadata: Record<string, unknown>;
  createdByUserId: ProfileId | null;
  createdAt: string;
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

export interface PunchlistItem {
  id: PunchlistItemId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  jobId: JobId | null;
  assigneePersonId: PersonId | null;
  title: string;
  details: string | null;
  dueDate: string | null;
  status: PunchlistStatus;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: AppointmentId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId | null;
  customerId: CustomerId | null;
  projectId: ProjectId | null;
  assignedPersonId: PersonId | null;
  title: string;
  appointmentType: AppointmentType;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  customerVisible: boolean;
  customerNotes: string | null;
  internalNotes: string | null;
  status: AppointmentStatus;
  createdByUserId: ProfileId | null;
  updatedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityMeasurement {
  id: OpportunityMeasurementId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId;
  areaLabel: string | null;
  measurementType: string;
  valueNumeric: string;
  unit: string;
  quantity: number | null;
  captureMethod: MeasurementCaptureMethod | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityAttachment {
  id: OpportunityAttachmentId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId;
  attachmentType: OpportunityAttachmentType;
  storagePath: string;
  fileName: string;
  mimeType: string;
  caption: string | null;
  tag: string | null;
  uploadedByUserId: ProfileId | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityObservation {
  id: OpportunityObservationId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId;
  observationType: string;
  title: string;
  body: string | null;
  severity: OpportunityObservationSeverity | null;
  relatedAttachmentId: OpportunityAttachmentId | null;
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
  archivedAt: string | null;
  archivedByUserId: ProfileId | null;
  archiveReason: string | null;
  restoredAt: string | null;
  restoredByUserId: ProfileId | null;
  restoreReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalAccessGrant {
  id: PortalAccessGrantId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  customerContactId: string | null;
  userId: ProfileId | null;
  status: PortalAccessGrantStatus;
  invitedEmail: string | null;
  invitedByUserId: ProfileId | null;
  inviteExpiresAt: string | null;
  inviteAcceptedAt: string | null;
  activatedAt: string | null;
  revokedAt: string | null;
  temporaryCredentialIssuedAt: string | null;
  temporaryCredentialIssuedByUserId: ProfileId | null;
  temporaryCredentialRequiresPasswordChange: boolean;
  temporaryCredentialLastClearedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PortalPermissionManagementSource =
  | "system_default"
  | "contractor_admin"
  | "main_contact"
  | "migration";

export interface CustomerContactPortalPermission {
  id: string;
  organizationId: OrganizationId;
  customerContactId: string;
  portalAccessGrantId: PortalAccessGrantId | null;
  canViewEstimates: boolean;
  canApproveEstimates: boolean;
  canSignContracts: boolean;
  canApproveChangeOrders: boolean;
  canViewPayInvoices: boolean;
  canRequestQuotes: boolean;
  managementSource: PortalPermissionManagementSource;
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

export interface PortalEvidenceGrant {
  id: PortalEvidenceGrantId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  subjectType: PortalEvidenceGrantSubjectType;
  subjectId: string;
  status: PortalEvidenceGrantStatus;
  titleOverride: string | null;
  customerNote: string | null;
  sharedByUserId: ProfileId | null;
  sharedAt: string | null;
  revokedByUserId: ProfileId | null;
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
  internalNotes: string | null;
  unit: string;
  defaultUnitCost: string;
  defaultUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  taxable: boolean;
  taxCodeId?: TaxCodeId | null;
  vendorId: VendorId | null;
  category: string | null;
  costCode: string | null;
  sku: string | null;
  normalizedName?: string;
  normalizedSku?: string | null;
  photoStoragePath: string | null;
  status: DocumentTemplateStatus;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItemFile {
  name: string;
  path: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  downloadUrl: string | null;
  isPhoto: boolean;
}

export interface CatalogSystemComponent {
  id: string;
  organizationId: OrganizationId;
  systemCatalogItemId: CatalogItemId;
  componentCatalogItemId: CatalogItemId;
  componentItemType: CatalogItemType | null;
  componentName: string;
  componentDescription: string | null;
  unit: string;
  quantityPerUnit: string;
  basisUnit: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaxCode {
  id: TaxCodeId;
  organizationId: OrganizationId;
  name: string;
  rate: string;
  jurisdiction: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: InventoryItemId;
  organizationId: OrganizationId;
  catalogItemId: CatalogItemId | null;
  location: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unitOfMeasure: string;
  currentQuantity: string;
  reorderPoint: string;
  defaultUnitCost: string;
  taxable: boolean;
  status: DocumentTemplateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: InventoryTransactionId;
  organizationId: OrganizationId;
  inventoryItemId: InventoryItemId;
  transactionType: InventoryTransactionType;
  quantityChange: string;
  unitCost: string | null;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdByUserId?: ProfileId | null;
  updatedByUserId?: ProfileId | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CostItemComponent {
  id: CostItemComponentId;
  organizationId: OrganizationId;
  costItemId: CatalogItemId;
  componentType: CostItemComponentType;
  inventoryItemId: InventoryItemId | null;
  laborRateId: string | null;
  equipmentItemId: string | null;
  quantityPerUnit: string;
  unitCost: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateContentBlock {
  id: string;
  organizationId: OrganizationId;
  blockType: "scope" | "inclusion" | "exclusion" | "terms";
  title: string;
  contentHtml: string;
  status: DocumentTemplateStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
