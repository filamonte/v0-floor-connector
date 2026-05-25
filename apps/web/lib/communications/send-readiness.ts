import type { DocumentReadinessSummary } from "@/lib/document-readiness/readiness";

export type CustomerCommunicationAudienceType =
  | "customer"
  | "internal"
  | "unknown";

export type CustomerCommunicationRelatedRecordType =
  | "appointment"
  | "change_order"
  | "contract"
  | "customer"
  | "estimate"
  | "general"
  | "invoice"
  | "opportunity"
  | "payment"
  | "project";

export type CustomerCommunicationSendReadinessStatus =
  | "ready"
  | "needs_review"
  | "blocked";

export type CustomerCommunicationSendReadinessTone =
  | "ready"
  | "attention"
  | "blocked";

export type CustomerCommunicationSendReadiness = {
  audienceType: CustomerCommunicationAudienceType;
  targetCustomerLabel: string;
  relatedRecordType: CustomerCommunicationRelatedRecordType;
  relatedRecordId: string | null;
  relatedRecordLabel: string;
  relatedRecordHref: string | null;
  readinessStatus: CustomerCommunicationSendReadinessStatus;
  tone: CustomerCommunicationSendReadinessTone;
  reasons: string[];
  missingRequirements: string[];
  recommendedNextStep: string;
  safeSubjectSuggestion: string | null;
  safeBodyFraming: string | null;
  customerSafeWarning: string | null;
  documentReadinessLabel: string | null;
  canPrepareCustomerMessage: boolean;
  willSendAutomatically: false;
};

type RelatedRecordInput = {
  type?: CustomerCommunicationRelatedRecordType | null;
  id?: string | null;
  label?: string | null;
  href?: string | null;
};

type NormalizedRelatedRecord = {
  type: CustomerCommunicationRelatedRecordType;
  id: string | null;
  label: string;
  href: string | null;
};

type CustomerCommunicationSendReadinessInput = {
  audience?: CustomerCommunicationAudienceType | null;
  actionType?: string | null;
  subject?: string | null;
  body?: string | null;
  customer?: {
    id?: string | null;
    label?: string | null;
    email?: string | null;
    portalAccess?: boolean | null;
  } | null;
  relatedRecord?: RelatedRecordInput | null;
  documentReadiness?: DocumentReadinessSummary | null;
  communicationsEnabled?: boolean;
};

const internalOnlyActionTypes = new Set([
  "internal_collections_review_summary",
  "internal_pm_project_summary",
  "blocker_escalation_summary"
]);

const documentRecordTypes = new Set<CustomerCommunicationRelatedRecordType>([
  "estimate",
  "contract",
  "invoice"
]);

const internalLeakagePatterns = [
  /\bAI\b/i,
  /\bCopilot\b/i,
  /\bFieldTrail\b/i,
  /\bProof Center\b/i,
  /\bPayment Trail\b/i,
  /\bSignature Trail\b/i,
  /\bSend Trail\b/i,
  /\bAccounts Receivable\b/i,
  /\bAR\b/,
  /\binternal blocker\b/i,
  /\breadiness internals?\b/i,
  /\bprovider metadata\b/i
];

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeAudience(
  value: CustomerCommunicationAudienceType | null | undefined
): CustomerCommunicationAudienceType {
  return value === "customer" || value === "internal" ? value : "unknown";
}

function normalizeRelatedRecord(
  input: RelatedRecordInput | null | undefined
): NormalizedRelatedRecord {
  return {
    type: input?.type ?? "general",
    id: input?.id ?? null,
    label: input?.label?.trim() || "General customer communication",
    href: input?.href ?? null
  };
}

function getDocumentReadinessStatus(summary: DocumentReadinessSummary) {
  if (summary.blockers.length > 0 || summary.statusTone === "blocked") {
    return "blocked";
  }

  if (summary.statusTone === "ready" || summary.statusTone === "complete") {
    return "ready";
  }

  return "needs_review";
}

function containsInternalLeakage(...values: Array<string | null | undefined>) {
  const text = values.filter(hasText).join("\n");

  return internalLeakagePatterns.some((pattern) => pattern.test(text));
}

function getActionSafeSubject(input: {
  actionType: string | null | undefined;
  relatedRecordLabel: string;
}) {
  switch (input.actionType) {
    case "contract_signature_reminder":
      return `Contract review for ${input.relatedRecordLabel}`;
    case "deposit_payment_reminder":
      return `Deposit payment review for ${input.relatedRecordLabel}`;
    case "payment_reminder":
    case "payment_failed_follow_up":
    case "partial_balance_follow_up":
      return `Payment status for ${input.relatedRecordLabel}`;
    case "scheduling_readiness_coordination":
      return `Scheduling next steps for ${input.relatedRecordLabel}`;
    case "field_progress_update":
      return `Project update for ${input.relatedRecordLabel}`;
    case "stalled_project_follow_up":
      return `Project next steps for ${input.relatedRecordLabel}`;
    case "customer_follow_up":
      return `Follow-up for ${input.relatedRecordLabel}`;
    default:
      return null;
  }
}

function getActionSafeBodyFraming(actionType: string | null | undefined) {
  switch (actionType) {
    case "deposit_payment_reminder":
    case "payment_reminder":
    case "payment_failed_follow_up":
    case "partial_balance_follow_up":
      return "Keep the message calm and specific: reference the invoice or payment status, invite review, and avoid internal finance language.";
    case "contract_signature_reminder":
      return "Frame this as a signature-review reminder and point the customer back to the canonical contract workflow.";
    case "field_progress_update":
      return "Share a customer-safe progress summary only; keep internal field notes, blockers, and crew details out of the message.";
    case "scheduling_readiness_coordination":
      return "Ask for scheduling confirmation or next-step coordination without implying automatic dispatch changes.";
    case "stalled_project_follow_up":
      return "Use professional next-step language and avoid exposing internal delay reasoning unless reviewed.";
    case "customer_follow_up":
      return "Keep the message short, customer-safe, and tied to the selected canonical record.";
    default:
      return null;
  }
}

export function deriveCustomerCommunicationSendReadiness(
  input: CustomerCommunicationSendReadinessInput
): CustomerCommunicationSendReadiness {
  const audienceType = normalizeAudience(input.audience);
  const relatedRecord = normalizeRelatedRecord(input.relatedRecord);
  const customerLabel =
    input.customer?.label?.trim() ||
    (hasText(input.customer?.id)
      ? "Selected customer"
      : "Customer not selected");
  const reasons: string[] = [];
  const missingRequirements: string[] = [];
  let readinessStatus: CustomerCommunicationSendReadinessStatus = "ready";

  if (input.communicationsEnabled === false) {
    readinessStatus = "blocked";
    reasons.push("Communications are disabled for this workspace.");
    missingRequirements.push(
      "Enable the communications module before preparing customer-bound messages."
    );
  }

  if (
    audienceType !== "customer" ||
    (input.actionType && internalOnlyActionTypes.has(input.actionType))
  ) {
    readinessStatus = "blocked";
    reasons.push("This draft is internal-only and is not customer-ready.");
    missingRequirements.push(
      "Create or select a customer-bound draft before preparing a customer send."
    );
  }

  if (!hasText(input.customer?.id) && !hasText(input.customer?.email)) {
    readinessStatus = "blocked";
    reasons.push("No customer or delivery contact is selected.");
    missingRequirements.push(
      "Select a customer/contact before this can become customer-bound."
    );
  } else if (!hasText(input.customer?.email) && !input.customer?.portalAccess) {
    readinessStatus =
      readinessStatus === "ready" ? "needs_review" : readinessStatus;
    reasons.push(
      "A customer is selected, but delivery channel readiness still needs review."
    );
    missingRequirements.push(
      "Confirm a customer email address or scoped portal access before provider sending is added."
    );
  }

  if (relatedRecord.type === "general") {
    readinessStatus =
      readinessStatus === "ready" ? "needs_review" : readinessStatus;
    reasons.push("No specific canonical source record is linked.");
    missingRequirements.push(
      "Attach the draft to a project, estimate, contract, invoice, payment, or change order when possible."
    );
  }

  if (documentRecordTypes.has(relatedRecord.type) && !input.documentReadiness) {
    readinessStatus =
      readinessStatus === "ready" ? "needs_review" : readinessStatus;
    reasons.push(
      "Linked document readiness has not been reviewed in this panel."
    );
    missingRequirements.push(
      `Review the ${relatedRecord.type} document readiness before attaching or sending later.`
    );
  }

  if (input.documentReadiness) {
    const documentStatus = getDocumentReadinessStatus(input.documentReadiness);

    if (documentStatus === "blocked") {
      readinessStatus = "blocked";
      reasons.push(input.documentReadiness.safeDeliveryReadinessLabel);
      missingRequirements.push(
        ...input.documentReadiness.blockers.map((issue) => issue.label)
      );
    } else if (documentStatus === "needs_review") {
      readinessStatus =
        readinessStatus === "ready" ? "needs_review" : readinessStatus;
      reasons.push(input.documentReadiness.safeDeliveryReadinessLabel);
      missingRequirements.push(input.documentReadiness.recommendedNextAction);
    } else {
      reasons.push(input.documentReadiness.safeDeliveryReadinessLabel);
    }
  }

  if (containsInternalLeakage(input.subject, input.body)) {
    readinessStatus = "blocked";
    reasons.push(
      "The draft contains internal-only terminology that should not reach customers."
    );
    missingRequirements.push(
      "Remove internal labels, AI/proof/readiness terms, and provider details before customer review."
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "Customer, canonical source record, and review context are present."
    );
  }

  const tone: CustomerCommunicationSendReadinessTone =
    readinessStatus === "ready"
      ? "ready"
      : readinessStatus === "blocked"
        ? "blocked"
        : "attention";

  return {
    audienceType,
    targetCustomerLabel: customerLabel,
    relatedRecordType: relatedRecord.type,
    relatedRecordId: relatedRecord.id,
    relatedRecordLabel: relatedRecord.label,
    relatedRecordHref: relatedRecord.href,
    readinessStatus,
    tone,
    reasons: [...new Set(reasons)],
    missingRequirements: [...new Set(missingRequirements)],
    recommendedNextStep:
      readinessStatus === "ready"
        ? "Review the prepared message, then keep any future send action on the approved communications delivery path."
        : readinessStatus === "blocked"
          ? "Resolve the blocked requirement before treating this as customer-bound."
          : "Review the missing context before this becomes send-ready.",
    safeSubjectSuggestion:
      getActionSafeSubject({
        actionType: input.actionType,
        relatedRecordLabel: relatedRecord.label
      }) ?? null,
    safeBodyFraming: getActionSafeBodyFraming(input.actionType),
    customerSafeWarning:
      readinessStatus === "ready"
        ? null
        : "Review-first only: do not send or expose this draft to the customer until the listed items are resolved.",
    documentReadinessLabel:
      input.documentReadiness?.safeDeliveryReadinessLabel ?? null,
    canPrepareCustomerMessage:
      readinessStatus !== "blocked" && audienceType === "customer",
    willSendAutomatically: false
  };
}
