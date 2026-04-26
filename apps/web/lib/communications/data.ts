import "server-only";

import type {
  CommunicationMessage,
  CommunicationThread
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  assertPortalUserCanPostCommunication,
  createNotificationEvent
} from "@/lib/notifications/system";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CommunicationThreadRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  subject_type:
    | "customer"
    | "project"
    | "estimate"
    | "contract"
    | "invoice"
    | "change_order"
    | "payment";
  subject_id: string;
  created_by_user_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

type CommunicationMessageRow = {
  id: string;
  company_id: string;
  thread_id: string;
  customer_id: string;
  project_id: string;
  sender_type: "organization_user" | "portal_user" | "system";
  sender_user_id: string | null;
  body: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type CommunicationActorContext = {
  userId: string;
  senderType: "organization_user" | "portal_user";
};

type GetOrCreateThreadInput = {
  organizationId: string;
  customerId: string;
  projectId: string;
  subjectType: CommunicationThread["subjectType"];
  subjectId: string;
};

type PostCommunicationMessageInput = {
  threadId: string;
  body: string;
  payload?: Record<string, unknown> | null;
};

function mapThread(row: CommunicationThreadRow): CommunicationThread {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    createdByUserId: row.created_by_user_id,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapMessage(row: CommunicationMessageRow): CommunicationMessage {
  return {
    id: row.id,
    organizationId: row.company_id,
    threadId: row.thread_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    senderType: row.sender_type,
    senderUserId: row.sender_user_id,
    body: row.body,
    payload: row.payload,
    createdAt: row.created_at
  };
}

function getThreadLinkPath(thread: Pick<CommunicationThread, "subjectType" | "subjectId">) {
  switch (thread.subjectType) {
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
  thread: Pick<CommunicationThreadRow, "company_id" | "customer_id" | "project_id">,
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
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        last_message_at,
        last_message_preview,
        created_at,
        updated_at
      `
    )
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load communication threads: ${response.error.message}`);
  }

  return ((response.data as CommunicationThreadRow[] | null) ?? []).map(mapThread);
}

export async function getOrCreateCommunicationThread(
  input: GetOrCreateThreadInput,
  next = "/dashboard"
) {
  const placeholderThread: CommunicationThreadRow = {
    id: "",
    company_id: input.organizationId,
    customer_id: input.customerId,
    project_id: input.projectId,
    subject_type: input.subjectType,
    subject_id: input.subjectId,
    created_by_user_id: null,
    last_message_at: null,
    last_message_preview: null,
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
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        last_message_at,
        last_message_preview,
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
    throw new Error(`Unable to inspect communication thread: ${existingResponse.error.message}`);
  }

  if (existing) {
    return mapThread(existing);
  }

  const insertResponse = await supabase
    .from("communication_threads")
    .insert({
      company_id: input.organizationId,
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
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        last_message_at,
        last_message_preview,
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
        customer_id,
        project_id,
        sender_type,
        sender_user_id,
        body,
        payload,
        created_at
      `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load communication messages: ${response.error.message}`);
  }

  return ((response.data as CommunicationMessageRow[] | null) ?? []).map(mapMessage);
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
        customer_id,
        project_id,
        subject_type,
        subject_id,
        created_by_user_id,
        last_message_at,
        last_message_preview,
        created_at,
        updated_at
      `
    )
    .eq("id", input.threadId)
    .maybeSingle();
  const threadRow = threadResponse.data as CommunicationThreadRow | null;

  if (threadResponse.error) {
    throw new Error(`Unable to load communication thread: ${threadResponse.error.message}`);
  }

  if (!threadRow) {
    throw new Error("Communication thread not found.");
  }

  const actor = await resolveCommunicationActorContext(threadRow, next);
  const trimmedBody = input.body.trim();

  if (trimmedBody.length === 0) {
    throw new Error("Communication messages cannot be empty.");
  }

  const insertResponse = await supabase
    .from("communication_messages")
    .insert({
      company_id: threadRow.company_id,
      thread_id: threadRow.id,
      customer_id: threadRow.customer_id,
      project_id: threadRow.project_id,
      sender_type: actor.senderType,
      sender_user_id: actor.userId,
      body: trimmedBody,
      payload: input.payload ?? null
    })
    .select(
      `
        id,
        company_id,
        thread_id,
        customer_id,
        project_id,
        sender_type,
        sender_user_id,
        body,
        payload,
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
  const preview = trimmedBody.length > 140 ? `${trimmedBody.slice(0, 137)}...` : trimmedBody;
  const updateThreadResponse = await supabase
    .from("communication_threads")
    .update({
      last_message_at: nowIso,
      last_message_preview: preview
    })
    .eq("id", threadRow.id);

  if (updateThreadResponse.error) {
    throw new Error(
      `Unable to update communication thread summary: ${updateThreadResponse.error.message}`
    );
  }

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
    actorUserId: actor.senderType === "organization_user" ? actor.userId : null,
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
    markReadUserIds: actor.senderType === "organization_user" ? [actor.userId] : []
  });

  return mapMessage(messageRow);
}
