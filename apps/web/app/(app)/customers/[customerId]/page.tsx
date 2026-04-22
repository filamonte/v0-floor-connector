import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { CustomerForm } from "@/components/customer-form";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { PortalAccessGrantForm } from "@/components/portal-access-grant-form";
import { PortalProjectAccessForm } from "@/components/portal-project-access-form";
import { listAppointmentsByCustomer } from "@/lib/appointments/data";
import { updateCustomerAction } from "@/lib/customers/actions";
import { getCustomerById } from "@/lib/customers/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import {
  createPortalAccessGrantAction,
  createPortalProjectAccessAction,
  updatePortalAccessGrantStatusAction,
  updatePortalProjectAccessStatusAction
} from "@/lib/portal-access/actions";
import {
  listPortalAccessGrantsByCustomer,
  listPortalProjectAccessByGrantId
} from "@/lib/portal-access/data";
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

function formatPortalStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getPortalAccessStatusClasses(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "revoked":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

export default async function CustomerDetailPage({
  params,
  searchParams
}: CustomerDetailPageProps) {
  const { customerId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [
    customer,
    projects,
    estimates,
    jobs,
    invoices,
    portalAccessGrants,
    customerAppointments
  ] = await Promise.all([
    getCustomerById(customerId, `/customers/${customerId}`),
    listProjectsByCustomer(customerId, `/customers/${customerId}`),
    listEstimates(),
    listJobs(),
    listInvoices(),
    listPortalAccessGrantsByCustomer(customerId, `/customers/${customerId}`),
    listAppointmentsByCustomer(customerId, `/customers/${customerId}`)
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
  const portalProjectAccessEntries = await Promise.all(
    portalAccessGrants.map(async (grant) => [
      grant.id,
      await listPortalProjectAccessByGrantId(grant.id, `/customers/${customerId}`)
    ] as const)
  );
  const portalProjectAccessByGrantId = new Map(portalProjectAccessEntries);
  const activePortalGrantCount = portalAccessGrants.filter(
    (grant) => grant.status === "active"
  ).length;
  const invitedPortalGrantCount = portalAccessGrants.filter(
    (grant) => grant.status === "invited"
  ).length;
  const revokedPortalGrantCount = portalAccessGrants.filter(
    (grant) => grant.status === "revoked"
  ).length;

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
              <p className="text-sm font-medium text-slate-950">Appointments</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {customerAppointments.length}
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
          title="Appointments"
          description="Customer-facing visits and meetings stay connected to the same customer, project, and lead chain instead of becoming a disconnected calendar world."
        >
          <div className="grid gap-4">
            {customerAppointments.length > 0 ? (
              customerAppointments.slice(0, 5).map((appointment) => (
                <LinkedRecordCard
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  title={appointment.title}
                  subtitle={appointment.project?.name ?? customer.name}
                  meta={`${appointment.appointmentType.replaceAll("_", " ")} | ${new Date(appointment.startsAt).toLocaleString()}`}
                  badge={
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {appointment.status.replaceAll("_", " ")}
                    </span>
                  }
                />
              ))
            ) : (
              <AppEmptyState
                eyebrow="No appointments"
                title="Schedule the next customer touchpoint"
                description="Use appointments for customer meetings, site visits, and follow-up blocks without splitting those interactions away from the shared customer and project chain."
                actionHref={`/appointments?compose=1&customerId=${customer.id}#appointment-create`}
                actionLabel="Create appointment"
              />
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Portal Access"
          description="Grant and constrain customer-facing portal visibility here so access stays anchored to the canonical customer record and explicitly scoped projects."
        >
          <div className="space-y-8">
            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex flex-col gap-2">
                <p className="text-base font-semibold text-slate-950">Grant customer portal access</p>
                <p className="text-sm leading-6 text-slate-600">
                  Use an email that already belongs to an authenticated FloorConnector user, then add only the projects that customer should see.
                </p>
              </div>
              <div className="mt-5">
                <PortalAccessGrantForm
                  action={createPortalAccessGrantAction}
                  customerId={customer.id}
                  defaultEmail={customer.email}
                />
              </div>
            </section>

            {portalAccessGrants.length > 0 ? (
              <div className="space-y-6">
                {portalAccessGrants.map((grant) => {
                  const projectAccess = portalProjectAccessByGrantId.get(grant.id) ?? [];
                  const availableProjects = projects
                    .filter(
                      (project) =>
                        !projectAccess.some((access) => access.projectId === project.id)
                    )
                    .map((project) => ({
                      id: project.id,
                      label: project.name,
                      status: project.status
                    }));

                  return (
                    <section
                      key={grant.id}
                      className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-base font-semibold text-slate-950">
                              {grant.portalUser?.fullName ?? grant.portalUser?.email ?? grant.invitedEmail}
                            </p>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPortalAccessStatusClasses(
                                grant.status
                              )}`}
                            >
                              {formatPortalStatusLabel(grant.status)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm leading-6 text-slate-600">
                            <p>
                              Portal email:{" "}
                              <span className="font-medium text-slate-950">
                                {grant.portalUser?.email ?? grant.invitedEmail ?? "Not captured"}
                              </span>
                            </p>
                            <p>
                              Granted projects:{" "}
                              <span className="font-medium text-slate-950">
                                {projectAccess.filter((access) => access.status === "active").length}
                              </span>
                            </p>
                            <p>
                              Created:{" "}
                              <span className="font-medium text-slate-950">
                                {new Date(grant.createdAt).toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>

                        <form action={updatePortalAccessGrantStatusAction}>
                          <input type="hidden" name="portalAccessGrantId" value={grant.id} />
                          <input type="hidden" name="customerId" value={customer.id} />
                          <input type="hidden" name="userId" value={grant.userId} />
                          <input
                            type="hidden"
                            name="invitedEmail"
                            value={grant.invitedEmail ?? grant.portalUser?.email ?? ""}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value={grant.status === "revoked" ? "active" : "revoked"}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            {grant.status === "revoked" ? "Reactivate access" : "Revoke access"}
                          </button>
                        </form>
                      </div>

                      <div className="mt-6 space-y-5">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-950">Visible projects</p>
                          {projectAccess.length > 0 ? (
                            <div className="grid gap-3">
                              {projectAccess.map((access) => (
                                <div
                                  key={access.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-950">
                                        {access.project?.name ?? "Linked project"}
                                      </p>
                                      <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {access.project
                                          ? `Project status: ${access.project.status.replaceAll("_", " ")}`
                                          : "Project context unavailable"}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPortalAccessStatusClasses(
                                          access.status
                                        )}`}
                                      >
                                        {formatPortalStatusLabel(access.status)}
                                      </span>
                                      <form action={updatePortalProjectAccessStatusAction}>
                                        <input
                                          type="hidden"
                                          name="portalProjectAccessId"
                                          value={access.id}
                                        />
                                        <input type="hidden" name="customerId" value={customer.id} />
                                        <input
                                          type="hidden"
                                          name="portalAccessGrantId"
                                          value={access.portalAccessGrantId}
                                        />
                                        <input type="hidden" name="projectId" value={access.projectId} />
                                        <input
                                          type="hidden"
                                          name="status"
                                          value={access.status === "revoked" ? "active" : "revoked"}
                                        />
                                        <button
                                          type="submit"
                                          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                                        >
                                          {access.status === "revoked"
                                            ? "Reactivate"
                                            : "Revoke visibility"}
                                        </button>
                                      </form>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <AppEmptyState
                              eyebrow="No visible projects"
                              title="Grant the first project"
                              description="Portal access is customer-anchored, but the customer still only sees the projects explicitly granted below."
                            />
                          )}
                        </div>

                        {availableProjects.length > 0 && grant.status !== "revoked" ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                            <p className="text-sm font-medium text-slate-950">Add project visibility</p>
                            <div className="mt-4">
                              <PortalProjectAccessForm
                                action={createPortalProjectAccessAction}
                                customerId={customer.id}
                                portalAccessGrantId={grant.id}
                                projects={availableProjects}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <AppEmptyState
                eyebrow="No portal access yet"
                title="Grant the first customer portal user"
                description="Portal access remains narrow in this pass: connect one authenticated user to this canonical customer, then explicitly grant the projects they should be able to review."
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
            <p>Appointments: {customerAppointments.length}</p>
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

        <DetailPanel
          title="Portal Access Snapshot"
          description="A quick admin read on who can currently see this customer in the portal."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>Active portal users: {activePortalGrantCount}</p>
            <p>Invited portal users: {invitedPortalGrantCount}</p>
            <p>Revoked portal users: {revokedPortalGrantCount}</p>
            {portalAccessGrants[0] ? (
              <p>
                Latest portal grant:{" "}
                <span className="font-medium text-slate-950">
                  {portalAccessGrants[0].portalUser?.email ??
                    portalAccessGrants[0].invitedEmail ??
                    "Unknown email"}
                </span>
              </p>
            ) : (
              <p>No portal access has been granted for this customer yet.</p>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
