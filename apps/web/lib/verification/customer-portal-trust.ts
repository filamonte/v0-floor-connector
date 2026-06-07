export type CustomerPortalTrustStreamId =
  | "portal-project-clarity-v1"
  | "portal-financial-visibility-v1"
  | "portal-communication-trust-v1";

export type CustomerPortalTrustFinding = {
  id: string;
  severity: "critical" | "warning";
  message: string;
  files?: string[];
};

export type CustomerPortalTrustStreamEvidence = {
  id: CustomerPortalTrustStreamId;
  branch: string;
  commitHash: string;
  commitMessage: string;
  clean: boolean;
  implementationComplete: boolean;
  filesChanged: string[];
  validations: string[];
  protectsCanonicalRecords: boolean;
  avoidsDuplicateModels: boolean;
  avoidsSchemaOrMigrationChanges: boolean;
  avoidsAutonomousCustomerActions: boolean;
};

export type CustomerPortalTrustDirtyWorktreeEvidence = {
  worktree: string;
  filesChanged: string[];
};

export type CustomerPortalTrustVerificationInput = {
  streams: CustomerPortalTrustStreamEvidence[];
  dirtyOutOfScopeWorktrees: CustomerPortalTrustDirtyWorktreeEvidence[];
};

export type CustomerPortalTrustVerificationSummary = {
  confidence: "high" | "medium" | "low";
  verificationReady: boolean;
  reviewPacketReady: boolean;
  humanAttentionRequired: boolean;
  findings: CustomerPortalTrustFinding[];
  implementationOverlaps: Record<string, CustomerPortalTrustStreamId[]>;
  dirtyOutOfScopeOverlaps: Record<string, string[]>;
};

const requiredStreams: CustomerPortalTrustStreamId[] = [
  "portal-project-clarity-v1",
  "portal-financial-visibility-v1",
  "portal-communication-trust-v1"
];

const forbiddenPathPatterns = [
  /^supabase\/migrations\//,
  /^packages\/database\/.*schema/i,
  /(^|\/)schema\.(ts|sql)$/i,
  /(^|\/)migration/i
];

function normalizePath(path: string) {
  return path.replaceAll("\\", "/");
}

function isSchemaOrMigrationPath(path: string) {
  const normalized = normalizePath(path);
  return forbiddenPathPatterns.some((pattern) => pattern.test(normalized));
}

function addFinding(
  findings: CustomerPortalTrustFinding[],
  finding: CustomerPortalTrustFinding
) {
  findings.push(finding);
}

function getConfidence(findings: CustomerPortalTrustFinding[]) {
  if (findings.some((finding) => finding.severity === "critical")) {
    return "low";
  }

  if (findings.some((finding) => finding.severity === "warning")) {
    return "medium";
  }

  return "high";
}

function collectImplementationOverlaps(
  streams: CustomerPortalTrustStreamEvidence[]
) {
  const fileOwners = new Map<string, CustomerPortalTrustStreamId[]>();

  for (const stream of streams) {
    for (const file of stream.filesChanged) {
      const normalized = normalizePath(file);
      const owners = fileOwners.get(normalized) ?? [];
      owners.push(stream.id);
      fileOwners.set(normalized, owners);
    }
  }

  return Object.fromEntries(
    [...fileOwners.entries()].filter(([, owners]) => owners.length > 1)
  );
}

function collectDirtyOutOfScopeOverlaps(input: {
  streams: CustomerPortalTrustStreamEvidence[];
  dirtyOutOfScopeWorktrees: CustomerPortalTrustDirtyWorktreeEvidence[];
}) {
  const streamFiles = new Set(
    input.streams.flatMap((stream) => stream.filesChanged.map(normalizePath))
  );
  const overlaps: Record<string, string[]> = {};

  for (const worktree of input.dirtyOutOfScopeWorktrees) {
    const overlappingFiles = worktree.filesChanged
      .map(normalizePath)
      .filter((file) => streamFiles.has(file));

    if (overlappingFiles.length > 0) {
      overlaps[worktree.worktree] = overlappingFiles;
    }
  }

  return overlaps;
}

export function verifyCustomerPortalTrustWave(
  input: CustomerPortalTrustVerificationInput
): CustomerPortalTrustVerificationSummary {
  const findings: CustomerPortalTrustFinding[] = [];
  const streamById = new Map(
    input.streams.map((stream) => [stream.id, stream])
  );

  for (const streamId of requiredStreams) {
    const stream = streamById.get(streamId);

    if (!stream) {
      addFinding(findings, {
        id: `${streamId}:missing`,
        severity: "critical",
        message: `${streamId} implementation evidence is missing.`
      });
      continue;
    }

    if (!stream.clean) {
      addFinding(findings, {
        id: `${streamId}:dirty`,
        severity: "critical",
        message: `${streamId} must be clean before verification can rely on it.`
      });
    }

    if (!stream.implementationComplete || stream.commitHash.length === 0) {
      addFinding(findings, {
        id: `${streamId}:incomplete`,
        severity: "critical",
        message: `${streamId} does not have complete committed implementation evidence.`
      });
    }

    const forbiddenFiles = stream.filesChanged.filter(isSchemaOrMigrationPath);
    if (forbiddenFiles.length > 0 || !stream.avoidsSchemaOrMigrationChanges) {
      addFinding(findings, {
        id: `${streamId}:schema-migration-drift`,
        severity: "critical",
        message:
          "Customer portal trust streams must not change schemas or migrations.",
        files: forbiddenFiles
      });
    }

    if (!stream.protectsCanonicalRecords || !stream.avoidsDuplicateModels) {
      addFinding(findings, {
        id: `${streamId}:canonical-boundary-drift`,
        severity: "critical",
        message:
          "Customer portal trust streams must project canonical project, financial, and communication records without duplicate portal-owned models."
      });
    }

    if (!stream.avoidsAutonomousCustomerActions) {
      addFinding(findings, {
        id: `${streamId}:autonomous-customer-action`,
        severity: "critical",
        message:
          "Customer portal trust streams must not introduce autonomous customer communications, billing actions, or workflow actions."
      });
    }

    if (stream.validations.length === 0) {
      addFinding(findings, {
        id: `${streamId}:validation-missing`,
        severity: "warning",
        message: `${streamId} has no recorded validation evidence.`
      });
    }
  }

  const implementationOverlaps = collectImplementationOverlaps(input.streams);
  for (const [file, owners] of Object.entries(implementationOverlaps)) {
    addFinding(findings, {
      id: `implementation-overlap:${file}`,
      severity: "warning",
      message:
        "Multiple implementation streams touch the same file and need coordinated merge review.",
      files: [file, ...owners]
    });
  }

  const dirtyOutOfScopeOverlaps = collectDirtyOutOfScopeOverlaps(input);
  for (const [worktree, files] of Object.entries(dirtyOutOfScopeOverlaps)) {
    const severity = files.every((file) => file === "docs/current-state.md")
      ? "warning"
      : "critical";

    addFinding(findings, {
      id: `dirty-out-of-scope-overlap:${worktree}`,
      severity,
      message:
        "A dirty out-of-scope worktree touches file(s) also touched by this wave.",
      files
    });
  }

  const hasCritical = findings.some(
    (finding) => finding.severity === "critical"
  );

  return {
    confidence: getConfidence(findings),
    verificationReady: !hasCritical,
    reviewPacketReady: !hasCritical,
    humanAttentionRequired: findings.length > 0,
    findings,
    implementationOverlaps,
    dirtyOutOfScopeOverlaps
  };
}
