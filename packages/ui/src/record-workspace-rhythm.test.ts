import assert from "node:assert/strict";
import test from "node:test";

import {
  getRecordWorkspaceRhythmStep,
  recordWorkspaceRhythmStepIds,
  recordWorkspaceRhythmSteps
} from "./record-workspace-rhythm";

void test("record workspace rhythm keeps the canonical decision order", () => {
  assert.deepEqual(recordWorkspaceRhythmStepIds, [
    "identity",
    "state-next-action",
    "primary-work",
    "context",
    "history"
  ]);
});

void test("record workspace rhythm routes context without owning linked state", () => {
  const contextStep = getRecordWorkspaceRhythmStep("context");

  assert.ok(contextStep);
  assert.match(contextStep.description, /canonical workspaces/);
  assert.match(contextStep.description, /without recreating/);
});

void test("record workspace rhythm has labels for every step id", () => {
  const labelsById = new Map(
    recordWorkspaceRhythmSteps.map((step) => [step.id, step.label])
  );

  for (const id of recordWorkspaceRhythmStepIds) {
    assert.ok(labelsById.get(id));
  }
});
