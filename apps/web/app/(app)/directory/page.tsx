import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { DirectoryFilterSelect } from "@/components/directory-filter-select";
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
  company: string;
  name: string;
  employeeId: string | null;
  phone: string | null;
  cell: string | null;
  address: string;
  searchText: string;
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

function buildAddress(input: {
  street?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  postalCode?: string | null;
}) {
  const parts = [input.street, input.city, input.stateRegion, input.postalCode].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
}

function getTypeBadgeStyle(typeLabel: string) {
  const normalized = typeLabel.toLowerCase();
  
  if (normalized === "customer" || normalized === "customer contact") {
    return "bg-[#2f6a3e] text-white";
  }
  
  if (normalized === "vendor" || normalized === "subcontractor") {
    return "border border-[#ef7d32] bg-white text-[#ef7d32]";
  }
  
  if (normalized === "employee") {
    return "bg-[#1a2536] text-white";
  }
  
  if (normalized === "lead") {
    return "bg-[#8a7a6c] text-white";
  }
  
  return "bg-[#f0ebe6] text-[#5f564d]";
}

// Refresh icon component
function RefreshIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

// Star icon component
function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

// More menu icon
function MoreIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

// Filter icon
function FilterIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

// Export icon
function ExportIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

// Search icon
function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/directory");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
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

  // Build directory rows matching the CF table structure
  const directoryRows: DirectoryRow[] = [
    ...customers.map((customer) => ({
      id: customer.id,
      href: `/customers/${customer.id}`,
      typeLabel: "Customer",
      typeGroup: "customers" as const,
      company: customer.companyName || customer.name,
      name: customer.companyName ? customer.name : "-",
      employeeId: null,
      phone: customer.phone,
      cell: null,
      address: buildAddress({
        street: customer.addressLine1,
        city: customer.city,
        stateRegion: customer.stateRegion,
        postalCode: customer.postalCode
      }),
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
      typeLabel: "Customer",
      typeGroup: "customers" as const,
      company: customerContact.customer?.companyName || customerContact.customer?.name || "-",
      name: customerContact.contact?.displayName ?? "-",
      employeeId: null,
      phone: customerContact.contact?.phone ?? null,
      cell: null,
      address: "-",
      searchText: [
        "customer contact",
        "contact",
        customerContact.contact?.displayName ?? "",
        customerContact.contact?.email ?? "",
        customerContact.contact?.phone ?? "",
        customerContact.customer?.name ?? ""
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...people.map((person) => ({
      id: person.id,
      href: `/people/${person.id}`,
      typeLabel: formatPersonTypeLabel(person.personType),
      typeGroup: "workforce" as const,
      company: person.vendor?.name || "-",
      name: person.displayName,
      employeeId: person.id.slice(0, 8).toUpperCase(),
      phone: person.phone,
      cell: null,
      address: "-",
      searchText: [
        person.personType === "subcontractor_worker" ? "subcontractor" : "employee",
        person.displayName,
        person.email ?? "",
        person.phone ?? "",
        person.jobTitle ?? "",
        person.vendor?.name ?? ""
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...vendors.map((vendor) => ({
      id: vendor.id,
      href: `/vendors/${vendor.id}`,
      typeLabel: formatVendorTypeLabel(vendor.vendorType),
      typeGroup: "vendors" as const,
      company: vendor.name,
      name: vendor.primaryContactName || "-",
      employeeId: null,
      phone: vendor.phone,
      cell: null,
      address: buildAddress({
        street: vendor.addressLine1,
        city: vendor.city,
        stateRegion: vendor.stateRegion,
        postalCode: vendor.postalCode
      }),
      searchText: [
        "vendor",
        vendor.vendorType,
        vendor.name,
        vendor.primaryContactName ?? "",
        vendor.email ?? "",
        vendor.phone ?? "",
        vendor.city ?? ""
      ]
        .join(" ")
        .toLowerCase()
    })),
    ...opportunities.map((opportunity) => ({
      id: opportunity.id,
      href: `/leads/${opportunity.id}`,
      typeLabel: "Lead",
      typeGroup: "leads" as const,
      company: opportunity.customer?.companyName || opportunity.customer?.name || "-",
      name: opportunity.primaryContact?.displayName || opportunity.title,
      employeeId: null,
      phone: opportunity.primaryContact?.phone ?? null,
      cell: null,
      address: opportunity.siteName || "-",
      searchText: [
        "lead",
        "opportunity",
        opportunity.title,
        opportunity.primaryContact?.displayName ?? "",
        opportunity.customer?.name ?? "",
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

  // Contact type counts for the sidebar card
  const contactTypeCounts = [
    { type: "Users", count: people.filter(p => p.personType === "employee").length },
    { type: "Contractors", count: people.filter(p => p.personType === "subcontractor_worker").length },
    { type: "Customers", count: customers.length },
    { type: "Employees", count: people.length },
    { type: "Leads", count: opportunities.length }
  ];

  const vendorCounts = [
    { type: "Misc. Contacts", count: customerContacts.length },
    { type: "Vendors", count: vendors.length }
  ];

  const directoryViews = [
    { key: "all", label: "All", count: directoryRows.length },
    { key: "customers", label: "Customers", count: customers.length + customerContacts.length },
    { key: "workforce", label: "Workforce", count: people.length },
    { key: "vendors", label: "Vendors", count: vendors.length },
    { key: "leads", label: "Leads", count: opportunities.length }
  ] as const;

  return (
    <div className="-mx-5 sm:-mx-8">
      {/* Dark navy page header */}
      <header className="flex items-center justify-between bg-[#1a2536] px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-white/60 hover:text-white">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-[13px] font-medium text-white">Directory</span>
        </div>
        <div className="text-center">
          <span className="text-[14px] font-semibold text-white">
            {organizationContext.organization.displayName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 bg-[#ef7d32] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#d86b28]">
            <span>+</span>
            <span>Contact</span>
          </button>
        </div>
      </header>

      {/* License info bar */}
      <div className="flex items-center justify-between border-b border-[#e2dcd5] bg-[#f8f6f4] px-4 py-2 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[12px]">
            <svg className="h-4 w-4 text-[#8a7a6c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[#5f564d]">Purchased Licenses:</span>
            <span className="font-semibold text-[#1a2536]">#{customers.length + people.length + vendors.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#5f564d]">Used Licenses:</span>
            <span className="font-semibold text-[#1a2536]">#{people.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#5f564d]">Available Licenses:</span>
            <span className="font-semibold text-[#1a2536]">#{customers.length + vendors.length}</span>
          </div>
        </div>
        <button className="flex items-center gap-1.5 border border-[#1a2536] px-3 py-1 text-[12px] font-medium text-[#1a2536] transition hover:bg-[#1a2536] hover:text-white">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upgrade</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 border-b border-[#e2dcd5] bg-white px-4 py-2.5 sm:px-6">
        <form action="/directory" className="relative flex-1">
          {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8a7a6c]">
            <SearchIcon />
          </span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search for Contacts"
            className="w-full border-0 bg-transparent py-1.5 pl-9 pr-3 text-[13px] text-[#221a14] outline-none placeholder:text-[#8a7a6c]"
          />
        </form>
        <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
          <ExportIcon />
        </button>
        <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
          <FilterIcon />
        </button>
      </div>

      {/* Main content area */}
      <div className="bg-[#f0ebe6] p-4 sm:p-6">
        {/* Three card panels */}
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          {/* Contacts by Type card */}
          <section className="border border-[#e2dcd5] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2dcd5] px-4 py-2.5">
              <h3 className="text-[13px] font-semibold text-[#221a14]">Contacts by Type</h3>
              <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
                <RefreshIcon />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[#8a7a6c]">
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 text-right font-medium">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ebe6]">
                      {contactTypeCounts.map((item) => (
                        <tr key={item.type} className="group cursor-pointer hover:bg-[#faf8f6]">
                          <td className="py-1.5 text-[#221a14]">{item.type}</td>
                          <td className="py-1.5 text-right text-[#5f564d]">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[#8a7a6c]">
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 text-right font-medium">Count</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ebe6]">
                      {vendorCounts.map((item) => (
                        <tr key={item.type} className="group cursor-pointer hover:bg-[#faf8f6]">
                          <td className="py-1.5 text-[#221a14]">{item.type}</td>
                          <td className="py-1.5 text-right text-[#5f564d]">{item.count}</td>
                          <td className="py-1.5 text-center text-[#8a7a6c]">
                            <MoreIcon />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="mt-3 w-full bg-[#ef7d32] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#d86b28]">
                    Import Contacts from QuickBooks
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Certificates Expiring card */}
          <section className="border border-[#e2dcd5] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2dcd5] px-4 py-2.5">
              <h3 className="text-[13px] font-semibold text-[#221a14]">Certificates Expiring (Within 60 Days)</h3>
              <div className="flex items-center gap-2">
                <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
                  <ExportIcon />
                </button>
                <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
                  <RefreshIcon />
                </button>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[#8a7a6c]">
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 text-center font-medium">Contact</th>
                    <th className="pb-2 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe6]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="group cursor-pointer hover:bg-[#faf8f6]">
                      <td className="py-1.5 text-[#221a14]">Fit Test Report</td>
                      <td className="py-1.5 text-center">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ef7d32] text-[10px] font-semibold text-white">
                          FT
                        </span>
                      </td>
                      <td className="py-1.5">
                        <span className="inline-flex items-center gap-1 text-[#5f564d]">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          06/25/2026
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Upcoming Days Off card */}
          <section className="border border-[#e2dcd5] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2dcd5] px-4 py-2.5">
              <h3 className="text-[13px] font-semibold text-[#221a14]">Upcoming Days Off</h3>
              <button className="text-[#8a7a6c] transition hover:text-[#221a14]">
                <RefreshIcon />
              </button>
            </div>
            <div className="divide-y divide-[#f0ebe6] p-4">
              {people.slice(0, 2).map((person, i) => (
                <div key={person.id} className={`flex items-start gap-3 ${i > 0 ? "pt-3" : ""}`}>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1a2536] text-[11px] font-semibold text-white">
                    {person.displayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#221a14]">{person.displayName}</p>
                    <p className="text-[11px] text-[#5f564d]">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        18 May @07:00 AM
                      </span>
                      <span className="ml-2">-</span>
                      <span className="ml-2 inline-flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        22 May @03:30 PM
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              {people.length === 0 && (
                <p className="py-4 text-center text-[12px] text-[#8a7a6c]">No upcoming days off</p>
              )}
            </div>
          </section>
        </div>

        {/* Filter dropdown */}
        <div className="mb-2 flex justify-end">
          <DirectoryFilterSelect value={view} query={query} options={directoryViews} />
        </div>

        {/* Main data table */}
        <section className="border border-[#e2dcd5] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="border-b border-[#e2dcd5] bg-[#f8f6f4]">
                <tr className="text-left text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
                  <th className="px-4 py-2.5">Company</th>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Employee ID</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Cell</th>
                  <th className="px-4 py-2.5">Address</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="w-10 px-4 py-2.5"></th>
                  <th className="w-10 px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe6]">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr
                      key={`${row.typeGroup}-${row.id}`}
                      className="group transition hover:bg-[#faf8f6]"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={row.href}
                          className="font-medium text-[#221a14] transition hover:text-[#ef7d32]"
                        >
                          {row.company}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-[#5f564d]">{row.name}</td>
                      <td className="px-4 py-2.5 text-[#5f564d]">{row.employeeId || "-"}</td>
                      <td className="px-4 py-2.5 text-[#5f564d]">{row.phone || "-"}</td>
                      <td className="px-4 py-2.5 text-[#5f564d]">{row.cell || "-"}</td>
                      <td className="px-4 py-2.5 text-[#5f564d]">{row.address}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] ${getTypeBadgeStyle(row.typeLabel)}`}
                        >
                          {row.typeLabel}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center text-[#c5bdb3] transition group-hover:text-[#8a7a6c]">
                        <StarIcon />
                      </td>
                      <td className="px-2 py-2.5 text-center text-[#c5bdb3] transition group-hover:text-[#8a7a6c]">
                        <MoreIcon />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8">
                      <AppEmptyState
                        eyebrow={directoryRows.length > 0 ? "No matching directory records" : "No directory records yet"}
                        title={directoryRows.length > 0 ? "Adjust the directory filters" : "Directory is waiting on canonical records"}
                        description={
                          directoryRows.length > 0
                            ? "Try a broader search or switch filters to review customer accounts, customer contacts, workforce records, vendors, and leads."
                            : "Directory stays read-only in this phase and only surfaces existing canonical customer, customer-contact, workforce, vendor, and lead records."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
