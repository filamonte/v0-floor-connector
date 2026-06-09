export const guidedProjectCaptureRequiredStreams = [
  "assessment-package-model-v1",
  "guided-capture-workspace-v1",
  "customer-assessment-capture-v1",
  "assessment-to-estimate-handoff-v1"
] as const;

export type GuidedProjectCaptureStream =
  (typeof guidedProjectCaptureRequiredStreams)[number];

export type GuidedProjectCaptureAssertion =
  | "project_owns_assessment_context"
  | "estimate_consumes_approved_context"
  | "portal_customer_safe"
  | "ai_review_assist_only"
  | "no_duplicate_project_model"
  | "no_duplicate_estimate_model"
  | "no_duplicate_attachment_model"
  | "no_duplicate_task_workflow_model"
  | "no_schema_migration_drift"
  | "no_autonomous_approval"
  | "no_direct_pricing_or_estimate_line_generation";

export type GuidedProjectCaptureImplementationEvidence = {
  stream: GuidedProjectCaptureStream;
  commit: string;
  files: string[];
  assertions: GuidedProjectCaptureAssertion[];
};

export type GuidedProjectCaptureVerificationInput = {
  evidence: GuidedProjectCaptureImplementationEvidence[];
};

export type GuidedProjectCaptureVerificationSummary = {
  status: "pass" | "fail";
  failures: string[];
  reviewedCommits: string[];
  reviewedFiles: string[];
  streamStatus: Record<GuidedProjectCaptureStream, "verified" | "missing">;
};

const requiredCommitByStream: Record<GuidedProjectCaptureStream, string> = {
  "assessment-package-model-v1": "38093cdf",
  "guided-capture-workspace-v1": "ebfc42fc",
  "customer-assessment-capture-v1": "799b40ca",
  "assessment-to-estimate-handoff-v1": "ebb45fa9"
};

const requiredAssertionsByStream: Record<
  GuidedProjectCaptureStream,
  GuidedProjectCaptureAssertion[]
> = {
  "assessment-package-model-v1": [
    "project_owns_assessment_context",
    "no_duplicate_project_model",
    "no_duplicate_estimate_model",
    "no_duplicate_attachment_model",
    "no_schema_migration_drift"
  ],
  "guided-capture-workspace-v1": [
    "project_owns_assessment_context",
    "ai_review_assist_only",
    "no_duplicate_task_workflow_model",
    "no_schema_migration_drift",
    "no_autonomous_approval"
  ],
  "customer-assessment-capture-v1": [
    "portal_customer_safe",
    "no_duplicate_attachment_model",
    "no_schema_migration_drift",
    "no_autonomous_approval",
    "no_direct_pricing_or_estimate_line_generation"
  ],
  "assessment-to-estimate-handoff-v1": [
    "estimate_consumes_approved_context",
    "no_duplicate_estimate_model",
    "no_schema_migration_drift",
    "no_direct_pricing_or_estimate_line_generation"
  ]
};

const forbiddenPathMatchers = [
  /(^|\/)supabase\/migrations\//i,
  /(^|\/)migrations?\//i,
  /(^|\/)schema\.(ts|tsx|sql)$/i,
  /(^|\/)schemas\.(ts|tsx)$/i,
  /(^|\/)database\//i,
  /(^|\/)db\//i,
  /project[-_]model/i,
  /estimate[-_]model/i,
  /attachment[-_]model/i,
  /task[-_]model/i,
  /workflow[-_]engine/i,
  /estimate[-_]line[-_]generator/i,
  /pricing[-_]engine/i
];

const expectedFilePrefixesByStream: Record<GuidedProjectCaptureStream, string> =
  {
    "assessment-package-model-v1": "apps/web/lib/projects/",
    "guided-capture-workspace-v1": "apps/web/lib/projects/",
    "customer-assessment-capture-v1": "apps/web/lib/portal/",
    "assessment-to-estimate-handoff-v1": "apps/web/lib/estimates/"
  };

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}

function hasAllAssertions(input: {
  actual: GuidedProjectCaptureAssertion[];
  expected: GuidedProjectCaptureAssertion[];
}) {
  const actual = new Set(input.actual);

  return input.expected.every((assertion) => actual.has(assertion));
}

function commitMatches(input: { actual: string; expected: string }) {
  return input.actual.startsWith(input.expected);
}

function hasForbiddenPath(files: string[]) {
  return files
    .map(normalizePath)
    .find((file) =>
      forbiddenPathMatchers.some((matcher) => matcher.test(file))
    );
}

export function verifyGuidedProjectCaptureBoundaries(
  input: GuidedProjectCaptureVerificationInput
): GuidedProjectCaptureVerificationSummary {
  const failures: string[] = [];
  const evidenceByStream = new Map(
    input.evidence.map((item) => [item.stream, item])
  );
  const streamStatus = Object.fromEntries(
    guidedProjectCaptureRequiredStreams.map((stream) => [stream, "missing"])
  ) as GuidedProjectCaptureVerificationSummary["streamStatus"];

  for (const stream of guidedProjectCaptureRequiredStreams) {
    const evidence = evidenceByStream.get(stream);

    if (!evidence) {
      failures.push(`${stream} evidence is missing.`);
      continue;
    }

    streamStatus[stream] = "verified";

    if (
      !commitMatches({
        actual: evidence.commit,
        expected: requiredCommitByStream[stream]
      })
    ) {
      failures.push(
        `${stream} commit ${evidence.commit} does not match expected ${requiredCommitByStream[stream]}.`
      );
    }

    if (evidence.files.length === 0) {
      failures.push(`${stream} has no changed-file evidence.`);
    }

    const expectedPrefix = expectedFilePrefixesByStream[stream];
    const outOfBoundaryFile = evidence.files
      .map(normalizePath)
      .find((file) => !file.startsWith(expectedPrefix));

    if (outOfBoundaryFile) {
      failures.push(
        `${stream} changed ${outOfBoundaryFile}, outside expected ${expectedPrefix}.`
      );
    }

    const forbiddenFile = hasForbiddenPath(evidence.files);

    if (forbiddenFile) {
      failures.push(
        `${stream} changed forbidden schema, migration, duplicate-model, task, workflow, pricing, or estimate-line path ${forbiddenFile}.`
      );
    }

    if (
      !hasAllAssertions({
        actual: evidence.assertions,
        expected: requiredAssertionsByStream[stream]
      })
    ) {
      failures.push(`${stream} is missing required boundary assertions.`);
    }
  }

  return {
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    reviewedCommits: unique(input.evidence.map((item) => item.commit)),
    reviewedFiles: unique(input.evidence.flatMap((item) => item.files)),
    streamStatus
  };
}
