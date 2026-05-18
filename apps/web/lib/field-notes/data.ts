import "server-only";

import { cache } from "react";
import type { FieldNote as FieldNoteRecord } from "@floorconnector/types";

import type { FieldNoteInput } from "./schemas";
import { getDailyLogById, requireDailyLogScope } from "@/lib/daily-logs/data";
import { assertProjectReadinessGate } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type FieldNoteRow = {
  id: string;
  company_id: string;
  daily_log_id: string;
  project_id: string;
  job_id: string | null;
  person_id: string | null;
  time_card_id: string | null;
  note_type: FieldNoteRecord["noteType"];
  title: string;
  body: string | null;
  status: FieldNoteRecord["status"];
  visibility: FieldNoteRecord["visibility"];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  daily_logs?: {
    id: string;
    log_date: string;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
  jobs?: {
    id: string;
    dispatch_status: string;
  } | null;
  people?: {
    id: string;
    display_name: string;
  } | null;
  time_cards?: {
    id: string;
    work_date: string;
    status: string;
  } | null;
};

export type FieldNoteListItem = FieldNoteRecord & {
  dailyLog: {
    id: string;
    logDate: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  job: {
    id: string;
    dispatchStatus: string;
  } | null;
  person: {
    id: string;
    displayName: string;
  } | null;
  timeCard: {
    id: string;
    workDate: string;
    status: string;
  } | null;
};

export type DashboardProjectCueFieldNote = Pick<
  FieldNoteRecord,
  "id" | "dailyLogId" | "projectId" | "noteType" | "status" | "title"
>;

const fieldNoteSelect = `
  id,
  company_id,
  daily_log_id,
  project_id,
  job_id,
  person_id,
  time_card_id,
  note_type,
  title,
  body,
  status,
  visibility,
  created_by,
  updated_by,
  created_at,
  updated_at,
  daily_logs (
    id,
    log_date
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    dispatch_status
  ),
  people (
    id,
    display_name
  ),
  time_cards (
    id,
    work_date,
    status
  )
`;

const dashboardProjectCueFieldNoteSelect = `
  id,
  daily_log_id,
  project_id,
  note_type,
  title,
  status
`;

function isFieldNoteRow(value: unknown): value is FieldNoteRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<FieldNoteRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.daily_log_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.note_type === "string" &&
    typeof row.title === "string" &&
    typeof row.status === "string" &&
    typeof row.visibility === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isFieldNoteRowArray(value: unknown): value is FieldNoteRow[] {
  return Array.isArray(value) && value.every((row) => isFieldNoteRow(row));
}

function isDashboardProjectCueFieldNoteRow(value: unknown): value is {
  id: string;
  daily_log_id: string;
  project_id: string;
  note_type: FieldNoteRecord["noteType"];
  title: string;
  status: FieldNoteRecord["status"];
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as {
    id?: unknown;
    daily_log_id?: unknown;
    project_id?: unknown;
    note_type?: unknown;
    title?: unknown;
    status?: unknown;
  };

  return (
    typeof row.id === "string" &&
    typeof row.daily_log_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.note_type === "string" &&
    typeof row.title === "string" &&
    typeof row.status === "string"
  );
}

function isDashboardProjectCueFieldNoteRowArray(
  value: unknown
): value is Array<{
  id: string;
  daily_log_id: string;
  project_id: string;
  note_type: FieldNoteRecord["noteType"];
  title: string;
  status: FieldNoteRecord["status"];
}> {
  return (
    Array.isArray(value) &&
    value.every((row) => isDashboardProjectCueFieldNoteRow(row))
  );
}

function mapFieldNote(row: FieldNoteRow): FieldNoteRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    dailyLogId: row.daily_log_id,
    projectId: row.project_id,
    jobId: row.job_id,
    personId: row.person_id,
    timeCardId: row.time_card_id,
    noteType: row.note_type,
    title: row.title,
    body: row.body,
    status: row.status,
    visibility: row.visibility,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDashboardProjectCueFieldNote(row: {
  id: string;
  daily_log_id: string;
  project_id: string;
  note_type: FieldNoteRecord["noteType"];
  title: string;
  status: FieldNoteRecord["status"];
}): DashboardProjectCueFieldNote {
  return {
    id: row.id,
    dailyLogId: row.daily_log_id,
    projectId: row.project_id,
    noteType: row.note_type,
    title: row.title,
    status: row.status
  };
}

function mapFieldNoteListItem(row: FieldNoteRow): FieldNoteListItem {
  return {
    ...mapFieldNote(row),
    dailyLog: row.daily_logs
      ? {
          id: row.daily_logs.id,
          logDate: row.daily_logs.log_date
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
          dispatchStatus: row.jobs.dispatch_status
        }
      : null,
    person: row.people
      ? {
          id: row.people.id,
          displayName: row.people.display_name
        }
      : null,
    timeCard: row.time_cards
      ? {
          id: row.time_cards.id,
          workDate: row.time_cards.work_date,
          status: row.time_cards.status
        }
      : null
  };
}

async function ensureScopedJob(organizationId: string, jobId: string | null) {
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

async function ensureScopedPerson(
  organizationId: string,
  personId: string | null
) {
  if (!personId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", personId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(
      `Unable to validate the workforce person: ${response.error.message}`
    );
  }

  if (!data?.id) {
    throw new Error("Workforce person not found for this organization.");
  }

  return data;
}

async function ensureScopedTimeCard(
  organizationId: string,
  timeCardId: string | null
) {
  if (!timeCardId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("time_cards")
    .select("id, person_id, project_id, job_id, work_date")
    .eq("company_id", organizationId)
    .eq("id", timeCardId)
    .maybeSingle();
  const data = response.data as {
    id?: string;
    person_id?: string;
    project_id?: string | null;
    job_id?: string | null;
    work_date?: string;
  } | null;

  if (response.error) {
    throw new Error(
      `Unable to validate the time card: ${response.error.message}`
    );
  }

  if (!data?.id || !data.work_date) {
    throw new Error("Time card not found for this organization.");
  }

  return {
    id: data.id,
    personId: data.person_id ?? null,
    projectId: data.project_id ?? null,
    jobId: data.job_id ?? null,
    workDate: data.work_date
  };
}

async function validateFieldNoteInput(
  organizationId: string,
  input: FieldNoteInput
) {
  const dailyLog = await getDailyLogById(
    input.dailyLogId,
    `/projects/${input.projectId}`
  );

  if (!dailyLog) {
    throw new Error("Daily log not found for this organization.");
  }

  if (dailyLog.projectId !== input.projectId) {
    throw new Error("Field note project must match the selected daily log.");
  }

  const [scopedJob, scopedTimeCard] = await Promise.all([
    ensureScopedJob(organizationId, input.jobId),
    ensureScopedTimeCard(organizationId, input.timeCardId),
    assertProjectReadinessGate({
      organizationId,
      projectId: input.projectId,
      errorMessage:
        "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before creating field notes."
    })
  ]);

  await ensureScopedPerson(organizationId, input.personId);

  if (scopedJob && scopedJob.projectId !== input.projectId) {
    throw new Error("Job must belong to the selected project.");
  }

  if (scopedTimeCard && scopedTimeCard.projectId !== input.projectId) {
    throw new Error("Time card must belong to the selected project.");
  }

  if (scopedTimeCard && scopedTimeCard.workDate !== dailyLog.logDate) {
    throw new Error(
      "Time card work date must match the selected daily log date."
    );
  }

  if (
    scopedTimeCard &&
    input.personId &&
    scopedTimeCard.personId !== input.personId
  ) {
    throw new Error(
      "Time card person must match the selected workforce person."
    );
  }

  if (scopedTimeCard && input.jobId && scopedTimeCard.jobId !== input.jobId) {
    throw new Error("Time card job must match the selected job.");
  }

  return {
    dailyLog
  };
}

export const listFieldNotes = cache(async (): Promise<FieldNoteListItem[]> => {
  const scope = await requireDailyLogScope("/projects");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("field_notes")
    .select(fieldNoteSelect)
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load field notes: ${response.error.message}`);
  }

  if (!isFieldNoteRowArray(data)) {
    return [];
  }

  return data.map(mapFieldNoteListItem);
});

export const listDashboardProjectCueFieldNotes = cache(
  async (): Promise<DashboardProjectCueFieldNote[]> => {
    const scope = await requireDailyLogScope("/projects");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("field_notes")
      .select(dashboardProjectCueFieldNoteSelect)
      .eq("company_id", scope.organizationId)
      .eq("status", "open")
      .in("note_type", ["blocker", "issue"])
      .order("created_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load dashboard field-note cues: ${response.error.message}`
      );
    }

    if (!isDashboardProjectCueFieldNoteRowArray(data)) {
      return [];
    }

    return data.map(mapDashboardProjectCueFieldNote);
  }
);

export async function listFieldNotesByDailyLog(
  dailyLogId: string,
  next = "/projects"
) {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("field_notes")
    .select(fieldNoteSelect)
    .eq("company_id", scope.organizationId)
    .eq("daily_log_id", dailyLogId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load field notes for the daily log: ${response.error.message}`
    );
  }

  if (!isFieldNoteRowArray(data)) {
    return [];
  }

  return data.map(mapFieldNoteListItem);
}

export async function getFieldNoteById(
  fieldNoteId: string,
  next = "/projects"
) {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("field_notes")
    .select(fieldNoteSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", fieldNoteId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the field note: ${response.error.message}`);
  }

  if (!isFieldNoteRow(data)) {
    return null;
  }

  return mapFieldNoteListItem(data);
}

export async function createFieldNote(input: FieldNoteInput) {
  const scope = await requireDailyLogScope(`/projects/${input.projectId}`);
  await validateFieldNoteInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("field_notes")
    .insert({
      company_id: scope.organizationId,
      daily_log_id: input.dailyLogId,
      project_id: input.projectId,
      job_id: input.jobId,
      person_id: input.personId,
      time_card_id: input.timeCardId,
      note_type: input.noteType,
      title: input.title,
      body: input.body,
      status: input.status,
      visibility: input.visibility,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(fieldNoteSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create the field note: ${response.error.message}`
    );
  }

  if (!isFieldNoteRow(data)) {
    throw new Error("Unexpected field note response after create.");
  }

  return mapFieldNoteListItem(data);
}

export async function updateFieldNote(
  fieldNoteId: string,
  input: FieldNoteInput
) {
  const scope = await requireDailyLogScope(`/projects/${input.projectId}`);
  await validateFieldNoteInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("field_notes")
    .update({
      daily_log_id: input.dailyLogId,
      project_id: input.projectId,
      job_id: input.jobId,
      person_id: input.personId,
      time_card_id: input.timeCardId,
      note_type: input.noteType,
      title: input.title,
      body: input.body,
      status: input.status,
      visibility: input.visibility,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", fieldNoteId)
    .select(fieldNoteSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update the field note: ${response.error.message}`
    );
  }

  if (!isFieldNoteRow(data)) {
    throw new Error("Field note not found for this organization.");
  }

  return mapFieldNoteListItem(data);
}
