import "server-only";

import { createHash } from "node:crypto";

import { getServerEnv } from "@floorconnector/config";
import type {
  CatalogItem,
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent,
  ContractorPackageAssignmentAuditEventType,
  ContractorPackageBillingMapping,
  ContractorPackageBillingMappingAuditEvent,
  ContractorPackageBillingSupportReview,
  ContractorPackageBillingSupportReviewEvent,
  ContractorGroup,
  ContractorGroupAuditEvent,
  ContractorGroupAuditEventType,
  ContractorGroupAssignmentSource,
  ContractorGroupMembership,
  ContractorGroupStatus,
  ContractorGroupType,
  DocumentTemplate,
  PlatformCatalogItemSeed,
  PlatformFinancialDefaults,
  PlatformPackageDefinition,
  PlatformPackageDefinitionAuditEvent,
  PlatformPackageDefinitionVersion,
  PlatformStarterPack,
  PlatformStarterPackAssignment,
  PlatformStarterPackAssignmentStatus,
  PlatformStarterPackAssignmentType,
  PlatformStarterPackItem,
  PlatformStarterPackItemType,
  PlatformStarterPackProvisioningDestinationRecordType,
  PlatformStarterPackProvisioningAttempt,
  PlatformStarterPackProvisioningAttemptOutcome,
  PlatformStarterPackProvisioningAttemptType,
  PlatformStarterPackProvisioningRun,
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem,
  PlatformStarterPackProvisioningRunItemAction,
  PlatformStarterPackProvisioningRunItemStatus,
  PlatformStarterPackProvisioningRunStatus,
  PlatformStarterPackProvisioningVoidStrategy,
  PlatformStarterPackStatus,
  PlatformTemplateSeed,
  PlatformWorkflowDefaults
} from "@floorconnector/types";

import { INVENTORY_ENABLED_FEATURE_POLICY } from "@/lib/organizations/module-settings";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildContractorGroupProposalManualApplyServerReadiness,
  type ContractorGroupProposalSubmittedAssignmentFingerprint,
  type ContractorGroupProposalManualApplyServerReadiness,
  type ContractorGroupProposalOrganization
} from "@/lib/platform-admin/contractor-group-assignment-proposals-core";
import {
  buildPlatformOperationsObservability,
  type PlatformOperationsObservabilityInput,
  type PlatformOperationsObservabilityModel,
  type PlatformOperationsSourceKey
} from "@/lib/platform-admin/operations-observability-core";
import {
  buildPlatformPackageGovernance,
  type PlatformPackageGovernanceModel,
  type PlatformPackageGovernanceStripeMode,
  type PlatformPackageGovernanceTenant
} from "@/lib/platform-admin/package-governance-core";
import {
  buildPlatformPackageDefinitionCatalog,
  type PlatformPackageDefinitionCatalogModel
} from "@/lib/platform-admin/package-definition-catalog-core";
import {
  buildPlatformPackageDefinitionDetail,
  type PlatformPackageDefinitionDetailModel
} from "@/lib/platform-admin/package-definition-detail-core";
import {
  buildContractorPackageAssignmentReadModel,
  type ContractorPackageAssignmentReadModel
} from "@/lib/platform-admin/contractor-package-assignment-read-model-core";
import {
  buildContractorPackageAssignmentDetail,
  type ContractorPackageAssignmentDetailModel
} from "@/lib/platform-admin/contractor-package-assignment-detail-core";
import {
  buildContractorPackageBillingMappingReadModel,
  type ContractorPackageBillingMappingReadModel
} from "@/lib/platform-admin/contractor-package-billing-mapping-read-model-core";
import {
  buildContractorPackageBillingMappingDetail,
  type ContractorPackageBillingMappingDetailLinkedReferences,
  type ContractorPackageBillingMappingDetailModel,
  type ContractorPackageBillingMappingDetailReference
} from "@/lib/platform-admin/contractor-package-billing-mapping-detail-core";
import {
  buildContractorPackageBillingSupportReviewReadModel,
  type ContractorPackageBillingSupportReviewReadModel
} from "@/lib/platform-admin/contractor-package-billing-support-review-read-model-core";
import {
  buildContractorPackageBillingSupportReviewDetail,
  type ContractorPackageBillingSupportReviewDetailLinkedReferences,
  type ContractorPackageBillingSupportReviewDetailModel,
  type ContractorPackageBillingSupportReviewDetailReference
} from "@/lib/platform-admin/contractor-package-billing-support-review-detail-core";
import {
  sanitizeContractorGroupAssignmentAuditMetadata,
  type ContractorGroupAssignmentAuditMetadataInput
} from "@/lib/platform-admin/contractor-group-audit-events-core";
import {
  buildProvisioningDraftFingerprintPayload,
  buildProvisioningDraftSnapshot,
  mapDryRunRowsToProvisioningDraftItems
} from "@/lib/platform-admin/starter-pack-provisioning-draft-core";
import {
  buildStarterPackProvisioningDraftReview,
  evaluateStarterPackProvisioningApprovalEligibility,
  type StarterPackProvisioningDraftReview
} from "@/lib/platform-admin/starter-pack-provisioning-draft-review-core";
import { buildStarterPackProvisioningDryRun } from "@/lib/platform-admin/starter-pack-provisioning-dry-run-core";
import { evaluateStarterPackProvisioningExecutionEligibility } from "@/lib/platform-admin/starter-pack-provisioning-execution-core";
import {
  attemptContextFromReview,
  describeProvisioningExecutionAttemptForAlreadyCompleted,
  describeProvisioningExecutionAttemptForDatabaseGuard,
  describeProvisioningExecutionAttemptFromIssue,
  type StarterPackProvisioningExecutionAttemptDescriptor
} from "@/lib/platform-admin/starter-pack-provisioning-attempts-core";
import {
  buildStarterPackProvisioningVoidReadiness,
  type StarterPackProvisioningDestinationUsageFact,
  type StarterPackProvisioningDestinationUsageFacts,
  type StarterPackProvisioningVoidReadiness
} from "@/lib/platform-admin/starter-pack-provisioning-void-readiness-core";
import type {
  FounderBillingMethod,
  FounderBillingStatus
} from "@/lib/platform-admin/early-access-operating-core";

type PlatformTemplateSeedRow = {
  id: string;
  template_type: "estimate" | "invoice" | "contract";
  seed_key: string;
  name: string;
  description: string | null;
  subject_template: string | null;
  body_template: string;
  schema_version: number;
  is_default: boolean;
  is_active: boolean;
  merge_field_manifest: unknown;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type PlatformFinancialDefaultsRow = {
  config_key: string;
  default_tax_rate: string | number;
  default_tax_behavior: "exclusive" | "inclusive" | "none";
  default_retainage_percentage: string | number;
  created_at: string;
  updated_at: string;
};

type PlatformWorkflowDefaultsRow = {
  config_key: string;
  approved_estimate_contract_seed_id: string | null;
  require_contract_internal_approval: boolean;
  require_contract_signature_before_job_scheduling: boolean;
  require_deposit_before_job_scheduling: boolean;
  require_financing_approval_before_job_scheduling: boolean;
  default_deposit_percentage: string | number;
  default_estimate_terms_html: string | null;
  default_estimate_inclusions_html: string | null;
  default_estimate_exclusions_html: string | null;
  default_estimate_scope_summary_html: string | null;
  default_estimate_start_number: number;
  default_invoice_start_number: number;
  default_change_order_start_number: number;
  default_contract_start_number: number;
  created_at: string;
  updated_at: string;
};

type PlatformCatalogItemSeedRow = {
  id: string;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  seed_key: string;
  name: string;
  description: string | null;
  internal_notes: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  vendor_id: string | null;
  category: string | null;
  cost_code: string | null;
  sku: string | null;
  photo_storage_path: string | null;
  is_active: boolean;
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type OrganizationDocumentTemplateRow = {
  id: string;
  company_id: string;
  template_type: "estimate" | "invoice" | "contract";
  source_seed_id: string | null;
  source_seed_key: string | null;
  name: string;
  description: string | null;
  subject_template: string | null;
  body_template: string;
  schema_version: number;
  status: "active" | "archived";
  is_default: boolean;
  merge_field_manifest: unknown;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type OrganizationCatalogItemRow = {
  id: string;
  company_id: string;
  source_seed_id: string | null;
  source_seed_key: string | null;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  name: string;
  description: string | null;
  internal_notes: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  tax_code_id: string | null;
  vendor_id: string | null;
  category: string | null;
  cost_code: string | null;
  sku: string | null;
  normalized_name: string | null;
  normalized_sku: string | null;
  photo_storage_path: string | null;
  status: "active" | "archived";
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PlatformStarterPackRow = {
  id: string;
  pack_key: string;
  name: string;
  description: string | null;
  status: PlatformStarterPackStatus;
  segment_key: string | null;
  created_at: string;
  updated_at: string;
};

type PlatformStarterPackItemRow = {
  id: string;
  starter_pack_id: string;
  item_type: PlatformStarterPackItemType;
  template_seed_id: string | null;
  catalog_seed_id: string | null;
  sort_order: number;
  is_required: boolean;
  created_at: string;
  template_seed: PlatformTemplateSeedRow | PlatformTemplateSeedRow[] | null;
  catalog_seed: PlatformCatalogItemSeedRow | PlatformCatalogItemSeedRow[] | null;
};

type PlatformStarterPackAssignmentRow = {
  id: string;
  starter_pack_id: string;
  assignment_type: PlatformStarterPackAssignmentType;
  organization_id: string | null;
  assignment_key: string | null;
  label: string | null;
  status: PlatformStarterPackAssignmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  organization:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }
    | Array<{
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }>
    | null;
};

type ContractorGroupMembershipOrganizationRow = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  tenant_status: string;
};

type ContractorGroupMembershipRow = {
  id: string;
  contractor_group_id: string;
  organization_id: string;
  assigned_by: string | null;
  assignment_source: ContractorGroupAssignmentSource;
  notes: string | null;
  created_at: string;
  organization:
    | ContractorGroupMembershipOrganizationRow
    | ContractorGroupMembershipOrganizationRow[]
    | null;
};

type ContractorGroupRow = {
  id: string;
  group_key: string;
  name: string;
  description: string | null;
  status: ContractorGroupStatus;
  group_type: ContractorGroupType;
  created_at: string;
  updated_at: string;
  contractor_group_memberships:
    | ContractorGroupMembershipRow[]
    | ContractorGroupMembershipRow
    | null;
};

type ContractorGroupAuditEventRow = {
  id: string;
  contractor_group_id: string | null;
  organization_id: string | null;
  membership_id: string | null;
  event_type: ContractorGroupAuditEventType;
  actor_user_id: string | null;
  assignment_source: ContractorGroupAssignmentSource | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  contractor_group:
    | {
        id: string;
        group_key: string;
        name: string;
      }
    | Array<{
        id: string;
        group_key: string;
        name: string;
      }>
    | null;
  organization:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }
    | Array<{
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }>
    | null;
};

type PlatformStarterPackProvisioningRunRow = {
  id: string;
  starter_pack_id: string;
  organization_id: string;
  requested_by: string | null;
  approved_by: string | null;
  status: PlatformStarterPackProvisioningRunStatus;
  dry_run_snapshot: Record<string, unknown> | null;
  confirmation_text: string | null;
  idempotency_key: string | null;
  requested_at: string;
  approved_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
  void_strategy: PlatformStarterPackProvisioningVoidStrategy | null;
  void_readiness_snapshot: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  starter_pack:
    | {
        id: string;
        pack_key: string;
        name: string;
      }
    | Array<{
        id: string;
        pack_key: string;
        name: string;
      }>
    | null;
  organization:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }
    | Array<{
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }>
    | null;
};

type PlatformStarterPackProvisioningRunItemCountRow = {
  run_id: string;
  destination_record_id: string | null;
  action: PlatformStarterPackProvisioningRunItemAction;
  status: PlatformStarterPackProvisioningRunItemStatus;
};

type PlatformStarterPackProvisioningRunItemRow = {
  id: string;
  run_id: string;
  starter_pack_item_id: string | null;
  source_item_type: PlatformStarterPackItemType;
  source_template_seed_id: string | null;
  source_catalog_seed_id: string | null;
  destination_record_type: PlatformStarterPackProvisioningDestinationRecordType;
  destination_record_id: string | null;
  action: PlatformStarterPackProvisioningRunItemAction;
  status: PlatformStarterPackProvisioningRunItemStatus;
  source_snapshot: Record<string, unknown> | null;
  destination_snapshot: Record<string, unknown> | null;
  reason: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type PlatformStarterPackProvisioningAttemptRow = {
  id: string;
  run_id: string | null;
  starter_pack_id: string | null;
  organization_id: string | null;
  attempted_by: string | null;
  attempt_type: PlatformStarterPackProvisioningAttemptType;
  outcome: PlatformStarterPackProvisioningAttemptOutcome;
  reason_code: string;
  safe_message: string;
  review_status: string | null;
  run_status: PlatformStarterPackProvisioningRunStatus | null;
  metadata: Record<string, unknown> | null;
  attempted_at: string;
  starter_pack:
    | {
        id: string;
        pack_key: string;
        name: string;
      }
    | Array<{
        id: string;
        pack_key: string;
        name: string;
      }>
    | null;
  organization:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }
    | Array<{
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }>
    | null;
};

type StarterPackProvisioningExecutionRpcResult = {
  runId: string;
  status: PlatformStarterPackProvisioningRunStatus;
  alreadyCompleted: boolean;
  createdTemplateCount: number;
  createdCatalogItemCount: number;
  skippedCount: number;
  message: string;
};

type FeatureFlagRow = {
  id: string;
  company_id: string | null;
  key: string;
  name: string;
  description: string | null;
  module_key: string | null;
  surface: string | null;
  enabled: boolean;
  updated_at: string;
};

type PlatformAdminAssignmentRow = {
  id: string;
  user_id: string;
  users:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
  roles:
    | {
        id: string;
        key: string;
        name: string;
      }
    | null;
};

type PlatformRoleRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

type PermissionRow = {
  id: string;
  key: string;
  name: string;
  module_key: string;
};

type TenantRow = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  primary_trade: string | null;
  tenant_status: string;
  lifecycle_state: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
  created_at: string;
  active_location:
    | Array<{
        state_region: string | null;
      }>
    | {
        state_region: string | null;
      }
    | null;
  organization_workflow_settings:
    | Array<{
        next_estimate_number: number | null;
        next_invoice_number: number | null;
        next_change_order_number: number | null;
        next_contract_number: number | null;
      }>
    | null;
  company_subscriptions:
    | Array<{
        id: string;
        status: string;
        lifecycle_state: string;
        subscription_plans:
          | {
              id: string;
              key: string;
              name: string;
            }
          | null;
      }>
    | null;
};

type PlatformPackageDefinitionRow = {
  id: string;
  package_key: string;
  display_name: string;
  description: string | null;
  status: PlatformPackageDefinition["status"];
  intended_audience: string | null;
  segment_summary: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type PlatformPackageDefinitionVersionRow = {
  id: string;
  package_definition_id: string;
  version_number: number;
  version_label: string | null;
  status: PlatformPackageDefinitionVersion["status"];
  commercial_summary: string | null;
  module_visibility_intent: Record<string, unknown> | null;
  usage_limit_intent: Record<string, unknown> | null;
  entitlement_intent: Record<string, unknown> | null;
  billing_provider_intent: Record<string, unknown> | null;
  starter_pack_default_intent: Record<string, unknown> | null;
  contractor_group_targeting_intent: Record<string, unknown> | null;
  published_snapshot: Record<string, unknown> | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deprecated_at: string | null;
  archived_at: string | null;
  package_definition:
    | {
        id: string;
        package_key: string;
        display_name: string;
      }
    | Array<{
        id: string;
        package_key: string;
        display_name: string;
      }>
    | null;
};

type PlatformPackageDefinitionAuditEventRow = {
  id: string;
  package_definition_id: string;
  package_definition_version_id: string | null;
  event_type: PlatformPackageDefinitionAuditEvent["eventType"];
  actor_id: string | null;
  reason: string | null;
  confirmation_text: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type ContractorPackageAssignmentRow = {
  id: string;
  company_id: string;
  package_definition_id: string | null;
  package_definition_version_id: string | null;
  status: ContractorPackageAssignment["status"];
  lifecycle_state: ContractorPackageAssignment["lifecycleState"];
  effective_at: string | null;
  scheduled_for: string | null;
  activated_at: string | null;
  superseded_at: string | null;
  canceled_at: string | null;
  supersedes_assignment_id: string | null;
  superseded_by_assignment_id: string | null;
  assignment_snapshot: Record<string, unknown> | null;
  billing_impact_snapshot: Record<string, unknown> | null;
  entitlement_module_impact_snapshot: Record<string, unknown> | null;
  starter_pack_implication_snapshot: Record<string, unknown> | null;
  cancellation_reason: string | null;
  supersession_reason: string | null;
  grandfathered_contract: boolean;
  custom_contract_label: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  company:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }
    | Array<{
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }>
    | null;
  package_definition:
    | {
        id: string;
        package_key: string;
        display_name: string;
      }
    | Array<{
        id: string;
        package_key: string;
        display_name: string;
      }>
    | null;
  package_definition_version:
    | {
        id: string;
        version_number: number;
        version_label: string | null;
        status: PlatformPackageDefinitionVersion["status"];
      }
    | Array<{
        id: string;
        version_number: number;
        version_label: string | null;
        status: PlatformPackageDefinitionVersion["status"];
      }>
    | null;
};

type ContractorPackageAssignmentAuditEventRow = {
  id: string;
  contractor_package_assignment_id: string;
  company_id: string;
  package_definition_id: string | null;
  package_definition_version_id: string | null;
  event_type: ContractorPackageAssignmentAuditEventType;
  actor_id: string | null;
  reason: string | null;
  confirmation_text: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type ContractorPackageBillingMappingRow = {
  id: string;
  contractor_package_assignment_id: string | null;
  company_id: string | null;
  package_definition_id: string | null;
  package_definition_version_id: string | null;
  billing_provider: ContractorPackageBillingMapping["billingProvider"];
  provider_environment: ContractorPackageBillingMapping["providerEnvironment"];
  provider_customer_reference: string | null;
  provider_product_reference: string | null;
  provider_price_reference: string | null;
  provider_subscription_reference: string | null;
  provider_subscription_item_reference: string | null;
  billing_state: ContractorPackageBillingMapping["billingState"];
  reconciliation_state: ContractorPackageBillingMapping["reconciliationState"];
  trial_or_early_access_state: ContractorPackageBillingMapping["trialOrEarlyAccessState"];
  custom_or_grandfathered_terms_marker: ContractorPackageBillingMapping["customOrGrandfatheredTermsMarker"];
  expected_provider_state_snapshot: Record<string, unknown> | null;
  observed_provider_state_snapshot: Record<string, unknown> | null;
  mapping_snapshot: Record<string, unknown> | null;
  mismatch_summary: string | null;
  last_verified_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type ContractorPackageBillingMappingAuditEventRow = {
  id: string;
  contractor_package_billing_mapping_id: string | null;
  contractor_package_assignment_id: string | null;
  company_id: string | null;
  package_definition_id: string | null;
  package_definition_version_id: string | null;
  event_type: ContractorPackageBillingMappingAuditEvent["eventType"];
  actor_id: string | null;
  reason: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type ContractorPackageBillingSupportReviewRow = {
  id: string;
  contractor_package_billing_mapping_id: string | null;
  contractor_package_assignment_id: string | null;
  company_id: string | null;
  package_definition_id: string | null;
  package_definition_version_id: string | null;
  review_status: ContractorPackageBillingSupportReview["reviewStatus"];
  resolution_category: ContractorPackageBillingSupportReview["resolutionCategory"];
  provider_environment: ContractorPackageBillingSupportReview["providerEnvironment"];
  provider_reference_summary: Record<string, unknown> | null;
  reconciliation_evidence_snapshot: Record<string, unknown> | null;
  webhook_evidence_snapshot: Record<string, unknown> | null;
  operator_evidence_snapshot: Record<string, unknown> | null;
  rollback_recovery_snapshot: Record<string, unknown> | null;
  support_summary: string | null;
  blocked_reason: string | null;
  escalation_reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type ContractorPackageBillingSupportReviewEventRow = {
  id: string;
  support_review_id: string;
  contractor_package_billing_mapping_id: string | null;
  contractor_package_assignment_id: string | null;
  company_id: string | null;
  event_type: ContractorPackageBillingSupportReviewEvent["eventType"];
  actor_id: string | null;
  reason: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type EarlyAccessTenantRow = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  primary_trade: string | null;
  brand_accent_color: string | null;
  time_zone: string | null;
  tenant_status: string;
  lifecycle_state: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
  company_subscriptions:
    | Array<{
        id: string;
        status: string;
        lifecycle_state: string;
        stripe_subscription_id: string | null;
        stripe_price_id: string | null;
        stripe_checkout_session_id: string | null;
        stripe_last_event_id: string | null;
        stripe_last_webhook_received_at: string | null;
        current_period_end: string | null;
      }>
    | null;
  founder_plan_label: string | null;
  founder_monthly_amount_cents: number | null;
  founder_billing_status: FounderBillingStatus;
  founder_billing_method: FounderBillingMethod;
  founder_billing_reference: string | null;
  founder_billing_notes: string | null;
  founder_billing_follow_up_at: string | null;
  founder_billing_evidence_received_at: string | null;
  founder_billing_updated_by: string | null;
  founder_billing_updated_at: string | null;
  created_at: string;
};

type EarlyAccessFeedbackRow = {
  organization_id: string;
  user_id: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type PlatformOperationsWorkflowErrorRow = {
  id: string;
  organization_id: string | null;
  action: string;
  subject_type: string | null;
  message: string;
  created_at: string;
  organization:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }
    | Array<{
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
      }>
    | null;
};

type MembershipActivityRow = {
  company_id: string;
  last_active_at: string | null;
  users:
    | {
        last_sign_in_at: string | null;
      }
    | Array<{
        last_sign_in_at: string | null;
      }>
    | null;
};

type TenantActivityCounts = {
  projectCount: number;
  estimateCount: number;
  contractCount: number;
  invoiceCount: number;
};

const tenantResetDeletableTables = [
  { name: "notification_deliveries", label: "notification deliveries" },
  { name: "notifications", label: "notifications" },
  { name: "notification_events", label: "notification events" },
  { name: "communication_messages", label: "communication messages" },
  { name: "communication_threads", label: "communication threads" },
  { name: "invoice_events", label: "invoice events" },
  { name: "payment_events", label: "payment events" },
  { name: "payments", label: "payments" },
  { name: "invoice_line_items", label: "invoice line items" },
  { name: "change_order_commercial_snapshot_items", label: "change order snapshot items" },
  { name: "change_order_commercial_snapshots", label: "change order snapshots" },
  { name: "change_order_events", label: "change order events" },
  { name: "change_orders", label: "change orders" },
  { name: "contract_signature_events", label: "contract signature events" },
  { name: "contract_signers", label: "contract signers" },
  { name: "contract_revisions", label: "contract revisions" },
  { name: "contracts", label: "contracts" },
  { name: "invoices", label: "invoices" },
  { name: "job_assignments", label: "job assignments" },
  { name: "jobs", label: "jobs" },
  { name: "schedule_of_value_items", label: "schedule of value items" },
  { name: "schedule_of_values", label: "schedules of value" },
  { name: "estimate_customer_events", label: "estimate customer events" },
  { name: "estimate_attachments", label: "estimate attachments" },
  { name: "estimate_content_blocks", label: "estimate content blocks" },
  { name: "estimate_commercial_snapshot_items", label: "estimate snapshot items" },
  { name: "estimate_commercial_snapshots", label: "estimate snapshots" },
  { name: "estimate_line_items", label: "estimate line items" },
  { name: "estimates", label: "estimates" },
  { name: "portal_record_views", label: "portal record views" },
  { name: "portal_project_access", label: "portal project access" },
  { name: "daily_logs", label: "daily logs" },
  { name: "field_notes", label: "field notes" },
  { name: "execution_attachments", label: "execution attachments" },
  { name: "punchlist_items", label: "punchlist items" },
  { name: "projects", label: "projects" }
] as const;

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function aggregateCompanyCounts(rows: unknown) {
  const counts = new Map<string, number>();

  if (!Array.isArray(rows)) {
    return counts;
  }

  for (const row of rows) {
    const companyId =
      row && typeof row === "object" && typeof (row as { company_id?: unknown }).company_id === "string"
        ? (row as { company_id: string }).company_id
        : null;

    if (companyId) {
      counts.set(companyId, (counts.get(companyId) ?? 0) + 1);
    }
  }

  return counts;
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getLatestIso(left: string | null, right: string | null) {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return right > left ? right : left;
}

function aggregateCompanyRecentActivity(rows: unknown) {
  const activity = new Map<
    string,
    {
      lastActivityAt: string | null;
      hasLoggedInRecently: boolean;
    }
  >();
  const recentCutoffIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  if (!Array.isArray(rows)) {
    return activity;
  }

  for (const row of rows as MembershipActivityRow[]) {
    if (!row?.company_id) {
      continue;
    }

    const user = firstRelation(row.users);
    const lastActivityAt = getLatestIso(
      row.last_active_at,
      user?.last_sign_in_at ?? null
    );
    const current = activity.get(row.company_id) ?? {
      lastActivityAt: null,
      hasLoggedInRecently: false
    };
    const latestActivityAt = getLatestIso(current.lastActivityAt, lastActivityAt);

    activity.set(row.company_id, {
      lastActivityAt: latestActivityAt,
      hasLoggedInRecently:
        current.hasLoggedInRecently ||
        Boolean(latestActivityAt && latestActivityAt >= recentCutoffIso)
    });
  }

  return activity;
}

function getFeedbackEmail(metadata: Record<string, unknown> | null) {
  const email = metadata?.email;
  return typeof email === "string" && email.trim().length > 0 ? email : null;
}

function aggregateEarlyAccessFeedback(rows: unknown) {
  const feedback = new Map<
    string,
    {
      feedbackCount: number;
      recentFeedback: Array<{
        message: string;
        email: string | null;
        createdAt: string;
      }>;
    }
  >();

  if (!Array.isArray(rows)) {
    return feedback;
  }

  for (const row of rows as EarlyAccessFeedbackRow[]) {
    if (!row?.organization_id) {
      continue;
    }

    const current = feedback.get(row.organization_id) ?? {
      feedbackCount: 0,
      recentFeedback: []
    };

    current.feedbackCount += 1;

    if (current.recentFeedback.length < 3) {
      current.recentFeedback.push({
        message: row.message,
        email: getFeedbackEmail(row.metadata),
        createdAt: row.created_at
      });
    }

    feedback.set(row.organization_id, current);
  }

  return feedback;
}

function getExactCount(count: number | null) {
  return typeof count === "number" ? count : 0;
}

function hasCompletedCompanyProfile(row: EarlyAccessTenantRow) {
  return [
    row.logo_url,
    row.phone,
    row.email,
    row.website_url,
    row.primary_trade,
    row.brand_accent_color,
    row.time_zone
  ].some((value) => Boolean(value?.trim()));
}

async function getCompanyRecordCount(tableName: string, companyId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (response.error) {
    throw new Error(`Unable to inspect ${tableName} for reset.`);
  }

  return getExactCount(response.count);
}

async function deleteCompanyRecords(tableName: string, label: string, companyId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.from(tableName).delete().eq("company_id", companyId);

  if (response.error) {
    throw new Error(`Reset could not clear ${label} for this company.`);
  }
}

function mapPlatformTemplateSeed(row: PlatformTemplateSeedRow): PlatformTemplateSeed {
  return {
    id: row.id,
    templateType: row.template_type,
    seedKey: row.seed_key,
    name: row.name,
    description: row.description,
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    schemaVersion: row.schema_version,
    isDefault: row.is_default,
    isActive: row.is_active,
    mergeFieldManifest: normalizeStringArray(row.merge_field_manifest),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlatformCatalogItemSeed(
  row: PlatformCatalogItemSeedRow
): PlatformCatalogItemSeed {
  return {
    id: row.id,
    itemType: row.item_type,
    seedKey: row.seed_key,
    name: row.name,
    description: row.description,
    internalNotes: row.internal_notes,
    unit: row.unit,
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    defaultUnitPrice:
      row.default_unit_price == null ? null : Number(row.default_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    taxable: row.taxable,
    vendorId: row.vendor_id,
    category: row.category,
    costCode: row.cost_code,
    sku: row.sku,
    photoStoragePath: row.photo_storage_path,
    isActive: row.is_active,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOrganizationDocumentTemplate(
  row: OrganizationDocumentTemplateRow
): DocumentTemplate {
  return {
    id: row.id,
    organizationId: row.company_id,
    templateType: row.template_type,
    sourceSeedId: row.source_seed_id,
    sourceSeedKey: row.source_seed_key,
    name: row.name,
    description: row.description,
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    schemaVersion: row.schema_version,
    status: row.status,
    isDefault: row.is_default,
    mergeFieldManifest: normalizeStringArray(row.merge_field_manifest),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOrganizationCatalogItem(row: OrganizationCatalogItemRow): CatalogItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    sourceSeedId: row.source_seed_id,
    sourceSeedKey: row.source_seed_key,
    itemType: row.item_type,
    name: row.name,
    description: row.description,
    internalNotes: row.internal_notes,
    unit: row.unit,
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    defaultUnitPrice:
      row.default_unit_price == null ? null : Number(row.default_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    taxable: row.taxable,
    taxCodeId: row.tax_code_id,
    vendorId: row.vendor_id,
    category: row.category,
    costCode: row.cost_code,
    sku: row.sku,
    normalizedName: row.normalized_name ?? undefined,
    normalizedSku: row.normalized_sku,
    photoStoragePath: row.photo_storage_path,
    status: row.status,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStarterPackItem(row: PlatformStarterPackItemRow): PlatformStarterPackItem {
  const templateSeed = firstRelation(row.template_seed);
  const catalogSeed = firstRelation(row.catalog_seed);

  return {
    id: row.id,
    starterPackId: row.starter_pack_id,
    itemType: row.item_type,
    templateSeedId: row.template_seed_id,
    catalogSeedId: row.catalog_seed_id,
    sortOrder: row.sort_order,
    isRequired: row.is_required,
    templateSeed: templateSeed ? mapPlatformTemplateSeed(templateSeed) : null,
    catalogSeed: catalogSeed ? mapPlatformCatalogItemSeed(catalogSeed) : null,
    createdAt: row.created_at
  };
}

function mapStarterPackAssignment(
  row: PlatformStarterPackAssignmentRow
): PlatformStarterPackAssignment {
  const organization = firstRelation(row.organization);

  return {
    id: row.id,
    starterPackId: row.starter_pack_id,
    assignmentType: row.assignment_type,
    organizationId: row.organization_id,
    organizationName: organization
      ? organization.display_name || organization.legal_name
      : null,
    organizationSlug: organization?.slug ?? null,
    assignmentKey: row.assignment_key,
    label: row.label,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStarterPack(
  row: PlatformStarterPackRow,
  items: PlatformStarterPackItem[],
  assignments: PlatformStarterPackAssignment[]
): PlatformStarterPack {
  return {
    id: row.id,
    packKey: row.pack_key,
    name: row.name,
    description: row.description,
    status: row.status,
    segmentKey: row.segment_key,
    templateSeedCount: items.filter((item) => item.itemType === "template_seed").length,
    catalogSeedCount: items.filter((item) => item.itemType === "catalog_seed").length,
    assignmentCount: assignments.length,
    activeAssignmentCount: assignments.filter(
      (assignment) => assignment.status === "active"
    ).length,
    items,
    assignments,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContractorGroupMembership(
  row: ContractorGroupMembershipRow
): ContractorGroupMembership {
  const organization = firstRelation(row.organization);

  return {
    id: row.id,
    contractorGroupId: row.contractor_group_id,
    organizationId: row.organization_id,
    organizationName: organization
      ? organization.display_name || organization.legal_name
      : null,
    organizationSlug: organization?.slug ?? null,
    organizationTenantStatus: organization?.tenant_status ?? null,
    assignedByUserId: row.assigned_by,
    assignmentSource: row.assignment_source,
    notes: row.notes,
    createdAt: row.created_at
  };
}

function mapContractorGroup(row: ContractorGroupRow): ContractorGroup {
  const rawMemberships = Array.isArray(row.contractor_group_memberships)
    ? row.contractor_group_memberships
    : row.contractor_group_memberships
      ? [row.contractor_group_memberships]
      : [];
  const memberships = rawMemberships.map(mapContractorGroupMembership);

  return {
    id: row.id,
    key: row.group_key,
    name: row.name,
    description: row.description,
    status: row.status,
    groupType: row.group_type,
    membershipCount: memberships.length,
    memberships,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContractorGroupAuditEvent(
  row: ContractorGroupAuditEventRow
): ContractorGroupAuditEvent {
  const contractorGroup = firstRelation(row.contractor_group);
  const organization = firstRelation(row.organization);

  return {
    id: row.id,
    contractorGroupId: row.contractor_group_id,
    contractorGroupKey: contractorGroup?.group_key ?? null,
    contractorGroupName: contractorGroup?.name ?? null,
    organizationId: row.organization_id,
    organizationName: organization
      ? organization.display_name || organization.legal_name
      : null,
    organizationSlug: organization?.slug ?? null,
    membershipId: row.membership_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    assignmentSource: row.assignment_source,
    reason: row.reason,
    metadata: row.metadata ?? {},
    occurredAt: row.occurred_at
  };
}

function mapStarterPackProvisioningRun(
  row: PlatformStarterPackProvisioningRunRow,
  itemCounts: Map<
    string,
    {
      itemCount: number;
      destinationRecordCount: number;
      pendingItemCount: number;
      completedItemCount: number;
      skippedItemCount: number;
      blockedItemCount: number;
      failedItemCount: number;
      wouldCreateItemCount: number;
      skippedExistingItemCount: number;
      createdItemCount: number;
    }
  >
): PlatformStarterPackProvisioningRun {
  const starterPack = firstRelation(row.starter_pack);
  const organization = firstRelation(row.organization);
  const counts = itemCounts.get(row.id);

  return {
    id: row.id,
    starterPackId: row.starter_pack_id,
    starterPackName: starterPack?.name ?? null,
    starterPackKey: starterPack?.pack_key ?? null,
    organizationId: row.organization_id,
    organizationName: organization
      ? organization.display_name || organization.legal_name
      : null,
    organizationSlug: organization?.slug ?? null,
    requestedByUserId: row.requested_by,
    approvedByUserId: row.approved_by,
    status: row.status,
    dryRunSnapshot: row.dry_run_snapshot ?? {},
    confirmationText: row.confirmation_text,
    idempotencyKey: row.idempotency_key,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    voidedAt: row.voided_at,
    voidedByUserId: row.voided_by,
    voidReason: row.void_reason,
    voidStrategy: row.void_strategy,
    voidReadinessSnapshot: row.void_readiness_snapshot ?? {},
    errorMessage: row.error_message,
    itemCount: counts?.itemCount ?? 0,
    destinationRecordCount: counts?.destinationRecordCount ?? 0,
    pendingItemCount: counts?.pendingItemCount ?? 0,
    completedItemCount: counts?.completedItemCount ?? 0,
    skippedItemCount: counts?.skippedItemCount ?? 0,
    blockedItemCount: counts?.blockedItemCount ?? 0,
    failedItemCount: counts?.failedItemCount ?? 0,
    wouldCreateItemCount: counts?.wouldCreateItemCount ?? 0,
    skippedExistingItemCount: counts?.skippedExistingItemCount ?? 0,
    createdItemCount: counts?.createdItemCount ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStarterPackProvisioningRunItem(
  row: PlatformStarterPackProvisioningRunItemRow
): PlatformStarterPackProvisioningRunItem {
  return {
    id: row.id,
    runId: row.run_id,
    starterPackItemId: row.starter_pack_item_id,
    sourceItemType: row.source_item_type,
    sourceTemplateSeedId: row.source_template_seed_id,
    sourceCatalogSeedId: row.source_catalog_seed_id,
    destinationRecordType: row.destination_record_type,
    destinationRecordId: row.destination_record_id,
    action: row.action,
    status: row.status,
    sourceSnapshot: row.source_snapshot ?? {},
    destinationSnapshot: row.destination_snapshot ?? {},
    reason: row.reason,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStarterPackProvisioningAttempt(
  row: PlatformStarterPackProvisioningAttemptRow
): PlatformStarterPackProvisioningAttempt {
  const starterPack = firstRelation(row.starter_pack);
  const organization = firstRelation(row.organization);

  return {
    id: row.id,
    runId: row.run_id,
    starterPackId: row.starter_pack_id,
    starterPackName: starterPack?.name ?? null,
    starterPackKey: starterPack?.pack_key ?? null,
    organizationId: row.organization_id,
    organizationName: organization
      ? organization.display_name || organization.legal_name
      : null,
    organizationSlug: organization?.slug ?? null,
    attemptedByUserId: row.attempted_by,
    attemptType: row.attempt_type,
    outcome: row.outcome,
    reasonCode: row.reason_code,
    safeMessage: row.safe_message,
    reviewStatus: row.review_status,
    runStatus: row.run_status,
    metadata: row.metadata ?? {},
    attemptedAt: row.attempted_at
  };
}

export async function listPlatformTemplateSeedsAdmin() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_template_seeds")
    .select("*")
    .order("template_type", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load platform template seeds: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data) ? (response.data as PlatformTemplateSeedRow[]) : [];
  return rows.map(mapPlatformTemplateSeed);
}

export async function listOrganizationDocumentTemplatesForPlatformAdmin(
  organizationId: string
): Promise<DocumentTemplate[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("document_templates")
    .select(
      `
        id,
        company_id,
        template_type,
        source_seed_id,
        source_seed_key,
        name,
        description,
        subject_template,
        body_template,
        schema_version,
        status,
        is_default,
        merge_field_manifest,
        metadata,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .order("template_type", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load organization document templates: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as OrganizationDocumentTemplateRow[])
    : [];
  return rows.map(mapOrganizationDocumentTemplate);
}

export async function updatePlatformTemplateSeed(input: {
  seedId: string;
  name: string;
  description: string | null;
  subjectTemplate: string | null;
  bodyTemplate: string;
  isDefault: boolean;
  isActive: boolean;
}) {
  const supabase = getSupabaseAdminClient();
  const currentResponse = await supabase
    .from("platform_template_seeds")
    .select("*")
    .eq("id", input.seedId)
    .maybeSingle();

  if (currentResponse.error || !currentResponse.data) {
    throw new Error(
      `Unable to load platform template seed: ${currentResponse.error?.message ?? "Not found."}`
    );
  }

  const current = currentResponse.data as PlatformTemplateSeedRow;

  if (input.isDefault) {
    const clearResponse = await supabase
      .from("platform_template_seeds")
      .update({ is_default: false })
      .eq("template_type", current.template_type)
      .eq("is_default", true)
      .neq("id", input.seedId);

    if (clearResponse.error) {
      throw new Error(
        `Unable to clear platform template defaults: ${clearResponse.error.message}`
      );
    }
  }

  const response = await supabase
    .from("platform_template_seeds")
    .update({
      name: input.name,
      description: input.description,
      subject_template: input.subjectTemplate,
      body_template: input.bodyTemplate,
      is_default: input.isDefault,
      is_active: input.isActive
    })
    .eq("id", input.seedId)
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to update platform template seed: ${response.error.message}`
    );
  }

  return mapPlatformTemplateSeed(response.data as PlatformTemplateSeedRow);
}

export async function getPlatformFinancialDefaults(): Promise<PlatformFinancialDefaults> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_financial_defaults")
    .select("*")
    .eq("config_key", "default")
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load platform financial defaults: ${response.error.message}`
    );
  }

  const row = response.data as PlatformFinancialDefaultsRow | null;

  if (!row) {
    return {
      defaultTaxRate: "0.000000",
      defaultTaxBehavior: "exclusive",
      defaultRetainagePercentage: "0.00",
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return {
    defaultTaxRate: Number(row.default_tax_rate).toFixed(6),
    defaultTaxBehavior: row.default_tax_behavior,
    defaultRetainagePercentage: Number(row.default_retainage_percentage).toFixed(2),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function upsertPlatformFinancialDefaults(input: {
  userId: string;
  defaultTaxRate: string;
  defaultTaxBehavior: "exclusive" | "inclusive" | "none";
  defaultRetainagePercentage: string;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_financial_defaults")
    .upsert(
      {
        config_key: "default",
        default_tax_rate: input.defaultTaxRate,
        default_tax_behavior: input.defaultTaxBehavior,
        default_retainage_percentage: input.defaultRetainagePercentage,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "config_key" }
    )
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform financial defaults: ${response.error.message}`
    );
  }

  return getPlatformFinancialDefaults();
}

export async function getPlatformWorkflowDefaults(): Promise<PlatformWorkflowDefaults> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_workflow_defaults")
    .select("*")
    .eq("config_key", "default")
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load platform workflow defaults: ${response.error.message}`
    );
  }

  const row = response.data as PlatformWorkflowDefaultsRow | null;

  if (!row) {
    return {
      approvedEstimateContractSeedId: null,
      requireContractInternalApproval: false,
      requireContractSignatureBeforeJobScheduling: true,
      requireDepositBeforeJobScheduling: false,
      requireFinancingApprovalBeforeJobScheduling: false,
      defaultDepositPercentage: "0.00",
      defaultEstimateTermsHtml: null,
      defaultEstimateInclusionsHtml: null,
      defaultEstimateExclusionsHtml: null,
      defaultEstimateScopeSummaryHtml: null,
      defaultEstimateStartNumber: 3350,
      defaultInvoiceStartNumber: 3350,
      defaultChangeOrderStartNumber: 3350,
      defaultContractStartNumber: 3350,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return {
    approvedEstimateContractSeedId: row.approved_estimate_contract_seed_id,
    requireContractInternalApproval: row.require_contract_internal_approval,
    requireContractSignatureBeforeJobScheduling:
      row.require_contract_signature_before_job_scheduling,
    requireDepositBeforeJobScheduling:
      row.require_deposit_before_job_scheduling,
    requireFinancingApprovalBeforeJobScheduling:
      row.require_financing_approval_before_job_scheduling,
    defaultDepositPercentage: Number(row.default_deposit_percentage).toFixed(2),
    defaultEstimateTermsHtml: row.default_estimate_terms_html,
    defaultEstimateInclusionsHtml: row.default_estimate_inclusions_html,
    defaultEstimateExclusionsHtml: row.default_estimate_exclusions_html,
    defaultEstimateScopeSummaryHtml: row.default_estimate_scope_summary_html,
    defaultEstimateStartNumber: row.default_estimate_start_number,
    defaultInvoiceStartNumber: row.default_invoice_start_number,
    defaultChangeOrderStartNumber: row.default_change_order_start_number,
    defaultContractStartNumber: row.default_contract_start_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function upsertPlatformWorkflowDefaults(input: {
  userId: string;
  approvedEstimateContractSeedId: string | null;
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
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_workflow_defaults")
    .upsert(
      {
        config_key: "default",
        approved_estimate_contract_seed_id: input.approvedEstimateContractSeedId,
        require_contract_internal_approval: input.requireContractInternalApproval,
        require_contract_signature_before_job_scheduling:
          input.requireContractSignatureBeforeJobScheduling,
        require_deposit_before_job_scheduling:
          input.requireDepositBeforeJobScheduling,
        require_financing_approval_before_job_scheduling:
          input.requireFinancingApprovalBeforeJobScheduling,
        default_deposit_percentage: input.defaultDepositPercentage,
        default_estimate_terms_html: input.defaultEstimateTermsHtml,
        default_estimate_inclusions_html: input.defaultEstimateInclusionsHtml,
        default_estimate_exclusions_html: input.defaultEstimateExclusionsHtml,
        default_estimate_scope_summary_html: input.defaultEstimateScopeSummaryHtml,
        default_estimate_start_number: input.defaultEstimateStartNumber,
        default_invoice_start_number: input.defaultInvoiceStartNumber,
        default_change_order_start_number: input.defaultChangeOrderStartNumber,
        default_contract_start_number: input.defaultContractStartNumber,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "config_key" }
    )
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform workflow defaults: ${response.error.message}`
    );
  }

  return getPlatformWorkflowDefaults();
}

export async function listPlatformCatalogItemSeeds() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_catalog_item_seeds")
    .select("*")
    .order("item_type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load platform catalog item seeds: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as PlatformCatalogItemSeedRow[])
    : [];
  return rows.map(mapPlatformCatalogItemSeed);
}

export async function listOrganizationCatalogItemsForPlatformAdmin(
  organizationId: string
): Promise<CatalogItem[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("catalog_items")
    .select(
      `
        id,
        company_id,
        source_seed_id,
        source_seed_key,
        item_type,
        name,
        description,
        internal_notes,
        unit,
        default_unit_cost,
        default_unit_price,
        markup_percent,
        hidden_markup_percent,
        taxable,
        tax_code_id,
        vendor_id,
        category,
        cost_code,
        sku,
        normalized_name,
        normalized_sku,
        photo_storage_path,
        status,
        is_default,
        metadata,
        sort_order,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .order("item_type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load organization catalog items: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as OrganizationCatalogItemRow[])
    : [];
  return rows.map(mapOrganizationCatalogItem);
}

export async function upsertPlatformCatalogItemSeed(input: {
  seedId?: string | null;
  itemType:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
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
  vendorId: string | null;
  category: string | null;
  costCode: string | null;
  sku: string | null;
  photoStoragePath: string | null;
  isActive: boolean;
  isDefault: boolean;
}) {
  const supabase = getSupabaseAdminClient();

  if (input.isDefault) {
    const clearResponse = await supabase
      .from("platform_catalog_item_seeds")
      .update({ is_default: false })
      .eq("item_type", input.itemType)
      .eq("is_default", true);

    if (clearResponse.error) {
      throw new Error(
        `Unable to clear platform catalog defaults: ${clearResponse.error.message}`
      );
    }
  }

  const payload = {
    item_type: input.itemType,
    seed_key: input.seedKey,
    name: input.name,
    description: input.description,
    internal_notes: input.internalNotes,
    unit: input.unit,
    default_unit_cost: input.defaultUnitCost,
    default_unit_price: input.defaultUnitPrice,
    markup_percent: input.markupPercent,
    hidden_markup_percent: input.hiddenMarkupPercent,
    taxable: input.taxable,
    vendor_id: input.vendorId,
    category: input.category,
    cost_code: input.costCode,
    sku: input.sku,
    photo_storage_path: input.photoStoragePath,
    is_active: input.isActive,
    is_default: input.isDefault
  };

  const response = input.seedId
    ? await supabase
        .from("platform_catalog_item_seeds")
        .update(payload)
        .eq("id", input.seedId)
        .select("*")
        .single()
    : await supabase
        .from("platform_catalog_item_seeds")
        .insert(payload)
        .select("*")
        .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform catalog seed: ${response.error.message}`
    );
  }

  return mapPlatformCatalogItemSeed(response.data as PlatformCatalogItemSeedRow);
}

export async function listPlatformStarterPacks(): Promise<PlatformStarterPack[]> {
  const supabase = getSupabaseAdminClient();
  const [packResponse, itemResponse, assignmentResponse] = await Promise.all([
    supabase
      .from("platform_starter_packs")
      .select("*")
      .order("status", { ascending: true })
      .order("pack_key", { ascending: true }),
    supabase
      .from("platform_starter_pack_items")
      .select(
        `
          *,
          template_seed:platform_template_seeds (*),
          catalog_seed:platform_catalog_item_seeds (*)
        `
      )
      .order("starter_pack_id", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("platform_starter_pack_assignments")
      .select(
        `
          *,
          organization:companies (
            id,
            slug,
            legal_name,
            display_name
          )
        `
      )
      .order("starter_pack_id", { ascending: true })
      .order("assignment_type", { ascending: true })
      .order("status", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (packResponse.error) {
    throw new Error(
      `Unable to load platform starter packs: ${packResponse.error.message}`
    );
  }

  if (itemResponse.error) {
    throw new Error(
      `Unable to load platform starter pack items: ${itemResponse.error.message}`
    );
  }

  if (assignmentResponse.error) {
    throw new Error(
      `Unable to load platform starter pack assignments: ${assignmentResponse.error.message}`
    );
  }

  const itemsByPack = new Map<string, PlatformStarterPackItem[]>();
  const itemRows = Array.isArray(itemResponse.data)
    ? (itemResponse.data as PlatformStarterPackItemRow[])
    : [];

  for (const row of itemRows) {
    const mappedItem = mapStarterPackItem(row);
    const current = itemsByPack.get(mappedItem.starterPackId) ?? [];
    current.push(mappedItem);
    itemsByPack.set(mappedItem.starterPackId, current);
  }

  const assignmentsByPack = new Map<string, PlatformStarterPackAssignment[]>();
  const assignmentRows = Array.isArray(assignmentResponse.data)
    ? (assignmentResponse.data as PlatformStarterPackAssignmentRow[])
    : [];

  for (const row of assignmentRows) {
    const mappedAssignment = mapStarterPackAssignment(row);
    const current = assignmentsByPack.get(mappedAssignment.starterPackId) ?? [];
    current.push(mappedAssignment);
    assignmentsByPack.set(mappedAssignment.starterPackId, current);
  }

  const packRows = Array.isArray(packResponse.data)
    ? (packResponse.data as PlatformStarterPackRow[])
    : [];

  return packRows.map((row) =>
    mapStarterPack(
      row,
      itemsByPack.get(row.id) ?? [],
      assignmentsByPack.get(row.id) ?? []
    )
  );
}

export async function listContractorGroups(): Promise<ContractorGroup[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_groups")
    .select(
      `
        *,
        contractor_group_memberships (
          id,
          contractor_group_id,
          organization_id,
          assigned_by,
          assignment_source,
          notes,
          created_at,
          organization:companies (
            id,
            slug,
            legal_name,
            display_name,
            tenant_status
          )
        )
      `
    )
    .order("status", { ascending: true })
    .order("group_type", { ascending: true })
    .order("group_key", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load contractor groups: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) =>
    mapContractorGroup(row as ContractorGroupRow)
  );
}

async function getContractorGroupById(
  contractorGroupId: string
): Promise<ContractorGroup | null> {
  const groups = await listContractorGroups();

  return groups.find((group) => group.id === contractorGroupId) ?? null;
}

export async function listContractorGroupMemberships(): Promise<
  ContractorGroupMembership[]
> {
  const groups = await listContractorGroups();

  return groups.flatMap((group) => group.memberships);
}

export async function listOrganizationsInContractorGroup(
  contractorGroupId: string
): Promise<ContractorGroupMembership[]> {
  const groups = await listContractorGroups();
  const group = groups.find((candidate) => candidate.id === contractorGroupId);

  return group?.memberships ?? [];
}

export async function listContractorGroupsForOrganization(
  organizationId: string
): Promise<ContractorGroup[]> {
  const groups = await listContractorGroups();

  return groups
    .map((group) => ({
      ...group,
      memberships: group.memberships.filter(
        (membership) => membership.organizationId === organizationId
      ),
      membershipCount: group.memberships.some(
        (membership) => membership.organizationId === organizationId
      )
        ? 1
        : 0
    }))
    .filter((group) => group.memberships.length > 0);
}

function firstTenantLocation(
  location: TenantRow["active_location"]
): { state_region: string | null } | null {
  return Array.isArray(location) ? (location[0] ?? null) : (location ?? null);
}

function tenantToContractorGroupProposalOrganization(
  tenant: TenantRow
): ContractorGroupProposalOrganization {
  return {
    id: tenant.id,
    name: tenant.display_name || tenant.legal_name,
    slug: tenant.slug,
    tenantStatus: tenant.tenant_status,
    stateRegion: firstTenantLocation(tenant.active_location)?.state_region ?? null,
    primaryTrade: tenant.primary_trade,
    labels: []
  };
}

export async function getContractorGroupProposalManualApplyServerReadiness(input: {
  organizationId: string;
  contractorGroupId: string;
  submittedProposal?: ContractorGroupProposalSubmittedAssignmentFingerprint | null;
}): Promise<ContractorGroupProposalManualApplyServerReadiness> {
  const [groups, tenants, starterPacks, auditEvents] = await Promise.all([
    listContractorGroups(),
    listTenantsForPlatformAdmin(),
    listPlatformStarterPacks(),
    listContractorGroupAuditEvents({
      contractorGroupId: input.contractorGroupId,
      organizationId: input.organizationId,
      limit: 100
    })
  ]);

  return buildContractorGroupProposalManualApplyServerReadiness({
    organizationId: input.organizationId,
    contractorGroupId: input.contractorGroupId,
    organizations: tenants.map(tenantToContractorGroupProposalOrganization),
    groups,
    starterPacks,
    recentAuditEvents: auditEvents,
    submittedProposal: input.submittedProposal ?? null
  });
}

export async function listContractorGroupAuditEvents(input: {
  contractorGroupId?: string | null;
  organizationId?: string | null;
  limit?: number;
} = {}): Promise<ContractorGroupAuditEvent[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("contractor_group_audit_events")
    .select(
      `
        *,
        contractor_group:contractor_groups (
          id,
          group_key,
          name
        ),
        organization:companies (
          id,
          slug,
          legal_name,
          display_name
        )
      `
    )
    .order("occurred_at", { ascending: false })
    .limit(input.limit ?? 25);

  if (input.contractorGroupId) {
    query = query.eq("contractor_group_id", input.contractorGroupId);
  }

  if (input.organizationId) {
    query = query.eq("organization_id", input.organizationId);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load contractor group audit events: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as ContractorGroupAuditEventRow[])
    : [];

  return rows.map(mapContractorGroupAuditEvent);
}

export async function getContractorGroupAuditTimeline(input: {
  contractorGroupId?: string | null;
  organizationId?: string | null;
  limit?: number;
} = {}): Promise<ContractorGroupAuditEvent[]> {
  return listContractorGroupAuditEvents(input);
}

export async function listRecentStarterPackProvisioningRuns(
  limit = 8
): Promise<PlatformStarterPackProvisioningRun[]> {
  const supabase = getSupabaseAdminClient();
  const runResponse = await supabase
    .from("platform_starter_pack_provisioning_runs")
    .select(
      `
        *,
        starter_pack:platform_starter_packs (
          id,
          pack_key,
          name
        ),
        organization:companies (
          id,
          slug,
          legal_name,
          display_name
        )
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (runResponse.error) {
    throw new Error(
      `Unable to load starter pack provisioning audit runs: ${runResponse.error.message}`
    );
  }

  const rows = Array.isArray(runResponse.data)
    ? (runResponse.data as PlatformStarterPackProvisioningRunRow[])
    : [];
  const runIds = rows.map((row) => row.id);
  const itemCounts = new Map<
    string,
    {
      itemCount: number;
      destinationRecordCount: number;
      pendingItemCount: number;
      completedItemCount: number;
      skippedItemCount: number;
      blockedItemCount: number;
      failedItemCount: number;
      wouldCreateItemCount: number;
      skippedExistingItemCount: number;
      createdItemCount: number;
    }
  >();

  if (runIds.length > 0) {
    const itemResponse = await supabase
      .from("platform_starter_pack_provisioning_run_items")
      .select("run_id, destination_record_id, action, status")
      .in("run_id", runIds);

    if (itemResponse.error) {
      throw new Error(
        `Unable to load starter pack provisioning audit item counts: ${itemResponse.error.message}`
      );
    }

    const itemRows = Array.isArray(itemResponse.data)
      ? (itemResponse.data as PlatformStarterPackProvisioningRunItemCountRow[])
      : [];

    for (const item of itemRows) {
      const counts =
        itemCounts.get(item.run_id) ??
        {
          itemCount: 0,
          destinationRecordCount: 0,
          pendingItemCount: 0,
          completedItemCount: 0,
          skippedItemCount: 0,
          blockedItemCount: 0,
          failedItemCount: 0,
          wouldCreateItemCount: 0,
          skippedExistingItemCount: 0,
          createdItemCount: 0
        };

      counts.itemCount += 1;
      if (item.destination_record_id) {
        counts.destinationRecordCount += 1;
      }
      if (item.status === "pending") {
        counts.pendingItemCount += 1;
      }
      if (item.status === "completed") {
        counts.completedItemCount += 1;
      }
      if (item.status === "skipped") {
        counts.skippedItemCount += 1;
      }
      if (item.status === "blocked") {
        counts.blockedItemCount += 1;
      }
      if (item.status === "failed") {
        counts.failedItemCount += 1;
      }
      if (item.action === "would_create") {
        counts.wouldCreateItemCount += 1;
      }
      if (item.action === "skipped_existing") {
        counts.skippedExistingItemCount += 1;
      }
      if (item.action === "created") {
        counts.createdItemCount += 1;
      }

      itemCounts.set(item.run_id, counts);
    }
  }

  return rows.map((row) => mapStarterPackProvisioningRun(row, itemCounts));
}

export async function listRecentStarterPackProvisioningAttempts(
  limit = 8
): Promise<PlatformStarterPackProvisioningAttempt[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_starter_pack_provisioning_attempts")
    .select(
      `
        *,
        starter_pack:platform_starter_packs (
          id,
          pack_key,
          name
        ),
        organization:companies (
          id,
          slug,
          legal_name,
          display_name
        )
      `
    )
    .order("attempted_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    throw new Error(
      `Unable to load starter pack provisioning operation attempts: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as PlatformStarterPackProvisioningAttemptRow[])
    : [];

  return rows.map(mapStarterPackProvisioningAttempt);
}

function tenantLabel(row: {
  display_name?: string | null;
  legal_name?: string | null;
  slug?: string | null;
}) {
  return row.display_name || row.legal_name || row.slug || null;
}

function platformOperationsSourceCaveat(source: string) {
  return `${source} could not be loaded for this read-only operations view. No tenant records were changed.`;
}

async function getPlatformOperationsTableCount(tableName: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true });

  if (response.error) {
    return null;
  }

  return getExactCount(response.count);
}

async function listRecentWorkflowErrorsForPlatformOperations(limit = 8) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("workflow_error_events")
    .select(
      `
        id,
        organization_id,
        action,
        subject_type,
        message,
        created_at,
        organization:companies (
          id,
          slug,
          legal_name,
          display_name
        )
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    throw new Error(platformOperationsSourceCaveat("Workflow errors"));
  }

  const rows = Array.isArray(response.data)
    ? (response.data as PlatformOperationsWorkflowErrorRow[])
    : [];

  return rows.map((row) => {
    const organization = firstRelation(row.organization);

    return {
      id: row.id,
      organizationId: row.organization_id,
      organizationLabel: organization ? tenantLabel(organization) : null,
      workflowName: row.action,
      subjectType: row.subject_type,
      safeMessage: row.message,
      createdAt: row.created_at
    };
  });
}

export async function getPlatformOperationsObservability(): Promise<PlatformOperationsObservabilityModel> {
  const unavailableSources: Partial<Record<PlatformOperationsSourceKey, string>> = {};
  const [tenants, workflowErrors, starterPackRuns, starterPackAttempts, auditEvents] =
    await Promise.all([
      listTenantsForPlatformAdmin(),
      listRecentWorkflowErrorsForPlatformOperations(8).catch(() => {
        unavailableSources.workflow_errors = platformOperationsSourceCaveat(
          "Workflow errors"
        );
        return null;
      }),
      listRecentStarterPackProvisioningRuns(8).catch(() => {
        unavailableSources.starter_pack_runs = platformOperationsSourceCaveat(
          "Starter-pack provisioning runs"
        );
        return null;
      }),
      listRecentStarterPackProvisioningAttempts(8).catch(() => {
        unavailableSources.starter_pack_attempts = platformOperationsSourceCaveat(
          "Starter-pack provisioning attempts"
        );
        return null;
      }),
      listContractorGroupAuditEvents({ limit: 8 }).catch(() => {
        unavailableSources.contractor_group_audit_events = platformOperationsSourceCaveat(
          "Contractor group audit events"
        );
        return null;
      })
    ]);

  const [
    contractorGroupMembershipCount,
    starterPackAssignmentIntentCount
  ] = await Promise.all([
    getPlatformOperationsTableCount("contractor_group_memberships"),
    getPlatformOperationsTableCount("platform_starter_pack_assignments")
  ]);

  if (contractorGroupMembershipCount === null) {
    unavailableSources.contractor_group_memberships = platformOperationsSourceCaveat(
      "Contractor group memberships"
    );
  }

  if (starterPackAssignmentIntentCount === null) {
    unavailableSources.starter_pack_assignment_intents = platformOperationsSourceCaveat(
      "Starter-pack assignment intent"
    );
  }

  const tenantStatusCounts = [...tenants.reduce((counts, tenant) => {
    counts.set(tenant.tenant_status, (counts.get(tenant.tenant_status) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()).entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status));

  const input: PlatformOperationsObservabilityInput = {
    generatedAt: new Date().toISOString(),
    counts: {
      tenantCount: tenants.length,
      contractorGroupMembershipCount,
      starterPackAssignmentIntentCount
    },
    tenantStatusCounts,
    workflowErrors,
    starterPackRuns: starterPackRuns?.map((run) => ({
      id: run.id,
      starterPackLabel: run.starterPackName ?? run.starterPackKey,
      organizationLabel: run.organizationName ?? run.organizationSlug,
      status: run.status,
      errorMessage: run.errorMessage,
      itemCount: run.itemCount,
      destinationRecordCount: run.destinationRecordCount ?? 0,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    })) ?? null,
    starterPackAttempts: starterPackAttempts?.map((attempt) => ({
      id: attempt.id,
      starterPackLabel: attempt.starterPackName ?? attempt.starterPackKey,
      organizationLabel: attempt.organizationName ?? attempt.organizationSlug,
      outcome: attempt.outcome,
      reasonCode: attempt.reasonCode,
      safeMessage: attempt.safeMessage,
      attemptedAt: attempt.attemptedAt
    })) ?? null,
    contractorGroupAuditEvents: auditEvents?.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      contractorGroupLabel: event.contractorGroupName ?? event.contractorGroupKey,
      organizationLabel: event.organizationName ?? event.organizationSlug,
      occurredAt: event.occurredAt
    })) ?? null,
    unavailableSources
  };

  return buildPlatformOperationsObservability(input);
}

function getStripeModeForPackageGovernance(input: {
  publishableKey?: string | null;
  secretKey?: string | null;
}): PlatformPackageGovernanceStripeMode {
  if (!input.publishableKey || !input.secretKey) {
    return "not_configured";
  }

  const publishableIsTest = input.publishableKey.startsWith("pk_test_");
  const secretIsTest = input.secretKey.startsWith("sk_test_");

  if (publishableIsTest && secretIsTest) {
    return "test";
  }

  if (
    input.publishableKey.startsWith("pk_live_") &&
    input.secretKey.startsWith("sk_live_")
  ) {
    return "live";
  }

  return "mixed";
}

function tenantToPackageGovernanceTenant(
  tenant: TenantRow
): PlatformPackageGovernanceTenant {
  const currentSubscription = tenant.company_subscriptions?.[0] ?? null;
  const currentPlan = currentSubscription?.subscription_plans ?? null;

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.display_name || tenant.legal_name || tenant.slug,
    tenantStatus: tenant.tenant_status,
    lifecycleState: tenant.lifecycle_state,
    planKey: currentPlan?.key ?? null,
    planName: currentPlan?.name ?? null,
    subscriptionStatus: currentSubscription?.status ?? null,
    subscriptionLifecycleState: currentSubscription?.lifecycle_state ?? null,
    hasStripeCustomerRef: Boolean(
      tenant.stripe_customer_id || false
    ),
    hasStripePaymentMethod: Boolean(tenant.stripe_payment_method_id),
    createdAt: tenant.created_at
  };
}

export async function getPlatformPackageGovernance(): Promise<PlatformPackageGovernanceModel> {
  const env = getServerEnv();
  const tenants = await listTenantsForPlatformAdmin();
  const publishableKeyConfigured = Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const secretKeyConfigured = Boolean(env.STRIPE_SECRET_KEY);

  return buildPlatformPackageGovernance({
    generatedAt: new Date().toISOString(),
    tenants: tenants.map(tenantToPackageGovernanceTenant),
    stripeReadiness: {
      publishableKeyConfigured,
      secretKeyConfigured,
      stripeMode: getStripeModeForPackageGovernance({
        publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: env.STRIPE_SECRET_KEY
      })
    }
  });
}

function isMissingPackageDefinitionTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /platform_package_definition/i.test(error.message ?? "")
  );
}

function isMissingContractorPackageAssignmentTableError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /contractor_package_assignment/i.test(error.message ?? "")
  );
}

function isMissingContractorPackageBillingMappingTableError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /contractor_package_billing_mapping/i.test(error.message ?? "")
  );
}

function isMissingContractorPackageBillingSupportReviewTableError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /contractor_package_billing_support_review/i.test(error.message ?? "")
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function mapPlatformPackageDefinition(
  row: PlatformPackageDefinitionRow
): PlatformPackageDefinition {
  return {
    id: row.id,
    packageKey: row.package_key,
    displayName: row.display_name,
    description: row.description,
    status: row.status,
    intendedAudience: row.intended_audience,
    segmentSummary: row.segment_summary,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at
  };
}

function mapPlatformPackageDefinitionVersion(
  row: PlatformPackageDefinitionVersionRow
): PlatformPackageDefinitionVersion {
  const definition = firstRelation(row.package_definition);

  return {
    id: row.id,
    packageDefinitionId: row.package_definition_id,
    packageKey: definition?.package_key ?? null,
    packageDisplayName: definition?.display_name ?? null,
    versionNumber: row.version_number,
    versionLabel: row.version_label,
    status: row.status,
    commercialSummary: row.commercial_summary,
    moduleVisibilityIntent: row.module_visibility_intent,
    usageLimitIntent: row.usage_limit_intent,
    entitlementIntent: row.entitlement_intent,
    billingProviderIntent: row.billing_provider_intent,
    starterPackDefaultIntent: row.starter_pack_default_intent,
    contractorGroupTargetingIntent: row.contractor_group_targeting_intent,
    publishedSnapshot: row.published_snapshot,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    deprecatedAt: row.deprecated_at,
    archivedAt: row.archived_at
  };
}

function mapPlatformPackageDefinitionAuditEvent(
  row: PlatformPackageDefinitionAuditEventRow
): PlatformPackageDefinitionAuditEvent {
  return {
    id: row.id,
    packageDefinitionId: row.package_definition_id,
    packageDefinitionVersionId: row.package_definition_version_id,
    eventType: row.event_type,
    actorUserId: row.actor_id,
    reason: row.reason,
    confirmationText: row.confirmation_text,
    beforeSnapshot: row.before_snapshot,
    afterSnapshot: row.after_snapshot,
    metadata: row.metadata,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapContractorPackageAssignment(
  row: ContractorPackageAssignmentRow
): ContractorPackageAssignment {
  const company = firstRelation(row.company);
  const packageDefinition = firstRelation(row.package_definition);
  const packageDefinitionVersion = firstRelation(row.package_definition_version);

  return {
    id: row.id,
    companyId: row.company_id,
    companyName: company
      ? company.display_name || company.legal_name || company.slug
      : null,
    companySlug: company?.slug ?? null,
    packageDefinitionId: row.package_definition_id,
    packageDefinitionKey: packageDefinition?.package_key ?? null,
    packageDefinitionName: packageDefinition?.display_name ?? null,
    packageDefinitionVersionId: row.package_definition_version_id,
    packageDefinitionVersionLabel:
      packageDefinitionVersion?.version_label ?? null,
    packageDefinitionVersionNumber:
      packageDefinitionVersion?.version_number ?? null,
    packageDefinitionVersionStatus: packageDefinitionVersion?.status ?? null,
    status: row.status,
    lifecycleState: row.lifecycle_state,
    effectiveAt: row.effective_at,
    scheduledFor: row.scheduled_for,
    activatedAt: row.activated_at,
    supersededAt: row.superseded_at,
    canceledAt: row.canceled_at,
    supersedesAssignmentId: row.supersedes_assignment_id,
    supersededByAssignmentId: row.superseded_by_assignment_id,
    assignmentSnapshot: row.assignment_snapshot,
    billingImpactSnapshot: row.billing_impact_snapshot,
    entitlementModuleImpactSnapshot: row.entitlement_module_impact_snapshot,
    starterPackImplicationSnapshot: row.starter_pack_implication_snapshot,
    cancellationReason: row.cancellation_reason,
    supersessionReason: row.supersession_reason,
    grandfatheredContract: row.grandfathered_contract,
    customContractLabel: row.custom_contract_label,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at
  };
}

function mapContractorPackageAssignmentAuditEvent(
  row: ContractorPackageAssignmentAuditEventRow
): ContractorPackageAssignmentAuditEvent {
  return {
    id: row.id,
    contractorPackageAssignmentId: row.contractor_package_assignment_id,
    companyId: row.company_id,
    packageDefinitionId: row.package_definition_id,
    packageDefinitionVersionId: row.package_definition_version_id,
    eventType: row.event_type,
    actorUserId: row.actor_id,
    reason: row.reason,
    confirmationText: row.confirmation_text,
    beforeSnapshot: row.before_snapshot,
    afterSnapshot: row.after_snapshot,
    metadata: row.metadata,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapContractorPackageBillingMapping(
  row: ContractorPackageBillingMappingRow
): ContractorPackageBillingMapping {
  return {
    id: row.id,
    contractorPackageAssignmentId: row.contractor_package_assignment_id,
    companyId: row.company_id,
    packageDefinitionId: row.package_definition_id,
    packageDefinitionVersionId: row.package_definition_version_id,
    billingProvider: row.billing_provider,
    providerEnvironment: row.provider_environment,
    providerCustomerReference: row.provider_customer_reference,
    providerProductReference: row.provider_product_reference,
    providerPriceReference: row.provider_price_reference,
    providerSubscriptionReference: row.provider_subscription_reference,
    providerSubscriptionItemReference: row.provider_subscription_item_reference,
    billingState: row.billing_state,
    reconciliationState: row.reconciliation_state,
    trialOrEarlyAccessState: row.trial_or_early_access_state,
    customOrGrandfatheredTermsMarker: row.custom_or_grandfathered_terms_marker,
    expectedProviderStateSnapshot: row.expected_provider_state_snapshot,
    observedProviderStateSnapshot: row.observed_provider_state_snapshot,
    mappingSnapshot: row.mapping_snapshot,
    mismatchSummary: row.mismatch_summary,
    lastVerifiedAt: row.last_verified_at,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at
  };
}

function mapContractorPackageBillingMappingAuditEvent(
  row: ContractorPackageBillingMappingAuditEventRow
): ContractorPackageBillingMappingAuditEvent {
  return {
    id: row.id,
    contractorPackageBillingMappingId: row.contractor_package_billing_mapping_id,
    contractorPackageAssignmentId: row.contractor_package_assignment_id,
    companyId: row.company_id,
    packageDefinitionId: row.package_definition_id,
    packageDefinitionVersionId: row.package_definition_version_id,
    eventType: row.event_type,
    actorUserId: row.actor_id,
    reason: row.reason,
    beforeSnapshot: row.before_snapshot,
    afterSnapshot: row.after_snapshot,
    metadata: row.metadata,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapContractorPackageBillingSupportReview(
  row: ContractorPackageBillingSupportReviewRow
): ContractorPackageBillingSupportReview {
  return {
    id: row.id,
    contractorPackageBillingMappingId: row.contractor_package_billing_mapping_id,
    contractorPackageAssignmentId: row.contractor_package_assignment_id,
    companyId: row.company_id,
    packageDefinitionId: row.package_definition_id,
    packageDefinitionVersionId: row.package_definition_version_id,
    reviewStatus: row.review_status,
    resolutionCategory: row.resolution_category,
    providerEnvironment: row.provider_environment,
    providerReferenceSummary: row.provider_reference_summary,
    reconciliationEvidenceSnapshot: row.reconciliation_evidence_snapshot,
    webhookEvidenceSnapshot: row.webhook_evidence_snapshot,
    operatorEvidenceSnapshot: row.operator_evidence_snapshot,
    rollbackRecoverySnapshot: row.rollback_recovery_snapshot,
    supportSummary: row.support_summary,
    blockedReason: row.blocked_reason,
    escalationReason: row.escalation_reason,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at
  };
}

function mapContractorPackageBillingSupportReviewEvent(
  row: ContractorPackageBillingSupportReviewEventRow
): ContractorPackageBillingSupportReviewEvent {
  return {
    id: row.id,
    supportReviewId: row.support_review_id,
    contractorPackageBillingMappingId: row.contractor_package_billing_mapping_id,
    contractorPackageAssignmentId: row.contractor_package_assignment_id,
    companyId: row.company_id,
    eventType: row.event_type,
    actorUserId: row.actor_id,
    reason: row.reason,
    beforeSnapshot: row.before_snapshot,
    afterSnapshot: row.after_snapshot,
    metadata: row.metadata,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

export async function listPlatformPackageDefinitions(): Promise<PlatformPackageDefinition[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_package_definitions")
    .select(
      "id, package_key, display_name, description, status, intended_audience, segment_summary, created_by, updated_by, created_at, updated_at, archived_at"
    )
    .order("package_key", { ascending: true });

  if (response.error) {
    if (isMissingPackageDefinitionTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load package definitions: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data) ? response.data : []) as PlatformPackageDefinitionRow[]).map(
    mapPlatformPackageDefinition
  );
}

export async function getPlatformPackageDefinitionById(
  packageDefinitionId: string
): Promise<PlatformPackageDefinition | null> {
  if (!isUuid(packageDefinitionId)) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_package_definitions")
    .select(
      "id, package_key, display_name, description, status, intended_audience, segment_summary, created_by, updated_by, created_at, updated_at, archived_at"
    )
    .eq("id", packageDefinitionId)
    .maybeSingle();

  if (response.error) {
    if (isMissingPackageDefinitionTableError(response.error)) {
      return null;
    }

    throw new Error(
      `Unable to load package definition detail: ${response.error.message}`
    );
  }

  return response.data
    ? mapPlatformPackageDefinition(response.data as PlatformPackageDefinitionRow)
    : null;
}

export async function listPlatformPackageDefinitionVersions(): Promise<
  PlatformPackageDefinitionVersion[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_package_definition_versions")
    .select(
      `
        id,
        package_definition_id,
        version_number,
        version_label,
        status,
        commercial_summary,
        module_visibility_intent,
        usage_limit_intent,
        entitlement_intent,
        billing_provider_intent,
        starter_pack_default_intent,
        contractor_group_targeting_intent,
        published_snapshot,
        created_by,
        updated_by,
        created_at,
        updated_at,
        published_at,
        deprecated_at,
        archived_at,
        package_definition:platform_package_definitions (
          id,
          package_key,
          display_name
        )
      `
    )
    .order("package_definition_id", { ascending: true })
    .order("version_number", { ascending: false });

  if (response.error) {
    if (isMissingPackageDefinitionTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load package definition versions: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as PlatformPackageDefinitionVersionRow[]).map(
    mapPlatformPackageDefinitionVersion
  );
}

export async function listPlatformPackageDefinitionVersionsForDefinition(
  packageDefinitionId: string
): Promise<PlatformPackageDefinitionVersion[]> {
  if (!isUuid(packageDefinitionId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_package_definition_versions")
    .select(
      `
        id,
        package_definition_id,
        version_number,
        version_label,
        status,
        commercial_summary,
        module_visibility_intent,
        usage_limit_intent,
        entitlement_intent,
        billing_provider_intent,
        starter_pack_default_intent,
        contractor_group_targeting_intent,
        published_snapshot,
        created_by,
        updated_by,
        created_at,
        updated_at,
        published_at,
        deprecated_at,
        archived_at,
        package_definition:platform_package_definitions (
          id,
          package_key,
          display_name
        )
      `
    )
    .eq("package_definition_id", packageDefinitionId)
    .order("version_number", { ascending: false });

  if (response.error) {
    if (isMissingPackageDefinitionTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load package definition detail versions: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as PlatformPackageDefinitionVersionRow[]).map(
    mapPlatformPackageDefinitionVersion
  );
}

export async function listPlatformPackageDefinitionAuditEvents(
  packageDefinitionId: string
): Promise<PlatformPackageDefinitionAuditEvent[]> {
  if (!isUuid(packageDefinitionId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_package_definition_audit_events")
    .select(
      `
        id,
        package_definition_id,
        package_definition_version_id,
        event_type,
        actor_id,
        reason,
        confirmation_text,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .eq("package_definition_id", packageDefinitionId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingPackageDefinitionTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load package definition audit events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as PlatformPackageDefinitionAuditEventRow[]).map(
    mapPlatformPackageDefinitionAuditEvent
  );
}

export async function getPlatformPackageDefinitionCatalog(): Promise<PlatformPackageDefinitionCatalogModel> {
  const [definitions, versions] = await Promise.all([
    listPlatformPackageDefinitions(),
    listPlatformPackageDefinitionVersions()
  ]);

  return buildPlatformPackageDefinitionCatalog({
    generatedAt: new Date().toISOString(),
    definitions,
    versions
  });
}

export async function getPlatformPackageDefinitionDetail(
  packageDefinitionId: string
): Promise<PlatformPackageDefinitionDetailModel> {
  const [definition, versions, auditEvents] = await Promise.all([
    getPlatformPackageDefinitionById(packageDefinitionId),
    listPlatformPackageDefinitionVersionsForDefinition(packageDefinitionId),
    listPlatformPackageDefinitionAuditEvents(packageDefinitionId)
  ]);

  return buildPlatformPackageDefinitionDetail({
    generatedAt: new Date().toISOString(),
    packageDefinitionId,
    definition,
    versions,
    auditEvents
  });
}

export async function listContractorPackageAssignments(): Promise<
  ContractorPackageAssignment[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_assignments")
    .select(
      `
        id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        status,
        lifecycle_state,
        effective_at,
        scheduled_for,
        activated_at,
        superseded_at,
        canceled_at,
        supersedes_assignment_id,
        superseded_by_assignment_id,
        assignment_snapshot,
        billing_impact_snapshot,
        entitlement_module_impact_snapshot,
        starter_pack_implication_snapshot,
        cancellation_reason,
        supersession_reason,
        grandfathered_contract,
        custom_contract_label,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at,
        company:companies (
          id,
          slug,
          legal_name,
          display_name
        ),
        package_definition:platform_package_definitions (
          id,
          package_key,
          display_name
        ),
        package_definition_version:platform_package_definition_versions (
          id,
          version_number,
          version_label,
          status
        )
      `
    )
    .order("company_id", { ascending: true })
    .order("status", { ascending: true })
    .order("effective_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageAssignmentTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package assignments: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageAssignmentRow[]).map(
    mapContractorPackageAssignment
  );
}

export async function getContractorPackageAssignmentById(
  assignmentId: string
): Promise<ContractorPackageAssignment | null> {
  if (!isUuid(assignmentId)) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_assignments")
    .select(
      `
        id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        status,
        lifecycle_state,
        effective_at,
        scheduled_for,
        activated_at,
        superseded_at,
        canceled_at,
        supersedes_assignment_id,
        superseded_by_assignment_id,
        assignment_snapshot,
        billing_impact_snapshot,
        entitlement_module_impact_snapshot,
        starter_pack_implication_snapshot,
        cancellation_reason,
        supersession_reason,
        grandfathered_contract,
        custom_contract_label,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at,
        company:companies (
          id,
          slug,
          legal_name,
          display_name
        ),
        package_definition:platform_package_definitions (
          id,
          package_key,
          display_name
        ),
        package_definition_version:platform_package_definition_versions (
          id,
          version_number,
          version_label,
          status
        )
      `
    )
    .eq("id", assignmentId)
    .maybeSingle();

  if (response.error) {
    if (isMissingContractorPackageAssignmentTableError(response.error)) {
      return null;
    }

    throw new Error(
      `Unable to load contractor package assignment detail: ${response.error.message}`
    );
  }

  return response.data
    ? mapContractorPackageAssignment(response.data as ContractorPackageAssignmentRow)
    : null;
}

export async function listContractorPackageAssignmentAuditEvents(): Promise<
  ContractorPackageAssignmentAuditEvent[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_assignment_audit_events")
    .select(
      `
        id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        event_type,
        actor_id,
        reason,
        confirmation_text,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageAssignmentTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package assignment audit events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageAssignmentAuditEventRow[]).map(
    mapContractorPackageAssignmentAuditEvent
  );
}

export async function listContractorPackageAssignmentAuditEventsForAssignment(
  assignmentId: string
): Promise<ContractorPackageAssignmentAuditEvent[]> {
  if (!isUuid(assignmentId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_assignment_audit_events")
    .select(
      `
        id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        event_type,
        actor_id,
        reason,
        confirmation_text,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .eq("contractor_package_assignment_id", assignmentId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageAssignmentTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package assignment audit events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageAssignmentAuditEventRow[]).map(
    mapContractorPackageAssignmentAuditEvent
  );
}

export async function getContractorPackageAssignmentReadModel(): Promise<
  ContractorPackageAssignmentReadModel
> {
  const [assignments, auditEvents] = await Promise.all([
    listContractorPackageAssignments(),
    listContractorPackageAssignmentAuditEvents()
  ]);

  return buildContractorPackageAssignmentReadModel({
    generatedAt: new Date().toISOString(),
    assignments,
    auditEvents
  });
}

export async function getContractorPackageAssignmentDetail(
  assignmentId: string
): Promise<ContractorPackageAssignmentDetailModel> {
  const [assignment, auditEvents] = await Promise.all([
    getContractorPackageAssignmentById(assignmentId),
    listContractorPackageAssignmentAuditEventsForAssignment(assignmentId)
  ]);
  const relatedAssignments = assignment
    ? (await listContractorPackageAssignments()).filter(
        (candidate) => candidate.companyId === assignment.companyId
      )
    : [];

  return buildContractorPackageAssignmentDetail({
    generatedAt: new Date().toISOString(),
    assignmentId,
    assignment,
    auditEvents,
    relatedAssignments
  });
}

export async function listContractorPackageBillingMappings(): Promise<
  ContractorPackageBillingMapping[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_mappings")
    .select(
      `
        id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        billing_provider,
        provider_environment,
        provider_customer_reference,
        provider_product_reference,
        provider_price_reference,
        provider_subscription_reference,
        provider_subscription_item_reference,
        billing_state,
        reconciliation_state,
        trial_or_early_access_state,
        custom_or_grandfathered_terms_marker,
        expected_provider_state_snapshot,
        observed_provider_state_snapshot,
        mapping_snapshot,
        mismatch_summary,
        last_verified_at,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at
      `
    )
    .order("reconciliation_state", { ascending: true })
    .order("last_verified_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingMappingTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing mappings: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingMappingRow[]).map(
    mapContractorPackageBillingMapping
  );
}

export async function getContractorPackageBillingMappingById(
  mappingId: string
): Promise<ContractorPackageBillingMapping | null> {
  if (!isUuid(mappingId)) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_mappings")
    .select(
      `
        id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        billing_provider,
        provider_environment,
        provider_customer_reference,
        provider_product_reference,
        provider_price_reference,
        provider_subscription_reference,
        provider_subscription_item_reference,
        billing_state,
        reconciliation_state,
        trial_or_early_access_state,
        custom_or_grandfathered_terms_marker,
        expected_provider_state_snapshot,
        observed_provider_state_snapshot,
        mapping_snapshot,
        mismatch_summary,
        last_verified_at,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at
      `
    )
    .eq("id", mappingId)
    .maybeSingle();

  if (response.error) {
    if (isMissingContractorPackageBillingMappingTableError(response.error)) {
      return null;
    }

    throw new Error(
      `Unable to load contractor package billing mapping detail: ${response.error.message}`
    );
  }

  return response.data
    ? mapContractorPackageBillingMapping(
        response.data as ContractorPackageBillingMappingRow
      )
    : null;
}

export async function listContractorPackageBillingMappingAuditEvents(): Promise<
  ContractorPackageBillingMappingAuditEvent[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_mapping_audit_events")
    .select(
      `
        id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        event_type,
        actor_id,
        reason,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingMappingTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing mapping audit events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingMappingAuditEventRow[]).map(
    mapContractorPackageBillingMappingAuditEvent
  );
}

export async function listContractorPackageBillingMappingAuditEventsForMapping(
  mappingId: string
): Promise<ContractorPackageBillingMappingAuditEvent[]> {
  if (!isUuid(mappingId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_mapping_audit_events")
    .select(
      `
        id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        event_type,
        actor_id,
        reason,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .eq("contractor_package_billing_mapping_id", mappingId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingMappingTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing mapping audit events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingMappingAuditEventRow[]).map(
    mapContractorPackageBillingMappingAuditEvent
  );
}

async function getCompanyReferenceForProviderMapping(
  companyId: string | null
): Promise<ContractorPackageBillingMappingDetailReference | undefined> {
  if (!companyId || !isUuid(companyId)) {
    return undefined;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .select("id, slug, legal_name, display_name")
    .eq("id", companyId)
    .maybeSingle();

  if (response.error || !response.data) {
    return undefined;
  }

  const company = response.data as {
    id: string;
    slug: string | null;
    legal_name: string | null;
    display_name: string | null;
  };

  return {
    id: company.id,
    label: company.display_name ?? company.legal_name ?? company.slug ?? "Unknown contractor",
    secondaryLabel: company.slug ?? company.id
  };
}

function mapPackageDefinitionReference(
  packageDefinition: PlatformPackageDefinition | null
): ContractorPackageBillingMappingDetailReference | undefined {
  if (!packageDefinition) {
    return undefined;
  }

  return {
    id: packageDefinition.id,
    label: packageDefinition.displayName,
    secondaryLabel: packageDefinition.packageKey
  };
}

async function buildContractorPackageBillingMappingDetailReferences(
  mapping: ContractorPackageBillingMapping | null
): Promise<ContractorPackageBillingMappingDetailLinkedReferences> {
  if (!mapping) {
    return {};
  }

  const [assignment, company, packageDefinition, versions] = await Promise.all([
    mapping.contractorPackageAssignmentId
      ? getContractorPackageAssignmentById(mapping.contractorPackageAssignmentId)
      : Promise.resolve(null),
    getCompanyReferenceForProviderMapping(mapping.companyId),
    mapping.packageDefinitionId
      ? getPlatformPackageDefinitionById(mapping.packageDefinitionId)
      : Promise.resolve(null),
    mapping.packageDefinitionId
      ? listPlatformPackageDefinitionVersionsForDefinition(mapping.packageDefinitionId)
      : Promise.resolve([])
  ]);
  const packageDefinitionVersion =
    versions.find((version) => version.id === mapping.packageDefinitionVersionId) ??
    null;

  return {
    assignment: assignment
      ? {
          id: assignment.id,
          label: `${assignment.companyName ?? assignment.companySlug ?? "Unknown contractor"} assignment`,
          secondaryLabel: `${assignment.status} / ${assignment.lifecycleState}`
        }
      : undefined,
    company:
      company ??
      (assignment
        ? {
            id: assignment.companyId,
            label: assignment.companyName ?? assignment.companySlug ?? "Unknown contractor",
            secondaryLabel: assignment.companySlug ?? assignment.companyId
          }
        : undefined),
    packageDefinition:
      mapPackageDefinitionReference(packageDefinition) ??
      (assignment?.packageDefinitionId
        ? {
            id: assignment.packageDefinitionId,
            label:
              assignment.packageDefinitionName ??
              assignment.packageDefinitionKey ??
              "Unknown package definition",
            secondaryLabel: assignment.packageDefinitionKey ?? assignment.packageDefinitionId
          }
        : undefined),
    packageDefinitionVersion:
      packageDefinitionVersion
        ? {
            id: packageDefinitionVersion.id,
            label:
              packageDefinitionVersion.versionLabel ??
              `Version ${packageDefinitionVersion.versionNumber}`,
            secondaryLabel: packageDefinitionVersion.status
          }
        : assignment?.packageDefinitionVersionId
          ? {
              id: assignment.packageDefinitionVersionId,
              label:
                assignment.packageDefinitionVersionLabel ??
                (assignment.packageDefinitionVersionNumber
                  ? `Version ${assignment.packageDefinitionVersionNumber}`
                  : "Unknown package version"),
              secondaryLabel:
                assignment.packageDefinitionVersionStatus ??
                assignment.packageDefinitionVersionId
            }
          : undefined
  };
}

export async function getContractorPackageBillingMappingReadModel(): Promise<
  ContractorPackageBillingMappingReadModel
> {
  const [mappings, auditEvents] = await Promise.all([
    listContractorPackageBillingMappings(),
    listContractorPackageBillingMappingAuditEvents()
  ]);

  return buildContractorPackageBillingMappingReadModel({
    generatedAt: new Date().toISOString(),
    mappings,
    auditEvents
  });
}

export async function getContractorPackageBillingMappingDetail(
  mappingId: string
): Promise<ContractorPackageBillingMappingDetailModel> {
  const [mapping, auditEvents] = await Promise.all([
    getContractorPackageBillingMappingById(mappingId),
    listContractorPackageBillingMappingAuditEventsForMapping(mappingId)
  ]);
  const linkedReferences =
    await buildContractorPackageBillingMappingDetailReferences(mapping);

  return buildContractorPackageBillingMappingDetail({
    generatedAt: new Date().toISOString(),
    mappingId,
    mapping,
    auditEvents,
    linkedReferences,
    unavailableReason: mapping ? undefined : "Provider mapping unavailable."
  });
}

export async function listContractorPackageBillingSupportReviews(): Promise<
  ContractorPackageBillingSupportReview[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_support_reviews")
    .select(
      `
        id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        review_status,
        resolution_category,
        provider_environment,
        provider_reference_summary,
        reconciliation_evidence_snapshot,
        webhook_evidence_snapshot,
        operator_evidence_snapshot,
        rollback_recovery_snapshot,
        support_summary,
        blocked_reason,
        escalation_reason,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at
      `
    )
    .order("review_status", { ascending: true })
    .order("updated_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingSupportReviewTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing support reviews: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingSupportReviewRow[]).map(
    mapContractorPackageBillingSupportReview
  );
}

export async function listContractorPackageBillingSupportReviewsForMapping(
  mappingId: string
): Promise<ContractorPackageBillingSupportReview[]> {
  if (!isUuid(mappingId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_support_reviews")
    .select(
      `
        id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        review_status,
        resolution_category,
        provider_environment,
        provider_reference_summary,
        reconciliation_evidence_snapshot,
        webhook_evidence_snapshot,
        operator_evidence_snapshot,
        rollback_recovery_snapshot,
        support_summary,
        blocked_reason,
        escalation_reason,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at
      `
    )
    .eq("contractor_package_billing_mapping_id", mappingId)
    .order("review_status", { ascending: true })
    .order("updated_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingSupportReviewTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing support reviews: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingSupportReviewRow[]).map(
    mapContractorPackageBillingSupportReview
  );
}

export async function getContractorPackageBillingSupportReviewById(
  supportReviewId: string
): Promise<ContractorPackageBillingSupportReview | null> {
  if (!isUuid(supportReviewId)) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_support_reviews")
    .select(
      `
        id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        package_definition_id,
        package_definition_version_id,
        review_status,
        resolution_category,
        provider_environment,
        provider_reference_summary,
        reconciliation_evidence_snapshot,
        webhook_evidence_snapshot,
        operator_evidence_snapshot,
        rollback_recovery_snapshot,
        support_summary,
        blocked_reason,
        escalation_reason,
        created_by,
        updated_by,
        created_at,
        updated_at,
        archived_at
      `
    )
    .eq("id", supportReviewId)
    .maybeSingle();

  if (response.error) {
    if (isMissingContractorPackageBillingSupportReviewTableError(response.error)) {
      return null;
    }

    throw new Error(
      `Unable to load contractor package billing support review detail: ${response.error.message}`
    );
  }

  return response.data
    ? mapContractorPackageBillingSupportReview(
        response.data as ContractorPackageBillingSupportReviewRow
      )
    : null;
}

export async function listContractorPackageBillingSupportReviewEvents(): Promise<
  ContractorPackageBillingSupportReviewEvent[]
> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_support_review_events")
    .select(
      `
        id,
        support_review_id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        event_type,
        actor_id,
        reason,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingSupportReviewTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing support review events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingSupportReviewEventRow[]).map(
    mapContractorPackageBillingSupportReviewEvent
  );
}

export async function listContractorPackageBillingSupportReviewEventsForReview(
  supportReviewId: string
): Promise<ContractorPackageBillingSupportReviewEvent[]> {
  if (!isUuid(supportReviewId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_support_review_events")
    .select(
      `
        id,
        support_review_id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        event_type,
        actor_id,
        reason,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .eq("support_review_id", supportReviewId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingSupportReviewTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing support review events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingSupportReviewEventRow[]).map(
    mapContractorPackageBillingSupportReviewEvent
  );
}

export async function listContractorPackageBillingSupportReviewEventsForMapping(
  mappingId: string
): Promise<ContractorPackageBillingSupportReviewEvent[]> {
  if (!isUuid(mappingId)) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contractor_package_billing_support_review_events")
    .select(
      `
        id,
        support_review_id,
        contractor_package_billing_mapping_id,
        contractor_package_assignment_id,
        company_id,
        event_type,
        actor_id,
        reason,
        before_snapshot,
        after_snapshot,
        metadata,
        occurred_at,
        created_at
      `
    )
    .eq("contractor_package_billing_mapping_id", mappingId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    if (isMissingContractorPackageBillingSupportReviewTableError(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load contractor package billing support review events: ${response.error.message}`
    );
  }

  return ((Array.isArray(response.data)
    ? response.data
    : []) as ContractorPackageBillingSupportReviewEventRow[]).map(
    mapContractorPackageBillingSupportReviewEvent
  );
}

export async function getContractorPackageBillingSupportReviewReadModel(): Promise<
  ContractorPackageBillingSupportReviewReadModel
> {
  const [supportReviews, supportReviewEvents] = await Promise.all([
    listContractorPackageBillingSupportReviews(),
    listContractorPackageBillingSupportReviewEvents()
  ]);

  return buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: new Date().toISOString(),
    supportReviews,
    supportReviewEvents
  });
}

async function buildContractorPackageBillingSupportReviewDetailReferences(
  supportReview: ContractorPackageBillingSupportReview | null
): Promise<ContractorPackageBillingSupportReviewDetailLinkedReferences> {
  if (!supportReview) {
    return {};
  }

  const [mapping, assignment, company, packageDefinition, versions] =
    await Promise.all([
      supportReview.contractorPackageBillingMappingId
        ? getContractorPackageBillingMappingById(
            supportReview.contractorPackageBillingMappingId
          )
        : Promise.resolve(null),
      supportReview.contractorPackageAssignmentId
        ? getContractorPackageAssignmentById(
            supportReview.contractorPackageAssignmentId
          )
        : Promise.resolve(null),
      getCompanyReferenceForProviderMapping(supportReview.companyId),
      supportReview.packageDefinitionId
        ? getPlatformPackageDefinitionById(supportReview.packageDefinitionId)
        : Promise.resolve(null),
      supportReview.packageDefinitionId
        ? listPlatformPackageDefinitionVersionsForDefinition(
            supportReview.packageDefinitionId
          )
        : Promise.resolve([])
    ]);
  const packageDefinitionVersion =
    versions.find(
      (version) => version.id === supportReview.packageDefinitionVersionId
    ) ?? null;
  const providerMapping: ContractorPackageBillingSupportReviewDetailReference | undefined =
    mapping
      ? {
          id: mapping.id,
          label: `${mapping.billingProvider} / ${mapping.providerEnvironment}`,
          secondaryLabel: `${mapping.billingState} / ${mapping.reconciliationState}`
        }
      : undefined;

  return {
    providerMapping,
    assignment: assignment
      ? {
          id: assignment.id,
          label: `${assignment.companyName ?? assignment.companySlug ?? "Unknown contractor"} assignment`,
          secondaryLabel: `${assignment.status} / ${assignment.lifecycleState}`
        }
      : undefined,
    company:
      company ??
      (assignment
        ? {
            id: assignment.companyId,
            label: assignment.companyName ?? assignment.companySlug ?? "Unknown contractor",
            secondaryLabel: assignment.companySlug ?? assignment.companyId
          }
        : undefined),
    packageDefinition:
      mapPackageDefinitionReference(packageDefinition) ??
      (assignment?.packageDefinitionId
        ? {
            id: assignment.packageDefinitionId,
            label:
              assignment.packageDefinitionName ??
              assignment.packageDefinitionKey ??
              "Unknown package definition",
            secondaryLabel: assignment.packageDefinitionKey ?? assignment.packageDefinitionId
          }
        : undefined),
    packageDefinitionVersion:
      packageDefinitionVersion
        ? {
            id: packageDefinitionVersion.id,
            label:
              packageDefinitionVersion.versionLabel ??
              `Version ${packageDefinitionVersion.versionNumber}`,
            secondaryLabel: packageDefinitionVersion.status
          }
        : assignment?.packageDefinitionVersionId
          ? {
              id: assignment.packageDefinitionVersionId,
              label:
                assignment.packageDefinitionVersionLabel ??
                (assignment.packageDefinitionVersionNumber
                  ? `Version ${assignment.packageDefinitionVersionNumber}`
                  : "Unknown package version"),
              secondaryLabel:
                assignment.packageDefinitionVersionStatus ??
                assignment.packageDefinitionVersionId
            }
          : undefined
  };
}

export async function getContractorPackageBillingSupportReviewDetail(
  supportReviewId: string
): Promise<ContractorPackageBillingSupportReviewDetailModel> {
  const [supportReview, events] = await Promise.all([
    getContractorPackageBillingSupportReviewById(supportReviewId),
    listContractorPackageBillingSupportReviewEventsForReview(supportReviewId)
  ]);
  const linkedReferences =
    await buildContractorPackageBillingSupportReviewDetailReferences(supportReview);

  return buildContractorPackageBillingSupportReviewDetail({
    generatedAt: new Date().toISOString(),
    supportReviewId,
    supportReview,
    events,
    linkedReferences,
    unavailableReason: supportReview ? undefined : "Support review unavailable."
  });
}

export async function getContractorPackageBillingSupportReviewReadModelForMapping(
  mappingId: string
): Promise<ContractorPackageBillingSupportReviewReadModel> {
  const [supportReviews, supportReviewEvents] = await Promise.all([
    listContractorPackageBillingSupportReviewsForMapping(mappingId),
    listContractorPackageBillingSupportReviewEventsForMapping(mappingId)
  ]);

  return buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: new Date().toISOString(),
    supportReviews,
    supportReviewEvents
  });
}

export async function recordStarterPackProvisioningExecutionAttempt(input: {
  descriptor: StarterPackProvisioningExecutionAttemptDescriptor;
  userId: string;
  runId?: string | null;
  starterPackId?: string | null;
  organizationId?: string | null;
  reviewStatus?: string | null;
  runStatus?: PlatformStarterPackProvisioningRunStatus | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_starter_pack_provisioning_attempts")
    .insert({
      run_id: input.runId ?? null,
      starter_pack_id: input.starterPackId ?? null,
      organization_id: input.organizationId ?? null,
      attempted_by: input.userId,
      attempt_type: "execute",
      outcome: input.descriptor.outcome,
      reason_code: input.descriptor.reasonCode,
      safe_message: input.descriptor.safeMessage,
      review_status: input.reviewStatus ?? null,
      run_status: input.runStatus ?? null,
      metadata: input.metadata ?? {}
    });

  if (response.error) {
    throw new Error("Unable to record provisioning operation attempt.");
  }
}

export async function getStarterPackProvisioningRunDetail(
  runId: string
): Promise<PlatformStarterPackProvisioningRunDetail | null> {
  const supabase = getSupabaseAdminClient();
  const runResponse = await supabase
    .from("platform_starter_pack_provisioning_runs")
    .select(
      `
        *,
        starter_pack:platform_starter_packs (
          id,
          pack_key,
          name
        ),
        organization:companies (
          id,
          slug,
          legal_name,
          display_name
        )
      `
    )
    .eq("id", runId)
    .maybeSingle();

  if (runResponse.error) {
    throw new Error(
      `Unable to load starter pack provisioning audit run: ${runResponse.error.message}`
    );
  }

  if (!runResponse.data) {
    return null;
  }

  const itemResponse = await supabase
    .from("platform_starter_pack_provisioning_run_items")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (itemResponse.error) {
    throw new Error(
      `Unable to load starter pack provisioning audit items: ${itemResponse.error.message}`
    );
  }

  const itemRows = Array.isArray(itemResponse.data)
    ? (itemResponse.data as PlatformStarterPackProvisioningRunItemRow[])
    : [];
  const items = itemRows.map(mapStarterPackProvisioningRunItem);
  const run = mapStarterPackProvisioningRun(
    runResponse.data as PlatformStarterPackProvisioningRunRow,
    new Map([
      [
        runId,
        {
          itemCount: items.length,
          destinationRecordCount: items.filter((item) =>
            Boolean(item.destinationRecordId)
          ).length,
          pendingItemCount: items.filter((item) => item.status === "pending")
            .length,
          completedItemCount: items.filter((item) => item.status === "completed")
            .length,
          skippedItemCount: items.filter((item) => item.status === "skipped")
            .length,
          blockedItemCount: items.filter((item) => item.status === "blocked")
            .length,
          failedItemCount: items.filter((item) => item.status === "failed")
            .length,
          wouldCreateItemCount: items.filter(
            (item) => item.action === "would_create"
          ).length,
          skippedExistingItemCount: items.filter(
            (item) => item.action === "skipped_existing"
          ).length,
          createdItemCount: items.filter((item) => item.action === "created")
            .length
        }
      ]
    ])
  );

  return {
    ...run,
    items
  };
}

function uniqueNonNullIds(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function emptyUsageFact(): StarterPackProvisioningDestinationUsageFact {
  return {
    destinationExists: false,
    usageCounts: {}
  };
}

function ensureUsageFact(
  facts: Record<string, StarterPackProvisioningDestinationUsageFact>,
  destinationId: string
) {
  const current = facts[destinationId] ?? emptyUsageFact();
  facts[destinationId] = current;
  return current;
}

function incrementUsageFact(
  facts: Record<string, StarterPackProvisioningDestinationUsageFact>,
  destinationId: string | null | undefined,
  source: string
) {
  if (!destinationId) {
    return;
  }

  const fact = ensureUsageFact(facts, destinationId);
  fact.usageCounts[source] = (fact.usageCounts[source] ?? 0) + 1;
}

async function loadTemplateUsageFacts(input: {
  organizationId: string;
  destinationIds: string[];
}) {
  const facts = Object.fromEntries(
    input.destinationIds.map((id) => [id, emptyUsageFact()])
  ) as Record<string, StarterPackProvisioningDestinationUsageFact>;

  if (input.destinationIds.length === 0) {
    return facts;
  }

  const supabase = getSupabaseAdminClient();
  const [
    templateResponse,
    estimateResponse,
    invoiceResponse,
    contractResponse,
    snapshotResponse,
    workflowSettingsResponse,
    userPreferenceResponse
  ] = await Promise.all([
    supabase
      .from("document_templates")
      .select("id, status, is_default")
      .eq("company_id", input.organizationId)
      .in("id", input.destinationIds),
    supabase
      .from("estimates")
      .select("template_id")
      .eq("company_id", input.organizationId)
      .in("template_id", input.destinationIds),
    supabase
      .from("invoices")
      .select("template_id")
      .eq("company_id", input.organizationId)
      .in("template_id", input.destinationIds),
    supabase
      .from("contracts")
      .select("template_id")
      .eq("company_id", input.organizationId)
      .in("template_id", input.destinationIds),
    supabase
      .from("estimate_commercial_snapshots")
      .select("template_id")
      .eq("company_id", input.organizationId)
      .in("template_id", input.destinationIds),
    supabase
      .from("organization_workflow_settings")
      .select("approved_estimate_contract_template_id")
      .eq("company_id", input.organizationId)
      .in("approved_estimate_contract_template_id", input.destinationIds),
    supabase
      .from("user_estimate_template_preferences")
      .select("preferred_estimate_template_id")
      .eq("organization_id", input.organizationId)
      .in("preferred_estimate_template_id", input.destinationIds)
  ]);

  const responses = [
    templateResponse,
    estimateResponse,
    invoiceResponse,
    contractResponse,
    snapshotResponse,
    workflowSettingsResponse,
    userPreferenceResponse
  ];
  const failedResponse = responses.find((response) => response.error);

  if (failedResponse?.error) {
    throw new Error("Unable to load document template usage for void readiness.");
  }

  for (const row of Array.isArray(templateResponse.data)
    ? (templateResponse.data as Array<{
        id: string;
        status: "active" | "archived";
        is_default: boolean;
      }>)
    : []) {
    const fact = ensureUsageFact(facts, row.id);
    fact.destinationExists = true;

    if (row.status === "active" && row.is_default) {
      incrementUsageFact(facts, row.id, "activeDefaults");
    }
  }

  for (const row of Array.isArray(estimateResponse.data)
    ? (estimateResponse.data as Array<{ template_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.template_id, "estimates");
  }

  for (const row of Array.isArray(invoiceResponse.data)
    ? (invoiceResponse.data as Array<{ template_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.template_id, "invoices");
  }

  for (const row of Array.isArray(contractResponse.data)
    ? (contractResponse.data as Array<{ template_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.template_id, "contracts");
  }

  for (const row of Array.isArray(snapshotResponse.data)
    ? (snapshotResponse.data as Array<{ template_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.template_id, "estimateCommercialSnapshots");
  }

  for (const row of Array.isArray(workflowSettingsResponse.data)
    ? (workflowSettingsResponse.data as Array<{
        approved_estimate_contract_template_id: string | null;
      }>)
    : []) {
    incrementUsageFact(
      facts,
      row.approved_estimate_contract_template_id,
      "organizationWorkflowSettings"
    );
  }

  for (const row of Array.isArray(userPreferenceResponse.data)
    ? (userPreferenceResponse.data as Array<{
        preferred_estimate_template_id: string | null;
      }>)
    : []) {
    incrementUsageFact(
      facts,
      row.preferred_estimate_template_id,
      "userEstimateTemplatePreferences"
    );
  }

  return facts;
}

async function loadCatalogUsageFacts(input: {
  organizationId: string;
  destinationIds: string[];
}) {
  const facts = Object.fromEntries(
    input.destinationIds.map((id) => [id, emptyUsageFact()])
  ) as Record<string, StarterPackProvisioningDestinationUsageFact>;

  if (input.destinationIds.length === 0) {
    return facts;
  }

  const supabase = getSupabaseAdminClient();
  const [
    catalogResponse,
    estimateLineResponse,
    invoiceLineResponse,
    snapshotItemResponse,
    systemCatalogResponse,
    systemComponentResponse,
    floorSystemComponentResponse,
    inventoryResponse
  ] = await Promise.all([
    supabase
      .from("catalog_items")
      .select("id, status, is_default")
      .eq("company_id", input.organizationId)
      .in("id", input.destinationIds),
    supabase
      .from("estimate_line_items")
      .select("catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("catalog_item_id", input.destinationIds),
    supabase
      .from("invoice_line_items")
      .select("catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("catalog_item_id", input.destinationIds),
    supabase
      .from("estimate_commercial_snapshot_items")
      .select("catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("catalog_item_id", input.destinationIds),
    supabase
      .from("catalog_system_components")
      .select("system_catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("system_catalog_item_id", input.destinationIds),
    supabase
      .from("catalog_system_components")
      .select("component_catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("component_catalog_item_id", input.destinationIds),
    supabase
      .from("floor_system_template_components")
      .select("catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("catalog_item_id", input.destinationIds),
    supabase
      .from("inventory_items")
      .select("catalog_item_id")
      .eq("company_id", input.organizationId)
      .in("catalog_item_id", input.destinationIds)
  ]);

  const responses = [
    catalogResponse,
    estimateLineResponse,
    invoiceLineResponse,
    snapshotItemResponse,
    systemCatalogResponse,
    systemComponentResponse,
    floorSystemComponentResponse,
    inventoryResponse
  ];
  const failedResponse = responses.find((response) => response.error);

  if (failedResponse?.error) {
    throw new Error("Unable to load catalog item usage for void readiness.");
  }

  for (const row of Array.isArray(catalogResponse.data)
    ? (catalogResponse.data as Array<{
        id: string;
        status: "active" | "archived";
        is_default: boolean;
      }>)
    : []) {
    const fact = ensureUsageFact(facts, row.id);
    fact.destinationExists = true;

    if (row.status === "active" && row.is_default) {
      incrementUsageFact(facts, row.id, "activeDefaults");
    }
  }

  for (const row of Array.isArray(estimateLineResponse.data)
    ? (estimateLineResponse.data as Array<{ catalog_item_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.catalog_item_id, "estimateLineItems");
  }

  for (const row of Array.isArray(invoiceLineResponse.data)
    ? (invoiceLineResponse.data as Array<{ catalog_item_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.catalog_item_id, "invoiceLineItems");
  }

  for (const row of Array.isArray(snapshotItemResponse.data)
    ? (snapshotItemResponse.data as Array<{ catalog_item_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.catalog_item_id, "estimateCommercialSnapshotItems");
  }

  for (const row of Array.isArray(systemCatalogResponse.data)
    ? (systemCatalogResponse.data as Array<{
        system_catalog_item_id: string | null;
      }>)
    : []) {
    incrementUsageFact(facts, row.system_catalog_item_id, "catalogSystemMasters");
  }

  for (const row of Array.isArray(systemComponentResponse.data)
    ? (systemComponentResponse.data as Array<{
        component_catalog_item_id: string | null;
      }>)
    : []) {
    incrementUsageFact(
      facts,
      row.component_catalog_item_id,
      "catalogSystemComponents"
    );
  }

  for (const row of Array.isArray(floorSystemComponentResponse.data)
    ? (floorSystemComponentResponse.data as Array<{
        catalog_item_id: string | null;
      }>)
    : []) {
    incrementUsageFact(facts, row.catalog_item_id, "floorSystemTemplateComponents");
  }

  for (const row of Array.isArray(inventoryResponse.data)
    ? (inventoryResponse.data as Array<{ catalog_item_id: string | null }>)
    : []) {
    incrementUsageFact(facts, row.catalog_item_id, "inventoryItems");
  }

  return facts;
}

export async function getStarterPackProvisioningRunUsage(
  runId: string
): Promise<StarterPackProvisioningVoidReadiness | null> {
  const run = await getStarterPackProvisioningRunDetail(runId);

  if (!run) {
    return null;
  }

  const documentTemplateDestinationIds = uniqueNonNullIds(
    run.items
      .filter((item) => item.destinationRecordType === "document_template")
      .map((item) => item.destinationRecordId)
  );
  const catalogItemDestinationIds = uniqueNonNullIds(
    run.items
      .filter((item) => item.destinationRecordType === "catalog_item")
      .map((item) => item.destinationRecordId)
  );
  const [documentTemplates, catalogItems] = await Promise.all([
    loadTemplateUsageFacts({
      organizationId: run.organizationId,
      destinationIds: documentTemplateDestinationIds
    }),
    loadCatalogUsageFacts({
      organizationId: run.organizationId,
      destinationIds: catalogItemDestinationIds
    })
  ]);
  const usageFacts: StarterPackProvisioningDestinationUsageFacts = {
    documentTemplates,
    catalogItems
  };

  return buildStarterPackProvisioningVoidReadiness({
    run,
    usageFacts
  });
}

export async function getStarterPackProvisioningDraftReview(
  runId: string
): Promise<StarterPackProvisioningDraftReview | null> {
  const run = await getStarterPackProvisioningRunDetail(runId);

  if (!run) {
    return null;
  }

  const [starterPacks, tenants] = await Promise.all([
    listPlatformStarterPacks(),
    listTenantsForPlatformAdmin()
  ]);
  const starterPack =
    starterPacks.find((candidate) => candidate.id === run.starterPackId) ?? null;
  const tenant =
    tenants.find((candidate) => candidate.id === run.organizationId) ?? null;
  const [organizationTemplates, organizationCatalogItems] = tenant
    ? await Promise.all([
        listOrganizationDocumentTemplatesForPlatformAdmin(tenant.id),
        listOrganizationCatalogItemsForPlatformAdmin(tenant.id)
      ])
    : [[], []];
  const currentDryRun = buildStarterPackProvisioningDryRun({
    organization: tenant
      ? {
          id: tenant.id,
          name: tenant.display_name || tenant.legal_name,
          slug: tenant.slug
        }
      : null,
    starterPack,
    organizationTemplates,
    organizationCatalogItems
  });

  return buildStarterPackProvisioningDraftReview({
    run,
    currentDryRun
  });
}

export async function approveStarterPackProvisioningDraftRun(input: {
  runId: string;
  confirmationText: string;
  userId: string;
}): Promise<PlatformStarterPackProvisioningRunDetail> {
  const review = await getStarterPackProvisioningDraftReview(input.runId);

  if (!review) {
    throw new Error("Unable to load provisioning audit draft for approval.");
  }

  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: input.confirmationText
  });

  if (!eligibility.eligible) {
    throw new Error(
      eligibility.issues[0]?.message ??
        "This provisioning audit draft is not eligible for approval."
    );
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_starter_pack_provisioning_runs")
    .update({
      status: "approved",
      approved_by: input.userId,
      approved_at: new Date().toISOString(),
      confirmation_text: input.confirmationText
    })
    .eq("id", input.runId)
    .eq("status", "draft")
    .select("id")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to approve provisioning audit draft: ${response.error.message}`
    );
  }

  const approvedRun = await getStarterPackProvisioningRunDetail(input.runId);

  if (!approvedRun) {
    throw new Error("Unable to load approved provisioning audit draft.");
  }

  return approvedRun;
}

function normalizeProvisioningExecutionRpcResult(
  value: unknown
): StarterPackProvisioningExecutionRpcResult {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const status = record.status;

  if (
    typeof record.runId !== "string" ||
    ![
      "approved",
      "running",
      "completed",
      "completed_with_warnings",
      "failed"
    ].includes(typeof status === "string" ? status : "")
  ) {
    throw new Error("Provisioning execution returned an invalid response.");
  }

  return {
    runId: record.runId,
    status: status as PlatformStarterPackProvisioningRunStatus,
    alreadyCompleted: record.alreadyCompleted === true,
    createdTemplateCount:
      typeof record.createdTemplateCount === "number"
        ? record.createdTemplateCount
        : 0,
    createdCatalogItemCount:
      typeof record.createdCatalogItemCount === "number"
        ? record.createdCatalogItemCount
        : 0,
    skippedCount:
      typeof record.skippedCount === "number" ? record.skippedCount : 0,
    message:
      typeof record.message === "string"
        ? record.message
        : "Starter-pack provisioning execution completed."
  };
}

export async function executeApprovedStarterPackProvisioningRun(input: {
  runId: string;
  confirmationText: string;
  userId: string;
}): Promise<{
  run: PlatformStarterPackProvisioningRunDetail;
  result: StarterPackProvisioningExecutionRpcResult;
}> {
  const [run, review] = await Promise.all([
    getStarterPackProvisioningRunDetail(input.runId),
    getStarterPackProvisioningDraftReview(input.runId)
  ]);

  if (!run || !review) {
    await recordStarterPackProvisioningExecutionAttempt({
      descriptor: describeProvisioningExecutionAttemptFromIssue(
        "Unable to load approved provisioning run for execution."
      ),
      userId: input.userId,
      runId: input.runId,
      metadata: { stage: "review_load" }
    });

    throw new Error("Unable to load approved provisioning run for execution.");
  }

  if (run.status === "completed" || run.status === "completed_with_warnings") {
    await recordStarterPackProvisioningExecutionAttempt({
      descriptor: describeProvisioningExecutionAttemptForAlreadyCompleted(),
      userId: input.userId,
      runId: run.id,
      starterPackId: run.starterPackId,
      organizationId: run.organizationId,
      reviewStatus: review.freshnessStatus,
      runStatus: run.status,
      metadata: {
        stage: "already_completed",
        destinationRecordCount: run.destinationRecordCount ?? 0
      }
    });

    throw new Error(
      "Provisioning run was already completed. No duplicate records were created."
    );
  }

  const eligibility = evaluateStarterPackProvisioningExecutionEligibility({
    run,
    review,
    confirmationText: input.confirmationText
  });

  if (!eligibility.eligible) {
    const descriptor = describeProvisioningExecutionAttemptFromIssue(
      eligibility.issues[0]?.message ??
        "This provisioning run is not eligible for execution."
    );
    const context = attemptContextFromReview({ run, review });

    await recordStarterPackProvisioningExecutionAttempt({
      descriptor,
      userId: input.userId,
      ...context,
      metadata: {
        stage: "eligibility",
        issueCount: eligibility.issues.length,
        firstIssueSeverity: eligibility.issues[0]?.severity ?? null
      }
    });

    throw new Error(
      eligibility.issues[0]?.message ??
        "This provisioning run is not eligible for execution."
    );
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase.rpc(
    "execute_platform_starter_pack_provisioning_run",
    {
      p_run_id: input.runId,
      p_actor_id: input.userId
    }
  );

  if (response.error) {
    await recordStarterPackProvisioningExecutionAttempt({
      descriptor: describeProvisioningExecutionAttemptForDatabaseGuard(),
      userId: input.userId,
      runId: run.id,
      starterPackId: run.starterPackId,
      organizationId: run.organizationId,
      reviewStatus: review.freshnessStatus,
      runStatus: run.status,
      metadata: {
        stage: "rpc_guard",
        errorCode: response.error.code ?? null
      }
    });

    throw new Error(
      "Provisioning execution did not complete. Review the operation attempt log for the safe blocker."
    );
  }

  const result = normalizeProvisioningExecutionRpcResult(response.data);
  const executedRun = await getStarterPackProvisioningRunDetail(input.runId);

  if (!executedRun) {
    throw new Error("Provisioning execution completed but the run could not be loaded.");
  }

  if (result.alreadyCompleted) {
    await recordStarterPackProvisioningExecutionAttempt({
      descriptor: describeProvisioningExecutionAttemptForAlreadyCompleted(),
      userId: input.userId,
      runId: executedRun.id,
      starterPackId: executedRun.starterPackId,
      organizationId: executedRun.organizationId,
      reviewStatus: review.freshnessStatus,
      runStatus: executedRun.status,
      metadata: {
        stage: "rpc_noop",
        createdTemplateCount: result.createdTemplateCount,
        createdCatalogItemCount: result.createdCatalogItemCount,
        skippedCount: result.skippedCount
      }
    });
  }

  return {
    run: executedRun,
    result
  };
}

function buildProvisioningDraftIdempotencyKey(input: {
  userId: string;
  organizationId: string;
  starterPackId: string;
  fingerprintPayload: Record<string, unknown>;
}) {
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        userId: input.userId,
        organizationId: input.organizationId,
        starterPackId: input.starterPackId,
        fingerprintPayload: input.fingerprintPayload
      })
    )
    .digest("hex")
    .slice(0, 32);

  return `starter-pack-draft:${hash}`;
}

export async function createStarterPackProvisioningDraft(input: {
  organizationId: string;
  starterPackId: string;
  userId: string;
}): Promise<{
  run: PlatformStarterPackProvisioningRunDetail;
  reusedExistingDraft: boolean;
}> {
  const [starterPacks, tenants] = await Promise.all([
    listPlatformStarterPacks(),
    listTenantsForPlatformAdmin()
  ]);
  const starterPack =
    starterPacks.find((pack) => pack.id === input.starterPackId) ?? null;
  const tenant =
    tenants.find((candidate) => candidate.id === input.organizationId) ?? null;

  if (!tenant) {
    throw new Error("Select a valid contractor organization.");
  }

  if (!starterPack) {
    throw new Error("Select a valid starter pack.");
  }

  if (starterPack.status !== "published") {
    throw new Error(
      "Only published starter packs can create approval drafts. Draft and archived packs remain inspect-only."
    );
  }

  if (starterPack.items.length === 0) {
    throw new Error("This starter pack has no items to capture in an approval draft.");
  }

  const [organizationTemplates, organizationCatalogItems] = await Promise.all([
    listOrganizationDocumentTemplatesForPlatformAdmin(input.organizationId),
    listOrganizationCatalogItemsForPlatformAdmin(input.organizationId)
  ]);
  const report = buildStarterPackProvisioningDryRun({
    organization: {
      id: tenant.id,
      name: tenant.display_name || tenant.legal_name,
      slug: tenant.slug
    },
    starterPack,
    organizationTemplates,
    organizationCatalogItems
  });

  if (report.blockedCount > 0 || report.unavailableCount > 0) {
    throw new Error(
      "Resolve blocked or unavailable dry-run rows before creating an approval draft."
    );
  }

  const fingerprintPayload = buildProvisioningDraftFingerprintPayload(report);
  const idempotencyKey = buildProvisioningDraftIdempotencyKey({
    userId: input.userId,
    organizationId: input.organizationId,
    starterPackId: input.starterPackId,
    fingerprintPayload
  });
  const supabase = getSupabaseAdminClient();
  const existingResponse = await supabase
    .from("platform_starter_pack_provisioning_runs")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to check existing provisioning draft: ${existingResponse.error.message}`
    );
  }

  const existingRunId =
    existingResponse.data &&
    typeof (existingResponse.data as { id?: unknown }).id === "string"
      ? (existingResponse.data as { id: string }).id
      : null;

  if (existingRunId) {
    const existingRun = await getStarterPackProvisioningRunDetail(existingRunId);

    if (!existingRun) {
      throw new Error("Unable to load existing provisioning draft.");
    }

    return {
      run: existingRun,
      reusedExistingDraft: true
    };
  }

  const runResponse = await supabase
    .from("platform_starter_pack_provisioning_runs")
    .insert({
      starter_pack_id: input.starterPackId,
      organization_id: input.organizationId,
      requested_by: input.userId,
      status: "draft",
      dry_run_snapshot: buildProvisioningDraftSnapshot(report),
      idempotency_key: idempotencyKey
    })
    .select("id")
    .single();

  if (runResponse.error) {
    throw new Error(
      `Unable to create provisioning approval draft: ${runResponse.error.message}`
    );
  }

  const runId = (runResponse.data as { id: string }).id;
  const draftItems = mapDryRunRowsToProvisioningDraftItems(report.rows);
  const itemResponse = await supabase
    .from("platform_starter_pack_provisioning_run_items")
    .insert(
      draftItems.map((item) => ({
        run_id: runId,
        starter_pack_item_id: item.starterPackItemId,
        source_item_type: item.sourceItemType,
        source_template_seed_id: item.sourceTemplateSeedId,
        source_catalog_seed_id: item.sourceCatalogSeedId,
        destination_record_type: item.destinationRecordType,
        destination_record_id: item.destinationRecordId,
        action: item.action,
        status: item.status,
        source_snapshot: item.sourceSnapshot,
        destination_snapshot: item.destinationSnapshot,
        reason: item.reason
      }))
    );

  if (itemResponse.error) {
    await supabase
      .from("platform_starter_pack_provisioning_runs")
      .update({
        status: "failed",
        error_message:
          "Approval draft item capture failed. No contractor-owned records were written."
      })
      .eq("id", runId);

    throw new Error(
      `Unable to create provisioning approval draft items: ${itemResponse.error.message}`
    );
  }

  const run = await getStarterPackProvisioningRunDetail(runId);

  if (!run) {
    throw new Error("Unable to load created provisioning approval draft.");
  }

  return {
    run,
    reusedExistingDraft: false
  };
}

export async function upsertPlatformStarterPack(input: {
  packId?: string | null;
  packKey: string;
  name: string;
  description: string | null;
  status: PlatformStarterPackStatus;
  segmentKey: string | null;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    pack_key: input.packKey,
    name: input.name,
    description: input.description,
    status: input.status,
    segment_key: input.segmentKey,
    updated_by: input.userId
  };

  const response = input.packId
    ? await supabase
        .from("platform_starter_packs")
        .update(payload)
        .eq("id", input.packId)
        .select("*")
        .single()
    : await supabase
        .from("platform_starter_packs")
        .insert({
          ...payload,
          created_by: input.userId
        })
        .select("*")
        .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform starter pack: ${response.error.message}`
    );
  }

  return mapStarterPack(response.data as PlatformStarterPackRow, [], []);
}

export async function upsertContractorGroup(input: {
  contractorGroupId?: string | null;
  key: string;
  name: string;
  description: string | null;
  status: ContractorGroupStatus;
  groupType: ContractorGroupType;
  userId: string;
}): Promise<ContractorGroup> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.rpc("upsert_contractor_group_with_audit", {
    p_contractor_group_id: input.contractorGroupId ?? null,
    p_group_key: input.key,
    p_name: input.name,
    p_description: input.description,
    p_status: input.status,
    p_group_type: input.groupType,
    p_actor_id: input.userId
  });

  if (response.error) {
    throw new Error(
      response.error.message.includes("contractor_groups_group_key_unique") ||
        response.error.message.includes("duplicate key")
        ? "A contractor group with that key already exists."
        : "Unable to save contractor group."
    );
  }

  const contractorGroupId =
    typeof response.data === "string" ? response.data : input.contractorGroupId;
  const group = contractorGroupId
    ? await getContractorGroupById(contractorGroupId)
    : null;

  if (!group) {
    throw new Error("Contractor group was saved but could not be reloaded.");
  }

  return group;
}

export async function archiveContractorGroup(input: {
  contractorGroupId: string;
  userId: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.rpc("archive_contractor_group_with_audit", {
    p_contractor_group_id: input.contractorGroupId,
    p_actor_id: input.userId
  });

  if (response.error) {
    throw new Error("Unable to archive contractor group.");
  }
}

export async function assignOrganizationToContractorGroup(input: {
  contractorGroupId: string;
  organizationId: string;
  assignmentSource: ContractorGroupAssignmentSource;
  notes: string | null;
  userId: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.rpc(
    "assign_contractor_group_membership_with_audit",
    {
      p_contractor_group_id: input.contractorGroupId,
      p_organization_id: input.organizationId,
      p_assignment_source: input.assignmentSource,
      p_notes: input.notes,
      p_actor_id: input.userId
    }
  );

  if (response.error) {
    throw new Error(
      response.error.message.includes("Archived contractor groups")
        ? "Archived contractor groups cannot receive new organization assignments."
        : response.error.message.includes("valid contractor organization")
          ? "Select a valid contractor organization."
          : response.error.message.includes("valid contractor group")
            ? "Select a valid contractor group."
            : "Unable to assign organization to contractor group."
    );
  }
}

export async function assignOrganizationToContractorGroupWithAuditMetadata(input: {
  contractorGroupId: string;
  organizationId: string;
  assignmentSource: ContractorGroupAssignmentSource;
  notes: string | null;
  userId: string;
  auditMetadata?: ContractorGroupAssignmentAuditMetadataInput | null;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.rpc(
    "assign_contractor_group_membership_with_audit_metadata",
    {
      p_contractor_group_id: input.contractorGroupId,
      p_organization_id: input.organizationId,
      p_assignment_source: input.assignmentSource,
      p_notes: input.notes,
      p_actor_id: input.userId,
      p_audit_metadata: sanitizeContractorGroupAssignmentAuditMetadata(
        input.auditMetadata
      )
    }
  );

  if (response.error) {
    throw new Error(
      response.error.message.includes("Archived contractor groups")
        ? "Archived contractor groups cannot receive new organization assignments."
        : response.error.message.includes("valid contractor organization")
          ? "Select a valid contractor organization."
          : response.error.message.includes("valid contractor group")
            ? "Select a valid contractor group."
            : "Unable to assign organization to contractor group."
    );
  }
}

export async function removeOrganizationFromContractorGroup(input: {
  membershipId: string;
  userId: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.rpc(
    "remove_contractor_group_membership_with_audit",
    {
      p_membership_id: input.membershipId,
      p_actor_id: input.userId
    }
  );

  if (response.error) {
    throw new Error(
      response.error.message.includes("valid contractor group membership")
        ? "Select a valid contractor group membership."
        : "Unable to remove organization from contractor group."
    );
  }
}

async function getNextStarterPackSortOrder(starterPackId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_starter_pack_items")
    .select("sort_order")
    .eq("starter_pack_id", starterPackId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to inspect starter pack ordering: ${response.error.message}`
    );
  }

  const currentSortOrder =
    response.data && typeof response.data.sort_order === "number"
      ? response.data.sort_order
      : -1;

  return currentSortOrder + 1;
}

export async function addTemplateSeedToStarterPack(input: {
  starterPackId: string;
  templateSeedId: string;
  isRequired: boolean;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const sortOrder = await getNextStarterPackSortOrder(input.starterPackId);
  const response = await supabase.from("platform_starter_pack_items").insert({
    starter_pack_id: input.starterPackId,
    item_type: "template_seed",
    template_seed_id: input.templateSeedId,
    sort_order: sortOrder,
    is_required: input.isRequired,
    created_by: input.userId
  });

  if (response.error) {
    throw new Error(
      response.error.message.includes("platform_starter_pack_items_template_unique_idx")
        ? "This starter pack already includes that template seed."
        : `Unable to add template seed to starter pack: ${response.error.message}`
    );
  }
}

export async function addCatalogSeedToStarterPack(input: {
  starterPackId: string;
  catalogSeedId: string;
  isRequired: boolean;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const sortOrder = await getNextStarterPackSortOrder(input.starterPackId);
  const response = await supabase.from("platform_starter_pack_items").insert({
    starter_pack_id: input.starterPackId,
    item_type: "catalog_seed",
    catalog_seed_id: input.catalogSeedId,
    sort_order: sortOrder,
    is_required: input.isRequired,
    created_by: input.userId
  });

  if (response.error) {
    throw new Error(
      response.error.message.includes("platform_starter_pack_items_catalog_unique_idx")
        ? "This starter pack already includes that catalog seed."
        : `Unable to add catalog seed to starter pack: ${response.error.message}`
    );
  }
}

export async function removeStarterPackItem(itemId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_starter_pack_items")
    .delete()
    .eq("id", itemId);

  if (response.error) {
    throw new Error(
      `Unable to remove starter pack item: ${response.error.message}`
    );
  }
}

function starterPackAssignmentDuplicateMessage(message: string) {
  if (
    message.includes(
      "platform_starter_pack_assignments_active_all_unique_idx"
    )
  ) {
    return "This starter pack already has an active all-organizations assignment.";
  }

  if (
    message.includes(
      "platform_starter_pack_assignments_active_org_unique_idx"
    )
  ) {
    return "This starter pack already has an active assignment for that organization.";
  }

  if (
    message.includes(
      "platform_starter_pack_assignments_active_key_unique_idx"
    )
  ) {
    return "This starter pack already has an active assignment for that target key.";
  }

  return null;
}

export async function upsertStarterPackAssignment(input: {
  assignmentId?: string | null;
  starterPackId: string;
  assignmentType: PlatformStarterPackAssignmentType;
  organizationId: string | null;
  assignmentKey: string | null;
  label: string | null;
  status: PlatformStarterPackAssignmentStatus;
  notes: string | null;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    starter_pack_id: input.starterPackId,
    assignment_type: input.assignmentType,
    organization_id:
      input.assignmentType === "organization" ? input.organizationId : null,
    assignment_key:
      input.assignmentType === "all_organizations" ||
      input.assignmentType === "organization"
        ? null
        : input.assignmentKey,
    label: input.label,
    status: input.status,
    notes: input.notes,
    updated_by: input.userId
  };

  const response = input.assignmentId
    ? await supabase
        .from("platform_starter_pack_assignments")
        .update(payload)
        .eq("id", input.assignmentId)
    : await supabase.from("platform_starter_pack_assignments").insert({
        ...payload,
        created_by: input.userId
      });

  if (response.error) {
    const duplicateMessage = starterPackAssignmentDuplicateMessage(
      response.error.message
    );

    throw new Error(
      duplicateMessage ??
        `Unable to save starter pack assignment intent: ${response.error.message}`
    );
  }
}

export async function removeStarterPackAssignment(assignmentId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_starter_pack_assignments")
    .delete()
    .eq("id", assignmentId);

  if (response.error) {
    throw new Error(
      `Unable to remove starter pack assignment intent: ${response.error.message}`
    );
  }
}

export async function listPlatformFeaturePolicies() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("feature_flags")
    .select("*")
    .is("company_id", null)
    .order("surface", { ascending: true })
    .order("key", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load platform feature policies: ${response.error.message}`
    );
  }

  const policies = (Array.isArray(response.data) ? response.data : []) as FeatureFlagRow[];

  if (!policies.some((policy) => policy.key === INVENTORY_ENABLED_FEATURE_POLICY.key)) {
    policies.push({
      id: INVENTORY_ENABLED_FEATURE_POLICY.key,
      company_id: null,
      key: INVENTORY_ENABLED_FEATURE_POLICY.key,
      name: INVENTORY_ENABLED_FEATURE_POLICY.name,
      description: INVENTORY_ENABLED_FEATURE_POLICY.description,
      module_key: INVENTORY_ENABLED_FEATURE_POLICY.moduleKey,
      surface: INVENTORY_ENABLED_FEATURE_POLICY.surface,
      enabled: false,
      updated_at: new Date(0).toISOString()
    });
  }

  return policies;
}

export async function upsertPlatformFeaturePolicy(input: {
  key: string;
  name: string;
  description: string | null;
  moduleKey: string | null;
  surface: string | null;
  enabled: boolean;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const existingResponse = await supabase
    .from("feature_flags")
    .select("id")
    .is("company_id", null)
    .eq("key", input.key)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load platform feature policy: ${existingResponse.error.message}`
    );
  }

  const payload = {
    key: input.key,
    name: input.name,
    description: input.description,
    module_key: input.moduleKey,
    surface: input.surface,
    enabled: input.enabled,
    updated_by: input.userId
  };

  const response = existingResponse.data
    ? await supabase
        .from("feature_flags")
        .update(payload)
        .eq("id", existingResponse.data.id)
    : await supabase.from("feature_flags").insert({
        company_id: null,
        ...payload,
        created_by: input.userId
      });

  if (response.error) {
    throw new Error(
      `Unable to save platform feature policy: ${response.error.message}`
    );
  }

  return listPlatformFeaturePolicies();
}

export async function listPlatformAdmins() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_user_roles")
    .select(
      `
        id,
        user_id,
        users!platform_user_roles_user_id_fkey (
          id,
          email,
          full_name
        ),
        roles (
          id,
          key,
          name
        )
      `
    )
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load platform admins: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) => {
    const record = row as {
      id: string;
      user_id: string;
      users:
        | Array<{
            id: string;
            email: string;
            full_name: string | null;
          }>
        | {
            id: string;
            email: string;
            full_name: string | null;
          }
        | null;
      roles:
        | Array<{
            id: string;
            key: string;
            name: string;
          }>
        | {
            id: string;
            key: string;
            name: string;
          }
        | null;
    };

    return {
      id: record.id,
      user_id: record.user_id,
      users: Array.isArray(record.users)
        ? (record.users[0] ?? null)
        : record.users,
      roles: Array.isArray(record.roles)
        ? (record.roles[0] ?? null)
        : record.roles
    } satisfies PlatformAdminAssignmentRow;
  });
}

export async function assignPlatformAdminByEmail(input: {
  email: string;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .ilike("email", input.email)
    .maybeSingle();

  if (userResponse.error || !userResponse.data) {
    throw new Error(
      `Unable to find a canonical user for ${input.email}. They need to sign in first.`
    );
  }

  const roleResponse = await supabase
    .from("roles")
    .select("id")
    .is("company_id", null)
    .eq("scope", "platform")
    .eq("key", "platform_admin")
    .maybeSingle();

  const roleData = roleResponse.data as { id?: string } | null;

  if (roleResponse.error || !roleData?.id) {
    throw new Error(
      `Unable to resolve the platform admin role: ${roleResponse.error?.message ?? "Missing role."}`
    );
  }

  const insertResponse = await supabase.from("platform_user_roles").upsert(
    {
      user_id: userResponse.data.id,
      role_id: roleData.id,
      created_by: input.userId,
      updated_by: input.userId
    },
    {
      onConflict: "user_id,role_id"
    }
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to assign platform admin access: ${insertResponse.error.message}`
    );
  }

  return listPlatformAdmins();
}

export async function listPlatformRolesAndPermissions() {
  const supabase = getSupabaseAdminClient();
  const [rolesResponse, permissionsResponse] = await Promise.all([
    supabase
      .from("roles")
      .select("id, key, name, description")
      .is("company_id", null)
      .eq("scope", "platform")
      .order("name", { ascending: true }),
    supabase
      .from("permissions")
      .select("id, key, name, module_key")
      .order("module_key", { ascending: true })
      .order("key", { ascending: true })
  ]);

  if (rolesResponse.error) {
    throw new Error(`Unable to load platform roles: ${rolesResponse.error.message}`);
  }

  if (permissionsResponse.error) {
    throw new Error(
      `Unable to load platform permissions: ${permissionsResponse.error.message}`
    );
  }

  return {
    roles: (Array.isArray(rolesResponse.data) ? rolesResponse.data : []) as PlatformRoleRow[],
    permissions: (Array.isArray(permissionsResponse.data)
      ? permissionsResponse.data
      : []) as PermissionRow[]
  };
}

export async function listTenantsForPlatformAdmin() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .select(
      `
        id,
        slug,
        legal_name,
        display_name,
        primary_trade,
        tenant_status,
        lifecycle_state,
        stripe_customer_id,
        stripe_payment_method_id,
        created_at,
        active_location:locations!companies_active_location_id_fkey (
          state_region
        ),
        organization_workflow_settings (
          next_estimate_number,
          next_invoice_number,
          next_change_order_number,
          next_contract_number
        ),
        company_subscriptions (
          id,
          status,
          lifecycle_state,
          subscription_plans (
            id,
            key,
            name
          )
        )
      `
    )
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load platform tenants: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) => {
    const record = row as {
      id: string;
      slug: string;
      legal_name: string;
      display_name: string;
      primary_trade: string | null;
      tenant_status: string;
      lifecycle_state: string;
      stripe_customer_id: string | null;
      stripe_payment_method_id: string | null;
      created_at: string;
      active_location:
        | Array<{
            state_region: string | null;
          }>
        | {
            state_region: string | null;
          }
        | null;
      organization_workflow_settings:
        | Array<{
            next_estimate_number: number | null;
            next_invoice_number: number | null;
            next_change_order_number: number | null;
            next_contract_number: number | null;
          }>
        | null;
      company_subscriptions:
        | Array<{
            id: string;
            status: string;
            lifecycle_state: string;
            subscription_plans:
              | Array<{
                  id: string;
                  key: string;
                  name: string;
                }>
              | {
                  id: string;
                  key: string;
                  name: string;
                }
              | null;
          }>
        | null;
    };

    return {
      id: record.id,
      slug: record.slug,
      legal_name: record.legal_name,
      display_name: record.display_name,
      primary_trade: record.primary_trade,
      tenant_status: record.tenant_status,
      lifecycle_state: record.lifecycle_state,
      stripe_customer_id: record.stripe_customer_id,
      stripe_payment_method_id: record.stripe_payment_method_id,
      created_at: record.created_at,
      active_location: record.active_location,
      organization_workflow_settings: Array.isArray(record.organization_workflow_settings)
        ? record.organization_workflow_settings
        : null,
      company_subscriptions: Array.isArray(record.company_subscriptions)
        ? record.company_subscriptions.map((subscription) => ({
            id: subscription.id,
            status: subscription.status,
            lifecycle_state: subscription.lifecycle_state,
            subscription_plans: firstRelation(subscription.subscription_plans)
          }))
        : null
    } satisfies TenantRow;
  });
}

export async function listEarlyAccessTenantsForPlatformAdmin() {
  const supabase = getSupabaseAdminClient();
  const [
    tenantsResponse,
    projectsResponse,
    estimatesResponse,
    contractsResponse,
    invoicesResponse,
    membershipsResponse,
    feedbackResponse
  ] = await Promise.all([
      supabase
        .from("companies")
        .select(
          "id, slug, legal_name, display_name, logo_url, phone, email, website_url, primary_trade, brand_accent_color, time_zone, tenant_status, lifecycle_state, stripe_customer_id, stripe_payment_method_id, founder_plan_label, founder_monthly_amount_cents, founder_billing_status, founder_billing_method, founder_billing_reference, founder_billing_notes, founder_billing_follow_up_at, founder_billing_evidence_received_at, founder_billing_updated_by, founder_billing_updated_at, created_at, company_subscriptions (id, status, lifecycle_state, stripe_subscription_id, stripe_price_id, stripe_checkout_session_id, stripe_last_event_id, stripe_last_webhook_received_at, current_period_end)"
        )
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("company_id"),
      supabase.from("estimates").select("company_id"),
      supabase.from("contracts").select("company_id"),
      supabase.from("invoices").select("company_id"),
      supabase
        .from("company_memberships")
        .select(
          `
            company_id,
            last_active_at,
            users!company_memberships_user_id_fkey (
              last_sign_in_at
            )
          `
        )
        .eq("membership_status", "active"),
      supabase
        .from("workflow_error_events")
        .select("organization_id, user_id, message, metadata, created_at")
        .eq("action", "early_access.feedback")
        .order("created_at", { ascending: false })
    ]);

  if (tenantsResponse.error) {
    throw new Error(
      `Unable to load early-access tenants: ${tenantsResponse.error.message}`
    );
  }

  if (projectsResponse.error) {
    throw new Error(
      `Unable to load early-access project counts: ${projectsResponse.error.message}`
    );
  }

  if (estimatesResponse.error) {
    throw new Error(
      `Unable to load early-access estimate counts: ${estimatesResponse.error.message}`
    );
  }

  if (contractsResponse.error) {
    throw new Error(
      `Unable to load early-access contract counts: ${contractsResponse.error.message}`
    );
  }

  if (invoicesResponse.error) {
    throw new Error(
      `Unable to load early-access invoice counts: ${invoicesResponse.error.message}`
    );
  }

  if (membershipsResponse.error) {
    throw new Error(
      `Unable to load early-access login signals: ${membershipsResponse.error.message}`
    );
  }

  if (feedbackResponse.error) {
    throw new Error(
      `Unable to load early-access feedback signals: ${feedbackResponse.error.message}`
    );
  }

  const projectCounts = aggregateCompanyCounts(projectsResponse.data);
  const estimateCounts = aggregateCompanyCounts(estimatesResponse.data);
  const contractCounts = aggregateCompanyCounts(contractsResponse.data);
  const invoiceCounts = aggregateCompanyCounts(invoicesResponse.data);
  const recentActivity = aggregateCompanyRecentActivity(membershipsResponse.data);
  const feedbackByCompany = aggregateEarlyAccessFeedback(feedbackResponse.data);

  return ((Array.isArray(tenantsResponse.data) ? tenantsResponse.data : []) as EarlyAccessTenantRow[]).map(
    (tenant) => {
      const activitySignals = recentActivity.get(tenant.id) ?? {
        hasLoggedInRecently: false,
        lastActivityAt: null
      };
      const feedback = feedbackByCompany.get(tenant.id) ?? {
        feedbackCount: 0,
        recentFeedback: []
      };
      const activity: TenantActivityCounts = {
        projectCount: projectCounts.get(tenant.id) ?? 0,
        estimateCount: estimateCounts.get(tenant.id) ?? 0,
        contractCount: contractCounts.get(tenant.id) ?? 0,
        invoiceCount: invoiceCounts.get(tenant.id) ?? 0
      };
      const currentSubscription = Array.isArray(tenant.company_subscriptions)
        ? (tenant.company_subscriptions.find((subscription) => Boolean(subscription)) ??
          null)
        : null;

      return {
        id: tenant.id,
        slug: tenant.slug,
        legalName: tenant.legal_name,
        displayName: tenant.display_name,
        tenantStatus: tenant.tenant_status,
        lifecycleState: tenant.lifecycle_state,
        createdAt: tenant.created_at,
        stripeCustomerId: tenant.stripe_customer_id,
        stripeSubscriptionId: currentSubscription?.stripe_subscription_id ?? null,
        stripePriceId: currentSubscription?.stripe_price_id ?? null,
        stripeCheckoutSessionId:
          currentSubscription?.stripe_checkout_session_id ?? null,
        stripeLastEventId: currentSubscription?.stripe_last_event_id ?? null,
        stripeLastWebhookReceivedAt:
          currentSubscription?.stripe_last_webhook_received_at ?? null,
        stripeSubscriptionStatus: currentSubscription?.status ?? null,
        stripeSubscriptionLifecycleState:
          currentSubscription?.lifecycle_state ?? null,
        stripeCurrentPeriodEnd: currentSubscription?.current_period_end ?? null,
        founderBilling: {
          planLabel: tenant.founder_plan_label,
          monthlyAmountCents: tenant.founder_monthly_amount_cents,
          status: tenant.founder_billing_status,
          method: tenant.founder_billing_method,
          reference: tenant.founder_billing_reference,
          notes: tenant.founder_billing_notes,
          followUpAt: tenant.founder_billing_follow_up_at,
          evidenceReceivedAt: tenant.founder_billing_evidence_received_at,
          updatedBy: tenant.founder_billing_updated_by,
          updatedAt: tenant.founder_billing_updated_at
        },
        hasCompanyProfile: hasCompletedCompanyProfile(tenant),
        hasPaymentMethod: Boolean(tenant.stripe_payment_method_id),
        guardedExternalActionsLocked:
          tenant.tenant_status !== "active" || tenant.lifecycle_state !== "active",
        activity,
        hasFeedback: feedback.feedbackCount > 0,
        feedbackCount: feedback.feedbackCount,
        recentFeedback: feedback.recentFeedback,
        hasLoggedInRecently: activitySignals.hasLoggedInRecently,
        lastActivityAt: activitySignals.lastActivityAt,
        hasReachedEstimate: activity.estimateCount > 0,
        hasReachedContract: activity.contractCount > 0,
        reachedFirstWorkflowStep: activity.projectCount > 0,
        reachedEstimateStage: activity.projectCount > 0 && activity.estimateCount > 0,
        reachedContractStage:
          activity.projectCount > 0 &&
          activity.estimateCount > 0 &&
          activity.contractCount > 0
      };
    }
  );
}

export async function updateTenantPlatformStatus(input: {
  companyId: string;
  tenantStatus: string;
  lifecycleState: string;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .update({
      tenant_status: input.tenantStatus,
      lifecycle_state: input.lifecycleState
    })
    .eq("id", input.companyId);

  if (response.error) {
    throw new Error(`Unable to update tenant status: ${response.error.message}`);
  }
}

export const updateCompanyTenantStatus = updateTenantPlatformStatus;

export async function updateFounderBillingEvidence(input: {
  companyId: string;
  founderPlanLabel: string | null;
  founderMonthlyAmountCents: number | null;
  founderBillingStatus: FounderBillingStatus;
  founderBillingMethod: FounderBillingMethod;
  founderBillingReference: string | null;
  founderBillingNotes: string | null;
  founderBillingFollowUpAt: string | null;
  founderBillingEvidenceReceivedAt: string | null;
  updatedBy: string;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .update({
      founder_plan_label: input.founderPlanLabel,
      founder_monthly_amount_cents: input.founderMonthlyAmountCents,
      founder_billing_status: input.founderBillingStatus,
      founder_billing_method: input.founderBillingMethod,
      founder_billing_reference: input.founderBillingReference,
      founder_billing_notes: input.founderBillingNotes,
      founder_billing_follow_up_at: input.founderBillingFollowUpAt,
      founder_billing_evidence_received_at:
        input.founderBillingEvidenceReceivedAt,
      founder_billing_updated_by: input.updatedBy,
      founder_billing_updated_at: new Date().toISOString()
    })
    .eq("id", input.companyId);

  if (response.error) {
    throw new Error(
      `Unable to update founder billing evidence: ${response.error.message}`
    );
  }
}

export async function resetEarlyAccessTenantOnboardingState(input: {
  companyId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const [tenantResponse, projectCount, estimateCount, contractCount, invoiceCount] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, display_name")
        .eq("id", input.companyId)
        .maybeSingle(),
      getCompanyRecordCount("projects", input.companyId),
      getCompanyRecordCount("estimates", input.companyId),
      getCompanyRecordCount("contracts", input.companyId),
      getCompanyRecordCount("invoices", input.companyId)
    ]);

  if (tenantResponse.error) {
    throw new Error("Unable to load the selected company for reset.");
  }

  if (!tenantResponse.data) {
    throw new Error("Select a valid early-access company before resetting onboarding.");
  }

  const [estimateSystemSnapshotCount, contractSystemSnapshotCount] = await Promise.all([
    getCompanyRecordCount("estimate_system_snapshots", input.companyId),
    getCompanyRecordCount("contract_system_snapshots", input.companyId)
  ]);

  if (estimateSystemSnapshotCount > 0 || contractSystemSnapshotCount > 0) {
    throw new Error(
      "Reset is blocked because this company has binding system snapshots. Use a clean QA tenant or create a targeted migration-backed repair plan before deleting those records."
    );
  }

  for (const table of tenantResetDeletableTables) {
    await deleteCompanyRecords(table.name, table.label, input.companyId);
  }

  const companyResponse = await supabase
    .from("companies")
    .update({
      tenant_status: "trialing",
      lifecycle_state: "trial",
      stripe_payment_method_id: null
    })
    .eq("id", input.companyId);

  if (companyResponse.error) {
    throw new Error("Reset cleared workflow records but could not reset company setup.");
  }

  return {
    companyId: input.companyId,
    projectCount,
    estimateCount,
    contractCount,
    invoiceCount
  };
}

export async function upsertTenantWorkflowNumberingByPlatformAdmin(input: {
  companyId: string;
  userId: string;
  nextEstimateNumber: number;
  nextInvoiceNumber: number;
  nextChangeOrderNumber: number;
  nextContractNumber: number;
}) {
  const supabase = getSupabaseAdminClient();
  const [
    platformDefaults,
    estimateCountResponse,
    invoiceCountResponse,
    changeOrderCountResponse,
    contractCountResponse,
    currentSettingsResponse
  ] =
    await Promise.all([
      getPlatformWorkflowDefaults(),
      supabase
        .from("estimates")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("change_orders")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("contracts")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("organization_workflow_settings")
        .select(
          "next_estimate_number, next_invoice_number, next_change_order_number, next_contract_number"
        )
        .eq("company_id", input.companyId)
        .maybeSingle()
    ]);

  if (estimateCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant estimate numbering state: ${estimateCountResponse.error.message}`
    );
  }

  if (invoiceCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant invoice numbering state: ${invoiceCountResponse.error.message}`
    );
  }

  if (changeOrderCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant change order numbering state: ${changeOrderCountResponse.error.message}`
    );
  }

  if (contractCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant contract numbering state: ${contractCountResponse.error.message}`
    );
  }

  const currentSettings = currentSettingsResponse.data as
    | {
        next_estimate_number?: number | null;
        next_invoice_number?: number | null;
        next_change_order_number?: number | null;
        next_contract_number?: number | null;
      }
    | null;

  const currentEstimateNumber =
    currentSettings?.next_estimate_number ?? platformDefaults.defaultEstimateStartNumber;
  const currentInvoiceNumber =
    currentSettings?.next_invoice_number ?? platformDefaults.defaultInvoiceStartNumber;
  const currentChangeOrderNumber =
    currentSettings?.next_change_order_number ??
    platformDefaults.defaultChangeOrderStartNumber;
  const currentContractNumber =
    currentSettings?.next_contract_number ??
    platformDefaults.defaultContractStartNumber;

  if (
    (estimateCountResponse.count ?? 0) > 0 &&
    input.nextEstimateNumber < currentEstimateNumber
  ) {
    throw new Error(
      "Estimate numbering can only move upward after the contractor already has estimate records."
    );
  }

  if (
    (invoiceCountResponse.count ?? 0) > 0 &&
    input.nextInvoiceNumber < currentInvoiceNumber
  ) {
    throw new Error(
      "Invoice numbering can only move upward after the contractor already has invoice records."
    );
  }

  if (
    (changeOrderCountResponse.count ?? 0) > 0 &&
    input.nextChangeOrderNumber < currentChangeOrderNumber
  ) {
    throw new Error(
      "Change order numbering can only move upward after the contractor already has change order records."
    );
  }

  if (
    (contractCountResponse.count ?? 0) > 0 &&
    input.nextContractNumber < currentContractNumber
  ) {
    throw new Error(
      "Contract numbering can only move upward after the contractor already has contract records."
    );
  }

  const response = await supabase
    .from("organization_workflow_settings")
    .upsert(
      {
        company_id: input.companyId,
        next_estimate_number: input.nextEstimateNumber,
        next_invoice_number: input.nextInvoiceNumber,
        next_change_order_number: input.nextChangeOrderNumber,
        next_contract_number: input.nextContractNumber,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "company_id" }
    )
    .select("company_id")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save tenant workflow numbering: ${response.error.message}`
    );
  }
}
