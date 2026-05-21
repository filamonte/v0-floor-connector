import "server-only";

import type {
  CommunicationChannelKind,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  CommunicationMessageSourceKind,
  CommunicationMessageVisibility,
  CommunicationThreadCategory,
  CommunicationThreadStatus,
  CommunicationMessageId,
  CommunicationThreadId,
  GateKeeperActionSuggestion,
  GateKeeperActionSuggestionId,
  GateKeeperActionSuggestionStatus,
  GateKeeperActionSuggestionType,
  GateKeeperArtifact,
  GateKeeperArtifactId,
  GateKeeperArtifactReviewStatus,
  GateKeeperArtifactType,
  GateKeeperSubjectType
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type GateKeeperScope = {
  userId: string;
  organizationId: string;
};

type GateKeeperSubjectLink = {
  subjectType?: GateKeeperSubjectType | null;
  subjectId?: string | null;
};

type GateKeeperArtifactRow = {
  id: string;
  company_id: string;
  communication_thread_id: string | null;
  communication_message_id: string | null;
  subject_type: GateKeeperSubjectType | null;
  subject_id: string | null;
  artifact_type: GateKeeperArtifactType;
  content_text: string | null;
  content: Record<string, unknown>;
  confidence: string | null;
  review_status: GateKeeperArtifactReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type GateKeeperActionSuggestionRow = {
  id: string;
  company_id: string;
  source_artifact_id: string | null;
  communication_thread_id: string | null;
  communication_message_id: string | null;
  subject_type: GateKeeperSubjectType | null;
  subject_id: string | null;
  suggestion_type: GateKeeperActionSuggestionType;
  title: string;
  rationale: string | null;
  proposed_payload: Record<string, unknown>;
  status: GateKeeperActionSuggestionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type GateKeeperSubjectMemoryMessageRow = {
  id: string;
  company_id: string;
  thread_id: string;
  direction: CommunicationMessageDirection;
  source_kind: CommunicationMessageSourceKind;
  channel_kind: CommunicationChannelKind;
  message_kind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  body: string;
  occurred_at: string;
  created_at: string;
};

type GateKeeperSubjectMemoryThreadRow = {
  id: string;
  company_id: string;
  thread_category: CommunicationThreadCategory;
  channel_kind: CommunicationChannelKind;
  thread_status: CommunicationThreadStatus;
  last_message_at: string | null;
  last_message_preview: string | null;
  updated_at: string;
};

type GateKeeperSubjectExecutionResultRow = {
  id: string;
  company_id: string;
  suggestion_id: string;
  action_type: GateKeeperActionSuggestionType;
  status: string;
  executed_at: string | null;
  execution_error: string | null;
  result_subject_type: string | null;
  result_subject_id: string | null;
  updated_at: string;
};

export type GateKeeperReviewQueueSummary = {
  proposedArtifactCount: number;
  proposedSuggestionCount: number;
  acceptedReviewedCount: number;
  dismissedRejectedCount: number;
};

export type GateKeeperReviewQueue = {
  summary: GateKeeperReviewQueueSummary;
  artifacts: GateKeeperArtifact[];
  suggestions: GateKeeperActionSuggestion[];
};

export type GateKeeperSubjectMemoryMessage = {
  id: string;
  organizationId: string;
  threadId: string;
  direction: CommunicationMessageDirection;
  sourceKind: CommunicationMessageSourceKind;
  channelKind: CommunicationChannelKind;
  messageKind: CommunicationMessageKind;
  visibility: CommunicationMessageVisibility;
  bodyPreview: string;
  occurredAt: string;
  createdAt: string;
};

export type GateKeeperSubjectMemoryThread = {
  id: string;
  organizationId: string;
  threadCategory: CommunicationThreadCategory;
  channelKind: CommunicationChannelKind;
  threadStatus: CommunicationThreadStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  updatedAt: string;
};

export type GateKeeperSubjectExecutionResult = {
  id: string;
  organizationId: string;
  suggestionId: string;
  actionType: GateKeeperActionSuggestionType;
  status: "executed" | "failed";
  executedAt: string | null;
  executionError: string | null;
  resultSubjectType: string | null;
  resultSubjectId: string | null;
  resultHref: string | null;
  updatedAt: string;
};

export type GateKeeperSubjectMemory = {
  subjectType: GateKeeperSubjectType;
  subjectId: string;
  artifacts: GateKeeperArtifact[];
  suggestions: GateKeeperActionSuggestion[];
  communicationMessages: GateKeeperSubjectMemoryMessage[];
  communicationThreads: GateKeeperSubjectMemoryThread[];
  executionResults: GateKeeperSubjectExecutionResult[];
};

const artifactSelect = `
  id,
  company_id,
  communication_thread_id,
  communication_message_id,
  subject_type,
  subject_id,
  artifact_type,
  content_text,
  content,
  confidence,
  review_status,
  reviewed_by,
  reviewed_at,
  review_note,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const suggestionSelect = `
  id,
  company_id,
  source_artifact_id,
  communication_thread_id,
  communication_message_id,
  subject_type,
  subject_id,
  suggestion_type,
  title,
  rationale,
  proposed_payload,
  status,
  reviewed_by,
  reviewed_at,
  review_note,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const subjectMemoryMessageSelect = `
  id,
  company_id,
  thread_id,
  direction,
  source_kind,
  channel_kind,
  message_kind,
  visibility,
  body,
  occurred_at,
  created_at
`;

const subjectMemoryThreadSelect = `
  id,
  company_id,
  thread_category,
  channel_kind,
  thread_status,
  last_message_at,
  last_message_preview,
  updated_at
`;

const subjectExecutionResultSelect = `
  id,
  company_id,
  suggestion_id,
  action_type,
  status,
  executed_at,
  execution_error,
  result_subject_type,
  result_subject_id,
  updated_at
`;

async function requireGateKeeperScope(
  next = "/dashboard"
): Promise<GateKeeperScope> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error(
      "No active organization is available for GateKeeper memory."
    );
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

function normalizeSubjectLink(input: GateKeeperSubjectLink) {
  const subjectType = input.subjectType ?? null;
  const subjectId = input.subjectId ?? null;

  if ((subjectType && !subjectId) || (!subjectType && subjectId)) {
    throw new Error(
      "GateKeeper subject type and subject id must be provided together."
    );
  }

  return { subjectType, subjectId };
}

function mapArtifact(row: GateKeeperArtifactRow): GateKeeperArtifact {
  return {
    id: row.id,
    organizationId: row.company_id,
    communicationThreadId: row.communication_thread_id,
    communicationMessageId: row.communication_message_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    artifactType: row.artifact_type,
    contentText: row.content_text,
    content: row.content,
    confidence: row.confidence,
    reviewStatus: row.review_status,
    reviewedByUserId: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSuggestion(
  row: GateKeeperActionSuggestionRow
): GateKeeperActionSuggestion {
  return {
    id: row.id,
    organizationId: row.company_id,
    sourceArtifactId: row.source_artifact_id,
    communicationThreadId: row.communication_thread_id,
    communicationMessageId: row.communication_message_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    suggestionType: row.suggestion_type,
    title: row.title,
    rationale: row.rationale,
    proposedPayload: row.proposed_payload,
    status: row.status,
    reviewedByUserId: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function buildPreview(value: string | null | undefined, limit = 180) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 3)}...`;
}

function mapSubjectMemoryMessage(
  row: GateKeeperSubjectMemoryMessageRow
): GateKeeperSubjectMemoryMessage {
  return {
    id: row.id,
    organizationId: row.company_id,
    threadId: row.thread_id,
    direction: row.direction,
    sourceKind: row.source_kind,
    channelKind: row.channel_kind,
    messageKind: row.message_kind,
    visibility: row.visibility,
    bodyPreview: buildPreview(row.body),
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapSubjectMemoryThread(
  row: GateKeeperSubjectMemoryThreadRow
): GateKeeperSubjectMemoryThread {
  return {
    id: row.id,
    organizationId: row.company_id,
    threadCategory: row.thread_category,
    channelKind: row.channel_kind,
    threadStatus: row.thread_status,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: buildPreview(row.last_message_preview),
    updatedAt: row.updated_at
  };
}

function mapSubjectExecutionResult(
  row: GateKeeperSubjectExecutionResultRow
): GateKeeperSubjectExecutionResult | null {
  if (row.status !== "executed" && row.status !== "failed") {
    return null;
  }

  return {
    id: row.id,
    organizationId: row.company_id,
    suggestionId: row.suggestion_id,
    actionType: row.action_type,
    status: row.status,
    executedAt: row.executed_at,
    executionError: buildPreview(row.execution_error, 280) || null,
    resultSubjectType: row.result_subject_type,
    resultSubjectId: row.result_subject_id,
    resultHref: getGateKeeperSubjectHref({
      subjectType:
        row.result_subject_type === "opportunity"
          ? "opportunity"
          : (row.result_subject_type as GateKeeperSubjectType | null),
      subjectId: row.result_subject_id
    }),
    updatedAt: row.updated_at
  };
}

function getGateKeeperSubjectHref(input: {
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
}) {
  if (!input.subjectType || !input.subjectId) {
    return null;
  }

  switch (input.subjectType) {
    case "opportunity":
      return `/leads/${input.subjectId}`;
    case "appointment":
      return `/appointments/${input.subjectId}`;
    case "customer":
      return `/customers/${input.subjectId}`;
    case "project":
      return `/projects/${input.subjectId}`;
    case "estimate":
      return `/estimates/${input.subjectId}`;
    case "contract":
      return `/contracts/${input.subjectId}`;
    case "invoice":
      return `/invoices/${input.subjectId}`;
    case "change_order":
      return `/change-orders/${input.subjectId}`;
    case "payment":
      return "/payments";
    case "job":
      return `/jobs/${input.subjectId}`;
    case "person":
      return `/people?personId=${input.subjectId}`;
    case "vendor":
      return `/vendors?vendorId=${input.subjectId}`;
    default:
      return null;
  }
}

export function getGateKeeperSubjectContext(input: {
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
}) {
  return {
    label:
      input.subjectType && input.subjectId
        ? `${input.subjectType.replaceAll("_", " ")} ${input.subjectId.slice(0, 8)}`
        : "No linked subject",
    href: getGateKeeperSubjectHref(input)
  };
}

async function countGateKeeperRows(input: {
  table: "gatekeeper_artifacts" | "gatekeeper_action_suggestions";
  statusColumn: "review_status" | "status";
  status: string;
  organizationId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(input.table)
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId)
    .eq(input.statusColumn, input.status);

  if (response.error) {
    throw new Error(
      `Unable to count GateKeeper review queue: ${response.error.message}`
    );
  }

  return response.count ?? 0;
}

export async function getGateKeeperReviewQueue(input?: {
  artifactStatus?: GateKeeperArtifactReviewStatus | "all";
  suggestionStatus?: GateKeeperActionSuggestionStatus | "all";
  limit?: number;
}): Promise<GateKeeperReviewQueue> {
  const scope = await requireGateKeeperScope("/gatekeeper");
  const supabase = await getSupabaseServerClient();
  const limit = input?.limit ?? 50;
  const artifactStatus = input?.artifactStatus ?? "proposed";
  const suggestionStatus = input?.suggestionStatus ?? "proposed";

  let artifactsQuery = supabase
    .from("gatekeeper_artifacts")
    .select(artifactSelect)
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (artifactStatus !== "all") {
    artifactsQuery = artifactsQuery.eq("review_status", artifactStatus);
  }

  let suggestionsQuery = supabase
    .from("gatekeeper_action_suggestions")
    .select(suggestionSelect)
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (suggestionStatus !== "all") {
    suggestionsQuery = suggestionsQuery.eq("status", suggestionStatus);
  }

  const [
    artifactsResponse,
    suggestionsResponse,
    proposedArtifactCount,
    proposedSuggestionCount,
    acceptedArtifactCount,
    approvedSuggestionCount,
    rejectedArtifactCount,
    dismissedArtifactCount,
    rejectedSuggestionCount,
    dismissedSuggestionCount
  ] = await Promise.all([
    artifactsQuery,
    suggestionsQuery,
    countGateKeeperRows({
      table: "gatekeeper_artifacts",
      statusColumn: "review_status",
      status: "proposed",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_action_suggestions",
      statusColumn: "status",
      status: "proposed",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_artifacts",
      statusColumn: "review_status",
      status: "accepted",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_action_suggestions",
      statusColumn: "status",
      status: "approved",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_artifacts",
      statusColumn: "review_status",
      status: "rejected",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_artifacts",
      statusColumn: "review_status",
      status: "dismissed",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_action_suggestions",
      statusColumn: "status",
      status: "rejected",
      organizationId: scope.organizationId
    }),
    countGateKeeperRows({
      table: "gatekeeper_action_suggestions",
      statusColumn: "status",
      status: "dismissed",
      organizationId: scope.organizationId
    })
  ]);

  if (artifactsResponse.error) {
    throw new Error(
      `Unable to load GateKeeper artifacts: ${artifactsResponse.error.message}`
    );
  }

  if (suggestionsResponse.error) {
    throw new Error(
      `Unable to load GateKeeper action suggestions: ${suggestionsResponse.error.message}`
    );
  }

  return {
    summary: {
      proposedArtifactCount,
      proposedSuggestionCount,
      acceptedReviewedCount: acceptedArtifactCount + approvedSuggestionCount,
      dismissedRejectedCount:
        rejectedArtifactCount +
        dismissedArtifactCount +
        rejectedSuggestionCount +
        dismissedSuggestionCount
    },
    artifacts: (
      (artifactsResponse.data as GateKeeperArtifactRow[] | null) ?? []
    ).map(mapArtifact),
    suggestions: (
      (suggestionsResponse.data as GateKeeperActionSuggestionRow[] | null) ?? []
    ).map(mapSuggestion)
  };
}

export async function listGateKeeperArtifactsForSubject(input: {
  subjectType: GateKeeperSubjectType;
  subjectId: string;
  reviewStatus?: GateKeeperArtifactReviewStatus;
  limit?: number;
}) {
  const scope = await requireGateKeeperScope();
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("gatekeeper_artifacts")
    .select(artifactSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.reviewStatus) {
    query = query.eq("review_status", input.reviewStatus);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load GateKeeper artifacts: ${response.error.message}`
    );
  }

  return ((response.data as GateKeeperArtifactRow[] | null) ?? []).map(
    mapArtifact
  );
}

export async function listGateKeeperActionSuggestionsForSubject(input: {
  subjectType: GateKeeperSubjectType;
  subjectId: string;
  status?: GateKeeperActionSuggestionStatus;
  limit?: number;
}) {
  const scope = await requireGateKeeperScope();
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("gatekeeper_action_suggestions")
    .select(suggestionSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.status) {
    query = query.eq("status", input.status);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load GateKeeper action suggestions: ${response.error.message}`
    );
  }

  return ((response.data as GateKeeperActionSuggestionRow[] | null) ?? []).map(
    mapSuggestion
  );
}

export async function getGateKeeperSubjectMemory(input: {
  subjectType: GateKeeperSubjectType;
  subjectId: string;
  limit?: number;
}): Promise<GateKeeperSubjectMemory> {
  const scope = await requireGateKeeperScope();
  const supabase = await getSupabaseServerClient();
  const limit = input.limit ?? 8;

  const [artifactsResponse, suggestionsResponse] = await Promise.all([
    supabase
      .from("gatekeeper_artifacts")
      .select(artifactSelect)
      .eq("company_id", scope.organizationId)
      .eq("subject_type", input.subjectType)
      .eq("subject_id", input.subjectId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("gatekeeper_action_suggestions")
      .select(suggestionSelect)
      .eq("company_id", scope.organizationId)
      .eq("subject_type", input.subjectType)
      .eq("subject_id", input.subjectId)
      .order("created_at", { ascending: false })
      .limit(limit)
  ]);

  if (artifactsResponse.error) {
    throw new Error(
      `Unable to load GateKeeper subject artifacts: ${artifactsResponse.error.message}`
    );
  }

  if (suggestionsResponse.error) {
    throw new Error(
      `Unable to load GateKeeper subject action suggestions: ${suggestionsResponse.error.message}`
    );
  }

  const artifacts = (
    (artifactsResponse.data as GateKeeperArtifactRow[] | null) ?? []
  ).map(mapArtifact);
  const suggestions = (
    (suggestionsResponse.data as GateKeeperActionSuggestionRow[] | null) ?? []
  ).map(mapSuggestion);
  const suggestionIds = suggestions.map((suggestion) => suggestion.id);
  const messageIds = Array.from(
    new Set(
      [...artifacts, ...suggestions]
        .map((item) => item.communicationMessageId)
        .filter((value): value is string => Boolean(value))
    )
  );
  const threadIds = new Set(
    [...artifacts, ...suggestions]
      .map((item) => item.communicationThreadId)
      .filter((value): value is string => Boolean(value))
  );
  let communicationMessages: GateKeeperSubjectMemoryMessage[] = [];

  if (messageIds.length > 0) {
    const messagesResponse = await supabase
      .from("communication_messages")
      .select(subjectMemoryMessageSelect)
      .eq("company_id", scope.organizationId)
      .in("id", messageIds)
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (messagesResponse.error) {
      throw new Error(
        `Unable to load GateKeeper subject communication evidence: ${messagesResponse.error.message}`
      );
    }

    communicationMessages = (
      (messagesResponse.data as GateKeeperSubjectMemoryMessageRow[] | null) ??
      []
    ).map(mapSubjectMemoryMessage);

    for (const message of communicationMessages) {
      threadIds.add(message.threadId);
    }
  }

  let communicationThreads: GateKeeperSubjectMemoryThread[] = [];

  if (threadIds.size > 0) {
    const threadsResponse = await supabase
      .from("communication_threads")
      .select(subjectMemoryThreadSelect)
      .eq("company_id", scope.organizationId)
      .in("id", Array.from(threadIds))
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (threadsResponse.error) {
      throw new Error(
        `Unable to load GateKeeper subject communication threads: ${threadsResponse.error.message}`
      );
    }

    communicationThreads = (
      (threadsResponse.data as GateKeeperSubjectMemoryThreadRow[] | null) ?? []
    ).map(mapSubjectMemoryThread);
  }

  const executionResultQueries = [];

  if (suggestionIds.length > 0) {
    executionResultQueries.push(
      supabase
        .from("gatekeeper_execution_attempts")
        .select(subjectExecutionResultSelect)
        .eq("company_id", scope.organizationId)
        .in("suggestion_id", suggestionIds)
        .in("status", ["executed", "failed"])
        .order("updated_at", { ascending: false })
        .limit(limit)
    );
  }

  executionResultQueries.push(
    supabase
      .from("gatekeeper_execution_attempts")
      .select(subjectExecutionResultSelect)
      .eq("company_id", scope.organizationId)
      .eq("result_subject_type", input.subjectType)
      .eq("result_subject_id", input.subjectId)
      .in("status", ["executed", "failed"])
      .order("updated_at", { ascending: false })
      .limit(limit)
  );

  const executionResultResponses = await Promise.all(executionResultQueries);
  const executionResultError = executionResultResponses.find(
    (response) => response.error
  )?.error;

  if (executionResultError) {
    throw new Error(
      `Unable to load GateKeeper execution results: ${executionResultError.message}`
    );
  }

  const seenExecutionResultIds = new Set<string>();
  const executionResults = executionResultResponses
    .flatMap(
      (response) =>
        (response.data as GateKeeperSubjectExecutionResultRow[] | null) ?? []
    )
    .map(mapSubjectExecutionResult)
    .filter((result): result is GateKeeperSubjectExecutionResult =>
      Boolean(result)
    )
    .filter((result) => {
      if (seenExecutionResultIds.has(result.id)) {
        return false;
      }

      seenExecutionResultIds.add(result.id);
      return true;
    });

  return {
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    artifacts,
    suggestions,
    communicationMessages,
    communicationThreads,
    executionResults
  };
}

export async function createGateKeeperArtifact(
  input: {
    communicationThreadId?: CommunicationThreadId | null;
    communicationMessageId?: CommunicationMessageId | null;
    artifactType: GateKeeperArtifactType;
    contentText?: string | null;
    content?: Record<string, unknown>;
    confidence?: number | null;
  } & GateKeeperSubjectLink
) {
  const scope = await requireGateKeeperScope();
  const subject = normalizeSubjectLink(input);
  const contentText = input.contentText?.trim() || null;
  const content = input.content ?? {};

  if (!contentText && Object.keys(content).length === 0) {
    throw new Error(
      "GateKeeper artifacts require content text or structured content."
    );
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("gatekeeper_artifacts")
    .insert({
      company_id: scope.organizationId,
      communication_thread_id: input.communicationThreadId ?? null,
      communication_message_id: input.communicationMessageId ?? null,
      subject_type: subject.subjectType,
      subject_id: subject.subjectId,
      artifact_type: input.artifactType,
      content_text: contentText,
      content,
      confidence: input.confidence ?? null,
      review_status: "proposed",
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(artifactSelect)
    .single();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to create GateKeeper artifact: ${response.error?.message ?? "Insert failed."}`
    );
  }

  return mapArtifact(response.data as GateKeeperArtifactRow);
}

export async function createGateKeeperActionSuggestion(
  input: {
    sourceArtifactId?: GateKeeperArtifactId | null;
    communicationThreadId?: CommunicationThreadId | null;
    communicationMessageId?: CommunicationMessageId | null;
    suggestionType: GateKeeperActionSuggestionType;
    title: string;
    rationale?: string | null;
    proposedPayload?: Record<string, unknown>;
  } & GateKeeperSubjectLink
) {
  const scope = await requireGateKeeperScope();
  const subject = normalizeSubjectLink(input);
  const title = input.title.trim();

  if (!title) {
    throw new Error("GateKeeper action suggestions require a title.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("gatekeeper_action_suggestions")
    .insert({
      company_id: scope.organizationId,
      source_artifact_id: input.sourceArtifactId ?? null,
      communication_thread_id: input.communicationThreadId ?? null,
      communication_message_id: input.communicationMessageId ?? null,
      subject_type: subject.subjectType,
      subject_id: subject.subjectId,
      suggestion_type: input.suggestionType,
      title,
      rationale: input.rationale?.trim() || null,
      proposed_payload: input.proposedPayload ?? {},
      status: "proposed",
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(suggestionSelect)
    .single();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to create GateKeeper action suggestion: ${
        response.error?.message ?? "Insert failed."
      }`
    );
  }

  return mapSuggestion(response.data as GateKeeperActionSuggestionRow);
}

export async function reviewGateKeeperArtifact(input: {
  artifactId: GateKeeperArtifactId;
  reviewStatus: Exclude<GateKeeperArtifactReviewStatus, "proposed">;
  reviewNote?: string | null;
}) {
  const scope = await requireGateKeeperScope();
  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("gatekeeper_artifacts")
    .select("id, review_status")
    .eq("company_id", scope.organizationId)
    .eq("id", input.artifactId)
    .maybeSingle();
  const existing = existingResponse.data as {
    id: string;
    review_status: GateKeeperArtifactReviewStatus;
  } | null;

  if (existingResponse.error) {
    throw new Error(
      `Unable to inspect GateKeeper artifact: ${existingResponse.error.message}`
    );
  }

  if (!existing) {
    throw new Error("GateKeeper artifact not found.");
  }

  if (existing.review_status !== "proposed") {
    throw new Error(
      "Only proposed GateKeeper artifacts can be reviewed in this pass."
    );
  }

  const response = await supabase
    .from("gatekeeper_artifacts")
    .update({
      review_status: input.reviewStatus,
      reviewed_by: scope.userId,
      reviewed_at: new Date().toISOString(),
      review_note: input.reviewNote?.trim() || null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.artifactId)
    .select(artifactSelect)
    .single();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to review GateKeeper artifact: ${response.error?.message ?? "Update failed."}`
    );
  }

  return mapArtifact(response.data as GateKeeperArtifactRow);
}

export async function reviewGateKeeperActionSuggestion(input: {
  suggestionId: GateKeeperActionSuggestionId;
  status: Exclude<GateKeeperActionSuggestionStatus, "proposed">;
  reviewNote?: string | null;
}) {
  const scope = await requireGateKeeperScope();
  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("gatekeeper_action_suggestions")
    .select("id, status")
    .eq("company_id", scope.organizationId)
    .eq("id", input.suggestionId)
    .maybeSingle();
  const existing = existingResponse.data as {
    id: string;
    status: GateKeeperActionSuggestionStatus;
  } | null;

  if (existingResponse.error) {
    throw new Error(
      `Unable to inspect GateKeeper action suggestion: ${existingResponse.error.message}`
    );
  }

  if (!existing) {
    throw new Error("GateKeeper action suggestion not found.");
  }

  if (existing.status !== "proposed") {
    throw new Error(
      "Only proposed GateKeeper action suggestions can be reviewed in this pass."
    );
  }

  const response = await supabase
    .from("gatekeeper_action_suggestions")
    .update({
      status: input.status,
      reviewed_by: scope.userId,
      reviewed_at: new Date().toISOString(),
      review_note: input.reviewNote?.trim() || null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.suggestionId)
    .select(suggestionSelect)
    .single();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to review GateKeeper action suggestion: ${
        response.error?.message ?? "Update failed."
      }`
    );
  }

  return mapSuggestion(response.data as GateKeeperActionSuggestionRow);
}
