import assert from "node:assert/strict";
import test from "node:test";

import { buildBillingReadinessCommand } from "./billing-readiness-command";
import type {
  BillingReadinessInvoiceInput,
  BillingReadinessJobInput
} from "./billing-readiness-command";

function job(
  overrides: Partial<BillingReadinessJobInput> = {}
): BillingReadinessJobInput {
  return {
    id: overrides.id ?? "job-1",
    projectId: overrides.projectId ?? "project-1",
    customerId: overrides.customerId ?? "customer-1",
    scheduledDate: overrides.scheduledDate ?? "2026-06-01",
    updatedAt: overrides.updatedAt ?? "2026-06-02T12:00:00.000Z",
    customer:
      Object.hasOwn(overrides, "customer") && overrides.customer === null
        ? null
        : (overrides.customer ?? {
            id: "customer-1",
            name: "Avery Home",
            companyName: null
          }),
    project:
      Object.hasOwn(overrides, "project") && overrides.project === null
        ? null
        : (overrides.project ?? {
            id: "project-1",
            name: "Garage coating"
          }),
    estimate:
      Object.hasOwn(overrides, "estimate") && overrides.estimate === null
        ? null
        : (overrides.estimate ?? {
            id: "estimate-1",
            referenceNumber: "EST-001"
          })
  };
}

function invoice(
  overrides: Partial<BillingReadinessInvoiceInput> = {}
): BillingReadinessInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    jobId: Object.hasOwn(overrides, "jobId")
      ? (overrides.jobId ?? null)
      : "job-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    workflowRole: overrides.workflowRole ?? "standard",
    status: overrides.status ?? "draft",
    balanceDueAmount: overrides.balanceDueAmount ?? "0.00",
    updatedAt: overrides.updatedAt ?? "2026-06-03T12:00:00.000Z"
  };
}

void test("places completed jobs with estimate context into ready-to-invoice review", () => {
  const command = buildBillingReadinessCommand({
    completedJobs: [job()],
    invoices: []
  });

  assert.equal(command.readyToInvoice.length, 1);
  assert.equal(command.readyToInvoice[0]?.actionHref, "/invoices?jobId=job-1");
  assert.equal(
    command.readyToInvoice[0]?.detail,
    "Completion, customer, project, and estimate context are present; review billing from the canonical invoice workflow."
  );
  assert.equal(command.nextMove.label, "Review invoice creation");
});

void test("does not propose duplicate billing when a completed job already has an invoice", () => {
  const command = buildBillingReadinessCommand({
    completedJobs: [job()],
    invoices: [
      invoice({
        id: "invoice-linked",
        referenceNumber: "INV-LINKED",
        status: "sent"
      })
    ]
  });

  assert.equal(command.readyToInvoice.length, 0);
  assert.equal(command.alreadyInBilling.length, 1);
  assert.equal(command.alreadyInBilling[0]?.invoiceReference, "INV-LINKED");
  assert.equal(
    command.alreadyInBilling[0]?.actionHref,
    "/invoices/invoice-linked"
  );
});

void test("surfaces missing prerequisites before ready-to-invoice items", () => {
  const command = buildBillingReadinessCommand({
    completedJobs: [
      job({
        id: "blocked-job",
        estimate: null,
        updatedAt: "2026-06-04T12:00:00.000Z"
      }),
      job({
        id: "ready-job",
        updatedAt: "2026-06-03T12:00:00.000Z"
      })
    ],
    invoices: []
  });

  assert.equal(command.missingPrerequisites.length, 1);
  assert.equal(command.readyToInvoice.length, 1);
  assert.equal(command.nextMove.href, "/invoices?jobId=blocked-job");
  assert.deepEqual(command.missingPrerequisites[0]?.blockers, [
    "No estimate context is attached to this completed job."
  ]);
});

void test("keeps draft invoices in review lane without creating collection state", () => {
  const command = buildBillingReadinessCommand({
    completedJobs: [],
    invoices: [
      invoice({
        id: "draft-standard",
        jobId: null,
        referenceNumber: "INV-DRAFT"
      }),
      invoice({
        id: "sent-standard",
        jobId: null,
        referenceNumber: "INV-SENT",
        status: "sent"
      })
    ]
  });

  assert.deepEqual(
    command.draftReview.map((item) => item.invoiceReference),
    ["INV-DRAFT"]
  );
  assert.equal(command.nextMove.href, "/invoices/draft-standard");
});
