import type {
  PlatformPackageDefinition,
  PlatformPackageDefinitionAuditEvent,
  PlatformPackageDefinitionStatus,
  PlatformPackageDefinitionVersion
} from "@floorconnector/types";

import {
  buildPlatformPackageDefinitionAuditTimeline,
  type PlatformPackageDefinitionAuditTimelineModel
} from "./package-definition-audit-timeline-core";
import {
  buildPlatformPackageDefinitionLifecycleReadiness,
  type PlatformPackageDefinitionLifecycleReadinessModel
} from "./package-definition-lifecycle-readiness-core";

export type PlatformPackageDefinitionDetailTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type PlatformPackageDefinitionDetailBucket = {
  key: string;
  label: string;
  count: number;
  description: string;
};

export type PlatformPackageDefinitionDetailSummaryCard = {
  id: string;
  label: string;
  value: string | number;
  tone: PlatformPackageDefinitionDetailTone;
  description: string;
};

export type PlatformPackageDefinitionDetailVersionIntentSection = {
  key: string;
  label: string;
  state: "present" | "empty";
  summary: string;
};

export type PlatformPackageDefinitionDetailVersionRow = {
  id: string;
  versionLabel: string;
  versionNumber: number;
  status: PlatformPackageDefinitionStatus;
  commercialSummary: string;
  publishedAt: string | null;
  deprecatedAt: string | null;
  archivedAt: string | null;
  intentSections: PlatformPackageDefinitionDetailVersionIntentSection[];
  caveats: string[];
};

export type PlatformPackageDefinitionDetailModel = {
  generatedAt: string;
  found: boolean;
  readOnly: true;
  mutationControlsAvailable: false;
  lifecycleMutationControlsAvailable: false;
  assignmentBehaviorAvailable: false;
  billingBehaviorAvailable: false;
  entitlementRuntimeBehaviorAvailable: false;
  packageDefinitionId: string;
  packageKey: string;
  displayName: string;
  description: string;
  status: PlatformPackageDefinitionStatus | "unavailable";
  intendedAudience: string;
  segmentSummary: string;
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
  summaryCards: PlatformPackageDefinitionDetailSummaryCard[];
  versionStatusBuckets: PlatformPackageDefinitionDetailBucket[];
  versionRows: PlatformPackageDefinitionDetailVersionRow[];
  auditTimeline: PlatformPackageDefinitionAuditTimelineModel;
  lifecycleReadiness: PlatformPackageDefinitionLifecycleReadinessModel;
  caveats: string[];
  operatorGuidance: string[];
};

export type PlatformPackageDefinitionDetailInput = {
  generatedAt: string;
  packageDefinitionId: string;
  definition: PlatformPackageDefinition | null;
  versions: PlatformPackageDefinitionVersion[];
  auditEvents?: PlatformPackageDefinitionAuditEvent[];
  unavailableReason?: string;
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

  return normalized.length > 160 ? `${normalized.slice(0, 157).trimEnd()}...` : normalized;
}

function versionDisplayLabel(version: PlatformPackageDefinitionVersion) {
  return displayLabel(
    version.versionLabel,
    `Version ${version.versionNumber.toString()}`
  );
}

function summarizeJsonObject(
  label: string,
  value: Record<string, unknown> | null
): PlatformPackageDefinitionDetailVersionIntentSection {
  if (!value || Object.keys(value).length === 0) {
    return {
      key: label.toLowerCase().replaceAll(" ", "-"),
      label,
      state: "empty",
      summary: `${label} is not recorded for this version.`
    };
  }

  const topLevelKeys = Object.keys(value).sort();

  return {
    key: label.toLowerCase().replaceAll(" ", "-"),
    label,
    state: "present",
    summary: `${label} has ${topLevelKeys.length} top-level field${
      topLevelKeys.length === 1 ? "" : "s"
    } recorded: ${topLevelKeys.slice(0, 4).join(", ")}${
      topLevelKeys.length > 4 ? ", ..." : ""
    }. Values are intentionally summarized, not dumped.`
  };
}

function buildVersionRows(
  versions: PlatformPackageDefinitionVersion[]
): PlatformPackageDefinitionDetailVersionRow[] {
  return versions
    .slice()
    .sort((left, right) => right.versionNumber - left.versionNumber)
    .map((version) => {
      const caveats: string[] = [];

      if (version.status !== "published") {
        caveats.push("This version is not a published runtime package.");
      }

      if (!version.publishedSnapshot) {
        caveats.push("No published snapshot is recorded.");
      }

      if (version.status === "deprecated") {
        caveats.push("This version is deprecated and should be read as history.");
      }

      if (version.status === "archived") {
        caveats.push("This version is archived and shown for inspection only.");
      }

      return {
        id: version.id,
        versionLabel: versionDisplayLabel(version),
        versionNumber: version.versionNumber,
        status: version.status,
        commercialSummary: displayLabel(
          version.commercialSummary,
          "No commercial summary recorded."
        ),
        publishedAt: version.publishedAt,
        deprecatedAt: version.deprecatedAt,
        archivedAt: version.archivedAt,
        intentSections: [
          summarizeJsonObject("Module visibility intent", version.moduleVisibilityIntent),
          summarizeJsonObject("Usage limit intent", version.usageLimitIntent),
          summarizeJsonObject("Entitlement intent", version.entitlementIntent),
          summarizeJsonObject("Billing provider intent", version.billingProviderIntent),
          summarizeJsonObject(
            "Starter pack default intent",
            version.starterPackDefaultIntent
          ),
          summarizeJsonObject(
            "Contractor group targeting intent",
            version.contractorGroupTargetingIntent
          ),
          summarizeJsonObject("Published snapshot", version.publishedSnapshot)
        ],
        caveats
      };
    });
}

function buildStatusBuckets(
  versions: PlatformPackageDefinitionVersion[]
): PlatformPackageDefinitionDetailBucket[] {
  const counts = versions.reduce((map, version) => {
    map.set(version.status, (map.get(version.status) ?? 0) + 1);
    return map;
  }, new Map<PlatformPackageDefinitionStatus, number>());

  return (Object.keys(statusLabels) as PlatformPackageDefinitionStatus[])
    .map((status) => ({
      key: status,
      label: statusLabels[status],
      count: counts.get(status) ?? 0,
      description:
        counts.get(status) && counts.get(status)! > 0
          ? `This package definition has ${counts.get(status)} ${statusLabels[
              status
            ].toLowerCase()} version row${
              counts.get(status) === 1 ? "" : "s"
            }.`
          : "No versions are recorded for this lifecycle state."
    }))
    .filter((bucket) => bucket.count > 0 || versions.length === 0);
}

export function buildPlatformPackageDefinitionDetail(
  input: PlatformPackageDefinitionDetailInput
): PlatformPackageDefinitionDetailModel {
  const definition = input.definition;
  const versions = input.versions.filter(
    (version) => version.packageDefinitionId === input.packageDefinitionId
  );
  const auditTimeline = buildPlatformPackageDefinitionAuditTimeline({
    generatedAt: input.generatedAt,
    packageDefinitionId: input.packageDefinitionId,
    events: input.auditEvents ?? [],
    unavailableReason: definition ? undefined : input.unavailableReason
  });
  const lifecycleReadiness = buildPlatformPackageDefinitionLifecycleReadiness({
    generatedAt: input.generatedAt,
    packageDefinitionId: input.packageDefinitionId,
    definition,
    versions,
    auditEvents: input.auditEvents ?? [],
    unavailableReason: definition ? undefined : input.unavailableReason
  });
  const versionRows = buildVersionRows(versions);
  const publishedVersions = versions.filter(
    (version) => version.status === "published"
  );
  const caveats = [
    "This detail view is read-only and does not expose package create, edit, publish, archive, lifecycle mutation, or assignment controls.",
    "This detail view does not call Stripe, create subscriptions, collect payments, enforce entitlements, gate modules, change contractor permissions, or alter runtime behavior.",
    "JSON intent and snapshot fields are summarized for operator inspection only; they are not raw provider payloads, runtime resolvers, or entitlement truth."
  ];

  if (!definition) {
    if (input.unavailableReason) {
      caveats.push(input.unavailableReason);
    }

    return {
      generatedAt: input.generatedAt,
      found: false,
      readOnly: true,
      mutationControlsAvailable: false,
      lifecycleMutationControlsAvailable: false,
      assignmentBehaviorAvailable: false,
      billingBehaviorAvailable: false,
      entitlementRuntimeBehaviorAvailable: false,
      packageDefinitionId: input.packageDefinitionId,
      packageKey: "unavailable",
      displayName: "Package definition unavailable",
      description:
        "No platform package definition was found for this identifier.",
      status: "unavailable",
      intendedAudience: "Not available.",
      segmentSummary: "Not available.",
      createdAt: null,
      updatedAt: null,
      archivedAt: null,
      summaryCards: [
        {
          id: "definition-found",
          label: "Definition found",
          value: "No",
          tone: "warning",
          description: "The requested package definition could not be loaded."
        }
      ],
      versionStatusBuckets: [],
      versionRows: [],
      auditTimeline,
      lifecycleReadiness,
      caveats,
      operatorGuidance: [
        "Return to the package catalog and choose a known package definition.",
        "Do not create seed data from the browser to satisfy this state."
      ]
    };
  }

  if (versions.length === 0) {
    caveats.push("No package definition versions are recorded for this package.");
  }

  if (publishedVersions.length === 0) {
    caveats.push("No published package definition version is recorded.");
  }

  if (definition.status === "deprecated") {
    caveats.push("This package definition is deprecated and shown for history.");
  }

  if (definition.status === "archived") {
    caveats.push("This package definition is archived and shown for inspection only.");
  }

  return {
    generatedAt: input.generatedAt,
    found: true,
    readOnly: true,
    mutationControlsAvailable: false,
    lifecycleMutationControlsAvailable: false,
    assignmentBehaviorAvailable: false,
    billingBehaviorAvailable: false,
    entitlementRuntimeBehaviorAvailable: false,
    packageDefinitionId: definition.id,
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
    createdAt: definition.createdAt,
    updatedAt: definition.updatedAt,
    archivedAt: definition.archivedAt,
    summaryCards: [
      {
        id: "version-count",
        label: "Versions",
        value: versions.length,
        tone: versions.length > 0 ? "neutral" : "warning",
        description: "Version rows recorded for this package definition."
      },
      {
        id: "published-version-count",
        label: "Published versions",
        value: publishedVersions.length,
        tone: publishedVersions.length > 0 ? "good" : "warning",
        description: "Published version rows available for read-only inspection."
      },
      {
        id: "definition-status",
        label: "Definition lifecycle",
        value: statusLabels[definition.status],
        tone:
          definition.status === "published"
            ? "good"
            : definition.status === "archived" || definition.status === "deprecated"
              ? "warning"
              : "neutral",
        description: "Package definition lifecycle state from the platform catalog."
      }
    ],
    versionStatusBuckets: buildStatusBuckets(versions),
    versionRows,
    auditTimeline,
    lifecycleReadiness,
    caveats,
    operatorGuidance: [
      "Use this view to inspect one persisted package definition and its version snapshots.",
      "Do not infer active contractor package assignment, billing state, entitlement access, module visibility, subscription state, or contractor permissions from this detail view.",
      "No package lifecycle or mutation workflow exists in this slice."
    ]
  };
}
