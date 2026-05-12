import Link from "next/link";
import { getPublicEnv } from "@floorconnector/config";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getBillingSetupState } from "@/lib/onboarding/billing-setup";
import { SetupEscapeBanner } from "@/components/setup-escape-banner";
import { SetupIntentForm } from "@/components/stripe/setup-intent-form";

export default async function BillingSetupPage() {
  const user = await requireAuthenticatedUser("/setup/billing");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          No active organization is available yet. Return to the dashboard and complete account bootstrap before billing setup.
        </div>
      </div>
    );
  }

  const billingState = await getBillingSetupState(organizationContext.organization.id);
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
    <div className="-mx-5 min-h-[calc(100vh-140px)] bg-[#f7f5f1] px-5 py-8 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <SetupEscapeBanner />
        <section className="rounded-2xl border border-[#d8d1c9] bg-white p-6 shadow-[0_24px_70px_-64px_rgba(0,0,0,0.9)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c75f12]">
            Step 2 of 3
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#11100f]">
            Add your billing method
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625a52]">
            You won&apos;t be charged during early access. This saves a future billing method only when secure Stripe setup is available; activation and any paid founder arrangement still require platform review.
          </p>
          {showDevStripeStatus ? (
            <div className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
              {stripeStatusLabel}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Billing form
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">
                {billingState.publishableKeyConfigured ? "Ready" : "Unavailable"}
              </p>
            </div>
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Secure setup
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">
                {billingState.secretKeyConfigured ? "Ready" : "Unavailable"}
              </p>
            </div>
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Billing profile
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">
                {billingState.stripeCustomerId ? "Stored safely" : "Created when available"}
              </p>
            </div>
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4 md:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Payment method
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">
                {billingState.stripePaymentMethodId
                  ? "Saved for future activation"
                  : "Not saved yet"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#d8d1c9] bg-[#11100f] p-5 text-white">
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
                  ? publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
                  : null
              }
              initialPaymentMethodSaved={Boolean(billingState.stripePaymentMethodId)}
            />
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
