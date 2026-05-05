import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canTransitionContractInternalApprovalStatus,
  canTransitionContractSignerStatus,
  canTransitionContractStatus,
  computeContractSignatureWorkflowSummary,
  computeContractWorkflowGate,
  compareContractStatuses
} from "@floorconnector/domain";
import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import type {
  Contract as ContractRecord,
  ContractInternalApprovalStatus,
  ContractRevision,
  ContractSignatureEvent,
  ContractSignatureActorType,
  ContractSignatureEventType,
  ContractSigner,
  ContractSignerRole,
  ContractSignerStatus,
  ContractStatus,
  DocumentTemplate,
  PortalAccessGrant,
  SignatureReadinessStatus
} from "@floorconnector/types";

import type {
  ContractPortalSignatureActionInput,
  ContractOnsiteSignatureActionInput,
  ContractSignerInput,
  CreateContractFromEstimateInput,
  SendContractForSignatureInput,
  UpdateContractDraftInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  buildContractRenderedHtml,
  type ContractEstimateSnapshotItemRenderInput,
  type ContractEstimateSnapshotRenderInput,
  createAndUploadContractPdf
} from "@/lib/contracts/document-rendering";
import { getEstimateById, listEstimates } from "@/lib/estimates/data";
import { sanitizeHtml } from "@/lib/html/sanitize";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOrganizationMembers } from "@/lib/organizations/admin";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import {
  listPortalAccessGrantsForCurrentUser,
  resolvePortalScopedPermissionForCurrentUser,
  resolvePortalScopedPermissionForGrantRecord
} from "@/lib/portal-access/data";
import { recordContractNotificationEvent } from "@/lib/notifications/system";
import { syncProjectCommercialReadiness } from "@/lib/projects/readiness";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listDocumentTemplates } from "@/lib/templates/data";
import { prepareContractTemplateContextFromEstimate } from "@/lib/templates/workflows";

type ContractRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  template_id: string | null;
  reference_number: string;
  status: ContractStatus;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  generated_from_estimate_reference: string | null;
  sent_pdf_storage_path: string | null;
  sent_pdf_file_name: string | null;
  sent_pdf_mime_type: string | null;
  sent_pdf_generated_at: string | null;
  signature_provider: string | null;
  signature_provider_reference: string | null;
  signature_started_at: string | null;
  customer_viewed_at: string | null;
  customer_signed_at: string | null;
  contractor_countersigned_at: string | null;
  signature_declined_at: string | null;
  signature_voided_at: string | null;
  internal_approval_status: ContractInternalApprovalStatus;
  internal_approved_at: string | null;
  signature_readiness_status: SignatureReadinessStatus;
  locked_at: string | null;
  edit_lock_reason: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        phone: string | null;
        email: string | null;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
        status: string;
      }
    | null;
  estimates?:
    | {
        id: string;
        reference_number: string;
        status: string;
      }
    | null;
  document_templates?:
    | {
        id: string;
        name: string;
        template_type: string;
      }
    | null;
};

type ContractRevisionRow = {
  id: string;
  company_id: string;
  contract_id: string;
  revision_number: number;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  edit_summary: string | null;
  created_at: string;
};

type ContractSignerRow = {
  id: string;
  company_id: string;
  contract_id: string;
  signer_role: ContractSignerRole;
  signer_status: ContractSignerStatus;
  customer_id: string | null;
  portal_user_id: string | null;
  organization_user_id: string | null;
  display_name: string;
  email: string;
  signer_order: number;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
};

type ContractSignatureEventRow = {
  id: string;
  company_id: string;
  contract_id: string;
  contract_signer_id: string | null;
  event_type: ContractSignatureEventType;
  actor_type: ContractSignatureActorType;
  actor_user_id: string | null;
  portal_user_id: string | null;
  provider_event_id: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type CompanyMembershipRow = {
  user_id: string;
  membership_status: string;
};

type ContractPortalSignerGrantRow = {
  id: string;
  customer_contact_id: string | null;
  user_id: string;
  status: string;
  portal_user:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | {
        id: string;
        email: string;
        full_name: string | null;
      }[]
    | null;
  customer_contact?:
    | {
        id: string;
        is_primary: boolean;
        contacts:
          | {
              display_name: string | null;
              email: string | null;
            }
          | {
              display_name: string | null;
              email: string | null;
            }[]
          | null;
      }
    | {
        id: string;
        is_primary: boolean;
        contacts:
          | {
              display_name: string | null;
              email: string | null;
            }
          | {
              display_name: string | null;
              email: string | null;
            }[]
          | null;
      }[]
    | null;
};

type ContractPortalProjectAccessRow = {
  portal_access_grant_id: string;
  project_id: string;
  status: string;
};

type ContractPortalScope = {
  userId: string;
  contract: ContractRow;
};

type ContractSignatureEventInsert = {
  contractSignerId: string | null;
  eventType: ContractSignatureEventType;
  actorType: ContractSignatureActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  providerEventId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
};

type ContractScope = {
  userId: string;
  organizationId: string;
};

type SnapshotNumericValue = string | number;

type EstimateCommercialSnapshotRow = {
  id: string;
  company_id: string;
  estimate_id: string;
  customer_id: string;
  project_id: string;
  snapshot_version: number;
  estimate_reference_number: string;
  subtotal_amount: SnapshotNumericValue;
  taxable_sales_amount: SnapshotNumericValue;
  exempt_sales_amount: SnapshotNumericValue;
  tax_amount: SnapshotNumericValue;
  discount_amount: SnapshotNumericValue;
  total_amount: SnapshotNumericValue;
  scope_summary_html: string | null;
  inclusions_html: string | null;
  exclusions_html: string | null;
  terms_html: string | null;
  content_snapshot: Record<string, unknown> | null;
  customer_name_snapshot: string;
  customer_company_name_snapshot: string | null;
  customer_email_snapshot: string | null;
  customer_phone_snapshot: string | null;
  customer_address_line_1_snapshot: string | null;
  customer_address_line_2_snapshot: string | null;
  customer_city_snapshot: string | null;
  customer_state_region_snapshot: string | null;
  customer_postal_code_snapshot: string | null;
  customer_country_code_snapshot: string | null;
  service_address_line_1_snapshot: string | null;
  service_address_line_2_snapshot: string | null;
  service_city_snapshot: string | null;
  service_state_region_snapshot: string | null;
  service_postal_code_snapshot: string | null;
  service_country_code_snapshot: string | null;
  project_name_snapshot: string;
  created_at: string;
};

type EstimateCommercialSnapshotItemRow = {
  id: string;
  company_id: string;
  estimate_commercial_snapshot_id: string;
  name: string;
  description: string | null;
  quantity: SnapshotNumericValue;
  unit: string;
  line_total: SnapshotNumericValue;
  sort_order: number;
  created_at: string;
};

type ContractEstimateSnapshotBundle = {
  snapshot: ContractEstimateSnapshotRenderInput & {
    customerId: string;
    projectId: string;
  };
  snapshotItems: ContractEstimateSnapshotItemRenderInput[];
};

export type ContractListItem = ContractRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
  sentPdfDownloadUrl: string | null;
};

export type ContractDetail = ContractListItem & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  revisions: ContractRevision[];
  signers: ContractSigner[];
  signatureEvents: ContractSignatureEvent[];
  isEditable: boolean;
};

export type ContractSignatureParticipantOption = {
  userId: string;
  displayName: string;
  email: string;
  contactDisplayName?: string | null;
  contactEmail?: string | null;
  isPrimaryContact?: boolean;
};

export type ContractContractorSignerOption = ContractSignatureParticipantOption & {
  membershipRole: string;
};

export type ContractSignatureActionOptions = {
  contractId: string;
  customerId: string;
  customerPortalSignerOptions: ContractSignatureParticipantOption[];
  contractorSignerOptions: ContractContractorSignerOption[];
};

const contractSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  template_id,
  reference_number,
  status,
  title,
  rendered_subject,
  rendered_content,
  generated_from_estimate_reference,
  sent_pdf_storage_path,
  sent_pdf_file_name,
  sent_pdf_mime_type,
  sent_pdf_generated_at,
  signature_provider,
  signature_provider_reference,
  signature_started_at,
  customer_viewed_at,
  customer_signed_at,
  contractor_countersigned_at,
  signature_declined_at,
  signature_voided_at,
  internal_approval_status,
  internal_approved_at,
  signature_readiness_status,
  locked_at,
  edit_lock_reason,
  sent_at,
  viewed_at,
  signed_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    phone,
    email
  ),
  projects (
    id,
    name,
    status
  ),
  estimates (
    id,
    reference_number,
    status
  ),
  document_templates (
    id,
    name,
    template_type
  )
`;

function isContractRow(value: unknown): value is ContractRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    (row.estimate_id === null || typeof row.estimate_id === "string") &&
    (row.template_id === null || typeof row.template_id === "string") &&
    typeof row.reference_number === "string" &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    (row.rendered_subject === null || typeof row.rendered_subject === "string") &&
    typeof row.rendered_content === "string" &&
    (row.generated_from_estimate_reference === null ||
      typeof row.generated_from_estimate_reference === "string") &&
    (row.sent_pdf_storage_path === null ||
      typeof row.sent_pdf_storage_path === "string") &&
    (row.sent_pdf_file_name === null || typeof row.sent_pdf_file_name === "string") &&
    (row.sent_pdf_mime_type === null || typeof row.sent_pdf_mime_type === "string") &&
    (row.sent_pdf_generated_at === null ||
      typeof row.sent_pdf_generated_at === "string") &&
    (row.signature_provider === null || typeof row.signature_provider === "string") &&
    (row.signature_provider_reference === null ||
      typeof row.signature_provider_reference === "string") &&
    (row.signature_started_at === null || typeof row.signature_started_at === "string") &&
    (row.customer_viewed_at === null || typeof row.customer_viewed_at === "string") &&
    (row.customer_signed_at === null || typeof row.customer_signed_at === "string") &&
    (row.contractor_countersigned_at === null ||
      typeof row.contractor_countersigned_at === "string") &&
    (row.signature_declined_at === null || typeof row.signature_declined_at === "string") &&
    (row.signature_voided_at === null || typeof row.signature_voided_at === "string") &&
    typeof row.internal_approval_status === "string" &&
    (row.internal_approved_at === null || typeof row.internal_approved_at === "string") &&
    typeof row.signature_readiness_status === "string" &&
    (row.locked_at === null || typeof row.locked_at === "string") &&
    (row.edit_lock_reason === null || typeof row.edit_lock_reason === "string") &&
    (row.sent_at === null || typeof row.sent_at === "string") &&
    (row.viewed_at === null || typeof row.viewed_at === "string") &&
    (row.signed_at === null || typeof row.signed_at === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isContractRowArray(value: unknown): value is ContractRow[] {
  return Array.isArray(value) && value.every((row) => isContractRow(row));
}

function isContractRevisionRow(value: unknown): value is ContractRevisionRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractRevisionRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.contract_id === "string" &&
    typeof row.revision_number === "number" &&
    typeof row.title === "string" &&
    (row.rendered_subject === null || typeof row.rendered_subject === "string") &&
    typeof row.rendered_content === "string" &&
    (row.edit_summary === null || typeof row.edit_summary === "string") &&
    typeof row.created_at === "string"
  );
}

function isContractRevisionRowArray(value: unknown): value is ContractRevisionRow[] {
  return Array.isArray(value) && value.every((row) => isContractRevisionRow(row));
}

function isContractSignerRow(value: unknown): value is ContractSignerRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractSignerRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.contract_id === "string" &&
    typeof row.signer_role === "string" &&
    typeof row.signer_status === "string" &&
    (row.customer_id === null || typeof row.customer_id === "string") &&
    (row.portal_user_id === null || typeof row.portal_user_id === "string") &&
    (row.organization_user_id === null || typeof row.organization_user_id === "string") &&
    typeof row.display_name === "string" &&
    typeof row.email === "string" &&
    typeof row.signer_order === "number" &&
    (row.viewed_at === null || typeof row.viewed_at === "string") &&
    (row.signed_at === null || typeof row.signed_at === "string") &&
    (row.declined_at === null || typeof row.declined_at === "string") &&
    (row.decline_reason === null || typeof row.decline_reason === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isContractSignerRowArray(value: unknown): value is ContractSignerRow[] {
  return Array.isArray(value) && value.every((row) => isContractSignerRow(row));
}

function isContractSignatureEventRow(value: unknown): value is ContractSignatureEventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractSignatureEventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.contract_id === "string" &&
    (row.contract_signer_id === null || typeof row.contract_signer_id === "string") &&
    typeof row.event_type === "string" &&
    typeof row.actor_type === "string" &&
    (row.actor_user_id === null || typeof row.actor_user_id === "string") &&
    (row.portal_user_id === null || typeof row.portal_user_id === "string") &&
    (row.provider_event_id === null || typeof row.provider_event_id === "string") &&
    (row.payload === null ||
      (typeof row.payload === "object" && !Array.isArray(row.payload))) &&
    typeof row.occurred_at === "string" &&
    typeof row.created_at === "string"
  );
}

function isContractSignatureEventRowArray(
  value: unknown
): value is ContractSignatureEventRow[] {
  return Array.isArray(value) && value.every((row) => isContractSignatureEventRow(row));
}

function isContractPortalSignerGrantRow(
  value: unknown
): value is ContractPortalSignerGrantRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractPortalSignerGrantRow>;

  return (
    typeof row.id === "string" &&
    (row.customer_contact_id === null || typeof row.customer_contact_id === "string") &&
    typeof row.user_id === "string" &&
    typeof row.status === "string"
  );
}

function isContractPortalSignerGrantRowArray(
  value: unknown
): value is ContractPortalSignerGrantRow[] {
  return Array.isArray(value) && value.every((row) => isContractPortalSignerGrantRow(row));
}

function getPortalUserFromGrant(grant: ContractPortalSignerGrantRow) {
  if (Array.isArray(grant.portal_user)) {
    return grant.portal_user[0] ?? null;
  }

  return grant.portal_user;
}

function getCustomerContactFromGrant(grant: ContractPortalSignerGrantRow) {
  if (Array.isArray(grant.customer_contact)) {
    return grant.customer_contact[0] ?? null;
  }

  return grant.customer_contact ?? null;
}

function getContactFromCustomerContact(
  customerContact: NonNullable<ReturnType<typeof getCustomerContactFromGrant>>
) {
  if (Array.isArray(customerContact.contacts)) {
    return customerContact.contacts[0] ?? null;
  }

  return customerContact.contacts ?? null;
}

function isContractPortalProjectAccessRow(
  value: unknown
): value is ContractPortalProjectAccessRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractPortalProjectAccessRow>;

  return (
    typeof row.portal_access_grant_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.status === "string"
  );
}

function isContractPortalProjectAccessRowArray(
  value: unknown
): value is ContractPortalProjectAccessRow[] {
  return Array.isArray(value) && value.every((row) => isContractPortalProjectAccessRow(row));
}

function isSnapshotNumericValue(value: unknown): value is SnapshotNumericValue {
  return typeof value === "string" || typeof value === "number";
}

function snapshotNumericToString(value: SnapshotNumericValue) {
  return typeof value === "number" ? value.toFixed(2) : value;
}

function isEstimateCommercialSnapshotRow(
  value: unknown
): value is EstimateCommercialSnapshotRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EstimateCommercialSnapshotRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.estimate_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.snapshot_version === "number" &&
    typeof row.estimate_reference_number === "string" &&
    isSnapshotNumericValue(row.subtotal_amount) &&
    isSnapshotNumericValue(row.taxable_sales_amount) &&
    isSnapshotNumericValue(row.exempt_sales_amount) &&
    isSnapshotNumericValue(row.tax_amount) &&
    isSnapshotNumericValue(row.discount_amount) &&
    isSnapshotNumericValue(row.total_amount) &&
    (row.scope_summary_html === null || typeof row.scope_summary_html === "string") &&
    (row.inclusions_html === null || typeof row.inclusions_html === "string") &&
    (row.exclusions_html === null || typeof row.exclusions_html === "string") &&
    (row.terms_html === null || typeof row.terms_html === "string") &&
    (row.content_snapshot === null ||
      (typeof row.content_snapshot === "object" && !Array.isArray(row.content_snapshot))) &&
    typeof row.customer_name_snapshot === "string" &&
    (row.customer_company_name_snapshot === null ||
      typeof row.customer_company_name_snapshot === "string") &&
    (row.customer_email_snapshot === null ||
      typeof row.customer_email_snapshot === "string") &&
    (row.customer_phone_snapshot === null ||
      typeof row.customer_phone_snapshot === "string") &&
    (row.customer_address_line_1_snapshot === null ||
      typeof row.customer_address_line_1_snapshot === "string") &&
    (row.customer_address_line_2_snapshot === null ||
      typeof row.customer_address_line_2_snapshot === "string") &&
    (row.customer_city_snapshot === null ||
      typeof row.customer_city_snapshot === "string") &&
    (row.customer_state_region_snapshot === null ||
      typeof row.customer_state_region_snapshot === "string") &&
    (row.customer_postal_code_snapshot === null ||
      typeof row.customer_postal_code_snapshot === "string") &&
    (row.customer_country_code_snapshot === null ||
      typeof row.customer_country_code_snapshot === "string") &&
    (row.service_address_line_1_snapshot === null ||
      typeof row.service_address_line_1_snapshot === "string") &&
    (row.service_address_line_2_snapshot === null ||
      typeof row.service_address_line_2_snapshot === "string") &&
    (row.service_city_snapshot === null || typeof row.service_city_snapshot === "string") &&
    (row.service_state_region_snapshot === null ||
      typeof row.service_state_region_snapshot === "string") &&
    (row.service_postal_code_snapshot === null ||
      typeof row.service_postal_code_snapshot === "string") &&
    (row.service_country_code_snapshot === null ||
      typeof row.service_country_code_snapshot === "string") &&
    typeof row.project_name_snapshot === "string" &&
    typeof row.created_at === "string"
  );
}

function isEstimateCommercialSnapshotItemRow(
  value: unknown
): value is EstimateCommercialSnapshotItemRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EstimateCommercialSnapshotItemRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.estimate_commercial_snapshot_id === "string" &&
    typeof row.name === "string" &&
    (row.description === null || typeof row.description === "string") &&
    isSnapshotNumericValue(row.quantity) &&
    typeof row.unit === "string" &&
    isSnapshotNumericValue(row.line_total) &&
    typeof row.sort_order === "number" &&
    typeof row.created_at === "string"
  );
}

function isEstimateCommercialSnapshotItemRowArray(
  value: unknown
): value is EstimateCommercialSnapshotItemRow[] {
  return Array.isArray(value) && value.every((row) => isEstimateCommercialSnapshotItemRow(row));
}

async function getLatestApprovedEstimateCommercialSnapshotForContract(
  organizationId: string,
  estimateId: string
): Promise<ContractEstimateSnapshotBundle> {
  const supabase = await getSupabaseServerClient();
  const snapshotResponse = await supabase
    .from("estimate_commercial_snapshots")
    .select(
      `
        id,
        company_id,
        estimate_id,
        customer_id,
        project_id,
        snapshot_version,
        estimate_reference_number,
        subtotal_amount,
        taxable_sales_amount,
        exempt_sales_amount,
        tax_amount,
        discount_amount,
        total_amount,
        scope_summary_html,
        inclusions_html,
        exclusions_html,
        terms_html,
        content_snapshot,
        customer_name_snapshot,
        customer_company_name_snapshot,
        customer_email_snapshot,
        customer_phone_snapshot,
        customer_address_line_1_snapshot,
        customer_address_line_2_snapshot,
        customer_city_snapshot,
        customer_state_region_snapshot,
        customer_postal_code_snapshot,
        customer_country_code_snapshot,
        service_address_line_1_snapshot,
        service_address_line_2_snapshot,
        service_city_snapshot,
        service_state_region_snapshot,
        service_postal_code_snapshot,
        service_country_code_snapshot,
        project_name_snapshot,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("snapshot_version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const snapshotData: unknown = snapshotResponse.data;

  if (snapshotResponse.error) {
    throw new Error(
      `Unable to load approved estimate snapshot for contract generation: ${snapshotResponse.error.message}`
    );
  }

  if (!isEstimateCommercialSnapshotRow(snapshotData)) {
    throw new Error(
      "This estimate was approved, but its approved snapshot is missing. Rebuild the approval snapshot from the estimate, then generate the contract again."
    );
  }

  const snapshotItemsResponse = await supabase
    .from("estimate_commercial_snapshot_items")
    .select(
      `
        id,
        company_id,
        estimate_commercial_snapshot_id,
        name,
        description,
        quantity,
        unit,
        line_total,
        sort_order,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_commercial_snapshot_id", snapshotData.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const snapshotItemsData: unknown = snapshotItemsResponse.data;

  if (snapshotItemsResponse.error) {
    throw new Error(
      `Unable to load approved estimate snapshot items for contract generation: ${snapshotItemsResponse.error.message}`
    );
  }

  if (!isEstimateCommercialSnapshotItemRowArray(snapshotItemsData)) {
    throw new Error(
      "Approved estimate snapshot items are missing. Rebuild the approval snapshot from the estimate before generating a contract."
    );
  }

  return {
    snapshot: {
      customerId: snapshotData.customer_id,
      projectId: snapshotData.project_id,
      estimateReferenceNumber: snapshotData.estimate_reference_number,
      projectNameSnapshot: snapshotData.project_name_snapshot,
      customerNameSnapshot: snapshotData.customer_name_snapshot,
      customerCompanyNameSnapshot: snapshotData.customer_company_name_snapshot,
      customerEmailSnapshot: snapshotData.customer_email_snapshot,
      customerPhoneSnapshot: snapshotData.customer_phone_snapshot,
      customerAddressLine1Snapshot: snapshotData.customer_address_line_1_snapshot,
      customerAddressLine2Snapshot: snapshotData.customer_address_line_2_snapshot,
      customerCitySnapshot: snapshotData.customer_city_snapshot,
      customerStateRegionSnapshot: snapshotData.customer_state_region_snapshot,
      customerPostalCodeSnapshot: snapshotData.customer_postal_code_snapshot,
      customerCountryCodeSnapshot: snapshotData.customer_country_code_snapshot,
      serviceAddressLine1Snapshot: snapshotData.service_address_line_1_snapshot,
      serviceAddressLine2Snapshot: snapshotData.service_address_line_2_snapshot,
      serviceCitySnapshot: snapshotData.service_city_snapshot,
      serviceStateRegionSnapshot: snapshotData.service_state_region_snapshot,
      servicePostalCodeSnapshot: snapshotData.service_postal_code_snapshot,
      serviceCountryCodeSnapshot: snapshotData.service_country_code_snapshot,
      subtotalAmount: snapshotNumericToString(snapshotData.subtotal_amount),
      taxableSalesAmount: snapshotNumericToString(snapshotData.taxable_sales_amount),
      exemptSalesAmount: snapshotNumericToString(snapshotData.exempt_sales_amount),
      taxAmount: snapshotNumericToString(snapshotData.tax_amount),
      discountAmount: snapshotNumericToString(snapshotData.discount_amount),
      totalAmount: snapshotNumericToString(snapshotData.total_amount),
      scopeSummaryHtml: snapshotData.scope_summary_html,
      inclusionsHtml: snapshotData.inclusions_html,
      exclusionsHtml: snapshotData.exclusions_html,
      termsHtml: snapshotData.terms_html,
      contentSnapshot: snapshotData.content_snapshot
    },
    snapshotItems: snapshotItemsData.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: snapshotNumericToString(item.quantity),
      unit: item.unit,
      lineTotal: snapshotNumericToString(item.line_total),
      sortOrder: item.sort_order
    }))
  };
}

function mapContract(row: ContractRow): ContractRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    templateId: row.template_id,
    referenceNumber: row.reference_number,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    generatedFromEstimateReference: row.generated_from_estimate_reference,
    sentPdfStoragePath: row.sent_pdf_storage_path,
    sentPdfFileName: row.sent_pdf_file_name,
    sentPdfMimeType: row.sent_pdf_mime_type,
    sentPdfGeneratedAt: row.sent_pdf_generated_at,
    signatureProvider: row.signature_provider,
    signatureProviderReference: row.signature_provider_reference,
    signatureStartedAt: row.signature_started_at,
    customerViewedAt: row.customer_viewed_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    signatureDeclinedAt: row.signature_declined_at,
    signatureVoidedAt: row.signature_voided_at,
    internalApprovalStatus: row.internal_approval_status,
    internalApprovedAt: row.internal_approved_at,
    signatureReadinessStatus: row.signature_readiness_status,
    lockedAt: row.locked_at,
    editLockReason: row.edit_lock_reason,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContractRevision(row: ContractRevisionRow): ContractRevision {
  return {
    id: row.id,
    organizationId: row.company_id,
    contractId: row.contract_id,
    revisionNumber: row.revision_number,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    editSummary: row.edit_summary,
    createdAt: row.created_at
  };
}

function mapContractSigner(row: ContractSignerRow): ContractSigner {
  return {
    id: row.id,
    organizationId: row.company_id,
    contractId: row.contract_id,
    signerRole: row.signer_role,
    signerStatus: row.signer_status,
    customerId: row.customer_id,
    portalUserId: row.portal_user_id,
    organizationUserId: row.organization_user_id,
    displayName: row.display_name,
    email: row.email,
    signerOrder: row.signer_order,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    declinedAt: row.declined_at,
    declineReason: row.decline_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContractSignatureEvent(
  row: ContractSignatureEventRow
): ContractSignatureEvent {
  return {
    id: row.id,
    organizationId: row.company_id,
    contractId: row.contract_id,
    contractSignerId: row.contract_signer_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    actorUserId: row.actor_user_id,
    portalUserId: row.portal_user_id,
    providerEventId: row.provider_event_id,
    payload: row.payload,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapContractListItem(row: ContractRow): ContractListItem {
  return {
    ...mapContract(row),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number,
          status: row.estimates.status
        }
      : null,
    template: row.document_templates
      ? {
          id: row.document_templates.id,
          name: row.document_templates.name
        }
      : null,
    sentPdfDownloadUrl: null
  };
}

async function resolveContractPdfDownloadUrl(contract: ContractRow) {
  if (!contract.sent_pdf_storage_path) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .createSignedUrl(contract.sent_pdf_storage_path, 60 * 60);

  if (response.error) {
    return null;
  }

  return response.data.signedUrl ?? null;
}

function isContractEditable(contract: ContractRecord) {
  return (
    contract.status === "draft" &&
    contract.signatureStartedAt == null &&
    contract.signedAt == null &&
    contract.lockedAt == null
  );
}

function getParticipantDisplayName(input: { fullName?: string | null; email: string }) {
  return input.fullName?.trim() || input.email;
}

async function getContractScope(next = "/contracts"): Promise<ContractScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

export async function requireContractScope(next = "/contracts") {
  const scope = await getContractScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for contracts yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function getContractRecordById(
  organizationId: string,
  contractId: string
): Promise<ContractRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(contractSelect)
    .eq("company_id", organizationId)
    .eq("id", contractId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the contract: ${response.error.message}`);
  }

  return isContractRow(data) ? data : null;
}

async function getContractRecordByIdInCurrentScope(contractId: string): Promise<ContractRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(contractSelect)
    .eq("id", contractId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the contract: ${response.error.message}`);
  }

  return isContractRow(data) ? data : null;
}

async function listContractRevisions(
  organizationId: string,
  contractId: string
): Promise<ContractRevision[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contract_revisions")
    .select(
      `
        id,
        company_id,
        contract_id,
        revision_number,
        title,
        rendered_subject,
        rendered_content,
        edit_summary,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("contract_id", contractId)
    .order("revision_number", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contract revisions: ${response.error.message}`);
  }

  if (!isContractRevisionRowArray(data)) {
    return [];
  }

  return data.map((row) => mapContractRevision(row));
}

async function listContractSigners(
  organizationId: string,
  contractId: string
): Promise<ContractSigner[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contract_signers")
    .select(
      `
        id,
        company_id,
        contract_id,
        signer_role,
        signer_status,
        customer_id,
        portal_user_id,
        organization_user_id,
        display_name,
        email,
        signer_order,
        viewed_at,
        signed_at,
        declined_at,
        decline_reason,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("contract_id", contractId)
    .order("signer_order", { ascending: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contract signers: ${response.error.message}`);
  }

  if (!isContractSignerRowArray(data)) {
    return [];
  }

  return data.map((row) => mapContractSigner(row));
}

async function listContractSignatureEvents(
  organizationId: string,
  contractId: string
): Promise<ContractSignatureEvent[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contract_signature_events")
    .select(
      `
        id,
        company_id,
        contract_id,
        contract_signer_id,
        event_type,
        actor_type,
        actor_user_id,
        portal_user_id,
        provider_event_id,
        payload,
        occurred_at,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("contract_id", contractId)
    .order("occurred_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load contract signature events: ${response.error.message}`
    );
  }

  if (!isContractSignatureEventRowArray(data)) {
    return [];
  }

  return data.map((row) => mapContractSignatureEvent(row));
}

async function listContractSignerRowsAdmin(
  organizationId: string,
  contractId: string
): Promise<ContractSignerRow[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("contract_signers")
    .select(
      `
        id,
        company_id,
        contract_id,
        signer_role,
        signer_status,
        customer_id,
        portal_user_id,
        organization_user_id,
        display_name,
        email,
        signer_order,
        viewed_at,
        signed_at,
        declined_at,
        decline_reason,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("contract_id", contractId)
    .order("signer_order", { ascending: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contract signers: ${response.error.message}`);
  }

  if (!isContractSignerRowArray(data)) {
    return [];
  }

  return data;
}

async function ensureActiveOrganizationUser(
  organizationId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("company_memberships")
    .select("user_id, membership_status")
    .eq("company_id", organizationId)
    .eq("user_id", userId)
    .eq("membership_status", "active")
    .maybeSingle();
  const data = response.data as CompanyMembershipRow | null;

  if (response.error) {
    throw new Error(
      `Unable to validate the organization signer membership: ${response.error.message}`
    );
  }

  if (!data?.user_id) {
    throw new Error("Contractor signer must be an active member of this organization.");
  }
}

async function ensureActivePortalAccessGrant(
  organizationId: string,
  customerId: string,
  portalUserId: string
): Promise<PortalAccessGrant> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("portal_access_grants")
    .select(
      `
        id,
        company_id,
        customer_id,
        user_id,
        status,
        invited_email,
        invited_by,
        activated_at,
        revoked_at,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("customer_id", customerId)
    .eq("user_id", portalUserId)
    .eq("status", "active")
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        company_id?: string;
        customer_id?: string;
        user_id?: string;
        status?: PortalAccessGrant["status"];
        invited_email?: string | null;
        invited_by?: string | null;
        activated_at?: string | null;
        revoked_at?: string | null;
        created_at?: string;
        updated_at?: string;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate portal signer access: ${response.error.message}`);
  }

  if (
    !data?.id ||
    !data.company_id ||
    !data.customer_id ||
    !data.user_id ||
    !data.status ||
    !data.created_at ||
    !data.updated_at
  ) {
    throw new Error(
      "Customer signers must be linked to an active portal access grant for this contract customer."
    );
  }

  return {
    id: data.id,
    organizationId: data.company_id,
    customerId: data.customer_id,
    customerContactId: null,
    userId: data.user_id,
    status: data.status,
    invitedEmail: data.invited_email ?? null,
    invitedByUserId: data.invited_by ?? null,
    inviteExpiresAt: null,
    inviteAcceptedAt: null,
    activatedAt: data.activated_at ?? null,
    revokedAt: data.revoked_at ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

async function deriveDefaultCustomerSigner(
  contract: ContractRow
): Promise<ContractSignerInput[]> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("portal_access_grants")
    .select(
      `
        user_id,
        invited_email,
        portal_user:users!portal_access_grants_user_id_fkey (
          id,
          email,
          full_name
        )
      `
    )
    .eq("company_id", contract.company_id)
    .eq("customer_id", contract.customer_id)
    .eq("status", "active");
  const rows =
    (response.data as
      | Array<{
          user_id?: string;
          invited_email?: string | null;
          portal_user?:
            | {
                id?: string;
                email?: string;
                full_name?: string | null;
              }
            | null;
        }>
      | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to resolve the customer portal signer: ${response.error.message}`
    );
  }

  if (rows.length !== 1) {
    throw new Error(
      "Sending for signature requires exactly one active portal user for this customer until explicit signer assignment UI is added."
    );
  }

  const row = rows[0];
  const portalUser = row.portal_user;

  if (!row?.user_id || !portalUser?.id || !portalUser.email) {
    throw new Error(
      "Active portal access exists, but the signer user record could not be resolved."
    );
  }

  return [
    {
      signerRole: "customer",
      customerId: contract.customer_id,
      portalUserId: portalUser.id,
      organizationUserId: null,
      displayName:
        portalUser.full_name ?? contract.customers?.name ?? portalUser.email,
      email: portalUser.email,
      signerOrder: 1
    }
  ];
}

async function validateAndNormalizeSendSigners(
  contract: ContractRow,
  inputSigners: readonly ContractSignerInput[],
  actingUserId: string
): Promise<ContractSignerInput[]> {
  const signers =
    inputSigners.length > 0 ? [...inputSigners] : await deriveDefaultCustomerSigner(contract);
  const normalized: ContractSignerInput[] = [];

  for (const signer of signers) {
    if (signer.signerRole === "customer") {
      await ensureActivePortalAccessGrant(
        contract.company_id,
        contract.customer_id,
        signer.portalUserId as string
      );

      normalized.push({
        ...signer,
        customerId: contract.customer_id,
        organizationUserId: null,
        email: signer.email.trim().toLowerCase()
      });
      continue;
    }

    const organizationUserId = signer.organizationUserId ?? actingUserId;
    await ensureActiveOrganizationUser(contract.company_id, organizationUserId);

    normalized.push({
      ...signer,
      customerId: null,
      portalUserId: null,
      organizationUserId,
      email: signer.email.trim().toLowerCase()
    });
  }

  return normalized.sort((left, right) => left.signerOrder - right.signerOrder);
}

function buildContractSignatureSummary(contract: ContractRow, signers: ContractSignerRow[]) {
  return computeContractSignatureWorkflowSummary({
    status: contract.status,
    signatureReadinessStatus: contract.signature_readiness_status,
    signatureStartedAt: contract.signature_started_at,
    customerSignedAt: contract.customer_signed_at,
    contractorCountersignedAt: contract.contractor_countersigned_at,
    signatureDeclinedAt: contract.signature_declined_at,
    signatureVoidedAt: contract.signature_voided_at,
    signers: signers.map((signer) => ({
      signerRole: signer.signer_role,
      signerStatus: signer.signer_status
    }))
  });
}

function buildContractStateFromSigners(input: {
  contract: ContractRow;
  signers: ContractSignerRow[];
  nowIso: string;
  actorUserId: string;
}) {
  const summary = buildContractSignatureSummary(input.contract, input.signers);
  const isComplete = summary.allRequiredSignersSigned;
  const nextStatus: ContractStatus = summary.isVoided
    ? "void"
    : isComplete
      ? "signed"
      : summary.anyCustomerInteraction || summary.isDeclined
        ? "viewed"
        : "sent";

  return {
    status: nextStatus,
    signature_started_at: input.contract.signature_started_at ?? input.nowIso,
    sent_at: input.contract.sent_at ?? input.nowIso,
    viewed_at:
      summary.anyCustomerInteraction || summary.isDeclined
        ? input.contract.viewed_at ?? input.nowIso
        : input.contract.viewed_at,
    customer_viewed_at:
      summary.anyCustomerInteraction || summary.isDeclined
        ? input.contract.customer_viewed_at ?? input.nowIso
        : input.contract.customer_viewed_at,
    customer_signed_at: summary.allCustomerSignersSigned
      ? input.contract.customer_signed_at ?? input.nowIso
      : input.contract.customer_signed_at,
    contractor_countersigned_at:
      summary.requiresCountersign && summary.allRequiredSignersSigned
        ? input.contract.contractor_countersigned_at ?? input.nowIso
        : input.contract.contractor_countersigned_at,
    signature_declined_at: summary.isDeclined
      ? input.contract.signature_declined_at ?? input.nowIso
      : null,
    signed_at: isComplete ? input.contract.signed_at ?? input.nowIso : null,
    signature_readiness_status: isComplete ? "signed" : "out_for_signature",
    locked_at: input.contract.locked_at ?? input.nowIso,
    edit_lock_reason: input.contract.edit_lock_reason ?? "signature_activity_started",
    updated_by: input.actorUserId
  };
}

async function insertContractSignatureEvents(
  organizationId: string,
  contractId: string,
  events: readonly ContractSignatureEventInsert[]
) {
  if (events.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase.from("contract_signature_events").insert(
    events.map((event) => ({
      company_id: organizationId,
      contract_id: contractId,
      contract_signer_id: event.contractSignerId,
      event_type: event.eventType,
      actor_type: event.actorType,
      actor_user_id: event.actorUserId ?? null,
      portal_user_id: event.portalUserId ?? null,
      provider_event_id: event.providerEventId ?? null,
      payload: event.payload ?? null,
      occurred_at: event.occurredAt ?? new Date().toISOString()
    }))
  );

  if (response.error) {
    throw new Error(
      `Unable to record contract signature events: ${response.error.message}`
    );
  }
}

async function getScopedPortalContract(
  contractId: string,
  next: string
): Promise<ContractPortalScope> {
  const user = await requireAuthenticatedUser(next);
  const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
    (grant) => grant.status === "active"
  );

  if (activeGrants.length === 0) {
    throw new Error("No active portal access is available for this signature action.");
  }

  const accessibleCustomerIds = new Set(activeGrants.map((grant) => grant.customerId));
  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");
  const projectAccessRows =
    (projectAccessResponse.data as Array<{ project_id?: string }> | null) ?? [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate portal project scope: ${projectAccessResponse.error.message}`
    );
  }

  const accessibleProjectIds = new Set(
    projectAccessRows
      .map((row) => row.project_id)
      .filter((value): value is string => typeof value === "string")
  );
  const contract = await getContractRecordByIdInCurrentScope(contractId);

  if (!contract) {
    throw new Error("Contract not found for this portal user.");
  }

  if (
    !accessibleProjectIds.has(contract.project_id) ||
    !accessibleCustomerIds.has(contract.customer_id)
  ) {
    throw new Error("This contract is not available in the current portal scope.");
  }

  return {
    userId: user.id,
    contract
  };
}

export const listContracts = cache(async (): Promise<ContractListItem[]> => {
  const scope = await requireContractScope("/contracts");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(contractSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contracts: ${response.error.message}`);
  }

  if (!isContractRowArray(data)) {
    return [];
  }

  const contracts = await Promise.all(
    data.map(async (row) => ({
      ...mapContractListItem(row),
      sentPdfDownloadUrl: await resolveContractPdfDownloadUrl(row)
    }))
  );

  return contracts
    .sort((left, right) => {
      const statusComparison = compareContractStatuses(left.status, right.status);

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
});

export async function getContractById(
  contractId: string,
  next = "/contracts"
): Promise<ContractDetail | null> {
  const scope = await requireContractScope(next);
  const [contract, revisions, signers, signatureEvents] = await Promise.all([
    getContractRecordById(scope.organizationId, contractId),
    listContractRevisions(scope.organizationId, contractId),
    listContractSigners(scope.organizationId, contractId),
    listContractSignatureEvents(scope.organizationId, contractId)
  ]);

  if (!contract) {
    return null;
  }

  const sentPdfDownloadUrl = await resolveContractPdfDownloadUrl(contract);

  return {
    ...mapContractListItem(contract),
    sentPdfDownloadUrl,
    customer: contract.customers
      ? {
          id: contract.customers.id,
          name: contract.customers.name,
          companyName: contract.customers.company_name,
          phone: contract.customers.phone,
          email: contract.customers.email
        }
      : null,
    revisions,
    signers,
    signatureEvents,
      isEditable: isContractEditable(mapContract(contract))
    };
  }

export async function getContractSignatureActionOptions(
  contractId: string,
  next = "/contracts"
): Promise<ContractSignatureActionOptions | null> {
  const scope = await requireContractScope(next);
  const contract = await getContractRecordById(scope.organizationId, contractId);

  if (!contract) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const [portalGrantResponse, organizationMembers] = await Promise.all([
    supabase
      .from("portal_access_grants")
      .select(
        `
          id,
          customer_contact_id,
          user_id,
          status,
          portal_user:users!portal_access_grants_user_id_fkey (
            id,
            email,
            full_name
          ),
          customer_contact:customer_contacts!portal_access_grants_company_customer_contact_fkey (
            id,
            is_primary,
            contacts:contacts!customer_contacts_contact_company_fkey (
              display_name,
              email
            )
          )
        `
      )
      .eq("company_id", scope.organizationId)
      .eq("customer_id", contract.customer_id)
      .eq("status", "active"),
    listOrganizationMembers(scope.organizationId)
  ]);
  const portalGrantData: unknown = portalGrantResponse.data;

  if (portalGrantResponse.error) {
    throw new Error(
      `Unable to load contract portal signer options: ${portalGrantResponse.error.message}`
    );
  }

  const contractorSignerOptions = organizationMembers
    .filter((member) => member.membership_status === "active" && member.users?.email)
    .map((member) => ({
      userId: member.user_id,
      displayName: getParticipantDisplayName({
        fullName: member.users?.full_name,
        email: member.users?.email ?? member.invitation_email ?? "Unknown member"
      }),
      email: member.users?.email ?? member.invitation_email ?? "Unknown member",
      membershipRole: member.membership_role
    }));

  if (!isContractPortalSignerGrantRowArray(portalGrantData) || portalGrantData.length === 0) {
    return {
      contractId: contract.id,
      customerId: contract.customer_id,
      customerPortalSignerOptions: [],
      contractorSignerOptions
    };
  }

  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("portal_access_grant_id, project_id, status")
    .in(
      "portal_access_grant_id",
      portalGrantData.map((grant) => grant.id)
    )
    .eq("project_id", contract.project_id)
    .eq("status", "active");
  const projectAccessData: unknown = projectAccessResponse.data;

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to load contract project-scoped portal access: ${projectAccessResponse.error.message}`
    );
  }

  const activeProjectGrantIds = new Set(
    isContractPortalProjectAccessRowArray(projectAccessData)
      ? projectAccessData.map((row) => row.portal_access_grant_id)
      : []
  );

  const customerPortalSignerOptions = (
    await Promise.all(
      portalGrantData
        .filter((grant) => activeProjectGrantIds.has(grant.id))
        .map(async (grant) => {
          const portalUser = getPortalUserFromGrant(grant);
          const customerContact = getCustomerContactFromGrant(grant);
          const contact = customerContact ? getContactFromCustomerContact(customerContact) : null;

          if (!portalUser?.id || !portalUser.email) {
            return null;
          }

          const permission = await resolvePortalScopedPermissionForGrantRecord({
            organizationId: scope.organizationId,
            customerId: contract.customer_id,
            projectId: contract.project_id,
            portalAccessGrantId: grant.id,
            customerContactId: grant.customer_contact_id ?? null,
            permission: "canSignContracts"
          });

          if (!permission.allowed) {
            return null;
          }

          return {
            userId: portalUser.id,
            displayName: getParticipantDisplayName({
              fullName: contact?.display_name ?? portalUser.full_name,
              email: portalUser.email
            }),
            email: portalUser.email,
            contactDisplayName: contact?.display_name ?? null,
            contactEmail: contact?.email ?? null,
            isPrimaryContact: customerContact?.is_primary === true
          } satisfies ContractSignatureParticipantOption;
        })
    )
  ).filter(
    (option): option is Exclude<typeof option, null> => option !== null
  );

  return {
    contractId: contract.id,
    customerId: contract.customer_id,
    customerPortalSignerOptions,
    contractorSignerOptions
  };
}

export const listApprovedEstimatesForContracts = cache(async () => {
  const estimates = await listEstimates();

  return estimates.filter((estimate) => estimate.status === "approved");
});

async function resolveApprovedEstimateForContract(estimateId: string) {
  const estimate = await getEstimateById(estimateId, `/contracts?estimateId=${estimateId}`);

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (estimate.status !== "approved") {
    throw new Error("Contracts can only be generated from approved estimates.");
  }

  if (!estimate.project || !estimate.customer) {
    throw new Error("Approved estimate is missing connected project or customer context.");
  }

  return estimate;
}

export async function createContractFromEstimate(
  input: CreateContractFromEstimateInput
) {
  const scope = await requireContractScope("/contracts");
  const estimate = await resolveApprovedEstimateForContract(input.estimateId);
  const snapshotBundle = await getLatestApprovedEstimateCommercialSnapshotForContract(
    scope.organizationId,
    input.estimateId
  );
  const workflowSettings = await getOrganizationWorkflowSettings(scope.organizationId);
  const preferredTemplateId =
    input.templateId ?? workflowSettings.approvedEstimateContractTemplateId ?? null;
  const templateContext = await prepareContractTemplateContextFromEstimate({
    estimateId: input.estimateId,
    templateId: preferredTemplateId,
    next: "/contracts"
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .insert({
      company_id: scope.organizationId,
      customer_id: snapshotBundle.snapshot.customerId,
      project_id: snapshotBundle.snapshot.projectId,
      estimate_id: estimate.id,
      template_id: templateContext.template.id,
      status: "draft",
      title:
        templateContext.renderedSubject ??
        `Contract for ${
          snapshotBundle.snapshot.projectNameSnapshot || estimate.project?.name || estimate.referenceNumber
        }`,
      rendered_subject: templateContext.renderedSubject,
      rendered_content: buildContractRenderedHtml({
        templateBody: templateContext.renderedBody,
        snapshot: snapshotBundle.snapshot,
        snapshotItems: snapshotBundle.snapshotItems
      }),
      internal_approval_status: workflowSettings.requireContractInternalApproval
        ? "pending"
        : "not_required",
      signature_readiness_status: workflowSettings.requireContractInternalApproval
        ? "draft"
        : "ready_to_send",
      generated_from_estimate_reference: snapshotBundle.snapshot.estimateReferenceNumber,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;

  if (response.error || !data || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error(
      `Unable to generate the contract: ${response.error?.message ?? "Unknown error."}`
    );
  }

  const contract = await getContractRecordById(scope.organizationId, (data as { id: string }).id);

  if (!contract) {
    throw new Error("Unexpected contract response after generation.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: contract.project_id
  });

  return mapContract(contract);
}

export async function updateContractDraft(input: UpdateContractDraftInput) {
  const scope = await requireContractScope(`/contracts/${input.contractId}/edit`);
  const currentContract = await getContractRecordById(scope.organizationId, input.contractId);
  const workflowSettings = await getOrganizationWorkflowSettings(scope.organizationId);

  if (!currentContract) {
    throw new Error("Contract not found for this organization.");
  }

  if (!isContractEditable(mapContract(currentContract))) {
    throw new Error("This contract is locked and can no longer be edited.");
  }

  const supabase = await getSupabaseServerClient();
  const snapshotResponse = await supabase.rpc("create_contract_revision_snapshot", {
    target_contract_id: input.contractId,
    acting_user_id: scope.userId,
    summary: input.editSummary
  });

  if (snapshotResponse.error) {
    throw new Error(
      `Unable to save contract revision snapshot: ${snapshotResponse.error.message}`
    );
  }

  const response = await supabase
    .from("contracts")
    .update({
      title: input.title,
      rendered_subject: input.renderedSubject,
      rendered_content: sanitizeHtml(input.renderedContent),
      internal_approval_status: workflowSettings.requireContractInternalApproval
        ? "pending"
        : "not_required",
      internal_approved_at: null,
      signature_readiness_status: workflowSettings.requireContractInternalApproval
        ? "draft"
        : "ready_to_send",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.contractId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the contract: ${response.error.message}`);
  }

  if (!data || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error("Contract not found for this organization.");
  }

  const updated = await getContractRecordById(scope.organizationId, input.contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function sendContractForSignature(input: SendContractForSignatureInput) {
  const scope = await requireContractScope(`/contracts/${input.contractId}`);
  const currentContract = await getContractRecordById(scope.organizationId, input.contractId);
  const workflowSettings = await getOrganizationWorkflowSettings(scope.organizationId);

  if (!currentContract) {
    throw new Error("Contract not found for this organization.");
  }

  const gate = computeContractWorkflowGate({
    status: currentContract.status,
    internalApprovalStatus: currentContract.internal_approval_status,
    requireContractInternalApproval: workflowSettings.requireContractInternalApproval,
    signatureStartedAt: currentContract.signature_started_at,
    lockedAt: currentContract.locked_at
  });

  if (!gate.canSend) {
    if (gate.sendBlockers.includes("internal_approval_pending")) {
      throw new Error("Contract must be internally approved before it can be sent.");
    }

    if (gate.sendBlockers.includes("internal_approval_rejected")) {
      throw new Error(
        "Contract is marked as needing revision. Update the draft and approve it before send."
      );
    }

    throw new Error("Contract is not ready to send.");
  }

  const existingSigners = await listContractSignerRowsAdmin(scope.organizationId, input.contractId);

  if (existingSigners.length > 0) {
    throw new Error("This contract already has signer routing and cannot be resent from draft.");
  }

  const normalizedSigners = await validateAndNormalizeSendSigners(
    currentContract,
    input.signers,
    scope.userId
  );
  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const pdfSnapshot = await createAndUploadContractPdf({
    contract: {
      id: currentContract.id,
      organizationId: currentContract.company_id,
      title: currentContract.title,
      renderedContent: currentContract.rendered_content
    }
  });
  const signerInsertResponse = await admin
    .from("contract_signers")
    .insert(
      normalizedSigners.map((signer) => ({
        company_id: scope.organizationId,
        contract_id: input.contractId,
        signer_role: signer.signerRole,
        signer_status: "pending",
        customer_id: signer.customerId,
        portal_user_id: signer.portalUserId,
        organization_user_id: signer.organizationUserId,
        display_name: signer.displayName,
        email: signer.email,
        signer_order: signer.signerOrder
      }))
    )
    .select(
      `
        id,
        company_id,
        contract_id,
        signer_role,
        signer_status,
        customer_id,
        portal_user_id,
        organization_user_id,
        display_name,
        email,
        signer_order,
        viewed_at,
        signed_at,
        declined_at,
        decline_reason,
        created_at,
        updated_at
      `
    );
  const insertedSignerData: unknown = signerInsertResponse.data;

  if (signerInsertResponse.error) {
    throw new Error(
      `Unable to create contract signer routing: ${signerInsertResponse.error.message}`
    );
  }

  if (!isContractSignerRowArray(insertedSignerData) || insertedSignerData.length === 0) {
    throw new Error("Unexpected contract signer response after send.");
  }

  const contractUpdateResponse = await admin
    .from("contracts")
    .update({
      status: "sent",
      sent_pdf_storage_path: pdfSnapshot.storagePath,
      sent_pdf_file_name: pdfSnapshot.fileName,
      sent_pdf_mime_type: pdfSnapshot.mimeType,
      sent_pdf_generated_at: pdfSnapshot.generatedAt,
      signature_started_at: currentContract.signature_started_at ?? nowIso,
      sent_at: currentContract.sent_at ?? nowIso,
      signature_readiness_status: "out_for_signature",
      locked_at: currentContract.locked_at ?? nowIso,
      edit_lock_reason: currentContract.edit_lock_reason ?? "signature_activity_started",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.contractId);

  if (contractUpdateResponse.error) {
    throw new Error(
      `Unable to send the contract for signature: ${contractUpdateResponse.error.message}`
    );
  }

  await insertContractSignatureEvents(scope.organizationId, input.contractId, [
    {
      contractSignerId: null,
      eventType: "signature_requested",
      actorType: "organization_user",
      actorUserId: scope.userId,
      payload: {
        signerCount: insertedSignerData.length,
        requiresCountersign: insertedSignerData.some(
          (signer) => signer.signer_role === "contractor"
        )
      },
      occurredAt: nowIso
      }
    ]);
  await recordContractNotificationEvent({
    organizationId: scope.organizationId,
    contractId: input.contractId,
    customerId: currentContract.customer_id,
    projectId: currentContract.project_id,
    contractTitle: currentContract.title,
    eventType: "sent",
    actorType: "organization_user",
    actorUserId: scope.userId,
    occurredAt: nowIso,
    payload: {
      signerCount: insertedSignerData.length
    }
  });

  const updated = await getContractRecordById(scope.organizationId, input.contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function recordCustomerViewedContract(contractId: string, next = "/portal") {
  const portalScope = await getScopedPortalContract(contractId, next);
  const signers = await listContractSignerRowsAdmin(
    portalScope.contract.company_id,
    portalScope.contract.id
  );
  const matchingSigners = signers.filter(
    (signer) =>
      signer.signer_role === "customer" &&
      signer.portal_user_id === portalScope.userId &&
      (signer.signer_status === "pending" || signer.signer_status === "viewed")
  );

  if (matchingSigners.length === 0) {
    throw new Error("No active customer signer is available for this portal user.");
  }

  if (portalScope.contract.status === "signed" || portalScope.contract.status === "void") {
    return mapContract(portalScope.contract);
  }

  const signersToUpdate = matchingSigners.filter((signer) => signer.signer_status === "pending");
  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();

  if (signersToUpdate.length > 0) {
    const signerIds = signersToUpdate.map((signer) => signer.id);
    const response = await admin
      .from("contract_signers")
      .update({
        signer_status: "viewed",
        viewed_at: nowIso
      })
      .eq("company_id", portalScope.contract.company_id)
      .in("id", signerIds);

    if (response.error) {
      throw new Error(`Unable to record contract view: ${response.error.message}`);
    }

    await insertContractSignatureEvents(
      portalScope.contract.company_id,
      portalScope.contract.id,
      signersToUpdate.map((signer) => ({
        contractSignerId: signer.id,
        eventType: "signer_viewed",
        actorType: "portal_user",
        portalUserId: portalScope.userId,
        payload: {
          signerRole: signer.signer_role,
          signerOrder: signer.signer_order
        },
        occurredAt: nowIso
        }))
      );
    await recordContractNotificationEvent({
      organizationId: portalScope.contract.company_id,
      contractId: portalScope.contract.id,
      customerId: portalScope.contract.customer_id,
      projectId: portalScope.contract.project_id,
      contractTitle: portalScope.contract.title,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: portalScope.userId,
      occurredAt: nowIso
    });
  }

  const refreshedSigners = await listContractSignerRowsAdmin(
    portalScope.contract.company_id,
    portalScope.contract.id
  );
  const contractState = buildContractStateFromSigners({
    contract: portalScope.contract,
    signers: refreshedSigners,
    nowIso,
    actorUserId: portalScope.userId
  });
  const contractUpdateResponse = await admin
    .from("contracts")
    .update(contractState)
    .eq("company_id", portalScope.contract.company_id)
    .eq("id", portalScope.contract.id);

  if (contractUpdateResponse.error) {
    throw new Error(`Unable to update contract view state: ${contractUpdateResponse.error.message}`);
  }

  const updated = await getContractRecordByIdInCurrentScope(contractId);

  if (!updated) {
    throw new Error("Contract not found for this portal user.");
  }

  await syncProjectCommercialReadiness({
    organizationId: updated.company_id,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function recordCustomerSignedContract(
  input: ContractPortalSignatureActionInput,
  next = "/portal"
) {
  const portalScope = await getScopedPortalContract(input.contractId, next);
  const permission = await resolvePortalScopedPermissionForCurrentUser({
    customerId: portalScope.contract.customer_id,
    projectId: portalScope.contract.project_id,
    permission: "canSignContracts",
    next
  });

  if (!permission.allowed) {
    throw new Error(
      "This contact does not currently have permission to sign or decline this contract."
    );
  }
  const signers = await listContractSignerRowsAdmin(
    portalScope.contract.company_id,
    portalScope.contract.id
  );
  const matchingSigners = signers.filter(
    (signer) =>
      signer.signer_role === "customer" &&
      signer.portal_user_id === portalScope.userId &&
      (signer.signer_status === "pending" || signer.signer_status === "viewed")
  );
  const summary = buildContractSignatureSummary(portalScope.contract, signers);

  if (!summary.canCustomerAct || matchingSigners.length === 0) {
    throw new Error("This contract is not currently available for customer signature.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const signerIds = matchingSigners.map((signer) => signer.id);
  const signerUpdateResponse = await admin
    .from("contract_signers")
    .update({
      signer_status: "signed",
      viewed_at: nowIso,
      signed_at: nowIso,
      declined_at: null,
      decline_reason: null
    })
    .eq("company_id", portalScope.contract.company_id)
    .in("id", signerIds);

  if (signerUpdateResponse.error) {
    throw new Error(`Unable to record the customer signature: ${signerUpdateResponse.error.message}`);
  }

  const refreshedSigners = await listContractSignerRowsAdmin(
    portalScope.contract.company_id,
    portalScope.contract.id
  );
  const refreshedSummary = buildContractSignatureSummary(portalScope.contract, refreshedSigners);

  await insertContractSignatureEvents(
    portalScope.contract.company_id,
    portalScope.contract.id,
    [
      ...matchingSigners.map((signer) => ({
        contractSignerId: signer.id,
        eventType: "signer_signed" as const,
        actorType: "portal_user" as const,
        portalUserId: portalScope.userId,
        payload: {
          signerRole: signer.signer_role,
          signerOrder: signer.signer_order
        },
        occurredAt: nowIso
      })),
      ...(refreshedSummary.allRequiredSignersSigned
        ? [
            {
              contractSignerId: null,
              eventType: "signature_completed" as const,
              actorType: "system" as const,
              payload: {
                completionMode: refreshedSummary.requiresCountersign
                  ? "customer_and_contractor"
                  : "customer_only"
              },
              occurredAt: nowIso
            }
          ]
        : [])
      ]
    );
  if (refreshedSummary.allRequiredSignersSigned) {
    await recordContractNotificationEvent({
      organizationId: portalScope.contract.company_id,
      contractId: portalScope.contract.id,
      customerId: portalScope.contract.customer_id,
      projectId: portalScope.contract.project_id,
      contractTitle: portalScope.contract.title,
      eventType: "signed",
      actorType: "system",
      occurredAt: nowIso,
      payload: {
        completionMode: refreshedSummary.requiresCountersign
          ? "customer_and_contractor"
          : "customer_only"
      }
    });
  }

  const contractState = buildContractStateFromSigners({
    contract: portalScope.contract,
    signers: refreshedSigners,
    nowIso,
    actorUserId: portalScope.userId
  });
  const contractUpdateResponse = await admin
    .from("contracts")
    .update(contractState)
    .eq("company_id", portalScope.contract.company_id)
    .eq("id", portalScope.contract.id);

  if (contractUpdateResponse.error) {
    throw new Error(
      `Unable to update the canonical contract signature state: ${contractUpdateResponse.error.message}`
    );
  }

  const updated = await getContractRecordByIdInCurrentScope(input.contractId);

  if (!updated) {
    throw new Error("Contract not found for this portal user.");
  }

  await syncProjectCommercialReadiness({
    organizationId: updated.company_id,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function recordOnsiteContractSignature(
  input: ContractOnsiteSignatureActionInput
) {
  const scope = await requireContractScope(`/contracts/${input.contractId}`);
  const contract = await getContractRecordById(scope.organizationId, input.contractId);

  if (!contract) {
    throw new Error("Contract not found for this organization.");
  }

  if (contract.status !== "sent" && contract.status !== "viewed") {
    throw new Error("Only sent or viewed contracts can be signed onsite.");
  }

  const signers = await listContractSignerRowsAdmin(
    scope.organizationId,
    input.contractId
  );
  const signer = signers.find((candidate) => candidate.id === input.signerId);

  if (!signer || signer.contract_id !== contract.id) {
    throw new Error("Selected signer does not belong to this contract.");
  }

  if (signer.signer_role !== "customer") {
    throw new Error("Onsite customer signature cannot complete a contractor countersign slot.");
  }

  if (signer.signed_at !== null || signer.signer_status === "signed") {
    throw new Error("This customer signer has already signed the contract.");
  }

  if (signer.signer_status !== "pending" && signer.signer_status !== "viewed") {
    throw new Error("This customer signer is not currently available for signature.");
  }

  const firstUnsignedCustomerSigner = signers.find(
    (candidate) =>
      candidate.signer_role === "customer" &&
      candidate.signed_at === null &&
      (candidate.signer_status === "pending" || candidate.signer_status === "viewed")
  );

  if (!firstUnsignedCustomerSigner || firstUnsignedCustomerSigner.id !== signer.id) {
    throw new Error("Complete the first unsigned customer signer before later signers.");
  }

  const summary = buildContractSignatureSummary(contract, signers);

  if (!summary.canCustomerAct) {
    throw new Error("This contract is not currently available for customer signature.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const signerUpdateResponse = await admin
    .from("contract_signers")
    .update({
      signer_status: "signed",
      viewed_at: signer.viewed_at ?? nowIso,
      signed_at: nowIso,
      declined_at: null,
      decline_reason: null
    })
    .eq("company_id", scope.organizationId)
    .eq("contract_id", contract.id)
    .eq("id", signer.id);

  if (signerUpdateResponse.error) {
    throw new Error(
      `Unable to record the onsite customer signature: ${signerUpdateResponse.error.message}`
    );
  }

  const refreshedSigners = await listContractSignerRowsAdmin(
    scope.organizationId,
    contract.id
  );
  const refreshedSummary = buildContractSignatureSummary(contract, refreshedSigners);

  await insertContractSignatureEvents(scope.organizationId, contract.id, [
    {
      contractSignerId: signer.id,
      eventType: "signer_signed" as const,
      actorType: "organization_user" as const,
      actorUserId: scope.userId,
      payload: {
        source: "onsite",
        capturedVia: "contractor_app",
        captureMethod: "canvas",
        signatureImage: input.signatureImage,
        version: 1,
        signerRole: signer.signer_role,
        signerOrder: signer.signer_order
      },
      occurredAt: nowIso
    },
    ...(refreshedSummary.allRequiredSignersSigned
      ? [
          {
            contractSignerId: null,
            eventType: "signature_completed" as const,
            actorType: "system" as const,
            payload: {
              completionMode: refreshedSummary.requiresCountersign
                ? "customer_and_contractor"
                : "customer_only",
              source: "onsite",
              version: 1
            },
            occurredAt: nowIso
          }
        ]
      : [])
  ]);

  if (refreshedSummary.allRequiredSignersSigned) {
    await recordContractNotificationEvent({
      organizationId: scope.organizationId,
      contractId: contract.id,
      customerId: contract.customer_id,
      projectId: contract.project_id,
      contractTitle: contract.title,
      eventType: "signed",
      actorType: "system",
      occurredAt: nowIso,
      payload: {
        completionMode: refreshedSummary.requiresCountersign
          ? "customer_and_contractor"
          : "customer_only",
        source: "onsite"
      }
    });
  }

  const contractState = buildContractStateFromSigners({
    contract,
    signers: refreshedSigners,
    nowIso,
    actorUserId: scope.userId
  });
  const contractUpdateResponse = await admin
    .from("contracts")
    .update(contractState)
    .eq("company_id", scope.organizationId)
    .eq("id", contract.id);

  if (contractUpdateResponse.error) {
    throw new Error(
      `Unable to update the canonical contract signature state: ${contractUpdateResponse.error.message}`
    );
  }

  const updated = await getContractRecordById(scope.organizationId, input.contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function recordCustomerDeclinedContract(
  input: ContractPortalSignatureActionInput,
  next = "/portal"
) {
  const portalScope = await getScopedPortalContract(input.contractId, next);
  const permission = await resolvePortalScopedPermissionForCurrentUser({
    customerId: portalScope.contract.customer_id,
    projectId: portalScope.contract.project_id,
    permission: "canSignContracts",
    next
  });

  if (!permission.allowed) {
    throw new Error(
      "This contact does not currently have permission to sign or decline this contract."
    );
  }
  const signers = await listContractSignerRowsAdmin(
    portalScope.contract.company_id,
    portalScope.contract.id
  );
  const matchingSigners = signers.filter(
    (signer) =>
      signer.signer_role === "customer" &&
      signer.portal_user_id === portalScope.userId &&
      canTransitionContractSignerStatus(signer.signer_status, "declined")
  );
  const summary = buildContractSignatureSummary(portalScope.contract, signers);

  if (!summary.canCustomerAct || matchingSigners.length === 0) {
    throw new Error("This contract is not currently available for customer decline.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const signerUpdateResponse = await admin
    .from("contract_signers")
    .update({
      signer_status: "declined",
      viewed_at: nowIso,
      declined_at: nowIso,
      decline_reason: input.declineReason
    })
    .eq("company_id", portalScope.contract.company_id)
    .in(
      "id",
      matchingSigners.map((signer) => signer.id)
    );

  if (signerUpdateResponse.error) {
    throw new Error(
      `Unable to record the customer decline: ${signerUpdateResponse.error.message}`
    );
  }

  await insertContractSignatureEvents(
    portalScope.contract.company_id,
    portalScope.contract.id,
    matchingSigners.map((signer) => ({
      contractSignerId: signer.id,
      eventType: "signer_declined",
      actorType: "portal_user",
      portalUserId: portalScope.userId,
      payload: {
        signerRole: signer.signer_role,
        signerOrder: signer.signer_order,
        declineReason: input.declineReason ?? null
      },
        occurredAt: nowIso
      }))
    );
  await recordContractNotificationEvent({
    organizationId: portalScope.contract.company_id,
    contractId: portalScope.contract.id,
    customerId: portalScope.contract.customer_id,
    projectId: portalScope.contract.project_id,
    contractTitle: portalScope.contract.title,
    eventType: "declined",
    actorType: "portal_user",
    portalUserId: portalScope.userId,
    occurredAt: nowIso,
    payload: {
      declineReason: input.declineReason ?? null
    }
  });

  const contractUpdateResponse = await admin
    .from("contracts")
    .update({
      status: portalScope.contract.status === "sent" ? "viewed" : portalScope.contract.status,
      signature_started_at: portalScope.contract.signature_started_at ?? nowIso,
      sent_at: portalScope.contract.sent_at ?? nowIso,
      viewed_at: portalScope.contract.viewed_at ?? nowIso,
      customer_viewed_at: portalScope.contract.customer_viewed_at ?? nowIso,
      signature_declined_at: portalScope.contract.signature_declined_at ?? nowIso,
      signature_readiness_status: "out_for_signature",
      locked_at: portalScope.contract.locked_at ?? nowIso,
      edit_lock_reason: portalScope.contract.edit_lock_reason ?? "signature_activity_started",
      updated_by: portalScope.userId
    })
    .eq("company_id", portalScope.contract.company_id)
    .eq("id", portalScope.contract.id);

  if (contractUpdateResponse.error) {
    throw new Error(
      `Unable to update the canonical contract decline state: ${contractUpdateResponse.error.message}`
    );
  }

  const updated = await getContractRecordByIdInCurrentScope(input.contractId);

  if (!updated) {
    throw new Error("Contract not found for this portal user.");
  }

  await syncProjectCommercialReadiness({
    organizationId: updated.company_id,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function countersignContract(contractId: string) {
  const scope = await requireContractScope(`/contracts/${contractId}`);
  const contract = await getContractRecordById(scope.organizationId, contractId);

  if (!contract) {
    throw new Error("Contract not found for this organization.");
  }

  const signers = await listContractSignerRowsAdmin(scope.organizationId, contractId);
  const summary = buildContractSignatureSummary(contract, signers);

  if (!summary.canContractorCountersign) {
    throw new Error(
      "This contract is not ready for contractor countersign. Customer signature must complete first."
    );
  }

  const matchingSigners = signers.filter(
    (signer) =>
      signer.signer_role === "contractor" &&
      signer.organization_user_id === scope.userId &&
      (signer.signer_status === "pending" || signer.signer_status === "viewed")
  );

  if (matchingSigners.length === 0) {
    throw new Error("No contractor countersigner is assigned to the current user.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const signerUpdateResponse = await admin
    .from("contract_signers")
    .update({
      signer_status: "signed",
      viewed_at: nowIso,
      signed_at: nowIso
    })
    .eq("company_id", scope.organizationId)
    .in(
      "id",
      matchingSigners.map((signer) => signer.id)
    );

  if (signerUpdateResponse.error) {
    throw new Error(
      `Unable to record the contractor countersignature: ${signerUpdateResponse.error.message}`
    );
  }

  const refreshedSigners = await listContractSignerRowsAdmin(scope.organizationId, contractId);
  const refreshedSummary = buildContractSignatureSummary(contract, refreshedSigners);

  await insertContractSignatureEvents(scope.organizationId, contractId, [
    ...matchingSigners.map((signer) => ({
      contractSignerId: signer.id,
      eventType: "contractor_countersigned" as const,
      actorType: "organization_user" as const,
      actorUserId: scope.userId,
      payload: {
        signerRole: signer.signer_role,
        signerOrder: signer.signer_order
      },
      occurredAt: nowIso
    })),
    ...(refreshedSummary.allRequiredSignersSigned
      ? [
          {
            contractSignerId: null,
            eventType: "signature_completed" as const,
            actorType: "system" as const,
            payload: {
              completionMode: "customer_and_contractor"
            },
            occurredAt: nowIso
          }
        ]
      : [])
  ]);
  if (refreshedSummary.allRequiredSignersSigned) {
    await recordContractNotificationEvent({
      organizationId: scope.organizationId,
      contractId,
      customerId: contract.customer_id,
      projectId: contract.project_id,
      contractTitle: contract.title,
      eventType: "signed",
      actorType: "system",
      occurredAt: nowIso,
      payload: {
        completionMode: "customer_and_contractor"
      }
    });
  }

  const contractState = buildContractStateFromSigners({
    contract,
    signers: refreshedSigners,
    nowIso,
    actorUserId: scope.userId
  });
  const contractUpdateResponse = await admin
    .from("contracts")
    .update(contractState)
    .eq("company_id", scope.organizationId)
    .eq("id", contractId);

  if (contractUpdateResponse.error) {
    throw new Error(
      `Unable to update the canonical contract countersign state: ${contractUpdateResponse.error.message}`
    );
  }

  const updated = await getContractRecordById(scope.organizationId, contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function voidContractSignature(contractId: string) {
  const scope = await requireContractScope(`/contracts/${contractId}`);
  const contract = await getContractRecordById(scope.organizationId, contractId);

  if (!contract) {
    throw new Error("Contract not found for this organization.");
  }

  if (contract.status === "signed") {
    throw new Error("Signed contracts cannot be voided from the signature workflow.");
  }

  if (!canTransitionContractStatus(contract.status, "void")) {
    throw new Error(`Contract status cannot move from ${contract.status} to void.`);
  }

  const signers = await listContractSignerRowsAdmin(scope.organizationId, contractId);
  const signersToVoid = signers.filter((signer) =>
    canTransitionContractSignerStatus(signer.signer_status, "voided")
  );
  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();

  if (signersToVoid.length > 0) {
    const signerUpdateResponse = await admin
      .from("contract_signers")
      .update({
        signer_status: "voided"
      })
      .eq("company_id", scope.organizationId)
      .in(
        "id",
        signersToVoid.map((signer) => signer.id)
      );

    if (signerUpdateResponse.error) {
      throw new Error(
        `Unable to void contract signer routing: ${signerUpdateResponse.error.message}`
      );
    }
  }

  const contractUpdateResponse = await admin
    .from("contracts")
    .update({
      status: "void",
      signature_voided_at:
        contract.signature_started_at !== null
          ? contract.signature_voided_at ?? nowIso
          : contract.signature_voided_at,
      locked_at: contract.locked_at ?? nowIso,
      edit_lock_reason: "voided",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", contractId);

  if (contractUpdateResponse.error) {
    throw new Error(`Unable to void contract signature flow: ${contractUpdateResponse.error.message}`);
  }

  await insertContractSignatureEvents(scope.organizationId, contractId, [
    {
      contractSignerId: null,
      eventType: "signature_voided",
      actorType: "organization_user",
      actorUserId: scope.userId,
      payload: {
        hadSignatureActivity: contract.signature_started_at !== null
      },
      occurredAt: nowIso
    }
  ]);

  const updated = await getContractRecordById(scope.organizationId, contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function updateContractStatus(
  contractId: string,
  nextStatus: ContractStatus
) {
  if (nextStatus === "sent") {
    return sendContractForSignature({
      contractId,
      signers: []
    });
  }

  if (nextStatus === "void") {
    return voidContractSignature(contractId);
  }

  throw new Error(
    "Manual contract status updates are limited to send and void. Customer view, sign, and countersign now flow through signature workflow helpers."
  );
}

export async function updateContractInternalApprovalStatus(
  contractId: string,
  nextStatus: ContractInternalApprovalStatus
) {
  const scope = await requireContractScope(`/contracts/${contractId}`);
  const currentContract = await getContractRecordById(scope.organizationId, contractId);
  const workflowSettings = await getOrganizationWorkflowSettings(scope.organizationId);

  if (!currentContract) {
    throw new Error("Contract not found for this organization.");
  }

  if (!workflowSettings.requireContractInternalApproval) {
    throw new Error(
      "This organization does not require internal contract approval for send readiness."
    );
  }

  if (currentContract.status !== "draft" || currentContract.signature_started_at || currentContract.locked_at) {
    throw new Error("Only unlocked draft contracts can change internal approval state.");
  }

  if (
    !canTransitionContractInternalApprovalStatus(
      currentContract.internal_approval_status,
      nextStatus
    )
  ) {
    throw new Error(
      `Internal approval cannot move from ${currentContract.internal_approval_status} to ${nextStatus}.`
    );
  }

  const supabase = await getSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const response = await supabase
    .from("contracts")
    .update({
      internal_approval_status: nextStatus,
      internal_approved_at: nextStatus === "approved" ? nowIso : null,
      signature_readiness_status: nextStatus === "approved" ? "ready_to_send" : "draft",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", contractId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update contract internal approval: ${response.error.message}`
    );
  }

  if (!data || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error("Contract not found for this organization.");
  }

  const updated = await getContractRecordById(scope.organizationId, contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: updated.project_id
  });

  return mapContract(updated);
}

export async function getContractTemplateOptions() {
  const templates = await listDocumentTemplates("contract");

  return templates.filter((template: DocumentTemplate) => template.status === "active");
}
