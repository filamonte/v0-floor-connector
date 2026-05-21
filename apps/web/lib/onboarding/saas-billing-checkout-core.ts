import type { SubscriptionState } from "@floorconnector/config";

import type { BillingSetupState } from "./billing-setup";

export const SAAS_BILLING_DOMAIN = "floorconnector_saas";

export type SaasBillingCheckoutAvailabilityInput = {
  stripeMode: BillingSetupState["stripeMode"];
  priceIdConfigured: boolean;
  userCanManageBilling: boolean;
};

export type SaasBillingCheckoutAvailability = {
  canStartCheckout: boolean;
  reason: string | null;
};

export type SaasBillingCheckoutSessionInput = {
  companyId: string;
  stripeCustomerId: string;
  priceId: string;
  appUrl: string;
  environment: string;
};

const supportedSubscriptionStatuses = new Set<SubscriptionState>([
  "trialing",
  "active",
  "past_due",
  "paused",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired"
]);

function normalizeAppUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSaasBillingCheckoutAvailability(
  input: SaasBillingCheckoutAvailabilityInput
): SaasBillingCheckoutAvailability {
  if (!input.userCanManageBilling) {
    return {
      canStartCheckout: false,
      reason: "Only an organization owner or admin can start subscription checkout."
    };
  }

  if (input.stripeMode !== "test") {
    return {
      canStartCheckout: false,
      reason:
        "Subscription checkout is available only with matching Stripe test mode keys in this phase."
    };
  }

  if (!input.priceIdConfigured) {
    return {
      canStartCheckout: false,
      reason: "A founder subscription price id is not configured yet."
    };
  }

  return {
    canStartCheckout: true,
    reason: null
  };
}

export function buildSaasBillingCheckoutSessionFormData(
  input: SaasBillingCheckoutSessionInput
) {
  const baseUrl = normalizeAppUrl(input.appUrl);
  const formData = new URLSearchParams();

  formData.set("mode", "subscription");
  formData.set("customer", input.stripeCustomerId);
  formData.set("client_reference_id", input.companyId);
  formData.set("line_items[0][price]", input.priceId);
  formData.set("line_items[0][quantity]", "1");
  formData.set("success_url", `${baseUrl}/setup/billing?billing_checkout=returned`);
  formData.set("cancel_url", `${baseUrl}/setup/billing?billing_checkout=cancelled`);
  formData.set("metadata[company_id]", input.companyId);
  formData.set("metadata[billing_domain]", SAAS_BILLING_DOMAIN);
  formData.set("metadata[environment]", input.environment);
  formData.set("subscription_data[metadata][company_id]", input.companyId);
  formData.set("subscription_data[metadata][billing_domain]", SAAS_BILLING_DOMAIN);
  formData.set("subscription_data[metadata][environment]", input.environment);

  return formData;
}

export function normalizeStripeSubscriptionStatus(value: string) {
  return supportedSubscriptionStatuses.has(value as SubscriptionState)
    ? (value as SubscriptionState)
    : null;
}
