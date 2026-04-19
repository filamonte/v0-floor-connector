import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { PersonForm } from "@/components/person-form";
import { createPersonAction } from "@/lib/people/actions";
import { listPeople } from "@/lib/people/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listComplianceRecords } from "@/lib/compliance/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOrganizationMembers } from "@/lib/organizations/admin";
import { listVendors } from "@/lib/vendors/data";

type PeoplePageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatPersonTypeLabel(value: string) {
  return value === "subcontractor_worker" ? "Subcontractor worker" : "Employee";
}

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/people");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Workforce records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [people, vendors, complianceRecords, members] = await Promise.all([
    listPeople(),
    listVendors(),
    listComplianceRecords(),
    listOrganizationMembers(organizationContext.organization.id)
  ]);

  const employeeCount = people.filter((person) => person.personType === "employee").length;
  const subcontractorCount = people.length - employeeCount;
  const activeCount = people.filter((person) => person.isActive).length;
  const complianceCountByPersonId = new Map<string, number>();

  for (const record of complianceRecords) {
    if (record.subjectType !== "person") {
      continue;
    }

    complianceCountByPersonId.set(
      record.subjectId,
      (complianceCountByPersonId.get(record.subjectId) ?? 0) + 1
    );
  }

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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Workforce People
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Labor participants for {organizationContext.organization.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Manage the shared people foundation for employees and vendor-linked subcontractor workers before time, compliance, and assignment workflows deepen.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Employees</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {employeeCount}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Subcontractor workers</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {subcontractorCount}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Active records</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {activeCount}
              </p>
            </div>
          </div>
        </section>

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

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_220px_180px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
              <span>Person</span>
              <span>Type and vendor</span>
              <span className="text-right">Compliance</span>
            </div>
            <div className="md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Workforce records
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {people.length > 0 ? (
              people.map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_220px_180px] md:items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {person.displayName}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {person.email ?? person.phone ?? "No direct contact added yet"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {person.jobTitle ?? person.trade ?? "Role details not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Type
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatPersonTypeLabel(person.personType)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {person.vendor?.name ?? "Internal workforce"}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Compliance
                      </p>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {complianceCountByPersonId.get(person.id) ?? 0} record
                        {(complianceCountByPersonId.get(person.id) ?? 0) === 1 ? "" : "s"}
                      </span>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {person.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No workforce records yet"
                  title="Create the first person"
                  description="People become the shared labor identity foundation for future compliance, time tracking, and assignment work."
                />
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          New Person
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add an employee or subcontractor worker using the same canonical people model.
        </p>
        <div className="mt-6">
          <PersonForm
            action={createPersonAction}
            submitLabel="Create person"
            pendingLabel="Creating person..."
            vendors={vendorOptions}
            members={memberOptions}
          />
        </div>
      </aside>
    </div>
  );
}
