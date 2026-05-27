"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  buildAiCopilotCommunicationPayload,
  type AiCopilotCommunicationHandoff
} from "@/lib/ai-operational-copilot/communication-handoff";
import {
  markAllCommunicationNotificationsRead,
  markCommunicationThreadNotificationsRead
} from "@/lib/notifications/system";

import {
  createRecordLinkedCommunicationMessage,
  createOpportunityManualCommunicationMessage,
  postCommunicationMessage
} from "./data";
import { assertPortalProjectCommunicationThreadCanReceiveReply } from "./portal-project-data";
import {
  createAppointmentConfirmationLog as logAppointmentConfirmation,
  sendAppointmentConfirmationEmail
} from "./appointment-confirmations";
import { sendAppointmentReminderEmail } from "./appointment-reminders";
import { upsertCustomerAppointmentReminderPreference } from "./communication-preferences";
import { customerAppointmentReminderPreferenceInputSchema } from "./communication-preferences-schema";
import { opportunityManualCommunicationInputSchema } from "./schemas";

const appointmentConfirmationLogInputSchema = z.object({
  appointmentId: z.string().uuid("A valid appointment is required."),
  body: z
    .string()
    .trim()
    .min(1, "Confirmation content cannot be empty.")
    .max(5_000, "Confirmation content must stay under 5,000 characters.")
});

const appointmentConfirmationEmailInputSchema = z.object({
  appointmentId: z.string().uuid("A valid appointment is required."),
  recipientEmail: z.string().trim().email("Select a valid email recipient."),
  communicationMessageId: z
    .string()
    .trim()
    .uuid("A valid confirmation message is required.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  body: z
    .string()
    .trim()
    .min(1, "Confirmation content cannot be empty.")
    .max(5_000, "Confirmation content must stay under 5,000 characters.")
    .optional()
    .or(z.literal("").transform(() => undefined))
});

const appointmentReminderEmailInputSchema = z.object({
  appointmentId: z.string().uuid("A valid appointment is required."),
  recipientEmail: z.string().trim().email("Select a valid email recipient."),
  communicationMessageId: z
    .string()
    .trim()
    .uuid("A valid reminder message is required.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  body: z
    .string()
    .trim()
    .min(1, "Reminder content cannot be empty.")
    .max(5_000, "Reminder content must stay under 5,000 characters.")
    .optional()
    .or(z.literal("").transform(() => undefined))
});

const customerAppointmentReminderPreferenceActionSchema =
  customerAppointmentReminderPreferenceInputSchema.extend({
    returnTo: z
      .string()
      .trim()
      .optional()
      .transform((value) =>
        value && value.startsWith("/customers/") ? value : undefined
      )
  });

const communicationReplyInputSchema = z.object({
  threadId: z.string().uuid("A valid communication thread is required."),
  visibility: z.enum(["internal", "customer_visible"]).default("internal"),
  body: z
    .string()
    .trim()
    .min(1, "Reply message cannot be empty.")
    .max(5_000, "Reply messages must stay under 5,000 characters."),
  q: z.string().optional(),
  view: z.enum(["all", "needs_response", "unread", "recent"]).optional(),
  source: z
    .enum([
      "all",
      "opportunity",
      "appointment",
      "customer",
      "project",
      "estimate",
      "contract",
      "invoice",
      "change_order",
      "payment"
    ])
    .optional(),
  copilotDraftId: z.string().trim().optional(),
  copilotActionType: z
    .enum([
      "customer_follow_up",
      "contract_signature_reminder",
      "deposit_payment_reminder",
      "payment_reminder",
      "payment_failed_follow_up",
      "partial_balance_follow_up",
      "internal_collections_review_summary",
      "scheduling_readiness_coordination",
      "field_progress_update",
      "internal_pm_project_summary",
      "stalled_project_follow_up",
      "blocker_escalation_summary"
    ])
    .optional(),
  copilotAudience: z.enum(["customer", "internal"]).optional(),
  copilotSubject: z.string().trim().optional(),
  copilotReason: z.string().trim().optional(),
  copilotSignals: z.string().trim().optional(),
  copilotProjectId: z.string().trim().optional(),
  copilotProjectName: z.string().trim().optional(),
  copilotCustomerId: z.string().trim().optional(),
  copilotCustomerName: z.string().trim().optional()
});

const recordLinkedCommunicationMessageInputSchema = z.object({
  subjectType: z.enum(["customer", "project"], {
    required_error: "A customer or project communication context is required.",
    invalid_type_error:
      "A customer or project communication context is required."
  }),
  subjectId: z.string().uuid("A valid customer or project is required."),
  visibility: z.enum(["internal", "customer_visible"], {
    required_error: "Select message visibility.",
    invalid_type_error: "Select message visibility."
  }),
  body: z
    .string()
    .trim()
    .min(1, "Communication message cannot be empty.")
    .max(5_000, "Communication messages must stay under 5,000 characters."),
  returnTo: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      return value.startsWith("/projects/") ||
        value.startsWith("/customers/") ||
        value.startsWith("/communications")
        ? value
        : undefined;
    })
});

const portalProjectCommunicationReplyInputSchema = z.object({
  projectId: z.string().uuid("A valid portal project is required."),
  threadId: z.string().uuid("A valid project conversation is required."),
  body: z
    .string()
    .trim()
    .min(1, "Reply message cannot be empty.")
    .max(5_000, "Reply messages must stay under 5,000 characters.")
});

const communicationTriageInputSchema = z.object({
  threadId: z
    .string()
    .uuid("A valid communication thread is required.")
    .optional(),
  q: z.string().optional(),
  view: z.enum(["all", "needs_response", "unread", "recent"]).optional(),
  source: z
    .enum([
      "all",
      "opportunity",
      "appointment",
      "customer",
      "project",
      "estimate",
      "contract",
      "invoice",
      "change_order",
      "payment"
    ])
    .optional()
});

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function buildCommunicationsRedirect(
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query.length > 0 ? `/communications?${query}` : "/communications";
}

function buildCopilotHandoffFromReplyInput(
  input: z.infer<typeof communicationReplyInputSchema>
): AiCopilotCommunicationHandoff | null {
  if (
    !input.copilotDraftId ||
    !input.copilotActionType ||
    !input.copilotAudience ||
    !input.copilotSubject ||
    !input.copilotReason ||
    !input.copilotProjectId ||
    !input.copilotProjectName
  ) {
    return null;
  }

  return {
    draftId: input.copilotDraftId,
    actionType: input.copilotActionType,
    audience: input.copilotAudience,
    title: input.copilotSubject,
    subject: input.copilotSubject,
    draftBody: input.body,
    operationalReason: input.copilotReason,
    sourceWorkflowSignals:
      input.copilotSignals
        ?.split("\n")
        .map((signal) => signal.trim())
        .filter(Boolean) ?? [],
    projectId: input.copilotProjectId,
    projectName: input.copilotProjectName,
    customerId: input.copilotCustomerId || null,
    customerName: input.copilotCustomerName || null
  };
}

function buildLeadRedirect(
  opportunityId: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query.length > 0
    ? `/leads/${opportunityId}?${query}`
    : `/leads/${opportunityId}`;
}

function buildAppointmentRedirect(
  appointmentId: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query.length > 0
    ? `/appointments/${appointmentId}?${query}`
    : `/appointments/${appointmentId}`;
}

function buildCustomerRedirect(
  customerId: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  const basePath = `/customers/${customerId}`;

  return query.length > 0
    ? `${basePath}?${query}#communication-preferences`
    : `${basePath}#communication-preferences`;
}

export async function createAppointmentConfirmationLogAction(
  formData: FormData
) {
  const appointmentId = getFieldValue(formData, "appointmentId");
  const result = appointmentConfirmationLogInputSchema.safeParse({
    appointmentId,
    body: getFieldValue(formData, "body")
  });

  if (!result.success) {
    redirect(
      appointmentId
        ? buildAppointmentRedirect(appointmentId, {
            error:
              result.error.issues[0]?.message ??
              "Unable to log appointment confirmation."
          })
        : "/appointments?error=Appointment%20id%20is%20required."
    );
  }

  try {
    await logAppointmentConfirmation(
      {
        appointmentId: result.data.appointmentId,
        body: result.data.body
      },
      `/appointments/${result.data.appointmentId}`
    );
  } catch (error) {
    redirect(
      buildAppointmentRedirect(result.data.appointmentId, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to log appointment confirmation."
      })
    );
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${result.data.appointmentId}`);
  revalidatePath("/communications");
  revalidatePath("/dashboard");

  redirect(
    buildAppointmentRedirect(result.data.appointmentId, {
      message: "Appointment confirmation logged. No SMS or email was sent."
    })
  );
}

function getSafeAppointmentEmailError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to send appointment confirmation email. No message was marked sent.";
  }

  if (
    error.message.includes("locked during early access") ||
    error.message.includes("not configured") ||
    error.message.includes("recipient") ||
    error.message.includes("customer-visible") ||
    error.message.includes("customer/project") ||
    error.message.includes("already been marked sent")
  ) {
    return error.message;
  }

  return "Unable to send appointment confirmation email. The provider attempt was recorded when possible, and the communication message was not marked sent.";
}

export async function sendAppointmentConfirmationEmailAction(
  formData: FormData
) {
  const appointmentId = getFieldValue(formData, "appointmentId");
  const result = appointmentConfirmationEmailInputSchema.safeParse({
    appointmentId,
    recipientEmail: getFieldValue(formData, "recipientEmail"),
    communicationMessageId: getFieldValue(formData, "communicationMessageId"),
    body: getFieldValue(formData, "body")
  });

  if (!result.success) {
    redirect(
      appointmentId
        ? buildAppointmentRedirect(appointmentId, {
            error:
              result.error.issues[0]?.message ??
              "Unable to send appointment confirmation email."
          })
        : "/appointments?error=Appointment%20id%20is%20required."
    );
  }

  try {
    await sendAppointmentConfirmationEmail(
      {
        appointmentId: result.data.appointmentId,
        recipientEmail: result.data.recipientEmail,
        communicationMessageId: result.data.communicationMessageId,
        body: result.data.body
      },
      `/appointments/${result.data.appointmentId}`
    );
  } catch (error) {
    redirect(
      buildAppointmentRedirect(result.data.appointmentId, {
        error: getSafeAppointmentEmailError(error)
      })
    );
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${result.data.appointmentId}`);
  revalidatePath("/communications");
  revalidatePath("/dashboard");

  redirect(
    buildAppointmentRedirect(result.data.appointmentId, {
      message: "Appointment confirmation email sent and recorded."
    })
  );
}

function getSafeAppointmentReminderEmailError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to send appointment reminder email. No message was marked sent.";
  }

  if (
    error.message.includes("locked during early access") ||
    error.message.includes("not configured") ||
    error.message.includes("recipient") ||
    error.message.includes("Appointment reminder is not ready") ||
    error.message.includes("already been sent") ||
    error.message.includes("Appointment not found")
  ) {
    return error.message;
  }

  return "Unable to send appointment reminder email. The provider attempt was recorded when possible, and the communication message was not marked sent.";
}

export async function sendAppointmentReminderEmailAction(formData: FormData) {
  const appointmentId = getFieldValue(formData, "appointmentId");
  const result = appointmentReminderEmailInputSchema.safeParse({
    appointmentId,
    recipientEmail: getFieldValue(formData, "recipientEmail"),
    communicationMessageId: getFieldValue(formData, "communicationMessageId"),
    body: getFieldValue(formData, "body")
  });

  if (!result.success) {
    redirect(
      appointmentId
        ? buildAppointmentRedirect(appointmentId, {
            error:
              result.error.issues[0]?.message ??
              "Unable to send appointment reminder email."
          })
        : "/appointments?error=Appointment%20id%20is%20required."
    );
  }

  try {
    await sendAppointmentReminderEmail(
      {
        appointmentId: result.data.appointmentId,
        recipientEmail: result.data.recipientEmail,
        communicationMessageId: result.data.communicationMessageId,
        body: result.data.body
      },
      `/appointments/${result.data.appointmentId}`
    );
  } catch (error) {
    redirect(
      buildAppointmentRedirect(result.data.appointmentId, {
        error: getSafeAppointmentReminderEmailError(error)
      })
    );
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${result.data.appointmentId}`);
  revalidatePath("/communications");
  revalidatePath("/dashboard");

  redirect(
    buildAppointmentRedirect(result.data.appointmentId, {
      message: "Appointment reminder email sent and recorded."
    })
  );
}

export async function updateCustomerAppointmentReminderPreferenceAction(
  formData: FormData
) {
  const customerId = getFieldValue(formData, "customerId");
  const result = customerAppointmentReminderPreferenceActionSchema.safeParse({
    customerId,
    subjectType: getFieldValue(formData, "subjectType"),
    subjectId: getFieldValue(formData, "subjectId"),
    status: getFieldValue(formData, "status"),
    reason: getFieldValue(formData, "reason"),
    returnTo: getFieldValue(formData, "returnTo")
  });

  if (!result.success) {
    redirect(
      customerId
        ? buildCustomerRedirect(customerId, {
            error:
              result.error.issues[0]?.message ??
              "Unable to update communication preference."
          })
        : "/customers?error=Customer%20id%20is%20required."
    );
  }

  const returnTo =
    result.data.returnTo ?? `/customers/${result.data.customerId}`;

  try {
    await upsertCustomerAppointmentReminderPreference(
      {
        customerId: result.data.customerId,
        subjectType: result.data.subjectType,
        subjectId: result.data.subjectId,
        status: result.data.status,
        reason: result.data.reason
      },
      returnTo
    );
  } catch (error) {
    redirect(
      buildCustomerRedirect(result.data.customerId, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update communication preference."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${result.data.customerId}`);
  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  redirect(
    buildCustomerRedirect(result.data.customerId, {
      message: "Communication preference updated."
    })
  );
}

export async function createOpportunityManualCommunicationMessageAction(
  formData: FormData
) {
  const opportunityId = getFieldValue(formData, "opportunityId");
  const result = opportunityManualCommunicationInputSchema.safeParse({
    opportunityId,
    messageKind: getFieldValue(formData, "messageKind"),
    visibility: getFieldValue(formData, "visibility") || "internal",
    body: getFieldValue(formData, "body")
  });

  if (!result.success) {
    redirect(
      opportunityId
        ? buildLeadRedirect(opportunityId, {
            error:
              result.error.issues[0]?.message ??
              "Unable to log communication on this lead."
          })
        : "/leads?error=Lead%20id%20is%20required."
    );
  }

  try {
    await createOpportunityManualCommunicationMessage(
      result.data,
      `/leads/${result.data.opportunityId}`
    );
  } catch (error) {
    redirect(
      buildLeadRedirect(result.data.opportunityId, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to log communication on this lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${result.data.opportunityId}`);
  revalidatePath("/communications");
  revalidatePath("/dashboard");

  redirect(
    buildLeadRedirect(result.data.opportunityId, {
      message: "Communication logged on the lead."
    })
  );
}

export async function replyToCommunicationThreadAction(formData: FormData) {
  const threadId = getFieldValue(formData, "threadId");
  const q = getFieldValue(formData, "q").trim();
  const view = getFieldValue(formData, "view");
  const source = getFieldValue(formData, "source");
  const body = getFieldValue(formData, "body");
  const result = communicationReplyInputSchema.safeParse({
    threadId,
    visibility: getFieldValue(formData, "visibility") || "internal",
    body,
    q: q || undefined,
    view: view || undefined,
    source: source || undefined,
    copilotDraftId: getFieldValue(formData, "copilotDraftId") || undefined,
    copilotActionType:
      getFieldValue(formData, "copilotActionType") || undefined,
    copilotAudience: getFieldValue(formData, "copilotAudience") || undefined,
    copilotSubject: getFieldValue(formData, "copilotSubject") || undefined,
    copilotReason: getFieldValue(formData, "copilotReason") || undefined,
    copilotSignals: getFieldValue(formData, "copilotSignals") || undefined,
    copilotProjectId: getFieldValue(formData, "copilotProjectId") || undefined,
    copilotProjectName:
      getFieldValue(formData, "copilotProjectName") || undefined,
    copilotCustomerId:
      getFieldValue(formData, "copilotCustomerId") || undefined,
    copilotCustomerName:
      getFieldValue(formData, "copilotCustomerName") || undefined
  });

  if (!result.success) {
    redirect(
      buildCommunicationsRedirect({
        threadId,
        q: q || undefined,
        view: view || undefined,
        source: source || undefined,
        error: result.error.issues[0]?.message ?? "Unable to send reply."
      })
    );
  }

  try {
    const copilotHandoff = buildCopilotHandoffFromReplyInput(result.data);
    await postCommunicationMessage(
      {
        threadId: result.data.threadId,
        body: result.data.body,
        visibility: copilotHandoff ? "internal" : result.data.visibility,
        payload: copilotHandoff
          ? buildAiCopilotCommunicationPayload(copilotHandoff)
          : null,
        createNotification: false
      },
      "/communications"
    );
  } catch (error) {
    redirect(
      buildCommunicationsRedirect({
        threadId: result.data.threadId,
        q: result.data.q,
        view: result.data.view,
        source: result.data.source,
        error: error instanceof Error ? error.message : "Unable to send reply."
      })
    );
  }

  revalidatePath("/communications");

  redirect(
    buildCommunicationsRedirect({
      threadId: result.data.threadId,
      q: result.data.q,
      view: result.data.view,
      source: result.data.source,
      message: buildCopilotHandoffFromReplyInput(result.data)
        ? "Reviewed Copilot draft saved on the canonical communication thread. No notification, email, or SMS was sent."
        : result.data.visibility === "customer_visible"
          ? "Customer-visible message saved to the canonical thread. No email or SMS was sent."
          : "Internal note saved to the canonical communication thread."
    })
  );
}

export async function createRecordLinkedCommunicationMessageAction(
  formData: FormData
) {
  const subjectType = getFieldValue(formData, "subjectType");
  const subjectId = getFieldValue(formData, "subjectId");
  const result = recordLinkedCommunicationMessageInputSchema.safeParse({
    subjectType,
    subjectId,
    visibility: getFieldValue(formData, "visibility") || "internal",
    body: getFieldValue(formData, "body"),
    returnTo: getFieldValue(formData, "returnTo") || undefined
  });
  const fallback =
    subjectType === "project" && subjectId
      ? `/projects/${subjectId}#messagecenter`
      : subjectType === "customer" && subjectId
        ? `/customers/${subjectId}#communication-history`
        : "/communications";
  const returnTo = result.success
    ? (result.data.returnTo ?? fallback)
    : fallback;

  if (!result.success) {
    const destination = new URL(returnTo, "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      result.error.issues[0]?.message ?? "Unable to save communication message."
    );

    redirect(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  try {
    await createRecordLinkedCommunicationMessage(
      {
        subjectType: result.data.subjectType,
        subjectId: result.data.subjectId,
        body: result.data.body,
        visibility: result.data.visibility
      },
      returnTo
    );
  } catch (error) {
    const destination = new URL(returnTo, "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      error instanceof Error
        ? error.message
        : "Unable to save communication message."
    );

    redirect(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  if (result.data.subjectType === "project") {
    revalidatePath(`/projects/${result.data.subjectId}`);
  }

  if (result.data.subjectType === "customer") {
    revalidatePath(`/customers/${result.data.subjectId}`);
  }

  revalidatePath("/communications");
  revalidatePath("/dashboard");

  const destination = new URL(returnTo, "http://floorconnector.local");

  destination.searchParams.set(
    "message",
    result.data.visibility === "customer_visible"
      ? "Customer-visible message saved to FloorConnector history. No email or SMS was sent."
      : "Internal note saved to FloorConnector communication history."
  );

  redirect(`${destination.pathname}${destination.search}${destination.hash}`);
}

export async function replyToPortalProjectCommunicationThreadAction(
  formData: FormData
) {
  const projectId = getFieldValue(formData, "projectId");
  const result = portalProjectCommunicationReplyInputSchema.safeParse({
    projectId,
    threadId: getFieldValue(formData, "threadId"),
    body: getFieldValue(formData, "body")
  });
  const returnTo = projectId
    ? `/portal/projects/${projectId}#project-communication`
    : "/portal";

  if (!result.success) {
    const destination = new URL(returnTo, "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      result.error.issues[0]?.message ?? "Unable to save portal reply."
    );

    redirect(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  try {
    await assertPortalProjectCommunicationThreadCanReceiveReply(
      {
        projectId: result.data.projectId,
        threadId: result.data.threadId
      },
      `/portal/projects/${result.data.projectId}`
    );
    await postCommunicationMessage(
      {
        threadId: result.data.threadId,
        body: result.data.body,
        visibility: "customer_visible",
        createNotification: false,
        payload: {
          source: "portal_project_reply",
          projectId: result.data.projectId
        }
      },
      `/portal/projects/${result.data.projectId}`
    );
  } catch (error) {
    const destination = new URL(returnTo, "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Unable to save portal reply."
    );

    redirect(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  revalidatePath(`/portal/projects/${result.data.projectId}`);
  revalidatePath(`/projects/${result.data.projectId}`);
  revalidatePath("/communications");

  const destination = new URL(returnTo, "http://floorconnector.local");

  destination.searchParams.set(
    "message",
    "Reply saved to your project communication history. No separate email or SMS was sent."
  );

  redirect(`${destination.pathname}${destination.search}${destination.hash}`);
}

export async function markCommunicationThreadNotificationsReadAction(
  formData: FormData
) {
  const threadId = getFieldValue(formData, "threadId");
  const q = getFieldValue(formData, "q").trim();
  const view = getFieldValue(formData, "view");
  const source = getFieldValue(formData, "source");
  const result = communicationTriageInputSchema.safeParse({
    threadId,
    q: q || undefined,
    view: view || undefined,
    source: source || undefined
  });

  if (!result.success || !result.data.threadId) {
    redirect(
      buildCommunicationsRedirect({
        threadId,
        q: q || undefined,
        view: view || undefined,
        source: source || undefined,
        error: result.success
          ? "A valid communication thread is required."
          : (result.error.issues[0]?.message ??
            "Unable to update thread notifications.")
      })
    );
  }

  try {
    const updatedCount = await markCommunicationThreadNotificationsRead(
      result.data.threadId,
      "/communications"
    );

    revalidatePath("/communications");

    redirect(
      buildCommunicationsRedirect({
        threadId: result.data.threadId,
        q: result.data.q,
        view: result.data.view,
        source: result.data.source,
        message:
          updatedCount > 0
            ? "Selected thread notifications marked read."
            : "No unread communication notifications were open on this thread."
      })
    );
  } catch (error) {
    redirect(
      buildCommunicationsRedirect({
        threadId: result.data.threadId,
        q: result.data.q,
        view: result.data.view,
        source: result.data.source,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update thread notifications."
      })
    );
  }
}

export async function markAllCommunicationNotificationsReadAction(
  formData: FormData
) {
  const threadId = getFieldValue(formData, "threadId");
  const q = getFieldValue(formData, "q").trim();
  const view = getFieldValue(formData, "view");
  const source = getFieldValue(formData, "source");
  const result = communicationTriageInputSchema.safeParse({
    threadId: threadId || undefined,
    q: q || undefined,
    view: view || undefined,
    source: source || undefined
  });

  if (!result.success) {
    redirect(
      buildCommunicationsRedirect({
        threadId: threadId || undefined,
        q: q || undefined,
        view: view || undefined,
        source: source || undefined,
        error:
          result.error.issues[0]?.message ??
          "Unable to update communication notifications."
      })
    );
  }

  try {
    const updatedCount =
      await markAllCommunicationNotificationsRead("/communications");

    revalidatePath("/communications");

    redirect(
      buildCommunicationsRedirect({
        threadId: result.data.threadId,
        q: result.data.q,
        view: result.data.view,
        source: result.data.source,
        message:
          updatedCount > 0
            ? "All communication notifications marked read."
            : "No unread communication notifications were open."
      })
    );
  } catch (error) {
    redirect(
      buildCommunicationsRedirect({
        threadId: result.data.threadId,
        q: result.data.q,
        view: result.data.view,
        source: result.data.source,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update communication notifications."
      })
    );
  }
}
