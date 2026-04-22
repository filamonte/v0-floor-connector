import { notFound } from "next/navigation";

import { InvoiceForm } from "@/components/invoice-form";
import {
  RecordWorkspaceShell,
  type RecordWorkspaceStage
} from "@/components/record-workspace-shell";
import { listCatalogItems } from "@/lib/catalogs/data";
import { updateInvoiceAction } from "@/lib/invoices/actions";
import { getInvoiceById } from "@/lib/invoices/data";
import { listEstimates } from "@/lib/estimates/data";
import { listJobs } from "@/lib/jobs/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { listProjects } from "@/lib/projects/data";

type InvoiceEditPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function buildStages(status: string): RecordWorkspaceStage[] {
  return [
    { label: "Draft", tone: status === "draft" ? "active" : "complete" },
    {
      label: "Review",
      tone:
        status === "draft"
          ? "active"
          : status === "sent" || status === "partially_paid" || status === "paid"
            ? "complete"
            : "pending"
    },
    {
      label: "Sent",
      tone:
        status === "sent" || status === "partially_paid"
          ? "active"
          : status === "paid"
            ? "complete"
            : "pending"
    },
    {
      label: "Paid",
      tone: status === "paid" ? "complete" : "pending"
    }
  ];
}

export default async function InvoiceEditPage({
  params,
  searchParams
}: InvoiceEditPageProps) {
  const { invoiceId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/invoices/${invoiceId}/edit`);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    notFound();
  }

  const [invoice, projects, estimates, jobs, organizationFinancialSettings, catalogItems] =
    await Promise.all([
      getInvoiceById(invoiceId, `/invoices/${invoiceId}/edit`),
      listProjects(),
      listEstimates(),
      listJobs(),
      getOrganizationFinancialSettings(organizationContext.organization.id),
      listCatalogItems()
    ]);

  if (!invoice) {
    notFound();
  }

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null,
    customerTaxExempt: project.customer?.isTaxExempt ?? false,
    customerRetainagePercentageDefault:
      project.customer?.retainagePercentageDefault ?? "0.00"
  }));

  const estimateOptions = estimates.map((estimate) => ({
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
    dispatchStatus: job.dispatchStatus,
    estimateId: job.estimateId ?? null
  }));

  return (
    <RecordWorkspaceShell
      backHref="/invoices"
      backLabel="Back"
      title={invoice.referenceNumber}
      subtitle={
        invoice.customer?.name
          ? `${invoice.customer.name} billing workspace`
          : "Invoice build workspace aligned to the same shared project, estimate, and payment lifecycle."
      }
      referenceLabel="Status"
      referenceValue={invoice.status.replaceAll("_", " ")}
      statusBadge={invoice.workflowRole.replaceAll("_", " ")}
      stages={buildStages(invoice.status)}
      sections={[
        { id: "details", label: "Details" },
        { id: "items", label: "Items" },
        { id: "billing-notes-terms", label: "Billing Notes / Terms" },
        { id: "files", label: "Files" },
        { id: "payments", label: "Payments" },
        { id: "notes", label: "Notes" },
        { id: "review-send", label: "Review / Send" }
      ]}
      footerActionLabel="Submit to Client"
      footerActionHref={`/invoices/${invoice.id}`}
      footerMeta={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>Created {new Date(invoice.createdAt).toLocaleDateString()}</span>
          <span>Updated {new Date(invoice.updatedAt).toLocaleDateString()}</span>
          <span>Balance due {Number(invoice.balanceDueAmount).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
        </div>
      }
    >
      {resolvedSearchParams.error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <InvoiceForm
        action={updateInvoiceAction}
        submitLabel="Save invoice"
        pendingLabel="Saving invoice..."
        projects={projectOptions}
        estimates={estimateOptions}
        jobs={jobOptions}
        organizationFinancialSettings={organizationFinancialSettings}
        invoice={invoice}
        paidAmount={invoice.paidAmount}
        catalogItems={catalogItems}
      />
    </RecordWorkspaceShell>
  );
}
