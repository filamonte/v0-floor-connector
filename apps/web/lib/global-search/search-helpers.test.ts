import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDateEqualityPredicates,
  buildEnumEqualityPredicates,
  buildIlikePredicates,
  buildSearchText,
  labelize
} from "./search-helpers";

void test("buildIlikePredicates escapes wildcard input for text fields", () => {
  assert.deepEqual(buildIlikePredicates(["name"], "100% flake_floor"), [
    "name.ilike.%100\\% flake\\_floor%",
    "name.ilike.%100\\%\\_flake\\_floor%"
  ]);
});

void test("buildEnumEqualityPredicates uses equality for status-like fields", () => {
  const predicates = buildEnumEqualityPredicates(
    "status",
    ["draft", "sent", "partially_paid", "paid", "void"],
    "partially paid"
  );

  assert.deepEqual(predicates, ["status.eq.partially_paid"]);
  assert.ok(!predicates.some((predicate) => predicate.includes("ilike")));
});

void test("buildEnumEqualityPredicates supports partial status-like terms safely", () => {
  assert.deepEqual(
    buildEnumEqualityPredicates(
      "dispatch_status",
      ["unscheduled", "scheduled", "in_progress", "completed"],
      "progress"
    ),
    ["dispatch_status.eq.in_progress"]
  );
});

void test("buildDateEqualityPredicates only emits exact ISO date equality", () => {
  assert.deepEqual(buildDateEqualityPredicates("due_date", "2026-05-23"), [
    "due_date.eq.2026-05-23"
  ]);
  assert.deepEqual(buildDateEqualityPredicates("due_date", "May 23"), []);
});

void test("display helpers tolerate missing optional relationship text", () => {
  assert.equal(
    buildSearchText("Open", null, undefined, "Project"),
    "Open Project"
  );
  assert.equal(
    labelize("site_assessment_scheduled"),
    "site assessment scheduled"
  );
});
