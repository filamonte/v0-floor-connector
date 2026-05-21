import "server-only";

import { cache } from "react";
import {
  canTransitionChangeOrderStatus,
  compareChangeOrderStatuses
} from "@floorconnector/domain";
import type { ChangeOrderStatus } from "@floorconnector/types";

import type {
  ChangeOrderInput,
  ChangeOrderPortalDecisionInput,
  ChangeOrderQuickCreateInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { recordChangeOrderNotificationEvent } from "@/lib/notifications/system";
import {
  listPortalAccessGrantsForCurrentUser,
  resolvePortalScopedPermissionForCurrentUser
} from "@/lib/portal-access/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getProjectById, listProjects } from "@/lib/projects/data";
import { createRecordRevision, ensureInitialRecordRevision } from "@/lib/revisions/data";
import { buildChangeOrderRevisionSnapshot } from "@/lib/revisions/snapshots";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { appendChangeOrderSnapshotItemsToScheduleOfValues } from "@/lib/financial/sov";
import {
  appendChangeOrderSnapshotItemsToInvoice,
  createInvoice,
  getInvoiceById
} from "@/lib/invoices/data";

type ChangeOrderRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  contract_id: string | null;
  invoice_id: string | null;
  applied_invoice_line_item_id: string | null;
  reference_number: string;
  status: ChangeOrderStatus;
  title: string;
  description: string | null;
  scope_change_notes: string | null;
  price_adjustment: string | number;
  decision_note: string | null;
  sent_at: string | null;
  customer_viewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_by: string | null;
  updated_by: string | null;
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
  contracts?:
    | {
        id: string;
        title: string;
        status: string;
      }
    | Array<{
        id: string;
        title: string;
        status: string;
      }>
    | null;
  invoices?:
    | {
        id: string;
        reference_number: string;
        status: string;
        balance_due_amount: string | number;
      }
    | Array<{
        id: string;
        reference_number: string;
        status: string;
        balance_due_amount: string | number;
      }>
    | null;
};

type ChangeOrderRecord = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  contractId: string | null;
  invoiceId: string | null;
  appliedInvoiceLineItemId: string | null;
  referenceNumber: string;
  status: ChangeOrderStatus;
  title: string;
  description: string | null;
  scopeChangeNotes: string | null;
  priceAdjustment: string;
  decisionNote: string | null;
  sentAt: string | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  customer:
    | {
        id: string;
        name: string;
        companyName: string | null;
      }
    | null;
  project:
    | {
        id: string;
        name: string;
        status: string;
      }
    | null;
  contract:
    | {
        id: string;
        title: string;
        status: string;
      }
    | null;
  invoice:
    | {
        id: string;
        referenceNumber: string;
        status: string;
        balanceDueAmount: string;
      }
    | null;
  latestCommercialSnapshotId: string | null;
  latestCommercialSnapshotCreatedAt: string | null;
  latestCommercialSnapshotItemIds: string[];
};

type ChangeOrderListItem = ChangeOrderRecord;

type ChangeOrderPortalScope = {
  userId: string;
  changeOrder: ChangeOrderRow;
};

const changeOrderSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  contract_id,
  invoice_id,
  applied_invoice_line_item_id,
  reference_number,
  status,
  title,
  description,
  scope_change_notes,
  price_adjustment,
  decision_note,
  sent_at,
  customer_viewed_at,
  approved_at,
  rejected_at,
  created_by,
  updated_by,
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
  contracts (
    id,
    title,
    status
  ),
  invoices (
    id,
    reference_number,
    status,
    balance_due_amount
  )
`;

type ChangeOrderCommercialSnapshotRow = {
  id: string;
  change_order_id: string;
  created_at: string;
  snapshot_version: number;
};

type ChangeOrderCommercialSnapshotItemRow = {
  id: string;
  change_order_commercial_snapshot_id: string;
};

function formatMoney(value: string | number) {
  return Number(value).toFixed(2);
}

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapChangeOrder(row: ChangeOrderRow): ChangeOrderRecord {
  const customer = getSingleRelation(row.customers);
  const project = getSingleRelation(row.projects);
  const contract = getSingleRelation(row.contracts);
  const invoice = getSingleRelation(row.invoices);

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    contractId: row.contract_id,
    invoiceId: row.invoice_id,
    appliedInvoiceLineItemId: row.applied_invoice_line_item_id,
    referenceNumber: row.reference_number,
    status: row.status,
    title: row.title,
    description: row.description,
    scopeChangeNotes: row.scope_change_notes,
    priceAdjustment: formatMoney(row.price_adjustment),
    decisionNote: row.decision_note,
    sentAt: row.sent_at,
    customerViewedAt: row.customer_viewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          companyName: customer.company_name
        }
      : null,
    project: project
      ? {
          id: project.id,
          name: project.name,
          status: project.status
        }
      : null,
    contract: contract
      ? {
          id: contract.id,
          title: contract.title,
          status: contract.status
        }
      : null,
    invoice: invoice
      ? {
          id: invoice.id,
          referenceNumber: invoice.reference_number,
          status: invoice.status,
          balanceDueAmount: formatMoney(invoice.balance_due_amount)
        }
      : null,
    latestCommercialSnapshotId: null,
    latestCommercialSnapshotCreatedAt: null,
    latestCommercialSnapshotItemIds: []
  };
}

async function attachLatestCommercialSnapshot(changeOrder: ChangeOrderRecord) {
  const supabase = await getSupabaseServerClient();
  const snapshotResponse = await supabase
    .from("change_order_commercial_snapshots")
    .select("id, change_order_id, created_at, snapshot_version")
    .eq("company_id", changeOrder.organizationId)
    .eq("change_order_id", changeOrder.id)
    .order("snapshot_version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotResponse.error) {
    throw new Error(
      `Unable to load the latest change-order commercial snapshot: ${snapshotResponse.error.message}`
    );
  }

  const snapshot = snapshotResponse.data as ChangeOrderCommercialSnapshotRow | null;

  if (!snapshot?.id) {
    return changeOrder;
  }

  const snapshotItemsResponse = await supabase
    .from("change_order_commercial_snapshot_items")
    .select("id, change_order_commercial_snapshot_id")
    .eq("company_id", changeOrder.organizationId)
    .eq("change_order_commercial_snapshot_id", snapshot.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (snapshotItemsResponse.error) {
    throw new Error(
      `Unable to load the latest change-order snapshot items: ${snapshotItemsResponse.error.message}`
    );
  }

  const snapshotItems =
    (snapshotItemsResponse.data as ChangeOrderCommercialSnapshotItemRow[] | null) ?? [];

  return {
    ...changeOrder,
    latestCommercialSnapshotId: snapshot.id,
    latestCommercialSnapshotCreatedAt: snapshot.created_at,
    latestCommercialSnapshotItemIds: snapshotItems.map((item) => item.id)
  };
}

async function requireChangeOrderScope(next: string) {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("An active organization is required for change order workflow.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

async function createChangeOrderRecordRevision(input: {
  changeOrderId: string;
  revisionKind: Parameters<typeof createRecordRevision>[0]["revisionKind"];
  revisionReason: string;
  createdByUserId: string | null;
  ensureInitial?: boolean;
  next?: string;
}) {
  const changeOrder = await getChangeOrderById(
    input.changeOrderId,
    input.next ?? `/change-orders/${input.changeOrderId}`
  );

  if (!changeOrder) {
    return null;
  }

  const payload = {
    organizationId: changeOrder.organizationId,
    subjectType: "change_order" as const,
    subjectId: changeOrder.id,
    revisionKind: input.revisionKind,
    revisionReason: input.revisionReason,
    snapshot: buildChangeOrderRevisionSnapshot(changeOrder),
    createdByUserId: input.createdByUserId
  };

  return input.ensureInitial ? ensureInitialRecordRevision(payload) : createRecordRevision(payload);
}

async function getChangeOrderRecordByIdInCurrentScope(changeOrderId: string, next?: string) {
  const scope = await requireChangeOrderScope(next ?? `/change-orders/${changeOrderId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select(changeOrderSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", changeOrderId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load change order: ${response.error.message}`);
  }

  const row = response.data as ChangeOrderRow | null;
  return row;
}

async function resolveLinkedRecordScope(input: {
  organizationId: string;
  projectId: string;
  contractId: string | null;
  invoiceId: string | null;
}) {
  const supabase = await getSupabaseServerClient();
  const [project, contractResponse, invoiceResponse] = await Promise.all([
    getProjectById(input.projectId, `/change-orders?projectId=${input.projectId}`),
    input.contractId
      ? supabase
          .from("contracts")
          .select("id, project_id")
          .eq("company_id", input.organizationId)
          .eq("id", input.contractId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    input.invoiceId
      ? supabase
          .from("invoices")
          .select("id, project_id, status")
          .eq("company_id", input.organizationId)
          .eq("id", input.invoiceId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  if (!project) {
    throw new Error("Project not found for this organization.");
  }

  if (input.contractId) {
    if (contractResponse.error) {
      throw new Error(`Unable to validate linked contract: ${contractResponse.error.message}`);
    }

    const contract = contractResponse.data as { id?: string; project_id?: string } | null;

    if (!contract?.id || contract.project_id !== project.id) {
      throw new Error("Linked contract must belong to the same project.");
    }
  }

  if (input.invoiceId) {
    if (invoiceResponse.error) {
      throw new Error(`Unable to validate linked invoice: ${invoiceResponse.error.message}`);
    }

    const invoice = invoiceResponse.data as
      | { id?: string; project_id?: string; status?: string }
      | null;

    if (!invoice?.id || invoice.project_id !== project.id) {
      throw new Error("Linked invoice must belong to the same project.");
    }
  }

  return project;
}

function maybeApplyApprovedChangeOrderToInvoice(changeOrder: ChangeOrderRow) {
  if (!changeOrder.invoice_id || changeOrder.applied_invoice_line_item_id) {
    return;
  }

  const priceAdjustment = Number(changeOrder.price_adjustment);

  if (!(priceAdjustment > 0)) {
    return;
  }

  throw new Error("Change order cannot create invoice rows without estimate lineage");
}

async function recordPortalChangeOrderView(changeOrder: ChangeOrderRow, next: string) {
  const user = await requireAuthenticatedUser(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase.from("portal_record_views").insert({
    company_id: changeOrder.company_id,
    portal_user_id: user.id,
    customer_id: changeOrder.customer_id,
    project_id: changeOrder.project_id,
    subject_type: "change_order",
    subject_id: changeOrder.id
  });

  if (response.error) {
    throw new Error(`Unable to record the portal change-order view: ${response.error.message}`);
  }
}

async function getScopedPortalChangeOrder(changeOrderId: string, next: string): Promise<ChangeOrderPortalScope> {
  const user = await requireAuthenticatedUser(next);
  const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
    (grant) => grant.status === "active"
  );

  if (activeGrants.length === 0) {
    throw new Error("No active portal access is available for this change order.");
  }

  const accessibleCustomerIds = new Set(activeGrants.map((grant) => grant.customerId));
  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate portal project scope: ${projectAccessResponse.error.message}`
    );
  }

  const accessibleProjectIds = new Set(
    ((projectAccessResponse.data as Array<{ project_id?: string }> | null) ?? [])
      .map((row) => row.project_id)
      .filter((value): value is string => typeof value === "string")
  );

  const response = await supabase
    .from("change_orders")
    .select(changeOrderSelect)
    .eq("id", changeOrderId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load the portal change order: ${response.error.message}`);
  }

  const changeOrder = response.data as ChangeOrderRow | null;

  if (!changeOrder) {
    throw new Error("Change order not found for this portal user.");
  }

  if (
    !accessibleCustomerIds.has(changeOrder.customer_id) ||
    !accessibleProjectIds.has(changeOrder.project_id)
  ) {
    throw new Error("This change order is not available in the current portal scope.");
  }

  return {
    userId: user.id,
    changeOrder
  };
}

export const listChangeOrders = cache(async (): Promise<ChangeOrderListItem[]> => {
  const scope = await requireChangeOrderScope("/change-orders");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select(changeOrderSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load change orders: ${response.error.message}`);
  }

  return ((response.data as ChangeOrderRow[] | null) ?? []).map(mapChangeOrder);
});

export async function listProjectChangeOrders(
  projectId: string,
  next = `/projects/${projectId}`
): Promise<ChangeOrderListItem[]> {
  const scope = await requireChangeOrderScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select(changeOrderSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load project change orders: ${response.error.message}`);
  }

  return ((response.data as ChangeOrderRow[] | null) ?? []).map(mapChangeOrder);
}

export async function listInvoiceChangeOrders(
  invoiceId: string,
  next = `/invoices/${invoiceId}`
): Promise<ChangeOrderListItem[]> {
  const scope = await requireChangeOrderScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select(changeOrderSelect)
    .eq("company_id", scope.organizationId)
    .eq("invoice_id", invoiceId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load invoice change orders: ${response.error.message}`);
  }

  return ((response.data as ChangeOrderRow[] | null) ?? []).map(mapChangeOrder);
}

export async function getChangeOrderById(changeOrderId: string, next: string) {
  const row = await getChangeOrderRecordByIdInCurrentScope(changeOrderId, next);
  return row ? attachLatestCommercialSnapshot(mapChangeOrder(row)) : null;
}

export async function invoiceApprovedChangeOrderDirectly(changeOrderId: string) {
  const scope = await requireChangeOrderScope(`/change-orders/${changeOrderId}`);
  const changeOrder = await getChangeOrderById(changeOrderId, `/change-orders/${changeOrderId}`);

  if (!changeOrder) {
    throw new Error("Change order not found for this organization.");
  }

  if (changeOrder.status !== "approved") {
    throw new Error("Only approved change orders can be billed from commercial snapshots.");
  }

  if (!changeOrder.latestCommercialSnapshotId || changeOrder.latestCommercialSnapshotItemIds.length === 0) {
    throw new Error(
      "Approved change-order snapshot data is missing. Re-approve the change order before billing it."
    );
  }

  let invoiceId = changeOrder.invoiceId;
  let targetInvoice = invoiceId ? await getInvoiceById(invoiceId, `/change-orders/${changeOrderId}`) : null;

  if (targetInvoice && targetInvoice.billingModel === "aia_progress") {
    throw new Error(
      "Progress-billed invoices must stay on the SOV chain. Link this change order to a draft standard invoice to bill it directly."
    );
  }

  if (targetInvoice && targetInvoice.status !== "draft") {
    throw new Error(
      "Only draft invoices can accept direct approved change-order billing."
    );
  }

  if (!targetInvoice) {
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const createdInvoice = await createInvoice(
      {
        projectId: changeOrder.projectId,
        estimateId: null,
        jobId: null,
        workflowRole: "standard",
        status: "draft",
        issueDate: issueDate.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        discountAmount: "0.00",
        notes: `Approved change order ${changeOrder.referenceNumber}`,
        sourceConfiguration: null
      },
      { sourceContext: "change_order" }
    );

    invoiceId = createdInvoice.id;
    targetInvoice = await getInvoiceById(createdInvoice.id, `/change-orders/${changeOrderId}`);
  }

  if (!invoiceId || !targetInvoice) {
    throw new Error("The target invoice could not be prepared for direct change-order billing.");
  }

  const appliedLineItems = await appendChangeOrderSnapshotItemsToInvoice({
    organizationId: scope.organizationId,
    userId: scope.userId,
    invoiceId,
    changeOrderSnapshotItemIds: changeOrder.latestCommercialSnapshotItemIds
  });

  const appliedInvoiceLineItemId =
    appliedLineItems.length === 1 ? appliedLineItems[0]?.id ?? null : null;

  const supabase = await getSupabaseServerClient();
  const updateResponse = await supabase
    .from("change_orders")
    .update({
      invoice_id: invoiceId,
      applied_invoice_line_item_id: appliedInvoiceLineItemId,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", changeOrder.id)
    .select(changeOrderSelect)
    .maybeSingle();

  if (updateResponse.error || !updateResponse.data) {
    throw new Error(
      `Unable to save the approved change-order invoice linkage: ${updateResponse.error?.message ?? "Update failed."}`
    );
  }

  return attachLatestCommercialSnapshot(mapChangeOrder(updateResponse.data as ChangeOrderRow));
}

export async function addApprovedChangeOrderToScheduleOfValues(input: {
  changeOrderId: string;
  scheduleOfValuesId?: string | null;
}) {
  const scope = await requireChangeOrderScope(`/change-orders/${input.changeOrderId}`);
  const changeOrder = await getChangeOrderById(
    input.changeOrderId,
    `/change-orders/${input.changeOrderId}`
  );

  if (!changeOrder) {
    throw new Error("Change order not found for this organization.");
  }

  if (changeOrder.status !== "approved") {
    throw new Error("Only approved change orders can be added to the schedule of values.");
  }

  if (!changeOrder.latestCommercialSnapshotId || changeOrder.latestCommercialSnapshotItemIds.length === 0) {
    throw new Error(
      "Approved change-order snapshot data is missing. Re-approve the change order before adding it to the schedule of values."
    );
  }

  if (!(Number(changeOrder.priceAdjustment) > 0)) {
    throw new Error(
      "Negative or zero-value change orders cannot be added to the schedule of values. Invoice them directly instead."
    );
  }

  const scheduleOfValuesId = await appendChangeOrderSnapshotItemsToScheduleOfValues({
    changeOrderId: changeOrder.id,
    scheduleOfValuesId: input.scheduleOfValuesId ?? null,
    actingUserId: scope.userId
  });

  if (!scheduleOfValuesId) {
    throw new Error("The target schedule of values could not be resolved.");
  }

  return {
    changeOrder,
    scheduleOfValuesId
  };
}

export async function createChangeOrder(input: ChangeOrderQuickCreateInput) {
  const scope = await requireChangeOrderScope("/change-orders");
  const project = await resolveLinkedRecordScope({
    organizationId: scope.organizationId,
    projectId: input.projectId,
    contractId: input.contractId,
    invoiceId: input.invoiceId
  });
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .insert({
      company_id: scope.organizationId,
      customer_id: project.customerId,
      project_id: project.id,
      contract_id: input.contractId,
      invoice_id: input.invoiceId,
      title: input.title,
      price_adjustment: input.priceAdjustment,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(changeOrderSelect)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to create the change order: ${response.error?.message ?? "Insert failed."}`
    );
  }

  const changeOrder = await attachLatestCommercialSnapshot(
    mapChangeOrder(response.data as ChangeOrderRow)
  );

  await createChangeOrderRecordRevision({
    changeOrderId: changeOrder.id,
    revisionKind: "created",
    revisionReason: "Change order created.",
    createdByUserId: scope.userId,
    ensureInitial: true,
    next: `/change-orders/${changeOrder.id}`
  });

  return changeOrder;
}

export async function updateChangeOrder(changeOrderId: string, input: ChangeOrderInput) {
  const scope = await requireChangeOrderScope(`/change-orders/${changeOrderId}`);
  const existing = await getChangeOrderRecordByIdInCurrentScope(changeOrderId);

  if (!existing) {
    throw new Error("Change order not found for this organization.");
  }

  if (compareChangeOrderStatuses(existing.status, "sent") >= 0) {
    throw new Error("Sent or decided change orders can no longer be edited as draft scope.");
  }

  const project = await resolveLinkedRecordScope({
    organizationId: scope.organizationId,
    projectId: input.projectId,
    contractId: input.contractId,
    invoiceId: input.invoiceId
  });
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .update({
      customer_id: project.customerId,
      project_id: project.id,
      contract_id: input.contractId,
      invoice_id: input.invoiceId,
      title: input.title,
      description: input.description,
      scope_change_notes: input.scopeChangeNotes,
      price_adjustment: input.priceAdjustment,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", changeOrderId)
    .select(changeOrderSelect)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to update the change order: ${response.error?.message ?? "Update failed."}`
    );
  }

  const changeOrder = await attachLatestCommercialSnapshot(
    mapChangeOrder(response.data as ChangeOrderRow)
  );

  await createChangeOrderRecordRevision({
    changeOrderId: changeOrder.id,
    revisionKind: "edited",
    revisionReason: "Change order draft updated.",
    createdByUserId: scope.userId,
    next: `/change-orders/${changeOrder.id}`
  });

  return changeOrder;
}

export async function updateChangeOrderStatus(
  changeOrderId: string,
  nextStatus: ChangeOrderStatus
) {
  const scope = await requireChangeOrderScope(`/change-orders/${changeOrderId}`);
  const existing = await getChangeOrderRecordByIdInCurrentScope(changeOrderId);

  if (!existing) {
    throw new Error("Change order not found for this organization.");
  }

  if (!canTransitionChangeOrderStatus(existing.status, nextStatus)) {
    throw new Error(
      `Change order cannot move from ${existing.status} to ${nextStatus}.`
    );
  }

  const updatePayload: Record<string, string | null> = {
    status: nextStatus,
    updated_by: scope.userId
  };

  if (nextStatus === "draft") {
    updatePayload.sent_at = null;
    updatePayload.customer_viewed_at = null;
    updatePayload.approved_at = null;
    updatePayload.rejected_at = null;
    updatePayload.decision_note = null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .update(updatePayload)
    .eq("company_id", scope.organizationId)
    .eq("id", changeOrderId)
    .select(changeOrderSelect)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to update the change order status: ${response.error?.message ?? "Update failed."}`
    );
  }

  const row = response.data as ChangeOrderRow;

  if (nextStatus === "approved") {
    maybeApplyApprovedChangeOrderToInvoice(row);
  }

  if (nextStatus === "sent" || nextStatus === "approved" || nextStatus === "rejected") {
    await recordChangeOrderNotificationEvent({
      organizationId: row.company_id,
      changeOrderId: row.id,
      customerId: row.customer_id,
      projectId: row.project_id,
      changeOrderReferenceNumber: row.reference_number,
      eventType: nextStatus,
      actorType: "organization_user",
      actorUserId: scope.userId,
      occurredAt: row.updated_at
    });
  }

  const refreshed = await getChangeOrderRecordByIdInCurrentScope(changeOrderId);

  if (!refreshed) {
    throw new Error("Change order could not be reloaded after status update.");
  }

  const changeOrder = await attachLatestCommercialSnapshot(mapChangeOrder(refreshed));

  await createChangeOrderRecordRevision({
    changeOrderId,
    revisionKind: nextStatus === "sent" ? "sent" : "status_change",
    revisionReason: `Change order marked ${nextStatus}.`,
    createdByUserId: scope.userId,
    next: `/change-orders/${changeOrderId}`
  });

  return changeOrder;
}

export async function recordPortalViewedChangeOrder(changeOrderId: string, next = "/portal") {
  const scope = await getScopedPortalChangeOrder(changeOrderId, next);
  const admin = getSupabaseAdminClient();

  if (!scope.changeOrder.customer_viewed_at) {
    const nowIso = new Date().toISOString();
    const response = await admin
      .from("change_orders")
      .update({
        customer_viewed_at: nowIso
      })
      .eq("company_id", scope.changeOrder.company_id)
      .eq("id", scope.changeOrder.id);

    if (response.error) {
      throw new Error(`Unable to record the portal review: ${response.error.message}`);
    }

    await recordChangeOrderNotificationEvent({
      organizationId: scope.changeOrder.company_id,
      changeOrderId: scope.changeOrder.id,
      customerId: scope.changeOrder.customer_id,
      projectId: scope.changeOrder.project_id,
      changeOrderReferenceNumber: scope.changeOrder.reference_number,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso
    });
  }

  const refreshed = await getScopedPortalChangeOrder(changeOrderId, next);
  return mapChangeOrder(refreshed.changeOrder);
}

export async function approveChangeOrderFromPortal(
  input: ChangeOrderPortalDecisionInput,
  next = "/portal"
) {
  const scope = await getScopedPortalChangeOrder(input.changeOrderId, next);
  const permission = await resolvePortalScopedPermissionForCurrentUser({
    customerId: scope.changeOrder.customer_id,
    projectId: scope.changeOrder.project_id,
    permission: "canApproveChangeOrders",
    next
  });

  if (!permission.allowed) {
    throw new Error(
      "This contact does not currently have permission to approve or reject this change order."
    );
  }

  if (scope.changeOrder.status !== "sent") {
    throw new Error("Only sent change orders can be approved from the portal.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("change_orders")
    .update({
      status: "approved",
      customer_viewed_at: scope.changeOrder.customer_viewed_at ?? nowIso,
      approved_at: nowIso,
      decision_note: input.decisionNote,
      updated_by: scope.userId
    })
    .eq("company_id", scope.changeOrder.company_id)
    .eq("id", scope.changeOrder.id)
    .select(changeOrderSelect)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to approve the change order: ${response.error?.message ?? "Update failed."}`
    );
  }

  await recordPortalChangeOrderView(response.data as ChangeOrderRow, next);
  maybeApplyApprovedChangeOrderToInvoice(response.data as ChangeOrderRow);
  await recordChangeOrderNotificationEvent({
    organizationId: scope.changeOrder.company_id,
    changeOrderId: scope.changeOrder.id,
    customerId: scope.changeOrder.customer_id,
    projectId: scope.changeOrder.project_id,
    changeOrderReferenceNumber: scope.changeOrder.reference_number,
    eventType: "approved",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso,
    payload: {
      decisionNote: input.decisionNote ?? null
    }
  });

  const refreshed = await getScopedPortalChangeOrder(input.changeOrderId, next);
  return mapChangeOrder(refreshed.changeOrder);
}

export async function rejectChangeOrderFromPortal(
  input: ChangeOrderPortalDecisionInput,
  next = "/portal"
) {
  const scope = await getScopedPortalChangeOrder(input.changeOrderId, next);
  const permission = await resolvePortalScopedPermissionForCurrentUser({
    customerId: scope.changeOrder.customer_id,
    projectId: scope.changeOrder.project_id,
    permission: "canApproveChangeOrders",
    next
  });

  if (!permission.allowed) {
    throw new Error(
      "This contact does not currently have permission to approve or reject this change order."
    );
  }

  if (scope.changeOrder.status !== "sent") {
    throw new Error("Only sent change orders can be rejected from the portal.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("change_orders")
    .update({
      status: "rejected",
      customer_viewed_at: scope.changeOrder.customer_viewed_at ?? nowIso,
      rejected_at: nowIso,
      decision_note: input.decisionNote,
      updated_by: scope.userId
    })
    .eq("company_id", scope.changeOrder.company_id)
    .eq("id", scope.changeOrder.id)
    .select(changeOrderSelect)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to reject the change order: ${response.error?.message ?? "Update failed."}`
    );
  }

  await recordPortalChangeOrderView(response.data as ChangeOrderRow, next);
  await recordChangeOrderNotificationEvent({
    organizationId: scope.changeOrder.company_id,
    changeOrderId: scope.changeOrder.id,
    customerId: scope.changeOrder.customer_id,
    projectId: scope.changeOrder.project_id,
    changeOrderReferenceNumber: scope.changeOrder.reference_number,
    eventType: "rejected",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso,
    payload: {
      decisionNote: input.decisionNote ?? null
    }
  });

  const refreshed = await getScopedPortalChangeOrder(input.changeOrderId, next);
  return mapChangeOrder(refreshed.changeOrder);
}

export const listProjectOptionsForChangeOrders = cache(async () => {
  const projects = await listProjects();
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));
});
