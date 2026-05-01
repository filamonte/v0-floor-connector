import "server-only";

import { cache } from "react";
import type { InvoiceStatus } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { assertInvoiceCommercialReadiness } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { replaceCanonicalInvoiceLineItems } from "@/lib/invoices/data";

type ProgressBillingScope = {
  userId: string;
  organizationId: string;
};

type ScheduleOfValuesRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string;
  billing_model: string;
  source_estimate_status: string;
  retainage_percentage_default: string | number;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
      }
    | Array<{
        id: string;
        name: string;
        company_name: string | null;
      }>
    | null;
  projects?:
    | {
        id: string;
        name: string;
        status: string;
      }
    | Array<{
        id: string;
        name: string;
        status: string;
      }>
    | null;
  estimates?:
    | {
        id: string;
        reference_number: string;
        status: string;
      }
    | Array<{
        id: string;
        reference_number: string;
        status: string;
      }>
    | null;
};

type ScheduleOfValueItemRow = {
  id: string;
  company_id: string;
  schedule_of_values_id: string;
  lineage_type: "estimate_snapshot_item" | "change_order_snapshot_item";
  source_estimate_snapshot_item_id: string | null;
  source_estimate_line_item_id: string | null;
  change_order_snapshot_item_id: string | null;
  name: string;
  description: string | null;
  scheduled_value_amount: string | number;
  percent_complete: string | number;
  prior_billed_amount: string | number;
  current_billed_amount: string | number;
  retainage_percentage: string | number;
  retainage_held_amount: string | number;
  retainage_released_amount: string | number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ProgressInvoiceRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  reference_number: string;
  billing_model: string;
  workflow_role: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  total_amount: string | number;
  balance_due_amount: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ProgressInvoiceLineItemRow = {
  id: string;
  invoice_id: string;
  schedule_of_value_item_id: string | null;
  line_total: string | number;
};

type SourceEstimateSnapshotItemRow = {
  id: string;
  estimate_line_item_id: string;
  catalog_item_id: string | null;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  taxable: boolean;
  base_unit_cost: string | number;
  base_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  unit_price_before_hidden_markup: string | number;
  visible_markup_amount: string | number;
  hidden_markup_amount: string | number;
  unit_price: string | number;
  cost_code: string | null;
};

type SourceChangeOrderSnapshotItemRow = {
  id: string;
  catalog_item_id: string | null;
  tax_code_id: string | null;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  taxable: boolean;
  base_unit_cost: string | number;
  base_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  unit_price_before_hidden_markup: string | number;
  visible_markup_amount: string | number;
  hidden_markup_amount: string | number;
  unit_price: string | number;
  cost_code: string | null;
};

type ProgressBillingItemView = {
  id: string;
  name: string;
  description: string | null;
  scheduledValueAmount: string;
  percentComplete: string;
  minimumAllowedPercentComplete: string;
  previousBilledAmount: string;
  currentToBillAmount: string;
  completedToDateAmount: string;
  retainagePercentage: string;
  retainageHeldCurrentAmount: string;
  balanceToFinishAmount: string;
  draftInvoiceAmount: string;
  sortOrder: number;
};

export type ProgressBillingWorkspace = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string;
  billingModel: string;
  sourceEstimateStatus: string;
  retainagePercentageDefault: string;
  createdAt: string;
  updatedAt: string;
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
  estimate: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  items: ProgressBillingItemView[];
  scheduledValueTotal: string;
  previouslyBilledTotal: string;
  currentBillableTotal: string;
  completedToDateTotal: string;
  retainageHeldCurrentTotal: string;
  balanceToFinishTotal: string;
  weightedPercentComplete: string;
  status: "not_started" | "ready_to_bill" | "in_progress" | "fully_billed";
  progressInvoices: Array<{
    id: string;
    referenceNumber: string;
    status: InvoiceStatus;
    issueDate: string;
    dueDate: string | null;
    totalAmount: string;
    balanceDueAmount: string;
    updatedAt: string;
  }>;
  draftProgressInvoice: {
    id: string;
    referenceNumber: string;
    issueDate: string;
    dueDate: string | null;
    notes: string | null;
  } | null;
};

type BuildProgressBillingInvoiceInput = {
  scheduleOfValuesId: string;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  items: Array<{
    id: string;
    percentComplete: string;
  }>;
};

function parseMoney(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function formatMoney(value: number) {
  return roundMoney(value).toFixed(2);
}

function formatPercent(value: number) {
  return Number(value.toFixed(2)).toFixed(2);
}

async function loadSourceEstimateSnapshotItems(
  organizationId: string,
  snapshotItemIds: string[]
) {
  if (snapshotItemIds.length === 0) {
    return new Map<string, SourceEstimateSnapshotItemRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_commercial_snapshot_items")
    .select(
      `
        id,
        estimate_line_item_id,
        catalog_item_id,
        name,
        description,
        quantity,
        unit,
        taxable,
        base_unit_cost,
        base_unit_price,
        markup_percent,
        hidden_markup_percent,
        unit_price_before_hidden_markup,
        visible_markup_amount,
        hidden_markup_amount,
        unit_price,
        cost_code
      `
    )
    .eq("company_id", organizationId)
    .in("id", snapshotItemIds);

  if (response.error) {
    throw new Error(
      `Unable to load source estimate snapshot items for progress billing: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as SourceEstimateSnapshotItemRow[])
    : [];

  return new Map(rows.map((row) => [row.id, row] as const));
}

async function loadSourceChangeOrderSnapshotItems(
  organizationId: string,
  snapshotItemIds: string[]
) {
  if (snapshotItemIds.length === 0) {
    return new Map<string, SourceChangeOrderSnapshotItemRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_order_commercial_snapshot_items")
    .select(
      `
        id,
        catalog_item_id,
        tax_code_id,
        name,
        description,
        quantity,
        unit,
        taxable,
        base_unit_cost,
        base_unit_price,
        markup_percent,
        hidden_markup_percent,
        unit_price_before_hidden_markup,
        visible_markup_amount,
        hidden_markup_amount,
        unit_price,
        cost_code
      `
    )
    .eq("company_id", organizationId)
    .in("id", snapshotItemIds);

  if (response.error) {
    throw new Error(
      `Unable to load change-order snapshot items for progress billing: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as SourceChangeOrderSnapshotItemRow[])
    : [];

  return new Map(rows.map((row) => [row.id, row] as const));
}

function buildRedirect(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function getProgressBillingScope(
  next = "/progress-billing"
): Promise<ProgressBillingScope | null> {
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

async function requireProgressBillingScope(next = "/progress-billing") {
  const scope = await getProgressBillingScope(next);

  if (!scope) {
    throw new Error("No active organization is available for progress billing yet.");
  }

  return scope;
}

async function loadScheduleOfValuesRows(
  organizationId: string
): Promise<ScheduleOfValuesRow[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("schedule_of_values")
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        billing_model,
        source_estimate_status,
        retainage_percentage_default,
        created_at,
        updated_at,
        customers (
          id,
          name,
          company_name
        ),
        projects (
          id,
          name,
          status
        ),
        estimates (
          id,
          reference_number,
          status
        )
      `
    )
    .eq("company_id", organizationId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load schedules of values: ${response.error.message}`);
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as ScheduleOfValuesRow[])
    : [];
}

async function loadScheduleOfValueItemRows(
  organizationId: string,
  scheduleOfValuesIds: string[]
): Promise<ScheduleOfValueItemRow[]> {
  if (scheduleOfValuesIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("schedule_of_value_items")
    .select(
      `
        id,
        company_id,
        schedule_of_values_id,
        lineage_type,
        source_estimate_snapshot_item_id,
        source_estimate_line_item_id,
        change_order_snapshot_item_id,
        name,
        description,
        scheduled_value_amount,
        percent_complete,
        prior_billed_amount,
        current_billed_amount,
        retainage_percentage,
        retainage_held_amount,
        retainage_released_amount,
        sort_order,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .in("schedule_of_values_id", scheduleOfValuesIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load schedule-of-values items: ${response.error.message}`);
  }

  return Array.isArray(response.data)
    ? (response.data as ScheduleOfValueItemRow[])
    : [];
}

async function loadProgressInvoices(
  organizationId: string
): Promise<ProgressInvoiceRow[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(
      `
        id,
        company_id,
        customer_id,
        project_id,
        estimate_id,
        reference_number,
        billing_model,
        workflow_role,
        status,
        issue_date,
        due_date,
        total_amount,
        balance_due_amount,
        notes,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("billing_model", "aia_progress")
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load progress invoices: ${response.error.message}`);
  }

  return Array.isArray(response.data)
    ? (response.data as ProgressInvoiceRow[])
    : [];
}

async function loadProgressInvoiceLineItems(
  organizationId: string,
  invoiceIds: string[]
): Promise<ProgressInvoiceLineItemRow[]> {
  if (invoiceIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoice_line_items")
    .select(
      `
        id,
        invoice_id,
        schedule_of_value_item_id,
        line_total
      `
    )
    .eq("company_id", organizationId)
    .in("invoice_id", invoiceIds)
    .not("schedule_of_value_item_id", "is", null);

  if (response.error) {
    throw new Error(
      `Unable to load progress billing line item links: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as ProgressInvoiceLineItemRow[])
    : [];
}

function deriveProgressBillingWorkspace(
  scheduleOfValuesRow: ScheduleOfValuesRow,
  itemRows: ScheduleOfValueItemRow[],
  progressInvoices: ProgressInvoiceRow[],
  progressInvoiceLineItems: ProgressInvoiceLineItemRow[]
): ProgressBillingWorkspace {
  const invoiceById = new Map(progressInvoices.map((invoice) => [invoice.id, invoice]));
  const billedStatuses = new Set<InvoiceStatus>(["sent", "partially_paid", "paid"]);

  const items = itemRows.map((item) => {
    const linkedLineItems = progressInvoiceLineItems.filter(
      (lineItem) => lineItem.schedule_of_value_item_id === item.id
    );
    const previousBilledAmount = roundMoney(
      linkedLineItems.reduce((sum, lineItem) => {
        const invoice = invoiceById.get(lineItem.invoice_id);
        if (!invoice || !billedStatuses.has(invoice.status)) {
          return sum;
        }

        return sum + parseMoney(lineItem.line_total);
      }, 0)
    );
    const draftInvoiceAmount = roundMoney(
      linkedLineItems.reduce((sum, lineItem) => {
        const invoice = invoiceById.get(lineItem.invoice_id);
        return invoice?.status === "draft" ? sum + parseMoney(lineItem.line_total) : sum;
      }, 0)
    );
    const scheduledValueAmount = roundMoney(parseMoney(item.scheduled_value_amount));
    const minimumAllowedPercentComplete =
      scheduledValueAmount > 0
        ? roundMoney((previousBilledAmount / scheduledValueAmount) * 100)
        : 0;
    const percentComplete = Math.max(
      parseMoney(item.percent_complete),
      minimumAllowedPercentComplete
    );
    const completedToDateAmount = roundMoney(
      scheduledValueAmount * (percentComplete / 100)
    );
    const currentToBillAmount = roundMoney(
      Math.max(0, completedToDateAmount - previousBilledAmount)
    );
    const retainagePercentage = roundMoney(parseMoney(item.retainage_percentage));
    const retainageHeldCurrentAmount = roundMoney(
      currentToBillAmount * (retainagePercentage / 100)
    );
    const balanceToFinishAmount = roundMoney(
      Math.max(0, scheduledValueAmount - completedToDateAmount)
    );

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      scheduledValueAmount: formatMoney(scheduledValueAmount),
      percentComplete: formatPercent(percentComplete),
      minimumAllowedPercentComplete: formatPercent(minimumAllowedPercentComplete),
      previousBilledAmount: formatMoney(previousBilledAmount),
      currentToBillAmount: formatMoney(currentToBillAmount),
      completedToDateAmount: formatMoney(completedToDateAmount),
      retainagePercentage: formatPercent(retainagePercentage),
      retainageHeldCurrentAmount: formatMoney(retainageHeldCurrentAmount),
      balanceToFinishAmount: formatMoney(balanceToFinishAmount),
      draftInvoiceAmount: formatMoney(draftInvoiceAmount),
      sortOrder: item.sort_order
    };
  });

  const scheduledValueTotal = roundMoney(
    items.reduce((sum, item) => sum + parseMoney(item.scheduledValueAmount), 0)
  );
  const previouslyBilledTotal = roundMoney(
    items.reduce((sum, item) => sum + parseMoney(item.previousBilledAmount), 0)
  );
  const currentBillableTotal = roundMoney(
    items.reduce((sum, item) => sum + parseMoney(item.currentToBillAmount), 0)
  );
  const completedToDateTotal = roundMoney(
    items.reduce((sum, item) => sum + parseMoney(item.completedToDateAmount), 0)
  );
  const retainageHeldCurrentTotal = roundMoney(
    items.reduce((sum, item) => sum + parseMoney(item.retainageHeldCurrentAmount), 0)
  );
  const balanceToFinishTotal = roundMoney(
    items.reduce((sum, item) => sum + parseMoney(item.balanceToFinishAmount), 0)
  );
  const weightedPercentComplete =
    scheduledValueTotal > 0
      ? roundMoney((completedToDateTotal / scheduledValueTotal) * 100)
      : 0;
  const status =
    balanceToFinishTotal <= 0
      ? "fully_billed"
      : currentBillableTotal > 0
        ? "ready_to_bill"
        : previouslyBilledTotal > 0
          ? "in_progress"
          : "not_started";
  const relatedInvoices = progressInvoices
    .slice()
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .map((invoice) => ({
      id: invoice.id,
      referenceNumber: invoice.reference_number,
      status: invoice.status,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      totalAmount: formatMoney(parseMoney(invoice.total_amount)),
      balanceDueAmount: formatMoney(parseMoney(invoice.balance_due_amount)),
      updatedAt: invoice.updated_at
    }));
  const draftProgressInvoice =
    progressInvoices.find((invoice) => invoice.status === "draft") ?? null;

  return {
    id: scheduleOfValuesRow.id,
    organizationId: scheduleOfValuesRow.company_id,
    customerId: scheduleOfValuesRow.customer_id,
    projectId: scheduleOfValuesRow.project_id,
    estimateId: scheduleOfValuesRow.estimate_id,
    billingModel: scheduleOfValuesRow.billing_model,
    sourceEstimateStatus: scheduleOfValuesRow.source_estimate_status,
    retainagePercentageDefault: formatPercent(
      parseMoney(scheduleOfValuesRow.retainage_percentage_default)
    ),
    createdAt: scheduleOfValuesRow.created_at,
    updatedAt: scheduleOfValuesRow.updated_at,
    customer: unwrapRelation(scheduleOfValuesRow.customers)
      ? {
          id: unwrapRelation(scheduleOfValuesRow.customers)!.id,
          name: unwrapRelation(scheduleOfValuesRow.customers)!.name,
          companyName: unwrapRelation(scheduleOfValuesRow.customers)!.company_name
        }
      : null,
    project: unwrapRelation(scheduleOfValuesRow.projects)
      ? {
          id: unwrapRelation(scheduleOfValuesRow.projects)!.id,
          name: unwrapRelation(scheduleOfValuesRow.projects)!.name,
          status: unwrapRelation(scheduleOfValuesRow.projects)!.status
        }
      : null,
    estimate: unwrapRelation(scheduleOfValuesRow.estimates)
      ? {
          id: unwrapRelation(scheduleOfValuesRow.estimates)!.id,
          referenceNumber: unwrapRelation(scheduleOfValuesRow.estimates)!.reference_number,
          status: unwrapRelation(scheduleOfValuesRow.estimates)!.status
        }
      : null,
    items,
    scheduledValueTotal: formatMoney(scheduledValueTotal),
    previouslyBilledTotal: formatMoney(previouslyBilledTotal),
    currentBillableTotal: formatMoney(currentBillableTotal),
    completedToDateTotal: formatMoney(completedToDateTotal),
    retainageHeldCurrentTotal: formatMoney(retainageHeldCurrentTotal),
    balanceToFinishTotal: formatMoney(balanceToFinishTotal),
    weightedPercentComplete: formatPercent(weightedPercentComplete),
    status,
    progressInvoices: relatedInvoices,
    draftProgressInvoice: draftProgressInvoice
      ? {
          id: draftProgressInvoice.id,
          referenceNumber: draftProgressInvoice.reference_number,
          issueDate: draftProgressInvoice.issue_date,
          dueDate: draftProgressInvoice.due_date,
          notes: draftProgressInvoice.notes
        }
      : null
  };
}

async function listProgressBillingWorkspacesInternal(
  organizationId: string
): Promise<ProgressBillingWorkspace[]> {
  const scheduleOfValuesRows = await loadScheduleOfValuesRows(organizationId);
  const scheduleOfValuesIds = scheduleOfValuesRows.map(
    (scheduleOfValues) => scheduleOfValues.id
  );
  const [itemRows, progressInvoices] = await Promise.all([
    loadScheduleOfValueItemRows(organizationId, scheduleOfValuesIds),
    loadProgressInvoices(organizationId)
  ]);
  const progressInvoiceLineItems = await loadProgressInvoiceLineItems(
    organizationId,
    progressInvoices.map((invoice) => invoice.id)
  );

  return scheduleOfValuesRows.map((scheduleOfValuesRow) => {
    const workspaceItems = itemRows.filter(
      (item) => item.schedule_of_values_id === scheduleOfValuesRow.id
    );
    const relatedProgressInvoices = progressInvoices.filter(
      (invoice) => invoice.estimate_id === scheduleOfValuesRow.estimate_id
    );

    return deriveProgressBillingWorkspace(
      scheduleOfValuesRow,
      workspaceItems,
      relatedProgressInvoices,
      progressInvoiceLineItems
    );
  });
}

export const listProgressBillingWorkspaces = cache(
  async (): Promise<ProgressBillingWorkspace[]> => {
    const scope = await requireProgressBillingScope("/progress-billing");
    return listProgressBillingWorkspacesInternal(scope.organizationId);
  }
);

export const getProgressBillingWorkspaceById = cache(
  async (
    scheduleOfValuesId: string,
    next = "/progress-billing"
  ): Promise<ProgressBillingWorkspace | null> => {
    const scope = await requireProgressBillingScope(next);
    const workspaces = await listProgressBillingWorkspacesInternal(scope.organizationId);
    return workspaces.find((workspace) => workspace.id === scheduleOfValuesId) ?? null;
  }
);

export async function getProgressBillingByEstimateId(
  estimateId: string,
  next = "/progress-billing"
) {
  const scope = await requireProgressBillingScope(next);
  const workspaces = await listProgressBillingWorkspacesInternal(scope.organizationId);
  return workspaces.find((workspace) => workspace.estimateId === estimateId) ?? null;
}

export async function listProgressBillingByProject(
  projectId: string,
  next = "/progress-billing"
) {
  const scope = await requireProgressBillingScope(next);
  const workspaces = await listProgressBillingWorkspacesInternal(scope.organizationId);
  return workspaces.filter((workspace) => workspace.projectId === projectId);
}

export async function buildProgressBillingInvoice(
  input: BuildProgressBillingInvoiceInput
) {
  const scope = await requireProgressBillingScope(
    `/progress-billing/${input.scheduleOfValuesId}`
  );
  const workspace = await getProgressBillingWorkspaceById(
    input.scheduleOfValuesId,
    `/progress-billing/${input.scheduleOfValuesId}`
  );

  if (!workspace) {
    throw new Error("Schedule of values not found for this organization.");
  }

  await assertInvoiceCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: workspace.projectId,
    jobId: null,
    workflowRole: "standard"
  });

  const scheduleOfValueRows = await loadScheduleOfValueItemRows(scope.organizationId, [
    workspace.id
  ]);
  const scheduleOfValueRowsById = new Map(
    scheduleOfValueRows.map((row) => [row.id, row] as const)
  );

  const itemPercentById = new Map(input.items.map((item) => [item.id, item.percentComplete]));
  const nextItemRows = workspace.items.map((item) => {
    const rawPercentComplete = itemPercentById.get(item.id) ?? item.percentComplete;
    const percentComplete = parseMoney(rawPercentComplete);

    if (Number.isNaN(percentComplete) || percentComplete < 0 || percentComplete > 100) {
      throw new Error("Percent complete must stay between 0 and 100.");
    }

    const minimumPercentComplete = parseMoney(item.minimumAllowedPercentComplete);

    if (percentComplete + 0.0001 < minimumPercentComplete) {
      throw new Error(
        `${item.name} cannot be reduced below the already billed progress state.`
      );
    }

    const scheduledValueAmount = parseMoney(item.scheduledValueAmount);
    const previousBilledAmount = parseMoney(item.previousBilledAmount);
    const completedToDateAmount = roundMoney(
      scheduledValueAmount * (percentComplete / 100)
    );
    const currentToBillAmount = roundMoney(
      Math.max(0, completedToDateAmount - previousBilledAmount)
    );
    const retainagePercentage = parseMoney(item.retainagePercentage);
    const retainageHeldCurrentAmount = roundMoney(
      currentToBillAmount * (retainagePercentage / 100)
    );

    return {
      ...item,
      percentComplete: formatPercent(percentComplete),
      completedToDateAmount: formatMoney(completedToDateAmount),
      currentToBillAmount: formatMoney(currentToBillAmount),
      retainageHeldCurrentAmount: formatMoney(retainageHeldCurrentAmount),
      balanceToFinishAmount: formatMoney(
        Math.max(0, scheduledValueAmount - completedToDateAmount)
      )
    };
  });

  const supabase = await getSupabaseServerClient();

  for (const item of nextItemRows) {
    const response = await supabase
      .from("schedule_of_value_items")
      .update({
        percent_complete: item.percentComplete,
        prior_billed_amount: item.previousBilledAmount,
        current_billed_amount: item.currentToBillAmount,
        retainage_held_amount: item.retainageHeldCurrentAmount,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", item.id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(
        `Unable to update schedule-of-values item state: ${response.error.message}`
      );
    }
  }

  const billableItems = nextItemRows.filter(
    (item) => parseMoney(item.currentToBillAmount) > 0
  );

  if (billableItems.length === 0) {
    return {
      redirectTo: buildRedirect(`/progress-billing/${workspace.id}`, {
        message:
          "Progress state was updated, but no new billable amount exists beyond prior billed work."
      })
    };
  }

  let invoiceId = workspace.draftProgressInvoice?.id ?? null;

  if (invoiceId) {
    const updateResponse = await supabase
      .from("invoices")
      .update({
        issue_date: input.issueDate,
        due_date: input.dueDate,
        notes: input.notes,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", invoiceId)
      .select("id")
      .single();

    if (updateResponse.error) {
      throw new Error(
        `Unable to update the draft progress invoice: ${updateResponse.error.message}`
      );
    }
  } else {
    const insertResponse = await supabase
      .from("invoices")
      .insert({
        company_id: scope.organizationId,
        customer_id: workspace.customerId,
        project_id: workspace.projectId,
        estimate_id: workspace.estimateId,
        job_id: null,
        billing_model: "aia_progress",
        workflow_role: "standard",
        status: "draft",
        issue_date: input.issueDate,
        due_date: input.dueDate,
        discount_amount: "0.00",
        notes: input.notes,
        created_by: scope.userId,
        updated_by: scope.userId
      })
      .select("id")
      .single();

    if (insertResponse.error || !insertResponse.data?.id) {
      throw new Error(
        `Unable to create the draft progress invoice: ${insertResponse.error?.message ?? "Unknown error."}`
      );
    }

    invoiceId = insertResponse.data.id as string;
  }

  const sourceEstimateSnapshotItemsById = await loadSourceEstimateSnapshotItems(
    scope.organizationId,
    billableItems.map((item) => {
      const sourceItem = scheduleOfValueRowsById.get(item.id);
      return sourceItem?.lineage_type === "estimate_snapshot_item"
        ? sourceItem.source_estimate_snapshot_item_id ?? ""
        : "";
    }).filter(Boolean)
  );
  const sourceChangeOrderSnapshotItemsById = await loadSourceChangeOrderSnapshotItems(
    scope.organizationId,
    billableItems.map((item) => {
      const sourceItem = scheduleOfValueRowsById.get(item.id);
      return sourceItem?.lineage_type === "change_order_snapshot_item"
        ? sourceItem.change_order_snapshot_item_id ?? ""
        : "";
    }).filter(Boolean)
  );

  await replaceCanonicalInvoiceLineItems(
    scope.organizationId,
    scope.userId,
    invoiceId,
    billableItems.map((item) => {
      const sourceSovItem = scheduleOfValueRowsById.get(item.id);
      if (!sourceSovItem) {
        throw new Error("Progress billing source row is missing.");
      }

      const currentToBillAmount = parseMoney(item.currentToBillAmount);

      if (sourceSovItem.lineage_type === "estimate_snapshot_item") {
        const sourceEstimateSnapshotItem = sourceSovItem.source_estimate_snapshot_item_id
          ? sourceEstimateSnapshotItemsById.get(sourceSovItem.source_estimate_snapshot_item_id)
          : null;

        if (!sourceEstimateSnapshotItem) {
          throw new Error("Progress billing requires source estimate snapshot lineage.");
        }

        const sourceUnitPrice = parseMoney(sourceEstimateSnapshotItem.unit_price);

        if (sourceUnitPrice <= 0 && currentToBillAmount > 0) {
          throw new Error(
            `${item.name} cannot create a progress billing line because the source unit price is zero.`
          );
        }

        const billedQuantity =
          sourceUnitPrice > 0 ? Number((currentToBillAmount / sourceUnitPrice).toFixed(2)) : 0;

        return {
          estimateLineItemId: sourceEstimateSnapshotItem.estimate_line_item_id,
          lineageType: "sov_item",
          estimateSnapshotItemId: null,
          scheduleOfValueItemId: item.id,
          changeOrderSnapshotItemId: null,
          invoiceOnlyAdjustmentKind: null,
          catalogItemId: sourceEstimateSnapshotItem.catalog_item_id,
          taxCodeId: null,
          name: sourceEstimateSnapshotItem.name,
          description:
            [
              sourceEstimateSnapshotItem.description,
              `Progress billing to ${item.percentComplete}% complete.`,
              `Previously billed ${item.previousBilledAmount}.`,
              `Current billing ${item.currentToBillAmount}.`
            ]
              .filter(Boolean)
              .join(" "),
          quantity: billedQuantity.toFixed(2),
          unit: sourceEstimateSnapshotItem.unit,
          unitPrice: Number(sourceEstimateSnapshotItem.unit_price).toFixed(2),
          taxable: sourceEstimateSnapshotItem.taxable,
          baseUnitCost: Number(sourceEstimateSnapshotItem.base_unit_cost).toFixed(2),
          baseUnitPrice:
            sourceEstimateSnapshotItem.base_unit_price == null
              ? null
              : Number(sourceEstimateSnapshotItem.base_unit_price).toFixed(2),
          markupPercent: Number(sourceEstimateSnapshotItem.markup_percent).toFixed(2),
          hiddenMarkupPercent: Number(
            sourceEstimateSnapshotItem.hidden_markup_percent
          ).toFixed(2),
          unitPriceBeforeHiddenMarkup: Number(
            sourceEstimateSnapshotItem.unit_price_before_hidden_markup
          ).toFixed(2),
          visibleMarkupAmount: Number(
            sourceEstimateSnapshotItem.visible_markup_amount
          ).toFixed(2),
          hiddenMarkupAmount: Number(
            sourceEstimateSnapshotItem.hidden_markup_amount
          ).toFixed(2),
          costCode: sourceEstimateSnapshotItem.cost_code
        };
      }

      if (sourceSovItem.lineage_type === "change_order_snapshot_item") {
        const sourceChangeOrderSnapshotItem = sourceSovItem.change_order_snapshot_item_id
          ? sourceChangeOrderSnapshotItemsById.get(sourceSovItem.change_order_snapshot_item_id)
          : null;

        if (!sourceChangeOrderSnapshotItem) {
          throw new Error("Progress billing requires source change-order snapshot lineage.");
        }

        const sourceUnitPrice = parseMoney(sourceChangeOrderSnapshotItem.unit_price);

        if (sourceUnitPrice <= 0 && currentToBillAmount > 0) {
          throw new Error(
            `${item.name} cannot create a progress billing line because the source unit price is zero.`
          );
        }

        const billedQuantity =
          sourceUnitPrice > 0 ? Number((currentToBillAmount / sourceUnitPrice).toFixed(2)) : 0;

        return {
          estimateLineItemId: null,
          lineageType: "sov_item",
          estimateSnapshotItemId: null,
          scheduleOfValueItemId: item.id,
          changeOrderSnapshotItemId: null,
          invoiceOnlyAdjustmentKind: null,
          catalogItemId: sourceChangeOrderSnapshotItem.catalog_item_id,
          taxCodeId: sourceChangeOrderSnapshotItem.tax_code_id,
          name: sourceChangeOrderSnapshotItem.name,
          description:
            [
              sourceChangeOrderSnapshotItem.description,
              `Progress billing to ${item.percentComplete}% complete.`,
              `Previously billed ${item.previousBilledAmount}.`,
              `Current billing ${item.currentToBillAmount}.`
            ]
              .filter(Boolean)
              .join(" "),
          quantity: billedQuantity.toFixed(2),
          unit: sourceChangeOrderSnapshotItem.unit,
          unitPrice: Number(sourceChangeOrderSnapshotItem.unit_price).toFixed(2),
          taxable: sourceChangeOrderSnapshotItem.taxable,
          baseUnitCost: Number(sourceChangeOrderSnapshotItem.base_unit_cost).toFixed(2),
          baseUnitPrice:
            sourceChangeOrderSnapshotItem.base_unit_price == null
              ? null
              : Number(sourceChangeOrderSnapshotItem.base_unit_price).toFixed(2),
          markupPercent: Number(sourceChangeOrderSnapshotItem.markup_percent).toFixed(2),
          hiddenMarkupPercent: Number(
            sourceChangeOrderSnapshotItem.hidden_markup_percent
          ).toFixed(2),
          unitPriceBeforeHiddenMarkup: Number(
            sourceChangeOrderSnapshotItem.unit_price_before_hidden_markup
          ).toFixed(2),
          visibleMarkupAmount: Number(
            sourceChangeOrderSnapshotItem.visible_markup_amount
          ).toFixed(2),
          hiddenMarkupAmount: Number(
            sourceChangeOrderSnapshotItem.hidden_markup_amount
          ).toFixed(2),
          costCode: sourceChangeOrderSnapshotItem.cost_code
        };
      }

      throw new Error("Progress billing requires explicit SOV lineage.");
    })
  );

  return {
    redirectTo: buildRedirect(`/invoices/${invoiceId}`, {
      message: "Draft progress invoice was built from the canonical schedule of values."
    })
  };
}
