import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { EstimateBuilder } from "@/components/estimate-builder";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { createEstimateAction } from "@/lib/estimates/actions";
import { listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type EstimatesPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default async function EstimatesPage({
  searchParams
}: EstimatesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/estimates");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Estimate records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [estimates, projects] = await Promise.all([listEstimates(), listProjects()]);
  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));
  const draftCount = estimates.filter((estimate) => estimate.status === "draft").length;
  const sentCount = estimates.filter((estimate) => estimate.status === "sent").length;
  const approvedCount = estimates.filter((estimate) => estimate.status === "approved").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(460px,1fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Estimates
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Commercial scope for {organizationContext.organization.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Estimates stay tied to projects and customers, so approval, contract generation, and downstream field work all move forward from the same record.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Draft</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{draftCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Sent</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{sentCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Approved</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{approvedCount}</p>
            </div>
          </div>
        </section>

        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_160px_140px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
              <span>Estimate</span>
              <span>Project</span>
              <span>Status</span>
              <span className="text-right">Total</span>
            </div>
            <div className="md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Estimates list
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {estimates.length > 0 ? (
              estimates.map((estimate) => (
                <Link
                  key={estimate.id}
                  href={`/estimates/${estimate.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_1fr_160px_140px] md:items-center">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {estimate.referenceNumber}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {estimate.customer?.name ?? "Unknown customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Project
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {estimate.project?.name ?? "Unknown project"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(estimate.status)}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Total
                      </p>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatMoney(estimate.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No estimates yet"
                  title="Create the first estimate"
                  description="Estimates define the proposed scope and commercial value that later flows into contracts, jobs, and invoicing."
                />
              </div>
            )}
          </div>
        </section>
      </section>

      {projectOptions.length > 0 ? (
        <EstimateBuilder
          action={createEstimateAction}
          projects={projectOptions}
          initialProjectId={resolvedSearchParams.projectId}
        />
      ) : (
        <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Estimate Builder
          </p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Add at least one project before creating an estimate.
          </div>
        </aside>
      )}
    </div>
  );
}
