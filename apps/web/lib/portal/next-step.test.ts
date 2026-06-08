import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalCustomerNextStep } from "./next-step";

void test("portal next step sends signable contracts to contract signing", () => {
  const nextStep = derivePortalCustomerNextStep({
    projectId: "project-1",
    contracts: [
      {
        id: "contract-1",
        status: "sent",
        title: "Project contract",
        currentUserCanSign: true
      }
    ]
  });

  assert.equal(nextStep.label, "Sign contract");
  assert.equal(nextStep.href, "/portal/contracts/contract-1");
  assert.equal(nextStep.source, "contract");
  assert.equal(nextStep.tone, "attention");
});

void test("portal next step sends open invoices to review and payment", () => {
  const nextStep = derivePortalCustomerNextStep({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        referenceNumber: "INV-1001",
        balanceDueAmount: "2500.00",
        latestPaymentEventType: "payment_requested"
      }
    ]
  });

  assert.equal(nextStep.label, "Review invoice");
  assert.equal(nextStep.href, "/portal/invoices/invoice-1");
  assert.equal(nextStep.source, "invoice");
  assert.match(nextStep.description, /payment step/);
  assert.doesNotMatch(
    `${nextStep.label} ${nextStep.description} ${nextStep.reason}`,
    /provider|stripe|contractor-owned|internal|blocker/i
  );
});

void test("portal next step sends pending change orders to review", () => {
  const nextStep = derivePortalCustomerNextStep({
    projectId: "project-1",
    changeOrders: [
      {
        id: "change-order-1",
        status: "sent",
        title: "Additional prep"
      }
    ]
  });

  assert.equal(nextStep.label, "Review change order");
  assert.equal(nextStep.href, "/portal/change-orders/change-order-1");
  assert.equal(nextStep.source, "change_order");
});

void test("portal next step sends sent estimates to review", () => {
  const nextStep = derivePortalCustomerNextStep({
    projectId: "project-1",
    estimates: [
      {
        id: "estimate-1",
        status: "sent",
        referenceNumber: "EST-1001"
      }
    ]
  });

  assert.equal(nextStep.label, "Review estimate");
  assert.equal(nextStep.href, "/portal/estimates/estimate-1");
  assert.equal(nextStep.source, "estimate");
});

void test("portal next step falls back when no customer action is needed", () => {
  const nextStep = derivePortalCustomerNextStep({
    projectId: "project-1",
    projectName: "Shop floor",
    estimates: [{ id: "estimate-1", status: "approved" }],
    contracts: [{ id: "contract-1", status: "signed" }],
    changeOrders: [{ id: "change-order-1", status: "approved" }],
    invoices: [
      {
        id: "invoice-1",
        status: "paid",
        balanceDueAmount: "0"
      }
    ]
  });

  assert.equal(nextStep.label, "No action needed");
  assert.equal(nextStep.href, "/portal/projects/project-1");
  assert.equal(nextStep.source, "none");
  assert.equal(nextStep.tone, "complete");
});

void test("portal next step priority is deterministic and customer-safe", () => {
  const nextStep = derivePortalCustomerNextStep({
    projectId: "project-1",
    estimates: [{ id: "estimate-1", status: "sent" }],
    contracts: [
      {
        id: "contract-1",
        status: "sent",
        currentUserCanSign: true
      }
    ],
    changeOrders: [{ id: "change-order-1", status: "sent" }],
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        balanceDueAmount: "100"
      }
    ]
  });

  assert.equal(nextStep.label, "Review estimate");
  assert.equal(nextStep.source, "estimate");
});
