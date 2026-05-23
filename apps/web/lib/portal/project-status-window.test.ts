import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalProjectStatusWindow } from "./project-status-window";

void test("project status window falls back when no records are shared", () => {
  const window = derivePortalProjectStatusWindow({
    projectId: "project-1",
    projectName: "Shop floor",
    projectStatus: "active"
  });

  assert.equal(window.statusLabel, "active");
  assert.equal(window.statusTone, "neutral");
  assert.equal(window.customerNextStep.label, "No action needed");
  assert.equal(window.sharedRecords.length, 0);
  assert.match(window.emptyStateMessage, /No project records have been shared/);
});

void test("project status window sends pending estimates to review", () => {
  const window = derivePortalProjectStatusWindow({
    projectId: "project-1",
    estimates: [
      {
        id: "estimate-1",
        referenceNumber: "EST-1001",
        status: "sent",
        totalAmount: "1200.00"
      }
    ]
  });

  assert.equal(window.statusLabel, "Needs your attention");
  assert.equal(window.customerNextStep.label, "Review estimate");
  assert.equal(window.sharedRecords[0]?.type, "estimate");
  assert.equal(window.sharedRecords[0]?.href, "/portal/estimates/estimate-1");
  assert.equal(window.attentionItems[0]?.label, "Review estimate");
});

void test("project status window sends active contracts to signing review", () => {
  const window = derivePortalProjectStatusWindow({
    projectId: "project-1",
    contracts: [
      {
        id: "contract-1",
        title: "Project contract",
        status: "sent",
        sentAt: "2026-05-20T10:00:00.000Z"
      }
    ]
  });

  assert.equal(window.customerNextStep.label, "Review contract");
  assert.equal(window.sharedRecords[0]?.type, "contract");
  assert.equal(window.sharedRecords[0]?.tone, "attention");
  assert.match(
    window.sharedRecords[0]?.helperText ?? "",
    /waiting for review or signature/
  );
});

void test("project status window sends open invoices to review or payment", () => {
  const window = derivePortalProjectStatusWindow({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        workflowRole: "standard",
        status: "sent",
        balanceDueAmount: "500.00",
        latestPaymentEventType: "payment_requested"
      }
    ]
  });

  assert.equal(window.customerNextStep.label, "Review/pay invoice");
  assert.equal(window.sharedRecords[0]?.type, "invoice");
  assert.equal(window.sharedRecords[0]?.href, "/portal/invoices/invoice-1");
  assert.equal(window.attentionItems[0]?.label, "Review or pay invoice");
});

void test("project status window sends pending change orders to review", () => {
  const window = derivePortalProjectStatusWindow({
    projectId: "project-1",
    changeOrders: [
      {
        id: "change-order-1",
        title: "Added prep",
        status: "sent",
        priceAdjustment: "250.00"
      }
    ]
  });

  assert.equal(window.customerNextStep.label, "Review change order");
  assert.equal(window.sharedRecords[0]?.type, "change_order");
  assert.equal(
    window.sharedRecords[0]?.href,
    "/portal/change-orders/change-order-1"
  );
});

void test("project status window keeps mixed record ordering deterministic", () => {
  const window = derivePortalProjectStatusWindow({
    projectId: "project-1",
    estimates: [{ id: "estimate-1", status: "sent" }],
    contracts: [{ id: "contract-1", status: "sent" }],
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        balanceDueAmount: "100.00"
      }
    ],
    changeOrders: [{ id: "change-order-1", status: "sent" }]
  });

  assert.deepEqual(
    window.sharedRecords.map((record) => record.type),
    ["estimate", "contract", "change_order", "invoice"]
  );
  assert.equal(window.customerNextStep.label, "Review estimate");
  assert.deepEqual(
    window.attentionItems.map((item) => item.label),
    [
      "Review estimate",
      "Review contract",
      "Review change order",
      "Review or pay invoice"
    ]
  );
});
