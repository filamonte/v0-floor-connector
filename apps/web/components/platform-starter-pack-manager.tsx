import type {
  PlatformCatalogItemSeed,
  PlatformStarterPack,
  PlatformStarterPackAssignment,
  PlatformStarterPackAssignmentType,
  PlatformTemplateSeed
} from "@floorconnector/types";

import {
  addCatalogSeedToStarterPackAction,
  addTemplateSeedToStarterPackAction,
  removeStarterPackAssignmentAction,
  removeStarterPackItemAction,
  upsertPlatformStarterPackAction,
  upsertStarterPackAssignmentAction
} from "@/lib/platform-admin/actions";

type TenantOption = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  tenant_status: string;
};

type PlatformStarterPackManagerProps = {
  packs: PlatformStarterPack[];
  templateSeeds: PlatformTemplateSeed[];
  catalogSeeds: PlatformCatalogItemSeed[];
  tenants: TenantOption[];
};

function statusLabel(status: PlatformStarterPack["status"]) {
  switch (status) {
    case "published":
      return "Published";
    case "archived":
      return "Archived";
    default:
      return "Draft";
  }
}

function seedLabel(seed: PlatformTemplateSeed | PlatformCatalogItemSeed) {
  return `${seed.name} (${seed.seedKey})`;
}

function assignmentTypeLabel(type: PlatformStarterPackAssignmentType) {
  switch (type) {
    case "all_organizations":
      return "All organizations";
    case "organization":
      return "Specific organization";
    case "onboarding_profile":
      return "Onboarding profile";
    case "region":
      return "Region / state";
    case "trade_segment":
      return "Trade segment";
    case "plan_tier":
      return "Plan tier";
    case "future_contractor_group":
      return "Contractor group";
    default:
      return type;
  }
}

function assignmentStatusLabel(status: PlatformStarterPackAssignment["status"]) {
  switch (status) {
    case "active":
      return "Active intent";
    case "inactive":
      return "Inactive intent";
    default:
      return "Draft intent";
  }
}

function inputClassName() {
  return "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100";
}

function assignmentTargetLabel(assignment: PlatformStarterPackAssignment) {
  if (assignment.assignmentType === "all_organizations") {
    return "All contractor organizations";
  }

  if (assignment.assignmentType === "organization") {
    return (
      assignment.organizationName ??
      assignment.organizationSlug ??
      assignment.organizationId ??
      "Organization target"
    );
  }

  return assignment.label ?? assignment.assignmentKey ?? "Unlabeled target";
}

function StarterPackMetadataForm({ pack }: { pack?: PlatformStarterPack }) {
  return (
    <form
      action={upsertPlatformStarterPackAction}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
    >
      {pack ? <input type="hidden" name="packId" value={pack.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Name</span>
          <input
            name="name"
            defaultValue={pack?.name ?? ""}
            placeholder="Residential Epoxy Starter Pack"
            required
            className={inputClassName()}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Pack key</span>
          <input
            name="packKey"
            defaultValue={pack?.packKey ?? ""}
            placeholder="residential-epoxy"
            required
            className={inputClassName()}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
          <select
            name="status"
            defaultValue={pack?.status ?? "draft"}
            className={inputClassName()}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Segment key
          </span>
          <input
            name="segmentKey"
            defaultValue={pack?.segmentKey ?? ""}
            placeholder="residential"
            className={inputClassName()}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Description
        </span>
        <textarea
          name="description"
          defaultValue={pack?.description ?? ""}
          rows={3}
          placeholder="Governed grouping of existing platform starter seeds."
          className={inputClassName()}
        />
      </label>
      <button
        type="submit"
        className="mt-5 inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        {pack ? "Save pack metadata" : "Create starter pack"}
      </button>
    </form>
  );
}

function AddTemplateSeedForm({
  pack,
  templateSeeds
}: {
  pack: PlatformStarterPack;
  templateSeeds: PlatformTemplateSeed[];
}) {
  const includedIds = new Set(
    pack.items
      .map((item) => item.templateSeedId)
      .filter((seedId): seedId is string => Boolean(seedId))
  );
  const availableSeeds = templateSeeds.filter((seed) => !includedIds.has(seed.id));

  return (
    <form action={addTemplateSeedToStarterPackAction} className="space-y-3">
      <input type="hidden" name="starterPackId" value={pack.id} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Add template seed
        </span>
        <select name="templateSeedId" className={inputClassName()} required>
          <option value="">Select existing platform template seed</option>
          {availableSeeds.map((seed) => (
            <option key={seed.id} value={seed.id}>
              {seed.templateType} - {seedLabel(seed)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <input
          type="checkbox"
          name="isRequired"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
        />
        <span className="text-sm text-slate-700">
          Mark required inside this governed pack
        </span>
      </label>
      <button
        type="submit"
        disabled={availableSeeds.length === 0}
        className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add template seed
      </button>
    </form>
  );
}

function AddCatalogSeedForm({
  pack,
  catalogSeeds
}: {
  pack: PlatformStarterPack;
  catalogSeeds: PlatformCatalogItemSeed[];
}) {
  const includedIds = new Set(
    pack.items
      .map((item) => item.catalogSeedId)
      .filter((seedId): seedId is string => Boolean(seedId))
  );
  const availableSeeds = catalogSeeds.filter((seed) => !includedIds.has(seed.id));

  return (
    <form action={addCatalogSeedToStarterPackAction} className="space-y-3">
      <input type="hidden" name="starterPackId" value={pack.id} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Add catalog seed
        </span>
        <select name="catalogSeedId" className={inputClassName()} required>
          <option value="">Select existing platform catalog seed</option>
          {availableSeeds.map((seed) => (
            <option key={seed.id} value={seed.id}>
              {seed.itemType} - {seedLabel(seed)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <input
          type="checkbox"
          name="isRequired"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
        />
        <span className="text-sm text-slate-700">
          Mark required inside this governed pack
        </span>
      </label>
      <button
        type="submit"
        disabled={availableSeeds.length === 0}
        className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add catalog seed
      </button>
    </form>
  );
}

function StarterPackItemList({ pack }: { pack: PlatformStarterPack }) {
  if (pack.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        No seeds are grouped in this pack yet. Add existing platform template or
        catalog seeds below. Nothing will be copied into contractor organizations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pack.items.map((item) => {
        const seed = item.templateSeed ?? item.catalogSeed;
        const seedType =
          item.itemType === "template_seed" ? "Template seed" : "Catalog seed";

        return (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {seedType}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {item.isRequired ? "Required" : "Recommended"}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {seed?.name ?? "Missing seed reference"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Sort {item.sortOrder} - governed pack membership only
              </p>
            </div>
            <form action={removeStarterPackItemAction}>
              <input type="hidden" name="itemId" value={item.id} />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Remove
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}

function StarterPackAssignmentList({ pack }: { pack: PlatformStarterPack }) {
  if (pack.assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        No assignment intent has been captured for this pack yet. Assignment
        rows are planning-only and do not provision contractor-owned records.
      </div>
    );
  }

  const assignmentTypes = Array.from(
    new Set(pack.assignments.map((assignment) => assignment.assignmentType))
  );

  return (
    <div className="space-y-4">
      {assignmentTypes.map((assignmentType) => {
        const assignments = pack.assignments.filter(
          (assignment) => assignment.assignmentType === assignmentType
        );

        return (
          <section key={assignmentType} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-950">
                {assignmentTypeLabel(assignmentType)}
              </h4>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {assignments.length} intent{assignments.length === 1 ? "" : "s"}
              </span>
            </div>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {assignmentStatusLabel(assignment.status)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Planning only
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {assignmentTargetLabel(assignment)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {assignment.assignmentKey
                        ? `Target key: ${assignment.assignmentKey}`
                        : "No target key required for this assignment type."}
                    </p>
                    {assignment.notes ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {assignment.notes}
                      </p>
                    ) : null}
                  </div>
                  <form action={removeStarterPackAssignmentAction}>
                    <input
                      type="hidden"
                      name="assignmentId"
                      value={assignment.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Remove intent
                    </button>
                  </form>
                </div>
                <form
                  action={upsertStarterPackAssignmentAction}
                  className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <input
                    type="hidden"
                    name="assignmentId"
                    value={assignment.id}
                  />
                  <input
                    type="hidden"
                    name="starterPackId"
                    value={pack.id}
                  />
                  <input
                    type="hidden"
                    name="assignmentType"
                    value={assignment.assignmentType}
                  />
                  <input
                    type="hidden"
                    name="organizationId"
                    value={assignment.organizationId ?? ""}
                  />
                  <input
                    type="hidden"
                    name="assignmentKey"
                    value={assignment.assignmentKey ?? ""}
                  />
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">
                      Label
                    </span>
                    <input
                      name="label"
                      defaultValue={assignment.label ?? ""}
                      className={inputClassName()}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">
                      Notes
                    </span>
                    <input
                      name="notes"
                      defaultValue={assignment.notes ?? ""}
                      className={inputClassName()}
                    />
                  </label>
                  <label className="block min-w-40">
                    <span className="mb-2 block text-xs font-medium text-slate-700">
                      Status
                    </span>
                    <select
                      name="status"
                      defaultValue={assignment.status}
                      className={inputClassName()}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="h-9 self-end rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:col-start-3"
                  >
                    Save intent
                  </button>
                </form>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function AddAssignmentIntentForm({
  pack,
  tenants
}: {
  pack: PlatformStarterPack;
  tenants: TenantOption[];
}) {
  return (
    <form
      action={upsertStarterPackAssignmentAction}
      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
    >
      <input type="hidden" name="starterPackId" value={pack.id} />
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Assignment type
          </span>
          <select
            name="assignmentType"
            defaultValue="all_organizations"
            className={inputClassName()}
          >
            <option value="all_organizations">All organizations</option>
            <option value="organization">Specific organization</option>
            <option value="onboarding_profile">Onboarding profile</option>
            <option value="region">Region / state</option>
            <option value="trade_segment">Trade segment</option>
            <option value="plan_tier">Plan tier</option>
            <option value="future_contractor_group">
              Contractor group
            </option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Organization target
          </span>
          <select name="organizationId" defaultValue="" className={inputClassName()}>
            <option value="">Only for specific organization assignments</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.display_name || tenant.legal_name} ({tenant.tenant_status})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Target key
          </span>
          <input
            name="assignmentKey"
            placeholder="TX, commercial-polishing, pro"
            className={inputClassName()}
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Label
          </span>
          <input
            name="label"
            placeholder="Texas contractors"
            className={inputClassName()}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select name="status" defaultValue="draft" className={inputClassName()}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Notes
          </span>
          <input
            name="notes"
            placeholder="Planning rationale"
            className={inputClassName()}
          />
        </label>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        For all-organizations intent, leave organization and target key empty.
        For organization intent, select a tenant. For region, trade segment,
          onboarding profile, plan tier, or contractor group intent, enter a
          target key. For contractor groups, use the platform group key. These rows
          do not provision or enforce anything.
      </p>
      <button
        type="submit"
        className="mt-4 inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Add assignment intent
      </button>
    </form>
  );
}

export function PlatformStarterPackManager({
  packs,
  templateSeeds,
  catalogSeeds,
  tenants
}: PlatformStarterPackManagerProps) {
  return (
    <section id="starter-packs" className="space-y-5 scroll-mt-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Starter Packs
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Governed bundles over existing platform seeds
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          Starter packs group existing platform template seeds and platform
          catalog seeds for platform governance. They do not auto-provision
          contractor organizations, change adoption behavior, or affect estimate,
          invoice, contract, catalog, tax, entitlement, or runtime workflows.
          Assignment intent below only records who a pack may target later.
        </p>
      </div>

      <StarterPackMetadataForm />

      {packs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-6 text-sm leading-6 text-slate-600">
          No starter packs exist yet. Create a draft pack, then attach existing
          platform template and catalog seeds.
        </div>
      ) : (
        <div className="space-y-5">
          {packs.map((pack) => (
            <article
              key={pack.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {statusLabel(pack.status)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {pack.packKey}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">
                    {pack.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {pack.description ??
                      "Platform-managed starter pack without a description yet."}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-lg font-semibold text-slate-950">
                      {pack.templateSeedCount}
                    </p>
                    <p className="text-xs text-slate-500">Template seeds</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-lg font-semibold text-slate-950">
                      {pack.catalogSeedCount}
                    </p>
                    <p className="text-xs text-slate-500">Catalog seeds</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-lg font-semibold text-slate-950">
                      {pack.assignmentCount}
                    </p>
                    <p className="text-xs text-slate-500">Assignment intents</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <StarterPackMetadataForm pack={pack} />
              </div>

              <div className="mt-5">
                <StarterPackItemList pack={pack} />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <AddTemplateSeedForm pack={pack} templateSeeds={templateSeeds} />
                <AddCatalogSeedForm pack={pack} catalogSeeds={catalogSeeds} />
              </div>

              <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Assignment intent
                  </p>
                  <h4 className="mt-2 text-sm font-semibold text-slate-950">
                    Planning-only starter pack audience
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    These rows describe who this pack is meant for in a future
                    provisioning phase. They do not copy templates or catalog
                    items, change contractor defaults, enforce entitlements, or
                    affect estimate/catalog behavior.
                  </p>
                </div>
                <StarterPackAssignmentList pack={pack} />
                <AddAssignmentIntentForm pack={pack} tenants={tenants} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
