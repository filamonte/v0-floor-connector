import assert from "node:assert/strict";
import test from "node:test";

import type { PortalAccessibleProjectListItem } from "./data";
import { derivePortalHomeOrganization } from "./organization";

function project(
  overrides: Partial<PortalAccessibleProjectListItem>
): PortalAccessibleProjectListItem {
  return {
    id: "project-1",
    organizationId: "org-1",
    customerId: "customer-1",
    name: "Lobby resurfacing",
    status: "in_progress",
    description: null,
    customer: null,
    locationSummary: null,
    latestEstimateId: null,
    latestEstimateStatus: null,
    latestContractId: null,
    latestContractStatus: null,
    latestInvoiceId: null,
    latestInvoiceStatus: null,
    latestInvoiceReferenceNumber: null,
    latestInvoiceWorkflowRole: null,
    latestInvoiceBalanceDueAmount: null,
    latestInvoicePaymentEventType: null,
    latestInvoicePaymentEventAt: null,
    latestJobId: null,
    latestJobDispatchStatus: null,
    latestJobScheduledDate: null,
    latestJobScheduledStartAt: null,
    latestJobScheduledEndAt: null,
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides
  };
}

void test("home organization puts customer actions first", () => {
  const organization = derivePortalHomeOrganization([
    project({
      id: "project-1",
      latestInvoiceId: "invoice-1",
      latestInvoiceStatus: "sent",
      latestInvoiceReferenceNumber: "INV-1001",
      latestInvoiceBalanceDueAmount: "500",
      latestInvoicePaymentEventType: "payment_requested",
      updatedAt: "2026-06-02T10:00:00.000Z"
    }),
    project({
      id: "project-2",
      name: "Warehouse coating",
      latestEstimateId: "estimate-1",
      latestEstimateStatus: "sent",
      updatedAt: "2026-06-03T10:00:00.000Z"
    })
  ]);

  assert.deepEqual(
    organization.attentionItems.map((item) => item.label),
    ["Ready for Review", "Payment Due"]
  );
  assert.equal(
    organization.attentionItems[0]?.href,
    "/portal/estimates/estimate-1"
  );
  assert.equal(organization.activeProjects.length, 2);
});

void test("home organization groups documents and invoices separately", () => {
  const organization = derivePortalHomeOrganization([
    project({
      latestEstimateId: "estimate-1",
      latestEstimateStatus: "approved",
      latestContractId: "contract-1",
      latestContractStatus: "sent",
      latestInvoiceId: "invoice-1",
      latestInvoiceStatus: "partially_paid",
      latestInvoiceReferenceNumber: "INV-1001",
      latestInvoiceBalanceDueAmount: "200"
    })
  ]);

  assert.deepEqual(
    organization.documentItems.map((item) => item.label),
    ["Contract", "Estimate"]
  );
  assert.equal(
    organization.documentItems[0]?.statusLabel,
    "Waiting for Signature"
  );
  assert.equal(
    organization.invoiceItems[0]?.paymentStateLabel,
    "Partially paid"
  );
  assert.equal(organization.invoiceItems[0]?.balanceLabel, "$200.00");
});

void test("home organization keeps completed projects lower priority", () => {
  const organization = derivePortalHomeOrganization([
    project({
      latestJobId: "job-1",
      latestJobDispatchStatus: "completed",
      latestInvoiceId: "invoice-1",
      latestInvoiceStatus: "paid",
      latestInvoiceBalanceDueAmount: "0"
    })
  ]);

  assert.equal(organization.attentionItems.length, 0);
  assert.equal(organization.activeProjects.length, 0);
  assert.equal(organization.historyProjects.length, 1);
  assert.equal(organization.historyProjects[0]?.statusLabel, "Completed");
});
