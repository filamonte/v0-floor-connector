import "server-only";

import type {
  CommunicationChannelKind,
  CommunicationMessageDeliveryStatus,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  CommunicationMessageSourceKind,
  CommunicationMessageVisibility,
  CommunicationThreadCategory,
  CommunicationThreadStatus,
  CanonicalRecordSubjectType,
  ContractSignatureActorType,
  ContractSignatureEventType,
  DocumentDeliveryChannel,
  DocumentDeliveryEventType,
  DocumentDeliverySubjectType,
  PaymentEventActorType,
  PaymentEventType
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type MessageCenterCommunicationThread = {
  id: string;
  organizationId: string;
  opportunityId: string | null;
  appointmentId: string | null;
  customerId: string | null;
  projectId: string | null;
  subjectType: CanonicalRecordSubjectType;
  subjectId: string;
  threadCategory: CommunicationThreadCategory;
  channelKind: CommunicationChannelKind;
  threadStatus: CommunicationThreadStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageVisibility: CommunicationMessageVisibility;
  createdAt: string;
  updatedAt: string;
};

export type MessageCenterCommunicationMessage = {
  id: string;
  organizationId: string;
  threadId: string;
  customerId: string | null;
  projectId: string | null;
  senderType: "organization_user" | "portal_user" | "system";
  direction: CommunicationMessageDirection;
  sourceKind: CommunicationMessageSourceKind;
  channelKind: CommunicationChannelKind;
  messageKind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  deliveryStatus: CommunicationMessageDeliveryStatus;
  body: string;
  occurredAt: string;
  createdAt: string;
};

export type MessageCenterDeliveryEvent = {
  id: string;
  organizationId: string;
  subjectType: DocumentDeliverySubjectType;
  subjectId: string;
  eventType: DocumentDeliveryEventType;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  channel: DocumentDeliveryChannel;
  provider: string | null;
  eventNote: string | null;
  createdAt: string;
};

export type MessageCenterSignatureEvent = {
  id: string;
  organizationId: string;
  contractId: string;
  eventType: ContractSignatureEventType;
  actorType: ContractSignatureActorType;
  providerEventId: string | null;
  occurredAt: string;
  createdAt: string;
};

export type MessageCenterPaymentEvent = {
  id: string;
  organizationId: string;
  invoiceId: string;
  paymentId: string | null;
  eventType: PaymentEventType;
  actorType: PaymentEventActorType;
  gatewayProvider: string | null;
  providerEventId: string | null;
  occurredAt: string;
  createdAt: string;
};

export type ProjectMessageCenterTrail = {
  threads: MessageCenterCommunicationThread[];
  messages: MessageCenterCommunicationMessage[];
  deliveryEvents: MessageCenterDeliveryEvent[];
  signatureEvents: MessageCenterSignatureEvent[];
  paymentEvents: MessageCenterPaymentEvent[];
};

type CommunicationThreadRow = {
  id: string;
  company_id: string;
  opportunity_id: string | null;
  appointment_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  subject_type: CanonicalRecordSubjectType;
  subject_id: string;
  thread_category: CommunicationThreadCategory;
  channel_kind: CommunicationChannelKind;
  thread_status: CommunicationThreadStatus;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_visibility: CommunicationMessageVisibility;
  created_at: string;
  updated_at: string;
};

type CommunicationMessageRow = {
  id: string;
  company_id: string;
  thread_id: string;
  customer_id: string | null;
  project_id: string | null;
  sender_type: "organization_user" | "portal_user" | "system";
  direction: CommunicationMessageDirection;
  source_kind: CommunicationMessageSourceKind;
  channel_kind: CommunicationChannelKind;
  message_kind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  delivery_status: CommunicationMessageDeliveryStatus;
  body: string;
  occurred_at: string;
  created_at: string;
};

type DeliveryEventRow = {
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
  event_note: string | null;
  created_at: string;
};

type SignatureEventRow = {
  id: string;
  company_id: string;
  contract_id: string;
  event_type: ContractSignatureEventType;
  actor_type: ContractSignatureActorType;
  provider_event_id: string | null;
  occurred_at: string;
  created_at: string;
};

type PaymentEventRow = {
  id: string;
  company_id: string;
  invoice_id: string;
  payment_id: string | null;
  event_type: PaymentEventType;
  actor_type: PaymentEventActorType;
  gateway_provider: string | null;
  provider_event_id: string | null;
  occurred_at: string;
  created_at: string;
};

const communicationThreadSelect = `
  id,
  company_id,
  opportunity_id,
  appointment_id,
  customer_id,
  project_id,
  subject_type,
  subject_id,
  thread_category,
  channel_kind,
  thread_status,
  last_message_at,
  last_message_preview,
  last_message_visibility,
  created_at,
  updated_at
`;

const communicationMessageSelect = `
  id,
  company_id,
  thread_id,
  customer_id,
  project_id,
  sender_type,
  direction,
  source_kind,
  channel_kind,
  message_kind,
  visibility,
  delivery_status,
  body,
  occurred_at,
  created_at
`;

const deliveryEventSelect = `
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
  event_note,
  created_at
`;

const signatureEventSelect = `
  id,
  company_id,
  contract_id,
  event_type,
  actor_type,
  provider_event_id,
  occurred_at,
  created_at
`;

const paymentEventSelect = `
  id,
  company_id,
  invoice_id,
  payment_id,
  event_type,
  actor_type,
  gateway_provider,
  provider_event_id,
  occurred_at,
  created_at
`;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function mapThread(
  row: CommunicationThreadRow
): MessageCenterCommunicationThread {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    appointmentId: row.appointment_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    threadCategory: row.thread_category,
    channelKind: row.channel_kind,
    threadStatus: row.thread_status,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    lastMessageVisibility: row.last_message_visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapMessage(
  row: CommunicationMessageRow
): MessageCenterCommunicationMessage {
  return {
    id: row.id,
    organizationId: row.company_id,
    threadId: row.thread_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    senderType: row.sender_type,
    direction: row.direction,
    sourceKind: row.source_kind,
    channelKind: row.channel_kind,
    messageKind: row.message_kind,
    visibility: row.visibility,
    deliveryStatus: row.delivery_status,
    body: row.body,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapDeliveryEvent(row: DeliveryEventRow): MessageCenterDeliveryEvent {
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
    eventNote: row.event_note,
    createdAt: row.created_at
  };
}

function mapSignatureEvent(
  row: SignatureEventRow
): MessageCenterSignatureEvent {
  return {
    id: row.id,
    organizationId: row.company_id,
    contractId: row.contract_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    providerEventId: row.provider_event_id,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapPaymentEvent(row: PaymentEventRow): MessageCenterPaymentEvent {
  return {
    id: row.id,
    organizationId: row.company_id,
    invoiceId: row.invoice_id,
    paymentId: row.payment_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    gatewayProvider: row.gateway_provider,
    providerEventId: row.provider_event_id,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

export async function getProjectMessageCenterTrail(input: {
  projectId: string;
  organizationId: string;
  estimateIds: string[];
  contractIds: string[];
  invoiceIds: string[];
}): Promise<ProjectMessageCenterTrail> {
  const user = await requireAuthenticatedUser(`/projects/${input.projectId}`);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return {
      threads: [],
      messages: [],
      deliveryEvents: [],
      signatureEvents: [],
      paymentEvents: []
    };
  }

  if (organizationContext.organization.id !== input.organizationId) {
    throw new Error(
      "Project communication history is not available in this company context."
    );
  }

  const supabase = await getSupabaseServerClient();
  const subjectIds = unique([
    input.projectId,
    ...input.estimateIds,
    ...input.contractIds,
    ...input.invoiceIds
  ]);

  const [projectThreadsResponse, subjectThreadsResponse] = await Promise.all([
    supabase
      .from("communication_threads")
      .select(communicationThreadSelect)
      .eq("company_id", input.organizationId)
      .eq("project_id", input.projectId)
      .order("updated_at", { ascending: false }),
    subjectIds.length > 0
      ? supabase
          .from("communication_threads")
          .select(communicationThreadSelect)
          .eq("company_id", input.organizationId)
          .in("subject_id", subjectIds)
          .order("updated_at", { ascending: false })
      : Promise.resolve({ data: [], error: null })
  ]);

  if (projectThreadsResponse.error) {
    throw new Error(
      `Unable to load project communication threads: ${projectThreadsResponse.error.message}`
    );
  }

  if (subjectThreadsResponse.error) {
    throw new Error(
      `Unable to load related communication threads: ${subjectThreadsResponse.error.message}`
    );
  }

  const relatedSubjects = new Set([
    `project:${input.projectId}`,
    ...input.estimateIds.map((id) => `estimate:${id}`),
    ...input.contractIds.map((id) => `contract:${id}`),
    ...input.invoiceIds.map((id) => `invoice:${id}`)
  ]);
  const threadRowsById = new Map<string, CommunicationThreadRow>();

  for (const row of (projectThreadsResponse.data as
    | CommunicationThreadRow[]
    | null) ?? []) {
    threadRowsById.set(row.id, row);
  }

  for (const row of (subjectThreadsResponse.data as
    | CommunicationThreadRow[]
    | null) ?? []) {
    if (relatedSubjects.has(`${row.subject_type}:${row.subject_id}`)) {
      threadRowsById.set(row.id, row);
    }
  }

  const threadRows = [...threadRowsById.values()].sort((left, right) =>
    right.updated_at.localeCompare(left.updated_at)
  );
  const threadIds = threadRows.map((row) => row.id);
  const [
    messagesResponse,
    deliveryResponse,
    signatureResponse,
    paymentResponse
  ] = await Promise.all([
    threadIds.length > 0
      ? supabase
          .from("communication_messages")
          .select(communicationMessageSelect)
          .eq("company_id", input.organizationId)
          .in("thread_id", threadIds)
          .order("occurred_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    subjectIds.length > 0
      ? supabase
          .from("document_delivery_events")
          .select(deliveryEventSelect)
          .eq("company_id", input.organizationId)
          .in("subject_id", subjectIds)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    input.contractIds.length > 0
      ? supabase
          .from("contract_signature_events")
          .select(signatureEventSelect)
          .eq("company_id", input.organizationId)
          .in("contract_id", unique(input.contractIds))
          .order("occurred_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    input.invoiceIds.length > 0
      ? supabase
          .from("payment_events")
          .select(paymentEventSelect)
          .eq("company_id", input.organizationId)
          .in("invoice_id", unique(input.invoiceIds))
          .order("occurred_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (messagesResponse.error) {
    throw new Error(
      `Unable to load communication messages: ${messagesResponse.error.message}`
    );
  }

  if (deliveryResponse.error) {
    throw new Error(
      `Unable to load Send Trail activity: ${deliveryResponse.error.message}`
    );
  }

  if (signatureResponse.error) {
    throw new Error(
      `Unable to load Signature Trail activity: ${signatureResponse.error.message}`
    );
  }

  if (paymentResponse.error) {
    throw new Error(
      `Unable to load Payment Trail activity: ${paymentResponse.error.message}`
    );
  }

  const deliveryEvents = (
    (deliveryResponse.data as DeliveryEventRow[] | null) ?? []
  )
    .filter((row) =>
      relatedSubjects.has(`${row.subject_type}:${row.subject_id}`)
    )
    .map(mapDeliveryEvent);

  return {
    threads: threadRows.map(mapThread),
    messages: (
      (messagesResponse.data as CommunicationMessageRow[] | null) ?? []
    ).map(mapMessage),
    deliveryEvents,
    signatureEvents: (
      (signatureResponse.data as SignatureEventRow[] | null) ?? []
    ).map(mapSignatureEvent),
    paymentEvents: (
      (paymentResponse.data as PaymentEventRow[] | null) ?? []
    ).map(mapPaymentEvent)
  };
}
