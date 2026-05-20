import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import {
  buildGateKeeperCreateOpportunityLedgerDraft,
  gateKeeperCreateOpportunityExecutionDraftPurpose
} from "./create-opportunity-execution-draft";

const helperSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-execution-draft.ts"
  ),
  "utf8"
);
const actionsSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);
const componentSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-create-opportunity-confirmation.tsx"
  ),
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
    subjectType: "opportunity",
    subjectId: "opportunity_1",
    suggestionType: "create_opportunity",
    title: "Create opportunity",
    rationale: "Customer requested a garage epoxy estimate.",
    proposedPayload: {
      customerName: "Pat Sample",
      requestedService: "Garage epoxy",
      ignoredUnknown: "do not trust me"
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

void test("create opportunity execution draft builds only ledger attempt shape", () => {
  const draft = buildGateKeeperCreateOpportunityLedgerDraft({
    suggestion: makeSuggestion(),
    draft: {
      contactName: " Pat Sample ",
      phone: " 555-0100 ",
      email: " pat@example.com ",
      requestedService: " Garage epoxy ",
      locationText: " 12 Industrial Way ",
      notes: " Wants callback ",
      requestedAppointmentText: " Friday morning ",
      sourceLabel: " manual "
    }
  });

  assert.equal(draft.suggestionId, "suggestion_1");
  assert.equal(draft.actionType, "create_opportunity");
  assert.equal(draft.executionOwner, "opportunities");
  assert.equal(draft.riskTier, "medium_internal");
  assert.equal(draft.status, "confirmation_started");
  assert.equal(draft.metadata.executionAllowed, false);
  assert.equal(draft.validatedPayload.canExecuteNow, false);
  assert.equal(draft.validatedPayload.executionNotImplemented, true);
  assert.equal(
    draft.validatedPayload.draftValidationScope,
    "gatekeeper_ledger_only"
  );
  assert.deepEqual(draft.validatedPayload.draft, {
    contactName: "Pat Sample",
    phone: "555-0100",
    email: "pat@example.com",
    requestedService: "Garage epoxy",
    locationText: "12 Industrial Way",
    notes: "Wants callback",
    requestedAppointmentText: "Friday morning",
    sourceLabel: "manual"
  });
});

void test("create opportunity execution draft preserves original proposed payload snapshot", () => {
  const suggestion = makeSuggestion();
  const draft = buildGateKeeperCreateOpportunityLedgerDraft({
    suggestion,
    draft: {
      contactName: "Edited Name"
    }
  });

  assert.deepEqual(draft.proposedPayloadSnapshot, suggestion.proposedPayload);
  assert.equal(draft.proposedPayloadSnapshot.ignoredUnknown, "do not trust me");
  assert.equal(
    Object.hasOwn(draft.validatedPayload.draft, "ignoredUnknown"),
    false
  );
});

void test("create opportunity execution draft uses deterministic confirmation idempotency key", () => {
  const draft = buildGateKeeperCreateOpportunityLedgerDraft({
    suggestion: makeSuggestion(),
    draft: {}
  });

  assert.equal(
    draft.idempotencyKey,
    `gatekeeper_execution:create_opportunity:suggestion_1:${gateKeeperCreateOpportunityExecutionDraftPurpose}:v1`
  );
});

void test("create opportunity execution draft records preflight warnings only", () => {
  const draft = buildGateKeeperCreateOpportunityLedgerDraft({
    suggestion: makeSuggestion(),
    draft: {
      contactName: "",
      email: "",
      locationText: "",
      phone: "",
      requestedService: ""
    }
  });

  assert.equal(draft.validationErrors.length, 4);
  assert.deepEqual(
    draft.validationErrors.map((error) => error.severity),
    ["warning", "warning", "warning", "warning"]
  );
  assert.ok(
    draft.validationErrors.every((error) =>
      error.message.includes("does not execute anything")
    )
  );
});

void test("create opportunity execution draft rejects non-create-opportunity suggestions", () => {
  assert.throws(
    () =>
      buildGateKeeperCreateOpportunityLedgerDraft({
        suggestion: makeSuggestion({
          suggestionType: "schedule_site_assessment"
        }),
        draft: {}
      }),
    /Only create_opportunity/
  );
});

void test("create opportunity confirmation UI saves a ledger draft without making the save step execution", () => {
  assert.match(componentSource, /Save confirmation draft/);
  assert.match(componentSource, /only saves a GateKeeper execution draft/);
  assert.match(componentSource, /This save step is ledger-only/);
  assert.match(componentSource, />\s*Create opportunity\s*</);
  assert.doesNotMatch(componentSource, />\s*Execute now\s*</);
  assert.doesNotMatch(componentSource, />\s*Run\s*</);
});

void test("create opportunity execution draft path does not import mutation modules or providers", () => {
  const combinedSource = `${helperSource}\n${actionsSource}\n${componentSource}`;

  assert.doesNotMatch(
    combinedSource,
    /from ["']@\/lib\/(opportunities\/actions|contacts\/actions|customers\/actions|projects\/actions|schedule\/actions|appointments\/actions|jobs\/actions|communications\/actions|invoices\/actions|contracts\/actions|payments\/actions)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    combinedSource,
    /\bquickCreateOpportunityAction\b|\bcreateOpportunityAction\b|\bupdateOpportunityAction\b|\bensureOpportunityEstimateFlow\b|\bcreateContact\b|\bcreateCustomer\b|\bcreateProject\b|\bcreateAppointment\b|\bscheduleAppointment\b|\bcreateInvoice\b|\bsendEmail\b|\bsendSms\b|\bexecuteGateKeeper\b|execution_validated/i
  );
});

void test("review approval remains separate from ledger-backed confirmation draft", () => {
  const approveReviewSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function approveGateKeeperSuggestionReviewAction"
    ),
    actionsSource.indexOf(
      "export async function rejectGateKeeperSuggestionAction"
    )
  );

  assert.match(actionsSource, /No action was executed/);
  assert.match(actionsSource, /saveCreateOpportunityExecutionDraftAction/);
  assert.doesNotMatch(
    approveReviewSource,
    /gatekeeper_execution_attempts|validated_payload|saveCreateOpportunityExecutionDraftAction/
  );
});
