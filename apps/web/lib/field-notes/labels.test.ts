import assert from "node:assert/strict";
import test from "node:test";

import { getFieldNoteTypeHelper, getFieldNoteTypeLabel } from "./labels";

void test("field note labels present user-facing Job Note language", () => {
  assert.equal(getFieldNoteTypeLabel("general"), "Job Note");
  assert.equal(getFieldNoteTypeLabel("blocker"), "Blocker");
  assert.equal(getFieldNoteTypeLabel("issue"), "Issue");
  assert.equal(getFieldNoteTypeLabel("punch_list"), "Punch list note");
});

void test("field note helpers explain blocker and evidence capture without internal names", () => {
  assert.match(getFieldNoteTypeHelper("blocker"), /slowed or stopped/);
  assert.match(getFieldNoteTypeHelper("general"), /Daily Job Log/);
});
