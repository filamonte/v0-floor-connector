import assert from "node:assert/strict";
import test from "node:test";

import {
  getOperationalOwnershipForbiddenResponsibilities,
  getOperationalOwnershipRequiredResponsibilities,
  operationalOwnershipSurfaceOrder
} from "./operational-ownership";
import {
  getSalesToProductionForbiddenBoundaries,
  getSalesToProductionRequiredProtectedBoundaries,
  getSalesToProductionVerificationAreas,
  verifySalesToProductionReadiness,
  type SalesToProductionCoverageInput
} from "./sales-to-production-readiness";
import type { ReadinessVerificationInput } from "./readiness-verification";

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

const readyCommercialInput = {
  estimateStatus: "approved" as const,
  siteAssessmentStatus: "completed" as const,
  hasContract: true,
  contractInternalApprovalStatus: "approved" as const,
  contractStatus: "signed" as const,
  requireContractInternalApproval: true,
  requireContractSignatureBeforeJobScheduling: true,
  requireDepositBeforeJobScheduling: true,
  requireFinancingApprovalBeforeJobScheduling: false,
  financingStatus: "not_applicable" as const,
  depositInvoiceStatus: "paid" as const,
  depositInvoiceRole: "deposit" as const
};

function verifiedCoverage(): SalesToProductionCoverageInput[] {
  return getSalesToProductionVerificationAreas().map((area) => ({
    area,
    status: "verified",
    evidence: [`${area} evidence`],
    protectedBoundaries: getSalesToProductionRequiredProtectedBoundaries(area),
    forbiddenBoundariesAbsent: getSalesToProductionForbiddenBoundaries(area)
  }));
}

function verifiedOwnershipEvidence() {
  return operationalOwnershipSurfaceOrder.map((surface) => ({
    surface,
    status: "verified" as const,
    evidence: [`${surface} evidence`],
    verifiedResponsibilities:
      getOperationalOwnershipRequiredResponsibilities(surface),
    forbiddenResponsibilitiesAbsent:
      getOperationalOwnershipForbiddenResponsibilities(surface)
  }));
}

function verificationInput(
  overrides: {
    coverage?: SalesToProductionCoverageInput[];
    commercialReadiness?: Partial<
      ReadinessVerificationInput["commercialReadiness"]
    >;
    storedReadyStatus?: "ready_to_schedule" | "waiting_on_deposit";
  } = {}
) {
  return {
    workflow: {
      opportunity: {
        id: "opportunity-1",
        customerId: "customer-1",
        projectId: "project-1",
        status: "converted"
      },
      customer: { id: "customer-1" },
      project: { id: "project-1", customerId: "customer-1" },
      estimate: {
        id: "estimate-1",
        customerId: "customer-1",
        projectId: "project-1",
        opportunityId: "opportunity-1",
        status: "approved"
      },
      contract: {
        id: "contract-1",
        customerId: "customer-1",
        projectId: "project-1",
        estimateId: "estimate-1",
        status: "signed"
      },
      job: {
        id: "job-1",
        customerId: "customer-1",
        projectId: "project-1",
        estimateId: "estimate-1",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-06-08"
      },
      invoice: {
        id: "invoice-1",
        customerId: "customer-1",
        projectId: "project-1",
        estimateId: "estimate-1",
        jobId: "job-1",
        status: "paid",
        balanceDueAmount: "0.00"
      },
      payment: {
        id: "payment-1",
        invoiceId: "invoice-1",
        status: "recorded",
        amount: "1000.00"
      },
      portal: {
        projectId: "project-1",
        estimateId: "estimate-1",
        contractId: "contract-1",
        invoiceId: "invoice-1",
        hasActiveGrant: true,
        hasActiveProjectAccess: true
      }
    },
    readiness: {
      storedProjectReadiness: {
        commercialReadinessStatus:
          overrides.storedReadyStatus ?? "ready_to_schedule",
        readyToScheduleAt: "2026-06-06T12:00:00.000Z"
      },
      commercialReadiness: {
        ...readyCommercialInput,
        ...overrides.commercialReadiness
      },
      contractSignature: {
        status: "signed" as const,
        signatureReadinessStatus: "signed" as const,
        signatureStartedAt: "2026-06-06T11:00:00.000Z",
        customerSignedAt: "2026-06-06T11:15:00.000Z",
        contractorCountersignedAt: null,
        signatureDeclinedAt: null,
        signatureVoidedAt: null,
        signers: [
          { signerRole: "customer" as const, signerStatus: "signed" as const }
        ]
      },
      job: {
        exists: true,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-06-08"
      },
      invoice: {
        exists: true,
        status: "paid" as const,
        workflowRole: "standard" as const,
        jobId: "job-1",
        balanceDueAmount: "0.00"
      }
    },
    ownership: {
      canonicalLifecycle,
      evidence: verifiedOwnershipEvidence()
    },
    coverage: overrides.coverage ?? verifiedCoverage()
  };
}

void test("sales-to-production readiness verification passes for one canonical handoff chain", () => {
  const summary = verifySalesToProductionReadiness(verificationInput());

  assert.equal(summary.confidence, "high");
  assert.equal(summary.workflowContinuous, true);
  assert.equal(summary.readyToSchedule, true);
  assert.equal(summary.ownershipConfidence, "high");
  assert.equal(summary.findings.length, 0);
  assert.equal(summary.coverageStatus.sales_readiness, "verified");
  assert.equal(summary.coverageStatus.schedule_handoff, "verified");
});

void test("sales-to-production readiness verification blocks duplicate models and portal-owned state", () => {
  const coverage = verifiedCoverage().map((item) =>
    item.area === "sales_readiness" || item.area === "portal_boundary"
      ? {
          ...item,
          forbiddenBoundariesAbsent: []
        }
      : item
  );
  const summary = verifySalesToProductionReadiness(
    verificationInput({ coverage })
  );

  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "sales_readiness:forbidden-boundaries"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "portal_boundary:forbidden-boundaries"
    )
  );
});

void test("sales-to-production readiness verification catches deposit readiness bypass before scheduling", () => {
  const summary = verifySalesToProductionReadiness(
    verificationInput({
      storedReadyStatus: "ready_to_schedule",
      commercialReadiness: {
        depositInvoiceStatus: "sent"
      }
    })
  );

  assert.equal(summary.confidence, "low");
  assert.equal(summary.readyToSchedule, false);
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "project-readiness:status-drift"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "job:readiness-bypass")
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "schedule:readiness-bypass"
    )
  );
});
