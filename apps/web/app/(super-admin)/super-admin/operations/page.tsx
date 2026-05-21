import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import { getPlatformOperationsObservability } from "@/lib/platform-admin/data";
import type {
  PlatformOperationsActivityRow,
  PlatformOperationsAttentionRow,
  PlatformOperationsSummaryCard,
  PlatformOperationsTone
} from "@/lib/platform-admin/operations-observability-core";

const toneClasses: Record<PlatformOperationsTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function SummaryCard({ card }: { card: PlatformOperationsSummaryCard }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses[card.tone]}`}
        >
          {card.tone}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {card.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
    </div>
  );
}

function ActivityRow({ row }: { row: PlatformOperationsActivityRow }) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 lg:grid-cols-[minmax(150px,0.7fr)_minmax(220px,1fr)_minmax(180px,0.7fr)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {row.sourceLabel}
        </p>
        <p className="mt-2 text-sm font-semibold capitalize text-slate-950">
          {row.kind.replace(/_/g, " ")}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{row.label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{row.detail}</p>
      </div>
      <div className="flex flex-col items-start gap-2 lg:items-end">
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses[row.tone]}`}
        >
          {row.tone}
        </span>
        <p className="text-xs text-slate-500">{formatDateTime(row.occurredAt)}</p>
      </div>
    </li>
  );
}

function AttentionRow({ row }: { row: PlatformOperationsAttentionRow }) {
  const tone: PlatformOperationsTone =
    row.severity === "critical"
      ? "critical"
      : row.severity === "warning"
        ? "warning"
        : "neutral";

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{row.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{row.detail}</p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses[tone]}`}
        >
          {row.severity}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {formatDateTime(row.occurredAt)}
      </p>
    </li>
  );
}

export default async function SuperAdminOperationsPage() {
  const operations = await getPlatformOperationsObservability();

  return (
    <div className="space-y-6" data-testid="platform-operations-page">
      <SuperAdminTopTabs
        tabs={[
          {
            href: "#platform-health-summary",
            label: "Health",
            description: "Read-only platform signal counts"
          },
          {
            href: "#recent-operational-activity",
            label: "Activity",
            description: "Existing audit and error rows"
          },
          {
            href: "#attention-needed",
            label: "Attention",
            description: "Support-readiness review cues"
          },
          {
            href: "#audit-sources",
            label: "Sources",
            description: "Loaded and unavailable read models"
          }
        ]}
      />

      <SettingsSectionCard
        id="platform-health-summary"
        eyebrow="Read-only operations"
        title="Platform Health Summary"
        description="This Super Admin operations foundation centralizes existing health, audit, and support-readiness signals. It does not remediate, retry, assign, provision, change entitlements, change pricing or packages, affect runtime behavior, or mutate tenant-owned records."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="platform-operations-read-only-copy"
        >
          Read-only view generated {formatDateTime(operations.generatedAt)}. No
          remediation actions are available from this page.
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operations.summaryCards.map((card) => (
            <SummaryCard key={card.id} card={card} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="recent-operational-activity"
        eyebrow="Existing audit rows"
        title="Recent Operational Activity"
        description="Recent rows are merged from workflow errors, starter-pack provisioning audit records, provisioning attempts, and contractor group audit events when those sources are available."
        tone="neutral"
      >
        {operations.recentActivity.length > 0 ? (
          <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {operations.recentActivity.map((row) => (
              <ActivityRow key={row.id} row={row} />
            ))}
          </ol>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            No recent operational activity rows are loaded for the monitored sources.
          </p>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="attention-needed"
        eyebrow="Support readiness"
        title="Attention Needed"
        description="These rows are review cues only. They do not create tickets, retry provider work, execute provisioning, assign contractor groups, or change tenant records."
        tone="neutral"
      >
        {operations.attentionNeeded.length > 0 ? (
          <ul className="grid gap-3 lg:grid-cols-2">
            {operations.attentionNeeded.map((row) => (
              <AttentionRow key={row.id} row={row} />
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            No attention-needed rows are currently loaded from the monitored sources.
          </p>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="audit-sources"
        eyebrow="Audit sources"
        title="Audit Sources"
        description="Source availability reflects whether the read-only operations model could load each existing table or read model."
        tone="neutral"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {operations.auditSources.map((source) => (
            <div
              key={source.key}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {source.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest: {formatDateTime(source.latestAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    source.available
                      ? toneClasses.good
                      : toneClasses.warning
                  }`}
                >
                  {source.available ? "available" : "unavailable"}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">
                {source.count ?? "N/A"}
              </p>
              {source.caveat ? (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {source.caveat}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="future-operations"
        eyebrow="Not yet monitored"
        title="Not Yet Monitored / Future Operations"
        description="These items remain future operations work and are intentionally not available as controls on this page."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Operator guidance
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {operations.operatorGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Future operations
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {operations.notYetMonitored.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
