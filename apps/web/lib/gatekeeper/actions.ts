"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CommunicationThread,
  GateKeeperSubjectType
} from "@floorconnector/types";

import { getOrCreateCommunicationThread } from "@/lib/communications/data";
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

async function resolveManualSeedThreadContext(input: {
  organizationId: string;
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
}) {
  if (!input.subjectType || !input.subjectId) {
    return null;
  }

  if (input.subjectType === "opportunity") {
    return {
      opportunityId: input.subjectId,
      appointmentId: null,
      customerId: null,
      projectId: null,
      subjectType: "opportunity" as const,
      subjectId: input.subjectId
    };
  }

  if (input.subjectType === "customer") {
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

async function seedGateKeeperPlan(input: {
  plan: GateKeeperManualSeedPlan;
  userId: string;
  organizationId: string;
}) {
  const threadContext = await resolveManualSeedThreadContext({
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
