import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCustomerContactsForDirectory } from "@/lib/contacts/data";
import { listCustomers } from "@/lib/customers/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOpportunities } from "@/lib/opportunities/data";
import { listPeople } from "@/lib/people/data";
import { listVendors } from "@/lib/vendors/data";

type DirectoryPageProps = {
  searchParams?: Promise<{
    q?: string;
    view?: "all" | "customers" | "workforce" | "vendors" | "leads";
  }>;
};

type DirectoryView = "all" | "customers" | "workforce" | "vendors" | "leads";

type DirectoryRow = {
  id: string;
  href: string;
  typeLabel: string;
  typeGroup: Exclude<DirectoryView, "all">;
  name: string;
  context: string;
  detail: string;
  status: string | null;
  searchText: string;
};

type DirectoryHelperCard = {
  label: string;
  description: string;
};

function buildDirectoryHref(input: { q?: string; view?: string }) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/directory?${query}` : "/directory";
}

function formatPersonTypeLabel(personType: string) {
  return personType === "subcontractor_worker" ? "Subcontractor" : "Employee";
}

function formatVendorTypeLabel(vendorType: string) {
  if (vendorType === "subcontractor") {
    return "Vendor";
  }

  return vendorType
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildCustomerContext(input: { companyName: string | null; email: string | null }) {
  return input.companyName?.trim() || input.email?.trim() || "Canonical customer account";
}

function buildCustomerDetail(input: {
  phone: string | null;
  city: string | null;
  stateRegion: string | null;
}) {
  const location = [input.city, input.stateRegion].filter(Boolean).join(", ");
  return input.phone?.trim() || location || "Commercial and billing account";
}

function buildCustomerStatus(input: { isTaxExempt: boolean }) {
  return input.isTaxExempt ? "Tax exempt" : "Standard account";
}

function buildCustomerContactContext(input: {
  customerName: string | null;
  relationshipLabel: string | null;
}) {
  const parentLabel = input.customerName?.trim() || "Canonical customer account";
  const relationshipLabel = input.relationshipLabel?.trim();

  return relationshipLabel
    ? `${parentLabel} - ${relationshipLabel}`
    : `${parentLabel} - Related customer contact`;
}

function buildCustomerContactDetail(input: {
  email: string | null;
  phone: string | null;
  customerName: string | null;
}) {
  const primaryDetail = input.email?.trim() || input.phone?.trim();
  const parentCustomer = input.customerName?.trim() || "customer detail";
  const readinessLabel = input.email?.trim()
    ? "Email ready for linked portal grants"
    : "Email needed before linked portal grants";

  if (primaryDetail) {
    return `${primaryDetail} - ${readinessLabel} - Managed on ${parentCustomer} customer detail`;
  }

  return `${readinessLabel} - Managed on ${parentCustomer} customer detail`;
}

function buildCustomerContactStatus(input: { isPrimary: boolean }) {
  return input.isPrimary ? "Main contact" : "Related contact";
}

function buildCustomerContactPortalNote() {
  return "Linked portal grants and permission settings are managed on the parent customer detail page";
}

function buildPersonContext(input: {
  personType: string;
  vendorName: string | null;
  linkedUserEmail: string | null;
}) {
  if (input.personType === "subcontractor_worker") {
    return input.vendorName?.trim() || "Vendor-linked subcontractor";
  }

  return input.linkedUserEmail?.trim() || "Internal workforce";
}

function buildPersonDetail(input: { jobTitle: string | null; trade: string | null }) {
  return input.jobTitle?.trim() || input.trade?.trim() || "Workforce participant";
}

function buildVendorContext(input: {
  primaryContactName: string | null;
  email: string | null;
  isLaborProvider: boolean;
}) {
  if (input.primaryContactName?.trim()) {
    return input.primaryContactName.trim();
  }

  if (input.email?.trim()) {
    return input.email.trim();
  }

  return input.isLaborProvider ? "Labor provider vendor" : "Vendor company";
}

function buildVendorDetail(input: {
  phone: string | null;
  city: string | null;
  stateRegion: string | null;
}) {
  const location = [input.city, input.stateRegion].filter(Boolean).join(", ");
  return input.phone?.trim() || location || "Vendor record";
}

function buildLeadContext(input: {
  contactName: string | null;
  customerName: string | null;
  projectName: string | null;
}) {
  return (
    input.contactName?.trim() ||
    input.customerName?.trim() ||
    input.projectName?.trim() ||
    "Opportunity contact pending"
  );
}

function buildLeadDetail(input: {
  customerName: string | null;
  projectName: string | null;
  siteName: string | null;
}) {
  return (
    input.projectName?.trim() ||
    input.customerName?.trim() ||
    input.siteName?.trim() ||
    "Pre-project commercial record"
  );
}

function getStatusTone(status: string | null) {
  if (!status) {
    return "border-[#dde3eb] bg-[#f8fafc] text-slate-600";
  }

  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "standard account" ||
    normalizedStatus === "tax exempt" ||
    normalizedStatus === "won" ||
    normalizedStatus === "converted"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (
    normalizedStatus === "inactive" ||
    normalizedStatus === "lost" ||
    normalizedStatus === "revoked"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (
    normalizedStatus === "main contact" ||
    normalizedStatus === "qualified" ||
    normalizedStatus === "contacted" ||
    normalizedStatus === "estimating" ||
    normalizedStatus === "proposal_sent" ||
    normalizedStatus === "site_assessment_scheduled" ||
    normalizedStatus === "site_assessment_complete"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-[#dde3eb] bg-[#f8fafc] text-slate-600";
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/directory");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Directory records need an active organization before they can be reviewed.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [customers, customerContacts, people, vendors, opportunities] = await Promise.all([
    listCustomers(),
    listCustomerContactsForDirectory("/directory"),
    listPeople(),
    listVendors(),
    listOpportunities()
  ]);

  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view: DirectoryView = resolvedSearchParams.view ?? "all";

  const directoryRows: DirectoryRow[] = [
    ...customers.map((customer) => ({
      id: customer.id,
      href: `/customers/${customer.id}`,
      typeLabel: "Customer",
      typeGroup: "customers" as const,
      name: customer.name,
      context: buildCustomerContext({
        companyName: customer.companyName,
        email: customer.email
      }),
      detail: buildCustomerDetail({
        phone: customer.phone,
        city: customer.city,
        stateRegion: customer.stateRegion
      }),
      status: buildCustomerStatus({ isTaxExempt: customer.isTaxExempt }),
      searchText: [
        "customer",
        customer.name,
        customer.companyName ?? "",
        customer.email ?? "",
        customer.phone ?? "",
        customer.city ?? "",
        customer.stateRegion ?? ""
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...customerContacts.map((customerContact) => ({
      id: customerContact.id,
      href: `/customers/${customerContact.customerId}`,
      typeLabel: "Customer Contact",
      typeGroup: "customers" as const,
      name: customerContact.contact?.displayName ?? "Linked customer contact",
      context: buildCustomerContactContext({
        customerName: customerContact.customer?.name ?? null,
        relationshipLabel: customerContact.relationshipLabel
      }),
      detail: buildCustomerContactDetail({
        email: customerContact.contact?.email ?? null,
        phone: customerContact.contact?.phone ?? null,
        customerName: customerContact.customer?.name ?? null
      }),
      status: buildCustomerContactStatus({
        isPrimary: customerContact.isPrimary
      }),
      searchText: [
        "customer contact",
        "contact",
        "portal readiness",
        "linked portal grants",
        "permission settings",
        customerContact.contact?.displayName ?? "",
        customerContact.contact?.companyName ?? "",
        customerContact.contact?.email ?? "",
        customerContact.contact?.phone ?? "",
        customerContact.relationshipLabel ?? "",
        customerContact.customer?.name ?? "",
        customerContact.customer?.companyName ?? "",
        customerContact.contact?.email?.trim()
          ? "email ready for linked portal grants"
          : "email needed before linked portal grants",
        customerContact.isPrimary ? "main contact" : "related contact"
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...people.map((person) => ({
      id: person.id,
      href: `/people/${person.id}`,
      typeLabel: formatPersonTypeLabel(person.personType),
      typeGroup: "workforce" as const,
      name: person.displayName,
      context: buildPersonContext({
        personType: person.personType,
        vendorName: person.vendor?.name ?? null,
        linkedUserEmail: person.linkedUser?.email ?? null
      }),
      detail: buildPersonDetail({
        jobTitle: person.jobTitle,
        trade: person.trade
      }),
      status: person.isActive ? "Active" : "Inactive",
      searchText: [
        person.personType === "subcontractor_worker" ? "subcontractor" : "employee",
        person.displayName,
        person.email ?? "",
        person.phone ?? "",
        person.jobTitle ?? "",
        person.trade ?? "",
        person.vendor?.name ?? "",
        person.linkedUser?.email ?? ""
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...vendors.map((vendor) => ({
      id: vendor.id,
      href: `/vendors/${vendor.id}`,
      typeLabel: formatVendorTypeLabel(vendor.vendorType),
      typeGroup: "vendors" as const,
      name: vendor.name,
      context: buildVendorContext({
        primaryContactName: vendor.primaryContactName,
        email: vendor.email,
        isLaborProvider: vendor.isLaborProvider
      }),
      detail: buildVendorDetail({
        phone: vendor.phone,
        city: vendor.city,
        stateRegion: vendor.stateRegion
      }),
      status: vendor.isActive ? "Active" : "Inactive",
      searchText: [
        "vendor",
        vendor.vendorType,
        vendor.name,
        vendor.primaryContactName ?? "",
        vendor.email ?? "",
        vendor.phone ?? "",
        vendor.city ?? "",
        vendor.stateRegion ?? ""
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...opportunities.map((opportunity) => ({
      id: opportunity.id,
      href: `/leads/${opportunity.id}`,
      typeLabel: "Lead",
      typeGroup: "leads" as const,
      name: opportunity.title,
      context: buildLeadContext({
        contactName: opportunity.primaryContact?.displayName ?? null,
        customerName: opportunity.customer?.name ?? null,
        projectName: opportunity.project?.name ?? null
      }),
      detail: buildLeadDetail({
        customerName: opportunity.customer?.name ?? null,
        projectName: opportunity.project?.name ?? null,
        siteName: opportunity.siteName
      }),
      status: opportunity.status,
      searchText: [
        "lead",
        "opportunity",
        opportunity.title,
        opportunity.primaryContact?.displayName ?? "",
        opportunity.customer?.name ?? "",
        opportunity.customer?.companyName ?? "",
        opportunity.project?.name ?? "",
        opportunity.status,
        opportunity.siteName ?? ""
      ]
        .join(" ")
        .toLowerCase()
    }))
  ];

  const filteredRows = directoryRows.filter((row) => {
    const matchesView = view === "all" ? true : row.typeGroup === view;
    const matchesQuery =
      normalizedQuery.length === 0 ? true : row.searchText.includes(normalizedQuery);

    return matchesView && matchesQuery;
  });

  const directoryViews = [
    { key: "all", label: "All records", count: directoryRows.length },
    { key: "customers", label: "Customers", count: customers.length + customerContacts.length },
    { key: "workforce", label: "Workforce", count: people.length },
    { key: "vendors", label: "Vendors", count: vendors.length },
    { key: "leads", label: "Leads", count: opportunities.length }
  ] as const;
  const helperCards: DirectoryHelperCard[] = [
    {
      label: "Customers",
      description:
        "Canonical account and billing records used by commercial and financial workflows."
    },
    {
      label: "Customer Contacts",
      description:
        "Related contacts beneath canonical customer accounts, routed back to the customer detail workspace for management."
    },
    {
      label: "Workforce",
      description: "Operational people records for employees and subcontractor workers."
    },
    {
      label: "Vendors",
      description:
        "Vendor and company records for external businesses, suppliers, and labor providers."
    },
    {
      label: "Leads",
      description: "Pre-customer opportunities that route into the canonical commercial path."
    }
  ];

  return (
    <ContractorWorkspacePage
      eyebrow="Directory"
      title={`Unified contractor directory for ${organizationContext.organization.displayName}`}
      description="Review customer accounts, related customer contacts, workforce people, vendors, and leads together in one read-only workspace while each row still routes back to its existing canonical record."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Customers</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {customers.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">
              Customer Contacts
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {customerContacts.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Workforce</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {people.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Vendors</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {vendors.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Leads</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {opportunities.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Directory is read-only in this phase. Open the linked canonical workspace when you need
            to review or edit a customer account, related customer contact, workforce record,
            vendor, or lead.
          </p>
        ),
        searchSlot: (
          <form action="/directory" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search customer, customer contact, workforce person, vendor, or lead"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" ? (
              <Link
                href="/directory"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: directoryViews.map((directoryView) => {
          const isActive = view === directoryView.key;

          return (
            <Link
              key={directoryView.key}
              href={buildDirectoryHref({ q: query, view: directoryView.key })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{directoryView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {directoryView.count}
              </span>
            </Link>
          );
        })
      }}
    >
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {helperCards.map((card) => (
          <article key={card.label} className="border border-[#dde3eb] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">{card.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="border border-[#dde3eb] bg-white">
        <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Canonical record index
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Scan mixed record types here, then jump into the linked canonical workspace for the
                actual work. Customer-contact rows route back to the parent customer detail page,
                where related contacts, linked portal grants, and contact-level permissions are
                managed.
              </p>
            </div>
            <div className="hidden grid-cols-[160px_minmax(0,1.2fr)_220px_180px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
              <span>Type</span>
              <span>Record</span>
              <span>Context</span>
              <span className="text-right">Status</span>
            </div>
            <div className="md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Directory records
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-500">{filteredRows.length} visible</p>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <Link
                key={`${row.typeGroup}-${row.id}`}
                href={row.href}
                className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
              >
                <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1.2fr)_220px_180px] md:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Type
                    </p>
                    <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                      {row.typeLabel}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Record
                    </p>
                    <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                      {row.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{row.detail}</p>
                    {row.typeLabel === "Customer Contact" ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {buildCustomerContactPortalNote()}.
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Context
                    </p>
                    <p className="text-sm font-medium text-slate-700">{row.context}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Status
                    </p>
                    <span
                      className={[
                        "inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                        getStatusTone(row.status)
                      ].join(" ")}
                    >
                      {row.status ?? "No status"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={directoryRows.length > 0 ? "No matching directory records" : "No directory records yet"}
                title={directoryRows.length > 0 ? "Adjust the directory filters" : "Directory is waiting on canonical records"}
                description={
                  directoryRows.length > 0
                    ? "Try a broader search or switch filters to review customer accounts, customer contacts, workforce records, vendors, and leads."
                    : "Directory stays read-only in this phase and only surfaces existing canonical customer, customer-contact, workforce, vendor, and lead records."
                }
              />
            </div>
          )}
        </div>
      </section>
    </ContractorWorkspacePage>
  );
}
