import test from "node:test";
import assert from "node:assert/strict";
import type { DocumentTemplate } from "@floorconnector/types";

import {
  resolvePreferredEstimateTemplateForCreate,
  validatePreferredEstimateTemplateSelection,
  type PreferredEstimateTemplatePreferenceShape
} from "./estimate-template-preference-core";

function makeTemplate(
  overrides: Partial<DocumentTemplate> = {}
): DocumentTemplate {
  return {
    id: "template-estimate",
    organizationId: "org-1",
    templateType: "estimate",
    sourceSeedId: null,
    sourceSeedKey: null,
    name: "Estimate Standard",
    description: null,
    subjectTemplate: null,
    bodyTemplate: "<p>Body</p>",
    schemaVersion: 1,
    status: "active",
    isDefault: false,
    mergeFieldManifest: [],
    metadata: {},
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

void test("preferred estimate template validation accepts active same-organization estimate templates", () => {
  const template = makeTemplate();

  assert.equal(
    validatePreferredEstimateTemplateSelection({
      organizationId: "org-1",
      template
    }),
    template
  );
});

void test("preferred estimate template validation rejects cross-organization templates", () => {
  assert.throws(
    () =>
      validatePreferredEstimateTemplateSelection({
        organizationId: "org-1",
        template: makeTemplate({ organizationId: "org-2" })
      }),
    /active estimate template owned by your current organization/
  );
});

void test("preferred estimate template validation rejects inactive or non-estimate templates", () => {
  assert.throws(
    () =>
      validatePreferredEstimateTemplateSelection({
        organizationId: "org-1",
        template: makeTemplate({ status: "archived" })
      }),
    /active estimate template owned by your current organization/
  );
  assert.throws(
    () =>
      validatePreferredEstimateTemplateSelection({
        organizationId: "org-1",
        template: makeTemplate({ templateType: "invoice" })
      }),
    /active estimate template owned by your current organization/
  );
});

void test("estimate quick-create template resolution uses only valid active preference templates", () => {
  const preference: PreferredEstimateTemplatePreferenceShape = {
    template: makeTemplate()
  };

  assert.equal(
    resolvePreferredEstimateTemplateForCreate(preference),
    "template-estimate"
  );
  assert.equal(resolvePreferredEstimateTemplateForCreate(null), null);
  assert.equal(
    resolvePreferredEstimateTemplateForCreate({
      ...preference,
      template: null
    }),
    null
  );
  assert.equal(
    resolvePreferredEstimateTemplateForCreate({
      ...preference,
      template: makeTemplate({ status: "archived" })
    }),
    null
  );
});
