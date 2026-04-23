import Link from "next/link";

import { CFEstimatesPage } from "@/components/estimates/cf-estimates-page";
import { EstimateQuickCreateForm } from "@/components/estimate-quick-create-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCustomers } from "@/lib/customers/data";
import { quickCreateEstimateAction } from "@/lib/estimates/actions";
import { listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOpportunities } from "@/lib/opportunities/data";
import { listProjects } from "@/lib/projects/data";

type EstimatesPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "approved" | "rejected";
    creationMode?: "opportunity" | "customer" | "standalone";
    opportunityId?: string;
    customerId?: string;
    projectId?: string;
    error?: string;
    message?: string;
  }>;
};

function buildEstimatesHref(input: {
  q?: string;
  status?: string;
  compose?: string;
  opportunityId?: string;
  customerId?: string;
  projectId?: string;
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

  if (input.opportunityId) {
    searchParams.set("opportunityId", input.opportunityId);
  }

  if (input.customerId) {
    searchParams.set("customerId", input.customerId);
  }

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

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
      <section className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm leading-6 text-amber-900">
        Estimate records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [estimates, opportunities, customers, projects] = await Promise.all([
    listEstimates(),
    listOpportunities(),
    listCustomers(),
    listProjects()
  ]);

  const opportunityOptions = opportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    contactName: opportunity.primaryContact?.displayName ?? opportunity.prospectName,
    customerName: opportunity.customer?.name ?? null,
    jobType: opportunity.jobType,
    siteName: opportunity.siteName,
    status: opportunity.status
  }));

  const customerOptions = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    companyName: customer.companyName
  }));

  const projectOptions = projects.map((project) => ({
    id: project.id,
    customerId: project.customerId,
    name: project.name,
    status: project.status
  }));

  const query = resolvedSearchParams.q?.trim() ?? "";
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.opportunityId) ||
    Boolean(resolvedSearchParams.customerId);

  // Calculate status counts
  const draftCount = estimates.filter((e) => e.status === "draft").length;
  const sentCount = estimates.filter((e) => e.status === "sent").length;
  const approvedCount = estimates.filter((e) => e.status === "approved").length;
  const rejectedCount = estimates.filter((e) => e.status === "rejected").length;
  const completedCount = estimates.filter((e) => e.status === "completed").length;
  const lostCount = estimates.filter((e) => e.status === "lost").length;

  const totalPipelineValue = estimates
    .reduce((sum, estimate) => sum + Number(estimate.totalAmount), 0)
    .toFixed(2);

  const statusCounts = [
    { status: "draft", label: "Estimating", count: draftCount, color: "#64748b" },
    { status: "sent", label: "Pending Approval", count: sentCount, color: "#f59e0b" },
    { status: "approved", label: "Approved - To Bid", count: approvedCount, color: "#22c55e" },
    { status: "rejected", label: "Re-Estimating", count: rejectedCount, color: "#94a3b8" },
    { status: "completed", label: "Completed", count: completedCount, color: "#ef7d32" },
    { status: "lost", label: "Lost", count: lostCount, color: "#ef4444" }
  ];

  // Quick create composer content
  const composerContent = (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-[#172b4d]">Quick create estimate</h2>
        <Link
          href={buildEstimatesHref({ q: query, status: statusFilter })}
          className="w-8 h-8 flex items-center justify-center text-[#6b778c] hover:text-[#172b4d] hover:bg-[#f4f5f7] rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>
      <p className="text-[12px] text-[#6b778c] mb-4">
        Start from an opportunity, a customer, or standalone intake. FloorConnector will always attach the estimate to a canonical opportunity before opening the build workspace.
      </p>

      {resolvedSearchParams.error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-[12px] text-rose-700">
          {resolvedSearchParams.error}
        </div>
      )}

      <EstimateQuickCreateForm
        action={quickCreateEstimateAction}
        opportunities={opportunityOptions}
        customers={customerOptions}
        projects={projectOptions}
        estimatorLabel={user.email ?? user.id}
        estimateDateLabel={new Intl.DateTimeFormat("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        }).format(new Date())}
        initialCreationMode={resolvedSearchParams.creationMode ?? null}
        initialOpportunityId={resolvedSearchParams.opportunityId}
        initialCustomerId={resolvedSearchParams.customerId}
        initialProjectId={resolvedSearchParams.projectId}
      />
    </div>
  );

  const newEstimateHref = buildEstimatesHref({
    q: query,
    status: statusFilter,
    compose: "1"
  });

  return (
    <CFEstimatesPage
      organizationName={organizationContext.organization.displayName}
      estimates={estimates}
      statusCounts={statusCounts}
      totalPipelineValue={totalPipelineValue}
      newEstimateHref={newEstimateHref}
      composerContent={composerContent}
      showComposer={showComposer}
    />
  );
}
