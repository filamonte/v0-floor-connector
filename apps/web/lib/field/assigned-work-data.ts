import "server-only";

import { cache } from "react";

import { getDashboardProjectFinancialReadinessSummaries } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCurrentUserWorkItemPerson,
  requireWorkItemScope,
  type CurrentUserWorkItemPerson
} from "@/lib/work-items/data";

import type {
  FieldAssignedWorkAssignee,
  FieldAssignedWorkJob
} from "./assigned-work-read-model";

type FieldAssignedJobRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  dispatch_status: FieldAssignedWorkJob["dispatchStatus"];
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  schedule_notes: string | null;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
      }
    | Array<{
        id: string;
        name: string;
        company_name: string | null;
      }>
    | null;
  projects?:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

type FieldAssignedJobAssignmentRow = {
  id: string;
  job_id: string;
  person_id: string | null;
  vendor_id: string | null;
  role: string;
  people?:
    | {
        id: string;
        display_name: string;
      }
    | Array<{
        id: string;
        display_name: string;
      }>
    | null;
  vendors?:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

type CountRow = {
  id: string;
  job_id: string | null;
};

type DailyLogContextRow = CountRow & {
  log_date: string;
  status: string;
  updated_at: string;
};

type FieldNoteContextRow = CountRow & {
  daily_log_id: string;
  note_type: string;
  title: string;
  status: string;
  created_at: string;
};

type TimeCardCountRow = CountRow & {
  status: string;
};

const fieldAssignedJobSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  dispatch_status,
  scheduled_date,
  scheduled_start_at,
  scheduled_end_at,
  schedule_notes,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name
  )
`;

const fieldAssignedJobAssignmentSelect = `
  id,
  job_id,
  person_id,
  vendor_id,
  role,
  people (
    id,
    display_name
  ),
  vendors (
    id,
    name
  )
`;

function isFieldAssignedJobRow(value: unknown): value is FieldAssignedJobRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<FieldAssignedJobRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.dispatch_status === "string" &&
    (row.scheduled_date === null || typeof row.scheduled_date === "string") &&
    (row.scheduled_start_at === null ||
      typeof row.scheduled_start_at === "string") &&
    (row.scheduled_end_at === null ||
      typeof row.scheduled_end_at === "string") &&
    (row.schedule_notes === null || typeof row.schedule_notes === "string") &&
    typeof row.updated_at === "string"
  );
}

function isFieldAssignedJobAssignmentRow(
  value: unknown
): value is FieldAssignedJobAssignmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<FieldAssignedJobAssignmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.job_id === "string" &&
    (row.person_id === null || typeof row.person_id === "string") &&
    (row.vendor_id === null || typeof row.vendor_id === "string") &&
    typeof row.role === "string"
  );
}

function isCountRow(value: unknown): value is CountRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<CountRow>;

  return (
    typeof row.id === "string" &&
    (row.job_id === null || typeof row.job_id === "string")
  );
}

function isDailyLogContextRow(value: unknown): value is DailyLogContextRow {
  if (!isCountRow(value)) {
    return false;
  }

  const row = value as Partial<DailyLogContextRow>;

  return (
    typeof row.log_date === "string" &&
    typeof row.status === "string" &&
    typeof row.updated_at === "string"
  );
}

function isFieldNoteContextRow(value: unknown): value is FieldNoteContextRow {
  if (!isCountRow(value)) {
    return false;
  }

  const row = value as Partial<FieldNoteContextRow>;

  return (
    typeof row.daily_log_id === "string" &&
    typeof row.note_type === "string" &&
    typeof row.title === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string"
  );
}

function isTimeCardCountRow(value: unknown): value is TimeCardCountRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<TimeCardCountRow>;

  return isCountRow(value) && typeof row.status === "string";
}

function countByJobId(rows: CountRow[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    if (!row.job_id) {
      continue;
    }

    counts.set(row.job_id, (counts.get(row.job_id) ?? 0) + 1);
  }

  return counts;
}

function mapLatestDailyLogByJobId(rows: DailyLogContextRow[]) {
  const latestByJobId = new Map<
    string,
    FieldAssignedWorkJob["latestDailyLog"]
  >();

  for (const row of [...rows].sort((left, right) => {
    const dateComparison = right.log_date.localeCompare(left.log_date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return right.updated_at.localeCompare(left.updated_at);
  })) {
    if (!row.job_id || latestByJobId.has(row.job_id)) {
      continue;
    }

    latestByJobId.set(row.job_id, {
      id: row.id,
      logDate: row.log_date,
      status: row.status
    });
  }

  return latestByJobId;
}

function mapLatestOpenFieldBlockerByJobId(rows: FieldNoteContextRow[]) {
  const latestByJobId = new Map<
    string,
    FieldAssignedWorkJob["latestOpenFieldBlocker"]
  >();

  for (const row of [...rows].sort((left, right) =>
    right.created_at.localeCompare(left.created_at)
  )) {
    if (!row.job_id || latestByJobId.has(row.job_id)) {
      continue;
    }

    latestByJobId.set(row.job_id, {
      id: row.id,
      dailyLogId: row.daily_log_id,
      title: row.title,
      noteType: row.note_type
    });
  }

  return latestByJobId;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function mapAssignmentsByJobId(rows: FieldAssignedJobAssignmentRow[]) {
  const assignmentsByJobId = new Map<string, FieldAssignedWorkAssignee[]>();

  for (const row of rows) {
    const person = unwrapOne(row.people);
    const vendor = unwrapOne(row.vendors);
    const assignee = person
      ? {
          id: person.id,
          label: person.display_name,
          kind: "person" as const,
          role: row.role
        }
      : vendor
        ? {
            id: vendor.id,
            label: vendor.name,
            kind: "vendor" as const,
            role: row.role
          }
        : null;

    if (!assignee) {
      continue;
    }

    const existing = assignmentsByJobId.get(row.job_id);

    if (existing) {
      existing.push(assignee);
    } else {
      assignmentsByJobId.set(row.job_id, [assignee]);
    }
  }

  return assignmentsByJobId;
}

function mapFieldAssignedWorkJob(input: {
  row: FieldAssignedJobRow;
  assignments: FieldAssignedWorkAssignee[];
  dailyLogCount: number;
  latestDailyLog: FieldAssignedWorkJob["latestDailyLog"];
  fieldNoteCount: number;
  openFieldBlockerCount: number;
  latestOpenFieldBlocker: FieldAssignedWorkJob["latestOpenFieldBlocker"];
  timeCardCount: number;
  openTimeCardCount: number;
  readiness: FieldAssignedWorkJob["readiness"];
}): FieldAssignedWorkJob {
  const customer = unwrapOne(input.row.customers);
  const project = unwrapOne(input.row.projects);

  return {
    id: input.row.id,
    dispatchStatus: input.row.dispatch_status,
    scheduledDate: input.row.scheduled_date,
    scheduledStartAt: input.row.scheduled_start_at,
    scheduledEndAt: input.row.scheduled_end_at,
    scheduleNotes: input.row.schedule_notes,
    updatedAt: input.row.updated_at,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          companyName: customer.company_name
        }
      : null,
    project: project
      ? {
          id: project.id,
          name: project.name
        }
      : null,
    assignments: input.assignments,
    dailyLogCount: input.dailyLogCount,
    latestDailyLog: input.latestDailyLog,
    fieldNoteCount: input.fieldNoteCount,
    openFieldBlockerCount: input.openFieldBlockerCount,
    latestOpenFieldBlocker: input.latestOpenFieldBlocker,
    timeCardCount: input.timeCardCount,
    openTimeCardCount: input.openTimeCardCount,
    readiness: input.readiness
  };
}

async function listCurrentPersonAssignedJobIds(input: {
  organizationId: string;
  personId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_assignments")
    .select("job_id")
    .eq("company_id", input.organizationId)
    .eq("person_id", input.personId);

  if (response.error) {
    throw new Error(
      `Unable to load assigned job ids: ${response.error.message}`
    );
  }

  return [
    ...new Set(
      (response.data ?? [])
        .map((row) => (typeof row.job_id === "string" ? row.job_id : null))
        .filter((jobId): jobId is string => Boolean(jobId))
    )
  ];
}

export const listAssignedFieldWorkForCurrentUser = cache(
  async (
    next = "/field/work-items"
  ): Promise<{
    currentPerson: CurrentUserWorkItemPerson | null;
    jobs: FieldAssignedWorkJob[];
  }> => {
    const scope = await requireWorkItemScope(next);
    const currentPerson = await getCurrentUserWorkItemPerson(next);

    if (!currentPerson) {
      return {
        currentPerson: null,
        jobs: []
      };
    }

    const jobIds = await listCurrentPersonAssignedJobIds({
      organizationId: scope.organizationId,
      personId: currentPerson.id
    });

    if (jobIds.length === 0) {
      return {
        currentPerson,
        jobs: []
      };
    }

    const supabase = await getSupabaseServerClient();
    const [
      jobsResponse,
      assignmentsResponse,
      dailyLogsResponse,
      fieldNotesResponse,
      timeCardsResponse
    ] = await Promise.all([
      supabase
        .from("jobs")
        .select(fieldAssignedJobSelect)
        .eq("company_id", scope.organizationId)
        .in("id", jobIds),
      supabase
        .from("job_assignments")
        .select(fieldAssignedJobAssignmentSelect)
        .eq("company_id", scope.organizationId)
        .in("job_id", jobIds)
        .order("role", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("daily_logs")
        .select("id, job_id, log_date, status, updated_at")
        .eq("company_id", scope.organizationId)
        .in("job_id", jobIds),
      supabase
        .from("field_notes")
        .select(
          "id, job_id, daily_log_id, note_type, title, status, created_at"
        )
        .eq("company_id", scope.organizationId)
        .in("job_id", jobIds),
      supabase
        .from("time_cards")
        .select("id, job_id, status")
        .eq("company_id", scope.organizationId)
        .eq("person_id", currentPerson.id)
        .in("job_id", jobIds)
    ]);

    if (jobsResponse.error) {
      throw new Error(
        `Unable to load assigned field jobs: ${jobsResponse.error.message}`
      );
    }

    if (assignmentsResponse.error) {
      throw new Error(
        `Unable to load assigned field crews: ${assignmentsResponse.error.message}`
      );
    }

    if (dailyLogsResponse.error) {
      throw new Error(
        `Unable to load assigned field daily-log counts: ${dailyLogsResponse.error.message}`
      );
    }

    if (fieldNotesResponse.error) {
      throw new Error(
        `Unable to load assigned field note counts: ${fieldNotesResponse.error.message}`
      );
    }

    if (timeCardsResponse.error) {
      throw new Error(
        `Unable to load assigned field time counts: ${timeCardsResponse.error.message}`
      );
    }

    const rawJobRows: unknown[] = Array.isArray(jobsResponse.data)
      ? jobsResponse.data
      : [];
    const rawAssignmentRows: unknown[] = Array.isArray(assignmentsResponse.data)
      ? assignmentsResponse.data
      : [];
    const rawDailyLogRows: unknown[] = Array.isArray(dailyLogsResponse.data)
      ? dailyLogsResponse.data
      : [];
    const rawFieldNoteRows: unknown[] = Array.isArray(fieldNotesResponse.data)
      ? fieldNotesResponse.data
      : [];
    const rawTimeCardRows: unknown[] = Array.isArray(timeCardsResponse.data)
      ? timeCardsResponse.data
      : [];
    const jobRows = rawJobRows.filter(isFieldAssignedJobRow);
    const assignmentsByJobId = mapAssignmentsByJobId(
      rawAssignmentRows.filter(isFieldAssignedJobAssignmentRow)
    );
    const dailyLogRows = rawDailyLogRows.filter(isDailyLogContextRow);
    const fieldNoteRows = rawFieldNoteRows.filter(isFieldNoteContextRow);
    const dailyLogCounts = countByJobId(dailyLogRows);
    const latestDailyLogByJobId = mapLatestDailyLogByJobId(dailyLogRows);
    const fieldNoteCounts = countByJobId(fieldNoteRows);
    const openFieldBlockerRows = fieldNoteRows.filter(
      (row) =>
        row.status === "open" &&
        (row.note_type === "blocker" || row.note_type === "issue")
    );
    const openFieldBlockerCounts = countByJobId(openFieldBlockerRows);
    const latestOpenFieldBlockerByJobId =
      mapLatestOpenFieldBlockerByJobId(openFieldBlockerRows);
    const timeCardRows = rawTimeCardRows.filter(isTimeCardCountRow);
    const timeCardCounts = countByJobId(timeCardRows);
    const openTimeCardCounts = countByJobId(
      timeCardRows.filter((row) => row.status === "open")
    );
    const readinessByProjectId =
      await getDashboardProjectFinancialReadinessSummaries({
        organizationId: scope.organizationId,
        projectIds: jobRows.map((row) => row.project_id)
      });

    return {
      currentPerson,
      jobs: jobRows.map((row) =>
        mapFieldAssignedWorkJob({
          row,
          assignments: assignmentsByJobId.get(row.id) ?? [],
          dailyLogCount: dailyLogCounts.get(row.id) ?? 0,
          latestDailyLog: latestDailyLogByJobId.get(row.id) ?? null,
          fieldNoteCount: fieldNoteCounts.get(row.id) ?? 0,
          openFieldBlockerCount: openFieldBlockerCounts.get(row.id) ?? 0,
          latestOpenFieldBlocker:
            latestOpenFieldBlockerByJobId.get(row.id) ?? null,
          timeCardCount: timeCardCounts.get(row.id) ?? 0,
          openTimeCardCount: openTimeCardCounts.get(row.id) ?? 0,
          readiness: readinessByProjectId.get(row.project_id) ?? null
        })
      )
    };
  }
);
