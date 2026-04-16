import Link from "next/link";

import { CreateEstimateForm } from "@/components/create-estimate-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { createEstimateAction } from "@/lib/estimates/actions";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type CreateEstimatePageProps = {
  searchParams?: Promise<{
    projectId?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function CreateEstimatePage({
  searchParams
}: CreateEstimatePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/estimates/new");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-200">
        Estimate records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </div>
    );
  }

  const projects = await listProjects();
  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));

  if (projectOptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/estimates"
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
              Create Estimate
            </h1>
            <p className="mt-1 text-sm text-[--muted]">
              Build a new estimate for a project
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <svg
              className="h-6 w-6 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-amber-200">
            No Projects Available
          </h3>
          <p className="mt-2 text-sm text-amber-300/70">
            You need to create a project before you can create an estimate.
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/30"
          >
            Go to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/estimates"
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
            Create Estimate
          </h1>
          <p className="mt-1 text-sm text-[--muted]">
            Build a new estimate for a project
          </p>
        </div>
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
      <CreateEstimateForm
        action={createEstimateAction}
        projects={projectOptions}
        initialProjectId={resolvedSearchParams.projectId}
      />
    </div>
  );
}
