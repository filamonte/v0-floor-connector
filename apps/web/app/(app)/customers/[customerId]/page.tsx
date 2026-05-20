import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CustomerContactForm } from "@/components/customer-contact-form";
import { CustomerCommunicationPreferencesPanel } from "@/components/customer-communication-preferences-panel";
import { CustomerForm } from "@/components/customer-form";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { DirectoryContextCard } from "@/components/directory-context-card";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { PortalAccessGrantForm } from "@/components/portal-access-grant-form";
import { PortalInviteEmailStatus } from "@/components/portal-invite-email-status";
import { PortalProjectAccessForm } from "@/components/portal-project-access-form";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import { TemporaryPortalCredentialForm } from "@/components/temporary-portal-credential-form";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";
import { ServiceWarrantyContinuityPanel } from "@/components/service-warranty-continuity-panel";
import { listAppointmentsByCustomer } from "@/lib/appointments/data";
import { getCurrentUser } from "@/lib/auth/session";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import { updateCustomerAppointmentReminderPreferenceAction } from "@/lib/communications/actions";
import { listCustomerAppointmentReminderPreferenceSummary } from "@/lib/communications/communication-preferences";
import { updateCustomerAction } from "@/lib/customers/actions";
import { getCustomerById } from "@/lib/customers/data";
import { listEstimatesByProjectIds } from "@/lib/estimates/data";
import { listInvoicesByCustomer } from "@/lib/invoices/data";
import {
  listJobAssignmentsByJobIds,
  listJobsByCustomer
} from "@/lib/jobs/data";
import {
  createCustomerContactAction,
  makeCustomerContactPrimaryAction,
  updateCustomerContactAction
} from "@/lib/contacts/actions";
import { listCustomerContactsByCustomer } from "@/lib/contacts/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  createPortalAccessGrantAction,
  sendPortalInviteEmailAction,
  updateCustomerContactPortalPermissionAction,
  updatePortalAccessGrantLinkAction,
  createPortalProjectAccessAction,
  updatePortalAccessGrantStatusAction,
  updatePortalProjectAccessStatusAction
} from "@/lib/portal-access/actions";
import { buildCustomerPortalAccessSummary } from "@/lib/portal-access/customer-access-summary";
import {
  listCustomerContactPortalPermissionsByCustomer,
  listPortalAccessGrantsByCustomer,
  listPortalProjectAccessByGrantId
} from "@/lib/portal-access/data";
import { listProjectsByCustomer } from "@/lib/projects/data";
import { listServiceTicketsByCustomer } from "@/lib/service-tickets/data";
import { listWarrantyDocumentsByCustomer } from "@/lib/warranty-documents/data";

type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    inviteUrl?: string;
    inviteEmail?: string;
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

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatRelationshipLabel(value: string | null) {
  if (!value) {
    return "Related contact";
  }

  return value.replaceAll("_", " ");
}

const futurePortalPermissionReadiness = [
  "View estimates",
  "Approve estimates",
  "Sign contracts",
  "Approve change orders",
  "View/pay invoices",
  "Request new quote"
];

function formatManagementSourceLabel(value: string) {
  switch (value) {
    case "contractor_admin":
      return "Customized by contractor admin";
    case "main_contact":
      return "Customized by main contact";
    case "migration":
      return "Seeded from migration";
    default:
      return "Default stored permissions";
  }
}

function buildCustomerScheduleHref(input: {
  customerName: string;
  projectId?: string;
  view?: "all" | "unscheduled" | "today" | "upcoming" | "in_progress";
  crew?: "all" | "assigned" | "unassigned";
  action?: "schedule" | "assign";
  jobId?: string;
}) {
  return buildScheduleHref({
    projectId: input.projectId,
    q: input.projectId ? undefined : input.customerName.trim() || undefined,
    view: input.view,
    crew: input.crew,
    action: input.action,
    jobId: input.jobId
  });
}

export default async function CustomerDetailPage({
  params,
  searchParams
}: CustomerDetailPageProps) {
  const { customerId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await getCurrentUser();
  const organizationContext = user
    ? await getActiveOrganizationContext(user.id)
    : null;
  const canManageCustomerContacts =
    organizationContext?.membership.role === "owner" ||
    organizationContext?.membership.role === "admin";
  const [
    customer,
    projects,
    customerContacts,
    portalAccessGrants,
    customerContactPortalPermissions,
    customerAppointments,
    communicationPreferenceSummary,
    communicationThreads
  ] = await Promise.all([
    getCustomerById(customerId, `/customers/${customerId}`),
    listProjectsByCustomer(customerId, `/customers/${customerId}`),
    listCustomerContactsByCustomer(customerId, `/customers/${customerId}`),
    listPortalAccessGrantsByCustomer(customerId, `/customers/${customerId}`),
    listCustomerContactPortalPermissionsByCustomer(
      customerId,
      `/customers/${customerId}`
    ),
    listAppointmentsByCustomer(customerId, `/customers/${customerId}`),
    listCustomerAppointmentReminderPreferenceSummary(
      customerId,
      `/customers/${customerId}`
    ),
    listCommunicationThreadsForSubject("customer", customerId)
  ]);

  if (!customer) {
    notFound();
  }

  const [
    customerEstimates,
    customerJobs,
    customerInvoices,
    customerServiceTickets,
    customerWarrantyDocuments
  ] = await Promise.all([
    listEstimatesByProjectIds(
      projects.map((project) => project.id),
      `/customers/${customerId}`
    ),
    listJobsByCustomer(customer.id, `/customers/${customerId}`),
    listInvoicesByCustomer(customer.id, `/customers/${customerId}`),
    listServiceTicketsByCustomer(customer.id),
    listWarrantyDocumentsByCustomer(customer.id)
  ]);
  const customerJobAssignments = await listJobAssignmentsByJobIds(
    customerJobs.map((job) => job.id),
    `/customers/${customerId}`
  );
  const openInvoices = customerInvoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const unscheduledJobs = customerJobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const activeJobs = customerJobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const scheduledOrActiveJobs = customerJobs.filter(
    (job) =>
      job.dispatchStatus === "scheduled" || job.dispatchStatus === "in_progress"
  );
  const jobsWithoutAssignments = customerJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (customerJobAssignments.get(job.id)?.length ?? 0) === 0
  );
  const nextScheduledJob =
    [...scheduledOrActiveJobs]
      .filter((job) => job.scheduledDate)
      .sort(
        (left, right) =>
          getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
      )[0] ?? null;
  const nextScheduledAssignments = nextScheduledJob
    ? (customerJobAssignments.get(nextScheduledJob.id) ?? [])
    : [];
  const nextScheduledAssignmentNames = nextScheduledAssignments
    .map(
      (assignment) =>
        assignment.person?.displayName ?? assignment.vendor?.name ?? null
    )
    .filter((value): value is string => Boolean(value));
  const nextScheduledCrewSummary = nextScheduledJob
    ? getScheduleAssignmentSummary({
        assignmentNames: nextScheduledAssignmentNames,
        crewVendorName: nextScheduledJob.crewVendor?.name ?? null,
        assignmentCount: nextScheduledAssignments.length
      })
    : null;
  const customerScheduleHref = buildCustomerScheduleHref({
    customerName: customer.name,
    projectId: nextScheduledJob?.projectId,
    view:
      unscheduledJobs.length > 0
        ? "unscheduled"
        : activeJobs.length > 0
          ? "in_progress"
          : "upcoming",
    crew: jobsWithoutAssignments.length > 0 ? "unassigned" : "all"
  });
  const portalProjectAccessEntries = await Promise.all(
    portalAccessGrants.map(
      async (grant) =>
        [
          grant.id,
          await listPortalProjectAccessByGrantId(
            grant.id,
            `/customers/${customerId}`
          )
        ] as const
    )
  );
  const portalProjectAccessByGrantId = new Map(portalProjectAccessEntries);
  const portalAccessSummary = buildCustomerPortalAccessSummary({
    contacts: customerContacts,
    grants: portalAccessGrants,
    projectAccessByGrantId: portalProjectAccessByGrantId
  });
  const activePortalGrantCount = portalAccessSummary.activeGrantCount;
  const invitedPortalGrantCount = portalAccessSummary.invitedGrantCount;
  const revokedPortalGrantCount = portalAccessSummary.revokedGrantCount;
  const customerContactOptions = customerContacts.map((customerContact) => {
    const contactName =
      customerContact.contact?.displayName ?? "Linked contact";
    const contactEmail = customerContact.contact?.email?.trim() ?? "";
    const relationshipLabel = formatRelationshipLabel(
      customerContact.relationshipLabel
    );
    const primaryLabel = customerContact.isPrimary
      ? "Recommended portal contact"
      : relationshipLabel;

    return {
      id: customerContact.id,
      email: contactEmail || null,
      label: contactEmail
        ? `${contactName} (${contactEmail}) - ${primaryLabel}`
        : `${contactName} - ${primaryLabel}`
    };
  });
  const portalPermissionsByCustomerContactId = new Map(
    customerContactPortalPermissions.map((permission) => [
      permission.customerContactId,
      permission
    ])
  );
  const primaryCustomerContact =
    customerContacts.find((customerContact) => customerContact.isPrimary) ??
    customerContacts[0] ??
    null;
  const openProjectCount = projects.filter(
    (project) => project.status !== "completed"
  ).length;
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 space-y-6">
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Customer Workspace"
            title={customer.name}
            description="Account summary, relationship context, and connected work for this customer. Contact identity and portal access remain managed through People."
            backHref="/customers"
            backLabel="Back to customers"
            actions={
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/projects?customerId=${customer.id}`}
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Create project
                </Link>
                <Link
                  href={`/people?accessCustomerId=${customer.id}#customer-access`}
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Manage contacts/access
                </Link>
              </div>
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

          {resolvedSearchParams.inviteUrl ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
              <p className="font-semibold">Portal invite link</p>
              <p className="mt-1">
                Use this fresh app invite link as the copy-link fallback for{" "}
                <span className="font-medium">
                  {resolvedSearchParams.inviteEmail ?? "the invited customer"}
                </span>
                . If provider delivery was configured and unlocked, the branded
                email was attempted separately. The raw token is shown only
                after creation or resend; the database stores only the token
                hash.
              </p>
              <p className="mt-3 break-all rounded-xl border border-amber-200 bg-white/80 px-3 py-2 font-mono text-xs text-slate-900">
                {resolvedSearchParams.inviteUrl}
              </p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">
                Open projects
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {openProjectCount}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {projects.length} total project
                {projects.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">
                Primary contact
              </p>
              <p className="mt-3 truncate text-lg font-semibold tracking-tight text-slate-950">
                {primaryCustomerContact?.contact?.displayName ?? "Not set"}
              </p>
              <p className="mt-2 truncate text-xs leading-5 text-slate-500">
                {primaryCustomerContact?.contact?.email ??
                  customer.email ??
                  "No email on file"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Contacts</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {customerContacts.length}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {activePortalGrantCount} active portal grant
                {activePortalGrantCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">
                Open invoices
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {openInvoices.length}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {customerEstimates.length} estimate
                {customerEstimates.length === 1 ? "" : "s"} on linked projects
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
                  subtitle={
                    project.customer?.companyName ??
                    customer.companyName ??
                    "Customer relationship"
                  }
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

        <ServiceWarrantyContinuityPanel
          title="Service & Warranty Account History"
          description="Customer-level post-install history across linked projects and jobs. Detailed edits stay in Service Tickets and Warranty Documents."
          tickets={customerServiceTickets}
          warrantyDocuments={customerWarrantyDocuments}
          serviceTicketHref={`/service-tickets?customerId=${customer.id}`}
        />

        <DetailPanel
          title="Connected Estimates"
          description="Estimate records tied to this customer's projects stay visible here while deeper estimate work remains in the estimate workspace."
        >
          <div className="grid gap-4">
            {customerEstimates.length > 0 ? (
              customerEstimates
                .slice(0, 5)
                .map((estimate) => (
                  <LinkedRecordCard
                    key={estimate.id}
                    href={
                      estimate.status === "draft"
                        ? `/estimates/${estimate.id}/edit`
                        : `/estimates/${estimate.id}`
                    }
                    title={`${estimate.referenceNumber} - ${
                      estimate.title ??
                      estimate.project?.name ??
                      "Untitled estimate"
                    }`}
                    subtitle={estimate.project?.name ?? "Project pending"}
                    meta={`Updated ${new Date(estimate.updatedAt).toLocaleDateString()}`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {estimate.status}
                      </span>
                    }
                  />
                ))
            ) : (
              <AppEmptyState
                eyebrow="No estimates"
                title="Start the first customer estimate"
                description="Create an estimate from this customer once a project or site is ready for pricing."
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
              customerAppointments
                .slice(0, 5)
                .map((appointment) => (
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
          title="Contacts"
          description="Manage related contacts beneath this customer account so linked portal grants can use contact-level permissions without replacing the customer record."
        >
          <div className="space-y-8">
            <details className="group rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-base font-semibold text-slate-950">
                    {canManageCustomerContacts
                      ? "Add related contact"
                      : "Related contacts"}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Related contacts stay linked to this customer account. Add
                    or edit contact details only when the account summary above
                    is not enough.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Expand
                </span>
              </summary>
              <div className="mt-5">
                {canManageCustomerContacts ? (
                  <CustomerContactForm
                    action={createCustomerContactAction}
                    customerId={customer.id}
                  />
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    Contractor admins can add and maintain related customer
                    contacts here.
                  </p>
                )}
              </div>
            </details>

            {customerContacts.length > 0 ? (
              <div className="grid gap-4">
                {customerContacts.map((customerContact) => (
                  <section
                    key={customerContact.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-slate-950">
                            {customerContact.contact?.displayName ??
                              "Linked contact"}
                          </p>
                          {customerContact.isPrimary ? (
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                              Main contact
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                              Related contact
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm leading-6 text-slate-600">
                          <p>
                            Relationship:{" "}
                            <span className="font-medium text-slate-950">
                              {customerContact.relationshipLabel ??
                                "Not labeled"}
                            </span>
                          </p>
                          <p>
                            Email:{" "}
                            <span className="font-medium text-slate-950">
                              {customerContact.contact?.email ?? "Not provided"}
                            </span>
                          </p>
                          <p>
                            Phone:{" "}
                            <span className="font-medium text-slate-950">
                              {customerContact.contact?.phone ?? "Not provided"}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                          <p className="text-sm font-medium text-slate-950">
                            Portal-access readiness
                          </p>
                          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                            <p>
                              Email status:{" "}
                              <span className="font-medium text-slate-950">
                                {customerContact.contact?.email?.trim()
                                  ? "Present"
                                  : "Missing"}
                              </span>
                            </p>
                            <p>
                              Main-contact status:{" "}
                              <span className="font-medium text-slate-950">
                                {customerContact.isPrimary
                                  ? "Main contact"
                                  : "Additional contact"}
                              </span>
                            </p>
                            <p>
                              Contact-linked portal access:{" "}
                              <span className="font-medium text-slate-950">
                                {customerContactPortalPermissions.some(
                                  (permission) =>
                                    permission.customerContactId ===
                                    customerContact.id
                                )
                                  ? "Stored permissions available"
                                  : "Ready for linked-contact grant"}
                              </span>
                            </p>
                            <p className="text-xs leading-5 text-slate-500">
                              Contact-specific permissions apply after a portal
                              grant is linked to this contact. Estimate
                              decisions, change-order decisions, and contract
                              sign/decline are enforced for linked-contact
                              grants.
                            </p>
                          </div>
                        </div>
                      </div>

                      {!customerContact.isPrimary &&
                      canManageCustomerContacts ? (
                        <form action={makeCustomerContactPrimaryAction}>
                          <input
                            type="hidden"
                            name="customerId"
                            value={customer.id}
                          />
                          <input
                            type="hidden"
                            name="customerContactId"
                            value={customerContact.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            Make main contact
                          </button>
                        </form>
                      ) : null}
                    </div>

                    {canManageCustomerContacts ? (
                      <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                          <span className="text-sm font-medium text-slate-950">
                            Edit related contact
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Expand
                          </span>
                        </summary>
                        <div className="mt-4">
                          <CustomerContactForm
                            action={updateCustomerContactAction}
                            customerId={customer.id}
                            customerContact={customerContact}
                          />
                        </div>
                      </details>
                    ) : null}
                  </section>
                ))}
              </div>
            ) : (
              <AppEmptyState
                eyebrow="No related contacts"
                title="Add the first customer contact"
                description="Use related contacts for account-side participants without replacing the customer record or changing the account-level estimate and billing recipient fields yet."
              />
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Communication Preferences"
          description="Contractor-admin controls for customer reminder eligibility. These preferences only affect email appointment reminders in this phase."
        >
          <div id="communication-preferences">
            <CustomerCommunicationPreferencesPanel
              customerId={customer.id}
              preferences={communicationPreferenceSummary}
              canManage={canManageCustomerContacts}
              action={updateCustomerAppointmentReminderPreferenceAction}
            />
          </div>
        </DetailPanel>

        <DetailPanel
          title="Portal Access"
          description="Customer-specific portal invite, access, and project visibility summary. People remains the cross-customer access console."
        >
          <div className="space-y-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                <p className="font-medium text-slate-950">
                  Recommended contact
                </p>
                {portalAccessSummary.recommendedContact ? (
                  <div className="mt-3 space-y-1">
                    <p className="font-semibold text-slate-950">
                      {portalAccessSummary.recommendedContact.label}
                    </p>
                    <p className="break-words">
                      {portalAccessSummary.recommendedContact.email}
                    </p>
                    <p className="text-xs leading-5 text-slate-500">
                      {portalAccessSummary.recommendedContact.isPrimary
                        ? "Primary customer contact, preselected for new portal invites."
                        : "First customer contact with an email, preselected for new portal invites."}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2">
                    Add an email to a related customer contact before inviting
                    portal access. Customer account email is not treated as a
                    separate portal-only contact.
                  </p>
                )}
              </section>

              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                <p className="font-medium text-slate-950">
                  Portal access status
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      activePortalGrantCount > 0
                        ? getPortalAccessStatusClasses("active")
                        : invitedPortalGrantCount > 0
                          ? getPortalAccessStatusClasses("invited")
                          : revokedPortalGrantCount > 0
                            ? getPortalAccessStatusClasses("revoked")
                            : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {portalAccessSummary.statusLabel}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {portalAccessSummary.activeSharedProjectCount} shared
                    project
                    {portalAccessSummary.activeSharedProjectCount === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
                <p className="mt-3">{portalAccessSummary.statusDescription}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Contact record, portal access grant, and login identity stay
                  separate. Access only reaches projects explicitly shared
                  below.
                </p>
                <Link
                  href={`/people?accessCustomerId=${customer.id}#customer-access`}
                  className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Open People access management
                </Link>
              </section>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {activePortalGrantCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Invited
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {invitedPortalGrantCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Revoked
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {revokedPortalGrantCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Shared Projects
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {portalAccessSummary.activeSharedProjectCount}
                </p>
              </div>
            </div>

            <details className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-base font-semibold text-slate-950">
                    Invite portal contact or adjust access
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Use this customer-local control when you are already in the
                    account. The recommended contact is selected when an email
                    is available.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Expand management
                </span>
              </summary>
              <section className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-2">
                  <p className="text-base font-semibold text-slate-950">
                    Invite contact to portal
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Select the customer contact and first visible project. The
                    invite creates or reuses a contact-linked grant; it does not
                    create an auth login until the customer accepts or support
                    issues a temporary credential.
                  </p>
                </div>
                <div className="mt-5">
                  <PortalAccessGrantForm
                    action={createPortalAccessGrantAction}
                    customerId={customer.id}
                    customerContacts={customerContactOptions}
                    defaultCustomerContactId={
                      portalAccessSummary.recommendedContact?.id ?? undefined
                    }
                    defaultEmail={
                      portalAccessSummary.recommendedContact?.email ?? undefined
                    }
                    projects={projects.map((project) => ({
                      id: project.id,
                      label: project.name,
                      status: project.status
                    }))}
                    returnTo={`/customers/${customer.id}`}
                  />
                </div>
              </section>

              {portalAccessGrants.length > 0 ? (
                <div className="space-y-6">
                  {portalAccessGrants.map((grant) => {
                    const projectAccess =
                      portalProjectAccessByGrantId.get(grant.id) ?? [];
                    const storedPortalPermission = grant.customerContactId
                      ? (portalPermissionsByCustomerContactId.get(
                          grant.customerContactId
                        ) ?? null)
                      : null;
                    const availableProjects = projects
                      .filter(
                        (project) =>
                          !projectAccess.some(
                            (access) => access.projectId === project.id
                          )
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
                                {grant.portalUser?.fullName ??
                                  grant.portalUser?.email ??
                                  grant.invitedEmail}
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
                                Grant type:{" "}
                                <span className="font-medium text-slate-950">
                                  {grant.customerContact
                                    ? "Linked contact grant"
                                    : "Customer-level grant"}
                                </span>
                              </p>
                              {grant.customerContact ? (
                                <>
                                  <p>
                                    Linked contact:{" "}
                                    <span className="font-medium text-slate-950">
                                      {grant.customerContact.contact
                                        ?.displayName ??
                                        "Linked customer contact"}
                                    </span>
                                  </p>
                                  <p>
                                    Contact email:{" "}
                                    <span className="font-medium text-slate-950">
                                      {grant.customerContact.contact?.email ??
                                        "Not provided"}
                                    </span>
                                  </p>
                                </>
                              ) : null}
                              <p>
                                Portal email:{" "}
                                <span className="font-medium text-slate-950">
                                  {grant.portalUser?.email ??
                                    grant.invitedEmail ??
                                    "Not captured"}
                                </span>
                              </p>
                              {grant.inviteExpiresAt &&
                              grant.status === "invited" ? (
                                <p>
                                  Invite expires:{" "}
                                  <span className="font-medium text-slate-950">
                                    {new Date(
                                      grant.inviteExpiresAt
                                    ).toLocaleString()}
                                  </span>
                                </p>
                              ) : null}
                              {grant.inviteAcceptedAt ? (
                                <p>
                                  Invite accepted:{" "}
                                  <span className="font-medium text-slate-950">
                                    {new Date(
                                      grant.inviteAcceptedAt
                                    ).toLocaleString()}
                                  </span>
                                </p>
                              ) : null}
                              {grant.temporaryCredentialRequiresPasswordChange ? (
                                <p>
                                  Temporary credential:{" "}
                                  <span className="font-medium text-amber-800">
                                    Password change required
                                  </span>
                                </p>
                              ) : null}
                              <p>
                                Granted projects:{" "}
                                <span className="font-medium text-slate-950">
                                  {
                                    projectAccess.filter(
                                      (access) => access.status === "active"
                                    ).length
                                  }
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

                          {grant.status === "revoked" && !grant.userId ? (
                            <p className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                              Invite revoked
                            </p>
                          ) : (
                            <form action={updatePortalAccessGrantStatusAction}>
                              <input
                                type="hidden"
                                name="portalAccessGrantId"
                                value={grant.id}
                              />
                              <input
                                type="hidden"
                                name="customerId"
                                value={customer.id}
                              />
                              <input
                                type="hidden"
                                name="customerContactId"
                                value={grant.customerContactId ?? ""}
                              />
                              <input
                                type="hidden"
                                name="userId"
                                value={grant.userId ?? ""}
                              />
                              <input
                                type="hidden"
                                name="invitedEmail"
                                value={
                                  grant.invitedEmail ??
                                  grant.portalUser?.email ??
                                  ""
                                }
                              />
                              <input
                                type="hidden"
                                name="status"
                                value={
                                  grant.status === "revoked"
                                    ? "active"
                                    : "revoked"
                                }
                              />
                              <ConfirmSubmitButton
                                message={
                                  grant.status === "revoked"
                                    ? "Reactivate this portal access grant?"
                                    : "Revoke this portal access grant? The customer will lose access controlled by this grant until it is reactivated."
                                }
                                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                              >
                                {grant.status === "revoked"
                                  ? "Reactivate access"
                                  : "Revoke access"}
                              </ConfirmSubmitButton>
                            </form>
                          )}
                        </div>

                        <div className="mt-6">
                          <PortalInviteEmailStatus
                            action={sendPortalInviteEmailAction}
                            customerId={customer.id}
                            portalAccessGrantId={grant.id}
                            status={grant.status}
                            delivery={grant.inviteEmailDelivery}
                          />
                        </div>

                        {canManageCustomerContacts &&
                        grant.status !== "revoked" &&
                        grant.customerContact ? (
                          <div className="mt-6">
                            <TemporaryPortalCredentialForm
                              customerId={customer.id}
                              portalAccessGrantId={grant.id}
                              returnTo={`/customers/${customer.id}`}
                              hasPortalUser={Boolean(grant.userId)}
                            />
                          </div>
                        ) : null}

                        <div className="mt-6 space-y-5">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                            <p className="text-sm font-medium text-slate-950">
                              Grant identity
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {grant.customerContact
                                ? "This grant is linked to one canonical related customer contact. Updating the link keeps the same portal user and project visibility while changing which contact permission profile applies."
                                : "This customer-level grant still works as legacy account-level access. Attach it to an existing related customer contact when this login should use contact-level permissions."}
                            </p>
                            {!grant.customerContact ? (
                              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                                Customer-level grants are not revoked or
                                migrated automatically. They continue to use
                                legacy portal behavior until a contractor admin
                                links the grant to an existing customer contact.
                              </div>
                            ) : null}
                            {grant.userId ? (
                              <div className="mt-4">
                                <form
                                  action={updatePortalAccessGrantLinkAction}
                                  className="space-y-4"
                                >
                                  <input
                                    type="hidden"
                                    name="portalAccessGrantId"
                                    value={grant.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="customerId"
                                    value={customer.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="userId"
                                    value={grant.userId ?? ""}
                                  />
                                  <input
                                    type="hidden"
                                    name="invitedEmail"
                                    value={
                                      grant.invitedEmail ??
                                      grant.portalUser?.email ??
                                      ""
                                    }
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value={grant.status}
                                  />
                                  <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-800">
                                      Related customer contact
                                    </span>
                                    <select
                                      name="customerContactId"
                                      defaultValue={
                                        grant.customerContactId ?? ""
                                      }
                                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                                    >
                                      {!grant.customerContactId ? (
                                        <option value="">
                                          Legacy customer-level grant
                                        </option>
                                      ) : null}
                                      {customerContactOptions.map(
                                        (customerContact) => (
                                          <option
                                            key={customerContact.id}
                                            value={customerContact.id}
                                          >
                                            {customerContact.label}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </label>
                                  <button
                                    type="submit"
                                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                                  >
                                    {grant.customerContactId
                                      ? "Update linked contact"
                                      : "Attach existing contact"}
                                  </button>
                                </form>
                              </div>
                            ) : (
                              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                                This invite is still pending. Revoke it and
                                create a fresh invite if the related contact
                                needs to change before acceptance.
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                            <p className="text-sm font-medium text-slate-950">
                              Permission readiness
                            </p>
                            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                              <p>
                                Contact:{" "}
                                <span className="font-medium text-slate-950">
                                  {grant.customerContact?.contact
                                    ?.displayName ??
                                    grant.portalUser?.fullName ??
                                    grant.portalUser?.email ??
                                    grant.invitedEmail ??
                                    "Customer-level portal user"}
                                </span>
                              </p>
                              <p>
                                Email:{" "}
                                <span className="font-medium text-slate-950">
                                  {grant.customerContact?.contact?.email ??
                                    grant.portalUser?.email ??
                                    grant.invitedEmail ??
                                    "Not captured"}
                                </span>
                              </p>
                              <p>
                                Grant scope:{" "}
                                <span className="font-medium text-slate-950">
                                  {grant.customerContact
                                    ? "Linked-contact grant"
                                    : "Customer-level grant"}
                                </span>
                              </p>
                              {grant.customerContact ? (
                                <>
                                  {storedPortalPermission ? (
                                    <>
                                      <p>
                                        Storage state:{" "}
                                        <span className="font-medium text-slate-950">
                                          Stored
                                        </span>
                                      </p>
                                      <p>
                                        Management state:{" "}
                                        <span className="font-medium text-slate-950">
                                          {formatManagementSourceLabel(
                                            storedPortalPermission.managementSource
                                          )}
                                        </span>
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          {
                                            label: "View estimates",
                                            enabled:
                                              storedPortalPermission.canViewEstimates
                                          },
                                          {
                                            label: "Approve estimates",
                                            enabled:
                                              storedPortalPermission.canApproveEstimates
                                          },
                                          {
                                            label: "Sign contracts",
                                            enabled:
                                              storedPortalPermission.canSignContracts
                                          },
                                          {
                                            label: "Approve change orders",
                                            enabled:
                                              storedPortalPermission.canApproveChangeOrders
                                          },
                                          {
                                            label: "View/pay invoices",
                                            enabled:
                                              storedPortalPermission.canViewPayInvoices
                                          },
                                          {
                                            label: "Request new quote",
                                            enabled:
                                              storedPortalPermission.canRequestQuotes
                                          }
                                        ].map((permission) => (
                                          <span
                                            key={permission.label}
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                                              permission.enabled
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                                : "border-slate-200 bg-slate-100 text-slate-700"
                                            }`}
                                          >
                                            {permission.enabled
                                              ? "Enabled"
                                              : "Disabled"}
                                            : {permission.label}
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-xs leading-5 text-slate-500">
                                        Stored permissions are enforced for
                                        linked-contact estimate decisions,
                                        change-order decisions, and contract
                                        sign/decline. Contract viewing,
                                        invoice/payment, quote requests, and
                                        customer-level grants keep their current
                                        behavior.
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex flex-wrap gap-2">
                                        {futurePortalPermissionReadiness.map(
                                          (permission) => (
                                            <span
                                              key={permission}
                                              className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900"
                                            >
                                              {permission}
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <p className="text-xs leading-5 text-slate-500">
                                        This linked-contact grant does not have
                                        a stored permission row yet. Save
                                        permissions before relying on
                                        contact-level decision authority for
                                        estimates, change orders, or contracts.
                                      </p>
                                    </>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs leading-5 text-slate-500">
                                  This customer-level grant still works as
                                  legacy account-level access. Contact-level
                                  permissions only apply after this grant is
                                  linked to one existing related customer
                                  contact.
                                </p>
                              )}
                            </div>
                          </div>

                          {grant.customerContact &&
                          canManageCustomerContacts ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                              <p className="text-sm font-medium text-slate-950">
                                Edit stored permissions
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                Save the linked contact's portal permission
                                profile. Estimate decisions, change-order
                                decisions, and contract sign/decline use these
                                stored flags for linked-contact grants.
                              </p>
                              <form
                                action={
                                  updateCustomerContactPortalPermissionAction
                                }
                                className="mt-4 space-y-4"
                              >
                                <input
                                  type="hidden"
                                  name="portalAccessGrantId"
                                  value={grant.id}
                                />
                                <input
                                  type="hidden"
                                  name="customerId"
                                  value={customer.id}
                                />
                                <input
                                  type="hidden"
                                  name="customerContactId"
                                  value={grant.customerContact.id}
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {[
                                    {
                                      name: "canViewEstimates",
                                      label: "View estimates",
                                      defaultChecked:
                                        storedPortalPermission?.canViewEstimates ??
                                        true
                                    },
                                    {
                                      name: "canApproveEstimates",
                                      label: "Approve estimates",
                                      defaultChecked:
                                        storedPortalPermission?.canApproveEstimates ??
                                        true
                                    },
                                    {
                                      name: "canSignContracts",
                                      label: "Sign contracts",
                                      defaultChecked:
                                        storedPortalPermission?.canSignContracts ??
                                        true
                                    },
                                    {
                                      name: "canApproveChangeOrders",
                                      label: "Approve change orders",
                                      defaultChecked:
                                        storedPortalPermission?.canApproveChangeOrders ??
                                        true
                                    },
                                    {
                                      name: "canViewPayInvoices",
                                      label: "View/pay invoices",
                                      defaultChecked:
                                        storedPortalPermission?.canViewPayInvoices ??
                                        true
                                    },
                                    {
                                      name: "canRequestQuotes",
                                      label: "Request new quote",
                                      defaultChecked:
                                        storedPortalPermission?.canRequestQuotes ??
                                        true
                                    }
                                  ].map((permission) => (
                                    <label
                                      key={permission.name}
                                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                                    >
                                      <input
                                        type="checkbox"
                                        name={permission.name}
                                        defaultChecked={
                                          permission.defaultChecked
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                                      />
                                      <span>{permission.label}</span>
                                    </label>
                                  ))}
                                </div>
                                <button
                                  type="submit"
                                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                                >
                                  Save stored permissions
                                </button>
                                <p className="text-xs leading-5 text-slate-500">
                                  Invoice/payment permissions are stored for
                                  later and are not enforced yet. Contract
                                  viewing, estimate send lookup, and project
                                  visibility are unchanged.
                                </p>
                              </form>
                            </div>
                          ) : null}

                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-950">
                              Visible projects
                            </p>
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
                                          {access.project?.name ??
                                            "Linked project"}
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
                                          {formatPortalStatusLabel(
                                            access.status
                                          )}
                                        </span>
                                        <form
                                          action={
                                            updatePortalProjectAccessStatusAction
                                          }
                                        >
                                          <input
                                            type="hidden"
                                            name="portalProjectAccessId"
                                            value={access.id}
                                          />
                                          <input
                                            type="hidden"
                                            name="customerId"
                                            value={customer.id}
                                          />
                                          <input
                                            type="hidden"
                                            name="portalAccessGrantId"
                                            value={access.portalAccessGrantId}
                                          />
                                          <input
                                            type="hidden"
                                            name="projectId"
                                            value={access.projectId}
                                          />
                                          <input
                                            type="hidden"
                                            name="status"
                                            value={
                                              access.status === "revoked"
                                                ? "active"
                                                : "revoked"
                                            }
                                          />
                                          <ConfirmSubmitButton
                                            message={
                                              access.status === "revoked"
                                                ? "Reactivate this project visibility for the portal contact?"
                                                : "Revoke this project visibility? The portal contact will no longer see this project until visibility is reactivated."
                                            }
                                            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                                          >
                                            {access.status === "revoked"
                                              ? "Reactivate"
                                              : "Revoke visibility"}
                                          </ConfirmSubmitButton>
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

                          {availableProjects.length > 0 &&
                          grant.status !== "revoked" ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                              <p className="text-sm font-medium text-slate-950">
                                Add project visibility
                              </p>
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
                  description="Portal access remains narrow in this pass: create or reuse one customer/contact grant, then explicitly grant the projects they should be able to review. Pending contacts need the app invite link to sign up or log in."
                />
              )}
            </details>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Edit Customer"
          description="Keep the customer recipient details editable here while the connected relationship context stays visible above."
        >
          <CustomerForm
            action={updateCustomerAction}
            submitLabel="Save customer"
            pendingLabel="Saving customer..."
            customer={customer}
          />
        </DetailPanel>
      </section>

      <aside className="min-w-0 space-y-6">
        <DirectoryContextCard
          href={`/directory?view=customers&q=${encodeURIComponent(customer.name)}`}
          recordLabel="Customer account"
          description="Directory is the contractor-side scan-and-jump index. This customer page remains the home for billing details, projects, and downstream workflow context; People owns contact identity and portal access administration."
        />

        <DetailPanel title="Customer Summary">
          <div className="mb-4 rounded-2xl border border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4 text-sm leading-6 text-[#2a2a2a]">
            <p className="font-medium text-[#171717]">Recipient details</p>
            <p className="mt-2">
              This customer record owns the external billing and
              estimate-recipient contact details. Estimate send uses{" "}
              <span className="font-semibold">customer.email</span>, while
              related customer contacts below stay linked through the customer
              account and do not replace that send/billing recipient lookup in
              this phase.
            </p>
          </div>
          <dl className="space-y-4 text-sm leading-6 text-slate-600">
            <div>
              <dt className="font-medium text-slate-950">Company</dt>
              <dd>{customer.companyName ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">
                Email (estimate send / billing)
              </dt>
              <dd>{customer.email ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">
                Phone (customer coordination)
              </dt>
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
              <dd>
                {customer.isTaxExempt ? "Tax exempt" : "Taxable by default"}
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
                <Link
                  href={`/invoices/${openInvoices[0].id}`}
                  className="font-medium text-brand-700"
                >
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
          title="Production Schedule"
          description="Compact production continuity across this customer's projects, while all scheduling actions still hand off to the shared schedule workspace."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <ScheduleContextMetrics
              items={[
                {
                  label: "Active/scheduled",
                  value: scheduledOrActiveJobs.length
                },
                { label: "Unscheduled", value: unscheduledJobs.length },
                { label: "In progress", value: activeJobs.length }
              ]}
            />

            {nextScheduledJob ? (
              <ScheduleContextFocusCard
                eyebrow={
                  nextScheduledJob.dispatchStatus === "in_progress"
                    ? "Work in progress"
                    : "Next scheduled job"
                }
                title={nextScheduledJob.project?.name ?? "Untitled project job"}
                titleHref={`/jobs/${nextScheduledJob.id}`}
                statusLabel={formatStatusLabel(nextScheduledJob.dispatchStatus)}
                summary={formatScheduleSummaryWindow({
                  scheduledDate: nextScheduledJob.scheduledDate,
                  scheduledStartAt: nextScheduledJob.scheduledStartAt,
                  scheduledEndAt: nextScheduledJob.scheduledEndAt
                })}
                detailRows={[
                  {
                    label: "Project",
                    value: (
                      <Link
                        href={`/projects/${nextScheduledJob.projectId}`}
                        className="font-medium text-brand-700"
                      >
                        {nextScheduledJob.project?.name ?? "Open project"}
                      </Link>
                    )
                  },
                  {
                    label: "Crew",
                    value:
                      nextScheduledAssignments.length > 0
                        ? nextScheduledCrewSummary
                        : nextScheduledJob.dispatchStatus === "scheduled"
                          ? "Scheduled, but crew assignment still needs to be confirmed"
                          : nextScheduledCrewSummary
                  }
                ]}
              />
            ) : (
              <ScheduleContextNotice
                eyebrow={
                  customerJobs.length > 0
                    ? "Ready for scheduling"
                    : "No jobs yet"
                }
                title={
                  customerJobs.length > 0
                    ? "Customer work exists, but no schedule commitment is set yet"
                    : "No production jobs exist for this customer yet"
                }
              >
                {customerJobs.length > 0
                  ? "Jobs already exist across this customer's projects, but they are still unscheduled. The next production handoff will appear here once a real date is attached."
                  : "Schedule continuity will appear here after downstream project jobs are created on the production chain."}
              </ScheduleContextNotice>
            )}

            <div className="space-y-2 text-sm leading-6 text-slate-600">
              <p>
                Crew assignment state:{" "}
                {jobsWithoutAssignments.length > 0
                  ? `${jobsWithoutAssignments.length} job${
                      jobsWithoutAssignments.length === 1 ? "" : "s"
                    } still need crew assignment rows`
                  : customerJobs.length > 0
                    ? "Crew coverage is already attached where needed"
                    : "No customer jobs yet"}
              </p>
            </div>

            <ScheduleContextActions
              actions={[
                { href: customerScheduleHref, label: "Open schedule" },
                ...(nextScheduledJob
                  ? [
                      {
                        href: `/projects/${nextScheduledJob.projectId}`,
                        label: "Open project",
                        variant: "subtle" as const
                      }
                    ]
                  : [])
              ]}
            />
          </div>
        </DetailPanel>

        <RelatedConversationsCard
          source="customer"
          description="Customer-scoped communication stays on shared threads and routes back into the communications review workspace when this relationship needs follow-through."
          countLabel="Customer threads"
          emptyMessage="No customer-scoped communication threads are attached to this customer yet."
          actionClassName="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          threads={communicationThreads}
        />

        <DetailPanel
          title="Portal Access Snapshot"
          description="A quick admin read on who can currently see this customer in the portal."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>Active portal users: {activePortalGrantCount}</p>
            <p>Invited portal users: {invitedPortalGrantCount}</p>
            <p>Revoked portal users: {revokedPortalGrantCount}</p>
            <p>
              Linked contact grants:{" "}
              {
                portalAccessGrants.filter((grant) => grant.customerContactId)
                  .length
              }
            </p>
            <p>
              Customer-level grants:{" "}
              {
                portalAccessGrants.filter((grant) => !grant.customerContactId)
                  .length
              }
            </p>
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
            <p>Related customer contacts: {customerContacts.length}</p>
            <p>
              Contact-linked portal readiness:{" "}
              {
                customerContacts.filter((customerContact) =>
                  customerContact.contact?.email?.trim()
                ).length
              }{" "}
              with email,{" "}
              {
                customerContacts.filter(
                  (customerContact) => !customerContact.contact?.email?.trim()
                ).length
              }{" "}
              missing email
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
