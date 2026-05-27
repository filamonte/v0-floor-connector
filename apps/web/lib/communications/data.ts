import "server-only";

import type {
  CommunicationMessageDeliveryStatus,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  CommunicationMessageSourceKind,
  CommunicationMessageVisibility,
  CommunicationChannelKind,
  CommunicationThreadCategory,
  CommunicationThreadStatus,
  CommunicationMessage,
  CommunicationThread
} from "@floorconnector/types";
import { getOpportunityById } from "@/lib/opportunities/data";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  assertPortalUserCanPostCommunication,
  createNotificationEvent
} from "@/lib/notifications/system";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getCustomerById } from "@/lib/customers/data";
import { getProjectById } from "@/lib/projects/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { deriveCommunicationWriteFields } from "./write-policy";

type CommunicationThreadRow = {
  id: string;
  company_id: string;
  opportunity_id: string | null;
  appointment_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  subject_type: CommunicationThread["subjectType"];
  subject_id: string;
  created_by_user_id: string | null;
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
  opportunity_id: string | null;
  appointment_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  sender_type: "organization_user" | "portal_user" | "system";
  sender_user_id: string | null;
  direction: CommunicationMessageDirection;
  source_kind: CommunicationMessageSourceKind;
  channel_kind: CommunicationChannelKind;
  message_kind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  delivery_status: CommunicationMessageDeliveryStatus;
  body: string;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type CommunicationActorContext = {
  userId: string;
  senderType: "organization_user" | "portal_user";
};

type GetOrCreateThreadInput = {
  organizationId: string;
  opportunityId?: string | null;
  appointmentId?: string | null;
  customerId: string | null;
  projectId: string | null;
  subjectType: CommunicationThread["subjectType"];
  subjectId: string;
};

type PostCommunicationMessageInput = {
  threadId: string;
  body: string;
  messageKind?: CommunicationMessageKind;
  visibility?: CommunicationMessageVisibility;
  deliveryStatus?: CommunicationMessageDeliveryStatus;
  payload?: Record<string, unknown> | null;
  createNotification?: boolean;
};

type CreateRecordLinkedCommunicationMessageInput = {
  subjectType: "customer" | "project";
  subjectId: string;
  body: string;
  visibility: CommunicationMessageVisibility;
};

function mapThread(row: CommunicationThreadRow): CommunicationThread {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    appointmentId: row.appointment_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    createdByUserId: row.created_by_user_id,
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

function mapMessage(row: CommunicationMessageRow): CommunicationMessage {
  return {
    id: row.id,
    organizationId: row.company_id,
    threadId: row.thread_id,
    opportunityId: row.opportunity_id,
    appointmentId: row.appointment_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    senderType: row.sender_type,
    senderUserId: row.sender_user_id,
    direction: row.direction,
    sourceKind: row.source_kind,
    channelKind: row.channel_kind,
    messageKind: row.message_kind,
    visibility: row.visibility,
    deliveryStatus: row.delivery_status,
    body: row.body,
    payload: row.payload,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function getThreadLinkPath(
  thread: Pick<CommunicationThread, "subjectType" | "subjectId">
) {
  switch (thread.subjectType) {
    case "opportunity":
      return `/leads/${thread.subjectId}`;
    case "appointment":
      return `/appointments/${thread.subjectId}`;
    case "customer":
      return `/customers/${thread.subjectId}`;
    case "project":
      return `/projects/${thread.subjectId}`;
    case "estimate":
      return `/estimates/${thread.subjectId}`;
    case "contract":
      return `/contracts/${thread.subjectId}`;
    case "invoice":
      return `/invoices/${thread.subjectId}`;
    case "change_order":
      return `/change-orders/${thread.subjectId}`;
    case "payment":
      return "/payments";
    default:
      return "/dashboard";
  }
}

async function resolveCommunicationActorContext(
  thread: Pick<
    CommunicationThreadRow,
    "company_id" | "customer_id" | "project_id"
  >,
  next: string
): Promise<CommunicationActorContext> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (organizationContext?.organization.id === thread.company_id) {
    return {
      userId: user.id,
      senderType: "organization_user"
    };
  }

  if (!thread.customer_id || !thread.project_id) {
    throw new Error(
      "Portal communication requires a customer and project thread."
    );
  }

  await assertPortalUserCanPostCommunication({
    organizationId: thread.company_id,
    customerId: thread.customer_id,
    projectId: thread.project_id,
    next
  });

  return {
    userId: user.id,
    senderType: "portal_user"
  };
}

export async function listCommunicationThreadsForSubject(
  subjectType: CommunicationThread["subjectType"],
  subjectId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_threads")
    .select(
      `
        id,
        company_id,
        opportunity_id,
        appointment_id,
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        thread_category,
        channel_kind,
        thread_status,
        last_message_at,
        last_message_preview,
        last_message_visibility,
        created_at,
        updated_at
      `
    )
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load communication threads: ${response.error.message}`
    );
  }

  return ((response.data as CommunicationThreadRow[] | null) ?? []).map(
    mapThread
  );
}

export async function getOrCreateCommunicationThread(
  input: GetOrCreateThreadInput,
  next = "/dashboard"
) {
  const placeholderThread: CommunicationThreadRow = {
    id: "",
    company_id: input.organizationId,
    opportunity_id: input.opportunityId ?? null,
    appointment_id: input.appointmentId ?? null,
    customer_id: input.customerId,
    project_id: input.projectId,
    subject_type: input.subjectType,
    subject_id: input.subjectId,
    created_by_user_id: null,
    thread_category: "operational",
    channel_kind: "unknown",
    thread_status: "open",
    last_message_at: null,
    last_message_preview: null,
    last_message_visibility: "customer_visible",
    created_at: "",
    updated_at: ""
  };
  const actor = await resolveCommunicationActorContext(placeholderThread, next);
  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("communication_threads")
    .select(
      `
        id,
        company_id,
        opportunity_id,
        appointment_id,
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        thread_category,
        channel_kind,
        thread_status,
        last_message_at,
        last_message_preview,
        last_message_visibility,
        created_at,
        updated_at
      `
    )
    .eq("company_id", input.organizationId)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .maybeSingle();
  const existing = existingResponse.data as CommunicationThreadRow | null;

  if (existingResponse.error) {
    throw new Error(
      `Unable to inspect communication thread: ${existingResponse.error.message}`
    );
  }

  if (existing) {
    return mapThread(existing);
  }

  const insertResponse = await supabase
    .from("communication_threads")
    .insert({
      company_id: input.organizationId,
      opportunity_id: input.opportunityId ?? null,
      appointment_id: input.appointmentId ?? null,
      customer_id: input.customerId,
      project_id: input.projectId,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      created_by_user_id: actor.userId
    })
    .select(
      `
        id,
        company_id,
        opportunity_id,
        appointment_id,
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        thread_category,
        channel_kind,
        thread_status,
        last_message_at,
        last_message_preview,
        last_message_visibility,
        created_at,
        updated_at
      `
    )
    .single();
  const inserted = insertResponse.data as CommunicationThreadRow | null;

  if (insertResponse.error || !inserted) {
    throw new Error(
      `Unable to create communication thread: ${insertResponse.error?.message ?? "Insert failed."}`
    );
  }

  return mapThread(inserted);
}

export async function listCommunicationMessages(threadId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_messages")
    .select(
      `
        id,
        company_id,
        thread_id,
        opportunity_id,
        appointment_id,
        customer_id,
        project_id,
        sender_type,
        sender_user_id,
        direction,
        source_kind,
        channel_kind,
        message_kind,
        visibility,
        delivery_status,
        body,
        payload,
        occurred_at,
        created_at
      `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load communication messages: ${response.error.message}`
    );
  }

  return ((response.data as CommunicationMessageRow[] | null) ?? []).map(
    mapMessage
  );
}

export async function getOrCreateOpportunityCommunicationThread(
  opportunityId: string,
  next = "/leads"
) {
  const opportunity = await getOpportunityById(opportunityId, next);

  if (!opportunity) {
    throw new Error("Lead not found for this organization.");
  }

  return getOrCreateCommunicationThread(
    {
      organizationId: opportunity.organizationId,
      opportunityId: opportunity.id,
      customerId: opportunity.customerId,
      projectId: opportunity.projectId,
      subjectType: "opportunity",
      subjectId: opportunity.id
    },
    next
  );
}

export async function listOpportunityCommunicationMessages(
  opportunityId: string,
  next = "/leads"
) {
  const opportunity = await getOpportunityById(opportunityId, next);

  if (!opportunity) {
    throw new Error("Lead not found for this organization.");
  }

  const threads = await listCommunicationThreadsForSubject(
    "opportunity",
    opportunity.id
  );
  const thread = threads.find(
    (candidate) => candidate.organizationId === opportunity.organizationId
  );

  if (!thread) {
    return [];
  }

  return listCommunicationMessages(thread.id);
}

export async function createOpportunityManualCommunicationMessage(
  input: {
    opportunityId: string;
    body: string;
    messageKind: Exclude<CommunicationMessageKind, "customer_message">;
    visibility?: CommunicationMessageVisibility;
    payload?: Record<string, unknown> | null;
  },
  next = "/leads"
) {
  const thread = await getOrCreateOpportunityCommunicationThread(
    input.opportunityId,
    next
  );

  return postCommunicationMessage(
    {
      threadId: thread.id,
      body: input.body,
      messageKind: input.messageKind,
      visibility: input.visibility ?? "internal",
      deliveryStatus: "logged",
      payload: input.payload ?? null,
      createNotification: false
    },
    next
  );
}

export async function createRecordLinkedCommunicationMessage(
  input: CreateRecordLinkedCommunicationMessageInput,
  next = "/communications"
) {
  if (input.subjectType === "project") {
    const project = await getProjectById(input.subjectId, next);

    if (!project) {
      throw new Error("Project not found for this organization.");
    }

    const thread = await getOrCreateCommunicationThread(
      {
        organizationId: project.organizationId,
        customerId: project.customerId,
        projectId: project.id,
        subjectType: "project",
        subjectId: project.id
      },
      next
    );

    return postCommunicationMessage(
      {
        threadId: thread.id,
        body: input.body,
        visibility: input.visibility,
        createNotification: false,
        payload: {
          source: "record_linked_composer",
          subjectType: "project",
          subjectId: project.id
        }
      },
      next
    );
  }

  const customer = await getCustomerById(input.subjectId, next);

  if (!customer) {
    throw new Error("Customer not found for this organization.");
  }

  const thread = await getOrCreateCommunicationThread(
    {
      organizationId: customer.organizationId,
      customerId: customer.id,
      projectId: null,
      subjectType: "customer",
      subjectId: customer.id
    },
    next
  );

  return postCommunicationMessage(
    {
      threadId: thread.id,
      body: input.body,
      visibility: input.visibility,
      createNotification: false,
      payload: {
        source: "record_linked_composer",
        subjectType: "customer",
        subjectId: customer.id
      }
    },
    next
  );
}

export async function postCommunicationMessage(
  input: PostCommunicationMessageInput,
  next = "/dashboard"
) {
  const supabase = await getSupabaseServerClient();
  const threadResponse = await supabase
    .from("communication_threads")
    .select(
      `
        id,
        company_id,
        opportunity_id,
        appointment_id,
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        thread_category,
        channel_kind,
        thread_status,
        last_message_at,
        last_message_preview,
        last_message_visibility,
        created_at,
        updated_at
      `
    )
    .eq("id", input.threadId)
    .maybeSingle();
  const threadRow = threadResponse.data as CommunicationThreadRow | null;

  if (threadResponse.error) {
    throw new Error(
      `Unable to load communication thread: ${threadResponse.error.message}`
    );
  }

  if (!threadRow) {
    throw new Error("Communication thread not found.");
  }

  const actor = await resolveCommunicationActorContext(threadRow, next);
  const trimmedBody = input.body.trim();
  const writeFields = deriveCommunicationWriteFields({
    actorKind: actor.senderType,
    audience: input.visibility,
    messageKind: input.messageKind,
    deliveryStatus: input.deliveryStatus
  });

  if (trimmedBody.length === 0) {
    throw new Error("Communication messages cannot be empty.");
  }

  const insertResponse = await supabase
    .from("communication_messages")
    .insert({
      company_id: threadRow.company_id,
      thread_id: threadRow.id,
      opportunity_id: threadRow.opportunity_id,
      appointment_id: threadRow.appointment_id,
      customer_id: threadRow.customer_id,
      project_id: threadRow.project_id,
      sender_type: actor.senderType,
      sender_user_id: actor.userId,
      direction: writeFields.direction,
      source_kind: "human",
      channel_kind: writeFields.channelKind,
      message_kind: writeFields.messageKind,
      visibility: writeFields.visibility,
      delivery_status: writeFields.deliveryStatus,
      body: trimmedBody,
      payload: input.payload ?? null
    })
    .select(
      `
        id,
        company_id,
        thread_id,
        opportunity_id,
        appointment_id,
        customer_id,
        project_id,
        sender_type,
        sender_user_id,
        direction,
        source_kind,
        channel_kind,
        message_kind,
        visibility,
        delivery_status,
        body,
        payload,
        occurred_at,
        created_at
      `
    )
    .single();
  const messageRow = insertResponse.data as CommunicationMessageRow | null;

  if (insertResponse.error || !messageRow) {
    throw new Error(
      `Unable to post communication message: ${insertResponse.error?.message ?? "Insert failed."}`
    );
  }

  const nowIso = messageRow.created_at;
  const preview =
    trimmedBody.length > 140 ? `${trimmedBody.slice(0, 137)}...` : trimmedBody;
  const updateThreadResponse = await supabase
    .from("communication_threads")
    .update({
      last_message_at: nowIso,
      last_message_preview: preview,
      last_message_visibility: writeFields.visibility,
      thread_status: writeFields.nextThreadStatus,
      channel_kind: writeFields.channelKind
    })
    .eq("id", threadRow.id);

  if (updateThreadResponse.error) {
    throw new Error(
      `Unable to update communication thread summary: ${updateThreadResponse.error.message}`
    );
  }

  if (input.createNotification ?? true) {
    await createNotificationEvent({
      organizationId: threadRow.company_id,
      category: "communication",
      severity: actor.senderType === "portal_user" ? "warning" : "neutral",
      eventType: "communication.message_posted",
      subjectType: threadRow.subject_type,
      subjectId: threadRow.subject_id,
      customerId: threadRow.customer_id,
      projectId: threadRow.project_id,
      actorType: actor.senderType,
      actorUserId:
        actor.senderType === "organization_user" ? actor.userId : null,
      portalUserId: actor.senderType === "portal_user" ? actor.userId : null,
      title:
        actor.senderType === "portal_user"
          ? "New customer message"
          : "New internal message",
      message: preview,
      linkPath: getThreadLinkPath({
        subjectType: threadRow.subject_type,
        subjectId: threadRow.subject_id
      }),
      groupKey: `communication:${threadRow.id}`,
      payload: {
        threadId: threadRow.id,
        messageId: messageRow.id
      },
      occurredAt: nowIso,
      markReadUserIds:
        actor.senderType === "organization_user" ? [actor.userId] : []
    });
  }

  return mapMessage(messageRow);
}
