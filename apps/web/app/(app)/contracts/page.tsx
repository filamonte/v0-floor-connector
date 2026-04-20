import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractQuickCreateForm } from "@/components/contract-quick-create-form";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import {
  listApprovedEstimatesForContracts,
  listContracts
} from "@/lib/contracts/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";

type ContractsPageProps = {
  searchParams?: Promise<{
    estimateId?: string;
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "viewed" | "signed";
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

function buildContractsHref(input: {
  q?: string;
  status?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/contracts?${query}` : "/contracts";
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

  const [contracts, approvedEstimates, workflowSettings] = await Promise.all([
    listContracts(),
    listApprovedEstimatesForContracts(),
    getOrganizationWorkflowSettings(organizationContext.organization.id)
  ]);
  const preferredTemplateId =
    workflowSettings.approvedEstimateContractTemplateId ?? "";
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.estimateId);

  const draftCount = contracts.filter((contract) => contract.status === "draft").length;
  const sentCount = contracts.filter((contract) => contract.status === "sent").length;
  const viewedCount = contracts.filter((contract) => contract.status === "viewed").length;
  const signedCount = contracts.filter((contract) => contract.status === "signed").length;

  const filteredContracts = contracts.filter((contract) => {
    const matchesStatus = statusFilter === "all" ? true : contract.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            contract.title,
            contract.project?.name ?? "",
            contract.customer?.name ?? "",
            contract.estimate?.referenceNumber ?? "",
            contract.template?.name ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  const contractViews = [
    { key: "all", label: "All contracts", count: contracts.length },
    { key: "draft", label: "Draft", count: draftCount },
    { key: "sent", label: "Sent", count: sentCount },
    { key: "viewed", label: "Viewed", count: viewedCount },
    { key: "signed", label: "Signed", count: signedCount }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Contracts"
      title={`Contracts for ${organizationContext.organization.displayName}`}
      description="Contract records stay attached to the same estimate, project, and customer chain instead of drifting into a separate signature system."
      summary={
        <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-4">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Draft</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{draftCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Sent</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{sentCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Viewed</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{viewedCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Signed</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{signedCount}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search contracts, switch status views, and quick create a new contract only when you are ready to open its full workspace.
          </p>
        ),
        searchSlot: (
          <form action="/contracts" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search contract, customer, project, or estimate"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
              <Link
                href="/contracts"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: contractViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildContractsHref({
                q: query,
                status: view.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildContractsHref({ q: query, status: statusFilter, compose: "1" }) +
              "#contract-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            New contract
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_400px]" : "space-y-4"}>
        <section className="space-y-4">
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

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_160px_190px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Contract</span>
                  <span>Project</span>
                  <span>Status</span>
                  <span className="text-right">Updated</span>
                </div>
                <div className="md:hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Contracts list
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {filteredContracts.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_1fr_160px_190px] md:items-center">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {contract.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {contract.customer?.name ?? "Unknown customer"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Project
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {contract.project?.name ?? "Unknown project"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {contract.estimate?.referenceNumber ?? "No estimate"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatStatusLabel(contract.status)}
                        </span>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Updated
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDateTime(contract.updatedAt) ?? "No timestamp"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {contract.template?.name ?? "Default template"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={contracts.length > 0 ? "No matching contracts" : "No contracts yet"}
                    title={contracts.length > 0 ? "Adjust the contract filters" : "Generate the first contract"}
                    description={
                      contracts.length > 0
                        ? "Try a broader search or switch status views to find the contract record you need."
                        : "Contracts are generated from approved estimates so the signed commercial record stays connected to the same project and customer chain."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="contract-create"
          title="Quick create contract"
          description="Capture only the minimum contract context here, create the canonical record, and then finish review and signature setup in the full contract workspace."
          open={showComposer}
          openHref={
            buildContractsHref({ q: query, status: statusFilter, compose: "1" }) +
            "#contract-create"
          }
          closeHref={buildContractsHref({ q: query, status: statusFilter })}
          openLabel="Open contract quick create"
        >
          {approvedEstimates.length > 0 ? (
            <ContractQuickCreateForm
              action={quickCreateContractFromEstimateAction}
              approvedEstimates={approvedEstimates.map((estimate) => ({
                id: estimate.id,
                referenceNumber: estimate.referenceNumber,
                projectName: estimate.project?.name ?? null
              }))}
              initialEstimateId={resolvedSearchParams.estimateId}
              preferredTemplateId={preferredTemplateId}
              requireInternalApproval={workflowSettings.requireContractInternalApproval}
            />
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Approve an estimate before generating a contract.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
