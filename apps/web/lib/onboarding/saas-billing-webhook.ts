import "server-only";

import { getServerEnv } from "@floorconnector/config";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  mapSaasBillingWebhookEvent,
  parseSaasBillingWebhookEvent,
  verifyStripeWebhookSignature,
  type SaasBillingWebhookMapResult,
  type SaasBillingWebhookProcessResult
} from "./saas-billing-webhook-core";

type CompanySubscriptionRow = {
  id: string;
  company_id: string;
  subscription_plan_id: string;
  status: string;
  lifecycle_state: string;
  is_current: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_last_event_id: string | null;
};

type SubscriptionPlanRow = {
  id: string;
};

export type SaasBillingWebhookResult =
  | {
      handled: true;
      duplicate: boolean;
      eventId: string;
      eventType: string;
      companyId: string;
    }
  | {
      handled: false;
      duplicate: false;
      eventId: string | null;
      eventType: string | null;
      reason: SaasBillingWebhookMapResult extends infer Result
        ? Result extends { reason: infer Reason }
          ? Reason
          : never
        : never;
    };

function getExpectedEnvironment() {
  const env = getServerEnv();

  return env.APP_ENV ?? env.NODE_ENV ?? "development";
}

function getUpdatePayload(mapped: SaasBillingWebhookProcessResult) {
  return {
    ...(mapped.stripeCustomerId ? { stripe_customer_id: mapped.stripeCustomerId } : {}),
    ...(mapped.stripeSubscriptionId
      ? { stripe_subscription_id: mapped.stripeSubscriptionId }
      : {}),
    ...(mapped.stripeSubscriptionStatus
      ? { status: mapped.stripeSubscriptionStatus }
      : {}),
    ...(mapped.stripeCurrentPeriodEnd
      ? { current_period_end: mapped.stripeCurrentPeriodEnd }
      : {}),
    ...(mapped.stripePriceId ? { stripe_price_id: mapped.stripePriceId } : {}),
    ...(mapped.stripeCheckoutSessionId
      ? { stripe_checkout_session_id: mapped.stripeCheckoutSessionId }
      : {}),
    stripe_last_event_id: mapped.stripeLastEventId,
    stripe_last_webhook_received_at: mapped.stripeLastWebhookReceivedAt
  };
}

async function updateCompanyStripeCustomerReference(input: {
  companyId: string;
  stripeCustomerId: string | null;
}) {
  if (!input.stripeCustomerId) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .update({ stripe_customer_id: input.stripeCustomerId })
    .eq("id", input.companyId);

  if (response.error) {
    throw new Error(
      `Unable to update SaaS billing customer reference: ${response.error.message}`
    );
  }
}

async function getCurrentCompanySubscription(companyId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("company_subscriptions")
    .select(
      "id, company_id, subscription_plan_id, status, lifecycle_state, is_current, stripe_customer_id, stripe_subscription_id, stripe_last_event_id"
    )
    .eq("company_id", companyId)
    .eq("is_current", true)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load current SaaS subscription row: ${response.error.message}`
    );
  }

  return (response.data ?? null) as CompanySubscriptionRow | null;
}

async function getDefaultSubscriptionPlanId() {
  const supabase = getSupabaseAdminClient();
  const activeResponse = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (activeResponse.error) {
    throw new Error(
      `Unable to load SaaS subscription plan: ${activeResponse.error.message}`
    );
  }

  if (activeResponse.data) {
    return (activeResponse.data as SubscriptionPlanRow).id;
  }

  const anyResponse = await supabase
    .from("subscription_plans")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (anyResponse.error) {
    throw new Error(
      `Unable to load fallback SaaS subscription plan: ${anyResponse.error.message}`
    );
  }

  return ((anyResponse.data ?? null) as SubscriptionPlanRow | null)?.id ?? null;
}

async function upsertCompanySubscriptionFromWebhook(
  mapped: SaasBillingWebhookProcessResult
) {
  const supabase = getSupabaseAdminClient();
  const currentSubscription = await getCurrentCompanySubscription(mapped.companyId);

  if (currentSubscription?.stripe_last_event_id === mapped.stripeLastEventId) {
    return { duplicate: true };
  }

  const updatePayload = getUpdatePayload(mapped);

  if (currentSubscription) {
    const response = await supabase
      .from("company_subscriptions")
      .update(updatePayload)
      .eq("id", currentSubscription.id)
      .eq("company_id", mapped.companyId);

    if (response.error) {
      throw new Error(
        `Unable to update SaaS subscription state: ${response.error.message}`
      );
    }

    return { duplicate: false };
  }

  const subscriptionPlanId = await getDefaultSubscriptionPlanId();

  if (!subscriptionPlanId) {
    throw new Error("No subscription plan exists for SaaS billing reconciliation.");
  }

  const response = await supabase.from("company_subscriptions").insert({
    company_id: mapped.companyId,
    subscription_plan_id: subscriptionPlanId,
    lifecycle_state: "trial",
    is_current: true,
    ...updatePayload
  });

  if (response.error) {
    throw new Error(
      `Unable to create SaaS subscription state: ${response.error.message}`
    );
  }

  return { duplicate: false };
}

async function hasProcessedSaasBillingWebhookEvent(eventId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("stripe_saas_billing_webhook_events")
    .select("id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to inspect SaaS billing webhook idempotency state: ${response.error.message}`
    );
  }

  return Boolean(response.data);
}

async function recordProcessedSaasBillingWebhookEvent(
  mapped: SaasBillingWebhookProcessResult
) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("stripe_saas_billing_webhook_events")
    .insert({
      company_id: mapped.companyId,
      stripe_event_id: mapped.eventId,
      event_type: mapped.eventType,
      processing_result: "processed",
      received_at: mapped.stripeLastWebhookReceivedAt
    });

  if (response.error) {
    if (response.error.code === "23505") {
      return { duplicate: true };
    }

    throw new Error(
      `Unable to record SaaS billing webhook idempotency state: ${response.error.message}`
    );
  }

  return { duplicate: false };
}

export async function processSaasBillingWebhookEvent(input: {
  headers: Headers;
  rawBody: string;
}): Promise<SaasBillingWebhookResult> {
  const env = getServerEnv();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook secret is required for SaaS billing callbacks.");
  }

  const signatureHeader = input.headers.get("stripe-signature");

  if (!signatureHeader) {
    throw new Error("Stripe webhook signature header is missing.");
  }

  verifyStripeWebhookSignature({
    rawBody: input.rawBody,
    signatureHeader,
    secret: env.STRIPE_WEBHOOK_SECRET
  });

  const mapped = mapSaasBillingWebhookEvent(parseSaasBillingWebhookEvent(input.rawBody), {
    expectedEnvironment: getExpectedEnvironment()
  });

  if (mapped.outcome === "ignore") {
    return {
      handled: false,
      duplicate: false,
      eventId: mapped.eventId,
      eventType: mapped.eventType,
      reason: mapped.reason
    };
  }

  if (await hasProcessedSaasBillingWebhookEvent(mapped.eventId)) {
    return {
      handled: true,
      duplicate: true,
      eventId: mapped.eventId,
      eventType: mapped.eventType,
      companyId: mapped.companyId
    };
  }

  await updateCompanyStripeCustomerReference({
    companyId: mapped.companyId,
    stripeCustomerId: mapped.stripeCustomerId
  });
  const subscriptionResult = await upsertCompanySubscriptionFromWebhook(mapped);
  const eventResult = await recordProcessedSaasBillingWebhookEvent(mapped);

  return {
    handled: true,
    duplicate: subscriptionResult.duplicate || eventResult.duplicate,
    eventId: mapped.eventId,
    eventType: mapped.eventType,
    companyId: mapped.companyId
  };
}
