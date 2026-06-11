import Link from "next/link";
import { notFound } from "next/navigation";
import {
  normalizeWorkspaceFrameworkV2ViewId,
  StatusBadge,
  type WorkspaceFrameworkV2ViewId
} from "@floorconnector/ui";

import { AppEmptyState } from "@/components/app-empty-state";
import { DirectoryContextCard } from "@/components/directory-context-card";
import { GateKeeperSubjectMemoryPanel } from "@/components/gatekeeper-subject-memory-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { OpportunityCommunicationLogForm } from "@/components/opportunity-communication-log-form";
import { OpportunityForm } from "@/components/opportunity-form";
import { OpportunityFollowUpForm } from "@/components/opportunity-follow-up-form";
import { RoleSlotControls } from "@/components/role-slots/role-slot-controls";
import { WorkItemCreateForm } from "@/components/work-items/work-item-create-form";
import { WorkItemList } from "@/components/work-items/work-item-list";
import { StandardWorkspaceLayout } from "@/components/workspace/standard-workspace-layout";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listAppointmentsByOpportunity } from "@/lib/appointments/data";
import { createOpportunityManualCommunicationMessageAction } from "@/lib/communications/actions";
import { listOpportunityCommunicationMessages } from "@/lib/communications/data";
import { getGateKeeperSubjectMemory } from "@/lib/gatekeeper/memory";
import {
  startEstimateFromOpportunityAction,
  updateOpportunityAction,
  updateOpportunityFollowUpAction,
  updateOpportunityStatusAction
} from "@/lib/opportunities/actions";
import { getOpportunityById } from "@/lib/opportunities/data";
import { deriveSalesEstimateReadiness } from "@/lib/opportunities/follow-up-read-model";
import {
  formatOpportunityStatusLabel,
  opportunityStatusesList
} from "@/lib/opportunities/schemas";
import { listPeople } from "@/lib/people/data";
import { createOpportunityAssessmentPackageAction } from "@/lib/projects/assessment-package-actions";
import { listAssessmentPackagesByOpportunity } from "@/lib/projects/assessment-package-data";
import { updateOpportunityRoleSlotsAction } from "@/lib/role-slots/actions";
import { selectRoleSlotPersonOptions } from "@/lib/role-slots/read-model";
import {
  completeWorkItemAction,
  createWorkItemAction,
  dismissWorkItemAction,
  updateWorkItemAssignmentAction
} from "@/lib/work-items/actions";
import { listWorkItemsForSource } from "@/lib/work-items/data";
import {
  buildEstimateHandoffWorkItemPrefill,
  buildOpportunityFollowUpWorkItemPrefill
} from "@/lib/work-items/prefill";
import {
  getWorkItemNextAction,
  selectOpenEstimateHandoffWorkItems,
  selectWorkItemAssignmentCandidates
} from "@/lib/work-items/read-model";

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    view?: string;
    workItemCue?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatAddress(parts: Array<string | null | undefined>) {
  const filtered = parts.filter((value) => value && value.trim().length > 0);

  return filtered.length > 0 ? filtered.join(", ") : "Not provided";
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not scheduled";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function formatMeasurementValue(
  value: string,
  unit: string,
  quantity: number | null
) {
  const quantityLabel = quantity ? ` x ${quantity}` : "";
  return `${value} ${unit}${quantityLabel}`.trim();
}

function formatCommunicationKind(value: string) {
  switch (value) {
    case "manual_call":
      return "Call";
    case "manual_email_note":
      return "Email note";
    case "manual_text_note":
      return "Text note";
    case "voicemail":
      return "Voicemail";
    case "internal_note":
      return "Internal note";
    case "appointment_note":
      return "Appointment note";
    case "customer_message":
      return "Customer message";
    default:
      return value.replaceAll("_", " ");
  }
}

function getVisibilityClasses(value: string) {
  return value === "customer_visible"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-slate-200 bg-white text-slate-700";
}

function formatVisibility(value: string) {
  return value === "customer_visible" ? "Customer-visible" : "Internal";
}

function formatCommunicationActor(senderType: string) {
  switch (senderType) {
    case "organization_user":
      return "Team member";
    case "portal_user":
      return "Customer";
    case "system":
      return "System";
    default:
      return "Unknown";
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "qualified":
    case "site_assessment_complete":
    case "estimating":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "contacted":
    case "site_assessment_scheduled":
    case "proposal_sent":
      return "border-[#d6d6d6] bg-[#f8f8f8] text-[#2a2a2a]";
    case "won":
    case "converted":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "lost":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

function OpportunityStatusControl({
  opportunity,
  returnTo
}: {
  opportunity: NonNullable<Awaited<ReturnType<typeof getOpportunityById>>>;
  returnTo: string;
}) {
  return (
    <form
      action={updateOpportunityStatusAction}
      className="rounded-2xl border border-[#e2d4c5] bg-[#fbf5ee] px-4 py-3"
    >
      <input type="hidden" name="opportunityId" value={opportunity.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f5b32]">
          Opportunity status
        </span>
        <select
          name="status"
          defaultValue={opportunity.status}
          className="mt-2 h-10 w-full rounded-[6px] border border-[#d9cdc2] bg-white px-3 text-sm font-medium text-[#221a14] outline-none transition focus:border-[#ef7d32]"
        >
          {opportunityStatusesList.map((status) => (
            <option key={status} value={status}>
              {formatOpportunityStatusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[#6f6256]">
          Uses the existing opportunity status list. Site visit scheduling
          details stay in the Site Visit view.
        </p>
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-full bg-brand-700 px-4 text-sm font-medium text-white transition hover:bg-brand-900"
        >
          Save status
        </button>
      </div>
    </form>
  );
}

function getReadinessToneClasses(tone: "ready" | "attention" | "blocked") {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}

function getLeadNextAction(input: {
  opportunity: NonNullable<Awaited<ReturnType<typeof getOpportunityById>>>;
  appointmentHref: string;
  estimateHandoffHref: string;
  qualificationHref: string;
  siteVisitHref: string;
  estimatePlanHref: string;
  canStartEstimate: boolean;
  estimateWriterName: string | null;
}) {
  if (input.opportunity.status === "lost") {
    return {
      title: "Reopen the opportunity before scheduling or estimating",
      description:
        "Lost opportunities stay out of the appointment and estimate handoff until the status is intentionally changed.",
      href: input.qualificationHref,
      label: "Review qualification",
      kind: "link" as const
    };
  }

  if (
    input.opportunity.siteAssessmentStatus === "pending" ||
    input.opportunity.status === "new" ||
    input.opportunity.status === "contacted" ||
    input.opportunity.status === "qualified"
  ) {
    return {
      title: "Create the site visit / inspection appointment",
      description:
        "Finish Lead Intake details, then schedule the site visit on this opportunity before it enters the customer and project chain.",
      href: input.appointmentHref,
      label: "Create site visit",
      kind: "link" as const
    };
  }

  if (input.opportunity.siteAssessmentStatus === "scheduled") {
    return {
      title: "Complete the site visit and capture requirements",
      description:
        "A site visit is scheduled. Capture the inspection outcome and requirements summary here before estimating.",
      href: input.siteVisitHref,
      label: "Update site visit",
      kind: "link" as const
    };
  }

  if (
    input.opportunity.status === "site_assessment_complete" ||
    input.opportunity.status === "estimating" ||
    input.opportunity.siteAssessmentStatus === "completed"
  ) {
    return {
      title: input.estimateWriterName
        ? "Continue estimating handoff"
        : "Assign Estimate Writer",
      description: input.estimateWriterName
        ? `${input.estimateWriterName} is assigned to write the estimate. Keep the handoff, source notes, and estimate start action on this opportunity.`
        : "The site assessment is ready for estimating. Assign the estimate writer from this opportunity before or alongside starting the estimate flow.",
      href: input.estimateHandoffHref,
      label: input.estimateWriterName
        ? "Open estimating handoff"
        : "Assign Estimate Writer",
      kind: "link" as const
    };
  }

  if (input.canStartEstimate) {
    return {
      title: "Continue to project / estimate when ready",
      description:
        "Assessment context is ready. Starting the estimate creates or links the customer and project records without duplicating pre-sale truth.",
      href: input.estimatePlanHref,
      label: "Start estimate",
      kind: "estimate" as const
    };
  }

  return {
    title: "Keep opportunity context current",
    description:
      "Review contact details, site visit state, scope intake, and estimate planning notes.",
    href: input.qualificationHref,
    label: "Review opportunity",
    kind: "link" as const
  };
}

function getLeadWorkspaceHref(
  leadWorkspaceHref: string,
  view: WorkspaceFrameworkV2ViewId,
  options?: {
    workItemCue?: string;
  }
) {
  const params = new URLSearchParams({ view });

  if (options?.workItemCue) {
    params.set("workItemCue", options.workItemCue);
  }

  return `${leadWorkspaceHref}?${params.toString()}`;
}

export default async function LeadDetailPage({
  params,
  searchParams
}: LeadDetailPageProps) {
  const { leadId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const opportunity = await getOpportunityById(leadId, `/leads/${leadId}`);

  if (!opportunity) {
    notFound();
  }

  const [
    leadAppointments,
    communicationMessages,
    gateKeeperMemory,
    linkedWorkItems,
    assessmentPackages,
    people
  ] = await Promise.all([
    listAppointmentsByOpportunity(leadId, `/leads/${leadId}`),
    listOpportunityCommunicationMessages(leadId, `/leads/${leadId}`),
    getGateKeeperSubjectMemory({
      subjectType: "opportunity",
      subjectId: leadId,
      limit: 6
    }),
    listWorkItemsForSource({
      sourceType: "opportunity",
      sourceId: leadId
    }),
    listAssessmentPackagesByOpportunity(leadId),
    listPeople()
  ]);

  const primaryEstimateHref = opportunity.projectId
    ? `/estimates?projectId=${opportunity.projectId}&opportunityId=${opportunity.id}`
    : null;
  const canStartEstimate = opportunity.status !== "lost";
  const leadAppointmentHref = `/appointments?compose=1&opportunityId=${opportunity.id}${opportunity.customerId ? `&customerId=${opportunity.customerId}` : ""}${opportunity.projectId ? `&projectId=${opportunity.projectId}` : ""}#appointment-create`;
  const leadWorkspaceHref = `/leads/${opportunity.id}`;
  const currentView = normalizeWorkspaceFrameworkV2ViewId(
    resolvedSearchParams.view
  );
  const overviewHref = getLeadWorkspaceHref(leadWorkspaceHref, "overview");
  const qualificationHref = getLeadWorkspaceHref(
    leadWorkspaceHref,
    "qualification"
  );
  const siteVisitHref = getLeadWorkspaceHref(leadWorkspaceHref, "site-visit");
  const assessmentPackageHref = getLeadWorkspaceHref(
    leadWorkspaceHref,
    "assessment-package"
  );
  const estimatePlanHref = getLeadWorkspaceHref(
    leadWorkspaceHref,
    "estimate-plan"
  );
  const workItemsHref = getLeadWorkspaceHref(leadWorkspaceHref, "work-items");
  const estimateHandoffCueHref = getLeadWorkspaceHref(
    leadWorkspaceHref,
    "work-items",
    { workItemCue: "estimate_handoff" }
  );
  const communicationHref = getLeadWorkspaceHref(
    leadWorkspaceHref,
    "communication"
  );
  const activityHref = getLeadWorkspaceHref(leadWorkspaceHref, "activity");
  const sourceOwnerPerson = opportunity.createdByUserId
    ? (people.find(
        (person) => person.membershipUserId === opportunity.createdByUserId
      ) ?? null)
    : null;
  const estimateHandoffWorkItems = selectOpenEstimateHandoffWorkItems({
    workItems: linkedWorkItems,
    opportunityId: opportunity.id,
    projectId: opportunity.projectId
  });
  const existingOpenEstimateHandoff = estimateHandoffWorkItems[0] ?? null;
  const estimateHandoffCueRequested =
    resolvedSearchParams.workItemCue === "estimate_handoff";
  const estimateHandoffNextAction =
    opportunity.siteAssessmentStatus === "completed" ||
    opportunity.measurements.length > 0 ||
    opportunity.observations.length > 0 ||
    opportunity.attachments.length > 0 ||
    Boolean(opportunity.requirementsSummary?.trim())
      ? "Draft the estimate from the captured site assessment packet."
      : opportunity.siteAssessmentStatus === "scheduled"
        ? "Complete the scheduled site visit, then draft the estimate from captured context."
        : "Capture requirements and measurements before drafting the estimate.";
  const leadFollowUpWorkItemPrefill =
    resolvedSearchParams.workItemCue === "follow_up"
      ? buildOpportunityFollowUpWorkItemPrefill({
          opportunityId: opportunity.id,
          title: opportunity.title,
          status: opportunity.status,
          contactName:
            opportunity.primaryContact?.displayName ?? opportunity.prospectName,
          companyName:
            opportunity.primaryContact?.companyName ??
            opportunity.prospectCompanyName,
          customerName: opportunity.customer?.name ?? null,
          nextFollowUpAt: opportunity.nextFollowUpAt,
          nextFollowUpNote: opportunity.nextFollowUpNote,
          lastCommunicationAt: communicationMessages.at(-1)?.createdAt ?? null
        })
      : null;
  const estimateHandoffWorkItemPrefill =
    estimateHandoffCueRequested && !existingOpenEstimateHandoff
      ? buildEstimateHandoffWorkItemPrefill({
          opportunityId: opportunity.id,
          projectId: opportunity.projectId,
          opportunityTitle: opportunity.title,
          customerName: opportunity.customer?.name ?? null,
          projectName: opportunity.project?.name ?? null,
          contactName:
            opportunity.primaryContact?.displayName ?? opportunity.prospectName,
          sourceOwnerUserId: sourceOwnerPerson
            ? opportunity.createdByUserId
            : null,
          sourceOwnerName: sourceOwnerPerson?.displayName ?? null,
          nextAction: estimateHandoffNextAction,
          requirementsSummary: opportunity.requirementsSummary,
          notes: opportunity.notes,
          siteAssessmentStatus: opportunity.siteAssessmentStatus,
          siteAssessmentScheduledAt: opportunity.siteAssessmentScheduledAt,
          siteAssessmentCompletedAt: opportunity.siteAssessmentCompletedAt,
          measurements: opportunity.measurements,
          observations: opportunity.observations,
          attachmentCount: opportunity.attachments.length
        })
      : null;
  const leadWorkItemPrefill =
    estimateHandoffWorkItemPrefill ?? leadFollowUpWorkItemPrefill;
  const assignablePeople = selectWorkItemAssignmentCandidates(people);
  const roleSlotPeople = selectRoleSlotPersonOptions(people);
  const existingEstimateHandoffNextAction = existingOpenEstimateHandoff
    ? getWorkItemNextAction(existingOpenEstimateHandoff)
    : null;
  const estimatingHandoffHref = existingOpenEstimateHandoff
    ? estimatePlanHref
    : estimateHandoffCueHref;
  const estimateWriterName =
    existingOpenEstimateHandoff?.assignedPerson?.displayName ?? null;
  const salesEstimateReadiness = deriveSalesEstimateReadiness({
    status: opportunity.status,
    customerId: opportunity.customerId,
    projectId: opportunity.projectId,
    siteAssessmentStatus: opportunity.siteAssessmentStatus,
    requirementsSummary: opportunity.requirementsSummary,
    measurementCount: opportunity.measurements.length,
    observationCount: opportunity.observations.length,
    attachmentCount: opportunity.attachments.length,
    estimateWriterName
  });
  const nextAction = getLeadNextAction({
    opportunity,
    appointmentHref: leadAppointmentHref,
    estimateHandoffHref: estimatingHandoffHref,
    qualificationHref,
    siteVisitHref,
    estimatePlanHref,
    estimateWriterName,
    canStartEstimate
  });
  const estimatingReadiness = opportunity.projectId
    ? "This opportunity is already linked into the live project and estimating chain."
    : opportunity.siteAssessmentStatus === "completed" ||
        (opportunity.requirementsSummary &&
          opportunity.requirementsSummary.trim().length > 0)
      ? "Commercial context is ready to feed estimating. Start the estimate flow when you are ready."
      : opportunity.siteAssessmentStatus === "scheduled"
        ? "A site assessment is scheduled. Complete it and capture requirements before handing off to estimating."
        : "Capture assessment timing and requirements here so the estimating handoff does not rely on re-entry later.";

  return (
    <StandardWorkspaceLayout
      header={{
        eyebrow: "Opportunity Workspace",
        title: opportunity.title,
        description:
          "Use Lead Intake for the first inquiry, then manage this Sales Opportunity as it is qualified, assessed, planned, and handed to estimating.",
        actions: (
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/leads"
              className="inline-flex items-center rounded-full border border-[#e2d4c5] bg-[#fbf5ee] px-3.5 py-2 text-sm font-medium text-[#5f4d40] transition hover:border-[#caac88] hover:bg-white hover:text-[#2b2118]"
            >
              Back to Leads & Opportunities
            </Link>
            <Link
              href={leadAppointmentHref}
              className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
            >
              Create site visit
            </Link>
          </div>
        )
      }}
      sidebar={[
        {
          id: "overview",
          label: "Overview",
          iconName: "home",
          href: overviewHref
        },
        {
          id: "qualification",
          label: "Qualification",
          iconName: "clipboard-list",
          href: qualificationHref
        },
        {
          id: "site-visit",
          label: "Site Visit",
          iconName: "check-square",
          href: siteVisitHref
        },
        {
          id: "assessment-package",
          label: "Assessment Package",
          iconName: "notebook-pen",
          href: assessmentPackageHref
        },
        {
          id: "estimate-plan",
          label: "Estimate Plan",
          iconName: "folder-open",
          href: estimatePlanHref
        },
        {
          id: "work-items",
          label: "Work Items",
          iconName: "clipboard-list",
          href: workItemsHref
        },
        {
          id: "communication",
          label: "Communication",
          iconName: "send",
          href: communicationHref
        },
        {
          id: "activity",
          label: "Notes / Activity",
          iconName: "file-text",
          href: activityHref
        }
      ]}
      currentView={currentView}
      summaryBand={
        <WorkspaceSummaryBand
          className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]"
          items={[
            {
              key: "status",
              label: "Opportunity status",
              content: (
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                    opportunity.status
                  )}`}
                >
                  {formatOpportunityStatusLabel(opportunity.status)}
                </span>
              )
            },
            {
              key: "site-visit",
              label: "Site visit / inspection",
              content: (
                <p className="text-sm font-semibold capitalize text-slate-950">
                  {formatStatusLabel(opportunity.siteAssessmentStatus)}
                </p>
              )
            },
            {
              key: "next-action",
              label: "Next suggested action",
              content: (
                <NextActionCard
                  eyebrow="Guided workflow"
                  title={nextAction.title}
                  description={nextAction.description}
                  primaryAction={
                    nextAction.kind === "estimate" ? (
                      primaryEstimateHref ? (
                        <Link
                          href={primaryEstimateHref}
                          className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                        >
                          {nextAction.label}
                        </Link>
                      ) : (
                        <form action={startEstimateFromOpportunityAction}>
                          <input
                            type="hidden"
                            name="opportunityId"
                            value={opportunity.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                          >
                            {nextAction.label}
                          </button>
                        </form>
                      )
                    ) : (
                      <Link
                        href={nextAction.href}
                        className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                      >
                        {nextAction.label}
                      </Link>
                    )
                  }
                  className="space-y-3 text-sm leading-6 text-slate-600"
                />
              )
            }
          ]}
        />
      }
      supportArea={
        <>
          <DirectoryContextCard
            href={`/directory?view=leads&q=${encodeURIComponent(opportunity.title)}`}
            recordLabel="Sales opportunity"
            description="Directory is the read-only scan-and-jump index. This Opportunity Workspace remains the home for pre-sale commercial context and estimate handoff decisions."
          />

          <OpportunityStatusControl
            opportunity={opportunity}
            returnTo={overviewHref}
          />

          <section className="border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Estimate Plan
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {nextAction.description} Site visits stay lead-linked, while
              estimate creation links the customer and project before commercial
              scope is sent.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={estimatePlanHref}
                className="inline-flex min-h-9 items-center rounded-[6px] border border-[#e2d4c5] bg-[#fbf5ee] px-3 text-sm font-medium text-[#5f4d40] transition hover:border-[#caac88] hover:bg-white hover:text-[#2b2118]"
              >
                Open estimate plan
              </Link>
              <Link
                href={workItemsHref}
                className="inline-flex min-h-9 items-center rounded-[6px] border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Review linked work
              </Link>
            </div>
          </section>
        </>
      }
    >
      <div className="space-y-5">
        <section className="space-y-5">
          <section className="border border-slate-200 bg-white px-4 py-5 sm:px-5">
            <div
              className={
                currentView === "overview"
                  ? "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                  : "hidden"
              }
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Opportunity Workspace
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {opportunity.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Review Lead Intake context, complete the site visit and scope
                  intake, then hand the active sales opportunity into the shared
                  customer, project, and estimate chain.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/leads"
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Back to Leads & Opportunities
                </Link>
                {canStartEstimate ? (
                  primaryEstimateHref ? (
                    <Link
                      href={primaryEstimateHref}
                      className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                    >
                      Start estimate
                    </Link>
                  ) : (
                    <form action={startEstimateFromOpportunityAction}>
                      <input
                        type="hidden"
                        name="opportunityId"
                        value={opportunity.id}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                      >
                        Start estimate
                      </button>
                    </form>
                  )
                ) : null}
              </div>
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

            <div
              className={
                currentView === "qualification"
                  ? "mt-6 grid gap-4 lg:grid-cols-2"
                  : "hidden"
              }
            >
              <section
                id="contact"
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Primary Contact
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This is the upstream Lead Intake contact. When a customer is
                  linked, safe email updates can sync forward into that customer
                  record, but downstream estimate send uses the linked customer
                  email.
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div>
                    <dt className="font-medium text-slate-950">Name</dt>
                    <dd>
                      {opportunity.primaryContact?.displayName ??
                        opportunity.prospectName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Company</dt>
                    <dd>
                      {opportunity.primaryContact?.companyName ??
                        opportunity.prospectCompanyName ??
                        "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Email</dt>
                    <dd>
                      {opportunity.primaryContact?.email ??
                        opportunity.email ??
                        "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Phone</dt>
                    <dd>
                      {opportunity.primaryContact?.phone ??
                        opportunity.phone ??
                        "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Primary site</dt>
                    <dd>
                      {formatAddress([
                        opportunity.siteName,
                        opportunity.addressLine1,
                        opportunity.addressLine2,
                        opportunity.city,
                        opportunity.stateRegion,
                        opportunity.postalCode,
                        opportunity.countryCode
                      ])}
                    </dd>
                  </div>
                </dl>
              </section>

              <RoleSlotControls
                title="Ownership Roles"
                description="Internal role metadata for who gathered onsite context and who owns the customer relationship. Work Item assignment remains separate."
                recordIdName="opportunityId"
                recordId={opportunity.id}
                returnTo={qualificationHref}
                action={updateOpportunityRoleSlotsAction}
                people={roleSlotPeople}
                controls={[
                  {
                    role: "onsite_rep",
                    fieldName: "onsiteRepPersonId",
                    personId: opportunity.onsiteRepPersonId
                  },
                  {
                    role: "relationship_owner",
                    fieldName: "relationshipOwnerPersonId",
                    personId: opportunity.relationshipOwnerPersonId
                  }
                ]}
              />

              <section
                id="qualification"
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Workflow
                </p>
                <div className="mt-4 space-y-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                      opportunity.status
                    )}`}
                  >
                    {formatOpportunityStatusLabel(opportunity.status)}
                  </span>
                  <dl className="space-y-3 text-sm leading-6 text-slate-600">
                    <div>
                      <dt className="font-medium text-slate-950">
                        Lead source
                      </dt>
                      <dd>
                        {opportunity.source
                          ? [opportunity.source, opportunity.sourceDetail]
                              .filter(Boolean)
                              .join(" / ")
                          : "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">
                        Site assessment
                      </dt>
                      <dd>
                        {formatStatusLabel(opportunity.siteAssessmentStatus)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">
                        Assessment scheduled
                      </dt>
                      <dd>
                        {formatDate(opportunity.siteAssessmentScheduledAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">
                        Assessment completed
                      </dt>
                      <dd>
                        {opportunity.siteAssessmentCompletedAt
                          ? new Date(
                              opportunity.siteAssessmentCompletedAt
                            ).toLocaleDateString()
                          : "Not completed yet"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">
                        Service type
                      </dt>
                      <dd>{opportunity.serviceType ?? "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">Job type</dt>
                      <dd>{opportunity.jobType ?? "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">
                        Linked customer
                      </dt>
                      <dd>
                        {opportunity.customer ? (
                          <div className="space-y-1">
                            <Link
                              href={`/customers/${opportunity.customer.id}`}
                              className="font-medium text-brand-700"
                            >
                              {opportunity.customer.name}
                            </Link>
                            <p className="text-xs leading-5 text-slate-500">
                              This linked customer becomes the external
                              recipient record for projects, estimates,
                              invoices, and portal access.
                            </p>
                          </div>
                        ) : (
                          "No customer created yet"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">
                        Linked project
                      </dt>
                      <dd>
                        {opportunity.project ? (
                          <Link
                            href={`/projects/${opportunity.project.id}`}
                            className="font-medium text-brand-700"
                          >
                            {opportunity.project.name}
                          </Link>
                        ) : (
                          "No project created yet"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">Qualified</dt>
                      <dd>
                        {opportunity.qualifiedAt
                          ? new Date(opportunity.qualifiedAt).toLocaleString()
                          : "Not marked yet"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">Converted</dt>
                      <dd>
                        {opportunity.convertedAt
                          ? new Date(opportunity.convertedAt).toLocaleString()
                          : "Not converted yet"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            <div className={currentView === "site-visit" ? "mt-6" : "hidden"}>
              <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 text-sm leading-6 text-slate-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">
                      Site Visit / Scope Intake / Estimate Plan
                    </p>
                    <p className="mt-2">{estimatingReadiness}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getReadinessToneClasses(
                      salesEstimateReadiness.statusTone
                    )}`}
                  >
                    {salesEstimateReadiness.statusTone}
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                  <p className="font-medium text-slate-950">
                    {salesEstimateReadiness.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {salesEstimateReadiness.description}
                  </p>
                  {salesEstimateReadiness.blockers.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {salesEstimateReadiness.blockers.map((blocker) => (
                        <li key={blocker}>{blocker}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-3 text-sm font-medium text-slate-950">
                    Next: {salesEstimateReadiness.recommendedNextAction}
                  </p>
                </div>
              </div>
              <div id="scope-intake">
                <OpportunityForm
                  action={updateOpportunityAction}
                  submitLabel="Save opportunity"
                  pendingLabel="Saving opportunity..."
                  opportunity={opportunity}
                />
              </div>
            </div>

            <section
              className={
                currentView === "assessment-package"
                  ? "mt-6 border border-slate-200 bg-white px-4 py-5 sm:px-5"
                  : "hidden"
              }
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                    Assessment Package
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Pre-estimate capture
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Capture site knowledge against the opportunity before a
                    project exists. Project-linked packages remain available
                    after sale for operational continuity.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 md:w-72">
                  <p className="font-semibold text-slate-950">Package status</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {assessmentPackages.length > 0
                      ? `${assessmentPackages.length} package${assessmentPackages.length === 1 ? "" : "s"} linked to this opportunity.`
                      : "No assessment package has been started yet."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                <div className="space-y-3 xl:order-1">
                  {assessmentPackages.length > 0 ? (
                    assessmentPackages.map((assessmentPackage) => {
                      const packageHref = assessmentPackage.projectId
                        ? `/projects/${assessmentPackage.projectId}/assessment-packages/${assessmentPackage.id}`
                        : null;

                      return (
                        <article
                          key={assessmentPackage.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {assessmentPackage.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {assessmentPackage.projectId
                                  ? "Project-linked continuity package"
                                  : "Opportunity-owned pre-sale package"}
                              </p>
                            </div>
                            <StatusBadge
                              status={assessmentPackage.status}
                              size="sm"
                              className="w-fit"
                            >
                              {formatStatusLabel(assessmentPackage.status)}
                            </StatusBadge>
                          </div>
                          <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <div>
                              <dt className="font-medium text-slate-950">
                                Assessment date
                              </dt>
                              <dd>
                                {formatDate(assessmentPackage.assessmentDate)}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-slate-950">
                                Updated
                              </dt>
                              <dd>
                                {formatDateTime(assessmentPackage.updatedAt)}
                              </dd>
                            </div>
                          </dl>
                          {packageHref ? (
                            <Link
                              href={packageHref}
                              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-[6px] border border-brand-200 bg-white px-3 text-sm font-medium text-brand-700 transition hover:border-brand-300 hover:text-brand-900 sm:w-auto"
                            >
                              Open project assessment package
                            </Link>
                          ) : null}
                        </article>
                      );
                    })
                  ) : (
                    <AppEmptyState
                      eyebrow="No package yet"
                      title="Start the pre-estimate package"
                      description="Create the shared package here, then add measurements, spaces, photos, conditions, product selections, and notes as the site context becomes available."
                    />
                  )}
                </div>

                <form
                  action={createOpportunityAssessmentPackageAction}
                  className="order-first rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5 xl:order-2"
                >
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={opportunity.id}
                  />
                  <div>
                    <label
                      htmlFor="assessment-package-title"
                      className="text-sm font-medium text-slate-950"
                    >
                      Package title
                    </label>
                    <input
                      id="assessment-package-title"
                      name="title"
                      type="text"
                      defaultValue={`${opportunity.title} assessment package`}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="assessment-package-date"
                      className="text-sm font-medium text-slate-950"
                    >
                      Assessment date
                    </label>
                    <input
                      id="assessment-package-date"
                      name="assessmentDate"
                      type="date"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                  >
                    Start assessment package
                  </button>
                </form>
              </div>
            </section>

            <section
              className={
                currentView === "communication"
                  ? "mt-6 border border-slate-200 bg-white px-4 py-5 sm:px-5"
                  : "hidden"
              }
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                    Communication & Follow-Up
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Opportunity communication context
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Log manual opportunity contact and keep the next contractor
                    follow-up visible. Automated SMS, email, chat, voice, and AI
                    remain future work.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 md:w-72">
                  <p className="font-semibold text-slate-950">Next follow-up</p>
                  {opportunity.nextFollowUpAt ? (
                    <>
                      <p className="mt-1 text-slate-700">
                        {formatDateTime(opportunity.nextFollowUpAt)}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {opportunity.nextFollowUpNote ??
                          "No follow-up note added."}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      No follow-up is set yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Log activity
                    </p>
                    <div className="mt-4">
                      <OpportunityCommunicationLogForm
                        action={
                          createOpportunityManualCommunicationMessageAction
                        }
                        opportunityId={opportunity.id}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Follow-up reminder
                    </p>
                    <div className="mt-4">
                      <OpportunityFollowUpForm
                        action={updateOpportunityFollowUpAction}
                        opportunityId={opportunity.id}
                        nextFollowUpAt={opportunity.nextFollowUpAt}
                        nextFollowUpNote={opportunity.nextFollowUpNote}
                      />
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Recent activity
                    </p>
                    <Link
                      href={`/communications?source=opportunity&q=${encodeURIComponent(opportunity.title)}`}
                      className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                    >
                      Open communications
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {communicationMessages.length > 0 ? (
                      communicationMessages
                        .slice(-6)
                        .reverse()
                        .map((message) => (
                          <article
                            key={message.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-950">
                                {formatCommunicationKind(message.messageKind)}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${getVisibilityClasses(
                                  message.visibility
                                )}`}
                              >
                                {formatVisibility(message.visibility)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {message.body}
                            </p>
                            <p className="mt-3 text-xs leading-5 text-slate-500">
                              {formatDateTime(message.createdAt)} by{" "}
                              {formatCommunicationActor(message.senderType)}
                            </p>
                          </article>
                        ))
                    ) : (
                      <AppEmptyState
                        eyebrow="No communication yet"
                        title="Manual logging is ready"
                        description="Log calls, email notes, text notes, voicemails, appointment notes, or internal notes here. Automated SMS, email, chat, voice, and AI summaries come later."
                      />
                    )}
                  </div>
                </section>
              </div>

              <div className="mt-6">
                <GateKeeperSubjectMemoryPanel memory={gateKeeperMemory} />
              </div>
            </section>

            <section
              className={
                currentView === "work-items"
                  ? "mt-6 border border-slate-200 bg-white px-4 py-5 sm:px-5"
                  : "hidden"
              }
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                    Work Items
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Internal opportunity and estimate actions
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Assign follow-up or estimate handoff work tied to this
                    opportunity. These items are internal-only and do not change
                    the opportunity follow-up date, estimate state, send
                    behavior, or customer-visible communication.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 md:w-72">
                  <p className="font-semibold text-slate-950">
                    Open linked items
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {
                      linkedWorkItems.filter(
                        (workItem) => workItem.status === "open"
                      ).length
                    }
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Completion or dismissal stays on the work item and does not
                    mutate opportunity status.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {estimateHandoffCueRequested
                      ? "Assign Estimate Writer"
                      : "Create internal work item"}
                  </p>
                  {estimateHandoffCueRequested ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Create one internal estimating handoff tied to this
                      opportunity. The assignee is the estimate writer for this
                      handoff until an actual estimate exists and can carry its
                      own Estimate Writer role slot.
                    </p>
                  ) : null}
                  <div className="mt-4">
                    {estimateHandoffCueRequested &&
                    existingOpenEstimateHandoff ? (
                      <div className="mb-4 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                        An open estimate handoff already exists for this
                        opportunity. Continue the linked Work Item instead of
                        creating a duplicate estimate handoff.
                      </div>
                    ) : null}
                    <WorkItemCreateForm
                      action={createWorkItemAction}
                      returnTo={workItemsHref}
                      sourceType="opportunity"
                      sourceId={opportunity.id}
                      linkPath={leadWorkspaceHref}
                      customerId={opportunity.customerId}
                      projectId={opportunity.projectId}
                      defaultKind={
                        leadWorkItemPrefill?.kind ?? "lead_follow_up"
                      }
                      kindOptions={
                        estimateHandoffCueRequested
                          ? [
                              {
                                value: "estimate_follow_up",
                                label: "Estimate handoff"
                              }
                            ]
                          : undefined
                      }
                      defaultAssignedPersonId={
                        leadWorkItemPrefill?.assignedPersonId
                      }
                      defaultTitle={leadWorkItemPrefill?.title}
                      defaultDescription={leadWorkItemPrefill?.description}
                      defaultDueAt={leadWorkItemPrefill?.dueAt}
                      defaultPriority={leadWorkItemPrefill?.priority}
                      dedupeKey={leadWorkItemPrefill?.dedupeKey}
                      metadata={leadWorkItemPrefill?.metadata}
                      boundaryCopy="Work items are internal-only. Creating this item does not create an estimate, send customer communication, assign commission, change opportunity status, or mutate project readiness."
                      assignablePeople={assignablePeople}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Linked work items
                  </p>
                  <div className="mt-4">
                    <WorkItemList
                      workItems={linkedWorkItems}
                      returnTo={workItemsHref}
                      completeAction={completeWorkItemAction}
                      dismissAction={dismissWorkItemAction}
                      emptyTitle="No work items are linked to this opportunity yet."
                      emptyDescription="Create an internal work item when opportunity follow-up or estimate handoff work needs an owner, due date, blocker note, or explicit completion state."
                    />
                  </div>
                </section>
              </div>
            </section>

            <div
              className={
                currentView === "activity"
                  ? "mt-6 grid gap-4 lg:grid-cols-3"
                  : "hidden"
              }
            >
              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Measurements
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {opportunity.measurements.length > 0 ? (
                    opportunity.measurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="font-medium text-slate-950">
                          {measurement.areaLabel ?? measurement.measurementType}
                        </p>
                        <p className="text-slate-600">
                          {formatMeasurementValue(
                            measurement.valueNumeric,
                            measurement.unit,
                            measurement.quantity
                          )}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {measurement.measurementType.replaceAll("_", " ")}
                          {measurement.captureMethod
                            ? ` • ${measurement.captureMethod.replaceAll("_", " ")}`
                            : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No structured measurements captured yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Observations
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {opportunity.observations.length > 0 ? (
                    opportunity.observations.map((observation) => (
                      <div
                        key={observation.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="font-medium text-slate-950">
                          {observation.title}
                        </p>
                        <p>{observation.body ?? "No detail provided."}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {observation.observationType.replaceAll("_", " ")}
                          {observation.severity
                            ? ` • ${observation.severity.replaceAll("_", " ")}`
                            : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No structured observations captured yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Photos & Files
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {opportunity.attachments.length > 0 ? (
                    opportunity.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="font-medium text-slate-950">
                          {attachment.fileName}
                        </p>
                        <p>{attachment.caption ?? attachment.storagePath}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {attachment.attachmentType.replaceAll("_", " ")}
                          {attachment.tag
                            ? ` • ${attachment.tag.replaceAll("_", " ")}`
                            : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No linked intake files captured yet.</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        </section>

        <section
          className={
            currentView === "estimate-plan"
              ? "border border-slate-200 bg-white px-4 py-5 sm:px-5"
              : "hidden"
          }
        >
          <section className="border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Estimate Plan
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {nextAction.description} Site visits stay lead-linked, while
              estimate creation links the customer and project before commercial
              scope is sent.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {existingOpenEstimateHandoff ? (
                <Link
                  href={workItemsHref}
                  className="inline-flex items-center rounded-full border border-[#e2d4c5] bg-[#fbf5ee] px-3.5 py-2 text-sm font-medium text-[#5f4d40] transition hover:border-[#caac88] hover:bg-white hover:text-[#2b2118]"
                >
                  Open existing handoff
                </Link>
              ) : (
                <Link
                  href={estimateHandoffCueHref}
                  className="inline-flex items-center rounded-full border border-[#e2d4c5] bg-[#fbf5ee] px-3.5 py-2 text-sm font-medium text-[#5f4d40] transition hover:border-[#caac88] hover:bg-white hover:text-[#2b2118]"
                >
                  Assign Estimate Writer
                </Link>
              )}
              <Link
                href={workItemsHref}
                className="inline-flex items-center rounded-full border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Review linked work
              </Link>
            </div>
            {canStartEstimate ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
                Use the primary action in the header to start estimate from this
                opportunity.
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-900">
                Lost opportunities do not move into the estimate workflow unless
                the status is reopened.
              </div>
            )}

            {existingOpenEstimateHandoff ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
                <p className="font-semibold">Estimating handoff</p>
                <p className="mt-1 text-amber-900">
                  {existingOpenEstimateHandoff.title}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                  Estimate Writer{" "}
                  {existingOpenEstimateHandoff.assignedPerson?.displayName ??
                    "Unassigned"}
                </p>
                {existingEstimateHandoffNextAction ? (
                  <p className="mt-2 text-amber-900">
                    Next action: {existingEstimateHandoffNextAction}
                  </p>
                ) : null}
                <form
                  action={updateWorkItemAssignmentAction}
                  className="mt-4 grid gap-3 border-t border-amber-200 pt-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <input
                    type="hidden"
                    name="workItemId"
                    value={existingOpenEstimateHandoff.id}
                  />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={estimatePlanHref}
                  />
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                      Assign Estimate Writer
                    </span>
                    <select
                      name="assignedPersonId"
                      defaultValue={
                        existingOpenEstimateHandoff.assignedPersonId ?? ""
                      }
                      className="mt-2 h-9 w-full border border-amber-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                    >
                      <option value="">Unassigned</option>
                      {assignablePeople.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center self-end rounded-full bg-brand-700 px-4 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Save assignment
                  </button>
                </form>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
              Requirements summary:
              <div className="mt-2 text-slate-500">
                {opportunity.requirementsSummary ??
                  "No assessment-based requirements have been captured yet."}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
              Internal summary notes:
              <div className="mt-2 text-slate-500">
                {opportunity.notes ?? "No internal notes have been added yet."}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Appointments
                </p>
                <Link
                  href={leadAppointmentHref}
                  className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                >
                  New appointment
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {leadAppointments.slice(0, 2).length > 0 ? (
                  leadAppointments
                    .slice(0, 2)
                    .map((appointment) => (
                      <LinkedRecordCard
                        key={appointment.id}
                        href={`/appointments/${appointment.id}`}
                        title={appointment.title}
                        subtitle={
                          appointment.project?.name ??
                          appointment.customer?.name ??
                          "Opportunity-linked appointment"
                        }
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
                    title="Schedule the next opportunity visit here"
                    description="Use appointments for assessments, estimate meetings, and follow-up visits while keeping the real workflow on the same opportunity and downstream project chain."
                    actionHref={leadAppointmentHref}
                    actionLabel="Create appointment"
                  />
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
    </StandardWorkspaceLayout>
  );
}
