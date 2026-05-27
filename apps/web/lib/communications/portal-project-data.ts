import "server-only";

import {
  listPortalAccessibleProjectIdsForCurrentUser,
  listPortalAccessGrantsForCurrentUser
} from "@/lib/portal-access/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  derivePortalProjectCommunicationSummary,
  type PortalProjectCommunicationMessage,
  type PortalProjectCommunicationSummary,
  type PortalProjectCommunicationThread
} from "./portal-project-summary";

type PortalCommunicationThreadRow = {
  id: string;
  company_id: string;
  customer_id: string | null;
  project_id: string | null;
  subject_type: string;
  subject_id: string;
  thread_status: PortalProjectCommunicationThread["threadStatus"];
  last_message_at: string | null;
  last_message_preview: string | null;
  updated_at: string;
};

type PortalCommunicationMessageRow = {
  id: string;
  thread_id: string;
  sender_type: PortalProjectCommunicationMessage["senderType"];
  direction: PortalProjectCommunicationMessage["direction"];
  message_kind: PortalProjectCommunicationMessage["messageKind"];
  delivery_status: PortalProjectCommunicationMessage["deliveryStatus"];
  body: string;
  occurred_at: string;
  created_at: string;
};

const portalCommunicationThreadSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  subject_type,
  subject_id,
  thread_status,
  last_message_at,
  last_message_preview,
  updated_at
`;

const portalCommunicationMessageSelect = `
  id,
  thread_id,
  sender_type,
  direction,
  message_kind,
  delivery_status,
  body,
  occurred_at,
  created_at
`;

async function getPortalProjectCommunicationScope(
  projectId: string,
  next: string
) {
  const [activeGrants, accessibleProjectIds] = await Promise.all([
    listPortalAccessGrantsForCurrentUser(next).then((grants) =>
      grants.filter((grant) => grant.status === "active")
    ),
    listPortalAccessibleProjectIdsForCurrentUser(next)
  ]);

  if (!accessibleProjectIds.includes(projectId)) {
    return null;
  }

  const activeCustomerIds = [
    ...new Set(activeGrants.map((grant) => grant.customerId))
  ];

  if (activeCustomerIds.length === 0) {
    return null;
  }

  return {
    activeCustomerIds
  };
}

function mapThread(
  row: PortalCommunicationThreadRow
): PortalProjectCommunicationThread | null {
  if (!row.customer_id || !row.project_id) {
    return null;
  }

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    threadStatus: row.thread_status,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    updatedAt: row.updated_at
  };
}

function mapMessage(
  row: PortalCommunicationMessageRow
): PortalProjectCommunicationMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderType: row.sender_type,
    direction: row.direction,
    messageKind: row.message_kind,
    deliveryStatus: row.delivery_status,
    body: row.body,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

export async function listPortalProjectCommunicationSummary(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectCommunicationSummary> {
  const scope = await getPortalProjectCommunicationScope(projectId, next);

  if (!scope) {
    return derivePortalProjectCommunicationSummary({
      threads: [],
      messages: []
    });
  }

  const supabase = await getSupabaseServerClient();
  const threadsResponse = await supabase
    .from("communication_threads")
    .select(portalCommunicationThreadSelect)
    .eq("project_id", projectId)
    .in("customer_id", scope.activeCustomerIds)
    .neq("subject_type", "opportunity")
    .neq("subject_type", "appointment")
    .eq("last_message_visibility", "customer_visible")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (threadsResponse.error) {
    throw new Error(
      `Unable to load portal project conversations: ${threadsResponse.error.message}`
    );
  }

  const threads = (
    (threadsResponse.data as PortalCommunicationThreadRow[] | null) ?? []
  )
    .map(mapThread)
    .filter(
      (thread): thread is PortalProjectCommunicationThread => thread !== null
    );
  const threadIds = threads.map((thread) => thread.id);

  if (threadIds.length === 0) {
    return derivePortalProjectCommunicationSummary({
      threads,
      messages: []
    });
  }

  const messagesResponse = await supabase
    .from("communication_messages")
    .select(portalCommunicationMessageSelect)
    .in("thread_id", threadIds)
    .eq("visibility", "customer_visible")
    .order("occurred_at", { ascending: true })
    .limit(80);

  if (messagesResponse.error) {
    throw new Error(
      `Unable to load portal project conversation messages: ${messagesResponse.error.message}`
    );
  }

  return derivePortalProjectCommunicationSummary({
    threads,
    messages: (
      (messagesResponse.data as PortalCommunicationMessageRow[] | null) ?? []
    ).map(mapMessage)
  });
}

export async function assertPortalProjectCommunicationThreadCanReceiveReply(
  input: {
    projectId: string;
    threadId: string;
  },
  next = "/portal"
) {
  const summary = await listPortalProjectCommunicationSummary(
    input.projectId,
    next
  );
  const conversation = summary.conversations.find(
    (candidate) => candidate.thread.id === input.threadId
  );

  if (!conversation || !conversation.replyAllowed) {
    throw new Error(
      "This project conversation is not available for portal replies."
    );
  }

  return conversation.thread;
}
