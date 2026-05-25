import assert from "node:assert/strict";
import test from "node:test";

import type { CloseoutTrailSummary } from "@/lib/closeouttrail/summary";
import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";
import type { ProjectPulseSummary } from "@/lib/projectpulse/summary";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

import {
  deriveAiCopilotDraftActions,
  deriveAiCommunicationAssistance,
  deriveAiFieldSummary,
  deriveAiOperationalDigest,
  deriveAiProjectOperationalSummary
} from "./summary";

function readiness(
  overrides: Partial<ProjectFinancialReadinessSnapshot> = {}
): ProjectFinancialReadinessSnapshot {
  return {
    status: "ready_to_schedule",
    blockers: [],
    isReadyToSchedule: true,
    isOperationallyActive: true,
    depositRequired: false,
    depositSatisfied: true,
    financingStatus: "not_applicable",
    opportunityId: null,
    siteAssessmentStatus: null,
    estimateId: "estimate-1",
    estimateStatus: "approved",
    contractId: "contract-1",
    contractStatus: "signed",
    contractInternalApprovalStatus: "approved",
    contractSignedAt: "2026-05-20T10:00:00.000Z",
    depositInvoiceId: null,
    depositInvoiceStatus: null,
    ...overrides
  };
}

function fieldTrail(
  overrides: Partial<FieldTrailSummary> = {}
): FieldTrailSummary {
  return {
    latestDailyLog: null,
    latestJob: null,
    dailyLogCount: 0,
    fieldNoteCount: 0,
    openBlockerCount: 0,
    attachmentCount: 0,
    photoCount: 0,
    totalWorkedMinutes: 0,
    timeline: [],
    nextMove: {
      label: "Open CrewBoard",
      href: "/schedule",
      detail: "No field history exists yet."
    },
    ...overrides
  };
}

function messageCenter(
  overrides: Partial<MessageCenterSummary> = {}
): MessageCenterSummary {
  return {
    latestActivityAt: null,
    threadCount: 0,
    messageCount: 0,
    sendTrailCount: 0,
    signatureTrailCount: 0,
    paymentTrailCount: 0,
    customerAccessCount: 0,
    attentionCount: 0,
    latestSendTrail: null,
    latestSignatureTrail: null,
    latestPaymentTrail: null,
    nextMove: {
      label: "Open communications",
      href: "/communications?source=project",
      detail: "No communication history exists yet."
    },
    timeline: [],
    ...overrides
  };
}

function projectPulse(
  overrides: Partial<ProjectPulseSummary> = {}
): ProjectPulseSummary {
  return {
    stageLabel: "Ready for scheduling",
    healthTone: "good",
    primaryMessage: "The current project signals look healthy.",
    nextMove: {
      label: "Open CrewBoard",
      href: "/schedule?projectId=project-1",
      reason: "Ready Check is clear."
    },
    blockers: [],
    warnings: [],
    highlights: ["Ready Check is clear for scheduling."],
    linkedCounts: {
      jobs: 1,
      openBlockers: 0,
      dailyLogs: 0,
      communicationItems: 0,
      unpaidInvoices: 0,
      pendingSignatureItems: 0,
      paymentAttentionItems: 0
    },
    signals: [
      {
        id: "schedule",
        label: "Schedule / CrewBoard",
        status: "Needs scheduling",
        detail: "1 job needs CrewBoard follow-through.",
        href: "/schedule?projectId=project-1",
        tone: "attention"
      }
    ],
    ...overrides
  };
}

function closeoutTrail(
  overrides: Partial<CloseoutTrailSummary> = {}
): CloseoutTrailSummary {
  return {
    closeoutTone: "attention",
    closeoutStatusLabel: "Not ready for closeout",
    primaryMessage: "Closeout needs more project evidence.",
    nextMove: {
      label: "Review closeout",
      href: "#closeouttrail",
      reason: "Review closeout readiness."
    },
    checklistItems: [],
    linkedCounts: {
      completedJobs: 0,
      openJobs: 0,
      unresolvedJobNotes: 0,
      dailyLogs: 0,
      evidenceItems: 0,
      openInvoices: 0,
      unpaidBalance: 0,
      unresolvedChangeOrders: 0,
      signedContracts: 0,
      warrantyOrServiceItems: 0
    },
    blockers: [],
    highlights: [],
    ...overrides
  };
}

const baseInput = {
  project: {
    id: "project-1",
    name: "Warehouse coating",
    customerName: "Acme"
  },
  readinessSnapshot: readiness(),
  projectPulse: projectPulse(),
  fieldTrail: fieldTrail(),
  messageCenter: messageCenter(),
  closeoutTrail: closeoutTrail()
};

void test("AI project summary keeps recommendations grounded in canonical readiness and schedule state", () => {
  const summary = deriveAiProjectOperationalSummary(baseInput);

  assert.equal(summary.projectId, "project-1");
  assert.equal(summary.tone, "ready");
  assert.match(summary.scheduleState, /Needs scheduling/);
  assert.equal(summary.recommendedNextActions[0]?.kind, "schedule");
  assert.ok(summary.groundedSources.includes("projectpulse"));
  assert.ok(summary.groundedSources.includes("readiness"));
  assert.match(summary.reviewBoundary, /does not create/);
});

void test("AI project summary prioritizes blocked readiness before lower-risk guidance", () => {
  const summary = deriveAiProjectOperationalSummary({
    ...baseInput,
    readinessSnapshot: readiness({
      status: "waiting_on_deposit",
      isReadyToSchedule: false,
      blockers: ["deposit_required"],
      depositSatisfied: false
    }),
    projectPulse: projectPulse({
      healthTone: "blocked",
      blockers: ["Deposit is required before scheduling."],
      warnings: ["1 job still needs CrewBoard scheduling."]
    })
  });

  assert.equal(summary.tone, "blocked");
  assert.equal(summary.recommendedNextActions[0]?.kind, "readiness");
  assert.equal(summary.recommendedNextActions[0]?.priority, "critical");
  assert.match(summary.financialState, /Deposit|financing/);
});

void test("AI digest groups collection and execution risks without creating new source truth", () => {
  const collectionSummary = deriveAiProjectOperationalSummary({
    ...baseInput,
    projectPulse: projectPulse({
      healthTone: "attention",
      linkedCounts: {
        ...projectPulse().linkedCounts,
        unpaidInvoices: 1
      }
    })
  });
  const fieldSummary = deriveAiProjectOperationalSummary({
    ...baseInput,
    project: {
      id: "project-2",
      name: "Retail prep",
      customerName: "North"
    },
    fieldTrail: fieldTrail({
      openBlockerCount: 2,
      nextMove: {
        label: "Review Job Notes",
        href: "/daily-logs/log-1#job-notes",
        detail: "2 open blocker notes need attention."
      }
    })
  });
  const digest = deriveAiOperationalDigest([collectionSummary, fieldSummary]);

  assert.equal(digest.collectionRisks.length, 1);
  assert.equal(digest.executionGaps.length, 1);
  assert.match(digest.digestSummary, /collection risk/);
});

void test("AI communication assistance drafts review-first copy from the summary", () => {
  const summary = deriveAiProjectOperationalSummary(baseInput);
  const assistance = deriveAiCommunicationAssistance(summary);

  assert.match(assistance.followUpDraft, /Warehouse coating/);
  assert.match(assistance.customerStatusUpdateDraft, /Hi Acme/);
  assert.equal(assistance.invoiceReminderDraft, null);
  assert.match(assistance.reviewBoundary, /review-first/);
});

void test("AI field summary surfaces Daily Log context and field risk indicators", () => {
  const fieldSummary = deriveAiFieldSummary({
    projectId: "project-1",
    projectName: "Warehouse coating",
    fieldTrail: fieldTrail({
      latestDailyLog: {
        id: "log-1",
        jobId: "job-1",
        logDate: "2026-05-24",
        status: "finalized",
        summary: "Prep completed and crack repair started.",
        workCompleted: "Prep completed.",
        workPlannedNext: "Broadcast flake tomorrow.",
        delaysOrBlockers: null,
        weatherSummary: null,
        updatedAt: "2026-05-24T12:00:00.000Z"
      },
      dailyLogCount: 1,
      photoCount: 0,
      nextMove: {
        label: "Add field evidence",
        href: "/daily-logs/log-1#field-evidence",
        detail: "Daily Job Logs exist, but no field evidence is attached yet."
      }
    })
  });

  assert.match(fieldSummary.pmSummary, /Prep completed/);
  assert.match(fieldSummary.customerReadyUpdate, /Broadcast flake tomorrow/);
  assert.deepEqual(fieldSummary.riskIndicators, [
    "Daily Logs exist without photo evidence"
  ]);
  assert.equal(fieldSummary.nextFieldMove.kind, "field");
});

void test("AI action composer drafts signature, payment, schedule, and internal review actions without side effects", () => {
  const summary = deriveAiProjectOperationalSummary({
    ...baseInput,
    projectPulse: projectPulse({
      healthTone: "attention",
      linkedCounts: {
        ...projectPulse().linkedCounts,
        pendingSignatureItems: 1,
        unpaidInvoices: 1
      },
      signals: [
        {
          id: "schedule",
          label: "Schedule / CrewBoard",
          status: "Needs scheduling",
          detail: "1 job needs CrewBoard follow-through.",
          href: "/schedule?projectId=project-1",
          tone: "attention"
        }
      ]
    })
  });
  const communicationAssistance = deriveAiCommunicationAssistance(summary);
  const fieldSummary = deriveAiFieldSummary({
    projectId: "project-1",
    projectName: "Warehouse coating",
    fieldTrail: fieldTrail({
      latestDailyLog: {
        id: "log-1",
        jobId: "job-1",
        logDate: "2026-05-24",
        status: "finalized",
        summary: "Prep completed.",
        workCompleted: null,
        workPlannedNext: null,
        delaysOrBlockers: null,
        weatherSummary: null,
        updatedAt: "2026-05-24T12:00:00.000Z"
      },
      dailyLogCount: 1
    })
  });
  const draftActions = deriveAiCopilotDraftActions({
    summary,
    communicationAssistance,
    fieldSummary
  });

  assert.ok(
    draftActions.some(
      (action) => action.actionType === "contract_signature_reminder"
    )
  );
  assert.ok(
    draftActions.some(
      (action) => action.actionType === "deposit_payment_reminder"
    )
  );
  assert.ok(
    draftActions.some(
      (action) => action.actionType === "scheduling_readiness_coordination"
    )
  );
  assert.equal(draftActions.at(-1)?.actionType, "internal_pm_project_summary");
  assert.ok(
    draftActions.every((action) =>
      /does not send/.test(action.reviewSafetyNote)
    )
  );
});

void test("AI action composer creates internal blocker escalation from field risks", () => {
  const summary = deriveAiProjectOperationalSummary({
    ...baseInput,
    projectPulse: projectPulse({
      healthTone: "blocked",
      blockers: ["Deposit is required before scheduling."]
    })
  });
  const communicationAssistance = deriveAiCommunicationAssistance(summary);
  const fieldSummary = deriveAiFieldSummary({
    projectId: "project-1",
    projectName: "Warehouse coating",
    fieldTrail: fieldTrail({
      openBlockerCount: 1,
      nextMove: {
        label: "Review Job Notes",
        href: "/daily-logs/log-1#job-notes",
        detail: "One open blocker needs attention."
      }
    })
  });
  const draftActions = deriveAiCopilotDraftActions({
    summary,
    communicationAssistance,
    fieldSummary
  });
  const escalation = draftActions.find(
    (action) => action.actionType === "blocker_escalation_summary"
  );

  assert.equal(escalation?.audience, "internal");
  assert.equal(escalation?.priority, "critical");
  assert.match(escalation?.draftBody ?? "", /Deposit is required/);
  assert.ok(
    escalation?.sourceWorkflowSignals.some((signal) =>
      signal.includes("Blocker:")
    )
  );
});
