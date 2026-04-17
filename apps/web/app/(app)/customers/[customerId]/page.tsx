import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { CustomerForm } from "@/components/customer-form";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { updateCustomerAction } from "@/lib/customers/actions";
import { getCustomerById } from "@/lib/customers/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
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

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default async function CustomerDetailPage({
  params,
  searchParams
}: CustomerDetailPageProps) {
  const { customerId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [customer, projects, estimates, jobs, invoices] = await Promise.all([
    getCustomerById(customerId, `/customers/${customerId}`),
    listProjectsByCustomer(customerId, `/customers/${customerId}`),
    listEstimates(),
    listJobs(),
    listInvoices()
  ]);

  if (!customer) {
    notFound();
  }

  const projectIds = new Set(projects.map((project) => project.id));
  const customerEstimates = estimates.filter((estimate) => projectIds.has(estimate.projectId));
  const customerJobs = jobs.filter((job) => job.customerId === customer.id);
  const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
  const openInvoices = customerInvoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Customer Review"
            title={customer.name}
            description="Customers remain canonical across projects, estimates, jobs, invoices, and tax-aware financial settings. Review the relationship context here before drilling into connected records."
            backHref="/customers"
            backLabel="Back to customers"
            actions={
              <Link
                href={`/projects?customerId=${customer.id}`}
                className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
              >
                Create project
              </Link>
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

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Projects</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {projects.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Estimates</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {customerEstimates.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Jobs</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {customerJobs.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Open invoices</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {openInvoices.length}
              </p>
            </div>
          </div>
        </div>

        <DetailPanel
          title="Connected Projects"
          description="Projects are the operational handoff point for this customer relationship."
        >
          <div className="grid gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <LinkedRecordCard
                  key={project.id}
                  href={`/projects/${project.id}`}
                  title={project.name}
                  subtitle={project.customer?.companyName ?? customer.companyName ?? "Customer relationship"}
                  meta={`Updated ${new Date(project.updatedAt).toLocaleDateString()}`}
                  badge={
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {project.status.replaceAll("_", " ")}
                    </span>
                  }
                />
              ))
            ) : (
              <AppEmptyState
                eyebrow="No projects"
                title="Create the first project"
                description="Projects are the main operational root for this customer. Create one to move the relationship into estimating and delivery work."
              />
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Edit Customer"
          description="Keep customer editing available here while the connected relationship context stays visible above."
        >
          <CustomerForm
            action={updateCustomerAction}
            submitLabel="Save customer"
            pendingLabel="Saving customer..."
            customer={customer}
          />
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel title="Customer Summary">
          <dl className="space-y-4 text-sm leading-6 text-slate-600">
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
              <dt className="font-medium text-slate-950">Default retainage</dt>
              <dd>{customer.retainagePercentageDefault}%</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Created</dt>
              <dd>{new Date(customer.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </DetailPanel>

        <DetailPanel
          title="Relationship Snapshot"
          description="A quick read on the work currently flowing from this customer into the rest of the system."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>Projects: {projects.length}</p>
            <p>Estimates: {customerEstimates.length}</p>
            <p>Jobs: {customerJobs.length}</p>
            <p>Open invoices: {openInvoices.length}</p>
            {openInvoices[0] ? (
              <p>
                Latest open invoice:{" "}
                <Link href={`/invoices/${openInvoices[0].id}`} className="font-medium text-brand-700">
                  {openInvoices[0].referenceNumber}
                </Link>{" "}
                for {formatMoney(openInvoices[0].balanceDueAmount)}
              </p>
            ) : (
              <p>No open invoices are currently tied to this customer.</p>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
