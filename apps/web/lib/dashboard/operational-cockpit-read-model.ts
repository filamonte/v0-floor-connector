import { cache } from "react";
import {
  compareContractStatuses,
  compareInvoiceStatuses,
  compareJobStatuses
} from "@floorconnector/domain";
import type {
  AppointmentStatus,
  AppointmentType,
  ContractStatus,
  EstimateStatus,
  InvoiceStatus,
  JobStatus
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null | undefined;

function firstRelation<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

type CockpitCustomerRow = {
  id: string;
  name: string;
  company_name: string | null;
};

type CockpitProjectRow = {
  id: string;
  name: string;
};

type CockpitEstimateSummaryRow = {
  id: string;
  reference_number: string;
  status?: string;
};

type CockpitContractRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  status: ContractStatus;
  title: string;
  updated_at: string;
  customers?: Relation<CockpitCustomerRow>;
  projects?: Relation<CockpitProjectRow>;
  estimates?: Relation<CockpitEstimateSummaryRow>;
};

type CockpitEstimateRow = {
  id: string;
  customer_id: string;
  project_id: string;
  reference_number: string;
  status: EstimateStatus;
  updated_at: string;
  customers?: Relation<CockpitCustomerRow>;
  projects?: Relation<CockpitProjectRow>;
};

type CockpitContractEstimateIdRow = {
  estimate_id: string | null;
};

type CockpitInvoiceRow = {
  id: string;
  customer_id: string;
  project_id: string;
  reference_number: string;
  status: InvoiceStatus;
  due_date: string | null;
  balance_due_amount: string | number;
  updated_at: string;
  customers?: Relation<CockpitCustomerRow>;
  projects?: Relation<CockpitProjectRow>;
};

type CockpitJobRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  dispatch_status: JobStatus;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  updated_at: string;
  customers?: Relation<CockpitCustomerRow>;
  projects?: Relation<CockpitProjectRow>;
  estimates?: Relation<CockpitEstimateSummaryRow>;
};

type CockpitAppointmentRow = {
  id: string;
  opportunity_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  assigned_person_id: string | null;
  title: string;
  appointment_type: AppointmentType;
  starts_at: string;
  location: string | null;
  status: AppointmentStatus;
  updated_at: string;
  opportunities?: Relation<{
    id: string;
    title: string;
    status: string;
  }>;
  customers?: Relation<CockpitCustomerRow>;
  projects?: Relation<CockpitProjectRow>;
};

type DashboardAppointmentRow = CockpitAppointmentRow & {
  customer_visible: boolean;
  assigned_person?: Relation<{
    id: string;
    display_name: string;
  }>;
};

type DashboardCurrentPersonRow = {
  id: string;
  membership_user_id: string | null;
  display_name: string;
  is_active: boolean;
};

export type CockpitContractPreview = {
  id: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  status: ContractStatus;
  title: string;
  updatedAt: string;
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
  } | null;
};

export type CockpitEstimatePreview = {
  id: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  status: EstimateStatus;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type CockpitInvoicePreview = {
  id: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  status: InvoiceStatus;
  dueDate: string | null;
  balanceDueAmount: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type CockpitJobPreview = {
  id: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  updatedAt: string;
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

export type CockpitAppointmentPreview = {
  id: string;
  opportunityId: string | null;
  customerId: string | null;
  projectId: string | null;
  assignedPersonId: string | null;
  title: string;
  appointmentType: AppointmentType;
  startsAt: string;
  location: string | null;
  status: AppointmentStatus;
  updatedAt: string;
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
  } | null;
};

export type DashboardAppointmentPreview = CockpitAppointmentPreview & {
  customerVisible: boolean;
  assignedPerson: {
    id: string;
    displayName: string;
  } | null;
};

export type DashboardCurrentPersonPreview = {
  id: string;
  membershipUserId: string | null;
  displayName: string;
  isActive: boolean;
};

export type DashboardOverviewReadModel = {
  customerCount: number;
  opportunityCount: number;
  approvedEstimateCount: number;
  scheduledAppointmentCount: number;
  appointmentsTodayCount: number;
  currentUserPerson: DashboardCurrentPersonPreview | null;
  assignedUpcomingAppointments: DashboardAppointmentPreview[];
  companyUpcomingAppointments: DashboardAppointmentPreview[];
  appointmentFollowUps: DashboardAppointmentPreview[];
};

export type DashboardOperationalCockpitReadModel = {
  approvedEstimatesReadyForContract: CockpitEstimatePreview[];
  waitingContracts: CockpitContractPreview[];
  sentEstimates: CockpitEstimatePreview[];
  openInvoices: CockpitInvoicePreview[];
  overdueInvoices: CockpitInvoicePreview[];
  unscheduledJobs: CockpitJobPreview[];
  jobsTodayOrInProgress: CockpitJobPreview[];
  appointmentFollowUps: CockpitAppointmentPreview[];
};

const cockpitContractSelect = `
  id,
  customer_id,
  project_id,
  estimate_id,
  status,
  title,
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
    reference_number
  )
`;

const cockpitEstimateSelect = `
  id,
  customer_id,
  project_id,
  reference_number,
  status,
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

const cockpitInvoiceSelect = `
  id,
  customer_id,
  project_id,
  reference_number,
  status,
  due_date,
  balance_due_amount,
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

const cockpitJobSelect = `
  id,
  customer_id,
  project_id,
  estimate_id,
  dispatch_status,
  scheduled_date,
  scheduled_start_at,
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
`;

const cockpitAppointmentSelect = `
  id,
  opportunity_id,
  customer_id,
  project_id,
  assigned_person_id,
  title,
  appointment_type,
  starts_at,
  location,
  status,
  updated_at,
  opportunities (
    id,
    title,
    status
  ),
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

const dashboardAppointmentSelect = `
  id,
  opportunity_id,
  customer_id,
  project_id,
  assigned_person_id,
  title,
  appointment_type,
  starts_at,
  location,
  status,
  customer_visible,
  updated_at,
  opportunities (
    id,
    title,
    status
  ),
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name
  ),
  assigned_person:people!appointments_assigned_person_id_fkey (
    id,
    display_name
  )
`;

function mapCustomer(row: Relation<CockpitCustomerRow>) {
  const customer = firstRelation(row);

  return customer
    ? {
        id: customer.id,
        name: customer.name,
        companyName: customer.company_name
      }
    : null;
}

function mapProject(row: Relation<CockpitProjectRow>) {
  const project = firstRelation(row);

  return project
    ? {
        id: project.id,
        name: project.name
      }
    : null;
}

function mapContract(row: CockpitContractRow): CockpitContractPreview {
  const estimate = firstRelation(row.estimates);

  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProject(row.projects),
    estimate: estimate
      ? {
          id: estimate.id,
          referenceNumber: estimate.reference_number
        }
      : null
  };
}

function mapEstimate(row: CockpitEstimateRow): CockpitEstimatePreview {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProject(row.projects)
  };
}

function mapInvoice(row: CockpitInvoiceRow): CockpitInvoicePreview {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    dueDate: row.due_date,
    balanceDueAmount: Number(row.balance_due_amount).toFixed(2),
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProject(row.projects)
  };
}

function mapJob(row: CockpitJobRow): CockpitJobPreview {
  const estimate = firstRelation(row.estimates);

  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    dispatchStatus: row.dispatch_status,
    scheduledDate: row.scheduled_date,
    scheduledStartAt: row.scheduled_start_at,
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProject(row.projects),
    estimate: estimate
      ? {
          id: estimate.id,
          referenceNumber: estimate.reference_number,
          status: estimate.status ?? ""
        }
      : null
  };
}

function mapAppointment(row: CockpitAppointmentRow): CockpitAppointmentPreview {
  const opportunity = firstRelation(row.opportunities);

  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    assignedPersonId: row.assigned_person_id,
    title: row.title,
    appointmentType: row.appointment_type,
    startsAt: row.starts_at,
    location: row.location,
    status: row.status,
    updatedAt: row.updated_at,
    opportunity: opportunity
      ? {
          id: opportunity.id,
          title: opportunity.title,
          status: opportunity.status
        }
      : null,
    customer: mapCustomer(row.customers),
    project: mapProject(row.projects)
  };
}

function mapDashboardAppointment(
  row: DashboardAppointmentRow
): DashboardAppointmentPreview {
  const appointment = mapAppointment(row);
  const assignedPerson = firstRelation(row.assigned_person);

  return {
    ...appointment,
    customerVisible: row.customer_visible,
    assignedPerson: assignedPerson
      ? {
          id: assignedPerson.id,
          displayName: assignedPerson.display_name
        }
      : null
  };
}

function mapDashboardCurrentPerson(
  row: DashboardCurrentPersonRow
): DashboardCurrentPersonPreview {
  return {
    id: row.id,
    membershipUserId: row.membership_user_id,
    displayName: row.display_name,
    isActive: row.is_active
  };
}

function sortInvoicesForDashboard(invoices: CockpitInvoicePreview[]) {
  return [...invoices].sort((left, right) => {
    const statusComparison = compareInvoiceStatuses(left.status, right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    const dueLeft = left.dueDate ?? "9999-12-31";
    const dueRight = right.dueDate ?? "9999-12-31";
    const dueComparison = dueLeft.localeCompare(dueRight);

    if (dueComparison !== 0) {
      return dueComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function sortJobsForDashboard(jobs: CockpitJobPreview[]) {
  return [...jobs].sort((left, right) => {
    const statusComparison = compareJobStatuses(
      left.dispatchStatus,
      right.dispatchStatus
    );

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

async function listApprovedEstimatesReadyForContract(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const contractResponse = await supabase
    .from("contracts")
    .select("estimate_id")
    .eq("company_id", input.organizationId)
    .not("estimate_id", "is", null);
  const contractRows =
    (contractResponse.data as CockpitContractEstimateIdRow[] | null) ?? [];

  if (contractResponse.error) {
    throw new Error(
      `Unable to load dashboard contract estimate links: ${contractResponse.error.message}`
    );
  }

  const contractedEstimateIds = [
    ...new Set(
      contractRows
        .map((row) => row.estimate_id)
        .filter((value): value is string => Boolean(value))
    )
  ];
  let query = supabase
    .from("estimates")
    .select(cockpitEstimateSelect)
    .eq("company_id", input.organizationId)
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(input.limit);

  if (contractedEstimateIds.length > 0) {
    query = query.not("id", "in", `(${contractedEstimateIds.join(",")})`);
  }

  const response = await query;
  const rows = (response.data as CockpitEstimateRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard approved estimate handoffs: ${response.error.message}`
    );
  }

  return rows.map(mapEstimate);
}

async function listWaitingContracts(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(cockpitContractSelect)
    .eq("company_id", input.organizationId)
    .in("status", ["sent", "viewed"])
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as CockpitContractRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard waiting contracts: ${response.error.message}`
    );
  }

  return rows
    .map(mapContract)
    .sort((left, right) => {
      const statusComparison = compareContractStatuses(
        left.status,
        right.status
      );

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    })
    .slice(0, input.limit);
}

async function listSentEstimates(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select(cockpitEstimateSelect)
    .eq("company_id", input.organizationId)
    .eq("status", "sent")
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as CockpitEstimateRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard sent estimates: ${response.error.message}`
    );
  }

  return rows.map(mapEstimate);
}

async function listOpenInvoices(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const invoiceStatuses: InvoiceStatus[] = ["draft", "sent", "partially_paid"];
  const responses = await Promise.all(
    invoiceStatuses.map((status) =>
      supabase
        .from("invoices")
        .select(cockpitInvoiceSelect)
        .eq("company_id", input.organizationId)
        .eq("status", status)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(input.limit)
    )
  );
  const errorResponse = responses.find((response) => response.error);

  if (errorResponse?.error) {
    throw new Error(
      `Unable to load dashboard open invoices: ${errorResponse.error.message}`
    );
  }

  return sortInvoicesForDashboard(
    responses.flatMap((response) =>
      ((response.data as CockpitInvoiceRow[] | null) ?? []).map(mapInvoice)
    )
  ).slice(0, input.limit);
}

async function listOverdueInvoices(input: {
  organizationId: string;
  today: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(cockpitInvoiceSelect)
    .eq("company_id", input.organizationId)
    .lt("due_date", input.today)
    .not("status", "in", '("paid","void")')
    .order("due_date", { ascending: true })
    .limit(input.limit);
  const rows = (response.data as CockpitInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard overdue invoices: ${response.error.message}`
    );
  }

  return rows.map(mapInvoice);
}

async function listUnscheduledJobs(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(cockpitJobSelect)
    .eq("company_id", input.organizationId)
    .eq("dispatch_status", "unscheduled")
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as CockpitJobRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard unscheduled jobs: ${response.error.message}`
    );
  }

  return rows.map(mapJob);
}

async function listJobsTodayOrInProgress(input: {
  organizationId: string;
  today: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const [inProgressResponse, todayResponse] = await Promise.all([
    supabase
      .from("jobs")
      .select(cockpitJobSelect)
      .eq("company_id", input.organizationId)
      .eq("dispatch_status", "in_progress")
      .order("scheduled_start_at", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(input.limit),
    supabase
      .from("jobs")
      .select(cockpitJobSelect)
      .eq("company_id", input.organizationId)
      .eq("scheduled_date", input.today)
      .neq("dispatch_status", "in_progress")
      .order("scheduled_start_at", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(input.limit)
  ]);

  const error = inProgressResponse.error ?? todayResponse.error;

  if (error) {
    throw new Error(`Unable to load dashboard active jobs: ${error.message}`);
  }

  const jobsById = new Map<string, CockpitJobPreview>();

  for (const job of [
    ...((inProgressResponse.data as CockpitJobRow[] | null) ?? []),
    ...((todayResponse.data as CockpitJobRow[] | null) ?? [])
  ].map(mapJob)) {
    jobsById.set(job.id, job);
  }

  return sortJobsForDashboard([...jobsById.values()]).slice(0, input.limit);
}

async function listAppointmentFollowUps(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(cockpitAppointmentSelect)
    .eq("company_id", input.organizationId)
    .in("status", ["canceled", "no_show"])
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as CockpitAppointmentRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard appointment follow-ups: ${response.error.message}`
    );
  }

  return rows.map(mapAppointment);
}

async function getDashboardOverviewCounts(input: {
  organizationId: string;
  today: string;
  tomorrow: string;
}) {
  const supabase = await getSupabaseServerClient();
  const [
    customerCountResponse,
    opportunityCountResponse,
    approvedEstimateCountResponse,
    scheduledAppointmentCountResponse,
    appointmentsTodayCountResponse
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId)
      .eq("status", "approved"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId)
      .eq("status", "scheduled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId)
      .eq("status", "scheduled")
      .gte("starts_at", `${input.today}T00:00:00.000Z`)
      .lt("starts_at", `${input.tomorrow}T00:00:00.000Z`)
  ]);
  const error =
    customerCountResponse.error ??
    opportunityCountResponse.error ??
    approvedEstimateCountResponse.error ??
    scheduledAppointmentCountResponse.error ??
    appointmentsTodayCountResponse.error;

  if (error) {
    throw new Error(`Unable to load dashboard overview counts: ${error.message}`);
  }

  return {
    customerCount: customerCountResponse.count ?? 0,
    opportunityCount: opportunityCountResponse.count ?? 0,
    approvedEstimateCount: approvedEstimateCountResponse.count ?? 0,
    scheduledAppointmentCount: scheduledAppointmentCountResponse.count ?? 0,
    appointmentsTodayCount: appointmentsTodayCountResponse.count ?? 0
  };
}

async function getDashboardCurrentUserPerson(input: {
  organizationId: string;
  userId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, membership_user_id, display_name, is_active")
    .eq("company_id", input.organizationId)
    .eq("membership_user_id", input.userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const data = response.data as DashboardCurrentPersonRow | null;

  if (response.error) {
    throw new Error(
      `Unable to load dashboard current user person: ${response.error.message}`
    );
  }

  return data ? mapDashboardCurrentPerson(data) : null;
}

async function listDashboardUpcomingAppointments(input: {
  organizationId: string;
  nowIso: string;
  assignedPersonId?: string | null;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("appointments")
    .select(dashboardAppointmentSelect)
    .eq("company_id", input.organizationId)
    .eq("status", "scheduled")
    .gte("starts_at", input.nowIso)
    .order("starts_at", { ascending: true })
    .limit(input.limit);

  if (input.assignedPersonId) {
    query = query.eq("assigned_person_id", input.assignedPersonId);
  }

  const response = await query;
  const rows = (response.data as DashboardAppointmentRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard upcoming appointments: ${response.error.message}`
    );
  }

  return rows.map(mapDashboardAppointment);
}

async function listDashboardAppointmentFollowUps(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(dashboardAppointmentSelect)
    .eq("company_id", input.organizationId)
    .in("status", ["canceled", "no_show"])
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as DashboardAppointmentRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard appointment follow-up previews: ${response.error.message}`
    );
  }

  return rows.map(mapDashboardAppointment);
}

export const getDashboardOverviewReadModel = cache(
  async (input: {
    organizationId: string;
    userId: string;
    today: string;
    tomorrow: string;
    nowIso: string;
  }): Promise<DashboardOverviewReadModel> => {
    const [counts, currentUserPerson] = await Promise.all([
      getDashboardOverviewCounts({
        organizationId: input.organizationId,
        today: input.today,
        tomorrow: input.tomorrow
      }),
      getDashboardCurrentUserPerson({
        organizationId: input.organizationId,
        userId: input.userId
      })
    ]);
    const [
      assignedUpcomingAppointments,
      companyUpcomingAppointments,
      appointmentFollowUps
    ] = await Promise.all([
      currentUserPerson
        ? listDashboardUpcomingAppointments({
            organizationId: input.organizationId,
            nowIso: input.nowIso,
            assignedPersonId: currentUserPerson.id,
            limit: 5
          })
        : Promise.resolve([]),
      listDashboardUpcomingAppointments({
        organizationId: input.organizationId,
        nowIso: input.nowIso,
        limit: 5
      }),
      listDashboardAppointmentFollowUps({
        organizationId: input.organizationId,
        limit: 5
      })
    ]);

    return {
      ...counts,
      currentUserPerson,
      assignedUpcomingAppointments,
      companyUpcomingAppointments,
      appointmentFollowUps
    };
  }
);

export const getDashboardOperationalCockpitReadModel = cache(
  async (input: {
    organizationId: string;
    today: string;
  }): Promise<DashboardOperationalCockpitReadModel> => {
    const [
      approvedEstimatesReadyForContract,
      waitingContracts,
      sentEstimates,
      openInvoices,
      overdueInvoices,
      unscheduledJobs,
      jobsTodayOrInProgress,
      appointmentFollowUps
    ] = await Promise.all([
      listApprovedEstimatesReadyForContract({
        organizationId: input.organizationId,
        limit: 3
      }),
      listWaitingContracts({ organizationId: input.organizationId, limit: 2 }),
      listSentEstimates({ organizationId: input.organizationId, limit: 2 }),
      listOpenInvoices({ organizationId: input.organizationId, limit: 2 }),
      listOverdueInvoices({
        organizationId: input.organizationId,
        today: input.today,
        limit: 1
      }),
      listUnscheduledJobs({ organizationId: input.organizationId, limit: 3 }),
      listJobsTodayOrInProgress({
        organizationId: input.organizationId,
        today: input.today,
        limit: 2
      }),
      listAppointmentFollowUps({
        organizationId: input.organizationId,
        limit: 1
      })
    ]);

    return {
      approvedEstimatesReadyForContract,
      waitingContracts,
      sentEstimates,
      openInvoices,
      overdueInvoices,
      unscheduledJobs,
      jobsTodayOrInProgress,
      appointmentFollowUps
    };
  }
);
