import type {
  PlatformStarterPackProvisioningDestinationRecordType,
  PlatformStarterPackProvisioningRunItemAction,
  PlatformStarterPackProvisioningRunItemStatus,
  PlatformStarterPackItemType
} from "@floorconnector/types";

import type {
  StarterPackProvisioningDryRunReport,
  StarterPackProvisioningDryRunRow
} from "./starter-pack-provisioning-dry-run-core";

export type StarterPackProvisioningDraftItemInput = {
  starterPackItemId: string;
  sourceItemType: PlatformStarterPackItemType;
  sourceTemplateSeedId: string | null;
  sourceCatalogSeedId: string | null;
  destinationRecordType: PlatformStarterPackProvisioningDestinationRecordType;
  destinationRecordId: null;
  action: PlatformStarterPackProvisioningRunItemAction;
  status: PlatformStarterPackProvisioningRunItemStatus;
  sourceSnapshot: Record<string, unknown>;
  destinationSnapshot: Record<string, unknown>;
  reason: string;
};

export function buildProvisioningDraftSnapshot(
  report: StarterPackProvisioningDryRunReport
) {
  return {
    generatedAt: new Date().toISOString(),
    organization: report.organization,
    starterPack: report.starterPack,
    summary: {
      wouldCreateTemplateCount: report.wouldCreateTemplateCount,
      wouldCreateCatalogItemCount: report.wouldCreateCatalogItemCount,
      alreadyExistsCount: report.alreadyExistsCount,
      blockedCount: report.blockedCount,
      unavailableCount: report.unavailableCount,
      rowCount: report.rows.length
    },
    rows: report.rows,
    note: report.note
  };
}

export function buildProvisioningDraftFingerprintPayload(
  report: StarterPackProvisioningDryRunReport
) {
  return {
    organizationId: report.organization?.id ?? null,
    starterPackId: report.starterPack?.id ?? null,
    starterPackStatus: report.starterPack?.status ?? null,
    summary: {
      wouldCreateTemplateCount: report.wouldCreateTemplateCount,
      wouldCreateCatalogItemCount: report.wouldCreateCatalogItemCount,
      alreadyExistsCount: report.alreadyExistsCount,
      blockedCount: report.blockedCount,
      unavailableCount: report.unavailableCount
    },
    rows: report.rows.map((row) => ({
      starterPackItemId: row.starterPackItemId,
      sourceItemType: row.sourceItemType,
      sourceId: row.sourceId,
      destinationType: row.destinationType,
      action: row.action,
      sourceStatus: row.sourceStatus,
      matchingExistingRecordId: row.matchingExistingRecordId,
      matchType: row.matchType
    }))
  };
}

export function mapDryRunRowToProvisioningDraftItem(
  row: StarterPackProvisioningDryRunRow
): StarterPackProvisioningDraftItemInput {
  if (!row.sourceId) {
    throw new Error(
      "Unavailable dry-run rows cannot be captured as draft items without a source seed id."
    );
  }

  const sourceTemplateSeedId =
    row.sourceItemType === "template_seed" ? row.sourceId : null;
  const sourceCatalogSeedId =
    row.sourceItemType === "catalog_seed" ? row.sourceId : null;

  let action: PlatformStarterPackProvisioningRunItemAction;
  let status: PlatformStarterPackProvisioningRunItemStatus;

  switch (row.action) {
    case "would_create":
      action = "would_create";
      status = "pending";
      break;
    case "already_exists":
      action = "skipped_existing";
      status = "skipped";
      break;
    case "blocked":
      action = "blocked";
      status = "blocked";
      break;
    case "unavailable":
      action = "blocked";
      status = "blocked";
      break;
    default:
      action = "blocked";
      status = "blocked";
      break;
  }

  return {
    starterPackItemId: row.starterPackItemId,
    sourceItemType: row.sourceItemType,
    sourceTemplateSeedId,
    sourceCatalogSeedId,
    destinationRecordType: row.destinationType,
    destinationRecordId: null,
    action,
    status,
    sourceSnapshot: {
      sourceItemType: row.sourceItemType,
      sourceId: row.sourceId,
      sourceName: row.sourceName,
      sourceStatus: row.sourceStatus,
      sourceType: row.sourceType,
      sourceCategory: row.sourceCategory,
      starterPackItemId: row.starterPackItemId,
      isRequired: row.isRequired
    },
    destinationSnapshot: {
      destinationType: row.destinationType,
      dryRunAction: row.action,
      matchType: row.matchType,
      matchingExistingRecordId: row.matchingExistingRecordId
    },
    reason: row.reason
  };
}

export function mapDryRunRowsToProvisioningDraftItems(
  rows: StarterPackProvisioningDryRunRow[]
) {
  return rows.map(mapDryRunRowToProvisioningDraftItem);
}
