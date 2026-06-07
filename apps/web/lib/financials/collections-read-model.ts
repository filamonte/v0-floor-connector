import "server-only";

import { cache } from "react";
import type { InvoiceStatus, InvoiceWorkflowRole } from "@floorconnector/types";

import {
  buildFinancialCollectionsSummary,
  getInvoiceAgingBucket,
  isOpenReceivableInvoice,
  type FinancialCollectionsEventType,
  type FinancialCollectionsSummary
} from "./collections-core";
import {
  buildFinancialControlSummary,
  type FinancialControlSummary
} from "./collections-summary";
import {
  buildCollectionsFollowUpIntelligence,
  type CollectionsFollowUpIntelligence
} from "./collections-follow-up-intelligence";
import {
  buildCollectionsCommandCenter,
  type CollectionsCommandCenter
} from "./collections-command-center";
import {
  buildBillingReadinessCommand,
  type BillingReadinessCommand
} from "./billing-readiness-command";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type FinancialCollectionsInvoice = {
  id: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  jobId: string | null;
  referenceNumber: string;
  workflowRole: InvoiceWorkflowRole;
  status: InvoiceStatus;
  billingModel: string;
  issueDate: string;
  dueDate: string | null;
  totalAmount: string;
  balanceDueAmount: string;
  retainageHeldAmount: string;
  updatedAt: string;
  agingBucket: ReturnType<typeof getInvoiceAgingBucket>;
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
  } | null;
  job: {
    id: string;
    dispatchStatus: string;
    scheduledDate: string | null;
  } | null;
};

export type FinancialCollectionsPayment = {
  id: string;
  invoiceId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  paymentSource: string;
  status: "pending" | "recorded" | "void";
  gatewayProvider: string | null;
  gatewayStatus: string | null;
  paymentMethodSummary: string | null;
  reference: string | null;
  createdAt: string;
  invoice: {
    id: string;
    referenceNumber: string;
    status: string;
    balanceDueAmount: string;
  } | null;
  customer: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type FinancialCollectionsEvent = {
  id: string;
  invoiceId: string;
  paymentId: string | null;
  eventType: FinancialCollectionsEventType;
  occurredAt: string;
  gatewayProvider: string | null;
  providerEventId: string | null;
  payment: {
    id: string;
    status: string;
    gatewayProvider: string | null;
    gatewayStatus: string | null;
  } | null;
  invoice: {
    id: string;
    referenceNumber: string;
    status: string;
    balanceDueAmount: string;
  } | null;
  customer: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type FinancialBillingReadinessJob = {
  id: string;
  projectId: string | null;
  estimateId: string | null;
  scheduledDate: string | null;
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

export type FinancialCollectionsReadModel = {
  summary: FinancialCollectionsSummary;
  financialControl: FinancialControlSummary;
  collectionsIntelligence: CollectionsFollowUpIntelligence;
  collectionsCommandCenter: CollectionsCommandCenter;
  billingReadinessCommand: BillingReadinessCommand;
  overdueInvoices: FinancialCollectionsInvoice[];
  collectionOpportunities: FinancialCollectionsInvoice[];
  partiallyPaidInvoices: FinancialCollectionsInvoice[];
  pendingPayments: FinancialCollectionsPayment[];
  recentRecordedPayments: FinancialCollectionsPayment[];
  attentionEvents: FinancialCollectionsEvent[];
  recentEvents: FinancialCollectionsEvent[];
};

type InvoiceRow = {
  id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  job_id: string | null;
  reference_number: string;
  workflow_role: InvoiceWorkflowRole;
  status: InvoiceStatus;
  billing_model: string;
  issue_date: string;
  due_date: string | null;
  total_amount: string | number;
  balance_due_amount: string | number;
  retainage_held_amount: string | number;
  updated_at: string;
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
  estimates?: {
    id: string;
    reference_number: string;
  } | null;
  jobs?: {
    id: string;
    dispatch_status: string;
    scheduled_date: string | null;
  } | null;
};

type PaymentRow = {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  payment_source: string;
  status: "pending" | "recorded" | "void";
  gateway_provider: string | null;
  gateway_status: string | null;
  payment_method_summary: string | null;
  reference: string | null;
  created_at: string;
  invoices?: {
    id: string;
    reference_number: string;
    status: string;
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

type EventRow = {
  id: string;
  invoice_id: string;
  payment_id: string | null;
  event_type: FinancialCollectionsEventType;
  occurred_at: string;
  gateway_provider: string | null;
  provider_event_id: string | null;
  payments?: {
    id: string;
    status: string;
    gateway_provider: string | null;
    gateway_status: string | null;
  } | null;
  invoices?: {
    id: string;
    reference_number: string;
    status: string;
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

type BillingReadinessJobRow = {
  id: string;
  project_id: string | null;
  estimate_id: string | null;
  scheduled_date: string | null;
  updated_at: string;
  projects?: {
    id: string;
    name: string;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
  } | null;
  estimates?: {
    id: string;
    reference_number: string;
  } | null;
};

const invoiceSelect = `
  id,
  customer_id,
  project_id,
  estimate_id,
  job_id,
  reference_number,
  workflow_role,
  status,
  billing_model,
  issue_date,
  due_date,
  total_amount,
  balance_due_amount,
  retainage_held_amount,
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
    reference_number
  ),
  jobs (
    id,
    dispatch_status,
    scheduled_date
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
  gateway_provider,
  gateway_status,
  payment_method_summary,
  reference,
  created_at,
  invoices (
    id,
    reference_number,
    status,
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

const eventSelect = `
  id,
  invoice_id,
  payment_id,
  event_type,
  occurred_at,
  gateway_provider,
  provider_event_id,
  payments (
    id,
    status,
    gateway_provider,
    gateway_status
  ),
  invoices (
    id,
    reference_number,
    status,
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

const billingReadinessJobSelect = `
  id,
  project_id,
  estimate_id,
  scheduled_date,
  updated_at,
  projects (
    id,
    name,
    customers (
      id,
      name,
      company_name
    )
  ),
  estimates (
    id,
    reference_number
  )
`;

function money(value: string | number) {
  return Number(value).toFixed(2);
}

function mapInvoice(
  row: InvoiceRow,
  todayIso: string
): FinancialCollectionsInvoice {
  const invoiceInput = {
    id: row.id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    billingModel: row.billing_model,
    dueDate: row.due_date,
    balanceDueAmount: money(row.balance_due_amount),
    retainageHeldAmount: money(row.retainage_held_amount),
    totalAmount: money(row.total_amount),
    updatedAt: row.updated_at
  };

  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    jobId: row.job_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    billingModel: row.billing_model,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    totalAmount: money(row.total_amount),
    balanceDueAmount: money(row.balance_due_amount),
    retainageHeldAmount: money(row.retainage_held_amount),
    updatedAt: row.updated_at,
    agingBucket: getInvoiceAgingBucket(invoiceInput, todayIso),
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
          name: row.projects.name,
          status: row.projects.status
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
          id: row.jobs.id,
          dispatchStatus: row.jobs.dispatch_status,
          scheduledDate: row.jobs.scheduled_date
        }
      : null
  };
}

function mapPayment(row: PaymentRow): FinancialCollectionsPayment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: money(row.amount),
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    paymentSource: row.payment_source,
    status: row.status,
    gatewayProvider: row.gateway_provider,
    gatewayStatus: row.gateway_status,
    paymentMethodSummary: row.payment_method_summary,
    reference: row.reference,
    createdAt: row.created_at,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number,
          status: row.invoices.status,
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

function mapEvent(row: EventRow): FinancialCollectionsEvent {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    paymentId: row.payment_id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    gatewayProvider: row.gateway_provider,
    providerEventId: row.provider_event_id,
    payment: row.payments
      ? {
          id: row.payments.id,
          status: row.payments.status,
          gatewayProvider: row.payments.gateway_provider,
          gatewayStatus: row.payments.gateway_status
        }
      : null,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number,
          status: row.invoices.status,
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

function mapBillingReadinessJob(
  row: BillingReadinessJobRow
): FinancialBillingReadinessJob {
  return {
    id: row.id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    scheduledDate: row.scheduled_date,
    updatedAt: row.updated_at,
    customer: row.projects?.customers
      ? {
          id: row.projects.customers.id,
          name: row.projects.customers.name,
          companyName: row.projects.customers.company_name
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
      : null
  };
}

function sortOpenInvoices(invoices: FinancialCollectionsInvoice[]) {
  return invoices.sort((left, right) => {
    const leftDue = left.dueDate ?? "9999-12-31";
    const rightDue = right.dueDate ?? "9999-12-31";
    const dueComparison = leftDue.localeCompare(rightDue);

    if (dueComparison !== 0) {
      return dueComparison;
    }

    return Number(right.balanceDueAmount) - Number(left.balanceDueAmount);
  });
}

async function listInvoiceInputs(input: {
  organizationId: string;
  todayIso: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("company_id", input.organizationId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load financial collections invoice inputs: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as InvoiceRow[]).map((row) =>
        mapInvoice(row, input.todayIso)
      )
    : [];
}

async function listPaymentInputs(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("company_id", organizationId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

  if (response.error) {
    throw new Error(
      `Unable to load financial collections payment inputs: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PaymentRow[]).map(mapPayment)
    : [];
}

async function listEventInputs(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .select(eventSelect)
    .eq("company_id", organizationId)
    .in("event_type", [
      "payment_requested",
      "checkout_started",
      "payment_succeeded",
      "payment_failed",
      "payment_voided",
      "provider_sync"
    ])
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

  if (response.error) {
    throw new Error(
      `Unable to load financial collections payment event inputs: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as EventRow[]).map(mapEvent)
    : [];
}

async function listBillingReadinessJobs(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(billingReadinessJobSelect)
    .eq("company_id", organizationId)
    .eq("dispatch_status", "completed")
    .order("updated_at", { ascending: false })
    .limit(40);

  if (response.error) {
    throw new Error(
      `Unable to load billing readiness job inputs: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as BillingReadinessJobRow[]).map(
        mapBillingReadinessJob
      )
    : [];
}

export const getFinancialCollectionsReadModel = cache(
  async (input: {
    organizationId: string;
    todayIso: string;
  }): Promise<FinancialCollectionsReadModel> => {
    const [invoices, payments, events, billingReadinessJobs] =
      await Promise.all([
        listInvoiceInputs(input),
        listPaymentInputs(input.organizationId),
        listEventInputs(input.organizationId),
        listBillingReadinessJobs(input.organizationId)
      ]);
    const openInvoices = invoices.filter(isOpenReceivableInvoice);
    const overdueInvoices = openInvoices.filter(
      (invoice) => invoice.dueDate !== null && invoice.dueDate < input.todayIso
    );
    const partiallyPaidInvoices = openInvoices.filter(
      (invoice) => invoice.status === "partially_paid"
    );
    const attentionEvents = events.filter((event) =>
      ["payment_failed", "payment_voided", "checkout_started"].includes(
        event.eventType
      )
    );

    return {
      summary: buildFinancialCollectionsSummary({
        invoices,
        payments,
        events,
        todayIso: input.todayIso
      }),
      financialControl: buildFinancialControlSummary({
        invoices,
        payments,
        paymentEvents: events,
        todayIso: input.todayIso
      }),
      collectionsIntelligence: buildCollectionsFollowUpIntelligence({
        invoices,
        payments,
        paymentEvents: events,
        todayIso: input.todayIso
      }),
      collectionsCommandCenter: buildCollectionsCommandCenter({
        invoices,
        payments,
        paymentEvents: events,
        todayIso: input.todayIso
      }),
      billingReadinessCommand: buildBillingReadinessCommand({
        completedJobs: billingReadinessJobs,
        invoices
      }),
      overdueInvoices: sortOpenInvoices(overdueInvoices).slice(0, 8),
      collectionOpportunities: sortOpenInvoices(openInvoices).slice(0, 12),
      partiallyPaidInvoices: sortOpenInvoices(partiallyPaidInvoices).slice(
        0,
        8
      ),
      pendingPayments: payments
        .filter((payment) => payment.status === "pending")
        .slice(0, 8),
      recentRecordedPayments: payments
        .filter((payment) => payment.status === "recorded")
        .slice(0, 8),
      attentionEvents: attentionEvents.slice(0, 8),
      recentEvents: events.slice(0, 10)
    };
  }
);
