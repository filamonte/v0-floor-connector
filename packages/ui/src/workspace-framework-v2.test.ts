import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeProjectWorkspaceFrameworkV2ViewId,
  normalizeWorkspaceFrameworkV2ViewId,
  projectWorkspaceFrameworkV2ViewIds,
  projectWorkspaceFrameworkV2Views,
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

void test("project workspace framework v2 defaults unknown views to overview", () => {
  assert.equal(
    normalizeProjectWorkspaceFrameworkV2ViewId(undefined),
    "overview"
  );
  assert.equal(normalizeProjectWorkspaceFrameworkV2ViewId(""), "overview");
  assert.equal(
    normalizeProjectWorkspaceFrameworkV2ViewId("not-a-view"),
    "overview"
  );
});

void test("project workspace framework v2 accepts every declared view id", () => {
  for (const viewId of projectWorkspaceFrameworkV2ViewIds) {
    assert.equal(normalizeProjectWorkspaceFrameworkV2ViewId(viewId), viewId);
  }
});

void test("project workspace framework v2 keeps labels for every view id", () => {
  assert.deepEqual(
    projectWorkspaceFrameworkV2Views.map((view) => view.id),
    [...projectWorkspaceFrameworkV2ViewIds]
  );
  assert.ok(
    projectWorkspaceFrameworkV2Views.every((view) => view.label.length > 0)
  );
});
