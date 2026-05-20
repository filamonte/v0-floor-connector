import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGateKeeperControlledActionPreview,
  canSuggestionHaveExecutionPreview,
  classifySuggestionRisk,
  getExecutionOwnerForSuggestion,
  getGateKeeperExecutionPolicy
} from "./action-bridge";

const bridge = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/action-bridge.ts"),
  "utf8"
);
const memory = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/memory.ts"),
  "utf8"
);
const actions = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);

void test("GateKeeper action bridge classifies suggestion risk tiers", () => {
  assert.equal(classifySuggestionRisk("create_opportunity"), "medium_internal");
  assert.equal(
    classifySuggestionRisk("schedule_site_assessment"),
    "high_schedule"
  );
  assert.equal(
    classifySuggestionRisk("send_followup_later"),
    "high_customer_facing"
  );
  assert.equal(
    classifySuggestionRisk("flag_invoice_review"),
    "high_financial_legal"
  );
  assert.equal(classifySuggestionRisk("unknown_future_action"), "forbidden");
});

void test("GateKeeper action bridge maps suggestions to explicit owners", () => {
  assert.equal(
    getExecutionOwnerForSuggestion("create_opportunity"),
    "opportunities"
  );
  assert.equal(
    getExecutionOwnerForSuggestion("update_project_notes"),
    "projects"
  );
  assert.equal(
    getExecutionOwnerForSuggestion("create_task_later"),
    "work_items"
  );
  assert.equal(
    getExecutionOwnerForSuggestion("send_followup_later"),
    "communications"
  );
  assert.equal(
    getExecutionOwnerForSuggestion("flag_contract_review"),
    "contracts"
  );
  assert.equal(getExecutionOwnerForSuggestion("unknown_future_action"), "none");
});

void test("GateKeeper action bridge separates preview from execution", () => {
  const policy = getGateKeeperExecutionPolicy("create_opportunity");
  const preview = buildGateKeeperControlledActionPreview("create_opportunity");
  const schedulePolicy = getGateKeeperExecutionPolicy(
    "schedule_site_assessment"
  );

  assert.equal(policy.previewAllowed, true);
  assert.equal(policy.executionAllowedInCurrentSlice, true);
  assert.equal(schedulePolicy.executionAllowedInCurrentSlice, false);
  assert.equal(policy.requiresExplicitHumanExecutionRequest, true);
  assert.equal(preview.canPreview, true);
  assert.equal(preview.canExecuteNow, false);
  assert.match(
    preview.blockers[0]?.code ?? "",
    /execution_requires_ledger_request/
  );
});

void test("GateKeeper action bridge blocks unknown suggestions", () => {
  const preview = buildGateKeeperControlledActionPreview(
    "unknown_future_action"
  );

  assert.equal(
    canSuggestionHaveExecutionPreview("unknown_future_action"),
    false
  );
  assert.equal(preview.owner, "none");
  assert.equal(preview.riskTier, "forbidden");
  assert.equal(preview.canExecuteNow, false);
  assert.ok(
    preview.blockers.some(
      (blocker) => blocker.code === "unknown_suggestion_type"
    )
  );
});

void test("GateKeeper action bridge does not import mutation modules or providers", () => {
  assert.doesNotMatch(
    bridge,
    /from ["']@\/lib\/(opportunities|projects|schedule|jobs|work-items|communications|invoices|contracts)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    bridge,
    /createOpportunity|updateOpportunity|createProject|createWorkItem|scheduleAppointment|createInvoice|sendEmail|sendSms|reviewGateKeeper/i
  );
});

void test("GateKeeper review approval remains separate from execution", () => {
  assert.match(actions, /No action was executed/);
  assert.match(
    memory,
    /Only proposed GateKeeper action suggestions can be reviewed in this pass/
  );
  assert.doesNotMatch(
    actions,
    /buildGateKeeperControlledActionPreview|getGateKeeperExecutionPolicy|execution_validated/i
  );
});
