import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { compareJobStatuses } from "@floorconnector/domain";
import type { Job as JobRecord, JobStatus } from "@floorconnector/types";

import type { JobInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getProjectById } from "@/lib/projects/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  status: JobStatus;
  scheduled_date: string | null;
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
};

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
    typeof row.status === "string" &&
    (row.scheduled_date === null || typeof row.scheduled_date === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isJobRowArray(value: unknown): value is JobRow[] {
  return Array.isArray(value) && value.every((row) => isJobRow(row));
}

function mapJob(row: JobRow): JobRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    status: row.status,
    scheduledDate: row.scheduled_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
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
      : null
  };
}

function sortJobs(jobs: JobListItem[]) {
  return jobs.sort((left, right) => {
    const statusComparison = compareJobStatuses(left.status, right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    const scheduledLeft = left.scheduledDate ?? "9999-12-31";
    const scheduledRight = right.scheduledDate ?? "9999-12-31";
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
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        status,
        scheduled_date,
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
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load jobs: ${error.message}`);
  }

  if (!isJobRowArray(data)) {
    return [];
  }

  return sortJobs(data.map(mapJobListItem));
});

export async function getJobById(jobId: string, next = "/jobs") {
  const scope = await requireJobScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        status,
        scheduled_date,
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
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("id", jobId)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the job: ${error.message}`);
  }

  if (!isJobRow(data)) {
    return null;
  }

  return mapJobListItem(data);
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

export async function createJob(input: JobInput) {
  const scope = await requireJobScope("/jobs");
  const project = await resolveScopedProject(input.projectId, "/jobs");
  const estimate = await resolveApprovedEstimate(
    input.estimateId,
    input.projectId,
    "/jobs"
  );
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .insert({
      company_id: scope.organizationId,
      customer_id: project.customerId,
      project_id: project.id,
      estimate_id: estimate?.id ?? null,
      status: input.status,
      scheduled_date: input.scheduledDate,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        status,
        scheduled_date,
        notes,
        created_at,
        updated_at
      `
    )
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to create the job: ${error.message}`);
  }

  if (!isJobRow(data)) {
    throw new Error("Unexpected job response after create.");
  }

  return mapJob(data);
}

export async function updateJob(jobId: string, input: JobInput) {
  const scope = await requireJobScope(`/jobs/${jobId}`);
  const project = await resolveScopedProject(input.projectId, `/jobs/${jobId}`);
  const estimate = await resolveApprovedEstimate(
    input.estimateId,
    input.projectId,
    `/jobs/${jobId}`
  );
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .update({
      customer_id: project.customerId,
      project_id: project.id,
      estimate_id: estimate?.id ?? null,
      status: input.status,
      scheduled_date: input.scheduledDate,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", jobId)
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        status,
        scheduled_date,
        notes,
        created_at,
        updated_at
      `
    )
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update the job: ${error.message}`);
  }

  if (!isJobRow(data)) {
    throw new Error("Job not found for this organization.");
  }

  return mapJob(data);
}
