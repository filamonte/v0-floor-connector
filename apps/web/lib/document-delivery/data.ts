import "server-only";

import { redirect } from "next/navigation";
import type {
  DocumentDeliveryChannel,
  DocumentDeliveryEvent,
  DocumentDeliveryEventType,
  DocumentDeliverySubjectType,
  MembershipRole
} from "@floorconnector/types";

import type { DocumentDeliveryEventInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DocumentDeliveryScope = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
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

export type DocumentDeliveryState = {
  events: DocumentDeliveryEvent[];
};

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

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

function getSubjectPath(
  subjectType: DocumentDeliverySubjectType,
  subjectId: string
) {
  switch (subjectType) {
    case "estimate":
      return `/estimates/${subjectId}`;
    case "invoice":
      return `/invoices/${subjectId}`;
    case "contract":
      return `/contracts/${subjectId}`;
    case "warranty_document":
      return `/warranty-documents/${subjectId}`;
    default:
      return "/dashboard";
  }
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
    typeof row.subject_type === "string" &&
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

async function getDocumentDeliveryScope(next: string) {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    const destination = new URL("/dashboard", "http://floorconnector.local");
    destination.searchParams.set(
      "error",
      "No active organization is available for document delivery evidence yet."
    );
    redirect(`${destination.pathname}${destination.search}`);
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    role: organizationContext.membership.role
  } satisfies DocumentDeliveryScope;
}

function assertCanMutateDeliveryEvidence(scope: DocumentDeliveryScope) {
  if (!mutationRoles.has(scope.role)) {
    throw new Error("Manager, admin, or owner access is required.");
  }
}

async function assertDocumentDeliverySubjectExists(input: {
  scope: DocumentDeliveryScope;
  subjectType: DocumentDeliverySubjectType;
  subjectId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const baseError = "Document delivery subject was not found.";
  let response;

  if (input.subjectType === "estimate") {
    response = await supabase
      .from("estimates")
      .select("id")
      .eq("company_id", input.scope.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
  } else if (input.subjectType === "invoice") {
    response = await supabase
      .from("invoices")
      .select("id")
      .eq("company_id", input.scope.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
  } else if (input.subjectType === "contract") {
    response = await supabase
      .from("contracts")
      .select("id")
      .eq("company_id", input.scope.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
  } else {
    response = await supabase
      .from("warranty_documents")
      .select("id")
      .eq("company_id", input.scope.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
  }

  if (response.error) {
    throw new Error(
      `Unable to load document delivery subject: ${response.error.message}`
    );
  }

  const data: unknown = response.data;

  if (!data || typeof data !== "object" || !("id" in data)) {
    throw new Error(baseError);
  }
}

export async function getDocumentDeliveryState(input: {
  subjectType: DocumentDeliverySubjectType;
  subjectId: string;
}): Promise<DocumentDeliveryState> {
  const next = getSubjectPath(input.subjectType, input.subjectId);
  const scope = await getDocumentDeliveryScope(next);
  await assertDocumentDeliverySubjectExists({ scope, ...input });
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_delivery_events")
    .select(documentDeliveryEventSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
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

export async function appendDocumentDeliveryEvent(
  input: DocumentDeliveryEventInput
) {
  const next = getSubjectPath(input.subjectType, input.subjectId);
  const scope = await getDocumentDeliveryScope(next);
  assertCanMutateDeliveryEvidence(scope);
  await assertDocumentDeliverySubjectExists({ scope, ...input });
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_delivery_events")
    .insert({
      company_id: scope.organizationId,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
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
