import type { ContractorGroup } from "@floorconnector/types";

import {
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
};

function inputClassName() {
  return "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100";
}

function groupTypeLabel(type: ContractorGroup["groupType"]) {
  return type.replace(/_/g, " ");
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

function GroupMetadataForm({ group }: { group?: ContractorGroup }) {
  return (
    <form
      action={upsertContractorGroupAction}
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
    <form action={assignContractorGroupMembershipAction} className="space-y-3">
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
          <form action={removeContractorGroupMembershipAction}>
            <input type="hidden" name="membershipId" value={membership.id} />
            <button
              type="submit"
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

export function ContractorGroupManager({
  groups,
  tenants
}: ContractorGroupManagerProps) {
  const activeCount = groups.filter((group) => group.status === "active").length;
  const assignedOrganizationCount = new Set(
    groups.flatMap((group) =>
      group.memberships.map((membership) => membership.organizationId)
    )
  ).size;

  return (
    <section id="contractor-groups" className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xl font-semibold text-slate-950">{groups.length}</p>
          <p className="text-xs text-slate-500">Total groups</p>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xl font-semibold text-slate-950">{activeCount}</p>
          <p className="text-xs text-slate-500">Active groups</p>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xl font-semibold text-slate-950">
            {assignedOrganizationCount}
          </p>
          <p className="text-xs text-slate-500">Organizations assigned</p>
        </div>
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

      <GroupMetadataForm />

      <div className="space-y-5">
        {groups.map((group) => (
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
                <form action={archiveContractorGroupAction}>
                  <input type="hidden" name="contractorGroupId" value={group.id} />
                  <button
                    type="submit"
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
          </article>
        ))}

        {groups.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
            No contractor groups exist yet. Create the first platform segmentation
            group before using contractor-group targeting previews.
          </div>
        ) : null}
      </div>
    </section>
  );
}
