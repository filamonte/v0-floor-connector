import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  buildTemporaryPortalCredentialAppMetadata,
  generateTemporaryPortalPassword,
  shouldRequireTemporaryPortalCredentialChange
} from "./temporary-credentials";

void test("temporary portal password generation returns a one-time value only", () => {
  const password = generateTemporaryPortalPassword();

  assert.equal(typeof password, "string");
  assert.ok(password.length >= 18);
  assert.match(password, /[A-Z]/);
  assert.match(password, /[a-z]/);
  assert.match(password, /[0-9]/);
  assert.match(password, /[^A-Za-z0-9]/);
});

void test("temporary credential metadata stores only safe status fields", () => {
  const metadata: Record<string, unknown> = buildTemporaryPortalCredentialAppMetadata({
    existingAppMetadata: { provider: "email" },
    organizationId: "org-1",
    customerId: "customer-1",
    customerContactId: "contact-1",
    portalAccessGrantId: "grant-1",
    issuedAt: "2026-05-13T12:00:00.000Z"
  });

  assert.equal(metadata.provider, "email");
  assert.equal(metadata.floorconnectorTemporaryPortalCredentialRequired, true);
  assert.equal(metadata.floorconnectorTemporaryPortalCredentialIssuedAt, "2026-05-13T12:00:00.000Z");
  assert.equal(metadata.floorconnectorTemporaryPortalCredentialOrganizationId, "org-1");
  assert.equal(metadata.floorconnectorTemporaryPortalCredentialCustomerId, "customer-1");
  assert.equal(metadata.floorconnectorTemporaryPortalCredentialCustomerContactId, "contact-1");
  assert.equal(metadata.floorconnectorTemporaryPortalCredentialGrantId, "grant-1");
  assert.equal(JSON.stringify(metadata).includes("password"), false);
});

void test("temporary credential change requirement reads only app metadata", () => {
  assert.equal(
    shouldRequireTemporaryPortalCredentialChange({
      app_metadata: {
        floorconnectorTemporaryPortalCredentialRequired: true
      },
      user_metadata: {
        floorconnectorTemporaryPortalCredentialRequired: false
      }
    }),
    true
  );

  assert.equal(
    shouldRequireTemporaryPortalCredentialChange({
      app_metadata: {},
      user_metadata: {
        floorconnectorTemporaryPortalCredentialRequired: true
      }
    }),
    false
  );
});

void test("temporary credential migration stores audit status but no password values", () => {
  const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
  const migrationName = readdirSync(migrationsDirectory).find((name) =>
    name.endsWith("_portal_temporary_credentials.sql")
  );

  assert.ok(migrationName, "Expected a portal temporary credentials migration.");

  const migration = readFileSync(join(migrationsDirectory, migrationName), "utf8");

  assert.match(migration, /temporary_credential_issued_at/);
  assert.match(migration, /temporary_credential_issued_by/);
  assert.match(migration, /temporary_credential_requires_password_change/);
  assert.doesNotMatch(migration, /password\s+text/i);
  assert.doesNotMatch(migration, /temporary_password/i);
  assert.doesNotMatch(migration, /plain/i);
});
