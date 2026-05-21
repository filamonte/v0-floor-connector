import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { DirectoryContextCard } from "@/components/directory-context-card";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { VendorForm } from "@/components/vendor-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listComplianceRecordsBySubject } from "@/lib/compliance/data";
import { listPeople } from "@/lib/people/data";
import { updateVendorAction } from "@/lib/vendors/actions";
import { getVendorById } from "@/lib/vendors/data";

type VendorDetailPageProps = {
  params: Promise<{
    vendorId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatComplianceStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getComplianceStatusClasses(status: string) {
  switch (status) {
    case "valid":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "expiring":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "expired":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default async function VendorDetailPage({
  params,
  searchParams
}: VendorDetailPageProps) {
  const { vendorId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [vendor, complianceRecords, people] = await Promise.all([
    getVendorById(vendorId, `/vendors/${vendorId}`),
    listComplianceRecordsBySubject("vendor", vendorId, `/vendors/${vendorId}`),
    listPeople()
  ]);

  if (!vendor) {
    notFound();
  }

  const linkedWorkers = people.filter((person) => person.vendorId === vendor.id);
  const nextAction =
    linkedWorkers.length > 0
      ? {
          title: "Review linked workforce context",
          description:
            "This vendor already has workforce records attached, so the next operational check is whether labor-provider setup, worker identity, and compliance context all still line up cleanly.",
          href: `/people/${linkedWorkers[0].id}`,
          label: "Open linked worker"
        }
      : {
          title: "Keep the vendor foundation current",
          description:
            "This company record is ready for future subcontract labor and compliance use, even if no linked workers have been added yet."
        };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Vendor Review"
            title={vendor.name}
            description="Review the canonical external company record, its linked subcontractor workers, and current compliance visibility before deeper workforce operations build on top of it."
            backHref="/vendors"
            backLabel="Back to vendors"
          />

          {resolvedSearchParams.error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <div className="mt-8">
            <WorkspaceSummaryBand
              className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.95fr)]"
              items={[
                {
                  key: "company-role",
                  label: "Company role",
                  content: (
                    <ContextFactsList
                      items={[
                        {
                          label: "Vendor type",
                          value: vendor.vendorType
                        },
                        {
                          label: "Labor provider",
                          value: vendor.isLaborProvider ? "Yes" : "No"
                        },
                        {
                          label: "Active state",
                          value: vendor.isActive ? "Active" : "Inactive"
                        }
                      ]}
                    />
                  )
                },
                {
                  key: "next-action",
                  label: "Preferred next action",
                  content: (
                    <NextActionCard
                      eyebrow="Vendor guidance"
                      title={nextAction.title}
                      description={nextAction.description}
                      primaryAction={
                        "href" in nextAction && nextAction.href ? (
                          <Link
                            href={nextAction.href}
                            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                          >
                            {nextAction.label}
                          </Link>
                        ) : undefined
                      }
                    />
                  )
                },
                {
                  key: "connected-context",
                  label: "Connected context",
                  content: (
                    <ContextFactsList
                      items={[
                        {
                          label: "Linked workers",
                          value: `${linkedWorkers.length} worker${linkedWorkers.length === 1 ? "" : "s"}`
                        },
                        {
                          label: "Compliance records",
                          value: `${complianceRecords.length} record${complianceRecords.length === 1 ? "" : "s"}`
                        },
                        {
                          label: "Primary contact",
                          value: vendor.primaryContactName ?? vendor.email ?? "Not provided"
                        }
                      ]}
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
          <DetailPanel
            title="Vendor Profile"
            description="Review the canonical external company record here first. Editing stays available, but the company profile and connected workforce context should be easy to scan before making changes."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Contact and company</p>
                  <div className="mt-4">
                    <ContextFactsList
                      items={[
                        {
                          label: "Primary contact",
                          value: vendor.primaryContactName ?? "Not provided"
                        },
                        {
                          label: "Email",
                          value: vendor.email ?? "Not provided"
                        },
                        {
                          label: "Phone",
                          value: vendor.phone ?? "Not provided"
                        }
                      ]}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Business details</p>
                  <div className="mt-4">
                    <ContextFactsList
                      items={[
                        {
                          label: "Address",
                          value:
                            [
                              vendor.addressLine1,
                              vendor.addressLine2,
                              vendor.city,
                              vendor.stateRegion,
                              vendor.postalCode,
                              vendor.countryCode
                            ]
                              .filter(Boolean)
                              .join(", ") || "Not provided"
                        },
                        {
                          label: "Tax identifier last four",
                          value: vendor.taxIdentifierLast4 ?? "Not provided"
                        },
                        {
                          label: "Created",
                          value: new Date(vendor.createdAt).toLocaleString()
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {vendor.notes ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                    <p className="text-sm font-medium text-slate-950">Notes</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{vendor.notes}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Edit Vendor"
            description="Keep the company record editable here while linked workforce and compliance visibility remain close by."
          >
            <VendorForm
              action={updateVendorAction}
              submitLabel="Save vendor"
              pendingLabel="Saving vendor..."
              vendor={vendor}
            />
          </DetailPanel>
        </div>
      </section>

      <aside className="space-y-6">
        <DirectoryContextCard
          href={`/directory?view=vendors&q=${encodeURIComponent(vendor.name)}`}
          recordLabel="Vendor company"
          description="Directory is the contractor-side scan-and-jump index. This vendor page remains the canonical home for company details, linked workforce context, and vendor-specific workflow edits."
        />

        <DetailPanel
          title="Linked Workforce"
          description="Vendor-linked subcontractor workers stay on the canonical people model instead of a vendor-specific person table."
        >
          <div className="grid gap-4">
            {linkedWorkers.length > 0 ? (
              linkedWorkers.map((person) => (
                <LinkedRecordCard
                  key={person.id}
                  href={`/people/${person.id}`}
                  title={person.displayName}
                  subtitle={person.jobTitle ?? person.trade ?? "Workforce person"}
                  meta={person.email ?? person.phone ?? "No direct contact added"}
                  badge={
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {person.isActive ? "Active" : "Inactive"}
                    </span>
                  }
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                No subcontractor workers are linked to this vendor yet.
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Compliance Context"
          description="This is shared visibility only for now. Alerts, renewals, and file workflows remain future work."
        >
          <div className="space-y-3">
            {complianceRecords.length > 0 ? (
              complianceRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{record.name}</p>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getComplianceStatusClasses(
                        record.status
                      )}`}
                    >
                      {formatComplianceStatusLabel(record.status)}
                    </span>
                  </div>
                  <p className="mt-1 capitalize">{record.recordType.replaceAll("_", " ")}</p>
                  <p className="mt-1">
                    {record.issuingAuthority ?? "No issuing authority"}{" "}
                    {record.referenceNumber ? `| ${record.referenceNumber}` : ""}
                  </p>
                  <p className="mt-1">
                    {record.expiresOn
                      ? `Expires ${new Date(`${record.expiresOn}T00:00:00`).toLocaleDateString()}`
                      : "No expiration date"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                No compliance records are attached to this vendor yet.
              </div>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
