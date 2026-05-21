import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  PlatformPackageDefinition,
  PlatformPackageDefinitionVersion
} from "@floorconnector/types";

import {
  buildPlatformPackageDefinitionCatalog,
  type PlatformPackageDefinitionCatalogInput
} from "./package-definition-catalog-core";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260509132622_platform_package_definitions.sql"
);

function makeDefinition(
  overrides: Partial<PlatformPackageDefinition> = {}
): PlatformPackageDefinition {
  return {
    id: "pkg-1",
    packageKey: "growth",
    displayName: "Growth",
    description: "For growing contractors.",
    status: "published",
    intendedAudience: "Established specialty contractors.",
    segmentSummary: "Commercial and residential teams.",
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z",
    archivedAt: null,
    ...overrides
  };
}

function makeVersion(
  overrides: Partial<PlatformPackageDefinitionVersion> = {}
): PlatformPackageDefinitionVersion {
  return {
    id: "pkg-version-1",
    packageDefinitionId: "pkg-1",
    packageKey: "growth",
    packageDisplayName: "Growth",
    versionNumber: 1,
    versionLabel: "v1",
    status: "published",
    commercialSummary: "Commercial terms are summarized only.",
    moduleVisibilityIntent: { modules: ["projects"] },
    usageLimitIntent: { seats: "future-intent-only" },
    entitlementIntent: { runtime: false },
    billingProviderIntent: { provider: "future" },
    starterPackDefaultIntent: { starterPacks: [] },
    contractorGroupTargetingIntent: { groups: [] },
    publishedSnapshot: { version: 1 },
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z",
    publishedAt: "2026-05-09T12:00:00.000Z",
    deprecatedAt: null,
    archivedAt: null,
    ...overrides
  };
}

function makeInput(
  overrides: Partial<PlatformPackageDefinitionCatalogInput> = {}
): PlatformPackageDefinitionCatalogInput {
  return {
    generatedAt: "2026-05-09T12:00:00.000Z",
    definitions: [makeDefinition()],
    versions: [makeVersion()],
    ...overrides
  };
}

void test("builds read-only package definition catalog summary counts", () => {
  const model = buildPlatformPackageDefinitionCatalog(makeInput());
  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(byId.get("definition-count")?.value, 1);
  assert.equal(byId.get("version-count")?.value, 1);
  assert.equal(byId.get("published-definition-count")?.value, 1);
  assert.equal(byId.get("missing-version-count")?.value, 0);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(model.assignmentBehaviorAvailable, false);
  assert.equal(model.billingBehaviorAvailable, false);
  assert.equal(model.entitlementRuntimeBehaviorAvailable, false);
});

void test("surfaces empty state and no-version caveats", () => {
  const emptyModel = buildPlatformPackageDefinitionCatalog(
    makeInput({ definitions: [], versions: [] })
  );
  const noVersionModel = buildPlatformPackageDefinitionCatalog(
    makeInput({ definitions: [makeDefinition()], versions: [] })
  );

  assert.match(emptyModel.catalogReadiness.join(" "), /No package definitions/);
  assert.match(emptyModel.catalogReadiness.join(" "), /No package definition versions/);
  assert.equal(noVersionModel.definitionRows[0]?.versionCount, 0);
  assert.match(noVersionModel.definitionRows[0]?.caveats.join(" ") ?? "", /No package definition versions/);
});

void test("groups definition and version lifecycle statuses", () => {
  const model = buildPlatformPackageDefinitionCatalog(
    makeInput({
      definitions: [
        makeDefinition({ id: "pkg-1", status: "published" }),
        makeDefinition({ id: "pkg-2", packageKey: "trial", status: "draft" })
      ],
      versions: [
        makeVersion({ id: "version-1", status: "published" }),
        makeVersion({
          id: "version-2",
          packageDefinitionId: "pkg-2",
          packageKey: "trial",
          packageDisplayName: "Trial",
          status: "review"
        })
      ]
    })
  );

  const definitionBuckets = new Map(
    model.definitionStatusBuckets.map((bucket) => [bucket.key, bucket.count])
  );
  const versionBuckets = new Map(
    model.versionStatusBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(definitionBuckets.get("published"), 1);
  assert.equal(definitionBuckets.get("draft"), 1);
  assert.equal(versionBuckets.get("published"), 1);
  assert.equal(versionBuckets.get("review"), 1);
});

void test("output contains no mutation or action fields", () => {
  const model = buildPlatformPackageDefinitionCatalog(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"actionAvailable\""), false);
});

void test("summarizes JSON snapshot assumptions without exposing runtime behavior", () => {
  const model = buildPlatformPackageDefinitionCatalog(makeInput());
  const versionRow = model.versionRows[0];

  assert.ok(versionRow);
  assert.match(versionRow?.intentSummary.join(" "), /Module visibility intent present/);
  assert.match(versionRow?.intentSummary.join(" "), /Published snapshot present/);
  assert.match(model.caveats.join(" "), /operator summaries only/);
  assert.match(model.caveats.join(" "), /not runtime resolvers/);
});

void test("migration constrains package definition schema and keeps tables server-only", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /create table if not exists public\.platform_package_definitions/);
  assert.match(migration, /create table if not exists public\.platform_package_definition_versions/);
  assert.match(migration, /platform_package_definitions_package_key_format/);
  assert.match(migration, /platform_package_definition_versions_number_unique_idx/);
  assert.match(migration, /jsonb_typeof\(module_visibility_intent\) = 'object'/);
  assert.match(migration, /jsonb_typeof\(billing_provider_intent\) = 'object'/);
  assert.match(migration, /alter table public\.platform_package_definitions force row level security/);
  assert.match(migration, /alter table public\.platform_package_definition_versions force row level security/);
  assert.match(migration, /revoke all on table public\.platform_package_definitions from authenticated/);
  assert.match(migration, /revoke all on table public\.platform_package_definition_versions from authenticated/);
  assert.doesNotMatch(migration, /create or replace function/i);
});
