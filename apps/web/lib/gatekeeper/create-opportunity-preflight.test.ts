import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildGateKeeperCreateOpportunityDuplicatePreview } from "./create-opportunity-duplicates";
import {
  buildGateKeeperCreateOpportunityPreflight,
  buildGateKeeperCreateOpportunityExecutionResultDisplay,
  buildGateKeeperCreateOpportunitySavedDraftAttempt,
  selectLatestGateKeeperCreateOpportunityDraftAttempts,
  type GateKeeperCreateOpportunitySavedDraftAttempt
} from "./create-opportunity-preflight";

const helperSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-preflight.ts"
  ),
  "utf8"
);
const dataSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-preflight-data.ts"
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
const drawerSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-suggestion-detail-drawer.tsx"
  ),
  "utf8"
);
const pageSource = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/gatekeeper/page.tsx"),
  "utf8"
);
const actionsSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
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

void test("create opportunity preflight parses saved ledger draft payload", () => {
  const attempt = buildGateKeeperCreateOpportunitySavedDraftAttempt({
    id: "attempt_1",
    suggestionId: "suggestion_1",
    status: "confirmation_started",
    idempotencyKey:
      "gatekeeper_execution:create_opportunity:suggestion_1:create_opportunity_confirmation_draft:v1",
    createdAt: "2026-05-20T12:00:00.000Z",
    updatedAt: "2026-05-20T12:30:00.000Z",
    validationErrors: [
      {
        field: "Contact/customer name",
        message: "Missing.",
        severity: "warning"
      }
    ],
    validatedPayload: {
      purpose: "create_opportunity_confirmation_draft",
      draftValidationScope: "gatekeeper_ledger_only",
      canExecuteNow: false,
      executionNotImplemented: true,
      draft: {
        contactName: " Saved Contact ",
        email: " saved@example.com ",
        locationText: " Saved location ",
        notes: " Saved note ",
        phone: " 555-0100 ",
        requestedAppointmentText: " Friday morning ",
        requestedService: " Saved service ",
        sourceLabel: " manual ",
        unknownField: "not trusted"
      }
    }
  });

  assert.ok(attempt);
  assert.equal(attempt.draft.contactName, "Saved Contact");
  assert.equal(Object.hasOwn(attempt.draft, "unknownField"), false);
  assert.equal(attempt.validationErrors[0]?.severity, "warning");
});

void test("create opportunity preflight selects latest ledger draft per suggestion", () => {
  const latest = selectLatestGateKeeperCreateOpportunityDraftAttempts([
    makeSavedDraft({
      id: "old",
      suggestionId: "suggestion_1",
      updatedAt: "2026-05-20T12:00:00.000Z"
    }),
    makeSavedDraft({
      id: "new",
      suggestionId: "suggestion_1",
      updatedAt: "2026-05-20T13:00:00.000Z"
    }),
    makeSavedDraft({
      id: "other",
      suggestionId: "suggestion_2"
    })
  ]);

  assert.equal(latest.get("suggestion_1")?.id, "new");
  assert.equal(latest.get("suggestion_2")?.id, "other");
});

void test("create opportunity preflight uses saved draft for missing field readiness", () => {
  const duplicatePreview = buildGateKeeperCreateOpportunityDuplicatePreview({
    candidates: [],
    draft: makeSavedDraft().draft
  });
  const preflight = buildGateKeeperCreateOpportunityPreflight({
    duplicatePreview,
    savedDraft: makeSavedDraft({
      draft: {
        ...makeSavedDraft().draft,
        contactName: "",
        requestedService: ""
      }
    })
  });

  assert.equal(preflight.readiness, "not_ready_missing_required");
  assert.equal(preflight.canExecuteNow, false);
  assert.equal(preflight.currentEligibility, "draft_not_requested");
  assert.ok(
    preflight.blockers.some(
      (blocker) => blocker.code === "missing_required_confirmation_fields"
    )
  );
});

void test("create opportunity preflight carries duplicate warnings into readiness", () => {
  const savedDraft = makeSavedDraft();
  const duplicatePreview = buildGateKeeperCreateOpportunityDuplicatePreview({
    candidates: [
      {
        id: "existing-opportunity",
        matchType: "opportunity",
        displayLabel: "Existing opportunity",
        email: "saved@example.com",
        name: "Saved Contact"
      }
    ],
    draft: savedDraft.draft
  });
  const preflight = buildGateKeeperCreateOpportunityPreflight({
    duplicatePreview,
    savedDraft
  });

  assert.equal(preflight.readiness, "review_duplicate_warning");
  assert.equal(
    preflight.duplicatePreview.recommendation,
    "high_confidence_duplicate_review_required"
  );
  assert.ok(
    preflight.blockers.some(
      (blocker) => blocker.code === "duplicate_review_required"
    )
  );
  assert.equal(preflight.canExecuteNow, false);
});

void test("create opportunity preflight can become executable only from execution_requested", () => {
  const draftPreflight = buildGateKeeperCreateOpportunityPreflight({
    duplicatePreview: buildGateKeeperCreateOpportunityDuplicatePreview({
      candidates: [],
      draft: makeSavedDraft().draft
    }),
    savedDraft: makeSavedDraft()
  });
  const savedDraft = makeSavedDraft({
    status: "execution_requested",
    requestedAt: "2026-05-20T13:00:00.000Z",
    requestedBy: "user_1"
  });
  const duplicatePreview = buildGateKeeperCreateOpportunityDuplicatePreview({
    candidates: [],
    draft: savedDraft.draft
  });
  const preflight = buildGateKeeperCreateOpportunityPreflight({
    duplicatePreview,
    savedDraft
  });

  assert.equal(draftPreflight.currentEligibility, "draft_not_requested");
  assert.equal(draftPreflight.canExecuteNow, false);
  assert.equal(preflight.readiness, "eligible_for_future_execution");
  assert.equal(
    preflight.currentEligibility,
    "eligible_for_controlled_execution"
  );
  assert.equal(preflight.canExecuteNow, true);
});

void test("create opportunity preflight surfaces executed and failed ledger results", () => {
  const executedResult = buildGateKeeperCreateOpportunityExecutionResultDisplay(
    makeSavedDraft({
      status: "executed",
      executedAt: "2026-05-20T14:00:00.000Z",
      executedBy: "user_1",
      resultSubjectId: "12345678-1234-1234-1234-123456789abc",
      resultSubjectType: "opportunity"
    })
  );
  const failedResult = buildGateKeeperCreateOpportunityExecutionResultDisplay(
    makeSavedDraft({
      status: "failed",
      executionError: "Safe failure.",
      updatedAt: "2026-05-20T14:30:00.000Z"
    })
  );
  const executedPreflight = buildGateKeeperCreateOpportunityPreflight({
    duplicatePreview: buildGateKeeperCreateOpportunityDuplicatePreview({
      candidates: [],
      draft: makeSavedDraft().draft
    }),
    savedDraft: makeSavedDraft({
      status: "executed",
      executedAt: "2026-05-20T14:00:00.000Z",
      executedBy: "user_1",
      resultSubjectId: "12345678-1234-1234-1234-123456789abc",
      resultSubjectType: "opportunity"
    })
  });

  assert.equal(executedResult?.status, "executed");
  assert.equal(
    executedResult?.href,
    "/leads/12345678-1234-1234-1234-123456789abc"
  );
  assert.equal(failedResult?.status, "failed");
  assert.equal(failedResult?.message, "Safe failure.");
  assert.equal(executedPreflight.currentEligibility, "executed");
  assert.equal(executedPreflight.canExecuteNow, false);
  assert.ok(
    executedPreflight.blockers.some(
      (blocker) => blocker.code === "already_executed"
    )
  );
});

void test("create opportunity preflight UI is surfaced before controlled execution", () => {
  assert.match(pageSource, /getGateKeeperCreateOpportunityPreflights/);
  assert.match(drawerSource, /preflight/);
  assert.match(componentSource, /Saved confirmation draft/);
  assert.match(componentSource, /Preflight summary/);
  assert.match(componentSource, /Execution result/);
  assert.match(componentSource, /Created by GateKeeper controlled execution/);
  assert.match(pageSource, /Execution result/);
  assert.match(helperSource, /This preflight does not create a lead/);
  assert.match(componentSource, /Controlled execution/);
  assert.match(componentSource, />\s*Create opportunity\s*</);
  assert.doesNotMatch(componentSource, />\s*Execute now\s*</);
  assert.doesNotMatch(componentSource, />\s*Run\s*</);
});

void test("create opportunity preflight path is read-only and avoids mutation/provider imports", () => {
  const combinedSource = `${helperSource}\n${dataSource}\n${componentSource}\n${drawerSource}\n${pageSource}`;

  assert.match(dataSource, /\.from\("gatekeeper_execution_attempts"\)/);
  assert.doesNotMatch(
    dataSource,
    /\.insert\(|\.update\(|\.upsert\(|\.delete\(/
  );
  assert.doesNotMatch(
    combinedSource,
    /from ["']@\/lib\/(opportunities\/actions|contacts\/actions|customers\/actions|projects\/actions|schedule\/actions|appointments\/actions|jobs\/actions|communications\/actions|invoices\/actions|contracts\/actions|payments\/actions)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    combinedSource,
    /\bquickCreateOpportunityAction\b|\bcreateOpportunityAction\b|\bupdateOpportunityAction\b|\bensureOpportunityEstimateFlow\b|\bcreateContact\b|\bcreateCustomer\b|\bcreateProject\b|\bcreateAppointment\b|\bscheduleAppointment\b|\bcreateInvoice\b|\bsendEmail\b|\bsendSms\b|\bexecuteGateKeeper\b|execution_validated/i
  );
});

void test("review approval remains separate from create opportunity preflight", () => {
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
    /createOpportunityPreflight|gatekeeper_execution_attempts|validated_payload|executeGateKeeper/i
  );
});
