import "server-only";

import { getServerEnv } from "@floorconnector/config";

import {
  buildSaasBillingCheckoutSessionFormData,
  getSaasBillingCheckoutAvailability
} from "./saas-billing-checkout-core";
import {
  ensureStripeCustomerForOrganization,
  getBillingSetupState,
  type BillingSetupState
} from "./billing-setup";

const STRIPE_API_VERSION = "2026-02-25.clover";

type StripeCheckoutSessionPayload = {
  id?: unknown;
  url?: unknown;
  error?: { message?: string };
};

export type SaasBillingCheckoutState = {
  stripeMode: BillingSetupState["stripeMode"];
  priceIdConfigured: boolean;
  canStartCheckout: boolean;
  unavailableReason: string | null;
  stripeCustomerId: string | null;
};

function getFounderPlanPriceId() {
  const env = getServerEnv();

  return env.STRIPE_FOUNDER_PLAN_PRICE_ID ?? null;
}

function getAppUrl(fallbackOrigin: string) {
  const env = getServerEnv();

  return env.NEXT_PUBLIC_APP_URL ?? fallbackOrigin;
}

function getEnvironmentLabel() {
  const env = getServerEnv();

  return env.APP_ENV ?? env.NODE_ENV ?? "development";
}

export async function getSaasBillingCheckoutState(input: {
  organizationId: string;
  userCanManageBilling: boolean;
}): Promise<SaasBillingCheckoutState> {
  const billingState = await getBillingSetupState(input.organizationId);
  const availability = getSaasBillingCheckoutAvailability({
    stripeMode: billingState.stripeMode,
    priceIdConfigured: Boolean(getFounderPlanPriceId()),
    userCanManageBilling: input.userCanManageBilling
  });

  return {
    stripeMode: billingState.stripeMode,
    priceIdConfigured: Boolean(getFounderPlanPriceId()),
    canStartCheckout: availability.canStartCheckout,
    unavailableReason: availability.reason,
    stripeCustomerId: billingState.stripeCustomerId
  };
}

export async function createSaasBillingCheckoutSession(input: {
  organizationId: string;
  organizationName: string;
  userEmail: string | null;
  userCanManageBilling: boolean;
  fallbackOrigin: string;
}) {
  const env = getServerEnv();
  const checkoutState = await getSaasBillingCheckoutState({
    organizationId: input.organizationId,
    userCanManageBilling: input.userCanManageBilling
  });
  const priceId = getFounderPlanPriceId();

  if (!checkoutState.canStartCheckout || !priceId) {
    throw new Error(
      checkoutState.unavailableReason ??
        "Subscription checkout is unavailable right now."
    );
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const stripeCustomerId = await ensureStripeCustomerForOrganization({
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    userEmail: input.userEmail
  });
  const formData = buildSaasBillingCheckoutSessionFormData({
    companyId: input.organizationId,
    stripeCustomerId,
    priceId,
    appUrl: getAppUrl(input.fallbackOrigin),
    environment: getEnvironmentLabel()
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION
    },
    body: formData
  });
  const payload = (await response.json()) as StripeCheckoutSessionPayload;

  if (!response.ok || typeof payload.url !== "string") {
    throw new Error(
      payload.error?.message ??
        "Unable to create a Stripe subscription checkout session."
    );
  }

  return {
    checkoutUrl: payload.url,
    stripeCustomerId
  };
}
