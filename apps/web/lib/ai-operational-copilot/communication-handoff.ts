import type { AiCopilotDraftAction } from "./summary";

export type AiCopilotCommunicationHandoff = {
  draftId: string;
  actionType: AiCopilotDraftAction["actionType"];
  audience: AiCopilotDraftAction["audience"];
  title: string;
  subject: string;
  draftBody: string;
  operationalReason: string;
  sourceWorkflowSignals: string[];
  projectId: string;
  projectName: string;
  customerId: string | null;
  customerName: string | null;
};

export function buildAiCopilotCommunicationHandoffHref(input: {
  action: AiCopilotDraftAction;
  projectId: string;
  projectName: string;
  customerId?: string | null;
  customerName?: string | null;
  threadId?: string | null;
}) {
  const searchParams = new URLSearchParams({
    source: "project",
    copilotDraft: "1",
    copilotDraftId: input.action.id,
    copilotActionType: input.action.actionType,
    copilotAudience: input.action.audience,
    copilotTitle: input.action.title,
    copilotSubject: input.action.subject,
    copilotBody: input.action.draftBody,
    copilotReason: input.action.operationalReason,
    copilotSignals: input.action.sourceWorkflowSignals.join("\n"),
    copilotProjectId: input.projectId,
    copilotProjectName: input.projectName
  });

  if (input.customerId) {
    searchParams.set("copilotCustomerId", input.customerId);
  }

  if (input.customerName) {
    searchParams.set("copilotCustomerName", input.customerName);
  }

  if (input.threadId) {
    searchParams.set("threadId", input.threadId);
  }

  return `/communications?${searchParams.toString()}`;
}

function getTrimmed(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function parseAiCopilotCommunicationHandoffSearchParams(
  searchParams: Record<string, string | undefined>
): AiCopilotCommunicationHandoff | null {
  if (searchParams.copilotDraft !== "1") {
    return null;
  }

  const draftId = getTrimmed(searchParams.copilotDraftId);
  const actionType = getTrimmed(searchParams.copilotActionType);
  const audience = getTrimmed(searchParams.copilotAudience);
  const title = getTrimmed(searchParams.copilotTitle);
  const subject = getTrimmed(searchParams.copilotSubject);
  const draftBody = getTrimmed(searchParams.copilotBody);
  const operationalReason = getTrimmed(searchParams.copilotReason);
  const projectId = getTrimmed(searchParams.copilotProjectId);
  const projectName = getTrimmed(searchParams.copilotProjectName);

  if (
    !draftId ||
    !actionType ||
    !audience ||
    !title ||
    !subject ||
    !draftBody ||
    !operationalReason ||
    !projectId ||
    !projectName
  ) {
    return null;
  }

  if (audience !== "customer" && audience !== "internal") {
    return null;
  }

  const supportedActionTypes: ReadonlyArray<
    AiCopilotDraftAction["actionType"]
  > = [
    "customer_follow_up",
    "contract_signature_reminder",
    "deposit_payment_reminder",
    "scheduling_readiness_coordination",
    "field_progress_update",
    "internal_pm_project_summary",
    "stalled_project_follow_up",
    "blocker_escalation_summary"
  ];

  if (
    !supportedActionTypes.includes(
      actionType as AiCopilotDraftAction["actionType"]
    )
  ) {
    return null;
  }

  return {
    draftId,
    actionType: actionType as AiCopilotDraftAction["actionType"],
    audience,
    title,
    subject,
    draftBody,
    operationalReason,
    sourceWorkflowSignals:
      searchParams.copilotSignals
        ?.split("\n")
        .map((signal) => signal.trim())
        .filter(Boolean) ?? [],
    projectId,
    projectName,
    customerId: getTrimmed(searchParams.copilotCustomerId),
    customerName: getTrimmed(searchParams.copilotCustomerName)
  };
}

export function buildAiCopilotCommunicationPayload(
  handoff: AiCopilotCommunicationHandoff
) {
  return {
    source: "ai_operational_copilot",
    draftId: handoff.draftId,
    actionType: handoff.actionType,
    audience: handoff.audience,
    subject: handoff.subject,
    projectId: handoff.projectId,
    projectName: handoff.projectName,
    customerId: handoff.customerId,
    customerName: handoff.customerName,
    operationalReason: handoff.operationalReason,
    sourceWorkflowSignals: handoff.sourceWorkflowSignals
  };
}
