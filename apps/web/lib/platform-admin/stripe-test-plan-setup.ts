import type { NormalizedBillingPlanSetup } from "./billing-operations-core";

const STRIPE_API_VERSION = "2026-02-25.clover";
const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_SAAS_METADATA = {
  billing_domain: "floorconnector_saas",
  environment: "test",
  managed_by: "floorconnector"
};

type StripeListResponse<T> = {
  data?: T[];
  error?: { message?: string };
};

type StripeProduct = {
  id: string;
  name?: string;
  active?: boolean;
  livemode?: boolean;
  metadata?: Record<string, string>;
};

type StripePrice = {
  id: string;
  active?: boolean;
  currency?: string;
  livemode?: boolean;
  product?: string;
  unit_amount?: number;
  recurring?: {
    interval?: string;
  } | null;
  metadata?: Record<string, string>;
};

type StripeCreateResponse<T> = T & {
  error?: { message?: string };
};

type StripeFetch = typeof fetch;

export type StripeTestPlanSetupResult = {
  productId: string;
  priceId: string;
  createdProduct: boolean;
  createdPrice: boolean;
};

function hasSaasMetadata(value: { metadata?: Record<string, string> }) {
  return (
    value.metadata?.billing_domain === STRIPE_SAAS_METADATA.billing_domain &&
    value.metadata?.environment === STRIPE_SAAS_METADATA.environment &&
    value.metadata?.managed_by === STRIPE_SAAS_METADATA.managed_by
  );
}

async function stripeRequest<T>(input: {
  apiKey: string;
  path: string;
  method?: "GET" | "POST";
  body?: URLSearchParams;
  idempotencyKey?: string;
  fetchImpl: StripeFetch;
}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${input.apiKey}`,
    "Stripe-Version": STRIPE_API_VERSION
  };

  if (input.method === "POST") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey;
  }

  const response = await input.fetchImpl(`${STRIPE_API_BASE}${input.path}`, {
    method: input.method ?? "GET",
    headers,
    body: input.body
  });
  const payload = (await response.json()) as StripeCreateResponse<T>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Stripe test plan setup failed.");
  }

  return payload as T;
}

async function listSaasProducts(input: {
  apiKey: string;
  fetchImpl: StripeFetch;
}) {
  const payload = await stripeRequest<StripeListResponse<StripeProduct>>({
    apiKey: input.apiKey,
    path: "/products?active=true&limit=100",
    fetchImpl: input.fetchImpl
  });

  return (payload.data ?? []).filter(
    (product) =>
      product.active !== false &&
      product.livemode === false &&
      hasSaasMetadata(product)
  );
}

async function listSaasPrices(input: {
  apiKey: string;
  productId: string;
  setup: NormalizedBillingPlanSetup;
  fetchImpl: StripeFetch;
}) {
  const params = new URLSearchParams({
    active: "true",
    limit: "100",
    product: input.productId,
    type: "recurring"
  });
  const payload = await stripeRequest<StripeListResponse<StripePrice>>({
    apiKey: input.apiKey,
    path: `/prices?${params.toString()}`,
    fetchImpl: input.fetchImpl
  });

  return (payload.data ?? []).filter(
    (price) =>
      price.active !== false &&
      price.livemode === false &&
      price.currency === input.setup.currency &&
      price.unit_amount === input.setup.unitAmountCents &&
      price.recurring?.interval === input.setup.interval &&
      hasSaasMetadata(price)
  );
}

async function createSaasProduct(input: {
  apiKey: string;
  setup: NormalizedBillingPlanSetup;
  fetchImpl: StripeFetch;
}) {
  const body = new URLSearchParams();
  body.set("name", "FloorConnector Founder Access");
  body.set("description", "Early founder subscription for FloorConnector SaaS");

  for (const [key, value] of Object.entries(STRIPE_SAAS_METADATA)) {
    body.set(`metadata[${key}]`, value);
  }

  body.set("metadata[plan_label]", input.setup.planLabel);

  return stripeRequest<StripeProduct>({
    apiKey: input.apiKey,
    path: "/products",
    method: "POST",
    body,
    idempotencyKey: "floorconnector-saas-test-product-v1",
    fetchImpl: input.fetchImpl
  });
}

async function createSaasPrice(input: {
  apiKey: string;
  productId: string;
  setup: NormalizedBillingPlanSetup;
  fetchImpl: StripeFetch;
}) {
  const body = new URLSearchParams();
  body.set("product", input.productId);
  body.set("currency", input.setup.currency);
  body.set("unit_amount", String(input.setup.unitAmountCents));
  body.set("recurring[interval]", input.setup.interval);
  body.set("nickname", input.setup.planLabel);
  body.set(
    "lookup_key",
    `floorconnector_founder_access_${input.setup.currency}_${input.setup.interval}_${input.setup.unitAmountCents}_test`
  );

  for (const [key, value] of Object.entries(STRIPE_SAAS_METADATA)) {
    body.set(`metadata[${key}]`, value);
  }

  body.set("metadata[plan_label]", input.setup.planLabel);

  return stripeRequest<StripePrice>({
    apiKey: input.apiKey,
    path: "/prices",
    method: "POST",
    body,
    idempotencyKey: `floorconnector-saas-test-price-v1-${input.setup.currency}-${input.setup.interval}-${input.setup.unitAmountCents}`,
    fetchImpl: input.fetchImpl
  });
}

export async function createOrDiscoverStripeTestSaasPlan(input: {
  apiKey: string;
  setup: NormalizedBillingPlanSetup;
  fetchImpl?: StripeFetch;
}): Promise<StripeTestPlanSetupResult> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const products = await listSaasProducts({
    apiKey: input.apiKey,
    fetchImpl
  });
  const product =
    products[0] ?? (await createSaasProduct({ ...input, fetchImpl }));
  const createdProduct = products.length === 0;
  const prices = await listSaasPrices({
    apiKey: input.apiKey,
    productId: product.id,
    setup: input.setup,
    fetchImpl
  });
  const price =
    prices[0] ??
    (await createSaasPrice({
      apiKey: input.apiKey,
      productId: product.id,
      setup: input.setup,
      fetchImpl
    }));

  return {
    productId: product.id,
    priceId: price.id,
    createdProduct,
    createdPrice: prices.length === 0
  };
}
