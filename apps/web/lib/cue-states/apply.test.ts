import assert from "node:assert/strict";
import test from "node:test";

import type { ProjectCue } from "../projects/cues";
import type { OperationalCue } from "../operational-cues/types";
import {
  applyCueStates,
  getCueStateActionSupport,
  getCueStateActionSupportForIdentity
} from "./apply";
import { buildOperationalCueIdentity } from "./identity";
import type { WorkflowCueStateRecord } from "./types";

const companyId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";
const projectId = "44444444-4444-4444-8444-444444444444";
const estimateId = "55555555-5555-4555-8555-555555555555";

function buildOperationalCue(
  overrides: Partial<OperationalCue> = {}
): OperationalCue {
  return {
    cueKey: "estimate_sent_followup",
    subjectType: "estimate",
    subjectId: estimateId,
    projectId,
    organizationId: companyId,
    assignedUserId: null,
    ownerStrategy: "estimator",
    ownerStrategyLabel: "Estimator",
    ownerResolutionStatus: "strategy_only",
    responsibility: {
      strategy: "estimator",
      strategyLabel: "Estimator",
      displayLabel: "Estimator",
      resolutionStatus: "strategy_only",
      personId: null,
      userId: null,
      source: "cue_owner_strategy"
    },
    title: "Follow up on EST-100",
    message: "Estimate was sent and is still awaiting a customer decision.",
    urgency: "high",
    ageDays: 7,
    customerName: "Taylor Customer",
    projectName: "Garage floor",
    actionHref: `/estimates/${estimateId}`,
    actionLabel: "Open estimate",
    reason: "Sent 7 days ago.",
    explanation: "Estimate was sent 7 days ago. This rule triggers after 5 days.",
    sourceLabel: "Estimate sent date",
    sourceValue: "May 4, 2026",
    thresholdLabel: "Rule threshold: 5 days",
    triggeredAtLabel: "Triggered after 7 days",
    ...overrides
  };
}

function buildProjectCue(overrides: Partial<ProjectCue> = {}): ProjectCue {
  return {
    id: `${projectId}:open-blocker-field-notes`,
    projectId,
    projectName: "Garage floor",
    title: "Open blocker field notes need review",
    description:
      "Field blockers are still open on daily logs for this project.",
    href: "/daily-logs/daily-log-1",
    actionLabel: "Open daily log",
    priority: "high",
    reason: "Moisture issue",
    sortOrder: 30,
    ...overrides
  };
}

function state(
  overrides: Partial<WorkflowCueStateRecord> = {}
): WorkflowCueStateRecord {
  const cue = buildOperationalCue();
  const identity = buildOperationalCueIdentity(cue);

  return {
    id: "state-1",
    companyId,
    cueFamily: identity.cueFamily,
    cueKey: identity.cueKey,
    cueVersion: identity.cueVersion,
    cueFingerprint: identity.cueFingerprint,
    subjectType: identity.subjectType,
    subjectId: identity.subjectId,
    projectId: identity.projectId,
    scope: "user",
    userId,
    state: "dismissed",
    snoozedUntil: null,
    dismissedAt: "2026-05-11T12:00:00.000Z",
    resolvedAt: null,
    ...overrides
  };
}

void test("dismissed user state suppresses a matching operational cue", () => {
  const cue = buildOperationalCue();
  const result = applyCueStates({
    cues: [cue],
    states: [state()],
    currentUserId: userId,
    now: new Date("2026-05-12T12:00:00.000Z")
  });

  assert.deepEqual(result.visibleCues, []);
  assert.equal(result.suppressedCues.length, 1);
});

void test("dismissed cue remains visible for another user", () => {
  const cue = buildOperationalCue();
  const result = applyCueStates({
    cues: [cue],
    states: [state({ userId: otherUserId })],
    currentUserId: userId,
    now: new Date("2026-05-12T12:00:00.000Z")
  });

  assert.deepEqual(result.visibleCues, [cue]);
});

void test("dismissed cue reappears when fingerprint changes", () => {
  const cue = buildOperationalCue({
    sourceValue: "May 1, 2026",
    triggeredAtLabel: "Triggered after 10 days"
  });
  const result = applyCueStates({
    cues: [cue],
    states: [state()],
    currentUserId: userId,
    now: new Date("2026-05-12T12:00:00.000Z")
  });

  assert.deepEqual(result.visibleCues, [cue]);
});

void test("snoozed cue suppresses before expiry and reappears after expiry", () => {
  const cue = buildOperationalCue();
  const snoozed = state({
    state: "snoozed",
    dismissedAt: null,
    snoozedUntil: "2026-05-13T12:00:00.000Z"
  });

  assert.equal(
    applyCueStates({
      cues: [cue],
      states: [snoozed],
      currentUserId: userId,
      now: new Date("2026-05-12T12:00:00.000Z")
    }).visibleCues.length,
    0
  );
  assert.equal(
    applyCueStates({
      cues: [cue],
      states: [snoozed],
      currentUserId: userId,
      now: new Date("2026-05-14T12:00:00.000Z")
    }).visibleCues.length,
    1
  );
});

void test("blocker operational cues support snooze but not dismiss", () => {
  assert.deepEqual(
    getCueStateActionSupport(
      buildOperationalCue({
        cueKey: "invoice_overdue",
        subjectType: "invoice",
        subjectId: "66666666-6666-4666-8666-666666666666"
      })
    ),
    { dismiss: false, snooze: true, resolve: false }
  );
});

void test("project human coordination cue supports dismiss and snooze", () => {
  assert.deepEqual(getCueStateActionSupport(buildProjectCue()), {
    dismiss: true,
    snooze: true,
    resolve: false
  });
});

void test("unsupported cues expose no cue-state actions", () => {
  assert.deepEqual(
    getCueStateActionSupportForIdentity({
      cueFamily: "unsupported_family",
      cueKey: "estimate_sent_followup"
    }),
    { dismiss: false, snooze: false, resolve: false }
  );

  assert.deepEqual(
    getCueStateActionSupport(
      buildProjectCue({
        id: `${projectId}:unsupported-project-cue`
      })
    ),
    { dismiss: false, snooze: false, resolve: false }
  );
});
