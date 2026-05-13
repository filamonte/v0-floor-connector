import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { compareJobStatuses } from "@floorconnector/domain";
import type {
  Job as JobRecord,
  JobAssignment as JobAssignmentRecord,
  JobAssignmentRole,
  JobStatus
} from "@floorconnector/types";

import type { JobAssignmentInput, JobInput, JobScheduleInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getProjectById } from "@/lib/projects/data";
import { assertProjectReadinessGate } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  dispatch_status: JobStatus;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  schedule_notes: string | null;
  crew_vendor_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
      }
    | null;
  estimates?:
    | {
        id: string;
        reference_number: string;
        status: string;
      }
    | null;
  crew_vendor?:
    | {
        id: string;
        name: string;
        is_labor_provider: boolean;
      }
    | null;
};

type JobAssignmentRow = {
  id: string;
  company_id: string;
  job_id: string;
  person_id: string | null;
  vendor_id: string | null;
  role: JobAssignmentRole;
  assigned_start_at: string | null;
  assigned_end_at: string | null;
  created_at: string;
  updated_at: string;
  people?:
    | {
        id: string;
        display_name: string;
        is_active: boolean;
        is_assignable: boolean;
      }
    | null;
  vendors?:
    | {
        id: string;
        name: string;
        is_labor_provider: boolean;
        is_active: boolean;
      }
    | null;
};

type JobScope = {
  userId: string;
  organizationId: string;
};

export type JobListItem = JobRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  crewVendor: {
    id: string;
    name: string;
    isLaborProvider: boolean;
  } | null;
};

export type JobAssignmentListItem = JobAssignmentRecord & {
  person: {
    id: string;
    displayName: string;
    isActive: boolean;
    isAssignable: boolean;
  } | null;
  vendor: {
    id: string;
    name: string;
    isActive: boolean;
    isLaborProvider: boolean;
  } | null;
};

export type JobAssignmentsByJobId = Map<string, JobAssignmentListItem[]>;

const jobSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  dispatch_status,
  scheduled_date,
  scheduled_start_at,
  scheduled_end_at,
  schedule_notes,
  crew_vendor_id,
  notes,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name
  ),
  estimates (
    id,
    reference_number,
    status
  ),
  crew_vendor:vendors!jobs_crew_vendor_id_fkey (
    id,
    name,
    is_labor_provider
  )
`;

const jobAssignmentSelect = `
  id,
  company_id,
  job_id,
  person_id,
  vendor_id,
  role,
  assigned_start_at,
  assigned_end_at,
  created_at,
  updated_at,
  people (
    id,
    display_name,
    is_active,
    is_assignable
  ),
  vendors (
    id,
    name,
    is_labor_provider,
    is_active
  )
`;

function isJobRow(value: unknown): value is JobRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<JobRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    (row.estimate_id === null || typeof row.estimate_id === "string") &&
    typeof row.dispatch_status === "string" &&
    (row.scheduled_date === null || typeof row.scheduled_date === "string") &&
    (row.scheduled_start_at === null || typeof row.scheduled_start_at === "string") &&
    (row.scheduled_end_at === null || typeof row.scheduled_end_at === "string") &&
    (row.schedule_notes === null || typeof row.schedule_notes === "string") &&
    (row.crew_vendor_id === null || typeof row.crew_vendor_id === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isJobRowArray(value: unknown): value is JobRow[] {
  return Array.isArray(value) && value.every((row) => isJobRow(row));
}

function isJobAssignmentRow(value: unknown): value is JobAssignmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<JobAssignmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.job_id === "string" &&
    (row.person_id === null || typeof row.person_id === "string") &&
    (row.vendor_id === null || typeof row.vendor_id === "string") &&
    typeof row.role === "string" &&
    (row.assigned_start_at === null || typeof row.assigned_start_at === "string") &&
    (row.assigned_end_at === null || typeof row.assigned_end_at === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isJobAssignmentRowArray(value: unknown): value is JobAssignmentRow[] {
  return Array.isArray(value) && value.every((row) => isJobAssignmentRow(row));
}

function mapJob(row: JobRow): JobRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    dispatchStatus: row.dispatch_status,
    scheduledDate: row.scheduled_date,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    scheduleNotes: row.schedule_notes,
    crewVendorId: row.crew_vendor_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapJobListItem(row: JobRow): JobListItem {
  return {
    ...mapJob(row),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
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
          referenceNumber: row.estimates.reference_number,
          status: row.estimates.status
        }
      : null,
    crewVendor: row.crew_vendor
      ? {
          id: row.crew_vendor.id,
          name: row.crew_vendor.name,
          isLaborProvider: row.crew_vendor.is_labor_provider
        }
      : null
  };
}

function mapJobAssignment(row: JobAssignmentRow): JobAssignmentRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    jobId: row.job_id,
    personId: row.person_id,
    vendorId: row.vendor_id,
    role: row.role,
    assignedStartAt: row.assigned_start_at,
    assignedEndAt: row.assigned_end_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapJobAssignmentListItem(row: JobAssignmentRow): JobAssignmentListItem {
  return {
    ...mapJobAssignment(row),
    person: row.people
      ? {
          id: row.people.id,
          displayName: row.people.display_name,
          isActive: row.people.is_active,
          isAssignable: row.people.is_assignable
        }
      : null,
    vendor: row.vendors
      ? {
          id: row.vendors.id,
          name: row.vendors.name,
          isActive: row.vendors.is_active,
          isLaborProvider: row.vendors.is_labor_provider
        }
      : null
  };
}

async function getJobRecordById(
  organizationId: string,
  jobId: string
): Promise<JobRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(jobSelect)
    .eq("company_id", organizationId)
    .eq("id", jobId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the job: ${response.error.message}`);
  }

  return isJobRow(data) ? data : null;
}

async function getJobAssignmentRecordById(
  organizationId: string,
  jobId: string,
  assignmentId: string
): Promise<JobAssignmentRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_assignments")
    .select(jobAssignmentSelect)
    .eq("company_id", organizationId)
    .eq("job_id", jobId)
    .eq("id", assignmentId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the job assignment: ${response.error.message}`);
  }

  return isJobAssignmentRow(data) ? data : null;
}

async function getJobScope(next = "/jobs"): Promise<JobScope | null> {
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

export async function requireJobScope(next = "/jobs") {
  const scope = await getJobScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for jobs yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

function sortJobs(jobs: JobListItem[]) {
  return jobs.sort((left, right) => {
    const statusComparison = compareJobStatuses(
      left.dispatchStatus,
      right.dispatchStatus
    );

    if (statusComparison !== 0) {
      return statusComparison;
    }

    const scheduledLeft = left.scheduledStartAt ?? left.scheduledDate ?? "9999-12-31";
    const scheduledRight = right.scheduledStartAt ?? right.scheduledDate ?? "9999-12-31";
    const scheduledComparison = scheduledLeft.localeCompare(scheduledRight);

    if (scheduledComparison !== 0) {
      return scheduledComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export const listJobs = cache(async (): Promise<JobListItem[]> => {
  const scope = await requireJobScope("/jobs");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(jobSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load jobs: ${response.error.message}`);
  }

  if (!isJobRowArray(data)) {
    return [];
  }

  return sortJobs(data.map(mapJobListItem));
});

export const listJobsByCustomer = cache(
  async (customerId: string, next = "/jobs"): Promise<JobListItem[]> => {
    const scope = await requireJobScope(next);
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("jobs")
      .select(jobSelect)
      .eq("company_id", scope.organizationId)
      .eq("customer_id", customerId)
      .order("updated_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(`Unable to load customer jobs: ${response.error.message}`);
    }

    if (!isJobRowArray(data)) {
      return [];
    }

    return sortJobs(data.map(mapJobListItem));
  }
);

export async function listScheduledJobsByDate(workDate: string, next = "/jobs") {
  const scope = await requireJobScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(jobSelect)
    .eq("company_id", scope.organizationId)
    .eq("scheduled_date", workDate)
    .neq("dispatch_status", "unscheduled")
    .order("scheduled_start_at", { ascending: true, nullsFirst: true })
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load scheduled jobs for the selected date: ${response.error.message}`
    );
  }

  if (!isJobRowArray(data)) {
    return [];
  }

  return sortJobs(data.map(mapJobListItem));
}

export async function listUnscheduledJobs(next = "/jobs") {
  const scope = await requireJobScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(jobSelect)
    .eq("company_id", scope.organizationId)
    .eq("dispatch_status", "unscheduled")
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load unscheduled jobs: ${response.error.message}`);
  }

  if (!isJobRowArray(data)) {
    return [];
  }

  return sortJobs(data.map(mapJobListItem));
}

export async function getJobById(jobId: string, next = "/jobs") {
  const scope = await requireJobScope(next);
  const job = await getJobRecordById(scope.organizationId, jobId);

  return job ? mapJobListItem(job) : null;
}

export async function listJobAssignments(jobId: string, next = "/jobs") {
  const scope = await requireJobScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_assignments")
    .select(jobAssignmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .order("role", { ascending: true })
    .order("assigned_start_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load job assignments: ${response.error.message}`);
  }

  if (!isJobAssignmentRowArray(data)) {
    return [];
  }

  return data.map(mapJobAssignmentListItem);
}

export async function listJobAssignmentsByJobIds(
  jobIds: string[],
  next = "/schedule"
): Promise<JobAssignmentsByJobId> {
  const scopedJobIds = [...new Set(jobIds.filter(Boolean))];

  if (scopedJobIds.length === 0) {
    return new Map();
  }

  const scope = await requireJobScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_assignments")
    .select(jobAssignmentSelect)
    .eq("company_id", scope.organizationId)
    .in("job_id", scopedJobIds)
    .order("role", { ascending: true })
    .order("assigned_start_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load job assignments: ${response.error.message}`);
  }

  if (!isJobAssignmentRowArray(data)) {
    return new Map();
  }

  const assignmentsByJobId: JobAssignmentsByJobId = new Map();

  for (const row of data.map(mapJobAssignmentListItem)) {
    const existing = assignmentsByJobId.get(row.jobId);

    if (existing) {
      existing.push(row);
      continue;
    }

    assignmentsByJobId.set(row.jobId, [row]);
  }

  return assignmentsByJobId;
}

async function resolveScopedProject(projectId: string, next: string) {
  const project = await getProjectById(projectId, next);

  if (!project || !project.customer) {
    throw new Error("Project not found for this organization.");
  }

  return project;
}

async function resolveApprovedEstimate(
  estimateId: string | null,
  projectId: string,
  next: string
) {
  if (!estimateId) {
    return null;
  }

  const estimate = await getEstimateById(estimateId, next);

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (estimate.projectId !== projectId) {
    throw new Error("Estimate must belong to the selected project.");
  }

  if (estimate.status !== "approved") {
    throw new Error("Only approved estimates can create linked jobs.");
  }

  return estimate;
}

async function ensureScopedCrewVendor(organizationId: string, vendorId: string | null) {
  if (!vendorId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select("id, is_labor_provider, is_active")
    .eq("company_id", organizationId)
    .eq("id", vendorId)
    .maybeSingle();
  const data = response.data as
    | { id?: string; is_labor_provider?: boolean; is_active?: boolean }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the crew vendor: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Vendor not found for this organization.");
  }

  if (!data.is_labor_provider) {
    throw new Error("Only labor-provider vendors can be assigned as a crew vendor.");
  }

  if (!data.is_active) {
    throw new Error("Only active vendors can be assigned as a crew vendor.");
  }

  return data;
}

async function ensureScopedAssignablePerson(organizationId: string, personId: string | null) {
  if (!personId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, is_active, is_assignable")
    .eq("company_id", organizationId)
    .eq("id", personId)
    .maybeSingle();
  const data = response.data as
    | { id?: string; is_active?: boolean; is_assignable?: boolean }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the crew assignment person: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Workforce person not found for this organization.");
  }

  if (!data.is_active) {
    throw new Error("Only active workforce people can be assigned to a job.");
  }

  if (!data.is_assignable) {
    throw new Error("Only assignable workforce people can be assigned to a job.");
  }

  return data;
}

function getScheduleUpdateFromInput(input: JobScheduleInput) {
  return {
    scheduled_date: input.scheduledDate,
    scheduled_start_at: input.scheduledStartAt,
    scheduled_end_at: input.scheduledEndAt,
    schedule_notes: input.scheduleNotes
  };
}

function isSchedulingOrExecutionUpdate(
  currentJob: JobRow,
  input: JobInput,
  isReassigningProject: boolean
) {
  return (
    isReassigningProject ||
    input.dispatchStatus === "scheduled" ||
    input.dispatchStatus === "in_progress" ||
    input.dispatchStatus === "completed" ||
    (currentJob.dispatch_status === "unscheduled" &&
      (input.scheduledDate !== null ||
        input.scheduledStartAt !== null ||
        input.scheduledEndAt !== null))
  );
}

export async function createJob(input: JobInput) {
  const scope = await requireJobScope("/jobs");
  const project = await resolveScopedProject(input.projectId, "/jobs");
  const estimate = await resolveApprovedEstimate(input.estimateId, input.projectId, "/jobs");

  await Promise.all([
    assertProjectReadinessGate({
      organizationId: scope.organizationId,
      projectId: project.id,
      errorMessage:
        "Project is not ready for job creation yet. Complete contract, financial, and workflow readiness from the project hub before creating a job."
    }),
    ensureScopedCrewVendor(scope.organizationId, input.crewVendorId)
  ]);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .insert({
      company_id: scope.organizationId,
      customer_id: project.customerId,
      project_id: project.id,
      estimate_id: estimate?.id ?? null,
      dispatch_status: input.dispatchStatus,
      scheduled_date: input.scheduledDate,
      scheduled_start_at: input.scheduledStartAt,
      scheduled_end_at: input.scheduledEndAt,
      schedule_notes: input.scheduleNotes,
      crew_vendor_id: input.crewVendorId,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(jobSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the job: ${response.error.message}`);
  }

  if (!isJobRow(data)) {
    throw new Error("Unexpected job response after create.");
  }

  return mapJob(data);
}

export async function updateJob(jobId: string, input: JobInput) {
  const scope = await requireJobScope(`/jobs/${jobId}`);
  const currentJob = await getJobRecordById(scope.organizationId, jobId);

  if (!currentJob) {
    throw new Error("Job not found for this organization.");
  }

  const project = await resolveScopedProject(input.projectId, `/jobs/${jobId}`);
  const estimate = await resolveApprovedEstimate(
    input.estimateId,
    input.projectId,
    `/jobs/${jobId}`
  );
  const isReassigningProject = currentJob.project_id !== project.id;

  if (isSchedulingOrExecutionUpdate(currentJob, input, isReassigningProject)) {
    await assertProjectReadinessGate({
      organizationId: scope.organizationId,
      projectId: project.id,
      errorMessage:
        "Project is not ready for job, scheduling, or execution changes yet. Complete contract, financial, and workflow readiness from the project hub first."
    });
  }

  await ensureScopedCrewVendor(scope.organizationId, input.crewVendorId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .update({
      customer_id: project.customerId,
      project_id: project.id,
      estimate_id: estimate?.id ?? null,
      dispatch_status: input.dispatchStatus,
      scheduled_date: input.scheduledDate,
      scheduled_start_at: input.scheduledStartAt,
      scheduled_end_at: input.scheduledEndAt,
      schedule_notes: input.scheduleNotes,
      crew_vendor_id: input.crewVendorId,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", jobId)
    .select(jobSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the job: ${response.error.message}`);
  }

  if (!isJobRow(data)) {
    throw new Error("Unexpected job response after update.");
  }

  return mapJob(data);
}

export async function scheduleJob(jobId: string, input: JobScheduleInput) {
  const scope = await requireJobScope(`/jobs/${jobId}`);
  const currentJob = await getJobRecordById(scope.organizationId, jobId);

  if (!currentJob) {
    throw new Error("Job not found for this organization.");
  }

  if (currentJob.dispatch_status === "completed") {
    throw new Error("Completed jobs cannot be rescheduled from this scheduling form.");
  }

  await Promise.all([
    assertProjectReadinessGate({
      organizationId: scope.organizationId,
      projectId: currentJob.project_id,
      errorMessage:
        "Project is not ready for scheduling yet. Complete contract, financial, and workflow readiness from the project hub before scheduling this job."
    })
  ]);

  const nextDispatchStatus =
    currentJob.dispatch_status === "in_progress" ? "in_progress" : "scheduled";
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .update({
      ...getScheduleUpdateFromInput(input),
      dispatch_status: nextDispatchStatus,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", jobId)
    .select(jobSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to schedule the job: ${response.error.message}`);
  }

  if (!isJobRow(data)) {
    throw new Error("Job not found for this organization.");
  }

  return mapJob(data);
}

export async function unscheduleJob(jobId: string) {
  const scope = await requireJobScope(`/jobs/${jobId}`);
  const currentJob = await getJobRecordById(scope.organizationId, jobId);

  if (!currentJob) {
    throw new Error("Job not found for this organization.");
  }

  if (
    currentJob.dispatch_status === "in_progress" ||
    currentJob.dispatch_status === "completed"
  ) {
    throw new Error("In-progress or completed jobs cannot be unscheduled.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .update({
      scheduled_date: null,
      scheduled_start_at: null,
      scheduled_end_at: null,
      schedule_notes: null,
      dispatch_status: "unscheduled",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", jobId)
    .select(jobSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to unschedule the job: ${response.error.message}`);
  }

  if (!isJobRow(data)) {
    throw new Error("Job not found for this organization.");
  }

  return mapJob(data);
}

export async function assignCrew(jobId: string, input: JobAssignmentInput) {
  const scope = await requireJobScope(`/jobs/${jobId}`);
  const job = await getJobRecordById(scope.organizationId, jobId);

  if (!job) {
    throw new Error("Job not found for this organization.");
  }

  await Promise.all([
    ensureScopedAssignablePerson(scope.organizationId, input.personId),
    ensureScopedCrewVendor(scope.organizationId, input.vendorId)
  ]);

  const supabase = await getSupabaseServerClient();
  const insertResponse = await supabase
    .from("job_assignments")
    .insert({
      company_id: scope.organizationId,
      job_id: jobId,
      person_id: input.personId,
      vendor_id: input.vendorId,
      role: input.role,
      assigned_start_at: input.assignedStartAt,
      assigned_end_at: input.assignedEndAt,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(jobAssignmentSelect)
    .single();
  const data: unknown = insertResponse.data;

  if (insertResponse.error) {
    throw new Error(`Unable to assign crew to the job: ${insertResponse.error.message}`);
  }

  if (!isJobAssignmentRow(data)) {
    throw new Error("Unexpected job assignment response after create.");
  }

  if (input.vendorId) {
    const updateResponse = await supabase
      .from("jobs")
      .update({
        crew_vendor_id: input.vendorId,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", jobId);

    if (updateResponse.error) {
      throw new Error(
        `Unable to update the job crew vendor after assignment: ${updateResponse.error.message}`
      );
    }
  }

  return mapJobAssignmentListItem(data);
}

export async function unassignCrew(jobId: string, assignmentId: string) {
  const scope = await requireJobScope(`/jobs/${jobId}`);
  const assignment = await getJobAssignmentRecordById(
    scope.organizationId,
    jobId,
    assignmentId
  );

  if (!assignment) {
    throw new Error("Job assignment not found for this organization.");
  }

  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("job_assignments")
    .delete()
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .eq("id", assignmentId);

  if (deleteResponse.error) {
    throw new Error(`Unable to unassign crew from the job: ${deleteResponse.error.message}`);
  }

  if (assignment.vendor_id) {
    const remainingVendorAssignmentsResponse = await supabase
      .from("job_assignments")
      .select("id")
      .eq("company_id", scope.organizationId)
      .eq("job_id", jobId)
      .eq("vendor_id", assignment.vendor_id)
      .limit(1);

    if (remainingVendorAssignmentsResponse.error) {
      throw new Error(
        `Unable to validate remaining vendor assignments: ${remainingVendorAssignmentsResponse.error.message}`
      );
    }

    const remainingVendorAssignments = Array.isArray(remainingVendorAssignmentsResponse.data)
      ? remainingVendorAssignmentsResponse.data
      : [];

    if (remainingVendorAssignments.length === 0) {
      const clearResponse = await supabase
        .from("jobs")
        .update({
          crew_vendor_id: null,
          updated_by: scope.userId
        })
        .eq("company_id", scope.organizationId)
        .eq("id", jobId);

      if (clearResponse.error) {
        throw new Error(
          `Unable to clear the job crew vendor after unassignment: ${clearResponse.error.message}`
        );
      }
    }
  }

  return mapJobAssignmentListItem(assignment);
}
