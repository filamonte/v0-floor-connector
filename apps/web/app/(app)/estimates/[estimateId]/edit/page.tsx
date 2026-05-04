import { notFound } from "next/navigation";

import { EstimateForm } from "@/components/estimate-form";
import { listCatalogItems } from "@/lib/catalogs/data";
import { listEstimateContentBlocks } from "@/lib/estimate-content-blocks/data";
import {
  importEstimateLineItemsAction,
  importEstimateReusableContentAction,
  insertCatalogItemToEstimateAction,
  openOrCreateScheduleOfValuesAction,
  saveEstimateAction,
  insertSystemToEstimateAction,
  previewExpandedSystemAction,
  quickCreateEstimateCatalogItemAction,
  rebuildApprovedEstimateSnapshotAction,
  updateCatalogItemFromEstimateAction,
  updateEstimateStatusSaveAction
} from "@/lib/estimates/actions";
import { resolveEstimateApprovalOrchestration } from "@/lib/estimates/approval-orchestration";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import { getEstimateById, listEstimates } from "@/lib/estimates/data";
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

  const [catalogItems, contentBlocks, organizationFinancialSettings, estimates] = await Promise.all([
    listCatalogItems(),
    listEstimateContentBlocks(),
    getOrganizationFinancialSettings(estimate.organizationId),
    listEstimates()
  ]);
  const importSourceEstimates = estimates
    .filter((sourceEstimate) => sourceEstimate.id !== estimate.id)
    .map((sourceEstimate) => ({
      id: sourceEstimate.id,
      referenceNumber: sourceEstimate.referenceNumber,
      title: sourceEstimate.title,
      customerName: sourceEstimate.customer?.name ?? null,
      projectName: sourceEstimate.project?.name ?? null,
      status: sourceEstimate.status,
      updatedAt: sourceEstimate.updatedAt,
      hasScopeContent: Boolean(
        sourceEstimate.content.scopeSummaryHtml || sourceEstimate.content.scopeItems.length > 0
      ),
      hasTermsContent: Boolean(sourceEstimate.content.termsHtml),
      hasInclusionsContent: Boolean(sourceEstimate.content.inclusionsHtml),
      hasExclusionsContent: Boolean(sourceEstimate.content.exclusionsHtml)
    }));
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
        projectServiceAddress={
          estimate.project
            ? {
                addressLine1: estimate.project.addressLine1,
                addressLine2: estimate.project.addressLine2,
                city: estimate.project.city,
                stateRegion: estimate.project.stateRegion,
                postalCode: estimate.project.postalCode,
                countryCode: estimate.project.countryCode
              }
            : null
        }
        catalogItems={catalogItems}
        contentBlocks={contentBlocks}
        customerTaxExempt={estimate.customer?.isTaxExempt ?? false}
        organizationFinancialSettings={organizationFinancialSettings}
        saveEstimateAction={saveEstimateAction}
        updateStatusAction={updateEstimateStatusSaveAction}
        previewExpandedSystemAction={previewExpandedSystemAction}
        insertCatalogItemAction={insertCatalogItemToEstimateAction}
        insertSystemAction={insertSystemToEstimateAction}
        importLineItemsFromEstimateAction={importEstimateLineItemsAction}
        importReusableContentFromEstimateAction={importEstimateReusableContentAction}
        quickCreateCatalogItemAction={quickCreateEstimateCatalogItemAction}
        updateCatalogItemFromEstimateAction={updateCatalogItemFromEstimateAction}
        importSourceEstimates={importSourceEstimates}
        approvalOrchestration={approvalOrchestration}
        contractAction={quickCreateContractFromEstimateAction}
        scheduleOfValuesAction={openOrCreateScheduleOfValuesAction}
        rebuildSnapshotAction={rebuildApprovedEstimateSnapshotAction}
      />
    </div>
  );
}
