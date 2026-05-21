import assert from "node:assert/strict";
import test from "node:test";

import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";

import { deriveCloseoutTrailSummary } from "./summary";

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
  jobs: [{ id: "job-1", dispatchStatus: "completed" }],
  contracts: [{ id: "contract-1", status: "signed" }],
  invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0.00" }],
  changeOrders: [],
  fieldTrail: fieldTrail({
    dailyLogCount: 1,
    attachmentCount: 2,
    latestDailyLog: {
      id: "log-1",
      jobId: "job-1",
      logDate: "2026-05-21",
      status: "finalized",
      summary: "Install complete",
      workCompleted: null,
      workPlannedNext: null,
      delaysOrBlockers: null,
      weatherSummary: null,
      updatedAt: "2026-05-21T18:00:00.000Z"
    }
  }),
  messageCenter: messageCenter({
    latestActivityAt: "2026-05-21T19:00:00.000Z"
  }),
  customerAccessCount: 1,
  warrantyOrServiceItemCount: 0,
  scheduleHref: "/schedule?projectId=project-1",
  dailyLogsHref: "/daily-logs?projectId=project-1",
  fieldTrailHref: "#fieldtrail",
  messageCenterHref: "#messagecenter",
  serviceWarrantyHref: "/service-tickets?projectId=project-1"
};

void test("closeouttrail marks a completed proof set ready for review", () => {
  const summary = deriveCloseoutTrailSummary(baseInput);

  assert.equal(summary.closeoutTone, "ready");
  assert.equal(summary.nextMove.label, "Ready for closeout review");
  assert.equal(summary.linkedCounts.completedJobs, 1);
  assert.equal(summary.linkedCounts.evidenceItems, 2);
});

void test("closeouttrail sends unsigned contracts to Signature Trail first", () => {
  const summary = deriveCloseoutTrailSummary({
    ...baseInput,
    contracts: [{ id: "contract-1", status: "sent" }]
  });

  assert.equal(summary.closeoutTone, "blocked");
  assert.equal(summary.nextMove.label, "Review Signature Trail");
  assert.equal(summary.nextMove.href, "/contracts/contract-1");
});

void test("closeouttrail points open jobs back to job or CrewBoard", () => {
  const summary = deriveCloseoutTrailSummary({
    ...baseInput,
    jobs: [
      { id: "job-1", dispatchStatus: "completed" },
      { id: "job-2", dispatchStatus: "in_progress" }
    ]
  });

  assert.equal(summary.closeoutTone, "attention");
  assert.equal(summary.nextMove.label, "Review job or CrewBoard");
  assert.equal(summary.nextMove.href, "/jobs/job-2");
  assert.equal(summary.linkedCounts.openJobs, 1);
});

void test("closeouttrail routes unresolved Job Notes to FieldTrail", () => {
  const summary = deriveCloseoutTrailSummary({
    ...baseInput,
    fieldTrail: fieldTrail({
      dailyLogCount: 1,
      attachmentCount: 1,
      openBlockerCount: 1
    })
  });

  assert.equal(summary.closeoutTone, "attention");
  assert.equal(summary.nextMove.label, "Review FieldTrail");
  assert.equal(summary.linkedCounts.unresolvedJobNotes, 1);
});

void test("closeouttrail routes open invoices to Payment Trail", () => {
  const summary = deriveCloseoutTrailSummary({
    ...baseInput,
    invoices: [{ id: "invoice-1", status: "sent", balanceDueAmount: "700.00" }]
  });

  assert.equal(summary.closeoutTone, "attention");
  assert.equal(summary.nextMove.label, "Review Payment Trail");
  assert.equal(summary.nextMove.href, "/invoices/invoice-1");
  assert.equal(summary.linkedCounts.unpaidBalance, 700);
});

void test("closeouttrail routes unresolved change orders to change order detail", () => {
  const summary = deriveCloseoutTrailSummary({
    ...baseInput,
    changeOrders: [{ id: "change-order-1", status: "sent" }]
  });

  assert.equal(summary.closeoutTone, "attention");
  assert.equal(summary.nextMove.label, "Review change order");
  assert.equal(summary.nextMove.href, "/change-orders/change-order-1");
});
