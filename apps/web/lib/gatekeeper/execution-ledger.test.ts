import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import {
  buildGateKeeperExecutionAttemptDraft,
  buildGateKeeperExecutionIdempotencyKey,
  hasValidGateKeeperExecutionResultSubjectPair
} from "./execution-ledger";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260520120000_gatekeeper_execution_attempts.sql"
  ),
  "utf8"
);
const ledgerSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/execution-ledger.ts"),
  "utf8"
);
const actionsSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);

function makeSuggestion(
  overrides: Partial<GateKeeperActionSuggestion> = {}
): GateKeeperActionSuggestion {
  return {
    id: "suggestion_1",
    organizationId: "org_1",
    sourceArtifactId: "artifact_1",
    communicationThreadId: "thread_1",
    communicationMessageId: "message_1",
    subjectType: "project",
    subjectId: "project_1",
    suggestionType: "create_opportunity",
    title: "Create opportunity",
    rationale: "Customer requested a garage epoxy estimate.",
    proposedPayload: {
      customerName: "Pat Sample",
      requestedService: "Garage epoxy"
    },
    status: "approved",
    reviewedByUserId: "user_1",
    reviewedAt: "2026-05-20T12:00:00.000Z",
    reviewNote: null,
    createdByUserId: "user_1",
    updatedByUserId: "user_1",
    createdAt: "2026-05-20T11:00:00.000Z",
    updatedAt: "2026-05-20T12:00:00.000Z",
    ...overrides
  };
}

void test("GateKeeper execution ledger migration creates tenant-scoped attempt table", () => {
  assert.match(
    migration,
    /create table if not exists public\.gatekeeper_execution_attempts/i
  );
  assert.match(
    migration,
    /gatekeeper_action_suggestions_company_id_id_unique_idx/i
  );
  assert.match(
    migration,
    /company_id uuid not null references public\.companies/i
  );
  assert.match(migration, /suggestion_id uuid not null/i);
  assert.match(migration, /idempotency_key text not null/i);
  assert.match(migration, /proposed_payload_snapshot jsonb/i);
  assert.match(migration, /validated_payload jsonb/i);
  assert.match(
    migration,
    /created_by uuid not null references public\.users\(id\) on delete restrict/i
  );
});

void test("GateKeeper execution ledger migration keeps execution state separate from review state", () => {
  assert.match(
    migration,
    /gatekeeper_execution_attempts_status_check[\s\S]*confirmation_started[\s\S]*execution_requested[\s\S]*executed/i
  );
  assert.match(
    migration,
    /separate from gatekeeper_action_suggestions\.status/i
  );
  assert.match(
    migration,
    /gatekeeper_execution_attempts_company_idempotency_unique_idx/i
  );
  assert.doesNotMatch(
    migration,
    /alter table public\.gatekeeper_action_suggestions[\s\S]*execution_status/i
  );
});

void test("GateKeeper execution ledger migration applies RLS without delete policy", () => {
  assert.match(
    migration,
    /alter table public\.gatekeeper_execution_attempts force row level security/i
  );
  assert.match(migration, /public\.is_active_company_member\(company_id\)/);
  assert.match(migration, /created_by = \(select auth\.uid\(\)\)/);
  assert.match(migration, /updated_by = \(select auth\.uid\(\)\)/);
  assert.match(migration, /grant select, insert, update/i);
  assert.doesNotMatch(migration, /for delete|grant delete/i);
});

void test("GateKeeper execution ledger migration enforces result subject and executed-state checks", () => {
  assert.match(
    migration,
    /gatekeeper_execution_attempts_result_subject_pair_check/i
  );
  assert.match(
    migration,
    /gatekeeper_execution_attempts_executed_state_check/i
  );
  assert.match(migration, /executed_by is not null/i);
  assert.match(migration, /result_subject_id is not null/i);
});

void test("GateKeeper execution ledger helper builds deterministic non-executing drafts", () => {
  const draft = buildGateKeeperExecutionAttemptDraft(makeSuggestion());

  assert.equal(draft.suggestionId, "suggestion_1");
  assert.equal(draft.actionType, "create_opportunity");
  assert.equal(draft.executionOwner, "opportunities");
  assert.equal(draft.riskTier, "medium_internal");
  assert.equal(draft.status, "draft");
  assert.equal(
    draft.idempotencyKey,
    "gatekeeper_execution:create_opportunity:suggestion_1:v1"
  );
  assert.equal(draft.metadata.executionAllowed, false);
  assert.equal(draft.metadata.reviewStatus, "approved");
  assert.deepEqual(draft.proposedPayloadSnapshot, {
    customerName: "Pat Sample",
    requestedService: "Garage epoxy"
  });
});

void test("GateKeeper execution ledger helper validates result subject pairs", () => {
  assert.equal(hasValidGateKeeperExecutionResultSubjectPair({}), true);
  assert.equal(
    hasValidGateKeeperExecutionResultSubjectPair({
      resultSubjectType: "opportunity",
      resultSubjectId: "opportunity_1"
    }),
    true
  );
  assert.equal(
    hasValidGateKeeperExecutionResultSubjectPair({
      resultSubjectType: "opportunity"
    }),
    false
  );
  assert.equal(
    hasValidGateKeeperExecutionResultSubjectPair({
      resultSubjectId: "opportunity_1"
    }),
    false
  );
});

void test("GateKeeper execution idempotency key includes action suggestion and version", () => {
  assert.equal(
    buildGateKeeperExecutionIdempotencyKey({
      actionType: "create_opportunity",
      suggestionId: "suggestion_1",
      version: 2
    }),
    "gatekeeper_execution:create_opportunity:suggestion_1:v2"
  );
  assert.equal(
    buildGateKeeperExecutionIdempotencyKey({
      actionType: "create_opportunity",
      purpose: "create_opportunity_confirmation_draft",
      suggestionId: "suggestion_1"
    }),
    "gatekeeper_execution:create_opportunity:suggestion_1:create_opportunity_confirmation_draft:v1"
  );
});

void test("GateKeeper execution ledger helper does not import mutation modules or providers", () => {
  assert.doesNotMatch(
    ledgerSource,
    /from ["']@\/lib\/(opportunities|contacts|customers|projects|schedule|appointments|jobs|work-items|communications|invoices|contracts|payments)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    ledgerSource,
    /createOpportunity|quickCreateOpportunityAction|updateOpportunity|ensureOpportunityEstimateFlow|createContact|createCustomer|createProject|createWorkItem|createAppointment|scheduleAppointment|createInvoice|sendEmail|sendSms|executeGateKeeper/i
  );
});

void test("GateKeeper review approval remains separate from execution ledger foundation", () => {
  const approveReviewSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function approveGateKeeperSuggestionReviewAction"
    ),
    actionsSource.indexOf(
      "export async function rejectGateKeeperSuggestionAction"
    )
  );

  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(
    approveReviewSource,
    /gatekeeper_execution_attempts|validated_payload|executeGateKeeper/
  );
});
