export const operationalOwnershipSurfaceOrder = [
  "dashboard",
  "project_workspace",
  "owning_workspace",
  "settings",
  "super_admin",
  "portal"
] as const;

export type OperationalOwnershipSurface =
  (typeof operationalOwnershipSurfaceOrder)[number];

export type OperationalOwnershipStatus = "verified" | "partial" | "blocked";

export type OperationalOwnershipFinding = {
  id: string;
  surface: OperationalOwnershipSurface;
  severity: "critical" | "warning";
  message: string;
};

export type OperationalOwnershipEvidence = {
  surface: OperationalOwnershipSurface;
  status: OperationalOwnershipStatus;
  evidence: string[];
  verifiedResponsibilities: string[];
  forbiddenResponsibilitiesAbsent: string[];
  gaps?: string[];
};

export type OperationalOwnershipVerificationInput = {
  evidence: OperationalOwnershipEvidence[];
  canonicalLifecycle: string[];
};

export type OperationalOwnershipSummary = {
  confidence: "high" | "medium" | "low";
  surfaceStatus: Record<
    OperationalOwnershipSurface,
    OperationalOwnershipStatus | "missing"
  >;
  findings: OperationalOwnershipFinding[];
  missingOrBlocked: OperationalOwnershipEvidence[];
};

const canonicalLifecycle = [
  "opportunity",
  "customer",
  "project",
  "estimate",
  "contract",
  "change_order",
  "job",
  "invoice",
  "payment"
];

const requiredResponsibilities: Record<OperationalOwnershipSurface, string[]> =
  {
    dashboard: ["prioritizes"],
    project_workspace: ["diagnoses"],
    owning_workspace: ["acts"],
    settings: ["tenant_configuration"],
    super_admin: ["platform_policy"],
    portal: ["customer_safe_review_action"]
  };

const forbiddenResponsibilities: Record<OperationalOwnershipSurface, string[]> =
  {
    dashboard: [
      "source_of_truth",
      "workflow_mutation",
      "tenant_configuration",
      "platform_policy"
    ],
    project_workspace: [
      "source_of_truth",
      "workflow_mutation",
      "tenant_configuration",
      "platform_policy"
    ],
    owning_workspace: [
      "duplicate_record_model",
      "portal_owned_state",
      "platform_policy"
    ],
    settings: [
      "workflow_mutation",
      "source_record_ownership",
      "platform_policy"
    ],
    super_admin: [
      "tenant_source_record_ownership",
      "contractor_workflow_mutation",
      "portal_owned_state"
    ],
    portal: [
      "contractor_internal_truth",
      "tenant_configuration",
      "platform_policy",
      "portal_owned_state"
    ]
  };

function addFinding(
  findings: OperationalOwnershipFinding[],
  finding: OperationalOwnershipFinding
) {
  findings.push(finding);
}

function hasAllValues(input: { actual: string[]; expected: string[] }) {
  const actual = new Set(input.actual);
  return input.expected.every((value) => actual.has(value));
}

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

export function getOperationalOwnershipRequiredResponsibilities(
  surface: OperationalOwnershipSurface
) {
  return [...requiredResponsibilities[surface]];
}

export function getOperationalOwnershipForbiddenResponsibilities(
  surface: OperationalOwnershipSurface
) {
  return [...forbiddenResponsibilities[surface]];
}

export function verifyOperationalOwnership(
  input: OperationalOwnershipVerificationInput
): OperationalOwnershipSummary {
  const findings: OperationalOwnershipFinding[] = [];
  const surfaceStatus = Object.fromEntries(
    operationalOwnershipSurfaceOrder.map((surface) => [surface, "missing"])
  ) as OperationalOwnershipSummary["surfaceStatus"];
  const evidenceBySurface = new Map(
    input.evidence.map((item) => [item.surface, item])
  );

  for (const surface of operationalOwnershipSurfaceOrder) {
    const item = evidenceBySurface.get(surface);

    if (!item) {
      addFinding(findings, {
        id: `${surface}:missing`,
        surface,
        severity: "critical",
        message: `${surface} ownership evidence is missing.`
      });
      continue;
    }

    surfaceStatus[surface] = item.status;

    if (item.status === "blocked") {
      addFinding(findings, {
        id: `${surface}:blocked`,
        surface,
        severity: "critical",
        message: `${surface} ownership evidence is blocked.`
      });
    }

    if (item.status === "partial") {
      addFinding(findings, {
        id: `${surface}:partial`,
        surface,
        severity: "warning",
        message: `${surface} ownership evidence is partial.`
      });
    }

    if (
      !hasAllValues({
        actual: item.verifiedResponsibilities,
        expected: requiredResponsibilities[surface]
      })
    ) {
      addFinding(findings, {
        id: `${surface}:required-responsibility`,
        surface,
        severity: "critical",
        message: `${surface} does not verify its required ownership responsibility.`
      });
    }

    if (
      !hasAllValues({
        actual: item.forbiddenResponsibilitiesAbsent,
        expected: forbiddenResponsibilities[surface]
      })
    ) {
      addFinding(findings, {
        id: `${surface}:forbidden-responsibility`,
        surface,
        severity: "critical",
        message: `${surface} does not prove forbidden ownership responsibilities are absent.`
      });
    }
  }

  if (input.canonicalLifecycle.join(">") !== canonicalLifecycle.join(">")) {
    addFinding(findings, {
      id: "canonical-lifecycle:order",
      surface: "project_workspace",
      severity: "critical",
      message:
        "Operational ownership verification must preserve the canonical lifecycle order."
    });
  }

  const criticalFindingCount = findings.filter(
    (finding) => finding.severity === "critical"
  ).length;
  const warningFindingCount = findings.filter(
    (finding) => finding.severity === "warning"
  ).length;

  return {
    confidence: getConfidence({ criticalFindingCount, warningFindingCount }),
    surfaceStatus,
    findings,
    missingOrBlocked: input.evidence.filter(
      (item) => item.status === "blocked" || item.status === "partial"
    )
  };
}
