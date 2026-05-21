"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CommunicationThread,
  GateKeeperActionSuggestionStatus,
  GateKeeperSubjectType
} from "@floorconnector/types";

import { getOrCreateCommunicationThread } from "@/lib/communications/data";
import {
  buildGateKeeperInternalNoteAdapterResult,
  type GateKeeperInternalNoteInput,
  type GateKeeperInternalNoteType
} from "@/lib/gatekeeper/internal-note-adapter";
import {
  buildGateKeeperManualSeedPlanFromAdapterResult,
  buildGateKeeperManualSourceAdapterResult,
  type GateKeeperManualSeedInput,
  type GateKeeperManualSeedPlan
} from "@/lib/gatekeeper/manual-seed";
import {
  buildGateKeeperDemoFixturePlan,
  getGateKeeperDemoFixture
} from "@/lib/gatekeeper/demo-fixtures";
import {
  buildGateKeeperCreateOpportunityLedgerDraft,
  type GateKeeperCreateOpportunityLedgerDraft
} from "@/lib/gatekeeper/create-opportunity-execution-draft";
import {
  buildGateKeeperCreateOpportunityExecutionRequestUpdate,
  getGateKeeperCreateOpportunityExecutionRequestEligibility
} from "@/lib/gatekeeper/create-opportunity-execution-request";
import {
  buildGateKeeperCreateOpportunityExecutedLedgerUpdate,
  buildGateKeeperCreateOpportunityFailedLedgerUpdate,
  getGateKeeperCreateOpportunityExecutionEligibility,
  mapGateKeeperCreateOpportunityDraftToCanonicalInput
} from "@/lib/gatekeeper/create-opportunity-execution";
import { getGateKeeperCreateOpportunityDuplicatePreviewForDraft } from "@/lib/gatekeeper/create-opportunity-duplicates-data";
import {
  buildGateKeeperCreateOpportunityPreflight,
  buildGateKeeperCreateOpportunitySavedDraftAttempt
} from "@/lib/gatekeeper/create-opportunity-preflight";
import { createCanonicalOpportunityFromValidatedInput } from "@/lib/opportunities/create-opportunity-service";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createGateKeeperActionSuggestion,
  createGateKeeperArtifact,
  reviewGateKeeperActionSuggestion,
  reviewGateKeeperArtifact
} from "./memory";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getReturnTo(formData: FormData) {
  const returnTo = getFieldValue(formData, "returnTo");

  return returnTo.startsWith("/") ? returnTo : "/gatekeeper";
}

function buildRedirect(returnTo: string, params: Record<string, string>) {
  const [pathname, query = ""] = returnTo.split("?");
  const searchParams = new URLSearchParams(query);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const search = searchParams.toString();

  return search ? `${pathname}?${search}` : pathname;
}

function revalidateGateKeeperSurfaces(returnTo: string) {
  revalidatePath("/gatekeeper");
  revalidatePath(returnTo.split("?")[0] || "/gatekeeper");
}

function getOptionalFieldValue(formData: FormData, key: string) {
  const value = getFieldValue(formData, key).trim();

  return value.length > 0 ? value : null;
}

function getManualSeedReturnTo() {
  return "/gatekeeper?view=memory&status=proposed";
}

async function resolveGateKeeperSubjectThreadContext(input: {
  organizationId: string;
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
}) {
  if (!input.subjectType || !input.subjectId) {
    return null;
  }

  if (input.subjectType === "opportunity") {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("opportunities")
      .select("id, customer_id, project_id")
      .eq("company_id", input.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
    const opportunity = response.data as {
      id: string;
      customer_id: string | null;
      project_id: string | null;
    } | null;

    if (response.error) {
      throw new Error(
        `Unable to inspect linked opportunity: ${response.error.message}`
      );
    }

    if (!opportunity) {
      throw new Error("GateKeeper linked opportunity was not found.");
    }

    return {
      opportunityId: input.subjectId,
      appointmentId: null,
      customerId: opportunity.customer_id,
      projectId: opportunity.project_id,
      subjectType: "opportunity" as const,
      subjectId: input.subjectId
    };
  }

  if (input.subjectType === "customer") {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("customers")
      .select("id")
      .eq("company_id", input.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
    const customer = response.data as { id: string } | null;

    if (response.error) {
      throw new Error(
        `Unable to inspect linked customer: ${response.error.message}`
      );
    }

    if (!customer) {
      throw new Error("GateKeeper linked customer was not found.");
    }

    return {
      opportunityId: null,
      appointmentId: null,
      customerId: input.subjectId,
      projectId: null,
      subjectType: "customer" as const,
      subjectId: input.subjectId
    };
  }

  if (input.subjectType === "project") {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("projects")
      .select("id, customer_id")
      .eq("company_id", input.organizationId)
      .eq("id", input.subjectId)
      .maybeSingle();
    const project = response.data as {
      id: string;
      customer_id: string | null;
    } | null;

    if (response.error) {
      throw new Error(
        `Unable to inspect linked project: ${response.error.message}`
      );
    }

    if (!project?.customer_id) {
      return null;
    }

    return {
      opportunityId: null,
      appointmentId: null,
      customerId: project.customer_id,
      projectId: project.id,
      subjectType: "project" as const,
      subjectId: project.id
    };
  }

  return null;
}

async function createManualSeedCommunicationMessage(input: {
  plan: GateKeeperManualSeedPlan;
  thread: CommunicationThread;
  userId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_messages")
    .insert({
      company_id: input.thread.organizationId,
      thread_id: input.thread.id,
      opportunity_id: input.thread.opportunityId,
      appointment_id: input.thread.appointmentId,
      customer_id: input.thread.customerId,
      project_id: input.thread.projectId,
      sender_type: "organization_user",
      sender_user_id: input.userId,
      direction: input.plan.communication.direction,
      source_kind: "human",
      channel_kind: input.plan.communication.channelKind,
      message_kind: input.plan.communication.messageKind,
      visibility: "internal",
      delivery_status: "logged",
      body: input.plan.body,
      payload: {
        gatekeeperManualSeed: true,
        gatekeeperSourceAdapter: true,
        sourceFamily: input.plan.sourceFamily,
        sourceType: input.plan.sourceType,
        idempotencyKey: input.plan.adapterResult.event.idempotencyKey,
        customerName: input.plan.customerName || null,
        customerPhone: input.plan.customerPhone || null,
        customerEmail: input.plan.customerEmail || null,
        requestedService: input.plan.requestedService || null,
        requestedAppointment: input.plan.requestedAppointment || null,
        notes: input.plan.notes || null
      }
    })
    .select("id, created_at")
    .single();
  const message = response.data as { id: string; created_at: string } | null;

  if (response.error || !message) {
    throw new Error(
      `Unable to create GateKeeper manual communication message: ${
        response.error?.message ?? "Insert failed."
      }`
    );
  }

  const preview =
    input.plan.body.length > 140
      ? `${input.plan.body.slice(0, 137)}...`
      : input.plan.body;
  const updateThreadResponse = await supabase
    .from("communication_threads")
    .update({
      channel_kind: input.plan.communication.channelKind,
      thread_category: "operational",
      thread_status: "open",
      last_message_at: message.created_at,
      last_message_preview: preview,
      last_message_visibility: "internal"
    })
    .eq("company_id", input.thread.organizationId)
    .eq("id", input.thread.id);

  if (updateThreadResponse.error) {
    throw new Error(
      `Unable to update GateKeeper manual communication thread: ${updateThreadResponse.error.message}`
    );
  }

  return message.id;
}

async function createInternalNoteCommunicationMessage(input: {
  adapterResult: ReturnType<typeof buildGateKeeperInternalNoteAdapterResult>;
  thread: CommunicationThread;
  userId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_messages")
    .insert({
      company_id: input.thread.organizationId,
      thread_id: input.thread.id,
      opportunity_id: input.thread.opportunityId,
      appointment_id: input.thread.appointmentId,
      customer_id: input.thread.customerId,
      project_id: input.thread.projectId,
      sender_type: "organization_user",
      sender_user_id: input.userId,
      direction: "internal",
      source_kind: "human",
      channel_kind: "internal_note",
      message_kind: "internal_note",
      visibility: "internal",
      delivery_status: "logged",
      body: input.adapterResult.internalNote.noteText,
      payload: {
        gatekeeperInternalNote: true,
        gatekeeperSourceAdapter: true,
        sourceFamily: input.adapterResult.event.sourceFamily,
        noteType: input.adapterResult.internalNote.noteType,
        idempotencyKey: input.adapterResult.event.idempotencyKey,
        reviewOnly: true
      }
    })
    .select("id, created_at")
    .single();
  const message = response.data as { id: string; created_at: string } | null;

  if (response.error || !message) {
    throw new Error(
      `Unable to create GateKeeper internal note communication message: ${
        response.error?.message ?? "Insert failed."
      }`
    );
  }

  const body = input.adapterResult.internalNote.noteText;
  const preview = body.length > 140 ? `${body.slice(0, 137)}...` : body;
  const updateThreadResponse = await supabase
    .from("communication_threads")
    .update({
      channel_kind: "internal_note",
      thread_category: "operational",
      thread_status: "open",
      last_message_at: message.created_at,
      last_message_preview: preview,
      last_message_visibility: "internal"
    })
    .eq("company_id", input.thread.organizationId)
    .eq("id", input.thread.id);

  if (updateThreadResponse.error) {
    throw new Error(
      `Unable to update GateKeeper internal note communication thread: ${updateThreadResponse.error.message}`
    );
  }

  return message.id;
}

async function seedGateKeeperPlan(input: {
  plan: GateKeeperManualSeedPlan;
  userId: string;
  organizationId: string;
}) {
  const threadContext = await resolveGateKeeperSubjectThreadContext({
    organizationId: input.organizationId,
    subjectType: input.plan.subjectType,
    subjectId: input.plan.subjectId
  });
  const thread = threadContext
    ? await getOrCreateCommunicationThread(
        {
          organizationId: input.organizationId,
          ...threadContext
        },
        "/gatekeeper"
      )
    : null;
  const messageId = thread
    ? await createManualSeedCommunicationMessage({
        plan: input.plan,
        thread,
        userId: input.userId
      })
    : null;
  const subjectLink = {
    subjectType: input.plan.subjectType,
    subjectId: input.plan.subjectId
  };
  const createdArtifacts = [];

  for (const artifact of input.plan.artifacts) {
    createdArtifacts.push(
      await createGateKeeperArtifact({
        ...subjectLink,
        communicationThreadId: thread?.id ?? null,
        communicationMessageId: messageId,
        artifactType: artifact.artifactType,
        contentText: artifact.contentText,
        content: artifact.content,
        confidence: null
      })
    );
  }

  const sourceArtifactId = createdArtifacts[0]?.id ?? null;

  for (const suggestion of input.plan.suggestions) {
    await createGateKeeperActionSuggestion({
      ...subjectLink,
      sourceArtifactId,
      communicationThreadId: thread?.id ?? null,
      communicationMessageId: messageId,
      suggestionType: suggestion.suggestionType,
      title: suggestion.title,
      rationale: suggestion.rationale,
      proposedPayload: suggestion.proposedPayload
    });
  }
}

async function seedGateKeeperInternalNote(input: {
  adapterResult: ReturnType<typeof buildGateKeeperInternalNoteAdapterResult>;
  userId: string;
  organizationId: string;
  returnTo: string;
}) {
  const threadContext = await resolveGateKeeperSubjectThreadContext({
    organizationId: input.organizationId,
    subjectType: input.adapterResult.internalNote.subjectType,
    subjectId: input.adapterResult.internalNote.subjectId
  });
  const thread = threadContext
    ? await getOrCreateCommunicationThread(
        {
          organizationId: input.organizationId,
          ...threadContext
        },
        input.returnTo
      )
    : null;
  const messageId = thread
    ? await createInternalNoteCommunicationMessage({
        adapterResult: input.adapterResult,
        thread,
        userId: input.userId
      })
    : null;
  const subjectLink = {
    subjectType: input.adapterResult.internalNote.subjectType,
    subjectId: input.adapterResult.internalNote.subjectId
  };
  const createdArtifacts = [];

  for (const artifact of input.adapterResult.artifacts) {
    createdArtifacts.push(
      await createGateKeeperArtifact({
        ...subjectLink,
        communicationThreadId: thread?.id ?? null,
        communicationMessageId: messageId,
        artifactType: artifact.artifactType,
        contentText: artifact.contentText ?? null,
        content: artifact.content,
        confidence: artifact.confidence ?? null
      })
    );
  }

  const sourceArtifactId = createdArtifacts[0]?.id ?? null;

  for (const suggestion of input.adapterResult.suggestions) {
    await createGateKeeperActionSuggestion({
      ...subjectLink,
      sourceArtifactId,
      communicationThreadId: thread?.id ?? null,
      communicationMessageId: messageId,
      suggestionType: suggestion.suggestionType,
      title: suggestion.title,
      rationale: suggestion.rationale,
      proposedPayload: suggestion.proposedPayload
    });
  }
}

async function getGateKeeperManualSeedContext() {
  const user = await requireAuthenticatedUser("/gatekeeper");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("GateKeeper seed requires an active organization.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

async function reviewArtifact(
  formData: FormData,
  reviewStatus: "accepted" | "rejected" | "dismissed",
  successMessage: string
) {
  const returnTo = getReturnTo(formData);
  const artifactId = getFieldValue(formData, "artifactId");

  if (!artifactId) {
    redirect(
      buildRedirect(returnTo, { error: "Select a GateKeeper artifact." })
    );
  }

  try {
    await reviewGateKeeperArtifact({
      artifactId,
      reviewStatus
    });
    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to review GateKeeper artifact."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: successMessage }));
}

async function reviewSuggestion(
  formData: FormData,
  status: "approved" | "rejected" | "dismissed",
  successMessage: string
) {
  const returnTo = getReturnTo(formData);
  const suggestionId = getFieldValue(formData, "suggestionId");

  if (!suggestionId) {
    redirect(
      buildRedirect(returnTo, { error: "Select a GateKeeper suggestion." })
    );
  }

  try {
    await reviewGateKeeperActionSuggestion({
      suggestionId,
      status
    });
    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to review GateKeeper suggestion."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: successMessage }));
}

type GateKeeperCreateOpportunitySuggestionRow = {
  id: string;
  company_id: string;
  source_artifact_id: string | null;
  communication_thread_id: string | null;
  communication_message_id: string | null;
  suggestion_type: string;
  proposed_payload: Record<string, unknown>;
  status: GateKeeperActionSuggestionStatus;
};

type GateKeeperCreateOpportunityExecutionAttemptRow = {
  id: string;
  company_id: string;
  suggestion_id: string;
  action_type: string;
  execution_owner: string;
  risk_tier: string;
  status: string;
  idempotency_key: string;
  executed_at: string | null;
  executed_by: string | null;
  execution_error: string | null;
  requested_at: string | null;
  requested_by: string | null;
  result_subject_id: string | null;
  result_subject_type: string | null;
  validated_payload: unknown;
  validation_errors: unknown;
  created_at: string;
  updated_at: string;
};

function getCreateOpportunityConfirmationDraftFromForm(formData: FormData) {
  return {
    contactName: getFieldValue(formData, "contactName"),
    phone: getFieldValue(formData, "phone"),
    email: getFieldValue(formData, "email"),
    requestedService: getFieldValue(formData, "requestedService"),
    locationText: getFieldValue(formData, "locationText"),
    notes: getFieldValue(formData, "notes"),
    requestedAppointmentText: getFieldValue(
      formData,
      "requestedAppointmentText"
    ),
    sourceLabel: getFieldValue(formData, "sourceLabel")
  };
}

async function saveCreateOpportunityLedgerDraft(input: {
  companyId: string;
  draft: GateKeeperCreateOpportunityLedgerDraft;
  userId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("gatekeeper_execution_attempts")
    .select("id, status")
    .eq("company_id", input.companyId)
    .eq("idempotency_key", input.draft.idempotencyKey)
    .maybeSingle();
  const existing = existingResponse.data as {
    id: string;
    status: string;
  } | null;

  if (existingResponse.error) {
    throw new Error(
      `Unable to inspect GateKeeper execution draft: ${existingResponse.error.message}`
    );
  }

  if (
    existing &&
    !["draft", "confirmation_started", "validation_failed"].includes(
      existing.status
    )
  ) {
    throw new Error(
      "This GateKeeper execution attempt is no longer editable as a confirmation draft."
    );
  }

  const row = {
    source_artifact_id: input.draft.sourceArtifactId,
    source_thread_id: input.draft.sourceThreadId,
    source_message_id: input.draft.sourceMessageId,
    action_type: input.draft.actionType,
    execution_owner: input.draft.executionOwner,
    risk_tier: input.draft.riskTier,
    status: input.draft.status,
    proposed_payload_snapshot: input.draft.proposedPayloadSnapshot,
    validated_payload: input.draft.validatedPayload,
    validation_errors: input.draft.validationErrors,
    execution_error: null,
    result_subject_type: null,
    result_subject_id: null,
    metadata: input.draft.metadata,
    updated_by: input.userId
  };

  const response = existing
    ? await supabase
        .from("gatekeeper_execution_attempts")
        .update(row)
        .eq("company_id", input.companyId)
        .eq("id", existing.id)
    : await supabase.from("gatekeeper_execution_attempts").insert({
        ...row,
        company_id: input.companyId,
        suggestion_id: input.draft.suggestionId,
        idempotency_key: input.draft.idempotencyKey,
        created_by: input.userId
      });

  if (response.error) {
    throw new Error(
      `Unable to save GateKeeper execution draft: ${response.error.message}`
    );
  }
}

export async function acceptGateKeeperArtifactAction(formData: FormData) {
  await reviewArtifact(formData, "accepted", "GateKeeper artifact accepted.");
}

export async function rejectGateKeeperArtifactAction(formData: FormData) {
  await reviewArtifact(formData, "rejected", "GateKeeper artifact rejected.");
}

export async function dismissGateKeeperArtifactAction(formData: FormData) {
  await reviewArtifact(formData, "dismissed", "GateKeeper artifact dismissed.");
}

export async function approveGateKeeperSuggestionReviewAction(
  formData: FormData
) {
  await reviewSuggestion(
    formData,
    "approved",
    "GateKeeper suggestion review approved. No action was executed."
  );
}

export async function rejectGateKeeperSuggestionAction(formData: FormData) {
  await reviewSuggestion(
    formData,
    "rejected",
    "GateKeeper suggestion rejected."
  );
}

export async function dismissGateKeeperSuggestionAction(formData: FormData) {
  await reviewSuggestion(
    formData,
    "dismissed",
    "GateKeeper suggestion dismissed."
  );
}

export async function saveCreateOpportunityExecutionDraftAction(
  formData: FormData
) {
  const returnTo = getReturnTo(formData);
  const suggestionId = getFieldValue(formData, "suggestionId");

  if (!suggestionId) {
    redirect(
      buildRedirect(returnTo, {
        error: "Select a GateKeeper create-opportunity suggestion."
      })
    );
  }

  try {
    const context = await getGateKeeperManualSeedContext();
    const supabase = await getSupabaseServerClient();
    const suggestionResponse = await supabase
      .from("gatekeeper_action_suggestions")
      .select(
        "id, company_id, source_artifact_id, communication_thread_id, communication_message_id, suggestion_type, proposed_payload, status"
      )
      .eq("company_id", context.organizationId)
      .eq("id", suggestionId)
      .maybeSingle();
    const suggestion =
      suggestionResponse.data as GateKeeperCreateOpportunitySuggestionRow | null;

    if (suggestionResponse.error) {
      throw new Error(
        `Unable to inspect GateKeeper suggestion: ${suggestionResponse.error.message}`
      );
    }

    if (!suggestion) {
      throw new Error("GateKeeper suggestion was not found.");
    }

    if (suggestion.suggestion_type !== "create_opportunity") {
      throw new Error(
        "Only create_opportunity suggestions can save an opportunity confirmation draft."
      );
    }

    if (!["proposed", "approved"].includes(suggestion.status)) {
      throw new Error(
        "Only proposed or approved GateKeeper create-opportunity suggestions can save confirmation drafts."
      );
    }

    const draft = buildGateKeeperCreateOpportunityLedgerDraft({
      draft: getCreateOpportunityConfirmationDraftFromForm(formData),
      suggestion: {
        id: suggestion.id,
        sourceArtifactId: suggestion.source_artifact_id,
        communicationThreadId: suggestion.communication_thread_id,
        communicationMessageId: suggestion.communication_message_id,
        suggestionType: "create_opportunity",
        status: suggestion.status,
        proposedPayload: suggestion.proposed_payload
      }
    });

    await saveCreateOpportunityLedgerDraft({
      companyId: context.organizationId,
      draft,
      userId: context.userId
    });
    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save GateKeeper execution draft."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message:
        "GateKeeper execution draft saved to the ledger. No opportunity was created."
    })
  );
}

export async function requestCreateOpportunityExecutionAction(
  formData: FormData
) {
  const returnTo = getReturnTo(formData);
  const executionAttemptId = getFieldValue(formData, "executionAttemptId");

  if (!executionAttemptId) {
    redirect(
      buildRedirect(returnTo, {
        error: "Select a GateKeeper execution draft."
      })
    );
  }

  try {
    const context = await getGateKeeperManualSeedContext();
    const supabase = await getSupabaseServerClient();
    const attemptResponse = await supabase
      .from("gatekeeper_execution_attempts")
      .select(
        "id, company_id, suggestion_id, action_type, execution_owner, risk_tier, status, idempotency_key, requested_at, requested_by, executed_at, executed_by, result_subject_type, result_subject_id, validated_payload, validation_errors, execution_error, created_at, updated_at"
      )
      .eq("company_id", context.organizationId)
      .eq("id", executionAttemptId)
      .maybeSingle();
    const attempt =
      attemptResponse.data as GateKeeperCreateOpportunityExecutionAttemptRow | null;

    if (attemptResponse.error) {
      throw new Error(
        `Unable to inspect GateKeeper execution draft: ${attemptResponse.error.message}`
      );
    }

    if (!attempt) {
      throw new Error("GateKeeper execution draft was not found.");
    }

    if (attempt.action_type !== "create_opportunity") {
      throw new Error(
        "Only create_opportunity execution drafts can request this transition."
      );
    }

    if (
      attempt.execution_owner !== "opportunities" ||
      attempt.risk_tier !== "medium_internal"
    ) {
      throw new Error(
        "GateKeeper create-opportunity execution draft policy is not configured."
      );
    }

    const savedDraft = buildGateKeeperCreateOpportunitySavedDraftAttempt({
      id: attempt.id,
      suggestionId: attempt.suggestion_id,
      status: attempt.status,
      idempotencyKey: attempt.idempotency_key,
      requestedAt: attempt.requested_at,
      requestedBy: attempt.requested_by,
      executedAt: attempt.executed_at,
      executedBy: attempt.executed_by,
      executionError: attempt.execution_error,
      resultSubjectId: attempt.result_subject_id,
      resultSubjectType: attempt.result_subject_type,
      validatedPayload: attempt.validated_payload,
      validationErrors: attempt.validation_errors,
      createdAt: attempt.created_at,
      updatedAt: attempt.updated_at
    });

    if (!savedDraft) {
      throw new Error(
        "GateKeeper execution draft payload is not a valid create-opportunity confirmation draft."
      );
    }

    const suggestionResponse = await supabase
      .from("gatekeeper_action_suggestions")
      .select(
        "id, company_id, source_artifact_id, communication_thread_id, communication_message_id, suggestion_type, proposed_payload, status"
      )
      .eq("company_id", context.organizationId)
      .eq("id", attempt.suggestion_id)
      .maybeSingle();
    const suggestion =
      suggestionResponse.data as GateKeeperCreateOpportunitySuggestionRow | null;

    if (suggestionResponse.error) {
      throw new Error(
        `Unable to inspect GateKeeper suggestion: ${suggestionResponse.error.message}`
      );
    }

    if (!suggestion) {
      throw new Error("GateKeeper suggestion was not found.");
    }

    if (suggestion.suggestion_type !== "create_opportunity") {
      throw new Error(
        "Only create_opportunity suggestions can request future execution."
      );
    }

    const duplicatePreview =
      await getGateKeeperCreateOpportunityDuplicatePreviewForDraft({
        draft: savedDraft.draft,
        excludeExecutionAttemptId: savedDraft.id,
        suggestionId: savedDraft.suggestionId
      });
    const preflight = buildGateKeeperCreateOpportunityPreflight({
      duplicatePreview,
      savedDraft
    });
    const eligibility =
      getGateKeeperCreateOpportunityExecutionRequestEligibility({
        preflight,
        suggestionStatus: suggestion.status
      });

    if (!eligibility.canRequestExecution) {
      throw new Error(
        eligibility.blockers.map((blocker) => blocker.message).join(" ")
      );
    }

    const requestedAt = new Date().toISOString();
    const updateResponse = await supabase
      .from("gatekeeper_execution_attempts")
      .update(
        buildGateKeeperCreateOpportunityExecutionRequestUpdate({
          requestedAt,
          userId: context.userId
        })
      )
      .eq("company_id", context.organizationId)
      .eq("id", attempt.id)
      .in("status", ["draft", "confirmation_started"])
      .select("id")
      .single();

    if (updateResponse.error || !updateResponse.data) {
      throw new Error(
        `Unable to request GateKeeper future execution: ${
          updateResponse.error?.message ??
          "The execution draft was no longer requestable."
        }`
      );
    }

    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to request GateKeeper future execution."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message:
        "GateKeeper execution requested in the ledger. No opportunity was created."
    })
  );
}

export async function executeCreateOpportunityFromGateKeeperAction(
  formData: FormData
) {
  const returnTo = getReturnTo(formData);
  const executionAttemptId = getFieldValue(formData, "executionAttemptId");
  let createdOpportunity: Awaited<
    ReturnType<typeof createCanonicalOpportunityFromValidatedInput>
  > | null = null;

  if (!executionAttemptId) {
    redirect(
      buildRedirect(returnTo, {
        error: "Select a GateKeeper execution request."
      })
    );
  }

  try {
    const context = await getGateKeeperManualSeedContext();
    const supabase = await getSupabaseServerClient();
    const attemptResponse = await supabase
      .from("gatekeeper_execution_attempts")
      .select(
        "id, company_id, suggestion_id, action_type, execution_owner, risk_tier, status, idempotency_key, requested_at, requested_by, executed_at, executed_by, result_subject_type, result_subject_id, validated_payload, validation_errors, execution_error, created_at, updated_at"
      )
      .eq("company_id", context.organizationId)
      .eq("id", executionAttemptId)
      .maybeSingle();
    const attempt =
      attemptResponse.data as GateKeeperCreateOpportunityExecutionAttemptRow | null;

    if (attemptResponse.error) {
      throw new Error(
        `Unable to inspect GateKeeper execution request: ${attemptResponse.error.message}`
      );
    }

    if (!attempt) {
      throw new Error("GateKeeper execution request was not found.");
    }

    if (attempt.action_type !== "create_opportunity") {
      throw new Error(
        "Only create_opportunity execution requests can create an opportunity."
      );
    }

    if (
      attempt.execution_owner !== "opportunities" ||
      attempt.risk_tier !== "medium_internal"
    ) {
      throw new Error(
        "GateKeeper create-opportunity execution policy is not configured."
      );
    }

    if (attempt.status !== "execution_requested") {
      if (attempt.status === "executed") {
        throw new Error(
          "This GateKeeper execution request already created an opportunity. Open the linked result instead of running it again."
        );
      }

      if (attempt.status === "failed") {
        throw new Error(
          "This GateKeeper execution request failed. Retry requires a future explicit reset/retry policy."
        );
      }

      throw new Error(
        "GateKeeper create-opportunity execution requires an execution_requested ledger row."
      );
    }

    if (attempt.result_subject_id || attempt.result_subject_type) {
      throw new Error(
        "This GateKeeper execution request already links to a canonical record."
      );
    }

    const savedDraft = buildGateKeeperCreateOpportunitySavedDraftAttempt({
      id: attempt.id,
      suggestionId: attempt.suggestion_id,
      status: attempt.status,
      idempotencyKey: attempt.idempotency_key,
      requestedAt: attempt.requested_at,
      requestedBy: attempt.requested_by,
      executedAt: attempt.executed_at,
      executedBy: attempt.executed_by,
      executionError: attempt.execution_error,
      resultSubjectId: attempt.result_subject_id,
      resultSubjectType: attempt.result_subject_type,
      validatedPayload: attempt.validated_payload,
      validationErrors: attempt.validation_errors,
      createdAt: attempt.created_at,
      updatedAt: attempt.updated_at
    });

    if (!savedDraft) {
      throw new Error(
        "GateKeeper execution request payload is not a valid create-opportunity confirmation draft."
      );
    }

    const suggestionResponse = await supabase
      .from("gatekeeper_action_suggestions")
      .select(
        "id, company_id, source_artifact_id, communication_thread_id, communication_message_id, suggestion_type, proposed_payload, status"
      )
      .eq("company_id", context.organizationId)
      .eq("id", attempt.suggestion_id)
      .maybeSingle();
    const suggestion =
      suggestionResponse.data as GateKeeperCreateOpportunitySuggestionRow | null;

    if (suggestionResponse.error) {
      throw new Error(
        `Unable to inspect GateKeeper suggestion: ${suggestionResponse.error.message}`
      );
    }

    if (!suggestion) {
      throw new Error("GateKeeper suggestion was not found.");
    }

    if (suggestion.suggestion_type !== "create_opportunity") {
      throw new Error(
        "Only create_opportunity suggestions can create an opportunity."
      );
    }

    const duplicatePreview =
      await getGateKeeperCreateOpportunityDuplicatePreviewForDraft({
        draft: savedDraft.draft,
        excludeExecutionAttemptId: savedDraft.id,
        suggestionId: savedDraft.suggestionId
      });
    const preflight = buildGateKeeperCreateOpportunityPreflight({
      duplicatePreview,
      savedDraft
    });
    const eligibility = getGateKeeperCreateOpportunityExecutionEligibility({
      preflight,
      suggestionStatus: suggestion.status
    });

    if (!eligibility.canExecute) {
      throw new Error(
        eligibility.blockers.map((blocker) => blocker.message).join(" ")
      );
    }

    try {
      createdOpportunity = await createCanonicalOpportunityFromValidatedInput(
        mapGateKeeperCreateOpportunityDraftToCanonicalInput(preflight)
      );
    } catch (error) {
      const failedResponse = await supabase
        .from("gatekeeper_execution_attempts")
        .update(
          buildGateKeeperCreateOpportunityFailedLedgerUpdate({
            error,
            userId: context.userId
          })
        )
        .eq("company_id", context.organizationId)
        .eq("id", attempt.id)
        .eq("status", "execution_requested")
        .is("result_subject_id", null);

      if (failedResponse.error) {
        throw new Error(
          `Opportunity creation failed and GateKeeper could not record the failure: ${failedResponse.error.message}`
        );
      }

      throw error;
    }

    const executedAt = new Date().toISOString();
    const updateResponse = await supabase
      .from("gatekeeper_execution_attempts")
      .update(
        buildGateKeeperCreateOpportunityExecutedLedgerUpdate({
          executedAt,
          opportunityId: createdOpportunity.id,
          userId: context.userId
        })
      )
      .eq("company_id", context.organizationId)
      .eq("id", attempt.id)
      .eq("status", "execution_requested")
      .is("result_subject_id", null)
      .select("id")
      .single();

    if (updateResponse.error || !updateResponse.data) {
      throw new Error(
        `Opportunity ${createdOpportunity.title} was created, but GateKeeper could not link the execution ledger result. Do not retry until the ledger linkage is inspected.`
      );
    }

    revalidateGateKeeperSurfaces(returnTo);
    revalidatePath("/leads");
    revalidatePath(createdOpportunity.href);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to execute GateKeeper create-opportunity request."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message: `${createdOpportunity.title} was created through GateKeeper controlled execution.`,
      createdOpportunityId: createdOpportunity.id
    })
  );
}

export async function createGateKeeperInternalNoteAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  let noteInput: Omit<GateKeeperInternalNoteInput, "organizationId">;

  try {
    noteInput = {
      subjectType: getFieldValue(
        formData,
        "subjectType"
      ) as GateKeeperSubjectType,
      subjectId: getFieldValue(formData, "subjectId"),
      noteType: getOptionalFieldValue(
        formData,
        "noteType"
      ) as GateKeeperInternalNoteType | null,
      noteText: getFieldValue(formData, "noteText")
    };

    buildGateKeeperInternalNoteAdapterResult({
      ...noteInput,
      organizationId: "internal-note-validation",
      occurredAt: "1970-01-01T00:00:00.000Z"
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare GateKeeper internal note."
      })
    );
  }

  try {
    const context = await getGateKeeperManualSeedContext();
    const adapterResult = buildGateKeeperInternalNoteAdapterResult({
      ...noteInput,
      organizationId: context.organizationId
    });

    await seedGateKeeperInternalNote({
      adapterResult,
      userId: context.userId,
      organizationId: context.organizationId,
      returnTo
    });
    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create GateKeeper internal note."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message:
        "GateKeeper internal note added for review. No canonical action was executed."
    })
  );
}

export async function seedGateKeeperManualIntakeAction(formData: FormData) {
  const returnTo = getManualSeedReturnTo();
  let manualInput: GateKeeperManualSeedInput;

  try {
    manualInput = {
      sourceType: getFieldValue(
        formData,
        "sourceType"
      ) as GateKeeperManualSeedInput["sourceType"],
      body: getFieldValue(formData, "body"),
      customerName: getOptionalFieldValue(formData, "customerName"),
      customerPhone: getOptionalFieldValue(formData, "customerPhone"),
      customerEmail: getOptionalFieldValue(formData, "customerEmail"),
      requestedService: getOptionalFieldValue(formData, "requestedService"),
      requestedAppointment: getOptionalFieldValue(
        formData,
        "requestedAppointment"
      ),
      notes: getOptionalFieldValue(formData, "notes"),
      subjectType: getOptionalFieldValue(
        formData,
        "subjectType"
      ) as GateKeeperSubjectType | null,
      subjectId: getOptionalFieldValue(formData, "subjectId")
    };

    buildGateKeeperManualSourceAdapterResult({
      ...manualInput,
      organizationId: "manual-seed-validation",
      occurredAt: "1970-01-01T00:00:00.000Z"
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare GateKeeper manual seed."
      })
    );
  }

  try {
    const context = await getGateKeeperManualSeedContext();
    const adapterResult = buildGateKeeperManualSourceAdapterResult({
      ...manualInput,
      organizationId: context.organizationId
    });
    const plan = buildGateKeeperManualSeedPlanFromAdapterResult(adapterResult);

    await seedGateKeeperPlan({
      plan,
      userId: context.userId,
      organizationId: context.organizationId
    });
    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to seed GateKeeper manual intake."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message:
        "Manual GateKeeper intake seeded for review. No canonical action was executed."
    })
  );
}

export async function seedGateKeeperDemoFixtureAction(formData: FormData) {
  const returnTo = getManualSeedReturnTo();
  const fixtureKey = getFieldValue(formData, "fixtureKey");
  const fixture = getGateKeeperDemoFixture(fixtureKey);

  if (!fixture) {
    redirect(
      buildRedirect(returnTo, {
        error: "Select a valid GateKeeper demo example."
      })
    );
  }

  try {
    const context = await getGateKeeperManualSeedContext();
    const plan = buildGateKeeperDemoFixturePlan(fixture.key, {
      organizationId: context.organizationId
    });

    await seedGateKeeperPlan({
      plan,
      userId: context.userId,
      organizationId: context.organizationId
    });
    revalidateGateKeeperSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to seed GateKeeper demo example."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message: `${fixture.title} demo seeded for review. No canonical action was executed.`
    })
  );
}
