import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGateKeeperManualSeedPlan,
  buildGateKeeperManualSourceAdapterResult
} from "./manual-seed";

const actions = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);

function getActionSource(name: string) {
  const start = actions.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `${name} action was not found`);
  const next = actions.indexOf("\nexport async function ", start + 1);

  return actions.slice(start, next === -1 ? undefined : next);
}

void test("manual GateKeeper seed maps raw fields to proposed review items", () => {
  const plan = buildGateKeeperManualSeedPlan({
    sourceType: "phone_call",
    body: "Customer called asking about a metallic epoxy garage floor.",
    customerName: "Jordan Smith",
    customerPhone: "555-0100",
    requestedService: "Metallic epoxy garage floor",
    requestedAppointment: "Friday morning"
  });

  assert.equal(plan.communication.channelKind, "phone");
  assert.equal(plan.communication.direction, "inbound");
  assert.equal(plan.sourceFamily, "manual_simulation");
  assert.equal(plan.adapterResult.event.sourceFamily, "manual_simulation");
  assert.equal(plan.adapterResult.event.sourceChannel, "phone");
  assert.equal(plan.adapterResult.execution.allowed, false);
  assert.deepEqual(
    plan.artifacts.map((artifact) => artifact.artifactType),
    ["call_summary", "extracted_requirement", "extracted_commitment"]
  );
  assert.deepEqual(
    plan.suggestions.map((suggestion) => suggestion.suggestionType),
    ["create_opportunity", "schedule_site_assessment"]
  );
  assert.equal(plan.suggestions[0]?.proposedPayload.reviewOnly, true);
});

void test("manual input normalizes into the source adapter contract", () => {
  const result = buildGateKeeperManualSourceAdapterResult({
    organizationId: "company-1",
    sourceType: "web_chat",
    body: "Customer asked about polished concrete pricing.",
    customerName: "Demo Customer",
    customerEmail: "demo@example.com",
    requestedService: "Polished concrete",
    subjectType: "customer",
    subjectId: "customer-1",
    occurredAt: "2026-05-19T20:00:00.000Z",
    idempotencyKey: "manual:test"
  });

  assert.equal(result.event.organizationId, "company-1");
  assert.equal(result.event.sourceFamily, "manual_simulation");
  assert.equal(result.event.sourceChannel, "web_chat");
  assert.equal(result.event.direction, "inbound");
  assert.equal(result.event.idempotencyKey, "manual:test");
  assert.equal(result.event.participantHints?.displayName, "Demo Customer");
  assert.equal(result.event.participantHints?.email, "demo@example.com");
  assert.equal(result.communicationThreadHint.shouldCreateOrReuse, true);
  assert.equal(result.execution.allowed, false);
  assert.deepEqual(
    result.artifacts.map((artifact) => artifact.artifactType),
    ["call_summary", "extracted_requirement"]
  );
  assert.deepEqual(
    result.suggestions.map((suggestion) => suggestion.suggestionType),
    ["create_opportunity"]
  );
});

void test("manual GateKeeper seed stays conservative for free text only", () => {
  const plan = buildGateKeeperManualSeedPlan({
    sourceType: "internal_note",
    body: "Review this intake later."
  });

  assert.deepEqual(
    plan.artifacts.map((artifact) => artifact.artifactType),
    ["call_summary", "workflow_observation"]
  );
  assert.equal(plan.suggestions.length, 1);
  assert.equal(plan.suggestions[0]?.suggestionType, "create_task_later");
  assert.equal(plan.adapterResult.execution.allowed, false);
  assert.match(
    plan.suggestions[0]?.rationale ?? "",
    /free-text manual summary/
  );
});

void test("manual GateKeeper seed rejects empty summaries and partial subjects", () => {
  assert.throws(
    () =>
      buildGateKeeperManualSeedPlan({
        sourceType: "web_chat",
        body: "   "
      }),
    /requires a summary or body/
  );

  assert.throws(
    () =>
      buildGateKeeperManualSeedPlan({
        sourceType: "web_chat",
        body: "Customer asked about floor prep.",
        subjectType: "project"
      }),
    /subject type and subject id must be provided together/
  );
});

void test("manual GateKeeper seed action does not introduce canonical execution helpers", () => {
  const actionSource = getActionSource("seedGateKeeperManualIntakeAction");

  assert.match(actions, /seedGateKeeperManualIntakeAction/);
  assert.match(actionSource, /buildGateKeeperManualSourceAdapterResult/);
  assert.match(actionSource, /buildGateKeeperManualSeedPlanFromAdapterResult/);
  assert.match(actionSource, /seedGateKeeperPlan/);
  assert.doesNotMatch(
    actionSource,
    /createOpportunity|updateOpportunity|createProject|createWorkItem|scheduleAppointment|createInvoice|sendEmail|sendSms|twilio|retell|openai/i
  );
});
