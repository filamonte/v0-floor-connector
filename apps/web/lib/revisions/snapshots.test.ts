import assert from "node:assert/strict";
import test from "node:test";

import { buildEstimateRevisionSnapshot } from "./snapshots";
import { getNextRevisionNumber, parseRecordRevisionSubjectType } from "./types";

void test("initial revision number is 1", () => {
  assert.equal(getNextRevisionNumber([]), 1);
});

void test("next revision increments from existing numbers", () => {
  assert.equal(getNextRevisionNumber([1, 2, 4]), 5);
});

void test("unsupported subject type is rejected", () => {
  assert.equal(parseRecordRevisionSubjectType("project"), null);
});

void test("estimate snapshot includes selected line items", () => {
  const snapshot = buildEstimateRevisionSnapshot({
    id: "estimate-1",
    organizationId: "org-1",
    opportunityId: "opportunity-1",
    customerId: "customer-1",
    projectId: "project-1",
    estimateWriterPersonId: null,
    templateId: null,
    referenceNumber: "EST-001",
    title: "Garage floor",
    status: "draft",
    estimateDate: "2026-05-01",
    expirationDate: null,
    projectType: null,
    sector: null,
    subtotalAmount: "100.00",
    taxableSalesAmount: "100.00",
    exemptSalesAmount: "0.00",
    taxRateApplied: "0.082500",
    taxBehaviorApplied: "exclusive",
    customerTaxExemptSnapshot: false,
    taxAmount: "8.25",
    discountAmount: "0.00",
    totalAmount: "108.25",
    notes: null,
    content: {
      termsHtml: null,
      inclusionsHtml: null,
      exclusionsHtml: null,
      notesHtml: null,
      scopeSummaryHtml: null,
      scopeItems: [],
      itemGroups: [],
      itemRows: []
    },
    sentAt: null,
    sentByUserId: null,
    customerViewedAt: null,
    approvedAt: null,
    approvedByPortalUserId: null,
    rejectedAt: null,
    rejectedByPortalUserId: null,
    createdByUserId: "user-1",
    updatedByUserId: "user-1",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    lineItems: [
      {
        id: "line-1",
        estimateId: "estimate-1",
        organizationId: "org-1",
        catalogItemId: null,
        taxCodeId: null,
        sourceType: "manual",
        sourceSystemId: null,
        sourceComponentId: null,
        itemType: "material",
        name: "Flake broadcast",
        description: null,
        quantity: "1.00",
        unit: "ea",
        baseUnitCost: "50.00",
        baseUnitPrice: "100.00",
        markupPercent: "0.00",
        hiddenMarkupPercent: "0.00",
        unitPriceBeforeHiddenMarkup: "100.00",
        visibleMarkupAmount: "0.00",
        hiddenMarkupAmount: "0.00",
        unitPrice: "100.00",
        taxable: true,
        taxRateSnapshot: "0.082500",
        discountAmount: "0.00",
        lineSubtotal: "100.00",
        taxAmount: "8.25",
        costCode: null,
        groupName: null,
        assignedTo: null,
        lineTotal: "108.25",
        sortOrder: 0,
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z"
      }
    ]
  });

  assert.equal(snapshot.subjectType, "estimate");
  assert.equal(snapshot.lineItems?.length, 1);
  assert.equal(snapshot.lineItems?.[0]?.name, "Flake broadcast");
});
