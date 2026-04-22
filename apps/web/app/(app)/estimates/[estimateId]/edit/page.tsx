import { notFound } from "next/navigation";

import { EstimateForm } from "@/components/estimate-form";
import {
  RecordWorkspaceShell,
  type RecordWorkspaceStage
} from "@/components/record-workspace-shell";
import { listCatalogItems } from "@/lib/catalogs/data";
import { updateEstimateAction } from "@/lib/estimates/actions";
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

function buildStages(status: string): RecordWorkspaceStage[] {
  return [
    { label: "Estimating", tone: status === "draft" ? "active" : "complete" },
    {
      label: "Review",
      tone: status === "draft" ? "pending" : "complete"
    },
    {
      label: "Sent",
      tone: status === "sent" ? "active" : status === "approved" ? "complete" : "pending"
    },
    {
      label: "Approved",
      tone: status === "approved" ? "complete" : "pending"
    }
  ];
}

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
    <RecordWorkspaceShell
      backHref="/estimates"
      backLabel="Back"
      title={estimate.project?.name ?? `Estimate ${estimate.referenceNumber}`}
      subtitle={
        estimate.opportunity?.title ??
        "Build the estimate first, then review and send it downstream without breaking canonical opportunity continuity."
      }
      referenceLabel="Estimate #"
      referenceValue={estimate.referenceNumber}
      statusBadge={estimate.status.replaceAll("_", " ")}
      stages={buildStages(estimate.status)}
      sections={[
        { id: "details", label: "Details" },
        { id: "items", label: "Items" },
        { id: "terms", label: "Terms" },
        { id: "scope-of-work", label: "Scope of Work" },
        { id: "files", label: "Files" },
        { id: "cover-sheet", label: "Cover Sheet" },
        { id: "notes", label: "Notes" },
        { id: "review-send", label: "Review / Send" }
      ]}
      footerActionLabel="Review and Submit"
      footerActionHref={`/estimates/${estimate.id}`}
      footerMeta={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>Created {new Date(estimate.createdAt).toLocaleDateString()}</span>
          <span>Updated {new Date(estimate.updatedAt).toLocaleDateString()}</span>
          <span>
            Opportunity continuity {estimate.opportunityId ? "linked" : "missing"}
          </span>
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

      <EstimateForm
        action={updateEstimateAction}
        submitLabel="Save estimate"
        pendingLabel="Saving estimate..."
        estimate={estimate}
        opportunityTitle={estimate.opportunity?.title ?? null}
        customerName={estimate.customer?.name ?? null}
        projectName={estimate.project?.name ?? null}
        catalogItems={catalogItems}
      />
    </RecordWorkspaceShell>
  );
}
