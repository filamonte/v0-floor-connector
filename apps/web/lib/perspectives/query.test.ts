import assert from "node:assert/strict";
import test from "node:test";

import { matchesPerspective } from "./query";
import { parsePerspectiveView } from "./types";

void test("company perspective returns organization-scoped records without ownership filtering", () => {
  assert.equal(matchesPerspective({}, "company", "user-1"), true);
});

void test("my perspective matches creator ownership", () => {
  assert.equal(
    matchesPerspective({ createdByUserId: "user-1" }, "my", "user-1"),
    true
  );
});

void test("my perspective excludes unrelated records", () => {
  assert.equal(
    matchesPerspective({ createdByUserId: "user-2" }, "my", "user-1"),
    false
  );
});

void test("invalid and missing perspective values fall back to company", () => {
  assert.equal(parsePerspectiveView(undefined), "company");
  assert.equal(parsePerspectiveView("unexpected"), "company");
});
