import "server-only";

import { cache } from "react";
import {
  compareContractStatuses,
  compareInvoiceStatuses,
  compareProjectStatuses
} from "@floorconnector/domain";
import type {
  ContractStatus,
  EstimateStatus,
  InvoiceStatus,
  JobStatus,
  ProjectStatus
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null | undefined;

function firstRelation<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

type DashboardCustomerRow = {
  id: string;
  name: string;
  company_name: string | null;
};

type DashboardProjectRow = {
  id: string;
  company_id: string;
  customer_id: string;
  name: string;
  status: ProjectStatus;
  updated_at: string;
  customers?: Relation<DashboardCustomerRow>;
};

type DashboardProjectRelationRow = {
  id: string;
  name: string;
};

type DashboardEstimateRelationRow = {
  id: string;
  reference_number: string;
  status?: string;
};

type DashboardEstimateRow = {
  id: string;
  customer_id: string;
  project_id: string;
  reference_number: string;
  status: EstimateStatus;
  total_amount: string | number;
  updated_at: string;
  customers?: Relation<DashboardCustomerRow>;
  projects?: Relation<DashboardProjectRelationRow>;
};

type DashboardCueEstimateRow = {
  id: string;
  project_id: string;
  reference_number: string;
  status: EstimateStatus;
  updated_at: string;
};

type DashboardContractRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  title: string;
  status: ContractStatus;
  updated_at: string;
  customers?: Relation<DashboardCustomerRow>;
  projects?: Relation<DashboardProjectRelationRow>;
  estimates?: Relation<DashboardEstimateRelationRow>;
};

type DashboardCueContractRow = {
  id: string;
  project_id: string;
  estimate_id: string | null;
  title: string;
  status: ContractStatus;
  updated_at: string;
};

type DashboardInvoiceRow = {
  id: string;
  customer_id: string;
  project_id: string;
  reference_number: string;
  workflow_role: string;
  status: InvoiceStatus;
  due_date: string | null;
  balance_due_amount: string | number;
  updated_at: string;
  customers?: Relation<DashboardCustomerRow>;
  projects?: Relation<DashboardProjectRelationRow>;
};

type DashboardCueInvoiceRow = {
  id: string;
  project_id: string;
  reference_number: string;
  workflow_role: string;
  status: InvoiceStatus;
  balance_due_amount: string | number;
};

type DashboardInvoiceBalanceRow = {
  balance_due_amount: string | number;
};

type DashboardJobRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  dispatch_status: JobStatus;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  updated_at: string;
  customers?: Relation<DashboardCustomerRow>;
  projects?: Relation<DashboardProjectRelationRow>;
  estimates?: Relation<DashboardEstimateRelationRow>;
};

type DashboardCueJobRow = {
  id: string;
  project_id: string;
  dispatch_status: JobStatus;
};

export type DashboardProjectCueProject = {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
};

export type DashboardProjectCueEstimateInput = {
  id: string;
  projectId: string;
  referenceNumber: string;
  status: EstimateStatus;
  updatedAt: string;
};

export type DashboardProjectCueEstimate = {
  id: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  status: EstimateStatus;
  totalAmount: string;
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

export type DashboardProjectCueContractInput = {
  id: string;
  projectId: string;
  estimateId: string | null;
  title: string;
  status: ContractStatus;
  updatedAt: string;
};

export type DashboardProjectCueContract = {
  id: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  title: string;
  status: ContractStatus;
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

export type DashboardProjectCueInvoiceInput = {
  id: string;
  projectId: string;
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  balanceDueAmount: string;
};

export type DashboardProjectCueInvoice = {
  id: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  workflowRole: string;
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

export type DashboardProjectCueJobInput = {
  id: string;
  projectId: string;
  dispatchStatus: JobStatus;
};

export type DashboardProjectCueJob = {
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

export type DashboardProjectCueInputReadModel = {
  projectTotalCount: number;
  estimateTotalCount: number;
  contractTotalCount: number;
  invoiceTotalCount: number;
  jobTotalCount: number;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  openReceivables: number;
  activeProjects: DashboardProjectCueProject[];
  estimatesForProjectCues: DashboardProjectCueEstimateInput[];
  contractsForProjectCues: DashboardProjectCueContractInput[];
  invoicesForProjectCues: DashboardProjectCueInvoiceInput[];
  jobsForProjectCues: DashboardProjectCueJobInput[];
  projectsNeedingAttention: DashboardProjectCueProject[];
  estimatesAwaitingAction: DashboardProjectCueEstimate[];
  contractsAwaitingAction: DashboardProjectCueContract[];
  jobsNeedingScheduling: DashboardProjectCueJob[];
  jobsTodayOrInProgress: DashboardProjectCueJob[];
  openInvoicePreviews: DashboardProjectCueInvoice[];
  overdueInvoicePreviews: DashboardProjectCueInvoice[];
};

const dashboardProjectSelect = `
  id,
  company_id,
  customer_id,
  name,
  status,
  updated_at,
  customers (
    id,
    name,
    company_name
  )
`;

const dashboardEstimateSelect = `
  id,
  customer_id,
  project_id,
  reference_number,
  status,
  total_amount,
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

const dashboardCueEstimateSelect = `
  id,
  project_id,
  reference_number,
  status,
  updated_at
`;

const dashboardContractSelect = `
  id,
  customer_id,
  project_id,
  estimate_id,
  title,
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
  ),
  estimates (
    id,
    reference_number,
    status
  )
`;

const dashboardCueContractSelect = `
  id,
  project_id,
  estimate_id,
  title,
  status,
  updated_at
`;

const dashboardInvoiceSelect = `
  id,
  customer_id,
  project_id,
  reference_number,
  workflow_role,
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

const dashboardCueInvoiceSelect = `
  id,
  project_id,
  reference_number,
  workflow_role,
  status,
  balance_due_amount
`;

const dashboardJobSelect = `
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

const dashboardCueJobSelect = `
  id,
  project_id,
  dispatch_status
`;

function mapCustomer(row: Relation<DashboardCustomerRow>) {
  const customer = firstRelation(row);

  return customer
    ? {
        id: customer.id,
        name: customer.name,
        companyName: customer.company_name
      }
    : null;
}

function mapProjectRelation(row: Relation<DashboardProjectRelationRow>) {
  const project = firstRelation(row);

  return project
    ? {
        id: project.id,
        name: project.name
      }
    : null;
}

function mapProject(row: DashboardProjectRow): DashboardProjectCueProject {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    name: row.name,
    status: row.status,
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers)
  };
}

function mapEstimate(row: DashboardEstimateRow): DashboardProjectCueEstimate {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    totalAmount: Number(row.total_amount).toFixed(2),
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProjectRelation(row.projects)
  };
}

function mapCueEstimate(
  row: DashboardCueEstimateRow
): DashboardProjectCueEstimateInput {
  return {
    id: row.id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function mapContract(row: DashboardContractRow): DashboardProjectCueContract {
  const estimate = firstRelation(row.estimates);

  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    title: row.title,
    status: row.status,
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProjectRelation(row.projects),
    estimate: estimate
      ? {
          id: estimate.id,
          referenceNumber: estimate.reference_number,
          status: estimate.status ?? ""
        }
      : null
  };
}

function mapCueContract(
  row: DashboardCueContractRow
): DashboardProjectCueContractInput {
  return {
    id: row.id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    title: row.title,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function mapInvoice(row: DashboardInvoiceRow): DashboardProjectCueInvoice {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    dueDate: row.due_date,
    balanceDueAmount: Number(row.balance_due_amount).toFixed(2),
    updatedAt: row.updated_at,
    customer: mapCustomer(row.customers),
    project: mapProjectRelation(row.projects)
  };
}

function mapCueInvoice(
  row: DashboardCueInvoiceRow
): DashboardProjectCueInvoiceInput {
  return {
    id: row.id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    balanceDueAmount: Number(row.balance_due_amount).toFixed(2)
  };
}

function mapJob(row: DashboardJobRow): DashboardProjectCueJob {
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
    project: mapProjectRelation(row.projects),
    estimate: estimate
      ? {
          id: estimate.id,
          referenceNumber: estimate.reference_number,
          status: estimate.status ?? ""
        }
      : null
  };
}

function mapCueJob(row: DashboardCueJobRow): DashboardProjectCueJobInput {
  return {
    id: row.id,
    projectId: row.project_id,
    dispatchStatus: row.dispatch_status
  };
}

function sortProjects(projects: DashboardProjectCueProject[]) {
  return [...projects].sort((left, right) => {
    const statusComparison = compareProjectStatuses(left.status, right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function sortInvoices(invoices: DashboardProjectCueInvoice[]) {
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

function sortJobsTodayOrInProgress(jobs: DashboardProjectCueJob[]) {
  return [...jobs].sort((left, right) => {
    if (
      left.dispatchStatus === "in_progress" &&
      right.dispatchStatus !== "in_progress"
    ) {
      return -1;
    }

    if (
      left.dispatchStatus !== "in_progress" &&
      right.dispatchStatus === "in_progress"
    ) {
      return 1;
    }

    return (left.scheduledStartAt ?? left.updatedAt).localeCompare(
      right.scheduledStartAt ?? right.updatedAt
    );
  });
}

async function getDashboardCueCounts(input: {
  organizationId: string;
  today: string;
}) {
  const supabase = await getSupabaseServerClient();
  const [
    projectCountResponse,
    estimateCountResponse,
    contractCountResponse,
    invoiceCountResponse,
    jobCountResponse,
    openInvoiceCountResponse,
    overdueInvoiceCountResponse
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId)
      .not("status", "in", '("paid","void")'),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("company_id", input.organizationId)
      .lt("due_date", input.today)
      .not("status", "in", '("paid","void")')
  ]);
  const error =
    projectCountResponse.error ??
    estimateCountResponse.error ??
    contractCountResponse.error ??
    invoiceCountResponse.error ??
    jobCountResponse.error ??
    openInvoiceCountResponse.error ??
    overdueInvoiceCountResponse.error;

  if (error) {
    throw new Error(
      `Unable to load dashboard project cue counts: ${error.message}`
    );
  }

  return {
    projectTotalCount: projectCountResponse.count ?? 0,
    estimateTotalCount: estimateCountResponse.count ?? 0,
    contractTotalCount: contractCountResponse.count ?? 0,
    invoiceTotalCount: invoiceCountResponse.count ?? 0,
    jobTotalCount: jobCountResponse.count ?? 0,
    openInvoiceCount: openInvoiceCountResponse.count ?? 0,
    overdueInvoiceCount: overdueInvoiceCountResponse.count ?? 0
  };
}

async function listActiveProjects(input: { organizationId: string }) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(dashboardProjectSelect)
    .eq("company_id", input.organizationId)
    .neq("status", "completed")
    .order("updated_at", { ascending: false });
  const rows = (response.data as DashboardProjectRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard active projects: ${response.error.message}`
    );
  }

  return sortProjects(rows.map(mapProject));
}

async function listEstimatesForProjectCues(input: {
  organizationId: string;
  projectIds: string[];
}) {
  if (input.projectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select(dashboardCueEstimateSelect)
    .eq("company_id", input.organizationId)
    .in("project_id", input.projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as DashboardCueEstimateRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard project cue estimates: ${response.error.message}`
    );
  }

  return rows.map(mapCueEstimate);
}

async function listContractsForProjectCues(input: {
  organizationId: string;
  projectIds: string[];
}) {
  if (input.projectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(dashboardCueContractSelect)
    .eq("company_id", input.organizationId)
    .in("project_id", input.projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as DashboardCueContractRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard project cue contracts: ${response.error.message}`
    );
  }

  return rows.map(mapCueContract).sort((left, right) => {
    const statusComparison = compareContractStatuses(left.status, right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

async function listInvoicesForProjectCues(input: {
  organizationId: string;
  projectIds: string[];
}) {
  if (input.projectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(dashboardCueInvoiceSelect)
    .eq("company_id", input.organizationId)
    .in("project_id", input.projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as DashboardCueInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard project cue invoices: ${response.error.message}`
    );
  }

  return rows.map(mapCueInvoice);
}

async function listJobsForProjectCues(input: {
  organizationId: string;
  projectIds: string[];
}) {
  if (input.projectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(dashboardCueJobSelect)
    .eq("company_id", input.organizationId)
    .in("project_id", input.projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as DashboardCueJobRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard project cue jobs: ${response.error.message}`
    );
  }

  return rows.map(mapCueJob);
}

async function listEstimatesAwaitingAction(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const statuses: EstimateStatus[] = ["draft", "sent", "rejected"];
  const responses = await Promise.all(
    statuses.map((status) =>
      supabase
        .from("estimates")
        .select(dashboardEstimateSelect)
        .eq("company_id", input.organizationId)
        .eq("status", status)
        .order("updated_at", { ascending: false })
        .limit(input.limit)
    )
  );
  const errorResponse = responses.find((response) => response.error);

  if (errorResponse?.error) {
    throw new Error(
      `Unable to load dashboard estimate action previews: ${errorResponse.error.message}`
    );
  }

  return responses
    .flatMap((response) =>
      ((response.data as DashboardEstimateRow[] | null) ?? []).map(mapEstimate)
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, input.limit);
}

async function listContractsAwaitingAction(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const statuses: ContractStatus[] = ["draft", "sent", "viewed"];
  const responses = await Promise.all(
    statuses.map((status) =>
      supabase
        .from("contracts")
        .select(dashboardContractSelect)
        .eq("company_id", input.organizationId)
        .eq("status", status)
        .order("updated_at", { ascending: false })
        .limit(input.limit)
    )
  );
  const errorResponse = responses.find((response) => response.error);

  if (errorResponse?.error) {
    throw new Error(
      `Unable to load dashboard contract action previews: ${errorResponse.error.message}`
    );
  }

  return responses
    .flatMap((response) =>
      ((response.data as DashboardContractRow[] | null) ?? []).map(mapContract)
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, input.limit);
}

async function listUnscheduledJobs(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(dashboardJobSelect)
    .eq("company_id", input.organizationId)
    .eq("dispatch_status", "unscheduled")
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as DashboardJobRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard unscheduled job previews: ${response.error.message}`
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
      .select(dashboardJobSelect)
      .eq("company_id", input.organizationId)
      .eq("dispatch_status", "in_progress")
      .order("scheduled_start_at", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(input.limit),
    supabase
      .from("jobs")
      .select(dashboardJobSelect)
      .eq("company_id", input.organizationId)
      .eq("scheduled_date", input.today)
      .neq("dispatch_status", "in_progress")
      .order("scheduled_start_at", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(input.limit)
  ]);
  const error = inProgressResponse.error ?? todayResponse.error;

  if (error) {
    throw new Error(
      `Unable to load dashboard live job previews: ${error.message}`
    );
  }

  const jobsById = new Map<string, DashboardProjectCueJob>();

  for (const job of [
    ...((inProgressResponse.data as DashboardJobRow[] | null) ?? []),
    ...((todayResponse.data as DashboardJobRow[] | null) ?? [])
  ].map(mapJob)) {
    jobsById.set(job.id, job);
  }

  return sortJobsTodayOrInProgress([...jobsById.values()]).slice(
    0,
    input.limit
  );
}

async function listOpenInvoicePreviews(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const invoiceStatuses: InvoiceStatus[] = ["draft", "sent", "partially_paid"];
  const responses = await Promise.all(
    invoiceStatuses.map((status) =>
      supabase
        .from("invoices")
        .select(dashboardInvoiceSelect)
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
      `Unable to load dashboard open invoice previews: ${errorResponse.error.message}`
    );
  }

  return sortInvoices(
    responses.flatMap((response) =>
      ((response.data as DashboardInvoiceRow[] | null) ?? []).map(mapInvoice)
    )
  ).slice(0, input.limit);
}

async function listOverdueInvoicePreviews(input: {
  organizationId: string;
  today: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(dashboardInvoiceSelect)
    .eq("company_id", input.organizationId)
    .lt("due_date", input.today)
    .not("status", "in", '("paid","void")')
    .order("due_date", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(input.limit);
  const rows = (response.data as DashboardInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard overdue invoice previews: ${response.error.message}`
    );
  }

  return rows.map(mapInvoice);
}

async function sumOpenReceivables(input: { organizationId: string }) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select("balance_due_amount")
    .eq("company_id", input.organizationId)
    .not("status", "in", '("paid","void")');
  const rows = (response.data as DashboardInvoiceBalanceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load dashboard open receivables: ${response.error.message}`
    );
  }

  return rows.reduce((sum, row) => sum + Number(row.balance_due_amount), 0);
}

export const getDashboardProjectCueInputReadModel = cache(
  async (input: {
    organizationId: string;
    today: string;
  }): Promise<DashboardProjectCueInputReadModel> => {
    const [counts, activeProjects] = await Promise.all([
      getDashboardCueCounts({
        organizationId: input.organizationId,
        today: input.today
      }),
      listActiveProjects({ organizationId: input.organizationId })
    ]);
    const activeProjectIds = activeProjects.map((project) => project.id);
    const [
      estimatesForProjectCues,
      contractsForProjectCues,
      invoicesForProjectCues,
      jobsForProjectCues,
      estimatesAwaitingAction,
      contractsAwaitingAction,
      jobsNeedingScheduling,
      jobsTodayOrInProgress,
      openInvoicePreviews,
      overdueInvoicePreviews,
      openReceivables
    ] = await Promise.all([
      listEstimatesForProjectCues({
        organizationId: input.organizationId,
        projectIds: activeProjectIds
      }),
      listContractsForProjectCues({
        organizationId: input.organizationId,
        projectIds: activeProjectIds
      }),
      listInvoicesForProjectCues({
        organizationId: input.organizationId,
        projectIds: activeProjectIds
      }),
      listJobsForProjectCues({
        organizationId: input.organizationId,
        projectIds: activeProjectIds
      }),
      listEstimatesAwaitingAction({
        organizationId: input.organizationId,
        limit: 5
      }),
      listContractsAwaitingAction({
        organizationId: input.organizationId,
        limit: 5
      }),
      listUnscheduledJobs({
        organizationId: input.organizationId,
        limit: 5
      }),
      listJobsTodayOrInProgress({
        organizationId: input.organizationId,
        today: input.today,
        limit: 5
      }),
      listOpenInvoicePreviews({
        organizationId: input.organizationId,
        limit: 5
      }),
      listOverdueInvoicePreviews({
        organizationId: input.organizationId,
        today: input.today,
        limit: 5
      }),
      sumOpenReceivables({ organizationId: input.organizationId })
    ]);

    return {
      ...counts,
      openReceivables,
      activeProjects,
      estimatesForProjectCues,
      contractsForProjectCues,
      invoicesForProjectCues,
      jobsForProjectCues,
      projectsNeedingAttention: activeProjects.slice(0, 5),
      estimatesAwaitingAction,
      contractsAwaitingAction,
      jobsNeedingScheduling,
      jobsTodayOrInProgress,
      openInvoicePreviews,
      overdueInvoicePreviews
    };
  }
);
