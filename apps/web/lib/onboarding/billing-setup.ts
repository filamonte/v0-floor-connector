import "server-only";

import { getServerEnv } from "@floorconnector/config";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const STRIPE_API_VERSION = "2026-02-25.clover";

export type BillingSetupState = {
  publishableKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  stripeMode: "not_configured" | "test" | "live" | "mixed";
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  canCollectCardNow: boolean;
  deferredReason: string | null;
};

type OrganizationBillingRow = {
  id: string;
  display_name: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
};

type StripeCustomerPayload = {
  id?: unknown;
  error?: { message?: string };
};

type StripeSetupIntentPayload = {
  id?: unknown;
  status?: unknown;
  customer?: unknown;
  payment_method?: unknown;
  client_secret?: unknown;
  error?: { message?: string };
};

async function getOrganizationBillingRow(organizationId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .select("id, display_name, stripe_customer_id, stripe_payment_method_id")
    .eq("id", organizationId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to inspect organization billing state: ${response.error.message}`);
  }

  return response.data ? (response.data as OrganizationBillingRow) : null;
}

async function updateOrganizationBillingRefs(
  organizationId: string,
  refs: Partial<Pick<OrganizationBillingRow, "stripe_customer_id" | "stripe_payment_method_id">>
) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.from("companies").update(refs).eq("id", organizationId);

  if (response.error) {
    throw new Error(`Unable to store Stripe billing reference: ${response.error.message}`);
  }
}

async function createStripeCustomer(input: {
  organizationId: string;
  organizationName: string;
  userEmail: string | null;
}) {
  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const formData = new URLSearchParams();
  formData.set("name", input.organizationName);
  formData.set("metadata[organization_id]", input.organizationId);

  if (input.userEmail) {
    formData.set("email", input.userEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION
    },
    body: formData
  });

  const payload = (await response.json()) as StripeCustomerPayload;

  if (!response.ok || typeof payload.id !== "string") {
    throw new Error(payload.error?.message ?? "Unable to create Stripe customer.");
  }

  return payload.id;
}

async function updateStripeCustomerDefaultPaymentMethod(input: {
  customerId: string;
  paymentMethodId: string;
}) {
  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const formData = new URLSearchParams();
  formData.set("invoice_settings[default_payment_method]", input.paymentMethodId);

  const response = await fetch(`https://api.stripe.com/v1/customers/${input.customerId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION
    },
    body: formData
  });

  const payload = (await response.json()) as StripeCustomerPayload;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Unable to update Stripe customer.");
  }
}

async function retrieveStripeSetupIntent(setupIntentId: string) {
  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const response = await fetch(`https://api.stripe.com/v1/setup_intents/${setupIntentId}`, {
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Stripe-Version": STRIPE_API_VERSION
    }
  });

  const payload = (await response.json()) as StripeSetupIntentPayload;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Unable to retrieve Stripe SetupIntent.");
  }

  return payload;
}

function getStripeMode(input: {
  publishableKey?: string | null;
  secretKey?: string | null;
}): BillingSetupState["stripeMode"] {
  if (!input.publishableKey || !input.secretKey) {
    return "not_configured";
  }

  const publishableIsTest = input.publishableKey.startsWith("pk_test_");
  const secretIsTest = input.secretKey.startsWith("sk_test_");

  if (publishableIsTest && secretIsTest) {
    return "test";
  }

  if (
    input.publishableKey.startsWith("pk_live_") &&
    input.secretKey.startsWith("sk_live_")
  ) {
    return "live";
  }

  return "mixed";
}

export async function ensureStripeCustomerForOrganization(input: {
  organizationId: string;
  organizationName: string;
  userEmail: string | null;
}) {
  const organization = await getOrganizationBillingRow(input.organizationId);

  if (!organization) {
    throw new Error("No active organization is available for billing setup.");
  }

  if (organization.stripe_customer_id) {
    return organization.stripe_customer_id;
  }

  const stripeCustomerId = await createStripeCustomer({
    organizationId: input.organizationId,
    organizationName: input.organizationName || organization.display_name,
    userEmail: input.userEmail
  });

  await updateOrganizationBillingRefs(input.organizationId, {
    stripe_customer_id: stripeCustomerId
  });

  return stripeCustomerId;
}

export async function createBillingSetupIntent(input: {
  organizationId: string;
  organizationName: string;
  userEmail: string | null;
}) {
  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY || !env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("Stripe is not fully configured for card collection.");
  }

  const stripeCustomerId = await ensureStripeCustomerForOrganization(input);
  const formData = new URLSearchParams();
  formData.set("customer", stripeCustomerId);
  formData.set("automatic_payment_methods[enabled]", "true");
  formData.set("metadata[organization_id]", input.organizationId);
  formData.set("usage", "off_session");

  const response = await fetch("https://api.stripe.com/v1/setup_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION
    },
    body: formData
  });

  const payload = (await response.json()) as StripeSetupIntentPayload;

  if (!response.ok || typeof payload.client_secret !== "string") {
    throw new Error(payload.error?.message ?? "Unable to create Stripe SetupIntent.");
  }

  return {
    clientSecret: payload.client_secret,
    stripeCustomerId
  };
}

export async function saveSetupIntentPaymentMethodForOrganization(input: {
  organizationId: string;
  setupIntentId: string;
}) {
  const organization = await getOrganizationBillingRow(input.organizationId);

  if (!organization?.stripe_customer_id) {
    throw new Error("Stripe customer reference is missing for this organization.");
  }

  const setupIntent = await retrieveStripeSetupIntent(input.setupIntentId);

  if (setupIntent.status !== "succeeded") {
    throw new Error("SetupIntent has not completed successfully.");
  }

  if (setupIntent.customer !== organization.stripe_customer_id) {
    throw new Error("SetupIntent does not belong to the active organization.");
  }

  if (typeof setupIntent.payment_method !== "string") {
    throw new Error("SetupIntent did not return a saved payment method.");
  }

  await updateStripeCustomerDefaultPaymentMethod({
    customerId: organization.stripe_customer_id,
    paymentMethodId: setupIntent.payment_method
  });

  await updateOrganizationBillingRefs(input.organizationId, {
    stripe_payment_method_id: setupIntent.payment_method
  });

  return {
    stripePaymentMethodId: setupIntent.payment_method
  };
}

export async function getBillingSetupState(organizationId: string): Promise<BillingSetupState> {
  const env = getServerEnv();
  const organization = await getOrganizationBillingRow(organizationId);
  const publishableKeyConfigured = Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const secretKeyConfigured = Boolean(env.STRIPE_SECRET_KEY);
  const stripeMode = getStripeMode({
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY
  });

  if (!secretKeyConfigured || !publishableKeyConfigured) {
    return {
      publishableKeyConfigured,
      secretKeyConfigured,
      stripeMode,
      stripeCustomerId: organization?.stripe_customer_id ?? null,
      stripePaymentMethodId: organization?.stripe_payment_method_id ?? null,
      canCollectCardNow: false,
      deferredReason:
        "Stripe is not fully configured yet, so secure card collection is unavailable."
    };
  }

  return {
    publishableKeyConfigured,
    secretKeyConfigured,
    stripeMode,
    stripeCustomerId: organization?.stripe_customer_id ?? null,
    stripePaymentMethodId: organization?.stripe_payment_method_id ?? null,
    canCollectCardNow: true,
    deferredReason: null
  };
}
