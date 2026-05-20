import "server-only";

import { redirect } from "next/navigation";
import { canTransitionDocumentSignerStatus } from "@floorconnector/domain";
import {
  isPostmarkEmailConfigured,
  sendPostmarkEmail
} from "@floorconnector/integrations";
import type {
  DocumentDeliveryChannel,
  DocumentDeliveryEvent,
  DocumentDeliveryEventType,
  DocumentDeliverySubjectType,
  DocumentSignatureEvent,
  DocumentSignatureEventType,
  DocumentSignatureSubjectType,
  DocumentSigner,
  DocumentSignerRole,
  DocumentSignerStatus,
  DocumentTemplate,
  MembershipRole,
  WarrantyDocument,
  WarrantyDocumentStatus
} from "@floorconnector/types";

import type {
  CreateWarrantyDocumentFromServiceTicketInput,
  WarrantyDocumentDeliveryEventInput,
  WarrantyDocumentEmailSendInput,
  WarrantyDocumentSignerActionInput,
  WarrantyDocumentSignerInput,
  WarrantyDocumentDraftInput,
  WarrantyDocumentStatusInput
} from "./schemas";
import {
  buildWarrantyDocumentReviewEmailContent,
  isWarrantyDocumentEmailSignerEligible
} from "./email";
import {
  summarizeWarrantyDocumentSignatures,
  type WarrantyDocumentSignatureSummary
} from "./continuity";
import {
  renderWarrantyTemplateHtml,
  type WarrantyDocumentMergeData
} from "./render";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getOrganizationProductionActionLockState } from "@/lib/organizations/activation-guard";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createNotificationEvent } from "@/lib/notifications/system";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ensureDefaultDocumentTemplateForType,
  getDocumentTemplateById,
  listDocumentTemplates
} from "@/lib/templates/data";

type WarrantyDocumentScope = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
  organization: {
    displayName: string;
    legalName: string | null;
  };
};

type WarrantyDocumentRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string | null;
  job_id: string | null;
  service_ticket_id: string | null;
  document_template_id: string | null;
  status: WarrantyDocumentStatus;
  title: string;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  warranty_basis: string | null;
  rendered_content?: string | null;
  created_by: string | null;
  updated_by: string | null;
  issued_at: string | null;
  voided_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: { id: string; name: string } | null;
  projects?: { id: string; name: string } | null;
  jobs?: { id: string; dispatch_status: string } | null;
  service_tickets?: {
    id: string;
    title: string;
    status: string;
  } | null;
  document_templates?: {
    id: string;
    name: string;
  } | null;
};

type ServiceTicketContextRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string | null;
  job_id: string | null;
  title: string;
  status: string;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  warranty_basis: string | null;
  customers?: { id: string; name: string } | null;
  projects?: { id: string; name: string } | null;
  jobs?: { id: string; dispatch_status: string } | null;
};

type DocumentSignerRow = {
  id: string;
  company_id: string;
  subject_type: DocumentSignatureSubjectType;
  subject_id: string;
  signer_role: DocumentSignerRole;
  signer_name: string;
  signer_email: string;
  status: DocumentSignerStatus;
  signed_at: string | null;
  declined_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentSignatureEventRow = {
  id: string;
  company_id: string;
  subject_type: DocumentSignatureSubjectType;
  subject_id: string;
  signer_id: string | null;
  event_type: DocumentSignatureEventType;
  event_note: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

type DocumentDeliveryEventRow = {
  id: string;
  company_id: string;
  subject_type: DocumentDeliverySubjectType;
  subject_id: string;
  event_type: DocumentDeliveryEventType;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_role: string | null;
  channel: DocumentDeliveryChannel;
  provider: string | null;
  provider_message_id: string | null;
  provider_event_id: string | null;
  related_notification_event_id: string | null;
  event_note: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

type NotificationDeliveryRow = {
  id: string;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed";
};

type PortalAccessCandidateRow = {
  id: string;
  user_id: string | null;
  invited_email: string | null;
};

type DocumentSignerSummaryRow = {
  id: string;
  subject_id: string;
  status: DocumentSignerStatus;
};

type DocumentSignatureEventSummaryRow = {
  id: string;
  subject_id: string;
  event_type: DocumentSignatureEventType;
  created_at: string;
};

export type WarrantyDocumentListItem = WarrantyDocument & {
  customer: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  job: { id: string; dispatchStatus: string } | null;
  serviceTicket: { id: string; title: string; status: string } | null;
  template: { id: string; name: string } | null;
};

export type WarrantyDocumentSignatureState = {
  signers: DocumentSigner[];
  events: DocumentSignatureEvent[];
};

export type WarrantyDocumentDeliveryState = {
  events: DocumentDeliveryEvent[];
};

export type WarrantyDocumentContinuityItem = WarrantyDocumentListItem & {
  signatureSummary: WarrantyDocumentSignatureSummary;
};

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

const warrantyDocumentSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  job_id,
  service_ticket_id,
  document_template_id,
  status,
  title,
  warranty_start_date,
  warranty_end_date,
  warranty_basis,
  rendered_content,
  created_by,
  updated_by,
  issued_at,
  voided_at,
  created_at,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    dispatch_status
  ),
  service_tickets (
    id,
    title,
    status
  ),
  document_templates (
    id,
    name
  )
`;

const warrantyDocumentPreviewSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  job_id,
  service_ticket_id,
  document_template_id,
  status,
  title,
  warranty_start_date,
  warranty_end_date,
  warranty_basis,
  created_by,
  updated_by,
  issued_at,
  voided_at,
  created_at,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    dispatch_status
  ),
  service_tickets (
    id,
    title,
    status
  ),
  document_templates (
    id,
    name
  )
`;

const serviceTicketContextSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  job_id,
  title,
  status,
  warranty_start_date,
  warranty_end_date,
  warranty_basis,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    dispatch_status
  )
`;

const documentSignerSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  signer_role,
  signer_name,
  signer_email,
  status,
  signed_at,
  declined_at,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const documentSignatureEventSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  signer_id,
  event_type,
  event_note,
  metadata,
  created_by,
  created_at
`;

const documentDeliveryEventSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  event_type,
  recipient_name,
  recipient_email,
  recipient_role,
  channel,
  provider,
  provider_message_id,
  provider_event_id,
  related_notification_event_id,
  event_note,
  metadata,
  created_by,
  created_at
`;

function isWarrantyDocumentRow(value: unknown): value is WarrantyDocumentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<WarrantyDocumentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isWarrantyDocumentRowArray(
  value: unknown
): value is WarrantyDocumentRow[] {
  return Array.isArray(value) && value.every(isWarrantyDocumentRow);
}

function isServiceTicketContextRow(
  value: unknown
): value is ServiceTicketContextRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ServiceTicketContextRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.title === "string" &&
    typeof row.status === "string"
  );
}

function isDocumentSignerRow(value: unknown): value is DocumentSignerRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DocumentSignerRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    row.subject_type === "warranty_document" &&
    typeof row.subject_id === "string" &&
    typeof row.signer_role === "string" &&
    typeof row.signer_name === "string" &&
    typeof row.signer_email === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isDocumentSignerRowArray(
  value: unknown
): value is DocumentSignerRow[] {
  return Array.isArray(value) && value.every(isDocumentSignerRow);
}

function isDocumentSignatureEventRow(
  value: unknown
): value is DocumentSignatureEventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DocumentSignatureEventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    row.subject_type === "warranty_document" &&
    typeof row.subject_id === "string" &&
    (row.signer_id === null || typeof row.signer_id === "string") &&
    typeof row.event_type === "string" &&
    (row.event_note === null || typeof row.event_note === "string") &&
    typeof row.metadata === "object" &&
    row.metadata !== null &&
    typeof row.created_at === "string"
  );
}

function isDocumentSignatureEventRowArray(
  value: unknown
): value is DocumentSignatureEventRow[] {
  return Array.isArray(value) && value.every(isDocumentSignatureEventRow);
}

function isDocumentDeliveryEventRow(
  value: unknown
): value is DocumentDeliveryEventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DocumentDeliveryEventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    row.subject_type === "warranty_document" &&
    typeof row.subject_id === "string" &&
    typeof row.event_type === "string" &&
    (row.recipient_name === null || typeof row.recipient_name === "string") &&
    (row.recipient_email === null || typeof row.recipient_email === "string") &&
    (row.recipient_role === null || typeof row.recipient_role === "string") &&
    typeof row.channel === "string" &&
    (row.provider === null || typeof row.provider === "string") &&
    (row.provider_message_id === null ||
      typeof row.provider_message_id === "string") &&
    (row.provider_event_id === null ||
      typeof row.provider_event_id === "string") &&
    (row.related_notification_event_id === null ||
      typeof row.related_notification_event_id === "string") &&
    (row.event_note === null || typeof row.event_note === "string") &&
    typeof row.metadata === "object" &&
    row.metadata !== null &&
    typeof row.created_at === "string"
  );
}

function isDocumentDeliveryEventRowArray(
  value: unknown
): value is DocumentDeliveryEventRow[] {
  return Array.isArray(value) && value.every(isDocumentDeliveryEventRow);
}

function isDocumentSignerSummaryRow(
  value: unknown
): value is DocumentSignerSummaryRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DocumentSignerSummaryRow>;

  return (
    typeof row.id === "string" &&
    typeof row.subject_id === "string" &&
    typeof row.status === "string"
  );
}

function isDocumentSignerSummaryRowArray(
  value: unknown
): value is DocumentSignerSummaryRow[] {
  return Array.isArray(value) && value.every(isDocumentSignerSummaryRow);
}

function isDocumentSignatureEventSummaryRow(
  value: unknown
): value is DocumentSignatureEventSummaryRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DocumentSignatureEventSummaryRow>;

  return (
    typeof row.id === "string" &&
    typeof row.subject_id === "string" &&
    typeof row.event_type === "string" &&
    typeof row.created_at === "string"
  );
}

function isDocumentSignatureEventSummaryRowArray(
  value: unknown
): value is DocumentSignatureEventSummaryRow[] {
  return (
    Array.isArray(value) && value.every(isDocumentSignatureEventSummaryRow)
  );
}

function mapWarrantyDocument(row: WarrantyDocumentRow): WarrantyDocument {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    jobId: row.job_id,
    serviceTicketId: row.service_ticket_id,
    documentTemplateId: row.document_template_id,
    status: row.status,
    title: row.title,
    warrantyStartDate: row.warranty_start_date,
    warrantyEndDate: row.warranty_end_date,
    warrantyBasis: row.warranty_basis,
    renderedContent: row.rendered_content ?? null,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    issuedAt: row.issued_at,
    voidedAt: row.voided_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapWarrantyDocumentListItem(
  row: WarrantyDocumentRow
): WarrantyDocumentListItem {
  return {
    ...mapWarrantyDocument(row),
    customer: row.customers
      ? { id: row.customers.id, name: row.customers.name }
      : null,
    project: row.projects
      ? { id: row.projects.id, name: row.projects.name }
      : null,
    job: row.jobs
      ? { id: row.jobs.id, dispatchStatus: row.jobs.dispatch_status }
      : null,
    serviceTicket: row.service_tickets
      ? {
          id: row.service_tickets.id,
          title: row.service_tickets.title,
          status: row.service_tickets.status
        }
      : null,
    template: row.document_templates
      ? { id: row.document_templates.id, name: row.document_templates.name }
      : null
  };
}

function mapDocumentSigner(row: DocumentSignerRow): DocumentSigner {
  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    signerRole: row.signer_role,
    signerName: row.signer_name,
    signerEmail: row.signer_email,
    status: row.status,
    signedAt: row.signed_at,
    declinedAt: row.declined_at,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDocumentSignatureEvent(
  row: DocumentSignatureEventRow
): DocumentSignatureEvent {
  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    signerId: row.signer_id,
    eventType: row.event_type,
    eventNote: row.event_note,
    metadata: row.metadata,
    createdByUserId: row.created_by,
    createdAt: row.created_at
  };
}

function mapDocumentDeliveryEvent(
  row: DocumentDeliveryEventRow
): DocumentDeliveryEvent {
  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    eventType: row.event_type,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    recipientRole: row.recipient_role,
    channel: row.channel,
    provider: row.provider,
    providerMessageId: row.provider_message_id,
    providerEventId: row.provider_event_id,
    relatedNotificationEventId: row.related_notification_event_id,
    eventNote: row.event_note,
    metadata: row.metadata,
    createdByUserId: row.created_by,
    createdAt: row.created_at
  };
}

async function getWarrantyDocumentScope(next = "/warranty-documents") {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    const destination = new URL("/dashboard", "http://floorconnector.local");
    destination.searchParams.set(
      "error",
      "No active organization is available for warranty documents yet."
    );
    redirect(`${destination.pathname}${destination.search}`);
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    role: organizationContext.membership.role,
    organization: {
      displayName: organizationContext.organization.displayName,
      legalName: organizationContext.organization.legalName
    }
  } satisfies WarrantyDocumentScope;
}

async function assertWarrantyDocumentExistsForScope(
  warrantyDocumentId: string,
  scope: WarrantyDocumentScope
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("warranty_documents")
    .select("id, status")
    .eq("company_id", scope.organizationId)
    .eq("id", warrantyDocumentId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load warranty document signature context: ${response.error.message}`
    );
  }

  if (!data || typeof data !== "object" || !("id" in data)) {
    throw new Error("Warranty document was not found for this organization.");
  }
}

async function getWarrantyDocumentSignerRow(input: {
  scope: WarrantyDocumentScope;
  warrantyDocumentId: string;
  signerId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_signers")
    .select(documentSignerSelect)
    .eq("company_id", input.scope.organizationId)
    .eq("subject_type", "warranty_document")
    .eq("subject_id", input.warrantyDocumentId)
    .eq("id", input.signerId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load document signer: ${response.error.message}`
    );
  }

  if (!isDocumentSignerRow(data)) {
    throw new Error("Document signer was not found.");
  }

  return data;
}

async function insertDocumentSignatureEvent(input: {
  scope: WarrantyDocumentScope;
  warrantyDocumentId: string;
  signerId: string | null;
  eventType: DocumentSignatureEventType;
  eventNote?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_signature_events")
    .insert({
      company_id: input.scope.organizationId,
      subject_type: "warranty_document",
      subject_id: input.warrantyDocumentId,
      signer_id: input.signerId,
      event_type: input.eventType,
      event_note: input.eventNote ?? null,
      metadata: input.metadata ?? {},
      created_by: input.scope.userId
    })
    .select(documentSignatureEventSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create signature event: ${response.error.message}`
    );
  }

  if (!isDocumentSignatureEventRow(data)) {
    throw new Error("Unexpected signature event response.");
  }

  return mapDocumentSignatureEvent(data);
}

async function insertWarrantyDocumentDeliveryEvent(input: {
  scope: WarrantyDocumentScope;
  warrantyDocumentId: string;
  eventType: DocumentDeliveryEventType;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientRole?: string | null;
  channel: DocumentDeliveryChannel;
  provider?: string | null;
  providerMessageId?: string | null;
  relatedNotificationEventId?: string | null;
  eventNote?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_delivery_events")
    .insert({
      company_id: input.scope.organizationId,
      subject_type: "warranty_document",
      subject_id: input.warrantyDocumentId,
      event_type: input.eventType,
      recipient_name: input.recipientName ?? null,
      recipient_email: input.recipientEmail ?? null,
      recipient_role: input.recipientRole ?? null,
      channel: input.channel,
      provider: input.provider ?? null,
      provider_message_id: input.providerMessageId ?? null,
      related_notification_event_id: input.relatedNotificationEventId ?? null,
      event_note: input.eventNote ?? null,
      metadata: input.metadata ?? {},
      created_by: input.scope.userId
    })
    .select(documentDeliveryEventSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to record delivery evidence: ${response.error.message}`
    );
  }

  if (!isDocumentDeliveryEventRow(data)) {
    throw new Error("Unexpected delivery event response.");
  }

  return mapDocumentDeliveryEvent(data);
}

function assertCanMutate(scope: WarrantyDocumentScope) {
  if (!mutationRoles.has(scope.role)) {
    throw new Error("Manager, admin, or owner access is required.");
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function buildPortalWarrantyDocumentReviewUrl(input: {
  origin: string;
  warrantyDocumentId: string;
}) {
  return new URL(
    `/portal/warranty-documents/${input.warrantyDocumentId}`,
    input.origin
  ).toString();
}

function getNotificationDeliveryErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown provider error.";
}

async function findPortalUserIdByEmail(email: string) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("users")
    .select("id, email")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  const data = response.data as {
    id?: string | null;
    email?: string | null;
  } | null;

  if (response.error) {
    throw new Error(
      `Unable to validate portal user email: ${response.error.message}`
    );
  }

  return data?.id ?? null;
}

async function assertPortalProjectAccessForSigner(input: {
  organizationId: string;
  customerId: string;
  projectId: string;
  signerEmail: string;
}) {
  const normalizedEmail = normalizeEmail(input.signerEmail);
  const portalUserId = await findPortalUserIdByEmail(normalizedEmail);
  const admin = getSupabaseAdminClient();
  const emailGrantResponse = await admin
    .from("portal_access_grants")
    .select("id, user_id, invited_email")
    .eq("company_id", input.organizationId)
    .eq("customer_id", input.customerId)
    .eq("status", "active")
    .eq("invited_email", normalizedEmail);

  if (emailGrantResponse.error) {
    throw new Error(
      `Unable to validate portal access for warranty email: ${emailGrantResponse.error.message}`
    );
  }

  let userGrantRows: PortalAccessCandidateRow[] = [];

  if (portalUserId) {
    const userGrantResponse = await admin
      .from("portal_access_grants")
      .select("id, user_id, invited_email")
      .eq("company_id", input.organizationId)
      .eq("customer_id", input.customerId)
      .eq("status", "active")
      .eq("user_id", portalUserId);

    if (userGrantResponse.error) {
      throw new Error(
        `Unable to validate portal access for warranty email: ${userGrantResponse.error.message}`
      );
    }

    userGrantRows =
      (userGrantResponse.data as PortalAccessCandidateRow[] | null) ?? [];
  }

  const grantRows = [
    ...new Map(
      [
        ...((emailGrantResponse.data as PortalAccessCandidateRow[] | null) ??
          []),
        ...userGrantRows
      ].map((grant) => [grant.id, grant])
    ).values()
  ];

  if (grantRows.length === 0) {
    throw new Error(
      "The signer does not have active portal access for this customer. Add portal access before sending a warranty review link."
    );
  }

  const accessResponse = await admin
    .from("portal_project_access")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("project_id", input.projectId)
    .eq("status", "active")
    .in(
      "portal_access_grant_id",
      grantRows.map((grant) => grant.id)
    )
    .limit(1)
    .maybeSingle();
  const accessData = accessResponse.data as { id?: string | null } | null;

  if (accessResponse.error) {
    throw new Error(
      `Unable to validate portal project access for warranty email: ${accessResponse.error.message}`
    );
  }

  if (!accessData?.id) {
    throw new Error(
      "The signer does not have active portal access for this warranty document project. Add project visibility before sending a warranty review link."
    );
  }
}

async function createWarrantyDocumentNotificationDelivery(input: {
  organizationId: string;
  notificationEventId: string;
  recipientEmail: string;
  payload: Record<string, unknown>;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .insert({
      company_id: input.organizationId,
      notification_event_id: input.notificationEventId,
      channel: "email",
      provider: "postmark",
      status: "pending",
      recipient_email: input.recipientEmail,
      payload: input.payload
    })
    .select("id, status")
    .single();
  const data = response.data as NotificationDeliveryRow | null;

  if (response.error || !data?.id) {
    throw new Error(
      `Unable to create notification delivery: ${
        response.error?.message ?? "Insert failed."
      }`
    );
  }

  return data.id;
}

async function markWarrantyDocumentNotificationDeliverySent(input: {
  deliveryId: string;
  providerMessageId: string;
  sentAt: string | null;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .update({
      provider_message_id: input.providerMessageId,
      status: "sent",
      sent_at: input.sentAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.deliveryId);

  if (response.error) {
    throw new Error(
      `Unable to mark notification delivery sent: ${response.error.message}`
    );
  }
}

async function markWarrantyDocumentNotificationDeliveryFailed(input: {
  deliveryId: string;
  errorMessage: string;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .update({
      status: "failed",
      error_message: input.errorMessage,
      failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.deliveryId);

  if (response.error) {
    throw new Error(
      `Unable to mark notification delivery failed: ${response.error.message}`
    );
  }
}

function formatLabel(value: string | null | undefined, fallback: string) {
  return value && value.trim().length > 0
    ? value.replaceAll("_", " ")
    : fallback;
}

function buildMergeData(input: {
  scope: WarrantyDocumentScope;
  ticket: ServiceTicketContextRow;
  title: string;
  status: WarrantyDocumentStatus;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
}): WarrantyDocumentMergeData {
  return {
    organization: {
      displayName: input.scope.organization.displayName,
      legalName: input.scope.organization.legalName
    },
    customer: {
      name: input.ticket.customers?.name ?? "Customer"
    },
    project: {
      name: input.ticket.projects?.name ?? "Project not linked"
    },
    job: {
      label: input.ticket.job_id
        ? `Job ${input.ticket.job_id.slice(0, 8)} / ${formatLabel(
            input.ticket.jobs?.dispatch_status,
            "status pending"
          )}`
        : "Job not linked"
    },
    serviceTicket: {
      title: input.ticket.title,
      status: formatLabel(input.ticket.status, "open")
    },
    warranty: {
      documentTitle: input.title,
      status: formatLabel(input.status, "draft"),
      startDate: input.warrantyStartDate ?? "Not set",
      endDate: input.warrantyEndDate ?? "Not set",
      basis: input.warrantyBasis ?? "No warranty basis recorded yet."
    },
    signatures: {
      customerPlaceholder: "Customer signature planned later",
      contractorPlaceholder: "Contractor countersign planned later"
    }
  };
}

async function resolveWarrantyTemplate(input: {
  templateId?: string | null;
  next: string;
}) {
  if (input.templateId) {
    const template = await getDocumentTemplateById(
      input.templateId,
      input.next
    );

    if (!template || template.templateType !== "warranty") {
      throw new Error("Selected warranty template was not found.");
    }

    if (template.status !== "active") {
      throw new Error("Selected warranty template must be active.");
    }

    return template;
  }

  const defaultTemplate = await ensureDefaultDocumentTemplateForType(
    "warranty",
    input.next
  );

  if (!defaultTemplate) {
    throw new Error("No active default warranty template is available yet.");
  }

  return defaultTemplate;
}

export async function listWarrantyDocumentTemplates() {
  const templates = await listDocumentTemplates("warranty");

  return templates.filter((template) => template.status === "active");
}

export async function listWarrantyDocumentsByServiceTicket(
  serviceTicketId: string
) {
  const scope = await getWarrantyDocumentScope(
    `/service-tickets/${serviceTicketId}`
  );
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("warranty_documents")
    .select(warrantyDocumentSelect)
    .eq("company_id", scope.organizationId)
    .eq("service_ticket_id", serviceTicketId)
    .order("created_at", { ascending: false })
    .limit(20);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load warranty documents: ${response.error.message}`
    );
  }

  return isWarrantyDocumentRowArray(data)
    ? data.map(mapWarrantyDocumentListItem)
    : [];
}

async function getWarrantyDocumentSignatureSummaries(input: {
  scope: WarrantyDocumentScope;
  warrantyDocumentIds: string[];
}) {
  if (input.warrantyDocumentIds.length === 0) {
    return new Map<string, WarrantyDocumentSignatureSummary>();
  }

  const supabase = await getSupabaseServerClient();
  const [signersResponse, eventsResponse] = await Promise.all([
    supabase
      .from("document_signers")
      .select("id, subject_id, status")
      .eq("company_id", input.scope.organizationId)
      .eq("subject_type", "warranty_document")
      .in("subject_id", input.warrantyDocumentIds),
    supabase
      .from("document_signature_events")
      .select("id, subject_id, event_type, created_at")
      .eq("company_id", input.scope.organizationId)
      .eq("subject_type", "warranty_document")
      .in("subject_id", input.warrantyDocumentIds)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);
  const signersData: unknown = signersResponse.data;
  const eventsData: unknown = eventsResponse.data;

  if (signersResponse.error) {
    throw new Error(
      `Unable to load warranty signer summaries: ${signersResponse.error.message}`
    );
  }

  if (eventsResponse.error) {
    throw new Error(
      `Unable to load warranty signature event summaries: ${eventsResponse.error.message}`
    );
  }

  return summarizeWarrantyDocumentSignatures(
    input.warrantyDocumentIds,
    isDocumentSignerSummaryRowArray(signersData) ? signersData : [],
    isDocumentSignatureEventSummaryRowArray(eventsData) ? eventsData : []
  );
}

async function listWarrantyDocumentsForContinuity(input: {
  field: "project_id" | "customer_id" | "job_id";
  id: string;
  next: string;
  limit?: number;
}) {
  const scope = await getWarrantyDocumentScope(input.next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("warranty_documents")
    .select(warrantyDocumentPreviewSelect)
    .eq("company_id", scope.organizationId)
    .eq(input.field, input.id)
    .order("updated_at", { ascending: false })
    .limit(input.limit ?? 5);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load linked warranty documents: ${response.error.message}`
    );
  }

  const documents = isWarrantyDocumentRowArray(data)
    ? data.map(mapWarrantyDocumentListItem)
    : [];
  const summaries = await getWarrantyDocumentSignatureSummaries({
    scope,
    warrantyDocumentIds: documents.map((document) => document.id)
  });

  return documents.map((document) => ({
    ...document,
    signatureSummary:
      summaries.get(document.id) ??
      ({
        signerCount: 0,
        requestedSignerCount: 0,
        signedSignerCount: 0,
        latestEventType: null,
        latestEventCreatedAt: null
      } satisfies WarrantyDocumentSignatureSummary)
  }));
}

export async function listWarrantyDocumentsByProject(projectId: string) {
  return listWarrantyDocumentsForContinuity({
    field: "project_id",
    id: projectId,
    next: `/projects/${projectId}`
  });
}

export async function listWarrantyDocumentsByCustomer(customerId: string) {
  return listWarrantyDocumentsForContinuity({
    field: "customer_id",
    id: customerId,
    next: `/customers/${customerId}`
  });
}

export async function listWarrantyDocumentsByJob(jobId: string) {
  return listWarrantyDocumentsForContinuity({
    field: "job_id",
    id: jobId,
    next: `/jobs/${jobId}`
  });
}

export async function getWarrantyDocumentById(
  warrantyDocumentId: string,
  next?: string
) {
  const scope = await getWarrantyDocumentScope(
    next ?? `/warranty-documents/${warrantyDocumentId}`
  );
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("warranty_documents")
    .select(warrantyDocumentSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", warrantyDocumentId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load warranty document: ${response.error.message}`
    );
  }

  return isWarrantyDocumentRow(data) ? mapWarrantyDocumentListItem(data) : null;
}

export async function getWarrantyDocumentSignatureState(
  warrantyDocumentId: string
): Promise<WarrantyDocumentSignatureState> {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${warrantyDocumentId}`
  );
  await assertWarrantyDocumentExistsForScope(warrantyDocumentId, scope);
  const supabase = await getSupabaseServerClient();
  const [signersResponse, eventsResponse] = await Promise.all([
    supabase
      .from("document_signers")
      .select(documentSignerSelect)
      .eq("company_id", scope.organizationId)
      .eq("subject_type", "warranty_document")
      .eq("subject_id", warrantyDocumentId)
      .order("created_at", { ascending: true }),
    supabase
      .from("document_signature_events")
      .select(documentSignatureEventSelect)
      .eq("company_id", scope.organizationId)
      .eq("subject_type", "warranty_document")
      .eq("subject_id", warrantyDocumentId)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);
  const signersData: unknown = signersResponse.data;
  const eventsData: unknown = eventsResponse.data;

  if (signersResponse.error) {
    throw new Error(
      `Unable to load document signers: ${signersResponse.error.message}`
    );
  }

  if (eventsResponse.error) {
    throw new Error(
      `Unable to load signature events: ${eventsResponse.error.message}`
    );
  }

  return {
    signers: isDocumentSignerRowArray(signersData)
      ? signersData.map(mapDocumentSigner)
      : [],
    events: isDocumentSignatureEventRowArray(eventsData)
      ? eventsData.map(mapDocumentSignatureEvent)
      : []
  };
}

export async function getWarrantyDocumentDeliveryState(
  warrantyDocumentId: string
): Promise<WarrantyDocumentDeliveryState> {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${warrantyDocumentId}`
  );
  await assertWarrantyDocumentExistsForScope(warrantyDocumentId, scope);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_delivery_events")
    .select(documentDeliveryEventSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", "warranty_document")
    .eq("subject_id", warrantyDocumentId)
    .order("created_at", { ascending: false })
    .limit(20);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load delivery events: ${response.error.message}`
    );
  }

  return {
    events: isDocumentDeliveryEventRowArray(data)
      ? data.map(mapDocumentDeliveryEvent)
      : []
  };
}

export async function appendWarrantyDocumentDeliveryEvent(
  input: WarrantyDocumentDeliveryEventInput
) {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  await assertWarrantyDocumentExistsForScope(input.warrantyDocumentId, scope);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_delivery_events")
    .insert({
      company_id: scope.organizationId,
      subject_type: "warranty_document",
      subject_id: input.warrantyDocumentId,
      event_type: input.eventType,
      recipient_name: input.recipientName,
      recipient_email: input.recipientEmail,
      recipient_role: input.recipientRole,
      channel: input.channel,
      event_note: input.eventNote,
      metadata: {
        source: "contractor_app_manual",
        evidenceOnly: true,
        providerSend: false
      },
      created_by: scope.userId
    })
    .select(documentDeliveryEventSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to record delivery evidence: ${response.error.message}`
    );
  }

  if (!isDocumentDeliveryEventRow(data)) {
    throw new Error("Unexpected delivery event response.");
  }

  return mapDocumentDeliveryEvent(data);
}

export async function sendWarrantyDocumentReviewEmail(
  input: WarrantyDocumentEmailSendInput & { origin: string }
) {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  const current = await getWarrantyDocumentById(
    input.warrantyDocumentId,
    `/warranty-documents/${input.warrantyDocumentId}`
  );

  if (!current) {
    throw new Error("Warranty document was not found.");
  }

  if (!current.projectId) {
    throw new Error(
      "Warranty document must be linked to a project before a portal review link can be sent."
    );
  }

  if (current.status === "draft" || current.status === "void") {
    throw new Error(
      "Only issued customer-visible warranty documents can be sent."
    );
  }

  const signer = await getWarrantyDocumentSignerRow({
    scope,
    warrantyDocumentId: input.warrantyDocumentId,
    signerId: input.signerId
  });

  if (
    !isWarrantyDocumentEmailSignerEligible({
      signerRole: signer.signer_role,
      signerStatus: signer.status,
      signerEmail: signer.signer_email
    })
  ) {
    throw new Error(
      "Warranty review email can only be sent to a requested customer signer with a valid email."
    );
  }

  const signerEmail = normalizeEmail(signer.signer_email);
  await assertPortalProjectAccessForSigner({
    organizationId: scope.organizationId,
    customerId: current.customerId,
    projectId: current.projectId,
    signerEmail
  });

  const reviewUrl = buildPortalWarrantyDocumentReviewUrl({
    origin: input.origin,
    warrantyDocumentId: current.id
  });
  const emailContent = buildWarrantyDocumentReviewEmailContent({
    recipientName: signer.signer_name,
    organizationName: scope.organization.displayName,
    warrantyTitle: current.title,
    customerName: current.customer?.name ?? null,
    projectName: current.project?.name ?? null,
    reviewUrl
  });
  const notificationPayload = {
    subjectType: "warranty_document",
    subjectId: current.id,
    warrantyDocumentId: current.id,
    signerId: signer.id,
    customerId: current.customerId,
    projectId: current.projectId,
    purpose: "warranty_document_review_email"
  };
  const notificationEvent = await createNotificationEvent({
    organizationId: scope.organizationId,
    category: "communication",
    severity: "neutral",
    eventType: "warranty_document.email_requested",
    subjectType: "project",
    subjectId: current.projectId,
    customerId: current.customerId,
    projectId: current.projectId,
    actorType: "organization_user",
    actorUserId: scope.userId,
    title: "Warranty document email requested",
    message: `Warranty document review email requested for ${current.title}.`,
    linkPath: `/warranty-documents/${current.id}`,
    groupKey: `warranty_document:${current.id}`,
    payload: notificationPayload,
    markReadUserIds: [scope.userId]
  });
  const deliveryId = await createWarrantyDocumentNotificationDelivery({
    organizationId: scope.organizationId,
    notificationEventId: notificationEvent.id,
    recipientEmail: signerEmail,
    payload: notificationPayload
  });

  await insertWarrantyDocumentDeliveryEvent({
    scope,
    warrantyDocumentId: current.id,
    eventType: "send_requested",
    recipientName: signer.signer_name,
    recipientEmail: signerEmail,
    recipientRole: signer.signer_role,
    channel: "email",
    provider: "postmark",
    relatedNotificationEventId: notificationEvent.id,
    eventNote:
      "Provider-backed warranty document review/sign email was requested.",
    metadata: {
      source: "contractor_app_provider_send",
      evidenceOnly: true,
      providerSend: true,
      notificationDeliveryId: deliveryId,
      signatureMutation: false,
      documentStatusMutation: false
    }
  });

  const lockState = await getOrganizationProductionActionLockState(
    scope.organizationId
  );

  if (lockState.isLocked) {
    const errorMessage = "Provider-backed email is locked during early access.";

    await markWarrantyDocumentNotificationDeliveryFailed({
      deliveryId,
      errorMessage
    });
    await insertWarrantyDocumentDeliveryEvent({
      scope,
      warrantyDocumentId: current.id,
      eventType: "failed",
      recipientName: signer.signer_name,
      recipientEmail: signerEmail,
      recipientRole: signer.signer_role,
      channel: "email",
      provider: "postmark",
      relatedNotificationEventId: notificationEvent.id,
      eventNote: errorMessage,
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: false,
        notificationDeliveryId: deliveryId,
        failureReason: "activation_locked"
      }
    });

    return {
      status: "not_sent" as const,
      message:
        "Email was not sent because provider-backed sends are locked during early access."
    };
  }

  if (!isPostmarkEmailConfigured()) {
    const errorMessage =
      "Postmark email delivery is not configured for this environment.";

    await markWarrantyDocumentNotificationDeliveryFailed({
      deliveryId,
      errorMessage
    });
    await insertWarrantyDocumentDeliveryEvent({
      scope,
      warrantyDocumentId: current.id,
      eventType: "failed",
      recipientName: signer.signer_name,
      recipientEmail: signerEmail,
      recipientRole: signer.signer_role,
      channel: "email",
      provider: "postmark",
      relatedNotificationEventId: notificationEvent.id,
      eventNote: errorMessage,
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: false,
        notificationDeliveryId: deliveryId,
        failureReason: "not_configured"
      }
    });

    return {
      status: "not_sent" as const,
      message:
        "Email was not sent because Postmark email delivery is not configured."
    };
  }

  try {
    const result = await sendPostmarkEmail({
      toEmail: signerEmail,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
      textBody: emailContent.textBody
    });

    await markWarrantyDocumentNotificationDeliverySent({
      deliveryId,
      providerMessageId: result.messageId,
      sentAt: result.submittedAt
    });
    await insertWarrantyDocumentDeliveryEvent({
      scope,
      warrantyDocumentId: current.id,
      eventType: "sent",
      recipientName: signer.signer_name,
      recipientEmail: signerEmail,
      recipientRole: signer.signer_role,
      channel: "email",
      provider: "postmark",
      providerMessageId: result.messageId,
      relatedNotificationEventId: notificationEvent.id,
      eventNote: "Postmark accepted the warranty document review/sign email.",
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: true,
        notificationDeliveryId: deliveryId,
        submittedAt: result.submittedAt,
        to: result.to
      }
    });

    return {
      status: "sent" as const,
      message: `Warranty review/sign email sent to ${signerEmail}.`
    };
  } catch (error) {
    const errorMessage = getNotificationDeliveryErrorMessage(error);

    await markWarrantyDocumentNotificationDeliveryFailed({
      deliveryId,
      errorMessage
    });
    await insertWarrantyDocumentDeliveryEvent({
      scope,
      warrantyDocumentId: current.id,
      eventType: "failed",
      recipientName: signer.signer_name,
      recipientEmail: signerEmail,
      recipientRole: signer.signer_role,
      channel: "email",
      provider: "postmark",
      relatedNotificationEventId: notificationEvent.id,
      eventNote: errorMessage,
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: true,
        notificationDeliveryId: deliveryId,
        failureReason: "provider_failed"
      }
    });

    return {
      status: "failed" as const,
      message:
        "The provider email send failed. Failed delivery evidence was recorded."
    };
  }
}

export async function addWarrantyDocumentSigner(
  input: WarrantyDocumentSignerInput
) {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  await assertWarrantyDocumentExistsForScope(input.warrantyDocumentId, scope);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_signers")
    .insert({
      company_id: scope.organizationId,
      subject_type: "warranty_document",
      subject_id: input.warrantyDocumentId,
      signer_role: input.signerRole,
      signer_name: input.signerName,
      signer_email: input.signerEmail,
      status: "pending",
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(documentSignerSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to add document signer: ${response.error.message}`);
  }

  if (!isDocumentSignerRow(data)) {
    throw new Error("Unexpected document signer response after create.");
  }

  return mapDocumentSigner(data);
}

export async function updateWarrantyDocumentSigner(
  input: WarrantyDocumentSignerInput
) {
  if (!input.signerId) {
    throw new Error("Signer id is required.");
  }

  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  await assertWarrantyDocumentExistsForScope(input.warrantyDocumentId, scope);
  const signer = await getWarrantyDocumentSignerRow({
    scope,
    warrantyDocumentId: input.warrantyDocumentId,
    signerId: input.signerId
  });

  if (signer.status === "signed") {
    throw new Error("Signed warranty document signers cannot be edited.");
  }

  if (signer.status === "voided") {
    throw new Error("Voided warranty document signers cannot be edited.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_signers")
    .update({
      signer_role: input.signerRole,
      signer_name: input.signerName,
      signer_email: input.signerEmail,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("subject_type", "warranty_document")
    .eq("subject_id", input.warrantyDocumentId)
    .eq("id", input.signerId)
    .select(documentSignerSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update document signer: ${response.error.message}`
    );
  }

  if (!isDocumentSignerRow(data)) {
    throw new Error("Unexpected document signer response after update.");
  }

  return mapDocumentSigner(data);
}

export async function voidWarrantyDocumentSigner(
  input: WarrantyDocumentSignerActionInput
) {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  await assertWarrantyDocumentExistsForScope(input.warrantyDocumentId, scope);
  const signer = await getWarrantyDocumentSignerRow({
    scope,
    warrantyDocumentId: input.warrantyDocumentId,
    signerId: input.signerId
  });

  if (!canTransitionDocumentSignerStatus(signer.status, "voided")) {
    throw new Error(
      `Signer status cannot move from ${signer.status} to voided.`
    );
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_signers")
    .update({
      status: "voided",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("subject_type", "warranty_document")
    .eq("subject_id", input.warrantyDocumentId)
    .eq("id", input.signerId)
    .select(documentSignerSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to void document signer: ${response.error.message}`
    );
  }

  if (!isDocumentSignerRow(data)) {
    throw new Error("Unexpected document signer response after void.");
  }

  await insertDocumentSignatureEvent({
    scope,
    warrantyDocumentId: input.warrantyDocumentId,
    signerId: input.signerId,
    eventType: "voided",
    eventNote: "Signer routing was voided internally before customer signing.",
    metadata: {
      previousStatus: signer.status,
      signerRole: signer.signer_role
    }
  });

  return mapDocumentSigner(data);
}

export async function requestWarrantyDocumentSignature(
  input: WarrantyDocumentSignerActionInput
) {
  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  await assertWarrantyDocumentExistsForScope(input.warrantyDocumentId, scope);
  const signer = await getWarrantyDocumentSignerRow({
    scope,
    warrantyDocumentId: input.warrantyDocumentId,
    signerId: input.signerId
  });

  if (
    signer.status !== "requested" &&
    !canTransitionDocumentSignerStatus(signer.status, "requested")
  ) {
    throw new Error(
      `Signer status cannot move from ${signer.status} to requested.`
    );
  }

  const supabase = await getSupabaseServerClient();

  if (signer.status !== "requested") {
    const updateResponse = await supabase
      .from("document_signers")
      .update({
        status: "requested",
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("subject_type", "warranty_document")
      .eq("subject_id", input.warrantyDocumentId)
      .eq("id", input.signerId);

    if (updateResponse.error) {
      throw new Error(
        `Unable to mark document signer requested: ${updateResponse.error.message}`
      );
    }
  }

  return insertDocumentSignatureEvent({
    scope,
    warrantyDocumentId: input.warrantyDocumentId,
    signerId: input.signerId,
    eventType: "signature_requested",
    eventNote:
      "Internal request-signature audit event only. No customer email or portal signing link was sent.",
    metadata: {
      previousStatus: signer.status,
      signerRole: signer.signer_role,
      deliveryMode: "internal_audit_only"
    }
  });
}

export async function createWarrantyDocumentFromServiceTicket(
  input: CreateWarrantyDocumentFromServiceTicketInput
) {
  const scope = await getWarrantyDocumentScope(
    `/service-tickets/${input.serviceTicketId}`
  );
  assertCanMutate(scope);
  const supabase = await getSupabaseServerClient();
  const ticketResponse = await supabase
    .from("service_tickets")
    .select(serviceTicketContextSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", input.serviceTicketId)
    .maybeSingle();
  const ticketData: unknown = ticketResponse.data;

  if (ticketResponse.error) {
    throw new Error(
      `Unable to load service ticket context: ${ticketResponse.error.message}`
    );
  }

  if (!isServiceTicketContextRow(ticketData)) {
    throw new Error("Service ticket was not found for this organization.");
  }

  const template = await resolveWarrantyTemplate({
    templateId: input.documentTemplateId,
    next: `/service-tickets/${input.serviceTicketId}`
  });
  const title = `Warranty - ${ticketData.projects?.name ?? ticketData.title}`;
  const renderedContent = renderWarrantyTemplateHtml(
    template,
    buildMergeData({
      scope,
      ticket: ticketData,
      title,
      status: "draft",
      warrantyStartDate: ticketData.warranty_start_date,
      warrantyEndDate: ticketData.warranty_end_date,
      warrantyBasis: ticketData.warranty_basis
    })
  );
  const response = await supabase
    .from("warranty_documents")
    .insert({
      company_id: scope.organizationId,
      customer_id: ticketData.customer_id,
      project_id: ticketData.project_id,
      job_id: ticketData.job_id,
      service_ticket_id: ticketData.id,
      document_template_id: template.id,
      status: "draft",
      title,
      warranty_start_date: ticketData.warranty_start_date,
      warranty_end_date: ticketData.warranty_end_date,
      warranty_basis: ticketData.warranty_basis,
      rendered_content: renderedContent,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(warrantyDocumentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create warranty document: ${response.error.message}`
    );
  }

  if (!isWarrantyDocumentRow(data)) {
    throw new Error("Unexpected warranty document response after create.");
  }

  return mapWarrantyDocumentListItem(data);
}

export async function updateWarrantyDocumentDraft(
  input: WarrantyDocumentDraftInput
) {
  const current = await getWarrantyDocumentById(
    input.warrantyDocumentId,
    `/warranty-documents/${input.warrantyDocumentId}`
  );

  if (!current) {
    throw new Error("Warranty document was not found.");
  }

  if (current.status !== "draft") {
    throw new Error("Only draft warranty documents can be edited.");
  }

  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  const template: DocumentTemplate | null = current.documentTemplateId
    ? await getDocumentTemplateById(
        current.documentTemplateId,
        `/warranty-documents/${input.warrantyDocumentId}`
      )
    : null;

  if (!template || template.templateType !== "warranty") {
    throw new Error("Warranty template was not found.");
  }

  const supabase = await getSupabaseServerClient();
  const ticketResponse = await supabase
    .from("service_tickets")
    .select(serviceTicketContextSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", current.serviceTicketId ?? "")
    .maybeSingle();
  const ticketData: unknown = ticketResponse.data;

  if (ticketResponse.error) {
    throw new Error(
      `Unable to load service ticket context: ${ticketResponse.error.message}`
    );
  }

  if (!isServiceTicketContextRow(ticketData)) {
    throw new Error("Warranty document service ticket context is missing.");
  }

  const renderedContent = renderWarrantyTemplateHtml(
    template,
    buildMergeData({
      scope,
      ticket: ticketData,
      title: input.title,
      status: current.status,
      warrantyStartDate: input.warrantyStartDate,
      warrantyEndDate: input.warrantyEndDate,
      warrantyBasis: input.warrantyBasis
    })
  );
  const response = await supabase
    .from("warranty_documents")
    .update({
      title: input.title,
      warranty_start_date: input.warrantyStartDate,
      warranty_end_date: input.warrantyEndDate,
      warranty_basis: input.warrantyBasis,
      rendered_content: renderedContent,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.warrantyDocumentId)
    .select(warrantyDocumentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update warranty document: ${response.error.message}`
    );
  }

  if (!isWarrantyDocumentRow(data)) {
    throw new Error("Unexpected warranty document response after update.");
  }

  return mapWarrantyDocumentListItem(data);
}

export async function updateWarrantyDocumentStatus(
  input: WarrantyDocumentStatusInput
) {
  const current = await getWarrantyDocumentById(
    input.warrantyDocumentId,
    `/warranty-documents/${input.warrantyDocumentId}`
  );

  if (!current) {
    throw new Error("Warranty document was not found.");
  }

  if (input.status === "issued" && current.status !== "draft") {
    throw new Error("Only draft warranty documents can be issued.");
  }

  if (input.status === "void" && current.status === "void") {
    throw new Error("Warranty document is already void.");
  }

  const scope = await getWarrantyDocumentScope(
    `/warranty-documents/${input.warrantyDocumentId}`
  );
  assertCanMutate(scope);
  const now = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  let renderedContent = current.renderedContent;

  if (current.serviceTicketId && current.documentTemplateId) {
    const [template, ticketResponse] = await Promise.all([
      getDocumentTemplateById(
        current.documentTemplateId,
        `/warranty-documents/${input.warrantyDocumentId}`
      ),
      supabase
        .from("service_tickets")
        .select(serviceTicketContextSelect)
        .eq("company_id", scope.organizationId)
        .eq("id", current.serviceTicketId)
        .maybeSingle()
    ]);
    const ticketData: unknown = ticketResponse.data;

    if (ticketResponse.error) {
      throw new Error(
        `Unable to load service ticket context: ${ticketResponse.error.message}`
      );
    }

    if (template && isServiceTicketContextRow(ticketData)) {
      renderedContent = renderWarrantyTemplateHtml(
        template,
        buildMergeData({
          scope,
          ticket: ticketData,
          title: current.title,
          status: input.status,
          warrantyStartDate: current.warrantyStartDate,
          warrantyEndDate: current.warrantyEndDate,
          warrantyBasis: current.warrantyBasis
        })
      );
    }
  }

  const response = await supabase
    .from("warranty_documents")
    .update({
      status: input.status,
      rendered_content: renderedContent,
      issued_at: input.status === "issued" ? now : null,
      voided_at: input.status === "void" ? now : null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.warrantyDocumentId)
    .select(warrantyDocumentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update warranty document status: ${response.error.message}`
    );
  }

  if (!isWarrantyDocumentRow(data)) {
    throw new Error(
      "Unexpected warranty document response after status update."
    );
  }

  return mapWarrantyDocumentListItem(data);
}
