import type { InvoiceStatus, PaymentEventType, PaymentStatus } from "@floorconnector/types";

export type PaymentReconciliationEventInput = {
  id: string;
  eventType: PaymentEventType;
  paymentId: string | null;
  occurredAt: string;
  gatewayProvider: string | null;
  providerEventId: string | null;
};

export type PaymentReconciliationPaymentInput = {
  id: string;
  amount: string;
  status: PaymentStatus;
  gatewayProvider?: string | null;
  gatewayStatus?: string | null;
  gatewayPaymentIntentReference?: string | null;
  gatewayCheckoutSessionReference?: string | null;
  paymentMethodSummary?: string | null;
  reference?: string | null;
};

export type InvoicePaymentLifecycleInput = {
  invoice: {
    status: InvoiceStatus;
    balanceDueAmount: string;
    totalAmount: string;
  };
  payments: PaymentReconciliationPaymentInput[];
  events: PaymentReconciliationEventInput[];
};

export type PaymentEventEvidenceCategory =
  | "settled"
  | "pending"
  | "failed"
  | "voided"
  | "informational";

export type InvoicePaymentLifecycleStatus =
  | "settled"
  | "partially_paid"
  | "pending"
  | "failed"
  | "voided"
  | "needs_review"
  | "open"
  | "draft";

export type PaymentEventEvidenceClassification = {
  category: PaymentEventEvidenceCategory;
  label: string;
  plainMeaning: string;
  needsReview: boolean;
};

export type InvoicePaymentLifecycleSummary = {
  status: InvoicePaymentLifecycleStatus;
  label: string;
  plainMeaning: string;
  needsReview: boolean;
  latestEvent: PaymentReconciliationEventInput | null;
  recordedPaymentCount: number;
  pendingPaymentCount: number;
  failedEventCount: number;
  voidedEventCount: number;
};

export function classifyPaymentEventEvidence(
  event: PaymentReconciliationEventInput
): PaymentEventEvidenceClassification {
  switch (event.eventType) {
    case "payment_succeeded":
      return {
        category: "settled",
        label: "Payment posted",
        plainMeaning:
          "Provider or system evidence says a payment succeeded and should already be reflected on the canonical invoice balance.",
        needsReview: false
      };
    case "checkout_started":
      return {
        category: "pending",
        label: "Checkout started",
        plainMeaning:
          "A customer entered checkout, but this is not proof that money has posted yet.",
        needsReview: true
      };
    case "payment_requested":
      return {
        category: "pending",
        label: "Payment requested",
        plainMeaning:
          "A payment request exists. Follow the invoice until checkout succeeds, fails, or expires.",
        needsReview: true
      };
    case "payment_failed":
      return {
        category: "failed",
        label: "Payment failed",
        plainMeaning:
          "The last provider/customer attempt failed. The remaining invoice balance still needs collections attention.",
        needsReview: true
      };
    case "payment_voided":
      return {
        category: "voided",
        label: "Payment voided",
        plainMeaning:
          "A payment was voided or expired. Treat the invoice as open unless another successful payment settled it.",
        needsReview: true
      };
    case "provider_sync":
      return {
        category: "informational",
        label: "Provider sync noted",
        plainMeaning:
          "Provider metadata was observed for audit visibility. This event alone does not move money.",
        needsReview: false
      };
  }
}

export function getLatestPaymentEvent(
  events: PaymentReconciliationEventInput[]
) {
  return [...events].sort((left, right) => {
    const occurredComparison = right.occurredAt.localeCompare(left.occurredAt);

    if (occurredComparison !== 0) {
      return occurredComparison;
    }

    return right.id.localeCompare(left.id);
  })[0] ?? null;
}

export function deriveInvoicePaymentLifecycleSummary(
  input: InvoicePaymentLifecycleInput
): InvoicePaymentLifecycleSummary {
  const latestEvent = getLatestPaymentEvent(input.events);
  const latestClassification = latestEvent
    ? classifyPaymentEventEvidence(latestEvent)
    : null;
  const recordedPaymentCount = input.payments.filter(
    (payment) => payment.status === "recorded"
  ).length;
  const pendingPaymentCount = input.payments.filter(
    (payment) => payment.status === "pending"
  ).length;
  const failedEventCount = input.events.filter(
    (event) => event.eventType === "payment_failed"
  ).length;
  const voidedEventCount = input.events.filter(
    (event) => event.eventType === "payment_voided"
  ).length;
  const balanceDue = Number(input.invoice.balanceDueAmount);

  if (input.invoice.status === "draft") {
    return {
      status: "draft",
      label: "Draft invoice",
      plainMeaning:
        "Payment evidence can be reviewed, but customer-facing collection should wait until the invoice is sent.",
      needsReview: false,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  if (input.invoice.status === "paid" || balanceDue <= 0) {
    return {
      status: "settled",
      label: "Settled",
      plainMeaning:
        "The invoice appears settled from canonical invoice balance and payment state.",
      needsReview: false,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  if (latestClassification?.category === "failed") {
    return {
      status: "failed",
      label: "Needs review: failed attempt",
      plainMeaning:
        "A recent payment attempt failed while the invoice still has an open balance.",
      needsReview: true,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  if (latestClassification?.category === "voided") {
    return {
      status: "voided",
      label: "Needs review: voided payment",
      plainMeaning:
        "A recent payment was voided or expired while the invoice still has an open balance.",
      needsReview: true,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  if (pendingPaymentCount > 0 || latestClassification?.category === "pending") {
    return {
      status: "pending",
      label: "Pending payment evidence",
      plainMeaning:
        "Payment activity is in motion, but the invoice is not settled until a successful payment posts.",
      needsReview: true,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  if (input.invoice.status === "partially_paid" || recordedPaymentCount > 0) {
    return {
      status: "partially_paid",
      label: "Partially paid",
      plainMeaning:
        "At least one payment is recorded, but the invoice still carries an open balance.",
      needsReview: true,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  if (failedEventCount > 0 || voidedEventCount > 0) {
    return {
      status: "needs_review",
      label: "Needs reconciliation review",
      plainMeaning:
        "Older failed or voided payment evidence exists on an invoice that still has an open balance.",
      needsReview: true,
      latestEvent,
      recordedPaymentCount,
      pendingPaymentCount,
      failedEventCount,
      voidedEventCount
    };
  }

  return {
    status: "open",
    label: "Open balance",
    plainMeaning:
      "No active payment evidence is settling this invoice yet. Collections can continue from the canonical invoice workspace.",
    needsReview: balanceDue > 0,
    latestEvent,
    recordedPaymentCount,
    pendingPaymentCount,
    failedEventCount,
    voidedEventCount
  };
}

export function getPaymentProviderReferenceRows(input: {
  payment?: PaymentReconciliationPaymentInput | null;
  event?: PaymentReconciliationEventInput | null;
}) {
  const rows: Array<{ label: string; value: string }> = [];
  const payment = input.payment ?? null;
  const event = input.event ?? null;

  const add = (label: string, value?: string | null) => {
    if (value && value.trim().length > 0) {
      rows.push({ label, value });
    }
  };

  add("Provider", event?.gatewayProvider ?? payment?.gatewayProvider);
  add("Gateway status", payment?.gatewayStatus);
  add("Method", payment?.paymentMethodSummary);
  add("Provider event", event?.providerEventId);
  add("Payment intent", payment?.gatewayPaymentIntentReference);
  add("Checkout session", payment?.gatewayCheckoutSessionReference);
  add("Reference", payment?.reference);

  return rows;
}
