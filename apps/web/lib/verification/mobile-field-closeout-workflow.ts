export type MobileFieldCloseoutVerificationArea =
  | "field_capture"
  | "closeout_readiness"
  | "communications_handoff"
  | "ownership_boundary"
  | "portal_boundary"
  | "schema_boundary";

export type MobileFieldCloseoutVerificationSeverity = "critical" | "warning";

export type MobileFieldCloseoutVerificationFinding = {
  id: string;
  area: MobileFieldCloseoutVerificationArea;
  severity: MobileFieldCloseoutVerificationSeverity;
  message: string;
};

export type MobileFieldCloseoutVerificationInput = {
  quickCaptureUsesCanonicalDailyLogs: boolean;
  quickCaptureUsesCanonicalFieldNotes: boolean;
  blockerCaptureUsesFieldNotes: boolean;
  fieldEvidenceUsesExecutionAttachments: boolean;
  closeoutReadinessDerivedFromFieldRecords: boolean;
  noDuplicateCloseoutModel: boolean;
  noDuplicateIssueModel: boolean;
  noDuplicatePunchListModel: boolean;
  communicationsHandoffUsesReviewFirstDrafts: boolean;
  communicationsOwnsConversationAction: boolean;
  noAutonomousCustomerSends: boolean;
  fieldOwnsExecutionCapture: boolean;
  projectRemainsDiagnostic: boolean;
  financialsOwnsBillingAction: boolean;
  portalBehaviorUnchanged: boolean;
  noPortalOnlyFieldCopies: boolean;
  noSchemaOrMigrationChanges: boolean;
};

export type MobileFieldCloseoutVerificationSummary = {
  status: "verified" | "hold";
  confidence: "high" | "medium" | "low";
  findings: MobileFieldCloseoutVerificationFinding[];
  verifiedChecks: string[];
};

type CheckDefinition = {
  key: keyof MobileFieldCloseoutVerificationInput;
  area: MobileFieldCloseoutVerificationArea;
  id: string;
  message: string;
  severity: MobileFieldCloseoutVerificationSeverity;
};

const checkDefinitions: CheckDefinition[] = [
  {
    key: "quickCaptureUsesCanonicalDailyLogs",
    area: "field_capture",
    id: "field-capture:daily-logs",
    message: "Quick capture must use canonical Daily Logs.",
    severity: "critical"
  },
  {
    key: "quickCaptureUsesCanonicalFieldNotes",
    area: "field_capture",
    id: "field-capture:field-notes",
    message: "Quick capture must use canonical field notes / Job Notes.",
    severity: "critical"
  },
  {
    key: "blockerCaptureUsesFieldNotes",
    area: "field_capture",
    id: "field-capture:blockers",
    message: "Blockers and issues must remain field-note types.",
    severity: "critical"
  },
  {
    key: "fieldEvidenceUsesExecutionAttachments",
    area: "field_capture",
    id: "field-capture:execution-attachments",
    message: "Field evidence must use existing execution attachments.",
    severity: "critical"
  },
  {
    key: "closeoutReadinessDerivedFromFieldRecords",
    area: "closeout_readiness",
    id: "closeout:derived-field-records",
    message:
      "Closeout readiness must be derived from jobs, Daily Logs, field notes, and execution attachments.",
    severity: "critical"
  },
  {
    key: "noDuplicateCloseoutModel",
    area: "closeout_readiness",
    id: "duplicates:closeout",
    message: "The wave must not introduce a duplicate closeout model.",
    severity: "critical"
  },
  {
    key: "noDuplicateIssueModel",
    area: "closeout_readiness",
    id: "duplicates:issue",
    message: "The wave must not introduce a duplicate issue model.",
    severity: "critical"
  },
  {
    key: "noDuplicatePunchListModel",
    area: "closeout_readiness",
    id: "duplicates:punch-list",
    message: "The wave must not introduce a duplicate punch-list model.",
    severity: "critical"
  },
  {
    key: "communicationsHandoffUsesReviewFirstDrafts",
    area: "communications_handoff",
    id: "communications:review-first-handoff",
    message:
      "Field handoff to Communications must be review-first and must not send.",
    severity: "critical"
  },
  {
    key: "communicationsOwnsConversationAction",
    area: "communications_handoff",
    id: "communications:owns-action",
    message:
      "Communications must own conversation action; Field should only provide source context.",
    severity: "critical"
  },
  {
    key: "noAutonomousCustomerSends",
    area: "communications_handoff",
    id: "communications:no-autonomous-sends",
    message: "The wave must not introduce autonomous customer sends.",
    severity: "critical"
  },
  {
    key: "fieldOwnsExecutionCapture",
    area: "ownership_boundary",
    id: "ownership:field-capture",
    message: "Field must own execution capture.",
    severity: "critical"
  },
  {
    key: "projectRemainsDiagnostic",
    area: "ownership_boundary",
    id: "ownership:project-diagnostic",
    message: "Project must remain diagnostic for readiness and blockers.",
    severity: "critical"
  },
  {
    key: "financialsOwnsBillingAction",
    area: "ownership_boundary",
    id: "ownership:financials-billing-action",
    message: "Financials must own billing and collection action.",
    severity: "critical"
  },
  {
    key: "portalBehaviorUnchanged",
    area: "portal_boundary",
    id: "portal:unchanged",
    message: "Portal behavior must remain unchanged and customer-safe.",
    severity: "critical"
  },
  {
    key: "noPortalOnlyFieldCopies",
    area: "portal_boundary",
    id: "portal:no-field-copies",
    message: "The wave must not create portal-only field evidence copies.",
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

export function verifyMobileFieldCloseoutWorkflow(
  input: MobileFieldCloseoutVerificationInput
): MobileFieldCloseoutVerificationSummary {
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
    status: criticalFindingCount > 0 ? "hold" : "verified",
    confidence: getConfidence({ criticalFindingCount, warningFindingCount }),
    findings,
    verifiedChecks: checkDefinitions
      .filter((definition) => input[definition.key])
      .map((definition) => definition.id)
  };
}

export function buildApprovedMobileFieldCloseoutVerificationInput(): MobileFieldCloseoutVerificationInput {
  return {
    quickCaptureUsesCanonicalDailyLogs: true,
    quickCaptureUsesCanonicalFieldNotes: true,
    blockerCaptureUsesFieldNotes: true,
    fieldEvidenceUsesExecutionAttachments: true,
    closeoutReadinessDerivedFromFieldRecords: true,
    noDuplicateCloseoutModel: true,
    noDuplicateIssueModel: true,
    noDuplicatePunchListModel: true,
    communicationsHandoffUsesReviewFirstDrafts: true,
    communicationsOwnsConversationAction: true,
    noAutonomousCustomerSends: true,
    fieldOwnsExecutionCapture: true,
    projectRemainsDiagnostic: true,
    financialsOwnsBillingAction: true,
    portalBehaviorUnchanged: true,
    noPortalOnlyFieldCopies: true,
    noSchemaOrMigrationChanges: true
  };
}
