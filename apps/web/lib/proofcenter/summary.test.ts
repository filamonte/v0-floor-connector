import assert from "node:assert/strict";
import test from "node:test";

import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";

import { deriveProofCenterSummary } from "./summary";

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
  estimates: [{ id: "estimate-1", status: "approved" }],
  contracts: [{ id: "contract-1", status: "signed" }],
  invoices: [{ id: "invoice-1", status: "paid" }],
  changeOrders: [],
  jobs: [{ id: "job-1", dispatchStatus: "completed" }],
  fieldTrail: fieldTrail({
    dailyLogCount: 1,
    fieldNoteCount: 1,
    attachmentCount: 2
  }),
  messageCenter: messageCenter({
    signatureTrailCount: 2,
    paymentTrailCount: 1,
    sendTrailCount: 3,
    customerAccessCount: 1
  }),
  customerAccessCount: 1,
  warrantyDocumentCount: 0,
  serviceTicketCount: 0,
  closeoutReady: true,
  latestEstimateHref: "/estimates/estimate-1",
  latestContractHref: "/contracts/contract-1",
  latestInvoiceHref: "/invoices/invoice-1",
  latestChangeOrderHref: "/change-orders",
  dailyLogsHref: "/daily-logs?projectId=project-1",
  fieldTrailHref: "#fieldtrail",
  messageCenterHref: "#messagecenter",
  customerAccessHref: "#customer-access",
  warrantyServiceHref: "/service-tickets?projectId=project-1"
};

void test("proofcenter marks signed, paid, and field proof as ready", () => {
  const summary = deriveProofCenterSummary(baseInput);

  assert.equal(summary.proofTone, "ready");
  assert.equal(summary.nextMove.label, "Review project proof");
  assert.equal(summary.counts.signedContracts, 1);
  assert.equal(summary.counts.paymentTrailItems, 1);
  assert.equal(summary.counts.evidenceItems, 2);
});

void test("proofcenter sends unsigned contracts to Signature Trail", () => {
  const summary = deriveProofCenterSummary({
    ...baseInput,
    contracts: [{ id: "contract-1", status: "sent" }],
    messageCenter: messageCenter()
  });

  assert.equal(summary.nextMove.label, "Review Signature Trail");
  assert.equal(summary.nextMove.href, "/contracts/contract-1");
  assert.match(summary.missingProofItems.join(" "), /Signed contract/);
});

void test("proofcenter sends invoices without payment proof to Payment Trail", () => {
  const summary = deriveProofCenterSummary({
    ...baseInput,
    invoices: [{ id: "invoice-1", status: "sent" }],
    messageCenter: messageCenter({ signatureTrailCount: 1 }),
    fieldTrail: fieldTrail({ dailyLogCount: 1, attachmentCount: 1 })
  });

  assert.equal(summary.nextMove.label, "Review Payment Trail");
  assert.equal(summary.nextMove.href, "/invoices/invoice-1");
  assert.match(summary.missingProofItems.join(" "), /Payment proof/);
});

void test("proofcenter sends jobs without Daily Job Logs to Daily Job Logs", () => {
  const summary = deriveProofCenterSummary({
    ...baseInput,
    jobs: [{ id: "job-1", dispatchStatus: "in_progress" }],
    fieldTrail: fieldTrail({ attachmentCount: 0 })
  });

  assert.equal(summary.nextMove.label, "Review Daily Job Logs");
  assert.equal(summary.nextMove.href, "/daily-logs?projectId=project-1");
});

void test("proofcenter sends field history without evidence to FieldTrail", () => {
  const summary = deriveProofCenterSummary({
    ...baseInput,
    fieldTrail: fieldTrail({ dailyLogCount: 1, fieldNoteCount: 2 })
  });

  assert.equal(summary.nextMove.label, "Review FieldTrail");
  assert.equal(summary.nextMove.href, "#fieldtrail");
});

void test("proofcenter sends customer-facing records without access to Customer Access", () => {
  const summary = deriveProofCenterSummary({
    ...baseInput,
    customerAccessCount: 0,
    messageCenter: messageCenter({
      signatureTrailCount: 1,
      paymentTrailCount: 1
    })
  });

  assert.equal(summary.nextMove.label, "Review Customer Access");
  assert.equal(summary.nextMove.href, "#customer-access");
});

void test("proofcenter falls back cleanly when no records exist yet", () => {
  const summary = deriveProofCenterSummary({
    ...baseInput,
    estimates: [],
    contracts: [],
    invoices: [],
    jobs: [],
    fieldTrail: fieldTrail(),
    messageCenter: messageCenter(),
    customerAccessCount: 0
  });

  assert.equal(summary.proofTone, "neutral");
  assert.equal(summary.nextMove.label, "Review project proof");
});
