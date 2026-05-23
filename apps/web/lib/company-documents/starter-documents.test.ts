import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCompanyDocumentStarterDraft,
  getCompanyDocumentStarter,
  listCompanyDocumentStarters,
  starterDocumentsDisclaimer,
  validateStarterDocumentShape
} from "./starter-documents";
import { companyDocumentAudiences, companyDocumentCategories } from "./types";

void test("starter document catalog exposes safe starter shapes", () => {
  const starters = listCompanyDocumentStarters();

  assert.equal(starters.length, 5);

  for (const starter of starters) {
    assert.equal(validateStarterDocumentShape(starter), true);
    assert.equal(companyDocumentCategories.includes(starter.category), true);
    assert.equal(companyDocumentAudiences.includes(starter.audience), true);
    assert.match(starter.body, /\[Company Name\]/);
    assert.match(starter.body, /\[Review Date\]/);
    assert.match(starter.body, /\[Responsible Role\]/);
    assert.match(starter.body, /not legal advice/i);
    assert.doesNotMatch(starter.body, /AI-generated/i);
    assert.doesNotMatch(starter.body, /e-sign/i);
  }
});

void test("starter lookup rejects invalid ids", () => {
  assert.equal(getCompanyDocumentStarter("missing-starter"), null);
});

void test("starter adoption draft maps server-owned starter content", () => {
  const starter = getCompanyDocumentStarter("safety-plan-starter");

  assert.ok(starter);

  const draft = buildCompanyDocumentStarterDraft(starter);

  assert.equal(draft.title, "Safety Plan Starter");
  assert.equal(draft.category, "safety_compliance");
  assert.equal(draft.documentKind, "safety_plan");
  assert.equal(draft.audience, "internal");
  assert.equal(draft.body, starter.body);
  assert.match(draft.description, /starter safety plan/i);
  assert.match(draft.description, new RegExp(starterDocumentsDisclaimer));
});
