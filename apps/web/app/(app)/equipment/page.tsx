import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { EquipmentAssetForm } from "@/components/equipment-asset-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { createEquipmentAssetAction } from "@/lib/equipment/actions";
import { listEquipmentVendorOptions } from "@/lib/equipment/data";
import {
  getEquipmentManagerReadModel,
  isEquipmentManagerView
} from "@/lib/equipment/manager-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type EquipmentPageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    view?: "all" | "available" | "rented" | "maintenance" | "inactive";
  }>;
};

const equipmentTypeLabels: Record<string, string> = {
  grinder: "Grinder",
  polisher: "Polisher",
  vacuum: "Vacuum",
  dust_collector: "Dust collector",
  shot_blaster: "Shot blaster",
  scarifier: "Scarifier",
  scraper: "Floor scraper",
  mixer: "Mixer",
  sprayer: "Sprayer",
  trailer: "Trailer",
  truck: "Truck",
  generator: "Generator",
  moisture_meter: "Moisture meter",
  testing_tool: "Testing tool",
  coating_tool: "Coating tool",
  burnisher: "Burnisher",
  hand_tool: "Hand tool",
  kit: "Kit",
  other: "Other"
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function buildEquipmentHref(input: {
  q?: string;
  view?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/equipment?${query}` : "/equipment";
}

export default async function EquipmentPage({
  searchParams
}: EquipmentPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/equipment");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Equipment records need an active organization before they can be
        created. Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const view = isEquipmentManagerView(resolvedSearchParams.view)
    ? resolvedSearchParams.view
    : "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const [readModel, vendorOptions] = await Promise.all([
    getEquipmentManagerReadModel({
      organizationId: organizationContext.organization.id,
      view,
      query
    }),
    listEquipmentVendorOptions()
  ]);
  const equipmentViews = [
    { key: "all", label: "All assets", count: readModel.counts.all },
    { key: "available", label: "Available", count: readModel.counts.available },
    { key: "rented", label: "Rented", count: readModel.counts.rented },
    {
      key: "maintenance",
      label: "Maintenance",
      count: readModel.counts.maintenance
    },
    { key: "inactive", label: "Inactive", count: readModel.counts.inactive }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Equipment"
      title={`Equipment registry for ${organizationContext.organization.displayName}`}
      description="Create the canonical asset spine for owned and rented equipment without adding assignment, maintenance, readiness, utilization, or costing workflows yet."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.all}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Available
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.available}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Rented
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.rented}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Maintenance
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.maintenance}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search by asset name, tag, serial, model, type, ownership, or
            status. Assignment and readiness stay out of this first registry
            slice.
          </p>
        ),
        searchSlot: (
          <form action="/equipment" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? (
              <input type="hidden" name="view" value={view} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name, tag, serial, model, type, or status"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" || showComposer ? (
              <Link
                href="/equipment"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: equipmentViews.map((equipmentView) => {
          const isActive = view === equipmentView.key;

          return (
            <Link
              key={equipmentView.key}
              href={buildEquipmentHref({
                q: query,
                view: equipmentView.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{equipmentView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {equipmentView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildEquipmentHref({ q: query, view, compose: "1" }) +
              "#equipment-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New equipment
          </Link>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_420px]"
            : "space-y-4"
        }
      >
        <section className="space-y-6">
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
                <div className="hidden grid-cols-[minmax(0,1.2fr)_170px_170px_190px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Equipment</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span className="text-right">Ownership</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Equipment assets
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {readModel.assets.length === readModel.matchingCount
                    ? `${readModel.assets.length} visible`
                    : `Showing ${readModel.assets.length} of ${readModel.matchingCount}`}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {readModel.assets.length > 0 ? (
                readModel.assets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/equipment/${asset.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_170px_170px_190px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-[#b86a2c]">
                          {asset.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {asset.assetTag
                            ? `Tag ${asset.assetTag}`
                            : asset.serialNumber
                              ? `Serial ${asset.serialNumber}`
                              : "No asset tag or serial number"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {asset.vendorId
                            ? (readModel.vendorNameById.get(asset.vendorId) ??
                              "Linked vendor")
                            : "No linked vendor"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Type
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {equipmentTypeLabels[asset.equipmentType] ??
                            formatLabel(asset.equipmentType)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {[asset.manufacturer, asset.model]
                            .filter(Boolean)
                            .join(" ") || "No make/model"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatLabel(asset.operationalStatus)}
                        </span>
                        {!asset.isActive ? (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Inactive registry record
                          </p>
                        ) : null}
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Ownership
                        </p>
                        <p className="text-sm font-medium capitalize text-slate-700">
                          {formatLabel(asset.ownershipStatus)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Updated{" "}
                          {new Date(asset.updatedAt).toLocaleDateString()}
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
                        ? "No matching equipment"
                        : "No equipment yet"
                    }
                    title={
                      readModel.counts.all > 0
                        ? "Adjust the equipment filters"
                        : "Create the first equipment asset"
                    }
                    description={
                      readModel.counts.all > 0
                        ? "Try a broader search or switch views to find the asset you need."
                        : "Start with the canonical equipment registry. Assignment, readiness, maintenance, utilization, and costing come later on this same asset spine."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="equipment-create"
          title="Create equipment"
          description="Add an owned, rented, leased, or subcontractor-owned asset inside the active organization."
          open={showComposer}
          openHref={
            buildEquipmentHref({ q: query, view, compose: "1" }) +
            "#equipment-create"
          }
          closeHref={buildEquipmentHref({ q: query, view })}
          openLabel="Open equipment composer"
        >
          <EquipmentAssetForm
            action={createEquipmentAssetAction}
            submitLabel="Create equipment"
            pendingLabel="Creating equipment..."
            vendorOptions={vendorOptions}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
