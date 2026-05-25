#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(
  workspaceRoot,
  "scripts",
  "seed-local-golden-path-demo-data.mjs"
);

const baseArgs = [
  "--organization-id",
  "11111111-1111-4111-8111-111111111111",
  "--owner-user-id",
  "22222222-2222-4222-8222-222222222222",
  "--owner-email",
  "owner@example.test",
  "--portal-customer-email",
  "portal@example.test"
];

const safetyEnvDefaults = {
  APP_ENV: "development",
  NODE_ENV: "test",
  VERCEL_ENV: "development",
  FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE: "",
  STRIPE_SECRET_KEY: "",
  STRIPE_WEBHOOK_SECRET: "",
  POSTMARK_API_TOKEN: "",
  SIGNWELL_API_KEY: "",
  QUICKBOOKS_CLIENT_SECRET: "",
  COMPANYCAM_API_TOKEN: ""
};

function run(args, env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: workspaceRoot,
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      ComSpec: process.env.ComSpec,
      ...safetyEnvDefaults,
      ...env
    },
    encoding: "utf8"
  });
}

function combinedOutput(result) {
  return `${result.stdout}\n${result.stderr}`;
}

{
  const result = run(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /demo:data:seed:local/);
  assert.match(result.stdout, /FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1/);
}

{
  const result = run(["--dry-run"]);
  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /Missing required arguments/);
}

{
  const result = run(["--", "--dry-run", ...baseArgs]);
  assert.equal(result.status, 0);
  assert.match(
    result.stdout,
    /dry-run only; no Supabase connection and no writes/
  );
  assert.match(result.stdout, /Golden Path Demo Project/);
  assert.match(result.stdout, /Golden Path Demo Estimate/);
  assert.doesNotMatch(result.stdout, /service-role/i);
}

{
  const result = run(["--confirm-local-write", ...baseArgs], {
    FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE: ""
  });
  assert.notEqual(result.status, 0);
  assert.match(
    combinedOutput(result),
    /FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1/
  );
}

{
  const result = run(["--confirm-local-write", ...baseArgs], {
    FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE: "1",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "secret-test-service-role"
  });
  assert.notEqual(result.status, 0);
  assert.match(
    combinedOutput(result),
    /not local|staging\/production-looking/i
  );
  assert.doesNotMatch(combinedOutput(result), /secret-test-service-role/);
}

{
  const result = run(
    [
      "--confirm-local-write",
      ...baseArgs,
      "--portal-customer-email",
      "real.customer@gmail.com"
    ],
    {
      FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "secret-test-service-role"
    }
  );
  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /safe non-deliverable demo domain/);
  assert.doesNotMatch(combinedOutput(result), /secret-test-service-role/);
}

{
  const result = run(
    [
      "--confirm-local-write",
      ...baseArgs,
      "--service-role-key-env",
      "TEST_MISSING_SUPABASE_SERVICE_ROLE_KEY"
    ],
    {
      FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321"
    }
  );
  assert.notEqual(result.status, 0);
  assert.match(
    combinedOutput(result),
    /TEST_MISSING_SUPABASE_SERVICE_ROLE_KEY is required/
  );
}

{
  const result = run(["--confirm-local-write", ...baseArgs], {
    FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE: "1",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    SUPABASE_SERVICE_ROLE_KEY: "secret-test-service-role",
    VERCEL_ENV: "production"
  });
  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /VERCEL_ENV is marked production/);
}

console.log("seed-local-golden-path-demo-data tests passed");
