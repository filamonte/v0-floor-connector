import assert from "node:assert/strict";
import test from "node:test";

import {
  isOperationalCueUrgency,
  isSupportedOperationalCueKey,
  operationalCueRuleDefinitions,
  parseOperationalCueThresholdDays
} from "./rule-definitions";
import {
  operationalCueOwnerStrategies,
  starterOperationalCueOwnerStrategies
} from "./owner-strategies";

void test("defines the seven built-in operational cue rules", () => {
  assert.deepEqual(
    operationalCueRuleDefinitions.map((definition) => definition.cueKey),
    [
      "estimate_sent_followup",
      "contract_sent_unsigned",
      "contract_viewed_unsigned",
      "invoice_overdue",
      "deposit_invoice_unpaid",
      "job_ready_unscheduled",
      "job_scheduled_missing_crew"
    ]
  );
});

void test("validates supported cue keys and urgency values", () => {
  assert.equal(isSupportedOperationalCueKey("invoice_overdue"), true);
  assert.equal(isSupportedOperationalCueKey("custom_if_then_rule"), false);
  assert.equal(isOperationalCueUrgency("critical"), true);
  assert.equal(isOperationalCueUrgency("urgent"), false);
});

void test("maps each built-in cue key to the starter owner strategy set", () => {
  assert.deepEqual(
    Object.fromEntries(
      operationalCueRuleDefinitions.map((definition) => [
        definition.cueKey,
        definition.ownerStrategy
      ])
    ),
    {
      estimate_sent_followup: "estimator",
      contract_sent_unsigned: "project_manager",
      contract_viewed_unsigned: "project_manager",
      invoice_overdue: "billing_owner",
      deposit_invoice_unpaid: "billing_owner",
      job_ready_unscheduled: "scheduler",
      job_scheduled_missing_crew: "scheduler"
    }
  );

  assert.deepEqual(starterOperationalCueOwnerStrategies, [
    "estimator",
    "project_manager",
    "billing_owner",
    "scheduler"
  ]);
  assert.equal(operationalCueOwnerStrategies.includes("sales_owner" as never), false);
  assert.equal(operationalCueOwnerStrategies.includes("field_lead" as never), false);
});

void test("documents human-facing rule behavior for settings UX", () => {
  for (const definition of operationalCueRuleDefinitions) {
    assert.ok(definition.description.length > 20);
    assert.ok(definition.triggerSummary.length > 20);
    assert.ok(definition.whyItMatters.length > 20);
    assert.ok(definition.appearsIn.includes("Workspace"));
    assert.ok(definition.safeAction.length > 20);
    assert.ok(definition.visibilityNote.length > 20);
  }

  const invoiceOverdue = operationalCueRuleDefinitions.find(
    (definition) => definition.cueKey === "invoice_overdue"
  );

  assert.equal(
    invoiceOverdue?.visibilityNote,
    "This cue can be snoozed by the current user in supported workspaces, but it is not dismissible in V1."
  );
});

void test("parses blank or bounded threshold days only", () => {
  assert.equal(parseOperationalCueThresholdDays(""), null);
  assert.equal(parseOperationalCueThresholdDays("0"), 0);
  assert.equal(parseOperationalCueThresholdDays("30"), 30);

  assert.throws(() => parseOperationalCueThresholdDays("-1"), /Threshold days/);
  assert.throws(() => parseOperationalCueThresholdDays("31"), /Threshold days/);
  assert.throws(() => parseOperationalCueThresholdDays("1.5"), /Threshold days/);
});
