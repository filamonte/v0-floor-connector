"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordTimePunchEvent } from "./data";
import { timePunchEventInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
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
        error: error instanceof Error ? error.message : "Unable to record time event."
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

  redirect(
    buildRedirect("/time", {
      message: `${getEventLabel(timeEvent.eventType)} recorded for ${timeEvent.person?.displayName ?? "workforce person"}.`
    })
  );
}
