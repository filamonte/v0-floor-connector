import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { deriveTimeCardsFromPunchEvents } from "@floorconnector/domain";
import type {
  TimeCard as TimeCardRecord,
  TimePunchEvent as TimePunchEventRecord
} from "@floorconnector/types";

import type { TimePunchEventInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type TimeScope = {
  userId: string;
  organizationId: string;
};

type TimePunchEventRow = {
  id: string;
  company_id: string;
  person_id: string;
  project_id: string | null;
  job_id: string | null;
  event_type: TimePunchEventRecord["eventType"];
  occurred_at: string;
  source: TimePunchEventRecord["source"];
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  location_capture_method: TimePunchEventRecord["locationCaptureMethod"];
  geofence_snapshot: Record<string, unknown> | null;
  supersedes_event_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  people?:
    | {
        id: string;
        display_name: string;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
      }
    | null;
  jobs?:
    | {
        id: string;
        status: string;
      }
    | null;
};

type TimeCardRow = {
  id: string;
  company_id: string;
  person_id: string;
  project_id: string | null;
  job_id: string | null;
  work_date: string;
  source_punch_in_event_id: string;
  source_punch_out_event_id: string | null;
  punch_in_at: string;
  punch_out_at: string | null;
  break_minutes: number;
  worked_minutes: number;
  status: TimeCardRecord["status"];
  entry_mode: TimeCardRecord["entryMode"];
  notes: string | null;
  created_at: string;
  updated_at: string;
  people?:
    | {
        id: string;
        display_name: string;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
      }
    | null;
  jobs?:
    | {
        id: string;
        status: string;
      }
    | null;
};

export type TimePunchEventListItem = TimePunchEventRecord & {
  person: {
    id: string;
    displayName: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  job: {
    id: string;
    status: string;
  } | null;
};

export type TimeCardListItem = TimeCardRecord & {
  person: {
    id: string;
    displayName: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  job: {
    id: string;
    status: string;
  } | null;
};

export type OpenTimeCardState = TimeCardListItem & {
  currentPunchState: "punched_in" | "on_break";
};

const timePunchEventSelect = `
  id,
  company_id,
  person_id,
  project_id,
  job_id,
  event_type,
  occurred_at,
  source,
  latitude,
  longitude,
  accuracy_meters,
  location_capture_method,
  geofence_snapshot,
  supersedes_event_id,
  notes,
  created_at,
  updated_at,
  people (
    id,
    display_name
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    status
  )
`;

const timeCardSelect = `
  id,
  company_id,
  person_id,
  project_id,
  job_id,
  work_date,
  source_punch_in_event_id,
  source_punch_out_event_id,
  punch_in_at,
  punch_out_at,
  break_minutes,
  worked_minutes,
  status,
  entry_mode,
  notes,
  created_at,
  updated_at,
  people (
    id,
    display_name
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    status
  )
`;

function isTimePunchEventRow(value: unknown): value is TimePunchEventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<TimePunchEventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.person_id === "string" &&
    typeof row.event_type === "string" &&
    typeof row.occurred_at === "string" &&
    typeof row.source === "string" &&
    typeof row.location_capture_method === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isTimePunchEventRowArray(value: unknown): value is TimePunchEventRow[] {
  return Array.isArray(value) && value.every((row) => isTimePunchEventRow(row));
}

function isTimeCardRow(value: unknown): value is TimeCardRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<TimeCardRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.person_id === "string" &&
    typeof row.work_date === "string" &&
    typeof row.source_punch_in_event_id === "string" &&
    typeof row.punch_in_at === "string" &&
    typeof row.break_minutes === "number" &&
    typeof row.worked_minutes === "number" &&
    typeof row.status === "string" &&
    typeof row.entry_mode === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isTimeCardRowArray(value: unknown): value is TimeCardRow[] {
  return Array.isArray(value) && value.every((row) => isTimeCardRow(row));
}

function mapTimePunchEvent(row: TimePunchEventRow): TimePunchEventRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    personId: row.person_id,
    projectId: row.project_id,
    jobId: row.job_id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    source: row.source,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracyMeters: row.accuracy_meters,
    locationCaptureMethod: row.location_capture_method,
    geofenceSnapshot: row.geofence_snapshot,
    supersedesEventId: row.supersedes_event_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapTimeCard(row: TimeCardRow): TimeCardRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    personId: row.person_id,
    projectId: row.project_id,
    jobId: row.job_id,
    workDate: row.work_date,
    sourcePunchInEventId: row.source_punch_in_event_id,
    sourcePunchOutEventId: row.source_punch_out_event_id,
    punchInAt: row.punch_in_at,
    punchOutAt: row.punch_out_at,
    breakMinutes: row.break_minutes,
    workedMinutes: row.worked_minutes,
    status: row.status,
    entryMode: row.entry_mode,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapTimePunchEventListItem(row: TimePunchEventRow): TimePunchEventListItem {
  return {
    ...mapTimePunchEvent(row),
    person: row.people
      ? {
          id: row.people.id,
          displayName: row.people.display_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name
        }
      : null,
    job: row.jobs
      ? {
          id: row.jobs.id,
          status: row.jobs.status
        }
      : null
  };
}

function mapTimeCardListItem(row: TimeCardRow): TimeCardListItem {
  return {
    ...mapTimeCard(row),
    person: row.people
      ? {
          id: row.people.id,
          displayName: row.people.display_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name
        }
      : null,
    job: row.jobs
      ? {
          id: row.jobs.id,
          status: row.jobs.status
        }
      : null
  };
}

async function getTimeScope(next = "/people"): Promise<TimeScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

export async function requireTimeScope(next = "/people") {
  const scope = await getTimeScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for time tracking yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function ensureScopedActivePerson(organizationId: string, personId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, is_active")
    .eq("company_id", organizationId)
    .eq("id", personId)
    .maybeSingle();
  const data = response.data as { id?: string; is_active?: boolean } | null;

  if (response.error) {
    throw new Error(`Unable to validate the workforce person: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Workforce person not found for this organization.");
  }

  if (!data.is_active) {
    throw new Error("Only active workforce people can record time.");
  }

  return data;
}

async function resolveScopedProject(organizationId: string, projectId: string | null) {
  if (!projectId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", projectId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the project: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Project not found for this organization.");
  }

  return data;
}

async function resolveScopedJob(organizationId: string, jobId: string | null) {
  if (!jobId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select("id, project_id")
    .eq("company_id", organizationId)
    .eq("id", jobId)
    .maybeSingle();
  const data = response.data as { id?: string; project_id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the job: ${response.error.message}`);
  }

  if (!data?.id || !data.project_id) {
    throw new Error("Job not found for this organization.");
  }

  return {
    id: data.id,
    projectId: data.project_id
  };
}

async function getOpenTimeCardForPerson(organizationId: string, personId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select("id, project_id, job_id, status, work_date")
    .eq("company_id", organizationId)
    .eq("person_id", personId)
    .eq("status", "open")
    .order("punch_in_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        project_id?: string | null;
        job_id?: string | null;
        status?: string;
        work_date?: string;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to load the active time card: ${response.error.message}`);
  }

  if (!data?.id) {
    return null;
  }

  return {
    id: data.id,
    projectId: data.project_id ?? null,
    jobId: data.job_id ?? null,
    workDate: data.work_date ?? null
  };
}

async function getLatestPunchEventForPerson(organizationId: string, personId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_punch_events")
    .select("id, event_type, occurred_at")
    .eq("company_id", organizationId)
    .eq("person_id", personId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        event_type?: TimePunchEventRecord["eventType"];
        occurred_at?: string;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to inspect the latest punch event: ${response.error.message}`);
  }

  if (!data?.id || !data.event_type || !data.occurred_at) {
    return null;
  }

  return {
    id: data.id,
    eventType: data.event_type,
    occurredAt: data.occurred_at
  };
}

async function listCanonicalPunchEventsForPerson(
  organizationId: string,
  personId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_punch_events")
    .select(
      `
        id,
        event_type,
        occurred_at,
        project_id,
        job_id,
        notes,
        supersedes_event_id
      `
    )
    .eq("company_id", organizationId)
    .eq("person_id", personId)
    .order("occurred_at", { ascending: true })
    .order("created_at", { ascending: true });
  const data = Array.isArray(response.data) ? response.data : [];

  if (response.error) {
    throw new Error(`Unable to load punch events: ${response.error.message}`);
  }

  const supersededEventIds = new Set<string>();

  for (const row of data) {
    if (typeof row?.supersedes_event_id === "string") {
      supersededEventIds.add(row.supersedes_event_id);
    }
  }

  return data
    .filter((row) => typeof row?.id === "string" && !supersededEventIds.has(row.id))
    .map((row) => ({
      id: row.id as string,
      eventType: row.event_type as TimePunchEventRecord["eventType"],
      occurredAt: row.occurred_at as string,
      projectId: (row.project_id as string | null) ?? null,
      jobId: (row.job_id as string | null) ?? null,
      notes: (row.notes as string | null) ?? null
    }));
}

async function replaceDerivedTimeCardsForPerson(scope: TimeScope, personId: string) {
  const canonicalEvents = await listCanonicalPunchEventsForPerson(
    scope.organizationId,
    personId
  );
  const derivedCards = deriveTimeCardsFromPunchEvents(canonicalEvents);
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("time_cards")
    .delete()
    .eq("company_id", scope.organizationId)
    .eq("person_id", personId);

  if (deleteResponse.error) {
    throw new Error(`Unable to refresh derived time cards: ${deleteResponse.error.message}`);
  }

  if (derivedCards.length === 0) {
    return;
  }

  const insertResponse = await supabase.from("time_cards").insert(
    derivedCards.map((card) => ({
      company_id: scope.organizationId,
      person_id: personId,
      project_id: card.projectId,
      job_id: card.jobId,
      work_date: card.workDate,
      source_punch_in_event_id: card.sourcePunchInEventId,
      source_punch_out_event_id: card.sourcePunchOutEventId,
      punch_in_at: card.punchInAt,
      punch_out_at: card.punchOutAt,
      break_minutes: card.breakMinutes,
      worked_minutes: card.workedMinutes,
      status: card.status,
      entry_mode: card.entryMode,
      notes: card.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    }))
  );

  if (insertResponse.error) {
    throw new Error(`Unable to write derived time cards: ${insertResponse.error.message}`);
  }
}

function isBreakCompatibleEventType(value: TimePunchEventRecord["eventType"] | null) {
  return value === "punch_in" || value === "break_end";
}

async function resolveAttributionForPunch(
  organizationId: string,
  personId: string,
  input: TimePunchEventInput
) {
  await ensureScopedActivePerson(organizationId, personId);

  const openCard = await getOpenTimeCardForPerson(organizationId, personId);
  const latestEvent = await getLatestPunchEventForPerson(organizationId, personId);

  let projectId = input.projectId;
  let jobId = input.jobId;

  if (input.eventType !== "punch_in" && openCard) {
    projectId = projectId ?? openCard.projectId;
    jobId = jobId ?? openCard.jobId;
  }

  const scopedJob = await resolveScopedJob(organizationId, jobId);
  const scopedProject = await resolveScopedProject(
    organizationId,
    projectId ?? scopedJob?.projectId ?? null
  );

  if (scopedJob && scopedProject && scopedJob.projectId !== scopedProject.id) {
    throw new Error("Job must belong to the selected project.");
  }

  switch (input.eventType) {
    case "punch_in": {
      if (openCard) {
        throw new Error("This person already has an open time session.");
      }
      break;
    }
    case "break_start": {
      if (!openCard) {
        throw new Error("Breaks can only start during an open time session.");
      }

      if (!isBreakCompatibleEventType(latestEvent?.eventType ?? null)) {
        throw new Error("Break start requires an active punch-in or a completed prior break.");
      }

      break;
    }
    case "break_end": {
      if (!openCard) {
        throw new Error("Breaks can only end during an open time session.");
      }

      if (latestEvent?.eventType !== "break_start") {
        throw new Error("Break end requires an active break.");
      }

      break;
    }
    case "punch_out": {
      if (!openCard) {
        throw new Error("Punch out requires an open time session.");
      }

      if (latestEvent?.eventType === "break_start") {
        throw new Error("End the active break before punching out.");
      }

      if (!isBreakCompatibleEventType(latestEvent?.eventType ?? null) &&
          latestEvent?.eventType !== "punch_in") {
        throw new Error("Punch out requires an active punched-in session.");
      }

      break;
    }
    default: {
      break;
    }
  }

  return {
    projectId: scopedProject?.id ?? null,
    jobId: scopedJob?.id ?? null
  };
}

export const listTimePunchEvents = cache(async (): Promise<TimePunchEventListItem[]> => {
  const scope = await requireTimeScope("/people");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_punch_events")
    .select(timePunchEventSelect)
    .eq("company_id", scope.organizationId)
    .order("occurred_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load time punch events: ${response.error.message}`);
  }

  if (!isTimePunchEventRowArray(data)) {
    return [];
  }

  return data.map(mapTimePunchEventListItem);
});

export const listTimeCards = cache(async (): Promise<TimeCardListItem[]> => {
  const scope = await requireTimeScope("/people");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select(timeCardSelect)
    .eq("company_id", scope.organizationId)
    .order("work_date", { ascending: false })
    .order("punch_in_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load time cards: ${response.error.message}`);
  }

  if (!isTimeCardRowArray(data)) {
    return [];
  }

  return data.map(mapTimeCardListItem);
});

export const listOpenTimeCardStates = cache(async (): Promise<OpenTimeCardState[]> => {
  const allCards = await listTimeCards();
  const openCards = allCards.filter((card) => card.status === "open");

  if (openCards.length === 0) {
    return [];
  }

  const scope = await requireTimeScope("/time");
  const states = await Promise.all(
    openCards.map(async (card) => {
      const latestEvent = await getLatestPunchEventForPerson(
        scope.organizationId,
        card.personId
      );

      return {
        ...card,
        currentPunchState:
          latestEvent?.eventType === "break_start" ? "on_break" : "punched_in"
      } satisfies OpenTimeCardState;
    })
  );

  return states.sort((left, right) => left.punchInAt.localeCompare(right.punchInAt));
});

export async function listTimeCardsByProject(projectId: string, next = "/projects") {
  const scope = await requireTimeScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select(timeCardSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("work_date", { ascending: false })
    .order("punch_in_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load project time cards: ${response.error.message}`);
  }

  if (!isTimeCardRowArray(data)) {
    return [];
  }

  return data.map(mapTimeCardListItem);
}

export async function listTimeCardsByProjectAndWorkDate(
  projectId: string,
  workDate: string,
  next = "/projects"
) {
  const scope = await requireTimeScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select(timeCardSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .eq("work_date", workDate)
    .order("punch_in_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load project time cards for the work date: ${response.error.message}`);
  }

  if (!isTimeCardRowArray(data)) {
    return [];
  }

  return data.map(mapTimeCardListItem);
}

export async function listTimeCardsByJob(jobId: string, next = "/jobs") {
  const scope = await requireTimeScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select(timeCardSelect)
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .order("work_date", { ascending: false })
    .order("punch_in_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load job time cards: ${response.error.message}`);
  }

  if (!isTimeCardRowArray(data)) {
    return [];
  }

  return data.map(mapTimeCardListItem);
}

export async function getTimePunchEventById(eventId: string, next = "/people") {
  const scope = await requireTimeScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_punch_events")
    .select(timePunchEventSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", eventId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the time punch event: ${response.error.message}`);
  }

  if (!isTimePunchEventRow(data)) {
    return null;
  }

  return mapTimePunchEventListItem(data);
}

export async function getTimeCardById(timeCardId: string, next = "/people") {
  const scope = await requireTimeScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select(timeCardSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", timeCardId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the time card: ${response.error.message}`);
  }

  if (!isTimeCardRow(data)) {
    return null;
  }

  return mapTimeCardListItem(data);
}

export async function listTimePunchEventsForTimeCard(
  timeCardId: string,
  next = "/time-cards"
) {
  const timeCard = await getTimeCardById(timeCardId, next);

  if (!timeCard) {
    return [];
  }

  const scope = await requireTimeScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_punch_events")
    .select(timePunchEventSelect)
    .eq("company_id", scope.organizationId)
    .eq("person_id", timeCard.personId)
    .gte("occurred_at", timeCard.punchInAt)
    .lte("occurred_at", timeCard.punchOutAt ?? new Date().toISOString())
    .order("occurred_at", { ascending: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load time card punch events: ${response.error.message}`);
  }

  if (!isTimePunchEventRowArray(data)) {
    return [];
  }

  return data.map(mapTimePunchEventListItem);
}

export async function recordTimePunchEvent(input: TimePunchEventInput) {
  const scope = await requireTimeScope("/people");
  const attribution = await resolveAttributionForPunch(
    scope.organizationId,
    input.personId,
    input
  );
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_punch_events")
    .insert({
      company_id: scope.organizationId,
      person_id: input.personId,
      project_id: attribution.projectId,
      job_id: attribution.jobId,
      event_type: input.eventType,
      occurred_at: input.occurredAt,
      source: input.source,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy_meters: input.accuracyMeters === null ? null : Math.round(input.accuracyMeters),
      location_capture_method: input.locationCaptureMethod,
      geofence_snapshot: input.geofenceSnapshot,
      supersedes_event_id: input.supersedesEventId,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(timePunchEventSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to record the punch event: ${response.error.message}`);
  }

  if (!isTimePunchEventRow(data)) {
    throw new Error("Unexpected time punch event response after create.");
  }

  await replaceDerivedTimeCardsForPerson(scope, input.personId);

  return mapTimePunchEventListItem(data);
}
