import test from "node:test";
import assert from "node:assert/strict";

import { buildPlatformPackageDefinitionPlanningModel } from "./package-definition-planning-core";

function modelKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(modelKeys);
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => [
    key,
    ...modelKeys(nestedValue)
  ]);
}

void test("package definition planning model is read-only with no runtime enforcement", () => {
  const model = buildPlatformPackageDefinitionPlanningModel();

  assert.equal(model.readOnly, true);
  assert.equal(model.runtimeEnforcement, false);
  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(model.planningOnly, true);
});

void test("future dimensions cover package, billing, entitlement, module, and usage-limit concepts", () => {
  const model = buildPlatformPackageDefinitionPlanningModel();
  const dimensionIds = new Set(model.proposedDimensions.map((dimension) => dimension.id));

  assert.equal(dimensionIds.has("package_definition"), true);
  assert.equal(dimensionIds.has("billing_plan"), true);
  assert.equal(dimensionIds.has("entitlements"), true);
  assert.equal(dimensionIds.has("module_availability"), true);
  assert.equal(dimensionIds.has("usage_limits"), true);
});

void test("contractor groups are classified as segmentation instead of billing", () => {
  const model = buildPlatformPackageDefinitionPlanningModel();
  const contractorGroupDimension = model.proposedDimensions.find(
    (dimension) => dimension.id === "contractor_group_targeting"
  );

  assert.ok(contractorGroupDimension);
  assert.equal(contractorGroupDimension?.classification, "segmentation");
  assert.match(contractorGroupDimension?.currentBoundary ?? "", /not billing plans/);
});

void test("starter packs are classified as onboarding defaults instead of entitlements", () => {
  const model = buildPlatformPackageDefinitionPlanningModel();
  const starterPackDimension = model.proposedDimensions.find(
    (dimension) => dimension.id === "starter_pack_defaults"
  );

  assert.ok(starterPackDimension);
  assert.equal(starterPackDimension?.classification, "onboarding_defaults");
  assert.match(starterPackDimension?.currentBoundary ?? "", /not billing enforcement or entitlement gates/);
});

void test("planning output exposes no mutation or control descriptors", () => {
  const model = buildPlatformPackageDefinitionPlanningModel();
  const keys = new Set(modelKeys(model));

  assert.equal(keys.has("href"), false);
  assert.equal(keys.has("method"), false);
  assert.equal(keys.has("buttonLabel"), false);
  assert.equal(keys.has("formAction"), false);
  assert.equal(keys.has("actionAvailable"), false);
  assert.equal(keys.has("mutationAvailable"), false);
});
