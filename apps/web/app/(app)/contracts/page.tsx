import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { createContractFromEstimateAction } from "@/lib/contracts/actions";
import {
  getContractTemplateOptions,
  listApprovedEstimatesForContracts,
  listContracts
} from "@/lib/contracts/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";

type ContractsPageProps = {
  searchParams?: Promise<{
    estimateId?: string;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString();
}

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/contracts");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Contract records need an active organization before they can be generated.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [contracts, approvedEstimates, contractTemplates, workflowSettings] = await Promise.all([
    listContracts(),
    listApprovedEstimatesForContracts(),
    getContractTemplateOptions(),
    getOrganizationWorkflowSettings(organizationContext.organization.id)
  ]);
  const preferredTemplateId =
    workflowSettings.approvedEstimateContractTemplateId ?? "";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Contracts
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Contract records for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Contracts are canonical records generated from approved estimates and their
          connected project and customer context. They stay inside the same shared
          estimate to contract to invoice workflow.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Ordered by contract status first, then most recently updated.
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
          {contracts.length > 0 ? (
            contracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">{contract.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {contract.project?.name ?? "Unknown project"}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-slate-500 sm:text-right">
                    <p className="capitalize">{formatStatusLabel(contract.status)}</p>
                    <p>{formatDateTime(contract.updatedAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm leading-6 text-slate-500">
                  <span>{contract.customer?.name ?? "Unknown customer"}</span>
                  <span>{contract.estimate?.referenceNumber ?? "No estimate"}</span>
                  <span>{contract.template?.name ?? "Default template"}</span>
                </div>
              </Link>
            ))
          ) : (
            <AppEmptyState
              eyebrow="No contracts yet"
              title="Generate the first contract"
              description="Contracts are generated from approved estimates so the signed commercial record stays connected to the same project and customer chain."
            />
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Generate Contract
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Generate a contract from approved estimate and project context using the shared template foundation.
        </p>
        {workflowSettings.requireContractInternalApproval ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            This organization has internal contract approval turned on in Settings. New draft contracts must be approved before the send action becomes available.
          </div>
        ) : null}
        {approvedEstimates.length > 0 ? (
          <form action={createContractFromEstimateAction} className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Approved estimate</span>
              <select
                name="estimateId"
                defaultValue={resolvedSearchParams.estimateId ?? ""}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                required
              >
                <option value="" disabled>
                  Select an approved estimate
                </option>
                {approvedEstimates.map((estimate) => (
                  <option key={estimate.id} value={estimate.id}>
                    {estimate.referenceNumber} - {estimate.project?.name ?? "Project"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Contract template</span>
              <select
                name="templateId"
                defaultValue={preferredTemplateId}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              >
                <option value="">Use organization default contract template</option>
                {contractTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault ? " - default" : ""}
                  </option>
                ))}
              </select>
              {workflowSettings.approvedEstimateContractTemplateId ? (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The approved-estimate workflow default from Settings is preselected here.
                </p>
              ) : null}
            </label>

            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
            >
              Generate contract
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Approve an estimate before generating a contract.
          </div>
        )}
      </aside>
    </div>
  );
}
