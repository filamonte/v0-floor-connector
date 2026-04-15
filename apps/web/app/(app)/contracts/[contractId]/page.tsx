import Link from "next/link";
import { notFound } from "next/navigation";

import { ContractStatusActions } from "@/components/contract-status-actions";
import { getContractById } from "@/lib/contracts/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type ContractDetailPageProps = {
  params: Promise<{
    contractId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Date(value).toLocaleString();
}

function formatLockReason(reason: string | null) {
  switch (reason) {
    case "signature_activity_started":
      return "Signature activity has started";
    case "voided":
      return "Contract was voided";
    default:
      return reason ? reason.replaceAll("_", " ") : "Editable draft";
  }
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "sent":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "viewed":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "signed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "void":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default async function ContractDetailPage({
  params,
  searchParams
}: ContractDetailPageProps) {
  const { contractId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/contracts/${contractId}`);
  const [contract, organizationContext] = await Promise.all([
    getContractById(contractId, `/contracts/${contractId}`),
    getActiveOrganizationContext(user.id)
  ]);

  if (!contract) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between print:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Contract Review
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {contract.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Review the generated contract in canonical project context, then move it through the early contract lifecycle.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/contracts"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to contracts
          </Link>
          {contract.isEditable ? (
            <Link
              href={`/contracts/${contract.id}/edit`}
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Edit draft
            </Link>
          ) : null}
          {contract.estimate ? (
            <Link
              href={`/estimates/${contract.estimate.id}`}
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              View source estimate
            </Link>
          ) : null}
          {contract.status === "signed" ? (
            <Link
              href={`/invoices?projectId=${contract.projectId}&estimateId=${contract.estimateId ?? ""}`}
              className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
            >
              Create invoice from signed contract context
            </Link>
          ) : null}
        </div>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800 print:hidden">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800 print:hidden">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10 print:rounded-none print:border-none print:px-0 print:py-0 print:shadow-none">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Prepared by
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {organizationContext?.organization.displayName ?? "FloorConnector"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {organizationContext?.organization.legalName ??
                "Contract prepared inside the active organization workspace."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Contract Status
            </p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${getStatusBadgeClassName(
                contract.status
              )}`}
            >
              {formatStatusLabel(contract.status)}
            </div>
            {contract.renderedSubject ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">{contract.renderedSubject}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 border-b border-slate-200 py-8 md:grid-cols-2 xl:grid-cols-4">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Customer</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">{contract.customer?.name ?? "Unknown customer"}</p>
              {contract.customer?.companyName ? <p>{contract.customer.companyName}</p> : null}
              {contract.customer?.email ? <p>{contract.customer.email}</p> : null}
              {contract.customer?.phone ? <p>{contract.customer.phone}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Project</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">{contract.project?.name ?? "Unknown project"}</p>
              {contract.project ? <p className="capitalize">Current status: {formatStatusLabel(contract.project.status)}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Estimate Source</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">{contract.generatedFromEstimateReference ?? contract.estimate?.referenceNumber ?? "No linked estimate"}</p>
              {contract.estimate ? <p className="capitalize">Estimate status: {formatStatusLabel(contract.estimate.status)}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Signature and Lock</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>Editable: {contract.isEditable ? "Yes" : "No"}</p>
              <p>Signature provider: {contract.signatureProvider ?? "Not connected"}</p>
              <p>Signature started: {formatDateTime(contract.signatureStartedAt)}</p>
              <p>Locked: {formatDateTime(contract.lockedAt)}</p>
              <p>Lock reason: {formatLockReason(contract.editLockReason)}</p>
            </div>
          </section>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-3xl border border-slate-200 bg-slate-50/50 px-6 py-6 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
            {contract.renderedContent}
          </article>

          <aside className="space-y-6 print:hidden">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Workflow Actions</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Move the contract through the first review lifecycle. Once signature activity begins, unrestricted editing is locked on the canonical record.
              </p>
              <div className="mt-4">
                <ContractStatusActions contractId={contract.id} currentStatus={contract.status} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Editability</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {contract.isEditable ? (
                  <>
                    <p>This contract is still editable because it remains in draft and no signature activity has started.</p>
                    <p>Use the draft edit flow for practical pre-sign customizations.</p>
                  </>
                ) : (
                  <>
                    <p>This contract is locked from further unrestricted edits.</p>
                    <p>{formatLockReason(contract.editLockReason)}.</p>
                  </>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Revision History</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {contract.revisions.length > 0 ? (
                  contract.revisions.map((revision) => (
                    <div key={revision.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="font-medium text-slate-950">Revision {revision.revisionNumber}</p>
                      <p>{formatDateTime(revision.createdAt)}</p>
                      {revision.editSummary ? <p>{revision.editSummary}</p> : <p>Draft snapshot before edit</p>}
                    </div>
                  ))
                ) : (
                  <p>No draft revisions have been saved yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Connected Workflow</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>Project: {contract.project?.name ?? "Unknown project"}</p>
                <p>Estimate: {contract.estimate?.referenceNumber ?? "Not linked"}</p>
                <p>Invoices continue to derive from the same project and estimate context instead of a disconnected contract billing model.</p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
