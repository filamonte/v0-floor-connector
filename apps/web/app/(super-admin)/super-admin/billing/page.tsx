import { getServerEnv } from "@floorconnector/config";
import Link from "next/link";

import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { createOrDiscoverTestSaasPlanAction } from "@/lib/platform-admin/actions";
import {
  buildBillingOperationsSummary,
  buildStripeBillingConfigurationHealth,
  getStripeTestSecretKeyReadiness,
  getTenantBillingNextAction,
  STRIPE_SAAS_SETUP_ENTRY,
  STRIPE_SAAS_SUPPORTED_WEBHOOK_EVENTS
} from "@/lib/platform-admin/billing-operations-core";
import { getPlatformBillingSettings } from "@/lib/platform-admin/billing-settings";
import { listEarlyAccessTenantsForPlatformAdmin } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatStatus(value: string | null) {
  return value ? value.replaceAll("_", " ") : "Not recorded";
}

function formatMode(value: string) {
  if (value === "missing") {
    return "Missing";
  }

  if (value === "not_applicable") {
    return "Status only";
  }

  return value;
}

function formatReference(value: string | null) {
  return value ? "Stored reference" : "Missing";
}

function maskStripeReference(value: string | null) {
  if (!value) {
    return "Not stored";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(cents / 100);
}

function getStatusClasses(ready: boolean) {
  return ready
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-800";
}

function getSubscriptionStatusClasses(value: string | null) {
  if (value === "active" || value === "trialing") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "past_due" || value === "unpaid" || value === "canceled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-tertiary)]";
}

export default async function SuperAdminBillingPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const env = getServerEnv();
  const [tenants, platformBillingSettings] = await Promise.all([
    listEarlyAccessTenantsForPlatformAdmin(),
    getPlatformBillingSettings()
  ]);
  const configurationHealth = buildStripeBillingConfigurationHealth({
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripePublishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeFounderPlanPriceId: env.STRIPE_FOUNDER_PLAN_PRICE_ID,
    platformStripePriceId: platformBillingSettings.stripePriceId,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET
  });
  const summary = buildBillingOperationsSummary(tenants);
  const testPlanReadiness = getStripeTestSecretKeyReadiness(
    env.STRIPE_SECRET_KEY
  );

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Billing Operations"
        description="Platform-admin-only SaaS billing readiness, Stripe configuration health, subscription reconciliation, and activation separation. This page is the durable billing operating console; early access is only one commercial phase inside it."
        tone="neutral"
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              Tenants
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {summary.totalTenants}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              Subscription refs
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {summary.stripeSubscriptionReferences}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              Manual evidence
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {summary.manualEvidenceReceived}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              Manual activation queue
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {summary.tenantsAwaitingManualActivation}
            </p>
          </div>
        </div>
      </DetailPanel>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <DetailPanel
          title="Stripe Configuration Health"
          description="Names-only readiness for SaaS subscription Checkout and signed webhook reconciliation. Values stay in environment configuration and Stripe."
          tone="neutral"
        >
          <div className="space-y-3">
            {configurationHealth.items.map((item) => (
              <div
                key={item.name}
                className="grid min-w-0 gap-3 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-[var(--text-primary)] [overflow-wrap:anywhere]">
                    {item.name}
                  </p>
                  <p className="mt-1 leading-6 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
                <span
                  className={[
                    "inline-flex h-fit rounded-full border px-2.5 py-1 text-xs font-semibold",
                    getStatusClasses(item.configured)
                  ].join(" ")}
                >
                  {item.statusLabel}
                </span>
                <span className="inline-flex h-fit rounded-full border border-[var(--border-warm)] bg-white px-2.5 py-1 text-xs font-semibold capitalize text-[var(--text-tertiary)]">
                  {formatMode(item.mode)}
                </span>
                {item.recoveryHint ? (
                  <p className="sm:col-span-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    {item.recoveryHint}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {configurationHealth.warnings.length > 0 ? (
            <div className="mt-5 space-y-2">
              {configurationHealth.warnings.map((warning) => (
                <p
                  key={warning}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
                >
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </DetailPanel>

        <DetailPanel
          title="Plans And Checkout Readiness"
          description="Platform-admin controlled test-mode SaaS plan references. Stripe secrets remain in env/provider configuration; non-secret product and price references can live in FloorConnector."
          tone="neutral"
        >
          <div className="space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
            <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">
                Default SaaS plan
              </p>
              <p className="mt-1">
                {platformBillingSettings.planLabel} ·{" "}
                {formatMoney(
                  platformBillingSettings.unitAmountCents,
                  platformBillingSettings.currency
                )}{" "}
                / {platformBillingSettings.recurringInterval}
              </p>
              <div className="mt-3 grid min-w-0 gap-2 text-xs text-[var(--text-tertiary)] sm:grid-cols-2">
                <p className="min-w-0 [overflow-wrap:anywhere]">
                  Product:{" "}
                  <span className="font-mono">
                    {maskStripeReference(
                      platformBillingSettings.stripeProductId
                    )}
                  </span>
                </p>
                <p className="min-w-0 [overflow-wrap:anywhere]">
                  Price:{" "}
                  <span className="font-mono">
                    {maskStripeReference(platformBillingSettings.stripePriceId)}
                  </span>
                </p>
                <p>Mode: {platformBillingSettings.stripeMode}</p>
                <p>
                  Source:{" "}
                  {configurationHealth.priceReferenceSource ===
                  "platform_settings"
                    ? "platform settings"
                    : configurationHealth.priceReferenceSource === "env"
                      ? "env fallback"
                      : "missing"}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">
                Create or discover test founder plan
              </p>
              <p className="mt-1">
                This action only runs with a Stripe test-mode secret key. It
                creates or reuses a test Product and recurring Price, then
                stores the non-secret references above. It does not create
                customers, subscriptions, Checkout sessions, payment links, or
                activation.
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">
                Expected recovery key shape:{" "}
                <span className="font-mono">STRIPE_SECRET_KEY</span> starts
                with <span className="font-mono">sk_test_</span>. Unknown or
                live-mode keys keep this action disabled.
              </p>
              <form
                action={createOrDiscoverTestSaasPlanAction}
                className="mt-4 grid min-w-0 gap-3"
              >
                <label className="grid min-w-0 gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                    Plan label
                  </span>
                  <input
                    name="planLabel"
                    defaultValue={platformBillingSettings.planLabel}
                    className="min-w-0 rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </label>
                <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                  <label className="grid min-w-0 gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                      Amount
                    </span>
                    <input
                      name="amountDollars"
                      type="number"
                      min="1"
                      step="0.01"
                      defaultValue={(
                        platformBillingSettings.unitAmountCents / 100
                      ).toFixed(2)}
                      className="min-w-0 rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    />
                  </label>
                  <label className="grid min-w-0 gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                      Currency
                    </span>
                    <input
                      name="currency"
                      defaultValue={platformBillingSettings.currency}
                      className="min-w-0 rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm uppercase text-[var(--text-primary)]"
                    />
                  </label>
                  <label className="grid min-w-0 gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                      Interval
                    </span>
                    <select
                      name="interval"
                      defaultValue={platformBillingSettings.recurringInterval}
                      className="min-w-0 rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    >
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                      <option value="week">Week</option>
                      <option value="day">Day</option>
                    </select>
                  </label>
                </div>
                {testPlanReadiness.reason ? (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                    {testPlanReadiness.reason}
                  </p>
                ) : null}
                {!configurationHealth.webhookReady ? (
                  <p className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-xs leading-5 text-[var(--text-tertiary)]">
                    Product/Price setup can run before the webhook signing
                    secret exists, but replay remains blocked until{" "}
                    <span className="font-mono">STRIPE_WEBHOOK_SECRET</span>{" "}
                    is configured and the app is restarted.
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!configurationHealth.productPriceSetupReady}
                  className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-[var(--text-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--copper)] disabled:cursor-not-allowed disabled:bg-[#c9c2bb]"
                >
                  Create or discover test plan
                </button>
              </form>
            </div>
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">
                Checkout readiness
              </p>
              <p className="mt-1">
                Super admin does not create Checkout sessions in this phase.
                Tenant checkout remains at{" "}
                <Link
                  href={STRIPE_SAAS_SETUP_ENTRY}
                  className="font-medium text-[var(--copper)] underline-offset-4 hover:underline"
                >
                  {STRIPE_SAAS_SETUP_ENTRY}
                </Link>{" "}
                and uses platform settings before the env fallback when
                test-mode configuration is complete.
              </p>
              {configurationHealth.productPriceSetupBlockedReason ? (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {configurationHealth.productPriceSetupBlockedReason}
                </p>
              ) : null}
              <span
                className={[
                  "mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                  getStatusClasses(configurationHealth.testCheckoutReady)
                ].join(" ")}
              >
                {configurationHealth.testCheckoutReady
                  ? "Ready for test checkout"
                  : "Not ready for test checkout"}
              </span>
            </div>
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">
                Durable boundary
              </p>
              <p className="mt-1">
                Manual billing evidence, Stripe subscription references, and
                tenant activation are displayed together here but remain
                separate operational decisions.
              </p>
            </div>
          </div>
        </DetailPanel>
      </div>

      <DetailPanel
        title="Webhook Health"
        description="Signed SaaS billing events are reconciled separately from contractor-customer invoice payments."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
            <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">Endpoint</p>
              <p className="mt-1 font-mono text-xs">
                {configurationHealth.webhookEndpointPath}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">
                Last reconciled webhook
              </p>
              <p className="mt-1">
                {formatDateTime(summary.lastWebhookReceivedAt)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3">
              <p className="font-medium text-[var(--text-primary)]">
                Idempotency behavior
              </p>
              <p className="mt-1">
                Signed provider event ids are recorded once in the SaaS billing
                webhook ledger; duplicates are ignored by the reconciliation
                layer.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">
                Supported events
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STRIPE_SAAS_SUPPORTED_WEBHOOK_EVENTS.map((eventType) => (
                  <span
                    key={eventType}
                    className="rounded-full border border-[var(--border-warm)] bg-white px-2.5 py-1 font-mono text-[11px] text-[var(--text-tertiary)]"
                  >
                    {eventType}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">
                Stripe CLI template
              </p>
              <p className="mt-1">
                Use Stripe test mode, then configure{" "}
                <span className="font-mono">STRIPE_WEBHOOK_SECRET</span> from
                the listener output. Do not paste the secret into logs or chat;
                restart the app after changing local env.
              </p>
              {configurationHealth.webhookReplayBlockedReason ? (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {configurationHealth.webhookReplayBlockedReason}
                </p>
              ) : null}
              <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] p-3 text-xs text-[var(--text-primary)]">
                stripe listen --events
                checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed
                --forward-to localhost:3000/api/stripe/saas-billing-webhook
              </pre>
            </div>
          </div>
        </div>
      </DetailPanel>

      <DetailPanel
        title="Tenant Billing Status"
        description="Existing company, subscription, and founder billing evidence records summarized without exposing provider payloads or payment details."
        tone="neutral"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <tr>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Company
                </th>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Tenant status
                </th>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Evidence
                </th>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Stripe refs
                </th>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Subscription
                </th>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Last webhook
                </th>
                <th className="border-b border-[var(--border-warm)] px-3 py-3 font-semibold">
                  Next action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-warm)]">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="align-top">
                  <td className="px-3 py-4">
                    <p className="font-medium text-[var(--text-primary)]">
                      {tenant.displayName ?? tenant.legalName ?? tenant.slug}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                      {tenant.slug}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-[var(--text-secondary)]">
                    <p>{formatStatus(tenant.tenantStatus)}</p>
                    <p className="mt-1 text-xs">
                      {formatStatus(tenant.lifecycleState)}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-[var(--text-secondary)]">
                    <p>{formatStatus(tenant.founderBilling.status)}</p>
                    <p className="mt-1 text-xs">
                      {tenant.founderBilling.evidenceReceivedAt
                        ? `Received ${formatDateTime(tenant.founderBilling.evidenceReceivedAt)}`
                        : "No manual evidence recorded"}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-[var(--text-secondary)]">
                    <p>Customer: {formatReference(tenant.stripeCustomerId)}</p>
                    <p className="mt-1">
                      Subscription:{" "}
                      {formatReference(tenant.stripeSubscriptionId)}
                    </p>
                    <p className="mt-1">
                      Price: {formatReference(tenant.stripePriceId)}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                        getSubscriptionStatusClasses(
                          tenant.stripeSubscriptionStatus
                        )
                      ].join(" ")}
                    >
                      {formatStatus(tenant.stripeSubscriptionStatus)}
                    </span>
                    <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                      Period end:{" "}
                      {formatDateTime(tenant.stripeCurrentPeriodEnd)}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-[var(--text-secondary)]">
                    <p>{formatReference(tenant.stripeLastEventId)}</p>
                    <p className="mt-1 text-xs">
                      {formatDateTime(tenant.stripeLastWebhookReceivedAt)}
                    </p>
                  </td>
                  <td className="max-w-[18rem] px-3 py-4 text-[var(--text-secondary)]">
                    {getTenantBillingNextAction(tenant, configurationHealth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DetailPanel>
    </div>
  );
}
