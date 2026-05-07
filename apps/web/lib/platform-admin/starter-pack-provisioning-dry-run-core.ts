import type {
  CatalogItem,
  DocumentTemplate,
  PlatformCatalogItemSeed,
  PlatformStarterPack,
  PlatformStarterPackItem,
  PlatformTemplateSeed
} from "@floorconnector/types";

export type StarterPackProvisioningDryRunAction =
  | "would_create"
  | "already_exists"
  | "blocked"
  | "unavailable";

export type StarterPackProvisioningDryRunDestinationType =
  | "document_template"
  | "catalog_item";

export type StarterPackProvisioningDryRunMatchType =
  | "none"
  | "source_linkage"
  | "conservative_normalized";

export type StarterPackProvisioningDryRunOrganization = {
  id: string;
  name: string;
  slug: string;
};

export type StarterPackProvisioningDryRunRow = {
  starterPackItemId: string;
  sourceItemType: PlatformStarterPackItem["itemType"];
  sourceId: string | null;
  sourceName: string;
  destinationType: StarterPackProvisioningDryRunDestinationType;
  action: StarterPackProvisioningDryRunAction;
  reason: string;
  sourceStatus: "active" | "inactive" | "missing";
  sourceType: string;
  sourceCategory: string | null;
  matchingExistingRecordId: string | null;
  matchType: StarterPackProvisioningDryRunMatchType;
  isRequired: boolean;
};

export type StarterPackProvisioningDryRunReport = {
  organization: StarterPackProvisioningDryRunOrganization | null;
  starterPack: Pick<
    PlatformStarterPack,
    "id" | "packKey" | "name" | "status"
  > | null;
  wouldCreateTemplateCount: number;
  wouldCreateCatalogItemCount: number;
  alreadyExistsCount: number;
  blockedCount: number;
  unavailableCount: number;
  rows: StarterPackProvisioningDryRunRow[];
  note: string;
};

function normalizeComparable(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[\s_-]+/g, " ") ?? "";
}

function hasSourceLinkage(record: {
  sourceSeedId: string | null;
  sourceSeedKey: string | null;
}) {
  return Boolean(record.sourceSeedId || record.sourceSeedKey);
}

function findTemplateSourceLinkageMatch(
  seed: PlatformTemplateSeed,
  templates: DocumentTemplate[]
) {
  return (
    templates.find(
      (template) =>
        template.sourceSeedId === seed.id ||
        (seed.seedKey.length > 0 && template.sourceSeedKey === seed.seedKey)
    ) ?? null
  );
}

function findTemplateConservativeMatch(
  seed: PlatformTemplateSeed,
  templates: DocumentTemplate[]
) {
  const normalizedName = normalizeComparable(seed.name);

  return (
    templates.find(
      (template) =>
        !hasSourceLinkage(template) &&
        template.templateType === seed.templateType &&
        normalizeComparable(template.name) === normalizedName
    ) ?? null
  );
}

function findCatalogSourceLinkageMatch(
  seed: PlatformCatalogItemSeed,
  items: CatalogItem[]
) {
  return (
    items.find(
      (item) =>
        item.sourceSeedId === seed.id ||
        (seed.seedKey.length > 0 && item.sourceSeedKey === seed.seedKey)
    ) ?? null
  );
}

function findCatalogConservativeMatch(
  seed: PlatformCatalogItemSeed,
  items: CatalogItem[]
) {
  const normalizedName = normalizeComparable(seed.name);
  const normalizedCategory = normalizeComparable(seed.category);

  return (
    items.find(
      (item) =>
        !hasSourceLinkage(item) &&
        item.itemType === seed.itemType &&
        normalizeComparable(item.name) === normalizedName &&
        normalizeComparable(item.category) === normalizedCategory
    ) ?? null
  );
}

function buildUnavailableRow(
  item: PlatformStarterPackItem,
  destinationType: StarterPackProvisioningDryRunDestinationType,
  reason: string
): StarterPackProvisioningDryRunRow {
  return {
    starterPackItemId: item.id,
    sourceItemType: item.itemType,
    sourceId: item.templateSeedId ?? item.catalogSeedId,
    sourceName: "Missing platform seed",
    destinationType,
    action: "unavailable",
    reason,
    sourceStatus: "missing",
    sourceType: item.itemType,
    sourceCategory: null,
    matchingExistingRecordId: null,
    matchType: "none",
    isRequired: item.isRequired
  };
}

function explainTemplateItem(input: {
  item: PlatformStarterPackItem;
  seed: PlatformTemplateSeed | null;
  organizationTemplates: DocumentTemplate[];
}): StarterPackProvisioningDryRunRow {
  const { item, seed, organizationTemplates } = input;

  if (!seed) {
    return buildUnavailableRow(
      item,
      "document_template",
      "This starter-pack item references a platform template seed that could not be loaded."
    );
  }

  const base = {
    starterPackItemId: item.id,
    sourceItemType: item.itemType,
    sourceId: seed.id,
    sourceName: seed.name,
    destinationType: "document_template" as const,
    sourceStatus: seed.isActive ? ("active" as const) : ("inactive" as const),
    sourceType: seed.templateType,
    sourceCategory: null,
    isRequired: item.isRequired
  };

  if (!seed.isActive) {
    return {
      ...base,
      action: "blocked",
      reason:
        "This platform template seed is inactive, so a future provisioning run should not create a contractor-owned copy from it.",
      matchingExistingRecordId: null,
      matchType: "none"
    };
  }

  const sourceLinkageMatch = findTemplateSourceLinkageMatch(
    seed,
    organizationTemplates
  );

  if (sourceLinkageMatch) {
    return {
      ...base,
      action: "already_exists",
      reason:
        "An organization-owned document template already links back to this platform template seed.",
      matchingExistingRecordId: sourceLinkageMatch.id,
      matchType: "source_linkage"
    };
  }

  const conservativeMatch = findTemplateConservativeMatch(
    seed,
    organizationTemplates
  );

  if (conservativeMatch) {
    return {
      ...base,
      action: "already_exists",
      reason:
        "No source-seed linkage exists, but an organization-owned template has the same template type and normalized name.",
      matchingExistingRecordId: conservativeMatch.id,
      matchType: "conservative_normalized"
    };
  }

  return {
    ...base,
    action: "would_create",
    reason:
      "No linked or conservative matching organization-owned template was found. A future approved provisioning run would create a document template copy.",
    matchingExistingRecordId: null,
    matchType: "none"
  };
}

function explainCatalogItem(input: {
  item: PlatformStarterPackItem;
  seed: PlatformCatalogItemSeed | null;
  organizationCatalogItems: CatalogItem[];
}): StarterPackProvisioningDryRunRow {
  const { item, seed, organizationCatalogItems } = input;

  if (!seed) {
    return buildUnavailableRow(
      item,
      "catalog_item",
      "This starter-pack item references a platform catalog seed that could not be loaded."
    );
  }

  const base = {
    starterPackItemId: item.id,
    sourceItemType: item.itemType,
    sourceId: seed.id,
    sourceName: seed.name,
    destinationType: "catalog_item" as const,
    sourceStatus: seed.isActive ? ("active" as const) : ("inactive" as const),
    sourceType: seed.itemType,
    sourceCategory: seed.category,
    isRequired: item.isRequired
  };

  if (!seed.isActive) {
    return {
      ...base,
      action: "blocked",
      reason:
        "This platform catalog seed is inactive, so a future provisioning run should not create a contractor-owned catalog item from it.",
      matchingExistingRecordId: null,
      matchType: "none"
    };
  }

  const sourceLinkageMatch = findCatalogSourceLinkageMatch(
    seed,
    organizationCatalogItems
  );

  if (sourceLinkageMatch) {
    return {
      ...base,
      action: "already_exists",
      reason:
        "An organization-owned catalog item already links back to this platform catalog seed.",
      matchingExistingRecordId: sourceLinkageMatch.id,
      matchType: "source_linkage"
    };
  }

  const conservativeMatch = findCatalogConservativeMatch(
    seed,
    organizationCatalogItems
  );

  if (conservativeMatch) {
    return {
      ...base,
      action: "already_exists",
      reason:
        "No source-seed linkage exists, but an organization-owned catalog item has the same item type, category, and normalized name.",
      matchingExistingRecordId: conservativeMatch.id,
      matchType: "conservative_normalized"
    };
  }

  return {
    ...base,
    action: "would_create",
    reason:
      "No linked or conservative matching organization-owned catalog item was found. A future approved provisioning run would create a catalog item copy.",
    matchingExistingRecordId: null,
    matchType: "none"
  };
}

export function buildStarterPackProvisioningDryRun(input: {
  organization: StarterPackProvisioningDryRunOrganization | null;
  starterPack: PlatformStarterPack | null;
  organizationTemplates: DocumentTemplate[];
  organizationCatalogItems: CatalogItem[];
}): StarterPackProvisioningDryRunReport {
  const rows =
    input.starterPack?.items.map((item) =>
      item.itemType === "template_seed"
        ? explainTemplateItem({
            item,
            seed: item.templateSeed,
            organizationTemplates: input.organizationTemplates
          })
        : explainCatalogItem({
            item,
            seed: item.catalogSeed,
            organizationCatalogItems: input.organizationCatalogItems
          })
    ) ?? [];

  return {
    organization: input.organization,
    starterPack: input.starterPack
      ? {
          id: input.starterPack.id,
          packKey: input.starterPack.packKey,
          name: input.starterPack.name,
          status: input.starterPack.status
        }
      : null,
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
    note:
      "Dry run only. This read model inspects starter-pack seeds and organization-owned records, but it does not create, update, or provision contractor-owned data."
  };
}
