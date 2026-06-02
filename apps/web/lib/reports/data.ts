import "server-only";

import type {
  EstimateStatus,
  InvoiceStatus,
  OpportunityStatus,
  PaymentStatus,
  TaxBehavior
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listEstimates } from "@/lib/estimates/data";
import { listContracts } from "@/lib/contracts/data";
import { listDailyLogs } from "@/lib/daily-logs/data";
import { listExecutionAttachmentsBySubjects } from "@/lib/execution-attachments/data";
import { getFinancialCollectionsReadModel } from "@/lib/financials/collections-read-model";
import { listFieldNotes } from "@/lib/field-notes/data";
import {
  listScheduleJobAssignmentsByJobIds,
  listScheduleJobs
} from "@/lib/jobs/data";
import { listInvoices } from "@/lib/invoices/data";
import { listOpportunities } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPayments } from "@/lib/payments/data";
import { listProjects } from "@/lib/projects/data";
import { deriveOperationsReportingSummary } from "@/lib/reports/operations-summary";
import { deriveScheduleWarningSummaries } from "@/lib/schedule/warnings";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ReportingDateRange = {
  from: string | null;
  to: string | null;
};

export type ReportCount<TStatus extends string> = {
  status: TStatus;
  count: number;
  amount?: number;
};

export type SalesTaxSummaryRow = {
  invoiceId: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  customerName: string;
  projectName: string;
  issueDate: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  status: InvoiceStatus;
  paymentContext: "draft" | "open" | "partially_paid" | "paid" | "void";
  customerTaxExemptSnapshot: boolean;
  taxBehaviorApplied: TaxBehavior;
  taxRateApplied: string;
  taxableSalesAmount: string;
  exemptSalesAmount: string;
  taxCollectedAmount: string;
  totalAmount: string;
  balanceDueAmount: string;
};

type InvoiceTaxReportingEntryRow = {
  invoice_id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  issue_date: string;
  reporting_period_start: string;
  reporting_period_end: string;
  customer_tax_exempt_snapshot: boolean;
  tax_behavior_applied: TaxBehavior;
  tax_rate_applied: string | number;
  taxable_sales_amount: string | number;
  exempt_sales_amount: string | number;
  tax_collected_amount: string | number;
  total_amount: string | number;
  balance_due_amount: string | number;
  status: InvoiceStatus;
};

export async function loadReportingBasics(range: ReportingDateRange) {
  const [opportunities, estimates, invoices, payments, projects] =
    await Promise.all([
      listOpportunities(),
      listEstimates(),
      listInvoices(),
      listPayments(),
      listProjects()
    ]);

  const rangedOpportunities = opportunities.filter((opportunity) =>
    isInDateRange(opportunity.updatedAt, range)
  );
  const rangedEstimates = estimates.filter((estimate) =>
    isInDateRange(estimate.updatedAt, range)
  );
  const rangedPayments = payments.filter((payment) =>
    isInDateRange(payment.paymentDate, range)
  );

  const openInvoices = invoices.filter(
    (invoice) =>
      invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount) > 0
  );
  const blockedProjects = projects.filter(
    (project) =>
      project.status !== "completed" &&
      project.commercialReadinessStatus !== "ready_to_schedule"
  );

  return {
    range,
    sources: {
      opportunities: rangedOpportunities,
      estimates: rangedEstimates,
      invoices,
      payments: rangedPayments,
      projects
    },
    leadPipeline: {
      counts: countByStatus(
        rangedOpportunities,
        (item): OpportunityStatus => item.status
      ),
      drilldown: rangedOpportunities.slice(0, 8)
    },
    estimates: {
      counts: countByStatus(
        rangedEstimates,
        (item): EstimateStatus => item.status,
        (item) => Number(item.totalAmount)
      ),
      drilldown: rangedEstimates.slice(0, 8)
    },
    invoices: {
      counts: [
        {
          status: "open",
          count: openInvoices.filter(
            (invoice) => invoice.status !== "partially_paid"
          ).length,
          amount: sumAmounts(
            openInvoices.filter(
              (invoice) => invoice.status !== "partially_paid"
            ),
            (invoice) => invoice.balanceDueAmount
          )
        },
        {
          status: "partially_paid",
          count: invoices.filter(
            (invoice) => invoice.status === "partially_paid"
          ).length,
          amount: sumAmounts(
            invoices.filter((invoice) => invoice.status === "partially_paid"),
            (invoice) => invoice.balanceDueAmount
          )
        },
        {
          status: "paid",
          count: invoices.filter((invoice) => invoice.status === "paid").length,
          amount: sumAmounts(
            invoices.filter((invoice) => invoice.status === "paid"),
            (invoice) => invoice.totalAmount
          )
        }
      ] satisfies Array<ReportCount<"open" | "partially_paid" | "paid">>,
      openDrilldown: openInvoices
        .slice()
        .sort(
          (left, right) =>
            Number(right.balanceDueAmount) - Number(left.balanceDueAmount)
        )
        .slice(0, 8),
      aging: buildInvoiceAging(openInvoices)
    },
    payments: {
      counts: countByStatus(
        rangedPayments,
        (item): PaymentStatus => item.status,
        (item) => Number(item.amount)
      ),
      recent: rangedPayments
        .slice()
        .sort((left, right) => {
          const dateComparison = right.paymentDate.localeCompare(
            left.paymentDate
          );
          return dateComparison === 0
            ? right.createdAt.localeCompare(left.createdAt)
            : dateComparison;
        })
        .slice(0, 8)
    },
    projectReadiness: {
      counts: countByStatus(
        blockedProjects,
        (project) => project.commercialReadinessStatus
      ),
      blockedCount: blockedProjects.length,
      blockedProjects: blockedProjects.slice(0, 10)
    }
  };
}

export async function loadOperationsReportingSummary(input: {
  organizationId: string;
  todayIso: string;
}) {
  const [
    projects,
    jobs,
    contracts,
    invoices,
    payments,
    dailyLogs,
    fieldNotes,
    collectionsReadModel
  ] = await Promise.all([
    listProjects(),
    listScheduleJobs(),
    listContracts(),
    listInvoices(),
    listPayments(),
    listDailyLogs(),
    listFieldNotes(),
    getFinancialCollectionsReadModel({
      organizationId: input.organizationId,
      todayIso: input.todayIso
    })
  ]);
  const jobIds = jobs.map((job) => job.id);
  const jobAssignments = await listScheduleJobAssignmentsByJobIds(jobIds);
  const fieldNoteIds = fieldNotes.map((note) => note.id);
  const attachments = await listExecutionAttachmentsBySubjects([
    ...dailyLogs.map((dailyLog) => ({
      subjectType: "daily_log" as const,
      subjectId: dailyLog.id
    })),
    ...fieldNoteIds.map((fieldNoteId) => ({
      subjectType: "field_note" as const,
      subjectId: fieldNoteId
    }))
  ]);
  const scheduleWarnings = deriveScheduleWarningSummaries(
    jobs.map((job) => ({
      id: job.id,
      title: job.project?.name ?? "Scheduled job",
      dispatchStatus: job.dispatchStatus,
      scheduledDate: job.scheduledDate,
      scheduledStartAt: job.scheduledStartAt,
      scheduledEndAt: job.scheduledEndAt,
      crewVendorId: job.crewVendorId,
      crewVendor: job.crewVendor,
      assignments: (jobAssignments.get(job.id) ?? []).map((assignment) => ({
        personId: assignment.personId,
        vendorId: assignment.vendorId,
        person: assignment.person,
        vendor: assignment.vendor
      }))
    }))
  );

  return deriveOperationsReportingSummary({
    todayIso: input.todayIso,
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      commercialReadinessStatus: project.commercialReadinessStatus,
      customer: project.customer
    })),
    jobs: jobs.map((job) => ({
      id: job.id,
      projectId: job.projectId,
      dispatchStatus: job.dispatchStatus,
      scheduledDate: job.scheduledDate,
      updatedAt: job.updatedAt,
      project: job.project,
      customer: job.customer
    })),
    jobAssignments: [...jobAssignments.values()].flat().map((assignment) => ({
      id: assignment.id,
      jobId: assignment.jobId,
      personId: assignment.personId,
      vendorId: assignment.vendorId
    })),
    scheduleWarnings,
    contracts: contracts.map((contract) => ({
      id: contract.id,
      projectId: contract.projectId,
      referenceNumber: contract.referenceNumber,
      status: contract.status,
      updatedAt: contract.updatedAt,
      project: contract.project,
      customer: contract.customer
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      projectId: invoice.projectId,
      referenceNumber: invoice.referenceNumber,
      status: invoice.status,
      dueDate: invoice.dueDate,
      balanceDueAmount: invoice.balanceDueAmount,
      customer: invoice.customer,
      project: invoice.project
    })),
    payments: payments.map((payment) => ({
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      status: payment.status,
      paymentDate: payment.paymentDate,
      createdAt: payment.createdAt,
      invoice: payment.invoice
        ? {
            id: payment.invoice.id,
            referenceNumber: payment.invoice.referenceNumber
          }
        : null,
      customer: payment.customer,
      project: payment.project
    })),
    dailyLogs: dailyLogs.map((dailyLog) => ({
      id: dailyLog.id,
      projectId: dailyLog.projectId,
      jobId: dailyLog.jobId,
      logDate: dailyLog.logDate
    })),
    fieldNotes: fieldNotes.map((note) => ({
      id: note.id,
      projectId: note.projectId,
      dailyLogId: note.dailyLogId,
      noteType: note.noteType,
      status: note.status,
      title: note.title,
      updatedAt: note.updatedAt,
      project: note.project
    })),
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      subjectType: attachment.subjectType,
      subjectId: attachment.subjectId,
      attachmentType: attachment.attachmentType
    })),
    collections: {
      openReceivableAmount: collectionsReadModel.summary.openReceivableAmount,
      overdueReceivableAmount:
        collectionsReadModel.summary.overdueReceivableAmount,
      openInvoiceCount: collectionsReadModel.summary.openInvoiceCount,
      overdueInvoiceCount: collectionsReadModel.summary.overdueInvoiceCount,
      pendingPaymentAmount: collectionsReadModel.summary.pendingPaymentAmount,
      pendingEventCount: collectionsReadModel.summary.pendingEventCount,
      failedOrVoidedEventCount:
        collectionsReadModel.summary.failedOrVoidedEventCount
    }
  });
}

export async function loadSalesTaxSummary(range: ReportingDateRange) {
  const user = await requireAuthenticatedUser("/reports");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return {
      range,
      rows: [] as SalesTaxSummaryRow[],
      filingRows: [] as SalesTaxSummaryRow[],
      summary: buildSalesTaxSummary([]),
      exceptionRows: {
        draftInvoices: [] as SalesTaxSummaryRow[],
        voidInvoices: [] as SalesTaxSummaryRow[],
        exemptInvoices: [] as SalesTaxSummaryRow[],
        zeroTaxWithTaxableSales: [] as SalesTaxSummaryRow[],
        openInvoices: [] as SalesTaxSummaryRow[]
      }
    };
  }

  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("invoice_tax_reporting_entries")
    .select(
      `
        invoice_id,
        company_id,
        customer_id,
        project_id,
        issue_date,
        reporting_period_start,
        reporting_period_end,
        customer_tax_exempt_snapshot,
        tax_behavior_applied,
        tax_rate_applied,
        taxable_sales_amount,
        exempt_sales_amount,
        tax_collected_amount,
        total_amount,
        balance_due_amount,
        status
      `
    )
    .eq("company_id", organizationContext.organization.id)
    .order("issue_date", { ascending: false })
    .order("invoice_id", { ascending: false });

  if (range.from) {
    query = query.gte("issue_date", range.from);
  }

  if (range.to) {
    query = query.lte("issue_date", range.to);
  }

  const [taxResponse, invoices] = await Promise.all([query, listInvoices()]);
  const taxData: unknown = taxResponse.data;

  if (taxResponse.error) {
    throw new Error(
      `Unable to load sales tax summary: ${taxResponse.error.message}`
    );
  }

  if (!isInvoiceTaxReportingEntryRowArray(taxData)) {
    return {
      range,
      rows: [],
      filingRows: [],
      summary: buildSalesTaxSummary([]),
      exceptionRows: {
        draftInvoices: [],
        voidInvoices: [],
        exemptInvoices: [],
        zeroTaxWithTaxableSales: [],
        openInvoices: []
      }
    };
  }

  const invoicesById = new Map(
    invoices.map((invoice) => [invoice.id, invoice])
  );
  const rows = taxData.map((row) => {
    const invoice = invoicesById.get(row.invoice_id);

    return mapSalesTaxSummaryRow(row, {
      referenceNumber: invoice?.referenceNumber ?? "Invoice",
      customerName: invoice?.customer?.name ?? "Unknown customer",
      projectName: invoice?.project?.name ?? "No project"
    });
  });
  const filingRows = rows.filter(
    (row) => row.status !== "void" && row.status !== "draft"
  );

  return {
    range,
    rows,
    filingRows,
    summary: buildSalesTaxSummary(filingRows),
    exceptionRows: {
      draftInvoices: rows.filter((row) => row.status === "draft").slice(0, 6),
      voidInvoices: rows.filter((row) => row.status === "void").slice(0, 6),
      exemptInvoices: filingRows
        .filter(
          (row) =>
            row.customerTaxExemptSnapshot || Number(row.exemptSalesAmount) > 0
        )
        .slice(0, 6),
      zeroTaxWithTaxableSales: filingRows
        .filter(
          (row) =>
            Number(row.taxableSalesAmount) > 0 &&
            Number(row.taxCollectedAmount) === 0
        )
        .slice(0, 6),
      openInvoices: filingRows
        .filter(
          (row) => row.status === "sent" || row.status === "partially_paid"
        )
        .slice(0, 6)
    }
  };
}

function countByStatus<TStatus extends string, TItem>(
  items: TItem[],
  getStatus: (item: TItem) => TStatus,
  getAmount?: (item: TItem) => number
): Array<ReportCount<TStatus>> {
  const counts = new Map<TStatus, ReportCount<TStatus>>();

  for (const item of items) {
    const status = getStatus(item);
    const current = counts.get(status) ?? {
      status,
      count: 0,
      amount: getAmount ? 0 : undefined
    };

    current.count += 1;

    if (getAmount) {
      current.amount = (current.amount ?? 0) + getAmount(item);
    }

    counts.set(status, current);
  }

  return Array.from(counts.values());
}

function sumAmounts<TItem>(
  items: TItem[],
  getAmount: (item: TItem) => string | number
) {
  return items.reduce((sum, item) => sum + Number(getAmount(item)), 0);
}

function buildSalesTaxSummary(rows: SalesTaxSummaryRow[]) {
  return {
    taxableSales: sumAmounts(rows, (row) => row.taxableSalesAmount),
    exemptSales: sumAmounts(rows, (row) => row.exemptSalesAmount),
    taxCollected: sumAmounts(rows, (row) => row.taxCollectedAmount),
    totalSales: sumAmounts(rows, (row) => row.totalAmount),
    invoiceCount: rows.length,
    exemptInvoiceCount: rows.filter((row) => row.customerTaxExemptSnapshot)
      .length,
    paidInvoiceCount: rows.filter((row) => row.status === "paid").length,
    openInvoiceCount: rows.filter(
      (row) => row.status === "sent" || row.status === "partially_paid"
    ).length
  };
}

function mapSalesTaxSummaryRow(
  row: InvoiceTaxReportingEntryRow,
  display: {
    referenceNumber: string;
    customerName: string;
    projectName: string;
  }
): SalesTaxSummaryRow {
  return {
    invoiceId: row.invoice_id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: display.referenceNumber,
    customerName: display.customerName,
    projectName: display.projectName,
    issueDate: row.issue_date,
    reportingPeriodStart: row.reporting_period_start,
    reportingPeriodEnd: row.reporting_period_end,
    status: row.status,
    paymentContext: getInvoicePaymentContext(
      row.status,
      row.balance_due_amount
    ),
    customerTaxExemptSnapshot: row.customer_tax_exempt_snapshot,
    taxBehaviorApplied: row.tax_behavior_applied,
    taxRateApplied: Number(row.tax_rate_applied).toFixed(6),
    taxableSalesAmount: Number(row.taxable_sales_amount).toFixed(2),
    exemptSalesAmount: Number(row.exempt_sales_amount).toFixed(2),
    taxCollectedAmount: Number(row.tax_collected_amount).toFixed(2),
    totalAmount: Number(row.total_amount).toFixed(2),
    balanceDueAmount: Number(row.balance_due_amount).toFixed(2)
  };
}

function getInvoicePaymentContext(
  status: InvoiceStatus,
  balanceDueAmount: string | number
): SalesTaxSummaryRow["paymentContext"] {
  if (status === "draft" || status === "void" || status === "paid") {
    return status;
  }

  if (status === "partially_paid") {
    return "partially_paid";
  }

  return Number(balanceDueAmount) > 0 ? "open" : "paid";
}

function isInvoiceTaxReportingEntryRow(
  value: unknown
): value is InvoiceTaxReportingEntryRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<InvoiceTaxReportingEntryRow>;

  return (
    typeof row.invoice_id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.issue_date === "string" &&
    typeof row.reporting_period_start === "string" &&
    typeof row.reporting_period_end === "string" &&
    typeof row.customer_tax_exempt_snapshot === "boolean" &&
    typeof row.tax_behavior_applied === "string" &&
    (typeof row.tax_rate_applied === "string" ||
      typeof row.tax_rate_applied === "number") &&
    (typeof row.taxable_sales_amount === "string" ||
      typeof row.taxable_sales_amount === "number") &&
    (typeof row.exempt_sales_amount === "string" ||
      typeof row.exempt_sales_amount === "number") &&
    (typeof row.tax_collected_amount === "string" ||
      typeof row.tax_collected_amount === "number") &&
    (typeof row.total_amount === "string" ||
      typeof row.total_amount === "number") &&
    (typeof row.balance_due_amount === "string" ||
      typeof row.balance_due_amount === "number") &&
    typeof row.status === "string"
  );
}

function isInvoiceTaxReportingEntryRowArray(
  value: unknown
): value is InvoiceTaxReportingEntryRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isInvoiceTaxReportingEntryRow(row))
  );
}

function isInDateRange(value: string | null, range: ReportingDateRange) {
  if (!value) {
    return false;
  }

  const dateValue = value.slice(0, 10);

  if (range.from && dateValue < range.from) {
    return false;
  }

  if (range.to && dateValue > range.to) {
    return false;
  }

  return true;
}

function buildInvoiceAging(
  invoices: Awaited<ReturnType<typeof listInvoices>>
): Array<ReportCount<"current" | "1_30" | "31_60" | "61_90" | "over_90">> {
  const today = startOfToday();
  const buckets: Array<
    ReportCount<"current" | "1_30" | "31_60" | "61_90" | "over_90">
  > = [
    { status: "current", count: 0, amount: 0 },
    { status: "1_30", count: 0, amount: 0 },
    { status: "31_60", count: 0, amount: 0 },
    { status: "61_90", count: 0, amount: 0 },
    { status: "over_90", count: 0, amount: 0 }
  ];

  for (const invoice of invoices) {
    const basisDate = invoice.dueDate ?? invoice.issueDate ?? invoice.createdAt;
    const daysPastDue = differenceInCalendarDays(
      today,
      new Date(`${basisDate.slice(0, 10)}T00:00:00`)
    );
    const bucket =
      daysPastDue <= 0
        ? buckets[0]
        : daysPastDue <= 30
          ? buckets[1]
          : daysPastDue <= 60
            ? buckets[2]
            : daysPastDue <= 90
              ? buckets[3]
              : buckets[4];

    bucket.count += 1;
    bucket.amount = (bucket.amount ?? 0) + Number(invoice.balanceDueAmount);
  }

  return buckets;
}

function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function differenceInCalendarDays(left: Date, right: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((left.getTime() - right.getTime()) / millisecondsPerDay);
}
