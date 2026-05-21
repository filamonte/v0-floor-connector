import "server-only";

import { cache } from "react";
import type {
  CommercialReadinessStatus,
  FinancingStatus,
  ProjectStatus
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProjectsManagerView =
  | "all"
  | "lead"
  | "estimating"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "completed";

export type ProjectsManagerProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  commercialReadinessStatus: CommercialReadinessStatus;
  financingStatus: FinancingStatus;
  readyToScheduleAt: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
};

export type ProjectsManagerReadModel = {
  projects: ProjectsManagerProject[];
  leadProjects: ProjectsManagerProject[];
  estimatingProjects: ProjectsManagerProject[];
  approvedProjects: ProjectsManagerProject[];
  readyToScheduleProjects: ProjectsManagerProject[];
  counts: Record<ProjectsManagerView, number>;
};

type ProjectsManagerProjectRow = {
  id: string;
  customer_id: string;
  name: string;
  status: ProjectStatus;
  commercial_readiness_status: CommercialReadinessStatus;
  financing_status: FinancingStatus;
  ready_to_schedule_at: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
};

type ProjectMatchedCustomerRow = {
  id: string;
};

const projectsManagerSelect = `
  id,
  customer_id,
  name,
  status,
  commercial_readiness_status,
  financing_status,
  ready_to_schedule_at,
  city,
  state_region,
  postal_code,
  updated_at,
  customers (
    id,
    name,
    company_name
  )
`;

const projectStatuses: Exclude<ProjectsManagerView, "all">[] = [
  "lead",
  "estimating",
  "approved",
  "scheduled",
  "in_progress",
  "completed"
];

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function mapProject(row: ProjectsManagerProjectRow): ProjectsManagerProject {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    commercialReadinessStatus: row.commercial_readiness_status,
    financingStatus: row.financing_status,
    readyToScheduleAt: row.ready_to_schedule_at,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    updatedAt: row.updated_at,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null
  };
}

async function countProjects(input: {
  organizationId: string;
  status?: ProjectStatus;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  if (input.status) {
    query = query.eq("status", input.status);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count projects: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function findCustomerIdsForProjectSearch(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const response = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", input.organizationId)
    .or(`name.ilike.%${escapedQuery}%,company_name.ilike.%${escapedQuery}%`);

  if (response.error) {
    throw new Error(
      `Unable to load project search customer matches: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as ProjectMatchedCustomerRow[])
    : [];

  return rows.map((row) => row.id);
}

async function listProjectsForManager(input: {
  organizationId: string;
  query?: string;
  status?: ProjectsManagerView;
  readyToScheduleOnly?: boolean;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const trimmedQuery = input.query?.trim() ?? "";
  const escapedQuery =
    trimmedQuery.length > 0 ? escapeLikePattern(trimmedQuery) : "";
  const matchingCustomerIds =
    trimmedQuery.length > 0
      ? await findCustomerIdsForProjectSearch({
          organizationId: input.organizationId,
          query: trimmedQuery
        })
      : [];
  const searchPredicates =
    trimmedQuery.length > 0
      ? [
          `name.ilike.%${escapedQuery}%`,
          `city.ilike.%${escapedQuery}%`,
          `state_region.ilike.%${escapedQuery}%`,
          ...(matchingCustomerIds.length > 0
            ? [`customer_id.in.(${matchingCustomerIds.join(",")})`]
            : [])
        ]
      : [];

  let query = supabase
    .from("projects")
    .select(projectsManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false })
    .limit(input.limit);

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  if (input.readyToScheduleOnly) {
    query = query.not("ready_to_schedule_at", "is", null);
  }

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load projects manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as ProjectsManagerProjectRow[]).map(mapProject)
    : [];
}

export const getProjectsManagerReadModel = cache(
  async (input: {
    organizationId: string;
    query?: string;
    status?: ProjectsManagerView;
  }): Promise<ProjectsManagerReadModel> => {
    const [
      allCount,
      leadCount,
      estimatingCount,
      approvedCount,
      scheduledCount,
      inProgressCount,
      completedCount,
      projects,
      leadProjects,
      estimatingProjects,
      approvedProjects,
      readyToScheduleProjects
    ] = await Promise.all([
      countProjects({ organizationId: input.organizationId }),
      countProjects({ organizationId: input.organizationId, status: "lead" }),
      countProjects({
        organizationId: input.organizationId,
        status: "estimating"
      }),
      countProjects({
        organizationId: input.organizationId,
        status: "approved"
      }),
      countProjects({
        organizationId: input.organizationId,
        status: "scheduled"
      }),
      countProjects({
        organizationId: input.organizationId,
        status: "in_progress"
      }),
      countProjects({
        organizationId: input.organizationId,
        status: "completed"
      }),
      listProjectsForManager({
        organizationId: input.organizationId,
        query: input.query,
        status: input.status,
        limit: 20
      }),
      listProjectsForManager({
        organizationId: input.organizationId,
        status: "lead",
        limit: 4
      }),
      listProjectsForManager({
        organizationId: input.organizationId,
        status: "estimating",
        limit: 4
      }),
      listProjectsForManager({
        organizationId: input.organizationId,
        status: "approved",
        limit: 4
      }),
      listProjectsForManager({
        organizationId: input.organizationId,
        readyToScheduleOnly: true,
        limit: 4
      })
    ]);

    return {
      projects,
      leadProjects,
      estimatingProjects,
      approvedProjects,
      readyToScheduleProjects,
      counts: {
        all: allCount,
        lead: leadCount,
        estimating: estimatingCount,
        approved: approvedCount,
        scheduled: scheduledCount,
        in_progress: inProgressCount,
        completed: completedCount
      }
    };
  }
);

export function isProjectsManagerView(
  value: string
): value is ProjectsManagerView {
  return (
    value === "all" ||
    projectStatuses.includes(value as Exclude<ProjectsManagerView, "all">)
  );
}
