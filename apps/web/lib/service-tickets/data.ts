import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  MembershipRole,
  ServiceTicket,
  ServiceTicketPriority,
  ServiceTicketSourceType,
  ServiceTicketStatus,
  ServiceTicketType
} from "@floorconnector/types";

import type { ServiceTicketInput, ServiceTicketStatusInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ServiceTicketScope = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
};

type ServiceTicketRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string | null;
  job_id: string | null;
  source_type: ServiceTicketSourceType;
  ticket_type: ServiceTicketType;
  status: ServiceTicketStatus;
  priority: ServiceTicketPriority;
  title: string;
  description: string | null;
  reported_on: string;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  warranty_basis: string | null;
  resolution_summary: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  customers?: { id: string; name: string } | null;
  projects?: { id: string; name: string } | null;
  jobs?: { id: string; dispatch_status: string } | null;
};

export type ServiceTicketListItem = ServiceTicket & {
  customer: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  job: { id: string; dispatchStatus: string } | null;
};

export type ServiceTicketManagerView =
  | "all"
  | "open"
  | "warranty"
  | "service"
  | "urgent"
  | "closed";

export type ServiceTicketOption = {
  id: string;
  label: string;
  customerId?: string;
  projectId?: string;
};

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

const serviceTicketSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  job_id,
  source_type,
  ticket_type,
  status,
  priority,
  title,
  description,
  reported_on,
  warranty_start_date,
  warranty_end_date,
  warranty_basis,
  resolution_summary,
  resolved_at,
  closed_at,
  created_by,
  updated_by,
  created_at,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  jobs (
    id,
    dispatch_status
  )
`;

function isServiceTicketRow(value: unknown): value is ServiceTicketRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ServiceTicketRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.source_type === "string" &&
    typeof row.ticket_type === "string" &&
    typeof row.status === "string" &&
    typeof row.priority === "string" &&
    typeof row.title === "string" &&
    typeof row.reported_on === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isServiceTicketRowArray(value: unknown): value is ServiceTicketRow[] {
  return Array.isArray(value) && value.every((row) => isServiceTicketRow(row));
}

function mapServiceTicket(row: ServiceTicketRow): ServiceTicket {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    jobId: row.job_id,
    sourceType: row.source_type,
    ticketType: row.ticket_type,
    status: row.status,
    priority: row.priority,
    title: row.title,
    description: row.description,
    reportedOn: row.reported_on,
    warrantyStartDate: row.warranty_start_date,
    warrantyEndDate: row.warranty_end_date,
    warrantyBasis: row.warranty_basis,
    resolutionSummary: row.resolution_summary,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapServiceTicketListItem(
  row: ServiceTicketRow
): ServiceTicketListItem {
  return {
    ...mapServiceTicket(row),
    customer: row.customers
      ? { id: row.customers.id, name: row.customers.name }
      : null,
    project: row.projects
      ? { id: row.projects.id, name: row.projects.name }
      : null,
    job: row.jobs
      ? { id: row.jobs.id, dispatchStatus: row.jobs.dispatch_status }
      : null
  };
}

async function getServiceTicketScope(next = "/service-tickets") {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    const destination = new URL("/dashboard", "http://floorconnector.local");
    destination.searchParams.set(
      "error",
      "No active organization is available for service tickets yet."
    );
    redirect(`${destination.pathname}${destination.search}`);
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    role: organizationContext.membership.role
  } satisfies ServiceTicketScope;
}

function assertCanMutate(scope: ServiceTicketScope) {
  if (!mutationRoles.has(scope.role)) {
    throw new Error("Manager, admin, or owner access is required.");
  }
}

async function resolveServiceTicketRelationships(
  organizationId: string,
  input: {
    customerId: string;
    projectId: string | null;
    jobId: string | null;
  }
) {
  const supabase = await getSupabaseServerClient();
  const customerResponse = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", input.customerId)
    .maybeSingle();
  const customer = customerResponse.data as { id?: string } | null;

  if (customerResponse.error) {
    throw new Error(
      `Unable to validate customer: ${customerResponse.error.message}`
    );
  }

  if (!customer?.id) {
    throw new Error("Customer not found for this organization.");
  }

  let projectId = input.projectId;

  if (input.jobId) {
    const jobResponse = await supabase
      .from("jobs")
      .select("id, project_id, projects ( id, customer_id )")
      .eq("company_id", organizationId)
      .eq("id", input.jobId)
      .maybeSingle();
    const job = jobResponse.data as {
      id?: string;
      project_id?: string;
      projects?: { id?: string; customer_id?: string } | null;
    } | null;

    if (jobResponse.error) {
      throw new Error(`Unable to validate job: ${jobResponse.error.message}`);
    }

    if (!job?.id || !job.project_id) {
      throw new Error("Job not found for this organization.");
    }

    if (projectId && job.project_id !== projectId) {
      throw new Error("Job must belong to the selected project.");
    }

    projectId = projectId ?? job.project_id;

    if (job.projects?.customer_id !== input.customerId) {
      throw new Error("Job must belong to the selected customer context.");
    }
  }

  if (projectId) {
    const projectResponse = await supabase
      .from("projects")
      .select("id, customer_id")
      .eq("company_id", organizationId)
      .eq("id", projectId)
      .maybeSingle();
    const project = projectResponse.data as {
      id?: string;
      customer_id?: string;
    } | null;

    if (projectResponse.error) {
      throw new Error(
        `Unable to validate project: ${projectResponse.error.message}`
      );
    }

    if (!project?.id) {
      throw new Error("Project not found for this organization.");
    }

    if (project.customer_id !== input.customerId) {
      throw new Error("Project must belong to the selected customer.");
    }
  }

  return { projectId };
}

function normalizeLifecycleDates(status: ServiceTicketStatus) {
  const now = new Date().toISOString();

  return {
    resolvedAt: status === "resolved" || status === "closed" ? now : null,
    closedAt: status === "closed" ? now : null
  };
}

export function isServiceTicketManagerView(
  value: unknown
): value is ServiceTicketManagerView {
  return (
    value === "all" ||
    value === "open" ||
    value === "warranty" ||
    value === "service" ||
    value === "urgent" ||
    value === "closed"
  );
}

export const listServiceTickets = cache(
  async (): Promise<ServiceTicketListItem[]> => {
    const scope = await getServiceTicketScope();
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("service_tickets")
      .select(serviceTicketSelect)
      .eq("company_id", scope.organizationId)
      .order("reported_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load service tickets: ${response.error.message}`
      );
    }

    if (!isServiceTicketRowArray(data)) {
      return [];
    }

    return data.map(mapServiceTicketListItem);
  }
);

export async function getServiceTicketManagerReadModel(input: {
  organizationId: string;
  view: ServiceTicketManagerView;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  let queryBuilder = supabase
    .from("service_tickets")
    .select(serviceTicketSelect)
    .eq("company_id", input.organizationId)
    .order("reported_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (input.view === "open") {
    queryBuilder = queryBuilder.in("status", [
      "open",
      "scheduled",
      "in_progress"
    ]);
  } else if (input.view === "warranty") {
    queryBuilder = queryBuilder.eq("ticket_type", "warranty");
  } else if (input.view === "service") {
    queryBuilder = queryBuilder.eq("ticket_type", "service");
  } else if (input.view === "urgent") {
    queryBuilder = queryBuilder.in("priority", ["high", "urgent"]);
  } else if (input.view === "closed") {
    queryBuilder = queryBuilder.in("status", [
      "resolved",
      "closed",
      "canceled"
    ]);
  }

  if (input.query.trim().length > 0) {
    const escapedQuery = input.query
      .trim()
      .replaceAll("%", "")
      .replaceAll(",", " ");
    queryBuilder = queryBuilder.or(
      `title.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,warranty_basis.ilike.%${escapedQuery}%`
    );
  }

  const [
    rowsResponse,
    allCount,
    openCount,
    warrantyCount,
    serviceCount,
    urgentCount,
    closedCount
  ] = await Promise.all([
    queryBuilder,
    countTickets(input.organizationId),
    countTickets(input.organizationId, {
      statuses: ["open", "scheduled", "in_progress"]
    }),
    countTickets(input.organizationId, { ticketType: "warranty" }),
    countTickets(input.organizationId, { ticketType: "service" }),
    countTickets(input.organizationId, { priorities: ["high", "urgent"] }),
    countTickets(input.organizationId, {
      statuses: ["resolved", "closed", "canceled"]
    })
  ]);
  const data: unknown = rowsResponse.data;

  if (rowsResponse.error) {
    throw new Error(
      `Unable to load service tickets: ${rowsResponse.error.message}`
    );
  }

  return {
    counts: {
      all: allCount,
      open: openCount,
      warranty: warrantyCount,
      service: serviceCount,
      urgent: urgentCount,
      closed: closedCount
    },
    tickets: isServiceTicketRowArray(data)
      ? data.map(mapServiceTicketListItem)
      : []
  };
}

async function countTickets(
  organizationId: string,
  filters: {
    statuses?: ServiceTicketStatus[];
    ticketType?: ServiceTicketType;
    priorities?: ServiceTicketPriority[];
  } = {}
) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("service_tickets")
    .select("id", { count: "exact", head: true })
    .eq("company_id", organizationId);

  if (filters.statuses) {
    query = query.in("status", filters.statuses);
  }

  if (filters.ticketType) {
    query = query.eq("ticket_type", filters.ticketType);
  }

  if (filters.priorities) {
    query = query.in("priority", filters.priorities);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to count service tickets: ${response.error.message}`
    );
  }

  return response.count ?? 0;
}

export async function getServiceTicketById(ticketId: string) {
  const scope = await getServiceTicketScope(`/service-tickets/${ticketId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .select(serviceTicketSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", ticketId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load service ticket: ${response.error.message}`);
  }

  if (!isServiceTicketRow(data)) {
    return null;
  }

  return mapServiceTicketListItem(data);
}

export async function createServiceTicket(input: ServiceTicketInput) {
  const scope = await getServiceTicketScope("/service-tickets");
  assertCanMutate(scope);
  const relationships = await resolveServiceTicketRelationships(
    scope.organizationId,
    input
  );
  const lifecycleDates = normalizeLifecycleDates(input.status);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .insert({
      company_id: scope.organizationId,
      customer_id: input.customerId,
      project_id: relationships.projectId,
      job_id: input.jobId,
      source_type: input.sourceType,
      ticket_type: input.ticketType,
      status: input.status,
      priority: input.priority,
      title: input.title,
      description: input.description,
      reported_on: input.reportedOn,
      warranty_start_date: input.warrantyStartDate,
      warranty_end_date: input.warrantyEndDate,
      warranty_basis: input.warrantyBasis,
      resolution_summary: input.resolutionSummary,
      resolved_at: lifecycleDates.resolvedAt,
      closed_at: lifecycleDates.closedAt,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(serviceTicketSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create service ticket: ${response.error.message}`
    );
  }

  if (!isServiceTicketRow(data)) {
    throw new Error("Unexpected service ticket response after create.");
  }

  return mapServiceTicketListItem(data);
}

export async function updateServiceTicket(
  ticketId: string,
  input: ServiceTicketInput
) {
  const scope = await getServiceTicketScope(`/service-tickets/${ticketId}`);
  assertCanMutate(scope);
  const relationships = await resolveServiceTicketRelationships(
    scope.organizationId,
    input
  );
  const lifecycleDates = normalizeLifecycleDates(input.status);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .update({
      customer_id: input.customerId,
      project_id: relationships.projectId,
      job_id: input.jobId,
      source_type: input.sourceType,
      ticket_type: input.ticketType,
      status: input.status,
      priority: input.priority,
      title: input.title,
      description: input.description,
      reported_on: input.reportedOn,
      warranty_start_date: input.warrantyStartDate,
      warranty_end_date: input.warrantyEndDate,
      warranty_basis: input.warrantyBasis,
      resolution_summary: input.resolutionSummary,
      resolved_at: lifecycleDates.resolvedAt,
      closed_at: lifecycleDates.closedAt,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", ticketId)
    .select(serviceTicketSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update service ticket: ${response.error.message}`
    );
  }

  if (!isServiceTicketRow(data)) {
    throw new Error("Unexpected service ticket response after update.");
  }

  return mapServiceTicketListItem(data);
}

export async function updateServiceTicketStatus(
  ticketId: string,
  input: ServiceTicketStatusInput
) {
  const scope = await getServiceTicketScope(`/service-tickets/${ticketId}`);
  assertCanMutate(scope);
  const lifecycleDates = normalizeLifecycleDates(input.status);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .update({
      status: input.status,
      resolution_summary: input.resolutionSummary,
      resolved_at: lifecycleDates.resolvedAt,
      closed_at: lifecycleDates.closedAt,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", ticketId)
    .select(serviceTicketSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update service ticket status: ${response.error.message}`
    );
  }

  if (!isServiceTicketRow(data)) {
    throw new Error("Unexpected service ticket response after status update.");
  }

  return mapServiceTicketListItem(data);
}

export async function listServiceTicketCustomerOptions() {
  const scope = await getServiceTicketScope("/service-tickets");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id, name")
    .eq("company_id", scope.organizationId)
    .order("name", { ascending: true })
    .limit(200);

  if (response.error) {
    throw new Error(
      `Unable to load customer options: ${response.error.message}`
    );
  }

  return (Array.isArray(response.data) ? response.data : []).flatMap((row) =>
    typeof row?.id === "string" && typeof row?.name === "string"
      ? [{ id: row.id, label: row.name }]
      : []
  );
}

export async function listServiceTicketProjectOptions() {
  const scope = await getServiceTicketScope("/service-tickets");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id, name, customer_id")
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(250);

  if (response.error) {
    throw new Error(
      `Unable to load project options: ${response.error.message}`
    );
  }

  return (Array.isArray(response.data) ? response.data : []).flatMap((row) =>
    typeof row?.id === "string" &&
    typeof row?.name === "string" &&
    typeof row?.customer_id === "string"
      ? [{ id: row.id, label: row.name, customerId: row.customer_id }]
      : []
  );
}

export async function listServiceTicketJobOptions() {
  const scope = await getServiceTicketScope("/service-tickets");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(
      "id, project_id, dispatch_status, projects ( id, name, customer_id )"
    )
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(250);

  if (response.error) {
    throw new Error(`Unable to load job options: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).flatMap((row) => {
    const project = Array.isArray(row?.projects)
      ? row.projects[0]
      : row?.projects;

    return typeof row?.id === "string" &&
      typeof row?.project_id === "string" &&
      typeof row?.dispatch_status === "string" &&
      typeof project?.customer_id === "string"
      ? [
          {
            id: row.id,
            label: `${project?.name ?? "Job"} / ${row.dispatch_status.replaceAll("_", " ")}`,
            projectId: row.project_id,
            customerId: project.customer_id
          }
        ]
      : [];
  });
}

export async function listServiceTicketsByProject(projectId: string) {
  const scope = await getServiceTicketScope(`/projects/${projectId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .select(serviceTicketSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("reported_on", { ascending: false })
    .limit(5);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load project service tickets: ${response.error.message}`
    );
  }

  return isServiceTicketRowArray(data)
    ? data.map(mapServiceTicketListItem)
    : [];
}

export async function listServiceTicketsByCustomer(customerId: string) {
  const scope = await getServiceTicketScope(`/customers/${customerId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .select(serviceTicketSelect)
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId)
    .order("reported_on", { ascending: false })
    .limit(5);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load customer service tickets: ${response.error.message}`
    );
  }

  return isServiceTicketRowArray(data)
    ? data.map(mapServiceTicketListItem)
    : [];
}

export async function listServiceTicketsByJob(jobId: string) {
  const scope = await getServiceTicketScope(`/jobs/${jobId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("service_tickets")
    .select(serviceTicketSelect)
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .order("reported_on", { ascending: false })
    .limit(5);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load job service tickets: ${response.error.message}`
    );
  }

  return isServiceTicketRowArray(data)
    ? data.map(mapServiceTicketListItem)
    : [];
}
