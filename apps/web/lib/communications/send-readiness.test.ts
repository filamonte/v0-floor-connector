import assert from "node:assert/strict";
import test from "node:test";

import { deriveCustomerCommunicationSendReadiness } from "./send-readiness";
import type { DocumentReadinessSummary } from "@/lib/document-readiness/readiness";

const readyInvoiceReadiness: DocumentReadinessSummary = {
  recordType: "invoice",
  recordId: "invoice-1",
  recordReference: "INV-1",
  templateAvailabilityLabel: "Standard invoice rendering",
  requiredContextLabel: "Jordan / Garage floor",
  stateLabel: "sent",
  missingFields: [],
  blockers: [],
  safePreviewLabel: "Preview / Print Invoice",
  safeDeliveryReadinessLabel: "Ready for payment request",
  recommendedNextAction:
    "Review the printable invoice, then send the portal review/payment link.",
  statusTone: "ready",
  sourceCategory: "document_readiness"
};

void test("marks customer communication ready when customer and document context are ready", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "payment_reminder",
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    },
    relatedRecord: {
      type: "invoice",
      id: "invoice-1",
      label: "Invoice INV-1",
      href: "/invoices/invoice-1"
    },
    documentReadiness: readyInvoiceReadiness
  });

  assert.equal(readiness.readinessStatus, "ready");
  assert.equal(readiness.canPrepareCustomerMessage, true);
  assert.equal(readiness.willSendAutomatically, false);
  assert.equal(readiness.documentReadinessLabel, "Ready for payment request");
});

void test("blocks customer readiness when no customer or delivery contact is selected", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "customer_follow_up",
    relatedRecord: {
      type: "project",
      id: "project-1",
      label: "Garage floor",
      href: "/projects/project-1"
    }
  });

  assert.equal(readiness.readinessStatus, "blocked");
  assert.ok(
    readiness.missingRequirements.some((requirement) =>
      requirement.includes("Select a customer/contact")
    )
  );
});

void test("blocks document-related drafts when linked document readiness has blockers", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "contract_signature_reminder",
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    },
    relatedRecord: {
      type: "contract",
      id: "contract-1",
      label: "Contract CON-1",
      href: "/contracts/contract-1"
    },
    documentReadiness: {
      ...readyInvoiceReadiness,
      recordType: "contract",
      recordId: "contract-1",
      recordReference: "CON-1",
      safeDeliveryReadinessLabel: "Not ready for signature send",
      recommendedNextAction:
        "Resolve approval, signer, context, or rendered-content readiness before sending.",
      statusTone: "blocked",
      missingFields: [
        {
          key: "missing_customer_signer",
          label: "No customer signer is available",
          severity: "blocker"
        }
      ],
      blockers: [
        {
          key: "missing_customer_signer",
          label: "No customer signer is available",
          severity: "blocker"
        }
      ]
    }
  });

  assert.equal(readiness.readinessStatus, "blocked");
  assert.ok(
    readiness.missingRequirements.includes("No customer signer is available")
  );
});

void test("does not mark internal-only drafts customer-ready", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "internal",
    actionType: "internal_pm_project_summary",
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    },
    relatedRecord: {
      type: "project",
      id: "project-1",
      label: "Garage floor",
      href: "/projects/project-1"
    }
  });

  assert.equal(readiness.readinessStatus, "blocked");
  assert.equal(readiness.canPrepareCustomerMessage, false);
});

void test("keeps payment follow-up framing professional and non-pressure oriented", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "partial_balance_follow_up",
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    },
    relatedRecord: {
      type: "invoice",
      id: "invoice-1",
      label: "Invoice INV-1",
      href: "/invoices/invoice-1"
    },
    documentReadiness: readyInvoiceReadiness
  });

  assert.equal(readiness.readinessStatus, "ready");
  assert.match(readiness.safeBodyFraming ?? "", /calm and specific/i);
  assert.doesNotMatch(
    `${readiness.safeSubjectSuggestion} ${readiness.safeBodyFraming}`,
    /\bpressure\b|\bcollections\b|\bdemand\b|\bthreat\b/i
  );
});

void test("blocks customer-bound drafts that leak internal terminology", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "field_progress_update",
    subject: "Copilot field update",
    body: "The FieldTrail blocker is visible in the internal timeline.",
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    },
    relatedRecord: {
      type: "project",
      id: "project-1",
      label: "Garage floor",
      href: "/projects/project-1"
    }
  });

  assert.equal(readiness.readinessStatus, "blocked");
  assert.ok(
    readiness.reasons.some((reason) =>
      reason.includes("internal-only terminology")
    )
  );
});

void test("marks general customer messages as needs review when no canonical record is linked", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "customer_follow_up",
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    }
  });

  assert.equal(readiness.readinessStatus, "needs_review");
  assert.equal(readiness.relatedRecordType, "general");
});

void test("blocks readiness when communications are disabled", () => {
  const readiness = deriveCustomerCommunicationSendReadiness({
    audience: "customer",
    actionType: "customer_follow_up",
    communicationsEnabled: false,
    customer: {
      id: "customer-1",
      label: "Jordan Lee",
      email: "jordan@example.com"
    },
    relatedRecord: {
      type: "project",
      id: "project-1",
      label: "Garage floor",
      href: "/projects/project-1"
    }
  });

  assert.equal(readiness.readinessStatus, "blocked");
  assert.ok(
    readiness.missingRequirements.some((requirement) =>
      requirement.includes("Enable the communications module")
    )
  );
});
