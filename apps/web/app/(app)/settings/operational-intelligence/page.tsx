import { DetailPanel } from "@/components/detail-panel";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import {
  operationalCueRuleDefinitionByKey,
  operationalCueThresholdDayMaximum,
  operationalCueUrgencies
} from "@/lib/operational-cues/rule-definitions";
import { getOperationalCueOwnerStrategyLabel } from "@/lib/operational-cues/owner-strategies";
import {
  listAssignableResponsibilityPeople,
  listOrganizationResponsibilityDefaults
} from "@/lib/operational-cues/responsibility-defaults";
import { listOperationalCueRulesForSettings } from "@/lib/operational-cues/rules";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import {
  clearOrganizationResponsibilityDefaultAction,
  updateOperationalCueRuleSettingsAction,
  updateOrganizationResponsibilityDefaultAction
} from "@/lib/settings/actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

type ResponsibilityRoleKey =
  | "estimator"
  | "project_manager"
  | "billing_owner"
  | "scheduler";

function isResponsibilityRoleKey(value: string): value is ResponsibilityRoleKey {
  return ["estimator", "project_manager", "billing_owner", "scheduler"].includes(value);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getUrgencyClasses(urgency: string) {
  switch (urgency) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default async function OperationalIntelligenceSettingsPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope(
    "/settings/operational-intelligence"
  );
  const [rules, responsibilityDefaults, assignablePeople] = await Promise.all([
    listOperationalCueRulesForSettings(scope.organizationId),
    listOrganizationResponsibilityDefaults(scope.organizationId),
    listAssignableResponsibilityPeople(scope.organizationId)
  ]);
  const defaultsByRole = new Map(
    responsibilityDefaults.map((defaultRole) => [defaultRole.roleKey, defaultRole])
  );
  const ownerStrategyRules = Array.from(
    new Map(rules.map((rule) => [rule.ownerStrategy, rule])).values()
  )
    .filter((rule) => isResponsibilityRoleKey(rule.ownerStrategy))
    .map((rule) => ({
      ...rule,
      ownerStrategy: rule.ownerStrategy as ResponsibilityRoleKey
    }));

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Operational Intelligence / My Work"
        description="Tune the deterministic rule templates that feed My Work and record workspace attention panels. Cue results still derive from canonical estimates, contracts, invoices, and jobs at query time."
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          <p className="font-medium text-slate-950">
            Guidance controls, not automation
          </p>
          <p className="mt-1">
            These rules decide when deterministic cues appear. They do not complete
            work, update invoices, send messages, schedule jobs, change customer-facing
            records, or create work items.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                What changes
              </p>
              <p className="mt-1 text-xs leading-5">
                Enabled state, threshold days, urgency, and responsibility display.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                What stays manual
              </p>
              <p className="mt-1 text-xs leading-5">
                Work items, customer messages, payments, scheduling, and status changes.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Visibility state
              </p>
              <p className="mt-1 text-xs leading-5">
                Dismiss and snooze are user-scoped where supported and never mark work
                complete.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Readiness gates
              </p>
              <p className="mt-1 text-xs leading-5">
                Cue visibility never bypasses project readiness, billing, signature, or
                scheduling rules.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {rules.map((rule) => {
            const definition = operationalCueRuleDefinitionByKey.get(rule.cueKey);

            return (
              <article
                key={rule.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      {definition?.label ?? formatLabel(rule.cueKey)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {definition?.description ??
                        "Built-in operational cue rule for My Work."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        rule.enabled
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      ].join(" ")}
                    >
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        getUrgencyClasses(rule.urgency)
                      ].join(" ")}
                    >
                      {rule.urgency}
                    </span>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Subject
                    </dt>
                    <dd className="mt-1 font-medium capitalize text-slate-950">
                      {rule.subjectType}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Responsible role strategy
                    </dt>
                    <dd className="mt-1 font-medium text-slate-950">
                      {getOperationalCueOwnerStrategyLabel(rule.ownerStrategy)}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Cue key
                    </dt>
                    <dd className="mt-1 break-all font-medium text-slate-950">
                      {rule.cueKey}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Escalation
                    </dt>
                    <dd className="mt-1 font-medium text-slate-950">
                      {rule.escalationDays == null
                        ? "Not configured"
                        : `${rule.escalationDays} days`}
                    </dd>
                  </div>
                </dl>

                {definition ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      What this rule affects
                    </p>
                    <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 lg:grid-cols-2">
                      <div>
                        <dt className="font-medium text-slate-900">Trigger</dt>
                        <dd className="mt-1">{definition.triggerSummary}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Why it matters</dt>
                        <dd className="mt-1">{definition.whyItMatters}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Where it appears</dt>
                        <dd className="mt-1">{definition.appearsIn}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Safe next action</dt>
                        <dd className="mt-1">{definition.safeAction}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
                      {definition.visibilityNote}
                    </p>
                  </div>
                ) : null}

                <SaveStateForm
                  action={updateOperationalCueRuleSettingsAction}
                  pendingLabel="Saving..."
                  className="mt-5 space-y-4"
                >
                  <input type="hidden" name="cueKey" value={rule.cueKey} />

                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <input
                      type="checkbox"
                      name="enabled"
                      defaultChecked={rule.enabled}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        Show this cue in My Work
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        When disabled, the derived cue will not appear even if matching
                        canonical records exist.
                      </span>
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-800">
                        Threshold days
                      </span>
                      <input
                        name="thresholdDays"
                        type="number"
                        min="0"
                        max={operationalCueThresholdDayMaximum}
                        step="1"
                        defaultValue={rule.thresholdDays ?? ""}
                        placeholder="Use no day threshold"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      />
                      <span className="mt-2 block text-xs leading-5 text-slate-500">
                        Blank means no day threshold. Use 0-
                        {operationalCueThresholdDayMaximum} for the first settings pass.
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-800">
                        Urgency
                      </span>
                      <select
                        name="urgency"
                        defaultValue={rule.urgency}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      >
                        {operationalCueUrgencies.map((urgency) => (
                          <option key={urgency} value={urgency}>
                            {urgency}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <SaveStateSubmitButton
                    submitLabel="Save cue rule"
                    pendingLabel="Saving..."
                    ariaLabel={`Save ${definition?.label ?? formatLabel(rule.cueKey)} cue rule`}
                  />
                </SaveStateForm>
              </article>
            );
          })}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Responsibility defaults"
        description="Map built-in operational role strategies to active, assignable people. These defaults help cues show a responsible person without creating assignments, task records, or user-specific My Work filtering."
      >
        {assignablePeople.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Add active, assignable people in the People manager before configuring
            responsibility defaults.
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {ownerStrategyRules.map((rule) => {
            const definition = operationalCueRuleDefinitionByKey.get(rule.cueKey);
            const defaultRole = defaultsByRole.get(rule.ownerStrategy);

            return (
              <article
                key={rule.ownerStrategy}
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      {getOperationalCueOwnerStrategyLabel(rule.ownerStrategy)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {definition?.description ??
                        "Built-in responsible role for operational cues."}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {defaultRole?.person.displayName ?? "Role fallback"}
                  </span>
                </div>

                <SaveStateForm
                  action={updateOrganizationResponsibilityDefaultAction}
                  pendingLabel="Saving..."
                  className="mt-5 space-y-4"
                >
                  <input type="hidden" name="roleKey" value={rule.ownerStrategy} />
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Responsible person
                    </span>
                    <select
                      name="personId"
                      defaultValue={defaultRole?.personId ?? ""}
                      disabled={assignablePeople.length === 0}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">Select a person</option>
                      {assignablePeople.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.displayName}
                        </option>
                      ))}
                    </select>
                    <span className="mt-2 block text-xs leading-5 text-slate-500">
                      This maps the role to a People record. If that person has a
                      linked app user, the cue can also expose that user id for a
                      future My Work filter.
                    </span>
                  </label>
                  <SaveStateSubmitButton
                    submitLabel="Save responsible person"
                    pendingLabel="Saving..."
                    ariaLabel={`Save responsible person for ${getOperationalCueOwnerStrategyLabel(rule.ownerStrategy)}`}
                  />
                </SaveStateForm>

                <form
                  action={clearOrganizationResponsibilityDefaultAction}
                  className="mt-3"
                >
                  <input type="hidden" name="roleKey" value={rule.ownerStrategy} />
                  <button
                    type="submit"
                    disabled={!defaultRole}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    Clear responsible person
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </DetailPanel>
    </div>
  );
}
