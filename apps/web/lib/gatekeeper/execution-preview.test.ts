import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import {
  buildGateKeeperExecutionPreview,
  buildGateKeeperPayloadPreview
} from "./execution-preview";

const previewSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/execution-preview.ts"),
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
    sourceArtifactId: null,
    communicationThreadId: null,
    communicationMessageId: null,
    subjectType: "project",
    subjectId: "project_1",
    suggestionType: "create_opportunity",
    title: "Review intake",
    rationale: "Manual source suggested follow-up.",
    proposedPayload: {
      customerName: "Pat Sample",
      requestedService: "Garage epoxy",
      requestedAppointment: "Friday morning"
    },
    status: "proposed",
    reviewedByUserId: null,
    reviewedAt: null,
    reviewNote: null,
    createdByUserId: "user_1",
    updatedByUserId: "user_1",
    createdAt: "2026-05-19T12:00:00.000Z",
    updatedAt: "2026-05-19T12:00:00.000Z",
    ...overrides
  };
}

void test("GateKeeper execution preview supports known suggestion types without direct preview execution", () => {
  const suggestionTypes = [
    "create_opportunity",
    "schedule_site_assessment",
    "create_task_later",
    "send_followup_later",
    "update_project_notes",
    "flag_estimate_review",
    "flag_invoice_review",
    "flag_contract_review"
  ] as const;

  for (const suggestionType of suggestionTypes) {
    const preview = buildGateKeeperExecutionPreview(
      makeSuggestion({ suggestionType })
    );

    assert.equal(preview.suggestionType, suggestionType);
    assert.equal(preview.canPreview, true);
    assert.equal(preview.canExecuteNow, false);
    assert.ok(preview.futureActionSummary.length > 0);
    assert.ok(preview.validationSummary.length > 0);
    if (suggestionType === "create_opportunity") {
      assert.ok(
        preview.blockers.some(
          (blocker) => blocker.code === "execution_requires_ledger_request"
        )
      );
    } else {
      assert.ok(
        preview.blockers.some(
          (blocker) => blocker.code === "execution_not_implemented"
        )
      );
    }
  }
});

void test("GateKeeper execution preview blocks unknown suggestion types", () => {
  const preview = buildGateKeeperExecutionPreview(
    makeSuggestion({
      suggestionType:
        "unknown_future_action" as GateKeeperActionSuggestion["suggestionType"]
    })
  );

  assert.equal(preview.suggestionType, "unknown");
  assert.equal(preview.owner, "none");
  assert.equal(preview.riskTier, "forbidden");
  assert.equal(preview.canPreview, false);
  assert.equal(preview.canExecuteNow, false);
  assert.match(preview.futureActionSummary, /blocked/);
  assert.ok(
    preview.blockers.some(
      (blocker) => blocker.code === "unknown_suggestion_type"
    )
  );
});

void test("GateKeeper execution preview treats proposed payload as display-only", () => {
  const preview = buildGateKeeperExecutionPreview(
    makeSuggestion({
      proposedPayload: {
        customerName: "Pat Sample",
        notes:
          "Customer mentioned moisture concerns and wants a contractor callback before any site visit is confirmed.",
        nested: {
          unsafe: "Do not trust this as canonical input."
        }
      }
    })
  );

  assert.match(preview.payloadTrustMessage, /display-only and untrusted/);
  assert.match(preview.reviewSeparationMessage, /does not execute/);
  assert.deepEqual(
    preview.payloadPreview.map((field) => field.key),
    ["customerName", "notes", "nested"]
  );
  assert.equal(preview.payloadPreview[2]?.value, "{1 field}");
});

void test("GateKeeper payload preview is bounded and conservative", () => {
  const payloadPreview = buildGateKeeperPayloadPreview({
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7"
  });

  assert.equal(payloadPreview.length, 6);
  assert.equal(payloadPreview.at(-1)?.key, "six");
});

void test("GateKeeper execution preview does not import mutation modules or providers", () => {
  assert.doesNotMatch(
    previewSource,
    /from ["']@\/lib\/(opportunities|projects|schedule|jobs|work-items|communications|invoices|contracts)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    previewSource,
    /createOpportunity|updateOpportunity|createProject|createWorkItem|scheduleAppointment|createInvoice|sendEmail|sendSms|executeGateKeeper|execution_validated/i
  );
});

void test("GateKeeper review approval remains separate from execution previews", () => {
  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(
    actionsSource,
    /buildGateKeeperExecutionPreview|execution_validated/i
  );
});
