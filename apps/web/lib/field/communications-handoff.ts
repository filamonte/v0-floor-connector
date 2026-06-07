import { buildAiCopilotCommunicationHandoffHref } from "@/lib/ai-operational-copilot/communication-handoff";
import type { AiCopilotDraftAction } from "@/lib/ai-operational-copilot/summary";

import type { FieldAssignedWorkJob } from "./assigned-work-read-model";
import type { FieldCloseoutReadinessSummary } from "./closeout-readiness";

export type FieldCommunicationsHandoffStatus =
  | "needs_office_review"
  | "ready_to_update"
  | "monitor";

export type FieldCommunicationsHandoff = {
  status: FieldCommunicationsHandoffStatus;
  label: string;
  detail: string;
  audienceLabel: string;
  handoffHref: string;
  handoffActionLabel: string;
  sourceSignals: string[];
};

function getCustomerName(job: FieldAssignedWorkJob) {
  return job.customer?.companyName ?? job.customer?.name ?? null;
}

function buildInternalDraft(input: {
  job: FieldAssignedWorkJob;
  actionType: AiCopilotDraftAction["actionType"];
  title: string;
  subject: string;
  body: string;
  reason: string;
  sourceSignals: string[];
  priority: AiCopilotDraftAction["priority"];
}): AiCopilotDraftAction {
  return {
    id: `${input.job.id}:field-communications-handoff`,
    actionType: input.actionType,
    audience: "internal",
    title: input.title,
    subject: input.subject,
    draftBody: input.body,
    operationalReason: input.reason,
    sourceWorkflowSignals: input.sourceSignals,
    priority: input.priority,
    reviewSafetyNote:
      "Review and edit this internal handoff before saving it in Communications. This does not send to the customer."
  };
}

export function buildFieldCommunicationsHandoff(input: {
  job: FieldAssignedWorkJob;
  closeoutReadiness: FieldCloseoutReadinessSummary;
}): FieldCommunicationsHandoff {
  const projectName =
    input.job.project?.name ?? `Job ${input.job.id.slice(0, 8)}`;
  const customerName = getCustomerName(input.job);
  const sourceSignals = [
    `Field job status: ${input.job.dispatchStatus.replaceAll("_", " ")}`,
    `Daily Logs: ${input.job.dailyLogCount}`,
    `Job Notes: ${input.job.fieldNoteCount}`,
    `Open blockers/issues: ${input.job.openFieldBlockerCount}`,
    `Evidence files: ${input.job.executionAttachmentCount}`,
    `Closeout readiness: ${input.closeoutReadiness.label}`
  ];

  if (input.job.openFieldBlockerCount > 0) {
    const action = buildInternalDraft({
      job: input.job,
      actionType: "blocker_escalation_summary",
      title: "Route field blocker",
      subject: `Field blocker review: ${projectName}`,
      body: [
        `Field blocker review for ${projectName}.`,
        input.job.latestOpenFieldBlocker?.title
          ? `Current blocker: ${input.job.latestOpenFieldBlocker.title}.`
          : `${input.job.openFieldBlockerCount} open blocker or issue notes are linked to the job.`,
        "Review the Daily Job Log and route the next office action before customer-facing follow-up."
      ].join("\n\n"),
      reason:
        "Open field blocker or issue notes need office routing before closeout or customer update.",
      sourceSignals,
      priority: "high"
    });

    return {
      status: "needs_office_review",
      label: "Office handoff needed",
      detail:
        "Open field blockers should move into Communications review without turning Field into the conversation workspace.",
      audienceLabel: "Internal review",
      handoffHref: buildAiCopilotCommunicationHandoffHref({
        action,
        projectId: input.job.project?.id ?? input.job.id,
        projectName,
        customerId: input.job.customer?.id ?? null,
        customerName
      }),
      handoffActionLabel: "Prepare internal handoff",
      sourceSignals
    };
  }

  if (input.closeoutReadiness.status === "ready_for_review") {
    const action = buildInternalDraft({
      job: input.job,
      actionType: "internal_pm_project_summary",
      title: "Prepare closeout update",
      subject: `Closeout review: ${projectName}`,
      body: [
        `${projectName} is ready for office closeout review.`,
        "Daily Log, Job Notes, field evidence, and completed job status are present.",
        "Review the project record before customer-safe update or Financials billing action."
      ].join("\n\n"),
      reason:
        "Field evidence and completion state are ready for office review before downstream action.",
      sourceSignals,
      priority: "normal"
    });

    return {
      status: "ready_to_update",
      label: "Ready for office update",
      detail:
        "Field evidence can be summarized in Communications for explicit internal review before any customer-safe follow-up.",
      audienceLabel: "Internal review",
      handoffHref: buildAiCopilotCommunicationHandoffHref({
        action,
        projectId: input.job.project?.id ?? input.job.id,
        projectName,
        customerId: input.job.customer?.id ?? null,
        customerName
      }),
      handoffActionLabel: "Prepare update",
      sourceSignals
    };
  }

  const action = buildInternalDraft({
    job: input.job,
    actionType: "field_progress_update",
    title: "Review field progress",
    subject: `Field progress review: ${projectName}`,
    body: [
      `Field progress review for ${projectName}.`,
      input.closeoutReadiness.detail,
      "Keep the handoff internal until field capture is complete and customer-safe copy is reviewed."
    ].join("\n\n"),
    reason:
      "Field progress has useful source-record context, but the job is not ready for downstream closeout action yet.",
    sourceSignals,
    priority: "normal"
  });

  return {
    status: "monitor",
    label: "Monitor field context",
    detail:
      "Communications can review source-record context when needed, but Field remains the capture workspace.",
    audienceLabel: "Internal review",
    handoffHref: buildAiCopilotCommunicationHandoffHref({
      action,
      projectId: input.job.project?.id ?? input.job.id,
      projectName,
      customerId: input.job.customer?.id ?? null,
      customerName
    }),
    handoffActionLabel: "Review in Communications",
    sourceSignals
  };
}
