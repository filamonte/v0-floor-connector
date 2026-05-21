import type {
  PlatformPackageDefinition,
  PlatformPackageDefinitionAuditEvent,
  PlatformPackageDefinitionAuditEventType,
  PlatformPackageDefinitionStatus,
  PlatformPackageDefinitionVersion
} from "@floorconnector/types";

export type PlatformPackageDefinitionLifecycleReadinessStatus =
  | "eligible"
  | "blocked"
  | "unavailable"
  | "already_in_state"
  | "advisory";

export type PlatformPackageDefinitionLifecycleReadinessTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type PlatformPackageDefinitionLifecycleReadinessTransition = {
  id: string;
  label: string;
  subjectType: "definition" | "version";
  subjectId: string | null;
  fromState: string;
  toState: string;
  status: PlatformPackageDefinitionLifecycleReadinessStatus;
  reasons: string[];
  advisoryReasons: string[];
  actionAvailable: false;
  mutationAvailable: false;
  runtimeEffect: false;
  billingEffect: false;
  entitlementEffect: false;
  packageAssignmentEffect: false;
};

export type PlatformPackageDefinitionLifecycleReadinessSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: PlatformPackageDefinitionLifecycleReadinessTone;
  description: string;
};

export type PlatformPackageDefinitionLifecycleReadinessModel = {
  generatedAt: string;
  readOnly: true;
  packageDefinitionId: string;
  actionAvailable: false;
  mutationAvailable: false;
  runtimeEffect: false;
  billingEffect: false;
  entitlementEffect: false;
  packageAssignmentEffect: false;
  summaryCards: PlatformPackageDefinitionLifecycleReadinessSummaryCard[];
  transitions: PlatformPackageDefinitionLifecycleReadinessTransition[];
  caveats: string[];
  operatorGuidance: string[];
};

export type PlatformPackageDefinitionLifecycleReadinessInput = {
  generatedAt: string;
  packageDefinitionId: string;
  definition: PlatformPackageDefinition | null;
  versions: PlatformPackageDefinitionVersion[];
  auditEvents?: PlatformPackageDefinitionAuditEvent[];
  unavailableReason?: string;
};

const noBehaviorFlags = {
  actionAvailable: false,
  mutationAvailable: false,
  runtimeEffect: false,
  billingEffect: false,
  entitlementEffect: false,
  packageAssignmentEffect: false
} as const;

const approvalEventTypes: PlatformPackageDefinitionAuditEventType[] = [
  "package_definition_approved",
  "package_version_approved"
];

function transition(input: {
  id: string;
  label: string;
  subjectType: "definition" | "version";
  subjectId: string | null;
  fromState: string;
  toState: string;
  status: PlatformPackageDefinitionLifecycleReadinessStatus;
  reasons: string[];
  advisoryReasons?: string[];
}): PlatformPackageDefinitionLifecycleReadinessTransition {
  return {
    id: input.id,
    label: input.label,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    fromState: input.fromState,
    toState: input.toState,
    status: input.status,
    reasons: input.reasons,
    advisoryReasons: input.advisoryReasons ?? [],
    ...noBehaviorFlags
  };
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.replace(/\s+/g, " ").trim());
}

function hasObject(value: Record<string, unknown> | null | undefined) {
  return Boolean(value && Object.keys(value).length > 0);
}

function currentReviewLabel(status: PlatformPackageDefinitionStatus) {
  return status === "review" ? "internal_review" : status;
}

function latestVersion(versions: PlatformPackageDefinitionVersion[]) {
  return versions
    .slice()
    .sort((left, right) => right.versionNumber - left.versionNumber)[0] ?? null;
}

function activeVersion(versions: PlatformPackageDefinitionVersion[]) {
  return (
    versions.find((version) => version.status === "published") ??
    latestVersion(versions)
  );
}

function missingDefinitionDimensionReasons(
  definition: PlatformPackageDefinition | null
) {
  if (!definition) {
    return ["Missing package definition."];
  }

  const reasons: string[] = [];

  if (!hasText(definition.packageKey)) {
    reasons.push("Missing required package key.");
  }

  if (!hasText(definition.displayName)) {
    reasons.push("Missing required display name.");
  }

  if (!hasText(definition.intendedAudience)) {
    reasons.push("Missing intended audience summary.");
  }

  if (!hasText(definition.segmentSummary)) {
    reasons.push("Missing segment summary.");
  }

  return reasons;
}

function missingVersionDimensionReasons(
  version: PlatformPackageDefinitionVersion | null
) {
  if (!version) {
    return ["Missing package version."];
  }

  const reasons: string[] = [];

  if (!hasText(version.commercialSummary)) {
    reasons.push("Missing commercial summary.");
  }

  if (!hasObject(version.moduleVisibilityIntent)) {
    reasons.push("Missing module visibility intent snapshot.");
  }

  if (!hasObject(version.usageLimitIntent)) {
    reasons.push("Missing usage limit intent snapshot.");
  }

  if (!hasObject(version.entitlementIntent)) {
    reasons.push("Missing entitlement intent snapshot.");
  }

  if (!hasObject(version.billingProviderIntent)) {
    reasons.push("Missing billing provider intent snapshot.");
  }

  return reasons;
}

function hasApprovalEvidence(events: PlatformPackageDefinitionAuditEvent[]) {
  return events.some((event) => approvalEventTypes.includes(event.eventType));
}

function hasPublishedSnapshot(version: PlatformPackageDefinitionVersion | null) {
  return hasObject(version?.publishedSnapshot);
}

function unavailableTransitions(
  input: PlatformPackageDefinitionLifecycleReadinessInput,
  reason: string
) {
  return [
    transition({
      id: "draft-to-internal-review",
      label: "Draft to internal review",
      subjectType: "definition",
      subjectId: null,
      fromState: "draft",
      toState: "internal_review",
      status: "unavailable",
      reasons: [reason]
    }),
    transition({
      id: "internal-review-to-approved",
      label: "Internal review to approved",
      subjectType: "definition",
      subjectId: null,
      fromState: "internal_review",
      toState: "approved",
      status: "unavailable",
      reasons: [reason]
    }),
    transition({
      id: "approved-to-published",
      label: "Approved version to published",
      subjectType: "version",
      subjectId: null,
      fromState: "approved",
      toState: "published",
      status: "unavailable",
      reasons: [reason]
    })
  ].map((row) => ({
    ...row,
    subjectId:
      row.subjectType === "definition" ? input.packageDefinitionId : row.subjectId
  }));
}

export function buildPlatformPackageDefinitionLifecycleReadiness(
  input: PlatformPackageDefinitionLifecycleReadinessInput
): PlatformPackageDefinitionLifecycleReadinessModel {
  const definition = input.definition;
  const versions = input.versions.filter(
    (version) => version.packageDefinitionId === input.packageDefinitionId
  );
  const events = (input.auditEvents ?? []).filter(
    (event) => event.packageDefinitionId === input.packageDefinitionId
  );
  const currentVersion = activeVersion(versions);
  const publishedVersions = versions.filter(
    (version) => version.status === "published"
  );
  const definitionDimensionReasons = missingDefinitionDimensionReasons(definition);
  const versionDimensionReasons = missingVersionDimensionReasons(currentVersion);
  const approvalEvidencePresent = hasApprovalEvidence(events);
  const caveats = [
    "Lifecycle readiness is read-only inspection for future controls only.",
    "No package create, edit, approve, publish, deprecate, archive, assignment, billing, entitlement, module, runtime, or contractor-permission behavior is available here.",
    "Billing/provider mapping is intent-only and does not call Stripe, create subscriptions, collect payments, or store provider secrets.",
    "Entitlement/module mapping is intent-only; runtime enforcement is not implemented.",
    "Package assignment is not implemented from this readiness model."
  ];

  if (input.unavailableReason) {
    caveats.push(input.unavailableReason);
  }

  if (!definition) {
    const reason = input.unavailableReason ?? "Missing package definition.";

    return {
      generatedAt: input.generatedAt,
      readOnly: true,
      packageDefinitionId: input.packageDefinitionId,
      ...noBehaviorFlags,
      summaryCards: [
        {
          id: "eligible-count",
          label: "Eligible transitions",
          value: 0,
          tone: "warning",
          description: "No transition can be inspected without a package definition."
        },
        {
          id: "blocked-count",
          label: "Blocked transitions",
          value: 0,
          tone: "neutral",
          description: "The package definition is unavailable."
        },
        {
          id: "unavailable-count",
          label: "Unavailable transitions",
          value: 3,
          tone: "warning",
          description: "Future lifecycle checks cannot resolve against this id."
        }
      ],
      transitions: unavailableTransitions(input, reason),
      caveats: [...caveats, "Missing package definition."],
      operatorGuidance: [
        "Return to the package catalog and inspect a known package definition.",
        "Do not create package records from the browser to satisfy this state."
      ]
    };
  }

  if (versions.length === 0) {
    caveats.push("No versions exist for this package definition.");
  }

  if (!currentVersion) {
    caveats.push("No active/current version exists for readiness inspection.");
  }

  if (events.length === 0) {
    caveats.push("No audit evidence available for package lifecycle readiness.");
  }

  if (definition.status === "archived") {
    caveats.push("Archived definitions are not directly publishable.");
  }

  if (currentVersion?.status === "archived") {
    caveats.push("Archived versions are not directly publishable.");
  }

  const dimensions = [...definitionDimensionReasons, ...versionDimensionReasons];
  const status = definition.status;
  const currentState = currentReviewLabel(status);
  const publishedEditReason =
    "Published versions cannot be destructively edited.";
  const archivedReason =
    "Archived definitions/versions are not directly publishable.";
  const generalAdvisories = [
    "Billing/provider mapping is intent-only.",
    "Entitlement/module mapping is intent-only.",
    "Runtime enforcement is not implemented.",
    "Package assignment is not implemented."
  ];
  const rows: PlatformPackageDefinitionLifecycleReadinessTransition[] = [];

  rows.push(
    transition({
      id: "draft-to-internal-review",
      label: "Draft to internal review",
      subjectType: "definition",
      subjectId: definition.id,
      fromState: "draft",
      toState: "internal_review",
      status:
        status === "review"
          ? "already_in_state"
          : status === "draft" && dimensions.length === 0
            ? "eligible"
            : status === "draft"
              ? "blocked"
              : status === "archived" || status === "published"
                ? "blocked"
                : "unavailable",
      reasons:
        status === "draft"
          ? dimensions
          : status === "review"
            ? ["Package definition is already in internal review."]
            : status === "published"
              ? [publishedEditReason]
              : status === "archived"
                ? [archivedReason]
                : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "internal-review-to-draft",
      label: "Internal review to draft",
      subjectType: "definition",
      subjectId: definition.id,
      fromState: "internal_review",
      toState: "draft",
      status:
        status === "draft"
          ? "already_in_state"
          : status === "review"
            ? "eligible"
            : status === "published" || status === "archived"
              ? "blocked"
              : "unavailable",
      reasons:
        status === "review"
          ? []
          : status === "draft"
            ? ["Package definition is already in draft."]
            : status === "published"
              ? [publishedEditReason]
              : status === "archived"
                ? [archivedReason]
                : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "internal-review-to-approved",
      label: "Internal review to approved",
      subjectType: "definition",
      subjectId: definition.id,
      fromState: "internal_review",
      toState: "approved",
      status:
        status === "review" &&
        dimensions.length === 0 &&
        approvalEvidencePresent
          ? "eligible"
          : status === "review"
            ? "blocked"
            : status === "archived" || status === "published"
              ? "blocked"
              : "unavailable",
      reasons:
        status === "review"
          ? [
              ...dimensions,
              ...(approvalEvidencePresent
                ? []
                : ["No audit evidence available for approval readiness."])
            ]
          : status === "published"
            ? [publishedEditReason]
            : status === "archived"
              ? [archivedReason]
              : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "approved-to-published",
      label: "Approved version to published",
      subjectType: "version",
      subjectId: currentVersion?.id ?? null,
      fromState: "approved",
      toState: "published",
      status:
        currentVersion?.status === "published"
          ? "already_in_state"
          : currentVersion?.status === "archived" || definition.status === "archived"
            ? "blocked"
            : currentVersion &&
                currentVersion.status === "review" &&
                dimensions.length === 0 &&
                approvalEvidencePresent &&
                hasPublishedSnapshot(currentVersion)
              ? "eligible"
              : currentVersion
                ? "blocked"
                : "unavailable",
      reasons: currentVersion
        ? [
            ...(currentVersion.status === "published"
              ? ["Version is already published."]
              : []),
            ...(currentVersion.status === "archived" || definition.status === "archived"
              ? [archivedReason]
              : []),
            ...dimensions,
            ...(approvalEvidencePresent
              ? []
              : ["No approved audit evidence is recorded for this package/version."]),
            ...(hasPublishedSnapshot(currentVersion)
              ? []
              : ["No published snapshot is recorded."])
          ]
        : ["Missing package version."],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "published-to-deprecated",
      label: "Published to deprecated",
      subjectType: publishedVersions[0] ? "version" : "definition",
      subjectId: publishedVersions[0]?.id ?? definition.id,
      fromState: "published",
      toState: "deprecated",
      status:
        definition.status === "deprecated" || currentVersion?.status === "deprecated"
          ? "already_in_state"
          : definition.status === "published" || publishedVersions.length > 0
            ? "eligible"
            : definition.status === "archived" || currentVersion?.status === "archived"
              ? "blocked"
              : "unavailable",
      reasons:
        definition.status === "published" || publishedVersions.length > 0
          ? []
          : definition.status === "archived" || currentVersion?.status === "archived"
            ? [archivedReason]
            : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "deprecated-to-archived",
      label: "Deprecated to archived",
      subjectType: "definition",
      subjectId: definition.id,
      fromState: "deprecated",
      toState: "archived",
      status:
        definition.status === "archived"
          ? "already_in_state"
          : definition.status === "deprecated" || currentVersion?.status === "deprecated"
            ? "eligible"
            : "unavailable",
      reasons:
        definition.status === "archived"
          ? ["Package definition is already archived."]
          : definition.status === "deprecated" || currentVersion?.status === "deprecated"
            ? []
            : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "published-superseded-by-new-version",
      label: "Published superseded by new published version",
      subjectType: "version",
      subjectId: publishedVersions[0]?.id ?? currentVersion?.id ?? null,
      fromState: "published",
      toState: "superseded_by_new_published_version",
      status:
        publishedVersions.length > 0
          ? "advisory"
          : currentVersion?.status === "archived"
            ? "blocked"
            : "unavailable",
      reasons:
        publishedVersions.length > 0
          ? ["A published version exists, but supersession controls are not implemented."]
          : currentVersion?.status === "archived"
            ? [archivedReason]
            : ["No published version exists to supersede."],
      advisoryReasons: [
        "Future supersession would require separate version creation and publish controls.",
        ...generalAdvisories
      ]
    })
  );

  rows.push(
    transition({
      id: "draft-to-archived",
      label: "Draft to archived",
      subjectType: "definition",
      subjectId: definition.id,
      fromState: "draft",
      toState: "archived",
      status:
        definition.status === "archived"
          ? "already_in_state"
          : definition.status === "draft"
            ? "eligible"
            : definition.status === "published"
              ? "blocked"
              : "unavailable",
      reasons:
        definition.status === "draft"
          ? []
          : definition.status === "archived"
            ? ["Package definition is already archived."]
            : definition.status === "published"
              ? [publishedEditReason]
              : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  rows.push(
    transition({
      id: "internal-review-to-archived",
      label: "Internal review to archived",
      subjectType: "definition",
      subjectId: definition.id,
      fromState: "internal_review",
      toState: "archived",
      status:
        definition.status === "archived"
          ? "already_in_state"
          : definition.status === "review"
            ? "eligible"
            : definition.status === "published"
              ? "blocked"
              : "unavailable",
      reasons:
        definition.status === "review"
          ? []
          : definition.status === "archived"
            ? ["Package definition is already archived."]
            : definition.status === "published"
              ? [publishedEditReason]
              : [`Current definition state is ${currentState}.`],
      advisoryReasons: generalAdvisories
    })
  );

  const countByStatus = rows.reduce((map, row) => {
    map.set(row.status, (map.get(row.status) ?? 0) + 1);
    return map;
  }, new Map<PlatformPackageDefinitionLifecycleReadinessStatus, number>());

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    packageDefinitionId: definition.id,
    ...noBehaviorFlags,
    summaryCards: [
      {
        id: "eligible-count",
        label: "Eligible",
        value: countByStatus.get("eligible") ?? 0,
        tone: (countByStatus.get("eligible") ?? 0) > 0 ? "good" : "neutral",
        description: "Future transitions that pass read-only readiness checks."
      },
      {
        id: "blocked-count",
        label: "Blocked",
        value: countByStatus.get("blocked") ?? 0,
        tone: (countByStatus.get("blocked") ?? 0) > 0 ? "warning" : "neutral",
        description: "Future transitions blocked by missing state, evidence, or dimensions."
      },
      {
        id: "unavailable-count",
        label: "Unavailable",
        value: countByStatus.get("unavailable") ?? 0,
        tone: (countByStatus.get("unavailable") ?? 0) > 0 ? "warning" : "neutral",
        description: "Transitions that do not match the current package state."
      },
      {
        id: "advisory-count",
        label: "Advisory",
        value: countByStatus.get("advisory") ?? 0,
        tone: "neutral",
        description: "Future-only checks that explain planned governance without enabling behavior."
      }
    ],
    transitions: rows,
    caveats,
    operatorGuidance: [
      "Use lifecycle readiness to inspect future transition prerequisites only.",
      "A status of eligible does not create a button, server action, publish operation, subscription, entitlement, module gate, runtime effect, package assignment, or contractor permission change.",
      "Approval readiness relies on safe audit evidence summaries and current package/version dimensions."
    ]
  };
}
