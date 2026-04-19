import Link from "next/link";
import { notFound } from "next/navigation";
import { computeInvoicePaymentWorkflowGate } from "@floorconnector/domain";
import type { Payment, PaymentEvent } from "@floorconnector/types";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePaymentForm } from "@/components/invoice-payment-form";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import {
  recordInvoicePaymentAction,
  updateInvoiceAction
} from "@/lib/invoices/actions";
import { getInvoiceById } from "@/lib/invoices/data";
import { listEstimates } from "@/lib/estimates/data";
import { listJobs } from "@/lib/jobs/data";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { listProjects } from "@/lib/projects/data";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatRate(value: string) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function formatReadinessLabel(status: string | null) {
  if (!status) {
    return "not started";
  }

  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function getPaymentEventLabel(eventType: PaymentEvent["eventType"]) {
  switch (eventType) {
    case "payment_requested":
      return "Customer payment requested";
    case "checkout_started":
      return "Checkout started";
    case "payment_succeeded":
      return "Payment succeeded";
    case "payment_failed":
      return "Payment failed";
    case "payment_voided":
      return "Payment voided";
    case "provider_sync":
      return "Provider sync";
    default:
      return formatStatusLabel(eventType);
  }
}

function getOnlinePaymentReadinessSummary(input: {
  canStartCheckout: boolean;
  invoiceStatus: string;
  balanceDueAmount: string;
}) {
  if (input.invoiceStatus === "void") {
    return "Online payment stays closed because this invoice has been voided.";
  }

  if (input.invoiceStatus === "draft") {
    return "Send the invoice before exposing customer-facing online payment actions.";
  }

  if (!input.canStartCheckout || Number(input.balanceDueAmount) <= 0) {
    return "Customer-facing payment is effectively complete because no balance remains due.";
  }

  return "This invoice is ready for customer-facing secure checkout on the same canonical invoice and payment chain.";
}

function getCustomerPaymentProgressSummary(input: {
  workflowRole: string;
  invoiceStatus: string;
  balanceDueAmount: string;
  latestPaymentEventType: PaymentEvent["eventType"] | null;
}) {
  if (input.latestPaymentEventType === "payment_failed") {
    return "A recent customer payment attempt failed, so collections follow-through is still needed before this invoice can be treated as clear.";
  }

  if (input.latestPaymentEventType === "checkout_started") {
    return "Customer checkout is in motion, but the invoice remains open until a canonical payment succeeds.";
  }

  if (input.latestPaymentEventType === "payment_succeeded") {
    return input.invoiceStatus === "paid" || Number(input.balanceDueAmount) <= 0
      ? "A provider-backed payment completed and this invoice is now financially settled."
      : input.workflowRole === "deposit"
        ? `A provider-backed deposit payment completed, but ${formatMoney(input.balanceDueAmount)} still remains before readiness is fully clear.`
        : `A provider-backed payment completed, but ${formatMoney(input.balanceDueAmount)} still remains due.`;
  }

  if (input.latestPaymentEventType === "payment_requested") {
    return "Customer payment has been requested on this invoice and is waiting for the next payment step.";
  }

  if (input.latestPaymentEventType === "payment_voided") {
    return "The most recent provider-backed payment was voided, so the invoice has returned to an open collection state.";
  }

  if (input.invoiceStatus === "paid" || Number(input.balanceDueAmount) <= 0) {
    return input.workflowRole === "deposit"
      ? "Deposit readiness is satisfied from this canonical invoice."
      : "The invoice is financially settled.";
  }

  if (input.invoiceStatus === "partially_paid") {
    return input.workflowRole === "deposit"
      ? `A deposit payment is already recorded, but ${formatMoney(input.balanceDueAmount)} still remains.`
      : `A payment is already recorded, but ${formatMoney(input.balanceDueAmount)} still remains due.`;
  }

  return input.workflowRole === "deposit"
    ? `Deposit collection is still open for ${formatMoney(input.balanceDueAmount)}.`
    : `The invoice still carries ${formatMoney(input.balanceDueAmount)} due.`;
}

function getRecentPaymentSignal(input: {
  latestPayment: Payment | null;
  latestEvent: PaymentEvent | null;
}) {
  if (input.latestEvent?.eventType === "payment_failed") {
    return `Recent payment attempt failed ${formatDateTime(input.latestEvent.occurredAt)}. Keep collections attention on the remaining balance before assuming the customer is clear.`;
  }

  if (input.latestEvent?.eventType === "checkout_started") {
    return `A customer checkout session started ${formatDateTime(input.latestEvent.occurredAt)}. Use this as a signal that payment is in motion, not yet complete.`;
  }

  if (input.latestEvent?.eventType === "payment_succeeded") {
    return `A provider-backed payment completed ${formatDateTime(input.latestEvent.occurredAt)} and was applied to the same canonical invoice record.`;
  }

  if (input.latestEvent?.eventType === "payment_requested") {
    return `Customer-facing payment was requested ${formatDateTime(input.latestEvent.occurredAt)}. The invoice is now in a collections follow-through phase.`;
  }

  if (input.latestEvent?.eventType === "payment_voided") {
    return `A provider-backed payment was voided ${formatDateTime(input.latestEvent.occurredAt)}. Treat the invoice as open again until a completed payment lands.`;
  }

  if (input.latestPayment) {
    return `Latest canonical payment was ${formatStatusLabel(input.latestPayment.status)} on ${formatDate(input.latestPayment.paymentDate)}.`;
  }

  return "No customer-facing or contractor-recorded payment activity has been captured yet.";
}

function renderStatusBadge(label: string) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
      {label}
    </span>
  );
}

export default async function InvoiceDetailPage({
  params,
  searchParams
}: InvoiceDetailPageProps) {
  const { invoiceId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [invoice, projects, estimates, jobs] = await Promise.all([
    getInvoiceById(invoiceId, `/invoices/${invoiceId}`),
    listProjects(),
    listEstimates(),
    listJobs()
  ]);

  if (!invoice) {
    notFound();
  }

  const financialSettings = await getOrganizationFinancialSettings(invoice.organizationId);
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: invoice.organizationId,
    projectId: invoice.projectId
  });
  const onlinePaymentGate = computeInvoicePaymentWorkflowGate({
    invoiceStatus: invoice.status,
    balanceDueAmount: invoice.balanceDueAmount
  });
  const latestPaymentEvent = invoice.paymentEvents[0] ?? null;
  const latestPaymentFailure =
    invoice.paymentEvents.find((event) => event.eventType === "payment_failed") ?? null;
  const latestCheckoutStarted =
    invoice.paymentEvents.find((event) => event.eventType === "checkout_started") ?? null;
  const latestPaymentSucceeded =
    invoice.paymentEvents.find((event) => event.eventType === "payment_succeeded") ?? null;
  const latestPaymentRequested =
    invoice.paymentEvents.find((event) => event.eventType === "payment_requested") ?? null;
  const latestPaymentVoided =
    invoice.paymentEvents.find((event) => event.eventType === "payment_voided") ?? null;
  const nextAction =
    invoice.status === "void"
      ? {
          title: "Invoice is closed",
          description:
            "This invoice is void, so the page stays focused on historical review instead of payment collection or editing changes."
        }
      : Number(invoice.balanceDueAmount) > 0
        ? {
            title:
              latestPaymentFailure
                ? "Follow up on the failed payment attempt"
                : latestCheckoutStarted
                  ? "Wait for payment completion"
                  : latestPaymentSucceeded && invoice.status === "partially_paid"
                    ? invoice.workflowRole === "deposit"
                      ? "Close the remaining deposit after the recent payment"
                      : "Close the remaining balance after the recent payment"
                  : latestPaymentRequested
                    ? "Monitor the customer payment request"
                    : latestPaymentVoided
                      ? "Restart payment follow-through after the void"
                    : invoice.status === "partially_paid"
                      ? invoice.workflowRole === "deposit"
                        ? "Collect the remaining deposit balance"
                        : "Collect the remaining balance"
                      : "Record the next payment",
            description:
              latestPaymentFailure
                ? "A customer payment attempt failed, so the remaining balance still needs active follow-through from this invoice workspace."
                : latestCheckoutStarted
                  ? "A customer has already entered checkout. Keep attention on the outcome instead of recording a parallel payment unless the provider flow fails."
                  : latestPaymentSucceeded && invoice.status === "partially_paid"
                    ? invoice.workflowRole === "deposit"
                      ? "A provider-backed deposit payment has landed, but part of the deposit still remains before the commercial handoff is complete."
                      : "A provider-backed payment has landed, but the invoice still carries an open balance."
                  : latestPaymentRequested
                    ? "Customer-facing payment intent has already been recorded on this invoice, so the next operational step is following the request through."
                    : latestPaymentVoided
                      ? "The most recent provider-backed payment was voided, so this invoice has returned to an active collection state."
                    : invoice.status === "partially_paid"
                      ? invoice.workflowRole === "deposit"
                        ? "This invoice is carrying deposit readiness. A payment has already been recorded, but the remaining balance still blocks the commercial handoff."
                        : "A payment has already been recorded on this invoice, but the balance is still outstanding."
                      : invoice.workflowRole === "deposit"
                        ? "This invoice is carrying deposit readiness. Keep payment collection and project handoff aligned before moving further downstream."
                        : "Balance is still outstanding on this invoice, so payment recording is the clearest next operational step from this page.",
            primaryLabel: "Record payment",
            primaryHref: "#payment-recording"
          }
        : {
            title: "Billing review is current",
            description:
              "This invoice is fully paid. Use the project hub if you need the broader contract, readiness, or downstream workflow context.",
            primaryLabel: "Open project readiness hub",
            primaryHref: `/projects/${invoice.projectId}`
          };
  const activePayments = invoice.payments.filter((payment) => payment.status !== "void");
  const latestPayment = activePayments[0] ?? invoice.payments[0] ?? null;

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null,
    customerTaxExempt: project.customer?.isTaxExempt ?? false,
    customerRetainagePercentageDefault:
      project.customer?.retainagePercentageDefault ?? "0.00"
  }));

  const approvedEstimateOptions = estimates
    .filter((estimate) => estimate.status === "approved" || estimate.id === invoice.estimateId)
    .map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      projectId: estimate.projectId,
      projectName: estimate.project?.name ?? null,
      status: estimate.status
    }));

  const jobOptions = jobs.map((job) => ({
    id: job.id,
    projectId: job.projectId,
    projectName: job.project?.name ?? null,
    status: job.status,
    estimateId: job.estimate?.id ?? null
  }));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Invoice Review"
            title={invoice.referenceNumber}
            description="Use this page to review canonical billing truth, confirm payment state, and decide the next collection step."
            backHref="/invoices"
            backLabel="Back to invoices"
            actions={
              <>
                <div className="flex flex-wrap gap-2.5">
                  {invoice.status !== "void" ? (
                    <a
                      href="#payment-recording"
                      className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                    >
                      Record payment
                    </a>
                  ) : null}
                  <Link
                    href={`/projects/${invoice.projectId}`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    Open project readiness hub
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {renderStatusBadge(formatStatusLabel(invoice.status))}
                  {renderStatusBadge(
                    invoice.workflowRole === "deposit" ? "Deposit request" : "Standard invoice"
                  )}
                </div>
              </>
            }
          />

          {resolvedSearchParams.error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <div className="mt-10 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="rounded-[1.85rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] px-6 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
                  Billing state
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {renderStatusBadge(formatStatusLabel(invoice.status))}
                    {renderStatusBadge(
                      invoice.workflowRole === "deposit" ? "Deposit request" : "Standard invoice"
                    )}
                  </div>
                  <p className="text-[2rem] font-semibold tracking-tight text-slate-950">
                    {formatMoney(invoice.balanceDueAmount)}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {formatMoney(invoice.paidAmount)} paid of {formatMoney(invoice.totalAmount)} total
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Payment progress
                    </p>
                    <p className="mt-2 text-sm font-semibold capitalize text-slate-950">
                      {formatStatusLabel(invoice.status)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {getCustomerPaymentProgressSummary({
                        workflowRole: invoice.workflowRole,
                        invoiceStatus: invoice.status,
                        balanceDueAmount: invoice.balanceDueAmount,
                        latestPaymentEventType: latestPaymentEvent?.eventType ?? null
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Due {formatDate(invoice.dueDate)} | {activePayments.length} payment
                      {activePayments.length === 1 ? "" : "s"} recorded
                    </p>
                  </div>
                </div>
              </section>

              <WorkspaceSummaryBand
                className="grid gap-3 sm:grid-cols-2"
                itemClassName="rounded-2xl border border-slate-200/80 bg-slate-50/65 px-4 py-4"
                labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                items={[
                  {
                    key: "next-action",
                    label: "Next best action",
                    content: (
                      <NextActionCard
                        eyebrow="Billing guidance"
                        title={nextAction.title}
                        description={nextAction.description}
                        primaryAction={
                          nextAction.primaryLabel && nextAction.primaryHref
                            ? nextAction.primaryHref.startsWith("#")
                              ? (
                                <a
                                  href={nextAction.primaryHref}
                                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                                >
                                  {nextAction.primaryLabel}
                                </a>
                              )
                              : (
                                <Link
                                  href={nextAction.primaryHref}
                                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                                >
                                  {nextAction.primaryLabel}
                                </Link>
                              )
                            : undefined
                        }
                      />
                    )
                  },
                  {
                    key: "payment-readiness",
                    label: "Online payment state",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {onlinePaymentGate.canStartCheckout ? "Ready for online payment" : "Not ready"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {getOnlinePaymentReadinessSummary({
                            canStartCheckout: onlinePaymentGate.canStartCheckout,
                            invoiceStatus: invoice.status,
                            balanceDueAmount: invoice.balanceDueAmount
                          })}
                        </p>
                      </>
                    )
                  },
                  {
                    key: "recent-signal",
                    label: "Recent payment signal",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {latestPaymentEvent
                            ? getPaymentEventLabel(latestPaymentEvent.eventType)
                            : "No recent customer-facing signal"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {getRecentPaymentSignal({
                            latestPayment,
                            latestEvent: latestPaymentEvent
                          })}
                        </p>
                      </>
                    )
                  }
                ]}
              />
            </div>

          </div>
        </div>

        <DetailPanel
          title="Invoice Review"
          description="Review the invoice body, totals, and recent billing activity here first."
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-950">Line items</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Canonical billing scope for this invoice, preserved in the same project,
                    estimate, and job chain.
                  </p>
                </div>

                {invoice.lineItems.length > 0 ? (
                  <div className="space-y-3">
                    {invoice.lineItems.map((lineItem) => (
                      <div
                        key={lineItem.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-950">
                              {lineItem.name}
                            </p>
                            {lineItem.description ? (
                              <p className="text-sm leading-6 text-slate-600">
                                {lineItem.description}
                              </p>
                            ) : null}
                            <p className="text-sm text-slate-500">
                              {Number(lineItem.quantity).toLocaleString("en-US")} {lineItem.unit} at{" "}
                              {formatMoney(lineItem.unitPrice)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-950">
                            {formatMoney(lineItem.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                    No line items are currently attached to this invoice.
                  </div>
                )}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-950">Billing notes</p>
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    {invoice.notes ?? "No billing notes have been captured on this invoice yet."}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-950">Latest payment activity</p>
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    <div className="space-y-3">
                      {latestPayment ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-950">
                            {formatMoney(latestPayment.amount)}
                          </p>
                          <p>{formatDate(latestPayment.paymentDate)}</p>
                          <p className="capitalize">
                            {formatStatusLabel(latestPayment.status)} via {latestPayment.paymentMethod}
                          </p>
                          {latestPayment.reference ? <p>Ref: {latestPayment.reference}</p> : null}
                        </div>
                      ) : (
                        <p>No payments have been recorded for this invoice yet.</p>
                      )}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Customer-facing signal
                        </p>
                        <p className="mt-2">
                          {getRecentPaymentSignal({
                            latestPayment,
                            latestEvent: latestPaymentEvent
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Totals and billing math</p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.subtotalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Taxable sales</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.taxableSalesAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Exempt sales</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.exemptSalesAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax collected</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.taxCollectedAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.taxAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Discount</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.discountAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Retainage held</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.retainageHeldAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                    <dt className="font-semibold text-slate-950">Total</dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(invoice.totalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Paid</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.paidAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold text-slate-950">Balance due</dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(invoice.balanceDueAmount)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Billing configuration</p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Billing model</dt>
                    <dd className="text-right text-slate-950">{invoice.billingModel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Issue date</dt>
                    <dd className="text-right text-slate-950">{formatDate(invoice.issueDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Due date</dt>
                    <dd className="text-right text-slate-950">{formatDate(invoice.dueDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax behavior</dt>
                    <dd className="text-right text-slate-950 capitalize">
                      {invoice.taxBehaviorApplied.replaceAll("_", " ")}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Applied tax rate</dt>
                    <dd className="text-right text-slate-950">
                      {formatRate(invoice.taxRateApplied)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Customer tax snapshot</dt>
                    <dd className="text-right text-slate-950">
                      {invoice.customerTaxExemptSnapshot ? "Exempt" : "Taxable"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Org default tax</dt>
                    <dd className="max-w-[14rem] text-right text-slate-950">
                      {financialSettings.defaultTaxBehavior.replaceAll("_", " ")} at{" "}
                      {formatRate(financialSettings.defaultTaxRate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Retainage %</dt>
                    <dd className="text-right text-slate-950">
                      {Number(invoice.retainagePercentage).toFixed(2)}%
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </DetailPanel>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <DetailPanel
            title="Payment Recording"
            description="Record canonical payments here while keeping customer-facing checkout signals in view."
          >
            <div id="payment-recording" className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Customer-facing payment continuity
                </p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Readiness
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {onlinePaymentGate.canStartCheckout ? "Ready for online payment" : "Not ready"}
                    </p>
                    <p className="mt-2">
                      {getOnlinePaymentReadinessSummary({
                        canStartCheckout: onlinePaymentGate.canStartCheckout,
                        invoiceStatus: invoice.status,
                        balanceDueAmount: invoice.balanceDueAmount
                      })}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Latest shared signal
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {latestPaymentEvent
                        ? getPaymentEventLabel(latestPaymentEvent.eventType)
                        : "No portal-side signal yet"}
                    </p>
                    <p className="mt-2">
                      {latestPaymentEvent
                        ? formatDateTime(latestPaymentEvent.occurredAt)
                        : "Customer-facing payment events will appear here once request or checkout activity starts."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Collection attention
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {latestPaymentFailure
                        ? "Recent failure needs follow-through"
                        : latestCheckoutStarted
                          ? "Checkout is in motion"
                          : latestPaymentRequested
                            ? "Payment requested"
                            : Number(invoice.balanceDueAmount) > 0
                              ? "Balance still open"
                              : "Billing settled"}
                    </p>
                    <p className="mt-2">
                      {latestPaymentFailure
                        ? "A customer payment attempt failed. Keep the conversation focused on remaining balance and retry path."
                        : latestCheckoutStarted
                          ? "A customer has entered the payment flow, but the invoice is not complete until a canonical payment succeeds."
                          : latestPaymentSucceeded
                            ? Number(invoice.balanceDueAmount) > 0
                              ? "A provider-backed payment has been applied, but the invoice still carries an open balance."
                              : "The most recent provider-backed payment completed successfully."
                          : latestPaymentRequested
                            ? "Collections activity has started, even if the invoice still needs the actual payment completion event."
                            : latestPaymentVoided
                              ? "A provider-backed payment was voided, so collection attention has reopened on this invoice."
                            : Number(invoice.balanceDueAmount) > 0
                              ? "No recent customer-facing payment signal is recorded yet."
                              : "No further collection step is currently needed on this invoice."}
                    </p>
                  </div>
                </div>
              </div>

              {invoice.status === "void" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                  Void invoices do not accept recorded payments.
                </div>
              ) : (
                <InvoicePaymentForm
                  invoiceId={invoice.id}
                  action={recordInvoicePaymentAction}
                />
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-950">Recorded payments</p>
                {invoice.payments.length > 0 ? (
                  invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-slate-950">
                          {formatMoney(payment.amount)}
                        </p>
                        <p className="capitalize">{formatStatusLabel(payment.status)}</p>
                      </div>
                      <p className="mt-1">{formatDate(payment.paymentDate)}</p>
                      <p>{payment.paymentMethod}</p>
                      {payment.reference ? <p>Ref: {payment.reference}</p> : null}
                      {payment.notes ? <p>{payment.notes}</p> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No payments have been recorded for this invoice yet.
                  </div>
                )}
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Edit Invoice"
            description="Editing stays available from the same record, but it is intentionally secondary to billing review."
          >
            <InvoiceForm
              action={updateInvoiceAction}
              submitLabel="Save invoice"
              pendingLabel="Saving invoice..."
              projects={projectOptions}
              estimates={approvedEstimateOptions}
              jobs={jobOptions}
              organizationFinancialSettings={financialSettings}
              invoice={{
                ...invoice,
                lineItems: invoice.lineItems,
                paidAmount: invoice.paidAmount
              }}
              paidAmount={invoice.paidAmount}
            />
          </DetailPanel>
        </div>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Connected Records"
          description="Shortcuts to the surrounding commercial chain without displacing the invoice as billing truth."
        >
          <div className="grid gap-4">
            {invoice.project ? (
              <LinkedRecordCard
                href={`/projects/${invoice.project.id}`}
                title={invoice.project.name}
                subtitle="Project"
                meta={invoice.customer?.name ?? "Unknown customer"}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.project.status)}
                  </span>
                }
              />
            ) : null}
            {invoice.customer ? (
              <LinkedRecordCard
                href={`/customers/${invoice.customer.id}`}
                title={invoice.customer.name}
                subtitle="Customer"
                meta={invoice.customer.companyName ?? "Customer record"}
              />
            ) : null}
            {invoice.estimate ? (
              <LinkedRecordCard
                href={`/estimates/${invoice.estimate.id}`}
                title={invoice.estimate.referenceNumber}
                subtitle="Estimate"
                meta={invoice.project?.name ?? "Source estimate"}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.estimate.status)}
                  </span>
                }
              />
            ) : null}
            {invoice.job ? (
              <LinkedRecordCard
                href={`/jobs/${invoice.job.id}`}
                title={invoice.project?.name ?? "Job"}
                subtitle="Job"
                meta="Execution record linked to this invoice"
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.job.status)}
                  </span>
                }
              />
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Invoice Context"
          description="Compact workflow facts that support review without competing with billing state."
        >
          <ContextFactsList
            items={[
              {
                label: "Project readiness",
                value: (
                  <span className="capitalize">
                    {formatReadinessLabel(readinessSnapshot?.status ?? null)}
                  </span>
                )
              },
              {
                label: "Workflow role",
                value: invoice.workflowRole === "deposit" ? "Deposit request" : "Standard invoice"
              },
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(invoice.status)}</span>
              },
              {
                label: "Online payment readiness",
                value: onlinePaymentGate.canStartCheckout
                  ? "Ready for customer-facing payment flow"
                  : "Not currently ready for customer-facing payment flow"
              },
              {
                label: "Recent payment signal",
                value: latestPaymentEvent
                  ? `${getPaymentEventLabel(latestPaymentEvent.eventType)} at ${formatDateTime(latestPaymentEvent.occurredAt)}`
                  : "No customer-facing payment signal yet"
              },
              {
                label: "Ready-to-schedule relevance",
                value:
                  invoice.workflowRole === "deposit"
                    ? "Deposit invoices contribute directly to the commercial handoff."
                    : "Standard invoices stay connected to the same project and execution chain without replacing the project hub."
              },
              {
                label: "Customer company",
                value: invoice.customer?.companyName ?? "Not provided"
              },
              {
                label: "Created",
                value: new Date(invoice.createdAt).toLocaleString()
              },
              {
                label: "Updated",
                value: new Date(invoice.updatedAt).toLocaleString()
              },
              {
                label: "Hub guidance",
                value:
                  "Use the project readiness hub when you need the current contract, signature, deposit, financing, and ready-to-schedule handoff context."
              }
            ]}
          />
        </DetailPanel>
      </aside>
    </div>
  );
}
