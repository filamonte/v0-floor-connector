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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Edit Estimate
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {estimate.referenceNumber}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Update estimate details, line items, tax, discount, and notes.
              The proposal view stays separate so the outward-facing document
              remains clean and readable.
            </p>
          </div>
          <Link
            href={`/estimates/${estimate.id}`}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to proposal
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <div className="mt-8">
          <EstimateForm
            action={updateEstimateAction}
            submitLabel="Save estimate"
            pendingLabel="Saving estimate..."
            projects={projectOptions}
            estimate={estimate}
          />
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Editing Notes
        </p>
        <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
          <p>
            Line item totals roll into the estimate subtotal automatically, and
            the database recalculates the final total after tax and discount.
          </p>
          <p>
            Use the proposal page when you want a cleaner internal review or a
            shareable layout for discussing the estimate with a customer.
          </p>
          <Link
            href={`/estimates/${estimate.id}`}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Open proposal view
          </Link>
        </div>
      </aside>
    </div>
  );
}
