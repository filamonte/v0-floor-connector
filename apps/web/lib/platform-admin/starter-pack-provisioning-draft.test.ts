import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProvisioningDraftFingerprintPayload,
  buildProvisioningDraftSnapshot,
  mapDryRunRowToProvisioningDraftItem,
  mapDryRunRowsToProvisioningDraftItems
} from "./starter-pack-provisioning-draft-core";
import type {
  StarterPackProvisioningDryRunReport,
  StarterPackProvisioningDryRunRow
} from "./starter-pack-provisioning-dry-run-core";

function makeRow(
  overrides: Partial<StarterPackProvisioningDryRunRow> = {}
): StarterPackProvisioningDryRunRow {
  return {
    starterPackItemId: "pack-item-template-1",
    sourceItemType: "template_seed",
    sourceId: "template-seed-1",
    sourceName: "Residential Estimate",
    destinationType: "document_template",
    action: "would_create",
    reason: "No existing template was found.",
    sourceStatus: "active",
    sourceType: "estimate",
    sourceCategory: null,
    matchingExistingRecordId: null,
    matchType: "none",
    isRequired: true,
    ...overrides
  };
}

function makeReport(
  rows: StarterPackProvisioningDryRunRow[]
): StarterPackProvisioningDryRunReport {
  return {
    organization: {
      id: "org-1",
      name: "Acme Floors",
      slug: "acme-floors"
    },
    starterPack: {
      id: "pack-1",
      packKey: "residential-pack",
      name: "Residential Pack",
      status: "published"
    },
    wouldCreateTemplateCount: rows.filter(
      (row) =>
        row.action === "would_create" &&
        row.destinationType === "document_template"
    ).length,
    wouldCreateCatalogItemCount: rows.filter(
      (row) =>
        row.action === "would_create" && row.destinationType === "catalog_item"
    ).length,
    alreadyExistsCount: rows.filter((row) => row.action === "already_exists")
      .length,
    blockedCount: rows.filter((row) => row.action === "blocked").length,
    unavailableCount: rows.filter((row) => row.action === "unavailable").length,
    rows,
    note: "Dry run only."
  };
}

void test("maps would-create template rows to pending draft template items", () => {
  const item = mapDryRunRowToProvisioningDraftItem(makeRow());

  assert.equal(item.sourceItemType, "template_seed");
  assert.equal(item.sourceTemplateSeedId, "template-seed-1");
  assert.equal(item.sourceCatalogSeedId, null);
  assert.equal(item.destinationRecordType, "document_template");
  assert.equal(item.destinationRecordId, null);
  assert.equal(item.action, "would_create");
  assert.equal(item.status, "pending");
});

void test("maps would-create catalog rows to pending draft catalog items", () => {
  const item = mapDryRunRowToProvisioningDraftItem(
    makeRow({
      starterPackItemId: "pack-item-catalog-1",
      sourceItemType: "catalog_seed",
      sourceId: "catalog-seed-1",
      sourceName: "Resinous Basecoat",
      destinationType: "catalog_item",
      sourceType: "material",
      sourceCategory: "Coatings",
      isRequired: false
    })
  );

  assert.equal(item.sourceItemType, "catalog_seed");
  assert.equal(item.sourceTemplateSeedId, null);
  assert.equal(item.sourceCatalogSeedId, "catalog-seed-1");
  assert.equal(item.destinationRecordType, "catalog_item");
  assert.equal(item.destinationRecordId, null);
  assert.equal(item.action, "would_create");
  assert.equal(item.status, "pending");
});

void test("maps already-existing rows to skipped draft items without destination ids", () => {
  const item = mapDryRunRowToProvisioningDraftItem(
    makeRow({
      action: "already_exists",
      matchingExistingRecordId: "template-1",
      matchType: "source_linkage"
    })
  );

  assert.equal(item.action, "skipped_existing");
  assert.equal(item.status, "skipped");
  assert.equal(item.destinationRecordId, null);
  assert.equal(item.destinationSnapshot.matchingExistingRecordId, "template-1");
});

void test("maps blocked rows to blocked draft items", () => {
  const item = mapDryRunRowToProvisioningDraftItem(
    makeRow({
      action: "blocked",
      sourceStatus: "inactive",
      reason: "Inactive seed."
    })
  );

  assert.equal(item.action, "blocked");
  assert.equal(item.status, "blocked");
  assert.equal(item.destinationRecordId, null);
});

void test("rejects unavailable rows without a source id", () => {
  assert.throws(
    () =>
      mapDryRunRowToProvisioningDraftItem(
        makeRow({
          action: "unavailable",
          sourceId: null,
          sourceStatus: "missing"
        })
      ),
    /source seed id/
  );
});

void test("preserves dry-run summary counts in draft snapshot and fingerprint payload", () => {
  const rows = [
    makeRow(),
    makeRow({
      starterPackItemId: "pack-item-catalog-1",
      sourceItemType: "catalog_seed",
      sourceId: "catalog-seed-1",
      destinationType: "catalog_item",
      sourceCategory: "Coatings"
    }),
    makeRow({
      starterPackItemId: "pack-item-template-2",
      sourceId: "template-seed-2",
      action: "already_exists"
    })
  ];
  const report = makeReport(rows);
  const snapshot = buildProvisioningDraftSnapshot(report);
  const fingerprintPayload = buildProvisioningDraftFingerprintPayload(report);
  const items = mapDryRunRowsToProvisioningDraftItems(rows);

  assert.equal(snapshot.summary.wouldCreateTemplateCount, 1);
  assert.equal(snapshot.summary.wouldCreateCatalogItemCount, 1);
  assert.equal(snapshot.summary.alreadyExistsCount, 1);
  assert.equal(snapshot.summary.rowCount, 3);
  assert.equal(fingerprintPayload.rows.length, 3);
  assert.equal(items.length, 3);
  assert.equal(items.every((item) => item.destinationRecordId === null), true);
});
