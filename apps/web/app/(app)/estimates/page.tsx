import Link from "next/link";

import { EstimateForm } from "@/components/estimate-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listEstimates } from "@/lib/estimates/data";
import { createEstimateAction } from "@/lib/estimates/actions";
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Estimates
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Estimate records for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Estimates are linked to projects, inherit the correct customer from
          that project, and calculate their totals from explicit line items inside
          the active organization.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Ordered by estimate status first, then most recently updated.
        </p>

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

        <div className="mt-8 grid gap-4">
          {estimates.length > 0 ? (
            estimates.map((estimate) => (
              <Link
                key={estimate.id}
                href={`/estimates/${estimate.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">
                      {estimate.referenceNumber}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {estimate.project?.name ?? "Unknown project"}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-slate-500 sm:text-right">
                    <p className="capitalize">{formatStatusLabel(estimate.status)}</p>
                    <p>{formatMoney(estimate.totalAmount)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {estimate.customer?.name ?? "Unknown customer"}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              No estimates have been created yet. Start with a project and create
              the first estimate using the form in the right column.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          New Estimate
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Create a line-item-based estimate for an existing project. Contract
          signing, invoices, and advanced pricing logic remain out of scope for now.
        </p>
        {projectOptions.length > 0 ? (
          <div className="mt-6">
            <EstimateForm
              action={createEstimateAction}
              submitLabel="Create estimate"
              pendingLabel="Creating estimate..."
              projects={projectOptions}
              initialProjectId={resolvedSearchParams.projectId}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Add at least one project before creating an estimate.
          </div>
        )}
      </aside>
    </div>
  );
}
