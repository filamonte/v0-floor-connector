import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canTransitionPaymentStatus,
  compareInvoiceStatuses,
  computeInvoicePaymentWorkflowGate
} from "@floorconnector/domain";
import type { PaymentGatewayWebhookEvent } from "@floorconnector/integrations";
import type {
  Invoice as InvoiceRecord,
  InvoiceLineItem,
  InvoiceWorkflowRole,
  InvoiceStatus,
  Payment,
  PaymentEvent,
  PaymentEventActorType,
  PaymentEventType,
  PaymentRecordedVia,
  PaymentSource,
  PaymentStatus,
  TaxBehavior
} from "@floorconnector/types";

import type {
  InvoiceCheckoutStartInput,
  InvoiceCustomerPaymentRequestInput,
  InvoicePaymentFailureInput,
  InvoiceInput,
  InvoicePaymentInput,
  InvoicePaymentSuccessInput,
  InvoicePaymentVoidInput,
  InvoiceSourceConfiguration
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { buildCatalogItemPricingSnapshot } from "@/lib/catalogs/pricing";
import { getEstimateById } from "@/lib/estimates/data";
import { ensureScheduleOfValuesForEstimate } from "@/lib/financial/sov";
import { getJobById } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";
import { recordInvoiceNotificationEvent } from "@/lib/notifications/system";
import { getProjectById } from "@/lib/projects/data";
import {
  assertInvoiceCommercialReadiness,
  syncProjectCommercialReadiness
} from "@/lib/projects/readiness";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type InvoiceRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  job_id: string | null;
  template_id: string | null;
  reference_number: string;
  billing_model: string;
  workflow_role: InvoiceWorkflowRole;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  tax_rate_applied: string | number;
  tax_behavior_applied: TaxBehavior;
  customer_tax_exempt_snapshot: boolean;
  subtotal_amount: string | number;
  taxable_sales_amount: string | number;
  exempt_sales_amount: string | number;
  tax_amount: string | number;
  tax_collected_amount: string | number;
  discount_amount: string | number;
  retainage_percentage: string | number;
  retainage_held_amount: string | number;
  total_amount: string | number;
  balance_due_amount: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        phone: string | null;
        email: string | null;
        is_tax_exempt: boolean;
        retainage_percentage_default: string | number;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
        status: string;
      }
    | null;
  estimates?:
    | {
        id: string;
        reference_number: string;
        status: string;
      }
    | null;
  jobs?:
    | {
        id: string;
        dispatch_status: string;
      }
    | null;
};

type InvoiceLineItemRow = {
  id: string;
  company_id: string;
  invoice_id: string;
  estimate_line_item_id: string | null;
  lineage_type:
    | "estimate_snapshot_item"
    | "sov_item"
    | "change_order_snapshot_item"
    | "invoice_only_adjustment"
    | null;
  estimate_snapshot_item_id: string | null;
  schedule_of_value_item_id: string | null;
  change_order_snapshot_item_id: string | null;
  invoice_only_adjustment_kind: "manual_catalog_item" | "explicit_adjustment" | null;
  catalog_item_id: string | null;
  tax_code_id: string | null;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  taxable: boolean;
  base_unit_cost: string | number | null;
  base_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  unit_price_before_hidden_markup: string | number;
  visible_markup_amount: string | number;
  hidden_markup_amount: string | number;
  unit_price: string | number;
  tax_rate_snapshot: string | number;
  discount_amount: string | number;
  line_subtotal: string | number;
  tax_amount: string | number;
  cost_code: string | null;
  line_total: string | number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  company_id: string;
  invoice_id: string;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  payment_source: PaymentSource;
  recorded_via: PaymentRecordedVia;
  gateway_provider: string | null;
  gateway_payment_intent_reference: string | null;
  gateway_checkout_session_reference: string | null;
  gateway_status: string | null;
  payment_method_summary: string | null;
  payer_user_id: string | null;
  payer_email: string | null;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

type PaymentEventRow = {
  id: string;
  company_id: string;
  invoice_id: string;
  payment_id: string | null;
  event_type: PaymentEventType;
  actor_type: PaymentEventActorType;
  actor_user_id: string | null;
  portal_user_id: string | null;
  gateway_provider: string | null;
  provider_event_id: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type InvoiceScope = {
  userId: string;
  organizationId: string;
};

type PortalInvoiceScope = {
  userId: string;
  invoice: InvoiceRow;
};

type PaymentEventInsert = {
  paymentId?: string | null;
  eventType: PaymentEventType;
  actorType: PaymentEventActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  gatewayProvider?: string | null;
  providerEventId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
};

export type InvoiceListItem = InvoiceRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    isTaxExempt: boolean;
    retainagePercentageDefault: string;
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
  job: {
    id: string;
    dispatchStatus: string;
  } | null;
};

export type InvoiceDetail = InvoiceListItem & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
    isTaxExempt: boolean;
    retainagePercentageDefault: string;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  paymentEvents: PaymentEvent[];
  paidAmount: string;
};

export type InvoiceSourceOptions = {
  scheduleOfValueItems: Array<{
    id: string;
    scheduleOfValuesId: string;
    estimateId: string;
    projectId: string;
    name: string;
    description: string | null;
    scheduledValueAmount: string;
  }>;
  changeOrderSnapshotItems: Array<{
    id: string;
    changeOrderId: string;
    projectId: string;
    invoiceId: string | null;
    name: string;
    description: string | null;
    lineTotal: string;
  }>;
};

type IdRow = {
  id: string;
};

const invoiceSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  job_id,
  template_id,
  reference_number,
  billing_model,
  workflow_role,
  status,
  issue_date,
  due_date,
  tax_rate_applied,
  tax_behavior_applied,
  customer_tax_exempt_snapshot,
  subtotal_amount,
  taxable_sales_amount,
  exempt_sales_amount,
  tax_amount,
  tax_collected_amount,
  discount_amount,
  retainage_percentage,
  retainage_held_amount,
  total_amount,
  balance_due_amount,
  notes,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    phone,
    email,
    is_tax_exempt,
    retainage_percentage_default
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
  ),
  jobs (
    id,
    dispatch_status
  )
`;

function isInvoiceRow(value: unknown): value is InvoiceRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<InvoiceRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    (row.estimate_id === null || typeof row.estimate_id === "string") &&
    (row.job_id === null || typeof row.job_id === "string") &&
    (row.template_id === null || typeof row.template_id === "string") &&
    typeof row.reference_number === "string" &&
    typeof row.billing_model === "string" &&
    typeof row.workflow_role === "string" &&
    typeof row.status === "string" &&
    typeof row.issue_date === "string" &&
    (row.due_date === null || typeof row.due_date === "string") &&
    (typeof row.tax_rate_applied === "string" || typeof row.tax_rate_applied === "number") &&
    typeof row.tax_behavior_applied === "string" &&
    typeof row.customer_tax_exempt_snapshot === "boolean" &&
    (typeof row.subtotal_amount === "string" || typeof row.subtotal_amount === "number") &&
    (typeof row.taxable_sales_amount === "string" || typeof row.taxable_sales_amount === "number") &&
    (typeof row.exempt_sales_amount === "string" || typeof row.exempt_sales_amount === "number") &&
    (typeof row.tax_amount === "string" || typeof row.tax_amount === "number") &&
    (typeof row.tax_collected_amount === "string" || typeof row.tax_collected_amount === "number") &&
    (typeof row.discount_amount === "string" || typeof row.discount_amount === "number") &&
    (typeof row.retainage_percentage === "string" || typeof row.retainage_percentage === "number") &&
    (typeof row.retainage_held_amount === "string" || typeof row.retainage_held_amount === "number") &&
    (typeof row.total_amount === "string" || typeof row.total_amount === "number") &&
    (typeof row.balance_due_amount === "string" || typeof row.balance_due_amount === "number") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isInvoiceRowArray(value: unknown): value is InvoiceRow[] {
  return Array.isArray(value) && value.every((row) => isInvoiceRow(row));
}

function isInvoiceLineItemRow(value: unknown): value is InvoiceLineItemRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<InvoiceLineItemRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.invoice_id === "string" &&
    (row.estimate_line_item_id === null || typeof row.estimate_line_item_id === "string") &&
    (row.lineage_type === null || typeof row.lineage_type === "string") &&
    (row.estimate_snapshot_item_id === null ||
      typeof row.estimate_snapshot_item_id === "string") &&
    (row.schedule_of_value_item_id === null ||
      typeof row.schedule_of_value_item_id === "string") &&
    (row.change_order_snapshot_item_id === null ||
      typeof row.change_order_snapshot_item_id === "string") &&
    (row.invoice_only_adjustment_kind === null ||
      typeof row.invoice_only_adjustment_kind === "string") &&
    (row.catalog_item_id === null || typeof row.catalog_item_id === "string") &&
    (row.tax_code_id === null || typeof row.tax_code_id === "string") &&
    typeof row.name === "string" &&
    (typeof row.quantity === "string" || typeof row.quantity === "number") &&
    typeof row.unit === "string" &&
    typeof row.taxable === "boolean" &&
    (row.base_unit_cost === null ||
      typeof row.base_unit_cost === "string" ||
      typeof row.base_unit_cost === "number") &&
    (row.base_unit_price === null ||
      typeof row.base_unit_price === "string" ||
      typeof row.base_unit_price === "number") &&
    (typeof row.markup_percent === "string" || typeof row.markup_percent === "number") &&
    (typeof row.hidden_markup_percent === "string" ||
      typeof row.hidden_markup_percent === "number") &&
    (typeof row.unit_price_before_hidden_markup === "string" ||
      typeof row.unit_price_before_hidden_markup === "number") &&
    (typeof row.visible_markup_amount === "string" ||
      typeof row.visible_markup_amount === "number") &&
    (typeof row.hidden_markup_amount === "string" ||
      typeof row.hidden_markup_amount === "number") &&
    (typeof row.unit_price === "string" || typeof row.unit_price === "number") &&
    (typeof row.tax_rate_snapshot === "string" ||
      typeof row.tax_rate_snapshot === "number") &&
    (typeof row.discount_amount === "string" || typeof row.discount_amount === "number") &&
    (typeof row.line_subtotal === "string" || typeof row.line_subtotal === "number") &&
    (typeof row.tax_amount === "string" || typeof row.tax_amount === "number") &&
    (row.cost_code === null || typeof row.cost_code === "string") &&
    (typeof row.line_total === "string" || typeof row.line_total === "number") &&
    typeof row.sort_order === "number" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isInvoiceLineItemRowArray(value: unknown): value is InvoiceLineItemRow[] {
  return Array.isArray(value) && value.every((row) => isInvoiceLineItemRow(row));
}

function isPaymentRow(value: unknown): value is PaymentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PaymentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.invoice_id === "string" &&
    (typeof row.amount === "string" || typeof row.amount === "number") &&
    typeof row.payment_date === "string" &&
    typeof row.payment_method === "string" &&
    typeof row.payment_source === "string" &&
    typeof row.recorded_via === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPaymentRowArray(value: unknown): value is PaymentRow[] {
  return Array.isArray(value) && value.every((row) => isPaymentRow(row));
}

function isPaymentEventRow(value: unknown): value is PaymentEventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PaymentEventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.invoice_id === "string" &&
    (row.payment_id === null || typeof row.payment_id === "string") &&
    typeof row.event_type === "string" &&
    typeof row.actor_type === "string" &&
    (row.actor_user_id === null || typeof row.actor_user_id === "string") &&
    (row.portal_user_id === null || typeof row.portal_user_id === "string") &&
    (row.gateway_provider === null || typeof row.gateway_provider === "string") &&
    (row.provider_event_id === null || typeof row.provider_event_id === "string") &&
    (row.payload === null ||
      (typeof row.payload === "object" && !Array.isArray(row.payload))) &&
    typeof row.occurred_at === "string" &&
    typeof row.created_at === "string"
  );
}

function isPaymentEventRowArray(value: unknown): value is PaymentEventRow[] {
  return Array.isArray(value) && value.every((row) => isPaymentEventRow(row));
}

function isIdRow(value: unknown): value is IdRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as Partial<IdRow>).id === "string";
}

function mapInvoice(row: InvoiceRow): InvoiceRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    jobId: row.job_id,
    templateId: row.template_id,
    referenceNumber: row.reference_number,
    billingModel: row.billing_model,
    workflowRole: row.workflow_role,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    taxRateApplied: Number(row.tax_rate_applied).toFixed(6),
    taxBehaviorApplied: row.tax_behavior_applied,
    customerTaxExemptSnapshot: row.customer_tax_exempt_snapshot,
    subtotalAmount: Number(row.subtotal_amount).toFixed(2),
    taxableSalesAmount: Number(row.taxable_sales_amount).toFixed(2),
    exemptSalesAmount: Number(row.exempt_sales_amount).toFixed(2),
    taxAmount: Number(row.tax_amount).toFixed(2),
    taxCollectedAmount: Number(row.tax_collected_amount).toFixed(2),
    discountAmount: Number(row.discount_amount).toFixed(2),
    retainagePercentage: Number(row.retainage_percentage).toFixed(2),
    retainageHeldAmount: Number(row.retainage_held_amount).toFixed(2),
    totalAmount: Number(row.total_amount).toFixed(2),
    balanceDueAmount: Number(row.balance_due_amount).toFixed(2),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapInvoiceLineItem(row: InvoiceLineItemRow): InvoiceLineItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    invoiceId: row.invoice_id,
    estimateLineItemId: row.estimate_line_item_id,
    lineageType: row.lineage_type,
    estimateSnapshotItemId: row.estimate_snapshot_item_id,
    scheduleOfValueItemId: row.schedule_of_value_item_id,
    changeOrderSnapshotItemId: row.change_order_snapshot_item_id,
    invoiceOnlyAdjustmentKind: row.invoice_only_adjustment_kind,
    catalogItemId: row.catalog_item_id,
    taxCodeId: row.tax_code_id,
    name: row.name,
    description: row.description,
    quantity: Number(row.quantity).toFixed(2),
    unit: row.unit,
    taxable: row.taxable,
    baseUnitCost:
      row.base_unit_cost == null ? null : Number(row.base_unit_cost).toFixed(2),
    baseUnitPrice:
      row.base_unit_price == null ? null : Number(row.base_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    unitPriceBeforeHiddenMarkup: Number(row.unit_price_before_hidden_markup).toFixed(2),
    visibleMarkupAmount: Number(row.visible_markup_amount).toFixed(2),
    hiddenMarkupAmount: Number(row.hidden_markup_amount).toFixed(2),
    unitPrice: Number(row.unit_price).toFixed(2),
    taxRateSnapshot: Number(row.tax_rate_snapshot).toFixed(6),
    discountAmount: Number(row.discount_amount).toFixed(2),
    lineSubtotal: Number(row.line_subtotal).toFixed(2),
    taxAmount: Number(row.tax_amount).toFixed(2),
    costCode: row.cost_code,
    lineTotal: Number(row.line_total).toFixed(2),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    organizationId: row.company_id,
    invoiceId: row.invoice_id,
    amount: Number(row.amount).toFixed(2),
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    paymentSource: row.payment_source,
    recordedVia: row.recorded_via,
    gatewayProvider: row.gateway_provider,
    gatewayPaymentIntentReference: row.gateway_payment_intent_reference,
    gatewayCheckoutSessionReference: row.gateway_checkout_session_reference,
    gatewayStatus: row.gateway_status,
    paymentMethodSummary: row.payment_method_summary,
    payerUserId: row.payer_user_id,
    payerEmail: row.payer_email,
    reference: row.reference,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPaymentEvent(row: PaymentEventRow): PaymentEvent {
  return {
    id: row.id,
    organizationId: row.company_id,
    invoiceId: row.invoice_id,
    paymentId: row.payment_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    actorUserId: row.actor_user_id,
    portalUserId: row.portal_user_id,
    gatewayProvider: row.gateway_provider,
    providerEventId: row.provider_event_id,
    payload: row.payload,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapInvoiceListItem(row: InvoiceRow): InvoiceListItem {
  return {
    ...mapInvoice(row),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          isTaxExempt: row.customers.is_tax_exempt,
          retainagePercentageDefault: Number(
            row.customers.retainage_percentage_default
          ).toFixed(2)
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number,
          status: row.estimates.status
        }
      : null,
    job: row.jobs
      ? {
          id: row.jobs.id,
          dispatchStatus: row.jobs.dispatch_status
        }
      : null
  };
}

async function getInvoiceScope(next = "/invoices"): Promise<InvoiceScope | null> {
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

export async function requireInvoiceScope(next = "/invoices") {
  const scope = await getInvoiceScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for invoices yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

function sortInvoices(invoices: InvoiceListItem[]) {
  return invoices.sort((left, right) => {
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

async function getInvoiceRecordById(
  organizationId: string,
  invoiceId: string
): Promise<InvoiceRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("company_id", organizationId)
    .eq("id", invoiceId)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the invoice: ${error.message}`);
  }

  return isInvoiceRow(data) ? data : null;
}

async function getInvoiceRecordByIdAdmin(
  organizationId: string,
  invoiceId: string
): Promise<InvoiceRow | null> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("company_id", organizationId)
    .eq("id", invoiceId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the invoice: ${response.error.message}`);
  }

  return isInvoiceRow(data) ? data : null;
}

async function getInvoiceLineItems(
  organizationId: string,
  invoiceId: string
): Promise<InvoiceLineItem[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoice_line_items")
    .select(
      `
        id,
        company_id,
        invoice_id,
        estimate_line_item_id,
        lineage_type,
        estimate_snapshot_item_id,
        schedule_of_value_item_id,
        change_order_snapshot_item_id,
        invoice_only_adjustment_kind,
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
        tax_rate_snapshot,
        discount_amount,
        line_subtotal,
        tax_amount,
        cost_code,
        line_total,
        sort_order,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load invoice line items: ${error.message}`);
  }

  if (!isInvoiceLineItemRowArray(data)) {
    return [];
  }

  return data.map((row) => mapInvoiceLineItem(row));
}

async function listInvoicePayments(
  organizationId: string,
  invoiceId: string
): Promise<Payment[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .select(
      `
        id,
        company_id,
        invoice_id,
        amount,
        payment_date,
        payment_method,
        payment_source,
        recorded_via,
        gateway_provider,
        gateway_payment_intent_reference,
        gateway_checkout_session_reference,
        gateway_status,
        payment_method_summary,
        payer_user_id,
        payer_email,
        reference,
        notes,
        status,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load invoice payments: ${error.message}`);
  }

  if (!isPaymentRowArray(data)) {
    return [];
  }

  return data.map((row) => mapPayment(row));
}

async function listInvoicePaymentEvents(
  organizationId: string,
  invoiceId: string
): Promise<PaymentEvent[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .select(
      `
        id,
        company_id,
        invoice_id,
        payment_id,
        event_type,
        actor_type,
        actor_user_id,
        portal_user_id,
        gateway_provider,
        provider_event_id,
        payload,
        occurred_at,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load invoice payment events: ${error.message}`);
  }

  if (!isPaymentEventRowArray(data)) {
    return [];
  }

  return data.map((row) => mapPaymentEvent(row));
}

export async function recordPaymentEvent(input: {
  organizationId: string;
  invoiceId: string;
  paymentId?: string | null;
  eventType: PaymentEventType;
  actorType: PaymentEventActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  gatewayProvider?: string | null;
  providerEventId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .insert({
      company_id: input.organizationId,
      invoice_id: input.invoiceId,
      payment_id: input.paymentId ?? null,
      event_type: input.eventType,
      actor_type: input.actorType,
      actor_user_id: input.actorUserId ?? null,
      portal_user_id: input.portalUserId ?? null,
      gateway_provider: input.gatewayProvider ?? null,
      provider_event_id: input.providerEventId ?? null,
      payload: input.payload ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString()
    })
    .select(
      `
        id,
        company_id,
        invoice_id,
        payment_id,
        event_type,
        actor_type,
        actor_user_id,
        portal_user_id,
        gateway_provider,
        provider_event_id,
        payload,
        occurred_at,
        created_at
      `
    )
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to record payment event: ${error.message}`);
  }

  if (!isPaymentEventRow(data)) {
    throw new Error("Unexpected payment event response.");
  }

  return mapPaymentEvent(data);
}

async function findPaymentEventByProviderReference(
  organizationId: string,
  gatewayProvider: string,
  providerEventId: string
): Promise<PaymentEventRow | null> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("payment_events")
    .select(
      `
        id,
        company_id,
        invoice_id,
        payment_id,
        event_type,
        actor_type,
        actor_user_id,
        portal_user_id,
        gateway_provider,
        provider_event_id,
        payload,
        occurred_at,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("gateway_provider", gatewayProvider)
    .eq("provider_event_id", providerEventId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load provider payment event history: ${response.error.message}`
    );
  }

  return isPaymentEventRow(data) ? data : null;
}

class DuplicateProviderPaymentEventError extends Error {
  readonly organizationId: string;
  readonly invoiceId: string;
  readonly gatewayProvider: string;
  readonly providerEventId: string;

  constructor(input: {
    organizationId: string;
    invoiceId: string;
    gatewayProvider: string;
    providerEventId: string;
  }) {
    super(
      `Duplicate provider payment event acknowledged for ${input.gatewayProvider}:${input.providerEventId}.`
    );
    this.name = "DuplicateProviderPaymentEventError";
    this.organizationId = input.organizationId;
    this.invoiceId = input.invoiceId;
    this.gatewayProvider = input.gatewayProvider;
    this.providerEventId = input.providerEventId;
  }
}

function getDuplicateProviderEventCandidate(
  organizationId: string,
  invoiceId: string,
  events: readonly PaymentEventInsert[]
) {
  return events.find(
    (event): event is PaymentEventInsert & {
      gatewayProvider: string;
      providerEventId: string;
    } =>
      typeof event.gatewayProvider === "string" &&
      event.gatewayProvider.length > 0 &&
      typeof event.providerEventId === "string" &&
      event.providerEventId.length > 0
  )
    ? {
        organizationId,
        invoiceId,
        gatewayProvider: events.find(
          (event): event is PaymentEventInsert & {
            gatewayProvider: string;
            providerEventId: string;
          } =>
            typeof event.gatewayProvider === "string" &&
            event.gatewayProvider.length > 0 &&
            typeof event.providerEventId === "string" &&
            event.providerEventId.length > 0
        )!.gatewayProvider,
        providerEventId: events.find(
          (event): event is PaymentEventInsert & {
            gatewayProvider: string;
            providerEventId: string;
          } =>
            typeof event.gatewayProvider === "string" &&
            event.gatewayProvider.length > 0 &&
            typeof event.providerEventId === "string" &&
            event.providerEventId.length > 0
        )!.providerEventId
      }
    : null;
}

async function insertPaymentEventsAdmin(
  organizationId: string,
  invoiceId: string,
  events: readonly PaymentEventInsert[]
) {
  if (events.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase.from("payment_events").insert(
    events.map((event) => ({
      company_id: organizationId,
      invoice_id: invoiceId,
      payment_id: event.paymentId ?? null,
      event_type: event.eventType,
      actor_type: event.actorType,
      actor_user_id: event.actorUserId ?? null,
      portal_user_id: event.portalUserId ?? null,
      gateway_provider: event.gatewayProvider ?? null,
      provider_event_id: event.providerEventId ?? null,
      payload: event.payload ?? null,
      occurred_at: event.occurredAt ?? new Date().toISOString()
    }))
  );

  if (response.error) {
    const duplicateCandidate = getDuplicateProviderEventCandidate(
      organizationId,
      invoiceId,
      events
    );

    if (response.error.code === "23505" && duplicateCandidate) {
      throw new DuplicateProviderPaymentEventError(duplicateCandidate);
    }

    throw new Error(`Unable to record payment events: ${response.error.message}`);
  }
}

async function getScopedPortalInvoice(
  invoiceId: string,
  next: string
): Promise<PortalInvoiceScope> {
  const user = await requireAuthenticatedUser(next);
  const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
    (grant) => grant.status === "active"
  );

  if (activeGrants.length === 0) {
    throw new Error("No active portal access is available for this payment action.");
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
  const projectAccessRows =
    (projectAccessResponse.data as Array<{ project_id?: string }> | null) ?? [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate portal project scope: ${projectAccessResponse.error.message}`
    );
  }

  const accessibleProjectIds = new Set(
    projectAccessRows
      .map((row) => row.project_id)
      .filter((value): value is string => typeof value === "string")
  );
  const invoice = await getInvoiceRecordByIdAdmin(
    activeGrants[0]?.organizationId ?? "",
    invoiceId
  );

  if (!invoice) {
    throw new Error("Invoice not found for this portal user.");
  }

  if (
    !accessibleCustomerIds.has(invoice.customer_id) ||
    !accessibleProjectIds.has(invoice.project_id)
  ) {
    throw new Error("This invoice is not available in the current portal scope.");
  }

  return {
    userId: user.id,
    invoice
  };
}

function resolveRecordedVia(actorType: PaymentEventActorType): PaymentRecordedVia {
  if (actorType === "portal_user") {
    return "customer_portal";
  }

  if (actorType === "organization_user") {
    return "contractor_app";
  }

  return "system";
}

function getPendingCheckoutPaymentMethod(gatewayProvider: string) {
  return gatewayProvider === "stripe" ? "Secure checkout" : "Local checkout";
}

function getInvoicePaymentWorkflow(invoice: InvoiceRow) {
  return computeInvoicePaymentWorkflowGate({
    invoiceStatus: invoice.status,
    balanceDueAmount: Number(invoice.balance_due_amount).toFixed(2)
  });
}

function assertInvoiceAllowsCustomerPayment(
  invoice: InvoiceRow,
  amount: string,
  mode: "request" | "checkout" | "success"
) {
  const workflow = getInvoicePaymentWorkflow(invoice);
  const numericAmount = Number(amount);

  if (
    (mode === "request" && !workflow.canRequestPayment) ||
    (mode === "checkout" && !workflow.canStartCheckout) ||
    (mode === "success" && !workflow.canRecordSuccess)
  ) {
    throw new Error(
      "This invoice is not currently available for customer payment activity."
    );
  }

  if (numericAmount > Number(invoice.balance_due_amount)) {
    throw new Error("Payment amount cannot be greater than the current balance due.");
  }
}

async function findInvoicePaymentById(
  organizationId: string,
  invoiceId: string,
  paymentId: string,
  useAdmin = false
): Promise<PaymentRow | null> {
  const supabase = useAdmin ? getSupabaseAdminClient() : await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .select(
      `
        id,
        company_id,
        invoice_id,
        amount,
        payment_date,
        payment_method,
        payment_source,
        recorded_via,
        gateway_provider,
        gateway_payment_intent_reference,
        gateway_checkout_session_reference,
        gateway_status,
        payment_method_summary,
        payer_user_id,
        payer_email,
        reference,
        notes,
        status,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .eq("id", paymentId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load invoice payment: ${response.error.message}`);
  }

  return isPaymentRow(data) ? data : null;
}

async function findPaymentByGatewayReference(
  organizationId: string,
  invoiceId: string,
  input: {
    gatewayProvider: string;
    gatewayPaymentIntentReference: string | null;
    gatewayCheckoutSessionReference: string | null;
  }
): Promise<PaymentRow | null> {
  const supabase = getSupabaseAdminClient();

  if (input.gatewayPaymentIntentReference) {
    const intentResponse = await supabase
      .from("payments")
      .select(
        `
          id,
          company_id,
          invoice_id,
          amount,
          payment_date,
          payment_method,
          payment_source,
          recorded_via,
          gateway_provider,
          gateway_payment_intent_reference,
          gateway_checkout_session_reference,
          gateway_status,
          payment_method_summary,
          payer_user_id,
          payer_email,
          reference,
          notes,
          status,
          created_at,
          updated_at
        `
      )
      .eq("company_id", organizationId)
      .eq("invoice_id", invoiceId)
      .eq("gateway_provider", input.gatewayProvider)
      .eq("gateway_payment_intent_reference", input.gatewayPaymentIntentReference)
      .maybeSingle();
    const intentData: unknown = intentResponse.data;

    if (intentResponse.error) {
      throw new Error(`Unable to load provider payment: ${intentResponse.error.message}`);
    }

    if (isPaymentRow(intentData)) {
      return intentData;
    }
  }

  if (input.gatewayCheckoutSessionReference) {
    const sessionResponse = await supabase
      .from("payments")
      .select(
        `
          id,
          company_id,
          invoice_id,
          amount,
          payment_date,
          payment_method,
          payment_source,
          recorded_via,
          gateway_provider,
          gateway_payment_intent_reference,
          gateway_checkout_session_reference,
          gateway_status,
          payment_method_summary,
          payer_user_id,
          payer_email,
          reference,
          notes,
          status,
          created_at,
          updated_at
        `
      )
      .eq("company_id", organizationId)
      .eq("invoice_id", invoiceId)
      .eq("gateway_provider", input.gatewayProvider)
      .eq("gateway_checkout_session_reference", input.gatewayCheckoutSessionReference)
      .maybeSingle();
    const sessionData: unknown = sessionResponse.data;

    if (sessionResponse.error) {
      throw new Error(`Unable to load checkout payment: ${sessionResponse.error.message}`);
    }

    if (isPaymentRow(sessionData)) {
      return sessionData;
    }
  }

  return null;
}

async function findPendingPaymentForInvoice(
  organizationId: string,
  invoiceId: string,
  gatewayProvider: string
): Promise<PaymentRow | null> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("payments")
    .select(
      `
        id,
        company_id,
        invoice_id,
        amount,
        payment_date,
        payment_method,
        payment_source,
        recorded_via,
        gateway_provider,
        gateway_payment_intent_reference,
        gateway_checkout_session_reference,
        gateway_status,
        payment_method_summary,
        payer_user_id,
        payer_email,
        reference,
        notes,
        status,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .eq("gateway_provider", gatewayProvider)
    .eq("status", "pending")
    .order("updated_at", { ascending: false })
    .limit(1);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load the pending checkout payment: ${response.error.message}`
    );
  }

  if (!isPaymentRowArray(data) || data.length === 0) {
    return null;
  }

  return data[0] ?? null;
}

async function syncInvoiceProjectReadiness(invoice: InvoiceRow) {
  await syncProjectCommercialReadiness({
    organizationId: invoice.company_id,
    projectId: invoice.project_id
  });
}

export type PersistedInvoiceLineItemInput = {
  estimateLineItemId?: string | null;
  lineageType?:
    | "estimate_snapshot_item"
    | "sov_item"
    | "change_order_snapshot_item"
    | "invoice_only_adjustment"
    | null;
  estimateSnapshotItemId?: string | null;
  scheduleOfValueItemId?: string | null;
  changeOrderSnapshotItemId?: string | null;
  invoiceOnlyAdjustmentKind?: "manual_catalog_item" | "explicit_adjustment" | null;
  catalogItemId: string | null;
  taxCodeId?: string | null;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  taxable: boolean;
  baseUnitCost: string | null;
  baseUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  taxRateSnapshot?: string;
  discountAmount?: string;
  lineSubtotal?: string;
  taxAmount?: string;
  costCode: string | null;
  lineTotal?: string;
};

type EstimateSnapshotItemRow = {
  id: string;
  company_id: string;
  estimate_commercial_snapshot_id: string;
  estimate_id: string;
  estimate_line_item_id: string;
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
  tax_rate_snapshot: string | number;
  discount_amount: string | number;
  line_subtotal: string | number;
  tax_amount: string | number;
  cost_code: string | null;
  line_total: string | number;
  sort_order: number;
};

type ScheduleOfValueItemSourceRow = {
  id: string;
  company_id: string;
  schedule_of_values_id: string;
  source_estimate_snapshot_item_id: string | null;
  source_estimate_line_item_id: string;
  name: string;
  description: string | null;
  scheduled_value_amount: string | number;
  sort_order: number;
};

type ChangeOrderSnapshotItemRow = {
  id: string;
  company_id: string;
  change_order_commercial_snapshot_id: string;
  change_order_id: string;
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
  tax_rate_snapshot: string | number;
  discount_amount: string | number;
  line_subtotal: string | number;
  tax_amount: string | number;
  cost_code: string | null;
  line_total: string | number;
  sort_order: number;
};

type CatalogItemSourceRow = {
  id: string;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  name: string;
  description: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  tax_code_id: string | null;
  cost_code: string | null;
  status: string;
};

function formatMoneySnapshot(value: string | number | null | undefined) {
  return Number(value ?? 0).toFixed(2);
}

function formatQuantitySnapshot(value: string | number | null | undefined) {
  return Number(value ?? 0).toFixed(2);
}

async function loadLatestEstimateSnapshotItems(
  organizationId: string,
  estimateId: string
) {
  const supabase = await getSupabaseServerClient();
  const snapshotResponse = await supabase
    .from("estimate_commercial_snapshots")
    .select("id")
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("snapshot_version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotResponse.error) {
    throw new Error(
      `Unable to load the latest approved estimate snapshot: ${snapshotResponse.error.message}`
    );
  }

  const snapshotId =
    snapshotResponse.data && typeof snapshotResponse.data.id === "string"
      ? snapshotResponse.data.id
      : null;

  if (!snapshotId) {
    throw new Error("The latest approved estimate snapshot could not be found.");
  }

  const itemsResponse = await supabase
    .from("estimate_commercial_snapshot_items")
    .select(
      `
        id,
        company_id,
        estimate_commercial_snapshot_id,
        estimate_id,
        estimate_line_item_id,
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
        tax_rate_snapshot,
        discount_amount,
        line_subtotal,
        tax_amount,
        cost_code,
        line_total,
        sort_order
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_commercial_snapshot_id", snapshotId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (itemsResponse.error) {
    throw new Error(
      `Unable to load approved estimate snapshot items: ${itemsResponse.error.message}`
    );
  }

  return (itemsResponse.data as EstimateSnapshotItemRow[] | null) ?? [];
}

async function loadEstimateSnapshotItemsByIds(
  organizationId: string,
  snapshotItemIds: string[]
) {
  if (snapshotItemIds.length === 0) {
    return new Map<string, EstimateSnapshotItemRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_commercial_snapshot_items")
    .select(
      `
        id,
        company_id,
        estimate_commercial_snapshot_id,
        estimate_id,
        estimate_line_item_id,
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
        tax_rate_snapshot,
        discount_amount,
        line_subtotal,
        tax_amount,
        cost_code,
        line_total,
        sort_order
      `
    )
    .eq("company_id", organizationId)
    .in("id", snapshotItemIds);

  if (response.error) {
    throw new Error(
      `Unable to load estimate snapshot item sources: ${response.error.message}`
    );
  }

  const rows = (response.data as EstimateSnapshotItemRow[] | null) ?? [];
  return new Map(rows.map((row) => [row.id, row] as const));
}

async function loadScheduleOfValueItemSources(
  organizationId: string,
  scheduleOfValueItemIds: string[]
) {
  if (scheduleOfValueItemIds.length === 0) {
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
        source_estimate_snapshot_item_id,
        source_estimate_line_item_id,
        name,
        description,
        scheduled_value_amount,
        sort_order
      `
    )
    .eq("company_id", organizationId)
    .in("id", scheduleOfValueItemIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load SOV sources: ${response.error.message}`);
  }

  return (response.data as ScheduleOfValueItemSourceRow[] | null) ?? [];
}

async function loadChangeOrderSnapshotItemsByIds(
  organizationId: string,
  snapshotItemIds: string[]
) {
  if (snapshotItemIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_order_commercial_snapshot_items")
    .select(
      `
        id,
        company_id,
        change_order_commercial_snapshot_id,
        change_order_id,
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
        tax_rate_snapshot,
        discount_amount,
        line_subtotal,
        tax_amount,
        cost_code,
        line_total,
        sort_order
      `
    )
    .eq("company_id", organizationId)
    .in("id", snapshotItemIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load change-order snapshot item sources: ${response.error.message}`
    );
  }

  return (response.data as ChangeOrderSnapshotItemRow[] | null) ?? [];
}

async function loadCatalogItemsForInvoiceSources(
  organizationId: string,
  catalogItemIds: string[]
) {
  if (catalogItemIds.length === 0) {
    return new Map<string, CatalogItemSourceRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("catalog_items")
    .select(
      `
        id,
        item_type,
        name,
        description,
        unit,
        default_unit_cost,
        default_unit_price,
        markup_percent,
        hidden_markup_percent,
        taxable,
        tax_code_id,
        cost_code,
        status
      `
    )
    .eq("company_id", organizationId)
    .in("id", catalogItemIds);

  if (response.error) {
    throw new Error(`Unable to load invoice catalog item sources: ${response.error.message}`);
  }

  const rows = (response.data as CatalogItemSourceRow[] | null) ?? [];
  return new Map(rows.map((row) => [row.id, row] as const));
}

function mapEstimateSnapshotRowToInvoiceLineItem(
  row: EstimateSnapshotItemRow,
  lineageType: PersistedInvoiceLineItemInput["lineageType"],
  overrides?: {
    scheduleOfValueItemId?: string | null;
    quantity?: string;
    lineSubtotal?: string;
    lineTotal?: string;
    description?: string | null;
  }
): PersistedInvoiceLineItemInput {
  return {
    estimateLineItemId: row.estimate_line_item_id,
    lineageType,
    estimateSnapshotItemId:
      lineageType === "estimate_snapshot_item" ? row.id : null,
    scheduleOfValueItemId: overrides?.scheduleOfValueItemId ?? null,
    changeOrderSnapshotItemId: null,
    invoiceOnlyAdjustmentKind: null,
    catalogItemId: row.catalog_item_id,
    taxCodeId: row.tax_code_id,
    name: row.name,
    description: overrides?.description ?? row.description,
    quantity: overrides?.quantity ?? formatQuantitySnapshot(row.quantity),
    unit: row.unit,
    taxable: row.taxable,
    baseUnitCost: formatMoneySnapshot(row.base_unit_cost),
    baseUnitPrice:
      row.base_unit_price == null ? null : formatMoneySnapshot(row.base_unit_price),
    markupPercent: formatMoneySnapshot(row.markup_percent),
    hiddenMarkupPercent: formatMoneySnapshot(row.hidden_markup_percent),
    unitPriceBeforeHiddenMarkup: formatMoneySnapshot(row.unit_price_before_hidden_markup),
    visibleMarkupAmount: formatMoneySnapshot(row.visible_markup_amount),
    hiddenMarkupAmount: formatMoneySnapshot(row.hidden_markup_amount),
    unitPrice: formatMoneySnapshot(row.unit_price),
    taxRateSnapshot: Number(row.tax_rate_snapshot ?? 0).toFixed(6),
    discountAmount: formatMoneySnapshot(row.discount_amount),
    lineSubtotal: overrides?.lineSubtotal ?? formatMoneySnapshot(row.line_subtotal),
    taxAmount: formatMoneySnapshot(row.tax_amount),
    costCode: row.cost_code,
    lineTotal: overrides?.lineTotal ?? formatMoneySnapshot(row.line_total)
  };
}

function mapChangeOrderSnapshotRowToInvoiceLineItem(
  row: ChangeOrderSnapshotItemRow
): PersistedInvoiceLineItemInput {
  return {
    estimateLineItemId: null,
    lineageType: "change_order_snapshot_item",
    estimateSnapshotItemId: null,
    scheduleOfValueItemId: null,
    changeOrderSnapshotItemId: row.id,
    invoiceOnlyAdjustmentKind: null,
    catalogItemId: row.catalog_item_id,
    taxCodeId: row.tax_code_id,
    name: row.name,
    description: row.description,
    quantity: formatQuantitySnapshot(row.quantity),
    unit: row.unit,
    taxable: row.taxable,
    baseUnitCost: formatMoneySnapshot(row.base_unit_cost),
    baseUnitPrice:
      row.base_unit_price == null ? null : formatMoneySnapshot(row.base_unit_price),
    markupPercent: formatMoneySnapshot(row.markup_percent),
    hiddenMarkupPercent: formatMoneySnapshot(row.hidden_markup_percent),
    unitPriceBeforeHiddenMarkup: formatMoneySnapshot(row.unit_price_before_hidden_markup),
    visibleMarkupAmount: formatMoneySnapshot(row.visible_markup_amount),
    hiddenMarkupAmount: formatMoneySnapshot(row.hidden_markup_amount),
    unitPrice: formatMoneySnapshot(row.unit_price),
    taxRateSnapshot: Number(row.tax_rate_snapshot ?? 0).toFixed(6),
    discountAmount: formatMoneySnapshot(row.discount_amount),
    lineSubtotal: formatMoneySnapshot(row.line_subtotal),
    taxAmount: formatMoneySnapshot(row.tax_amount),
    costCode: row.cost_code,
    lineTotal: formatMoneySnapshot(row.line_total)
  };
}

function mapInvoiceLineItemToPersistedInput(
  lineItem: InvoiceLineItem
): PersistedInvoiceLineItemInput {
  return {
    estimateLineItemId: lineItem.estimateLineItemId ?? null,
    lineageType: lineItem.lineageType ?? null,
    estimateSnapshotItemId: lineItem.estimateSnapshotItemId ?? null,
    scheduleOfValueItemId: lineItem.scheduleOfValueItemId ?? null,
    changeOrderSnapshotItemId: lineItem.changeOrderSnapshotItemId ?? null,
    invoiceOnlyAdjustmentKind: lineItem.invoiceOnlyAdjustmentKind ?? null,
    catalogItemId: lineItem.catalogItemId,
    taxCodeId: lineItem.taxCodeId ?? null,
    name: lineItem.name,
    description: lineItem.description,
    quantity: lineItem.quantity,
    unit: lineItem.unit,
    taxable: lineItem.taxable,
    baseUnitCost: lineItem.baseUnitCost,
    baseUnitPrice: lineItem.baseUnitPrice,
    markupPercent: lineItem.markupPercent,
    hiddenMarkupPercent: lineItem.hiddenMarkupPercent,
    unitPriceBeforeHiddenMarkup: lineItem.unitPriceBeforeHiddenMarkup,
    visibleMarkupAmount: lineItem.visibleMarkupAmount,
    hiddenMarkupAmount: lineItem.hiddenMarkupAmount,
    unitPrice: lineItem.unitPrice,
    taxRateSnapshot: lineItem.taxRateSnapshot,
    discountAmount: lineItem.discountAmount,
    lineSubtotal: lineItem.lineSubtotal,
    taxAmount: lineItem.taxAmount,
    costCode: lineItem.costCode,
    lineTotal: lineItem.lineTotal
  };
}

async function buildInvoiceLineItemsFromSourceConfiguration(input: {
  organizationId: string;
  estimateId: string | null;
  sourceConfiguration: InvoiceSourceConfiguration;
}) {
  const baseLineItems: PersistedInvoiceLineItemInput[] = [];

  if (input.sourceConfiguration.baseSourceType === "estimate_snapshot") {
    if (!input.estimateId) {
      throw new Error("A full invoice requires a linked approved estimate.");
    }

    const snapshotItems = await loadLatestEstimateSnapshotItems(
      input.organizationId,
      input.estimateId
    );

    for (const snapshotItem of snapshotItems) {
      baseLineItems.push(
        mapEstimateSnapshotRowToInvoiceLineItem(snapshotItem, "estimate_snapshot_item")
      );
    }
  }

  if (input.sourceConfiguration.baseSourceType === "sov_items") {
    const sovItems = await loadScheduleOfValueItemSources(
      input.organizationId,
      input.sourceConfiguration.selectedSovItemIds
    );
    const snapshotItemsById = await loadEstimateSnapshotItemsByIds(
      input.organizationId,
      sovItems
        .map((row) => row.source_estimate_snapshot_item_id)
        .filter((value): value is string => typeof value === "string")
    );

    for (const sovItem of sovItems) {
      if (!sovItem.source_estimate_snapshot_item_id) {
        throw new Error("SOV invoice lines require approved snapshot lineage.");
      }

      const snapshotItem = snapshotItemsById.get(sovItem.source_estimate_snapshot_item_id);

      if (!snapshotItem) {
        throw new Error("A selected SOV item is missing its approved estimate snapshot source.");
      }

      baseLineItems.push(
        mapEstimateSnapshotRowToInvoiceLineItem(snapshotItem, "sov_item", {
          scheduleOfValueItemId: sovItem.id
        })
      );
    }
  }

  if (input.sourceConfiguration.baseSourceType === "change_order_snapshot_items") {
    const snapshotItems = await loadChangeOrderSnapshotItemsByIds(
      input.organizationId,
      input.sourceConfiguration.selectedChangeOrderSnapshotItemIds
    );

    for (const snapshotItem of snapshotItems) {
      baseLineItems.push(mapChangeOrderSnapshotRowToInvoiceLineItem(snapshotItem));
    }
  }

  const catalogItemsById = await loadCatalogItemsForInvoiceSources(
    input.organizationId,
    input.sourceConfiguration.manualCatalogItems.map((item) => item.catalogItemId)
  );

  for (const manualItem of input.sourceConfiguration.manualCatalogItems) {
    const catalogItem = catalogItemsById.get(manualItem.catalogItemId);

    if (!catalogItem) {
      throw new Error("A selected manual catalog item is no longer available.");
    }

    const pricingSnapshot = buildCatalogItemPricingSnapshot({
      catalogItem: {
        id: catalogItem.id,
        itemType: catalogItem.item_type,
        name: catalogItem.name,
        description: catalogItem.description,
        unit: catalogItem.unit,
        defaultUnitCost: formatMoneySnapshot(catalogItem.default_unit_cost),
        defaultUnitPrice:
          catalogItem.default_unit_price == null
            ? null
            : formatMoneySnapshot(catalogItem.default_unit_price),
        markupPercent: formatMoneySnapshot(catalogItem.markup_percent),
        hiddenMarkupPercent: formatMoneySnapshot(catalogItem.hidden_markup_percent),
        taxable: catalogItem.taxable,
        taxCodeId: catalogItem.tax_code_id,
        costCode: catalogItem.cost_code
      },
      quantity: manualItem.quantity,
      sourceType: "catalog_item"
    });

    baseLineItems.push({
      estimateLineItemId: null,
      lineageType: "invoice_only_adjustment",
      estimateSnapshotItemId: null,
      scheduleOfValueItemId: null,
      changeOrderSnapshotItemId: null,
      invoiceOnlyAdjustmentKind: "manual_catalog_item",
      catalogItemId: catalogItem.id,
      taxCodeId: pricingSnapshot.taxCodeId,
      name: pricingSnapshot.name,
      description: pricingSnapshot.description,
      quantity: formatQuantitySnapshot(manualItem.quantity),
      unit: pricingSnapshot.unit,
      taxable: pricingSnapshot.taxable,
      baseUnitCost: pricingSnapshot.baseUnitCost,
      baseUnitPrice: pricingSnapshot.baseUnitPrice,
      markupPercent: pricingSnapshot.markupPercent,
      hiddenMarkupPercent: pricingSnapshot.hiddenMarkupPercent,
      unitPriceBeforeHiddenMarkup: pricingSnapshot.unitPriceBeforeHiddenMarkup,
      visibleMarkupAmount: pricingSnapshot.visibleMarkupAmount,
      hiddenMarkupAmount: pricingSnapshot.hiddenMarkupAmount,
      unitPrice: pricingSnapshot.unitPrice,
      taxRateSnapshot: "0.000000",
      discountAmount: "0.00",
      lineSubtotal: formatMoneySnapshot(
        Number(pricingSnapshot.quantity) * Number(pricingSnapshot.unitPrice)
      ),
      taxAmount: "0.00",
      costCode: pricingSnapshot.costCode
    });
  }

  for (const adjustment of input.sourceConfiguration.explicitAdjustments) {
    const amount = Number(adjustment.amount);

    baseLineItems.push({
      estimateLineItemId: null,
      lineageType: "invoice_only_adjustment",
      estimateSnapshotItemId: null,
      scheduleOfValueItemId: null,
      changeOrderSnapshotItemId: null,
      invoiceOnlyAdjustmentKind: "explicit_adjustment",
      catalogItemId: null,
      taxCodeId: null,
      name: adjustment.name,
      description: adjustment.description,
      quantity: "1.00",
      unit: "each",
      taxable: false,
      baseUnitCost: "0.00",
      baseUnitPrice: null,
      markupPercent: "0.00",
      hiddenMarkupPercent: "0.00",
      unitPriceBeforeHiddenMarkup: amount.toFixed(2),
      visibleMarkupAmount: "0.00",
      hiddenMarkupAmount: "0.00",
      unitPrice: amount.toFixed(2),
      taxRateSnapshot: "0.000000",
      discountAmount: "0.00",
      lineSubtotal: amount.toFixed(2),
      taxAmount: "0.00",
      costCode: null
    });
  }

  const normalizedLineItems: PersistedInvoiceLineItemInput[] = [];

  for (const lineItem of baseLineItems) {
    const computedLineTotal = (
      Number(lineItem.quantity) * Number(lineItem.unitPrice)
    ).toFixed(2);

    const nextLineItem: PersistedInvoiceLineItemInput = {
      estimateLineItemId: lineItem.estimateLineItemId ?? null,
      lineageType: lineItem.lineageType ?? null,
      estimateSnapshotItemId: lineItem.estimateSnapshotItemId ?? null,
      scheduleOfValueItemId: lineItem.scheduleOfValueItemId ?? null,
      changeOrderSnapshotItemId: lineItem.changeOrderSnapshotItemId ?? null,
      invoiceOnlyAdjustmentKind: lineItem.invoiceOnlyAdjustmentKind ?? null,
      catalogItemId: lineItem.catalogItemId,
      taxCodeId: lineItem.taxCodeId ?? null,
      name: lineItem.name,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      taxable: lineItem.taxable,
      baseUnitCost: lineItem.baseUnitCost,
      baseUnitPrice: lineItem.baseUnitPrice,
      markupPercent: lineItem.markupPercent,
      hiddenMarkupPercent: lineItem.hiddenMarkupPercent,
      unitPriceBeforeHiddenMarkup: lineItem.unitPriceBeforeHiddenMarkup,
      visibleMarkupAmount: lineItem.visibleMarkupAmount,
      hiddenMarkupAmount: lineItem.hiddenMarkupAmount,
      unitPrice: lineItem.unitPrice,
      taxRateSnapshot: lineItem.taxRateSnapshot,
      discountAmount: lineItem.discountAmount,
      lineSubtotal: computedLineTotal,
      taxAmount: lineItem.taxAmount,
      costCode: lineItem.costCode,
      lineTotal: computedLineTotal
    };

    normalizedLineItems.push(nextLineItem);
  }

  return normalizedLineItems;
}

function hasLegacyInvoiceLineItems(lineItems: InvoiceLineItem[]) {
  return lineItems.some((lineItem) => !lineItem.lineageType);
}

function shouldRequireManualAdjustmentQuantities(
  status: InvoiceStatus,
  sourceConfiguration: InvoiceSourceConfiguration | null
) {
  if (status === "draft" || !sourceConfiguration) {
    return false;
  }

  return sourceConfiguration.manualCatalogItems.some(
    (manualItem) => Number(manualItem.quantity) <= 0
  );
}

export async function replaceCanonicalInvoiceLineItems(
  organizationId: string,
  userId: string,
  invoiceId: string,
  lineItems: PersistedInvoiceLineItemInput[]
) {
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId);

  if (deleteResponse.error) {
    throw new Error(
      `Unable to clear existing invoice line items: ${deleteResponse.error.message}`
    );
  }

  const insertResponse = await supabase.from("invoice_line_items").insert(
    lineItems.map((lineItem, index) => ({
      company_id: organizationId,
      invoice_id: invoiceId,
      estimate_line_item_id: lineItem.estimateLineItemId ?? null,
      lineage_type: lineItem.lineageType ?? null,
      estimate_snapshot_item_id: lineItem.estimateSnapshotItemId ?? null,
      schedule_of_value_item_id: lineItem.scheduleOfValueItemId ?? null,
      change_order_snapshot_item_id: lineItem.changeOrderSnapshotItemId ?? null,
      invoice_only_adjustment_kind: lineItem.invoiceOnlyAdjustmentKind ?? null,
      catalog_item_id: lineItem.catalogItemId,
      tax_code_id: lineItem.taxCodeId ?? null,
      name: lineItem.name,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      taxable: lineItem.taxable,
      base_unit_cost: lineItem.baseUnitCost,
      base_unit_price: lineItem.baseUnitPrice,
      markup_percent: lineItem.markupPercent,
      hidden_markup_percent: lineItem.hiddenMarkupPercent,
      unit_price_before_hidden_markup: lineItem.unitPriceBeforeHiddenMarkup,
      visible_markup_amount: lineItem.visibleMarkupAmount,
      hidden_markup_amount: lineItem.hiddenMarkupAmount,
      unit_price: lineItem.unitPrice,
      tax_rate_snapshot: lineItem.taxRateSnapshot ?? "0.000000",
      discount_amount: lineItem.discountAmount ?? "0.00",
      line_subtotal: lineItem.lineSubtotal ?? "0.00",
      tax_amount: lineItem.taxAmount ?? "0.00",
      cost_code: lineItem.costCode,
      sort_order: index,
      created_by: userId,
      updated_by: userId
    }))
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to save invoice line items: ${insertResponse.error.message}`
    );
  }
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
    throw new Error("Only approved estimates can be linked to invoices.");
  }

  return estimate;
}

async function resolveScopedJob(
  jobId: string | null,
  projectId: string,
  next: string
) {
  if (!jobId) {
    return null;
  }

  const job = await getJobById(jobId, next);

  if (!job) {
    throw new Error("Job not found for this organization.");
  }

  if (job.projectId !== projectId) {
    throw new Error("Job must belong to the selected project.");
  }

  return job;
}

function validateConnectedRecords(
  estimateId: string | null,
  job: Awaited<ReturnType<typeof resolveScopedJob>>
) {
  if (!job || !job.estimateId || !estimateId) {
    return;
  }

  if (job.estimateId !== estimateId) {
    throw new Error("Job and estimate must refer to the same project workflow.");
  }
}

function calculatePaidAmount(payments: Payment[]) {
  return payments
    .filter((payment) => payment.status === "recorded")
    .reduce((sum, payment) => sum + Number(payment.amount), 0)
    .toFixed(2);
}

export const listInvoices = cache(async (): Promise<InvoiceListItem[]> => {
  const scope = await requireInvoiceScope("/invoices");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load invoices: ${error.message}`);
  }

  if (!isInvoiceRowArray(data)) {
    return [];
  }

  return sortInvoices(data.map(mapInvoiceListItem));
});

export const listInvoiceSourceOptions = cache(async (): Promise<InvoiceSourceOptions> => {
  const scope = await requireInvoiceScope("/invoices");
  const supabase = await getSupabaseServerClient();
  const [
    scheduleOfValuesResponse,
    scheduleOfValueItemsResponse,
    changeOrderSnapshotsResponse,
    changeOrderSnapshotItemsResponse
  ] = await Promise.all([
    supabase
      .from("schedule_of_values")
      .select("id, estimate_id, project_id")
      .eq("company_id", scope.organizationId),
    supabase
      .from("schedule_of_value_items")
      .select("id, schedule_of_values_id, name, description, scheduled_value_amount")
      .eq("company_id", scope.organizationId)
      .eq("lineage_type", "estimate_snapshot_item")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("change_order_commercial_snapshots")
      .select("id, change_order_id, project_id, invoice_id, snapshot_version, created_at")
      .eq("company_id", scope.organizationId)
      .order("snapshot_version", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("change_order_commercial_snapshot_items")
      .select(
        "id, change_order_commercial_snapshot_id, change_order_id, name, description, line_total"
      )
      .eq("company_id", scope.organizationId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (scheduleOfValuesResponse.error) {
    throw new Error(
      `Unable to load invoice SOV sources: ${scheduleOfValuesResponse.error.message}`
    );
  }

  if (scheduleOfValueItemsResponse.error) {
    throw new Error(
      `Unable to load invoice SOV item sources: ${scheduleOfValueItemsResponse.error.message}`
    );
  }

  if (changeOrderSnapshotsResponse.error) {
    throw new Error(
      `Unable to load invoice change-order snapshot sources: ${changeOrderSnapshotsResponse.error.message}`
    );
  }

  if (changeOrderSnapshotItemsResponse.error) {
    throw new Error(
      `Unable to load invoice change-order item sources: ${changeOrderSnapshotItemsResponse.error.message}`
    );
  }

  const scheduleOfValuesRows =
    (scheduleOfValuesResponse.data as Array<{
      id: string;
      estimate_id: string;
      project_id: string;
    }> | null) ?? [];
  const scheduleOfValuesById = new Map(
    scheduleOfValuesRows.map((row) => [row.id, row] as const)
  );
  const changeOrderSnapshotsRows =
    (changeOrderSnapshotsResponse.data as Array<{
      id: string;
      change_order_id: string;
      project_id: string;
      invoice_id: string | null;
      snapshot_version: number;
      created_at: string;
    }> | null) ?? [];
  const latestSnapshotByChangeOrderId = new Map<
    string,
    (typeof changeOrderSnapshotsRows)[number]
  >();

  for (const row of changeOrderSnapshotsRows) {
    if (!latestSnapshotByChangeOrderId.has(row.change_order_id)) {
      latestSnapshotByChangeOrderId.set(row.change_order_id, row);
    }
  }

  return {
    scheduleOfValueItems: (
      (scheduleOfValueItemsResponse.data as Array<{
        id: string;
        schedule_of_values_id: string;
        name: string;
        description: string | null;
        scheduled_value_amount: string | number;
      }> | null) ?? []
    )
      .map((row) => {
        const header = scheduleOfValuesById.get(row.schedule_of_values_id);

        if (!header) {
          return null;
        }

        return {
          id: row.id,
          scheduleOfValuesId: row.schedule_of_values_id,
          estimateId: header.estimate_id,
          projectId: header.project_id,
          name: row.name,
          description: row.description,
          scheduledValueAmount: Number(row.scheduled_value_amount).toFixed(2)
        };
      })
      .filter(
        (
          row
        ): row is InvoiceSourceOptions["scheduleOfValueItems"][number] => Boolean(row)
      ),
    changeOrderSnapshotItems: (
      (changeOrderSnapshotItemsResponse.data as Array<{
        id: string;
        change_order_commercial_snapshot_id: string;
        change_order_id: string;
        name: string;
        description: string | null;
        line_total: string | number;
      }> | null) ?? []
    )
      .map((row) => {
        const latestSnapshot = latestSnapshotByChangeOrderId.get(row.change_order_id);

        if (
          !latestSnapshot ||
          latestSnapshot.id !== row.change_order_commercial_snapshot_id
        ) {
          return null;
        }

        return {
          id: row.id,
          changeOrderId: row.change_order_id,
          projectId: latestSnapshot.project_id,
          invoiceId: latestSnapshot.invoice_id,
          name: row.name,
          description: row.description,
          lineTotal: Number(row.line_total).toFixed(2)
        };
      })
      .filter(
        (
          row
        ): row is InvoiceSourceOptions["changeOrderSnapshotItems"][number] =>
          Boolean(row)
      )
  };
});

export async function getInvoiceById(
  invoiceId: string,
  next = "/invoices"
): Promise<InvoiceDetail | null> {
  const scope = await requireInvoiceScope(next);
  const [invoice, lineItems, payments, paymentEvents] = await Promise.all([
    getInvoiceRecordById(scope.organizationId, invoiceId),
    getInvoiceLineItems(scope.organizationId, invoiceId),
    listInvoicePayments(scope.organizationId, invoiceId),
    listInvoicePaymentEvents(scope.organizationId, invoiceId)
  ]);

  if (!invoice) {
    return null;
  }

  return {
    ...mapInvoice(invoice),
    customer: invoice.customers
      ? {
          id: invoice.customers.id,
          name: invoice.customers.name,
          companyName: invoice.customers.company_name,
          phone: invoice.customers.phone,
          email: invoice.customers.email,
          isTaxExempt: invoice.customers.is_tax_exempt,
          retainagePercentageDefault: Number(
            invoice.customers.retainage_percentage_default
          ).toFixed(2)
        }
      : null,
    project: invoice.projects
      ? {
          id: invoice.projects.id,
          name: invoice.projects.name,
          status: invoice.projects.status
        }
      : null,
    estimate: invoice.estimates
      ? {
          id: invoice.estimates.id,
          referenceNumber: invoice.estimates.reference_number,
          status: invoice.estimates.status
        }
      : null,
    job: invoice.jobs
      ? {
          id: invoice.jobs.id,
          dispatchStatus: invoice.jobs.dispatch_status
        }
      : null,
    lineItems,
    payments,
    paymentEvents,
    paidAmount: calculatePaidAmount(payments)
  };
}

export async function createInvoice(input: InvoiceInput) {
  const scope = await requireInvoiceScope("/invoices");
  const project = await resolveScopedProject(input.projectId, "/invoices");
  const estimate = await resolveApprovedEstimate(
    input.estimateId,
    input.projectId,
    "/invoices"
  );
  const job = await resolveScopedJob(input.jobId, input.projectId, "/invoices");
  const resolvedEstimateId = estimate?.id ?? job?.estimateId ?? null;

  validateConnectedRecords(resolvedEstimateId, job);
  await assertInvoiceCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: project.id,
    jobId: job?.id ?? null,
    workflowRole: input.workflowRole
  });

  if (resolvedEstimateId) {
    await ensureScheduleOfValuesForEstimate(resolvedEstimateId);
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .insert({
      company_id: scope.organizationId,
      customer_id: project.customerId,
      project_id: project.id,
      estimate_id: resolvedEstimateId,
      job_id: input.workflowRole === "deposit" ? null : (job?.id ?? null),
      billing_model: resolvedEstimateId ? "estimate_derived" : "standard",
      workflow_role: input.workflowRole,
      status: input.status,
      issue_date: input.issueDate,
      due_date: input.dueDate,
      discount_amount: input.discountAmount,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error || !isIdRow(data)) {
    throw new Error(`Unable to create the invoice: ${error?.message ?? "Unknown error."}`);
  }

  const invoice = await getInvoiceRecordById(scope.organizationId, data.id);

  if (!invoice) {
    throw new Error("Unexpected invoice response after create.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: invoice.project_id
  });

  if (invoice.status === "sent") {
    await recordInvoiceNotificationEvent({
      organizationId: scope.organizationId,
      invoiceId: invoice.id,
      customerId: invoice.customer_id,
      projectId: invoice.project_id,
      invoiceReferenceNumber: invoice.reference_number,
      eventType: "sent",
      actorType: "organization_user",
      actorUserId: scope.userId,
      occurredAt: invoice.updated_at
    });
  }

  return mapInvoice(invoice);
}

export async function updateInvoice(invoiceId: string, input: InvoiceInput) {
  const scope = await requireInvoiceScope(`/invoices/${invoiceId}`);
  const currentInvoice = await getInvoiceRecordById(scope.organizationId, invoiceId);

  if (!currentInvoice) {
    throw new Error("Invoice not found for this organization.");
  }

  if (currentInvoice.billing_model === "aia_progress") {
    throw new Error(
      "Progress-billed invoices must be updated from the schedule-of-values workspace."
    );
  }

  const project = await resolveScopedProject(input.projectId, `/invoices/${invoiceId}`);
  const estimate = await resolveApprovedEstimate(
    input.estimateId,
    input.projectId,
    `/invoices/${invoiceId}`
  );
  const job = await resolveScopedJob(input.jobId, input.projectId, `/invoices/${invoiceId}`);
  const resolvedEstimateId = estimate?.id ?? job?.estimateId ?? null;

  validateConnectedRecords(resolvedEstimateId, job);
  await assertInvoiceCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: project.id,
    jobId: job?.id ?? null,
    workflowRole: input.workflowRole
  });

  if (resolvedEstimateId) {
    await ensureScheduleOfValuesForEstimate(resolvedEstimateId);
  }

  const existingLineItems = await getInvoiceLineItems(scope.organizationId, invoiceId);
  const isLegacyInvoice = hasLegacyInvoiceLineItems(existingLineItems);

  if (
    shouldRequireManualAdjustmentQuantities(input.status, input.sourceConfiguration)
  ) {
    throw new Error("Manual invoice items must have quantity greater than zero before send.");
  }

  const nextBillingModel =
    input.sourceConfiguration?.baseSourceType === "estimate_snapshot"
      ? "estimate_derived"
      : currentInvoice.billing_model === "aia_progress"
        ? currentInvoice.billing_model
        : "standard";

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .update({
      customer_id: project.customerId,
      project_id: project.id,
      estimate_id: resolvedEstimateId,
      job_id: input.workflowRole === "deposit" ? null : (job?.id ?? null),
      billing_model: nextBillingModel,
      workflow_role: input.workflowRole,
      status: input.status,
      issue_date: input.issueDate,
      due_date: input.dueDate,
      discount_amount: input.discountAmount,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", invoiceId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update the invoice: ${error.message}`);
  }

  if (!isIdRow(data)) {
    throw new Error("Invoice not found for this organization.");
  }

  if (input.sourceConfiguration) {
    if (isLegacyInvoice && existingLineItems.length > 0) {
      throw new Error(
        "Legacy invoice rows are preserved as-is. Create a new invoice to use the source-system builder."
      );
    }

    const nextLineItems = await buildInvoiceLineItemsFromSourceConfiguration({
      organizationId: scope.organizationId,
      estimateId: resolvedEstimateId,
      sourceConfiguration: input.sourceConfiguration
    });

    await replaceCanonicalInvoiceLineItems(
      scope.organizationId,
      scope.userId,
      invoiceId,
      nextLineItems
    );
  }

  const invoice = await getInvoiceRecordById(scope.organizationId, invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: invoice.project_id
  });

  if (currentInvoice.status !== invoice.status) {
    if (invoice.status === "sent") {
      await recordInvoiceNotificationEvent({
        organizationId: scope.organizationId,
        invoiceId: invoice.id,
        customerId: invoice.customer_id,
        projectId: invoice.project_id,
        invoiceReferenceNumber: invoice.reference_number,
        eventType: "sent",
        actorType: "organization_user",
        actorUserId: scope.userId,
        occurredAt: invoice.updated_at
      });
    }

    if (invoice.status === "void") {
      await recordInvoiceNotificationEvent({
        organizationId: scope.organizationId,
        invoiceId: invoice.id,
        customerId: invoice.customer_id,
        projectId: invoice.project_id,
        invoiceReferenceNumber: invoice.reference_number,
        eventType: "voided",
        actorType: "organization_user",
        actorUserId: scope.userId,
        occurredAt: invoice.updated_at
      });
    }
  }

  return mapInvoice(invoice);
}

export async function recordInvoicePayment(input: InvoicePaymentInput) {
  const scope = await requireInvoiceScope(`/invoices/${input.invoiceId}`);
  const invoice = await getInvoiceRecordById(scope.organizationId, input.invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  if (invoice.status === "void") {
    throw new Error("Void invoices cannot accept recorded payments.");
  }

  if (Number(input.amount) > Number(invoice.balance_due_amount)) {
    throw new Error("Payment amount cannot be greater than the current balance due.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .insert({
      company_id: scope.organizationId,
      invoice_id: input.invoiceId,
      amount: input.amount,
      payment_date: input.paymentDate,
      payment_method: input.paymentMethod,
      payment_source: "manual",
      recorded_via: "contractor_app",
      reference: input.reference,
      notes: input.notes,
      status: "recorded",
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error || !isIdRow(data)) {
    throw new Error(`Unable to record payment: ${error?.message ?? "Unknown error."}`);
  }

  const updatedInvoice = await getInvoiceRecordById(scope.organizationId, input.invoiceId);

  if (!updatedInvoice) {
    throw new Error("Invoice not found for this organization.");
  }

  await syncInvoiceProjectReadiness(updatedInvoice);

  return mapInvoice(updatedInvoice);
}

export async function requestInvoicePayment(
  input: InvoiceCustomerPaymentRequestInput,
  next = "/portal"
) {
  const portalScope = await getScopedPortalInvoice(input.invoiceId, next);

  if (input.portalUserId !== portalScope.userId) {
    throw new Error("This payment request is not available for the current portal user.");
  }

  assertInvoiceAllowsCustomerPayment(portalScope.invoice, input.amount, "request");

  await insertPaymentEventsAdmin(portalScope.invoice.company_id, input.invoiceId, [
    {
      eventType: "payment_requested",
      actorType: "portal_user",
      portalUserId: portalScope.userId,
      payload: {
        amount: input.amount,
        payerEmail: input.payerEmail,
        notes: input.notes
      },
      occurredAt: input.occurredAt ?? undefined
    }
  ]);
  await recordInvoiceNotificationEvent({
    organizationId: portalScope.invoice.company_id,
    invoiceId: portalScope.invoice.id,
    customerId: portalScope.invoice.customer_id,
    projectId: portalScope.invoice.project_id,
    invoiceReferenceNumber: portalScope.invoice.reference_number,
    eventType: "payment_requested",
    actorType: "portal_user",
    portalUserId: portalScope.userId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    payload: {
      amount: input.amount,
      payerEmail: input.payerEmail,
      notes: input.notes
    }
  });

  return mapInvoice(portalScope.invoice);
}

export async function ensurePendingPortalInvoicePayment(input: {
  actorType: PaymentEventActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  invoiceId: string;
  amount: string;
  gatewayProvider: string;
  payerEmail?: string | null;
  notes?: string | null;
  occurredAt?: string | null;
}, next = "/portal") {
  const portalScope = await getScopedPortalInvoice(input.invoiceId, next);

  if (input.portalUserId !== portalScope.userId) {
    throw new Error("This checkout payment is not available for the current portal user.");
  }

  assertInvoiceAllowsCustomerPayment(portalScope.invoice, input.amount, "checkout");

  const paymentDate =
    input.occurredAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  const existingPayment = await findPendingPaymentForInvoice(
    portalScope.invoice.company_id,
    input.invoiceId,
    input.gatewayProvider
  );
  const admin = getSupabaseAdminClient();

  if (existingPayment) {
    const updateResponse = await admin
      .from("payments")
      .update({
        amount: input.amount,
        payment_date: paymentDate,
        payment_method: getPendingCheckoutPaymentMethod(input.gatewayProvider),
        payment_source: "customer_portal",
        recorded_via: resolveRecordedVia(input.actorType),
        gateway_provider: input.gatewayProvider,
        gateway_status: "pending",
        payment_method_summary: null,
        payer_user_id: input.portalUserId ?? input.actorUserId ?? null,
        payer_email: input.payerEmail ?? null,
        notes: input.notes ?? null,
        updated_by: input.actorUserId ?? input.portalUserId ?? null
      })
      .eq("company_id", portalScope.invoice.company_id)
      .eq("invoice_id", input.invoiceId)
      .eq("id", existingPayment.id)
      .select(
        `
          id,
          company_id,
          invoice_id,
          amount,
          payment_date,
          payment_method,
          payment_source,
          recorded_via,
          gateway_provider,
          gateway_payment_intent_reference,
          gateway_checkout_session_reference,
          gateway_status,
          payment_method_summary,
          payer_user_id,
          payer_email,
          reference,
          notes,
          status,
          created_at,
          updated_at
        `
      )
      .single();
    const updateData: unknown = updateResponse.data;

    if (updateResponse.error || !isPaymentRow(updateData)) {
      throw new Error(
        `Unable to prepare the canonical checkout payment: ${updateResponse.error?.message ?? "Unknown error."}`
      );
    }

    return {
      invoice: mapInvoice(portalScope.invoice),
      payment: mapPayment(updateData)
    };
  }

  const insertResponse = await admin
    .from("payments")
    .insert({
      company_id: portalScope.invoice.company_id,
      invoice_id: input.invoiceId,
      amount: input.amount,
      payment_date: paymentDate,
      payment_method: getPendingCheckoutPaymentMethod(input.gatewayProvider),
      payment_source: "customer_portal",
      recorded_via: resolveRecordedVia(input.actorType),
      gateway_provider: input.gatewayProvider,
      gateway_status: "pending",
      payment_method_summary: null,
      payer_user_id: input.portalUserId ?? input.actorUserId ?? null,
      payer_email: input.payerEmail ?? null,
      notes: input.notes ?? null,
      status: "pending",
      created_by: input.actorUserId ?? input.portalUserId ?? null,
      updated_by: input.actorUserId ?? input.portalUserId ?? null
    })
    .select(
      `
        id,
        company_id,
        invoice_id,
        amount,
        payment_date,
        payment_method,
        payment_source,
        recorded_via,
        gateway_provider,
        gateway_payment_intent_reference,
        gateway_checkout_session_reference,
        gateway_status,
        payment_method_summary,
        payer_user_id,
        payer_email,
        reference,
        notes,
        status,
        created_at,
        updated_at
      `
    )
    .single();
  const insertData: unknown = insertResponse.data;

  if (insertResponse.error || !isPaymentRow(insertData)) {
    throw new Error(
      `Unable to create the canonical checkout payment: ${insertResponse.error?.message ?? "Unknown error."}`
    );
  }

  return {
    invoice: mapInvoice(portalScope.invoice),
    payment: mapPayment(insertData)
  };
}

export async function startInvoiceCheckout(
  input: InvoiceCheckoutStartInput,
  next = "/portal"
) {
  const portalScope = await getScopedPortalInvoice(input.invoiceId, next);

  if (input.portalUserId !== portalScope.userId) {
    throw new Error("This checkout session is not available for the current portal user.");
  }

  assertInvoiceAllowsCustomerPayment(portalScope.invoice, input.amount, "checkout");

  const payment = await findInvoicePaymentById(
    portalScope.invoice.company_id,
    input.invoiceId,
    input.paymentId,
    true
  );

  if (!payment) {
    throw new Error("The canonical checkout payment could not be found for this invoice.");
  }

  if (payment.status === "void") {
    throw new Error("A voided canonical payment cannot start checkout.");
  }

  if (payment.status === "recorded") {
    throw new Error("A completed canonical payment does not need a new checkout session.");
  }

  if (Number(payment.amount) !== Number(input.amount)) {
    throw new Error("Checkout amount must match the canonical pending payment amount.");
  }

  const admin = getSupabaseAdminClient();
  const updateResponse = await admin
    .from("payments")
    .update({
      payment_method: getPendingCheckoutPaymentMethod(input.gatewayProvider),
      payment_source: "customer_portal",
      recorded_via: resolveRecordedVia(input.actorType),
      gateway_provider: input.gatewayProvider,
      gateway_payment_intent_reference: input.gatewayPaymentIntentReference,
      gateway_checkout_session_reference: input.gatewayCheckoutSessionReference,
      gateway_status: input.gatewayStatus,
      payment_method_summary: null,
      payer_user_id: input.portalUserId ?? input.actorUserId ?? null,
      payer_email: input.payerEmail,
      reference:
        input.gatewayPaymentIntentReference ?? input.gatewayCheckoutSessionReference,
      updated_by: input.actorUserId ?? input.portalUserId ?? null
    })
    .eq("company_id", portalScope.invoice.company_id)
    .eq("invoice_id", input.invoiceId)
    .eq("id", input.paymentId)
    .select("id")
    .single();
  const updateData: unknown = updateResponse.data;

  if (updateResponse.error || !isIdRow(updateData)) {
    throw new Error(
      `Unable to attach checkout metadata to the canonical payment: ${updateResponse.error?.message ?? "Unknown error."}`
    );
  }

  await insertPaymentEventsAdmin(portalScope.invoice.company_id, input.invoiceId, [
    {
      paymentId: input.paymentId,
      eventType: "checkout_started",
      actorType: input.actorType,
      actorUserId: input.actorUserId,
      portalUserId: input.portalUserId ?? portalScope.userId,
      gatewayProvider: input.gatewayProvider,
      payload: {
        amount: input.amount,
        gatewayProvider: input.gatewayProvider,
        gatewayCheckoutSessionReference: input.gatewayCheckoutSessionReference,
        gatewayPaymentIntentReference: input.gatewayPaymentIntentReference,
        gatewayStatus: input.gatewayStatus,
        payerEmail: input.payerEmail,
        ...(input.payload ?? {})
      },
      occurredAt: input.occurredAt ?? undefined
    }
  ]);

  return mapInvoice(portalScope.invoice);
}

export async function recordInvoicePaymentSuccess(input: InvoicePaymentSuccessInput) {
  const invoice = await getInvoiceRecordByIdAdmin(input.organizationId, input.invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  const existingPayment = await findPaymentByGatewayReference(
    input.organizationId,
    input.invoiceId,
    {
      gatewayProvider: input.gatewayProvider,
      gatewayPaymentIntentReference: input.gatewayPaymentIntentReference,
      gatewayCheckoutSessionReference: input.gatewayCheckoutSessionReference
    }
  );

  if (!existingPayment) {
    assertInvoiceAllowsCustomerPayment(invoice, input.amount, "success");
  } else if (existingPayment.status === "void") {
    throw new Error("A voided canonical payment cannot be finalized as successful.");
  } else if (Number(existingPayment.amount) !== Number(input.amount)) {
    throw new Error("Existing canonical payment amount does not match this payment success.");
  }

  const admin = getSupabaseAdminClient();
  const paymentDate =
    input.paymentDate ??
    (input.occurredAt ? input.occurredAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
  let paymentId = existingPayment?.id ?? null;

  if (existingPayment) {
    const updateResponse = await admin
      .from("payments")
      .update({
        payment_method: input.paymentMethod,
        payment_source: "customer_portal",
        recorded_via: resolveRecordedVia(input.actorType),
        gateway_provider: input.gatewayProvider,
        gateway_payment_intent_reference: input.gatewayPaymentIntentReference,
        gateway_checkout_session_reference: input.gatewayCheckoutSessionReference,
        gateway_status: input.gatewayStatus,
        payment_method_summary: input.paymentMethodSummary,
        payer_user_id: input.portalUserId ?? input.actorUserId ?? null,
        payer_email: input.payerEmail,
        reference:
          input.reference ??
          input.gatewayPaymentIntentReference ??
          input.gatewayCheckoutSessionReference,
        notes: input.notes,
        status: "recorded",
        updated_by: input.actorUserId ?? input.portalUserId ?? null
      })
      .eq("company_id", input.organizationId)
      .eq("id", existingPayment.id)
      .select("id")
      .single();
    const updateData: unknown = updateResponse.data;

    if (updateResponse.error || !isIdRow(updateData)) {
      throw new Error(
        `Unable to update the canonical payment: ${updateResponse.error?.message ?? "Unknown error."}`
      );
    }

    paymentId = updateData.id;
  } else {
    const insertResponse = await admin
      .from("payments")
      .insert({
        company_id: input.organizationId,
        invoice_id: input.invoiceId,
        amount: input.amount,
        payment_date: paymentDate,
        payment_method: input.paymentMethod,
        payment_source: "customer_portal",
        recorded_via: resolveRecordedVia(input.actorType),
        gateway_provider: input.gatewayProvider,
        gateway_payment_intent_reference: input.gatewayPaymentIntentReference,
        gateway_checkout_session_reference: input.gatewayCheckoutSessionReference,
        gateway_status: input.gatewayStatus,
        payment_method_summary: input.paymentMethodSummary,
        payer_user_id: input.portalUserId ?? input.actorUserId ?? null,
        payer_email: input.payerEmail,
        reference:
          input.reference ??
          input.gatewayPaymentIntentReference ??
          input.gatewayCheckoutSessionReference,
        notes: input.notes,
        status: "recorded",
        created_by: input.actorUserId ?? input.portalUserId ?? null,
        updated_by: input.actorUserId ?? input.portalUserId ?? null
      })
      .select("id")
      .single();
    const insertData: unknown = insertResponse.data;

    if (insertResponse.error || !isIdRow(insertData)) {
      throw new Error(
        `Unable to finalize the canonical payment: ${insertResponse.error?.message ?? "Unknown error."}`
      );
    }

    paymentId = insertData.id;
  }

  await insertPaymentEventsAdmin(input.organizationId, input.invoiceId, [
    {
      paymentId,
      eventType: "payment_succeeded",
      actorType: input.actorType,
      actorUserId: input.actorUserId,
      portalUserId: input.portalUserId,
      gatewayProvider: input.gatewayProvider,
      providerEventId: input.providerEventId,
      payload: {
        amount: input.amount,
        gatewayProvider: input.gatewayProvider,
        gatewayPaymentIntentReference: input.gatewayPaymentIntentReference,
        gatewayCheckoutSessionReference: input.gatewayCheckoutSessionReference,
        gatewayStatus: input.gatewayStatus,
        paymentMethodSummary: input.paymentMethodSummary,
        payerEmail: input.payerEmail,
        ...(input.payload ?? {})
      },
      occurredAt: input.occurredAt ?? undefined
    }
  ]);

  const updatedInvoice = await getInvoiceRecordByIdAdmin(input.organizationId, input.invoiceId);

  if (!updatedInvoice) {
    throw new Error("Invoice not found for this organization.");
  }

  await syncInvoiceProjectReadiness(updatedInvoice);
  await recordInvoiceNotificationEvent({
    organizationId: updatedInvoice.company_id,
    invoiceId: updatedInvoice.id,
    customerId: updatedInvoice.customer_id,
    projectId: updatedInvoice.project_id,
    invoiceReferenceNumber: updatedInvoice.reference_number,
    eventType: "paid",
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    payload: {
      amount: input.amount,
      gatewayProvider: input.gatewayProvider,
      gatewayPaymentIntentReference: input.gatewayPaymentIntentReference,
      gatewayCheckoutSessionReference: input.gatewayCheckoutSessionReference,
      providerEventId: input.providerEventId ?? null
    }
  });

  return mapInvoice(updatedInvoice);
}

export async function recordInvoicePaymentFailure(input: InvoicePaymentFailureInput) {
  const invoice = await getInvoiceRecordByIdAdmin(input.organizationId, input.invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  if (invoice.status === "void") {
    throw new Error("Void invoices cannot accept payment failure events.");
  }

  const existingPayment = await findPaymentByGatewayReference(
    input.organizationId,
    input.invoiceId,
    {
      gatewayProvider: input.gatewayProvider,
      gatewayPaymentIntentReference: input.gatewayPaymentIntentReference,
      gatewayCheckoutSessionReference: input.gatewayCheckoutSessionReference
    }
  );

  if (existingPayment && existingPayment.status !== "recorded" && existingPayment.status !== "void") {
    const admin = getSupabaseAdminClient();
    const updateResponse = await admin
      .from("payments")
      .update({
        gateway_provider: input.gatewayProvider,
        gateway_payment_intent_reference: input.gatewayPaymentIntentReference,
        gateway_checkout_session_reference: input.gatewayCheckoutSessionReference,
        gateway_status: input.gatewayStatus ?? "failed",
        payer_email: input.payerEmail,
        notes: input.notes,
        updated_by: input.actorUserId ?? input.portalUserId ?? null
      })
      .eq("company_id", input.organizationId)
      .eq("invoice_id", input.invoiceId)
      .eq("id", existingPayment.id)
      .select("id")
      .single();
    const updateData: unknown = updateResponse.data;

    if (updateResponse.error || !isIdRow(updateData)) {
      throw new Error(
        `Unable to update the canonical payment failure state: ${updateResponse.error?.message ?? "Unknown error."}`
      );
    }
  }

  await insertPaymentEventsAdmin(input.organizationId, input.invoiceId, [
    {
      paymentId: existingPayment?.id ?? null,
      eventType: "payment_failed",
      actorType: input.actorType,
      actorUserId: input.actorUserId,
      portalUserId: input.portalUserId,
      gatewayProvider: input.gatewayProvider,
      providerEventId: input.providerEventId,
      payload: {
        amount: input.amount,
        gatewayProvider: input.gatewayProvider,
        gatewayPaymentIntentReference: input.gatewayPaymentIntentReference,
        gatewayCheckoutSessionReference: input.gatewayCheckoutSessionReference,
        gatewayStatus: input.gatewayStatus,
        payerEmail: input.payerEmail,
        notes: input.notes,
        ...(input.payload ?? {})
      },
      occurredAt: input.occurredAt ?? undefined
    }
  ]);
  await recordInvoiceNotificationEvent({
    organizationId: invoice.company_id,
    invoiceId: invoice.id,
    customerId: invoice.customer_id,
    projectId: invoice.project_id,
    invoiceReferenceNumber: invoice.reference_number,
    eventType: "failed",
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    payload: {
      amount: input.amount,
      gatewayProvider: input.gatewayProvider,
      providerEventId: input.providerEventId ?? null
    }
  });

  return mapInvoice(invoice);
}

export async function voidInvoicePayment(input: InvoicePaymentVoidInput) {
  const scope = await requireInvoiceScope(`/invoices/${input.invoiceId}`);
  const invoice = await getInvoiceRecordById(scope.organizationId, input.invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  const payment = await findInvoicePaymentById(
    scope.organizationId,
    input.invoiceId,
    input.paymentId
  );

  if (!payment) {
    throw new Error("Payment not found for this invoice.");
  }

  if (!canTransitionPaymentStatus(payment.status, "void")) {
    throw new Error("This payment cannot be voided from its current status.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .update({
      status: "void",
      gateway_status: "void",
      updated_by: input.actorUserId ?? scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("invoice_id", input.invoiceId)
    .eq("id", input.paymentId)
    .select("id")
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error || !isIdRow(data)) {
    throw new Error(`Unable to void payment: ${error?.message ?? "Unknown error."}`);
  }

  await recordPaymentEvent({
    organizationId: scope.organizationId,
    invoiceId: input.invoiceId,
    paymentId: input.paymentId,
    eventType: "payment_voided",
    actorType: input.actorType,
    actorUserId: input.actorUserId ?? scope.userId,
    portalUserId: input.portalUserId,
    gatewayProvider: payment.gateway_provider,
    providerEventId: input.providerEventId,
    payload: {
      notes: input.notes,
      ...(input.payload ?? {})
    },
    occurredAt: input.occurredAt ?? undefined
  });

  const updatedInvoice = await getInvoiceRecordById(scope.organizationId, input.invoiceId);

  if (!updatedInvoice) {
    throw new Error("Invoice not found for this organization.");
  }

  await syncInvoiceProjectReadiness(updatedInvoice);
  await recordInvoiceNotificationEvent({
    organizationId: updatedInvoice.company_id,
    invoiceId: updatedInvoice.id,
    customerId: updatedInvoice.customer_id,
    projectId: updatedInvoice.project_id,
    invoiceReferenceNumber: updatedInvoice.reference_number,
    eventType: "voided",
    actorType: input.actorType,
    actorUserId: input.actorUserId ?? scope.userId,
    portalUserId: input.portalUserId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    payload: {
      paymentId: input.paymentId
    }
  });

  return mapInvoice(updatedInvoice);
}

async function voidInvoicePaymentFromProvider(input: {
  organizationId: string;
  invoiceId: string;
  paymentId: string;
  gatewayProvider: string;
  gatewayStatus: string | null;
  providerEventId: string;
  notes?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string | null;
}) {
  const invoice = await getInvoiceRecordByIdAdmin(input.organizationId, input.invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  const payment = await findInvoicePaymentById(
    input.organizationId,
    input.invoiceId,
    input.paymentId,
    true
  );

  if (!payment) {
    throw new Error("Canonical payment not found for this provider callback.");
  }

  if (payment.status !== "void") {
    if (!canTransitionPaymentStatus(payment.status, "void")) {
      throw new Error("This canonical payment cannot be voided from its current status.");
    }

    const admin = getSupabaseAdminClient();
    const response = await admin
      .from("payments")
      .update({
        gateway_provider: input.gatewayProvider,
        gateway_status: input.gatewayStatus ?? "void",
        status: "void"
      })
      .eq("company_id", input.organizationId)
      .eq("invoice_id", input.invoiceId)
      .eq("id", input.paymentId)
      .select("id")
      .single();
    const data: unknown = response.data;

    if (response.error || !isIdRow(data)) {
      throw new Error(
        `Unable to void the canonical payment from provider callback: ${response.error?.message ?? "Unknown error."}`
      );
    }
  }

  await insertPaymentEventsAdmin(input.organizationId, input.invoiceId, [
    {
      paymentId: input.paymentId,
      eventType: "payment_voided",
      actorType: "provider",
      gatewayProvider: input.gatewayProvider,
      providerEventId: input.providerEventId,
      payload: {
        gatewayStatus: input.gatewayStatus,
        notes: input.notes,
        ...(input.payload ?? {})
      },
      occurredAt: input.occurredAt ?? undefined
    }
  ]);

  const updatedInvoice = await getInvoiceRecordByIdAdmin(input.organizationId, input.invoiceId);

  if (!updatedInvoice) {
    throw new Error("Invoice not found for this organization.");
  }

  await syncInvoiceProjectReadiness(updatedInvoice);
  await recordInvoiceNotificationEvent({
    organizationId: updatedInvoice.company_id,
    invoiceId: updatedInvoice.id,
    customerId: updatedInvoice.customer_id,
    projectId: updatedInvoice.project_id,
    invoiceReferenceNumber: updatedInvoice.reference_number,
    eventType: "voided",
    actorType: "provider",
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    payload: {
      paymentId: input.paymentId,
      providerEventId: input.providerEventId
    }
  });

  return mapInvoice(updatedInvoice);
}

export async function processProviderPaymentWebhookEvent(
  event: PaymentGatewayWebhookEvent
) {
  if (!event.organizationId || !event.invoiceId) {
    return {
      handled: false,
      duplicate: false,
      reason: "missing_canonical_references"
    } as const;
  }

  const existingEvent = await findPaymentEventByProviderReference(
    event.organizationId,
    event.gatewayProvider,
    event.providerEventId
  );

  if (existingEvent) {
    return {
      handled: true,
      duplicate: true,
      reason: "duplicate_provider_event",
      invoice: await getInvoiceByIdAdminSafe(event.organizationId, event.invoiceId)
    } as const;
  }

  if (event.outcome === "ignore") {
    return {
      handled: false,
      duplicate: false,
      reason: "ignored_event_type"
    } as const;
  }

  if (event.paymentId) {
    const referencedPayment = await findInvoicePaymentById(
      event.organizationId,
      event.invoiceId,
      event.paymentId,
      true
    );

    if (referencedPayment && referencedPayment.status !== "void") {
      const admin = getSupabaseAdminClient();
      const response = await admin
        .from("payments")
        .update({
          gateway_provider: event.gatewayProvider,
          gateway_payment_intent_reference:
            event.gatewayPaymentIntentReference ??
            referencedPayment.gateway_payment_intent_reference,
          gateway_checkout_session_reference:
            event.gatewayCheckoutSessionReference ??
            referencedPayment.gateway_checkout_session_reference,
          gateway_status: event.gatewayStatus ?? referencedPayment.gateway_status,
          payer_email: event.payerEmail ?? referencedPayment.payer_email,
          updated_by: null
        })
        .eq("company_id", event.organizationId)
        .eq("invoice_id", event.invoiceId)
        .eq("id", event.paymentId)
        .select("id")
        .single();
      const data: unknown = response.data;

      if (response.error || !isIdRow(data)) {
        throw new Error(
          `Unable to attach provider references to the canonical payment: ${response.error?.message ?? "Unknown error."}`
        );
      }
    }
  }

  try {
    if (event.outcome === "success") {
      const invoice = await recordInvoicePaymentSuccess({
        actorType: "provider",
        actorUserId: null,
        portalUserId: null,
        organizationId: event.organizationId,
        invoiceId: event.invoiceId,
        amount: event.amount ?? "0.00",
        paymentDate: event.paymentDate,
        paymentMethod: event.paymentMethod ?? "Gateway payment",
        gatewayProvider: event.gatewayProvider,
        gatewayPaymentIntentReference: event.gatewayPaymentIntentReference,
        gatewayCheckoutSessionReference: event.gatewayCheckoutSessionReference,
        gatewayStatus: event.gatewayStatus,
        paymentMethodSummary: event.paymentMethodSummary,
        payerEmail: event.payerEmail,
        reference:
          event.gatewayPaymentIntentReference ?? event.gatewayCheckoutSessionReference,
        notes: event.notes,
        providerEventId: event.providerEventId,
        occurredAt: event.occurredAt,
        payload: event.payload
      });

      return {
        handled: true,
        duplicate: false,
        invoice
      } as const;
    }

    if (event.outcome === "failure") {
      const invoice = await recordInvoicePaymentFailure({
        actorType: "provider",
        actorUserId: null,
        portalUserId: null,
        organizationId: event.organizationId,
        invoiceId: event.invoiceId,
        amount: event.amount ?? "0.00",
        gatewayProvider: event.gatewayProvider,
        gatewayPaymentIntentReference: event.gatewayPaymentIntentReference,
        gatewayCheckoutSessionReference: event.gatewayCheckoutSessionReference,
        gatewayStatus: event.gatewayStatus,
        payerEmail: event.payerEmail,
        notes: event.notes,
        providerEventId: event.providerEventId,
        occurredAt: event.occurredAt,
        payload: event.payload
      });

      return {
        handled: true,
        duplicate: false,
        invoice
      } as const;
    }

    const paymentId =
      event.paymentId ??
      (
        await findPaymentByGatewayReference(event.organizationId, event.invoiceId, {
          gatewayProvider: event.gatewayProvider,
          gatewayPaymentIntentReference: event.gatewayPaymentIntentReference,
          gatewayCheckoutSessionReference: event.gatewayCheckoutSessionReference
        })
      )?.id ??
      null;

    if (!paymentId) {
      return {
        handled: false,
        duplicate: false,
        reason: "missing_canonical_payment"
      } as const;
    }

    const invoice = await voidInvoicePaymentFromProvider({
      organizationId: event.organizationId,
      invoiceId: event.invoiceId,
      paymentId,
      gatewayProvider: event.gatewayProvider,
      gatewayStatus: event.gatewayStatus,
      providerEventId: event.providerEventId,
      notes: event.notes,
      payload: event.payload,
      occurredAt: event.occurredAt
    });

    return {
      handled: true,
      duplicate: false,
      invoice
    } as const;
  } catch (error) {
    if (error instanceof DuplicateProviderPaymentEventError) {
      return {
        handled: true,
        duplicate: true,
        reason: "duplicate_provider_event",
        invoice: await getInvoiceByIdAdminSafe(event.organizationId, event.invoiceId)
      } as const;
    }

    throw error;
  }
}

export async function appendChangeOrderSnapshotItemsToInvoice(input: {
  organizationId: string;
  userId: string;
  invoiceId: string;
  changeOrderSnapshotItemIds: string[];
}) {
  const existingLineItems = await getInvoiceLineItems(input.organizationId, input.invoiceId);

  if (hasLegacyInvoiceLineItems(existingLineItems)) {
    throw new Error(
      "Legacy invoice rows are preserved as-is. Create a new invoice to use approved change-order snapshot billing."
    );
  }

  const existingSnapshotItemIds = new Set(
    existingLineItems
      .map((lineItem) => lineItem.changeOrderSnapshotItemId)
      .filter((value): value is string => typeof value === "string")
  );
  const nextSnapshotItemIds = input.changeOrderSnapshotItemIds.filter(
    (snapshotItemId) => !existingSnapshotItemIds.has(snapshotItemId)
  );

  if (nextSnapshotItemIds.length === 0) {
    return existingLineItems.filter((lineItem) =>
      input.changeOrderSnapshotItemIds.includes(lineItem.changeOrderSnapshotItemId ?? "")
    );
  }

  const snapshotLineItems = (
    await loadChangeOrderSnapshotItemsByIds(input.organizationId, nextSnapshotItemIds)
  ).map((snapshotItem) => mapChangeOrderSnapshotRowToInvoiceLineItem(snapshotItem));

  const nextLineItems = [
    ...existingLineItems.map((lineItem) => mapInvoiceLineItemToPersistedInput(lineItem)),
    ...snapshotLineItems
  ];

  await replaceCanonicalInvoiceLineItems(
    input.organizationId,
    input.userId,
    input.invoiceId,
    nextLineItems
  );

  const refreshedLineItems = await getInvoiceLineItems(input.organizationId, input.invoiceId);
  return refreshedLineItems.filter((lineItem) =>
    input.changeOrderSnapshotItemIds.includes(lineItem.changeOrderSnapshotItemId ?? "")
  );
}

async function getInvoiceByIdAdminSafe(organizationId: string, invoiceId: string) {
  const invoice = await getInvoiceRecordByIdAdmin(organizationId, invoiceId);
  return invoice ? mapInvoice(invoice) : null;
}
