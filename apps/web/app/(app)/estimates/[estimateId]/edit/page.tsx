import { notFound } from "next/navigation";

import { EstimateWorkspace } from "@/components/estimates/estimate-workspace";
import { listCatalogItems } from "@/lib/catalogs/data";
import { getEstimateById } from "@/lib/estimates/data";

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
  const [estimate, catalogItems] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}/edit`),
    listCatalogItems()
  ]);

  if (!estimate) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {resolvedSearchParams.error && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800 shadow-lg">
          {resolvedSearchParams.error}
        </div>
      )}

      {resolvedSearchParams.message && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800 shadow-lg">
          {resolvedSearchParams.message}
        </div>
      )}

      <EstimateWorkspace
        estimate={estimate}
        opportunityTitle={estimate.opportunity?.title ?? null}
        customerName={estimate.customer?.name ?? null}
        projectName={estimate.project?.name ?? null}
        catalogItems={catalogItems}
      />
    </div>
  );
}
