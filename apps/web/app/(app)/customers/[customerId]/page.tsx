import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/customer-form";
import { getCustomerById } from "@/lib/customers/data";
import { updateCustomerAction } from "@/lib/customers/actions";
import { listProjectsByCustomer } from "@/lib/projects/data";

type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
  searchParams
}: CustomerDetailPageProps) {
  const { customerId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [customer, projects] = await Promise.all([
    getCustomerById(customerId, `/customers/${customerId}`),
    listProjectsByCustomer(customerId, `/customers/${customerId}`)
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Customer Detail
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {customer.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Update the customer record here. Changes stay scoped to the active
              organization and are immediately reflected in the protected app area.
            </p>
          </div>
          <Link
            href="/customers"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to customers
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/projects?customerId=${customer.id}`}
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            Create project for this customer
          </Link>
        </div>

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
          <CustomerForm
            action={updateCustomerAction}
            submitLabel="Save customer"
            pendingLabel="Saving customer..."
            customer={customer}
          />
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                Associated Projects
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Projects for this customer stay scoped to the current organization.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {projects.length} total
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-medium text-slate-950">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-sm capitalize leading-6 text-slate-600">
                        {project.status.replaceAll("_", " ")}
                      </p>
                    </div>
                    <div className="text-sm leading-6 text-slate-500 sm:text-right">
                      <p>Updated</p>
                      <p>{new Date(project.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
                No projects are linked to this customer yet. Use the action above
                to create the first one.
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Record Summary
        </p>
        <dl className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
          <div>
            <dt className="font-medium text-slate-950">Company</dt>
            <dd>{customer.companyName ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Email</dt>
            <dd>{customer.email ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Phone</dt>
            <dd>{customer.phone ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Address</dt>
            <dd>
              {[
                customer.addressLine1,
                customer.addressLine2,
                customer.city,
                customer.stateRegion,
                customer.postalCode,
                customer.countryCode
              ]
                .filter(Boolean)
                .join(", ") || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Tax treatment</dt>
            <dd>{customer.isTaxExempt ? "Tax exempt" : "Taxable by default"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Exemption reference</dt>
            <dd>{customer.taxExemptionReference ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Exemption expires</dt>
            <dd>
              {customer.taxExemptionExpiresOn
                ? new Date(`${customer.taxExemptionExpiresOn}T00:00:00`).toLocaleDateString()
                : "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Default retainage</dt>
            <dd>{customer.retainagePercentageDefault}%</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Created</dt>
            <dd>{new Date(customer.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Updated</dt>
            <dd>{new Date(customer.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
