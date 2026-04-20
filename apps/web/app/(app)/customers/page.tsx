import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { CustomerQuickCreateForm } from "@/components/customer-quick-create-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { quickCreateCustomerAction } from "@/lib/customers/actions";
import { listCustomers } from "@/lib/customers/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";

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

  const [customers, financialSettings] = await Promise.all([
    listCustomers(),
    getOrganizationFinancialSettings(organizationContext.organization.id)
  ]);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const taxExemptCount = customers.filter((customer) => customer.isTaxExempt).length;
  const taxableCount = customers.length - taxExemptCount;
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

  return (
    <ContractorWorkspacePage
      eyebrow="Customers"
      title={`Customer records for ${organizationContext.organization.displayName}`}
      description="Customers anchor projects, estimates, contracts, invoices, and tax-aware financial defaults on one canonical account record."
      summary={
        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Total</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{customers.length}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Tax exempt</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{taxExemptCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Taxable</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{taxableCount}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search the canonical customer list, keep the manager focused on review, and quick create a new account only when you are ready to open its full workspace.
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
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || showComposer ? (
              <Link
                href="/customers"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        actionSlot: (
          <Link
            href={buildCustomersHref({ q: query, compose: "1" }) + "#customer-create"}
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            New customer
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

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.3fr)_1fr_200px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Customer</span>
                  <span>Company / location</span>
                  <span className="text-right">Financial defaults</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Customers list
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {filteredCustomers.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_1fr_200px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {customer.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {customer.email ?? customer.phone ?? "No direct contact added yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Company
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {customer.companyName ?? "Individual customer"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {[customer.city, customer.stateRegion, customer.postalCode]
                            .filter(Boolean)
                            .join(", ") || "No location added yet"}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Financial defaults
                        </p>
                        <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {customer.isTaxExempt ? "Tax exempt" : "Taxable"}
                        </span>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Retainage {customer.retainagePercentageDefault}%
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={customers.length > 0 ? "No matching customers" : "No customers yet"}
                    title={customers.length > 0 ? "Adjust the customer search" : "Create the first customer"}
                    description={
                      customers.length > 0
                        ? "Try a broader search to find the customer account you need."
                        : "Customer records need to exist before projects, estimates, and invoices can stay connected to the same canonical account."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="customer-create"
          title="Quick create customer"
          description="Capture only the minimum customer context here, create the canonical account, and then finish the rest in the full customer workspace."
          open={showComposer}
          openHref={buildCustomersHref({ q: query, compose: "1" }) + "#customer-create"}
          closeHref={buildCustomersHref({ q: query })}
          openLabel="Open customer quick create"
        >
          <CustomerQuickCreateForm
            action={quickCreateCustomerAction}
            defaultRetainagePercentage={financialSettings.defaultRetainagePercentage}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
