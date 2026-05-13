import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { PeoplePortalAccessPanel } from "@/components/people-portal-access-panel";
import { PersonForm } from "@/components/person-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { listCustomerContactsForDirectory } from "@/lib/contacts/data";
import { createPersonAction } from "@/lib/people/actions";
import { listPeople } from "@/lib/people/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listComplianceRecords } from "@/lib/compliance/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOrganizationMembers } from "@/lib/organizations/admin";
import {
  listCustomerContactPortalPermissionsByCustomer,
  listPortalAccessGrants,
  listPortalProjectAccessByGrantId
} from "@/lib/portal-access/data";
import { listProjects } from "@/lib/projects/data";
import { listVendors } from "@/lib/vendors/data";

type PeoplePageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    inviteEmail?: string;
    inviteUrl?: string;
    message?: string;
    q?: string;
    view?: "all" | "employees" | "subcontractors" | "active";
  }>;
};

function formatPersonTypeLabel(value: string) {
  return value === "subcontractor_worker" ? "Subcontractor worker" : "Employee";
}

function buildPeopleHref(input: {
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
  return query.length > 0 ? `/people?${query}` : "/people";
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

  const [people, vendors, complianceRecords, members, customerContacts, portalAccessGrants, projects] = await Promise.all([
    listPeople(),
    listVendors(),
    listComplianceRecords(),
    listOrganizationMembers(organizationContext.organization.id),
    listCustomerContactsForDirectory("/people"),
    listPortalAccessGrants(),
    listProjects()
  ]);

  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view = resolvedSearchParams.view ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const employeeCount = people.filter((person) => person.personType === "employee").length;
  const subcontractorCount = people.length - employeeCount;
  const activeCount = people.filter((person) => person.isActive).length;
  const canManageCustomerContacts =
    organizationContext.membership.role === "owner" ||
    organizationContext.membership.role === "admin";
  const complianceCountByPersonId = new Map<string, number>();
  const customerIds = [...new Set(customerContacts.map((contact) => contact.customerId))];
  const portalPermissionEntries = await Promise.all(
    customerIds.map(async (customerId) => [
      customerId,
      await listCustomerContactPortalPermissionsByCustomer(customerId, "/people")
    ] as const)
  );
  const portalProjectAccessEntries = await Promise.all(
    portalAccessGrants.map(async (grant) => [
      grant.id,
      await listPortalProjectAccessByGrantId(grant.id, "/people")
    ] as const)
  );
  const portalPermissionsByCustomerContactId = new Map(
    portalPermissionEntries
      .flatMap(([, permissions]) => permissions)
      .map((permission) => [permission.customerContactId, permission])
  );
  const portalProjectAccessByGrantId = new Map(portalProjectAccessEntries);
  const projectsByCustomerId = new Map<string, typeof projects>();

  for (const project of projects) {
    const existing = projectsByCustomerId.get(project.customerId) ?? [];
    existing.push(project);
    projectsByCustomerId.set(project.customerId, existing);
  }

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
  const filteredPeople = people.filter((person) => {
    const matchesView =
      view === "all"
        ? true
        : view === "employees"
          ? person.personType === "employee"
          : view === "subcontractors"
            ? person.personType === "subcontractor_worker"
            : person.isActive;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            person.displayName,
            person.email ?? "",
            person.phone ?? "",
            person.jobTitle ?? "",
            person.trade ?? "",
            person.vendor?.name ?? "",
            person.personType
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesView && matchesQuery;
  });
  const peopleViews = [
    { key: "all", label: "All people", count: people.length },
    { key: "employees", label: "Employees", count: employeeCount },
    { key: "subcontractors", label: "Subcontractors", count: subcontractorCount },
    { key: "active", label: "Active", count: activeCount }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="People"
      title={`People for ${organizationContext.organization.displayName}`}
      description="Manage canonical people identity across workforce participants, customer contacts, login linkage, and portal access administration. Customer detail owns customer-specific contact setup; People is the cross-customer access view."
      summary={
        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">Employees</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">{employeeCount}</p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">Subcontractors</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">{subcontractorCount}</p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">Active</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">{activeCount}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search the workforce roster, switch between employee and subcontractor views, and use the customer-access section for portal invite status, linked contacts, and project visibility.
          </p>
        ),
        searchSlot: (
          <form action="/people" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search workforce person, title, trade, vendor, or contact"
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
                href="/people"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: peopleViews.map((peopleView) => {
          const isActive = view === peopleView.key;

          return (
            <Link
              key={peopleView.key}
              href={buildPeopleHref({ q: query, view: peopleView.key, compose: showComposer ? "1" : undefined })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{peopleView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {peopleView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={buildPeopleHref({ q: query, view, compose: "1" }) + "#person-create"}
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New workforce person
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_400px]" : "space-y-4"}>
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

          {resolvedSearchParams.inviteUrl ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
              <p className="font-semibold">Portal invite link</p>
              <p className="mt-1">
                Use this fresh app invite link as the copy-link fallback for{" "}
                <span className="font-medium">
                  {resolvedSearchParams.inviteEmail ?? "the invited customer"}
                </span>
                . If provider delivery was configured and unlocked, the branded email was
                attempted separately. The raw token is shown only after creation or resend;
                the database stores only the token hash.
              </p>
              <p className="mt-3 break-all rounded-xl border border-amber-200 bg-white/80 px-3 py-2 font-mono text-xs text-slate-900">
                {resolvedSearchParams.inviteUrl}
              </p>
            </div>
          ) : null}

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.2fr)_220px_180px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Person</span>
                  <span>Type and vendor</span>
                  <span className="text-right">Compliance</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Workforce records
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {filteredPeople.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredPeople.length > 0 ? (
                filteredPeople.map((person) => (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
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
                        <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
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
                    eyebrow={people.length > 0 ? "No matching workforce records" : "No workforce records yet"}
                    title={people.length > 0 ? "Adjust the workforce filters" : "Create the first person"}
                    description={
                      people.length > 0
                        ? "Try a broader search or switch views to find the workforce record you need."
                        : "People become the shared identity foundation for workforce records, customer contacts, portal access, and relationship continuity."
                    }
                  />
                </div>
              )}
            </div>
          </section>

          <PeoplePortalAccessPanel
            customerContacts={customerContacts}
            portalAccessGrants={portalAccessGrants}
            portalProjectAccessByGrantId={portalProjectAccessByGrantId}
            portalPermissionsByCustomerContactId={portalPermissionsByCustomerContactId}
            projectsByCustomerId={projectsByCustomerId}
            canManageCustomerContacts={canManageCustomerContacts}
            returnTo="/people#customer-access"
          />
        </section>

        <WorkspaceComposerSheet
          id="person-create"
          title="Create workforce person"
          description="Add an employee or subcontractor worker using the canonical workforce people model. Customer contacts and portal access are managed in the customer-access section above."
          open={showComposer}
          openHref={buildPeopleHref({ q: query, view, compose: "1" }) + "#person-create"}
          closeHref={buildPeopleHref({ q: query, view })}
          openLabel="Open people composer"
        >
          <PersonForm
            action={createPersonAction}
            submitLabel="Create workforce person"
            pendingLabel="Creating workforce person..."
            vendors={vendorOptions}
            members={memberOptions}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
