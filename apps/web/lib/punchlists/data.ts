import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  PunchlistItem as PunchlistItemRecord,
  PunchlistStatus
} from "@floorconnector/types";

import type { PunchlistItemInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { assertProjectReadinessGate } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PunchlistScope = {
  userId: string;
  organizationId: string;
};

type PunchlistItemRow = {
  id: string;
  company_id: string;
  project_id: string;
  job_id: string | null;
  assignee_person_id: string | null;
  title: string;
  details: string | null;
  due_date: string | null;
  status: PunchlistStatus;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  projects?:
    | {
        id: string;
        name: string;
      }
    | null;
  jobs?:
    | {
        id: string;
        dispatch_status: string;
        scheduled_date: string | null;
      }
    | null;
  assignee:
    | {
        id: string;
        display_name: string;
        is_active: boolean;
      }
    | null;
};

export type PunchlistListItem = PunchlistItemRecord & {
  project: {
    id: string;
    name: string;
  } | null;
  job: {
    id: string;
    dispatchStatus: string;
    scheduledDate: string | null;
  } | null;
  assignee: {
    id: string;
    displayName: string;
    isActive: boolean;
  } | null;
};

const punchlistSelect = `
  id,
  company_id,
  project_id,
  job_id,
  assignee_person_id,
  title,
  details,
  due_date,
  status,
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
    dispatch_status,
    scheduled_date
  ),
  assignee:people!punchlist_items_assignee_person_id_fkey (
    id,
    display_name,
    is_active
  )
`;

function isPunchlistItemRow(value: unknown): value is PunchlistItemRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PunchlistItemRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.project_id === "string" &&
    (row.job_id === null || typeof row.job_id === "string") &&
    (row.assignee_person_id === null || typeof row.assignee_person_id === "string") &&
    typeof row.title === "string" &&
    (row.details === null || typeof row.details === "string") &&
    (row.due_date === null || typeof row.due_date === "string") &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPunchlistItemRowArray(value: unknown): value is PunchlistItemRow[] {
  return Array.isArray(value) && value.every((row) => isPunchlistItemRow(row));
}

function mapPunchlistItem(row: PunchlistItemRow): PunchlistItemRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    projectId: row.project_id,
    jobId: row.job_id,
    assigneePersonId: row.assignee_person_id,
    title: row.title,
    details: row.details,
    dueDate: row.due_date,
    status: row.status,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPunchlistListItem(row: PunchlistItemRow): PunchlistListItem {
  return {
    ...mapPunchlistItem(row),
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name
        }
      : null,
    job: row.jobs
      ? {
          id: row.jobs.id,
          dispatchStatus: row.jobs.dispatch_status,
          scheduledDate: row.jobs.scheduled_date
        }
      : null,
    assignee: row.assignee
      ? {
          id: row.assignee.id,
          displayName: row.assignee.display_name,
          isActive: row.assignee.is_active
        }
      : null
  };
}

function getPunchlistStatusRank(status: PunchlistStatus) {
  switch (status) {
    case "open":
      return 0;
    case "in_progress":
      return 1;
    case "resolved":
      return 2;
    case "closed":
      return 3;
    default:
      return 9;
  }
}

function sortPunchlistItems(items: PunchlistListItem[]) {
  return items.sort((left, right) => {
    const statusComparison =
      getPunchlistStatusRank(left.status) - getPunchlistStatusRank(right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    const dueComparison = (left.dueDate ?? "9999-12-31").localeCompare(
      right.dueDate ?? "9999-12-31"
    );

    if (dueComparison !== 0) {
      return dueComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

async function getPunchlistScope(next = "/punchlists"): Promise<PunchlistScope | null> {
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

export async function requirePunchlistScope(next = "/punchlists") {
  const scope = await getPunchlistScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for punchlist records yet."
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
    throw new Error(`Unable to validate the project: ${response.error.message}`);
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
    throw new Error(`Unable to validate the linked job: ${response.error.message}`);
  }

  if (!data?.id || !data.project_id) {
    throw new Error("Job not found for this organization.");
  }

  return {
    id: data.id,
    projectId: data.project_id
  };
}

async function ensureScopedActivePerson(
  organizationId: string,
  personId: string | null
) {
  if (!personId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, is_active")
    .eq("company_id", organizationId)
    .eq("id", personId)
    .maybeSingle();
  const data = response.data as { id?: string; is_active?: boolean } | null;

  if (response.error) {
    throw new Error(`Unable to validate the assignee: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Assignee not found for this organization.");
  }

  if (!data.is_active) {
    throw new Error("Only active people can be assigned to punchlist work.");
  }

  return data;
}

async function validatePunchlistItemInput(
  organizationId: string,
  input: PunchlistItemInput
) {
  const [, scopedJob] = await Promise.all([
    ensureScopedProject(organizationId, input.projectId),
    ensureScopedJob(organizationId, input.jobId),
    ensureScopedActivePerson(organizationId, input.assigneePersonId),
    assertProjectReadinessGate({
      organizationId,
      projectId: input.projectId,
      errorMessage:
        "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before creating punchlist work."
    })
  ]);

  if (scopedJob && scopedJob.projectId !== input.projectId) {
    throw new Error("Job must belong to the selected project.");
  }
}

export const listPunchlistItems = cache(async (): Promise<PunchlistListItem[]> => {
  const scope = await requirePunchlistScope("/punchlists");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("punchlist_items")
    .select(punchlistSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load punchlist items: ${response.error.message}`);
  }

  if (!isPunchlistItemRowArray(data)) {
    return [];
  }

  return sortPunchlistItems(data.map(mapPunchlistListItem));
});

export async function listPunchlistItemsByProject(projectId: string, next = "/projects") {
  const scope = await requirePunchlistScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("punchlist_items")
    .select(punchlistSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load project punchlist items: ${response.error.message}`);
  }

  if (!isPunchlistItemRowArray(data)) {
    return [];
  }

  return sortPunchlistItems(data.map(mapPunchlistListItem));
}

export async function listPunchlistItemsByJob(jobId: string, next = "/jobs") {
  const scope = await requirePunchlistScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("punchlist_items")
    .select(punchlistSelect)
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load job punchlist items: ${response.error.message}`);
  }

  if (!isPunchlistItemRowArray(data)) {
    return [];
  }

  return sortPunchlistItems(data.map(mapPunchlistListItem));
}

export async function getPunchlistItemById(
  punchlistItemId: string,
  next = "/punchlists"
) {
  const scope = await requirePunchlistScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("punchlist_items")
    .select(punchlistSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", punchlistItemId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the punchlist item: ${response.error.message}`);
  }

  if (!isPunchlistItemRow(data)) {
    return null;
  }

  return mapPunchlistListItem(data);
}

export async function createPunchlistItem(input: PunchlistItemInput) {
  const scope = await requirePunchlistScope("/punchlists");
  await validatePunchlistItemInput(scope.organizationId, input);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("punchlist_items")
    .insert({
      company_id: scope.organizationId,
      project_id: input.projectId,
      job_id: input.jobId,
      assignee_person_id: input.assigneePersonId,
      title: input.title,
      details: input.details,
      due_date: input.dueDate,
      status: input.status,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(punchlistSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the punchlist item: ${response.error.message}`);
  }

  if (!isPunchlistItemRow(data)) {
    throw new Error("Unexpected punchlist item response after create.");
  }

  return mapPunchlistListItem(data);
}

export async function updatePunchlistItem(
  punchlistItemId: string,
  input: PunchlistItemInput
) {
  const scope = await requirePunchlistScope(`/punchlists/${punchlistItemId}`);
  await validatePunchlistItemInput(scope.organizationId, input);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("punchlist_items")
    .update({
      project_id: input.projectId,
      job_id: input.jobId,
      assignee_person_id: input.assigneePersonId,
      title: input.title,
      details: input.details,
      due_date: input.dueDate,
      status: input.status,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", punchlistItemId)
    .select(punchlistSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the punchlist item: ${response.error.message}`);
  }

  if (!isPunchlistItemRow(data)) {
    throw new Error("Punchlist item not found for this organization.");
  }

  return mapPunchlistListItem(data);
}
