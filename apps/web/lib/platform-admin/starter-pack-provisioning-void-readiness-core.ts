import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem
} from "@floorconnector/types";

export type StarterPackProvisioningDestinationUsageStatus =
  | "unused"
  | "used"
  | "unknown"
  | "missing_destination";

export type StarterPackProvisioningDestinationUsageSeverity =
  | "info"
  | "warning"
  | "blocking";

export type StarterPackProvisioningUsageCounts = Record<string, number>;

export type StarterPackProvisioningDestinationUsageFact = {
  destinationExists: boolean | null;
  usageCounts: StarterPackProvisioningUsageCounts;
};

export type StarterPackProvisioningDestinationUsageFacts = {
  documentTemplates?: Record<
    string,
    StarterPackProvisioningDestinationUsageFact | undefined
  >;
  catalogItems?: Record<
    string,
    StarterPackProvisioningDestinationUsageFact | undefined
  >;
};

export type StarterPackProvisioningVoidReadinessRow = {
  runItemId: string;
  destinationRecordType: "document_template" | "catalog_item";
  destinationRecordId: string | null;
  usageStatus: StarterPackProvisioningDestinationUsageStatus;
  usageCountsBySource: StarterPackProvisioningUsageCounts;
  reason: string;
  severity: StarterPackProvisioningDestinationUsageSeverity;
};

export type StarterPackProvisioningVoidReadiness = {
  runId: string;
  runStatus: PlatformStarterPackProvisioningRunDetail["status"];
  canConsiderAuditOnlyVoid: boolean;
  canConsiderArchiveUnused: boolean;
  blockingUsageCount: number;
  warningCount: number;
  rows: StarterPackProvisioningVoidReadinessRow[];
};

function isCompletedProvisioningStatus(
  status: PlatformStarterPackProvisioningRunDetail["status"]
) {
  return status === "completed" || status === "completed_with_warnings";
}

function positiveUsageTotal(usageCounts: StarterPackProvisioningUsageCounts) {
  return Object.values(usageCounts).reduce(
    (total, count) => total + Math.max(0, count),
    0
  );
}

function getUsageFact(input: {
  item: PlatformStarterPackProvisioningRunItem;
  usageFacts: StarterPackProvisioningDestinationUsageFacts;
}) {
  if (!input.item.destinationRecordId) {
    return undefined;
  }

  return input.item.destinationRecordType === "document_template"
    ? input.usageFacts.documentTemplates?.[input.item.destinationRecordId]
    : input.usageFacts.catalogItems?.[input.item.destinationRecordId];
}

function buildCreatedDestinationUsageRow(input: {
  item: PlatformStarterPackProvisioningRunItem;
  fact: StarterPackProvisioningDestinationUsageFact | undefined;
}): StarterPackProvisioningVoidReadinessRow {
  const { item, fact } = input;

  if (!item.destinationRecordId) {
    return {
      runItemId: item.id,
      destinationRecordType: item.destinationRecordType,
      destinationRecordId: null,
      usageStatus: "missing_destination",
      usageCountsBySource: {},
      reason:
        "This created audit item does not have a destination record id, so archive readiness cannot be proven.",
      severity: "blocking"
    };
  }

  if (!fact || fact.destinationExists === null) {
    return {
      runItemId: item.id,
      destinationRecordType: item.destinationRecordType,
      destinationRecordId: item.destinationRecordId,
      usageStatus: "unknown",
      usageCountsBySource: fact?.usageCounts ?? {},
      reason:
        "Usage could not be fully determined from the available read model. Treat this destination as unsafe to archive.",
      severity: "blocking"
    };
  }

  if (!fact.destinationExists) {
    return {
      runItemId: item.id,
      destinationRecordType: item.destinationRecordType,
      destinationRecordId: item.destinationRecordId,
      usageStatus: "missing_destination",
      usageCountsBySource: fact.usageCounts,
      reason:
        "The audit row points to a destination record that is no longer visible in the organization-owned table.",
      severity: "blocking"
    };
  }

  const usageTotal = positiveUsageTotal(fact.usageCounts);

  if (usageTotal > 0) {
    return {
      runItemId: item.id,
      destinationRecordType: item.destinationRecordType,
      destinationRecordId: item.destinationRecordId,
      usageStatus: "used",
      usageCountsBySource: fact.usageCounts,
      reason:
        "This contractor-owned destination appears in live workflow data. Future archive/void must not mutate it without a separate approved design.",
      severity: "blocking"
    };
  }

  return {
    runItemId: item.id,
    destinationRecordType: item.destinationRecordType,
    destinationRecordId: item.destinationRecordId,
    usageStatus: "unused",
    usageCountsBySource: fact.usageCounts,
    reason:
      "No current references were found in the known usage sources. This is still read-only readiness, not archive permission.",
    severity: "info"
  };
}

function buildSkippedDestinationUsageRow(
  item: PlatformStarterPackProvisioningRunItem
): StarterPackProvisioningVoidReadinessRow {
  return {
    runItemId: item.id,
    destinationRecordType: item.destinationRecordType,
    destinationRecordId: item.destinationRecordId,
    usageStatus: item.destinationRecordId ? "unknown" : "missing_destination",
    usageCountsBySource: {},
    reason:
      "This row was skipped because the destination already existed before provisioning. It is not owned by the run for future archive-unused decisions.",
    severity: "warning"
  };
}

export function buildStarterPackProvisioningVoidReadiness(input: {
  run: PlatformStarterPackProvisioningRunDetail;
  usageFacts: StarterPackProvisioningDestinationUsageFacts;
}): StarterPackProvisioningVoidReadiness {
  const completedStatus = isCompletedProvisioningStatus(input.run.status);
  const rows = input.run.items
    .filter((item) => Boolean(item.destinationRecordId) || item.action === "created")
    .map((item) => {
      if (item.action !== "created") {
        return buildSkippedDestinationUsageRow(item);
      }

      return buildCreatedDestinationUsageRow({
        item,
        fact: getUsageFact({
          item,
          usageFacts: input.usageFacts
        })
      });
    });
  const createdRows = rows.filter((row) => {
    const item = input.run.items.find((candidate) => candidate.id === row.runItemId);
    return item?.action === "created";
  });
  const blockingUsageCount = rows.filter((row) => row.severity === "blocking")
    .length;
  const warningCount = rows.filter((row) => row.severity === "warning").length;
  const hasCreatedDestinationRows = createdRows.length > 0;
  const createdRowsAllUnused =
    hasCreatedDestinationRows &&
    createdRows.every((row) => row.usageStatus === "unused");

  return {
    runId: input.run.id,
    runStatus: input.run.status,
    canConsiderAuditOnlyVoid: completedStatus && rows.length > 0,
    canConsiderArchiveUnused: completedStatus && createdRowsAllUnused,
    blockingUsageCount,
    warningCount,
    rows
  };
}
