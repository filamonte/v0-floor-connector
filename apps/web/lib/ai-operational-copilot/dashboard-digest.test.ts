import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveAiOperationalDashboardDigest,
  type AiOperationalDigestSignal
} from "./dashboard-digest";

function signal(
  overrides: Partial<AiOperationalDigestSignal> = {}
): AiOperationalDigestSignal {
  return {
    id: "signal-1",
    category: "needs_attention",
    title: "Review project blocker",
    summary: "Project has a blocker.",
    reason: "Ready Check is blocked.",
    priority: "high",
    href: "/projects/project-1",
    linkedRecordLabel: "Project",
    sourceSignals: ["ProjectPulse", "Ready Check"],
    recommendedNextStep: "Open project",
    draftActionAvailable: false,
    ...overrides
  };
}

void test("dashboard digest returns empty state when no signals are present", () => {
  const digest = deriveAiOperationalDashboardDigest({
    derivedAt: "2026-05-25T12:00:00.000Z",
    signals: []
  });

  assert.equal(digest.attentionCount, 0);
  assert.equal(digest.sections.length, 5);
  assert.match(digest.headlineSummary, /No Copilot digest items/);
});

void test("dashboard digest groups overdue financial items", () => {
  const digest = deriveAiOperationalDashboardDigest({
    derivedAt: "2026-05-25T12:00:00.000Z",
    signals: [
      signal({
        id: "invoice-1",
        category: "financial_follow_up",
        title: "Invoice overdue",
        priority: "critical",
        draftActionAvailable: true,
        draftActionType: "deposit_payment_reminder",
        sourceSignals: ["Invoice", "Payment Trail"]
      })
    ]
  });

  assert.equal(digest.financialFollowUps.length, 1);
  assert.equal(digest.suggestedDraftActions.length, 1);
  assert.equal(digest.urgentItems[0]?.id, "invoice-1");
});

void test("dashboard digest groups unsigned contract and ready-to-schedule items", () => {
  const digest = deriveAiOperationalDashboardDigest({
    derivedAt: "2026-05-25T12:00:00.000Z",
    signals: [
      signal({
        id: "contract-1",
        category: "signature_follow_up",
        title: "Unsigned contract",
        priority: "high",
        draftActionAvailable: true,
        draftActionType: "contract_signature_reminder"
      }),
      signal({
        id: "project-ready-1",
        category: "ready_to_move",
        title: "Ready project needs a job",
        priority: "normal",
        draftActionAvailable: true,
        draftActionType: "scheduling_readiness_coordination"
      })
    ]
  });

  assert.equal(digest.signatureApprovalFollowUps.length, 1);
  assert.equal(digest.schedulingReadinessItems.length, 1);
  assert.equal(digest.suggestedDraftActions.length, 2);
});

void test("dashboard digest groups field blockers and sorts multiple items by urgency", () => {
  const digest = deriveAiOperationalDashboardDigest({
    derivedAt: "2026-05-25T12:00:00.000Z",
    signals: [
      signal({
        id: "ready-1",
        category: "ready_to_move",
        title: "Ready to schedule",
        priority: "normal"
      }),
      signal({
        id: "field-1",
        category: "field_execution_review",
        title: "Field blocker",
        priority: "high",
        draftActionAvailable: true,
        draftActionType: "blocker_escalation_summary"
      }),
      signal({
        id: "invoice-critical",
        category: "financial_follow_up",
        title: "Critical payment issue",
        priority: "critical"
      })
    ]
  });

  assert.equal(digest.fieldExecutionReviewItems[0]?.id, "field-1");
  assert.equal(digest.recommendedActions[0]?.id, "invoice-critical");
  assert.equal(digest.recommendedActions[1]?.id, "field-1");
  assert.equal(digest.attentionCount, 2);
});
