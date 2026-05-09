import type { ContractorGroup } from "@floorconnector/types";

import type {
  ContractorGroupAssignmentAuditReadiness
} from "@/lib/platform-admin/contractor-group-assignment-audit-readiness-core";
import {
  type ContractorGroupAssignmentProposal,
  type ContractorGroupAssignmentProposalManualReviewChecklist,
  ContractorGroupAssignmentProposalConfidence,
  ContractorGroupAssignmentProposalReadModel,
  ContractorGroupAssignmentProposalStatus
} from "@/lib/platform-admin/contractor-group-assignment-proposals-core";
import type {
  ContractorGroupAuditObservability,
  ContractorGroupAuditTimeline
} from "@/lib/platform-admin/contractor-group-audit-events-core";
import type {
  ContractorGroupObservability,
  ContractorGroupObservabilityOrganizationSummary
} from "@/lib/platform-admin/contractor-group-observability-core";
import {
  applyContractorGroupProposalManualAssignmentAction,
  archiveContractorGroupAction,
  assignContractorGroupMembershipAction,
  removeContractorGroupMembershipAction,
  upsertContractorGroupAction
} from "@/lib/platform-admin/actions";

type TenantOption = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  tenant_status: string;
};

type ContractorGroupManagerProps = {
  groups: ContractorGroup[];
  tenants: TenantOption[];
  observability: ContractorGroupObservability;
  assignmentAuditReadiness: ContractorGroupAssignmentAuditReadiness;
  assignmentProposals: ContractorGroupAssignmentProposalReadModel;
  auditObservability: ContractorGroupAuditObservability;
  auditTimeline: ContractorGroupAuditTimeline;
  selectedStatus: string;
  selectedType: string;
  selectedOrganizationId: string | null;
  selectedAuditEventType: string;
  selectedProposalStatus: string;
  selectedProposalConfidence: string;
  selectedProposalGroupType: string;
};

function inputClassName() {
  return "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100";
}

const groupStatuses = ["active", "inactive", "archived"] as const;
const groupTypes = [
  "trade_segment",
  "onboarding",
  "beta",
  "internal",
  "future_plan",
  "future_entitlement",
  "regional",
  "custom"
] as const;
const auditEventTypes = [
  "group_created",
  "group_updated",
  "group_archived",
  "group_activated",
  "group_deactivated",
  "organization_assigned",
  "organization_removed",
  "assignment_source_changed"
] as const;
const proposalStatuses = [
  "proposed",
  "already_assigned",
  "not_applicable",
  "unavailable"
] as const;
const proposalConfidences = ["high", "medium", "low", "unavailable"] as const;

function eventTypeLabel(type: (typeof auditEventTypes)[number]) {
  return type.replace(/_/g, " ");
}

function groupTypeLabel(type: ContractorGroup["groupType"]) {
  return type.replace(/_/g, " ");
}

function organizationLabel(tenant: TenantOption) {
  return tenant.display_name || tenant.legal_name || tenant.slug;
}

function statusClassName(status: ContractorGroup["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "inactive":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function normalizeStatusFilter(value: string) {
  return groupStatuses.some((status) => status === value) ? value : "all";
}

function normalizeTypeFilter(value: string) {
  return groupTypes.some((type) => type === value) ? value : "all";
}

function normalizeProposalStatusFilter(
  value: string
): ContractorGroupAssignmentProposalStatus | "all" {
  switch (value) {
    case "proposed":
    case "already_assigned":
    case "not_applicable":
    case "unavailable":
      return value;
    default:
      return "all";
  }
}

function normalizeProposalConfidenceFilter(
  value: string
): ContractorGroupAssignmentProposalConfidence | "all" {
  switch (value) {
    case "high":
    case "medium":
    case "low":
    case "unavailable":
      return value;
    default:
      return "all";
  }
}

function dateLabel(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function GroupMetadataForm({ group }: { group?: ContractorGroup }) {
  const formLabel = group
    ? `Edit contractor group ${group.name}`
    : "Create contractor group";
  const submitLabel = group
    ? `Save contractor group ${group.name}`
    : "Create contractor group";

  return (
    <form
      action={upsertContractorGroupAction}
      aria-label={formLabel}
      data-contractor-group-key={group?.key}
      data-testid={
        group ? "contractor-group-update-form" : "contractor-group-create-form"
      }
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
    >
      {group ? (
        <input type="hidden" name="contractorGroupId" value={group.id} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Name</span>
          <input
            name="name"
            defaultValue={group?.name ?? ""}
            placeholder="Priority Installers"
            required
            className={inputClassName()}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Key</span>
          <input
            name="key"
            defaultValue={group?.key ?? ""}
            placeholder="priority-installers"
            required
            className={inputClassName()}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
          <select
            name="status"
            defaultValue={group?.status ?? "active"}
            className={inputClassName()}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Type</span>
          <select
            name="groupType"
            defaultValue={group?.groupType ?? "custom"}
            className={inputClassName()}
          >
            <option value="trade_segment">Trade segment</option>
            <option value="onboarding">Onboarding</option>
            <option value="beta">Beta</option>
            <option value="internal">Internal</option>
            <option value="future_plan">Future plan</option>
            <option value="future_entitlement">Future entitlement</option>
            <option value="regional">Regional</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Description
        </span>
        <textarea
          name="description"
          defaultValue={group?.description ?? ""}
          rows={3}
          placeholder="Platform segmentation notes. This does not affect contractor permissions."
          className={inputClassName()}
        />
      </label>
      <button
        type="submit"
        aria-label={submitLabel}
        className="mt-5 inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        {group ? "Save group" : "Create contractor group"}
      </button>
    </form>
  );
}

function AssignmentForm({
  group,
  tenants
}: {
  group: ContractorGroup;
  tenants: TenantOption[];
}) {
  const assignedOrganizationIds = new Set(
    group.memberships.map((membership) => membership.organizationId)
  );
  const availableTenants = tenants.filter(
    (tenant) => !assignedOrganizationIds.has(tenant.id)
  );

  return (
    <form
      action={assignContractorGroupMembershipAction}
      aria-label={`Assign organization to contractor group ${group.name}`}
      data-contractor-group-key={group.key}
      data-testid="contractor-group-assignment-form"
      className="space-y-3"
    >
      <input type="hidden" name="contractorGroupId" value={group.id} />
      <input type="hidden" name="assignmentSource" value="manual" />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Assign organization
        </span>
        <select
          name="organizationId"
          required
          disabled={group.status === "archived" || availableTenants.length === 0}
          className={inputClassName()}
        >
          <option value="">Select contractor organization</option>
          {availableTenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.display_name || tenant.legal_name} ({tenant.tenant_status})
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          rows={2}
          placeholder="Manual segmentation note for platform operators."
          className={inputClassName()}
        />
      </label>
      <button
        type="submit"
        aria-label={`Assign organization to contractor group ${group.name}`}
        disabled={group.status === "archived" || availableTenants.length === 0}
        className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Assign organization
      </button>
    </form>
  );
}

function MembershipList({ group }: { group: ContractorGroup }) {
  if (group.memberships.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        No organizations are manually assigned to this group yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {group.memberships.map((membership) => (
        <div
          key={membership.id}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {membership.organizationName ??
                membership.organizationSlug ??
                membership.organizationId}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {membership.organizationTenantStatus ?? "tenant status unavailable"} ·{" "}
              {membership.assignmentSource.replace(/_/g, " ")}
              {membership.notes ? ` · ${membership.notes}` : ""}
            </p>
          </div>
          <form
            action={removeContractorGroupMembershipAction}
            aria-label={`Remove ${
              membership.organizationName ??
              membership.organizationSlug ??
              "organization"
            } from contractor group ${group.name}`}
            data-contractor-group-key={group.key}
            data-organization-id={membership.organizationId}
            data-testid="contractor-group-remove-membership-form"
          >
            <input type="hidden" name="membershipId" value={membership.id} />
            <button
              type="submit"
              aria-label={`Remove ${
                membership.organizationName ??
                membership.organizationSlug ??
                "organization"
              } from contractor group ${group.name}`}
              className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Remove
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ContractorGroupFilters({
  selectedStatus,
  selectedType
}: {
  selectedStatus: string;
  selectedType: string;
}) {
  return (
    <form
      action="/super-admin/groups"
      className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto]"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Status filter
        </span>
        <select
          name="groupStatus"
          defaultValue={selectedStatus}
          className={inputClassName()}
        >
          <option value="all">All statuses</option>
          {groupStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Type filter
        </span>
        <select name="groupType" defaultValue={selectedType} className={inputClassName()}>
          <option value="all">All types</option>
          {groupTypes.map((type) => (
            <option key={type} value={type}>
              {groupTypeLabel(type)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}

function StarterPackReferenceList({
  references
}: {
  references: ContractorGroupObservability["groupDetails"][number]["starterPackAssignmentReferences"];
}) {
  if (references.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        No future starter-pack assignment intent currently references this group key.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {references.map((reference) => (
        <div
          key={reference.assignmentId}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-slate-950">
            {reference.starterPackName}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {reference.starterPackStatus} pack · {reference.assignmentStatus} assignment ·{" "}
            {reference.assignmentLabel ?? reference.assignmentKey ?? "unlabeled group target"}
          </p>
        </div>
      ))}
    </div>
  );
}

function ObservabilitySection({
  observability
}: {
  observability: ContractorGroupObservability;
}) {
  const populatedTypes = groupTypes.filter(
    (type) => observability.summary.groupsByType[type] > 0
  );

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-950">Groups by type</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(populatedTypes.length > 0 ? populatedTypes : groupTypes.slice(0, 1)).map(
            (type) => (
              <span
                key={type}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {groupTypeLabel(type)}: {observability.summary.groupsByType[type]}
              </span>
            )
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-950">
          Multi-group organizations
        </p>
        <div className="mt-3 space-y-2">
          {observability.summary.organizationsAssignedToMultipleGroups
            .slice(0, 5)
            .map((summary) => (
              <p key={summary.organization.id} className="text-sm text-slate-600">
                <span className="font-semibold text-slate-950">
                  {summary.organization.name}
                </span>{" "}
                belongs to {summary.groups.length} groups.
              </p>
            ))}
          {observability.summary.organizationsAssignedToMultipleGroups.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              No organizations are assigned to multiple groups.
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-950">
          Recently assigned memberships
        </p>
        <div className="mt-3 space-y-2">
          {observability.summary.recentlyAssignedMemberships.map((membership) => (
            <p key={membership.id} className="text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-950">
                {membership.organizationName ?? membership.organizationSlug ?? membership.organizationId}
              </span>{" "}
              in {membership.groupName} on {dateLabel(membership.createdAt)}
            </p>
          ))}
          {observability.summary.recentlyAssignedMemberships.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              No organization memberships have been assigned yet.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AssignmentAuditReadinessPanel({
  readiness
}: {
  readiness: ContractorGroupAssignmentAuditReadiness;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Assignment history readiness
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only audit planning over current group and membership rows. Current
            inferred history is limited, membership removal cannot be reconstructed
            unless an audit event was written, and action write wiring must be
            audited before groups power enforcement or automation.
          </p>
        </div>
        <div className="grid min-w-[17rem] grid-cols-3 gap-2">
          <SummaryTile
            label="Created inferred"
            value={readiness.summary.inferredGroupCreatedEvents}
          />
          <SummaryTile
            label="Assigned inferred"
            value={readiness.summary.inferredOrganizationAssignedEvents}
          />
          <SummaryTile
            label="Archived inferred"
            value={readiness.summary.inferredArchivedGroupEvents}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recent inferred events
          </p>
          <div className="mt-3 space-y-3">
            {readiness.events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-950">
                  {event.summary}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {event.eventType.replace(/_/g, " ")} · {dateLabel(event.occurredAt)}
                  {event.assignmentSource
                    ? ` · ${event.assignmentSource.replace(/_/g, " ")}`
                    : ""}
                  {event.performedByUserId
                    ? ` · actor ${event.performedByUserId}`
                    : ""}
                </p>
                {event.caveat ? (
                  <p className="mt-2 text-xs leading-5 text-amber-700">
                    {event.caveat}
                  </p>
                ) : null}
              </div>
            ))}
            {readiness.events.length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">
                No contractor group audit-like events can be inferred yet.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {readiness.caveats.map((caveat) => (
            <div
              key={caveat.key}
              className={`rounded-2xl border px-4 py-3 ${
                caveat.severity === "warning"
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  caveat.severity === "warning"
                    ? "text-amber-900"
                    : "text-slate-950"
                }`}
              >
                {caveat.title}
              </p>
              <p
                className={`mt-1 text-sm leading-6 ${
                  caveat.severity === "warning"
                    ? "text-amber-800"
                    : "text-slate-600"
                }`}
              >
                {caveat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function auditEventChipClassName(eventType: string) {
  if (eventType.includes("removed") || eventType.includes("archived")) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (eventType.includes("assigned") || eventType.includes("activated")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function proposalStatusClassName(status: string) {
  switch (status) {
    case "proposed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "already_assigned":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "unavailable":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function readinessChipClassName(readiness: string) {
  switch (readiness) {
    case "ready_for_review":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "already_assigned":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "blocked":
    case "future_only":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "needs_metadata":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function caveatSeverityClassName(severity: string) {
  switch (severity) {
    case "blocking":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function isProposalEligibleForManualAssignment(
  proposal: ContractorGroupAssignmentProposal
) {
  return (
    proposal.status === "proposed" &&
    proposal.manualReviewReadiness === "ready_for_review" &&
    (proposal.confidence === "high" || proposal.confidence === "medium") &&
    proposal.assignmentApplied === false &&
    proposal.runtimeEffect === "none" &&
    proposal.contractorGroupStatus === "active" &&
    proposal.contractorGroupType !== "future_plan" &&
    proposal.contractorGroupType !== "future_entitlement"
  );
}

function buildSubmittedProposalFingerprint(
  proposal: ContractorGroupAssignmentProposal
) {
  return JSON.stringify({
    proposalId: proposal.id,
    organizationId: proposal.organizationId,
    contractorGroupId: proposal.contractorGroupId,
    contractorGroupKey: proposal.contractorGroupKey,
    contractorGroupType: proposal.contractorGroupType,
    contractorGroupStatus: proposal.contractorGroupStatus,
    status: proposal.status,
    confidence: proposal.confidence,
    source: proposal.source,
    reasonCode: proposal.reasonCode,
    manualReviewReadiness: proposal.manualReviewReadiness
  });
}

function ManualReviewChecklist({
  checklist
}: {
  checklist: ContractorGroupAssignmentProposalManualReviewChecklist;
}) {
  const visibleEvidence = checklist.evidenceItems.slice(0, 4);
  const visibleChecks = checklist.requiredFutureOperatorChecks.slice(0, 3);

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Manual review checklist
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{checklist.note}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Manual assignment requires an operator reason, server-side proposal
        recomputation, and audited assignment.
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {visibleEvidence.map((item) => (
          <div
            key={`${item.label}:${item.value}`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{item.value}</p>
          </div>
        ))}
      </div>
      {checklist.blockingCaveats.length > 0 ? (
        <div className="mt-3 space-y-1">
          {checklist.blockingCaveats.slice(0, 3).map((caveat) => (
            <p key={caveat} className="text-xs leading-5 text-amber-800">
              {caveat}
            </p>
          ))}
        </div>
      ) : null}
      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
        <p className="text-xs leading-5 text-sky-800">
          Future checks: {visibleChecks.join(" ")}
        </p>
        <p className="mt-1 text-xs leading-5 text-sky-800">
          Suggested future reason: {checklist.suggestedFutureReasonText}
        </p>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {checklist.manualAssignmentPathLabel} Action available: no.
      </p>
    </div>
  );
}

function ProposalManualAssignmentForm({
  proposal
}: {
  proposal: ContractorGroupAssignmentProposal;
}) {
  if (!isProposalEligibleForManualAssignment(proposal)) {
    return null;
  }

  return (
    <details
      className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
      data-testid="contractor-group-proposal-manual-assignment-details"
    >
      <summary className="cursor-pointer text-sm font-semibold text-amber-950">
        Open manual assignment confirmation
      </summary>
      <form
        action={applyContractorGroupProposalManualAssignmentAction}
        aria-label={`Manually assign ${proposal.organizationName} to ${proposal.contractorGroupName}`}
        className="mt-4 space-y-4"
        data-testid="contractor-group-proposal-manual-assignment-form"
        data-proposal-id={proposal.id}
      >
        <input type="hidden" name="organizationId" value={proposal.organizationId} />
        <input
          type="hidden"
          name="contractorGroupId"
          value={proposal.contractorGroupId}
        />
        <input
          type="hidden"
          name="submittedProposal"
          value={buildSubmittedProposalFingerprint(proposal)}
        />

        <div className="rounded-xl border border-amber-300 bg-white px-3 py-2">
          <p className="text-xs leading-5 text-amber-900">
            This writes one contractor group membership and one audit event only.
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            No entitlement effect, provisioning effect, pricing/package effect,
            contractor permission effect, starter-pack behavior, or runtime
            behavior changes.
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            The server recomputes readiness before writing and may reject stale
            proposals.
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            Starter-pack impact remains read-only targeting context.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Operator reason
          </span>
          <textarea
            name="operatorReason"
            rows={3}
            required
            maxLength={1000}
            placeholder="Record why this one proposal is being assigned manually."
            className={inputClassName()}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Type ASSIGN GROUP MANUALLY
          </span>
          <input
            name="confirmationPhrase"
            required
            pattern="ASSIGN GROUP MANUALLY"
            autoComplete="off"
            className={inputClassName()}
          />
        </label>
        <button
          type="submit"
          aria-label={`Assign ${proposal.organizationName} to ${proposal.contractorGroupName} manually`}
          className="inline-flex h-9 items-center rounded-full border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
        >
          Assign group manually
        </button>
      </form>
    </details>
  );
}

function ProposalReadinessDetails({
  proposal
}: {
  proposal: ContractorGroupAssignmentProposal;
}) {
  const visibleEvidence = proposal.evidenceItems.slice(0, 4);
  const visibleCaveats = proposal.caveatItems.slice(0, 4);
  const visibleStarterPackImpacts = proposal.starterPackImpactPreview.slice(0, 3);
  const affectedRecords =
    proposal.futureApplyPreview.affectedRecordTypes.length > 0
      ? proposal.futureApplyPreview.affectedRecordTypes.join(", ")
      : "none";

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessChipClassName(
            proposal.manualReviewReadiness
          )}`}
        >
          {proposal.readinessLabel}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
          Reason: {proposal.reasonCode.replace(/_/g, " ")}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
          No runtime effect
        </span>
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Read-only review context
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {proposal.readinessExplanation}
      </p>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {visibleEvidence.map((item) => (
          <div
            key={`${item.label}:${item.value}`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{item.value}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {item.severity}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Caveats
        </p>
        {visibleCaveats.map((caveat) => (
          <p
            key={`${caveat.severity}:${caveat.label}`}
            className={`rounded-xl border px-3 py-2 text-xs leading-5 ${caveatSeverityClassName(
              caveat.severity
            )}`}
          >
            {caveat.label} Severity: {caveat.severity}.
          </p>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-800">
          Future apply preview
        </p>
        <p className="mt-1 text-xs leading-5 text-sky-800">
          {proposal.futureApplyPreview.summary}
        </p>
        <p className="mt-1 text-xs leading-5 text-sky-800">
          Current action available: no. Assignment applied: no. Future affected
          records: {affectedRecords}. Runtime effect:{" "}
          {proposal.futureApplyPreview.runtimeEffect}.
        </p>
      </div>

      {visibleStarterPackImpacts.length > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Read-only starter-pack impact preview
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            These references are targeting context only. They do not provision
            templates, catalog items, defaults, entitlements, or runtime behavior.
          </p>
          <div className="mt-2 space-y-2">
            {visibleStarterPackImpacts.map((impact) => (
              <p
                key={`${impact.starterPackId}:${impact.assignmentId}`}
                className="text-xs leading-5 text-slate-700"
              >
                {impact.starterPackName} ({impact.starterPackKey}) ·{" "}
                {impact.starterPackStatus} · assignment{" "}
                {impact.assignmentLabel ?? impact.assignmentKey ?? impact.assignmentId} ·{" "}
                {impact.assignmentStatus} · provisioning effect:{" "}
                {impact.provisioningEffect}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        No assignment is applied from this display. No apply, bulk, provisioning,
        entitlement, or runtime control exists here.
      </p>
    </div>
  );
}

function AssignmentProposalsPanel({
  proposals,
  tenants,
  selectedOrganizationId,
  selectedProposalStatus,
  selectedProposalConfidence,
  selectedProposalGroupType,
  selectedGroupStatus,
  selectedGroupType,
  selectedAuditEventType
}: {
  proposals: ContractorGroupAssignmentProposalReadModel;
  tenants: TenantOption[];
  selectedOrganizationId: string | null;
  selectedProposalStatus: string;
  selectedProposalConfidence: string;
  selectedProposalGroupType: string;
  selectedGroupStatus: string;
  selectedGroupType: string;
  selectedAuditEventType: string;
}) {
  const visibleProposals = proposals.proposals.slice(
    0,
    selectedOrganizationId ? 12 : 8
  );
  const selectedOrganizationSummary = proposals.selectedOrganizationSummary;
  const visibleReasonSummaries =
    selectedOrganizationSummary?.topReasons.filter((reason) => reason.count > 0) ??
    [];
  const visibleCaveatSummaries =
    selectedOrganizationSummary?.topCaveats.filter((caveat) => caveat.count > 0) ??
    [];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Assignment proposals
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only decision support from current organization metadata and
            contractor group definitions. No assignment is applied here; platform
            admins must still use the existing audited manual assignment flow. This
            does not trigger entitlement, provisioning, pricing, permission, or
            runtime behavior.
          </p>
        </div>
        <div className="grid min-w-[18rem] grid-cols-4 gap-2">
          <SummaryTile label="Visible" value={proposals.summary.totalProposals} />
          <SummaryTile label="Proposed" value={proposals.summary.proposedCount} />
          <SummaryTile
            label="Already assigned"
            value={proposals.summary.alreadyAssignedCount}
          />
          <SummaryTile
            label="Unavailable"
            value={proposals.summary.unavailableCount}
          />
        </div>
      </div>

      <form
        action="/super-admin/groups"
        className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
      >
        <input type="hidden" name="groupStatus" value={selectedGroupStatus} />
        <input type="hidden" name="groupType" value={selectedGroupType} />
        <input type="hidden" name="auditEventType" value={selectedAuditEventType} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Proposal organization
          </span>
          <select
            name="organizationId"
            defaultValue={selectedOrganizationId ?? ""}
            className={inputClassName()}
          >
            <option value="">All organizations</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {organizationLabel(tenant)} ({tenant.tenant_status})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Proposal status
          </span>
          <select
            name="proposalStatus"
            defaultValue={selectedProposalStatus}
            className={inputClassName()}
          >
            <option value="all">All statuses</option>
            {proposalStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Confidence
          </span>
          <select
            name="proposalConfidence"
            defaultValue={selectedProposalConfidence}
            className={inputClassName()}
          >
            <option value="all">All confidence</option>
            {proposalConfidences.map((confidence) => (
              <option key={confidence} value={confidence}>
                {confidence}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Group type
          </span>
          <select
            name="proposalGroupType"
            defaultValue={selectedProposalGroupType}
            className={inputClassName()}
          >
            <option value="all">All group types</option>
            {groupTypes.map((type) => (
              <option key={type} value={type}>
                {groupTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Filter proposals
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.45fr]">
        <div className="space-y-3">
          {selectedOrganizationSummary ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
              <p className="text-sm font-semibold text-sky-950">
                {selectedOrganizationSummary.organizationName} proposal summary
              </p>
              <p className="mt-1 text-sm leading-6 text-sky-800">
                {selectedOrganizationSummary.totalProposals} total ·{" "}
                {selectedOrganizationSummary.proposedCount} proposed ·{" "}
                {selectedOrganizationSummary.alreadyAssignedCount} already assigned ·{" "}
                {selectedOrganizationSummary.unavailableCount} unavailable.
              </p>
              {visibleReasonSummaries.length > 0 ? (
                <p className="mt-2 text-xs leading-5 text-sky-800">
                  Top reasons:{" "}
                  {visibleReasonSummaries
                    .map((reason) => `${reason.label} (${reason.count})`)
                    .join(", ")}
                </p>
              ) : null}
              {visibleCaveatSummaries.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {visibleCaveatSummaries.map((caveat) => (
                    <p key={caveat.label} className="text-xs leading-5 text-amber-800">
                      {caveat.label} ({caveat.count})
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {visibleProposals.map((proposal) => {
            return (
              <div
                key={proposal.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${proposalStatusClassName(
                      proposal.status
                    )}`}
                  >
                    {proposal.status.replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {proposal.confidence} confidence
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {proposal.source.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {proposal.organizationName}
                  {" -> "}
                  {proposal.contractorGroupName}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {proposal.reason}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Group: {proposal.contractorGroupKey} ·{" "}
                  {groupTypeLabel(proposal.contractorGroupType)} ·{" "}
                  {proposal.contractorGroupStatus} · assignment applied: no
                </p>
                {proposal.caveats.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {proposal.caveats.map((caveat) => (
                      <p key={caveat} className="text-xs leading-5 text-amber-800">
                        {caveat}
                      </p>
                    ))}
                  </div>
                ) : null}
                <ProposalReadinessDetails proposal={proposal} />
                <ManualReviewChecklist checklist={proposal.manualReviewChecklist} />
                <ProposalManualAssignmentForm proposal={proposal} />
              </div>
            );
          })}
          {visibleProposals.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              No assignment proposals are available for the current group and
              organization data.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {proposals.caveats.map((caveat) => (
            <p
              key={caveat}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
            >
              {caveat}
            </p>
          ))}
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            No apply-all, auto-assign, provisioning, entitlement, or runtime
            control exists in this proposal panel.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContractorGroupAuditObservabilityPanel({
  auditObservability
}: {
  auditObservability: ContractorGroupAuditObservability;
}) {
  const visibleEventTypes = auditEventTypes.filter(
    (eventType) => auditObservability.summary.eventsByType[eventType] > 0
  );

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Audit observability
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only operational view of durable contractor group audit events.
            This is audit evidence only: segmentation does not enforce
            entitlements, contractor permissions, pricing, provisioning, or runtime
            behavior.
          </p>
        </div>
        <div className="grid min-w-[18rem] grid-cols-3 gap-2">
          <SummaryTile
            label="Events"
            value={auditObservability.summary.totalEvents}
          />
          <SummaryTile
            label="With metadata"
            value={auditObservability.summary.metadataPresentCount}
          />
          <SummaryTile
            label="Context gaps"
            value={auditObservability.summary.missingContextIssues.length}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Events by type
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(visibleEventTypes.length > 0 ? visibleEventTypes : auditEventTypes.slice(0, 1)).map(
              (eventType) => (
                <span
                  key={eventType}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${auditEventChipClassName(
                    eventType
                  )}`}
                >
                  {eventTypeLabel(eventType)}:{" "}
                  {auditObservability.summary.eventsByType[eventType]}
                </span>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Groups with recent activity
          </p>
          <div className="mt-3 space-y-2">
            {auditObservability.summary.groupsWithRecentActivity
              .slice(0, 5)
              .map((group) => (
                <p key={group.id} className="text-sm leading-6 text-slate-600">
                  <span className="font-semibold text-slate-950">
                    {group.label}
                  </span>{" "}
                  has {group.count} event{group.count === 1 ? "" : "s"}; last{" "}
                  {dateLabel(group.lastEventAt)}.
                </p>
              ))}
            {auditObservability.summary.groupsWithRecentActivity.length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">
                No durable group audit activity is loaded yet.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Organizations with assignment activity
          </p>
          <div className="mt-3 space-y-2">
            {auditObservability.summary.organizationsWithRecentAssignmentActivity
              .slice(0, 5)
              .map((organization) => (
                <p key={organization.id} className="text-sm leading-6 text-slate-600">
                  <span className="font-semibold text-slate-950">
                    {organization.label}
                  </span>{" "}
                  has {organization.count} assignment/removal event
                  {organization.count === 1 ? "" : "s"}.
                </p>
              ))}
            {auditObservability.summary.organizationsWithRecentAssignmentActivity
              .length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">
                No organization assignment/removal activity is loaded yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Assignment source
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(auditObservability.summary.eventsByAssignmentSource).map(
              ([source, count]) => (
                <span
                  key={source}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {source.replace(/_/g, " ")}: {count}
                </span>
              )
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Audit context checks
          </p>
          {auditObservability.summary.missingContextIssues.length > 0 ? (
            <div className="mt-3 space-y-2">
              {auditObservability.summary.missingContextIssues
                .slice(0, 4)
                .map((issue) => (
                  <p key={issue.id} className="text-sm leading-6 text-amber-800">
                    {issue.message}
                  </p>
                ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Loaded audit events include expected group and organization context.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractorGroupAuditHistoryPanel({
  timeline,
  selectedAuditEventType,
  selectedStatus,
  selectedType,
  selectedOrganizationId
}: {
  timeline: ContractorGroupAuditTimeline;
  selectedAuditEventType: string;
  selectedStatus: string;
  selectedType: string;
  selectedOrganizationId: string | null;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Audit history</p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only durable audit-event storage for contractor group lifecycle
            and assignment history. This evidence does not enforce entitlements,
            permissions, pricing, starter-pack provisioning, or runtime behavior.
            Export and retention tooling is planned; audit events are platform
            evidence and should not be manually deleted.
          </p>
        </div>
        <div className="grid min-w-[17rem] grid-cols-3 gap-2">
          <SummaryTile label="Audit events" value={timeline.summary.totalEvents} />
          <SummaryTile
            label="Assignment events"
            value={timeline.summary.assignmentEvents}
          />
          <SummaryTile
            label="Lifecycle events"
            value={timeline.summary.groupLifecycleEvents}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Recent durable events
            </p>
            <form action="/super-admin/groups" className="flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="groupStatus" value={selectedStatus} />
              <input type="hidden" name="groupType" value={selectedType} />
              {selectedOrganizationId ? (
                <input
                  type="hidden"
                  name="organizationId"
                  value={selectedOrganizationId}
                />
              ) : null}
              <select
                name="auditEventType"
                defaultValue={selectedAuditEventType}
                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              >
                <option value="all">All event types</option>
                {auditEventTypes.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventTypeLabel(eventType)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Filter events
              </button>
            </form>
          </div>
          <div className="mt-3 space-y-3">
            {timeline.events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${auditEventChipClassName(
                      event.eventType
                    )}`}
                  >
                    {event.label}
                  </span>
                  {event.contractorGroupName || event.contractorGroupKey ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
                      {event.contractorGroupName ?? event.contractorGroupKey}
                    </span>
                  ) : null}
                  {event.organizationName || event.organizationSlug ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
                      {event.organizationName ?? event.organizationSlug}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {event.detail}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {dateLabel(event.occurredAt)}
                  {event.assignmentSource
                    ? ` · ${event.assignmentSource.replace(/_/g, " ")}`
                    : ""}
                  {event.actorUserId ? ` · actor ${event.actorUserId}` : ""}
                </p>
                {event.reason ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Reason: {event.reason}
                  </p>
                ) : null}
                {event.metadataSummary.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.metadataSummary.map((metadataItem) => (
                      <span
                        key={metadataItem}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {metadataItem}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {timeline.events.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                No durable contractor group audit events exist yet. New group
                management actions append events through transaction-aware
                server RPCs once the audit-write migration is applied; older
                pre-audit changes may still appear only in the inferred readiness
                panel.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {timeline.caveats.map((caveat) => (
            <p
              key={caveat}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
            >
              {caveat}
            </p>
          ))}
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Audit writes are intentionally not used for assignment automation,
            entitlements, pricing, starter-pack auto-provisioning, or contractor
            permission changes.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrganizationGroupPanel({
  tenants,
  selectedOrganizationId,
  organizationSummary,
  auditOrganizationSummary
}: {
  tenants: TenantOption[];
  selectedOrganizationId: string | null;
  organizationSummary: ContractorGroupObservabilityOrganizationSummary | null;
  auditOrganizationSummary:
    | ContractorGroupAuditObservability["organizationSummaries"][number]
    | null;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Groups for selected contractor
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Organization-centric read model only. Membership does not change
            permissions, entitlements, pricing, or starter-pack provisioning.
          </p>
        </div>
        <form action="/super-admin/groups" className="w-full max-w-md">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Contractor organization
            </span>
            <select
              name="organizationId"
              defaultValue={selectedOrganizationId ?? ""}
              className={inputClassName()}
            >
              <option value="">Select organization</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {organizationLabel(tenant)} ({tenant.tenant_status})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-3 inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Inspect groups
          </button>
        </form>
      </div>

      {organizationSummary ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-950">
              {organizationSummary.organization.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {organizationSummary.activeGroupCount} active ·{" "}
              {organizationSummary.inactiveGroupCount} inactive ·{" "}
              {organizationSummary.archivedGroupCount} archived groups
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {organizationSummary.groups.map((group) => (
                <span
                  key={group.membershipId}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassName(
                    group.status
                  )}`}
                >
                  {group.name} · {group.status}
                </span>
              ))}
              {organizationSummary.groups.length === 0 ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  No groups assigned
                </span>
              ) : null}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Future starter-pack references
            </p>
            <StarterPackReferenceList
              references={organizationSummary.starterPackAssignmentReferences}
            />
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Organization audit history
            </p>
            {auditOrganizationSummary ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-[0.35fr_0.65fr]">
                <div className="space-y-2 text-sm leading-6 text-slate-600">
                  <p>
                    {auditOrganizationSummary.totalEvents} durable event
                    {auditOrganizationSummary.totalEvents === 1 ? "" : "s"} ·{" "}
                    {auditOrganizationSummary.assignmentEventCount} assignment/removal ·{" "}
                    {auditOrganizationSummary.removalEventCount} removal.
                  </p>
                  <p>Last event: {dateLabel(auditOrganizationSummary.lastEventAt)}</p>
                  <p>{auditOrganizationSummary.note}</p>
                </div>
                <div className="space-y-2">
                  {auditOrganizationSummary.timeline.slice(0, 4).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {event.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {dateLabel(event.occurredAt)} ·{" "}
                        {event.contractorGroupName ?? event.contractorGroupKey ?? "group context unavailable"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                No durable assignment/removal audit events are loaded for this
                organization.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Select an organization to inspect group membership and future
          starter-pack targeting references.
        </p>
      )}
    </div>
  );
}

export function ContractorGroupManager({
  groups,
  tenants,
  observability,
  assignmentAuditReadiness,
  assignmentProposals,
  auditObservability,
  auditTimeline,
  selectedStatus,
  selectedType,
  selectedOrganizationId,
  selectedAuditEventType,
  selectedProposalStatus,
  selectedProposalConfidence,
  selectedProposalGroupType
}: ContractorGroupManagerProps) {
  const normalizedStatusFilter = normalizeStatusFilter(selectedStatus);
  const normalizedTypeFilter = normalizeTypeFilter(selectedType);
  const normalizedProposalStatusFilter =
    normalizeProposalStatusFilter(selectedProposalStatus);
  const normalizedProposalConfidenceFilter = normalizeProposalConfidenceFilter(
    selectedProposalConfidence
  );
  const normalizedProposalGroupTypeFilter = normalizeTypeFilter(
    selectedProposalGroupType
  );
  const filteredGroups = groups.filter((group) => {
    const statusMatches =
      normalizedStatusFilter === "all" || group.status === normalizedStatusFilter;
    const typeMatches =
      normalizedTypeFilter === "all" || group.groupType === normalizedTypeFilter;

    return statusMatches && typeMatches;
  });
  const selectedOrganizationSummary =
    observability.organizationSummaries.find(
      (summary) => summary.organization.id === selectedOrganizationId
    ) ?? null;
  const selectedAuditOrganizationSummary =
    auditObservability.organizationSummaries.find(
      (summary) => summary.organizationId === selectedOrganizationId
    ) ?? null;

  return (
    <section id="contractor-groups" className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total groups" value={observability.summary.totalGroups} />
        <SummaryTile label="Active" value={observability.summary.activeGroups} />
        <SummaryTile label="Inactive" value={observability.summary.inactiveGroups} />
        <SummaryTile label="Archived" value={observability.summary.archivedGroups} />
        <SummaryTile
          label="Memberships"
          value={observability.summary.totalMemberships}
        />
        <SummaryTile
          label="No-group orgs"
          value={observability.summary.organizationsAssignedToNoGroups.length}
        />
      </div>

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">
          Platform segmentation only
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Contractor groups do not affect contractor permissions, module access,
          entitlements, pricing, starter-pack provisioning, tax behavior, or runtime
          workflow decisions. They are platform-governed classification metadata for
          operator planning and previews.
        </p>
      </div>

      <ObservabilitySection observability={observability} />

      <AssignmentAuditReadinessPanel readiness={assignmentAuditReadiness} />

      <AssignmentProposalsPanel
        proposals={assignmentProposals}
        tenants={tenants}
        selectedOrganizationId={selectedOrganizationId}
        selectedProposalStatus={normalizedProposalStatusFilter}
        selectedProposalConfidence={normalizedProposalConfidenceFilter}
        selectedProposalGroupType={normalizedProposalGroupTypeFilter}
        selectedGroupStatus={normalizedStatusFilter}
        selectedGroupType={normalizedTypeFilter}
        selectedAuditEventType={selectedAuditEventType}
      />

      <ContractorGroupAuditObservabilityPanel
        auditObservability={auditObservability}
      />

      <ContractorGroupAuditHistoryPanel
        timeline={auditTimeline}
        selectedAuditEventType={selectedAuditEventType}
        selectedStatus={normalizedStatusFilter}
        selectedType={normalizedTypeFilter}
        selectedOrganizationId={selectedOrganizationId}
      />

      <ContractorGroupFilters
        selectedStatus={normalizedStatusFilter}
        selectedType={normalizedTypeFilter}
      />

      <OrganizationGroupPanel
        tenants={tenants}
        selectedOrganizationId={selectedOrganizationId}
        organizationSummary={selectedOrganizationSummary}
        auditOrganizationSummary={selectedAuditOrganizationSummary}
      />

      <GroupMetadataForm />

      <div className="space-y-5">
        {filteredGroups.map((group) => {
          const groupDetail = observability.groupDetails.find(
            (detail) => detail.group.id === group.id
          );
          const groupAuditSummary = auditObservability.groupSummaries.find(
            (summary) => summary.groupId === group.id
          );

          return (
            <article
              key={group.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
            >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassName(
                      group.status
                    )}`}
                  >
                    {group.status}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {groupTypeLabel(group.groupType)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {group.membershipCount} orgs
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-950">
                  {group.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {group.key}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {group.description ??
                    "No description. Add operator context before using this group in targeting previews."}
                </p>
              </div>
              {group.status !== "archived" ? (
                <form
                  action={archiveContractorGroupAction}
                  aria-label={`Archive contractor group ${group.name}`}
                  data-contractor-group-key={group.key}
                  data-testid="contractor-group-archive-form"
                >
                  <input type="hidden" name="contractorGroupId" value={group.id} />
                  <button
                    type="submit"
                    aria-label={`Archive contractor group ${group.name}`}
                    className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Archive group
                  </button>
                </form>
              ) : null}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <GroupMetadataForm group={group} />
              <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Organization assignments
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Manual assignments make future targeting previews inspectable.
                    They are not tenant roles and do not grant app permissions.
                  </p>
                </div>
                <AssignmentForm group={group} tenants={tenants} />
                <MembershipList group={group} />
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Starter-pack assignment references
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Read-only references where assignment intent targets this group key.
                These references do not auto-provision or enforce runtime behavior.
              </p>
              <div className="mt-4">
                <StarterPackReferenceList
                  references={
                    groupDetail?.starterPackAssignmentReferences ?? []
                  }
                />
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Group audit summary
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Read-only durable activity for this group. Current membership
                    count and historical removal events are intentionally shown as
                    separate facts.
                  </p>
                </div>
                <div className="grid min-w-[18rem] grid-cols-3 gap-2">
                  <SummaryTile
                    label="Events"
                    value={groupAuditSummary?.totalEvents ?? 0}
                  />
                  <SummaryTile
                    label="Assign/remove"
                    value={groupAuditSummary?.assignmentEventCount ?? 0}
                  />
                  <SummaryTile
                    label="Current members"
                    value={groupAuditSummary?.currentMembershipCount ?? 0}
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-[0.7fr_0.3fr]">
                <div className="space-y-2">
                  {(groupAuditSummary?.timeline ?? []).slice(0, 4).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {event.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {dateLabel(event.occurredAt)}
                        {event.organizationName || event.organizationSlug
                          ? ` · ${event.organizationName ?? event.organizationSlug}`
                          : ""}
                        {event.actorUserId ? ` · actor ${event.actorUserId}` : ""}
                      </p>
                    </div>
                  ))}
                  {(groupAuditSummary?.timeline ?? []).length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                      No durable audit events are loaded for this group.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {(groupAuditSummary?.caveats ?? []).map((caveat) => (
                    <p
                      key={caveat}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800"
                    >
                      {caveat}
                    </p>
                  ))}
                  <p className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                    Last event: {dateLabel(groupAuditSummary?.lastEventAt)}
                  </p>
                </div>
              </div>
            </div>
            </article>
          );
        })}

        {groups.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
            No contractor groups exist yet. Create the first platform segmentation
            group before using contractor-group targeting previews.
          </div>
        ) : null}
        {groups.length > 0 && filteredGroups.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
            No contractor groups match the selected read-only filters.
          </div>
        ) : null}
      </div>
    </section>
  );
}
