import assert from "node:assert/strict";
import { test } from "node:test";

import {
  renderWarrantyTemplateHtml,
  renderWarrantyTemplateText,
  type WarrantyDocumentMergeData
} from "./render";

const mergeData: WarrantyDocumentMergeData = {
  organization: {
    displayName: "FloorConnector Floors",
    legalName: "FloorConnector Floors LLC"
  },
  customer: {
    name: "Acme Warehouse"
  },
  project: {
    name: "Acme Warehouse Polish"
  },
  job: {
    label: "Job abc123 / completed"
  },
  serviceTicket: {
    title: "Warranty touch-up",
    status: "open"
  },
  warranty: {
    documentTitle: "Acme Warranty",
    status: "draft",
    startDate: "2026-05-19",
    endDate: "2027-05-19",
    basis: "One-year workmanship coverage."
  },
  signatures: {
    customerPlaceholder: "Customer signature planned later",
    contractorPlaceholder: "Contractor countersign planned later"
  }
};

void test("warranty template text renders canonical merge fields", () => {
  const rendered = renderWarrantyTemplateText(
    {
      bodyTemplate:
        "{{organization.displayName}} / {{customer.name}} / {{project.name}} / {{warranty.basis}}"
    },
    mergeData
  );

  assert.equal(
    rendered,
    "FloorConnector Floors / Acme Warehouse / Acme Warehouse Polish / One-year workmanship coverage."
  );
});

void test("warranty template html escapes customer-controlled values", () => {
  const rendered = renderWarrantyTemplateHtml(
    {
      bodyTemplate: "Warranty\n\n{{warranty.basis}}"
    },
    {
      ...mergeData,
      warranty: {
        ...mergeData.warranty,
        basis: "<script>alert('nope')</script>"
      }
    }
  );

  assert.match(
    rendered,
    /&lt;script&gt;alert\(&#39;nope&#39;\)&lt;\/script&gt;/
  );
  assert.doesNotMatch(rendered, /<script>/);
});
