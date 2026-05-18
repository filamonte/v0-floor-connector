import "server-only";

import { cache } from "react";
import { compareInvoiceStatuses } from "@floorconnector/domain";
import type {
  InvoiceStatus,
  PaymentSource,
  PaymentStatus
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type PaymentsManagerView = "all" | PaymentStatus;

export type PaymentsManagerPayment = {
  id: string;
  invoiceId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  paymentSource: PaymentSource;
  reference: string | null;
  status: PaymentStatus;
  createdAt: string;
  invoice: {
    id: string;
    referenceNumber: string;
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

export type PaymentsManagerInvoicePreview = {
  id: string;
  referenceNumber: string;
  status: InvoiceStatus;
  dueDate: string | null;
  balanceDueAmount: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type PaymentsManagerFailedEvent = {
  id: string;
  invoiceId: string;
  eventType: "payment_failed";
  occurredAt: string;
  invoice: {
    id: string;
    referenceNumber: string;
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

export type PaymentsManagerReadModel = {
  payments: PaymentsManagerPayment[];
  recentRecordedPayments: PaymentsManagerPayment[];
  openInvoices: PaymentsManagerInvoicePreview[];
  overdueInvoices: PaymentsManagerInvoicePreview[];
  failedPaymentEvents: PaymentsManagerFailedEvent[];
  counts: Record<PaymentsManagerView, number>;
  totals: {
    recorded: string;
    pending: string;
    openReceivables: string;
    overdueInvoices: number;
  };
};

type PaymentManagerRow = {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  payment_source: PaymentSource;
  reference: string | null;
  status: PaymentStatus;
  created_at: string;
  invoices?: {
    id: string;
    reference_number: string;
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

type PaymentTotalRow = {
  amount: string | number;
  status: PaymentStatus;
};

type InvoicePreviewRow = {
  id: string;
  reference_number: string;
  status: InvoiceStatus;
  due_date: string | null;
  balance_due_amount: string | number;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
};

type PaymentFailedEventRow = {
  id: string;
  invoice_id: string;
  event_type: "payment_failed";
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

type IdRow = {
  id: string;
};

const paymentsManagerViews: PaymentsManagerView[] = [
  "all",
  "recorded",
  "pending",
  "void"
];

const paymentSources: PaymentSource[] = ["manual", "customer_portal"];
const paymentStatuses: PaymentStatus[] = ["pending", "recorded", "void"];

const paymentManagerSelect = `
  id,
  invoice_id,
  amount,
  payment_date,
  payment_method,
  payment_source,
  reference,
  status,
  created_at,
  invoices (
    id,
    reference_number,
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

const invoicePreviewSelect = `
  id,
  reference_number,
  status,
  due_date,
  balance_due_amount,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  )
`;

const failedPaymentEventSelect = `
  id,
  invoice_id,
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

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function formatMoneyValue(value: string | number) {
  return Number(value).toFixed(2);
}

function mapPayment(row: PaymentManagerRow): PaymentsManagerPayment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: formatMoneyValue(row.amount),
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    paymentSource: row.payment_source,
    reference: row.reference,
    status: row.status,
    createdAt: row.created_at,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number,
          status: row.invoices.status,
          balanceDueAmount: formatMoneyValue(row.invoices.balance_due_amount),
          totalAmount: formatMoneyValue(row.invoices.total_amount)
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
          name: row.invoices.projects.name,
          status: row.invoices.projects.status
        }
      : null
  };
}

function mapInvoice(row: InvoicePreviewRow): PaymentsManagerInvoicePreview {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    status: row.status,
    dueDate: row.due_date,
    balanceDueAmount: formatMoneyValue(row.balance_due_amount),
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
      : null
  };
}

function mapFailedPaymentEvent(
  row: PaymentFailedEventRow
): PaymentsManagerFailedEvent {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number,
          balanceDueAmount: formatMoneyValue(row.invoices.balance_due_amount)
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

function sortInvoicePreviews(
  invoices: PaymentsManagerInvoicePreview[]
): PaymentsManagerInvoicePreview[] {
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

async function countPayments(input: {
  organizationId: string;
  status?: PaymentStatus;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  if (input.status) {
    query = query.eq("status", input.status);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count payments: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function listPaymentTotalInputs(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payments")
    .select("amount,status")
    .eq("company_id", organizationId)
    .in("status", ["recorded", "pending"]);

  if (response.error) {
    throw new Error(
      `Unable to load payments manager total inputs: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PaymentTotalRow[])
    : [];
}

async function findPaymentSearchInvoiceIds(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const [customerResponse, projectResponse, invoiceReferenceResponse] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(
          `name.ilike.%${escapedQuery}%,company_name.ilike.%${escapedQuery}%`
        ),
      supabase
        .from("projects")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`name.ilike.%${escapedQuery}%`),
      supabase
        .from("invoices")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`reference_number.ilike.%${escapedQuery}%`)
    ]);

  if (customerResponse.error) {
    throw new Error(
      `Unable to load payment search customer matches: ${customerResponse.error.message}`
    );
  }

  if (projectResponse.error) {
    throw new Error(
      `Unable to load payment search project matches: ${projectResponse.error.message}`
    );
  }

  if (invoiceReferenceResponse.error) {
    throw new Error(
      `Unable to load payment search invoice matches: ${invoiceReferenceResponse.error.message}`
    );
  }

  const customerIds = Array.isArray(customerResponse.data)
    ? (customerResponse.data as IdRow[]).map((row) => row.id)
    : [];
  const projectIds = Array.isArray(projectResponse.data)
    ? (projectResponse.data as IdRow[]).map((row) => row.id)
    : [];
  const invoiceReferenceIds = Array.isArray(invoiceReferenceResponse.data)
    ? (invoiceReferenceResponse.data as IdRow[]).map((row) => row.id)
    : [];

  const invoiceQueryParts = [
    ...(customerIds.length > 0
      ? [`customer_id.in.(${customerIds.join(",")})`]
      : []),
    ...(projectIds.length > 0
      ? [`project_id.in.(${projectIds.join(",")})`]
      : [])
  ];

  if (invoiceQueryParts.length === 0) {
    return invoiceReferenceIds;
  }

  const relatedInvoiceResponse = await supabase
    .from("invoices")
    .select("id")
    .eq("company_id", input.organizationId)
    .or(invoiceQueryParts.join(","));

  if (relatedInvoiceResponse.error) {
    throw new Error(
      `Unable to load payment search related invoice matches: ${relatedInvoiceResponse.error.message}`
    );
  }

  const relatedInvoiceIds = Array.isArray(relatedInvoiceResponse.data)
    ? (relatedInvoiceResponse.data as IdRow[]).map((row) => row.id)
    : [];

  return Array.from(new Set([...invoiceReferenceIds, ...relatedInvoiceIds]));
}

async function buildPaymentSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const normalizedQuery = trimmedQuery.toLowerCase();
  const escapedQuery = escapeLikePattern(trimmedQuery);
  const invoiceIds = await findPaymentSearchInvoiceIds({
    organizationId: input.organizationId,
    query: trimmedQuery
  });

  return [
    `payment_method.ilike.%${escapedQuery}%`,
    `reference.ilike.%${escapedQuery}%`,
    ...paymentSources
      .filter((source) => source.includes(normalizedQuery))
      .map((source) => `payment_source.eq.${source}`),
    ...paymentStatuses
      .filter((status) => status.includes(normalizedQuery))
      .map((status) => `status.eq.${status}`),
    ...(invoiceIds.length > 0
      ? [`invoice_id.in.(${invoiceIds.join(",")})`]
      : [])
  ];
}

async function listPaymentsForManager(input: {
  organizationId: string;
  view?: PaymentsManagerView;
  query?: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildPaymentSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });
  let query = supabase
    .from("payments")
    .select(paymentManagerSelect)
    .eq("company_id", input.organizationId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(input.limit);

  if (input.view && input.view !== "all") {
    query = query.eq("status", input.view);
  }

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load payments manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PaymentManagerRow[]).map(mapPayment)
    : [];
}

async function listOpenInvoiceInputs(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(invoicePreviewSelect)
    .eq("company_id", organizationId)
    .neq("status", "paid")
    .neq("status", "void");

  if (response.error) {
    throw new Error(
      `Unable to load payments manager open invoice inputs: ${response.error.message}`
    );
  }

  return sortInvoicePreviews(
    Array.isArray(response.data)
      ? (response.data as unknown as InvoicePreviewRow[]).map(mapInvoice)
      : []
  );
}

async function listFailedPaymentEvents(input: {
  organizationId: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .select(failedPaymentEventSelect)
    .eq("company_id", input.organizationId)
    .eq("event_type", "payment_failed")
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(input.limit);

  if (response.error) {
    throw new Error(
      `Unable to load payments manager failed events: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PaymentFailedEventRow[]).map(
        mapFailedPaymentEvent
      )
    : [];
}

export const getPaymentsManagerReadModel = cache(
  async (input: {
    organizationId: string;
    view?: PaymentsManagerView;
    query?: string;
  }): Promise<PaymentsManagerReadModel> => {
    const [
      allCount,
      recordedCount,
      pendingCount,
      voidCount,
      paymentTotalInputs,
      payments,
      recentRecordedPayments,
      openInvoices,
      failedPaymentEvents
    ] = await Promise.all([
      countPayments({ organizationId: input.organizationId }),
      countPayments({
        organizationId: input.organizationId,
        status: "recorded"
      }),
      countPayments({
        organizationId: input.organizationId,
        status: "pending"
      }),
      countPayments({ organizationId: input.organizationId, status: "void" }),
      listPaymentTotalInputs(input.organizationId),
      listPaymentsForManager({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query,
        limit: 20
      }),
      listPaymentsForManager({
        organizationId: input.organizationId,
        view: "recorded",
        limit: 4
      }),
      listOpenInvoiceInputs(input.organizationId),
      listFailedPaymentEvents({
        organizationId: input.organizationId,
        limit: 4
      })
    ]);

    const recordedTotal = paymentTotalInputs
      .filter((payment) => payment.status === "recorded")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingTotal = paymentTotalInputs
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const openReceivables = openInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceDueAmount),
      0
    );
    const overdueInvoices = openInvoices.filter((invoice) => {
      if (!invoice.dueDate) {
        return false;
      }

      return new Date(invoice.dueDate) < new Date();
    });

    return {
      payments,
      recentRecordedPayments,
      openInvoices: openInvoices.slice(0, 4),
      overdueInvoices: overdueInvoices.slice(0, 4),
      failedPaymentEvents,
      counts: {
        all: allCount,
        recorded: recordedCount,
        pending: pendingCount,
        void: voidCount
      },
      totals: {
        recorded: recordedTotal.toFixed(2),
        pending: pendingTotal.toFixed(2),
        openReceivables: openReceivables.toFixed(2),
        overdueInvoices: overdueInvoices.length
      }
    };
  }
);

export function isPaymentsManagerView(
  value: string | null | undefined
): value is PaymentsManagerView {
  return paymentsManagerViews.includes(value as PaymentsManagerView);
}
