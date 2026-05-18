import "server-only";

import { cache } from "react";
import type { JobStatus } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type JobsManagerView =
  | "all"
  | "unscheduled"
  | "scheduled"
  | "in_progress"
  | "completed";

export type JobsManagerJob = {
  id: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  crewVendorId: string | null;
  updatedAt: string;
  assignmentCount: number;
  customer: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
  } | null;
  crewVendor: {
    id: string;
    name: string;
  } | null;
};

export type JobQuickCreateProjectOption = {
  id: string;
  name: string;
  customerName: string | null;
};

export type JobsManagerReadModel = {
  jobs: JobsManagerJob[];
  unscheduledJobs: JobsManagerJob[];
  scheduledWithoutCrewVendor: JobsManagerJob[];
  scheduledWithoutAssignments: JobsManagerJob[];
  inProgressJobs: JobsManagerJob[];
  counts: Record<JobsManagerView, number>;
  projectContext: {
    id: string;
    name: string;
  } | null;
};

type JobsManagerJobRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  dispatch_status: JobStatus;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  crew_vendor_id: string | null;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
  estimates?: {
    id: string;
    reference_number: string;
  } | null;
  crew_vendor?: {
    id: string;
    name: string;
  } | null;
};

type IdRow = {
  id: string;
};

type JobAssignmentJobIdRow = {
  job_id: string;
};

type JobQuickCreateProjectRow = {
  id: string;
  name: string;
  customers?: {
    id: string;
    name: string;
  } | null;
};

type ProjectContextRow = {
  id: string;
  name: string;
};

const jobStatuses: Exclude<JobsManagerView, "all">[] = [
  "unscheduled",
  "scheduled",
  "in_progress",
  "completed"
];

const jobsManagerSelect = `
  id,
  customer_id,
  project_id,
  estimate_id,
  dispatch_status,
  scheduled_date,
  scheduled_start_at,
  scheduled_end_at,
  crew_vendor_id,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  estimates (
    id,
    reference_number
  ),
  crew_vendor:vendors!jobs_crew_vendor_id_fkey (
    id,
    name
  )
`;

const quickCreateProjectSelect = `
  id,
  name,
  customers (
    id,
    name
  )
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function mapJob(row: JobsManagerJobRow): JobsManagerJob {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    dispatchStatus: row.dispatch_status,
    scheduledDate: row.scheduled_date,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    crewVendorId: row.crew_vendor_id,
    updatedAt: row.updated_at,
    assignmentCount: 0,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name
        }
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number
        }
      : null,
    crewVendor: row.crew_vendor
      ? {
          id: row.crew_vendor.id,
          name: row.crew_vendor.name
        }
      : null
  };
}

function sortJobs<T extends JobsManagerJob>(jobs: T[]) {
  const statusPriority = new Map<JobStatus, number>([
    ["unscheduled", 0],
    ["scheduled", 1],
    ["in_progress", 2],
    ["completed", 3]
  ]);

  return [...jobs].sort((left, right) => {
    const statusComparison =
      (statusPriority.get(left.dispatchStatus) ?? 99) -
      (statusPriority.get(right.dispatchStatus) ?? 99);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    const scheduledLeft =
      left.scheduledStartAt ?? left.scheduledDate ?? "9999-12-31";
    const scheduledRight =
      right.scheduledStartAt ?? right.scheduledDate ?? "9999-12-31";
    const scheduledComparison = scheduledLeft.localeCompare(scheduledRight);

    if (scheduledComparison !== 0) {
      return scheduledComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function sortRecent<T extends JobsManagerJob>(jobs: T[]) {
  return [...jobs].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

function applyProjectFilter<
  T extends {
    eq: (column: string, value: string) => T;
  }
>(query: T, projectId?: string) {
  return projectId ? query.eq("project_id", projectId) : query;
}

function applyStatusFilter<
  T extends {
    eq: (column: string, value: string) => T;
  }
>(query: T, status?: JobsManagerView) {
  if (!status || status === "all") {
    return query;
  }

  return query.eq("dispatch_status", status);
}

async function findJobRelatedSearchIds(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const [customerResponse, projectResponse, estimateResponse] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`name.ilike.%${escapedQuery}%`),
      supabase
        .from("projects")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`name.ilike.%${escapedQuery}%`),
      supabase
        .from("estimates")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`reference_number.ilike.%${escapedQuery}%`)
    ]);

  if (customerResponse.error) {
    throw new Error(
      `Unable to load job search customer matches: ${customerResponse.error.message}`
    );
  }

  if (projectResponse.error) {
    throw new Error(
      `Unable to load job search project matches: ${projectResponse.error.message}`
    );
  }

  if (estimateResponse.error) {
    throw new Error(
      `Unable to load job search estimate matches: ${estimateResponse.error.message}`
    );
  }

  return {
    customerIds: Array.isArray(customerResponse.data)
      ? (customerResponse.data as IdRow[]).map((row) => row.id)
      : [],
    projectIds: Array.isArray(projectResponse.data)
      ? (projectResponse.data as IdRow[]).map((row) => row.id)
      : [],
    estimateIds: Array.isArray(estimateResponse.data)
      ? (estimateResponse.data as IdRow[]).map((row) => row.id)
      : []
  };
}

async function buildJobSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const relatedIds = await findJobRelatedSearchIds({
    organizationId: input.organizationId,
    query: trimmedQuery
  });
  const normalizedQuery = trimmedQuery.toLowerCase();
  const statusMatches = jobStatuses.filter((status) =>
    status.includes(normalizedQuery)
  );

  const predicates = [
    ...statusMatches.map((status) => `dispatch_status.eq.${status}`),
    ...(relatedIds.customerIds.length > 0
      ? [`customer_id.in.(${relatedIds.customerIds.join(",")})`]
      : []),
    ...(relatedIds.projectIds.length > 0
      ? [`project_id.in.(${relatedIds.projectIds.join(",")})`]
      : []),
    ...(relatedIds.estimateIds.length > 0
      ? [`estimate_id.in.(${relatedIds.estimateIds.join(",")})`]
      : [])
  ];

  return predicates.length > 0 ? predicates : ["id.is.null"];
}

async function countJobs(input: {
  organizationId: string;
  projectId?: string;
  status?: JobsManagerView;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  query = applyProjectFilter(query, input.projectId);
  query = applyStatusFilter(query, input.status);

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count jobs: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function listJobsForManager(input: {
  organizationId: string;
  projectId?: string;
  view?: JobsManagerView;
  query?: string;
  limit?: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildJobSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });
  let query = supabase
    .from("jobs")
    .select(jobsManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false });

  query = applyProjectFilter(query, input.projectId);
  query = applyStatusFilter(query, input.view);

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  if (input.limit) {
    query = query.limit(input.limit);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load jobs manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as JobsManagerJobRow[]).map(mapJob)
    : [];
}

async function listJobQueue(input: {
  organizationId: string;
  projectId?: string;
  status: Exclude<JobsManagerView, "all">;
  missingCrewVendorOnly?: boolean;
  limit?: number;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("jobs")
    .select(jobsManagerSelect)
    .eq("company_id", input.organizationId)
    .eq("dispatch_status", input.status)
    .order("scheduled_start_at", { ascending: true, nullsFirst: false })
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  query = applyProjectFilter(query, input.projectId);

  if (input.missingCrewVendorOnly) {
    query = query.is("crew_vendor_id", null);
  }

  if (input.limit) {
    query = query.limit(input.limit);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load jobs manager queue: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? sortJobs((response.data as unknown as JobsManagerJobRow[]).map(mapJob))
    : [];
}

async function listAssignmentCountsByJobIds(input: {
  organizationId: string;
  jobIds: string[];
}) {
  const jobIds = [...new Set(input.jobIds.filter(Boolean))];

  if (jobIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_assignments")
    .select("job_id")
    .eq("company_id", input.organizationId)
    .in("job_id", jobIds);

  if (response.error) {
    throw new Error(
      `Unable to load jobs manager assignment counts: ${response.error.message}`
    );
  }

  const counts = new Map<string, number>();
  const rows = Array.isArray(response.data)
    ? (response.data as JobAssignmentJobIdRow[])
    : [];

  for (const row of rows) {
    counts.set(row.job_id, (counts.get(row.job_id) ?? 0) + 1);
  }

  return counts;
}

function withAssignmentCounts<T extends JobsManagerJob>(
  jobs: T[],
  counts: Map<string, number>
) {
  return jobs.map((job) => ({
    ...job,
    assignmentCount: counts.get(job.id) ?? 0
  }));
}

async function getProjectContext(input: {
  organizationId: string;
  projectId?: string;
}) {
  if (!input.projectId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id, name")
    .eq("company_id", input.organizationId)
    .eq("id", input.projectId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load jobs project context: ${response.error.message}`
    );
  }

  return (response.data as ProjectContextRow | null) ?? null;
}

export const getJobsManagerReadModel = cache(
  async (input: {
    organizationId: string;
    projectId?: string;
    view?: JobsManagerView;
    query?: string;
  }): Promise<JobsManagerReadModel> => {
    const [
      allCount,
      unscheduledCount,
      scheduledCount,
      inProgressCount,
      completedCount,
      jobs,
      unscheduledJobs,
      scheduledWithoutCrewVendor,
      scheduledJobs,
      inProgressJobs,
      projectContext
    ] = await Promise.all([
      countJobs(input),
      countJobs({ ...input, status: "unscheduled" }),
      countJobs({ ...input, status: "scheduled" }),
      countJobs({ ...input, status: "in_progress" }),
      countJobs({ ...input, status: "completed" }),
      listJobsForManager({ ...input, limit: 20 }),
      listJobQueue({ ...input, status: "unscheduled", limit: 4 }),
      listJobQueue({
        ...input,
        status: "scheduled",
        missingCrewVendorOnly: true,
        limit: 4
      }),
      listJobQueue({ ...input, status: "scheduled" }),
      listJobQueue({ ...input, status: "in_progress", limit: 4 }),
      getProjectContext(input)
    ]);
    const assignmentCounts = await listAssignmentCountsByJobIds({
      organizationId: input.organizationId,
      jobIds: [...jobs, ...scheduledJobs].map((job) => job.id)
    });
    const jobsWithAssignmentCounts = sortRecent(
      withAssignmentCounts(jobs, assignmentCounts)
    );
    const scheduledWithAssignmentCounts = sortJobs(
      withAssignmentCounts(scheduledJobs, assignmentCounts)
    );

    return {
      jobs: jobsWithAssignmentCounts,
      unscheduledJobs,
      scheduledWithoutCrewVendor,
      scheduledWithoutAssignments: scheduledWithAssignmentCounts
        .filter((job) => job.assignmentCount === 0)
        .slice(0, 4),
      inProgressJobs,
      counts: {
        all: allCount,
        unscheduled: unscheduledCount,
        scheduled: scheduledCount,
        in_progress: inProgressCount,
        completed: completedCount
      },
      projectContext
    };
  }
);

export const getJobQuickCreateOptions = cache(
  async (organizationId: string): Promise<JobQuickCreateProjectOption[]> => {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("projects")
      .select(quickCreateProjectSelect)
      .eq("company_id", organizationId)
      .not("ready_to_schedule_at", "is", null)
      .order("updated_at", { ascending: false });

    if (response.error) {
      throw new Error(
        `Unable to load job quick-create project options: ${response.error.message}`
      );
    }

    const rows = Array.isArray(response.data)
      ? (response.data as unknown as JobQuickCreateProjectRow[])
      : [];

    return rows.map((project) => ({
      id: project.id,
      name: project.name,
      customerName: project.customers?.name ?? null
    }));
  }
);

export function isJobsManagerView(
  value: string | null | undefined
): value is JobsManagerView {
  return (
    value === "all" ||
    jobStatuses.includes(value as Exclude<JobsManagerView, "all">)
  );
}
