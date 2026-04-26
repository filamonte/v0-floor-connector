import { notFound } from "next/navigation";

import { EstimateForm } from "@/components/estimate-form";
import { listCatalogItems } from "@/lib/catalogs/data";
import { listEstimateContentBlocks } from "@/lib/estimate-content-blocks/data";
import {
  autosaveEstimateAction,
  insertCatalogItemToEstimateAction,
  openOrCreateScheduleOfValuesAction,
  insertSystemToEstimateAction,
  previewExpandedSystemAction,
  quickCreateEstimateCatalogItemAction,
  updateEstimateStatusAutosaveAction
} from "@/lib/estimates/actions";
import { resolveEstimateApprovalOrchestration } from "@/lib/estimates/approval-orchestration";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import { getEstimateById } from "@/lib/estimates/data";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";

type EstimateEditPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function EstimateEditPage({
  params,
  searchParams
}: EstimateEditPageProps) {
  const { estimateId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const estimate = await getEstimateById(estimateId, `/estimates/${estimateId}/edit`);

  if (!estimate) {
    notFound();
  }

  const [catalogItems, contentBlocks, organizationFinancialSettings] = await Promise.all([
    listCatalogItems(),
    listEstimateContentBlocks(),
    getOrganizationFinancialSettings(estimate.organizationId)
  ]);
  const approvalOrchestration =
    estimate.status === "approved"
      ? await resolveEstimateApprovalOrchestration(
          estimate.id,
          `/estimates/${estimate.id}/edit`
        )
      : null;

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

      <EstimateForm
        estimate={estimate}
        opportunityTitle={estimate.opportunity?.title ?? null}
        customerName={estimate.customer?.name ?? null}
        projectName={estimate.project?.name ?? null}
        catalogItems={catalogItems}
        contentBlocks={contentBlocks}
        customerTaxExempt={estimate.customer?.isTaxExempt ?? false}
        organizationFinancialSettings={organizationFinancialSettings}
        autosaveAction={autosaveEstimateAction}
        updateStatusAction={updateEstimateStatusAutosaveAction}
        previewExpandedSystemAction={previewExpandedSystemAction}
        insertCatalogItemAction={insertCatalogItemToEstimateAction}
        insertSystemAction={insertSystemToEstimateAction}
        quickCreateCatalogItemAction={quickCreateEstimateCatalogItemAction}
        approvalOrchestration={approvalOrchestration}
        contractAction={quickCreateContractFromEstimateAction}
        invoiceAction={quickCreateInvoiceAction}
        scheduleOfValuesAction={openOrCreateScheduleOfValuesAction}
      />
    </div>
  );
}
