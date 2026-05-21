"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordTimePunchEvent, updateTimeCardReview } from "./data";
import { timePunchEventInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function toIsoDateTime(value: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const normalized = new Date(value);

  if (Number.isNaN(normalized.getTime())) {
    return value;
  }

  return normalized.toISOString();
}

function parseTimePunchEventInput(formData: FormData) {
  return timePunchEventInputSchema.safeParse({
    personId: getFieldValue(formData, "personId"),
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    serviceTicketId: getFieldValue(formData, "serviceTicketId"),
    eventType: getFieldValue(formData, "eventType"),
    occurredAt: toIsoDateTime(getFieldValue(formData, "occurredAt")),
    source: "web",
    latitude: null,
    longitude: null,
    accuracyMeters: null,
    locationCaptureMethod: "unknown",
    geofenceSnapshot: null,
    supersedesEventId: getFieldValue(formData, "supersedesEventId"),
    notes: getFieldValue(formData, "notes")
  });
}

function getEventLabel(eventType: string) {
  switch (eventType) {
    case "punch_in":
      return "Punch in";
    case "punch_out":
      return "Punch out";
    case "break_start":
      return "Break start";
    case "break_end":
      return "Break end";
    default:
      return "Time event";
  }
}

function isTimeCardReviewActionStatus(
  value: string
): value is "approved" | "rejected" {
  return value === "approved" || value === "rejected";
}

function parseReviewInput(formData: FormData) {
  const reviewStatus = getFieldValue(formData, "reviewStatus");

  if (!isTimeCardReviewActionStatus(reviewStatus)) {
    return {
      success: false as const,
      error: "Choose a valid review action."
    };
  }

  return {
    success: true as const,
    data: {
      timeCardId: getFieldValue(formData, "timeCardId"),
      reviewStatus,
      reviewNotes: getFieldValue(formData, "reviewNotes").trim() || null
    }
  };
}

export async function recordTimePunchEventAction(formData: FormData) {
  const result = parseTimePunchEventInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/time", {
        error: result.error.issues[0]?.message ?? "Unable to record time event."
      })
    );
  }

  let timeEvent;

  try {
    timeEvent = await recordTimePunchEvent(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/time", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record time event."
      })
    );
  }

  revalidatePath("/time");
  revalidatePath(`/time-cards`);
  if (timeEvent.projectId) {
    revalidatePath(`/projects/${timeEvent.projectId}`);
  }
  if (timeEvent.jobId) {
    revalidatePath(`/jobs/${timeEvent.jobId}`);
  }
  if (timeEvent.serviceTicketId) {
    revalidatePath(`/service-tickets/${timeEvent.serviceTicketId}`);
  }

  redirect(
    buildRedirect("/time", {
      message: `${getEventLabel(timeEvent.eventType)} recorded for ${timeEvent.person?.displayName ?? "workforce person"}.`
    })
  );
}

export async function recordCrewClockInAction(formData: FormData) {
  const personIds = getFieldValues(formData, "personIds");

  if (personIds.length === 0) {
    redirect(
      buildRedirect("/time", {
        error: "Select at least one active workforce person for crew clock-in."
      })
    );
  }

  const baseInput = {
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    serviceTicketId: getFieldValue(formData, "serviceTicketId"),
    eventType: "punch_in",
    occurredAt: toIsoDateTime(getFieldValue(formData, "occurredAt")),
    source: "web",
    latitude: null,
    longitude: null,
    accuracyMeters: null,
    locationCaptureMethod: "unknown",
    geofenceSnapshot: null,
    supersedesEventId: "",
    notes: getFieldValue(formData, "notes")
  };
  const successes: string[] = [];
  const failures: string[] = [];

  for (const personId of personIds) {
    const result = timePunchEventInputSchema.safeParse({
      ...baseInput,
      personId
    });

    if (!result.success) {
      failures.push(result.error.issues[0]?.message ?? "Invalid crew member.");
      continue;
    }

    try {
      const timeEvent = await recordTimePunchEvent(result.data);
      successes.push(timeEvent.person?.displayName ?? personId.slice(0, 8));
    } catch (error) {
      failures.push(
        `${personId.slice(0, 8)}: ${
          error instanceof Error ? error.message : "Unable to clock in."
        }`
      );
    }
  }

  revalidatePath("/time");
  revalidatePath("/time-cards");

  if (successes.length === 0) {
    redirect(
      buildRedirect("/time", {
        error:
          failures[0] ??
          "Crew clock-in did not record any canonical punch events."
      })
    );
  }

  redirect(
    buildRedirect("/time", {
      message: `Crew clock-in recorded for ${successes.length} worker${
        successes.length === 1 ? "" : "s"
      }${failures.length > 0 ? `; ${failures.length} skipped.` : "."}`
    })
  );
}

export async function updateTimeCardReviewAction(formData: FormData) {
  const result = parseReviewInput(formData);
  const timeCardId = getFieldValue(formData, "timeCardId");
  const redirectPath = timeCardId ? `/time-cards/${timeCardId}` : "/time";

  if (!result.success) {
    redirect(
      buildRedirect(redirectPath, {
        error: result.error
      })
    );
  }

  let timeCard;

  try {
    timeCard = await updateTimeCardReview(result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectPath, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update time card review."
      })
    );
  }

  revalidatePath("/time");
  revalidatePath("/time-cards");
  revalidatePath(`/time-cards/${timeCard.id}`);
  if (timeCard.projectId) {
    revalidatePath(`/projects/${timeCard.projectId}`);
  }
  if (timeCard.jobId) {
    revalidatePath(`/jobs/${timeCard.jobId}`);
  }
  if (timeCard.serviceTicketId) {
    revalidatePath(`/service-tickets/${timeCard.serviceTicketId}`);
  }

  redirect(
    buildRedirect(`/time-cards/${timeCard.id}`, {
      message: `Time card ${timeCard.reviewStatus.replaceAll("_", " ")}.`
    })
  );
}
