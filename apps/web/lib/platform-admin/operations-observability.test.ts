import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPlatformOperationsObservability,
  type PlatformOperationsObservabilityInput
} from "./operations-observability-core";

function makeInput(
  overrides: Partial<PlatformOperationsObservabilityInput> = {}
): PlatformOperationsObservabilityInput {
  return {
    generatedAt: "2026-05-08T12:00:00.000Z",
    counts: {
      tenantCount: 2,
      contractorGroupMembershipCount: 3,
      starterPackAssignmentIntentCount: 4
    },
    tenantStatusCounts: [
      { status: "active", count: 1 },
      { status: "trialing", count: 1 }
    ],
    workflowErrors: [],
    starterPackRuns: [],
    starterPackAttempts: [],
    contractorGroupAuditEvents: [],
    ...overrides
  };
}

void test("builds summary counts from existing read-only sources", () => {
  const model = buildPlatformOperationsObservability(
    makeInput({
      workflowErrors: [
        {
          id: "err-1",
          organizationId: "org-1",
          organizationLabel: "Acme Floors",
          workflowName: "contract.generate",
          subjectType: "contract",
          safeMessage: "Contract response was incomplete.",
          createdAt: "2026-05-08T11:00:00.000Z"
        }
      ],
      starterPackRuns: [
        {
          id: "run-1",
          starterPackLabel: "Residential Pack",
          organizationLabel: "Acme Floors",
          status: "completed",
          errorMessage: null,
          itemCount: 2,
          destinationRecordCount: 2,
          createdAt: "2026-05-08T10:00:00.000Z",
          updatedAt: "2026-05-08T10:15:00.000Z"
        }
      ]
    })
  );

  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(byId.get("tenants")?.value, 2);
  assert.equal(byId.get("workflow-errors")?.value, 1);
  assert.equal(byId.get("starter-pack-runs")?.value, 1);
  assert.equal(byId.get("group-memberships")?.value, 3);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
});

void test("classifies attention-needed workflow, run, and attempt signals", () => {
  const model = buildPlatformOperationsObservability(
    makeInput({
      workflowErrors: [
        {
          id: "err-1",
          organizationId: "org-1",
          organizationLabel: "Acme Floors",
          workflowName: "estimate.approve",
          subjectType: "estimate",
          safeMessage: "Approval failed safely.",
          createdAt: "2026-05-08T11:00:00.000Z"
        }
      ],
      starterPackRuns: [
        {
          id: "run-1",
          starterPackLabel: "Residential Pack",
          organizationLabel: "Acme Floors",
          status: "failed",
          errorMessage: "Execution failed before tenant writes completed.",
          itemCount: 2,
          destinationRecordCount: 0,
          createdAt: "2026-05-08T10:00:00.000Z",
          updatedAt: "2026-05-08T10:10:00.000Z"
        }
      ],
      starterPackAttempts: [
        {
          id: "attempt-1",
          starterPackLabel: "Residential Pack",
          organizationLabel: "Acme Floors",
          outcome: "blocked",
          reasonCode: "stale_review",
          safeMessage: "Run review is stale.",
          attemptedAt: "2026-05-08T10:30:00.000Z"
        }
      ]
    })
  );

  assert.equal(model.attentionNeeded.length, 3);
  assert.equal(model.attentionNeeded[0]?.severity, "critical");
  assert.ok(model.summaryCards.find((card) => card.id === "attention-needed"));
});

void test("records unavailable source caveats without throwing away other sources", () => {
  const model = buildPlatformOperationsObservability(
    makeInput({
      unavailableSources: {
        workflow_errors:
          "Workflow errors are not available in this environment's read-only model."
      },
      workflowErrors: null
    })
  );

  const source = model.auditSources.find(
    (item) => item.key === "workflow_errors"
  );

  assert.equal(source?.available, false);
  assert.match(source?.caveat ?? "", /not available/);
  assert.equal(model.summaryCards.find((card) => card.id === "tenants")?.value, 2);
});

void test("orders recent activity newest first across sources", () => {
  const model = buildPlatformOperationsObservability(
    makeInput({
      workflowErrors: [
        {
          id: "older-error",
          organizationId: "org-1",
          organizationLabel: "Acme Floors",
          workflowName: "older.workflow",
          subjectType: "estimate",
          safeMessage: "Older error.",
          createdAt: "2026-05-08T09:00:00.000Z"
        }
      ],
      contractorGroupAuditEvents: [
        {
          id: "newer-audit",
          eventType: "organization_assigned",
          contractorGroupLabel: "Residential",
          organizationLabel: "Acme Floors",
          occurredAt: "2026-05-08T11:30:00.000Z"
        }
      ],
      starterPackAttempts: [
        {
          id: "middle-attempt",
          starterPackLabel: "Residential Pack",
          organizationLabel: "Acme Floors",
          outcome: "rejected",
          reasonCode: "wrong_confirmation",
          safeMessage: "Wrong confirmation phrase.",
          attemptedAt: "2026-05-08T10:00:00.000Z"
        }
      ]
    })
  );

  assert.deepEqual(
    model.recentActivity.map((row) => row.id),
    [
      "contractor-group-audit:newer-audit",
      "starter-pack-attempt:middle-attempt",
      "workflow-error:older-error"
    ]
  );
});

void test("output contains no mutation control fields", () => {
  const model = buildPlatformOperationsObservability(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
});

void test("hides unsafe operational details from summary output", () => {
  const model = buildPlatformOperationsObservability(
    makeInput({
      workflowErrors: [
        {
          id: "err-unsafe",
          organizationId: "org-1",
          organizationLabel: "Acme Floors",
          workflowName: "contract.generate",
          subjectType: "contract",
          safeMessage:
            "SQLSTATE 42501 permission denied for table secrets using SUPABASE_SERVICE_ROLE_KEY",
          createdAt: "2026-05-08T11:00:00.000Z"
        }
      ],
      starterPackRuns: [
        {
          id: "run-unsafe",
          starterPackLabel: "Residential Pack",
          organizationLabel: "Acme Floors",
          status: "failed",
          errorMessage: "postgres://user:password@example.com/db stack trace",
          itemCount: 2,
          destinationRecordCount: 0,
          createdAt: "2026-05-08T10:00:00.000Z",
          updatedAt: "2026-05-08T10:10:00.000Z"
        }
      ],
      starterPackAttempts: [
        {
          id: "attempt-unsafe",
          starterPackLabel: "Residential Pack",
          organizationLabel: "Acme Floors",
          outcome: "failed_before_execution",
          reasonCode: "unsafe_payload",
          safeMessage: "api_key token leaked from provider payload",
          attemptedAt: "2026-05-08T10:30:00.000Z"
        }
      ],
      unavailableSources: {
        contractor_group_memberships:
          "PGRST301 relation \"private.contractor_group_memberships\" does not exist"
      }
    })
  );

  const serialized = JSON.stringify(model);

  assert.match(serialized, /Operational detail is hidden/);
  assert.doesNotMatch(serialized, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(serialized, /postgres:\/\//);
  assert.doesNotMatch(serialized, /api_key/);
  assert.doesNotMatch(serialized, /PGRST301/);
});

void test("bounds long operational details in summary output", () => {
  const longMessage = "A".repeat(320);
  const model = buildPlatformOperationsObservability(
    makeInput({
      workflowErrors: [
        {
          id: "err-long",
          organizationId: "org-1",
          organizationLabel: "Acme Floors",
          workflowName: "estimate.approve",
          subjectType: "estimate",
          safeMessage: longMessage,
          createdAt: "2026-05-08T11:00:00.000Z"
        }
      ]
    })
  );

  const row = model.recentActivity.find((item) => item.id === "workflow-error:err-long");

  assert.ok(row);
  assert.equal(row.detail.endsWith("..."), true);
  assert.ok(row.detail.length <= 280);
});
