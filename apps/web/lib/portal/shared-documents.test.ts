import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalSharedDocuments } from "./shared-documents";

void test("shared documents sends pending estimates to review with print link", () => {
  const center = derivePortalSharedDocuments({
    estimates: [
      {
        id: "estimate-1",
        referenceNumber: "EST-1001",
        status: "sent",
        totalAmount: "1200.00"
      }
    ]
  });

  assert.equal(center.documents[0]?.type, "estimate");
  assert.equal(center.documents[0]?.tone, "attention");
  assert.equal(center.documents[0]?.actionLabel, "Review estimate");
  assert.equal(center.documents[0]?.customerActionRequired, true);
  assert.equal(
    center.documents[0]?.primaryHref,
    "/portal/estimates/estimate-1"
  );
  assert.equal(
    center.documents[0]?.printHref,
    "/portal/estimates/estimate-1/pdf"
  );
});

void test("shared documents sends active contracts to contract review", () => {
  const center = derivePortalSharedDocuments({
    contracts: [
      {
        id: "contract-1",
        title: "Project contract",
        status: "sent",
        sentAt: "2026-05-20T10:00:00.000Z"
      }
    ]
  });

  assert.equal(center.documents[0]?.type, "contract");
  assert.equal(center.documents[0]?.tone, "attention");
  assert.equal(center.documents[0]?.actionLabel, "Review contract");
  assert.equal(center.documents[0]?.customerActionRequired, true);
  assert.equal(
    center.documents[0]?.primaryHref,
    "/portal/contracts/contract-1"
  );
  assert.equal(
    center.documents[0]?.printHref,
    "/portal/contracts/contract-1/pdf"
  );
});

void test("shared documents sends unpaid invoices to review or payment", () => {
  const center = derivePortalSharedDocuments({
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

  assert.equal(center.documents[0]?.type, "invoice");
  assert.equal(center.documents[0]?.tone, "attention");
  assert.equal(center.documents[0]?.actionLabel, "Review or pay invoice");
  assert.equal(center.documents[0]?.customerActionRequired, true);
  assert.equal(center.documents[0]?.primaryHref, "/portal/invoices/invoice-1");
  assert.equal(
    center.documents[0]?.printHref,
    "/portal/invoices/invoice-1/pdf"
  );
});

void test("shared documents marks paid invoices complete", () => {
  const center = derivePortalSharedDocuments({
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        workflowRole: "standard",
        status: "paid",
        balanceDueAmount: "0"
      }
    ]
  });

  assert.equal(center.documents[0]?.type, "invoice");
  assert.equal(center.documents[0]?.tone, "complete");
  assert.equal(center.documents[0]?.completed, true);
  assert.equal(center.documents[0]?.actionLabel, "Open");
});

void test("shared documents sends pending change orders to review without print link", () => {
  const center = derivePortalSharedDocuments({
    changeOrders: [
      {
        id: "change-order-1",
        title: "Added prep",
        status: "sent",
        priceAdjustment: "250.00"
      }
    ]
  });

  assert.equal(center.documents[0]?.type, "change_order");
  assert.equal(center.documents[0]?.tone, "attention");
  assert.equal(center.documents[0]?.actionLabel, "Review change order");
  assert.equal(center.documents[0]?.customerActionRequired, true);
  assert.equal(
    center.documents[0]?.primaryHref,
    "/portal/change-orders/change-order-1"
  );
  assert.equal(center.documents[0]?.printHref, undefined);
});

void test("shared documents returns safe empty state for no documents", () => {
  const center = derivePortalSharedDocuments({});

  assert.equal(center.documents.length, 0);
  assert.match(center.emptyStateMessage, /No documents shared yet/);
});

void test("shared documents only exposes print links for existing portal print routes", () => {
  const center = derivePortalSharedDocuments({
    estimates: [{ id: "estimate-1", status: "approved" }],
    contracts: [{ id: "contract-1", status: "signed" }],
    invoices: [{ id: "invoice-1", status: "paid", balanceDueAmount: "0" }],
    changeOrders: [{ id: "change-order-1", status: "approved" }]
  });

  assert.deepEqual(
    center.documents.map((document) => [document.type, document.printHref]),
    [
      ["estimate", "/portal/estimates/estimate-1/pdf"],
      ["contract", "/portal/contracts/contract-1/pdf"],
      ["change_order", undefined],
      ["invoice", "/portal/invoices/invoice-1/pdf"]
    ]
  );
});
