import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGateKeeperDemoFixturePlan,
  gateKeeperDemoFixtures,
  type GateKeeperDemoFixtureKey
} from "./demo-fixtures";

const actions = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);
const page = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/gatekeeper/page.tsx"),
  "utf8"
);

function artifactTypesFor(key: GateKeeperDemoFixtureKey) {
  return buildGateKeeperDemoFixturePlan(key).artifacts.map(
    (artifact) => artifact.artifactType
  );
}

function suggestionTypesFor(key: GateKeeperDemoFixtureKey) {
  return buildGateKeeperDemoFixturePlan(key).suggestions.map(
    (suggestion) => suggestion.suggestionType
  );
}

void test("GateKeeper demo fixtures cover the intended review-flow examples", () => {
  assert.deepEqual(
    gateKeeperDemoFixtures.map((fixture) => fixture.key),
    [
      "new_flooring_inquiry",
      "existing_customer_scheduling_request",
      "missed_call_voicemail_follow_up",
      "internal_workflow_note"
    ]
  );
  assert.match(page, /Demo examples/);
  assert.match(page, /seedGateKeeperDemoFixtureAction/);
});

void test("GateKeeper demo fixtures flow through the manual source adapter", () => {
  const plan = buildGateKeeperDemoFixturePlan("new_flooring_inquiry", {
    organizationId: "company-1",
    occurredAt: "2026-05-19T21:00:00.000Z"
  });

  assert.equal(plan.sourceFamily, "manual_simulation");
  assert.equal(plan.adapterResult.event.organizationId, "company-1");
  assert.equal(plan.adapterResult.event.sourceFamily, "manual_simulation");
  assert.equal(plan.adapterResult.event.sourceChannel, "phone");
  assert.equal(plan.adapterResult.execution.allowed, false);
  assert.equal(
    plan.suggestions[0]?.proposedPayload.sourceFamily,
    "manual_simulation"
  );
});

void test("GateKeeper demo fixture action builds organization-scoped adapter plans", () => {
  assert.match(actions, /buildGateKeeperDemoFixturePlan\(fixture.key, \{/);
  assert.match(actions, /organizationId: context.organizationId/);
});

void test("new flooring inquiry demo creates intake artifacts and review suggestions", () => {
  assert.deepEqual(artifactTypesFor("new_flooring_inquiry"), [
    "call_summary",
    "extracted_requirement",
    "extracted_commitment",
    "workflow_observation"
  ]);
  assert.deepEqual(suggestionTypesFor("new_flooring_inquiry"), [
    "create_opportunity",
    "schedule_site_assessment"
  ]);
});

void test("existing customer scheduling demo stays scheduling-review only", () => {
  assert.deepEqual(artifactTypesFor("existing_customer_scheduling_request"), [
    "call_summary",
    "extracted_commitment",
    "workflow_observation"
  ]);
  assert.deepEqual(suggestionTypesFor("existing_customer_scheduling_request"), [
    "schedule_site_assessment"
  ]);
});

void test("missed voicemail demo creates follow-up review without outgoing message", () => {
  assert.deepEqual(artifactTypesFor("missed_call_voicemail_follow_up"), [
    "call_summary",
    "workflow_observation"
  ]);
  assert.deepEqual(suggestionTypesFor("missed_call_voicemail_follow_up"), [
    "create_task_later",
    "send_followup_later"
  ]);
  const plan = buildGateKeeperDemoFixturePlan(
    "missed_call_voicemail_follow_up"
  );

  assert.equal(plan.suggestions[1]?.proposedPayload.reviewOnly, true);
  assert.equal(
    plan.suggestions[1]?.proposedPayload.demoFixture,
    "missed_call_voicemail_follow_up"
  );
});

void test("internal workflow note demo flags estimate review without mutation", () => {
  assert.deepEqual(artifactTypesFor("internal_workflow_note"), [
    "call_summary",
    "workflow_observation"
  ]);
  assert.deepEqual(suggestionTypesFor("internal_workflow_note"), [
    "create_task_later",
    "flag_estimate_review"
  ]);
  const plan = buildGateKeeperDemoFixturePlan("internal_workflow_note");

  assert.equal(plan.suggestions[1]?.proposedPayload.reviewOnly, true);
  assert.equal(
    plan.suggestions[1]?.proposedPayload.demoFixture,
    "internal_workflow_note"
  );
});

void test("GateKeeper demo fixture action does not introduce execution helpers", () => {
  assert.match(actions, /seedGateKeeperDemoFixtureAction/);
  assert.match(actions, /buildGateKeeperDemoFixturePlan/);
  assert.doesNotMatch(
    actions,
    /createOpportunity|updateOpportunity|createProject|createWorkItem|scheduleAppointment|createInvoice|sendEmail|sendSms|twilio|retell|openai/i
  );
});
