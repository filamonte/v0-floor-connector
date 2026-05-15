import assert from "node:assert/strict";
import test from "node:test";

import { createOrDiscoverStripeTestSaasPlan } from "./stripe-test-plan-setup";

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

function getRequestUrl(url: string | URL | Request) {
  return url instanceof Request ? url.url : url.toString();
}

void test("discovers existing test SaaS product and recurring price", async () => {
  const requests: Array<{ url: string; method: string }> = [];
  const fetchImpl = (url: string | URL | Request, init?: RequestInit) => {
    const requestUrl = getRequestUrl(url);
    requests.push({
      url: requestUrl,
      method: init?.method ?? "GET"
    });

    if (requestUrl.includes("/products")) {
      return Promise.resolve(
        jsonResponse({
          data: [
            {
              id: "prod_existing",
              active: true,
              livemode: false,
              metadata: {
                billing_domain: "floorconnector_saas",
                environment: "test",
                managed_by: "floorconnector"
              }
            }
          ]
        })
      );
    }

    return Promise.resolve(
      jsonResponse({
        data: [
          {
            id: "price_existing",
            active: true,
            currency: "usd",
            livemode: false,
            product: "prod_existing",
            unit_amount: 49900,
            recurring: { interval: "month" },
            metadata: {
              billing_domain: "floorconnector_saas",
              environment: "test",
              managed_by: "floorconnector"
            }
          }
        ]
      })
    );
  };

  const result = await createOrDiscoverStripeTestSaasPlan({
    apiKey: "sk_test_redacted",
    setup: {
      planLabel: "Founder plan",
      unitAmountCents: 49900,
      currency: "usd",
      interval: "month"
    },
    fetchImpl: fetchImpl as typeof fetch
  });

  assert.deepEqual(result, {
    productId: "prod_existing",
    priceId: "price_existing",
    createdProduct: false,
    createdPrice: false
  });
  assert.equal(
    requests.some((request) => request.method === "POST"),
    false
  );
});

void test("creates test SaaS product and recurring price with idempotency headers", async () => {
  const idempotencyKeys: string[] = [];
  const fetchImpl = (url: string | URL | Request, init?: RequestInit) => {
    const requestUrl = getRequestUrl(url);

    if (init?.headers && !(init.headers instanceof Headers)) {
      const headers = init.headers as Record<string, string>;
      if (headers["Idempotency-Key"]) {
        idempotencyKeys.push(headers["Idempotency-Key"]);
      }
    }

    if (requestUrl.includes("/products") && init?.method !== "POST") {
      return Promise.resolve(jsonResponse({ data: [] }));
    }

    if (requestUrl.includes("/products") && init?.method === "POST") {
      return Promise.resolve(
        jsonResponse({ id: "prod_created", livemode: false })
      );
    }

    if (requestUrl.includes("/prices") && init?.method !== "POST") {
      return Promise.resolve(jsonResponse({ data: [] }));
    }

    return Promise.resolve(
      jsonResponse({ id: "price_created", livemode: false })
    );
  };

  const result = await createOrDiscoverStripeTestSaasPlan({
    apiKey: "sk_test_redacted",
    setup: {
      planLabel: "Founder plan",
      unitAmountCents: 49900,
      currency: "usd",
      interval: "month"
    },
    fetchImpl: fetchImpl as typeof fetch
  });

  assert.deepEqual(result, {
    productId: "prod_created",
    priceId: "price_created",
    createdProduct: true,
    createdPrice: true
  });
  assert.equal(idempotencyKeys.length, 2);
});
