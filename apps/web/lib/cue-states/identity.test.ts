import assert from "node:assert/strict";
import test from "node:test";

import type { ProjectCue } from "../projects/cues";
import type { OperationalCue } from "../operational-cues/types";
import {
  buildOperationalCueIdentity,
  buildProjectCueIdentity
} from "./identity";

const companyId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const estimateId = "33333333-3333-4333-8333-333333333333";

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
    id: `${projectId}:ready-unscheduled-jobs`,
    projectId,
    projectName: "Garage floor",
    title: "Ready project needs scheduling",
    description:
      "Readiness is clear, but one or more canonical jobs still need schedule placement.",
    href: `/schedule?projectId=${projectId}&view=unscheduled&action=schedule`,
    actionLabel: "Open scheduling",
    priority: "medium",
    reason: "Project is ready to schedule and one canonical job remains unscheduled.",
    sortOrder: 50,
    ...overrides
  };
}

void test("operational cue identity is stable for the same material cue", () => {
  const cue = buildOperationalCue();

  assert.deepEqual(buildOperationalCueIdentity(cue), buildOperationalCueIdentity(cue));
});

void test("operational cue fingerprint changes when material evidence changes", () => {
  const original = buildOperationalCue({
    sourceValue: "May 4, 2026",
    triggeredAtLabel: "Triggered after 7 days"
  });
  const changed = buildOperationalCue({
    sourceValue: "May 1, 2026",
    triggeredAtLabel: "Triggered after 10 days"
  });

  assert.notEqual(
    buildOperationalCueIdentity(original).cueFingerprint,
    buildOperationalCueIdentity(changed).cueFingerprint
  );
});

void test("operational cue fingerprint ignores display title-only changes", () => {
  const original = buildOperationalCue({
    title: "Follow up on EST-100"
  });
  const renamed = buildOperationalCue({
    title: "Estimate follow-up"
  });

  assert.equal(
    buildOperationalCueIdentity(original).cueFingerprint,
    buildOperationalCueIdentity(renamed).cueFingerprint
  );
});

void test("cue version participates in the fingerprint", () => {
  const cue = buildOperationalCue();

  assert.notEqual(
    buildOperationalCueIdentity(cue, { cueVersion: 1 }).cueFingerprint,
    buildOperationalCueIdentity(cue, { cueVersion: 2 }).cueFingerprint
  );
});

void test("project guidance cue identity normalizes supported project cue keys", () => {
  const identity = buildProjectCueIdentity(companyId, buildProjectCue());

  assert.equal(identity.companyId, companyId);
  assert.equal(identity.cueFamily, "project_guidance");
  assert.equal(identity.cueKey, "ready-unscheduled-jobs");
  assert.equal(identity.subjectType, "project");
  assert.equal(identity.subjectId, projectId);
  assert.equal(identity.projectId, projectId);
});

void test("project guidance fingerprint changes when material reason changes", () => {
  const oneJob = buildProjectCue({
    reason: "Project is ready to schedule and one canonical job remains unscheduled."
  });
  const twoJobs = buildProjectCue({
    reason: "Project is ready to schedule and 2 canonical jobs remain unscheduled."
  });

  assert.notEqual(
    buildProjectCueIdentity(companyId, oneJob).cueFingerprint,
    buildProjectCueIdentity(companyId, twoJobs).cueFingerprint
  );
});
