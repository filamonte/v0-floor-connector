import type {
  StarterPackAssignmentTargetingResult,
  StarterPackTargetingPreview,
  StarterPackTargetingStatus
} from "@/lib/platform-admin/starter-pack-targeting-core";

type TenantOption = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  tenant_status: string;
};

type StarterPackTargetingPreviewPanelProps = {
  preview: StarterPackTargetingPreview;
  tenants: TenantOption[];
  selectedOrganizationId: string | null;
};

function inputClassName() {
  return "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100";
}

function statusLabel(status: StarterPackTargetingStatus) {
  switch (status) {
    case "matched":
      return "Matched";
    case "possible_match":
      return "Possible";
    case "unavailable":
      return "Unavailable";
    default:
      return "Not matched";
  }
}

function statusClassName(status: StarterPackTargetingStatus) {
  switch (status) {
    case "matched":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "possible_match":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "unavailable":
      return "border-slate-200 bg-white text-slate-600";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function assignmentTarget(result: StarterPackAssignmentTargetingResult) {
  const { assignment } = result;

  if (assignment.assignmentType === "all_organizations") {
    return "All active organizations";
  }

  if (assignment.assignmentType === "organization") {
    return (
      assignment.organizationName ??
      assignment.organizationSlug ??
      assignment.organizationId ??
      "Specific organization"
    );
  }

  return assignment.label ?? assignment.assignmentKey ?? "Unlabeled target";
}

function AssignmentResultRows({
  results
}: {
  results: StarterPackAssignmentTargetingResult[];
}) {
  if (results.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        No assignment rows are available for this status.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <div
          key={result.assignment.id}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassName(
                result.status
              )}`}
            >
              {statusLabel(result.status)}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {result.assignment.assignmentType.replace(/_/g, " ")}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {result.assignment.status}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {assignmentTarget(result)}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{result.reason}</p>
        </div>
      ))}
    </div>
  );
}

export function StarterPackTargetingPreviewPanel({
  preview,
  tenants,
  selectedOrganizationId
}: StarterPackTargetingPreviewPanelProps) {
  return (
    <section
      id="starter-pack-targeting-preview"
      className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Targeting Preview
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Starter-pack assignment explainer
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Planning only. No contractor data changes. This preview explains
            why assignment intent would or would not match a selected
            organization before any provisioning workflow exists.
          </p>
        </div>
        <form className="w-full max-w-md" action="/super-admin/templates">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Preview organization
            </span>
            <select
              name="targetOrganizationId"
              defaultValue={selectedOrganizationId ?? ""}
              className={inputClassName()}
            >
              <option value="">Select an organization</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.display_name || tenant.legal_name} ({tenant.tenant_status})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-3 inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Preview targeting
          </button>
        </form>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {preview.matchedStarterPacks.length}
          </p>
          <p className="text-xs text-slate-500">Matched packs</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {preview.unmatchedStarterPacks.length}
          </p>
          <p className="text-xs text-slate-500">Not matched / possible</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-semibold text-slate-950">
            {preview.unavailableStarterPacks.length}
          </p>
          <p className="text-xs text-slate-500">Unavailable planning types</p>
        </div>
      </div>

      {preview.organization ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          Inspecting <span className="font-semibold text-slate-950">{preview.organization.name}</span>
          {" "}with tenant status{" "}
          <span className="font-semibold text-slate-950">
            {preview.organization.tenantStatus}
          </span>
          , state/region{" "}
          <span className="font-semibold text-slate-950">
            {preview.organization.stateRegion ?? "not available"}
          </span>
          , primary trade{" "}
          <span className="font-semibold text-slate-950">
            {preview.organization.primaryTrade ?? "not available"}
          </span>
          , and plan{" "}
          <span className="font-semibold text-slate-950">
            {preview.organization.planName ?? preview.organization.planKey ?? "not available"}
          </span>
          . Contractor groups{" "}
          <span className="font-semibold text-slate-950">
            {preview.organization.contractorGroups &&
            preview.organization.contractorGroups.length > 0
              ? preview.organization.contractorGroups
                  .map((group) => `${group.name} (${group.status})`)
                  .join(", ")
              : "not assigned"}
          </span>
          .
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Select an organization to evaluate exact organization, region,
          trade-segment, and plan-tier assignment intent.
        </div>
      )}

      <div className="space-y-4">
        {preview.packResults.map((result) => (
          <article
            key={result.pack.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassName(
                      result.status
                    )}`}
                  >
                    {statusLabel(result.status)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {result.pack.status}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">
                  {result.pack.name}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {result.reason}
                </p>
              </div>
              <div className="grid min-w-48 grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-base font-semibold text-slate-950">
                    {result.matchedAssignments.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Matched</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-base font-semibold text-slate-950">
                    {result.unmatchedAssignments.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Other</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-base font-semibold text-slate-950">
                    {result.unavailableAssignments.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Future</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Matched
                </p>
                <AssignmentResultRows results={result.matchedAssignments} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Not matched / possible
                </p>
                <AssignmentResultRows results={result.unmatchedAssignments} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Future or unavailable
                </p>
                <AssignmentResultRows results={result.unavailableAssignments} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
