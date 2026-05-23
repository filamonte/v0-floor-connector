import assert from "node:assert/strict";
import { test } from "node:test";

import {
  companyDocumentAudiences,
  companyDocumentCategories,
  companyDocumentStatuses,
  companyDocumentUpsertInputSchema
} from "./types";

void test("company document input accepts the approved categories, statuses, and audiences", () => {
  for (const category of companyDocumentCategories) {
    assert.equal(
      companyDocumentUpsertInputSchema.safeParse({
        title: "Safety Plan",
        category,
        documentKind: "Policy",
        status: "draft",
        audience: "internal",
        description: "",
        body: "",
        effectiveDate: "",
        expiresAt: ""
      }).success,
      true
    );
  }

  for (const status of companyDocumentStatuses) {
    assert.equal(
      companyDocumentUpsertInputSchema.safeParse({
        title: "Safety Plan",
        category: "safety_compliance",
        documentKind: "Policy",
        status,
        audience: "internal",
        description: "",
        body: "",
        effectiveDate: "",
        expiresAt: ""
      }).success,
      true
    );
  }

  for (const audience of companyDocumentAudiences) {
    assert.equal(
      companyDocumentUpsertInputSchema.safeParse({
        title: "Safety Plan",
        category: "safety_compliance",
        documentKind: "Policy",
        status: "active",
        audience,
        description: "",
        body: "",
        effectiveDate: "",
        expiresAt: ""
      }).success,
      true
    );
  }
});

void test("company document input rejects empty titles and invalid option values", () => {
  assert.equal(
    companyDocumentUpsertInputSchema.safeParse({
      title: "   ",
      category: "safety_compliance",
      documentKind: "Policy",
      status: "draft",
      audience: "internal",
      description: "",
      body: "",
      effectiveDate: "",
      expiresAt: ""
    }).success,
    false
  );

  assert.equal(
    companyDocumentUpsertInputSchema.safeParse({
      title: "Safety Plan",
      category: "legal_generator",
      documentKind: "Policy",
      status: "draft",
      audience: "internal",
      description: "",
      body: "",
      effectiveDate: "",
      expiresAt: ""
    }).success,
    false
  );
});
