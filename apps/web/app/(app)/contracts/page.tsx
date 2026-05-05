import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { ContractQuickCreateForm } from "@/components/contract-quick-create-form";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import {
  listApprovedEstimatesForContracts,
  listContracts
} from "@/lib/contracts/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type ContractView = "all" | "draft" | "sent" | "viewed" | "signed";

type ContractsPageProps = {
  searchParams?: Promise<{
    estimateId?: string;
    compose?: string;
    q?: string;
    status?: ContractView;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function getContractSignatureCue(contract: {
  status: string;
  signatureReadinessStatus: string;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signedAt: string | null;
}) {
  if (contract.status === "signed" || contract.signedAt) {
    return "Signature complete";
  }

  if (contract.status === "void") {
    return "Signature voided";
  }

  if (contract.customerSignedAt && !contract.contractorCountersignedAt) {
    return "Customer signed; countersign if required";
  }

  if (contract.status === "sent" || contract.status === "viewed") {
    return contract.status === "viewed" ? "Viewed; awaiting signature" : "Awaiting customer";
  }

  if (contract.signatureReadinessStatus === "ready_to_send") {
    return "Ready to send";
  }

  return formatStatusLabel(contract.signatureReadinessStatus);
}

function getContractPrimaryAction(contract: {
  id: string;
  status: string;
  signatureReadinessStatus: string;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
}) {
  if (contract.status === "draft" && contract.signatureReadinessStatus === "ready_to_send") {
    return {
      label: "Send for Signature",
      href: `/contracts/${contract.id}#contract-workflow-actions`
    };
  }

  return null;
}

function buildContractsHref(input: {
  q?: string;
  status?: ContractView;
  compose?: string;
  estimateId?: string;
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

  if (input.estimateId) {
    searchParams.set("estimateId", input.estimateId);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/contracts?${query}` : "/contracts";
}

function decodeQueryMessage(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value.replaceAll("+", " "));
  } catch {
    return value.replaceAll("+", " ");
  }
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
  const composerError = decodeQueryMessage(resolvedSearchParams.error);
  const pageMessage = decodeQueryMessage(resolvedSearchParams.message);
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(composerError) ||
    Boolean(resolvedSearchParams.estimateId);

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

  const draftContracts = contracts.filter((contract) => contract.status === "draft");
  const sentContracts = contracts.filter((contract) => contract.status === "sent");
  const viewedContracts = contracts.filter((contract) => contract.status === "viewed");
  const signedContracts = contracts.filter((contract) => contract.status === "signed");
  const pendingApprovalContracts = contracts.filter(
    (contract) =>
      contract.status === "draft" && contract.internalApprovalStatus === "pending"
  );
  const readyToSendContracts = contracts.filter(
    (contract) =>
      contract.status === "draft" &&
      contract.signatureReadinessStatus === "ready_to_send"
  );

  const contractViews = [
    { key: "all", label: "All contracts", count: contracts.length },
    { key: "draft", label: "Draft", count: draftContracts.length },
    { key: "sent", label: "Sent", count: sentContracts.length },
    { key: "viewed", label: "Viewed", count: viewedContracts.length },
    { key: "signed", label: "Signed", count: signedContracts.length }
  ] as const;

  const recentContracts = [...filteredContracts]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 20);

  return (
    <ContractorWorkspacePage
      eyebrow="Contracts"
      title={`Contracts for ${organizationContext.organization.displayName}`}
      description="Contracts stay attached to the same project, estimate, and customer chain instead of drifting into a separate signature subsystem."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">Draft</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {draftContracts.length}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Pending approval
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {pendingApprovalContracts.length}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Ready to send
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readyToSendContracts.length}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">Signed</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {signedContracts.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review signature readiness, follow the contract workflow by its real
            canonical state, and open quick create only when you are ready to route
            into the full contract workspace.
          </p>
        ),
        searchSlot: (
          <form action="/contracts" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search contract, customer, project, or estimate"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
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
            href={buildContractsHref({
              q: query,
              status: statusFilter,
              compose: "1",
              estimateId: resolvedSearchParams.estimateId
            })}
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New contract
          </Link>
        )
      }}
    >
      <div className="space-y-6">
        {composerError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            <p>{composerError}</p>
            {composerError.includes("approved snapshot is missing") ||
            composerError.includes("Approved estimate snapshot is missing") ? (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-white/70 px-4 py-3 text-rose-900">
                <p className="font-medium">Contract generation needs approved snapshot lineage.</p>
                <p className="mt-1">
                  Open the approved estimate and use Rebuild Approval Snapshot, then return here
                  and generate the contract again. Existing approved sample records may be too old
                  to include the current snapshot bundle.
                </p>
                {resolvedSearchParams.estimateId ? (
                  <Link
                    href={`/estimates/${resolvedSearchParams.estimateId}`}
                    className="mt-3 inline-flex items-center rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-900 transition hover:bg-rose-50"
                  >
                    Open estimate to rebuild snapshot
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {pageMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {pageMessage}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Pending internal approval"
            description="Draft contracts that still need the required internal approval step before send."
            actionHref={buildContractsHref({ q: query, status: "draft" })}
            actionLabel="Review drafts"
            items={pendingApprovalContracts.slice(0, 4).map((contract) => ({
              href: `/contracts/${contract.id}`,
              title: contract.title,
              subtitle: contract.project?.name ?? "Unknown project",
              meta: contract.estimate?.referenceNumber
                ? `Estimate ${contract.estimate.referenceNumber}`
                : null,
              badge: contract.internalApprovalStatus,
              trailing: formatDateTime(contract.updatedAt)
            }))}
            emptyTitle="No contracts are waiting on approval"
            emptyDescription="Draft contracts needing internal approval will appear here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Ready to send"
            description="Draft contracts that are already in a send-ready canonical state."
            actionHref={buildContractsHref({ q: query, status: "draft" })}
            actionLabel="Open drafts"
            items={readyToSendContracts.slice(0, 4).map((contract) => ({
              href: `/contracts/${contract.id}`,
              title: contract.title,
              subtitle: contract.customer?.name ?? "Unknown customer",
              meta: getContractSignatureCue(contract),
              badge: contract.signatureReadinessStatus,
              trailing: formatDateTime(contract.updatedAt)
            }))}
            emptyTitle="No contracts are ready to send"
            emptyDescription="Send-ready drafts will show here once review and approval are complete."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Sent for signature"
            description="Contracts that have already left draft and are currently out for signature."
            actionHref={buildContractsHref({ q: query, status: "sent" })}
            actionLabel="View sent"
            items={sentContracts.slice(0, 4).map((contract) => ({
              href: `/contracts/${contract.id}`,
              title: contract.title,
              subtitle: contract.customer?.name ?? "Unknown customer",
              meta: getContractSignatureCue(contract),
              badge: contract.status,
              trailing: formatDateTime(contract.sentAt ?? contract.updatedAt)
            }))}
            emptyTitle="Nothing is currently out for signature"
            emptyDescription="Sent contracts will appear here after they leave the draft workspace."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Viewed awaiting signature"
            description="Contracts that the customer has already viewed and that are still waiting on signature completion."
            actionHref={buildContractsHref({ q: query, status: "viewed" })}
            actionLabel="View viewed"
            items={viewedContracts.slice(0, 4).map((contract) => ({
              href: `/contracts/${contract.id}`,
              title: contract.title,
              subtitle: contract.customer?.name ?? "Unknown customer",
              meta: getContractSignatureCue(contract),
              badge: contract.status,
              trailing: formatDateTime(contract.customerViewedAt ?? contract.viewedAt)
            }))}
            emptyTitle="No viewed contracts are waiting"
            emptyDescription="Viewed contracts will appear here once customer review has begun."
          />
        </section>

        <section className="overflow-hidden border border-[#d6d6d6] bg-white">
          <div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Recent records
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Latest contract updates
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              {recentContracts.length} visible
            </p>
          </div>

          {recentContracts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Contract</th>
                    <th className="px-5 py-3 sm:px-6">Project / estimate</th>
                    <th className="px-5 py-3 sm:px-6">Status</th>
                    <th className="px-5 py-3 sm:px-6">Signature readiness</th>
                    <th className="px-5 py-3 text-right sm:px-6">Updated</th>
                    <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentContracts.map((contract) => {
                    const primaryAction = getContractPrimaryAction(contract);

                    return (
                    <tr key={contract.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 sm:px-6">
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="font-semibold text-slate-950 transition hover:text-brand-700"
                        >
                          {contract.title}
                        </Link>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {contract.customer?.name ?? "Unknown customer"}
                        </p>
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-medium text-slate-700">
                          {contract.project?.name ?? "Unknown project"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {contract.estimate?.referenceNumber ?? "No estimate"}
                        </p>
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <span
                          className={[
                            "inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                            getStatusBadgeClassName(contract.status)
                          ].join(" ")}
                        >
                          {formatStatusLabel(contract.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <p className="text-sm font-medium text-slate-700">
                          {getContractSignatureCue(contract)}
                        </p>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-slate-400">
                          {formatStatusLabel(contract.signatureReadinessStatus)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-500 sm:px-6">
                        {formatDateTime(contract.updatedAt)}
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex flex-wrap justify-end gap-2">
                          {primaryAction ? (
                            <Link href={primaryAction.href} className={primaryActionClassName}>
                              {primaryAction.label}
                            </Link>
                          ) : null}
                          {contract.status === "draft" ? (
                            <Link href={`/contracts/${contract.id}/edit`} className={secondaryActionClassName}>
                              Edit
                            </Link>
                          ) : null}
                          <ActionOverflowMenu>
                            {contract.project?.id ? (
                              <Link href={`/projects/${contract.project.id}`} className={overflowActionClassName}>
                                View Project
                              </Link>
                            ) : null}
                            {contract.status === "draft" || contract.status === "sent" || contract.status === "viewed" ? (
                              <Link href={`/contracts/${contract.id}#contract-workflow-actions`} className={overflowActionClassName}>
                                Void
                              </Link>
                            ) : null}
                            {contract.estimate?.id ? (
                              <Link href={`/estimates/${contract.estimate.id}`} className={overflowActionClassName}>
                                View Estimate
                              </Link>
                            ) : null}
                          </ActionOverflowMenu>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={contracts.length > 0 ? "No matching contracts" : "No contracts yet"}
                title={
                  contracts.length > 0
                    ? "Adjust the contract filters"
                    : "Generate the first contract"
                }
                description={
                  contracts.length > 0
                    ? "Try a broader search or switch to another real contract status."
                    : "Contracts are generated from approved estimates so the signed commercial record stays connected to the same project and customer chain."
                }
              />
            </div>
          )}
        </section>
      </div>

      <WorkspaceComposerSheet
        id="contract-create"
        title="Quick create contract"
        description="Choose the approved estimate, create the canonical contract, and then finish review and signature setup in the full contract workspace."
        open={showComposer}
        openHref={buildContractsHref({
          q: query,
          status: statusFilter,
          compose: "1",
          estimateId: resolvedSearchParams.estimateId
        })}
        closeHref={buildContractsHref({ q: query, status: statusFilter })}
        openLabel="Open contract quick create"
      >
        <div className="space-y-5">
          {composerError && approvedEstimates.length === 0 ? (
            <div className="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900">
              <p className="font-semibold">Contract generation is blocked</p>
              <p className="mt-1">{composerError}</p>
              {resolvedSearchParams.estimateId ? (
                <Link
                  href={`/estimates/${resolvedSearchParams.estimateId}`}
                  className="mt-3 inline-flex items-center rounded-[4px] border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-900 transition hover:bg-rose-100"
                >
                  Open estimate to rebuild snapshot
                </Link>
              ) : null}
            </div>
          ) : null}

          {approvedEstimates.length > 0 ? (
            <ContractQuickCreateForm
              action={quickCreateContractFromEstimateAction}
              approvedEstimates={approvedEstimates.map((estimate) => ({
                id: estimate.id,
                referenceNumber: estimate.referenceNumber,
                projectName: estimate.project?.name ?? null
              }))}
              initialEstimateId={resolvedSearchParams.estimateId}
              errorMessage={composerError}
              estimateHref={
                resolvedSearchParams.estimateId
                  ? `/estimates/${resolvedSearchParams.estimateId}`
                  : null
              }
              preferredTemplateId={preferredTemplateId}
              requireInternalApproval={workflowSettings.requireContractInternalApproval}
            />
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Approve an estimate before generating a contract.
            </div>
          )}
        </div>
      </WorkspaceComposerSheet>
    </ContractorWorkspacePage>
  );
}
