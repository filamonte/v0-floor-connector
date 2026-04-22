import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  Appointment as AppointmentRecord,
  AppointmentStatus,
  AppointmentType
} from "@floorconnector/types";

import type { AppointmentInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AppointmentScope = {
  userId: string;
  organizationId: string;
};

type AppointmentRow = {
  id: string;
  company_id: string;
  opportunity_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  assigned_person_id: string | null;
  title: string;
  appointment_type: AppointmentType;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  opportunities?:
    | {
        id: string;
        title: string;
        status: string;
        customer_id: string | null;
        project_id: string | null;
      }
    | null;
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
        status: string;
        customer_id: string;
      }
    | null;
  assigned_person?:
    | {
        id: string;
        display_name: string;
        is_active: boolean;
        membership_user_id: string | null;
      }
    | null;
};

type ScopedOpportunity = {
  id: string;
  customerId: string | null;
  projectId: string | null;
  title: string;
  status: string;
};

type ScopedCustomer = {
  id: string;
  name: string;
  companyName: string | null;
};

type ScopedProject = {
  id: string;
  customerId: string;
  name: string;
  status: string;
};

export type AppointmentListItem = AppointmentRecord & {
  opportunity: {
    id: string;
    title: string;
    status: string;
  } | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  assignedPerson: {
    id: string;
    displayName: string;
    isActive: boolean;
    membershipUserId: string | null;
  } | null;
};

const appointmentSelect = `
  id,
  company_id,
  opportunity_id,
  customer_id,
  project_id,
  assigned_person_id,
  title,
  appointment_type,
  starts_at,
  ends_at,
  location,
  notes,
  status,
  created_by,
  updated_by,
  created_at,
  updated_at,
  opportunities (
    id,
    title,
    status,
    customer_id,
    project_id
  ),
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status,
    customer_id
  ),
  assigned_person:people!appointments_assigned_person_id_fkey (
    id,
    display_name,
    is_active,
    membership_user_id
  )
`;

function isAppointmentRow(value: unknown): value is AppointmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<AppointmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    (row.opportunity_id === null || typeof row.opportunity_id === "string") &&
    (row.customer_id === null || typeof row.customer_id === "string") &&
    (row.project_id === null || typeof row.project_id === "string") &&
    (row.assigned_person_id === null || typeof row.assigned_person_id === "string") &&
    typeof row.title === "string" &&
    typeof row.appointment_type === "string" &&
    typeof row.starts_at === "string" &&
    (row.ends_at === null || typeof row.ends_at === "string") &&
    (row.location === null || typeof row.location === "string") &&
    (row.notes === null || typeof row.notes === "string") &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isAppointmentRowArray(value: unknown): value is AppointmentRow[] {
  return Array.isArray(value) && value.every((row) => isAppointmentRow(row));
}

function mapAppointment(row: AppointmentRow): AppointmentRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    assignedPersonId: row.assigned_person_id,
    title: row.title,
    appointmentType: row.appointment_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    notes: row.notes,
    status: row.status,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAppointmentListItem(row: AppointmentRow): AppointmentListItem {
  return {
    ...mapAppointment(row),
    opportunity: row.opportunities
      ? {
          id: row.opportunities.id,
          title: row.opportunities.title,
          status: row.opportunities.status
        }
      : null,
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
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    assignedPerson: row.assigned_person
        ? {
            id: row.assigned_person.id,
            displayName: row.assigned_person.display_name,
            isActive: row.assigned_person.is_active,
            membershipUserId: row.assigned_person.membership_user_id
          }
        : null
  };
}

function getAppointmentStatusRank(status: AppointmentStatus) {
  switch (status) {
    case "scheduled":
      return 0;
    case "completed":
      return 1;
    case "no_show":
      return 2;
    case "canceled":
      return 3;
    default:
      return 9;
  }
}

function sortAppointments(appointments: AppointmentListItem[]) {
  return appointments.sort((left, right) => {
    const statusComparison =
      getAppointmentStatusRank(left.status) - getAppointmentStatusRank(right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    if (left.status === "scheduled" && right.status === "scheduled") {
      return left.startsAt.localeCompare(right.startsAt);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

async function getAppointmentScope(
  next = "/appointments"
): Promise<AppointmentScope | null> {
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

export async function requireAppointmentScope(next = "/appointments") {
  const scope = await getAppointmentScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for appointment records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function getScopedOpportunity(
  organizationId: string,
  opportunityId: string | null
) {
  if (!opportunityId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .select("id, customer_id, project_id, title, status")
    .eq("company_id", organizationId)
    .eq("id", opportunityId)
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        customer_id?: string | null;
        project_id?: string | null;
        title?: string;
        status?: string;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the linked lead: ${response.error.message}`);
  }

  if (!data?.id || typeof data.title !== "string" || typeof data.status !== "string") {
    throw new Error("Lead not found for this organization.");
  }

  return {
    id: data.id,
    customerId: data.customer_id ?? null,
    projectId: data.project_id ?? null,
    title: data.title,
    status: data.status
  } satisfies ScopedOpportunity;
}

async function getScopedCustomer(
  organizationId: string,
  customerId: string | null
) {
  if (!customerId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id, name, company_name")
    .eq("company_id", organizationId)
    .eq("id", customerId)
    .maybeSingle();
  const data = response.data as
    | { id?: string; name?: string; company_name?: string | null }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the linked customer: ${response.error.message}`);
  }

  if (!data?.id || typeof data.name !== "string") {
    throw new Error("Customer not found for this organization.");
  }

  return {
    id: data.id,
    name: data.name,
    companyName: data.company_name ?? null
  } satisfies ScopedCustomer;
}

async function getScopedProject(
  organizationId: string,
  projectId: string | null
) {
  if (!projectId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id, customer_id, name, status")
    .eq("company_id", organizationId)
    .eq("id", projectId)
    .maybeSingle();
  const data = response.data as
    | { id?: string; customer_id?: string; name?: string; status?: string }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the linked project: ${response.error.message}`);
  }

  if (
    !data?.id ||
    typeof data.customer_id !== "string" ||
    typeof data.name !== "string" ||
    typeof data.status !== "string"
  ) {
    throw new Error("Project not found for this organization.");
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    name: data.name,
    status: data.status
  } satisfies ScopedProject;
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
    throw new Error(`Unable to validate the assigned person: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Assigned person not found for this organization.");
  }

  if (!data.is_active) {
    throw new Error("Only active people can be assigned to appointments.");
  }

  return data;
}

async function normalizeAppointmentInput(
  organizationId: string,
  input: AppointmentInput
) {
  const [opportunity, explicitCustomer, explicitProject] = await Promise.all([
    getScopedOpportunity(organizationId, input.opportunityId),
    getScopedCustomer(organizationId, input.customerId),
    getScopedProject(organizationId, input.projectId)
  ]);

  const resolvedProject = explicitProject ?? null;
  const resolvedCustomerId =
    explicitCustomer?.id ??
    resolvedProject?.customerId ??
    opportunity?.customerId ??
    null;
  const resolvedProjectId = resolvedProject?.id ?? opportunity?.projectId ?? null;

  if (explicitProject && explicitCustomer && explicitProject.customerId !== explicitCustomer.id) {
    throw new Error("Selected project must belong to the selected customer.");
  }

  if (opportunity?.customerId && resolvedCustomerId && opportunity.customerId !== resolvedCustomerId) {
    throw new Error("Selected lead must stay on the same customer chain.");
  }

  if (opportunity?.projectId && resolvedProjectId && opportunity.projectId !== resolvedProjectId) {
    throw new Error("Selected lead must stay on the same project chain.");
  }

  if (resolvedProject) {
    await ensureScopedActivePerson(organizationId, input.assignedPersonId);
  } else {
    await ensureScopedActivePerson(organizationId, input.assignedPersonId);
  }

  return {
    ...input,
    customerId: resolvedCustomerId,
    projectId: resolvedProjectId,
    opportunityId: opportunity?.id ?? null
  };
}

export const listAppointments = cache(async (): Promise<AppointmentListItem[]> => {
  const scope = await requireAppointmentScope("/appointments");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(appointmentSelect)
    .eq("company_id", scope.organizationId)
    .order("starts_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load appointments: ${response.error.message}`);
  }

  if (!isAppointmentRowArray(data)) {
    return [];
  }

  return sortAppointments(data.map(mapAppointmentListItem));
});

export async function listAppointmentsByOpportunity(
  opportunityId: string,
  next = "/leads"
) {
  const scope = await requireAppointmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(appointmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("opportunity_id", opportunityId)
    .order("starts_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load lead appointments: ${response.error.message}`);
  }

  if (!isAppointmentRowArray(data)) {
    return [];
  }

  return sortAppointments(data.map(mapAppointmentListItem));
}

export async function listAppointmentsByCustomer(
  customerId: string,
  next = "/customers"
) {
  const scope = await requireAppointmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(appointmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load customer appointments: ${response.error.message}`);
  }

  if (!isAppointmentRowArray(data)) {
    return [];
  }

  return sortAppointments(data.map(mapAppointmentListItem));
}

export async function listAppointmentsByProject(
  projectId: string,
  next = "/projects"
) {
  const scope = await requireAppointmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(appointmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("starts_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load project appointments: ${response.error.message}`);
  }

  if (!isAppointmentRowArray(data)) {
    return [];
  }

  return sortAppointments(data.map(mapAppointmentListItem));
}

export async function getAppointmentById(
  appointmentId: string,
  next = "/appointments"
) {
  const scope = await requireAppointmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(appointmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", appointmentId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the appointment: ${response.error.message}`);
  }

  if (!isAppointmentRow(data)) {
    return null;
  }

  return mapAppointmentListItem(data);
}

export async function createAppointment(input: AppointmentInput) {
  const scope = await requireAppointmentScope("/appointments");
  const normalizedInput = await normalizeAppointmentInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .insert({
      company_id: scope.organizationId,
      opportunity_id: normalizedInput.opportunityId,
      customer_id: normalizedInput.customerId,
      project_id: normalizedInput.projectId,
      assigned_person_id: normalizedInput.assignedPersonId,
      title: normalizedInput.title,
      appointment_type: normalizedInput.appointmentType,
      starts_at: normalizedInput.startsAt,
      ends_at: normalizedInput.endsAt,
      location: normalizedInput.location,
      notes: normalizedInput.notes,
      status: normalizedInput.status,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(appointmentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the appointment: ${response.error.message}`);
  }

  if (!isAppointmentRow(data)) {
    throw new Error("Unexpected appointment response after create.");
  }

  return mapAppointmentListItem(data);
}

export async function updateAppointment(
  appointmentId: string,
  input: AppointmentInput
) {
  const scope = await requireAppointmentScope(`/appointments/${appointmentId}`);
  const normalizedInput = await normalizeAppointmentInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .update({
      opportunity_id: normalizedInput.opportunityId,
      customer_id: normalizedInput.customerId,
      project_id: normalizedInput.projectId,
      assigned_person_id: normalizedInput.assignedPersonId,
      title: normalizedInput.title,
      appointment_type: normalizedInput.appointmentType,
      starts_at: normalizedInput.startsAt,
      ends_at: normalizedInput.endsAt,
      location: normalizedInput.location,
      notes: normalizedInput.notes,
      status: normalizedInput.status,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", appointmentId)
    .select(appointmentSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the appointment: ${response.error.message}`);
  }

  if (!isAppointmentRow(data)) {
    throw new Error("Appointment not found for this organization.");
  }

  return mapAppointmentListItem(data);
}
