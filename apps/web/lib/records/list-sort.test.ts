import assert from "node:assert/strict";
import test from "node:test";

import {
  parseEstimateListSort,
  parseInvoiceListSort,
  sortEstimateRecords,
  sortInvoiceRecords
} from "./list-sort";

void test("sortEstimateRecords supports customer and amount sorting without mutating input", () => {
  const estimates = [
    {
      referenceNumber: "EST-2",
      totalAmount: "2500.00",
      status: "sent",
      updatedAt: "2026-05-12T12:00:00.000Z",
      estimateDate: "2026-05-10",
      customer: { name: "Zenith Garage" },
      project: { name: "Warehouse" }
    },
    {
      referenceNumber: "EST-1",
      totalAmount: "5000.00",
      status: "draft",
      updatedAt: "2026-05-13T12:00:00.000Z",
      estimateDate: "2026-05-11",
      customer: { name: "Apex Floors" },
      project: { name: "Garage" }
    }
  ];

  assert.deepEqual(
    sortEstimateRecords(estimates, "customer_asc").map((estimate) => estimate.referenceNumber),
    ["EST-1", "EST-2"]
  );
  assert.deepEqual(
    sortEstimateRecords(estimates, "amount_desc").map((estimate) => estimate.referenceNumber),
    ["EST-1", "EST-2"]
  );
  assert.deepEqual(
    estimates.map((estimate) => estimate.referenceNumber),
    ["EST-2", "EST-1"]
  );
});

void test("sortInvoiceRecords supports due date and balance sorting", () => {
  const invoices = [
    {
      referenceNumber: "INV-2",
      balanceDueAmount: "250.00",
      status: "sent",
      updatedAt: "2026-05-12T12:00:00.000Z",
      dueDate: "2026-05-24",
      customer: { name: "Zenith Garage" },
      project: { name: "Warehouse" }
    },
    {
      referenceNumber: "INV-1",
      balanceDueAmount: "1250.00",
      status: "sent",
      updatedAt: "2026-05-13T12:00:00.000Z",
      dueDate: "2026-05-18",
      customer: { name: "Apex Floors" },
      project: { name: "Garage" }
    }
  ];

  assert.deepEqual(
    sortInvoiceRecords(invoices, "due_soon").map((invoice) => invoice.referenceNumber),
    ["INV-1", "INV-2"]
  );
  assert.deepEqual(
    sortInvoiceRecords(invoices, "balance_desc").map((invoice) => invoice.referenceNumber),
    ["INV-1", "INV-2"]
  );
});

void test("list sort parsers default unknown values to workflow priority", () => {
  assert.equal(parseEstimateListSort("nope"), "workflow");
  assert.equal(parseInvoiceListSort(undefined), "workflow");
});
