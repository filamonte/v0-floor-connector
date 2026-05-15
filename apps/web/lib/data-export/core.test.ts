import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildExportRequestContext,
  buildExportFilename,
  buildJsonManifest,
  exportModuleDefinitions,
  getExportModuleDefinition,
  serializeCsv,
  summarizeExportError
} from "./core";

void test("serializes CSV with stable headers and escaped cells", () => {
  const definition = getExportModuleDefinition("customers");

  assert.ok(definition);

  const csv = serializeCsv({
    module: definition,
    rows: [
      {
        customer_id: "cus_1",
        customer_name: 'Acme "North"',
        company_name: "Acme, LLC",
        email: "ops@example.test",
        phone: null
      }
    ]
  });

  assert.match(csv, /^Customer ID,Customer name,Company name,Email,Phone/);
  assert.match(csv, /cus_1,"Acme ""North""","Acme, LLC",ops@example\.test,/);
});

void test("JSON manifest includes export metadata and field definitions", () => {
  const definition = getExportModuleDefinition("projects");

  assert.ok(definition);

  const manifest = buildJsonManifest({
    module: definition,
    organization: {
      id: "org_1",
      displayName: "Floor Co",
      slug: "floor-co"
    },
    exportedAt: "2026-05-15T12:00:00.000Z",
    rows: [{ project_id: "project_1", project_name: "Lobby" }]
  });

  assert.equal(manifest.organization.id, "org_1");
  assert.equal(manifest.module.key, "projects");
  assert.equal(manifest.rowCount, 1);
  assert.ok(manifest.module.fields.some((field) => field.key === "customer_id"));
});

void test("export definitions exclude token, secret, raw provider, and internal cost fields", () => {
  const unsafePattern =
    /token|secret|password|service_role|webhook|checkout_url|payload|gateway_payment_intent|gateway_checkout_session|base_unit_cost|markup|hidden_markup/i;

  for (const definition of exportModuleDefinitions) {
    for (const field of definition.fields) {
      assert.equal(
        unsafePattern.test(`${field.key} ${field.source}`),
        false,
        `${definition.key}.${field.key} should not expose sensitive/internal fields`
      );
    }
  }
});

void test("builds safe filenames from tenant slug and module", () => {
  assert.equal(
    buildExportFilename({
      organizationSlug: "Floor Co! Main",
      moduleKey: "invoices",
      format: "csv",
      exportedAt: "2026-05-15T12:00:00.000Z"
    }),
    "floor-co-main-invoices-2026-05-15.csv"
  );
});

void test("export audit helpers keep request context and errors safe", () => {
  assert.deepEqual(
    buildExportRequestContext({ route: "/settings/export/customers" }),
    {
      source: "settings_export",
      route: "/settings/export/customers"
    }
  );

  const summary = summarizeExportError(
    new Error("Provider failed with sk_test_do_not_log and token=abc123")
  );

  assert.match(summary, /\[redacted-stripe-key\]/);
  assert.match(summary, /token=\[redacted\]/);
  assert.doesNotMatch(summary, /sk_test_do_not_log/);
  assert.doesNotMatch(summary, /abc123/);
});

void test("data export event migration defines tenant-scoped metadata audit table", () => {
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260515204452_data_export_events.sql"
  );
  const migration = fs.readFileSync(migrationPath, "utf8");

  assert.match(migration, /create table if not exists public\.data_export_events/);
  assert.match(migration, /alter table public\.data_export_events force row level security/);
  assert.match(migration, /data_export_events_select_by_admin_scope/);
  assert.match(migration, /data_export_events_insert_by_admin_scope/);
  assert.match(migration, /record_count integer/);
  assert.doesNotMatch(migration, /file_contents|exported_rows|raw_payload/i);
});
