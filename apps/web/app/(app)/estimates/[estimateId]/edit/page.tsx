import Link from "next/link";
import { notFound } from "next/navigation";

import { EstimateForm } from "@/components/estimate-form";
import { updateEstimateAction } from "@/lib/estimates/actions";
import { getEstimateById } from "@/lib/estimates/data";
import { listProjects } from "@/lib/projects/data";

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
  const [estimate, projects] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}/edit`),
    listProjects()
  ]);

  if (!estimate) {
    notFound();
  }

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/estimates/${estimate.id}`}
            className="rounded-lg p-2 text-[--muted] transition hover:bg-[--surface] hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Edit Estimate
            </h1>
            <p className="mt-1 text-sm text-[--muted]">
              {estimate.referenceNumber} · Update details and line items
            </p>
          </div>
        </div>
        <Link
          href={`/estimates/${estimate.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[--line] bg-[--background] px-4 py-2 text-sm font-medium text-white transition hover:bg-[--surface-strong]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Proposal
        </Link>
      </div>

      {/* Alerts */}
      {resolvedSearchParams.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {resolvedSearchParams.error}
        </div>
      )}
      {resolvedSearchParams.message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {resolvedSearchParams.message}
        </div>
      )}

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-[--line] bg-[--surface] p-6">
          <EstimateForm
            action={updateEstimateAction}
            submitLabel="Save estimate"
            pendingLabel="Saving estimate..."
            projects={projectOptions}
            estimate={estimate}
          />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-[--line] bg-[--surface] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[--muted]">
              Editing Notes
            </h3>
            <div className="mt-4 space-y-3 text-sm text-[--muted]">
              <p>
                Line item totals roll into the estimate subtotal automatically.
              </p>
              <p>
                The database recalculates the final total after tax and discount.
              </p>
              <p>
                Use the proposal view for a cleaner layout when reviewing with customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
