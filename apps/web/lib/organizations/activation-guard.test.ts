import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCTION_ACTION_LOCKED_MESSAGE,
  assertOrganizationStateAllowsProductionAction,
  isOrganizationActivatedForProductionAction
} from "./activation-guard-core";

void test("pending and trial organizations cannot perform production actions", () => {
  assert.equal(
    isOrganizationActivatedForProductionAction({
      tenantStatus: "trialing",
      lifecycleState: "trial"
    }),
    false
  );
  assert.throws(
    () =>
      assertOrganizationStateAllowsProductionAction({
        tenantStatus: "trialing",
        lifecycleState: "trial"
      }),
    new RegExp(PRODUCTION_ACTION_LOCKED_MESSAGE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
});

void test("active organizations can perform production actions", () => {
  assert.equal(
    isOrganizationActivatedForProductionAction({
      tenantStatus: "active",
      lifecycleState: "active"
    }),
    true
  );
  assert.doesNotThrow(() =>
    assertOrganizationStateAllowsProductionAction({
      tenantStatus: "active",
      lifecycleState: "active"
    })
  );
});

void test("status and lifecycle both have to be activated", () => {
  assert.equal(
    isOrganizationActivatedForProductionAction({
      tenantStatus: "active",
      lifecycleState: "trial"
    }),
    false
  );
  assert.equal(
    isOrganizationActivatedForProductionAction({
      tenantStatus: "trialing",
      lifecycleState: "active"
    }),
    false
  );
});
