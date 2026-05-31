import "server-only";

import { cache } from "react";

import { requireJobScope } from "@/lib/jobs/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  buildScheduleFieldHandoffSummaries,
  type ScheduleFieldHandoffDailyLog,
  type ScheduleFieldHandoffFieldNote,
  type ScheduleFieldHandoffJob,
  type ScheduleFieldHandoffSummary,
  type ScheduleFieldHandoffTimeCard
} from "./field-handoff-read-model";

type DailyLogHandoffRow = {
  id: string;
  job_id: string | null;
  log_date: string;
  status: string;
  updated_at: string;
};

type FieldNoteHandoffRow = {
  id: string;
  job_id: string | null;
  note_type: string;
  status: string;
  updated_at: string;
};

type TimeCardHandoffRow = {
  id: string;
  job_id: string | null;
  work_date: string;
  status: string;
  updated_at: string;
};

function isDailyLogHandoffRow(value: unknown): value is DailyLogHandoffRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DailyLogHandoffRow>;

  return (
    typeof row.id === "string" &&
    (row.job_id === null || typeof row.job_id === "string") &&
    typeof row.log_date === "string" &&
    typeof row.status === "string" &&
    typeof row.updated_at === "string"
  );
}

function isFieldNoteHandoffRow(value: unknown): value is FieldNoteHandoffRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<FieldNoteHandoffRow>;

  return (
    typeof row.id === "string" &&
    (row.job_id === null || typeof row.job_id === "string") &&
    typeof row.note_type === "string" &&
    typeof row.status === "string" &&
    typeof row.updated_at === "string"
  );
}

function isTimeCardHandoffRow(value: unknown): value is TimeCardHandoffRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<TimeCardHandoffRow>;

  return (
    typeof row.id === "string" &&
    (row.job_id === null || typeof row.job_id === "string") &&
    typeof row.work_date === "string" &&
    typeof row.status === "string" &&
    typeof row.updated_at === "string"
  );
}

function mapDailyLogHandoffRow(
  row: DailyLogHandoffRow
): ScheduleFieldHandoffDailyLog {
  return {
    id: row.id,
    jobId: row.job_id,
    logDate: row.log_date,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function mapFieldNoteHandoffRow(
  row: FieldNoteHandoffRow
): ScheduleFieldHandoffFieldNote {
  return {
    id: row.id,
    jobId: row.job_id,
    noteType: row.note_type,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function mapTimeCardHandoffRow(
  row: TimeCardHandoffRow
): ScheduleFieldHandoffTimeCard {
  return {
    id: row.id,
    jobId: row.job_id,
    workDate: row.work_date,
    status: row.status,
    updatedAt: row.updated_at
  };
}

export const listScheduleFieldHandoffsByJobIds = cache(
  async (input: {
    jobs: ScheduleFieldHandoffJob[];
    todayDateKey: string;
  }): Promise<Map<string, ScheduleFieldHandoffSummary>> => {
    const jobIds = [...new Set(input.jobs.map((job) => job.id))];

    if (jobIds.length === 0) {
      return new Map();
    }

    const scope = await requireJobScope("/schedule");
    const supabase = await getSupabaseServerClient();
    const [dailyLogsResponse, fieldNotesResponse, timeCardsResponse] =
      await Promise.all([
        supabase
          .from("daily_logs")
          .select("id, job_id, log_date, status, updated_at")
          .eq("company_id", scope.organizationId)
          .in("job_id", jobIds),
        supabase
          .from("field_notes")
          .select("id, job_id, note_type, status, updated_at")
          .eq("company_id", scope.organizationId)
          .in("job_id", jobIds),
        supabase
          .from("time_cards")
          .select("id, job_id, work_date, status, updated_at")
          .eq("company_id", scope.organizationId)
          .in("job_id", jobIds)
      ]);

    if (dailyLogsResponse.error) {
      throw new Error(
        `Unable to load schedule field Daily Logs: ${dailyLogsResponse.error.message}`
      );
    }

    if (fieldNotesResponse.error) {
      throw new Error(
        `Unable to load schedule field notes: ${fieldNotesResponse.error.message}`
      );
    }

    if (timeCardsResponse.error) {
      throw new Error(
        `Unable to load schedule field time cards: ${timeCardsResponse.error.message}`
      );
    }

    const rawDailyLogs: unknown[] = Array.isArray(dailyLogsResponse.data)
      ? dailyLogsResponse.data
      : [];
    const rawFieldNotes: unknown[] = Array.isArray(fieldNotesResponse.data)
      ? fieldNotesResponse.data
      : [];
    const rawTimeCards: unknown[] = Array.isArray(timeCardsResponse.data)
      ? timeCardsResponse.data
      : [];

    return buildScheduleFieldHandoffSummaries({
      jobs: input.jobs,
      todayDateKey: input.todayDateKey,
      dailyLogs: rawDailyLogs
        .filter(isDailyLogHandoffRow)
        .map(mapDailyLogHandoffRow),
      fieldNotes: rawFieldNotes
        .filter(isFieldNoteHandoffRow)
        .map(mapFieldNoteHandoffRow),
      timeCards: rawTimeCards
        .filter(isTimeCardHandoffRow)
        .map(mapTimeCardHandoffRow)
    });
  }
);
