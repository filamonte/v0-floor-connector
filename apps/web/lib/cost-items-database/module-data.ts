import "server-only";

import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import {
  getInventoryFeatureState,
  isInventoryEnabled
} from "@/lib/organizations/module-settings";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import {
  listCatalogItemFiles,
  listCatalogItems,
  listInventoryItems,
  listInventoryTransactions,
  listPlatformCatalogItemSeedsForOrganization,
  listTaxCodes,
  requireCatalogScope
} from "@/lib/catalogs/data";
import { listEstimateContentBlocks } from "@/lib/estimate-content-blocks/data";
import { listVendors } from "@/lib/vendors/data";

export async function getCostItemsModuleScope(next = "/cost-items-database") {
  const scope = await requireCatalogScope(next);
  const inventoryEnabled = await isInventoryEnabled(scope.organizationId);

  return {
    ...scope,
    inventoryEnabled
  };
}

export async function getCostItemsManagerData(next = "/cost-items-database/items") {
  const scope = await getCostItemsModuleScope(next);
  const [items, platformSeeds, vendors, contentBlocks] = await Promise.all([
    listCatalogItems(),
    listPlatformCatalogItemSeedsForOrganization(),
    listVendors(),
    listEstimateContentBlocks()
  ]);
  const [taxCodes, inventoryItems, inventoryTransactions, fileEntries] = await Promise.all([
    listTaxCodes(),
    listInventoryItems(),
    listInventoryTransactions(),
    Promise.all(items.map(async (item) => [item.id, await listCatalogItemFiles(item.id, next)] as const))
  ]);

  return {
    ...scope,
    items,
    platformSeeds,
    vendors,
    contentBlocks,
    taxCodes,
    inventoryItems,
    inventoryTransactions,
    catalogItemFilesById: Object.fromEntries(fileEntries)
  };
}

export async function getCostItemsSettingsData(next = "/cost-items-database/settings") {
  const scope = await requireOrganizationAdminScope(next);
  const [financialSettings, catalogItems, inventoryState, taxCodes, platformSeeds] =
    await Promise.all([
    getOrganizationFinancialSettings(scope.organizationId),
    listCatalogItems(),
    getInventoryFeatureState(scope.organizationId),
    listTaxCodes(),
    listPlatformCatalogItemSeedsForOrganization()
  ]);

  return {
    scope,
    financialSettings,
    catalogItems,
    inventoryState,
    taxCodes,
    platformSeeds
  };
}
