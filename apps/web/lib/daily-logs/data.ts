import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { deriveDailyLogLaborSummary } from "@floorconnector/domain";
import type {
  DailyLog as DailyLogRecord,
  DailyLogLaborSummary as DailyLogLaborSummaryRecord,
  MembershipRole
} from "@floorconnector/types";

import type { DailyLogInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { assertProjectReadinessGate } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listTimeCardsByProjectAndWorkDate } from "@/lib/time/data";

type DailyLogScope = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
};

type DailyLogRow = {
  id: string;
  company_id: string;
  project_id: string;
  job_id: string | null;
  log_date: string;
  status: DailyLogRecord["status"];
  summary: string | null;
  work_completed: string | null;
  work_planned_next: string | null;
  delays_or_blockers: string | null;
  safety_notes: string | null;
  weather_summary: string | null;
  weather_conditions: string | null;
  temperature_high_f: number | null;
  temperature_low_f: number | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  projects?: {
    id: string;
    name: string;
  } | null;
  jobs?: {
    id: string;
    dispatch_status: string;
  } | null;
};

export type DailyLogListItem = DailyLogRecord & {
  project: {
    id: string;
    name: string;
  } | null;
  job: {
    id: string;
    dispatchStatus: string;
  } | null;
};

export type DailyLogLaborSummary = DailyLogLaborSummaryRecord;

const dailyLogSelect = `
  id,
  company_id,
  project_id,
  job_id,
  log_date,
  status,
  summary,
  work_completed,
  work_planned_next,
  delays_or_blockers,
  safety_notes,
  weather_summary,
  weather_conditions,
  temperature_high_f,
  temperature_low_f,
  created_by,
  updated_by,
  created_at,
  updated_at,
  projects (
    id,
    name
  ),
  jobs (
    id,
    dispatch_status
  )
`;

function isDailyLogRow(value: unknown): value is DailyLogRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DailyLogRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.log_date === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isDailyLogRowArray(value: unknown): value is DailyLogRow[] {
  return Array.isArray(value) && value.every((row) => isDailyLogRow(row));
}

function mapDailyLog(row: DailyLogRow): DailyLogRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    projectId: row.project_id,
    jobId: row.job_id,
    logDate: row.log_date,
    status: row.status,
    summary: row.summary,
    workCompleted: row.work_completed,
    workPlannedNext: row.work_planned_next,
    delaysOrBlockers: row.delays_or_blockers,
    safetyNotes: row.safety_notes,
    weatherSummary: row.weather_summary,
    weatherConditions: row.weather_conditions,
    temperatureHighF: row.temperature_high_f,
    temperatureLowF: row.temperature_low_f,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDailyLogListItem(row: DailyLogRow): DailyLogListItem {
  return {
    ...mapDailyLog(row),
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
      : null
  };
}

async function getDailyLogScope(
  next = "/projects"
): Promise<DailyLogScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    role: organizationContext.membership.role
  };
}

export async function requireDailyLogScope(next = "/projects") {
  const scope = await getDailyLogScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for daily logs yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function ensureScopedProject(organizationId: string, projectId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", projectId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(
      `Unable to validate the project: ${response.error.message}`
    );
  }

  if (!data?.id) {
    throw new Error("Project not found for this organization.");
  }

  return data;
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

async function validateDailyLogInput(
  organizationId: string,
  input: DailyLogInput
) {
  await Promise.all([
    ensureScopedProject(organizationId, input.projectId),
    assertProjectReadinessGate({
      organizationId,
      projectId: input.projectId,
      errorMessage:
        "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before creating daily logs."
    })
  ]);

  const scopedJob = await ensureScopedJob(organizationId, input.jobId);

  if (scopedJob && scopedJob.projectId !== input.projectId) {
    throw new Error("Job must belong to the selected project.");
  }
}

function isUniqueProjectDateViolation(message: string) {
  return message.includes("daily_logs_company_project_log_date_unique_idx");
}

export const listDailyLogs = cache(async (): Promise<DailyLogListItem[]> => {
  const scope = await requireDailyLogScope("/projects");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("daily_logs")
    .select(dailyLogSelect)
    .eq("company_id", scope.organizationId)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load daily logs: ${response.error.message}`);
  }

  if (!isDailyLogRowArray(data)) {
    return [];
  }

  return data.map(mapDailyLogListItem);
});

export async function listDailyLogsByProject(
  projectId: string,
  next = "/projects"
) {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("daily_logs")
    .select(dailyLogSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load project daily logs: ${response.error.message}`
    );
  }

  if (!isDailyLogRowArray(data)) {
    return [];
  }

  return data.map(mapDailyLogListItem);
}

export async function getDailyLogById(dailyLogId: string, next = "/projects") {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("daily_logs")
    .select(dailyLogSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", dailyLogId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the daily log: ${response.error.message}`);
  }

  if (!isDailyLogRow(data)) {
    return null;
  }

  return mapDailyLogListItem(data);
}

export async function createDailyLog(input: DailyLogInput) {
  const scope = await requireDailyLogScope("/projects");
  await validateDailyLogInput(scope.organizationId, input);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("daily_logs")
    .insert({
      company_id: scope.organizationId,
      project_id: input.projectId,
      job_id: input.jobId,
      log_date: input.logDate,
      status: input.status,
      summary: input.summary,
      work_completed: input.workCompleted,
      work_planned_next: input.workPlannedNext,
      delays_or_blockers: input.delaysOrBlockers,
      safety_notes: input.safetyNotes,
      weather_summary: input.weatherSummary,
      weather_conditions: input.weatherConditions,
      temperature_high_f: input.temperatureHighF,
      temperature_low_f: input.temperatureLowF,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(dailyLogSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniqueProjectDateViolation(response.error.message)) {
      throw new Error("A daily log already exists for this project and date.");
    }

    throw new Error(
      `Unable to create the daily log: ${response.error.message}`
    );
  }

  if (!isDailyLogRow(data)) {
    throw new Error("Unexpected daily log response after create.");
  }

  return mapDailyLogListItem(data);
}

export async function updateDailyLog(dailyLogId: string, input: DailyLogInput) {
  const scope = await requireDailyLogScope(`/projects/${dailyLogId}`);
  await validateDailyLogInput(scope.organizationId, input);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("daily_logs")
    .update({
      project_id: input.projectId,
      job_id: input.jobId,
      log_date: input.logDate,
      status: input.status,
      summary: input.summary,
      work_completed: input.workCompleted,
      work_planned_next: input.workPlannedNext,
      delays_or_blockers: input.delaysOrBlockers,
      safety_notes: input.safetyNotes,
      weather_summary: input.weatherSummary,
      weather_conditions: input.weatherConditions,
      temperature_high_f: input.temperatureHighF,
      temperature_low_f: input.temperatureLowF,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", dailyLogId)
    .select(dailyLogSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniqueProjectDateViolation(response.error.message)) {
      throw new Error("A daily log already exists for this project and date.");
    }

    throw new Error(
      `Unable to update the daily log: ${response.error.message}`
    );
  }

  if (!isDailyLogRow(data)) {
    throw new Error("Daily log not found for this organization.");
  }

  return mapDailyLogListItem(data);
}

export async function getDailyLogLaborSummary(
  dailyLogId: string,
  next = "/projects"
): Promise<DailyLogLaborSummary | null> {
  const dailyLog = await getDailyLogById(dailyLogId, next);

  if (!dailyLog) {
    return null;
  }

  const timeCards = await listTimeCardsByProjectAndWorkDate(
    dailyLog.projectId,
    dailyLog.logDate,
    next
  );
  const derivedSummary = deriveDailyLogLaborSummary(
    timeCards.map((timeCard) => ({
      personId: timeCard.personId,
      personDisplayName: timeCard.person?.displayName ?? null,
      jobId: timeCard.jobId,
      jobLabel: timeCard.job ? `Job ${timeCard.job.id.slice(0, 8)}` : null,
      workedMinutes: timeCard.workedMinutes
    }))
  );

  return {
    dailyLogId: dailyLog.id,
    projectId: dailyLog.projectId,
    logDate: dailyLog.logDate,
    peopleOnSiteCount: derivedSummary.peopleOnSiteCount,
    totalWorkedMinutes: derivedSummary.totalWorkedMinutes,
    totalHoursWorked: derivedSummary.totalHoursWorked,
    totalTimeCardCount: derivedSummary.totalTimeCardCount,
    entries: derivedSummary.entries
  };
}
