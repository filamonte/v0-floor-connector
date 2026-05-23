import assert from "node:assert/strict";
import test from "node:test";

import {
  accountingExportColumns,
  buildAccountingExportCsv,
  buildAccountingExportRows
} from "./accounting-export";
import type {
  AccountingReadinessInvoiceRow,
  AccountingReadinessPaymentRow
} from "./accounting-readiness";

function invoice(
  overrides: Partial<AccountingReadinessInvoiceRow> = {}
): AccountingReadinessInvoiceRow {
  return {
    id: overrides.id ?? "invoice-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    statusLabel: overrides.statusLabel ?? "sent",
    customerName: overrides.customerName ?? "Acme Flooring",
    customerHref: overrides.customerHref ?? "/customers/customer-1",
    projectName: overrides.projectName ?? "Lobby resurfacing",
    projectHref: Object.hasOwn(overrides, "projectHref")
      ? (overrides.projectHref ?? null)
      : "/projects/project-1",
    href: overrides.href ?? "/invoices/invoice-1",
    issueDate: overrides.issueDate ?? "2026-05-01",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-20",
    subtotalAmount: overrides.subtotalAmount ?? "900.00",
    taxAmount: overrides.taxAmount ?? "80.00",
    taxCollectedAmount: Object.hasOwn(overrides, "taxCollectedAmount")
      ? (overrides.taxCollectedAmount ?? null)
      : "80.00",
    retainageHeldAmount: Object.hasOwn(overrides, "retainageHeldAmount")
      ? (overrides.retainageHeldAmount ?? null)
      : "20.00",
    totalAmount: overrides.totalAmount ?? "980.00",
    paidAmount: overrides.paidAmount ?? "100.00",
    balanceDueAmount: overrides.balanceDueAmount ?? "880.00",
    paymentStatusLabel: overrides.paymentStatusLabel ?? "Open balance",
    attentionLabel: Object.hasOwn(overrides, "attentionLabel")
      ? (overrides.attentionLabel ?? null)
      : "Review open balance",
    attentionReason: overrides.attentionReason ?? "Open balance remains.",
    tone: overrides.tone ?? "attention",
    exportValues: overrides.exportValues ?? []
  };
}

function payment(
  overrides: Partial<AccountingReadinessPaymentRow> = {}
): AccountingReadinessPaymentRow {
  return {
    id: overrides.id ?? "payment-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    invoiceReference: overrides.invoiceReference ?? "INV-001",
    invoiceHref: overrides.invoiceHref ?? "/invoices/invoice-1",
    customerName: overrides.customerName ?? "Acme Flooring",
    projectName: overrides.projectName ?? "Lobby resurfacing",
    amount: overrides.amount ?? "100.00",
    paymentDate: overrides.paymentDate ?? "2026-05-21",
    paymentMethod: overrides.paymentMethod ?? "card",
    paymentSource: overrides.paymentSource ?? "customer portal",
    statusLabel: overrides.statusLabel ?? "recorded",
    reference: overrides.reference ?? "PAY-001",
    attentionLabel: overrides.attentionLabel ?? null,
    tone: overrides.tone ?? "complete"
  };
}

void test("exports stable accounting column order", () => {
  assert.deepEqual(accountingExportColumns.slice(0, 6), [
    "Invoice reference",
    "Invoice status",
    "Customer",
    "Project",
    "Invoice date",
    "Due date"
  ]);
  assert.equal(accountingExportColumns.at(-1), "Project link");
});

void test("maps export rows from existing accounting readiness fields", () => {
  const rows = buildAccountingExportRows({
    invoices: [invoice()],
    payments: [payment()]
  });

  assert.deepEqual(rows[0]?.values.slice(0, 6), [
    "INV-001",
    "sent",
    "Acme Flooring",
    "Lobby resurfacing",
    "2026-05-01",
    "2026-05-20"
  ]);
  assert.equal(rows[0]?.values[13], "2026-05-21");
  assert.equal(rows[0]?.values[14], "card / customer portal");
});

void test("uses latest payment date without changing amounts", () => {
  const rows = buildAccountingExportRows({
    invoices: [invoice({ paidAmount: "300.00", balanceDueAmount: "680.00" })],
    payments: [
      payment({ id: "old", amount: "100.00", paymentDate: "2026-05-19" }),
      payment({ id: "new", amount: "200.00", paymentDate: "2026-05-22" })
    ]
  });

  assert.equal(rows[0]?.values[10], "300.00");
  assert.equal(rows[0]?.values[11], "680.00");
  assert.equal(rows[0]?.values[13], "2026-05-22");
});

void test("escapes commas quotes and newlines in CSV", () => {
  const csv = buildAccountingExportCsv({
    invoices: [
      invoice({
        referenceNumber: "INV,001",
        customerName: 'Acme "Flooring"',
        projectName: "Lobby\nResurfacing"
      })
    ],
    payments: []
  });

  assert.match(csv, /"INV,001"/);
  assert.match(csv, /"Acme ""Flooring"""/);
  assert.match(csv, /"Lobby\nResurfacing"/);
});

void test("keeps empty values empty", () => {
  const rows = buildAccountingExportRows({
    invoices: [
      invoice({
        dueDate: null,
        retainageHeldAmount: null,
        projectHref: null,
        attentionLabel: null
      })
    ],
    payments: []
  });

  assert.equal(rows[0]?.values[5], "");
  assert.equal(rows[0]?.values[8], "");
  assert.equal(rows[0]?.values[15], "");
  assert.equal(rows[0]?.values[17], "");
});

void test("exports empty data with header only", () => {
  const csv = buildAccountingExportCsv({
    invoices: [],
    payments: []
  });

  assert.equal(csv, accountingExportColumns.join(","));
});
