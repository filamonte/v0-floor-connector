import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { EstimateRecordsPanel } from "@/components/estimates/estimate-records-panel";
import { EstimateQuickCreateForm } from "@/components/estimate-quick-create-form";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { PerspectiveSwitcher } from "@/components/perspectives/perspective-switcher";
import { RowsPerViewControl } from "@/components/rows-per-view-control";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCustomers } from "@/lib/customers/data";
import {
  quickCreateEstimateAction,
  quickCreateEstimateCustomerAction
} from "@/lib/estimates/actions";
import { listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listOpportunities } from "@/lib/opportunities/data";
import { buildPerspectiveSearchParams, matchesPerspective } from "@/lib/perspectives/query";
import { parsePerspectiveView, type PerspectiveView } from "@/lib/perspectives/types";
import { listProjects } from "@/lib/projects/data";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type EstimatesPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "approved" | "rejected";
    view?: PerspectiveView;
    creationMode?: "opportunity" | "customer" | "standalone";
    opportunityId?: string;
    customerId?: string;
    projectId?: string;
    projectName?: string;
    title?: string;
    errorField?: string;
    errorScope?: string;
    error?: string;
    message?: string;
    inlineCustomerFirstName?: string;
    inlineCustomerLastName?: string;
    inlineCustomerEmail?: string;
    inlineCustomerPhone?: string;
    inlineCustomerCompanyName?: string;
  }>;
};

const ESTIMATES_ROWS_PER_VIEW_STORAGE_KEY = "fc.grid.rows.estimates";

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function buildEstimatesHref(input: {
  q?: string;
  status?: string;
  compose?: string;
  opportunityId?: string;
  customerId?: string;
  projectId?: string;
  view?: PerspectiveView;
}) {
  const searchParams = buildPerspectiveSearchParams(
    {
      q: input.q,
      status: input.status && input.status !== "all" ? input.status : undefined,
      compose: input.compose === "1" ? "1" : undefined,
      opportunityId: input.opportunityId,
      customerId: input.customerId,
      projectId: input.projectId
    },
    input.view ?? "company"
  );

  const query = searchParams.toString();
  return query ? `/estimates?${query}` : "/estimates";
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

  const [
    estimates,
    opportunities,
    customers,
    projects,
    workflowSettings,
    financialSettings
  ] = await Promise.all([
    listEstimates(),
    listOpportunities(),
    listCustomers(),
    listProjects(),
    getOrganizationWorkflowSettings(organizationContext.organization.id),
    getOrganizationFinancialSettings(organizationContext.organization.id)
  ]);
  const opportunityOptions = opportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    customerId: opportunity.customerId,
    contactName: opportunity.primaryContact?.displayName ?? opportunity.prospectName,
    customerName: opportunity.customer?.name ?? null,
    jobType: opportunity.jobType,
    siteName: opportunity.siteName,
    status: opportunity.status
  }));
  const customerOptions = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    companyName: customer.companyName,
    email: customer.email,
    phone: customer.phone
  }));
  const projectOptions = projects.map((project) => ({
    id: project.id,
    customerId: project.customerId,
    name: project.name,
    status: project.status
  }));
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const perspective = parsePerspectiveView(resolvedSearchParams.view);
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.opportunityId) ||
    Boolean(resolvedSearchParams.customerId) ||
    Boolean(resolvedSearchParams.projectId);
  const perspectiveEstimates = estimates.filter((estimate) =>
    matchesPerspective(
      {
        createdByUserId: estimate.createdByUserId,
        updatedByUserId: estimate.updatedByUserId,
        sentByUserId: estimate.sentByUserId
      },
      perspective,
      user.id
    )
  );
  const draftCount = perspectiveEstimates.filter((estimate) => estimate.status === "draft").length;
  const sentCount = perspectiveEstimates.filter((estimate) => estimate.status === "sent").length;
  const approvedCount = perspectiveEstimates.filter((estimate) => estimate.status === "approved").length;
  const totalPipelineValue = perspectiveEstimates
    .reduce((sum, estimate) => sum + Number(estimate.totalAmount), 0)
    .toFixed(2);
  const filteredEstimates = perspectiveEstimates.filter((estimate) => {
    const matchesStatus =
      statusFilter === "all" ? true : estimate.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            estimate.referenceNumber,
            estimate.opportunity?.title ?? "",
            estimate.customer?.name ?? "",
            estimate.project?.name ?? "",
            estimate.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
  const estimateViews = [
    { key: "all", label: "All estimates", count: perspectiveEstimates.length },
    { key: "draft", label: "Build", count: draftCount },
    { key: "sent", label: "Sent", count: sentCount },
    { key: "approved", label: "Approved", count: approvedCount },
    {
      key: "rejected",
      label: "Revision",
      count: perspectiveEstimates.filter((estimate) => estimate.status === "rejected").length
    }
  ] as const;
  const draftQueue = perspectiveEstimates.filter((estimate) => estimate.status === "draft").slice(0, 4);
  const followUpQueue = perspectiveEstimates.filter((estimate) => estimate.status === "sent").slice(0, 4);
  const approvedQueue = perspectiveEstimates
    .filter((estimate) => estimate.status === "approved")
    .slice(0, 4);
  const revisionQueue = perspectiveEstimates
    .filter((estimate) => estimate.status === "rejected")
    .slice(0, 4);
  const recentClientResponses = perspectiveEstimates
    .filter(
      (estimate) =>
        Boolean(estimate.approvedAt) ||
        Boolean(estimate.rejectedAt) ||
        Boolean(estimate.customerViewedAt)
    )
    .sort((left, right) => {
      const leftDate = left.approvedAt ?? left.rejectedAt ?? left.customerViewedAt ?? left.updatedAt;
      const rightDate =
        right.approvedAt ?? right.rejectedAt ?? right.customerViewedAt ?? right.updatedAt;
      return rightDate.localeCompare(leftDate);
    })
    .slice(0, 5);
  const statusBreakdownTotal = Math.max(perspectiveEstimates.length, 1);
  const statusBreakdown = estimateViews
    .filter((view) => view.key !== "all")
    .map((view) => ({
      ...view,
      percent: Math.round((view.count / statusBreakdownTotal) * 100)
    }));

  return (
    <ContractorWorkspacePage
      eyebrow="Estimates"
      title={`Estimates for ${organizationContext.organization.displayName}`}
      description="A dense estimating module for draft build work, sent follow-up, customer responses, and approved handoff. New estimates start from customer and project context, then open the full estimate workspace."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">Build</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">{draftCount}</p>
      </div>
      <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">Sent</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">{sentCount}</p>
      </div>
      <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">Approved</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">{approvedCount}</p>
      </div>
      <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">Pipeline value</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {formatMoney(totalPipelineValue)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Start from the customer account, choose or create the project, then add the estimate. Opportunities can be linked as upstream context without becoming a second estimate model.
          </p>
        ),
        searchSlot: (
          <form action="/estimates" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {perspective !== "company" ? <input type="hidden" name="view" value={perspective} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search estimate, opportunity, customer, project, or status"
              className="min-w-0 flex-1 rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer || perspective !== "company" ? (
              <Link
                href="/estimates"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: (
          <>
            <PerspectiveSwitcher
              value={perspective}
              hrefForView={(view) =>
                buildEstimatesHref({
                  q: query,
                  status: statusFilter,
                  compose: showComposer ? "1" : undefined,
                  opportunityId: resolvedSearchParams.opportunityId,
                  customerId: resolvedSearchParams.customerId,
                  projectId: resolvedSearchParams.projectId,
                  view
                })
              }
            />
            {estimateViews.map((view) => {
              const isActive = statusFilter === view.key;

              return (
                <Link
                  key={view.key}
                  href={buildEstimatesHref({
                    q: query,
                    status: view.key,
                    compose: showComposer ? "1" : undefined,
                    opportunityId: resolvedSearchParams.opportunityId,
                    customerId: resolvedSearchParams.customerId,
                    projectId: resolvedSearchParams.projectId,
                    view: perspective
                  })}
                  className={[
                    "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                  ? "bg-[var(--graphite)] text-white"
                  : "border border-[var(--border-warm)] bg-white text-[var(--text-primary)] hover:bg-[var(--highlight)]"
                  ].join(" ")}
                >
                  <span>{view.label}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive ? "bg-white/15 text-white" : "bg-[var(--highlight)] text-[var(--text-secondary)]"
                    ].join(" ")}
                  >
                    {view.count}
                  </span>
                </Link>
              );
            })}
          </>
        ),
        actionSlot: (
          <>
            <RowsPerViewControl storageKey={ESTIMATES_ROWS_PER_VIEW_STORAGE_KEY} />
            <Link
              href={
                buildEstimatesHref({
                  q: query,
                  status: statusFilter,
                  compose: "1",
                  opportunityId: resolvedSearchParams.opportunityId,
                  customerId: resolvedSearchParams.customerId,
                  projectId: resolvedSearchParams.projectId,
                  view: perspective
                }) + "#estimate-create"
              }
              className="inline-flex items-center rounded-[3px] border border-[var(--copper)] bg-[var(--copper)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--copper-light)]"
            >
              Add estimate
            </Link>
          </>
        )
      }}
    >
      <div className={showComposer ? "grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]" : "space-y-3"}>
        <section className="flex flex-col gap-3">
          <div className="order-1">
            <EstimateRecordsPanel
              estimates={filteredEstimates}
              totalEstimateCount={perspectiveEstimates.length}
              storageKey={ESTIMATES_ROWS_PER_VIEW_STORAGE_KEY}
              createHref={
                buildEstimatesHref({
                  q: query,
                  status: statusFilter,
                  compose: "1",
                  opportunityId: resolvedSearchParams.opportunityId,
                  customerId: resolvedSearchParams.customerId,
                  projectId: resolvedSearchParams.projectId,
                  view: perspective
                }) + "#estimate-create"
              }
            />
          </div>

          <section className="order-2 grid gap-3 xl:grid-cols-3">
            <ManagerDashboardCard
              eyebrow="Responses"
              title="Recent client responses"
              description="Portal views, approvals, and rejections from the canonical estimate record."
              actionHref={buildEstimatesHref({
                q: query,
                status: "all",
                compose: showComposer ? "1" : undefined,
                opportunityId: resolvedSearchParams.opportunityId,
                customerId: resolvedSearchParams.customerId,
                projectId: resolvedSearchParams.projectId,
                view: perspective
              })}
              actionLabel="View register"
              items={recentClientResponses.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
                meta: estimate.approvedAt
                  ? "Approved by customer"
                  : estimate.rejectedAt
                    ? "Rejected by customer"
                    : "Viewed by customer",
                badge: estimate.status,
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No customer responses yet."
              emptyDescription="Customer views, approvals, and rejections appear here once estimates are sent through the portal."
            />

            <ManagerDashboardCard
              eyebrow="Pending approval"
              title="Sent estimates awaiting approval"
              description="Customer-facing estimates that are out for decision and need follow-up."
              actionHref={buildEstimatesHref({
                q: query,
                status: "sent",
                compose: showComposer ? "1" : undefined,
                opportunityId: resolvedSearchParams.opportunityId,
                customerId: resolvedSearchParams.customerId,
                projectId: resolvedSearchParams.projectId,
                view: perspective
              })}
              actionLabel="View sent queue"
              items={followUpQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
                meta: `Sent - ${estimate.opportunity?.title ?? "Opportunity linked"}`,
                badge: "Sent",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No sent estimates are waiting right now."
              emptyDescription="Sent estimates will appear here when customer follow-up is needed."
            />

      <section className="border border-[var(--border-warm)] bg-white">
        <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Status
                </p>
                <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Estimates by status
                </h3>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  Current-state status mix from canonical estimate records.
                </p>
              </div>
              <div className="divide-y divide-[var(--border-warm)]">
                {statusBreakdown.map((status) => (
                  <Link
                    key={status.key}
                    href={buildEstimatesHref({
                      q: query,
                      status: status.key,
                      compose: showComposer ? "1" : undefined,
                      opportunityId: resolvedSearchParams.opportunityId,
                      customerId: resolvedSearchParams.customerId,
                      projectId: resolvedSearchParams.projectId,
                      view: perspective
                    })}
                    className="grid grid-cols-[minmax(0,1fr)_120px_48px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-[var(--highlight)]"
                  >
                    <span
                      className={[
                        "inline-flex w-fit rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                        getStatusBadgeClassName(status.key)
                      ].join(" ")}
                    >
                      {status.label} ({status.count})
                    </span>
            <span className="h-2 overflow-hidden rounded-full bg-[var(--highlight)]">
              <div
                className="block h-full rounded-full bg-[var(--graphite)]"
                        style={{ width: `${status.percent}%` }}
                      />
                    </span>
                    <span className="text-right text-xs font-semibold text-[var(--text-secondary)]">
                      {status.percent}%
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </section>

          <section className="order-3 grid gap-3 xl:grid-cols-3">
            <ManagerDashboardCard
              eyebrow="Build"
              title="Draft estimates to finish"
              description="Estimate work still being built before review or customer send."
              actionHref={buildEstimatesHref({
                q: query,
                status: "draft",
                compose: showComposer ? "1" : undefined,
                opportunityId: resolvedSearchParams.opportunityId,
                customerId: resolvedSearchParams.customerId,
                projectId: resolvedSearchParams.projectId,
                view: perspective
              })}
              actionLabel="View build queue"
              items={draftQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}/edit`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
                meta: estimate.opportunity?.title ?? "Opportunity linked",
                badge: "Draft",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No draft estimates need build work."
              emptyDescription="New estimate drafts will surface here as soon as they are created."
            />

            <ManagerDashboardCard
              eyebrow="Approved"
              title="Approved estimates ready for contract"
              description="Commercial scope that is cleared and ready to move into legal contract work."
              actionHref={buildEstimatesHref({
                q: query,
                status: "approved",
                compose: showComposer ? "1" : undefined,
                opportunityId: resolvedSearchParams.opportunityId,
                customerId: resolvedSearchParams.customerId,
                projectId: resolvedSearchParams.projectId,
                view: perspective
              })}
              actionLabel="View approved"
              items={approvedQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
                meta: estimate.opportunity?.title ?? "Opportunity linked",
                badge: "Approved",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No approved estimates are waiting right now."
              emptyDescription="Approved estimates that are ready for contract handoff will appear here."
            />

            <ManagerDashboardCard
              eyebrow="Revision"
              title="Rejected estimates needing rework"
              description="Keep revision work visible without burying the rest of the estimate pipeline."
              actionHref={buildEstimatesHref({
                q: query,
                status: "rejected",
                compose: showComposer ? "1" : undefined,
                opportunityId: resolvedSearchParams.opportunityId,
                customerId: resolvedSearchParams.customerId,
                projectId: resolvedSearchParams.projectId,
                view: perspective
              })}
              actionLabel="View revision queue"
              items={revisionQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}/edit`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
                meta: estimate.opportunity?.title ?? "Opportunity linked",
                badge: "Rejected",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No rejected estimates need revision."
              emptyDescription="Rejected estimates will surface here when the team needs to rework scope or pricing."
            />
          </section>

          {resolvedSearchParams.error && !showComposer ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

        </section>

        <WorkspaceComposerSheet
          id="estimate-create"
          title="Add estimate"
          description="Choose the customer, choose or create the project, then enter the estimate basics. The full workspace opens after creation."
          open={showComposer}
          openHref={
            buildEstimatesHref({
              q: query,
              status: statusFilter,
              compose: "1",
              opportunityId: resolvedSearchParams.opportunityId,
              customerId: resolvedSearchParams.customerId,
              projectId: resolvedSearchParams.projectId,
              view: perspective
            }) + "#estimate-create"
          }
          closeHref={buildEstimatesHref({ q: query, status: statusFilter, view: perspective })}
          openLabel="Open estimate quick create"
        >
          <EstimateQuickCreateForm
            action={quickCreateEstimateAction}
            inlineCustomerAction={quickCreateEstimateCustomerAction}
            opportunities={opportunityOptions}
            customers={customerOptions}
            projects={projectOptions}
            estimatorLabel={user.email ?? user.id}
            defaultRetainagePercentage={financialSettings.defaultRetainagePercentage}
            estimateNumberLabel={String(workflowSettings.nextEstimateNumber)}
            estimateDateLabel={new Intl.DateTimeFormat("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric"
            }).format(new Date())}
            initialCreationMode={resolvedSearchParams.creationMode ?? null}
            initialOpportunityId={resolvedSearchParams.opportunityId}
            initialCustomerId={resolvedSearchParams.customerId}
            initialProjectId={resolvedSearchParams.projectId}
            initialProjectName={resolvedSearchParams.projectName}
            initialTitle={resolvedSearchParams.title}
            errorField={
              resolvedSearchParams.errorScope === "inlineCustomer"
                ? null
                : resolvedSearchParams.errorField
            }
            errorMessage={
              showComposer && resolvedSearchParams.errorScope !== "inlineCustomer"
                ? resolvedSearchParams.error ?? null
                : null
            }
            inlineCustomerErrorField={
              resolvedSearchParams.errorScope === "inlineCustomer"
                ? resolvedSearchParams.errorField
                : null
            }
            inlineCustomerErrorMessage={
              showComposer && resolvedSearchParams.errorScope === "inlineCustomer"
                ? resolvedSearchParams.error ?? null
                : null
            }
            inlineCustomerDefaults={{
              firstName: resolvedSearchParams.inlineCustomerFirstName ?? "",
              lastName: resolvedSearchParams.inlineCustomerLastName ?? "",
              email: resolvedSearchParams.inlineCustomerEmail ?? "",
              phone: resolvedSearchParams.inlineCustomerPhone ?? "",
              companyName: resolvedSearchParams.inlineCustomerCompanyName ?? ""
            }}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
