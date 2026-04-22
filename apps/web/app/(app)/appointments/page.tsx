import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { AppointmentQuickCreateForm } from "@/components/appointment-quick-create-form";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateAppointmentAction } from "@/lib/appointments/actions";
import { listAppointments } from "@/lib/appointments/data";
import { listCustomers } from "@/lib/customers/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listOpportunities } from "@/lib/opportunities/data";
import { listPeople } from "@/lib/people/data";
import { listProjects } from "@/lib/projects/data";

type AppointmentStatusFilter =
  | "all"
  | "scheduled"
  | "completed"
  | "canceled"
  | "no_show";

type AppointmentTypeFilter =
  | "all"
  | "site_visit"
  | "customer_meeting"
  | "estimate_appointment"
  | "follow_up"
  | "internal";

type AppointmentsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    customerId?: string;
    error?: string;
    message?: string;
    opportunityId?: string;
    projectId?: string;
    q?: string;
    status?: AppointmentStatusFilter;
    type?: AppointmentTypeFilter;
  }>;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatTypeLabel(value: string) {
  switch (value) {
    case "site_visit":
      return "Site visit";
    case "customer_meeting":
      return "Customer meeting";
    case "estimate_appointment":
      return "Estimate appointment";
    case "follow_up":
      return "Follow-up visit";
    case "internal":
      return "Internal";
    default:
      return formatStatusLabel(value);
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function buildAppointmentsHref(input: {
  compose?: string;
  customerId?: string;
  opportunityId?: string;
  projectId?: string;
  q?: string;
  status?: string;
  type?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.type && input.type !== "all") {
    searchParams.set("type", input.type);
  }

  if (input.opportunityId) {
    searchParams.set("opportunityId", input.opportunityId);
  }

  if (input.customerId) {
    searchParams.set("customerId", input.customerId);
  }

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/appointments?${query}` : "/appointments";
}

export default async function AppointmentsPage({
  searchParams
}: AppointmentsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/appointments");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Appointments need an active organization before they can be managed.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [appointments, opportunities, customers, projects, people] = await Promise.all([
    listAppointments(),
    listOpportunities(),
    listCustomers(),
    listProjects(),
    listPeople()
  ]);

  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const typeFilter = resolvedSearchParams.type ?? "all";
  const linkedOpportunityId = resolvedSearchParams.opportunityId;
  const linkedCustomerId = resolvedSearchParams.customerId;
  const linkedProjectId = resolvedSearchParams.projectId;
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error);

  const scopedAppointments = appointments.filter((appointment) => {
    if (linkedOpportunityId && appointment.opportunityId !== linkedOpportunityId) {
      return false;
    }

    if (linkedCustomerId && appointment.customerId !== linkedCustomerId) {
      return false;
    }

    if (linkedProjectId && appointment.projectId !== linkedProjectId) {
      return false;
    }

    return true;
  });

  const scheduledAppointments = scopedAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const todayCount = scheduledAppointments.filter((appointment) =>
    isToday(appointment.startsAt)
  ).length;
  const upcomingCount = scheduledAppointments.filter(
    (appointment) => !isToday(appointment.startsAt)
  ).length;
  const completedCount = scopedAppointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;
  const nextAction =
    scheduledAppointments.length > 0
      ? {
          title: "Keep the next visit or meeting attached to the right canonical record",
          description:
            "Appointments should move commercial and operational coordination forward without becoming a second job scheduler. Use the linked lead, customer, or project to keep follow-through grounded."
        }
      : {
          title: "Create the next real appointment when coordination needs a time block",
          description:
            "Use appointments for visits, estimate meetings, and follow-up blocks. Keep execution work itself on canonical jobs."
        };

  const filteredAppointments = scopedAppointments.filter((appointment) => {
    const matchesStatus =
      statusFilter === "all" ? true : appointment.status === statusFilter;
    const matchesType =
      typeFilter === "all" ? true : appointment.appointmentType === typeFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            appointment.title,
            appointment.location ?? "",
            appointment.notes ?? "",
            appointment.opportunity?.title ?? "",
            appointment.customer?.name ?? "",
            appointment.project?.name ?? "",
            appointment.assignedPerson?.displayName ?? "",
            appointment.appointmentType,
            appointment.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesType && matchesQuery;
  });

  const appointmentViews = [
    { key: "all", label: "All appointments", count: scopedAppointments.length },
    { key: "scheduled", label: "Scheduled", count: scheduledAppointments.length },
    { key: "completed", label: "Completed", count: completedCount },
    {
      key: "canceled",
      label: "Canceled",
      count: scopedAppointments.filter((appointment) => appointment.status === "canceled").length
    },
    {
      key: "no_show",
      label: "No-show",
      count: scopedAppointments.filter((appointment) => appointment.status === "no_show").length
    }
  ] as const;

  const scopedContextLabel = linkedProjectId
    ? projects.find((project) => project.id === linkedProjectId)?.name ?? "Selected project"
    : linkedCustomerId
      ? customers.find((customer) => customer.id === linkedCustomerId)?.name ??
        "Selected customer"
      : linkedOpportunityId
        ? opportunities.find((opportunity) => opportunity.id === linkedOpportunityId)?.title ??
          "Selected lead"
        : null;

  return (
    <ContractorWorkspacePage
      eyebrow="Appointments"
      title={`Visits and meetings for ${organizationContext.organization.displayName}`}
      description="Use appointments for commercial and operational coordination blocks tied to the same lead, customer, and project chain. Keep execution records and crew scheduling on canonical jobs."
      summary={
        <WorkspaceSummaryBand
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)]"
          items={[
            {
              key: "today",
              label: "Scheduled today",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {todayCount}
                </p>
              )
            },
            {
              key: "upcoming",
              label: "Scheduled ahead",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {upcomingCount}
                </p>
              )
            },
            {
              key: "completed",
              label: "Completed",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {completedCount}
                </p>
              )
            },
            {
              key: "next-action",
              label: "Next best action",
              content: (
                <NextActionCard
                  eyebrow="Workflow guidance"
                  title={nextAction.title}
                  description={nextAction.description}
                  className="space-y-3 text-sm leading-6 text-slate-600"
                />
              )
            }
          ]}
        />
      }
      commandBar={{
        supportSlot: (
          <p>
            {scopedContextLabel
              ? `This view is currently focused on ${scopedContextLabel}. Appointments stay connected to that same canonical chain instead of living in a separate calendar silo.`
              : "Review upcoming visits, customer meetings, estimate appointments, and follow-up blocks from one manager surface without confusing them with jobs."}
          </p>
        ),
        searchSlot: (
          <form action="/appointments" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            {linkedOpportunityId ? (
              <input type="hidden" name="opportunityId" value={linkedOpportunityId} />
            ) : null}
            {linkedCustomerId ? (
              <input type="hidden" name="customerId" value={linkedCustomerId} />
            ) : null}
            {linkedProjectId ? (
              <input type="hidden" name="projectId" value={linkedProjectId} />
            ) : null}
            <select
              name="type"
              defaultValue={typeFilter}
              className="rounded-[4px] border border-[#d9dee8] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
            >
              <option value="all">All types</option>
              <option value="site_visit">Site visits</option>
              <option value="customer_meeting">Customer meetings</option>
              <option value="estimate_appointment">Estimate appointments</option>
              <option value="follow_up">Follow-up visits</option>
              <option value="internal">Internal</option>
            </select>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, location, lead, customer, project, or assignee"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 ||
            statusFilter !== "all" ||
            typeFilter !== "all" ||
            showComposer ||
            linkedOpportunityId ||
            linkedCustomerId ||
            linkedProjectId ? (
              <Link
                href="/appointments"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: appointmentViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildAppointmentsHref({
                q: query,
                status: view.key,
                type: typeFilter,
                compose: showComposer ? "1" : undefined,
                opportunityId: linkedOpportunityId,
                customerId: linkedCustomerId,
                projectId: linkedProjectId
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildAppointmentsHref({
                q: query,
                status: statusFilter,
                type: typeFilter,
                compose: "1",
                opportunityId: linkedOpportunityId,
                customerId: linkedCustomerId,
                projectId: linkedProjectId
              }) + "#appointment-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            New appointment
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
                <div className="hidden grid-cols-[minmax(0,1.2fr)_220px_190px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Appointment</span>
                  <span>Continuity</span>
                  <span>Timing</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Appointments
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {filteredAppointments.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/appointments/${appointment.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_220px_190px_140px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {appointment.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {formatTypeLabel(appointment.appointmentType)}
                          {appointment.location ? ` | ${appointment.location}` : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Continuity
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {appointment.project?.name ??
                            appointment.customer?.name ??
                            appointment.opportunity?.title ??
                            "Internal appointment"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {appointment.assignedPerson?.displayName ??
                            "No assigned person"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Timing
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDateTime(appointment.startsAt)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {appointment.endsAt
                            ? `Ends ${formatDateTime(appointment.endsAt)}`
                            : "End time not set"}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span className="inline-flex rounded-[4px] border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatStatusLabel(appointment.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={
                      scopedAppointments.length > 0
                        ? "No matching appointments"
                        : "No appointments yet"
                    }
                    title={
                      scopedAppointments.length > 0
                        ? "Adjust the appointment filters"
                        : "Create the first appointment"
                    }
                    description={
                      scopedAppointments.length > 0
                        ? "Try a broader search, change the status view, or widen the linked record scope."
                        : "Appointments are now real canonical visit and meeting records connected to leads, customers, and projects without becoming a second job scheduler."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="appointment-create"
          title="Quick create appointment"
          description="Capture the time block and its canonical continuity here, create the appointment first, and then finish notes and follow-through in the full workspace."
          open={showComposer}
          openHref={
            buildAppointmentsHref({
              q: query,
              status: statusFilter,
              type: typeFilter,
              compose: "1",
              opportunityId: linkedOpportunityId,
              customerId: linkedCustomerId,
              projectId: linkedProjectId
            }) + "#appointment-create"
          }
          closeHref={
            buildAppointmentsHref({
              q: query,
              status: statusFilter,
              type: typeFilter,
              opportunityId: linkedOpportunityId,
              customerId: linkedCustomerId,
              projectId: linkedProjectId
            })
          }
          openLabel="Open appointment quick create"
        >
          <AppointmentQuickCreateForm
            action={quickCreateAppointmentAction}
            opportunities={opportunities.map((opportunity) => ({
              id: opportunity.id,
              title: opportunity.title
            }))}
            customers={customers.map((customer) => ({
              id: customer.id,
              name: customer.name
            }))}
            projects={projects.map((project) => ({
              id: project.id,
              name: project.name,
              customerId: project.customerId
            }))}
            people={people
              .filter((person) => person.isActive)
              .map((person) => ({
                id: person.id,
                displayName: person.displayName
              }))}
            defaultOpportunityId={linkedOpportunityId}
            defaultCustomerId={linkedCustomerId}
            defaultProjectId={linkedProjectId}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
