import assert from "node:assert/strict";
import test from "node:test";

import { buildGoldenWorkflowHealthSummary } from "./golden-workflow-checks";
import { verifyReadinessContinuity } from "./readiness-verification";
import { verifyWorkflowIntegrity } from "./workflow-integrity";

const readyCommercialInput = {
  estimateStatus: "approved" as const,
  siteAssessmentStatus: "completed" as const,
  hasContract: true,
  contractInternalApprovalStatus: "approved" as const,
  contractStatus: "signed" as const,
  requireContractInternalApproval: true,
  requireContractSignatureBeforeJobScheduling: true,
  requireDepositBeforeJobScheduling: false,
  requireFinancingApprovalBeforeJobScheduling: false,
  financingStatus: "not_applicable" as const,
  depositInvoiceStatus: null,
  depositInvoiceRole: null
};

void test("workflow integrity verifies canonical links through payment and portal", () => {
  const summary = verifyWorkflowIntegrity({
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
      scheduledDate: "2026-06-01"
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
  });

  assert.equal(summary.isContinuous, true);
  assert.equal(summary.findings.length, 0);
  assert.equal(summary.stageStatus.payment, "present");
});

void test("workflow integrity flags portal copies and broken invoice payment links", () => {
  const summary = verifyWorkflowIntegrity({
    customer: { id: "customer-1" },
    project: { id: "project-1", customerId: "customer-1" },
    invoice: {
      id: "invoice-1",
      customerId: "customer-1",
      projectId: "project-1",
      status: "sent",
      balanceDueAmount: "100.00"
    },
    payment: {
      id: "payment-1",
      invoiceId: "portal-invoice-copy",
      status: "recorded"
    },
    portal: {
      projectId: "portal-project-copy",
      invoiceId: "portal-invoice-copy",
      hasActiveGrant: true,
      hasActiveProjectAccess: true
    }
  });

  assert.equal(summary.isContinuous, false);
  assert.ok(
    summary.findings.some((finding) => finding.id === "payment:invoice-link")
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "portal:project-link")
  );
});

void test("readiness verification blocks job, schedule, and standard invoice bypasses", () => {
  const summary = verifyReadinessContinuity({
    storedProjectReadiness: {
      commercialReadinessStatus: "ready_to_schedule",
      readyToScheduleAt: "2026-05-29T12:00:00.000Z"
    },
    commercialReadiness: {
      ...readyCommercialInput,
      contractStatus: "sent"
    },
    job: {
      exists: true,
      dispatchStatus: "scheduled",
      scheduledDate: "2026-06-01"
    },
    invoice: {
      exists: true,
      status: "sent",
      workflowRole: "standard",
      jobId: null,
      balanceDueAmount: "500.00"
    }
  });

  assert.equal(summary.isReadyToSchedule, false);
  assert.equal(summary.canCreateJob, false);
  assert.equal(summary.canCreateStandardInvoice, false);
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
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "invoice:commercial-readiness-bypass"
    )
  );
});

void test("readiness verification confirms signature completion and payment request gate", () => {
  const summary = verifyReadinessContinuity({
    storedProjectReadiness: {
      commercialReadinessStatus: "ready_to_schedule",
      readyToScheduleAt: "2026-05-29T12:00:00.000Z"
    },
    commercialReadiness: readyCommercialInput,
    contractSignature: {
      status: "signed",
      signatureReadinessStatus: "signed",
      signatureStartedAt: "2026-05-29T12:00:00.000Z",
      customerSignedAt: "2026-05-29T12:05:00.000Z",
      contractorCountersignedAt: null,
      signatureDeclinedAt: null,
      signatureVoidedAt: null,
      signers: [{ signerRole: "customer", signerStatus: "signed" }]
    },
    invoice: {
      exists: true,
      status: "sent",
      workflowRole: "standard",
      jobId: "job-1",
      balanceDueAmount: "500.00"
    }
  });

  assert.equal(summary.isReadyToSchedule, true);
  assert.equal(summary.signatureComplete, true);
  assert.equal(summary.canRequestPayment, true);
  assert.equal(summary.findings.length, 0);
});

void test("golden workflow health summary lowers confidence for missing coverage", () => {
  const summary = buildGoldenWorkflowHealthSummary({
    workflow: {
      customer: { id: "customer-1" },
      project: { id: "project-1", customerId: "customer-1" },
      estimate: { id: "estimate-1", projectId: "project-1" },
      contract: {
        id: "contract-1",
        projectId: "project-1",
        estimateId: "estimate-1",
        status: "signed"
      },
      job: { id: "job-1", projectId: "project-1", scheduledDate: "2026-06-01" },
      invoice: {
        id: "invoice-1",
        projectId: "project-1",
        status: "paid",
        balanceDueAmount: "0.00"
      },
      payment: { id: "payment-1", invoiceId: "invoice-1" }
    },
    readiness: {
      storedProjectReadiness: {
        commercialReadinessStatus: "ready_to_schedule",
        readyToScheduleAt: "2026-05-29T12:00:00.000Z"
      },
      commercialReadiness: readyCommercialInput
    },
    coverage: [
      { area: "workflow", status: "verified", evidence: ["unit"] },
      {
        area: "payment",
        status: "blocked",
        evidence: [],
        gaps: ["webhook fixture"]
      }
    ]
  });

  assert.equal(summary.confidence, "low");
  assert.equal(summary.coverageStatus.workflow, "verified");
  assert.equal(summary.coverageStatus.payment, "blocked");
  assert.ok(summary.missingCoverage.some((item) => item.area === "payment"));
});
