import { createHmac, timingSafeEqual } from "node:crypto";

import type { SubscriptionState } from "@floorconnector/config";

import {
  normalizeStripeSubscriptionStatus,
  SAAS_BILLING_DOMAIN
} from "./saas-billing-checkout-core";

const handledSaasBillingEventTypes = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed"
]);

type StripeEventEnvelope = {
  id?: unknown;
  type?: unknown;
  created?: unknown;
  data?: {
    object?: unknown;
  };
};

export type SaasBillingWebhookIgnoredResult = {
  outcome: "ignore";
  eventId: string | null;
  eventType: string | null;
  reason:
    | "missing_event_envelope"
    | "unsupported_event_type"
    | "missing_event_object"
    | "not_saas_billing_domain"
    | "missing_company_id"
    | "environment_mismatch"
    | "duplicate_provider_event";
};

export type SaasBillingWebhookProcessResult = {
  outcome: "process";
  eventId: string;
  eventType: string;
  companyId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: SubscriptionState | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: string | null;
  stripeCheckoutSessionId: string | null;
  stripeLastEventId: string;
  stripeLastWebhookReceivedAt: string;
};

export type SaasBillingWebhookMapResult =
  | SaasBillingWebhookIgnoredResult
  | SaasBillingWebhookProcessResult;

export type StripeWebhookSignatureInput = {
  rawBody: string;
  signatureHeader: string;
  secret: string;
  nowMs?: number;
};

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asUnixTimestampIso(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function getMetadataFromRecord(record: Record<string, unknown> | null) {
  const metadata = asRecord(record?.metadata);

  return metadata ?? {};
}

function findSaasBillingMetadata(object: Record<string, unknown>) {
  const objectMetadata = getMetadataFromRecord(object);

  if (objectMetadata.billing_domain === SAAS_BILLING_DOMAIN) {
    return objectMetadata;
  }

  const subscriptionDetailsMetadata = getMetadataFromRecord(
    asRecord(object.subscription_details)
  );

  if (subscriptionDetailsMetadata.billing_domain === SAAS_BILLING_DOMAIN) {
    return subscriptionDetailsMetadata;
  }

  const firstLine = getFirstLineItem(object);
  const firstLineMetadata = getMetadataFromRecord(firstLine);

  if (firstLineMetadata.billing_domain === SAAS_BILLING_DOMAIN) {
    return firstLineMetadata;
  }

  return objectMetadata;
}

function getFirstLineItem(object: Record<string, unknown>) {
  const lines = asRecord(object.lines);
  const data = Array.isArray(lines?.data) ? lines.data : [];

  return asRecord(data[0]);
}

function getFirstSubscriptionItem(object: Record<string, unknown>) {
  const items = asRecord(object.items);
  const data = Array.isArray(items?.data) ? items.data : [];

  return asRecord(data[0]);
}

function getPriceId(object: Record<string, unknown>) {
  const subscriptionItem = getFirstSubscriptionItem(object);
  const lineItem = getFirstLineItem(object);

  return (
    asString(asRecord(subscriptionItem?.price)?.id) ??
    asString(asRecord(lineItem?.price)?.id) ??
    asString(object.price_id)
  );
}

function getCurrentPeriodEnd(object: Record<string, unknown>) {
  const lineItem = getFirstLineItem(object);

  return (
    asUnixTimestampIso(object.current_period_end) ??
    asUnixTimestampIso(asRecord(lineItem?.period)?.end)
  );
}

function getSubscriptionId(object: Record<string, unknown>) {
  return asString(object.subscription) ?? asString(object.id);
}

function getSubscriptionStatus(eventType: string, object: Record<string, unknown>) {
  if (eventType === "customer.subscription.deleted") {
    return "canceled" satisfies SubscriptionState;
  }

  if (eventType === "invoice.paid") {
    return "active" satisfies SubscriptionState;
  }

  if (eventType === "invoice.payment_failed") {
    return "past_due" satisfies SubscriptionState;
  }

  return normalizeStripeSubscriptionStatus(asString(object.status) ?? "");
}

function getEventCreatedIso(event: StripeEventEnvelope) {
  return asUnixTimestampIso(event.created) ?? new Date().toISOString();
}

export function mapSaasBillingWebhookEvent(
  event: StripeEventEnvelope,
  options: { expectedEnvironment?: string | null; lastProcessedEventId?: string | null } = {}
): SaasBillingWebhookMapResult {
  const eventId = asString(event.id);
  const eventType = asString(event.type);

  if (!eventId || !eventType) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "missing_event_envelope"
    };
  }

  if (options.lastProcessedEventId === eventId) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "duplicate_provider_event"
    };
  }

  if (!handledSaasBillingEventTypes.has(eventType)) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "unsupported_event_type"
    };
  }

  const object = asRecord(event.data?.object);

  if (!object) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "missing_event_object"
    };
  }

  const metadata = findSaasBillingMetadata(object);

  if (metadata.billing_domain !== SAAS_BILLING_DOMAIN) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "not_saas_billing_domain"
    };
  }

  const companyId =
    asString(metadata.company_id) ?? asString(object.client_reference_id);

  if (!companyId) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "missing_company_id"
    };
  }

  const eventEnvironment = asString(metadata.environment);

  if (
    options.expectedEnvironment &&
    eventEnvironment &&
    eventEnvironment !== options.expectedEnvironment
  ) {
    return {
      outcome: "ignore",
      eventId,
      eventType,
      reason: "environment_mismatch"
    };
  }

  return {
    outcome: "process",
    eventId,
    eventType,
    companyId,
    stripeCustomerId: asString(object.customer),
    stripeSubscriptionId:
      eventType === "checkout.session.completed"
        ? asString(object.subscription)
        : getSubscriptionId(object),
    stripeSubscriptionStatus: getSubscriptionStatus(eventType, object),
    stripePriceId: getPriceId(object),
    stripeCurrentPeriodEnd: getCurrentPeriodEnd(object),
    stripeCheckoutSessionId:
      eventType === "checkout.session.completed" ? asString(object.id) : null,
    stripeLastEventId: eventId,
    stripeLastWebhookReceivedAt: getEventCreatedIso(event)
  };
}

export function parseSaasBillingWebhookEvent(rawBody: string) {
  return JSON.parse(rawBody) as StripeEventEnvelope;
}

export function verifyStripeWebhookSignature(input: StripeWebhookSignatureInput) {
  const toleranceSeconds = 300;
  const fragments = input.signatureHeader.split(",");
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
  const nowMs = input.nowMs ?? Date.now();

  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(nowMs / 1000 - timestampSeconds) > toleranceSeconds
  ) {
    throw new Error("Stripe webhook signature timestamp is outside the accepted tolerance.");
  }

  const expectedSignature = createHmac("sha256", input.secret)
    .update(`${timestamp}.${input.rawBody}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature);
  const verified = signatures.some((signature) => {
    const providedBuffer = Buffer.from(signature);

    return (
      providedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(providedBuffer, expectedBuffer)
    );
  });

  if (!verified) {
    throw new Error("Stripe webhook signature verification failed.");
  }
}
