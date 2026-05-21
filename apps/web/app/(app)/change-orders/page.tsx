import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ChangeOrderQuickCreateForm } from "@/components/change-order-quick-create-form";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateChangeOrderAction } from "@/lib/change-orders/actions";
import {
  getChangeOrdersManagerReadModel,
  isChangeOrdersManagerView
} from "@/lib/change-orders/manager-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type ChangeOrdersPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "approved" | "rejected";
    projectId?: string;
    contractId?: string;
    invoiceId?: string;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not yet";
}

function buildChangeOrdersHref(input: {
  q?: string;
  status?: string;
  compose?: string;
  projectId?: string;
  contractId?: string;
  invoiceId?: string;
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

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.contractId) {
    searchParams.set("contractId", input.contractId);
  }

  if (input.invoiceId) {
    searchParams.set("invoiceId", input.invoiceId);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/change-orders?${query}` : "/change-orders";
}

export default async function ChangeOrdersPage({
  searchParams
}: ChangeOrdersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/change-orders");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Change orders require an active organization before they can be
        reviewed. Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const statusFilter = isChangeOrdersManagerView(resolvedSearchParams.status)
    ? resolvedSearchParams.status
    : "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId);

  const readModel = await getChangeOrdersManagerReadModel({
    organizationId: organizationContext.organization.id,
    view: statusFilter,
    query,
    includeQuickCreateOptions: showComposer
  });

  const views = [
    { key: "all", label: "All change orders", count: readModel.counts.all },
    { key: "draft", label: "Draft", count: readModel.counts.draft },
    { key: "sent", label: "Sent", count: readModel.counts.sent },
    { key: "approved", label: "Approved", count: readModel.counts.approved },
    { key: "rejected", label: "Rejected", count: readModel.counts.rejected }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Change Orders"
      title={`Change orders for ${organizationContext.organization.displayName}`}
      description="Track post-contract scope shifts on the same canonical project chain, move them through customer review, and keep approved price adjustments connected to downstream billing."
      summary={
        <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-4">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Draft
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.draft}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Sent
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.sent}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Approved
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.approved}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Rejected
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.rejected}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Keep scope changes review-first here, then move into the full
            workspace to prepare customer review and linked billing continuity.
          </p>
        ),
        searchSlot: (
          <form
            action="/change-orders"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, project, customer, contract, or invoice"
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
                href="/change-orders"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: views.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildChangeOrdersHref({
                q: query,
                status: view.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
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
              buildChangeOrdersHref({
                q: query,
                status: statusFilter,
                compose: "1"
              }) + "#change-order-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New change order
          </Link>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_400px]"
            : "space-y-4"
        }
      >
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

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.2fr)_1fr_150px_190px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Change order</span>
                  <span>Project</span>
                  <span>Status</span>
                  <span className="text-right">Updated</span>
                </div>
                <div className="md:hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Change order list
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {readModel.changeOrders.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {readModel.changeOrders.length > 0 ? (
                readModel.changeOrders.map((changeOrder) => (
                  <Link
                    key={changeOrder.id}
                    href={`/change-orders/${changeOrder.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_1fr_150px_190px] md:items-center">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {changeOrder.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {changeOrder.customer?.name ?? "Unknown customer"} |{" "}
                          {formatMoney(changeOrder.priceAdjustment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Project
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {changeOrder.project?.name ?? "Unknown project"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {changeOrder.invoice
                            ? `Invoice ${changeOrder.invoice.referenceNumber}`
                            : changeOrder.contract
                              ? changeOrder.contract.title
                              : "No contract or invoice linked yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span
                          className={[
                            "inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                            getStatusBadgeClassName(changeOrder.status)
                          ].join(" ")}
                        >
                          {formatStatusLabel(changeOrder.status)}
                        </span>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Updated
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDateTime(changeOrder.updatedAt)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {changeOrder.status === "approved"
                            ? changeOrder.appliedInvoiceLineItemId
                              ? "Applied to linked invoice"
                              : "Approved without invoice line application"
                            : changeOrder.status === "sent"
                              ? `Viewed ${formatDateTime(changeOrder.customerViewedAt)}`
                              : "Awaiting review"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={
                      readModel.counts.all > 0
                        ? "No matching change orders"
                        : "No change orders yet"
                    }
                    title={
                      readModel.counts.all > 0
                        ? "Adjust the change-order filters"
                        : "Capture the first scope adjustment"
                    }
                    description={
                      readModel.counts.all > 0
                        ? "Try a broader search or switch status views to find the scope adjustment you need."
                        : "Change orders keep post-contract scope, approval, and billing continuity on the same project chain instead of splitting into a side system."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="change-order-create"
          title="Quick create change order"
          description="Start the change order with the minimum scope and pricing context, then finish review and customer decision setup in the full workspace."
          open={showComposer}
          openHref={
            buildChangeOrdersHref({
              q: query,
              status: statusFilter,
              compose: "1"
            }) + "#change-order-create"
          }
          closeHref={buildChangeOrdersHref({ q: query, status: statusFilter })}
          openLabel="Open change-order quick create"
        >
          <ChangeOrderQuickCreateForm
            action={quickCreateChangeOrderAction}
            projects={readModel.projectOptions}
            contracts={readModel.contractOptions}
            invoices={readModel.invoiceOptions}
            defaultProjectId={resolvedSearchParams.projectId}
            defaultContractId={resolvedSearchParams.contractId}
            defaultInvoiceId={resolvedSearchParams.invoiceId}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
