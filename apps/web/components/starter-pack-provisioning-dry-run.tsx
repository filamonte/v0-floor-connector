import type {
  PlatformStarterPack,
  PlatformStarterPackProvisioningAttempt,
  PlatformStarterPackProvisioningRun,
  PlatformStarterPackProvisioningRunDetail
} from "@floorconnector/types";

import {
  approveStarterPackProvisioningDraftAction,
  createStarterPackProvisioningDraftAction,
  executeStarterPackProvisioningRunAction
} from "@/lib/platform-admin/actions";
import type {
  StarterPackProvisioningDryRunAction,
  StarterPackProvisioningDryRunMatchType,
  StarterPackProvisioningDryRunReport
} from "@/lib/platform-admin/starter-pack-provisioning-dry-run-core";
import {
  STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION,
  evaluateStarterPackProvisioningApprovalEligibility,
  type StarterPackProvisioningApprovalEligibility,
  StarterPackProvisioningDraftFreshnessStatus,
  StarterPackProvisioningDraftItemComparisonStatus,
  StarterPackProvisioningDraftReview,
  StarterPackProvisioningDraftReviewIssueSeverity
} from "@/lib/platform-admin/starter-pack-provisioning-draft-review-core";
import {
  STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION,
  evaluateStarterPackProvisioningExecutionEligibility,
  type StarterPackProvisioningExecutionEligibility
} from "@/lib/platform-admin/starter-pack-provisioning-execution-core";
import {
  buildStarterPackProvisioningObservability,
  filterStarterPackProvisioningRuns,
  type StarterPackProvisioningAuditFilter,
  type StarterPackProvisioningRunHealth
} from "@/lib/platform-admin/starter-pack-provisioning-observability-core";
import {
  evaluateStarterPackProvisioningVoidEligibility,
  type StarterPackProvisioningVoidEligibilityIssueSeverity,
  type StarterPackProvisioningVoidEligibilityStatus
} from "@/lib/platform-admin/starter-pack-provisioning-void-eligibility-core";
import type {
  StarterPackProvisioningDestinationUsageSeverity,
  StarterPackProvisioningDestinationUsageStatus,
  StarterPackProvisioningVoidReadiness
} from "@/lib/platform-admin/starter-pack-provisioning-void-readiness-core";

type TenantOption = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  tenant_status: string;
};

type StarterPackProvisioningDryRunPanelProps = {
  report: StarterPackProvisioningDryRunReport;
  tenants: TenantOption[];
  starterPacks: PlatformStarterPack[];
  recentProvisioningRuns: PlatformStarterPackProvisioningRun[];
  recentProvisioningAttempts: PlatformStarterPackProvisioningAttempt[];
  selectedOrganizationId: string | null;
  selectedStarterPackId: string | null;
  createdDraftRunId: string | null;
  selectedDraftReview: StarterPackProvisioningDraftReview | null;
  selectedProvisioningRun: PlatformStarterPackProvisioningRunDetail | null;
  selectedProvisioningUsage: StarterPackProvisioningVoidReadiness | null;
  selectedAuditFilter: StarterPackProvisioningAuditFilter;
};

function inputClassName() {
  return "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100";
}

function actionLabel(action: StarterPackProvisioningDryRunAction) {
  switch (action) {
    case "would_create":
      return "Would create";
    case "already_exists":
      return "Already exists";
    case "blocked":
      return "Blocked";
    case "unavailable":
      return "Unavailable";
    default:
      return action;
  }
}

function actionClassName(action: StarterPackProvisioningDryRunAction) {
  switch (action) {
    case "would_create":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "already_exists":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "blocked":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "unavailable":
      return "border-slate-200 bg-white text-slate-600";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function matchLabel(matchType: StarterPackProvisioningDryRunMatchType) {
  switch (matchType) {
    case "source_linkage":
      return "Exact source linkage";
    case "conservative_normalized":
      return "Conservative match";
    default:
      return "No match";
  }
}

function auditStatusLabel(status: PlatformStarterPackProvisioningRun["status"]) {
  switch (status) {
    case "completed_with_warnings":
      return "Completed with warnings";
    default:
      return status.replace(/_/g, " ");
  }
}

function freshnessLabel(status: StarterPackProvisioningDraftFreshnessStatus) {
  switch (status) {
    case "fresh":
      return "Fresh";
    case "stale":
      return "Stale";
    case "invalid":
      return "Invalid";
    case "unavailable":
      return "Unavailable";
    default:
      return status;
  }
}

function freshnessClassName(status: StarterPackProvisioningDraftFreshnessStatus) {
  switch (status) {
    case "fresh":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "stale":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "invalid":
      return "border-red-200 bg-red-50 text-red-700";
    case "unavailable":
      return "border-slate-200 bg-white text-slate-600";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function issueClassName(severity: StarterPackProvisioningDraftReviewIssueSeverity) {
  switch (severity) {
    case "blocking":
      return "border-red-200 bg-red-50 text-red-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function comparisonLabel(status: StarterPackProvisioningDraftItemComparisonStatus) {
  switch (status) {
    case "missing_from_current":
      return "Missing from current";
    case "added_in_current":
      return "Added in current";
    case "invalid_now":
      return "Invalid now";
    default:
      return status.replace(/_/g, " ");
  }
}

function comparisonClassName(status: StarterPackProvisioningDraftItemComparisonStatus) {
  switch (status) {
    case "unchanged":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "changed":
    case "missing_from_current":
    case "added_in_current":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "invalid_now":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function runHealthClassName(health: StarterPackProvisioningRunHealth) {
  switch (health) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "approved":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "stale":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "failed":
    case "execution_unavailable":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function usageStatusLabel(status: StarterPackProvisioningDestinationUsageStatus) {
  switch (status) {
    case "missing_destination":
      return "Missing destination";
    default:
      return status.replace(/_/g, " ");
  }
}

function usageSeverityClassName(
  severity: StarterPackProvisioningDestinationUsageSeverity
) {
  switch (severity) {
    case "blocking":
      return "border-red-200 bg-red-50 text-red-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function voidEligibilityStatusLabel(
  status: StarterPackProvisioningVoidEligibilityStatus
) {
  switch (status) {
    case "already_voided":
      return "Already voided";
    default:
      return status.replace(/_/g, " ");
  }
}

function voidEligibilityStatusClassName(
  status: StarterPackProvisioningVoidEligibilityStatus
) {
  switch (status) {
    case "eligible":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "blocked":
      return "border-red-200 bg-red-50 text-red-700";
    case "already_voided":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "unavailable":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function voidEligibilityIssueClassName(
  severity: StarterPackProvisioningVoidEligibilityIssueSeverity
) {
  switch (severity) {
    case "blocking":
      return "border-red-200 bg-red-50 text-red-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function dateTimeLabel(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function voidStrategyLabel(
  strategy: PlatformStarterPackProvisioningRunDetail["voidStrategy"]
) {
  switch (strategy) {
    case "audit_only":
      return "Audit-only";
    case "archive_unused_future":
      return "Archive unused future";
    case "detach_lineage_future":
      return "Detach lineage future";
    default:
      return "Not recorded";
  }
}

function snapshotFieldCount(snapshot: Record<string, unknown> | null | undefined) {
  return Object.keys(snapshot ?? {}).length;
}

function filterHref(filter: StarterPackProvisioningAuditFilter) {
  return `/super-admin/templates?auditFilter=${filter}#starter-pack-provisioning-dry-run`;
}

function selectedRunItemTotals(
  run: PlatformStarterPackProvisioningRunDetail | null
) {
  const items = run?.items ?? [];

  return {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    completed: items.filter((item) => item.status === "completed").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    failed: items.filter((item) => item.status === "failed").length,
    wouldCreate: items.filter((item) => item.action === "would_create").length,
    skippedExisting: items.filter((item) => item.action === "skipped_existing")
      .length,
    created: items.filter((item) => item.action === "created").length,
    destinations: items.filter((item) => Boolean(item.destinationRecordId)).length
  };
}

function approvalReadinessCopy(
  eligibility: StarterPackProvisioningApprovalEligibility
) {
  return eligibility.eligible
    ? "This draft is fresh and eligible for audit-only approval."
    : eligibility.issues[0]?.message ??
        "This draft is not eligible for audit-only approval.";
}

function executionReadinessCopy(
  eligibility: StarterPackProvisioningExecutionEligibility
) {
  return eligibility.eligible
    ? "This approved run is fresh and eligible for one atomic execution."
    : eligibility.issues[0]?.message ??
        "This approved run is not eligible for execution.";
}

function destinationCount(
  run: PlatformStarterPackProvisioningRunDetail | null,
  destinationType?: "document_template" | "catalog_item"
) {
  return (
    run?.items.filter(
      (item) =>
        Boolean(item.destinationRecordId) &&
        (!destinationType || item.destinationRecordType === destinationType)
    ).length ?? 0
  );
}

function getRunItemForComparison(
  run: PlatformStarterPackProvisioningRunDetail | null,
  comparison: StarterPackProvisioningDraftReview["itemComparisons"][number]
) {
  return (
    run?.items.find((item) => {
      const sourceId =
        item.sourceItemType === "template_seed"
          ? item.sourceTemplateSeedId
          : item.sourceCatalogSeedId;

      return (
        item.starterPackItemId === comparison.starterPackItemId &&
        item.sourceItemType === comparison.sourceItemType &&
        sourceId === comparison.sourceId
      );
    }) ?? null
  );
}

export function StarterPackProvisioningDryRunPanel({
  report,
  tenants,
  starterPacks,
  recentProvisioningRuns,
  recentProvisioningAttempts,
  selectedOrganizationId,
  selectedStarterPackId,
  createdDraftRunId,
  selectedDraftReview,
  selectedProvisioningRun,
  selectedProvisioningUsage,
  selectedAuditFilter
}: StarterPackProvisioningDryRunPanelProps) {
  const hasSelection = Boolean(report.organization && report.starterPack);
  const hasPackWarning =
    report.starterPack?.status === "draft" || report.starterPack?.status === "archived";
  const canCreateApprovalDraft =
    hasSelection &&
    report.starterPack?.status === "published" &&
    report.rows.length > 0 &&
    report.blockedCount === 0 &&
    report.unavailableCount === 0;
  const highlightedDraft =
    recentProvisioningRuns.find((run) => run.id === createdDraftRunId) ?? null;
  const approvalReadiness = selectedDraftReview
    ? evaluateStarterPackProvisioningApprovalEligibility({
        review: selectedDraftReview,
        confirmationText: STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION
      })
    : null;
  const executionReadiness =
    selectedDraftReview && selectedProvisioningRun
      ? evaluateStarterPackProvisioningExecutionEligibility({
          review: selectedDraftReview,
          run: selectedProvisioningRun,
          confirmationText: STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION
        })
      : null;
  const voidEligibility = selectedProvisioningRun
    ? evaluateStarterPackProvisioningVoidEligibility({
        run: selectedProvisioningRun,
        usageReadiness: selectedProvisioningUsage
      })
    : null;
  const selectedRunDestinationCount = destinationCount(selectedProvisioningRun);
  const observability = buildStarterPackProvisioningObservability({
    runs: recentProvisioningRuns,
    reviewsByRunId:
      selectedDraftReview && selectedProvisioningRun
        ? {
            [selectedProvisioningRun.id]: selectedDraftReview
          }
        : undefined
  });
  const filteredProvisioningRuns = filterStarterPackProvisioningRuns({
    model: observability,
    filter: selectedAuditFilter
  });
  const itemTotals = selectedRunItemTotals(selectedProvisioningRun);

  return (
    <section
      id="starter-pack-provisioning-dry-run"
      className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Provisioning Dry Run
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Starter-pack copy impact report
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Dry run only. No contractor-owned records are created. This report
            shows which platform seeds would become organization-owned document
            templates or catalog items when an approved audit run is executed by
            a platform admin.
          </p>
        </div>
        <form
          className="grid w-full gap-3 xl:max-w-2xl xl:grid-cols-[1fr_1fr_auto]"
          action="/super-admin/templates"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Organization
            </span>
            <select
              name="dryRunOrganizationId"
              defaultValue={selectedOrganizationId ?? ""}
              className={inputClassName()}
            >
              <option value="">Select organization</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.display_name || tenant.legal_name} ({tenant.tenant_status})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Starter pack
            </span>
            <select
              name="dryRunStarterPackId"
              defaultValue={selectedStarterPackId ?? ""}
              className={inputClassName()}
            >
              <option value="">Select starter pack</option>
              {starterPacks.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name} ({pack.status})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Preview dry run
          </button>
        </form>
      </div>

      {hasPackWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          This starter pack is {report.starterPack?.status}. The dry run remains
          inspectable, but a later provisioning workflow should require explicit
          policy before using non-published packs.
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-sm font-semibold text-slate-950">
          Provisioning execution is guarded
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Execution is available only from an approved, fresh, non-blocking audit
          run. It creates contractor-owned copies but does not change defaults,
          entitlements, tax, payroll, estimate behavior, or invoice behavior.
          Rollback and void workflows remain future-only. The planning spec lives at{" "}
          <span className="font-semibold text-slate-800">
            docs/starter-pack-provisioning-plan.md
          </span>
          .
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Create approval draft
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Creates audit draft rows only from a fresh server-side dry run. It
              does not copy templates or catalog items, does not change
              contractor defaults, and does not provision anything.
            </p>
            {!canCreateApprovalDraft ? (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Select a published starter pack with no blocked or unavailable
                dry-run rows before creating an approval draft.
              </p>
            ) : null}
          </div>
          <form action={createStarterPackProvisioningDraftAction}>
            <input
              type="hidden"
              name="organizationId"
              value={selectedOrganizationId ?? ""}
            />
            <input
              type="hidden"
              name="starterPackId"
              value={selectedStarterPackId ?? ""}
            />
            <button
              type="submit"
              disabled={!canCreateApprovalDraft}
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create approval draft
            </button>
          </form>
        </div>
        {highlightedDraft ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            Draft run {highlightedDraft.id} is {auditStatusLabel(
              highlightedDraft.status
            )} with {highlightedDraft.itemCount} audit item
            {highlightedDraft.itemCount === 1 ? "" : "s"}. It is review-only
            and has not been approved or executed.
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Provisioning audit observability
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Observability only. This history shows draft, approved,
              completed, failed, stale, and blocked states. It does not create
              new contractor-owned records. No rollback or void workflow exists
              yet. Rejected and idempotent no-op execution attempts are now
              logged separately as safe operation-attempt records.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Read only
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            ["Total", observability.summary.totalRuns],
            ["Draft", observability.summary.draftCount],
            ["Approved", observability.summary.approvedCount],
            ["Completed", observability.summary.completedCount],
            ["Failed", observability.summary.failedCount],
            ["Attention", observability.summary.staleOrBlockedReviewCount],
            ["With destinations", observability.summary.runsWithDestinationRecordsCount],
            [
              "Last run",
              observability.summary.lastRunTimestamp
                ? dateTimeLabel(observability.summary.lastRunTimestamp)
                : "None"
            ],
            [
              "Last completed",
              observability.summary.lastCompletedRunTimestamp
                ? dateTimeLabel(observability.summary.lastCompletedRunTimestamp)
                : "None"
            ]
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
            >
              <p className="text-base font-semibold text-slate-950">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["draft", "Draft"],
            ["approved", "Approved"],
            ["completed", "Completed"],
            ["failed", "Failed"],
            ["attention", "Needs attention"]
          ].map(([filter, label]) => (
            <a
              key={filter}
              href={filterHref(filter as StarterPackProvisioningAuditFilter)}
              className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
                selectedAuditFilter === filter
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {recentProvisioningRuns.length > 0 ? (
          <div className="mt-4 space-y-2">
            {filteredProvisioningRuns.map(({ run, health }) => (
              <div
                key={run.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {run.starterPackName ?? "Unknown starter pack"} for{" "}
                      {run.organizationName ?? run.organizationSlug ?? "unknown organization"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {run.itemCount} audit item{run.itemCount === 1 ? "" : "s"} -
                      requested {dateTimeLabel(run.requestedAt)} - approved{" "}
                      {dateTimeLabel(run.approvedAt)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Destinations {(run.destinationRecordCount ?? 0)} -
                      completed {(run.completedItemCount ?? 0)} - skipped{" "}
                      {(run.skippedItemCount ?? 0)} - pending{" "}
                      {(run.pendingItemCount ?? 0)}
                    </p>
                    {run.errorMessage ? (
                      <p className="mt-1 text-xs leading-5 text-red-700">
                        {run.errorMessage}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${runHealthClassName(
                        health.health
                      )}`}
                    >
                      {health.label}
                    </span>
                    <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {auditStatusLabel(run.status)}
                    </span>
                  </div>
                  <a
                    href={`/super-admin/templates?reviewRunId=${run.id}&auditFilter=${selectedAuditFilter}#starter-pack-provisioning-dry-run`}
                    className="inline-flex h-8 w-fit items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Review
                  </a>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {health.note}
                </p>
              </div>
            ))}
            {filteredProvisioningRuns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                No audit runs match this filter.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
            No provisioning audit runs exist yet. That is expected for this
            observability view until a draft, approval, or guarded execution has
            been recorded.
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Operation attempts
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Read-only rejected-attempt log. These rows record blocked,
                rejected, failed-before-execution, or already-completed no-op
                execution attempts with safe messages only. They do not retry,
                roll back, void, copy, or provision anything.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              No retry
            </span>
          </div>

          {recentProvisioningAttempts.length > 0 ? (
            <div className="mt-4 space-y-2">
              {recentProvisioningAttempts.map((attempt) => (
                <article
                  key={attempt.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                          {attempt.outcome.replace(/_/g, " ")}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {attempt.reasonCode.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {attempt.starterPackName ?? "Unknown starter pack"} for{" "}
                        {attempt.organizationName ??
                          attempt.organizationSlug ??
                          "unknown organization"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {attempt.safeMessage}
                      </p>
                    </div>
                    <dl className="grid min-w-72 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Attempted
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {dateTimeLabel(attempt.attemptedAt)}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Run status
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {attempt.runStatus?.replace(/_/g, " ") ?? "Unknown"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Review
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {attempt.reviewStatus?.replace(/_/g, " ") ?? "Not recorded"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Run
                        </dt>
                        <dd className="mt-1 break-all font-medium text-slate-800">
                          {attempt.runId ?? "Not recorded"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              No rejected or no-op execution attempts have been recorded yet.
            </div>
          )}
        </div>
      </div>

      {selectedDraftReview ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Draft review
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review only. This compares the stored audit draft against a
                fresh server-side dry run. Execution, when available below, is
                guarded by this review and creates only approved missing
                contractor-owned copies. It does not change defaults, roll back,
                void, or modify existing contractor-owned records.
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${freshnessClassName(
                selectedDraftReview.freshnessStatus
              )}`}
            >
              {freshnessLabel(selectedDraftReview.freshnessStatus)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Run
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                {selectedDraftReview.runId}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {auditStatusLabel(selectedDraftReview.runStatus)}
              </p>
              {selectedDraftReview.approvedAt ? (
                <p className="mt-1 text-xs text-emerald-700">
                  Approved {dateTimeLabel(selectedDraftReview.approvedAt)}
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Organization
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {selectedDraftReview.targetOrganizationLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Starter pack
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {selectedDraftReview.starterPackLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Current status: {selectedDraftReview.starterPackStatus ?? "unavailable"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Requested
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {dateTimeLabel(selectedDraftReview.requestedAt)}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">
                {selectedDraftReview.requestedByUserId ?? "Unknown user"}
              </p>
              {selectedDraftReview.approvedByUserId ? (
                <p className="mt-1 break-all text-xs text-slate-500">
                  Approved by {selectedDraftReview.approvedByUserId}
                </p>
              ) : null}
            </div>
          </div>

          {selectedProvisioningRun ? (
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Started
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {dateTimeLabel(selectedProvisioningRun.startedAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Completed
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {dateTimeLabel(selectedProvisioningRun.completedAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Destinations
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {itemTotals.destinations} linked destination id
                  {itemTotals.destinations === 1 ? "" : "s"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Error
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {selectedProvisioningRun.errorMessage ?? "None recorded"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-lg font-semibold text-slate-950">
                {selectedDraftReview.itemSummary.unchangedCount}
              </p>
              <p className="text-xs text-slate-500">Unchanged</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-lg font-semibold text-slate-950">
                {selectedDraftReview.itemSummary.changedCount}
              </p>
              <p className="text-xs text-slate-500">Changed</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-lg font-semibold text-slate-950">
                {selectedDraftReview.itemSummary.missingFromCurrentCount}
              </p>
              <p className="text-xs text-slate-500">Missing</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-lg font-semibold text-slate-950">
                {selectedDraftReview.itemSummary.addedInCurrentCount}
              </p>
              <p className="text-xs text-slate-500">Added</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-lg font-semibold text-slate-950">
                {selectedDraftReview.itemSummary.invalidNowCount}
              </p>
              <p className="text-xs text-slate-500">Invalid now</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {[
              ["Audit items", itemTotals.total],
              ["Pending", itemTotals.pending],
              ["Completed", itemTotals.completed],
              ["Skipped", itemTotals.skipped],
              ["Failed", itemTotals.failed],
              ["Would create", itemTotals.wouldCreate],
              ["Skipped existing", itemTotals.skippedExisting],
              ["Created", itemTotals.created],
              ["Blocked", itemTotals.blocked],
              ["Destinations", itemTotals.destinations]
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
              >
                <p className="text-lg font-semibold text-slate-950">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {selectedDraftReview.issues.map((issue) => (
              <div
                key={`${issue.severity}-${issue.message}`}
                className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${issueClassName(
                  issue.severity
                )}`}
              >
                <span className="font-semibold capitalize">{issue.severity}: </span>
                {issue.message}
              </div>
            ))}
          </div>

          {selectedDraftReview.runStatus === "draft" && approvalReadiness ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Approve audit draft
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Approval marks this audit run as reviewed for guarded
                    execution. It does not provision anything by itself, create
                    contractor-owned templates or catalog items, or change
                    contractor defaults.
                  </p>
                  <p
                    className={`mt-2 text-xs leading-5 ${
                      approvalReadiness.eligible
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {approvalReadinessCopy(approvalReadiness)}
                  </p>
                </div>
                <form
                  action={approveStarterPackProvisioningDraftAction}
                  className="w-full space-y-3 lg:max-w-md"
                >
                  <input
                    type="hidden"
                    name="runId"
                    value={selectedDraftReview.runId}
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Type confirmation
                    </span>
                    <input
                      name="confirmationText"
                      required
                      placeholder={STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION}
                      className={inputClassName()}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!approvalReadiness.eligible}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve audit draft
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {selectedDraftReview.runStatus === "approved" && executionReadiness ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-950">
                    Execute approved provisioning
                  </p>
                  <p className="mt-2 text-sm leading-6 text-red-800">
                    This creates contractor-owned document template and catalog
                    item copies from the approved starter-pack audit run. It does
                    not change contractor defaults, entitlements, tax, payroll,
                    estimate behavior, invoice behavior, or existing
                    contractor-owned records. Created records cannot be hard
                    deleted automatically.
                  </p>
                  <p
                    className={`mt-2 text-xs leading-5 ${
                      executionReadiness.eligible
                        ? "text-red-800"
                        : "text-amber-800"
                    }`}
                  >
                    {executionReadinessCopy(executionReadiness)}
                  </p>
                </div>
                <form
                  action={executeStarterPackProvisioningRunAction}
                  className="w-full space-y-3 lg:max-w-md"
                >
                  <input
                    type="hidden"
                    name="runId"
                    value={selectedDraftReview.runId}
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-red-950">
                      Type confirmation
                    </span>
                    <input
                      name="confirmationText"
                      required
                      placeholder={STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION}
                      className={inputClassName()}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!executionReadiness.eligible}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Execute approved provisioning
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {selectedDraftReview.runStatus === "completed" ||
          selectedDraftReview.runStatus === "completed_with_warnings" ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              This provisioning run is {auditStatusLabel(selectedDraftReview.runStatus)}.
              It has {selectedRunDestinationCount} destination record
              {selectedRunDestinationCount === 1 ? "" : "s"} linked, including{" "}
              {destinationCount(selectedProvisioningRun, "document_template")} template
              copy/copies and {destinationCount(selectedProvisioningRun, "catalog_item")}{" "}
              catalog item copy/copies. No rollback or void action is available
              in this pass. Void/rollback is not implemented; the design requires
              usage checks before any future action.
            </div>
          ) : null}

          {selectedProvisioningRun ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Void metadata foundation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Audit metadata fields are ready for a future audit-only
                    void workflow. No void action exists here, and this panel
                    does not change contractor-owned templates or catalog items.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Audit-only void action is not yet implemented. Future
                    implementation must recompute usage readiness, require exact
                    confirmation, and update audit metadata only.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Metadata only
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ["Future first strategy", "Audit-only"],
                  [
                    "Stored strategy",
                    voidStrategyLabel(selectedProvisioningRun.voidStrategy)
                  ],
                  ["Voided at", dateTimeLabel(selectedProvisioningRun.voidedAt)],
                  [
                    "Voided by",
                    selectedProvisioningRun.voidedByUserId ?? "Not recorded"
                  ],
                  [
                    "Readiness snapshot",
                    `${snapshotFieldCount(
                      selectedProvisioningRun.voidReadinessSnapshot
                    )} top-level field${
                      snapshotFieldCount(
                        selectedProvisioningRun.voidReadinessSnapshot
                      ) === 1
                        ? ""
                        : "s"
                    }`
                  ],
                  [
                    "Reason",
                    selectedProvisioningRun.voidReason ?? "Not recorded"
                  ]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <p className="break-words text-sm font-semibold text-slate-950">
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {voidEligibility ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Audit-only void eligibility
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Read-only eligibility model for a future audit-only void.
                    No void action exists yet. Audit-only void would not change
                    contractor-owned templates or catalog items, and
                    archive/delete/detach strategies are not available.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {voidEligibility.operatorSummary}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${voidEligibilityStatusClassName(
                    voidEligibility.status
                  )}`}
                >
                  {voidEligibilityStatusLabel(voidEligibility.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  [
                    "Recommended strategy",
                    voidEligibility.recommendedStrategy === "audit_only"
                      ? "Audit-only"
                      : voidEligibility.recommendedStrategy
                  ],
                  ["Confirmation phrase", voidEligibility.confirmationPhrase],
                  [
                    "Reason required",
                    voidEligibility.requiredMetadata.voidReasonRequired
                      ? "Yes"
                      : "No"
                  ],
                  [
                    "Snapshot required",
                    voidEligibility.requiredMetadata
                      .voidReadinessSnapshotRequired
                      ? "Yes"
                      : "No"
                  ]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <p className="break-words text-sm font-semibold text-slate-950">
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {voidEligibility.issues.map((issue) => (
                  <div
                    key={`${issue.severity}-${issue.message}`}
                    className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${voidEligibilityIssueClassName(
                      issue.severity
                    )}`}
                  >
                    <span className="font-semibold capitalize">
                      {issue.severity}:
                    </span>{" "}
                    {issue.message}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedProvisioningUsage ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Void readiness usage check
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Read-only usage check for completed provisioning
                    destinations. No void, rollback, archive, delete, or detach
                    action is implemented here.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Read only
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  [
                    "Audit-only void review",
                    selectedProvisioningUsage.canConsiderAuditOnlyVoid
                      ? "Possible"
                      : "Not ready"
                  ],
                  [
                    "Archive-unused review",
                    selectedProvisioningUsage.canConsiderArchiveUnused
                      ? "Possible"
                      : "Blocked"
                  ],
                  ["Blocking usage", selectedProvisioningUsage.blockingUsageCount],
                  ["Warnings", selectedProvisioningUsage.warningCount]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <p className="text-base font-semibold text-slate-950">
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {selectedProvisioningUsage.rows.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedProvisioningUsage.rows.map((row) => (
                    <article
                      key={row.runItemId}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${usageSeverityClassName(
                                row.severity
                              )}`}
                            >
                              {usageStatusLabel(row.usageStatus)}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {row.destinationRecordType.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {row.reason}
                          </p>
                        </div>
                        <dl className="grid min-w-72 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              Destination id
                            </dt>
                            <dd className="mt-1 break-all font-medium text-slate-800">
                              {row.destinationRecordId ?? "None"}
                            </dd>
                          </div>
                          {Object.entries(row.usageCountsBySource).length > 0 ? (
                            Object.entries(row.usageCountsBySource).map(
                              ([source, count]) => (
                                <div
                                  key={`${row.runItemId}-${source}`}
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
                                >
                                  <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                    {source.replace(/([A-Z])/g, " $1")}
                                  </dt>
                                  <dd className="mt-1 font-medium text-slate-800">
                                    {count}
                                  </dd>
                                </div>
                              )
                            )
                          ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
                              <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                Known usage
                              </dt>
                              <dd className="mt-1 font-medium text-slate-800">
                                None recorded
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  No destination records are linked to this run, so there is
                  nothing to evaluate for future archive-unused readiness.
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {selectedDraftReview.itemComparisons.map((comparison) => {
              const runItem = getRunItemForComparison(
                selectedProvisioningRun,
                comparison
              );

              return (
                <article
                  key={`${comparison.sourceItemType}-${comparison.sourceId}-${comparison.starterPackItemId}-${comparison.comparisonStatus}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${comparisonClassName(
                            comparison.comparisonStatus
                          )}`}
                        >
                          {comparisonLabel(comparison.comparisonStatus)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {comparison.sourceItemType.replace(/_/g, " ")}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          Source {comparison.sourceStatus ?? "unknown"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-950">
                        {comparison.sourceName}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {comparison.issue}
                      </p>
                    </div>
                    <dl className="grid min-w-72 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Draft action
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {comparison.draftAction?.replace(/_/g, " ") ?? "None"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Current action
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {comparison.currentAction?.replace(/_/g, " ") ?? "None"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Draft match
                        </dt>
                        <dd className="mt-1 break-all font-medium text-slate-800">
                          {comparison.draftMatchingExistingRecordId ?? "None"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Current match
                        </dt>
                        <dd className="mt-1 break-all font-medium text-slate-800">
                          {comparison.currentMatchingExistingRecordId ?? "None"}
                        </dd>
                      </div>
                      {runItem ? (
                        <>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              Audit status
                            </dt>
                            <dd className="mt-1 font-medium text-slate-800">
                              {runItem.action.replace(/_/g, " ")} /{" "}
                              {runItem.status.replace(/_/g, " ")}
                            </dd>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              Destination id
                            </dt>
                            <dd className="mt-1 break-all font-medium text-slate-800">
                              {runItem.destinationRecordId ?? "None"}
                            </dd>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              Item note
                            </dt>
                            <dd className="mt-1 font-medium text-slate-800">
                              {runItem.errorMessage ?? runItem.reason ?? "None recorded"}
                            </dd>
                          </div>
                        </>
                      ) : null}
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {report.wouldCreateTemplateCount}
          </p>
          <p className="text-xs text-slate-500">Templates to create</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {report.wouldCreateCatalogItemCount}
          </p>
          <p className="text-xs text-slate-500">Catalog items to create</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {report.alreadyExistsCount}
          </p>
          <p className="text-xs text-slate-500">Already adopted</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {report.blockedCount}
          </p>
          <p className="text-xs text-slate-500">Blocked</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {report.unavailableCount}
          </p>
          <p className="text-xs text-slate-500">Unavailable</p>
        </div>
      </div>

      {hasSelection ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          Inspecting{" "}
          <span className="font-semibold text-slate-950">
            {report.starterPack?.name}
          </span>{" "}
          for{" "}
          <span className="font-semibold text-slate-950">
            {report.organization?.name}
          </span>
          . {report.note}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Select an organization and a starter pack to inspect the read-only
          copy impact report.
        </div>
      )}

      {report.rows.length > 0 ? (
        <div className="space-y-3">
          {report.rows.map((row) => (
            <article
              key={row.starterPackItemId}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${actionClassName(
                        row.action
                      )}`}
                    >
                      {actionLabel(row.action)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {row.sourceItemType.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {row.destinationType.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {matchLabel(row.matchType)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">
                    {row.sourceName}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {row.reason}
                  </p>
                </div>
                <dl className="grid min-w-72 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Source id
                    </dt>
                    <dd className="mt-1 break-all font-medium text-slate-800">
                      {row.sourceId ?? "Unavailable"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Existing record
                    </dt>
                    <dd className="mt-1 break-all font-medium text-slate-800">
                      {row.matchingExistingRecordId ?? "None"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Source type
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {row.sourceType}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Source status
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {row.sourceStatus}
                    </dd>
                  </div>
                  {row.sourceCategory ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
                      <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Source category
                      </dt>
                      <dd className="mt-1 font-medium text-slate-800">
                        {row.sourceCategory}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
