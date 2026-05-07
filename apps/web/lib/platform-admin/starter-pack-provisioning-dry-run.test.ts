import test from "node:test";
import assert from "node:assert/strict";
import type {
  CatalogItem,
  DocumentTemplate,
  PlatformCatalogItemSeed,
  PlatformStarterPack,
  PlatformStarterPackItem,
  PlatformTemplateSeed
} from "@floorconnector/types";

import { buildStarterPackProvisioningDryRun } from "./starter-pack-provisioning-dry-run-core";

const organization = {
  id: "org-1",
  name: "Acme Floors",
  slug: "acme-floors"
};

function makeTemplateSeed(
  overrides: Partial<PlatformTemplateSeed> = {}
): PlatformTemplateSeed {
  return {
    id: "template-seed-1",
    templateType: "estimate",
    seedKey: "residential-estimate",
    name: "Residential Estimate",
    description: null,
    subjectTemplate: null,
    bodyTemplate: "<p>Estimate</p>",
    schemaVersion: 1,
    isDefault: false,
    isActive: true,
    mergeFieldManifest: [],
    metadata: {},
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

function makeCatalogSeed(
  overrides: Partial<PlatformCatalogItemSeed> = {}
): PlatformCatalogItemSeed {
  return {
    id: "catalog-seed-1",
    itemType: "material",
    seedKey: "basecoat",
    name: "Resinous Basecoat",
    description: null,
    internalNotes: null,
    unit: "sq ft",
    defaultUnitCost: "1.00",
    defaultUnitPrice: "2.00",
    markupPercent: "0.00",
    hiddenMarkupPercent: "0.00",
    taxable: true,
    vendorId: null,
    category: "Coatings",
    costCode: null,
    sku: null,
    photoStoragePath: null,
    isActive: true,
    isDefault: false,
    metadata: {},
    sortOrder: 10,
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

function makeTemplate(
  overrides: Partial<DocumentTemplate> = {}
): DocumentTemplate {
  return {
    id: "template-1",
    organizationId: "org-1",
    templateType: "estimate",
    sourceSeedId: null,
    sourceSeedKey: null,
    name: "Residential Estimate",
    description: null,
    subjectTemplate: null,
    bodyTemplate: "<p>Estimate</p>",
    schemaVersion: 1,
    status: "active",
    isDefault: false,
    mergeFieldManifest: [],
    metadata: {},
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

function makeCatalogItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: "catalog-item-1",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "Resinous Basecoat",
    description: null,
    internalNotes: null,
    unit: "sq ft",
    defaultUnitCost: "1.00",
    defaultUnitPrice: "2.00",
    markupPercent: "0.00",
    hiddenMarkupPercent: "0.00",
    taxable: true,
    taxCodeId: null,
    vendorId: null,
    category: "Coatings",
    costCode: null,
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 10,
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

function makePack(input: {
  templateSeed?: PlatformTemplateSeed | null;
  catalogSeed?: PlatformCatalogItemSeed | null;
}): PlatformStarterPack {
  const items: PlatformStarterPackItem[] = [
    {
      id: "pack-item-template-1",
      starterPackId: "pack-1",
      itemType: "template_seed",
      templateSeedId: input.templateSeed?.id ?? "template-seed-1",
      catalogSeedId: null,
      sortOrder: 10,
      isRequired: true,
      templateSeed: input.templateSeed ?? null,
      catalogSeed: null,
      createdAt: "2026-05-06T00:00:00.000Z"
    },
    {
      id: "pack-item-catalog-1",
      starterPackId: "pack-1",
      itemType: "catalog_seed",
      templateSeedId: null,
      catalogSeedId: input.catalogSeed?.id ?? "catalog-seed-1",
      sortOrder: 20,
      isRequired: false,
      templateSeed: null,
      catalogSeed: input.catalogSeed ?? null,
      createdAt: "2026-05-06T00:00:00.000Z"
    }
  ];

  return {
    id: "pack-1",
    packKey: "qa-pack",
    name: "QA Pack",
    description: null,
    status: "published",
    segmentKey: null,
    templateSeedCount: 1,
    catalogSeedCount: 1,
    assignmentCount: 0,
    activeAssignmentCount: 0,
    items,
    assignments: [],
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z"
  };
}

void test("starter-pack provisioning dry run reports template and catalog seeds that would create", () => {
  const report = buildStarterPackProvisioningDryRun({
    organization,
    starterPack: makePack({
      templateSeed: makeTemplateSeed(),
      catalogSeed: makeCatalogSeed()
    }),
    organizationTemplates: [],
    organizationCatalogItems: []
  });

  assert.equal(report.wouldCreateTemplateCount, 1);
  assert.equal(report.wouldCreateCatalogItemCount, 1);
  assert.equal(report.alreadyExistsCount, 0);
  assert.equal(report.rows.every((row) => row.action === "would_create"), true);
  assert.match(report.note, /Dry run only/);
});

void test("starter-pack provisioning dry run detects existing records by source linkage", () => {
  const templateSeed = makeTemplateSeed();
  const catalogSeed = makeCatalogSeed();
  const report = buildStarterPackProvisioningDryRun({
    organization,
    starterPack: makePack({ templateSeed, catalogSeed }),
    organizationTemplates: [
      makeTemplate({
        id: "linked-template",
        sourceSeedId: templateSeed.id,
        sourceSeedKey: templateSeed.seedKey
      })
    ],
    organizationCatalogItems: [
      makeCatalogItem({
        id: "linked-catalog-item",
        sourceSeedId: catalogSeed.id,
        sourceSeedKey: catalogSeed.seedKey
      })
    ]
  });

  assert.equal(report.alreadyExistsCount, 2);
  assert.equal(report.wouldCreateTemplateCount, 0);
  assert.equal(report.wouldCreateCatalogItemCount, 0);
  assert.equal(report.rows[0]?.matchType, "source_linkage");
  assert.equal(report.rows[1]?.matchType, "source_linkage");
});

void test("starter-pack provisioning dry run uses conservative normalized matching when source linkage is absent", () => {
  const report = buildStarterPackProvisioningDryRun({
    organization,
    starterPack: makePack({
      templateSeed: makeTemplateSeed({ name: "Residential   Estimate" }),
      catalogSeed: makeCatalogSeed({ name: "Resinous_Basecoat" })
    }),
    organizationTemplates: [
      makeTemplate({
        id: "matched-template",
        sourceSeedId: null,
        sourceSeedKey: null,
        templateType: "estimate",
        name: "residential estimate"
      })
    ],
    organizationCatalogItems: [
      makeCatalogItem({
        id: "matched-catalog",
        sourceSeedId: null,
        sourceSeedKey: null,
        itemType: "material",
        category: "coatings",
        name: "resinous basecoat"
      })
    ]
  });

  assert.equal(report.alreadyExistsCount, 2);
  assert.equal(report.rows[0]?.matchType, "conservative_normalized");
  assert.equal(report.rows[1]?.matchType, "conservative_normalized");
});

void test("starter-pack provisioning dry run blocks inactive seeds and counts summary", () => {
  const report = buildStarterPackProvisioningDryRun({
    organization,
    starterPack: makePack({
      templateSeed: makeTemplateSeed({ isActive: false }),
      catalogSeed: makeCatalogSeed({ isActive: false })
    }),
    organizationTemplates: [],
    organizationCatalogItems: []
  });

  assert.equal(report.blockedCount, 2);
  assert.equal(report.wouldCreateTemplateCount, 0);
  assert.equal(report.wouldCreateCatalogItemCount, 0);
  assert.equal(report.rows.every((row) => row.action === "blocked"), true);
});

void test("starter-pack provisioning dry run marks missing seed references unavailable", () => {
  const report = buildStarterPackProvisioningDryRun({
    organization,
    starterPack: makePack({
      templateSeed: null,
      catalogSeed: null
    }),
    organizationTemplates: [],
    organizationCatalogItems: []
  });

  assert.equal(report.unavailableCount, 2);
  assert.equal(report.rows.every((row) => row.action === "unavailable"), true);
});
