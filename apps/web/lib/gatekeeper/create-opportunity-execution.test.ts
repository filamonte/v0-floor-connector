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
  buildGateKeeperCreateOpportunityExecutedLedgerUpdate,
  buildGateKeeperCreateOpportunityFailedLedgerUpdate,
  getGateKeeperCreateOpportunityExecutionEligibility,
  mapGateKeeperCreateOpportunityDraftToCanonicalInput
} from "./create-opportunity-execution";

const executionSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-execution.ts"
  ),
  "utf8"
);
const actionsSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);
const opportunityServiceSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/opportunities/create-opportunity-service.ts"
  ),
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
    status: "execution_requested",
    idempotencyKey:
      "gatekeeper_execution:create_opportunity:suggestion_1:create_opportunity_confirmation_draft:v1",
    createdAt: "2026-05-20T12:00:00.000Z",
    executedAt: null,
    executedBy: null,
    executionError: null,
    requestedAt: "2026-05-20T13:00:00.000Z",
    requestedBy: "user_1",
    resultSubjectId: null,
    resultSubjectType: null,
    updatedAt: "2026-05-20T13:00:00.000Z",
    validationErrors: [],
    draft: {
      contactName: "Saved Contact",
      email: "saved@example.com",
      locationText: "Saved location",
      notes: "Saved note",
      phone: "555-0100",
      requestedAppointmentText: "Friday morning",
      requestedService: "Garage epoxy",
      sourceLabel: "manual intake",
      unsafeUnknown: "not part of this type"
    } as GateKeeperCreateOpportunitySavedDraftAttempt["draft"],
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

void test("eligible execution_requested draft maps to canonical opportunity input", () => {
  const preflight = makePreflight();
  const eligibility = getGateKeeperCreateOpportunityExecutionEligibility({
    preflight,
    suggestionStatus: "approved"
  });
  const canonicalInput =
    mapGateKeeperCreateOpportunityDraftToCanonicalInput(preflight);

  assert.equal(eligibility.canExecute, true);
  assert.deepEqual(eligibility.blockers, []);
  assert.equal(canonicalInput.status, "new");
  assert.equal(canonicalInput.source, "GateKeeper");
  assert.equal(canonicalInput.jobType, "Garage epoxy");
  assert.equal(canonicalInput.serviceType, "Garage epoxy");
  assert.equal(canonicalInput.siteName, "Saved location");
  assert.equal(canonicalInput.contactName, "Saved Contact");
  assert.equal(canonicalInput.email, "saved@example.com");
  assert.equal(canonicalInput.contactPhone, "555-0100");
  assert.equal(canonicalInput.siteAssessmentScheduledOn, null);
  assert.equal(canonicalInput.siteAssessmentScheduledTime, null);
  assert.deepEqual(canonicalInput.measurements, []);
  assert.deepEqual(canonicalInput.observations, []);
  assert.deepEqual(canonicalInput.attachments, []);
  assert.equal(Object.hasOwn(canonicalInput, "unsafeUnknown"), false);
});

void test("execution blocks missing fields, unapproved suggestions, wrong status, and existing result", () => {
  assert.equal(
    getGateKeeperCreateOpportunityExecutionEligibility({
      preflight: makePreflight(
        makeSavedDraft({
          draft: {
            ...makeSavedDraft().draft,
            contactName: "",
            requestedService: ""
          }
        })
      ),
      suggestionStatus: "approved"
    }).canExecute,
    false
  );
  assert.ok(
    getGateKeeperCreateOpportunityExecutionEligibility({
      preflight: makePreflight(),
      suggestionStatus: "proposed"
    }).blockers.some((blocker) => blocker.code === "suggestion_review_required")
  );
  assert.ok(
    getGateKeeperCreateOpportunityExecutionEligibility({
      preflight: makePreflight(
        makeSavedDraft({ status: "confirmation_started" })
      ),
      suggestionStatus: "approved"
    }).blockers.some((blocker) => blocker.code === "execution_request_required")
  );
  assert.ok(
    getGateKeeperCreateOpportunityExecutionEligibility({
      preflight: makePreflight(makeSavedDraft({ status: "failed" })),
      suggestionStatus: "approved"
    }).blockers.some((blocker) => blocker.code === "previous_execution_failed")
  );
  assert.ok(
    getGateKeeperCreateOpportunityExecutionEligibility({
      preflight: makePreflight(
        makeSavedDraft({
          resultSubjectId: "opportunity_1",
          resultSubjectType: "opportunity"
        })
      ),
      suggestionStatus: "approved"
    }).blockers.some((blocker) => blocker.code === "already_executed")
  );
});

void test("high-confidence duplicates block controlled execution", () => {
  const eligibility = getGateKeeperCreateOpportunityExecutionEligibility({
    preflight: makePreflight(makeSavedDraft(), [
      {
        id: "existing_opportunity",
        matchType: "opportunity",
        displayLabel: "Existing opportunity",
        email: "saved@example.com"
      }
    ]),
    suggestionStatus: "approved"
  });

  assert.equal(eligibility.canExecute, false);
  assert.ok(
    eligibility.blockers.some(
      (blocker) => blocker.code === "high_confidence_duplicate_review_required"
    )
  );
});

void test("execution ledger updates only encode executed or failed attempt state", () => {
  assert.deepEqual(
    buildGateKeeperCreateOpportunityExecutedLedgerUpdate({
      executedAt: "2026-05-20T14:00:00.000Z",
      opportunityId: "opportunity_1",
      userId: "user_1"
    }),
    {
      status: "executed",
      executed_by: "user_1",
      executed_at: "2026-05-20T14:00:00.000Z",
      result_subject_type: "opportunity",
      result_subject_id: "opportunity_1",
      execution_error: null,
      updated_by: "user_1"
    }
  );
  assert.deepEqual(
    buildGateKeeperCreateOpportunityFailedLedgerUpdate({
      error: new Error("Canonical validation failed\nwith detail"),
      userId: "user_1"
    }),
    {
      status: "failed",
      execution_error: "Canonical validation failed with detail",
      updated_by: "user_1"
    }
  );
});

void test("execution UI uses explicit create copy and safety boundaries", () => {
  assert.match(componentSource, /Controlled execution/);
  assert.match(componentSource, />\s*Create opportunity\s*</);
  assert.match(executionSource, /This creates one canonical opportunity/);
  assert.match(
    executionSource,
    /It will not create a customer, project, estimate, job, schedule, invoice, contract, payment, message, task, or portal record/
  );
  assert.match(componentSource, /No retry action is available in this pass/);
  assert.doesNotMatch(componentSource, />\s*Execute now\s*</);
  assert.doesNotMatch(componentSource, />\s*Run\s*</);
});

void test("execution path uses Opportunities-owned helper and avoids forbidden modules", () => {
  const executeActionSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function executeCreateOpportunityFromGateKeeperAction"
    ),
    actionsSource.indexOf(
      "export async function createGateKeeperInternalNoteAction"
    )
  );

  assert.match(
    opportunityServiceSource,
    /createCanonicalOpportunityFromValidatedInput/
  );
  assert.match(opportunityServiceSource, /opportunityInputSchema/);
  assert.match(opportunityServiceSource, /createOpportunity/);
  assert.match(
    executeActionSource,
    /createCanonicalOpportunityFromValidatedInput/
  );
  assert.match(
    executeActionSource,
    /\.from\("gatekeeper_execution_attempts"\)/
  );
  assert.doesNotMatch(
    `${executionSource}\n${executeActionSource}`,
    /from ["']@\/lib\/(opportunities\/actions|opportunities\/data|contacts|customers|projects|schedule|appointments|jobs|communications|invoices|contracts|payments)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    `${executionSource}\n${executeActionSource}\n${opportunityServiceSource}`,
    /\bquickCreateOpportunityAction\b|\bcreateOpportunityAction\b|\bupdateOpportunityAction\b|\bensureOpportunityEstimateFlow\b|\bcreateCustomer\b|\bcreateProject\b|\bcreateAppointment\b|\bscheduleAppointment\b|\bcreateInvoice\b|\bsendEmail\b|\bsendSms\b/i
  );
});

void test("review approval remains separate from controlled execution", () => {
  const approveReviewSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function approveGateKeeperSuggestionReviewAction"
    ),
    actionsSource.indexOf(
      "export async function rejectGateKeeperSuggestionAction"
    )
  );

  assert.match(actionsSource, /No action was executed/);
  assert.match(
    actionsSource,
    /already created an opportunity\. Open the linked result instead of running it again/
  );
  assert.match(
    actionsSource,
    /Retry requires a future explicit reset\/retry policy/
  );
  assert.match(actionsSource, /executeCreateOpportunityFromGateKeeperAction/);
  assert.doesNotMatch(
    approveReviewSource,
    /executeCreateOpportunityFromGateKeeperAction|createCanonicalOpportunityFromValidatedInput|gatekeeper_execution_attempts/
  );
});
