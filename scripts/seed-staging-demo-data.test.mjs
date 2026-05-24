#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(
  workspaceRoot,
  "scripts",
  "seed-staging-demo-data.mjs"
);

const validArgs = [
  "--dry-run",
  "--organization-id",
  "11111111-1111-4111-8111-111111111111",
  "--owner-user-id",
  "22222222-2222-4222-8222-222222222222",
  "--owner-email",
  "owner@example.test",
  "--portal-customer-email",
  "portal@example.test",
  "--environment",
  "staging"
];

const validValidateTargetArgs = [
  "--validate-target",
  "--supabase-url",
  "https://staging-ref.supabase.co",
  "--service-role-key-env",
  "SUPABASE_SERVICE_ROLE_KEY",
  "--organization-id",
  "11111111-1111-4111-8111-111111111111",
  "--owner-user-id",
  "22222222-2222-4222-8222-222222222222",
  "--owner-email",
  "owner@example.test",
  "--portal-customer-email",
  "portal@example.test",
  "--environment",
  "staging"
];

function runSeed(args, env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      ...env
    },
    encoding: "utf8"
  });
}

test("missing required flags exits nonzero", () => {
  const result = runSeed([]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--organization-id is required/);
});

test("valid dry-run exits zero and prints safety plan", () => {
  const result = runSeed(validArgs);
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0);
  assert.match(output, /DRY RUN ONLY/);
  assert.match(output, /no Stripe PaymentIntent creation/);
  assert.match(output, /no invite token generated or printed/);
});

test("invalid UUID exits nonzero", () => {
  const result = runSeed([
    ...validArgs.slice(0, 2),
    "not-a-uuid",
    ...validArgs.slice(3)
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--organization-id must look like a UUID/);
});

test("invalid email exits nonzero", () => {
  const result = runSeed([
    ...validArgs.slice(0, 6),
    "not-an-email",
    ...validArgs.slice(7)
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--owner-email must look like an email address/);
});

test("--execute exits nonzero", () => {
  const result = runSeed([...validArgs, "--execute"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Phase 1 is dry-run only/);
});

test("standalone argument separator is ignored", () => {
  const result = runSeed(["--", ...validArgs]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /DRY RUN ONLY/);
});

test("validate-target missing required inputs exits nonzero", () => {
  const result = runSeed(["--validate-target"]);

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /--supabase-url is required for read-only target validation/
  );
  assert.match(
    result.stderr,
    /--service-role-key-env is required for read-only target validation/
  );
});

test("validate-target production environment exits nonzero", () => {
  const result = runSeed([
    ...validValidateTargetArgs.slice(0, -1),
    "production"
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--environment must be local or staging/);
});

test("validate-target production-like Supabase URL exits nonzero", () => {
  const result = runSeed(
    [
      ...validValidateTargetArgs.slice(0, 2),
      "https://floorconnector-prod.supabase.co",
      ...validValidateTargetArgs.slice(3)
    ],
    {
      SUPABASE_SERVICE_ROLE_KEY: "test-secret-not-printed"
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /production-like Supabase targets/);
});

test("validate-target mock exits zero and prints read-only report without secret", () => {
  const result = runSeed(validValidateTargetArgs, {
    FLOORCONNECTOR_DEMO_SEED_VALIDATE_TARGET_MOCK: "ready",
    SUPABASE_SERVICE_ROLE_KEY: "test-secret-not-printed"
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0);
  assert.match(output, /READ-ONLY TARGET VALIDATION/);
  assert.match(output, /\[PASSED\] table:companies/);
  assert.match(
    output,
    /Service role env var: SUPABASE_SERVICE_ROLE_KEY \(value hidden\)/
  );
  assert.doesNotMatch(output, /test-secret-not-printed/);
});

test("validate-target still refuses execute/write mode", () => {
  const result = runSeed([...validValidateTargetArgs, "--execute"], {
    FLOORCONNECTOR_DEMO_SEED_VALIDATE_TARGET_MOCK: "ready",
    SUPABASE_SERVICE_ROLE_KEY: "test-secret-not-printed"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Phase 1 is dry-run only/);
});

test("valid output includes all dataset group headings", () => {
  const result = runSeed(validArgs);

  assert.equal(result.status, 0);

  for (const heading of [
    "organization/company baseline",
    "people/vendors/crew",
    "customer/contact",
    "portal access/customer linkage assumptions",
    "projects",
    "opportunity/requirements",
    "estimates",
    "contracts",
    "change orders",
    "jobs/schedule/job assignments",
    "daily logs/field notes/execution attachment placeholders",
    "invoices/payments/payment events",
    "communication threads/messages",
    "document delivery/send event placeholders",
    "service tickets/warranty documents",
    "portal access/project access"
  ]) {
    assert.match(result.stdout, new RegExp(escapeRegExp(heading)));
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
