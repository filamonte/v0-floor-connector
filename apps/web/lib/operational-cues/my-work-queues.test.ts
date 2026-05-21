import { strict as assert } from "node:assert";
import test from "node:test";

import type { OperationalCue } from "./types";
import type { OperationalCueResponsibilityResolutionStatus } from "./responsibility";
import { buildMyWorkQueueModes } from "./my-work-queues";

function makeCue(
  id: string,
  resolutionStatus: OperationalCueResponsibilityResolutionStatus,
  overrides: {
    userId?: string | null;
    personId?: string | null;
  } = {}
): OperationalCue {
  return {
    cueKey: "estimate_sent_followup",
    subjectType: "estimate",
    subjectId: id,
    projectId: "project-1",
    organizationId: "organization-1",
    assignedUserId: overrides.userId ?? null,
    ownerStrategy: "estimator",
    ownerStrategyLabel: "Estimator",
    ownerResolutionStatus:
      resolutionStatus === "organization_queue"
        ? "organization_queue"
        : resolutionStatus === "record_owner_unavailable"
          ? "fallback_only"
          : "strategy_only",
    responsibility: {
      strategy: "estimator",
      strategyLabel: "Estimator",
      resolutionStatus,
      displayLabel: "Estimator",
      personId: overrides.personId ?? null,
      userId: overrides.userId ?? null,
      source: "test"
    },
    title: `Cue ${id}`,
    message: "Cue message",
    urgency: "normal",
    ageDays: 2,
    customerName: "Customer",
    projectName: "Project",
    actionHref: `/estimates/${id}`,
    actionLabel: "Open estimate",
    reason: "Reason",
    explanation: "Explanation",
    sourceLabel: "Estimate sent date",
    sourceValue: "May 1, 2026",
    thresholdLabel: "Rule threshold: 2 days",
    triggeredAtLabel: "Triggered after 2 days"
  };
}

void test("Company includes all derived cues", () => {
  const cues = [
    makeCue("cue-1", "user_resolved", { userId: "user-1", personId: "person-1" }),
    makeCue("cue-2", "strategy_only"),
    makeCue("cue-3", "organization_queue")
  ];

  const result = buildMyWorkQueueModes({
    cues,
    currentUserId: "user-1",
    currentPersonId: "person-1",
    membershipRole: "owner"
  });

  assert.deepEqual(
    result.queues.company.cues.map((cue) => cue.subjectId),
    ["cue-1", "cue-2", "cue-3"]
  );
  assert.equal(result.counts.company, 3);
});

void test("Mine includes cues resolved to the current user id", () => {
  const result = buildMyWorkQueueModes({
    cues: [
      makeCue("mine", "user_resolved", { userId: "user-1", personId: "person-1" }),
      makeCue("other", "user_resolved", { userId: "user-2", personId: "person-2" })
    ],
    currentUserId: "user-1",
    currentPersonId: null,
    membershipRole: "member"
  });

  assert.deepEqual(
    result.queues.mine.cues.map((cue) => cue.subjectId),
    ["mine"]
  );
});

void test("Mine includes cues resolved to the current linked person id", () => {
  const result = buildMyWorkQueueModes({
    cues: [
      makeCue("person-match", "person_resolved", { personId: "person-1" }),
      makeCue("person-other", "person_resolved", { personId: "person-2" })
    ],
    currentUserId: "user-1",
    currentPersonId: "person-1",
    membershipRole: "manager"
  });

  assert.deepEqual(
    result.queues.mine.cues.map((cue) => cue.subjectId),
    ["person-match"]
  );
});

void test("Mine excludes cues resolved to other users and people", () => {
  const result = buildMyWorkQueueModes({
    cues: [
      makeCue("other-user", "user_resolved", {
        userId: "user-2",
        personId: "person-2"
      }),
      makeCue("other-person", "person_resolved", { personId: "person-3" }),
      makeCue("unresolved", "strategy_only")
    ],
    currentUserId: "user-1",
    currentPersonId: "person-1",
    membershipRole: "admin"
  });

  assert.equal(result.queues.mine.cues.length, 0);
  assert.equal(result.caveats.noMineItems, true);
});

void test("Unresolved includes strategy, organization queue, and record-owner fallbacks", () => {
  const result = buildMyWorkQueueModes({
    cues: [
      makeCue("strategy", "strategy_only"),
      makeCue("organization", "organization_queue"),
      makeCue("record-owner", "record_owner_unavailable"),
      makeCue("resolved", "user_resolved", {
        userId: "user-1",
        personId: "person-1"
      })
    ],
    currentUserId: "user-1",
    currentPersonId: "person-1",
    membershipRole: "owner"
  });

  assert.deepEqual(
    result.queues.unresolved.cues.map((cue) => cue.subjectId),
    ["strategy", "organization", "record-owner"]
  );
  assert.equal(result.counts.unresolved, 3);
  assert.equal(result.caveats.unresolvedItemsPresent, true);
});

void test("Unresolved cues remain in Company", () => {
  const result = buildMyWorkQueueModes({
    cues: [makeCue("strategy", "strategy_only")],
    currentUserId: "user-1",
    currentPersonId: "person-1",
    membershipRole: "owner"
  });

  assert.deepEqual(
    result.queues.company.cues.map((cue) => cue.subjectId),
    ["strategy"]
  );
  assert.deepEqual(
    result.queues.unresolved.cues.map((cue) => cue.subjectId),
    ["strategy"]
  );
});

void test("user without linked person gets a clean Mine caveat", () => {
  const result = buildMyWorkQueueModes({
    cues: [makeCue("person-only", "person_resolved", { personId: "person-1" })],
    currentUserId: "user-1",
    currentPersonId: null,
    membershipRole: "member"
  });

  assert.equal(result.caveats.noLinkedPerson, true);
  assert.equal(result.caveats.noMineItems, true);
  assert.equal(result.counts.mine, 0);
});

void test("default mode is Company for owner, admin, and manager", () => {
  for (const membershipRole of ["owner", "admin", "manager"] as const) {
    const result = buildMyWorkQueueModes({
      cues: [],
      currentUserId: "user-1",
      currentPersonId: "person-1",
      membershipRole
    });

    assert.equal(result.selectedDefaultMode, "company");
  }
});

void test("default mode is Mine for member", () => {
  const result = buildMyWorkQueueModes({
    cues: [],
    currentUserId: "user-1",
    currentPersonId: "person-1",
    membershipRole: "member"
  });

  assert.equal(result.selectedDefaultMode, "mine");
});
