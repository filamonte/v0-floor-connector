import { buildAiCopilotCommunicationHandoffHref } from "@/lib/ai-operational-copilot/communication-handoff";
import type { AiCopilotDraftAction } from "@/lib/ai-operational-copilot/summary";
import type {
  FinancialControlInvoiceInput,
  FinancialControlPaymentEventInput,
  FinancialControlPaymentInput
} from "./collections-summary";

export type CollectionsFollowUpCategory =
  | "overdue_invoice"
  | "unpaid_deposit"
  | "sent_unpaid"
  | "partially_paid"
  | "payment_in_progress"
  | "failed_or_voided_payment"
  | "internal_review";

export type CollectionsFollowUpPriority = "critical" | "high" | "normal";

export type CollectionsFollowUpPaymentState =
  | "unpaid"
  | "partially_paid"
  | "payment_in_progress"
  | "failed_or_voided"
  | "open_balance";

export type CollectionsFollowUpItem = {
  id: string;
  category: CollectionsFollowUpCategory;
  priority: CollectionsFollowUpPriority;
  invoiceId: string;
  invoiceReference: string;
  invoiceHref: string;
  projectId: string | null;
  projectName: string;
  projectHref: string | null;
  customerId: string | null;
  customerName: string;
  customerHref: string | null;
  amountDue: string;
  invoiceStatus: string;
  dueDate: string | null;
  dueOrAgeSignal: string;
  paymentState: CollectionsFollowUpPaymentState;
  reason: string;
  recommendedNextStep: string;
  sourceSignals: string[];
  draftActionAvailable: boolean;
  draftAction: AiCopilotDraftAction | null;
  communicationHandoffHref: string | null;
};

export type CollectionsFollowUpIntelligence = {
  headline: string;
  items: CollectionsFollowUpItem[];
  categories: Array<{
    key: CollectionsFollowUpCategory;
    label: string;
    count: number;
  }>;
};

const categoryLabels: Record<CollectionsFollowUpCategory, string> = {
  overdue_invoice: "Overdue",
  unpaid_deposit: "Deposit",
  sent_unpaid: "Sent unpaid",
  partially_paid: "Partially paid",
  payment_in_progress: "In progress",
  failed_or_voided_payment: "Payment issue",
  internal_review: "Internal review"
};

const priorityRank: Record<CollectionsFollowUpPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2
};

function money(value: string | number) {
  return Number(value).toFixed(2);
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function daysPastDue(invoice: FinancialControlInvoiceInput, todayIso: string) {
  if (!invoice.dueDate) {
    return null;
  }

  return Math.floor(
    (parseDateKey(todayIso).getTime() -
      parseDateKey(invoice.dueDate).getTime()) /
      86_400_000
  );
}

function isOpenReceivable(invoice: FinancialControlInvoiceInput) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function getLatestEvent(
  invoiceId: string,
  paymentEvents: FinancialControlPaymentEventInput[]
) {
  return paymentEvents
    .filter((event) => event.invoiceId === invoiceId)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))[0];
}

function hasPendingPayment(
  invoiceId: string,
  payments: FinancialControlPaymentInput[]
) {
  return payments.some(
    (payment) => payment.invoiceId === invoiceId && payment.status === "pending"
  );
}

function classifyItem(input: {
  invoice: FinancialControlInvoiceInput;
  latestEvent: FinancialControlPaymentEventInput | undefined;
  hasPendingPayment: boolean;
  todayIso: string;
}): {
  category: CollectionsFollowUpCategory;
  priority: CollectionsFollowUpPriority;
  paymentState: CollectionsFollowUpPaymentState;
  reason: string;
  recommendedNextStep: string;
} {
  const daysOverdue = daysPastDue(input.invoice, input.todayIso);
  const latestEventType = input.latestEvent?.eventType;

  if (
    latestEventType === "payment_failed" ||
    latestEventType === "payment_voided"
  ) {
    return {
      category: "failed_or_voided_payment",
      priority: "critical",
      paymentState: "failed_or_voided",
      reason:
        latestEventType === "payment_failed"
          ? "A payment attempt failed and the invoice still has an open balance."
          : "A payment was voided and the invoice still has an open balance.",
      recommendedNextStep: "Review Payment Trail and prepare follow-up"
    };
  }

  if (
    input.hasPendingPayment ||
    latestEventType === "payment_requested" ||
    latestEventType === "checkout_started"
  ) {
    return {
      category: "payment_in_progress",
      priority: "high",
      paymentState: "payment_in_progress",
      reason:
        latestEventType === "checkout_started"
          ? "Checkout started but no completed payment outcome is recorded yet."
          : "Payment activity is pending and needs a clear outcome before another nudge.",
      recommendedNextStep: "Review payment progress"
    };
  }

  if (input.invoice.workflowRole === "deposit") {
    return {
      category: "unpaid_deposit",
      priority: "high",
      paymentState: "unpaid",
      reason: "Deposit invoice has an open balance tied to project readiness.",
      recommendedNextStep: "Prepare deposit reminder"
    };
  }

  if (input.invoice.status === "partially_paid") {
    return {
      category: "partially_paid",
      priority: "high",
      paymentState: "partially_paid",
      reason: "Invoice is partially paid with a remaining balance.",
      recommendedNextStep: "Prepare balance follow-up"
    };
  }

  if (daysOverdue !== null && daysOverdue > 0) {
    return {
      category: "overdue_invoice",
      priority: daysOverdue > 30 ? "critical" : "high",
      paymentState: "unpaid",
      reason: `Invoice is ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} past due.`,
      recommendedNextStep: "Prepare payment reminder"
    };
  }

  return {
    category: "sent_unpaid",
    priority: "normal",
    paymentState: "open_balance",
    reason: "Sent invoice has an open balance.",
    recommendedNextStep: "Review invoice follow-up"
  };
}

function buildDueOrAgeSignal(
  invoice: FinancialControlInvoiceInput,
  todayIso: string
) {
  const daysOverdue = daysPastDue(invoice, todayIso);

  if (daysOverdue === null) {
    return "No due date recorded.";
  }

  if (daysOverdue > 0) {
    return `${daysOverdue} day${daysOverdue === 1 ? "" : "s"} past due.`;
  }

  if (daysOverdue === 0) {
    return "Due today.";
  }

  return `Due in ${Math.abs(daysOverdue)} day${daysOverdue === -1 ? "" : "s"}.`;
}

function buildDraftAction(input: {
  itemId: string;
  category: CollectionsFollowUpCategory;
  priority: CollectionsFollowUpPriority;
  invoice: FinancialControlInvoiceInput;
  projectName: string;
  customerName: string;
  reason: string;
  amountDue: string;
  dueOrAgeSignal: string;
  sourceSignals: string[];
}): AiCopilotDraftAction | null {
  if (!input.invoice.projectId || !input.invoice.customerId) {
    return {
      id: `${input.itemId}:internal-collections-review-draft`,
      actionType: "internal_collections_review_summary",
      audience: "internal",
      title: "Internal collections review",
      subject: `${input.invoice.referenceNumber}: collections review`,
      draftBody: `Review ${input.invoice.referenceNumber} before customer follow-up. ${input.reason} Amount due is $${input.amountDue}. Confirm customer and project context before any outbound message.`,
      operationalReason:
        "The invoice needs internal review before a customer follow-up draft is safe.",
      sourceWorkflowSignals: input.sourceSignals,
      priority: input.priority,
      reviewSafetyNote:
        "Review and edit this draft before using it. The Copilot does not send, save, invoice, collect, or create notifications."
    };
  }

  const shared = {
    priority: input.priority,
    sourceWorkflowSignals: input.sourceSignals,
    reviewSafetyNote:
      "Review and edit this draft before using it. The Copilot does not send, save, invoice, collect, or create notifications."
  } satisfies Pick<
    AiCopilotDraftAction,
    "priority" | "sourceWorkflowSignals" | "reviewSafetyNote"
  >;

  if (input.category === "failed_or_voided_payment") {
    return {
      id: `${input.itemId}:payment-failed-follow-up-draft`,
      actionType: "payment_failed_follow_up",
      audience: "customer",
      title: "Payment issue follow-up",
      subject: `${input.projectName}: payment follow-up`,
      draftBody: `Hi ${input.customerName}, we saw that the recent payment attempt for ${input.projectName} did not complete. The remaining balance on ${input.invoice.referenceNumber} is $${input.amountDue}. Please review the invoice when you have a moment, and let us know if you need us to resend the payment link or help with anything.`,
      operationalReason: input.reason,
      ...shared
    };
  }

  if (input.category === "partially_paid") {
    return {
      id: `${input.itemId}:partial-balance-follow-up-draft`,
      actionType: "partial_balance_follow_up",
      audience: "customer",
      title: "Remaining balance follow-up",
      subject: `${input.projectName}: remaining invoice balance`,
      draftBody: `Hi ${input.customerName}, thank you for the payment on ${input.projectName}. There is a remaining balance of $${input.amountDue} on ${input.invoice.referenceNumber}. Please review when convenient, and let us know if you have any questions.`,
      operationalReason: input.reason,
      ...shared
    };
  }

  if (input.category === "unpaid_deposit") {
    return {
      id: `${input.itemId}:deposit-payment-reminder-draft`,
      actionType: "deposit_payment_reminder",
      audience: "customer",
      title: "Deposit reminder",
      subject: `${input.projectName}: deposit follow-up`,
      draftBody: `Hi ${input.customerName}, we are following up on the deposit invoice for ${input.projectName}. The open deposit balance on ${input.invoice.referenceNumber} is $${input.amountDue}. Once that is handled, we can keep the next project steps moving.`,
      operationalReason: input.reason,
      ...shared
    };
  }

  return {
    id: `${input.itemId}:payment-reminder-draft`,
    actionType: "payment_reminder",
    audience: "customer",
    title: "Payment reminder",
    subject: `${input.projectName}: invoice follow-up`,
    draftBody: `Hi ${input.customerName}, we are following up on ${input.invoice.referenceNumber} for ${input.projectName}. The current balance due is $${input.amountDue}. ${input.dueOrAgeSignal} Please review when you have a moment, and let us know if you have any questions.`,
    operationalReason: input.reason,
    ...shared
  };
}

function buildHandoff(input: {
  draftAction: AiCopilotDraftAction | null;
  invoice: FinancialControlInvoiceInput;
  projectName: string;
  customerName: string;
}) {
  if (!input.draftAction || !input.invoice.projectId) {
    return null;
  }

  return buildAiCopilotCommunicationHandoffHref({
    action: input.draftAction,
    projectId: input.invoice.projectId,
    projectName: input.projectName,
    customerId: input.invoice.customerId ?? null,
    customerName: input.customerName
  });
}

function sortItems(
  left: CollectionsFollowUpItem,
  right: CollectionsFollowUpItem
) {
  const priorityComparison =
    priorityRank[left.priority] - priorityRank[right.priority];

  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  const leftDue = left.dueDate ?? "9999-12-31";
  const rightDue = right.dueDate ?? "9999-12-31";
  const dueComparison = leftDue.localeCompare(rightDue);

  if (dueComparison !== 0) {
    return dueComparison;
  }

  return Number(right.amountDue) - Number(left.amountDue);
}

export function buildCollectionsFollowUpIntelligence(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  todayIso: string;
  limit?: number;
}): CollectionsFollowUpIntelligence {
  const items = input.invoices
    .filter(isOpenReceivable)
    .map((invoice) => {
      const latestEvent = getLatestEvent(invoice.id, input.paymentEvents);
      const classification = classifyItem({
        invoice,
        latestEvent,
        hasPendingPayment: hasPendingPayment(invoice.id, input.payments),
        todayIso: input.todayIso
      });
      const projectName = invoice.project?.name ?? "No project";
      const customerName = invoice.customer?.name ?? "Unknown customer";
      const amountDue = money(invoice.balanceDueAmount);
      const dueOrAgeSignal = buildDueOrAgeSignal(invoice, input.todayIso);
      const sourceSignals = [
        `Invoice: ${invoice.referenceNumber}`,
        `Invoice status: ${formatStatusLabel(invoice.status)}`,
        `Workflow role: ${formatStatusLabel(invoice.workflowRole)}`,
        `Balance due: $${amountDue}`,
        dueOrAgeSignal,
        latestEvent ? `Payment event: ${latestEvent.eventType}` : null
      ].filter((signal): signal is string => Boolean(signal));
      const itemId = `collections-follow-up-${invoice.id}`;
      const draftAction = buildDraftAction({
        itemId,
        category: classification.category,
        priority: classification.priority,
        invoice,
        projectName,
        customerName,
        reason: classification.reason,
        amountDue,
        dueOrAgeSignal,
        sourceSignals
      });

      return {
        id: itemId,
        category: classification.category,
        priority: classification.priority,
        invoiceId: invoice.id,
        invoiceReference: invoice.referenceNumber,
        invoiceHref: `/invoices/${invoice.id}`,
        projectId: invoice.projectId ?? null,
        projectName,
        projectHref: invoice.projectId
          ? `/projects/${invoice.projectId}`
          : null,
        customerId: invoice.customerId ?? null,
        customerName,
        customerHref: invoice.customerId
          ? `/customers/${invoice.customerId}`
          : null,
        amountDue,
        invoiceStatus: invoice.status,
        dueDate: invoice.dueDate,
        dueOrAgeSignal,
        paymentState: classification.paymentState,
        reason: classification.reason,
        recommendedNextStep: classification.recommendedNextStep,
        sourceSignals,
        draftActionAvailable: draftAction !== null,
        draftAction,
        communicationHandoffHref: buildHandoff({
          draftAction,
          invoice,
          projectName,
          customerName
        })
      } satisfies CollectionsFollowUpItem;
    })
    .sort(sortItems)
    .slice(0, input.limit ?? 12);

  return {
    headline:
      items.length === 0
        ? "No collections follow-up is active from current invoices and payment events."
        : `${items.length} invoice${items.length === 1 ? "" : "s"} need collections follow-up from current invoice and payment evidence.`,
    items,
    categories: Object.entries(categoryLabels).map(([key, label]) => ({
      key: key as CollectionsFollowUpCategory,
      label,
      count: items.filter((item) => item.category === key).length
    }))
  };
}
