import assert from "node:assert/strict";
import test from "node:test";

import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

import { deriveProjectPulseSummary } from "./summary";

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

const baseInput = {
  projectId: "project-1",
  readinessSnapshot: readiness(),
  readyCheckBlockers: [],
  approvedEstimateId: "estimate-1",
  latestContractId: "contract-1",
  latestContractStatus: "signed",
  jobs: [],
  invoices: [],
  fieldTrail: fieldTrail(),
  messageCenter: messageCenter(),
  scheduleHref: "/schedule?projectId=project-1",
  todayIsoDate: "2026-05-21"
};

void test("projectpulse picks Ready Check blockers before other next moves", () => {
  const summary = deriveProjectPulseSummary({
    ...baseInput,
    readinessSnapshot: readiness({
      status: "waiting_on_deposit",
      blockers: ["deposit_required"],
      isReadyToSchedule: false
    }),
    readyCheckBlockers: ["Deposit is required before scheduling."],
    jobs: [{ id: "job-1", dispatchStatus: "unscheduled", scheduledDate: null }]
  });

  assert.equal(summary.healthTone, "blocked");
  assert.equal(summary.nextMove.label, "Resolve Ready Check");
  assert.equal(summary.signals[0]?.status, "GateKeeper holding");
});

void test("projectpulse routes ready unscheduled work into CrewBoard", () => {
  const summary = deriveProjectPulseSummary({
    ...baseInput,
    jobs: [{ id: "job-1", dispatchStatus: "unscheduled", scheduledDate: null }]
  });

  assert.equal(summary.nextMove.label, "Open CrewBoard");
  assert.equal(summary.nextMove.href, "/schedule?projectId=project-1");
  assert.equal(summary.linkedCounts.jobs, 1);
});

void test("projectpulse lets FieldTrail blockers influence health and next move", () => {
  const summary = deriveProjectPulseSummary({
    ...baseInput,
    fieldTrail: fieldTrail({
      openBlockerCount: 1,
      dailyLogCount: 2,
      nextMove: {
        label: "Open latest Daily Job Log",
        href: "/daily-logs/log-1",
        detail: "One open blocker needs attention."
      }
    })
  });

  assert.equal(summary.healthTone, "attention");
  assert.equal(summary.nextMove.label, "Review FieldTrail");
  assert.equal(summary.linkedCounts.openBlockers, 1);
});

void test("projectpulse flags active execution without a current Daily Job Log", () => {
  const summary = deriveProjectPulseSummary({
    ...baseInput,
    jobs: [
      {
        id: "job-1",
        dispatchStatus: "in_progress",
        scheduledDate: "2026-05-21"
      }
    ],
    fieldTrail: fieldTrail({
      latestDailyLog: {
        id: "log-1",
        jobId: "job-1",
        logDate: "2026-05-20",
        status: "finalized",
        summary: "Prep complete",
        workCompleted: null,
        workPlannedNext: null,
        delaysOrBlockers: null,
        weatherSummary: null,
        updatedAt: "2026-05-20T20:00:00.000Z"
      },
      dailyLogCount: 1,
      nextMove: {
        label: "Open latest Daily Job Log",
        href: "/daily-logs/log-1",
        detail: "Review the latest field narrative."
      }
    })
  });

  assert.equal(summary.stageLabel, "Execution active");
  assert.equal(summary.nextMove.label, "Review Daily Job Log");
  assert.match(summary.warnings.join(" "), /Daily Job Log/);
});

void test("projectpulse routes unpaid invoices into Payment Trail before communication review", () => {
  const summary = deriveProjectPulseSummary({
    ...baseInput,
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        balanceDueAmount: "450.00"
      }
    ],
    messageCenter: messageCenter({
      attentionCount: 1,
      nextMove: {
        label: "Review MessageCenter",
        href: "#messagecenter",
        detail: "One communication item needs follow-up."
      }
    })
  });

  assert.equal(summary.nextMove.label, "Review Payment Trail");
  assert.equal(summary.nextMove.href, "/invoices/invoice-1");
  assert.equal(summary.linkedCounts.unpaidInvoices, 1);
});

void test("projectpulse returns a healthy fallback when current signals are clear", () => {
  const summary = deriveProjectPulseSummary({
    ...baseInput,
    jobs: [
      {
        id: "job-1",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-22"
      }
    ],
    fieldTrail: fieldTrail({
      latestDailyLog: {
        id: "log-1",
        jobId: "job-1",
        logDate: "2026-05-21",
        status: "finalized",
        summary: "Prep complete",
        workCompleted: null,
        workPlannedNext: null,
        delaysOrBlockers: null,
        weatherSummary: null,
        updatedAt: "2026-05-21T20:00:00.000Z"
      },
      dailyLogCount: 1
    }),
    messageCenter: messageCenter({
      latestActivityAt: "2026-05-21T18:00:00.000Z",
      threadCount: 1,
      messageCount: 1
    })
  });

  assert.equal(summary.healthTone, "good");
  assert.equal(summary.nextMove.label, "Continue project review");
  assert.equal(summary.linkedCounts.communicationItems, 1);
});
