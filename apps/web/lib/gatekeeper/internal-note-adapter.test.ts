import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildGateKeeperInternalNoteAdapterResult } from "./internal-note-adapter";

const adapter = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/internal-note-adapter.ts"),
  "utf8"
);
const actions = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);
const panel = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-subject-memory-panel.tsx"
  ),
  "utf8"
);

function getActionSource(name: string) {
  const start = actions.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `${name} action was not found`);
  const next = actions.indexOf("\nexport async function ", start + 1);

  return actions.slice(start, next === -1 ? undefined : next);
}

void test("GateKeeper internal notes normalize through the source adapter contract", () => {
  const result = buildGateKeeperInternalNoteAdapterResult({
    organizationId: "company-1",
    subjectType: "project",
    subjectId: "project-1",
    noteText: "Crew should review moisture testing before scheduling.",
    noteType: "scheduling_concern",
    occurredAt: "2026-05-20T12:00:00.000Z",
    idempotencyKey: "internal-note:test"
  });

  assert.equal(result.event.sourceFamily, "internal_note");
  assert.equal(result.event.sourceChannel, "internal_note");
  assert.equal(result.event.direction, "internal");
  assert.equal(result.event.subjectType, "project");
  assert.equal(result.event.subjectId, "project-1");
  assert.equal(result.event.rawText, result.internalNote.noteText);
  assert.equal(result.event.idempotencyKey, "internal-note:test");
  assert.equal(result.execution.allowed, false);
});

void test("GateKeeper internal notes create reviewable artifact and explicit suggestions only", () => {
  const general = buildGateKeeperInternalNoteAdapterResult({
    organizationId: "company-1",
    subjectType: "customer",
    subjectId: "customer-1",
    noteText: "Customer prefers morning calls.",
    noteType: "general"
  });
  const estimateConcern = buildGateKeeperInternalNoteAdapterResult({
    organizationId: "company-1",
    subjectType: "opportunity",
    subjectId: "lead-1",
    noteText: "Prep labor may be light.",
    noteType: "estimate_concern"
  });

  assert.deepEqual(
    general.artifacts.map((artifact) => artifact.artifactType),
    ["workflow_observation"]
  );
  assert.equal(general.suggestions.length, 0);
  assert.deepEqual(
    estimateConcern.suggestions.map((suggestion) => suggestion.suggestionType),
    ["flag_estimate_review"]
  );
  assert.equal(
    estimateConcern.suggestions[0]?.proposedPayload?.reviewOnly,
    true
  );
});

void test("GateKeeper internal notes reject missing subject or empty note text", () => {
  assert.throws(
    () =>
      buildGateKeeperInternalNoteAdapterResult({
        organizationId: "company-1",
        subjectType: "" as "project",
        subjectId: "project-1",
        noteText: "Review later."
      }),
    /require a linked subject/
  );
  assert.throws(
    () =>
      buildGateKeeperInternalNoteAdapterResult({
        organizationId: "company-1",
        subjectType: "project",
        subjectId: "project-1",
        noteText: " "
      }),
    /require note text/
  );
});

void test("GateKeeper internal note action persists review-only memory without execution helpers", () => {
  const actionSource = getActionSource("createGateKeeperInternalNoteAction");

  assert.match(panel, /createGateKeeperInternalNoteAction/);
  assert.match(actions, /createGateKeeperInternalNoteAction/);
  assert.match(actionSource, /buildGateKeeperInternalNoteAdapterResult/);
  assert.match(actionSource, /seedGateKeeperInternalNote/);
  assert.doesNotMatch(
    [adapter, actionSource, panel].join("\n"),
    /from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(|createWorkItem|createOpportunity|updateOpportunity|createProject|scheduleAppointment|createInvoice|sendEmail|sendSms|retell|vapi/i
  );
});
