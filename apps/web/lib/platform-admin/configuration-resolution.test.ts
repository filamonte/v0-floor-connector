import test from "node:test";
import assert from "node:assert/strict";

import { buildUserEstimateTemplateResolutionItem } from "./configuration-resolution-core";

const selectedUser = {
  id: "user-1",
  name: "Estimator One",
  email: "estimator@example.com"
};

void test("user estimate-template resolver reports platform default when no organization default or user preference exists", () => {
  const item = buildUserEstimateTemplateResolutionItem({
    hasSelectedOrganization: true,
    selectedUser,
    organizationDefault: null,
    platformDefault: { id: "platform-template", name: "Platform Estimate" },
    preferredTemplate: null
  });

  assert.equal(item.sourceLayer, "platform_default");
  assert.equal(item.sourceId, "platform-template");
  assert.equal(item.isInherited, true);
  assert.equal(item.effectiveValue, "Platform Estimate");
});

void test("user estimate-template resolver reports organization-owned default when no user preference exists", () => {
  const item = buildUserEstimateTemplateResolutionItem({
    hasSelectedOrganization: true,
    selectedUser,
    organizationDefault: { id: "org-template", name: "Company Estimate" },
    platformDefault: { id: "platform-template", name: "Platform Estimate" },
    preferredTemplate: null
  });

  assert.equal(item.sourceLayer, "organization_owned");
  assert.equal(item.sourceId, "org-template");
  assert.equal(item.isInherited, true);
  assert.equal(item.isContractorOwned, true);
  assert.equal(item.effectiveValue, "Company Estimate");
});

void test("user estimate-template resolver reports real user preference when selected", () => {
  const item = buildUserEstimateTemplateResolutionItem({
    hasSelectedOrganization: true,
    selectedUser,
    organizationDefault: { id: "org-template", name: "Company Estimate" },
    platformDefault: { id: "platform-template", name: "Platform Estimate" },
    preferredTemplate: { id: "user-template", name: "My Estimate" }
  });

  assert.equal(item.sourceLayer, "user_preference");
  assert.equal(item.sourceId, "user-template");
  assert.equal(item.isInherited, false);
  assert.equal(item.futureUserOverrideAllowed, true);
  assert.match(item.notes, /personal estimate-template preference/);
});

void test("user estimate-template resolver keeps unselected user layer inspectable but non-mutating", () => {
  const item = buildUserEstimateTemplateResolutionItem({
    hasSelectedOrganization: true,
    selectedUser: null,
    organizationDefault: { id: "org-template", name: "Company Estimate" },
    platformDefault: { id: "platform-template", name: "Platform Estimate" },
    preferredTemplate: null
  });

  assert.equal(item.sourceLayer, "fallback");
  assert.equal(item.sourceId, "org-template");
  assert.match(item.effectiveValue, /Select a user/);
  assert.match(item.notes, /implemented for estimate templates only/);
});
