import type { PaymentEventType, PaymentStatus } from "@floorconnector/types";

export type PaymentContinuityTone = "neutral" | "attention" | "warning";

export type PaymentContinuityPaymentInput = {
  id: string;
  invoiceId: string;
  amount: string;
  status: PaymentStatus;
  invoice: {
    id: string;
    referenceNumber: string;
    status: string;
    balanceDueAmount: string;
    totalAmount: string;
  } | null;
  customer: {
    name: string;
  } | null;
  project: {
    name: string;
  } | null;
};

export type PaymentContinuityEventInput = {
  id: string;
  invoiceId: string;
  eventType: PaymentEventType;
  occurredAt: string;
  invoice: {
    referenceNumber: string;
    status: string;
    balanceDueAmount: string;
  } | null;
  customer: {
    name: string;
  } | null;
  project: {
    name: string;
  } | null;
};

export type PaymentContinuityItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  customerName: string;
  projectName: string;
  value: string;
  tone: PaymentContinuityTone;
};

export type PaymentContinuityCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: PaymentContinuityTone;
};

export type PaymentContinuityCommand = {
  summaryCards: PaymentContinuityCard[];
  failedOrVoided: PaymentContinuityItem[];
  pendingOutcomes: PaymentContinuityItem[];
  partialBalances: PaymentContinuityItem[];
  settledOutcomes: PaymentContinuityItem[];
  nextMove: {
    label: string;
    href: string;
    reason: string;
  };
};

const failureEventTypes = new Set<PaymentEventType>([
  "payment_failed",
  "payment_voided"
]);
const pendingEventTypes = new Set<PaymentEventType>([
  "payment_requested",
  "checkout_started"
]);

function money(value: string | number) {
  return Number(value).toFixed(2);
}

function eventLabel(eventType: PaymentEventType) {
  return eventType.replaceAll("_", " ");
}

function buildEventItem(
  event: PaymentContinuityEventInput
): PaymentContinuityItem {
  const isFailure = failureEventTypes.has(event.eventType);

  return {
    id: `event-${event.id}`,
    title: event.invoice?.referenceNumber ?? "Payment event",
    detail: isFailure
      ? `${eventLabel(event.eventType)} evidence exists while invoice balance remains ${money(event.invoice?.balanceDueAmount ?? "0")}.`
      : `${eventLabel(event.eventType)} is in motion and still needs a final payment outcome.`,
    href: `/invoices/${event.invoiceId}`,
    customerName: event.customer?.name ?? "Unknown customer",
    projectName: event.project?.name ?? "No project",
    value: event.invoice ? money(event.invoice.balanceDueAmount) : "0.00",
    tone: isFailure ? "warning" : "attention"
  };
}

function buildPaymentItem(
  payment: PaymentContinuityPaymentInput
): PaymentContinuityItem {
  const balanceDue = Number(payment.invoice?.balanceDueAmount ?? 0);
  const isPartial =
    payment.invoice?.status === "partially_paid" ||
    (payment.status === "recorded" && balanceDue > 0);

  return {
    id: `payment-${payment.id}`,
    title: payment.invoice?.referenceNumber ?? "Payment record",
    detail: isPartial
      ? `Recorded payment posted, but ${money(balanceDue)} remains on the canonical invoice balance.`
      : "Recorded payment aligns with a settled or zero-balance invoice outcome.",
    href: `/invoices/${payment.invoiceId}`,
    customerName: payment.customer?.name ?? "Unknown customer",
    projectName: payment.project?.name ?? "No project",
    value: money(payment.amount),
    tone: isPartial ? "attention" : "neutral"
  };
}

function buildCards(input: {
  failedOrVoided: PaymentContinuityItem[];
  pendingOutcomes: PaymentContinuityItem[];
  partialBalances: PaymentContinuityItem[];
  settledOutcomes: PaymentContinuityItem[];
}): PaymentContinuityCard[] {
  return [
    {
      id: "failed-or-voided",
      label: "Failures / voids",
      value: String(input.failedOrVoided.length),
      detail:
        input.failedOrVoided.length > 0
          ? "Payment Trail exceptions need invoice-level review."
          : "No failed or voided payment evidence is active.",
      tone: input.failedOrVoided.length > 0 ? "warning" : "neutral"
    },
    {
      id: "pending-outcomes",
      label: "Pending outcomes",
      value: String(input.pendingOutcomes.length),
      detail:
        input.pendingOutcomes.length > 0
          ? "Payment requests or checkout starts still need a final outcome."
          : "No pending checkout or payment-request evidence is active.",
      tone: input.pendingOutcomes.length > 0 ? "attention" : "neutral"
    },
    {
      id: "partial-balances",
      label: "Partial balances",
      value: String(input.partialBalances.length),
      detail:
        input.partialBalances.length > 0
          ? "Recorded payments still left canonical invoice balances open."
          : "No visible recorded payments left partial balances.",
      tone: input.partialBalances.length > 0 ? "attention" : "neutral"
    },
    {
      id: "settled-outcomes",
      label: "Settled outcomes",
      value: String(input.settledOutcomes.length),
      detail:
        input.settledOutcomes.length > 0
          ? "Recorded payments align with settled invoice outcomes."
          : "No settled payment outcomes are visible in this read model.",
      tone: "neutral"
    }
  ];
}

function buildNextMove(input: {
  failedOrVoided: PaymentContinuityItem[];
  pendingOutcomes: PaymentContinuityItem[];
  partialBalances: PaymentContinuityItem[];
}) {
  const next =
    input.failedOrVoided[0] ??
    input.pendingOutcomes[0] ??
    input.partialBalances[0] ??
    null;

  if (!next) {
    return {
      label: "Review payments",
      href: "/payments",
      reason:
        "No payment continuity exception is active in the visible read model."
    };
  }

  return {
    label: next.tone === "warning" ? "Review exception" : "Review outcome",
    href: next.href,
    reason: next.detail
  };
}

export function buildPaymentContinuityCommand(input: {
  payments: PaymentContinuityPaymentInput[];
  events: PaymentContinuityEventInput[];
}): PaymentContinuityCommand {
  const failedOrVoided = input.events
    .filter((event) => failureEventTypes.has(event.eventType))
    .map(buildEventItem);
  const pendingOutcomes = input.events
    .filter((event) => pendingEventTypes.has(event.eventType))
    .map(buildEventItem);
  const recordedPayments = input.payments.filter(
    (payment) => payment.status === "recorded"
  );
  const partialBalances = recordedPayments
    .filter((payment) => Number(payment.invoice?.balanceDueAmount ?? 0) > 0)
    .map(buildPaymentItem);
  const settledOutcomes = recordedPayments
    .filter((payment) => Number(payment.invoice?.balanceDueAmount ?? 0) <= 0)
    .map(buildPaymentItem);

  return {
    summaryCards: buildCards({
      failedOrVoided,
      pendingOutcomes,
      partialBalances,
      settledOutcomes
    }),
    failedOrVoided: failedOrVoided.slice(0, 4),
    pendingOutcomes: pendingOutcomes.slice(0, 4),
    partialBalances: partialBalances.slice(0, 4),
    settledOutcomes: settledOutcomes.slice(0, 4),
    nextMove: buildNextMove({
      failedOrVoided,
      pendingOutcomes,
      partialBalances
    })
  };
}
