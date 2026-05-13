import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEarlyAccessOperatingSummary,
  getEarlyAccessOperatingState,
  getFounderBillingEvidenceModel,
  type EarlyAccessOperatingTenantInput
} from "./early-access-operating-core";

function tenant(
  overrides: Partial<EarlyAccessOperatingTenantInput> = {}
): EarlyAccessOperatingTenantInput {
  return {
    tenantStatus: "trialing",
    lifecycleState: "trial",
    hasCompanyProfile: true,
    hasPaymentMethod: false,
    projectCount: 0,
    estimateCount: 0,
    contractCount: 0,
    invoiceCount: 0,
    ...overrides
  };
}

void test("classifies setup, activation, active, and blocked operating states", () => {
  assert.equal(
    getEarlyAccessOperatingState(tenant({ hasCompanyProfile: false })).state,
    "pending_setup"
  );
  assert.equal(
    getEarlyAccessOperatingState(tenant({ hasPaymentMethod: true })).state,
    "pending_activation"
  );
  assert.equal(
    getEarlyAccessOperatingState(
      tenant({ tenantStatus: "active", lifecycleState: "active" })
    ).state,
    "active_founder_access"
  );
  assert.equal(
    getEarlyAccessOperatingState(
      tenant({ tenantStatus: "suspended", lifecycleState: "locked" })
    ).state,
    "suspended_or_blocked"
  );
});

void test("keeps billing labels honest and separate from activation", () => {
  const setupOnly = getEarlyAccessOperatingState(tenant({ hasPaymentMethod: true }));
  const noPaymentMethod = getEarlyAccessOperatingState(tenant());

  assert.equal(setupOnly.billingLabel, "SetupIntent payment method saved");
  assert.equal(setupOnly.allowsProductionActions, false);
  assert.equal(noPaymentMethod.billingLabel, "No payment method reference");
  assert.match(setupOnly.followUpLabel, /activation review/i);
});

void test("summarizes early-access tenants by operator bucket", () => {
  const summary = buildEarlyAccessOperatingSummary([
    tenant({ hasCompanyProfile: false }),
    tenant({ hasPaymentMethod: true }),
    tenant({ tenantStatus: "active", lifecycleState: "active" }),
    tenant({ tenantStatus: "locked", lifecycleState: "locked" })
  ]);

  assert.deepEqual(summary, {
    pendingSetup: 1,
    pendingActivation: 1,
    activeFounderAccess: 1,
    suspendedOrBlocked: 1
  });
});

void test("summarizes founder billing evidence without implying Stripe truth", () => {
  const pending = getFounderBillingEvidenceModel({
    status: "pending",
    method: "stripe_payment_link",
    monthlyAmountCents: 49900,
    evidenceReceivedAt: null,
    followUpAt: "2026-05-20T12:00:00.000Z"
  });
  const received = getFounderBillingEvidenceModel({
    status: "evidence_received",
    method: "manual_invoice",
    monthlyAmountCents: 49900,
    evidenceReceivedAt: "2026-05-13T12:00:00.000Z",
    followUpAt: null
  });

  assert.equal(pending.statusLabel, "Pending evidence");
  assert.equal(pending.methodLabel, "Stripe Payment Link");
  assert.equal(pending.amountLabel, "$499");
  assert.equal(pending.tone, "warning");
  assert.equal(pending.hasEvidence, false);
  assert.equal(received.statusLabel, "Evidence received");
  assert.equal(received.tone, "good");
  assert.equal(received.hasEvidence, true);
});
