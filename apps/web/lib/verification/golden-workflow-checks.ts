import type {
  CanonicalGoldenWorkflowStage,
  WorkflowIntegrityFinding,
  WorkflowIntegrityInput
} from "./workflow-integrity";
import {
  canonicalGoldenWorkflowStages,
  verifyWorkflowIntegrity
} from "./workflow-integrity";
import type {
  ReadinessVerificationFinding,
  ReadinessVerificationInput
} from "./readiness-verification";
import { verifyReadinessContinuity } from "./readiness-verification";

export type GoldenWorkflowVerificationArea =
  | "workflow"
  | "readiness"
  | "contract"
  | "signature"
  | "job"
  | "schedule"
  | "invoice"
  | "payment"
  | "portal"
  | "project";

export type GoldenWorkflowCoverageStatus =
  | "verified"
  | "partial"
  | "missing"
  | "blocked";

export type GoldenWorkflowCoverageInput = {
  area: GoldenWorkflowVerificationArea;
  status: GoldenWorkflowCoverageStatus;
  evidence: string[];
  gaps?: string[];
};

export type GoldenWorkflowHealthInput = {
  workflow: WorkflowIntegrityInput;
  readiness: ReadinessVerificationInput;
  coverage: GoldenWorkflowCoverageInput[];
};

export type GoldenWorkflowHealthSummary = {
  confidence: "high" | "medium" | "low";
  stageStatus: Record<CanonicalGoldenWorkflowStage, "present" | "missing">;
  coverageStatus: Record<
    GoldenWorkflowVerificationArea,
    GoldenWorkflowCoverageStatus
  >;
  criticalFindingCount: number;
  warningFindingCount: number;
  findings: Array<
    | (WorkflowIntegrityFinding & { source: "workflow" })
    | (ReadinessVerificationFinding & { source: "readiness" })
  >;
  missingCoverage: GoldenWorkflowCoverageInput[];
};

const allCoverageAreas: GoldenWorkflowVerificationArea[] = [
  "workflow",
  "readiness",
  "contract",
  "signature",
  "job",
  "schedule",
  "invoice",
  "payment",
  "portal",
  "project"
];

function getConfidence(input: {
  criticalFindingCount: number;
  warningFindingCount: number;
  missingCoverageCount: number;
}) {
  if (input.criticalFindingCount > 0 || input.missingCoverageCount > 0) {
    return "low";
  }

  if (input.warningFindingCount > 0) {
    return "medium";
  }

  return "high";
}

export function buildGoldenWorkflowHealthSummary(
  input: GoldenWorkflowHealthInput
): GoldenWorkflowHealthSummary {
  const workflowSummary = verifyWorkflowIntegrity(input.workflow);
  const readinessSummary = verifyReadinessContinuity(input.readiness);
  const coverageStatus = Object.fromEntries(
    allCoverageAreas.map((area) => [area, "missing"])
  ) as Record<GoldenWorkflowVerificationArea, GoldenWorkflowCoverageStatus>;

  for (const item of input.coverage) {
    coverageStatus[item.area] = item.status;
  }

  const findings = [
    ...workflowSummary.findings.map((finding) => ({
      ...finding,
      source: "workflow" as const
    })),
    ...readinessSummary.findings.map((finding) => ({
      ...finding,
      source: "readiness" as const
    }))
  ];
  const criticalFindingCount = findings.filter(
    (finding) => finding.severity === "critical"
  ).length;
  const warningFindingCount = findings.filter(
    (finding) => finding.severity === "warning"
  ).length;
  const missingCoverage = input.coverage.filter(
    (item) => item.status === "missing" || item.status === "blocked"
  );

  return {
    confidence: getConfidence({
      criticalFindingCount,
      warningFindingCount,
      missingCoverageCount: missingCoverage.length
    }),
    stageStatus: workflowSummary.stageStatus,
    coverageStatus,
    criticalFindingCount,
    warningFindingCount,
    findings,
    missingCoverage
  };
}

export function getGoldenWorkflowStageOrder() {
  return [...canonicalGoldenWorkflowStages];
}
