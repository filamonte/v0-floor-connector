import {
  computeCommercialReadiness,
  computeContractSignatureWorkflowSummary,
  computeInvoicePaymentWorkflowGate
} from "@floorconnector/domain";
import type {
  CommercialReadinessBlocker,
  CommercialReadinessStatus,
  ContractInternalApprovalStatus,
  ContractSignerRole,
  ContractSignerStatus,
  ContractStatus,
  EstimateStatus,
  FinancingStatus,
  InvoiceStatus,
  InvoiceWorkflowRole,
  SignatureReadinessStatus,
  SiteAssessmentStatus
} from "@floorconnector/types";

export type ReadinessVerificationFinding = {
  id: string;
  severity: "critical" | "warning";
  message: string;
};

export type ReadinessVerificationInput = {
  storedProjectReadiness?: {
    commercialReadinessStatus: CommercialReadinessStatus | null;
    readyToScheduleAt: string | null;
  };
  commercialReadiness: {
    estimateStatus: EstimateStatus | null;
    siteAssessmentStatus: SiteAssessmentStatus | null;
    hasContract: boolean;
    contractInternalApprovalStatus: ContractInternalApprovalStatus | null;
    contractStatus: ContractStatus | null;
    requireContractInternalApproval: boolean;
    requireContractSignatureBeforeJobScheduling: boolean;
    requireDepositBeforeJobScheduling: boolean;
    requireFinancingApprovalBeforeJobScheduling: boolean;
    financingStatus: FinancingStatus;
    depositInvoiceStatus: InvoiceStatus | null;
    depositInvoiceRole: InvoiceWorkflowRole | null;
  };
  job?: {
    exists: boolean;
    dispatchStatus?: string | null;
    scheduledDate?: string | null;
  };
  invoice?: {
    exists: boolean;
    status: InvoiceStatus;
    workflowRole: InvoiceWorkflowRole;
    jobId?: string | null;
    balanceDueAmount: string;
  };
  contractSignature?: {
    status: ContractStatus;
    signatureReadinessStatus: SignatureReadinessStatus;
    signatureStartedAt: string | null;
    customerSignedAt: string | null;
    contractorCountersignedAt: string | null;
    signatureDeclinedAt: string | null;
    signatureVoidedAt: string | null;
    signers: ReadonlyArray<{
      signerRole: ContractSignerRole;
      signerStatus: ContractSignerStatus;
    }>;
  };
};

export type ReadinessVerificationSummary = {
  commercialStatus: CommercialReadinessStatus;
  commercialBlockers: CommercialReadinessBlocker[];
  isReadyToSchedule: boolean;
  canCreateJob: boolean;
  canCreateStandardInvoice: boolean;
  canRequestPayment: boolean;
  signatureComplete: boolean;
  findings: ReadinessVerificationFinding[];
};

function addFinding(
  findings: ReadinessVerificationFinding[],
  finding: ReadinessVerificationFinding
) {
  findings.push(finding);
}

export function verifyReadinessContinuity(
  input: ReadinessVerificationInput
): ReadinessVerificationSummary {
  const findings: ReadinessVerificationFinding[] = [];
  const commercialReadiness = computeCommercialReadiness(
    input.commercialReadiness
  );
  const signatureSummary = input.contractSignature
    ? computeContractSignatureWorkflowSummary(input.contractSignature)
    : null;
  const paymentGate = input.invoice
    ? computeInvoicePaymentWorkflowGate({
        invoiceStatus: input.invoice.status,
        balanceDueAmount: input.invoice.balanceDueAmount
      })
    : null;

  if (input.storedProjectReadiness) {
    if (
      input.storedProjectReadiness.commercialReadinessStatus !==
      commercialReadiness.status
    ) {
      addFinding(findings, {
        id: "project-readiness:status-drift",
        severity: "critical",
        message:
          "Stored project commercial readiness does not match the derived readiness gate."
      });
    }

    if (
      commercialReadiness.isReadyToSchedule &&
      !input.storedProjectReadiness.readyToScheduleAt
    ) {
      addFinding(findings, {
        id: "project-readiness:missing-ready-timestamp",
        severity: "warning",
        message:
          "Project is derived ready to schedule, but ready_to_schedule_at is not recorded."
      });
    }

    if (
      !commercialReadiness.isReadyToSchedule &&
      input.storedProjectReadiness.readyToScheduleAt
    ) {
      addFinding(findings, {
        id: "project-readiness:stale-ready-timestamp",
        severity: "critical",
        message:
          "Project has a ready_to_schedule_at timestamp while derived readiness is blocked."
      });
    }
  }

  const canCreateJob = commercialReadiness.isReadyToSchedule;
  if (input.job?.exists && !canCreateJob) {
    addFinding(findings, {
      id: "job:readiness-bypass",
      severity: "critical",
      message:
        "A job exists even though the project is not derived ready to schedule."
    });
  }

  if (
    input.job?.exists &&
    input.job.dispatchStatus !== "unscheduled" &&
    !commercialReadiness.isReadyToSchedule
  ) {
    addFinding(findings, {
      id: "schedule:readiness-bypass",
      severity: "critical",
      message:
        "A job moved into schedule state while project readiness is blocked."
    });
  }

  const canCreateStandardInvoice =
    input.invoice?.workflowRole !== "standard" ||
    Boolean(input.invoice?.jobId) ||
    commercialReadiness.isReadyToSchedule;
  if (input.invoice?.exists && !canCreateStandardInvoice) {
    addFinding(findings, {
      id: "invoice:commercial-readiness-bypass",
      severity: "critical",
      message:
        "A standard invoice exists without a job while commercial readiness is blocked."
    });
  }

  return {
    commercialStatus: commercialReadiness.status,
    commercialBlockers: commercialReadiness.blockers,
    isReadyToSchedule: commercialReadiness.isReadyToSchedule,
    canCreateJob,
    canCreateStandardInvoice,
    canRequestPayment: paymentGate?.canRequestPayment ?? false,
    signatureComplete: signatureSummary?.isCompleted ?? false,
    findings
  };
}
