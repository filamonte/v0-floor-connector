import "server-only";

import { cache } from "react";
import type { InvoiceStatus, InvoiceWorkflowRole } from "@floorconnector/types";

import type { PerspectiveView } from "@/lib/perspectives/types";
import { sortInvoiceRecords } from "@/lib/records/list-sort";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type InvoicesManagerView = "all" | "open" | InvoiceStatus;

export type InvoicesManagerInvoice = {
  id: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  jobId: string | null;
  referenceNumber: string;
  workflowRole: InvoiceWorkflowRole;
  status: InvoiceStatus;
  dueDate: string | null;
  taxCollectedAmount: string;
  totalAmount: string;
  balanceDueAmount: string;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  updatedAt: string;
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
  job: {
    id: string;
  } | null;
};

export type InvoiceQuickCreateProjectOption = {
  id: string;
  name: string;
  customerId: string;
  customerName: string | null;
};

export type InvoiceQuickCreateEstimateOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  totalAmount: string;
};

export type InvoiceQuickCreateJobOption = {
  id: string;
  projectId: string;
  estimateReferenceNumber: string | null;
  scheduledDate: string | null;
};

export type InvoiceQuickCreateChangeOrderOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  title: string;
};

export type InvoiceQuickCreateOptions = {
  projects: InvoiceQuickCreateProjectOption[];
  approvedEstimates: InvoiceQuickCreateEstimateOption[];
  completedJobs: InvoiceQuickCreateJobOption[];
  approvedChangeOrders: InvoiceQuickCreateChangeOrderOption[];
};

export type InvoiceInitialContext = {
  projectId: string | null;
  projectName: string | null;
  estimateId: string | null;
  jobId: string | null;
  changeOrderId: string | null;
  workflowRole: InvoiceWorkflowRole;
};

export type InvoicesManagerCounts = Record<InvoicesManagerView, number> & {
  overdue: number;
  partially_paid: number;
};

export type InvoicesManagerReadModel = {
  invoices: InvoicesManagerInvoice[];
  awaitingPaymentQueue: InvoicesManagerInvoice[];
  overdueQueue: InvoicesManagerInvoice[];
  draftQueue: InvoicesManagerInvoice[];
  recentlyPaidQueue: InvoicesManagerInvoice[];
  counts: InvoicesManagerCounts;
};

type InvoiceManagerScope = {
  organizationId: string;
  userId: string;
  perspective: PerspectiveView;
  projectId?: string;
  estimateId?: string;
  jobId?: string;
  workflowRole?: InvoiceWorkflowRole;
};

type InvoiceManagerRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  job_id: string | null;
  reference_number: string;
  workflow_role: InvoiceWorkflowRole;
  status: InvoiceStatus;
  due_date: string | null;
  tax_collected_amount: string | number;
  total_amount: string | number;
  balance_due_amount: string | number;
  created_by: string | null;
  updated_by: string | null;
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
  jobs?: {
    id: string;
  } | null;
};

type IdRow = {
  id: string;
};

type InvoiceQuickCreateProjectRow = {
  id: string;
  customer_id: string;
  name: string;
  customers?: {
    id: string;
    name: string;
  } | null;
};

type InvoiceQuickCreateEstimateRow = {
  id: string;
  project_id: string;
  reference_number: string;
  total_amount: string | number;
};

type InvoiceQuickCreateJobRow = {
  id: string;
  project_id: string;
  scheduled_date: string | null;
  estimates?: {
    reference_number: string;
  } | null;
};

type InvoiceQuickCreateChangeOrderRow = {
  id: string;
  project_id: string;
  reference_number: string;
  title: string;
};

type ChangeOrderSnapshotRow = {
  id: string;
  change_order_id: string;
};

type ChangeOrderSnapshotItemRow = {
  id: string;
  change_order_commercial_snapshot_id: string;
};

type ProjectContextRow = {
  id: string;
  name: string;
};

type EstimateContextRow = {
  id: string;
  project_id: string;
  projects?: {
    id: string;
    name: string;
  } | null;
};

type JobContextRow = {
  id: string;
  project_id: string;
  estimate_id: string | null;
  projects?: {
    id: string;
    name: string;
  } | null;
};

type ChangeOrderContextRow = {
  id: string;
  project_id: string;
  projects?: {
    id: string;
    name: string;
  } | null;
};

const invoiceStatuses: InvoiceStatus[] = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "void"
];

const invoicesManagerSelect = `
  id,
  customer_id,
  project_id,
  estimate_id,
  job_id,
  reference_number,
  workflow_role,
  status,
  due_date,
  tax_collected_amount,
  total_amount,
  balance_due_amount,
  created_by,
  updated_by,
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
  jobs (
    id
  )
`;

const quickCreateProjectSelect = `
  id,
  customer_id,
  name,
  customers (
    id,
    name
  )
`;

const quickCreateEstimateSelect = `
  id,
  project_id,
  reference_number,
  total_amount
`;

const quickCreateJobSelect = `
  id,
  project_id,
  scheduled_date,
  estimates (
    reference_number
  )
`;

const quickCreateChangeOrderSelect = `
  id,
  project_id,
  reference_number,
  title
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function mapInvoice(row: InvoiceManagerRow): InvoicesManagerInvoice {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    jobId: row.job_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    dueDate: row.due_date,
    taxCollectedAmount: Number(row.tax_collected_amount).toFixed(2),
    totalAmount: Number(row.total_amount).toFixed(2),
    balanceDueAmount: Number(row.balance_due_amount).toFixed(2),
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    updatedAt: row.updated_at,
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
    job: row.jobs
      ? {
          id: row.jobs.id
        }
      : null
  };
}

function getPerspectivePredicates(input: {
  perspective: PerspectiveView;
  userId: string;
}) {
  if (input.perspective === "company") {
    return [];
  }

  return [`created_by.eq.${input.userId}`, `updated_by.eq.${input.userId}`];
}

function applyPerspectiveFilter<
  T extends {
    or: (filters: string) => T;
  }
>(query: T, input: { perspective: PerspectiveView; userId: string }) {
  const predicates = getPerspectivePredicates(input);

  return predicates.length > 0 ? query.or(predicates.join(",")) : query;
}

function applyInvoiceScopeFilters<
  T extends {
    eq: (column: string, value: string) => T;
  }
>(query: T, input: InvoiceManagerScope) {
  let scopedQuery = query;

  if (input.projectId) {
    scopedQuery = scopedQuery.eq("project_id", input.projectId);
  }

  if (input.estimateId) {
    scopedQuery = scopedQuery.eq("estimate_id", input.estimateId);
  }

  if (input.jobId) {
    scopedQuery = scopedQuery.eq("job_id", input.jobId);
  }

  if (input.workflowRole) {
    scopedQuery = scopedQuery.eq("workflow_role", input.workflowRole);
  }

  return scopedQuery;
}

function applyInvoiceStatusFilter<
  T extends {
    eq: (column: string, value: string) => T;
    not: (column: string, operator: string, value: string | null) => T;
  }
>(query: T, status?: InvoicesManagerView) {
  if (!status || status === "all") {
    return query;
  }

  if (status === "open") {
    return query.not("status", "eq", "paid").not("status", "eq", "void");
  }

  return query.eq("status", status);
}

async function findInvoiceRelatedSearchIds(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const [customerResponse, projectResponse] = await Promise.all([
    supabase
      .from("customers")
      .select("id")
      .eq("company_id", input.organizationId)
      .or(`name.ilike.%${escapedQuery}%`),
    supabase
      .from("projects")
      .select("id")
      .eq("company_id", input.organizationId)
      .or(`name.ilike.%${escapedQuery}%`)
  ]);

  if (customerResponse.error) {
    throw new Error(
      `Unable to load invoice search customer matches: ${customerResponse.error.message}`
    );
  }

  if (projectResponse.error) {
    throw new Error(
      `Unable to load invoice search project matches: ${projectResponse.error.message}`
    );
  }

  return {
    customerIds: Array.isArray(customerResponse.data)
      ? (customerResponse.data as IdRow[]).map((row) => row.id)
      : [],
    projectIds: Array.isArray(projectResponse.data)
      ? (projectResponse.data as IdRow[]).map((row) => row.id)
      : []
  };
}

async function buildInvoiceSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);
  const relatedIds = await findInvoiceRelatedSearchIds({
    organizationId: input.organizationId,
    query: trimmedQuery
  });
  const workflowRoleMatches: InvoiceWorkflowRole[] = [
    "deposit",
    "standard"
  ].filter((role) =>
    role.includes(trimmedQuery.toLowerCase())
  ) as InvoiceWorkflowRole[];

  return [
    `reference_number.ilike.%${escapedQuery}%`,
    ...workflowRoleMatches.map((role) => `workflow_role.eq.${role}`),
    ...(relatedIds.customerIds.length > 0
      ? [`customer_id.in.(${relatedIds.customerIds.join(",")})`]
      : []),
    ...(relatedIds.projectIds.length > 0
      ? [`project_id.in.(${relatedIds.projectIds.join(",")})`]
      : [])
  ];
}

async function countInvoices(
  input: InvoiceManagerScope & {
    status?: InvoicesManagerView;
    overdueBefore?: string;
  }
) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  query = applyPerspectiveFilter(query, input);
  query = applyInvoiceScopeFilters(query, input);
  query = applyInvoiceStatusFilter(query, input.status);

  if (input.overdueBefore) {
    query = query
      .not("status", "eq", "paid")
      .not("status", "eq", "void")
      .not("due_date", "is", null)
      .lt("due_date", input.overdueBefore);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count invoices: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function listInvoicesForManager(
  input: InvoiceManagerScope & {
    query?: string;
    status?: InvoicesManagerView;
  }
) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildInvoiceSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });

  let query = supabase
    .from("invoices")
    .select(invoicesManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false });

  query = applyPerspectiveFilter(query, input);
  query = applyInvoiceScopeFilters(query, input);
  query = applyInvoiceStatusFilter(query, input.status);

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load invoices manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? sortInvoiceRecords(
        (response.data as unknown as InvoiceManagerRow[]).map(mapInvoice),
        "workflow"
      )
    : [];
}

async function listInvoiceQueue(
  input: InvoiceManagerScope & {
    status: InvoiceStatus;
    overdueBefore?: string;
    limit: number;
  }
) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("invoices")
    .select(invoicesManagerSelect)
    .eq("company_id", input.organizationId)
    .eq("status", input.status)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(input.limit);

  query = applyPerspectiveFilter(query, input);
  query = applyInvoiceScopeFilters(query, input);

  if (input.overdueBefore) {
    query = query
      .not("due_date", "is", null)
      .lt("due_date", input.overdueBefore);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load invoice queue rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as InvoiceManagerRow[]).map(mapInvoice)
    : [];
}

async function getProjectContext(input: {
  organizationId: string;
  projectId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id, name")
    .eq("company_id", input.organizationId)
    .eq("id", input.projectId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load invoice project context: ${response.error.message}`
    );
  }

  return (response.data as ProjectContextRow | null) ?? null;
}

async function getEstimateContext(input: {
  organizationId: string;
  estimateId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select("id, project_id, projects ( id, name )")
    .eq("company_id", input.organizationId)
    .eq("id", input.estimateId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load invoice estimate context: ${response.error.message}`
    );
  }

  return (response.data as EstimateContextRow | null) ?? null;
}

async function getJobContext(input: { organizationId: string; jobId: string }) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select("id, project_id, estimate_id, projects ( id, name )")
    .eq("company_id", input.organizationId)
    .eq("id", input.jobId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load invoice job context: ${response.error.message}`
    );
  }

  return (response.data as JobContextRow | null) ?? null;
}

async function getChangeOrderContext(input: {
  organizationId: string;
  changeOrderId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select("id, project_id, projects ( id, name )")
    .eq("company_id", input.organizationId)
    .eq("id", input.changeOrderId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load invoice change-order context: ${response.error.message}`
    );
  }

  return (response.data as ChangeOrderContextRow | null) ?? null;
}

export const getInitialInvoiceContext = cache(
  async (input: {
    organizationId: string;
    projectId?: string;
    estimateId?: string;
    jobId?: string;
    changeOrderId?: string;
    workflowRole?: string;
  }): Promise<InvoiceInitialContext> => {
    const resolvedWorkflowRole: InvoiceWorkflowRole =
      input.workflowRole === "deposit" ? "deposit" : "standard";
    const [project, estimate, job, changeOrder] = await Promise.all([
      input.projectId
        ? getProjectContext({
            organizationId: input.organizationId,
            projectId: input.projectId
          })
        : Promise.resolve(null),
      input.estimateId
        ? getEstimateContext({
            organizationId: input.organizationId,
            estimateId: input.estimateId
          })
        : Promise.resolve(null),
      input.jobId
        ? getJobContext({
            organizationId: input.organizationId,
            jobId: input.jobId
          })
        : Promise.resolve(null),
      input.changeOrderId
        ? getChangeOrderContext({
            organizationId: input.organizationId,
            changeOrderId: input.changeOrderId
          })
        : Promise.resolve(null)
    ]);
    const sourceEstimate =
      estimate ??
      (job?.estimate_id
        ? await getEstimateContext({
            organizationId: input.organizationId,
            estimateId: job.estimate_id
          })
        : null);
    const projectId =
      project?.id ??
      sourceEstimate?.project_id ??
      job?.project_id ??
      changeOrder?.project_id ??
      null;
    const projectName =
      project?.name ??
      sourceEstimate?.projects?.name ??
      job?.projects?.name ??
      changeOrder?.projects?.name ??
      null;

    return {
      projectId,
      projectName,
      estimateId: sourceEstimate?.id ?? null,
      jobId: job?.id ?? null,
      changeOrderId: changeOrder?.id ?? null,
      workflowRole: resolvedWorkflowRole
    };
  }
);

export const getInvoicesManagerReadModel = cache(
  async (
    input: InvoiceManagerScope & {
      query?: string;
      status?: InvoicesManagerView;
      todayIso: string;
    }
  ): Promise<InvoicesManagerReadModel> => {
    const scopedInput: InvoiceManagerScope = {
      organizationId: input.organizationId,
      userId: input.userId,
      perspective: input.perspective,
      projectId: input.projectId,
      estimateId: input.estimateId,
      jobId: input.jobId,
      workflowRole: input.workflowRole
    };
    const [
      allCount,
      draftCount,
      sentCount,
      openCount,
      partialCount,
      paidCount,
      voidCount,
      overdueCount,
      invoices,
      awaitingSentQueue,
      awaitingPartialQueue,
      overdueDraftQueue,
      overdueSentQueue,
      overduePartialQueue,
      draftQueue,
      recentlyPaidQueue
    ] = await Promise.all([
      countInvoices(scopedInput),
      countInvoices({ ...scopedInput, status: "draft" }),
      countInvoices({ ...scopedInput, status: "sent" }),
      countInvoices({ ...scopedInput, status: "open" }),
      countInvoices({ ...scopedInput, status: "partially_paid" }),
      countInvoices({ ...scopedInput, status: "paid" }),
      countInvoices({ ...scopedInput, status: "void" }),
      countInvoices({ ...scopedInput, overdueBefore: input.todayIso }),
      listInvoicesForManager(input),
      listInvoiceQueue({ ...scopedInput, status: "sent", limit: 3 }),
      listInvoiceQueue({ ...scopedInput, status: "partially_paid", limit: 3 }),
      listInvoiceQueue({
        ...scopedInput,
        status: "draft",
        overdueBefore: input.todayIso,
        limit: 3
      }),
      listInvoiceQueue({
        ...scopedInput,
        status: "sent",
        overdueBefore: input.todayIso,
        limit: 3
      }),
      listInvoiceQueue({
        ...scopedInput,
        status: "partially_paid",
        overdueBefore: input.todayIso,
        limit: 3
      }),
      listInvoiceQueue({ ...scopedInput, status: "draft", limit: 3 }),
      listInvoiceQueue({ ...scopedInput, status: "paid", limit: 3 })
    ]);

    return {
      invoices,
      awaitingPaymentQueue: sortInvoiceRecords(
        [...awaitingSentQueue, ...awaitingPartialQueue],
        "workflow"
      ).slice(0, 3),
      overdueQueue: sortInvoiceRecords(
        [...overdueDraftQueue, ...overdueSentQueue, ...overduePartialQueue],
        "workflow"
      ).slice(0, 3),
      draftQueue: sortInvoiceRecords(draftQueue, "workflow").slice(0, 3),
      recentlyPaidQueue: sortInvoiceRecords(
        recentlyPaidQueue,
        "workflow"
      ).slice(0, 3),
      counts: {
        all: allCount,
        draft: draftCount,
        sent: sentCount,
        open: openCount,
        paid: paidCount,
        void: voidCount,
        partially_paid: partialCount,
        overdue: overdueCount
      }
    };
  }
);

export const getInvoiceQuickCreateOptions = cache(
  async (organizationId: string): Promise<InvoiceQuickCreateOptions> => {
    const supabase = await getSupabaseServerClient();
    const [
      projectsResponse,
      estimatesResponse,
      jobsResponse,
      changeOrdersResponse
    ] = await Promise.all([
      supabase
        .from("projects")
        .select(quickCreateProjectSelect)
        .eq("company_id", organizationId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("estimates")
        .select(quickCreateEstimateSelect)
        .eq("company_id", organizationId)
        .eq("status", "approved")
        .order("updated_at", { ascending: false }),
      supabase
        .from("jobs")
        .select(quickCreateJobSelect)
        .eq("company_id", organizationId)
        .eq("dispatch_status", "completed")
        .order("updated_at", { ascending: false }),
      supabase
        .from("change_orders")
        .select(quickCreateChangeOrderSelect)
        .eq("company_id", organizationId)
        .eq("status", "approved")
        .is("invoice_id", null)
        .order("updated_at", { ascending: false })
    ]);

    if (projectsResponse.error) {
      throw new Error(
        `Unable to load invoice quick-create projects: ${projectsResponse.error.message}`
      );
    }

    if (estimatesResponse.error) {
      throw new Error(
        `Unable to load invoice quick-create estimates: ${estimatesResponse.error.message}`
      );
    }

    if (jobsResponse.error) {
      throw new Error(
        `Unable to load invoice quick-create jobs: ${jobsResponse.error.message}`
      );
    }

    if (changeOrdersResponse.error) {
      throw new Error(
        `Unable to load invoice quick-create change orders: ${changeOrdersResponse.error.message}`
      );
    }

    const projects = Array.isArray(projectsResponse.data)
      ? (projectsResponse.data as unknown as InvoiceQuickCreateProjectRow[])
      : [];
    const estimates = Array.isArray(estimatesResponse.data)
      ? (estimatesResponse.data as InvoiceQuickCreateEstimateRow[])
      : [];
    const jobs = Array.isArray(jobsResponse.data)
      ? (jobsResponse.data as unknown as InvoiceQuickCreateJobRow[])
      : [];
    const changeOrders = Array.isArray(changeOrdersResponse.data)
      ? (changeOrdersResponse.data as InvoiceQuickCreateChangeOrderRow[])
      : [];
    const changeOrderIds = changeOrders.map((changeOrder) => changeOrder.id);
    const snapshotsResponse =
      changeOrderIds.length > 0
        ? await supabase
            .from("change_order_commercial_snapshots")
            .select("id, change_order_id")
            .eq("company_id", organizationId)
            .in("change_order_id", changeOrderIds)
            .order("snapshot_version", { ascending: false })
            .order("created_at", { ascending: false })
        : null;

    if (snapshotsResponse?.error) {
      throw new Error(
        `Unable to load invoice quick-create change-order snapshots: ${snapshotsResponse.error.message}`
      );
    }

    const latestSnapshotByChangeOrderId = new Map<string, string>();
    const snapshots = Array.isArray(snapshotsResponse?.data)
      ? (snapshotsResponse.data as ChangeOrderSnapshotRow[])
      : [];

    for (const snapshot of snapshots) {
      if (!latestSnapshotByChangeOrderId.has(snapshot.change_order_id)) {
        latestSnapshotByChangeOrderId.set(
          snapshot.change_order_id,
          snapshot.id
        );
      }
    }

    const latestSnapshotIds = [...latestSnapshotByChangeOrderId.values()];
    const snapshotItemsResponse =
      latestSnapshotIds.length > 0
        ? await supabase
            .from("change_order_commercial_snapshot_items")
            .select("id, change_order_commercial_snapshot_id")
            .eq("company_id", organizationId)
            .in("change_order_commercial_snapshot_id", latestSnapshotIds)
        : null;

    if (snapshotItemsResponse?.error) {
      throw new Error(
        `Unable to load invoice quick-create change-order snapshot items: ${snapshotItemsResponse.error.message}`
      );
    }

    const snapshotIdsWithItems = new Set(
      Array.isArray(snapshotItemsResponse?.data)
        ? (snapshotItemsResponse.data as ChangeOrderSnapshotItemRow[]).map(
            (item) => item.change_order_commercial_snapshot_id
          )
        : []
    );

    return {
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        customerId: project.customer_id,
        customerName: project.customers?.name ?? null
      })),
      approvedEstimates: estimates.map((estimate) => ({
        id: estimate.id,
        projectId: estimate.project_id,
        referenceNumber: estimate.reference_number,
        totalAmount: Number(estimate.total_amount).toFixed(2)
      })),
      completedJobs: jobs.map((job) => ({
        id: job.id,
        projectId: job.project_id,
        estimateReferenceNumber: job.estimates?.reference_number ?? null,
        scheduledDate: job.scheduled_date
      })),
      approvedChangeOrders: changeOrders
        .filter((changeOrder) => {
          const snapshotId = latestSnapshotByChangeOrderId.get(changeOrder.id);
          return snapshotId ? snapshotIdsWithItems.has(snapshotId) : false;
        })
        .map((changeOrder) => ({
          id: changeOrder.id,
          projectId: changeOrder.project_id,
          referenceNumber: changeOrder.reference_number,
          title: changeOrder.title
        }))
    };
  }
);

export function isInvoicesManagerView(
  value: string | null | undefined
): value is InvoicesManagerView {
  return (
    value === "all" ||
    value === "open" ||
    invoiceStatuses.includes(value as InvoiceStatus)
  );
}
