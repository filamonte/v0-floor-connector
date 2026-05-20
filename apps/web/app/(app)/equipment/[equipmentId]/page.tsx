import { notFound } from "next/navigation";
import Link from "next/link";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { EquipmentAssetForm } from "@/components/equipment-asset-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { updateEquipmentAssetAction } from "@/lib/equipment/actions";
import {
  getEquipmentAssetById,
  listEquipmentAssignmentsByAsset,
  listEquipmentVendorOptions
} from "@/lib/equipment/data";

type EquipmentDetailPageProps = {
  params: Promise<{
    equipmentId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
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

function formatDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatCurrency(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value));
}

export default async function EquipmentDetailPage({
  params,
  searchParams
}: EquipmentDetailPageProps) {
  const { equipmentId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [asset, assetAssignments, vendorOptions] = await Promise.all([
    getEquipmentAssetById(equipmentId, `/equipment/${equipmentId}`),
    listEquipmentAssignmentsByAsset(equipmentId, `/equipment/${equipmentId}`),
    listEquipmentVendorOptions()
  ]);

  if (!asset) {
    notFound();
  }

  const vendorName =
    vendorOptions.find((vendor) => vendor.id === asset.vendorId)?.name ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="rounded-[8px] border border-[#d6d6d6] bg-white p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:p-10">
          <DetailPageHeader
            eyebrow="Equipment Registry"
            title={asset.name}
            description="Review the canonical equipment asset record. This first slice tracks identity, ownership, vendor context, and current status only."
            backHref="/equipment"
            backLabel="Back to equipment"
          />

          {resolvedSearchParams.error ? (
            <div className="mt-6 rounded-[6px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="mt-6 rounded-[6px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <div className="mt-8">
            <WorkspaceSummaryBand
              className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.95fr)]"
              items={[
                {
                  key: "asset-status",
                  label: "Registry status",
                  content: (
                    <ContextFactsList
                      items={[
                        {
                          label: "Operational status",
                          value: formatLabel(asset.operationalStatus)
                        },
                        {
                          label: "Active state",
                          value: asset.isActive ? "Active" : "Inactive"
                        },
                        {
                          label: "Asset tag",
                          value: asset.assetTag ?? "Not provided"
                        }
                      ]}
                    />
                  )
                },
                {
                  key: "asset-identity",
                  label: "Asset identity",
                  content: (
                    <ContextFactsList
                      items={[
                        {
                          label: "Type",
                          value:
                            equipmentTypeLabels[asset.equipmentType] ??
                            formatLabel(asset.equipmentType)
                        },
                        {
                          label: "Manufacturer / model",
                          value:
                            [asset.manufacturer, asset.model]
                              .filter(Boolean)
                              .join(" ") || "Not provided"
                        },
                        {
                          label: "Serial number",
                          value: asset.serialNumber ?? "Not provided"
                        }
                      ]}
                    />
                  )
                },
                {
                  key: "ownership",
                  label: "Ownership",
                  content: (
                    <ContextFactsList
                      items={[
                        {
                          label: "Ownership status",
                          value: formatLabel(asset.ownershipStatus)
                        },
                        {
                          label: "Vendor / rental source",
                          value: vendorName ?? "Not linked"
                        },
                        {
                          label: "Rental window",
                          value:
                            asset.rentalStartDate || asset.rentalEndDate
                              ? `${formatDate(asset.rentalStartDate)} - ${formatDate(
                                  asset.rentalEndDate
                                )}`
                              : "Not provided"
                        }
                      ]}
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
          <DetailPanel
            title="Asset Profile"
            description="This is the canonical registry record that future assignment, readiness, maintenance, document, and costing slices should attach to."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[6px] border border-[#d6d6d6] bg-[#f8f8f8] px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Identity</p>
                <div className="mt-4">
                  <ContextFactsList
                    items={[
                      {
                        label: "Year",
                        value: asset.year ? String(asset.year) : "Not provided"
                      },
                      {
                        label: "Purchase date",
                        value: formatDate(asset.purchaseDate)
                      },
                      {
                        label: "Purchase cost",
                        value: formatCurrency(asset.purchaseCost)
                      }
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-[6px] border border-[#d6d6d6] bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Registry notes
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {asset.notes ?? "No internal notes have been added yet."}
                </p>
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Edit Equipment"
            description="Keep the registry asset accurate without creating assignment, maintenance, or costing behavior in this slice."
          >
            <EquipmentAssetForm
              action={updateEquipmentAssetAction}
              submitLabel="Save equipment"
              pendingLabel="Saving equipment..."
              asset={asset}
              vendorOptions={vendorOptions}
            />
          </DetailPanel>
        </div>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Current Assignments"
          description="Recent job assignment rows are shown for visibility only. Maintenance, utilization, costing, and readiness gates are still deferred."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            {assetAssignments.length > 0 ? (
              assetAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-[6px] border border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4"
                >
                  <p className="font-semibold text-slate-950">
                    <Link
                      href={`/jobs/${assignment.jobId}`}
                      className="hover:text-[var(--copper)]"
                    >
                      Job assignment
                    </Link>
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {formatLabel(assignment.assignmentStatus)}
                  </p>
                  <p className="mt-2">
                    {assignment.assignedDate
                      ? formatDate(assignment.assignedDate)
                      : assignment.scheduledStartAt
                        ? new Date(assignment.scheduledStartAt).toLocaleString()
                        : "No assignment window set"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[6px] border border-dashed border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4">
                No job assignments are attached to this equipment yet.
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Planned Later"
          description="These workflows are intentionally deferred so this foundation stays bounded."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <div className="rounded-[6px] border border-dashed border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4">
              Maintenance, inspection, calibration, and service records are not
              tracked yet.
            </div>
            <div className="rounded-[6px] border border-dashed border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4">
              Utilization, equipment hours, job costing, and warranty/service
              usage are not tracked yet.
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Registry Guardrail"
          description="Equipment is an asset spine, not a separate scheduling, vendor, people, or accounting model."
        >
          <p className="text-sm leading-7 text-slate-600">
            Future work should attach assignments, documents, maintenance, field
            usage, warranty/service, and costing to this record while preserving
            the existing project, job, vendor, people, and financial sources of
            truth.
          </p>
        </DetailPanel>
      </aside>
    </div>
  );
}
