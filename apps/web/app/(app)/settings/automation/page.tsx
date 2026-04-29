import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import {
  automationNotificationPreferenceCategories,
  automationNotificationPreferenceContent,
  automationNotificationPreferenceRoleOptions
} from "@/lib/automation/preferences";
import { getAutomationRunHistory } from "@/lib/automation/execution";
import { automationNotificationTemplateDefinitionsByCategory } from "@/lib/automation/templates";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import {
  runManualAutomationNotificationsAction,
  updateAutomationNotificationPreferencesAction
} from "@/lib/settings/actions";
import {
  getAutomationPlanningData,
  type AutomationPlanningStatus
} from "@/lib/automation/planning";
import type { AutomationPlanningReadinessStatus } from "@floorconnector/types";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function getStatusClasses(status: AutomationPlanningStatus) {
  switch (status) {
    case "implemented":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "foundation":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getReadinessPlanClasses(status: AutomationPlanningReadinessStatus) {
  switch (status) {
    case "planning_ready":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "needs_preferences":
      return "border border-sky-200 bg-sky-50 text-sky-800";
    case "needs_sample_context":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border border-rose-200 bg-rose-50 text-rose-800";
  }
}

function getReadinessPlanLabel(status: AutomationPlanningReadinessStatus) {
  switch (status) {
    case "planning_ready":
      return "Planning ready";
    case "needs_preferences":
      return "Needs preferences";
    case "needs_sample_context":
      return "Needs sample context";
    default:
      return "Needs both";
  }
}

function getRunStatusClasses(status: string) {
  switch (status) {
    case "executed":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "blocked":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "failed":
      return "border border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function SettingsAutomationPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/automation");
  const [automation, runHistory] = await Promise.all([
    getAutomationPlanningData(scope.organizationId),
    getAutomationRunHistory(scope.organizationId)
  ]);
  const preferenceByCategory = new Map(
    automation.workflowSettings.automationNotificationPreferences.map((preference) => [
      preference.category,
      preference
    ])
  );
  const planningByCategory = new Map(
    automation.categories.map((category) => [category.key, category])
  );
  const previewByCategory = new Map(
    automation.eligibilityPreviews.map((preview) => [preview.category, preview])
  );

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Automation Readiness"
        description="This dashboard shows which automation concepts are safe to build on top of real canonical foundations. Manual execution below creates in-app notifications only. Nothing on this page runs cron jobs, sends email or SMS, or mutates workflow state."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Implemented concepts</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {automation.summary.implementedCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Visibility exists on live canonical records, but execution still remains manual.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Foundation only</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {automation.summary.foundationCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Canonical source data exists, but no automation runner has been added.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Planned</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {automation.summary.plannedCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Concepts with no execution or dedicated event layer yet.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Execution enabled</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {automation.summary.executionEnabledCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manual notification-only execution is available for configured internal beta categories.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-5">
          {[
            {
              title: "Automation execution",
              readiness: automation.readiness.automationExecution
            },
            {
              title: "Notification foundation",
              readiness: automation.readiness.notificationFoundation
            },
            {
              title: "Communication foundation",
              readiness: automation.readiness.communicationFoundation
            },
            {
              title: "Scheduling foundation",
              readiness: automation.readiness.schedulingFoundation
            },
            {
              title: "Payment foundation",
              readiness: automation.readiness.paymentFoundation
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 text-sm leading-6 text-slate-600"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.title}
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {item.readiness.label}
              </p>
              <p className="mt-2">{item.readiness.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 text-sm leading-6 text-slate-600">
          <p className="font-medium text-slate-950">Current workflow dependencies</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <p>
              Contract signature before scheduling:{" "}
              <span className="font-medium text-slate-950">
                {automation.workflowSettings.requireContractSignatureBeforeJobScheduling
                  ? "required"
                  : "optional"}
              </span>
            </p>
            <p>
              Deposit before scheduling:{" "}
              <span className="font-medium text-slate-950">
                {automation.workflowSettings.requireDepositBeforeJobScheduling
                  ? "required"
                  : "optional"}
              </span>
            </p>
            <p>
              Financing approval before scheduling:{" "}
              <span className="font-medium text-slate-950">
                {automation.workflowSettings.requireFinancingApprovalBeforeJobScheduling
                  ? "required"
                  : "optional"}
              </span>
            </p>
            <p>
              Internal approval before contract send:{" "}
              <span className="font-medium text-slate-950">
                {automation.workflowSettings.requireContractInternalApproval
                  ? "required"
                  : "optional"}
              </span>
            </p>
          </div>
        </div>
      </DetailPanel>

      <DetailPanel
        title="Manual Notification Run"
        description="Run the first internal-beta automation checks for this organization only. The runner creates canonical notification_events and per-user in-app notifications when configured preferences, canonical context, recipients, and duplicate guards pass."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Notification-only guardrails</p>
            <p className="mt-2">
              This run checks customer messages, sent estimates awaiting approval,
              contracts awaiting signature, and overdue open invoices. It does not send
              email or SMS, does not post communication messages, and does not update
              estimates, contracts, invoices, payments, projects, jobs, or schedules.
            </p>
          </div>
          <form action={runManualAutomationNotificationsAction}>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-900 lg:w-auto"
            >
              Run notification checks
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Run logs</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {runHistory.totalCount}
            </p>
          </div>
          {(["executed", "blocked", "skipped"] as const).map((status) => (
            <div
              key={status}
              className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4"
            >
              <p className="text-sm font-medium capitalize text-slate-950">{status}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {runHistory.recentRuns.filter((run) => run.status === status).length}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Recent visible run rows
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white">
          {runHistory.recentRuns.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {runHistory.recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="grid gap-3 px-5 py-4 text-sm leading-6 text-slate-600 lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          getRunStatusClasses(run.status)
                        ].join(" ")}
                      >
                        {run.status}
                      </span>
                      <span className="font-medium text-slate-950">
                        {automationNotificationPreferenceContent[run.category]?.label ??
                          run.category.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2">{run.reason ?? "No run detail was recorded."}</p>
                  </div>
                  <div className="text-left text-xs leading-5 text-slate-500 lg:text-right">
                    <p>{formatDateTime(run.createdAt)}</p>
                    {run.notificationEventId ? (
                      <p>Notification event linked</p>
                    ) : (
                      <p>No notification event</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-sm leading-6 text-slate-600">
              No automation run logs yet. Run notification checks after configuring at least
              one category and recipient role.
            </div>
          )}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Automation Build Plan"
        description="This compact plan combines saved preferences, one current eligibility sample, and the static template definition for each category. Manual execution still remains notification-only and does not mutate canonical workflow records."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {automation.readinessPlan.map((plan) => (
            <article
              key={plan.category}
              className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {plan.displayName}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {plan.preferenceSummary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      getReadinessPlanClasses(plan.readinessStatus)
                    ].join(" ")}
                  >
                    {getReadinessPlanLabel(plan.readinessStatus)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Manual only
                  </span>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Eligibility summary
                  </dt>
                  <dd className="mt-1">{plan.eligibilitySummary}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Template summary
                  </dt>
                  <dd className="mt-1">{plan.templateSummary}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Next safe implementation step
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {plan.nextSafeImplementationStep}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Blockers
                  </dt>
                  <dd className="mt-2">
                    {plan.blockers.length > 0 ? (
                      <ul className="space-y-2">
                        {plan.blockers.map((blocker) => (
                          <li
                            key={`${plan.category}-${blocker}`}
                            className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            {blocker}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                        Saved preferences, the current sample context, and the static template definition line up. Manual notification-only execution can evaluate this category when it is in the first execution set.
                      </p>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Execution available
                  </dt>
                  <dd className="mt-1 font-medium text-slate-950">
                    {plan.executionAvailable ? "Yes" : "No"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Future Notification Copy Preview"
        description="These are static planning definitions for future notification-only copy. They are preview-only, not editable, and they do not activate automation, create notification_events, send messages, or mutate canonical records."
      >
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          Future notification copy only. This section previews default template definitions for later planning and does not save or execute anything.
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {automationNotificationPreferenceCategories.map((categoryKey) => {
            const template = automationNotificationTemplateDefinitionsByCategory[categoryKey];

            return (
              <article
                key={categoryKey}
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      {template.displayName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {template.triggerSource}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                      Preview only
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                      Execution off
                    </span>
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Intended recipients
                    </dt>
                    <dd className="mt-1 text-slate-900">
                      {template.intendedRecipients.join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Trigger source
                    </dt>
                    <dd className="mt-1">{template.triggerSource}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Sample subject / title
                    </dt>
                    <dd className="mt-1 text-slate-900">{template.sampleSubject}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Sample body / copy
                    </dt>
                    <dd className="mt-1">{template.sampleBody}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Required canonical context fields
                    </dt>
                    <dd className="mt-2">
                      <ul className="space-y-2">
                        {template.requiredCanonicalContextFields.map((field) => (
                          <li
                            key={`${template.category}-${field.key}`}
                            className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <span className="font-medium text-slate-950">
                              {field.label}
                            </span>{" "}
                            <span className="text-slate-500">({field.key})</span>
                            <p className="mt-1 text-sm text-slate-600">
                              {field.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Execution available
                    </dt>
                    <dd className="mt-1 font-medium text-slate-950">
                      {template.executionAvailable ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Future Notification Preferences"
        description="Save organization-scoped preferences for notification-only automations. These preferences control internal in-app notification routing only; they do not send messages or update contracts, invoices, payments, jobs, communications, or change orders."
      >
        <form action={updateAutomationNotificationPreferencesAction} className="space-y-5">
          <input type="hidden" name="returnTo" value="/settings/automation" />

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Saving these settings records contractor notification intent on the existing organization workflow settings row. Manual execution uses these settings only for in-app notification routing.
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {automationNotificationPreferenceCategories.map((categoryKey) => {
              const preference = preferenceByCategory.get(categoryKey);
              const planningCategory = planningByCategory.get(categoryKey);
              const content = automationNotificationPreferenceContent[categoryKey];

              return (
                <article
                  key={categoryKey}
                  className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-slate-950">
                        {content.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {content.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {planningCategory ? (
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            getStatusClasses(planningCategory.status)
                          ].join(" ")}
                        >
                          {planningCategory.status}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                        Preparation only
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <input
                        type="checkbox"
                        name={`automation.${categoryKey}.enabledForFutureExecution`}
                        defaultChecked={preference?.enabledForFutureExecution ?? false}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-900">
                          Enable for manual execution
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          The manual notification runner uses this saved intent when you run checks.
                        </span>
                      </span>
                    </label>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        Notify these contractor roles
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Manual runs create in-app notifications for active users in the selected roles only.
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {automationNotificationPreferenceRoleOptions.map((roleOption) => (
                          <label
                            key={roleOption.role}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <input
                              type="checkbox"
                              name={`automation.${categoryKey}.notifyRoles`}
                              value={roleOption.role}
                              defaultChecked={
                                preference?.notifyRoles.includes(roleOption.role) ?? false
                              }
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                            />
                            <span>
                              <span className="block text-sm font-medium text-slate-900">
                                {roleOption.label}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-500">
                                {roleOption.description}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {planningCategory ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                        <p className="font-medium text-slate-950">Current canonical trigger</p>
                        <p className="mt-1">{planningCategory.triggerSource}</p>
                        <p className="mt-3 font-medium text-slate-950">
                          Current readiness gap
                        </p>
                        <p className="mt-1">{planningCategory.missingDependency}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            These preferences are organization-scoped. They do not create cron jobs, queues, customer messages, read receipts, or workflow updates.
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            Save future notification preferences
          </button>
        </form>
      </DetailPanel>

      <DetailPanel
        title="Eligibility Preview / Debug"
        description="This is a read-only preview of how the saved organization preference for each category lines up with one recent canonical sample context. It does not execute anything, create events, or send notifications."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {automationNotificationPreferenceCategories.map((categoryKey) => {
            const preview = previewByCategory.get(categoryKey);
            const content = automationNotificationPreferenceContent[categoryKey];

            if (!preview) {
              return null;
            }

            return (
              <article
                key={categoryKey}
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      {content.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Sample context: {preview.sampleLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        preview.result.wouldBeEligible
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border border-amber-200 bg-amber-50 text-amber-800"
                      ].join(" ")}
                    >
                      {preview.result.wouldBeEligible ? "Eligible later" : "Blocked"}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                      Execution off
                    </span>
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Configured
                      </dt>
                      <dd className="mt-1 font-medium text-slate-950">
                        {preview.result.isConfigured ? "Yes" : "No"}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Future execution intent
                      </dt>
                      <dd className="mt-1 font-medium text-slate-950">
                        {preview.result.isEnabledForFutureExecution ? "Enabled" : "Off"}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Notify roles
                      </dt>
                      <dd className="mt-1 font-medium text-slate-950">
                        {preview.result.notifyRoles.length > 0
                          ? preview.result.notifyRoles.join(", ")
                          : "None selected"}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Execution available
                      </dt>
                      <dd className="mt-1 font-medium text-slate-950">
                        {preview.result.executionAvailable ? "Yes" : "No"}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Result
                    </dt>
                    <dd className="mt-1">{preview.result.reason}</dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Blockers
                    </dt>
                    <dd className="mt-2">
                      {preview.result.blockers.length > 0 ? (
                        <ul className="space-y-2">
                          {preview.result.blockers.map((blocker) => (
                            <li
                              key={blocker}
                              className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              {blocker}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                          No blockers on this sample context. Execution still remains unavailable in this branch.
                        </p>
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Safe Next Steps"
        description="These recommendations stay inside the current production-first boundaries: visibility first, canonical events first, and no silent mutations."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {automation.recommendations.map((recommendation) => (
            <div
              key={recommendation.title}
              className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5"
            >
              <p className="text-base font-semibold text-slate-950">
                {recommendation.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {recommendation.detail}
              </p>
            </div>
          ))}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Automation Categories"
        description="Each category below points back to the real canonical record or event source. Status describes readiness only; saved preferences above do not change execution."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {automation.categories.map((category) => (
            <article
              key={category.key}
              className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {category.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {category.intendedAction}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      getStatusClasses(category.status)
                    ].join(" ")}
                  >
                    {category.status}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Execution off
                  </span>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Source canonical record or event
                  </dt>
                  <dd className="mt-1 text-slate-900">{category.source}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current trigger source
                  </dt>
                  <dd className="mt-1">{category.triggerSource}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Missing dependency
                  </dt>
                  <dd className="mt-1">{category.missingDependency}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Notifications currently exist
                  </dt>
                  <dd className="mt-1">{category.notificationsState}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Messages currently exist
                  </dt>
                  <dd className="mt-1">{category.messagesState}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Dependency snapshot
                  </dt>
                  <dd className="mt-1">{category.dependencyState}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Automation execution
                  </dt>
                  <dd className="mt-1">{category.executionState}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Recent canonical samples
                  </dt>
                  <dd className="mt-2">
                    <ul className="space-y-2">
                      {category.recentSamples.map((sample) => (
                        <li
                          key={sample}
                          className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                        >
                          {sample}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </DetailPanel>
    </div>
  );
}
