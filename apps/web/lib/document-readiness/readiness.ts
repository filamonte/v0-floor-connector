import type {
  ContractInternalApprovalStatus,
  ContractStatus,
  EstimateStatus,
  InvoiceStatus,
  SignatureReadinessStatus
} from "@floorconnector/types";

export type DocumentReadinessRecordType = "estimate" | "contract" | "invoice";

export type DocumentReadinessTone =
  | "ready"
  | "attention"
  | "blocked"
  | "complete"
  | "neutral";

export type DocumentReadinessIssue = {
  key: string;
  label: string;
  severity: "blocker" | "warning";
};

export type DocumentReadinessSummary = {
  recordType: DocumentReadinessRecordType;
  recordId: string;
  recordReference: string;
  templateAvailabilityLabel: string;
  requiredContextLabel: string;
  stateLabel: string;
  missingFields: DocumentReadinessIssue[];
  blockers: DocumentReadinessIssue[];
  safePreviewLabel: string;
  safeDeliveryReadinessLabel: string;
  recommendedNextAction: string;
  statusTone: DocumentReadinessTone;
  sourceCategory: "document_readiness";
};

export type EstimateContractHandoffTone = "ready" | "attention" | "blocked";

export type EstimateContractHandoffReadinessInput = {
  estimateStatus: EstimateStatus;
  estimateBlockers: string[];
  contractId: string | null;
  readinessStatus: string | null;
  depositInvoiceId: string | null;
};

export type EstimateContractHandoffReadinessSummary = {
  title: string;
  description: string;
  blockers: string[];
  recommendedNextAction: string;
  settingsHref: string;
  statusTone: EstimateContractHandoffTone;
};

type BaseDocumentReadinessInput = {
  id: string;
  referenceNumber: string;
  customerId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  templateId?: string | null;
  templateName?: string | null;
};

export type EstimateDocumentReadinessInput = BaseDocumentReadinessInput & {
  status: EstimateStatus;
  lineItemCount: number;
  totalAmount: string | number;
  portalRecipientCount?: number;
};

export type ContractDocumentReadinessInput = BaseDocumentReadinessInput & {
  status: ContractStatus;
  internalApprovalStatus: ContractInternalApprovalStatus;
  signatureReadinessStatus: SignatureReadinessStatus;
  renderedContent?: string | null;
  customerSignerCount?: number;
  signedAt?: string | null;
};

export type InvoiceDocumentReadinessInput = BaseDocumentReadinessInput & {
  status: InvoiceStatus;
  lineItemCount: number;
  balanceDueAmount: string | number;
  portalRecipientCount?: number;
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toAmount(value: string | number) {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function getSharedContextIssues(input: BaseDocumentReadinessInput) {
  const issues: DocumentReadinessIssue[] = [];

  if (!hasText(input.customerId)) {
    issues.push({
      key: "missing_customer",
      label: "Customer context is missing",
      severity: "blocker"
    });
  }

  if (!hasText(input.projectId)) {
    issues.push({
      key: "missing_project",
      label: "Project context is missing",
      severity: "blocker"
    });
  }

  return issues;
}

function getTemplateLabel(input: BaseDocumentReadinessInput, fallback: string) {
  const templateName = input.templateName;

  if (hasText(templateName)) {
    return templateName.trim();
  }

  if (hasText(input.templateId)) {
    return "Template selected";
  }

  return fallback;
}

function getContextLabel(input: BaseDocumentReadinessInput) {
  const customer = input.customerName ?? "customer";
  const project = input.projectName ?? "project";

  if (hasText(input.customerId) && hasText(input.projectId)) {
    return `${customer} / ${project}`;
  }

  if (hasText(input.customerId)) {
    return `${customer} / project needed`;
  }

  if (hasText(input.projectId)) {
    return `Customer needed / ${project}`;
  }

  return "Customer and project needed";
}

function finishSummary(
  input: Omit<DocumentReadinessSummary, "blockers" | "sourceCategory">
): DocumentReadinessSummary {
  return {
    ...input,
    blockers: input.missingFields.filter(
      (issue) => issue.severity === "blocker"
    ),
    sourceCategory: "document_readiness"
  };
}

export function deriveEstimateDocumentReadiness(
  input: EstimateDocumentReadinessInput
): DocumentReadinessSummary {
  const missingFields = getSharedContextIssues(input);

  if (!hasText(input.templateId)) {
    missingFields.push({
      key: "template_fallback",
      label: "No explicit estimate template is selected",
      severity: "warning"
    });
  }

  if (input.lineItemCount <= 0 || toAmount(input.totalAmount) <= 0) {
    missingFields.push({
      key: "missing_estimate_scope",
      label: "Estimate scope or pricing is empty",
      severity: "blocker"
    });
  }

  if (
    (input.status === "draft" || input.status === "rejected") &&
    !hasText(input.customerEmail) &&
    (input.portalRecipientCount ?? 0) <= 0
  ) {
    missingFields.push({
      key: "missing_customer_delivery_contact",
      label: "No customer email or portal-ready contact is available",
      severity: "blocker"
    });
  }

  const hasBlockers = missingFields.some(
    (issue) => issue.severity === "blocker"
  );
  const isReviewState = input.status === "draft" || input.status === "rejected";

  if (input.status === "approved") {
    return finishSummary({
      recordType: "estimate",
      recordId: input.id,
      recordReference: input.referenceNumber,
      templateAvailabilityLabel: getTemplateLabel(
        input,
        "Current estimate workspace output"
      ),
      requiredContextLabel: getContextLabel(input),
      stateLabel: "Approved",
      missingFields,
      safePreviewLabel: "Preview / Print Estimate",
      safeDeliveryReadinessLabel: hasBlockers
        ? "Document context needs review"
        : "Approved for contract handoff",
      recommendedNextAction: hasBlockers
        ? "Resolve document context before relying on this output."
        : "Use the approved estimate for contract and downstream handoff.",
      statusTone: hasBlockers ? "blocked" : "complete"
    });
  }

  return finishSummary({
    recordType: "estimate",
    recordId: input.id,
    recordReference: input.referenceNumber,
    templateAvailabilityLabel: getTemplateLabel(
      input,
      "Current estimate workspace output"
    ),
    requiredContextLabel: getContextLabel(input),
    stateLabel: input.status.replaceAll("_", " "),
    missingFields,
    safePreviewLabel: "Preview / Print Estimate",
    safeDeliveryReadinessLabel: hasBlockers
      ? "Not ready for customer review"
      : isReviewState
        ? "Ready for customer review"
        : "Customer review in progress",
    recommendedNextAction: hasBlockers
      ? "Fix the missing customer, project, scope, or delivery contact before sending."
      : isReviewState
        ? "Review the printable estimate, then send the portal review link when ready."
        : "Watch customer review and delivery evidence before downstream handoff.",
    statusTone: hasBlockers ? "blocked" : isReviewState ? "ready" : "attention"
  });
}

export function deriveContractDocumentReadiness(
  input: ContractDocumentReadinessInput
): DocumentReadinessSummary {
  const missingFields = getSharedContextIssues(input);

  if (!hasText(input.templateId)) {
    missingFields.push({
      key: "missing_contract_template",
      label: "Contract template lineage is missing",
      severity: "warning"
    });
  }

  if (!hasText(input.renderedContent)) {
    missingFields.push({
      key: "missing_contract_content",
      label: "Rendered contract content is missing",
      severity: "blocker"
    });
  }

  if (
    input.status === "draft" &&
    input.signatureReadinessStatus !== "ready_to_send"
  ) {
    missingFields.push({
      key: "signature_not_ready",
      label: "Signature workflow is not send-ready",
      severity: "blocker"
    });
  }

  if (input.internalApprovalStatus === "rejected") {
    missingFields.push({
      key: "internal_approval_rejected",
      label: "Internal approval requires revision",
      severity: "blocker"
    });
  }

  if (input.status === "draft" && (input.customerSignerCount ?? 0) <= 0) {
    missingFields.push({
      key: "missing_customer_signer",
      label: "No customer signer is available",
      severity: "blocker"
    });
  }

  const hasBlockers = missingFields.some(
    (issue) => issue.severity === "blocker"
  );
  const isSigned = input.status === "signed" || hasText(input.signedAt);

  return finishSummary({
    recordType: "contract",
    recordId: input.id,
    recordReference: input.referenceNumber,
    templateAvailabilityLabel: getTemplateLabel(
      input,
      "Rendered contract body"
    ),
    requiredContextLabel: getContextLabel(input),
    stateLabel: input.status.replaceAll("_", " "),
    missingFields,
    safePreviewLabel: "Preview / Print Contract",
    safeDeliveryReadinessLabel: isSigned
      ? "Signed contract"
      : hasBlockers
        ? "Not ready for signature send"
        : input.status === "draft"
          ? "Ready for signature send"
          : "Signature collection in progress",
    recommendedNextAction: isSigned
      ? "Use the signed contract as the canonical signature source and continue downstream."
      : hasBlockers
        ? "Resolve approval, signer, context, or rendered-content readiness before sending."
        : input.status === "draft"
          ? "Review the printable contract, then send through the existing signature workflow."
          : "Track signer activity and Send Trail evidence without changing signature truth.",
    statusTone: isSigned
      ? "complete"
      : hasBlockers
        ? "blocked"
        : input.status === "draft"
          ? "ready"
          : "attention"
  });
}

export function deriveEstimateContractHandoffReadiness(
  input: EstimateContractHandoffReadinessInput
): EstimateContractHandoffReadinessSummary {
  const settingsHref = "/settings/workflows";

  if (input.estimateStatus === "draft" || input.estimateStatus === "rejected") {
    return {
      title: "Estimate must be review-ready first",
      description:
        "Finish scope, pricing, customer delivery context, and estimate review before contract readiness applies.",
      blockers:
        input.estimateBlockers.length > 0
          ? input.estimateBlockers
          : ["Send or approve the estimate before contract handoff."],
      recommendedNextAction: "Resolve estimate readiness before contract work.",
      settingsHref,
      statusTone: "blocked"
    };
  }

  if (input.estimateStatus === "sent") {
    return {
      title: "Waiting on customer estimate approval",
      description:
        "The contract chain stays blocked until the customer decision is recorded on the canonical estimate.",
      blockers: ["Customer approval is still pending."],
      recommendedNextAction: "Track estimate delivery and customer response.",
      settingsHref,
      statusTone: "attention"
    };
  }

  if (input.estimateBlockers.length > 0) {
    return {
      title: "Approved estimate has document blockers",
      description:
        "Clear estimate document readiness before relying on the approved estimate for contract generation.",
      blockers: input.estimateBlockers,
      recommendedNextAction: "Resolve estimate document readiness.",
      settingsHref,
      statusTone: "blocked"
    };
  }

  if (!input.contractId) {
    return {
      title: "Ready to generate the contract",
      description:
        "Approved scope can move into the canonical contract workflow. Review workflow defaults in Settings if contract template or deposit behavior needs adjustment.",
      blockers: [],
      recommendedNextAction:
        "Generate the contract from this approved estimate.",
      settingsHref,
      statusTone: "ready"
    };
  }

  if (
    input.readinessStatus === "waiting_on_deposit" &&
    input.depositInvoiceId
  ) {
    return {
      title: "Contract exists; deposit is the active blocker",
      description:
        "The project readiness hub is tracking deposit collection before production scheduling can continue.",
      blockers: ["Collect or resolve the deposit invoice."],
      recommendedNextAction:
        "Review the deposit invoice from project readiness.",
      settingsHref,
      statusTone: "blocked"
    };
  }

  return {
    title: "Contract handoff is in the project readiness hub",
    description:
      "Use the project workspace to clear contract, signature, and financial blockers in the approved order.",
    blockers: [],
    recommendedNextAction: "Open the project workspace for readiness.",
    settingsHref,
    statusTone: "attention"
  };
}

export function deriveInvoiceDocumentReadiness(
  input: InvoiceDocumentReadinessInput
): DocumentReadinessSummary {
  const missingFields = getSharedContextIssues(input);
  const balanceDue = toAmount(input.balanceDueAmount);

  if (!hasText(input.templateId)) {
    missingFields.push({
      key: "invoice_rendering_default",
      label: "Invoice uses the standard printable rendering",
      severity: "warning"
    });
  }

  if (input.lineItemCount <= 0) {
    missingFields.push({
      key: "missing_invoice_lines",
      label: "Invoice line items are missing",
      severity: "blocker"
    });
  }

  if (
    (input.status === "sent" || input.status === "partially_paid") &&
    balanceDue > 0 &&
    !hasText(input.customerEmail) &&
    (input.portalRecipientCount ?? 0) <= 0
  ) {
    missingFields.push({
      key: "missing_invoice_delivery_contact",
      label: "No customer email or portal-ready contact is available",
      severity: "blocker"
    });
  }

  if (input.status === "void") {
    missingFields.push({
      key: "invoice_void",
      label: "Void invoices are not delivery-ready",
      severity: "blocker"
    });
  }

  const hasBlockers = missingFields.some(
    (issue) => issue.severity === "blocker"
  );
  const isPaid = input.status === "paid" || balanceDue <= 0;
  const canRequestPayment =
    (input.status === "sent" || input.status === "partially_paid") &&
    balanceDue > 0;

  return finishSummary({
    recordType: "invoice",
    recordId: input.id,
    recordReference: input.referenceNumber,
    templateAvailabilityLabel: getTemplateLabel(
      input,
      "Standard invoice rendering"
    ),
    requiredContextLabel: getContextLabel(input),
    stateLabel: input.status.replaceAll("_", " "),
    missingFields,
    safePreviewLabel: "Preview / Print Invoice",
    safeDeliveryReadinessLabel: isPaid
      ? "Payment complete"
      : hasBlockers
        ? "Not ready for payment request"
        : canRequestPayment
          ? "Ready for payment request"
          : "Prepare invoice before sending",
    recommendedNextAction: isPaid
      ? "Keep the printable invoice as customer-facing billing history."
      : hasBlockers
        ? "Resolve invoice context, line items, or delivery contact before sending."
        : canRequestPayment
          ? "Review the printable invoice, then send the portal review/payment link."
          : "Mark the invoice sent through the invoice workflow before requesting payment.",
    statusTone: isPaid
      ? "complete"
      : hasBlockers
        ? "blocked"
        : canRequestPayment
          ? "ready"
          : "neutral"
  });
}
