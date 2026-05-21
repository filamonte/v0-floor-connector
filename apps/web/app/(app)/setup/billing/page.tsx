import Link from "next/link";
import { getPublicEnv } from "@floorconnector/config";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getBillingSetupState } from "@/lib/onboarding/billing-setup";
import { getSaasBillingCheckoutState } from "@/lib/onboarding/saas-billing-checkout";
import { SetupEscapeBanner } from "@/components/setup-escape-banner";
import { SaasSubscriptionCheckoutButton } from "@/components/stripe/saas-subscription-checkout-button";
import { SetupIntentForm } from "@/components/stripe/setup-intent-form";

type PageProps = {
  searchParams?: Promise<{
    billing_checkout?: string;
  }>;
};

export default async function BillingSetupPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/setup/billing");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          No active organization is available yet. Return to the dashboard and
          complete account bootstrap before billing setup.
        </div>
      </div>
    );
  }

  const billingState = await getBillingSetupState(
    organizationContext.organization.id
  );
  const saasCheckoutState = await getSaasBillingCheckoutState({
    organizationId: organizationContext.organization.id,
    userCanManageBilling: ["owner", "admin"].includes(
      organizationContext.membership.role
    )
  });
  const publicEnv = getPublicEnv();
  const showDevStripeStatus = process.env.NODE_ENV !== "production";
  const stripeStatusLabel =
    billingState.stripeMode === "test"
      ? "Stripe test mode active"
      : billingState.stripeMode === "not_configured"
        ? "Stripe not configured"
        : billingState.stripeMode === "mixed"
          ? "Stripe keys need attention"
          : "Stripe live keys configured";

  return (
    <div className="min-w-0 overflow-x-hidden bg-[#f7f5f1] px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-4xl min-w-0">
        <SetupEscapeBanner />
        <section className="min-w-0 rounded-2xl border border-[#d8d1c9] bg-white p-6 shadow-[0_24px_70px_-64px_rgba(0,0,0,0.9)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c75f12]">
            Step 2 of 3
          </p>
          <h1 className="mt-3 whitespace-normal break-words text-3xl font-semibold tracking-tight text-[#11100f] [overflow-wrap:anywhere]">
            Add your billing method
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625a52]">
            You won&apos;t be charged during early access. This saves a future
            billing method only when secure Stripe setup is available;
            activation and any paid founder arrangement still require platform
            review.
          </p>
          {resolvedSearchParams.billing_checkout === "returned" ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Subscription checkout returned to FloorConnector. Subscription
              status still waits for signed Stripe webhook confirmation and
              platform review; activation remains separate.
            </div>
          ) : null}
          {resolvedSearchParams.billing_checkout === "cancelled" ? (
            <div className="mt-4 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4 text-sm leading-6 text-[#625a52]">
              Subscription checkout was cancelled. No tenant activation,
              invoice/payment state, or portal payment state changed.
            </div>
          ) : null}
          {showDevStripeStatus ? (
            <div className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
              {stripeStatusLabel}
            </div>
          ) : null}

          <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-3">
            <div className="min-w-0 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Billing form
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-[#171412] [overflow-wrap:anywhere]">
                {billingState.publishableKeyConfigured
                  ? "Ready"
                  : "Unavailable"}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Secure setup
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-[#171412] [overflow-wrap:anywhere]">
                {billingState.secretKeyConfigured ? "Ready" : "Unavailable"}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Billing profile
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-[#171412] [overflow-wrap:anywhere]">
                {billingState.stripeCustomerId
                  ? "Stored safely"
                  : "Created when available"}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4 md:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Payment method
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-[#171412] [overflow-wrap:anywhere]">
                {billingState.stripePaymentMethodId
                  ? "Saved for future activation"
                  : "Not saved yet"}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4 md:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                SaaS plan reference
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-[#171412] [overflow-wrap:anywhere]">
                {saasCheckoutState.priceIdConfigured
                  ? saasCheckoutState.priceReferenceSource ===
                    "platform_settings"
                    ? "Managed by Billing Operations"
                    : "Configured by environment"
                  : "Not configured yet"}
              </p>
            </div>
          </div>

          <div className="mt-6 min-w-0 rounded-xl border border-[#d8d1c9] bg-[#11100f] p-5 text-white">
            <p className="text-sm font-semibold">Secure card collection</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              {billingState.deferredReason ??
                "Card details are collected securely by Stripe through a no-charge SetupIntent. FloorConnector stores only safe billing references, never raw card details, subscriptions, invoices, or charges."}
            </p>
          </div>

          <div className="mt-6">
            <SetupIntentForm
              publishableKey={
                billingState.canCollectCardNow
                  ? (publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null)
                  : null
              }
              initialPaymentMethodSaved={Boolean(
                billingState.stripePaymentMethodId
              )}
            />
          </div>

          <div className="mt-6 min-w-0 rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-5">
            <p className="text-sm font-semibold text-[#171412]">
              Founder subscription checkout
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#625a52]">
              This starts FloorConnector SaaS subscription checkout in Stripe
              test mode only. A signed Stripe webhook may take a moment to
              reconcile subscription status for platform review. Checkout does
              not activate the workspace and does not touch contractor-customer
              invoice payments.
            </p>
            <div className="mt-4">
              <SaasSubscriptionCheckoutButton
                canStartCheckout={saasCheckoutState.canStartCheckout}
                unavailableReason={saasCheckoutState.unavailableReason}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/setup/company"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8d1c9] bg-white px-5 text-sm font-semibold text-[#4e473f] transition hover:border-[#171412]"
            >
              Review company setup
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
