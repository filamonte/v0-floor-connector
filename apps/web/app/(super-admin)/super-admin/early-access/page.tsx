import Link from "next/link";

import { DetailPanel } from "@/components/detail-panel";
import { ActivateCompanyForm } from "@/components/platform-admin/activate-company-form";
import { ResetOnboardingStateForm } from "@/components/platform-admin/reset-onboarding-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import {
  markEarlyAccessTenantActiveAction,
  resetEarlyAccessTenantOnboardingStateAction
} from "@/lib/platform-admin/actions";
import {
  buildEarlyAccessOperatingSummary,
  getEarlyAccessOperatingState
} from "@/lib/platform-admin/early-access-operating-core";
import { listEarlyAccessTenantsForPlatformAdmin } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    feedbackCompanyId?: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function getOperatingStateClasses(state: string) {
  if (state === "active_founder_access") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (state === "suspended_or_blocked") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (state === "pending_activation") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-tertiary)]";
}

function StageBadge({
  reached,
  reachedLabel,
  pendingLabel
}: {
  reached: boolean;
  reachedLabel: string;
  pendingLabel: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        reached
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-tertiary)]"
      ].join(" ")}
    >
      {reached ? reachedLabel : pendingLabel}
    </span>
  );
}

export default async function EarlyAccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const tenants = await listEarlyAccessTenantsForPlatformAdmin();
  const operatingSummary = buildEarlyAccessOperatingSummary(
    tenants.map((tenant) => ({
      tenantStatus: tenant.tenantStatus,
      lifecycleState: tenant.lifecycleState,
      hasCompanyProfile: tenant.hasCompanyProfile,
      hasPaymentMethod: tenant.hasPaymentMethod,
      projectCount: tenant.activity.projectCount,
      estimateCount: tenant.activity.estimateCount,
      contractCount: tenant.activity.contractCount,
      invoiceCount: tenant.activity.invoiceCount
    }))
  );
  const selectedFeedbackTenant =
    tenants.find((tenant) => tenant.id === resolvedSearchParams.feedbackCompanyId) ??
    tenants.find((tenant) => tenant.hasFeedback) ??
    null;
  const showDevReset = process.env.NODE_ENV !== "production";

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Early Access"
        description="Platform-admin-only visibility into onboarding companies, first workflow progress, and activation readiness from existing organization and workflow records."
        tone="neutral"
      >
        <div className="mb-4 space-y-3">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            Progress is derived from canonical company, project, estimate, contract, and invoice records. No analytics or duplicate tenant records are used here.
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                Pending setup
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {operatingSummary.pendingSetup}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                Pending activation
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-950">
                {operatingSummary.pendingActivation}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Active founders
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-950">
                {operatingSummary.activeFounderAccess}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                Suspended / blocked
              </p>
              <p className="mt-2 text-2xl font-semibold text-red-950">
                {operatingSummary.suspendedOrBlocked}
              </p>
            </div>
          </div>
          {showDevReset ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <span className="font-semibold">DEV / TEST ONLY:</span> reset clears only the selected tenant&apos;s onboarding workflow test records and saved Stripe payment method reference. It does not create sample data or affect other tenants.
            </div>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-warm)] text-sm">
            <thead className="bg-[var(--highlight)] text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Operating state</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Company profile</th>
                <th className="px-4 py-3">Payment method</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Light signals</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">First workflow step</th>
                <th className="px-4 py-3">Estimate stage</th>
                <th className="px-4 py-3">Contract stage</th>
                <th className="px-4 py-3">External actions</th>
                <th className="px-4 py-3">Company ID</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-warm)] bg-white">
              {tenants.map((tenant) => {
                const isActive =
                  tenant.tenantStatus === "active" &&
                  tenant.lifecycleState === "active";
                const operatingState = getEarlyAccessOperatingState({
                  tenantStatus: tenant.tenantStatus,
                  lifecycleState: tenant.lifecycleState,
                  hasCompanyProfile: tenant.hasCompanyProfile,
                  hasPaymentMethod: tenant.hasPaymentMethod,
                  projectCount: tenant.activity.projectCount,
                  estimateCount: tenant.activity.estimateCount,
                  contractCount: tenant.activity.contractCount,
                  invoiceCount: tenant.activity.invoiceCount
                });

                return (
                  <tr key={tenant.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--text-primary)]">{tenant.displayName}</p>
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                        {tenant.slug} - {tenant.legalName}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[var(--text-secondary)]">
                      {formatDateTime(tenant.createdAt)}
                    </td>
                    <td className="min-w-56 px-4 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold",
                          getOperatingStateClasses(operatingState.state)
                        ].join(" ")}
                      >
                        {operatingState.statusLabel}
                      </span>
                      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                        {operatingState.followUpLabel}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatStatus(tenant.tenantStatus)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                        {formatStatus(tenant.lifecycleState)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StageBadge
                        reached={tenant.hasCompanyProfile}
                        reachedLabel="Profile started"
                        pendingLabel="Profile missing"
                      />
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">
                      {operatingState.billingLabel}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[var(--text-secondary)]">
                      <p>{tenant.activity.projectCount} projects</p>
                      <p>{tenant.activity.estimateCount} estimates</p>
                      <p>{tenant.activity.contractCount} contracts</p>
                      <p>{tenant.activity.invoiceCount} invoices</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <StageBadge
                          reached={tenant.hasLoggedInRecently}
                          reachedLabel="Recent login"
                          pendingLabel="No recent login"
                        />
                        <StageBadge
                          reached={tenant.hasReachedEstimate}
                          reachedLabel="Reached estimate"
                          pendingLabel="No estimate signal"
                        />
                        <StageBadge
                          reached={tenant.hasReachedContract}
                          reachedLabel="Reached contract"
                          pendingLabel="No contract signal"
                        />
                        {tenant.lastActivityAt ? (
                          <p className="text-xs leading-5 text-[var(--text-tertiary)]">
                            Last activity {formatDateTime(tenant.lastActivityAt)}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {tenant.hasFeedback ? (
                        <div className="space-y-2">
                          <StageBadge
                            reached
                            reachedLabel={`${tenant.feedbackCount} captured`}
                            pendingLabel="No feedback"
                          />
                          <Link
                            href={`/super-admin/early-access?feedbackCompanyId=${tenant.id}#feedback`}
                            className="block text-xs font-semibold text-[var(--text-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]"
                          >
                            View recent feedback
                          </Link>
                        </div>
                      ) : (
                        <StageBadge
                          reached={false}
                          reachedLabel="Feedback captured"
                          pendingLabel="No feedback"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StageBadge
                        reached={tenant.reachedFirstWorkflowStep}
                        reachedLabel="Project started"
                        pendingLabel="No project yet"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <StageBadge
                        reached={tenant.reachedEstimateStage}
                        reachedLabel="Estimate created"
                        pendingLabel="No estimate yet"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <StageBadge
                        reached={tenant.reachedContractStage}
                        reachedLabel="Contract created"
                        pendingLabel="No contract yet"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <StageBadge
                        reached={!tenant.guardedExternalActionsLocked}
                        reachedLabel="Production actions unlocked"
                        pendingLabel="Guarded actions locked"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        readOnly
                        value={tenant.id}
                        aria-label={`${tenant.displayName} company ID`}
                        className="w-52 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                      {isActive ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <ActivateCompanyForm
                          action={markEarlyAccessTenantActiveAction}
                          companyId={tenant.id}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-full bg-[var(--graphite)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--graphite-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
                          >
                            Mark active
                          </button>
                        </ActivateCompanyForm>
                      )}
                      {showDevReset ? (
                        <ResetOnboardingStateForm
                          action={resetEarlyAccessTenantOnboardingStateAction}
                          companyId={tenant.id}
                          companyName={tenant.displayName}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                          >
                            Reset onboarding state
                          </button>
                        </ResetOnboardingStateForm>
                      ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      No early-access companies yet.
                    </p>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-tertiary)]">
                      New signup companies will appear here after organization bootstrap. Use the public Start Free Trial flow to create the first onboarding tenant.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </DetailPanel>

      <DetailPanel
        title="Recent Feedback"
        description="Tenant feedback captured from the in-app Send Feedback modal. This reuses the existing tenant-scoped internal event log; no feedback table or analytics system is added."
        tone="neutral"
      >
        <div id="feedback" className="space-y-4">
          {selectedFeedbackTenant ? (
            <>
              <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                Showing recent feedback for{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedFeedbackTenant.displayName}
                </span>
                .
              </div>
              <div className="grid gap-3">
                {selectedFeedbackTenant.recentFeedback.length > 0 ? (
                  selectedFeedbackTenant.recentFeedback.map((feedback) => (
                    <article
                      key={`${selectedFeedbackTenant.id}-${feedback.createdAt}-${feedback.message}`}
                      className="rounded-lg border border-[var(--border-warm)] bg-white p-4 text-sm leading-6 text-[var(--text-secondary)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {feedback.email ?? "No email provided"}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {formatDateTime(feedback.createdAt)}
                        </p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap">{feedback.message}</p>
                    </article>
                  ))
                ) : (
                  <p className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    This company has no captured feedback yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
              No early-access feedback has been captured yet.
            </p>
          )}
        </div>
      </DetailPanel>
    </div>
  );
}
