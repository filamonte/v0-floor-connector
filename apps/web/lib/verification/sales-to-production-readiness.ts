import type { OperationalOwnershipVerificationInput } from "./operational-ownership";
import { verifyOperationalOwnership } from "./operational-ownership";
import type { ReadinessVerificationInput } from "./readiness-verification";
import { verifyReadinessContinuity } from "./readiness-verification";
import type { WorkflowIntegrityInput } from "./workflow-integrity";
import { verifyWorkflowIntegrity } from "./workflow-integrity";

export type SalesToProductionVerificationArea =
  | "sales_readiness"
  | "estimate_contract_readiness"
  | "deposit_financial_readiness"
  | "schedule_handoff"
  | "project_diagnosis"
  | "settings_configuration"
  | "portal_boundary";

export type SalesToProductionCoverageStatus =
  | "verified"
  | "partial"
  | "blocked";

export type SalesToProductionCoverageInput = {
  area: SalesToProductionVerificationArea;
  status: SalesToProductionCoverageStatus;
  evidence: string[];
  protectedBoundaries: string[];
  forbiddenBoundariesAbsent: string[];
  gaps?: string[];
};

export type SalesToProductionReadinessVerificationInput = {
  workflow: WorkflowIntegrityInput;
  readiness: ReadinessVerificationInput;
  ownership: OperationalOwnershipVerificationInput;
  coverage: SalesToProductionCoverageInput[];
};

export type SalesToProductionReadinessFinding = {
  id: string;
  area: SalesToProductionVerificationArea | "workflow" | "ownership";
  severity: "critical" | "warning";
  message: string;
};

export type SalesToProductionReadinessVerificationSummary = {
  confidence: "high" | "medium" | "low";
  workflowContinuous: boolean;
  readyToSchedule: boolean;
  ownershipConfidence: "high" | "medium" | "low";
  coverageStatus: Record<
    SalesToProductionVerificationArea,
    SalesToProductionCoverageStatus | "missing"
  >;
  findings: SalesToProductionReadinessFinding[];
  missingOrBlockedCoverage: SalesToProductionCoverageInput[];
};

const salesToProductionAreas: SalesToProductionVerificationArea[] = [
  "sales_readiness",
  "estimate_contract_readiness",
  "deposit_financial_readiness",
  "schedule_handoff",
  "project_diagnosis",
  "settings_configuration",
  "portal_boundary"
];

const requiredProtectedBoundaries: Record<
  SalesToProductionVerificationArea,
  string[]
> = {
  sales_readiness: [
    "opportunity_upstream_input",
    "site_assessment_upstream_input",
    "no_customer_project_duplication"
  ],
  estimate_contract_readiness: [
    "canonical_estimate_contract_project",
    "contract_signature_readiness_boundary"
  ],
  deposit_financial_readiness: [
    "canonical_invoice_payment_state",
    "deposit_blocks_schedule_until_ready"
  ],
  schedule_handoff: [
    "field_owns_execution_action",
    "schedule_uses_canonical_jobs"
  ],
  project_diagnosis: ["project_diagnoses_next_owner"],
  settings_configuration: ["settings_owns_workflow_defaults"],
  portal_boundary: ["portal_customer_safe_review_only"]
};

const forbiddenBoundaries: Record<SalesToProductionVerificationArea, string[]> =
  {
    sales_readiness: [
      "duplicate_customer_model",
      "duplicate_project_model",
      "dashboard_sprawl"
    ],
    estimate_contract_readiness: [
      "duplicate_contract_model",
      "duplicate_signature_model",
      "settings_mutation_from_operational_page"
    ],
    deposit_financial_readiness: [
      "detached_invoice_model",
      "detached_payment_model",
      "financial_math_drift"
    ],
    schedule_handoff: [
      "duplicate_dispatch_model",
      "autonomous_dispatch",
      "route_optimization"
    ],
    project_diagnosis: ["project_executes_owned_actions"],
    settings_configuration: ["settings_owns_source_records"],
    portal_boundary: ["portal_owned_state", "portal_internal_readiness"]
  };

function includesAll(input: { actual: string[]; expected: string[] }) {
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

export function getSalesToProductionRequiredProtectedBoundaries(
  area: SalesToProductionVerificationArea
) {
  return [...requiredProtectedBoundaries[area]];
}

export function getSalesToProductionForbiddenBoundaries(
  area: SalesToProductionVerificationArea
) {
  return [...forbiddenBoundaries[area]];
}

export function getSalesToProductionVerificationAreas() {
  return [...salesToProductionAreas];
}

export function verifySalesToProductionReadiness(
  input: SalesToProductionReadinessVerificationInput
): SalesToProductionReadinessVerificationSummary {
  const findings: SalesToProductionReadinessFinding[] = [];
  const workflowSummary = verifyWorkflowIntegrity(input.workflow);
  const readinessSummary = verifyReadinessContinuity(input.readiness);
  const ownershipSummary = verifyOperationalOwnership(input.ownership);
  const coverageStatus = Object.fromEntries(
    salesToProductionAreas.map((area) => [area, "missing"])
  ) as SalesToProductionReadinessVerificationSummary["coverageStatus"];
  const coverageByArea = new Map(
    input.coverage.map((item) => [item.area, item])
  );

  if (!workflowSummary.isContinuous) {
    findings.push({
      id: "workflow:canonical-continuity",
      area: "workflow",
      severity: "critical",
      message:
        "Sales-to-production verification requires one continuous canonical workflow chain."
    });
  }

  if (ownershipSummary.confidence === "low") {
    findings.push({
      id: "ownership:critical",
      area: "ownership",
      severity: "critical",
      message: "Operational ownership verification has critical findings."
    });
  } else if (ownershipSummary.confidence === "medium") {
    findings.push({
      id: "ownership:partial",
      area: "ownership",
      severity: "warning",
      message: "Operational ownership verification has partial evidence."
    });
  }

  for (const readinessFinding of readinessSummary.findings) {
    findings.push({
      id: readinessFinding.id,
      area: "deposit_financial_readiness",
      severity: readinessFinding.severity,
      message: readinessFinding.message
    });
  }

  for (const area of salesToProductionAreas) {
    const coverage = coverageByArea.get(area);

    if (!coverage) {
      findings.push({
        id: `${area}:missing`,
        area,
        severity: "critical",
        message: `${area} verification coverage is missing.`
      });
      continue;
    }

    coverageStatus[area] = coverage.status;

    if (coverage.status === "blocked") {
      findings.push({
        id: `${area}:blocked`,
        area,
        severity: "critical",
        message: `${area} verification coverage is blocked.`
      });
    }

    if (coverage.status === "partial") {
      findings.push({
        id: `${area}:partial`,
        area,
        severity: "warning",
        message: `${area} verification coverage is partial.`
      });
    }

    if (
      !includesAll({
        actual: coverage.protectedBoundaries,
        expected: requiredProtectedBoundaries[area]
      })
    ) {
      findings.push({
        id: `${area}:protected-boundaries`,
        area,
        severity: "critical",
        message: `${area} is missing required protected boundary evidence.`
      });
    }

    if (
      !includesAll({
        actual: coverage.forbiddenBoundariesAbsent,
        expected: forbiddenBoundaries[area]
      })
    ) {
      findings.push({
        id: `${area}:forbidden-boundaries`,
        area,
        severity: "critical",
        message: `${area} does not prove forbidden boundaries are absent.`
      });
    }
  }

  const criticalFindingCount = findings.filter(
    (finding) => finding.severity === "critical"
  ).length;
  const warningFindingCount = findings.filter(
    (finding) => finding.severity === "warning"
  ).length;

  return {
    confidence: getConfidence({
      criticalFindingCount,
      warningFindingCount
    }),
    workflowContinuous: workflowSummary.isContinuous,
    readyToSchedule: readinessSummary.isReadyToSchedule,
    ownershipConfidence: ownershipSummary.confidence,
    coverageStatus,
    findings,
    missingOrBlockedCoverage: input.coverage.filter(
      (item) => item.status === "blocked" || item.status === "partial"
    )
  };
}
