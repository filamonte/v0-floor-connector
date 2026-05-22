import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CustomerDocumentHtml,
  CustomerDocumentLineItemsTable,
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  CustomerDocumentTotals,
  formatDocumentAddress,
  formatDocumentDate,
  formatDocumentMoney,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  buildDocumentBackHref,
  buildDocumentEngineBrand,
  getDocumentEngineExportNotice,
  getDocumentEngineFooterNote
} from "@/lib/document-engine/print";
import { getEstimateById } from "@/lib/estimates/data";
import { getIncludedEstimateScopeItems } from "@/lib/estimates/workspace";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type EstimatePdfPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
};

export default async function EstimatePdfPage({
  params
}: EstimatePdfPageProps) {
  const { estimateId } = await params;
  const user = await requireAuthenticatedUser(`/estimates/${estimateId}/pdf`);
  const [estimate, organizationContext] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}/pdf`),
    getActiveOrganizationContext(user.id)
  ]);

  if (!estimate) {
    notFound();
  }

  const includedScopeItems = getIncludedEstimateScopeItems(estimate.content);
  const customerAddress = estimate.customer
    ? formatDocumentAddress([
        estimate.customer.addressLine1,
        estimate.customer.addressLine2,
        estimate.customer.city,
        estimate.customer.stateRegion,
        estimate.customer.postalCode,
        estimate.customer.countryCode
      ])
    : "Not provided";
  const projectAddress = estimate.project
    ? formatDocumentAddress([
        estimate.project.addressLine1,
        estimate.project.addressLine2,
        estimate.project.city,
        estimate.project.stateRegion,
        estimate.project.postalCode,
        estimate.project.countryCode
      ])
    : "Not provided";

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentEngineBrand(organizationContext)}
      title={estimate.title ?? `Estimate ${estimate.referenceNumber}`}
      subtitle={`Estimate #${estimate.referenceNumber}`}
      statusLabel={formatDocumentStatus(estimate.status)}
      backHref={buildDocumentBackHref({
        subjectType: "estimate",
        subjectId: estimate.id
      })}
      backLabel="Back to estimate"
      exportNotice={getDocumentEngineExportNotice("estimate")}
      footerNote={getDocumentEngineFooterNote("estimate")}
      facts={[
        {
          label: "Customer",
          value: estimate.customer?.name ?? "Unknown customer"
        },
        {
          label: "Project",
          value: estimate.project?.name ?? "Unknown project"
        },
        {
          label: "Estimate date",
          value: formatDocumentDate(estimate.estimateDate)
        },
        {
          label: "Expires",
          value: formatDocumentDate(estimate.expirationDate)
        },
        {
          label: "Subtotal",
          value: formatDocumentMoney(estimate.subtotalAmount)
        },
        { label: "Total", value: formatDocumentMoney(estimate.totalAmount) }
      ]}
    >
      <CustomerDocumentSection title="Customer and project">
        <div className="grid gap-4 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Customer</p>
            <p>
              {estimate.customer?.companyName ??
                estimate.customer?.name ??
                "Not provided"}
            </p>
            <p>{estimate.customer?.email ?? "No email on file"}</p>
            <p>{customerAddress}</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Project</p>
            <p>{estimate.project?.name ?? "Not provided"}</p>
            <p>{projectAddress}</p>
            <p className="capitalize">
              Status: {estimate.project?.status ?? "Not provided"}
            </p>
          </div>
        </div>
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Scope summary">
        <CustomerDocumentHtml html={estimate.content.scopeSummaryHtml} />
        {includedScopeItems.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
            {includedScopeItems.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        ) : null}
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Line items">
        <CustomerDocumentLineItemsTable lineItems={estimate.lineItems} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Totals">
        <CustomerDocumentTotals
          rows={[
            { label: "Subtotal", value: estimate.subtotalAmount },
            { label: "Tax", value: estimate.taxAmount },
            { label: "Discount", value: estimate.discountAmount },
            { label: "Total", value: estimate.totalAmount, isTotal: true }
          ]}
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Inclusions">
        <CustomerDocumentHtml html={estimate.content.inclusionsHtml} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Exclusions">
        <CustomerDocumentHtml html={estimate.content.exclusionsHtml} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Terms">
        <CustomerDocumentHtml html={estimate.content.termsHtml} />
      </CustomerDocumentSection>

      <div className="print:hidden">
        <Link
          href={`/estimates/${estimate.id}`}
          className="text-sm font-medium text-[var(--copper)]"
        >
          Return to estimate workspace
        </Link>
      </div>
    </CustomerDocumentPrintView>
  );
}
