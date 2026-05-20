import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const page = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/gatekeeper/page.tsx"),
  "utf8"
);
const actions = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);
const memory = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/memory.ts"),
  "utf8"
);
const navigation = readFileSync(
  join(process.cwd(), "apps/web/lib/navigation/navigation-config.ts"),
  "utf8"
);

void test("GateKeeper review queue is a contractor-facing review surface", () => {
  assert.match(page, /export default async function GateKeeperPage/);
  assert.match(page, /getGateKeeperReviewQueue/);
  assert.match(page, /Memory artifacts/);
  assert.match(page, /Action suggestions/);
  assert.match(navigation, /href: "\/gatekeeper"/);
  assert.match(navigation, /status: "live"/);
});

void test("GateKeeper review actions update review state without execution imports", () => {
  assert.match(actions, /reviewGateKeeperArtifact/);
  assert.match(actions, /reviewGateKeeperActionSuggestion/);
  assert.match(actions, /No action was executed/);
  assert.doesNotMatch(
    actions,
    /createWorkItem|createOpportunity|createProject|scheduleAppointment|sendEmail|twilio|retell|openai/i
  );
});

void test("GateKeeper review transitions are proposed-only", () => {
  assert.match(
    memory,
    /Only proposed GateKeeper artifacts can be reviewed in this pass/
  );
  assert.match(
    memory,
    /Only proposed GateKeeper action suggestions can be reviewed in this pass/
  );
  assert.match(memory, /existing\.review_status !== "proposed"/);
  assert.match(memory, /existing\.status !== "proposed"/);
});
