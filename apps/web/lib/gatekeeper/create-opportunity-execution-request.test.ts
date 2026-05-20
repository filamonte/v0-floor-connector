import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildGateKeeperCreateOpportunityDuplicatePreview } from "./create-opportunity-duplicates";
import {
  buildGateKeeperCreateOpportunityPreflight,
  type GateKeeperCreateOpportunitySavedDraftAttempt
} from "./create-opportunity-preflight";
import {
  buildGateKeeperCreateOpportunityExecutionRequestUpdate,
  getGateKeeperCreateOpportunityExecutionRequestEligibility
} from "./create-opportunity-execution-request";

const requestSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-execution-request.ts"
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

function makeSavedDraft(
  overrides: Partial<GateKeeperCreateOpportunitySavedDraftAttempt> = {}
): GateKeeperCreateOpportunitySavedDraftAttempt {
  return {
    id: "attempt_1",
    suggestionId: "suggestion_1",
    status: "confirmation_started",
    idempotencyKey:
      "gatekeeper_execution:create_opportunity:suggestion_1:create_opportunity_confirmation_draft:v1",
    createdAt: "2026-05-20T12:00:00.000Z",
    executedAt: null,
    executedBy: null,
    executionError: null,
    requestedAt: null,
    requestedBy: null,
    resultSubjectId: null,
    resultSubjectType: null,
    updatedAt: "2026-05-20T12:30:00.000Z",
    validationErrors: [],
    draft: {
      contactName: "Saved Contact",
      email: "saved@example.com",
      locationText: "Saved location",
      notes: "Saved note",
      phone: "555-0100",
      requestedAppointmentText: "Friday morning",
      requestedService: "Saved service",
      sourceLabel: "manual"
    },
    ...overrides
  };
}

function makePreflight(
  savedDraft: GateKeeperCreateOpportunitySavedDraftAttempt = makeSavedDraft(),
  candidates: Parameters<
    typeof buildGateKeeperCreateOpportunityDuplicatePreview
  >[0]["candidates"] = []
) {
  return buildGateKeeperCreateOpportunityPreflight({
    savedDraft,
    duplicatePreview: buildGateKeeperCreateOpportunityDuplicatePreview({
      candidates,
      draft: savedDraft.draft
    })
  });
}

void test("eligible saved draft can request future execution as a ledger-only transition", () => {
  const eligibility = getGateKeeperCreateOpportunityExecutionRequestEligibility(
    {
      preflight: makePreflight(),
      suggestionStatus: "approved"
    }
  );
  const update = buildGateKeeperCreateOpportunityExecutionRequestUpdate({
    requestedAt: "2026-05-20T13:00:00.000Z",
    userId: "user_1"
  });

  assert.equal(eligibility.canRequestExecution, true);
  assert.deepEqual(eligibility.blockers, []);
  assert.equal(eligibility.canExecuteNow, false);
  assert.deepEqual(update, {
    status: "execution_requested",
    requested_by: "user_1",
    requested_at: "2026-05-20T13:00:00.000Z",
    updated_by: "user_1"
  });
});

void test("ineligible saved draft is blocked before request transition", () => {
  const preflight = makePreflight(
    makeSavedDraft({
      draft: {
        ...makeSavedDraft().draft,
        contactName: "",
        requestedService: ""
      }
    })
  );
  const eligibility = getGateKeeperCreateOpportunityExecutionRequestEligibility(
    {
      preflight,
      suggestionStatus: "approved"
    }
  );

  assert.equal(eligibility.canRequestExecution, false);
  assert.ok(
    eligibility.blockers.some(
      (blocker) => blocker.code === "missing_required_confirmation_fields"
    )
  );
});

void test("high-confidence duplicate blocks future execution request", () => {
  const eligibility = getGateKeeperCreateOpportunityExecutionRequestEligibility(
    {
      preflight: makePreflight(makeSavedDraft(), [
        {
          id: "existing_opportunity",
          matchType: "opportunity",
          displayLabel: "Existing opportunity",
          email: "saved@example.com"
        }
      ]),
      suggestionStatus: "approved"
    }
  );

  assert.equal(eligibility.canRequestExecution, false);
  assert.ok(
    eligibility.blockers.some(
      (blocker) => blocker.code === "high_confidence_duplicate_review_required"
    )
  );
});

void test("request transition requires approved review and requestable draft status", () => {
  const proposedEligibility =
    getGateKeeperCreateOpportunityExecutionRequestEligibility({
      preflight: makePreflight(),
      suggestionStatus: "proposed"
    });
  const alreadyRequestedEligibility =
    getGateKeeperCreateOpportunityExecutionRequestEligibility({
      preflight: makePreflight(
        makeSavedDraft({
          status: "execution_requested",
          requestedAt: "2026-05-20T13:00:00.000Z",
          requestedBy: "user_1"
        })
      ),
      suggestionStatus: "approved"
    });

  assert.ok(
    proposedEligibility.blockers.some(
      (blocker) => blocker.code === "suggestion_review_required"
    )
  );
  assert.ok(
    alreadyRequestedEligibility.blockers.some(
      (blocker) => blocker.code === "saved_draft_status_not_requestable"
    )
  );
});

void test("request UI copy does not imply opportunity creation", () => {
  const requestSection = componentSource.slice(
    componentSource.indexOf("Execution request"),
    componentSource.indexOf("Controlled execution")
  );

  assert.match(componentSource, /Request future execution/);
  assert.match(
    requestSource,
    /This only marks the GateKeeper ledger as execution requested/
  );
  assert.match(requestSource, /No opportunity will be created yet/);
  assert.doesNotMatch(requestSection, />\s*Create opportunity\s*</);
  assert.doesNotMatch(componentSource, />\s*Execute now\s*</);
  assert.doesNotMatch(componentSource, />\s*Run\s*</);
  assert.doesNotMatch(componentSource, />\s*Submit lead\s*</);
});

void test("request transition changes only GateKeeper ledger fields", () => {
  const actionSlice = actionsSource.slice(
    actionsSource.indexOf(
      "export async function requestCreateOpportunityExecutionAction"
    ),
    actionsSource.indexOf(
      "export async function executeCreateOpportunityFromGateKeeperAction"
    )
  );

  assert.match(actionSlice, /\.from\("gatekeeper_execution_attempts"\)/);
  assert.match(actionSlice, /\.update\(/);
  assert.doesNotMatch(actionSlice, /\.insert\(|\.upsert\(|\.delete\(/);
  assert.doesNotMatch(
    actionSlice,
    /from\("opportunities"\)|from\("contacts"\)|from\("customers"\)|from\("projects"\)/
  );
});

void test("request path does not import mutation modules or providers", () => {
  const requestActionSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function requestCreateOpportunityExecutionAction"
    ),
    actionsSource.indexOf(
      "export async function executeCreateOpportunityFromGateKeeperAction"
    )
  );
  const combinedSource = `${requestSource}\n${requestActionSource}`;

  assert.doesNotMatch(
    combinedSource,
    /from ["']@\/lib\/(opportunities\/actions|contacts\/actions|customers\/actions|projects\/actions|schedule\/actions|appointments\/actions|jobs\/actions|communications\/actions|invoices\/actions|contracts\/actions|payments\/actions)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    combinedSource,
    /\bquickCreateOpportunityAction\b|\bcreateOpportunityAction\b|\bupdateOpportunityAction\b|\bensureOpportunityEstimateFlow\b|\bcreateContact\b|\bcreateCustomer\b|\bcreateProject\b|\bcreateAppointment\b|\bscheduleAppointment\b|\bcreateInvoice\b|\bsendEmail\b|\bsendSms\b|\bexecuteGateKeeper\b/i
  );
});

void test("review approval remains separate from execution request transition", () => {
  const approveReviewSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function approveGateKeeperSuggestionReviewAction"
    ),
    actionsSource.indexOf(
      "export async function rejectGateKeeperSuggestionAction"
    )
  );

  assert.match(actionsSource, /No action was executed/);
  assert.match(actionsSource, /requestCreateOpportunityExecutionAction/);
  assert.doesNotMatch(
    approveReviewSource,
    /gatekeeper_execution_attempts|requestCreateOpportunityExecutionAction|execution_requested/
  );
});
