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
  InvoiceLineItemInput,
  InvoicePaymentInput,
  InvoicePaymentSuccessInput,
  InvoicePaymentVoidInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById } from "@/lib/estimates/data";
import { ensureScheduleOfValuesForEstimate } from "@/lib/financial/sov";
import { getJobById } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";
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
  schedule_of_value_item_id: string | null;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
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
    (row.schedule_of_value_item_id === null ||
      typeof row.schedule_of_value_item_id === "string") &&
    typeof row.name === "string" &&
    (typeof row.quantity === "string" || typeof row.quantity === "number") &&
    typeof row.unit === "string" &&
    (typeof row.unit_price === "string" || typeof row.unit_price === "number") &&
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
    scheduleOfValueItemId: row.schedule_of_value_item_id,
    name: row.name,
    description: row.description,
    quantity: Number(row.quantity).toFixed(2),
    unit: row.unit,
    unitPrice: Number(row.unit_price).toFixed(2),
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
        schedule_of_value_item_id,
        name,
        description,
        quantity,
        unit,
        unit_price,
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

type PersistedInvoiceLineItemInput = InvoiceLineItemInput & {
  scheduleOfValueItemId?: string | null;
};

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
      schedule_of_value_item_id: lineItem.scheduleOfValueItemId ?? null,
      name: lineItem.name,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      unit_price: lineItem.unitPrice,
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

  try {
    await replaceInvoiceLineItems(
      scope.organizationId,
      scope.userId,
      data.id,
      input.lineItems
    );
  } catch (lineItemError) {
    await supabase
      .from("invoices")
      .delete()
      .eq("company_id", scope.organizationId)
      .eq("id", data.id);

    throw lineItemError;
  }

  const invoice = await getInvoiceRecordById(scope.organizationId, data.id);

  if (!invoice) {
    throw new Error("Unexpected invoice response after create.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: invoice.project_id
  });

  return mapInvoice(invoice);
}

async function replaceInvoiceLineItems(
  organizationId: string,
  userId: string,
  invoiceId: string,
  lineItems: InvoiceLineItemInput[]
) {
  await replaceCanonicalInvoiceLineItems(
    organizationId,
    userId,
    invoiceId,
    lineItems
  );
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

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .update({
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

  await replaceInvoiceLineItems(
    scope.organizationId,
    scope.userId,
    invoiceId,
    input.lineItems
  );

  const invoice = await getInvoiceRecordById(scope.organizationId, invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found for this organization.");
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId: invoice.project_id
  });

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

async function getInvoiceByIdAdminSafe(organizationId: string, invoiceId: string) {
  const invoice = await getInvoiceRecordByIdAdmin(organizationId, invoiceId);
  return invoice ? mapInvoice(invoice) : null;
}
