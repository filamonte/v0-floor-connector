export type UxIaImplementationStream =
  | "golden-workflow-usability-review-v1"
  | "workspace-density-polish-v1"
  | "manager-page-ownership-polish-v1"
  | "portal-customer-clarity-polish-v1";

export type UxIaOwnershipArea =
  | "dashboard"
  | "project"
  | "field"
  | "financials"
  | "communications"
  | "portal"
  | "reports"
  | "settings"
  | "schema_and_models";

export type UxIaVerificationStatus = "verified" | "partial" | "blocked";

export type UxIaImplementationCommitReview = {
  stream: UxIaImplementationStream;
  commitHash: string;
  status: UxIaVerificationStatus;
  changedPaths: string[];
  evidence: string[];
};

export type UxIaOwnershipCoverageInput = {
  area: UxIaOwnershipArea;
  status: UxIaVerificationStatus;
  evidence: string[];
  protectedBoundaries: string[];
  forbiddenBoundariesAbsent: string[];
  gaps?: string[];
};

export type UxIaOwnershipVerificationInput = {
  implementationReviews: UxIaImplementationCommitReview[];
  coverage: UxIaOwnershipCoverageInput[];
};

export type UxIaOwnershipFinding = {
  id: string;
  area: UxIaOwnershipArea | "implementation";
  severity: "critical" | "warning";
  message: string;
};

export type UxIaOwnershipVerificationSummary = {
  confidence: "high" | "medium" | "low";
  implementationStatus: Record<
    UxIaImplementationStream,
    UxIaVerificationStatus | "missing"
  >;
  coverageStatus: Record<UxIaOwnershipArea, UxIaVerificationStatus | "missing">;
  schemaDriftPaths: string[];
  findings: UxIaOwnershipFinding[];
  missingOrBlockedCoverage: UxIaOwnershipCoverageInput[];
};

const uxIaOwnershipAreas: UxIaOwnershipArea[] = [
  "dashboard",
  "project",
  "field",
  "financials",
  "communications",
  "portal",
  "reports",
  "settings",
  "schema_and_models"
];

const requiredImplementationCommits: Record<UxIaImplementationStream, string> =
  {
    "golden-workflow-usability-review-v1": "a952ebf6",
    "workspace-density-polish-v1": "797483ff",
    "manager-page-ownership-polish-v1": "2b3549df",
    "portal-customer-clarity-polish-v1": "cad90b36"
  };

const requiredProtectedBoundaries: Record<UxIaOwnershipArea, string[]> = {
  dashboard: ["prioritizes_attention", "routes_to_owning_workspaces"],
  project: ["diagnoses_project_state", "routes_actions_to_source_records"],
  field: [
    "executes_jobs_schedule_logs_evidence",
    "uses_canonical_execution_records"
  ],
  financials: [
    "owns_billing_collections_payment_actions",
    "uses_canonical_invoices_payments_events"
  ],
  communications: [
    "owns_conversation_action",
    "uses_canonical_threads_messages"
  ],
  portal: ["customer_safe_review_action", "scoped_to_canonical_records"],
  reports: ["summarizes_and_routes", "no_operating_action_ownership"],
  settings: ["owns_tenant_configuration"],
  schema_and_models: ["no_schema_migration_drift", "no_duplicate_models"]
};

const forbiddenBoundaries: Record<UxIaOwnershipArea, string[]> = {
  dashboard: [
    "workflow_mutation",
    "dashboard_owned_action_state",
    "duplicate_dashboard_model"
  ],
  project: [
    "project_executes_field_financial_communication_action",
    "duplicate_project_activity_model",
    "settings_configuration_leakage"
  ],
  field: [
    "duplicate_dispatch_model",
    "duplicate_field_model",
    "portal_owned_execution_state"
  ],
  financials: [
    "detached_invoice_model",
    "detached_payment_model",
    "financial_math_drift",
    "provider_behavior_change"
  ],
  communications: [
    "detached_inbox_truth",
    "duplicate_message_model",
    "autonomous_customer_send",
    "provider_owned_truth"
  ],
  portal: [
    "portal_owned_state",
    "contractor_internal_truth",
    "field_proof_exposure",
    "payment_provider_change"
  ],
  reports: [
    "reporting_persistence",
    "duplicate_report_model",
    "reports_owned_action_state"
  ],
  settings: [
    "source_record_ownership",
    "operational_page_configuration_mutation",
    "platform_policy"
  ],
  schema_and_models: [
    "migration_file_changed",
    "package_db_schema_drift",
    "duplicate_business_model",
    "local_only_persistence"
  ]
};

const schemaDriftPathPrefixes = [
  "supabase/migrations/",
  "packages/db/",
  "packages/types/src/database"
];

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

function normalizedPath(path: string) {
  return path.replaceAll("\\", "/");
}

function getSchemaDriftPaths(reviews: UxIaImplementationCommitReview[]) {
  return reviews.flatMap((review) =>
    review.changedPaths.filter((path) => {
      const normalized = normalizedPath(path);
      return schemaDriftPathPrefixes.some((prefix) =>
        normalized.startsWith(prefix)
      );
    })
  );
}

export function getUxIaOwnershipAreas() {
  return [...uxIaOwnershipAreas];
}

export function getRequiredUxIaImplementationCommits() {
  return Object.entries(requiredImplementationCommits).map(
    ([stream, commitHash]) => ({
      stream: stream as UxIaImplementationStream,
      commitHash
    })
  );
}

export function getUxIaRequiredProtectedBoundaries(area: UxIaOwnershipArea) {
  return [...requiredProtectedBoundaries[area]];
}

export function getUxIaForbiddenBoundaries(area: UxIaOwnershipArea) {
  return [...forbiddenBoundaries[area]];
}

export function verifyUxIaOwnership(
  input: UxIaOwnershipVerificationInput
): UxIaOwnershipVerificationSummary {
  const findings: UxIaOwnershipFinding[] = [];
  const implementationStatus = Object.fromEntries(
    Object.keys(requiredImplementationCommits).map((stream) => [
      stream,
      "missing"
    ])
  ) as UxIaOwnershipVerificationSummary["implementationStatus"];
  const coverageStatus = Object.fromEntries(
    uxIaOwnershipAreas.map((area) => [area, "missing"])
  ) as UxIaOwnershipVerificationSummary["coverageStatus"];
  const reviewsByStream = new Map(
    input.implementationReviews.map((review) => [review.stream, review])
  );
  const coverageByArea = new Map(
    input.coverage.map((coverage) => [coverage.area, coverage])
  );

  for (const [stream, requiredHash] of Object.entries(
    requiredImplementationCommits
  ) as [UxIaImplementationStream, string][]) {
    const review = reviewsByStream.get(stream);

    if (!review) {
      findings.push({
        id: `${stream}:missing`,
        area: "implementation",
        severity: "critical",
        message: `${stream} implementation commit review is missing.`
      });
      continue;
    }

    implementationStatus[stream] = review.status;

    if (!review.commitHash.startsWith(requiredHash)) {
      findings.push({
        id: `${stream}:commit-mismatch`,
        area: "implementation",
        severity: "critical",
        message: `${stream} was reviewed against ${review.commitHash}, not expected commit ${requiredHash}.`
      });
    }

    if (review.status === "blocked") {
      findings.push({
        id: `${stream}:blocked`,
        area: "implementation",
        severity: "critical",
        message: `${stream} implementation review is blocked.`
      });
    }

    if (review.status === "partial") {
      findings.push({
        id: `${stream}:partial`,
        area: "implementation",
        severity: "warning",
        message: `${stream} implementation review is partial.`
      });
    }
  }

  const schemaDriftPaths = getSchemaDriftPaths(input.implementationReviews);

  if (schemaDriftPaths.length > 0) {
    findings.push({
      id: "schema-and-models:schema-drift-paths",
      area: "schema_and_models",
      severity: "critical",
      message:
        "UX/IA verification found schema, migration, or generated database type drift in implementation changes."
    });
  }

  for (const area of uxIaOwnershipAreas) {
    const coverage = coverageByArea.get(area);

    if (!coverage) {
      findings.push({
        id: `${area}:missing`,
        area,
        severity: "critical",
        message: `${area} UX/IA ownership coverage is missing.`
      });
      continue;
    }

    coverageStatus[area] = coverage.status;

    if (coverage.status === "blocked") {
      findings.push({
        id: `${area}:blocked`,
        area,
        severity: "critical",
        message: `${area} UX/IA ownership coverage is blocked.`
      });
    }

    if (coverage.status === "partial") {
      findings.push({
        id: `${area}:partial`,
        area,
        severity: "warning",
        message: `${area} UX/IA ownership coverage is partial.`
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
        message: `${area} is missing required UX/IA ownership boundary evidence.`
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
        message: `${area} does not prove forbidden UX/IA ownership boundaries are absent.`
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
    confidence: getConfidence({ criticalFindingCount, warningFindingCount }),
    implementationStatus,
    coverageStatus,
    schemaDriftPaths,
    findings,
    missingOrBlockedCoverage: input.coverage.filter(
      (item) => item.status === "blocked" || item.status === "partial"
    )
  };
}
