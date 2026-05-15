import { SettingsSectionCard } from "@/components/settings-section-card";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { exportModuleDefinitions } from "@/lib/data-export/core";
import {
  listRecentDataExportEvents,
  type DataExportEventListItem
} from "@/lib/data-export/events";

export default async function DataExportSettingsPage() {
  const scope = await requireOrganizationAdminScope("/settings/export");
  const exportHistory = await listRecentDataExportEvents(8, scope);
  const primaryModules = exportModuleDefinitions.filter((module) =>
    [
      "customers",
      "customer_contacts",
      "projects",
      "estimates",
      "invoices",
      "payments",
      "jobs"
    ].includes(module.key)
  );
  const detailModules = exportModuleDefinitions.filter((module) =>
    ["estimate_line_items", "invoice_line_items", "job_assignments"].includes(
      module.key
    )
  );

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        eyebrow="Data portability"
        title="Data Export"
        description="Your data stays portable. Export core records from canonical FloorConnector data."
      >
        <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-3">
          <TrustStat label="Tenant scope" value={scope.organization.displayName} />
          <TrustStat label="Formats" value="CSV + JSON manifest" />
          <TrustStat label="Access" value="Owner/admin only" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SafetyNotice
            title="Customer PII"
            body="Exports can include customer names, emails, phone numbers, and addresses. Treat downloaded files as sensitive business records."
          />
          <SafetyNotice
            title="Payment safety"
            body="Payment exports include canonical payment rows only. Card numbers, bank details, gateway payloads, webhook secrets, and checkout links are never exported."
          />
          <SafetyNotice
            title="Portal safety"
            body="Portal invite tokens, token hashes, sessions, temporary passwords, and auth secrets are excluded from this export foundation."
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="Audit trail"
        title="Recent export history"
        description="Export history records who requested an export, when it happened, the module, format, status, and row count. It never stores exported rows or file contents."
        tone="neutral"
      >
        {exportHistory.unavailableReason ? (
          <div className="border border-[#d9cdc2] bg-white px-5 py-4">
            <p className="text-sm font-semibold text-[#221a14]">
              Export history pending migration
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f6256]">
              {exportHistory.unavailableReason}
            </p>
          </div>
        ) : exportHistory.events.length > 0 ? (
          <div className="divide-y divide-[#d9cdc2] border border-[#d9cdc2] bg-white">
            {exportHistory.events.map((event) => (
              <ExportHistoryRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="border border-[#d9cdc2] bg-white px-5 py-4">
            <p className="text-sm font-semibold text-[#221a14]">
              No export history yet
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f6256]">
              Recent export attempts will appear here after an owner or admin
              downloads a CSV or JSON manifest.
            </p>
          </div>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="Export modules"
        title="Core record exports"
        description="Download module-by-module data from the active tenant. These files are read-only views over canonical records, not detached snapshots or alternate source-of-truth models."
        tone="neutral"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {primaryModules.map((module) => (
            <ExportModuleCard key={module.key} module={module} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="Detailed rows"
        title="Line-item and assignment exports"
        description="Use these exports when a contractor needs more detail than summary records provide. Commercial line exports intentionally omit internal cost, markup, raw provider, token, and secret fields."
        tone="neutral"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {detailModules.map((module) => (
            <ExportModuleCard key={module.key} module={module} compact />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="Import readiness"
        title="Import planning, no mutation yet"
        description="Import is intentionally validation-first and not a write path in this phase."
        tone="neutral"
      >
        <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-2">
          <div className="bg-white px-5 py-4">
            <p className="text-sm font-semibold text-[#221a14]">Future sources</p>
            <p className="mt-2 text-sm leading-6 text-[#6f6256]">
              Contractor Foreman CSV, QuickBooks customer lists, generic
              customer/project CSV, and estimate line-item templates.
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-sm font-semibold text-[#221a14]">Future gate</p>
            <p className="mt-2 text-sm leading-6 text-[#6f6256]">
              Dry-run mapping, duplicate detection, audit trail, rollback plan,
              and explicit approval before any import writes canonical records.
            </p>
          </div>
        </div>

        <p className="mt-5 border border-[#d9cdc2] bg-white px-4 py-3 text-sm font-medium text-[#594839]">
          Import readiness is documented for future validation and dry-run mapping;
          no upload or import mutation control is enabled.
        </p>
      </SettingsSectionCard>
    </div>
  );
}

function ExportHistoryRow({ event }: { event: DataExportEventListItem }) {
  const moduleLabel =
    exportModuleDefinitions.find((definition) => definition.key === event.moduleKey)
      ?.label ?? event.moduleKey;
  const statusClass =
    event.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#221a14]">{moduleLabel}</p>
          <span
            className={`border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClass}`}
          >
            {event.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#6f6256]">
          {event.format.toUpperCase()} ·{" "}
          {event.recordCount === null ? "No row count" : `${event.recordCount} rows`}
        </p>
        {event.filename ? (
          <p className="mt-1 break-all text-xs text-[#7b6a5b]">{event.filename}</p>
        ) : null}
      </div>

      <div>
        <p className="text-sm font-medium text-[#221a14]">
          {event.requestedByLabel}
        </p>
        <p className="mt-1 text-sm text-[#6f6256]">
          {formatExportEventTime(event.createdAt)}
        </p>
      </div>

      {event.errorSummary ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {event.errorSummary}
        </p>
      ) : null}
    </div>
  );
}

function formatExportEventTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function TrustStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f6256]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#221a14]">{value}</p>
    </div>
  );
}

function SafetyNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4">
      <p className="text-sm font-semibold text-[#221a14]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#6f6256]">{body}</p>
    </div>
  );
}

function ExportModuleCard({
  module,
  compact = false
}: {
  module: (typeof exportModuleDefinitions)[number];
  compact?: boolean;
}) {
  return (
    <section className="flex min-h-full flex-col border border-[#d9cdc2] bg-white px-5 py-4">
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f6256]">
          {module.sourceModel}
        </p>
        <h3 className="mt-2 text-base font-semibold text-[#221a14]">
          {module.label}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#6f6256]">
          {module.description}
        </p>
        {!compact ? (
          <p className="mt-3 text-xs leading-5 text-[#7b6a5b]">
            {module.fields.length} safe field
            {module.fields.length === 1 ? "" : "s"} defined for CSV and JSON.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`/settings/export/${module.key}?format=csv`}
          className="inline-flex items-center justify-center border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
        >
          Export CSV
        </a>
        <a
          href={`/settings/export/${module.key}?format=json`}
          className="inline-flex items-center justify-center border border-[#d9cdc2] bg-white px-3 py-2 text-sm font-medium text-[#594839] transition hover:border-[#ef7d32]"
        >
          JSON manifest
        </a>
      </div>
    </section>
  );
}
