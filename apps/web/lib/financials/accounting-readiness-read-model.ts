import "server-only";

import { cache } from "react";

import {
  buildAccountingReadiness,
  type AccountingReadinessInvoiceInput,
  type AccountingReadinessPaymentEventInput,
  type AccountingReadinessPaymentInput,
  type AccountingReadinessResult,
  type AccountingReadinessTaxSnapshotInput
} from "./accounting-readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type InvoiceRow = {
  id: string;
  customer_id: string | null;
  project_id: string | null;
  reference_number: string;
  status: string;
  issue_date: string | null;
  due_date: string | null;
  subtotal_amount: string | number;
  tax_amount: string | number;
  tax_collected_amount: string | number | null;
  retainage_held_amount: string | number | null;
  total_amount: string | number;
  balance_due_amount: string | number;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
};

type PaymentRow = {
  id: string;
  invoice_id: string | null;
  amount: string | number;
  payment_date: string | null;
  payment_method: string | null;
  payment_source: string | null;
  status: string;
  reference: string | null;
  created_at: string;
  invoices?: {
    id: string;
    reference_number: string;
    customers?: {
      id: string;
      name: string;
    } | null;
    projects?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type PaymentEventRow = {
  id: string;
  invoice_id: string | null;
  payment_id: string | null;
  event_type: string;
  occurred_at: string;
  invoices?: {
    id: string;
    reference_number: string;
    balance_due_amount: string | number;
    customers?: {
      id: string;
      name: string;
    } | null;
    projects?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type TaxSnapshotRow = {
  invoice_id: string;
  tax_collected_amount: string | number;
  taxable_sales_amount: string | number | null;
  exempt_sales_amount: string | number | null;
};

export type AccountingReadinessReadModel = AccountingReadinessResult;

const invoiceSelect = `
  id,
  customer_id,
  project_id,
  reference_number,
  status,
  issue_date,
  due_date,
  subtotal_amount,
  tax_amount,
  tax_collected_amount,
  retainage_held_amount,
  total_amount,
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

const paymentSelect = `
  id,
  invoice_id,
  amount,
  payment_date,
  payment_method,
  payment_source,
  status,
  reference,
  created_at,
  invoices (
    id,
    reference_number,
    customers (
      id,
      name
    ),
    projects (
      id,
      name
    )
  )
`;

const eventSelect = `
  id,
  invoice_id,
  payment_id,
  event_type,
  occurred_at,
  invoices (
    id,
    reference_number,
    balance_due_amount,
    customers (
      id,
      name
    ),
    projects (
      id,
      name
    )
  )
`;

function money(value: string | number | null | undefined) {
  return Number(value ?? 0).toFixed(2);
}

function mapInvoice(row: InvoiceRow): AccountingReadinessInvoiceInput {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotalAmount: money(row.subtotal_amount),
    taxAmount: money(row.tax_amount),
    taxCollectedAmount: money(row.tax_collected_amount),
    retainageHeldAmount: money(row.retainage_held_amount),
    totalAmount: money(row.total_amount),
    balanceDueAmount: money(row.balance_due_amount),
    updatedAt: row.updated_at,
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
          name: row.projects.name
        }
      : null
  };
}

function mapPayment(row: PaymentRow): AccountingReadinessPaymentInput {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: money(row.amount),
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    paymentSource: row.payment_source,
    status: row.status,
    reference: row.reference,
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
          name: row.invoices.customers.name
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

function mapPaymentEvent(
  row: PaymentEventRow
): AccountingReadinessPaymentEventInput {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    paymentId: row.payment_id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number,
          balanceDueAmount: money(row.invoices.balance_due_amount)
        }
      : null,
    customer: row.invoices?.customers
      ? {
          id: row.invoices.customers.id,
          name: row.invoices.customers.name
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

function mapTaxSnapshot(
  row: TaxSnapshotRow
): AccountingReadinessTaxSnapshotInput {
  return {
    invoiceId: row.invoice_id,
    taxCollectedAmount: money(row.tax_collected_amount),
    taxableSalesAmount: money(row.taxable_sales_amount),
    exemptSalesAmount: money(row.exempt_sales_amount)
  };
}

async function listAccountingInvoices(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("company_id", organizationId)
    .order("issue_date", { ascending: false })
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load accounting readiness invoices: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as InvoiceRow[]).map(mapInvoice)
    : [];
}

async function listAccountingPayments(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("company_id", organizationId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load accounting readiness payments: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PaymentRow[]).map(mapPayment)
    : [];
}

async function listAccountingPaymentEvents(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .select(eventSelect)
    .eq("company_id", organizationId)
    .in("event_type", [
      "payment_requested",
      "checkout_started",
      "payment_failed",
      "payment_voided"
    ])
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load accounting readiness payment events: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PaymentEventRow[]).map(mapPaymentEvent)
    : [];
}

async function listAccountingTaxSnapshots(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoice_tax_reporting_entries")
    .select(
      `
        invoice_id,
        tax_collected_amount,
        taxable_sales_amount,
        exempt_sales_amount
      `
    )
    .eq("company_id", organizationId);

  if (response.error) {
    throw new Error(
      `Unable to load accounting readiness tax snapshots: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as TaxSnapshotRow[]).map(mapTaxSnapshot)
    : [];
}

export const getAccountingReadinessReadModel = cache(
  async (input: {
    organizationId: string;
    todayIso: string;
  }): Promise<AccountingReadinessReadModel> => {
    const [invoices, payments, paymentEvents, taxSnapshots] = await Promise.all(
      [
        listAccountingInvoices(input.organizationId),
        listAccountingPayments(input.organizationId),
        listAccountingPaymentEvents(input.organizationId),
        listAccountingTaxSnapshots(input.organizationId)
      ]
    );

    return buildAccountingReadiness({
      invoices,
      payments,
      paymentEvents,
      taxSnapshots,
      todayIso: input.todayIso
    });
  }
);
