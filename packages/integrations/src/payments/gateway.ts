import { createHmac, timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@floorconnector/config";

export type PaymentGatewayProvider = "stripe" | "local_manual";

export type CreatePaymentGatewayCheckoutSessionInput = {
  organizationId: string;
  invoiceId: string;
  paymentId?: string | null;
  referenceNumber: string;
  workflowRole: string;
  amount: string;
  currency: string;
  payerEmail: string | null;
  successUrl: string;
  cancelUrl: string;
};

export type PaymentGatewayCheckoutSession = {
  gatewayProvider: PaymentGatewayProvider;
  gatewayCheckoutSessionReference: string;
  gatewayPaymentIntentReference: string | null;
  gatewayStatus: string | null;
  checkoutUrl: string;
  paymentMethodSummary: string | null;
  payload: Record<string, unknown>;
};

export type VerifyPaymentGatewayWebhookInput = {
  headers: Headers;
  rawBody: string;
};

export type PaymentGatewayWebhookOutcome = "success" | "failure" | "void" | "ignore";

export type PaymentGatewayWebhookEvent = {
  gatewayProvider: PaymentGatewayProvider;
  providerEventId: string;
  providerEventType: string;
  outcome: PaymentGatewayWebhookOutcome;
  organizationId: string | null;
  invoiceId: string | null;
  paymentId: string | null;
  amount: string | null;
  currency: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  gatewayPaymentIntentReference: string | null;
  gatewayCheckoutSessionReference: string | null;
  gatewayStatus: string | null;
  paymentMethodSummary: string | null;
  payerEmail: string | null;
  notes: string | null;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export interface PaymentGatewayAdapter {
  readonly provider: PaymentGatewayProvider;
  createCheckoutSession(
    input: CreatePaymentGatewayCheckoutSessionInput
  ): Promise<PaymentGatewayCheckoutSession>;
  verifyAndNormalizeWebhookEvent(
    input: VerifyPaymentGatewayWebhookInput
  ): Promise<PaymentGatewayWebhookEvent>;
}

type StripeCheckoutSessionResponse = {
  id?: unknown;
  url?: unknown;
  status?: unknown;
  payment_intent?: unknown;
  payment_status?: unknown;
};

type StripeEventEnvelope = {
  id?: unknown;
  type?: unknown;
  created?: unknown;
  data?: {
    object?: Record<string, unknown>;
  };
};

function amountToMinorUnits(amount: string) {
  const cents = Math.round(Number(amount) * 100);

  if (!Number.isFinite(cents) || cents <= 0) {
    throw new Error("Checkout amount must be a positive currency value.");
  }

  return cents;
}

function withMessage(urlString: string, message: string) {
  const url = new URL(urlString);
  url.searchParams.set("message", message);
  return url.toString();
}

function numberToCurrencyAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return (value / 100).toFixed(2);
}

function getObjectRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getMetadata(value: unknown) {
  const record = getObjectRecord(value);

  return record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
    ? (record.metadata as Record<string, unknown>)
    : {};
}

function getString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getOccurredAtIso(created: unknown) {
  if (typeof created === "number" && Number.isFinite(created)) {
    return new Date(created * 1000).toISOString();
  }

  return new Date().toISOString();
}

function formatCardSummary(card: Record<string, unknown> | null) {
  if (!card) {
    return null;
  }

  const brand = getString(card.brand);
  const last4 = getString(card.last4);

  if (brand && last4) {
    return `${brand.toUpperCase()} ending in ${last4}`;
  }

  return brand ?? null;
}

function createStripeExpectedSignature(secret: string, timestamp: string, rawBody: string) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
}

function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string) {
  const stripeWebhookToleranceSeconds = 300;
  const fragments = signatureHeader.split(",");
  const timestamp = fragments
    .map((fragment) => fragment.trim())
    .find((fragment) => fragment.startsWith("t="))
    ?.slice(2);
  const signatures = fragments
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.startsWith("v1="))
    .map((fragment) => fragment.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error("Stripe webhook signature header is invalid.");
  }

  const timestampSeconds = Number(timestamp);

  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(Date.now() / 1000 - timestampSeconds) > stripeWebhookToleranceSeconds
  ) {
    throw new Error("Stripe webhook signature timestamp is outside the accepted tolerance.");
  }

  const expectedSignature = createStripeExpectedSignature(secret, timestamp, rawBody);
  const expectedBuffer = Buffer.from(expectedSignature);
  const hasMatch = signatures.some((signature) => {
    const providedBuffer = Buffer.from(signature);
    return (
      providedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(providedBuffer, expectedBuffer)
    );
  });

  if (!hasMatch) {
    throw new Error("Stripe webhook signature verification failed.");
  }
}

function normalizeStripeWebhookEvent(rawBody: string): PaymentGatewayWebhookEvent {
  const envelope = JSON.parse(rawBody) as StripeEventEnvelope;

  if (typeof envelope.id !== "string" || typeof envelope.type !== "string") {
    throw new Error("Stripe webhook payload is missing the event envelope.");
  }

  const object = getObjectRecord(envelope.data?.object);

  if (!object) {
    throw new Error("Stripe webhook payload is missing the event object.");
  }

  const metadata = getMetadata(object);
  const organizationId = getString(metadata.organization_id);
  const invoiceId = getString(metadata.invoice_id);
  const paymentId = getString(metadata.payment_id);
  const customerDetails = getObjectRecord(object.customer_details);
  const charges = getObjectRecord(object.charges);
  const chargeData = Array.isArray(charges?.data) ? charges.data : [];
  const latestCharge = getObjectRecord(chargeData[0]);
  const paymentMethodDetails = getObjectRecord(latestCharge?.payment_method_details);
  const cardDetails = getObjectRecord(paymentMethodDetails?.card);

  const baseEvent: PaymentGatewayWebhookEvent = {
    gatewayProvider: "stripe",
    providerEventId: envelope.id,
    providerEventType: envelope.type,
    outcome: "ignore",
    organizationId,
    invoiceId,
    paymentId,
    amount:
      numberToCurrencyAmount(
        typeof object.amount_total === "number"
          ? object.amount_total
          : typeof object.amount_received === "number"
            ? object.amount_received
            : typeof object.amount === "number"
              ? object.amount
              : null
      ),
    currency: getString(object.currency),
    paymentDate: null,
    paymentMethod:
      getString(paymentMethodDetails?.type) ??
      getString(object.payment_method_collection) ??
      "Gateway checkout",
    gatewayPaymentIntentReference: getString(object.payment_intent) ?? getString(object.id),
    gatewayCheckoutSessionReference:
      envelope.type.startsWith("checkout.session.")
        ? getString(object.id)
        : getString(metadata.checkout_session_id),
    gatewayStatus:
      getString(object.payment_status) ?? getString(object.status) ?? getString(object.cancellation_reason),
    paymentMethodSummary:
      formatCardSummary(cardDetails) ??
      getString(object.customer_email) ??
      null,
    payerEmail:
      getString(customerDetails?.email) ??
      getString(object.customer_email) ??
      getString(object.receipt_email),
    notes:
      getString(getObjectRecord(object.last_payment_error)?.message) ??
      getString(object.cancellation_reason),
    occurredAt: getOccurredAtIso(envelope.created),
    payload: {
      stripeEvent: envelope,
      stripeObjectType:
        typeof object.object === "string" ? object.object : null
    }
  };

  switch (envelope.type) {
    case "checkout.session.completed":
      return {
        ...baseEvent,
        outcome: getString(object.payment_status) === "paid" ? "success" : "ignore",
        gatewayStatus: getString(object.payment_status) ?? "complete",
        gatewayPaymentIntentReference: getString(object.payment_intent),
        gatewayCheckoutSessionReference: getString(object.id),
        paymentDate: getOccurredAtIso(envelope.created).slice(0, 10),
        paymentMethod: "Gateway checkout"
      };
    case "checkout.session.async_payment_succeeded":
      return {
        ...baseEvent,
        outcome: "success",
        gatewayStatus: getString(object.payment_status) ?? "paid",
        gatewayPaymentIntentReference: getString(object.payment_intent),
        gatewayCheckoutSessionReference: getString(object.id),
        paymentDate: getOccurredAtIso(envelope.created).slice(0, 10),
        paymentMethod: "Gateway checkout"
      };
    case "checkout.session.async_payment_failed":
      return {
        ...baseEvent,
        outcome: "failure",
        gatewayStatus: getString(object.payment_status) ?? "failed",
        gatewayPaymentIntentReference: getString(object.payment_intent),
        gatewayCheckoutSessionReference: getString(object.id),
        paymentMethod: "Gateway checkout"
      };
    case "checkout.session.expired":
      return {
        ...baseEvent,
        outcome: "void",
        gatewayStatus: getString(object.status) ?? "expired",
        gatewayPaymentIntentReference: getString(object.payment_intent),
        gatewayCheckoutSessionReference: getString(object.id),
        paymentMethod: "Gateway checkout"
      };
    case "payment_intent.succeeded":
      return {
        ...baseEvent,
        outcome: "success",
        gatewayStatus: getString(object.status) ?? "succeeded",
        gatewayPaymentIntentReference: getString(object.id),
        paymentDate: getOccurredAtIso(envelope.created).slice(0, 10),
        paymentMethod: formatCardSummary(cardDetails) ? "Card" : "Gateway payment"
      };
    case "payment_intent.payment_failed":
      return {
        ...baseEvent,
        outcome: "failure",
        gatewayStatus: getString(object.status) ?? "failed",
        gatewayPaymentIntentReference: getString(object.id),
        paymentMethod: formatCardSummary(cardDetails) ? "Card" : "Gateway payment"
      };
    case "payment_intent.canceled":
      return {
        ...baseEvent,
        outcome: "void",
        gatewayStatus: getString(object.status) ?? "canceled",
        gatewayPaymentIntentReference: getString(object.id),
        paymentMethod: formatCardSummary(cardDetails) ? "Card" : "Gateway payment"
      };
    default:
      return baseEvent;
  }
}

class StripePaymentGatewayAdapter implements PaymentGatewayAdapter {
  readonly provider = "stripe" as const;

  async createCheckoutSession(
    input: CreatePaymentGatewayCheckoutSessionInput
  ): Promise<PaymentGatewayCheckoutSession> {
    const env = getServerEnv();

    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is required for Stripe checkout.");
    }

    const formData = new URLSearchParams();
    formData.set("mode", "payment");
    formData.set("success_url", input.successUrl);
    formData.set("cancel_url", input.cancelUrl);
    formData.set("client_reference_id", input.paymentId ?? input.invoiceId);
    formData.set(
      "line_items[0][price_data][currency]",
      input.currency.toLowerCase()
    );
    formData.set(
      "line_items[0][price_data][unit_amount]",
      amountToMinorUnits(input.amount).toString()
    );
    formData.set(
      "line_items[0][price_data][product_data][name]",
      `Invoice ${input.referenceNumber}`
    );
    formData.set(
      "line_items[0][price_data][product_data][description]",
      input.workflowRole === "deposit"
        ? "Deposit invoice payment via FloorConnector"
        : "Invoice payment via FloorConnector"
    );
    formData.set("line_items[0][quantity]", "1");
    formData.set("metadata[organization_id]", input.organizationId);
    formData.set("metadata[invoice_id]", input.invoiceId);
    if (input.paymentId) {
      formData.set("metadata[payment_id]", input.paymentId);
      formData.set("payment_intent_data[metadata][payment_id]", input.paymentId);
    }
    formData.set("metadata[reference_number]", input.referenceNumber);
    formData.set("payment_intent_data[metadata][organization_id]", input.organizationId);
    formData.set("payment_intent_data[metadata][invoice_id]", input.invoiceId);
    formData.set(
      "payment_intent_data[metadata][reference_number]",
      input.referenceNumber
    );

    if (input.payerEmail) {
      formData.set("customer_email", input.payerEmail);
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString(),
      cache: "no-store"
    });

    const payload = (await response.json()) as StripeCheckoutSessionResponse & {
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(
        payload.error?.message ??
          "Unable to create a Stripe checkout session for this invoice."
      );
    }

    if (typeof payload.id !== "string" || typeof payload.url !== "string") {
      throw new Error("Stripe checkout response did not include session details.");
    }

    return {
      gatewayProvider: this.provider,
      gatewayCheckoutSessionReference: payload.id,
      gatewayPaymentIntentReference:
        typeof payload.payment_intent === "string" ? payload.payment_intent : null,
      gatewayStatus:
        typeof payload.status === "string"
          ? payload.status
          : typeof payload.payment_status === "string"
            ? payload.payment_status
            : "open",
      checkoutUrl: payload.url,
      paymentMethodSummary: null,
      payload: {
        stripeCheckoutSessionId: payload.id,
        stripePaymentIntentReference:
          typeof payload.payment_intent === "string" ? payload.payment_intent : null,
        stripeCheckoutStatus:
          typeof payload.status === "string" ? payload.status : null,
        stripePaymentStatus:
          typeof payload.payment_status === "string" ? payload.payment_status : null
      }
    };
  }

  verifyAndNormalizeWebhookEvent(
    input: VerifyPaymentGatewayWebhookInput
  ): Promise<PaymentGatewayWebhookEvent> {
    const env = getServerEnv();

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook secret is required for Stripe callbacks.");
    }

    const signatureHeader = input.headers.get("stripe-signature");

    if (!signatureHeader) {
      throw new Error("Stripe webhook signature header is missing.");
    }

    verifyStripeSignature(input.rawBody, signatureHeader, env.STRIPE_WEBHOOK_SECRET);

    return Promise.resolve(normalizeStripeWebhookEvent(input.rawBody));
  }
}

class LocalManualPaymentGatewayAdapter implements PaymentGatewayAdapter {
  readonly provider = "local_manual" as const;

  createCheckoutSession(
    input: CreatePaymentGatewayCheckoutSessionInput
  ): Promise<PaymentGatewayCheckoutSession> {
    const gatewayCheckoutSessionReference = `local_checkout_${crypto.randomUUID()}`;

    return Promise.resolve({
      gatewayProvider: this.provider,
      gatewayCheckoutSessionReference,
      gatewayPaymentIntentReference: null,
      gatewayStatus: "open",
      checkoutUrl: withMessage(
        input.cancelUrl,
        "A local payment checkout session was created. External gateway completion is not configured in this environment yet."
      ),
      paymentMethodSummary: null,
      payload: {
        localCheckoutSessionReference: gatewayCheckoutSessionReference
      }
    });
  }

  verifyAndNormalizeWebhookEvent(): Promise<PaymentGatewayWebhookEvent> {
    return Promise.reject(
      new Error("Local manual payment gateway does not support webhook callbacks.")
    );
  }
}

export function getPaymentGatewayAdapter(
  provider?: PaymentGatewayProvider
): PaymentGatewayAdapter {
  if (provider === "stripe") {
    return new StripePaymentGatewayAdapter();
  }

  if (provider === "local_manual") {
    return new LocalManualPaymentGatewayAdapter();
  }

  const env = getServerEnv();

  if (env.STRIPE_SECRET_KEY) {
    return new StripePaymentGatewayAdapter();
  }

  return new LocalManualPaymentGatewayAdapter();
}

export async function createPaymentGatewayCheckoutSession(
  input: CreatePaymentGatewayCheckoutSessionInput
) {
  return getPaymentGatewayAdapter().createCheckoutSession(input);
}

export async function verifyAndNormalizePaymentGatewayWebhookEvent(
  provider: PaymentGatewayProvider,
  input: VerifyPaymentGatewayWebhookInput
) {
  return getPaymentGatewayAdapter(provider).verifyAndNormalizeWebhookEvent(input);
}
