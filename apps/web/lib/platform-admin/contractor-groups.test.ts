import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  contractorGroupArchiveInputSchema,
  contractorGroupInputSchema,
  contractorGroupMembershipInputSchema,
  contractorGroupMembershipRemoveInputSchema
} from "./schemas";

const migrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260507173254_contractor_groups_foundation.sql"
);

void test("contractor group validation accepts governed segmentation metadata", () => {
  const result = contractorGroupInputSchema.safeParse({
    contractorGroupId: "",
    key: "priority-installers",
    name: "Priority Installers",
    description: "Beta rollout cohort",
    status: "active",
    groupType: "beta"
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.contractorGroupId, null);
    assert.equal(result.data.key, "priority-installers");
    assert.equal(result.data.groupType, "beta");
  }
});

void test("contractor group validation rejects invalid keys and unknown types", () => {
  assert.equal(
    contractorGroupInputSchema.safeParse({
      contractorGroupId: "",
      key: "Priority Installers",
      name: "Priority Installers",
      description: "",
      status: "active",
      groupType: "beta"
    }).success,
    false
  );
  assert.equal(
    contractorGroupInputSchema.safeParse({
      contractorGroupId: "",
      key: "priority-installers",
      name: "Priority Installers",
      description: "",
      status: "active",
      groupType: "tenant_role"
    }).success,
    false
  );
});

void test("contractor group membership validation remains explicit and platform-scoped", () => {
  const groupId = "11111111-1111-4111-8111-111111111111";
  const organizationId = "22222222-2222-4222-8222-222222222222";
  const membershipId = "33333333-3333-4333-8333-333333333333";

  assert.equal(
    contractorGroupMembershipInputSchema.safeParse({
      contractorGroupId: groupId,
      organizationId,
      assignmentSource: "manual",
      notes: "Assigned by platform operator"
    }).success,
    true
  );
  assert.equal(
    contractorGroupArchiveInputSchema.safeParse({
      contractorGroupId: groupId
    }).success,
    true
  );
  assert.equal(
    contractorGroupMembershipRemoveInputSchema.safeParse({
      membershipId
    }).success,
    true
  );
  assert.equal(
    contractorGroupMembershipInputSchema.safeParse({
      contractorGroupId: groupId,
      organizationId,
      assignmentSource: "contractor_role",
      notes: ""
    }).success,
    false
  );
});

void test("contractor group migration hardens RLS and prevents duplicate memberships", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /create table if not exists public\.contractor_groups/);
  assert.match(
    migration,
    /create table if not exists public\.contractor_group_memberships/
  );
  assert.match(
    migration,
    /contractor_group_memberships_group_org_unique_idx[\s\S]+contractor_group_id,\s*organization_id/
  );
  assert.match(migration, /alter table public\.contractor_groups force row level security/);
  assert.match(
    migration,
    /alter table public\.contractor_group_memberships force row level security/
  );
  assert.match(migration, /revoke all on table public\.contractor_groups from anon, authenticated/);
  assert.match(
    migration,
    /revoke all on table public\.contractor_group_memberships from anon, authenticated/
  );
});
