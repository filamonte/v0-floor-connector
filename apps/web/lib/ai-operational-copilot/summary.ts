import type { CloseoutTrailSummary } from "@/lib/closeouttrail/summary";
import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";
import type { ProjectPulseSummary } from "@/lib/projectpulse/summary";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

export type AiOperationalCopilotTone =
  | "ready"
  | "attention"
  | "blocked"
  | "neutral";

export type AiOperationalCopilotSource =
  | "readiness"
  | "projectpulse"
  | "fieldtrail"
  | "messagecenter"
  | "closeouttrail"
  | "financials"
  | "schedule";

export type AiOperationalCopilotActionKind =
  | "readiness"
  | "signature"
  | "payment"
  | "schedule"
  | "field"
  | "communication"
  | "closeout"
  | "review";

export type AiOperationalCopilotAction = {
  id: string;
  title: string;
  detail: string;
  reason: string;
  href: string;
  label: string;
  kind: AiOperationalCopilotActionKind;
  priority: "critical" | "high" | "normal";
  source: AiOperationalCopilotSource;
};

export type AiProjectOperationalSummary = {
  projectId: string;
  projectName: string;
  customerName: string | null;
  stage: string;
  tone: AiOperationalCopilotTone;
  executiveSummary: string;
  readinessState: string;
  financialState: string;
  scheduleState: string;
  executionState: string;
  blockers: string[];
  missingItems: string[];
  operationalConcerns: string[];
  highlights: string[];
  recommendedNextActions: AiOperationalCopilotAction[];
  groundedSources: AiOperationalCopilotSource[];
  reviewBoundary: string;
};

export type AiOperationalDigest = {
  urgentProjects: AiProjectOperationalSummary[];
  stalledWorkflows: AiProjectOperationalSummary[];
  overdueFinancialItems: AiProjectOperationalSummary[];
  readinessBottlenecks: AiProjectOperationalSummary[];
  schedulingConcerns: AiProjectOperationalSummary[];
  executionGaps: AiProjectOperationalSummary[];
  collectionRisks: AiProjectOperationalSummary[];
  digestSummary: string;
};

export type AiCommunicationAssistance = {
  followUpDraft: string;
  invoiceReminderDraft: string | null;
  schedulingCoordinationDraft: string | null;
  customerStatusUpdateDraft: string;
  projectSummaryDraft: string;
  reviewBoundary: string;
};

export type AiCopilotDraftActionType =
  | "customer_follow_up"
  | "contract_signature_reminder"
  | "deposit_payment_reminder"
  | "payment_reminder"
  | "payment_failed_follow_up"
  | "partial_balance_follow_up"
  | "internal_collections_review_summary"
  | "scheduling_readiness_coordination"
  | "field_progress_update"
  | "internal_pm_project_summary"
  | "stalled_project_follow_up"
  | "blocker_escalation_summary";

export type AiCopilotDraftActionAudience = "customer" | "internal";

export type AiCopilotDraftAction = {
  id: string;
  actionType: AiCopilotDraftActionType;
  audience: AiCopilotDraftActionAudience;
  title: string;
  subject: string;
  draftBody: string;
  operationalReason: string;
  sourceWorkflowSignals: string[];
  priority: "critical" | "high" | "normal";
  reviewSafetyNote: string;
};

export type AiFieldSummary = {
  pmSummary: string;
  customerReadyUpdate: string;
  riskIndicators: string[];
  nextFieldMove: AiOperationalCopilotAction;
  reviewBoundary: string;
};

export type AiOperationalCopilotInput = {
  project: {
    id: string;
    name: string;
    customerName: string | null;
  };
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  projectPulse: ProjectPulseSummary;
  fieldTrail: FieldTrailSummary;
  messageCenter: MessageCenterSummary;
  closeoutTrail: CloseoutTrailSummary;
};

const REVIEW_BOUNDARY =
  "AI Operational Copilot output is derived, review-first guidance over canonical records. It does not create, update, approve, send, schedule, invoice, sign, or collect anything by itself.";

const DRAFT_REVIEW_SAFETY_NOTE =
  "Review and edit this draft before using it. The Copilot does not send, save, approve, schedule, invoice, sign, or collect anything.";

function uniqueSources(sources: AiOperationalCopilotSource[]) {
  return [...new Set(sources)];
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function sentenceList(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function mapPulseTone(tone: ProjectPulseSummary["healthTone"]) {
  switch (tone) {
    case "good":
      return "ready";
    case "blocked":
      return "blocked";
    case "attention":
      return "attention";
    case "neutral":
      return "neutral";
  }
}

function buildAction(input: AiOperationalCopilotAction) {
  return input;
}

function buildDraftAction(input: AiCopilotDraftAction) {
  return input;
}

function sourceSignalsFor(
  summary: AiProjectOperationalSummary,
  extraSignals: string[] = []
) {
  return [
    `Stage: ${summary.stage}`,
    `Readiness: ${summary.readinessState}`,
    `Financials: ${summary.financialState}`,
    `Schedule: ${summary.scheduleState}`,
    `Execution: ${summary.executionState}`,
    ...summary.groundedSources.map((source) => `Source: ${source}`),
    ...extraSignals
  ];
}

function hasActionKind(
  summary: AiProjectOperationalSummary,
  kind: AiOperationalCopilotActionKind
) {
  return summary.recommendedNextActions.some((action) => action.kind === kind);
}

function getHighestPriority(
  priorities: Array<AiCopilotDraftAction["priority"]>
) {
  if (priorities.includes("critical")) {
    return "critical";
  }

  if (priorities.includes("high")) {
    return "high";
  }

  return "normal";
}

function deriveFinancialState(input: {
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  projectPulse: ProjectPulseSummary;
  messageCenter: MessageCenterSummary;
}) {
  if (input.projectPulse.linkedCounts.unpaidInvoices > 0) {
    return `${formatCount(
      input.projectPulse.linkedCounts.unpaidInvoices,
      "invoice"
    )} with open balance.`;
  }

  if (input.projectPulse.linkedCounts.paymentAttentionItems > 0) {
    return `${formatCount(
      input.projectPulse.linkedCounts.paymentAttentionItems,
      "payment signal"
    )} need review.`;
  }

  if (input.readinessSnapshot?.depositSatisfied === false) {
    return "Deposit or financing requirement is not satisfied.";
  }

  return input.messageCenter.latestPaymentTrail
    ? "Payment Trail has connected evidence and no open balance signal."
    : "No active payment risk is visible from current records.";
}

function deriveScheduleState(input: {
  projectPulse: ProjectPulseSummary;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
}) {
  const scheduleSignal = input.projectPulse.signals.find(
    (signal) => signal.id === "schedule"
  );

  if (scheduleSignal) {
    return `${scheduleSignal.status}: ${scheduleSignal.detail}`;
  }

  if (input.readinessSnapshot?.isReadyToSchedule) {
    return "Ready Check is clear for scheduling.";
  }

  return "Scheduling is waiting on upstream project readiness.";
}

function deriveExecutionState(fieldTrail: FieldTrailSummary) {
  if (fieldTrail.openBlockerCount > 0) {
    return `${formatCount(
      fieldTrail.openBlockerCount,
      "open field blocker"
    )} need review.`;
  }

  if (fieldTrail.dailyLogCount > 0) {
    return `${formatCount(
      fieldTrail.dailyLogCount,
      "Daily Job Log"
    )} and ${formatCount(fieldTrail.attachmentCount, "field evidence item")} captured.`;
  }

  return "No Daily Job Logs or field evidence are connected yet.";
}

function deriveMissingItems(input: AiOperationalCopilotInput) {
  const missingItems: string[] = [];

  if (!input.readinessSnapshot?.estimateId) {
    missingItems.push("Approved estimate or Ready Check estimate context");
  }

  if (
    input.readinessSnapshot?.estimateStatus === "approved" &&
    !input.readinessSnapshot.contractId
  ) {
    missingItems.push("Contract generated from approved scope");
  }

  if (
    input.readinessSnapshot?.contractStatus &&
    input.readinessSnapshot.contractStatus !== "signed"
  ) {
    missingItems.push("Completed contract signature");
  }

  if (input.projectPulse.linkedCounts.jobs === 0) {
    missingItems.push("Canonical job handoff");
  }

  if (
    input.projectPulse.stageLabel === "Execution active" &&
    !input.fieldTrail.latestDailyLog
  ) {
    missingItems.push("Current Daily Job Log");
  }

  if (
    input.fieldTrail.dailyLogCount > 0 &&
    input.fieldTrail.attachmentCount === 0
  ) {
    missingItems.push("Field evidence attached to Daily Job Logs");
  }

  return missingItems;
}

function deriveRecommendedNextActions(
  input: AiOperationalCopilotInput
): AiOperationalCopilotAction[] {
  const actions: AiOperationalCopilotAction[] = [];

  if (
    input.projectPulse.healthTone === "blocked" &&
    input.projectPulse.blockers[0]
  ) {
    actions.push(
      buildAction({
        id: `${input.project.id}:resolve-readiness`,
        title: "Resolve readiness blocker",
        detail: input.projectPulse.blockers[0],
        reason:
          "Ready Check blockers prevent clean scheduling or execution handoff.",
        href: input.projectPulse.nextMove.href,
        label: input.projectPulse.nextMove.label,
        kind: "readiness",
        priority: "critical",
        source: "readiness"
      })
    );
  }

  if (input.projectPulse.linkedCounts.pendingSignatureItems > 0) {
    actions.push(
      buildAction({
        id: `${input.project.id}:signature-follow-up`,
        title: "Review signature follow-through",
        detail: `${formatCount(
          input.projectPulse.linkedCounts.pendingSignatureItems,
          "signature item"
        )} need attention.`,
        reason:
          "Contract signature state is part of the canonical project readiness chain.",
        href:
          input.messageCenter.latestSignatureTrail?.href ??
          input.projectPulse.nextMove.href,
        label: "Open signature context",
        kind: "signature",
        priority: "high",
        source: "messagecenter"
      })
    );
  }

  if (
    input.projectPulse.linkedCounts.unpaidInvoices > 0 ||
    input.projectPulse.linkedCounts.paymentAttentionItems > 0
  ) {
    actions.push(
      buildAction({
        id: `${input.project.id}:payment-follow-up`,
        title: "Review payment or collection status",
        detail: deriveFinancialState({
          readinessSnapshot: input.readinessSnapshot,
          projectPulse: input.projectPulse,
          messageCenter: input.messageCenter
        }),
        reason:
          "Invoice and payment state must stay tied to the canonical invoice -> payment chain.",
        href:
          input.messageCenter.latestPaymentTrail?.href ??
          input.projectPulse.nextMove.href,
        label: "Open payment context",
        kind: "payment",
        priority:
          input.projectPulse.linkedCounts.unpaidInvoices > 0
            ? "high"
            : "normal",
        source: "financials"
      })
    );
  }

  const scheduleSignal = input.projectPulse.signals.find(
    (signal) => signal.id === "schedule"
  );
  if (scheduleSignal?.status === "Needs scheduling") {
    actions.push(
      buildAction({
        id: `${input.project.id}:schedule-ready-work`,
        title: "Move ready work into CrewBoard",
        detail: scheduleSignal.detail,
        reason:
          "Ready projects should continue through canonical jobs and CrewBoard, not a separate dispatch list.",
        href: scheduleSignal.href,
        label: "Open CrewBoard",
        kind: "schedule",
        priority: "normal",
        source: "schedule"
      })
    );
  }

  if (input.fieldTrail.openBlockerCount > 0) {
    actions.push(
      buildAction({
        id: `${input.project.id}:field-blockers`,
        title: "Review field blockers",
        detail: input.fieldTrail.nextMove.detail,
        reason:
          "Daily Logs and Field Notes are canonical execution evidence for this project.",
        href: input.fieldTrail.nextMove.href,
        label: input.fieldTrail.nextMove.label,
        kind: "field",
        priority: "high",
        source: "fieldtrail"
      })
    );
  }

  if (input.messageCenter.attentionCount > 0) {
    actions.push(
      buildAction({
        id: `${input.project.id}:communication-follow-up`,
        title: "Review communication attention",
        detail: input.messageCenter.nextMove.detail,
        reason:
          "Communication guidance must stay attached to project, delivery, signature, and payment evidence.",
        href: input.messageCenter.nextMove.href,
        label: input.messageCenter.nextMove.label,
        kind: "communication",
        priority: "normal",
        source: "messagecenter"
      })
    );
  }

  if (actions.length === 0) {
    actions.push(
      buildAction({
        id: `${input.project.id}:continue-review`,
        title: input.projectPulse.nextMove.label,
        detail: input.projectPulse.nextMove.reason,
        reason:
          "No higher-priority operational blocker is visible from the current canonical summaries.",
        href: input.projectPulse.nextMove.href,
        label: input.projectPulse.nextMove.label,
        kind: "review",
        priority: "normal",
        source: "projectpulse"
      })
    );
  }

  return actions.slice(0, 4);
}

export function deriveAiProjectOperationalSummary(
  input: AiOperationalCopilotInput
): AiProjectOperationalSummary {
  const blockers = [...input.projectPulse.blockers];
  const missingItems = deriveMissingItems(input);
  const operationalConcerns = [
    ...input.projectPulse.warnings,
    ...(input.closeoutTrail.closeoutTone === "attention"
      ? [input.closeoutTrail.primaryMessage]
      : [])
  ];
  const highlights = [
    ...input.projectPulse.highlights,
    ...(input.closeoutTrail.closeoutTone === "ready"
      ? [input.closeoutTrail.primaryMessage]
      : [])
  ];
  const recommendedNextActions = deriveRecommendedNextActions(input);
  const groundedSources = uniqueSources([
    "projectpulse",
    "readiness",
    "fieldtrail",
    "messagecenter",
    "closeouttrail",
    ...recommendedNextActions.map((action) => action.source)
  ]);
  const concernSummary =
    blockers[0] ?? operationalConcerns[0] ?? highlights[0] ?? null;
  const executiveSummary = concernSummary
    ? `${input.project.name} is at ${input.projectPulse.stageLabel}. ${concernSummary}`
    : `${input.project.name} is at ${input.projectPulse.stageLabel}; no blocking project health signals are visible from current records.`;

  return {
    projectId: input.project.id,
    projectName: input.project.name,
    customerName: input.project.customerName,
    stage: input.projectPulse.stageLabel,
    tone: mapPulseTone(input.projectPulse.healthTone),
    executiveSummary,
    readinessState: input.readinessSnapshot?.isReadyToSchedule
      ? "Ready Check is clear."
      : (input.projectPulse.blockers[0] ??
        "Readiness is still being assembled."),
    financialState: deriveFinancialState({
      readinessSnapshot: input.readinessSnapshot,
      projectPulse: input.projectPulse,
      messageCenter: input.messageCenter
    }),
    scheduleState: deriveScheduleState({
      projectPulse: input.projectPulse,
      readinessSnapshot: input.readinessSnapshot
    }),
    executionState: deriveExecutionState(input.fieldTrail),
    blockers,
    missingItems,
    operationalConcerns,
    highlights,
    recommendedNextActions,
    groundedSources,
    reviewBoundary: REVIEW_BOUNDARY
  };
}

export function deriveAiOperationalDigest(
  summaries: AiProjectOperationalSummary[]
): AiOperationalDigest {
  const urgentProjects = summaries.filter(
    (summary) => summary.tone === "blocked" || summary.blockers.length > 0
  );
  const stalledWorkflows = summaries.filter(
    (summary) =>
      summary.missingItems.length > 0 ||
      summary.recommendedNextActions.some((action) =>
        ["readiness", "signature", "communication"].includes(action.kind)
      )
  );
  const overdueFinancialItems = summaries.filter((summary) =>
    summary.recommendedNextActions.some((action) => action.kind === "payment")
  );
  const readinessBottlenecks = summaries.filter((summary) =>
    summary.recommendedNextActions.some((action) => action.kind === "readiness")
  );
  const schedulingConcerns = summaries.filter((summary) =>
    summary.recommendedNextActions.some((action) => action.kind === "schedule")
  );
  const executionGaps = summaries.filter((summary) =>
    summary.recommendedNextActions.some((action) => action.kind === "field")
  );
  const collectionRisks = overdueFinancialItems.filter((summary) =>
    /open balance|payment/i.test(summary.financialState)
  );

  return {
    urgentProjects,
    stalledWorkflows,
    overdueFinancialItems,
    readinessBottlenecks,
    schedulingConcerns,
    executionGaps,
    collectionRisks,
    digestSummary:
      summaries.length === 0
        ? "No project intelligence inputs are available yet."
        : `${formatCount(
            urgentProjects.length,
            "urgent project"
          )}, ${formatCount(collectionRisks.length, "collection risk")}, and ${formatCount(
            executionGaps.length,
            "execution gap"
          )} are visible from canonical project summaries.`
  };
}

export function deriveAiCommunicationAssistance(
  summary: AiProjectOperationalSummary
): AiCommunicationAssistance {
  const salutation = summary.customerName ?? "there";
  const nextAction = summary.recommendedNextActions[0];
  const coreStatus = `${summary.projectName} is currently at ${summary.stage}. ${summary.executiveSummary}`;
  const customerStatusUpdateDraft = `Hi ${salutation}, quick project update: ${coreStatus} The next internal step is ${nextAction.title.toLowerCase()}.`;
  const invoiceReminderDraft =
    nextAction.kind === "payment" ||
    /open balance/i.test(summary.financialState)
      ? `Hi ${salutation}, we are following up on the open invoice for ${summary.projectName}. Please review the invoice when you have a moment, and let us know if you have any questions.`
      : null;
  const schedulingCoordinationDraft =
    nextAction.kind === "schedule"
      ? `Hi ${salutation}, ${summary.projectName} is ready for scheduling. We will coordinate the production window and confirm timing before the crew is dispatched.`
      : null;

  return {
    followUpDraft: `Hi ${salutation}, I wanted to follow up on ${summary.projectName}. ${nextAction.detail}`,
    invoiceReminderDraft,
    schedulingCoordinationDraft,
    customerStatusUpdateDraft,
    projectSummaryDraft: `${coreStatus} Current concerns: ${
      sentenceList(summary.operationalConcerns.slice(0, 3)) || "none visible"
    }. Recommended next action: ${nextAction.title}.`,
    reviewBoundary: REVIEW_BOUNDARY
  };
}

export function deriveAiCopilotDraftActions(input: {
  summary: AiProjectOperationalSummary;
  communicationAssistance: AiCommunicationAssistance;
  fieldSummary: AiFieldSummary;
}): AiCopilotDraftAction[] {
  const { summary, communicationAssistance, fieldSummary } = input;
  const customerName = summary.customerName ?? "there";
  const firstNextAction = summary.recommendedNextActions[0];
  const actions: AiCopilotDraftAction[] = [];

  if (hasActionKind(summary, "signature")) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:contract-signature-reminder-draft`,
        actionType: "contract_signature_reminder",
        audience: "customer",
        title: "Contract signature reminder",
        subject: `${summary.projectName}: contract signature follow-up`,
        draftBody: `Hi ${customerName}, we are following up on the contract for ${summary.projectName}. Please review and sign when you have a moment so we can keep the project moving through the next operational step. Let us know if anything needs clarification before you sign.`,
        operationalReason:
          "Signature attention is visible from MessageCenter or contract workflow signals.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          "Draft type: contract/signature reminder"
        ]),
        priority: "high",
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  if (
    hasActionKind(summary, "payment") ||
    communicationAssistance.invoiceReminderDraft
  ) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:deposit-payment-reminder-draft`,
        actionType: "deposit_payment_reminder",
        audience: "customer",
        title: "Deposit or payment reminder",
        subject: `${summary.projectName}: payment follow-up`,
        draftBody:
          communicationAssistance.invoiceReminderDraft ??
          `Hi ${customerName}, we are following up on payment for ${summary.projectName}. Please review the open invoice when you have a moment, and let us know if you have any questions.`,
        operationalReason:
          "Financial attention is visible from invoice, payment, or readiness signals.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          "Draft type: deposit/payment reminder"
        ]),
        priority: hasActionKind(summary, "payment") ? "high" : "normal",
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  if (
    hasActionKind(summary, "schedule") ||
    communicationAssistance.schedulingCoordinationDraft
  ) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:scheduling-readiness-draft`,
        actionType: "scheduling_readiness_coordination",
        audience: "customer",
        title: "Scheduling readiness coordination",
        subject: `${summary.projectName}: scheduling coordination`,
        draftBody:
          communicationAssistance.schedulingCoordinationDraft ??
          `Hi ${customerName}, ${summary.projectName} is ready for scheduling. We will coordinate the production window and confirm timing before the crew is dispatched.`,
        operationalReason:
          "Ready work still needs CrewBoard scheduling or schedule confirmation.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          "Draft type: scheduling coordination"
        ]),
        priority: "normal",
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  if (!fieldSummary.riskIndicators.includes("No Daily Job Logs captured yet")) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:field-progress-update-draft`,
        actionType: "field_progress_update",
        audience: "customer",
        title: "Field progress update",
        subject: `${summary.projectName}: field progress update`,
        draftBody: `Hi ${customerName}, quick field update for ${summary.projectName}: ${fieldSummary.customerReadyUpdate}`,
        operationalReason:
          "FieldTrail has Daily Log or field-summary context available for a customer-safe update.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          "Draft type: field progress update",
          ...fieldSummary.riskIndicators.map((risk) => `Field risk: ${risk}`)
        ]),
        priority: fieldSummary.riskIndicators.length > 0 ? "high" : "normal",
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  if (
    hasActionKind(summary, "communication") ||
    summary.operationalConcerns.length > 0
  ) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:customer-follow-up-draft`,
        actionType: "customer_follow_up",
        audience: "customer",
        title: "Customer follow-up",
        subject: `${summary.projectName}: project follow-up`,
        draftBody: communicationAssistance.followUpDraft,
        operationalReason:
          "The project has communication attention or operational context worth following up on.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          "Draft type: customer follow-up"
        ]),
        priority: hasActionKind(summary, "communication") ? "high" : "normal",
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  if (summary.missingItems.length > 0 && summary.blockers.length === 0) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:stalled-project-follow-up-draft`,
        actionType: "stalled_project_follow_up",
        audience: "customer",
        title: "Stalled-project follow-up",
        subject: `${summary.projectName}: next step follow-up`,
        draftBody: `Hi ${customerName}, we are checking in on ${summary.projectName}. The project is currently at ${summary.stage}, and the next item on our side is ${firstNextAction.title.toLowerCase()}. We will keep the project moving and let you know if anything is needed from you.`,
        operationalReason:
          "The project has missing workflow items but no hard blocker is currently visible.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          ...summary.missingItems.map((item) => `Missing item: ${item}`),
          "Draft type: stalled-project follow-up"
        ]),
        priority: "normal",
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  if (summary.blockers.length > 0 || fieldSummary.riskIndicators.length > 0) {
    actions.push(
      buildDraftAction({
        id: `${summary.projectId}:blocker-escalation-draft`,
        actionType: "blocker_escalation_summary",
        audience: "internal",
        title: "Blocker escalation summary",
        subject: `${summary.projectName}: blocker escalation`,
        draftBody: [
          `Project: ${summary.projectName}`,
          `Stage: ${summary.stage}`,
          `Primary issue: ${
            summary.blockers[0] ??
            fieldSummary.riskIndicators[0] ??
            "Review current project concerns."
          }`,
          `Recommended action: ${firstNextAction.title}`,
          `Context: ${firstNextAction.reason}`
        ].join("\n"),
        operationalReason:
          "Blockers or field risk indicators are visible from canonical project and execution summaries.",
        sourceWorkflowSignals: sourceSignalsFor(summary, [
          ...summary.blockers.map((blocker) => `Blocker: ${blocker}`),
          ...fieldSummary.riskIndicators.map((risk) => `Field risk: ${risk}`),
          "Draft type: blocker/escalation summary"
        ]),
        priority: getHighestPriority([
          firstNextAction.priority,
          fieldSummary.riskIndicators.length > 0 ? "high" : "normal"
        ]),
        reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
      })
    );
  }

  const internalPmSummary = buildDraftAction({
    id: `${summary.projectId}:internal-pm-summary-draft`,
    actionType: "internal_pm_project_summary",
    audience: "internal",
    title: "Internal PM summary",
    subject: `${summary.projectName}: operational summary`,
    draftBody: [
      communicationAssistance.projectSummaryDraft,
      `Readiness: ${summary.readinessState}`,
      `Financials: ${summary.financialState}`,
      `Schedule: ${summary.scheduleState}`,
      `Execution: ${summary.executionState}`,
      `Field: ${fieldSummary.pmSummary}`
    ].join("\n"),
    operationalReason:
      "PM summary is a review-first synthesis of the current Copilot project summary and FieldTrail summary.",
    sourceWorkflowSignals: sourceSignalsFor(summary, [
      "Draft type: internal PM summary"
    ]),
    priority: getHighestPriority(
      summary.recommendedNextActions.map((action) => action.priority)
    ),
    reviewSafetyNote: DRAFT_REVIEW_SAFETY_NOTE
  });

  return [...actions.slice(0, 5), internalPmSummary];
}

export function deriveAiFieldSummary(input: {
  projectId: string;
  projectName: string;
  fieldTrail: FieldTrailSummary;
}): AiFieldSummary {
  const latestLog = input.fieldTrail.latestDailyLog;
  const riskIndicators = [
    ...(input.fieldTrail.openBlockerCount > 0
      ? [
          `${formatCount(
            input.fieldTrail.openBlockerCount,
            "open blocker"
          )} in field notes`
        ]
      : []),
    ...(input.fieldTrail.dailyLogCount > 0 && input.fieldTrail.photoCount === 0
      ? ["Daily Logs exist without photo evidence"]
      : []),
    ...(input.fieldTrail.dailyLogCount === 0
      ? ["No Daily Job Logs captured yet"]
      : [])
  ];

  return {
    pmSummary: latestLog
      ? `${input.projectName}: latest Daily Job Log from ${latestLog.logDate}. ${
          latestLog.summary ??
          latestLog.workCompleted ??
          "Review the log for field detail."
        }`
      : `${input.projectName}: no Daily Job Logs are connected yet.`,
    customerReadyUpdate: latestLog
      ? `${latestLog.summary ?? latestLog.workCompleted ?? "Work activity has been recorded for the project."}${
          latestLog.workPlannedNext ? ` Next: ${latestLog.workPlannedNext}` : ""
        }`
      : "Field work has not produced a Daily Job Log update yet.",
    riskIndicators,
    nextFieldMove: buildAction({
      id: `${input.projectId}:field-summary-next-move`,
      title: input.fieldTrail.nextMove.label,
      detail: input.fieldTrail.nextMove.detail,
      reason:
        "Field summaries derive from Daily Logs, Field Notes, attachments, and time-card context.",
      href: input.fieldTrail.nextMove.href,
      label: input.fieldTrail.nextMove.label,
      kind: "field",
      priority: input.fieldTrail.openBlockerCount > 0 ? "high" : "normal",
      source: "fieldtrail"
    }),
    reviewBoundary: REVIEW_BOUNDARY
  };
}
