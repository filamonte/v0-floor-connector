import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalCloseoutHandoff } from "./closeout-handoff";

void test("portal closeout handoff prioritizes unsigned contract review", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1",
    projectStatus: "in_progress",
    customerNextStep: {
      label: "Sign contract",
      description: "The contract is waiting for signature.",
      href: "/portal/contracts/contract-1",
      tone: "attention"
    },
    contracts: [
      {
        id: "contract-1",
        title: "Project contract",
        status: "sent",
        sentAt: "2026-05-20T10:00:00.000Z"
      }
    ],
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        status: "paid",
        balanceDueAmount: "0"
      }
    ]
  });

  assert.equal(handoff.statusTone, "attention");
  assert.equal(handoff.nextAction.label, "Review contract");
  assert.equal(handoff.nextAction.href, "/portal/contracts/contract-1");
  assert.equal(handoff.documentPackageItems[0]?.label, "Contract");
  assert.deepEqual(
    handoff.confidenceThread
      .filter(
        (item) => item.key === "project-status" || item.key === "next-step"
      )
      .map((item) => [item.label, item.value, item.tone]),
    [
      ["Project status", "in progress", "attention"],
      ["Next step", "Sign contract", "attention"]
    ]
  );
});

void test("portal closeout handoff classifies customer-safe payment states", () => {
  const failed = derivePortalCloseoutHandoff({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        status: "sent",
        balanceDueAmount: "$500.00",
        latestPaymentEventType: "payment_failed"
      }
    ]
  });

  assert.equal(failed.statusTone, "warning");
  assert.equal(failed.paymentSummary.statusLabel, "Payment needs review");
  assert.equal(failed.nextAction.label, "Review payment");

  const paid = derivePortalCloseoutHandoff({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        status: "paid",
        balanceDueAmount: "$0.00"
      }
    ]
  });

  assert.equal(paid.paymentSummary.statusLabel, "Invoices current");
  assert.equal(paid.paymentSummary.tone, "complete");
});

void test("portal closeout handoff summarizes document package without internal evidence", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1",
    estimates: [{ id: "estimate-1", status: "approved" }],
    contracts: [{ id: "contract-1", status: "signed" }],
    changeOrders: [{ id: "change-order-1", status: "approved" }],
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    warrantyDocuments: [
      {
        id: "warranty-1",
        title: "Warranty certificate",
        status: "signed",
        currentUserSignerStatus: "signed"
      }
    ]
  });

  assert.equal(handoff.statusTone, "complete");
  assert.deepEqual(
    handoff.documentPackageItems.map((item) => [item.label, item.href]),
    [
      ["Estimate", "/portal/estimates/estimate-1"],
      ["Contract", "/portal/contracts/contract-1"],
      ["Change order", "/portal/change-orders/change-order-1"],
      ["Invoice", "/portal/invoices/invoice-1"],
      ["Warranty", "/portal/warranty-documents/warranty-1"]
    ]
  );

  const packageText = JSON.stringify(
    handoff.documentPackageItems
  ).toLowerCase();
  assert.doesNotMatch(packageText, /fieldtrail/);
  assert.doesNotMatch(packageText, /proof center/);
  assert.doesNotMatch(packageText, /execution attachment/);
  assert.match(handoff.customerSafeBoundary, /remain internal/);
});

void test("portal closeout handoff shows ready-for-closeout context from current shared records", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1",
    projectStatus: "ready_for_closeout",
    customerNextStep: {
      label: "No action needed",
      description: "No shared record currently needs customer action.",
      href: "/portal/projects/project-1",
      tone: "complete"
    },
    contracts: [{ id: "contract-1", status: "signed" }],
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    sharedEvidenceReceipt: {
      statusLabel: "No shared evidence",
      primaryMessage:
        "No customer-visible project evidence has been explicitly shared yet.",
      activeSharedCount: 0,
      acknowledgedCount: 0,
      unacknowledgedSharedCount: 0,
      lastCustomerInteractionAt: null,
      status: "no_shared_evidence"
    }
  });

  assert.equal(handoff.statusTone, "complete");
  assert.equal(handoff.nextAction.label, "Review closeout records");
  assert.equal(
    handoff.confidenceThread.find((item) => item.key === "project-status")
      ?.value,
    "ready for closeout"
  );
  assert.equal(
    handoff.confidenceThread.find((item) => item.key === "invoice")?.tone,
    "complete"
  );
});

void test("portal closeout handoff keeps missing-document context customer safe", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1",
    projectStatus: "in_progress",
    customerNextStep: {
      label: "No action needed",
      description: "No shared record currently needs customer action.",
      href: "/portal/projects/project-1",
      tone: "complete"
    },
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    sharedEvidenceReceipt: {
      statusLabel: "No shared evidence",
      primaryMessage:
        "No customer-visible project evidence has been explicitly shared yet.",
      activeSharedCount: 0,
      acknowledgedCount: 0,
      unacknowledgedSharedCount: 0,
      lastCustomerInteractionAt: null,
      status: "no_shared_evidence"
    }
  });

  const contractThread = handoff.confidenceThread.find(
    (item) => item.key === "contract"
  );
  const warrantyThread = handoff.confidenceThread.find(
    (item) => item.key === "warranty"
  );
  const evidenceThread = handoff.confidenceThread.find(
    (item) => item.key === "evidence-receipt"
  );
  const renderedText = JSON.stringify(handoff.confidenceThread).toLowerCase();

  assert.equal(contractThread?.value, "Not shared");
  assert.equal(warrantyThread?.value, "Warranty not shared yet");
  assert.equal(evidenceThread?.value, "No shared evidence");
  assert.doesNotMatch(renderedText, /fieldtrail/);
  assert.doesNotMatch(renderedText, /daily job log/);
  assert.doesNotMatch(renderedText, /execution attachment/);
});

void test("portal closeout handoff shows completed closeout confidence when evidence and warranty are acknowledged", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1",
    projectStatus: "completed",
    customerNextStep: {
      label: "No action needed",
      description: "No shared record currently needs customer action.",
      href: "/portal/projects/project-1",
      tone: "complete"
    },
    contracts: [{ id: "contract-1", status: "signed" }],
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    warrantyDocuments: [
      {
        id: "warranty-1",
        title: "Warranty certificate",
        status: "signed",
        currentUserSignerStatus: "signed"
      }
    ],
    sharedEvidenceReceipt: {
      statusLabel: "Fully acknowledged",
      primaryMessage:
        "All active shared evidence has customer acknowledgement recorded.",
      activeSharedCount: 2,
      acknowledgedCount: 2,
      unacknowledgedSharedCount: 0,
      lastCustomerInteractionAt: "2026-06-01T16:00:00.000Z",
      status: "fully_acknowledged"
    }
  });

  assert.equal(handoff.statusTone, "complete");
  assert.equal(
    handoff.confidenceThread.find((item) => item.key === "evidence-receipt")
      ?.tone,
    "complete"
  );
  assert.equal(
    handoff.confidenceThread.find((item) => item.key === "warranty")?.tone,
    "complete"
  );
});

void test("portal closeout handoff routes warranty signer action", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1",
    contracts: [{ id: "contract-1", status: "signed" }],
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    warrantyDocuments: [
      {
        id: "warranty-1",
        title: "Warranty certificate",
        status: "issued",
        currentUserSignerStatus: "requested",
        currentUserCanAct: true
      }
    ]
  });

  assert.equal(
    handoff.warrantySummary.statusLabel,
    "Warranty ready for review"
  );
  assert.equal(handoff.nextAction.label, "Review warranty");
  assert.equal(
    handoff.nextAction.href,
    "/portal/warranty-documents/warranty-1"
  );
});

void test("portal closeout handoff returns a safe empty state", () => {
  const handoff = derivePortalCloseoutHandoff({
    projectId: "project-1"
  });

  assert.equal(handoff.statusTone, "neutral");
  assert.equal(handoff.documentPackageItems.length, 0);
  assert.match(handoff.emptyStateMessage, /No closeout records/);
});
