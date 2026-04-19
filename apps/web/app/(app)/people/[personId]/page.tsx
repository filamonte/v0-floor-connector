import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { PersonForm } from "@/components/person-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listComplianceRecordsBySubject } from "@/lib/compliance/data";
import { updatePersonAction } from "@/lib/people/actions";
import { getPersonById } from "@/lib/people/data";
import { listOrganizationMembers } from "@/lib/organizations/admin";
import { listVendors } from "@/lib/vendors/data";

type PersonDetailPageProps = {
  params: Promise<{
    personId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatPersonTypeLabel(value: string) {
  return value === "subcontractor_worker" ? "Subcontractor worker" : "Employee";
}

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

export default async function PersonDetailPage({
  params,
  searchParams
}: PersonDetailPageProps) {
  const { personId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [person, complianceRecords, vendors] = await Promise.all([
    getPersonById(personId, `/people/${personId}`),
    listComplianceRecordsBySubject("person", personId, `/people/${personId}`),
    listVendors()
  ]);

  if (!person) {
    notFound();
  }

  const members = await listOrganizationMembers(person.organizationId);
  const memberOptions = members.map((member) => ({
    userId: member.user_id,
    label: member.users?.full_name
      ? `${member.users.full_name} (${member.users.email})`
      : member.users?.email ?? member.invitation_email ?? member.user_id
  }));
  const vendorOptions = vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    isLaborProvider: vendor.isLaborProvider
  }));
  const nextAction = person.vendor
    ? {
        title: "Review the linked vendor context",
        description:
          "This worker is attached to a canonical vendor company, so vendor-level compliance and company context stay relevant alongside the person record.",
        href: `/vendors/${person.vendor.id}`,
        label: "Open vendor"
      }
    : {
        title: "Keep the workforce record current",
        description:
          "This is an internal workforce record, so the key task here is keeping labor identity, assignability, and compliance context clean for future time and staffing workflows."
      };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Workforce Review"
            title={person.displayName}
            description="Review the shared labor identity, linked vendor context, and compliance visibility before deeper time or assignment workflows build on top of this record."
            backHref="/people"
            backLabel="Back to people"
            actions={
              person.vendor ? (
                <Link
                  href={`/vendors/${person.vendor.id}`}
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Open vendor
                </Link>
              ) : undefined
            }
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
                  key: "workforce-role",
                  label: "Workforce role",
                  content: (
                    <ContextFactsList
                      items={[
                        {
                          label: "Type",
                          value: formatPersonTypeLabel(person.personType)
                        },
                        {
                          label: "Assignable",
                          value: person.isAssignable ? "Yes" : "No"
                        },
                        {
                          label: "Active state",
                          value: person.isActive ? "Active" : "Inactive"
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
                      eyebrow="Workforce guidance"
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
                          label: "Compliance records",
                          value: `${complianceRecords.length} record${complianceRecords.length === 1 ? "" : "s"}`
                        },
                        {
                          label: "Linked app user",
                          value: person.linkedUser?.email ?? "Not linked"
                        },
                        {
                          label: "Vendor context",
                          value: person.vendor?.name ?? "Internal workforce"
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
            title="Workforce Profile"
            description="Review the canonical labor identity here first. Editing stays available, but the record summary and connected context should be easy to scan before making changes."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Identity and contact</p>
                  <div className="mt-4">
                    <ContextFactsList
                      items={[
                        {
                          label: "Display name",
                          value: person.displayName
                        },
                        {
                          label: "Contact",
                          value: person.email ?? person.phone ?? "Not provided"
                        },
                        {
                          label: "Created",
                          value: new Date(person.createdAt).toLocaleString()
                        }
                      ]}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Work classification</p>
                  <div className="mt-4">
                    <ContextFactsList
                      items={[
                        {
                          label: "Job title",
                          value: person.jobTitle ?? "Not provided"
                        },
                        {
                          label: "Trade",
                          value: person.trade ?? "Not provided"
                        },
                        {
                          label: "Classification",
                          value: person.classification ?? "Not provided"
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Connected context</p>
                  <div className="mt-4">
                    <ContextFactsList
                      items={[
                        {
                          label: "Linked app user",
                          value: person.linkedUser?.email ?? "Not linked"
                        },
                        {
                          label: "Vendor",
                          value: person.vendor?.name ?? "Internal workforce"
                        },
                        {
                          label: "Compliance visibility",
                          value: `${complianceRecords.length} record${complianceRecords.length === 1 ? "" : "s"}`
                        }
                      ]}
                    />
                  </div>
                </div>

                {person.notes ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                    <p className="text-sm font-medium text-slate-950">Notes</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{person.notes}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Edit Workforce Record"
            description="Keep the core labor identity editable here while the connected vendor and compliance context stays visible alongside it."
          >
            <PersonForm
              action={updatePersonAction}
              submitLabel="Save person"
              pendingLabel="Saving person..."
              person={person}
              vendors={vendorOptions}
              members={memberOptions}
            />
          </DetailPanel>
        </div>
      </section>

      <aside className="space-y-6">
        {person.vendor ? (
          <DetailPanel
            title="Connected Vendor"
            description="Subcontractor workers stay attached to a canonical vendor company instead of a separate subcontractor silo."
          >
            <LinkedRecordCard
              href={`/vendors/${person.vendor.id}`}
              title={person.vendor.name}
              subtitle="Vendor company"
              meta={person.vendor.isLaborProvider ? "Labor provider enabled" : "Labor provider disabled"}
              badge={
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                  {person.vendor.vendorType}
                </span>
              }
            />
          </DetailPanel>
        ) : null}

        <DetailPanel
          title="Compliance Context"
          description="This is shared visibility only for now. Alerts, renewals, and document workflows remain future work."
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
                No compliance records are attached to this person yet.
              </div>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
