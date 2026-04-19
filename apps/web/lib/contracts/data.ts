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
  ContractSignerInput,
  CreateContractFromEstimateInput,
  SendContractForSignatureInput,
  UpdateContractDraftInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById, listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOrganizationMembers } from "@/lib/organizations/admin";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";
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
  status: ContractStatus;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  generated_from_estimate_reference: string | null;
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
  user_id: string;
  status: string;
  portal_user:
    | {
        id: string;
        email: string;
        full_name: string | null;
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
  status,
  title,
  rendered_subject,
  rendered_content,
  generated_from_estimate_reference,
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
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    (row.rendered_subject === null || typeof row.rendered_subject === "string") &&
    typeof row.rendered_content === "string" &&
    (row.generated_from_estimate_reference === null ||
      typeof row.generated_from_estimate_reference === "string") &&
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
    typeof row.user_id === "string" &&
    typeof row.status === "string"
  );
}

function isContractPortalSignerGrantRowArray(
  value: unknown
): value is ContractPortalSignerGrantRow[] {
  return Array.isArray(value) && value.every((row) => isContractPortalSignerGrantRow(row));
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

function mapContract(row: ContractRow): ContractRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    templateId: row.template_id,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    generatedFromEstimateReference: row.generated_from_estimate_reference,
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
      : null
  };
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
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        template_id,
        status,
        title,
        rendered_subject,
        rendered_content,
        generated_from_estimate_reference,
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
        updated_at
      `
    )
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
    userId: data.user_id,
    status: data.status,
    invitedEmail: data.invited_email ?? null,
    invitedByUserId: data.invited_by ?? null,
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

  return data
    .map((row) => mapContractListItem(row))
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

  return {
    ...mapContractListItem(contract),
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
          user_id,
          status,
          portal_user:users!portal_access_grants_user_id_fkey (
            id,
            email,
            full_name
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

  const customerPortalSignerOptions = portalGrantData
    .filter((grant) => activeProjectGrantIds.has(grant.id))
    .map((grant) => {
      const portalUser = Array.isArray(grant.portal_user) ? (grant.portal_user[0] ?? null) : null;

      if (!portalUser?.id || !portalUser.email) {
        return null;
      }

      return {
        userId: portalUser.id,
        displayName: getParticipantDisplayName({
          fullName: portalUser.full_name,
          email: portalUser.email
        }),
        email: portalUser.email
      } satisfies ContractSignatureParticipantOption;
    })
    .filter((option): option is ContractSignatureParticipantOption => option !== null);

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
      customer_id: estimate.customerId,
      project_id: estimate.projectId,
      estimate_id: estimate.id,
      template_id: templateContext.template.id,
      status: "draft",
      title:
        templateContext.renderedSubject ??
        `Contract for ${estimate.project?.name ?? estimate.referenceNumber}`,
      rendered_subject: templateContext.renderedSubject,
      rendered_content: templateContext.renderedBody,
      internal_approval_status: workflowSettings.requireContractInternalApproval
        ? "pending"
        : "not_required",
      signature_readiness_status: workflowSettings.requireContractInternalApproval
        ? "draft"
        : "ready_to_send",
      generated_from_estimate_reference: estimate.referenceNumber,
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
      rendered_content: input.renderedContent,
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

export async function recordCustomerDeclinedContract(
  input: ContractPortalSignatureActionInput,
  next = "/portal"
) {
  const portalScope = await getScopedPortalContract(input.contractId, next);
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
