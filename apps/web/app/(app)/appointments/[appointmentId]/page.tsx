import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentForm } from "@/components/appointment-form";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { updateAppointmentAction } from "@/lib/appointments/actions";
import { getAppointmentById } from "@/lib/appointments/data";
import { listCustomers } from "@/lib/customers/data";
import { getOpportunityById, listOpportunities } from "@/lib/opportunities/data";
import { listPeople } from "@/lib/people/data";
import { getProjectById, listProjects } from "@/lib/projects/data";

type AppointmentDetailPageProps = {
  params: Promise<{
    appointmentId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
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

function formatDateTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(value))
    : "Not set";
}

function renderStatusBadge(label: string) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
      {label}
    </span>
  );
}

function getNextActionSummary(input: {
  status: string;
  hasLinkedRecords: boolean;
}) {
  if (!input.hasLinkedRecords) {
    return {
      title: "Connect the appointment to the right canonical record when possible",
      description:
        "Internal blocks can stay standalone, but customer- or project-facing appointments should attach to the shared opportunity, customer, or project chain so follow-through stays visible."
    };
  }

  if (input.status === "scheduled") {
    return {
      title: "Keep follow-through tied to the linked record after the meeting happens",
      description:
        "Appointments should coordinate the next commercial or operational step, then hand back into the lead, customer, or project workspace instead of becoming their own silo."
    };
  }

  if (input.status === "completed") {
    return {
      title: "Capture any resulting next step on the connected workflow",
      description:
        "Use the linked record to continue the real work after this appointment, whether that means estimate follow-up, project readiness, or customer coordination."
    };
  }

  if (input.status === "no_show") {
    return {
      title: "Reschedule only if the same workflow still needs the meeting",
      description:
        "If the appointment still matters, create the next time block against the same linked record so the continuity remains clear."
    };
  }

  return {
    title: "Canceled appointments should stay as history, not become duplicate work",
    description:
      "Leave the record attached to the same canonical chain so the team can see what was canceled without recreating disconnected meeting records elsewhere."
  };
}

export default async function AppointmentDetailPage({
  params,
  searchParams
}: AppointmentDetailPageProps) {
  const { appointmentId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const appointment = await getAppointmentById(
    appointmentId,
    `/appointments/${appointmentId}`
  );

  if (!appointment) {
    notFound();
  }

  const [opportunities, customers, projects, people, linkedOpportunity, linkedProject] =
    await Promise.all([
      listOpportunities(),
      listCustomers(),
      listProjects(),
      listPeople(),
      appointment.opportunityId
        ? getOpportunityById(appointment.opportunityId, `/appointments/${appointmentId}`)
        : Promise.resolve(null),
      appointment.projectId
        ? getProjectById(appointment.projectId, `/appointments/${appointmentId}`)
        : Promise.resolve(null)
    ]);

  const nextAction = getNextActionSummary({
    status: appointment.status,
    hasLinkedRecords: Boolean(
      appointment.opportunityId || appointment.customerId || appointment.projectId
    )
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Appointment Workspace"
            title={appointment.title}
            description="Use this page as the real contractor-side appointment workspace for one visit or meeting block. Keep it connected to the same lead, customer, and project chain without confusing it with a job."
            backHref="/appointments"
            backLabel="Back to appointments"
            actions={
              <>
                <div className="flex flex-wrap gap-3">
                  {appointment.opportunityId ? (
                    <Link
                      href={`/leads/${appointment.opportunityId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Open lead
                    </Link>
                  ) : null}
                  {appointment.customerId ? (
                    <Link
                      href={`/customers/${appointment.customerId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Open customer
                    </Link>
                  ) : null}
                  {appointment.projectId ? (
                    <Link
                      href={`/projects/${appointment.projectId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Open project
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {renderStatusBadge(formatTypeLabel(appointment.appointmentType))}
                  {renderStatusBadge(formatStatusLabel(appointment.status))}
                </div>
              </>
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

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "starts-at",
                  label: "Start time",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatDateTime(appointment.startsAt)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Appointments are time blocks for coordination, not execution jobs.
                      </p>
                    </>
                  )
                },
                {
                  key: "ends-at",
                  label: "End time",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatDateTime(appointment.endsAt)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        End time is optional for v1, but it helps clarify the planned block.
                      </p>
                    </>
                  )
                },
                {
                  key: "assignment",
                  label: "Assigned person",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {appointment.assignedPerson?.displayName ?? "Unassigned"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Use the shared people model when one internal owner should carry the appointment.
                      </p>
                    </>
                  )
                },
                {
                  key: "next-action",
                  label: "Next best action",
                  content: (
                    <NextActionCard
                      title={nextAction.title}
                      description={nextAction.description}
                      className="space-y-3 text-sm leading-6 text-slate-600"
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <DetailPanel
            title="Appointment Details"
            description="Edit the canonical appointment directly here. Visits and meetings stay connected to the same lead, customer, and project records instead of becoming a separate calendar silo."
          >
            <AppointmentForm
              action={updateAppointmentAction}
              appointment={{
                id: appointment.id,
                opportunityId: appointment.opportunityId,
                customerId: appointment.customerId,
                projectId: appointment.projectId,
                assignedPersonId: appointment.assignedPersonId,
                title: appointment.title,
                appointmentType: appointment.appointmentType,
                startsAt: appointment.startsAt,
                endsAt: appointment.endsAt,
                location: appointment.location,
                notes: appointment.notes,
                status: appointment.status
              }}
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
              redirectTo={`/appointments/${appointment.id}`}
            />
          </DetailPanel>

          <DetailPanel
            title="Linked Workflow Context"
            description="Appointments should point back into the real lead, customer, and project workspaces so follow-through continues on the shared canonical chain."
          >
            <div className="grid gap-4">
              {appointment.opportunity ? (
                <LinkedRecordCard
                  href={`/leads/${appointment.opportunity.id}`}
                  title={appointment.opportunity.title}
                  subtitle="Linked lead"
                  meta={formatStatusLabel(appointment.opportunity.status)}
                  badge={renderStatusBadge("Commercial")}
                />
              ) : null}
              {appointment.customer ? (
                <LinkedRecordCard
                  href={`/customers/${appointment.customer.id}`}
                  title={appointment.customer.name}
                  subtitle="Linked customer"
                  meta={appointment.customer.companyName ?? "Customer account"}
                  badge={renderStatusBadge("Relationship")}
                />
              ) : null}
              {appointment.project ? (
                <LinkedRecordCard
                  href={`/projects/${appointment.project.id}`}
                  title={appointment.project.name}
                  subtitle="Linked project"
                  meta={formatStatusLabel(appointment.project.status)}
                  badge={renderStatusBadge("Operational root")}
                />
              ) : null}
              {!appointment.opportunity && !appointment.customer && !appointment.project ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  This is currently an internal appointment with no linked lead, customer, or project.
                </div>
              ) : null}
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Appointment Notes"
          description="Meeting context belongs here only as appointment context. Any resulting commercial or operational work should continue on the linked canonical records."
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-slate-600">
            {appointment.notes?.trim() || "No appointment notes have been captured yet."}
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Appointment Context"
          description="Compact facts stay in the rail so the main workspace can stay focused on coordination and continuity."
        >
          <ContextFactsList
            items={[
              {
                label: "Type",
                value: formatTypeLabel(appointment.appointmentType)
              },
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(appointment.status)}</span>
              },
              {
                label: "Assigned person",
                value: appointment.assignedPerson?.displayName ?? "Unassigned"
              },
              {
                label: "Location",
                value: appointment.location ?? "Not provided"
              },
              {
                label: "Lead",
                value: appointment.opportunity ? (
                  <Link
                    href={`/leads/${appointment.opportunity.id}`}
                    className="font-medium text-brand-700"
                  >
                    {appointment.opportunity.title}
                  </Link>
                ) : (
                  "No linked lead"
                )
              },
              {
                label: "Customer",
                value: appointment.customer ? (
                  <Link
                    href={`/customers/${appointment.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {appointment.customer.name}
                  </Link>
                ) : linkedProject?.customer ? (
                  <Link
                    href={`/customers/${linkedProject.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {linkedProject.customer.name}
                  </Link>
                ) : (
                  "No linked customer"
                )
              },
              {
                label: "Project",
                value: appointment.project ? (
                  <Link
                    href={`/projects/${appointment.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {appointment.project.name}
                  </Link>
                ) : (
                  "No linked project"
                )
              },
              {
                label: "Created",
                value: new Date(appointment.createdAt).toLocaleString()
              },
              {
                label: "Updated",
                value: new Date(appointment.updatedAt).toLocaleString()
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Workflow Guidance"
          description="Appointments are part of the shared chain, but they are not a second execution system."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              Use appointments for site visits, estimate meetings, follow-up visits, and internal coordination blocks.
            </p>
            <p>
              Use jobs for real execution work, crew scheduling, and field delivery. If the work block needs crew-state and execution tracking, it belongs on a job instead.
            </p>
            {linkedOpportunity ? (
              <p>
                This appointment is linked to lead status{" "}
                <span className="font-medium text-slate-950">
                  {formatStatusLabel(linkedOpportunity.status)}
                </span>
                , so keep the commercial follow-through visible there after the meeting happens.
              </p>
            ) : null}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
