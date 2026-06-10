import assert from "node:assert/strict";
import test from "node:test";

import {
  getReadinessLaneCopies,
  getReadinessLaneCopy,
  readinessLaneOrder
} from "./readiness-lanes";

void test("readiness lanes keep the financial schedule production order", () => {
  assert.deepEqual(readinessLaneOrder, [
    "financial-readiness",
    "schedule-readiness",
    "production-readiness"
  ]);
});

void test("readiness lane copy preserves owning workspace boundaries", () => {
  const financial = getReadinessLaneCopy("financial-readiness");
  const schedule = getReadinessLaneCopy("schedule-readiness");
  const production = getReadinessLaneCopy("production-readiness");

  assert.equal(financial.owner, "Financials");
  assert.match(financial.boundary, /Financials and invoice records remain/);
  assert.match(schedule.boundary, /jobs and schedule fields remain/);
  assert.match(production.boundary, /field and job records remain/);
});

void test("readiness lane copies are complete for shared UI consumers", () => {
  const copies = getReadinessLaneCopies();

  assert.equal(copies.length, 3);

  for (const copy of copies) {
    assert.ok(copy.label);
    assert.ok(copy.shortLabel);
    assert.ok(copy.owner);
    assert.ok(copy.actionSurface);
    assert.ok(copy.description);
    assert.ok(copy.boundary);
  }
});
