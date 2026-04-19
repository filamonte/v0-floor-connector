import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { getPortalInvoiceReviewData } from "@/lib/portal/data";

type PortalInvoiceReviewPageProps = {
  params: Promise<{
    invoiceId: string;
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

function getNextAction(input: {
  status: string;
  balanceDueAmount: string;
  projectId: string;
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

  return {
    title: "Prepare for online payment later",
    description:
      "This invoice still shows an outstanding balance. Online payment will extend this same shared invoice in a later portal pass.",
    label: "Return to project workspace",
    href: `/portal/projects/${input.projectId}`
  };
}

export default async function PortalInvoiceReviewPage({
  params
}: PortalInvoiceReviewPageProps) {
  const { invoiceId } = await params;
  const invoice = await getPortalInvoiceReviewData(
    invoiceId,
    `/portal/invoices/${invoiceId}`
  );

  if (!invoice) {
    notFound();
  }

  const nextAction = getNextAction({
    status: invoice.status,
    balanceDueAmount: invoice.balanceDueAmount,
    projectId: invoice.projectId
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Invoice Review"
            title={invoice.referenceNumber}
            description="Review the shared invoice body, payment summary, and customer-facing billing context for this project."
            backHref={`/portal/projects/${invoice.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-700">
                {formatStatusLabel(invoice.status)}
              </span>
            }
          />

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "purpose",
                  label: "What this page is for",
                  content: (
                    <p className="text-sm leading-6 text-slate-600">
                      Review the shared invoice scope, totals, payments recorded, and remaining
                      balance due.
                    </p>
                  )
                },
                {
                  key: "balance-due",
                  label: "Balance due",
                  content: (
                    <>
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {formatMoney(invoice.balanceDueAmount)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatMoney(invoice.paidAmount)} paid of {formatMoney(invoice.totalAmount)}{" "}
                        total
                      </p>
                    </>
                  )
                },
                {
                  key: "billing-state",
                  label: "Billing state",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p className="font-semibold capitalize text-slate-950">
                        {formatStatusLabel(invoice.status)}
                      </p>
                      <p>Issue date {formatDate(invoice.issueDate)}</p>
                      <p>Due date {formatDate(invoice.dueDate)}</p>
                    </div>
                  )
                },
                {
                  key: "next-action",
                  label: "Next step",
                  content: (
                    <NextActionCard
                      title={nextAction.title}
                      description={nextAction.description}
                      primaryAction={
                        <Link
                          href={nextAction.href}
                          className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                        >
                          {nextAction.label}
                        </Link>
                      }
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <DetailPanel
          title="Invoice Body"
          description="This is the shared billing record for the project, including line items, payment history, and customer-facing notes."
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-950">Line items</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Shared invoice scope tied to the same canonical project workflow.
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
                    No invoice line items are currently shared on this record.
                  </div>
                )}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-950">Invoice notes</p>
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    {invoice.notes ?? "No billing notes are currently shared on this invoice."}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-950">Recorded payments</p>
                  {invoice.payments.length > 0 ? (
                    <div className="space-y-3">
                      {invoice.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600"
                        >
                          <p className="font-semibold text-slate-950">
                            {formatMoney(payment.amount)}
                          </p>
                          <p className="mt-1">{formatDate(payment.paymentDate)}</p>
                          <p className="capitalize">
                            {formatStatusLabel(payment.status)} via {payment.paymentMethod}
                          </p>
                          {payment.reference ? <p>Ref: {payment.reference}</p> : null}
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

            <div className="space-y-4">
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
                    <dt className="font-semibold text-slate-950">Balance due</dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(invoice.balanceDueAmount)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Billing context</p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Invoice type</dt>
                    <dd className="text-right text-slate-950">
                      {invoice.workflowRole === "deposit" ? "Deposit request" : "Standard invoice"}
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
                    <dd className="text-right text-slate-950">{formatDate(invoice.dueDate)}</dd>
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

      <aside className="space-y-6">
        <DetailPanel
          title="Invoice Context"
          description="Compact shared record context without contractor-only edit or workflow controls."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: invoice.project ? (
                  <Link href={`/portal/projects/${invoice.project.id}`} className="font-medium text-brand-700">
                    {invoice.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value: invoice.customer?.companyName ?? invoice.customer?.name ?? "Not provided"
              },
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(invoice.status)}</span>
              },
              {
                label: "Invoice type",
                value: invoice.workflowRole === "deposit" ? "Deposit request" : "Standard invoice"
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
          title="Later workflow hooks"
          description="This page prepares for later customer-facing payment actions without implementing them yet."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Online payment actions are intentionally outside this pass, but they are expected to
              extend this same canonical invoice and payment summary later.
            </p>
            <p>
              Until then, this page stays focused on billing visibility, payment history, and the
              current outstanding balance.
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
