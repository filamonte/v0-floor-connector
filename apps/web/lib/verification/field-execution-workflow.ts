export type FieldExecutionVerificationArea =
  | "field_handoff"
  | "daily_execution"
  | "crew_visibility"
  | "operational_ownership"
  | "portal_boundary"
  | "schema_boundary";

export type FieldExecutionVerificationSeverity = "critical" | "warning";

export type FieldExecutionVerificationFinding = {
  id: string;
  area: FieldExecutionVerificationArea;
  severity: FieldExecutionVerificationSeverity;
  message: string;
};

export type FieldExecutionWorkflowVerificationInput = {
  fieldHandoffUsesCanonicalScheduleJobProject: boolean;
  fieldHandoffIncludesCommercialContext: boolean;
  dailyExecutionUsesCanonicalDailyLogs: boolean;
  dailyExecutionUsesCanonicalFieldNotes: boolean;
  blockersUseFieldNotes: boolean;
  photosUseExecutionAttachments: boolean;
  officeAttentionDerivedFromCanonicalRecords: boolean;
  closeoutReadinessDerivedFromCanonicalRecords: boolean;
  noDuplicateIssueTrackerModel: boolean;
  noDuplicatePunchListModel: boolean;
  noDuplicateDispatchModel: boolean;
  noDuplicateScheduleModel: boolean;
  projectRemainsDiagnostic: boolean;
  fieldOwnsExecutionAction: boolean;
  dashboardDoesNotOwnExecutionWorkspace: boolean;
  settingsOwnsConfiguration: boolean;
  portalBehaviorUnchanged: boolean;
  noSchemaOrMigrationChanges: boolean;
};

export type FieldExecutionWorkflowVerificationSummary = {
  confidence: "high" | "medium" | "low";
  status: "verified" | "hold";
  findings: FieldExecutionVerificationFinding[];
  verifiedChecks: string[];
};

type CheckDefinition = {
  key: keyof FieldExecutionWorkflowVerificationInput;
  area: FieldExecutionVerificationArea;
  id: string;
  message: string;
  severity: FieldExecutionVerificationSeverity;
};

const checkDefinitions: CheckDefinition[] = [
  {
    key: "fieldHandoffUsesCanonicalScheduleJobProject",
    area: "field_handoff",
    id: "field-handoff:canonical-schedule-job-project",
    message:
      "Field handoff must derive from canonical schedule, job, and project context.",
    severity: "critical"
  },
  {
    key: "fieldHandoffIncludesCommercialContext",
    area: "field_handoff",
    id: "field-handoff:commercial-context",
    message:
      "Field handoff must preserve estimate, contract, readiness, customer, and project context.",
    severity: "critical"
  },
  {
    key: "dailyExecutionUsesCanonicalDailyLogs",
    area: "daily_execution",
    id: "daily-execution:daily-logs",
    message: "Daily execution must use canonical Daily Logs.",
    severity: "critical"
  },
  {
    key: "dailyExecutionUsesCanonicalFieldNotes",
    area: "daily_execution",
    id: "daily-execution:field-notes",
    message: "Daily execution must use canonical field notes.",
    severity: "critical"
  },
  {
    key: "blockersUseFieldNotes",
    area: "daily_execution",
    id: "daily-execution:blockers",
    message:
      "Blockers and observations must stay on field notes, not a duplicate issue tracker.",
    severity: "critical"
  },
  {
    key: "photosUseExecutionAttachments",
    area: "daily_execution",
    id: "daily-execution:photos",
    message:
      "Photo visibility must use existing execution attachment/evidence context.",
    severity: "critical"
  },
  {
    key: "officeAttentionDerivedFromCanonicalRecords",
    area: "crew_visibility",
    id: "crew-visibility:office-attention",
    message:
      "Office attention must be derived from canonical jobs, schedule, readiness, Daily Logs, field notes, and warnings.",
    severity: "critical"
  },
  {
    key: "closeoutReadinessDerivedFromCanonicalRecords",
    area: "crew_visibility",
    id: "crew-visibility:closeout-readiness",
    message:
      "Closeout readiness must remain derived from canonical execution records.",
    severity: "critical"
  },
  {
    key: "noDuplicateIssueTrackerModel",
    area: "daily_execution",
    id: "duplicates:issue-tracker",
    message: "The wave must not introduce a duplicate issue tracker model.",
    severity: "critical"
  },
  {
    key: "noDuplicatePunchListModel",
    area: "daily_execution",
    id: "duplicates:punch-list",
    message: "The wave must not introduce a duplicate punch-list model.",
    severity: "critical"
  },
  {
    key: "noDuplicateDispatchModel",
    area: "crew_visibility",
    id: "duplicates:dispatch",
    message: "The wave must not introduce a duplicate dispatch model.",
    severity: "critical"
  },
  {
    key: "noDuplicateScheduleModel",
    area: "crew_visibility",
    id: "duplicates:schedule",
    message: "The wave must not introduce a duplicate schedule model.",
    severity: "critical"
  },
  {
    key: "projectRemainsDiagnostic",
    area: "operational_ownership",
    id: "ownership:project-diagnostic",
    message:
      "Project must remain diagnostic and route execution action to the owning workspace.",
    severity: "critical"
  },
  {
    key: "fieldOwnsExecutionAction",
    area: "operational_ownership",
    id: "ownership:field-action",
    message: "Field must own execution action for this wave.",
    severity: "critical"
  },
  {
    key: "dashboardDoesNotOwnExecutionWorkspace",
    area: "operational_ownership",
    id: "ownership:dashboard-boundary",
    message: "Dashboard must not become the execution workspace.",
    severity: "critical"
  },
  {
    key: "settingsOwnsConfiguration",
    area: "operational_ownership",
    id: "ownership:settings-configuration",
    message: "Settings must remain the owner of tenant configuration.",
    severity: "critical"
  },
  {
    key: "portalBehaviorUnchanged",
    area: "portal_boundary",
    id: "portal:unchanged",
    message:
      "Portal behavior must remain unchanged and customer-safe for field execution depth.",
    severity: "critical"
  },
  {
    key: "noSchemaOrMigrationChanges",
    area: "schema_boundary",
    id: "schema:no-migrations",
    message: "Verification must hold if schema or migrations changed.",
    severity: "critical"
  }
];

function getConfidence(input: {
  criticalFindingCount: number;
  warningFindingCount: number;
}) {
  if (input.criticalFindingCount > 0) {
    return "low";
  }

  if (input.warningFindingCount > 0) {
    return "medium";
  }

  return "high";
}

export function verifyFieldExecutionWorkflow(
  input: FieldExecutionWorkflowVerificationInput
): FieldExecutionWorkflowVerificationSummary {
  const findings = checkDefinitions.flatMap((definition) => {
    if (input[definition.key]) {
      return [];
    }

    return [
      {
        id: definition.id,
        area: definition.area,
        severity: definition.severity,
        message: definition.message
      }
    ];
  });
  const criticalFindingCount = findings.filter(
    (finding) => finding.severity === "critical"
  ).length;
  const warningFindingCount = findings.filter(
    (finding) => finding.severity === "warning"
  ).length;

  return {
    confidence: getConfidence({ criticalFindingCount, warningFindingCount }),
    status: criticalFindingCount > 0 ? "hold" : "verified",
    findings,
    verifiedChecks: checkDefinitions
      .filter((definition) => input[definition.key])
      .map((definition) => definition.id)
  };
}

export function buildApprovedFieldExecutionDepthVerificationInput(): FieldExecutionWorkflowVerificationInput {
  return {
    fieldHandoffUsesCanonicalScheduleJobProject: true,
    fieldHandoffIncludesCommercialContext: true,
    dailyExecutionUsesCanonicalDailyLogs: true,
    dailyExecutionUsesCanonicalFieldNotes: true,
    blockersUseFieldNotes: true,
    photosUseExecutionAttachments: true,
    officeAttentionDerivedFromCanonicalRecords: true,
    closeoutReadinessDerivedFromCanonicalRecords: true,
    noDuplicateIssueTrackerModel: true,
    noDuplicatePunchListModel: true,
    noDuplicateDispatchModel: true,
    noDuplicateScheduleModel: true,
    projectRemainsDiagnostic: true,
    fieldOwnsExecutionAction: true,
    dashboardDoesNotOwnExecutionWorkspace: true,
    settingsOwnsConfiguration: true,
    portalBehaviorUnchanged: true,
    noSchemaOrMigrationChanges: true
  };
}
