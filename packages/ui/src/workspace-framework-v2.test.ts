import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeWorkspaceFrameworkV2ViewId,
  workspaceFrameworkV2ViewIds,
  workspaceFrameworkV2Views
} from "./workspace-framework-v2";

void test("workspace framework v2 defaults unknown views to overview", () => {
  assert.equal(normalizeWorkspaceFrameworkV2ViewId(undefined), "overview");
  assert.equal(normalizeWorkspaceFrameworkV2ViewId(""), "overview");
  assert.equal(normalizeWorkspaceFrameworkV2ViewId("not-a-view"), "overview");
});

void test("workspace framework v2 accepts every declared view id", () => {
  for (const viewId of workspaceFrameworkV2ViewIds) {
    assert.equal(normalizeWorkspaceFrameworkV2ViewId(viewId), viewId);
  }
});

void test("workspace framework v2 keeps labels for every view id", () => {
  assert.deepEqual(
    workspaceFrameworkV2Views.map((view) => view.id),
    [...workspaceFrameworkV2ViewIds]
  );
  assert.ok(workspaceFrameworkV2Views.every((view) => view.label.length > 0));
});
