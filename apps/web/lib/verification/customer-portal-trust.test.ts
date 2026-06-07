import assert from "node:assert/strict";
import test from "node:test";

import {
  type CustomerPortalTrustStreamEvidence,
  verifyCustomerPortalTrustWave
} from "./customer-portal-trust";

const implementationStreams: CustomerPortalTrustStreamEvidence[] = [
  {
    id: "portal-project-clarity-v1",
    branch: "stream/portal-project-clarity-v1",
    commitHash: "6e2df75c23e8867452b09a80e4cb8279ab648fdd",
    commitMessage: "feat: improve portal project clarity",
    clean: true,
    implementationComplete: true,
    filesChanged: [
      "apps/web/app/(portal)/portal/projects/[projectId]/page.tsx",
      "apps/web/components/portal-project-summary-panel.tsx",
      "apps/web/lib/portal/project-status-window.test.ts",
      "apps/web/lib/portal/project-status-window.ts"
    ],
    validations: [
      "pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/project-status-window.test.ts",
      "pnpm.cmd --filter @floorconnector/web typecheck",
      "pnpm.cmd --filter @floorconnector/web lint",
      "pnpm.cmd fc:preflight:fast",
      "git diff --check"
    ],
    protectsCanonicalRecords: true,
    avoidsDuplicateModels: true,
    avoidsSchemaOrMigrationChanges: true,
    avoidsAutonomousCustomerActions: true
  },
  {
    id: "portal-financial-visibility-v1",
    branch: "stream/portal-financial-visibility-v1",
    commitHash: "e64af7ba2359aad0365bcb3e4fa3fc4e1f85ab54",
    commitMessage: "feat: improve portal financial visibility",
    clean: true,
    implementationComplete: true,
    filesChanged: [
      "apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx",
      "apps/web/app/(portal)/portal/projects/[projectId]/page.tsx",
      "apps/web/lib/portal/financial-visibility.test.ts",
      "apps/web/lib/portal/financial-visibility.ts",
      "docs/current-state.md"
    ],
    validations: [
      "pnpm.cmd --filter @floorconnector/web exec tsx --test ./lib/portal/financial-visibility.test.ts",
      "pnpm.cmd --filter @floorconnector/web typecheck",
      "pnpm.cmd --filter @floorconnector/web lint",
      "pnpm.cmd fc:preflight:fast",
      "git diff --check"
    ],
    protectsCanonicalRecords: true,
    avoidsDuplicateModels: true,
    avoidsSchemaOrMigrationChanges: true,
    avoidsAutonomousCustomerActions: true
  },
  {
    id: "portal-communication-trust-v1",
    branch: "stream/portal-communication-trust-v1",
    commitHash: "56bf9ff62c7aa93bba267c4ba945f1e24fb79c6d",
    commitMessage: "feat: improve portal communication trust",
    clean: true,
    implementationComplete: true,
    filesChanged: [
      "apps/web/app/(portal)/portal/projects/[projectId]/page.tsx",
      "apps/web/lib/communications/portal-project-summary.test.ts",
      "apps/web/lib/communications/portal-project-summary.ts",
      "docs/current-state.md"
    ],
    validations: [
      "pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/portal-project-summary.test.ts",
      "pnpm.cmd --filter @floorconnector/web typecheck",
      "pnpm.cmd --filter @floorconnector/web lint",
      "pnpm.cmd fc:preflight:fast",
      "pnpm.cmd e2e:portal",
      "git diff --check"
    ],
    protectsCanonicalRecords: true,
    avoidsDuplicateModels: true,
    avoidsSchemaOrMigrationChanges: true,
    avoidsAutonomousCustomerActions: true
  }
];

void test("customer portal trust verification accepts committed implementation evidence with merge-attention warnings", () => {
  const summary = verifyCustomerPortalTrustWave({
    streams: implementationStreams,
    dirtyOutOfScopeWorktrees: [
      {
        worktree: "C:/FC-worktrees/project-next-actions",
        filesChanged: [
          "apps/web/app/(app)/contracts/[contractId]/page.tsx",
          "apps/web/app/(app)/customers/[customerId]/page.tsx",
          "apps/web/app/(app)/invoices/[invoiceId]/page.tsx",
          "apps/web/app/(app)/projects/[projectId]/page.tsx",
          "apps/web/components/related-conversations-card.tsx",
          "apps/web/lib/communications/record-continuity.test.ts",
          "apps/web/lib/communications/record-continuity.ts",
          "docs/current-state.md"
        ]
      }
    ]
  });

  assert.equal(summary.confidence, "medium");
  assert.equal(summary.verificationReady, true);
  assert.equal(summary.reviewPacketReady, true);
  assert.equal(summary.humanAttentionRequired, true);
  assert.deepEqual(
    summary.implementationOverlaps[
      "apps/web/app/(portal)/portal/projects/[projectId]/page.tsx"
    ],
    [
      "portal-project-clarity-v1",
      "portal-financial-visibility-v1",
      "portal-communication-trust-v1"
    ]
  );
  assert.deepEqual(
    summary.dirtyOutOfScopeOverlaps["C:/FC-worktrees/project-next-actions"],
    ["docs/current-state.md"]
  );
});

void test("customer portal trust verification blocks schema or migration drift", () => {
  const [projectStream, ...remainingStreams] = implementationStreams;
  const summary = verifyCustomerPortalTrustWave({
    streams: [
      {
        ...projectStream,
        filesChanged: [
          ...projectStream.filesChanged,
          "supabase/migrations/20260607120000_portal_copy.sql"
        ],
        avoidsSchemaOrMigrationChanges: false
      },
      ...remainingStreams
    ],
    dirtyOutOfScopeWorktrees: []
  });

  assert.equal(summary.confidence, "low");
  assert.equal(summary.verificationReady, false);
  assert.ok(
    summary.findings.some(
      (finding) =>
        finding.id === "portal-project-clarity-v1:schema-migration-drift"
    )
  );
});

void test("customer portal trust verification blocks duplicate models and autonomous customer actions", () => {
  const [projectStream, financialStream, communicationStream] =
    implementationStreams;
  const summary = verifyCustomerPortalTrustWave({
    streams: [
      {
        ...projectStream,
        protectsCanonicalRecords: false,
        avoidsDuplicateModels: false
      },
      financialStream,
      {
        ...communicationStream,
        avoidsAutonomousCustomerActions: false
      }
    ],
    dirtyOutOfScopeWorktrees: []
  });

  assert.equal(summary.confidence, "low");
  assert.equal(summary.reviewPacketReady, false);
  assert.ok(
    summary.findings.some(
      (finding) =>
        finding.id === "portal-project-clarity-v1:canonical-boundary-drift"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) =>
        finding.id ===
        "portal-communication-trust-v1:autonomous-customer-action"
    )
  );
});

void test("customer portal trust verification escalates dirty out-of-scope production overlap", () => {
  const summary = verifyCustomerPortalTrustWave({
    streams: implementationStreams,
    dirtyOutOfScopeWorktrees: [
      {
        worktree: "C:/FC-worktrees/project-next-actions",
        filesChanged: [
          "apps/web/app/(portal)/portal/projects/[projectId]/page.tsx"
        ]
      }
    ]
  });

  assert.equal(summary.confidence, "low");
  assert.equal(summary.verificationReady, false);
  assert.ok(
    summary.findings.some(
      (finding) =>
        finding.id ===
        "dirty-out-of-scope-overlap:C:/FC-worktrees/project-next-actions"
    )
  );
});
