import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  Payment,
  PaymentEvent,
  PaymentEventActorType,
  PaymentEventType,
  PaymentRecordedVia,
  PaymentSource,
  PaymentStatus
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PaymentsScope = {
  userId: string;
  organizationId: string;
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
  invoices?: {
    id: string;
    reference_number: string;
    workflow_role: string;
    status: string;
    balance_due_amount: string | number;
    total_amount: string | number;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
    projects?: {
      id: string;
      name: string;
      status: string;
    } | null;
  } | null;
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
  invoices?: {
    id: string;
    reference_number: string;
    workflow_role: string;
    status: string;
    balance_due_amount: string | number;
    total_amount: string | number;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
    projects?: {
      id: string;
      name: string;
      status: string;
    } | null;
  } | null;
};

export type PaymentListItem = Payment & {
  invoice: {
    id: string;
    referenceNumber: string;
    workflowRole: string;
    status: string;
    balanceDueAmount: string;
    totalAmount: string;
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
};

export type PaymentEventListItem = PaymentEvent & {
  invoice: {
    id: string;
    referenceNumber: string;
    workflowRole: string;
    status: string;
    balanceDueAmount: string;
    totalAmount: string;
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
};

export type DashboardRecentPayment = {
  id: string;
  invoiceId: string;
  amount: string;
  paymentMethod: string;
  paymentSource: PaymentSource;
  status: PaymentStatus;
  createdAt: string;
  invoice: {
    id: string;
    referenceNumber: string;
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

const paymentSelect = `
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
  updated_at,
  invoices (
    id,
    reference_number,
    workflow_role,
    status,
    balance_due_amount,
    total_amount,
    customers (
      id,
      name,
      company_name
    ),
    projects (
      id,
      name,
      status
    )
  )
`;

const dashboardRecentPaymentSelect = `
  id,
  invoice_id,
  amount,
  payment_method,
  payment_source,
  status,
  created_at,
  invoices (
    id,
    reference_number,
    customers (
      id,
      name,
      company_name
    ),
    projects (
      id,
      name
    )
  )
`;

const paymentEventSelect = `
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
  created_at,
  invoices (
    id,
    reference_number,
    workflow_role,
    status,
    balance_due_amount,
    total_amount,
    customers (
      id,
      name,
      company_name
    ),
    projects (
      id,
      name,
      status
    )
  )
`;

function isPaymentRow(value: unknown): value is PaymentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PaymentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.invoice_id === "string" &&
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

function isDashboardRecentPaymentRow(value: unknown): value is {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_method: string;
  payment_source: PaymentSource;
  status: PaymentStatus;
  created_at: string;
  invoices?: {
    id: string;
    reference_number: string;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
    projects?: {
      id: string;
      name: string;
    } | null;
  } | null;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as {
    id?: unknown;
    invoice_id?: unknown;
    amount?: unknown;
    payment_method?: unknown;
    payment_source?: unknown;
    status?: unknown;
    created_at?: unknown;
  };

  return (
    typeof row.id === "string" &&
    typeof row.invoice_id === "string" &&
    (typeof row.amount === "string" || typeof row.amount === "number") &&
    typeof row.payment_method === "string" &&
    typeof row.payment_source === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string"
  );
}

function isDashboardRecentPaymentRowArray(value: unknown): value is Array<{
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_method: string;
  payment_source: PaymentSource;
  status: PaymentStatus;
  created_at: string;
  invoices?: {
    id: string;
    reference_number: string;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
    projects?: {
      id: string;
      name: string;
    } | null;
  } | null;
}> {
  return (
    Array.isArray(value) &&
    value.every((row) => isDashboardRecentPaymentRow(row))
  );
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
    typeof row.occurred_at === "string" &&
    typeof row.created_at === "string"
  );
}

function isPaymentEventRowArray(value: unknown): value is PaymentEventRow[] {
  return Array.isArray(value) && value.every((row) => isPaymentEventRow(row));
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

function mapInvoiceSummary(
  invoice: PaymentRow["invoices"] | PaymentEventRow["invoices"]
) {
  return invoice
    ? {
        id: invoice.id,
        referenceNumber: invoice.reference_number,
        workflowRole: invoice.workflow_role,
        status: invoice.status,
        balanceDueAmount: Number(invoice.balance_due_amount).toFixed(2),
        totalAmount: Number(invoice.total_amount).toFixed(2)
      }
    : null;
}

function mapCustomerSummary(
  invoice: PaymentRow["invoices"] | PaymentEventRow["invoices"]
) {
  return invoice?.customers
    ? {
        id: invoice.customers.id,
        name: invoice.customers.name,
        companyName: invoice.customers.company_name
      }
    : null;
}

function mapProjectSummary(
  invoice: PaymentRow["invoices"] | PaymentEventRow["invoices"]
) {
  return invoice?.projects
    ? {
        id: invoice.projects.id,
        name: invoice.projects.name,
        status: invoice.projects.status
      }
    : null;
}

function mapPaymentListItem(row: PaymentRow): PaymentListItem {
  return {
    ...mapPayment(row),
    invoice: mapInvoiceSummary(row.invoices),
    customer: mapCustomerSummary(row.invoices),
    project: mapProjectSummary(row.invoices)
  };
}

function mapDashboardRecentPayment(row: {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_method: string;
  payment_source: PaymentSource;
  status: PaymentStatus;
  created_at: string;
  invoices?: {
    id: string;
    reference_number: string;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
    projects?: {
      id: string;
      name: string;
    } | null;
  } | null;
}): DashboardRecentPayment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: Number(row.amount).toFixed(2),
    paymentMethod: row.payment_method,
    paymentSource: row.payment_source,
    status: row.status,
    createdAt: row.created_at,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number
        }
      : null,
    customer: row.invoices?.customers
      ? {
          id: row.invoices.customers.id,
          name: row.invoices.customers.name,
          companyName: row.invoices.customers.company_name
        }
      : null,
    project: row.invoices?.projects
      ? {
          id: row.invoices.projects.id,
          name: row.invoices.projects.name
        }
      : null
  };
}

function mapPaymentEventListItem(row: PaymentEventRow): PaymentEventListItem {
  return {
    ...mapPaymentEvent(row),
    invoice: mapInvoiceSummary(row.invoices),
    customer: mapCustomerSummary(row.invoices),
    project: mapProjectSummary(row.invoices)
  };
}

async function getPaymentsScope(
  next = "/payments"
): Promise<PaymentsScope | null> {
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

export async function requirePaymentsScope(next = "/payments") {
  const scope = await getPaymentsScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for payments yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

export const listPayments = cache(async (): Promise<PaymentListItem[]> => {
  const scope = await requirePaymentsScope("/payments");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("company_id", scope.organizationId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load payments: ${response.error.message}`);
  }

  if (!isPaymentRowArray(data)) {
    return [];
  }

  return data.map(mapPaymentListItem);
});

export const listDashboardRecentPayments = cache(
  async (limit = 5): Promise<DashboardRecentPayment[]> => {
    const scope = await requirePaymentsScope("/payments");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("payments")
      .select(dashboardRecentPaymentSelect)
      .eq("company_id", scope.organizationId)
      .neq("status", "void")
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load dashboard recent payments: ${response.error.message}`
      );
    }

    if (!isDashboardRecentPaymentRowArray(data)) {
      return [];
    }

    return data.map(mapDashboardRecentPayment);
  }
);

export const listPaymentEvents = cache(
  async (): Promise<PaymentEventListItem[]> => {
    const scope = await requirePaymentsScope("/payments");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("payment_events")
      .select(paymentEventSelect)
      .eq("company_id", scope.organizationId)
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load payment events: ${response.error.message}`
      );
    }

    if (!isPaymentEventRowArray(data)) {
      return [];
    }

    return data.map(mapPaymentEventListItem);
  }
);
