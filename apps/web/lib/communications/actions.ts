"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  markAllCommunicationNotificationsRead,
  markCommunicationThreadNotificationsRead
} from "@/lib/notifications/system";

import { postCommunicationMessage } from "./data";

const communicationReplyInputSchema = z.object({
  threadId: z.string().uuid("A valid communication thread is required."),
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

const communicationTriageInputSchema = z.object({
  threadId: z.string().uuid("A valid communication thread is required.").optional(),
  q: z.string().optional(),
  view: z.enum(["all", "needs_response", "unread", "recent"]).optional(),
  source: z
    .enum([
      "all",
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

function buildCommunicationsRedirect(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query.length > 0 ? `/communications?${query}` : "/communications";
}

export async function replyToCommunicationThreadAction(formData: FormData) {
  const threadId = getFieldValue(formData, "threadId");
  const q = getFieldValue(formData, "q").trim();
  const view = getFieldValue(formData, "view");
  const source = getFieldValue(formData, "source");
  const body = getFieldValue(formData, "body");
  const result = communicationReplyInputSchema.safeParse({
    threadId,
    body,
    q: q || undefined,
    view: view || undefined,
    source: source || undefined
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
    await postCommunicationMessage(
      {
        threadId: result.data.threadId,
        body: result.data.body
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
      message: "Reply sent on the canonical communication thread."
    })
  );
}

export async function markCommunicationThreadNotificationsReadAction(formData: FormData) {
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
          : result.error.issues[0]?.message ?? "Unable to update thread notifications."
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

export async function markAllCommunicationNotificationsReadAction(formData: FormData) {
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
        error: result.error.issues[0]?.message ?? "Unable to update communication notifications."
      })
    );
  }

  try {
    const updatedCount = await markAllCommunicationNotificationsRead("/communications");

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
