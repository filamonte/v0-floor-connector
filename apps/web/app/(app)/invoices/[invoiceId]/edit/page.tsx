import { notFound } from "next/navigation";

import { InvoiceForm } from "@/components/invoice-form";
import { StandardWorkspaceLayout } from "@/components/workspace/standard-workspace-layout";
import { listCatalogItems } from "@/lib/catalogs/data";
import { updateInvoiceAction } from "@/lib/invoices/actions";
import { getInvoiceById, listInvoiceSourceOptions } from "@/lib/invoices/data";
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

  const [
    invoice,
    projects,
    estimates,
    jobs,
    organizationFinancialSettings,
    sourceOptions,
    catalogItems
  ] = await Promise.all([
    getInvoiceById(invoiceId, `/invoices/${invoiceId}/edit`),
    listProjects(),
    listEstimates(),
    listJobs(),
    getOrganizationFinancialSettings(organizationContext.organization.id),
    listInvoiceSourceOptions(),
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
    <div className="space-y-4">
      {resolvedSearchParams.error ? (
        <div className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <StandardWorkspaceLayout
        header={{
          eyebrow: "Financials module",
          title: invoice.referenceNumber,
          description: invoice.customer?.name
            ? `${invoice.customer.name} billing workspace`
            : "Invoice build workspace aligned to the same shared project, estimate, and payment lifecycle.",
          actions: (
            <div className="border border-[#d7c7b4] bg-[#fbf7f1] px-3 py-2 text-sm leading-5 text-[#665446]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                Invoice status
              </p>
              <div className="mt-1 space-y-1">
                <p className="capitalize">
                  {invoice.status.replaceAll("_", " ")}
                </p>
                <p className="capitalize">
                  {invoice.workflowRole.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          )
        }}
        sidebar={[
          {
            id: "details",
            label: "Details",
            iconName: "file-text",
            href: "#details"
          },
          {
            id: "items",
            label: "Items",
            iconName: "receipt-text",
            href: "#items"
          },
          {
            id: "billing-notes-terms",
            label: "Billing Notes / Terms",
            iconName: "scroll-text",
            href: "#billing-notes-terms"
          },
          {
            id: "files",
            label: "Files",
            iconName: "folder-open",
            href: "#files"
          },
          {
            id: "payments",
            label: "Payments",
            iconName: "circle-dollar-sign",
            href: "#payments"
          },
          {
            id: "notes",
            label: "Notes",
            iconName: "notebook-pen",
            href: "#notes"
          },
          {
            id: "review-send",
            label: "Review / Send",
            iconName: "send",
            href: "#review-send"
          }
        ]}
      >
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
          sourceOptions={sourceOptions}
          catalogItems={catalogItems.map((item) => ({
            id: item.id,
            name: item.name,
            unit: item.unit,
            defaultUnitPrice: item.defaultUnitPrice,
            status: item.status
          }))}
        />
      </StandardWorkspaceLayout>
    </div>
  );
}
