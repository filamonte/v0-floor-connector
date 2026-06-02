import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalSafeStatusExplanation } from "./status-explanation";

void test("portal-safe status explains contract sent unsigned", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    contracts: [
      {
        id: "contract-1",
        status: "sent",
        currentUserCanSign: true,
        sentAt: "2026-05-25T12:00:00.000Z"
      }
    ]
  });

  assert.equal(explanation.headline, "Contract ready for signature");
  assert.equal(explanation.customerActionHref, "/portal/contracts/contract-1");
  assert.equal(explanation.sourceCategory, "contract");
  assert.doesNotMatch(
    explanation.shortExplanation,
    /\bCopilot\b|\bAR\b|blocker/i
  );
});

void test("portal-safe status explains signed contract with deposit payment needed", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    contracts: [{ id: "contract-1", status: "signed" }],
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        workflowRole: "deposit",
        balanceDueAmount: "1500.00",
        latestPaymentEventType: "payment_requested"
      }
    ]
  });

  assert.equal(explanation.headline, "Payment requested");
  assert.equal(explanation.customerActionLabel, "Review or pay invoice");
  assert.equal(explanation.customerActionHref, "/portal/invoices/invoice-1");
  assert.equal(explanation.sourceCategory, "invoice");
});

void test("portal-safe status explains invoice payment in progress", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        balanceDueAmount: "500.00",
        latestPaymentEventType: "checkout_started"
      }
    ]
  });

  assert.equal(explanation.headline, "Payment in progress");
  assert.equal(explanation.sourceCategory, "payment");
  assert.equal(explanation.customerActionHref, "/portal/invoices/invoice-1");
});

void test("portal-safe status explains failed payment without provider internals", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        balanceDueAmount: "500.00",
        latestPaymentEventType: "payment_failed"
      }
    ]
  });

  assert.equal(explanation.headline, "Payment needs review");
  assert.equal(explanation.sourceCategory, "payment");
  assert.equal(explanation.customerActionHref, "/portal/invoices/invoice-1");
  assert.doesNotMatch(
    `${explanation.shortExplanation} ${explanation.safeNextStep}`,
    /provider|stripe|checkout session|payment intent|failure code/i
  );
});

void test("portal-safe status explains partially paid invoice", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        status: "partially_paid",
        balanceDueAmount: "350.00"
      }
    ]
  });

  assert.equal(explanation.headline, "Payment partially complete");
  assert.equal(explanation.sourceCategory, "invoice");
});

void test("portal-safe status explains ready to schedule", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    contracts: [{ id: "contract-1", status: "signed" }],
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }]
  });

  assert.equal(explanation.headline, "Your project is ready for scheduling");
  assert.equal(explanation.sourceCategory, "schedule");
  assert.equal(explanation.customerActionHref, null);
});

void test("portal-safe status explains scheduled job", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    jobs: [
      {
        id: "job-1",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-28"
      }
    ]
  });

  assert.equal(explanation.headline, "Work is scheduled");
  assert.equal(explanation.sourceCategory, "schedule");
});

void test("portal-safe status explains in-progress job", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    jobs: [{ id: "job-1", dispatchStatus: "in_progress" }]
  });

  assert.equal(explanation.headline, "Work is in progress");
  assert.equal(explanation.sourceCategory, "schedule");
});

void test("portal-safe status explains completed and paid project", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    jobs: [{ id: "job-1", dispatchStatus: "completed" }]
  });

  assert.equal(explanation.headline, "Project records are current");
  assert.equal(explanation.statusTone, "complete");
});

void test("portal-safe status falls back when no portal-safe action is available", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    projectName: "Shop floor"
  });

  assert.equal(explanation.headline, "Project records are being prepared");
  assert.equal(explanation.customerActionHref, null);
  assert.equal(explanation.sourceCategory, "none");
});

void test("portal-safe status ignores internal blocker-like data not accepted by the derivation layer", () => {
  const explanation = derivePortalSafeStatusExplanation({
    projectId: "project-1",
    projectName: "Shop floor",
    // This intentionally simulates accidental caller noise. The helper only
    // accepts canonical portal-safe records and should ignore this data.
    internalBlockers: [{ label: "Crew missing" }],
    fieldNotes: [{ body: "Internal field note" }],
    unsharedEvidence: [{ title: "Internal field photo" }]
  } as Parameters<typeof derivePortalSafeStatusExplanation>[0] & {
    internalBlockers: Array<{ label: string }>;
    fieldNotes: Array<{ body: string }>;
    unsharedEvidence: Array<{ title: string }>;
  });

  assert.equal(explanation.headline, "Project records are being prepared");
  assert.doesNotMatch(
    `${explanation.shortExplanation} ${explanation.safeNextStep}`,
    /Crew missing|Internal field note|Internal field photo|blocker/i
  );
});
