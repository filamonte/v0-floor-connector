import Link from "next/link";
import { Suspense } from "react";

import { EstimatesTable } from "@/components/estimates-table";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type EstimatesPageProps = {
  searchParams?: Promise<{
    status?: string;
    projectId?: string;
    search?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function EstimatesPage({
  searchParams
}: EstimatesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/estimates");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-200">
        Estimate records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </div>
    );
  }

  const [estimates, projects] = await Promise.all([
    listEstimates(),
    listProjects()
  ]);

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Estimates
          </h1>
          <p className="mt-1 text-sm text-[--muted]">
            Manage and track all your project estimates
          </p>
        </div>
        <Link
          href="/estimates/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Estimate
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

      {/* Table */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-[--line] bg-[--surface] p-8">
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[--muted] border-t-white" />
            </div>
          </div>
        }
      >
        <EstimatesTable
          estimates={estimates}
          projects={projectOptions}
          initialFilters={{
            status: resolvedSearchParams.status,
            projectId: resolvedSearchParams.projectId,
            search: resolvedSearchParams.search
          }}
        />
      </Suspense>
    </div>
  );
}
