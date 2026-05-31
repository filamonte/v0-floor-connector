export const canonicalGoldenWorkflowStages = [
  "opportunity",
  "customer",
  "project",
  "estimate",
  "contract",
  "signature",
  "job",
  "schedule",
  "invoice",
  "payment"
] as const;

export type CanonicalGoldenWorkflowStage =
  (typeof canonicalGoldenWorkflowStages)[number];

export type WorkflowIntegritySeverity = "critical" | "warning";

export type WorkflowIntegrityFinding = {
  id: string;
  stage: CanonicalGoldenWorkflowStage;
  severity: WorkflowIntegritySeverity;
  message: string;
};

export type WorkflowIntegrityInput = {
  opportunity?: {
    id: string | null;
    customerId?: string | null;
    projectId?: string | null;
    status?: string | null;
  } | null;
  customer?: { id: string | null } | null;
  project?: { id: string | null; customerId?: string | null } | null;
  estimate?: {
    id: string | null;
    customerId?: string | null;
    projectId?: string | null;
    opportunityId?: string | null;
    status?: string | null;
  } | null;
  contract?: {
    id: string | null;
    customerId?: string | null;
    projectId?: string | null;
    estimateId?: string | null;
    status?: string | null;
  } | null;
  job?: {
    id: string | null;
    customerId?: string | null;
    projectId?: string | null;
    estimateId?: string | null;
    dispatchStatus?: string | null;
    scheduledDate?: string | null;
    scheduledStartAt?: string | null;
  } | null;
  invoice?: {
    id: string | null;
    customerId?: string | null;
    projectId?: string | null;
    estimateId?: string | null;
    jobId?: string | null;
    status?: string | null;
    balanceDueAmount?: string | number | null;
  } | null;
  payment?: {
    id: string | null;
    invoiceId?: string | null;
    status?: string | null;
    amount?: string | number | null;
  } | null;
  portal?: {
    projectId?: string | null;
    estimateId?: string | null;
    contractId?: string | null;
    invoiceId?: string | null;
    hasActiveGrant?: boolean;
    hasActiveProjectAccess?: boolean;
  } | null;
};

export type WorkflowIntegritySummary = {
  stageStatus: Record<CanonicalGoldenWorkflowStage, "present" | "missing">;
  findings: WorkflowIntegrityFinding[];
  isContinuous: boolean;
};

function hasId(record: { id: string | null } | null | undefined) {
  return Boolean(record?.id);
}

function addFinding(
  findings: WorkflowIntegrityFinding[],
  finding: WorkflowIntegrityFinding
) {
  findings.push(finding);
}

function assertSameLink(input: {
  findings: WorkflowIntegrityFinding[];
  stage: CanonicalGoldenWorkflowStage;
  id: string;
  leftLabel: string;
  leftValue?: string | null;
  rightLabel: string;
  rightValue?: string | null;
}) {
  if (!input.leftValue || !input.rightValue) {
    return;
  }

  if (input.leftValue !== input.rightValue) {
    addFinding(input.findings, {
      id: input.id,
      stage: input.stage,
      severity: "critical",
      message: `${input.leftLabel} does not match ${input.rightLabel}.`
    });
  }
}

export function verifyWorkflowIntegrity(
  input: WorkflowIntegrityInput
): WorkflowIntegritySummary {
  const findings: WorkflowIntegrityFinding[] = [];
  const stageStatus: WorkflowIntegritySummary["stageStatus"] = {
    opportunity: hasId(input.opportunity) ? "present" : "missing",
    customer: hasId(input.customer) ? "present" : "missing",
    project: hasId(input.project) ? "present" : "missing",
    estimate: hasId(input.estimate) ? "present" : "missing",
    contract: hasId(input.contract) ? "present" : "missing",
    signature:
      input.contract?.status === "signed" ||
      input.contract?.status === "sent" ||
      input.contract?.status === "viewed"
        ? "present"
        : "missing",
    job: hasId(input.job) ? "present" : "missing",
    schedule:
      input.job?.scheduledDate || input.job?.scheduledStartAt
        ? "present"
        : "missing",
    invoice: hasId(input.invoice) ? "present" : "missing",
    payment: hasId(input.payment) ? "present" : "missing"
  };

  for (const stage of canonicalGoldenWorkflowStages) {
    if (stageStatus[stage] === "missing") {
      addFinding(findings, {
        id: `${stage}:missing`,
        stage,
        severity:
          stage === "schedule" || stage === "payment" ? "warning" : "critical",
        message: `${stage} evidence is missing from the canonical workflow snapshot.`
      });
    }
  }

  assertSameLink({
    findings,
    stage: "project",
    id: "project:customer-link",
    leftLabel: "project.customer_id",
    leftValue: input.project?.customerId,
    rightLabel: "customer.id",
    rightValue: input.customer?.id
  });
  assertSameLink({
    findings,
    stage: "estimate",
    id: "estimate:project-link",
    leftLabel: "estimate.project_id",
    leftValue: input.estimate?.projectId,
    rightLabel: "project.id",
    rightValue: input.project?.id
  });
  assertSameLink({
    findings,
    stage: "contract",
    id: "contract:estimate-link",
    leftLabel: "contract.estimate_id",
    leftValue: input.contract?.estimateId,
    rightLabel: "estimate.id",
    rightValue: input.estimate?.id
  });
  assertSameLink({
    findings,
    stage: "job",
    id: "job:project-link",
    leftLabel: "job.project_id",
    leftValue: input.job?.projectId,
    rightLabel: "project.id",
    rightValue: input.project?.id
  });
  assertSameLink({
    findings,
    stage: "invoice",
    id: "invoice:project-link",
    leftLabel: "invoice.project_id",
    leftValue: input.invoice?.projectId,
    rightLabel: "project.id",
    rightValue: input.project?.id
  });
  assertSameLink({
    findings,
    stage: "payment",
    id: "payment:invoice-link",
    leftLabel: "payment.invoice_id",
    leftValue: input.payment?.invoiceId,
    rightLabel: "invoice.id",
    rightValue: input.invoice?.id
  });

  if (input.portal) {
    assertSameLink({
      findings,
      stage: "project",
      id: "portal:project-link",
      leftLabel: "portal.project_id",
      leftValue: input.portal.projectId,
      rightLabel: "project.id",
      rightValue: input.project?.id
    });
    assertSameLink({
      findings,
      stage: "estimate",
      id: "portal:estimate-link",
      leftLabel: "portal.estimate_id",
      leftValue: input.portal.estimateId,
      rightLabel: "estimate.id",
      rightValue: input.estimate?.id
    });
    assertSameLink({
      findings,
      stage: "contract",
      id: "portal:contract-link",
      leftLabel: "portal.contract_id",
      leftValue: input.portal.contractId,
      rightLabel: "contract.id",
      rightValue: input.contract?.id
    });
    assertSameLink({
      findings,
      stage: "invoice",
      id: "portal:invoice-link",
      leftLabel: "portal.invoice_id",
      leftValue: input.portal.invoiceId,
      rightLabel: "invoice.id",
      rightValue: input.invoice?.id
    });

    if (!input.portal.hasActiveGrant || !input.portal.hasActiveProjectAccess) {
      addFinding(findings, {
        id: "portal:access",
        stage: "project",
        severity: "critical",
        message:
          "Portal continuity requires both an active portal grant and active project access."
      });
    }
  }

  return {
    stageStatus,
    findings,
    isContinuous: findings.every((finding) => finding.severity !== "critical")
  };
}
