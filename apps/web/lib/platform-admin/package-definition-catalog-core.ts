import type {
  PlatformPackageDefinition,
  PlatformPackageDefinitionStatus,
  PlatformPackageDefinitionVersion
} from "@floorconnector/types";

export type PlatformPackageDefinitionCatalogTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type PlatformPackageDefinitionCatalogBucket = {
  key: string;
  label: string;
  count: number;
  description: string;
};

export type PlatformPackageDefinitionCatalogSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: PlatformPackageDefinitionCatalogTone;
  description: string;
};

export type PlatformPackageDefinitionCatalogRow = {
  id: string;
  packageKey: string;
  displayName: string;
  description: string;
  status: PlatformPackageDefinitionStatus;
  intendedAudience: string;
  segmentSummary: string;
  versionCount: number;
  publishedVersionCount: number;
  latestVersionLabel: string;
  caveats: string[];
};

export type PlatformPackageDefinitionVersionRow = {
  id: string;
  packageDefinitionId: string;
  packageLabel: string;
  packageKey: string;
  versionLabel: string;
  status: PlatformPackageDefinitionStatus;
  commercialSummary: string;
  intentSummary: string[];
  caveats: string[];
};

export type PlatformPackageDefinitionCatalogInput = {
  generatedAt: string;
  definitions: PlatformPackageDefinition[];
  versions: PlatformPackageDefinitionVersion[];
  unavailableSources?: {
    definitions?: string;
    versions?: string;
  };
};

export type PlatformPackageDefinitionCatalogModel = {
  generatedAt: string;
  readOnly: true;
  mutationControlsAvailable: false;
  assignmentBehaviorAvailable: false;
  billingBehaviorAvailable: false;
  entitlementRuntimeBehaviorAvailable: false;
  summaryCards: PlatformPackageDefinitionCatalogSummaryCard[];
  definitionStatusBuckets: PlatformPackageDefinitionCatalogBucket[];
  versionStatusBuckets: PlatformPackageDefinitionCatalogBucket[];
  definitionRows: PlatformPackageDefinitionCatalogRow[];
  versionRows: PlatformPackageDefinitionVersionRow[];
  catalogReadiness: string[];
  caveats: string[];
  operatorGuidance: string[];
};

const statusLabels: Record<PlatformPackageDefinitionStatus, string> = {
  draft: "Draft",
  review: "In review",
  published: "Published",
  deprecated: "Deprecated",
  archived: "Archived"
};

function displayLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 140 ? `${normalized.slice(0, 137).trimEnd()}...` : normalized;
}

function countByStatus<T extends { status: PlatformPackageDefinitionStatus }>(
  values: T[],
  emptyDescription: string
): PlatformPackageDefinitionCatalogBucket[] {
  const counts = values.reduce((map, value) => {
    map.set(value.status, (map.get(value.status) ?? 0) + 1);
    return map;
  }, new Map<PlatformPackageDefinitionStatus, number>());

  return (Object.keys(statusLabels) as PlatformPackageDefinitionStatus[])
    .map((status) => ({
      key: status,
      label: statusLabels[status],
      count: counts.get(status) ?? 0,
      description:
        counts.get(status) && counts.get(status)! > 0
          ? `Package governance ${statusLabels[status].toLowerCase()} rows.`
          : emptyDescription
    }))
    .filter((bucket) => bucket.count > 0 || values.length === 0);
}

function versionDisplayLabel(version: PlatformPackageDefinitionVersion) {
  return displayLabel(
    version.versionLabel,
    `Version ${version.versionNumber.toString()}`
  );
}

function intentSummary(version: PlatformPackageDefinitionVersion) {
  const intents = [
    ["Module visibility intent", version.moduleVisibilityIntent],
    ["Usage limit intent", version.usageLimitIntent],
    ["Entitlement intent", version.entitlementIntent],
    ["Billing provider intent", version.billingProviderIntent],
    ["Starter pack default intent", version.starterPackDefaultIntent],
    ["Contractor group targeting intent", version.contractorGroupTargetingIntent],
    ["Published snapshot", version.publishedSnapshot]
  ] as const;

  const present = intents
    .filter(([, value]) => value && Object.keys(value).length > 0)
    .map(([label]) => `${label} present`);

  return present.length > 0
    ? present
    : ["No JSON intent snapshots are recorded for this version."];
}

function buildDefinitionRows(
  definitions: PlatformPackageDefinition[],
  versions: PlatformPackageDefinitionVersion[]
): PlatformPackageDefinitionCatalogRow[] {
  return definitions.map((definition) => {
    const definitionVersions = versions
      .filter((version) => version.packageDefinitionId === definition.id)
      .sort((left, right) => right.versionNumber - left.versionNumber);
    const caveats: string[] = [];
    const publishedVersionCount = definitionVersions.filter(
      (version) => version.status === "published"
    ).length;

    if (definitionVersions.length === 0) {
      caveats.push("No package definition versions are recorded yet.");
    }

    if (publishedVersionCount === 0) {
      caveats.push("No published package definition version is recorded.");
    }

    if (definition.status === "archived") {
      caveats.push("Definition is archived and is shown for history only.");
    }

    return {
      id: definition.id,
      packageKey: definition.packageKey,
      displayName: displayLabel(definition.displayName, "Unnamed package"),
      description: displayLabel(definition.description, "No description recorded."),
      status: definition.status,
      intendedAudience: displayLabel(
        definition.intendedAudience,
        "No intended audience recorded."
      ),
      segmentSummary: displayLabel(
        definition.segmentSummary,
        "No segment summary recorded."
      ),
      versionCount: definitionVersions.length,
      publishedVersionCount,
      latestVersionLabel: definitionVersions[0]
        ? versionDisplayLabel(definitionVersions[0])
        : "No versions",
      caveats
    };
  });
}

function buildVersionRows(
  versions: PlatformPackageDefinitionVersion[]
): PlatformPackageDefinitionVersionRow[] {
  return versions
    .slice()
    .sort((left, right) => {
      const packageCompare = (left.packageKey ?? "").localeCompare(
        right.packageKey ?? ""
      );

      return packageCompare || right.versionNumber - left.versionNumber;
    })
    .map((version) => {
      const caveats: string[] = [];

      if (version.status !== "published") {
        caveats.push("This version is not a published runtime package.");
      }

      if (!version.publishedSnapshot) {
        caveats.push("No published snapshot is recorded.");
      }

      if (!version.packageKey || !version.packageDisplayName) {
        caveats.push("Parent package display context is missing.");
      }

      return {
        id: version.id,
        packageDefinitionId: version.packageDefinitionId,
        packageLabel: displayLabel(version.packageDisplayName, "Unknown package"),
        packageKey: displayLabel(version.packageKey, "unknown-package"),
        versionLabel: versionDisplayLabel(version),
        status: version.status,
        commercialSummary: displayLabel(
          version.commercialSummary,
          "No commercial summary recorded."
        ),
        intentSummary: intentSummary(version),
        caveats
      };
    });
}

export function buildPlatformPackageDefinitionCatalog(
  input: PlatformPackageDefinitionCatalogInput
): PlatformPackageDefinitionCatalogModel {
  const definitions = input.definitions;
  const versions = input.versions;
  const definitionRows = buildDefinitionRows(definitions, versions);
  const versionRows = buildVersionRows(versions);
  const definitionsWithoutVersions = definitionRows.filter(
    (row) => row.versionCount === 0
  ).length;
  const publishedDefinitions = definitionRows.filter(
    (row) => row.publishedVersionCount > 0
  ).length;
  const caveats = [
    "This catalog is read-only and does not expose package create, edit, publish, archive, or assignment controls.",
    "Package definitions and versions do not call Stripe, create subscriptions, collect payments, enforce entitlements, gate modules, change contractor permissions, or alter runtime behavior.",
    "JSON intent snapshots are operator summaries only; they are not runtime resolvers, provider payload stores, or entitlement truth."
  ];

  if (input.unavailableSources?.definitions) {
    caveats.push(input.unavailableSources.definitions);
  }

  if (input.unavailableSources?.versions) {
    caveats.push(input.unavailableSources.versions);
  }

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    mutationControlsAvailable: false,
    assignmentBehaviorAvailable: false,
    billingBehaviorAvailable: false,
    entitlementRuntimeBehaviorAvailable: false,
    summaryCards: [
      {
        id: "definition-count",
        label: "Package definitions",
        value: definitions.length,
        tone: definitions.length > 0 ? "neutral" : "warning",
        description: "Platform-owned package definition rows available for inspection."
      },
      {
        id: "version-count",
        label: "Package versions",
        value: versions.length,
        tone: versions.length > 0 ? "neutral" : "warning",
        description: "Version rows with read-only intent snapshots."
      },
      {
        id: "published-definition-count",
        label: "Definitions with published version",
        value: publishedDefinitions,
        tone: publishedDefinitions > 0 ? "good" : "neutral",
        description: "Definitions that currently have at least one published version row."
      },
      {
        id: "missing-version-count",
        label: "Definitions without versions",
        value: definitionsWithoutVersions,
        tone: definitionsWithoutVersions > 0 ? "warning" : "good",
        description: "Definitions that need a version before they can be meaningfully reviewed."
      }
    ],
    definitionStatusBuckets: countByStatus(
      definitions,
      "No package definitions are recorded for this status."
    ),
    versionStatusBuckets: countByStatus(
      versions,
      "No package definition versions are recorded for this status."
    ),
    definitionRows,
    versionRows,
    catalogReadiness: [
      definitions.length === 0
        ? "No package definitions are recorded yet; the page should render the empty state only."
        : `${definitions.length} package definition row${definitions.length === 1 ? "" : "s"} loaded for read-only review.`,
      versions.length === 0
        ? "No package definition versions are recorded yet; version-level governance remains empty."
        : `${versions.length} package definition version row${versions.length === 1 ? "" : "s"} loaded for read-only review.`,
      definitionsWithoutVersions > 0
        ? `${definitionsWithoutVersions} definition row${definitionsWithoutVersions === 1 ? "" : "s"} currently lack version rows.`
        : "Every loaded definition has at least one version row."
    ],
    caveats,
    operatorGuidance: [
      "Use this catalog to inspect persisted package-definition concepts only.",
      "Do not infer active package assignment, billing state, entitlement access, module visibility, subscription status, or contractor permissions from these rows.",
      "No package mutation workflow exists in this slice."
    ]
  };
}
