import assert from "node:assert/strict";
import test from "node:test";

import {
  operationalCueOwnerStrategies,
  starterOperationalCueOwnerStrategies
} from "./owner-strategies";
import { resolveOperationalCueResponsibility } from "./responsibility";

void test("resolves starter owner strategies to role-level responsibility", () => {
  const expectedLabels = {
    estimator: "Estimator",
    project_manager: "Project manager",
    billing_owner: "Billing owner",
    scheduler: "Scheduler"
  } as const;

  for (const strategy of starterOperationalCueOwnerStrategies) {
    const responsibility = resolveOperationalCueResponsibility({
      ownerStrategy: strategy
    });

    assert.equal(responsibility.strategy, strategy);
    assert.equal(responsibility.strategyLabel, expectedLabels[strategy]);
    assert.equal(responsibility.displayLabel, expectedLabels[strategy]);
    assert.equal(responsibility.resolutionStatus, "strategy_only");
    assert.equal(responsibility.personId, null);
    assert.equal(responsibility.userId, null);
    assert.equal(responsibility.source, "cue_owner_strategy");
  }
});

void test("resolves organization strategy to the organization queue", () => {
  const responsibility = resolveOperationalCueResponsibility({
    ownerStrategy: "organization"
  });

  assert.deepEqual(responsibility, {
    strategy: "organization",
    strategyLabel: "Organization queue",
    resolutionStatus: "organization_queue",
    displayLabel: "Organization queue",
    personId: null,
    userId: null,
    source: "organization_cue_rule"
  });
});

void test("resolves starter strategies to organization responsibility default people", () => {
  const responsibility = resolveOperationalCueResponsibility({
    ownerStrategy: "billing_owner",
    responsibilityDefaults: [
      {
        roleKey: "billing_owner",
        personId: "person-1",
        personDisplayName: "Jane Billing",
        membershipUserId: null,
        isActive: true,
        isAssignable: true
      }
    ]
  });

  assert.equal(responsibility.strategy, "billing_owner");
  assert.equal(responsibility.strategyLabel, "Billing owner");
  assert.equal(responsibility.displayLabel, "Jane Billing");
  assert.equal(responsibility.resolutionStatus, "person_resolved");
  assert.equal(responsibility.personId, "person-1");
  assert.equal(responsibility.userId, null);
  assert.equal(responsibility.source, "organization_responsibility_default");
});

void test("includes linked user id when the responsible person has an app user", () => {
  const responsibility = resolveOperationalCueResponsibility({
    ownerStrategy: "scheduler",
    responsibilityDefaults: [
      {
        roleKey: "scheduler",
        personId: "person-2",
        personDisplayName: "Sam Scheduler",
        membershipUserId: "user-2",
        isActive: true,
        isAssignable: true
      }
    ]
  });

  assert.equal(responsibility.resolutionStatus, "user_resolved");
  assert.equal(responsibility.displayLabel, "Sam Scheduler");
  assert.equal(responsibility.personId, "person-2");
  assert.equal(responsibility.userId, "user-2");
});

void test("ignores inactive or unassignable responsibility defaults", () => {
  for (const defaultRole of [
    {
      roleKey: "estimator" as const,
      personId: "inactive-person",
      personDisplayName: "Inactive Person",
      membershipUserId: "user-1",
      isActive: false,
      isAssignable: true
    },
    {
      roleKey: "estimator" as const,
      personId: "unassignable-person",
      personDisplayName: "Unassignable Person",
      membershipUserId: "user-1",
      isActive: true,
      isAssignable: false
    }
  ]) {
    const responsibility = resolveOperationalCueResponsibility({
      ownerStrategy: "estimator",
      responsibilityDefaults: [defaultRole]
    });

    assert.equal(responsibility.resolutionStatus, "strategy_only");
    assert.equal(responsibility.displayLabel, "Estimator");
    assert.equal(responsibility.personId, null);
    assert.equal(responsibility.userId, null);
  }
});

void test("resolves legacy record owner strategy to unavailable fallback", () => {
  const responsibility = resolveOperationalCueResponsibility({
    ownerStrategy: "record_owner"
  });

  assert.deepEqual(responsibility, {
    strategy: "record_owner",
    strategyLabel: "Record owner",
    resolutionStatus: "record_owner_unavailable",
    displayLabel: "Record owner unavailable",
    personId: null,
    userId: null,
    source: "record_owner_fallback"
  });
});

void test("falls back safely for missing or unknown owner strategies", () => {
  for (const ownerStrategy of [null, undefined, "sales_owner", "field_lead"]) {
    const responsibility = resolveOperationalCueResponsibility({ ownerStrategy });

    assert.equal(responsibility.strategy, "organization");
    assert.equal(responsibility.resolutionStatus, "organization_queue");
    assert.equal(responsibility.displayLabel, "Organization queue");
  }
});

void test("keeps unsupported owner roles out of the strategy list", () => {
  assert.equal(operationalCueOwnerStrategies.includes("sales_owner" as never), false);
  assert.equal(operationalCueOwnerStrategies.includes("field_lead" as never), false);
});
