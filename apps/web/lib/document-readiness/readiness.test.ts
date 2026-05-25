import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveContractDocumentReadiness,
  deriveEstimateDocumentReadiness,
  deriveInvoiceDocumentReadiness
} from "./readiness";

void test("estimate readiness flags missing template as warning and missing context as blockers", () => {
  const readiness = deriveEstimateDocumentReadiness({
    id: "estimate-1",
    referenceNumber: "EST-1",
    status: "draft",
    customerId: null,
    projectId: null,
    templateId: null,
    lineItemCount: 0,
    totalAmount: "0.00"
  });

  assert.equal(readiness.recordType, "estimate");
  assert.equal(readiness.statusTone, "blocked");
  assert.equal(
    readiness.safeDeliveryReadinessLabel,
    "Not ready for customer review"
  );
  assert.ok(
    readiness.blockers.some((issue) => issue.key === "missing_customer")
  );
  assert.ok(
    readiness.blockers.some((issue) => issue.key === "missing_project")
  );
  assert.ok(
    readiness.missingFields.some((issue) => issue.key === "template_fallback")
  );
});

void test("estimate readiness allows preview and review send when context and scope exist", () => {
  const readiness = deriveEstimateDocumentReadiness({
    id: "estimate-1",
    referenceNumber: "EST-1",
    status: "draft",
    customerId: "customer-1",
    customerName: "Acme",
    customerEmail: "buyer@example.com",
    projectId: "project-1",
    projectName: "Shop Floor",
    templateId: "template-1",
    templateName: "Standard proposal",
    lineItemCount: 2,
    totalAmount: "1200.00"
  });

  assert.equal(readiness.statusTone, "ready");
  assert.equal(readiness.safePreviewLabel, "Preview / Print Estimate");
  assert.equal(
    readiness.safeDeliveryReadinessLabel,
    "Ready for customer review"
  );
  assert.equal(readiness.blockers.length, 0);
});

void test("contract draft readiness catches approval and signer blockers", () => {
  const readiness = deriveContractDocumentReadiness({
    id: "contract-1",
    referenceNumber: "CON-1",
    status: "draft",
    internalApprovalStatus: "pending",
    signatureReadinessStatus: "draft",
    customerId: "customer-1",
    projectId: "project-1",
    templateId: "template-1",
    renderedContent: "<p>Agreement</p>",
    customerSignerCount: 0
  });

  assert.equal(readiness.statusTone, "blocked");
  assert.equal(
    readiness.safeDeliveryReadinessLabel,
    "Not ready for signature send"
  );
  assert.ok(
    readiness.blockers.some((issue) => issue.key === "signature_not_ready")
  );
  assert.ok(
    readiness.blockers.some((issue) => issue.key === "missing_customer_signer")
  );
});

void test("contract sent and signed states do not create signature truth from delivery readiness", () => {
  const sent = deriveContractDocumentReadiness({
    id: "contract-1",
    referenceNumber: "CON-1",
    status: "sent",
    internalApprovalStatus: "approved",
    signatureReadinessStatus: "out_for_signature",
    customerId: "customer-1",
    projectId: "project-1",
    templateId: "template-1",
    renderedContent: "<p>Agreement</p>",
    customerSignerCount: 1
  });
  const signed = deriveContractDocumentReadiness({
    id: "contract-1",
    referenceNumber: "CON-1",
    status: "signed",
    internalApprovalStatus: "approved",
    signatureReadinessStatus: "signed",
    customerId: "customer-1",
    projectId: "project-1",
    templateId: "template-1",
    renderedContent: "<p>Agreement</p>",
    customerSignerCount: 1,
    signedAt: "2026-05-25T12:00:00.000Z"
  });

  assert.equal(
    sent.safeDeliveryReadinessLabel,
    "Signature collection in progress"
  );
  assert.equal(signed.safeDeliveryReadinessLabel, "Signed contract");
  assert.equal(signed.statusTone, "complete");
  assert.doesNotMatch(signed.recommendedNextAction, /delivery truth/i);
});

void test("invoice draft is printable but not ready for payment request", () => {
  const readiness = deriveInvoiceDocumentReadiness({
    id: "invoice-1",
    referenceNumber: "INV-1",
    status: "draft",
    customerId: "customer-1",
    projectId: "project-1",
    lineItemCount: 1,
    balanceDueAmount: "500.00"
  });

  assert.equal(readiness.safePreviewLabel, "Preview / Print Invoice");
  assert.equal(
    readiness.safeDeliveryReadinessLabel,
    "Prepare invoice before sending"
  );
  assert.equal(readiness.statusTone, "neutral");
});

void test("invoice sent and partially paid states are ready only when delivery contact exists", () => {
  const sent = deriveInvoiceDocumentReadiness({
    id: "invoice-1",
    referenceNumber: "INV-1",
    status: "sent",
    customerId: "customer-1",
    customerEmail: "billing@example.com",
    projectId: "project-1",
    lineItemCount: 1,
    balanceDueAmount: "500.00"
  });
  const partiallyPaid = deriveInvoiceDocumentReadiness({
    id: "invoice-1",
    referenceNumber: "INV-1",
    status: "partially_paid",
    customerId: "customer-1",
    customerEmail: "billing@example.com",
    projectId: "project-1",
    lineItemCount: 1,
    balanceDueAmount: "250.00"
  });

  assert.equal(sent.safeDeliveryReadinessLabel, "Ready for payment request");
  assert.equal(
    partiallyPaid.safeDeliveryReadinessLabel,
    "Ready for payment request"
  );
  assert.equal(partiallyPaid.statusTone, "ready");
});

void test("invoice readiness blocks missing customer/project context", () => {
  const readiness = deriveInvoiceDocumentReadiness({
    id: "invoice-1",
    referenceNumber: "INV-1",
    status: "sent",
    customerId: null,
    projectId: null,
    lineItemCount: 1,
    balanceDueAmount: "500.00"
  });

  assert.equal(readiness.statusTone, "blocked");
  assert.ok(
    readiness.blockers.some((issue) => issue.key === "missing_customer")
  );
  assert.ok(
    readiness.blockers.some((issue) => issue.key === "missing_project")
  );
});

void test("readiness summaries expose only document-safe categories", () => {
  const readiness = deriveInvoiceDocumentReadiness({
    id: "invoice-1",
    referenceNumber: "INV-1",
    status: "paid",
    customerId: "customer-1",
    projectId: "project-1",
    lineItemCount: 1,
    balanceDueAmount: "0.00"
  });

  assert.equal(readiness.sourceCategory, "document_readiness");
  assert.doesNotMatch(
    JSON.stringify(readiness),
    /\bCopilot\b|\bAR\b|blocker pressure/i
  );
});
