import Link from "next/link";

import { CustomerForm } from "@/components/customer-form";
import { createCustomerAction } from "@/lib/customers/actions";
import { listCustomers } from "@/lib/customers/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type CustomersPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

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

  const customers = await listCustomers();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Customers
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Customer records for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This is the first real business object in the protected app area. Use
          it to create and review customer records that stay scoped to the active
          organization.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sorted alphabetically so it is easier to scan as the list grows.
        </p>

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

        <div className="mt-8 grid gap-4">
          {customers.length > 0 ? (
            customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">
                      {customer.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {customer.companyName ?? "Individual customer"}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-slate-500 sm:text-right">
                    <p>{customer.email ?? "No email"}</p>
                    <p>{customer.phone ?? "No phone"}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs leading-5 text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    {customer.isTaxExempt ? "Tax exempt" : "Taxable by default"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    Retainage default {customer.retainagePercentageDefault}%
                  </span>
                </div>
                {(customer.city || customer.stateRegion || customer.postalCode) ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {[customer.city, customer.stateRegion, customer.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              No customers have been added yet. Create the first one using the
              form in the right column so projects can be linked to a real
              customer next.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          New Customer
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add a customer record for this organization. The form is intentionally
          minimal but uses the real create flow and the real tenant-scoped table.
        </p>
        <div className="mt-6">
          <CustomerForm
            action={createCustomerAction}
            submitLabel="Create customer"
            pendingLabel="Creating customer..."
          />
        </div>
      </aside>
    </div>
  );
}
