import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { EarlyAccessLockNotice } from "@/components/early-access-lock-notice";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  portalActionBoxClassName,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalStatePanelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requestPortalInvoicePaymentAction } from "@/lib/invoices/actions";
import { getOrganizationProductionActionLockState } from "@/lib/organizations/activation-guard";
import { getPortalInvoiceReviewData } from "@/lib/portal/data";

type PortalInvoiceReviewPageProps = {
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

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatPaymentEventLabel(eventType: string) {
  switch (eventType) {
    case "payment_requested":
      return "Payment requested";
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

function formatPaymentActorLabel(actorType: string) {
  switch (actorType) {
    case "portal_user":
      return "Customer portal";
    case "organization_user":
      return "Contractor team";
    case "provider":
      return "Payment provider";
    case "system":
      return "System";
    default:
      return formatStatusLabel(actorType);
  }
}

function formatPaymentBlocker(blocker: string) {
  switch (blocker) {
    case "invoice_not_sent":
      return "This invoice must be sent before customer payment can start.";
    case "invoice_void":
      return "Void invoices cannot accept customer payment activity.";
    case "no_balance_due":
      return "This invoice does not have an outstanding balance to pay.";
    default:
      return "This invoice is not currently available for customer payment activity.";
  }
}

function getPaymentProgressSummary(input: {
  status: string;
  workflowRole: string;
  balanceDueAmount: string;
  latestPaymentEventType: string | null;
}) {
  if (input.latestPaymentEventType === "payment_failed") {
    return "A recent payment attempt failed, so this invoice still needs follow-through before it can be treated as complete.";
  }

  if (input.latestPaymentEventType === "checkout_started") {
    return "Payment is currently in progress. This invoice is complete only after payment succeeds.";
  }

  if (input.latestPaymentEventType === "payment_succeeded") {
    return input.status === "paid"
      ? input.workflowRole === "deposit"
        ? "A deposit payment completed and this invoice is fully paid."
        : "A payment completed and this invoice is fully paid."
      : input.workflowRole === "deposit"
        ? `A deposit payment completed, but ${formatMoney(input.balanceDueAmount)} still remains.`
        : `A payment completed, but ${formatMoney(input.balanceDueAmount)} still remains due.`;
  }

  if (input.latestPaymentEventType === "payment_requested") {
    return "Payment has been requested and is now waiting for the next payment step.";
  }

  if (input.latestPaymentEventType === "payment_voided") {
    return "The latest payment was voided, so this invoice has returned to an open balance state.";
  }

  if (input.status === "paid") {
    return input.workflowRole === "deposit"
      ? "This deposit invoice is fully paid."
      : "This invoice is fully paid.";
  }

  if (input.status === "partially_paid") {
    return input.workflowRole === "deposit"
      ? `A deposit payment has already been recorded, but ${formatMoney(input.balanceDueAmount)} still remains.`
      : `A payment has already been recorded, but ${formatMoney(input.balanceDueAmount)} still remains due.`;
  }

  if (input.status === "void") {
    return "This invoice has been voided and no longer accepts customer payment activity.";
  }

  return input.workflowRole === "deposit"
    ? `This deposit request still shows ${formatMoney(input.balanceDueAmount)} due.`
    : `This invoice still shows ${formatMoney(input.balanceDueAmount)} due.`;
}

function getNextAction(input: {
  status: string;
  workflowRole: string;
  balanceDueAmount: string;
  projectId: string;
  canRequestPayment: boolean;
  latestPaymentEventType: string | null;
}) {
  if (input.status === "paid" || Number(input.balanceDueAmount) <= 0) {
    return {
      title: "Billing is current",
      description:
        "This invoice no longer shows an outstanding balance. Return to the project workspace for the broader commercial context.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.latestPaymentEventType === "checkout_started") {
    return {
      title: "Payment is already in progress",
      description:
        "Checkout has already started, so use this page to confirm progress rather than starting a second payment request.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.latestPaymentEventType === "payment_requested") {
    return {
      title: "Payment has already been requested",
      description:
        "Customer payment activity has already started on this invoice, so the current billing state is the main thing to review here.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.latestPaymentEventType === "payment_succeeded") {
    return {
      title:
        input.status === "partially_paid"
          ? input.workflowRole === "deposit"
            ? "Review the remaining deposit balance"
            : "Review the remaining invoice balance"
          : "Billing is current",
      description:
        input.status === "partially_paid"
          ? "A payment has already been applied, but there is still an outstanding balance to review."
          : "The latest payment completed successfully.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.latestPaymentEventType === "payment_failed") {
    return {
      title: "Review the failed payment attempt",
      description:
        "A recent payment attempt failed, so this invoice still needs attention before the shared billing step is complete.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.latestPaymentEventType === "payment_voided") {
    return {
      title: "Review the reopened billing state",
      description:
        "The latest payment was voided, so this invoice has returned to an open balance.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.status === "partially_paid") {
    return {
      title:
        input.workflowRole === "deposit"
          ? "Review the remaining deposit balance"
          : "Review the remaining invoice balance",
      description:
        input.workflowRole === "deposit"
          ? "A deposit payment has already been recorded, but there is still a remaining balance."
          : "A payment has already been recorded, but there is still an outstanding balance on this invoice.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  if (input.canRequestPayment) {
    return {
      title: "Continue to secure checkout",
      description: "This page can now open secure checkout for this invoice.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  return {
    title: "Review the current billing state",
    description:
      "This invoice still shows an outstanding balance, but payment cannot start from its current state yet.",
    label: "Return to project workspace",
    href: `/portal/projects/${input.projectId}`
  };
}

export default async function PortalInvoiceReviewPage({
  params,
  searchParams
}: PortalInvoiceReviewPageProps) {
  const { invoiceId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const invoice = await getPortalInvoiceReviewData(
    invoiceId,
    `/portal/invoices/${invoiceId}`
  );

  if (!invoice) {
    notFound();
  }

  const productionActionLock = await getOrganizationProductionActionLockState(
    invoice.organizationId
  );
  const isProductionActionLocked = productionActionLock.isLocked;
  const nextAction = getNextAction({
    status: invoice.status,
    workflowRole: invoice.workflowRole,
    balanceDueAmount: invoice.balanceDueAmount,
    projectId: invoice.projectId,
    canRequestPayment: invoice.paymentWorkflow.canRequestPayment,
    latestPaymentEventType: invoice.paymentEvents[0]?.eventType ?? null
  });

  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="min-w-0 space-y-10">
        <div className={portalHeroPanelClassName}>
          <DetailPageHeader
            eyebrow="Invoice Review"
            title={invoice.referenceNumber}
            description="Review your invoice, check what has been paid, and continue with the next payment step when it is available."
            backHref={`/portal/projects/${invoice.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <PortalSecondaryLink
                  href={`/portal/invoices/${invoice.id}/pdf`}
                >
                  Print / save PDF
                </PortalSecondaryLink>
                <PortalStatusBadge
                  status={invoice.status}
                  className="px-4 py-2 text-sm"
                >
                  {formatStatusLabel(invoice.status)}
                </PortalStatusBadge>
              </div>
            }
          />

          {resolvedSearchParams.error ? (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800"
            >
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800"
            >
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <div className="mt-10 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <section className={portalStatePanelClassName}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Payment state
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <PortalStatusBadge
                      status={invoice.status}
                      className="px-3.5 py-1.5 text-sm"
                    >
                      {formatStatusLabel(invoice.status)}
                    </PortalStatusBadge>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600">
                      {invoice.workflowRole === "deposit"
                        ? "Deposit request"
                        : "Standard invoice"}
                    </span>
                  </div>
                  <p className="text-[2rem] font-semibold tracking-tight text-slate-950">
                    {formatMoney(invoice.balanceDueAmount)}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {formatMoney(invoice.paidAmount)} paid of{" "}
                    {formatMoney(invoice.totalAmount)} total
                  </p>
                  <div className={portalInsetPanelClassName}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Current progress
                    </p>
                    <p className="mt-2 text-sm font-semibold capitalize text-slate-950">
                      {formatStatusLabel(invoice.status)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {getPaymentProgressSummary({
                        status: invoice.status,
                        workflowRole: invoice.workflowRole,
                        balanceDueAmount: invoice.balanceDueAmount,
                        latestPaymentEventType:
                          invoice.paymentEvents[0]?.eventType ?? null
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Issue date {formatDate(invoice.issueDate)} | Due date{" "}
                      {formatDate(invoice.dueDate)}
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
                    label: "Next step",
                    content: (
                      <NextActionCard
                        eyebrow="Customer guidance"
                        title={nextAction.title}
                        description={nextAction.description}
                        primaryAction={
                          <PortalSecondaryLink href={nextAction.href}>
                            {nextAction.label}
                          </PortalSecondaryLink>
                        }
                      />
                    )
                  },
                  {
                    key: "payment-availability",
                    label: "Payment availability",
                    content: (
                      <p className="text-sm text-slate-600">
                        {invoice.paymentWorkflow.canRequestPayment
                          ? "Payment can start from this invoice now."
                          : invoice.paymentWorkflow.requestBlockers[0]
                            ? formatPaymentBlocker(
                                invoice.paymentWorkflow.requestBlockers[0]
                              )
                            : "Payment is not currently available from this invoice."}
                      </p>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailPanel
          title="Invoice Body"
          description="Review the bill, line items, totals, and notes before taking any payment action."
        >
          <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="min-w-0 space-y-6">
              <section className="min-w-0 space-y-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-950">
                    Line items
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    The work and charges included on this invoice.
                  </p>
                </div>
                {invoice.lineItems.length > 0 ? (
                  <div className="min-w-0 space-y-3">
                    {invoice.lineItems.map((lineItem) => (
                      <div
                        key={lineItem.id}
                        className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                      >
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="break-words text-sm font-semibold text-slate-950 [overflow-wrap:anywhere]">
                              {lineItem.name}
                            </p>
                            {lineItem.description ? (
                              <p className="break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                                {lineItem.description}
                              </p>
                            ) : null}
                            <p className="text-sm text-slate-500">
                              {Number(lineItem.quantity).toLocaleString(
                                "en-US"
                              )}{" "}
                              {lineItem.unit} at{" "}
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
                    No invoice line items are currently shared on this record.
                  </div>
                )}
              </section>

              <section className="grid min-w-0 gap-6 lg:grid-cols-2">
                <div className="min-w-0 space-y-3">
                  <p className="text-sm font-medium text-slate-950">
                    Invoice notes
                  </p>
                  <div className="min-w-0 break-words rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                    {invoice.notes ??
                      "No billing notes are currently shared on this invoice."}
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <p className="text-sm font-medium text-slate-950">
                    Payment records
                  </p>
                  {invoice.payments.length > 0 ? (
                    <div className="min-w-0 space-y-3">
                      {invoice.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="min-w-0 break-words rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]"
                        >
                          <p className="font-semibold text-slate-950">
                            {formatMoney(payment.amount)}
                          </p>
                          <p className="mt-1">
                            {formatDate(payment.paymentDate)}
                          </p>
                          <p className="capitalize">
                            {formatStatusLabel(payment.status)} via{" "}
                            {payment.paymentMethod}
                          </p>
                          {payment.reference ? (
                            <p>Ref: {payment.reference}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                      No payments have been recorded on this invoice yet.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Totals</p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.subtotalAmount)}
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
                    <dt className="font-semibold text-slate-950">
                      Balance due
                    </dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(invoice.balanceDueAmount)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Billing context
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Invoice type</dt>
                    <dd className="text-right text-slate-950">
                      {invoice.workflowRole === "deposit"
                        ? "Deposit request"
                        : "Standard invoice"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Issue date</dt>
                    <dd className="text-right text-slate-950">
                      {formatDate(invoice.issueDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Due date</dt>
                    <dd className="text-right text-slate-950">
                      {formatDate(invoice.dueDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Project</dt>
                    <dd className="max-w-[14rem] text-right text-slate-950">
                      {invoice.project?.name ?? "Unknown project"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </DetailPanel>
      </section>

      <aside className="min-w-0 space-y-6">
        <DetailPanel
          title="Payment Actions"
          description="Continue to secure checkout when payment is available."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p className="max-w-[34ch]">
              {isProductionActionLocked
                ? "Checkout is locked during early access. You can still review this invoice and its payment state."
                : invoice.paymentWorkflow.canRequestPayment
                  ? "Continue to secure checkout for this invoice."
                  : invoice.paymentWorkflow.requestBlockers[0]
                    ? formatPaymentBlocker(
                        invoice.paymentWorkflow.requestBlockers[0]
                      )
                    : "Customer payment is not currently available from this invoice."}
            </p>
            <p>
              {getPaymentProgressSummary({
                status: invoice.status,
                workflowRole: invoice.workflowRole,
                balanceDueAmount: invoice.balanceDueAmount,
                latestPaymentEventType:
                  invoice.paymentEvents[0]?.eventType ?? null
              })}
            </p>

            {invoice.paymentWorkflow.canRequestPayment &&
            !isProductionActionLocked ? (
              <form
                action={requestPortalInvoicePaymentAction}
                className={portalActionBoxClassName}
              >
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <input
                  type="hidden"
                  name="amount"
                  value={invoice.balanceDueAmount}
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-950">
                    Optional payment note
                  </span>
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={1000}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Add a short note if it helps clarify this checkout."
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Continue to checkout for{" "}
                  {formatMoney(invoice.balanceDueAmount)}
                </button>
              </form>
            ) : isProductionActionLocked ? (
              <EarlyAccessLockNotice showLink={false} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                Payment is currently blocked by this invoice's current state.
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Invoice Context"
          description="Project and invoice details for reference."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: invoice.project ? (
                  <Link
                    href={`/portal/projects/${invoice.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {invoice.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value:
                  invoice.customer?.companyName ??
                  invoice.customer?.name ??
                  "Not provided"
              },
              {
                label: "Status",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(invoice.status)}
                  </span>
                )
              },
              {
                label: "Invoice type",
                value:
                  invoice.workflowRole === "deposit"
                    ? "Deposit request"
                    : "Standard invoice"
              },
              {
                label: "Created",
                value: formatDateTime(invoice.createdAt)
              },
              {
                label: "Updated",
                value: formatDateTime(invoice.updatedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Payment Activity"
          description="Recent payment activity on this invoice."
        >
          <div className="space-y-3">
            {invoice.paymentEvents.length > 0 ? (
              invoice.paymentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">
                      {formatPaymentEventLabel(event.eventType)}
                    </p>
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {formatPaymentActorLabel(event.actorType)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                    <p>{formatDateTime(event.occurredAt)}</p>
                    {typeof event.payload?.amount === "string" ? (
                      <p>Amount: {formatMoney(event.payload.amount)}</p>
                    ) : null}
                    {typeof event.payload?.gatewayStatus === "string" ? (
                      <p>
                        Status: {formatStatusLabel(event.payload.gatewayStatus)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                No payment activity has been recorded on this invoice yet.
              </div>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
