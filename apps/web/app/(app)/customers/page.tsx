import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { CustomerQuickCreateForm } from "@/components/customer-quick-create-form";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { quickCreateCustomerAction } from "@/lib/customers/actions";
import { listCustomers } from "@/lib/customers/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { listProjects } from "@/lib/projects/data";

type CustomersPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    error?: string;
    message?: string;
  }>;
};

function buildCustomersHref(input: {
  q?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/customers?${query}` : "/customers";
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString();
}

export default async function CustomersPage({
  searchParams
}: CustomersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/customers");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Customer records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [customers, projects, financialSettings] = await Promise.all([
    listCustomers(),
    listProjects(),
    getOrganizationFinancialSettings(organizationContext.organization.id)
  ]);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);

  const filteredCustomers = customers.filter((customer) =>
    normalizedQuery.length === 0
      ? true
      : [
          customer.name,
          customer.companyName ?? "",
          customer.email ?? "",
          customer.phone ?? "",
          customer.city ?? "",
          customer.stateRegion ?? ""
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
  );

  const taxExemptCustomers = customers.filter((customer) => customer.isTaxExempt);
  const customersWithDirectContact = customers.filter(
    (customer) => customer.email || customer.phone
  );
  const customersWithSavedAddress = customers.filter(
    (customer) =>
      customer.addressLine1 || customer.city || customer.stateRegion || customer.postalCode
  );
  const customersMissingContact = customers.filter(
    (customer) => !customer.email && !customer.phone
  );
  const customersMissingAddress = customers.filter(
    (customer) =>
      !customer.addressLine1 &&
      !customer.city &&
      !customer.stateRegion &&
      !customer.postalCode
  );
  const customersWithProjects = customers.filter((customer) =>
    projects.some((project) => project.customerId === customer.id)
  );
  const recentCustomers = [...filteredCustomers]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 20);

  return (
    <ContractorWorkspacePage
      eyebrow="Customers"
      title={`Customer records for ${organizationContext.organization.displayName}`}
      description="Customers anchor the shared external relationship, project continuity, billing defaults, and estimate-recipient contact details across the contractor operating system."
      summary={
        <div className="grid gap-px border border-[#3d4e41] bg-[#3d4e41] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-[#2f3d33] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">Total</p>
            <p className="mt-1 text-[18px] font-semibold text-white">
              {customers.length}
            </p>
          </div>
          <div className="bg-[#2f3d33] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">
              Tax exempt
            </p>
            <p className="mt-1 text-[18px] font-semibold text-white">
              {taxExemptCustomers.length}
            </p>
          </div>
          <div className="bg-[#2f3d33] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">
              Direct contact
            </p>
            <p className="mt-1 text-[18px] font-semibold text-white">
              {customersWithDirectContact.length}
            </p>
          </div>
          <div className="bg-[#2f3d33] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">
              Saved address
            </p>
            <p className="mt-1 text-[18px] font-semibold text-[#ef7d32]">
              {customersWithSavedAddress.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review the canonical customer base, keep recipient contact details current here, and open quick create only when you are ready to route a new customer account into its full workspace.
          </p>
        ),
        searchSlot: (
          <form action="/customers" className="flex flex-col gap-2 sm:flex-row">
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search customer, company, email, phone, or location"
              className="min-w-0 flex-1 border border-[#e2dcd5] bg-white px-4 py-2.5 text-[13px] text-[#221a14] outline-none transition placeholder:text-[#8a7a6c] focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center border border-[#e2dcd5] bg-white px-4 py-2.5 text-[13px] font-medium text-[#5f564d] transition hover:border-[#ef7d32] hover:text-[#221a14]"
            >
              Search
            </button>
            {query.length > 0 || showComposer ? (
              <Link
                href="/customers"
                className="inline-flex items-center justify-center px-4 py-2.5 text-[13px] font-medium text-[#8a7a6c] transition hover:text-[#221a14]"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        actionSlot: (
          <Link
            href={buildCustomersHref({ q: query, compose: "1" })}
            className="inline-flex items-center bg-[#ef7d32] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d86b28]"
          >
            New customer
          </Link>
        )
      }}
    >
      <div className="space-y-6">
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

        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Tax exempt"
            description="Customer accounts carrying tax-exempt treatment on the canonical record."
            actionHref={buildCustomersHref({ q: query })}
            actionLabel="Review accounts"
            items={taxExemptCustomers.slice(0, 4).map((customer) => ({
              href: `/customers/${customer.id}`,
              title: customer.name,
              subtitle: customer.companyName ?? "Individual customer",
              meta: customer.taxExemptionReference
                ? `Reference: ${customer.taxExemptionReference}`
                : customer.taxExemptionReason,
              trailing: `${customer.retainagePercentageDefault}%`
            }))}
            emptyTitle="No tax-exempt customers"
            emptyDescription="Tax-exempt accounts will appear here once that flag is set on the customer record."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Missing direct contact"
            description="Customer records that still need email or phone before estimate send, billing follow-through, or customer coordination are fully ready."
            actionHref={buildCustomersHref({ q: query })}
            actionLabel="Fill details"
            items={customersMissingContact.slice(0, 4).map((customer) => ({
              href: `/customers/${customer.id}`,
              title: customer.name,
              subtitle: customer.companyName ?? "Individual customer",
              meta: customer.city || customer.stateRegion
                ? [customer.city, customer.stateRegion].filter(Boolean).join(", ")
                : null,
              trailing: "No contact"
            }))}
            emptyTitle="Direct contact is filled"
            emptyDescription="All current customer records have either an email or phone saved."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Missing saved address"
            description="Customer records that still need an address for smoother downstream project setup."
            actionHref={buildCustomersHref({ q: query })}
            actionLabel="Review records"
            items={customersMissingAddress.slice(0, 4).map((customer) => ({
              href: `/customers/${customer.id}`,
              title: customer.name,
              subtitle: customer.companyName ?? "Individual customer",
              meta: customer.email ?? customer.phone ?? null,
              trailing: "Address needed"
            }))}
            emptyTitle="Address coverage looks good"
            emptyDescription="All current customer records already have address context saved."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Linked to projects"
            description="Customers already tied into the operational project chain."
            actionHref={buildCustomersHref({ q: query })}
            actionLabel="Open customers"
            items={customersWithProjects.slice(0, 4).map((customer) => {
              const linkedProjectCount = projects.filter(
                (project) => project.customerId === customer.id
              ).length;

              return {
                href: `/customers/${customer.id}`,
                title: customer.name,
                subtitle: customer.companyName ?? "Individual customer",
                meta: customer.email ?? customer.phone ?? null,
                trailing: `${linkedProjectCount} project${linkedProjectCount === 1 ? "" : "s"}`
              };
            })}
            emptyTitle="No customer-project links yet"
            emptyDescription="Customers with linked projects will appear here as the workflow expands."
          />
        </section>

        <section className="overflow-hidden border border-[#e2dcd5] bg-white">
          <div className="flex items-end justify-between gap-4 border-b border-[#e2dcd5] bg-[#f8f6f4] px-5 py-3 sm:px-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
                Recent records
              </p>
              <h3 className="mt-1 text-[16px] font-semibold text-[#221a14]">
                Latest customer updates
              </h3>
              <p className="mt-1 text-[12px] leading-5 text-[#5f564d]">
                Customer email and phone live here as the canonical recipient contact details for estimates, projects, invoices, and portal access.
              </p>
            </div>
            <p className="text-[12px] text-[#5f564d]">
              {recentCustomers.length} visible
            </p>
          </div>

          {recentCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#f0ebe6] text-[13px]">
                <thead className="bg-[#f8f6f4] text-left text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
                  <tr>
                    <th className="px-5 py-2.5 sm:px-6">Customer</th>
                    <th className="px-5 py-2.5 sm:px-6">Company / location</th>
                    <th className="px-5 py-2.5 sm:px-6">Financial defaults</th>
                    <th className="px-5 py-2.5 text-right sm:px-6">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe6] bg-white">
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="transition hover:bg-[#faf8f6]">
                      <td className="px-5 py-3 sm:px-6">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-semibold text-[#221a14] transition hover:text-[#ef7d32]"
                        >
                          {customer.name}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-[#5f564d]">
                          {customer.email ?? customer.phone ?? "No direct contact saved"}
                        </p>
                      </td>
                      <td className="px-5 py-3 sm:px-6">
                        <p className="font-medium text-[#221a14]">
                          {customer.companyName ?? "Individual customer"}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#5f564d]">
                          {[customer.city, customer.stateRegion, customer.postalCode]
                            .filter(Boolean)
                            .join(", ") || "No location saved"}
                        </p>
                      </td>
                      <td className="px-5 py-3 sm:px-6">
                        <span className="inline-flex bg-[#ef7d32] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                          {customer.isTaxExempt ? "Tax exempt" : "Taxable"}
                        </span>
                        <p className="mt-1.5 text-[12px] text-[#5f564d]">
                          Retainage {customer.retainagePercentageDefault}%
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right text-[#5f564d] sm:px-6">
                        {formatDateLabel(customer.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={customers.length > 0 ? "No matching customers" : "No customers yet"}
                title={
                  customers.length > 0
                    ? "Adjust the customer search"
                    : "Create the first customer"
                }
                description={
                  customers.length > 0
                    ? "Try a broader search to find the customer account you need."
                    : "Start here when you already know the account. Customer records need to exist before projects, estimates, and invoices can stay connected to the same canonical account."
                }
                actionHref={buildCustomersHref({ q: query, compose: "1" }) + "#customer-create"}
                actionLabel="Create your first customer"
              />
            </div>
          )}
        </section>
      </div>

      <WorkspaceComposerSheet
        id="customer-create"
        title="Quick create customer"
        description="Capture only the minimum customer context here, create the canonical account, and then finish the rest in the full customer workspace."
        open={showComposer}
        openHref={buildCustomersHref({ q: query, compose: "1" })}
        closeHref={buildCustomersHref({ q: query })}
        openLabel="Open customer quick create"
      >
        <CustomerQuickCreateForm
          action={quickCreateCustomerAction}
          defaultRetainagePercentage={financialSettings.defaultRetainagePercentage}
        />
      </WorkspaceComposerSheet>
    </ContractorWorkspacePage>
  );
}
