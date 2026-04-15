import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { compareInvoiceStatuses } from "@floorconnector/domain";
import type {
  Invoice as InvoiceRecord,
  InvoiceLineItem,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  TaxBehavior
} from "@floorconnector/types";

import type {
  InvoiceInput,
  InvoiceLineItemInput,
  InvoicePaymentInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById } from "@/lib/estimates/data";
import { ensureScheduleOfValuesForEstimate } from "@/lib/financial/sov";
import { getJobById } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getProjectById } from "@/lib/projects/data";
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
        status: string;
      }
    | null;
};

type InvoiceLineItemRow = {
  id: string;
  company_id: string;
  invoice_id: string;
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
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

type InvoiceScope = {
  userId: string;
  organizationId: string;
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
    status: string;
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
    status
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
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPaymentRowArray(value: unknown): value is PaymentRow[] {
  return Array.isArray(value) && value.every((row) => isPaymentRow(row));
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
    reference: row.reference,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
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
          status: row.jobs.status
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

async function replaceInvoiceLineItems(
  organizationId: string,
  userId: string,
  invoiceId: string,
  lineItems: InvoiceLineItemInput[]
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
  const [invoice, lineItems, payments] = await Promise.all([
    getInvoiceRecordById(scope.organizationId, invoiceId),
    getInvoiceLineItems(scope.organizationId, invoiceId),
    listInvoicePayments(scope.organizationId, invoiceId)
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
          status: invoice.jobs.status
        }
      : null,
    lineItems,
    payments,
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
      job_id: job?.id ?? null,
      billing_model: resolvedEstimateId ? "estimate_derived" : "standard",
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

  return mapInvoice(invoice);
}

export async function updateInvoice(invoiceId: string, input: InvoiceInput) {
  const scope = await requireInvoiceScope(`/invoices/${invoiceId}`);
  const project = await resolveScopedProject(input.projectId, `/invoices/${invoiceId}`);
  const estimate = await resolveApprovedEstimate(
    input.estimateId,
    input.projectId,
    `/invoices/${invoiceId}`
  );
  const job = await resolveScopedJob(input.jobId, input.projectId, `/invoices/${invoiceId}`);
  const resolvedEstimateId = estimate?.id ?? job?.estimateId ?? null;

  validateConnectedRecords(resolvedEstimateId, job);

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
      job_id: job?.id ?? null,
      billing_model: resolvedEstimateId ? "estimate_derived" : "standard",
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

  return mapInvoice(updatedInvoice);
}
