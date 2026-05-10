import type {
  PlatformPackageDefinitionAuditEvent,
  PlatformPackageDefinitionAuditEventType
} from "@floorconnector/types";

export type PlatformPackageDefinitionAuditTimelineTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type PlatformPackageDefinitionAuditTimelineBucket = {
  key: PlatformPackageDefinitionAuditEventType;
  label: string;
  count: number;
  description: string;
};

export type PlatformPackageDefinitionAuditTimelineRow = {
  id: string;
  eventType: PlatformPackageDefinitionAuditEventType;
  eventLabel: string;
  packageDefinitionId: string;
  packageDefinitionVersionId: string | null;
  actorUserId: string | null;
  reasonSummary: string;
  confirmationSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  occurredAt: string;
  caveats: string[];
};

export type PlatformPackageDefinitionAuditTimelineSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: PlatformPackageDefinitionAuditTimelineTone;
  description: string;
};

export type PlatformPackageDefinitionAuditTimelineModel = {
  generatedAt: string;
  readOnly: true;
  mutationControlsAvailable: false;
  lifecycleMutationControlsAvailable: false;
  approvalControlsAvailable: false;
  assignmentBehaviorAvailable: false;
  billingBehaviorAvailable: false;
  entitlementRuntimeBehaviorAvailable: false;
  packageDefinitionId: string;
  summaryCards: PlatformPackageDefinitionAuditTimelineSummaryCard[];
  eventTypeBuckets: PlatformPackageDefinitionAuditTimelineBucket[];
  eventRows: PlatformPackageDefinitionAuditTimelineRow[];
  caveats: string[];
  operatorGuidance: string[];
};

export type PlatformPackageDefinitionAuditTimelineInput = {
  generatedAt: string;
  packageDefinitionId: string;
  events: PlatformPackageDefinitionAuditEvent[];
  unavailableReason?: string;
};

const eventLabels: Record<PlatformPackageDefinitionAuditEventType, string> = {
  package_definition_created: "Definition created",
  package_definition_updated: "Definition updated",
  package_definition_reviewed: "Definition reviewed",
  package_definition_approved: "Definition approved",
  package_definition_published: "Definition published",
  package_definition_deprecated: "Definition deprecated",
  package_definition_archived: "Definition archived",
  package_version_created: "Version created",
  package_version_updated: "Version updated",
  package_version_reviewed: "Version reviewed",
  package_version_approved: "Version approved",
  package_version_published: "Version published",
  package_version_deprecated: "Version deprecated",
  package_version_archived: "Version archived"
};

function displayLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 140 ? `${normalized.slice(0, 137).trimEnd()}...` : normalized;
}

function summarizeJsonObject(
  label: string,
  value: Record<string, unknown> | null
) {
  if (!value || Object.keys(value).length === 0) {
    return `${label} is not recorded.`;
  }

  const keys = Object.keys(value).sort();

  return `${label} has ${keys.length} top-level field${
    keys.length === 1 ? "" : "s"
  } recorded: ${keys.slice(0, 5).join(", ")}${
    keys.length > 5 ? ", ..." : ""
  }. Values are summarized, not dumped.`;
}

function buildEventRows(
  events: PlatformPackageDefinitionAuditEvent[]
): PlatformPackageDefinitionAuditTimelineRow[] {
  return events
    .slice()
    .sort((left, right) => {
      const occurredCompare =
        Date.parse(right.occurredAt) - Date.parse(left.occurredAt);

      return (
        occurredCompare ||
        Date.parse(right.createdAt) - Date.parse(left.createdAt) ||
        right.id.localeCompare(left.id)
      );
    })
    .map((event) => {
      const caveats: string[] = [];

      if (event.eventType.startsWith("package_version_") && !event.packageDefinitionVersionId) {
        caveats.push("Version event is missing a version reference.");
      }

      if (!event.reason) {
        caveats.push("No operator reason is recorded.");
      }

      if (!event.confirmationText) {
        caveats.push("No confirmation text is recorded.");
      }

      return {
        id: event.id,
        eventType: event.eventType,
        eventLabel: eventLabels[event.eventType],
        packageDefinitionId: event.packageDefinitionId,
        packageDefinitionVersionId: event.packageDefinitionVersionId,
        actorUserId: event.actorUserId,
        reasonSummary: displayLabel(event.reason, "No reason recorded."),
        confirmationSummary: displayLabel(
          event.confirmationText,
          "No confirmation text recorded."
        ),
        beforeSnapshotSummary: summarizeJsonObject(
          "Before snapshot",
          event.beforeSnapshot
        ),
        afterSnapshotSummary: summarizeJsonObject(
          "After snapshot",
          event.afterSnapshot
        ),
        metadataSummary: summarizeJsonObject("Metadata", event.metadata),
        occurredAt: event.occurredAt,
        caveats
      };
    });
}

function buildEventTypeBuckets(
  events: PlatformPackageDefinitionAuditEvent[]
): PlatformPackageDefinitionAuditTimelineBucket[] {
  const counts = events.reduce((map, event) => {
    map.set(event.eventType, (map.get(event.eventType) ?? 0) + 1);
    return map;
  }, new Map<PlatformPackageDefinitionAuditEventType, number>());

  return (Object.keys(eventLabels) as PlatformPackageDefinitionAuditEventType[])
    .map((eventType) => ({
      key: eventType,
      label: eventLabels[eventType],
      count: counts.get(eventType) ?? 0,
      description:
        counts.get(eventType) && counts.get(eventType)! > 0
          ? `This audit timeline has ${counts.get(eventType)} ${eventLabels[
              eventType
            ].toLowerCase()} event${counts.get(eventType) === 1 ? "" : "s"}.`
          : "No audit evidence is recorded for this event type."
    }))
    .filter((bucket) => bucket.count > 0 || events.length === 0);
}

export function buildPlatformPackageDefinitionAuditTimeline(
  input: PlatformPackageDefinitionAuditTimelineInput
): PlatformPackageDefinitionAuditTimelineModel {
  const events = input.events.filter(
    (event) => event.packageDefinitionId === input.packageDefinitionId
  );
  const eventRows = buildEventRows(events);
  const caveats = [
    "This audit timeline is read-only evidence and does not expose package create, edit, publish, approval, archive, lifecycle mutation, or assignment controls.",
    "Audit evidence does not call Stripe, create subscriptions, collect payments, enforce entitlements, gate modules, change contractor permissions, or alter runtime behavior.",
    "Snapshot and metadata fields are summarized for operator review only; provider secrets, raw provider payloads, service-role keys, card data, and payment data must not be stored here."
  ];

  if (events.length === 0) {
    caveats.push("No package definition audit events are recorded for this package.");
  }

  if (input.unavailableReason) {
    caveats.push(input.unavailableReason);
  }

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    mutationControlsAvailable: false,
    lifecycleMutationControlsAvailable: false,
    approvalControlsAvailable: false,
    assignmentBehaviorAvailable: false,
    billingBehaviorAvailable: false,
    entitlementRuntimeBehaviorAvailable: false,
    packageDefinitionId: input.packageDefinitionId,
    summaryCards: [
      {
        id: "audit-event-count",
        label: "Audit events",
        value: events.length,
        tone: events.length > 0 ? "neutral" : "warning",
        description: "Package definition audit evidence rows loaded for review."
      },
      {
        id: "definition-event-count",
        label: "Definition events",
        value: events.filter((event) =>
          event.eventType.startsWith("package_definition_")
        ).length,
        tone: "neutral",
        description: "Events recorded against the package definition lifecycle."
      },
      {
        id: "version-event-count",
        label: "Version events",
        value: events.filter((event) =>
          event.eventType.startsWith("package_version_")
        ).length,
        tone: "neutral",
        description: "Events recorded against package definition versions."
      }
    ],
    eventTypeBuckets: buildEventTypeBuckets(events),
    eventRows,
    caveats,
    operatorGuidance: [
      "Use this section to inspect package definition audit evidence only.",
      "Do not infer active package assignment, billing state, entitlement access, module visibility, subscription state, or contractor permissions from audit events.",
      "No approval, publish, deprecate, archive, lifecycle, or package mutation workflow exists in this slice."
    ]
  };
}
