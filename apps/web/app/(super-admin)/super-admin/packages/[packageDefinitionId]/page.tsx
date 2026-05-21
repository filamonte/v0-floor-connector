import Link from "next/link";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import { getPlatformPackageDefinitionDetail } from "@/lib/platform-admin/data";
import type {
  PlatformPackageDefinitionAuditTimelineBucket,
  PlatformPackageDefinitionAuditTimelineRow,
  PlatformPackageDefinitionAuditTimelineSummaryCard,
  PlatformPackageDefinitionAuditTimelineTone
} from "@/lib/platform-admin/package-definition-audit-timeline-core";
import type {
  PlatformPackageDefinitionDetailBucket,
  PlatformPackageDefinitionDetailSummaryCard,
  PlatformPackageDefinitionDetailTone,
  PlatformPackageDefinitionDetailVersionRow
} from "@/lib/platform-admin/package-definition-detail-core";
import type {
  PlatformPackageDefinitionLifecycleReadinessSummaryCard,
  PlatformPackageDefinitionLifecycleReadinessTone,
  PlatformPackageDefinitionLifecycleReadinessTransition
} from "@/lib/platform-admin/package-definition-lifecycle-readiness-core";

type SuperAdminPackageDefinitionDetailPageProps = {
  params: Promise<{
    packageDefinitionId: string;
  }>;
};

const toneClasses: Record<PlatformPackageDefinitionDetailTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const auditToneClasses: Record<PlatformPackageDefinitionAuditTimelineTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const lifecycleToneClasses: Record<PlatformPackageDefinitionLifecycleReadinessTone, string> = {
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

function DetailSummaryCard({
  card
}: {
  card: PlatformPackageDefinitionDetailSummaryCard;
}) {
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
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {card.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
    </div>
  );
}

function AuditSummaryCard({
  card
}: {
  card: PlatformPackageDefinitionAuditTimelineSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${auditToneClasses[card.tone]}`}
        >
          {card.tone}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {card.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
    </div>
  );
}

function LifecycleSummaryCard({
  card
}: {
  card: PlatformPackageDefinitionLifecycleReadinessSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${lifecycleToneClasses[card.tone]}`}
        >
          {card.tone}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {card.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
    </div>
  );
}

function BucketGrid({
  buckets
}: {
  buckets: PlatformPackageDefinitionDetailBucket[];
}) {
  if (buckets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        No lifecycle buckets are available because this package definition could
        not be loaded.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {buckets.map((bucket) => (
        <div
          key={bucket.key}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">{bucket.label}</p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {bucket.count}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {bucket.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function AuditBucketGrid({
  buckets
}: {
  buckets: PlatformPackageDefinitionAuditTimelineBucket[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {buckets.map((bucket) => (
        <div
          key={bucket.key}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">{bucket.label}</p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {bucket.count}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {bucket.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function VersionRow({ row }: { row: PlatformPackageDefinitionDetailVersionRow }) {
  return (
    <li className="border-t border-slate-200 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(150px,0.6fr)_minmax(220px,0.9fr)_minmax(260px,1.2fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {row.versionLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Version {row.versionNumber} / {row.status}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Published: {formatDateTime(row.publishedAt)}
          </p>
          <p className="text-xs leading-5 text-slate-500">
            Deprecated: {formatDateTime(row.deprecatedAt)}
          </p>
          <p className="text-xs leading-5 text-slate-500">
            Archived: {formatDateTime(row.archivedAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Commercial summary
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {row.commercialSummary}
          </p>
          {row.caveats.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
              {row.caveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Intent and snapshot summaries
          </p>
          <div className="mt-2 grid gap-2">
            {row.intentSections.map((section) => (
              <div
                key={section.key}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-800">
                    {section.label}
                  </p>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {section.state}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {section.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function AuditEventRow({
  row
}: {
  row: PlatformPackageDefinitionAuditTimelineRow;
}) {
  return (
    <li className="border-t border-slate-200 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(170px,0.7fr)_minmax(240px,1fr)_minmax(280px,1.2fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-950">{row.eventLabel}</p>
          <p className="mt-1 text-xs text-slate-500">{row.eventType}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Occurred: {formatDateTime(row.occurredAt)}
          </p>
          <p className="text-xs leading-5 text-slate-500">
            Version: {row.packageDefinitionVersionId ?? "Definition-level"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Operator evidence
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {row.reasonSummary}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {row.confirmationSummary}
          </p>
          {row.caveats.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
              {row.caveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Safe snapshot summaries
          </p>
          <div className="mt-2 grid gap-2">
            {[
              row.beforeSnapshotSummary,
              row.afterSnapshotSummary,
              row.metadataSummary
            ].map((summary) => (
              <p
                key={summary}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500"
              >
                {summary}
              </p>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function LifecycleTransitionRow({
  row
}: {
  row: PlatformPackageDefinitionLifecycleReadinessTransition;
}) {
  return (
    <li className="border-t border-slate-200 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(190px,0.75fr)_minmax(220px,0.9fr)_minmax(280px,1.2fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-950">{row.label}</p>
          <p className="mt-1 text-xs text-slate-500">
            {row.fromState} to {row.toState}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Subject: {row.subjectType}
          </p>
          <p className="break-all text-xs leading-5 text-slate-500">
            {row.subjectId ?? "No subject row available"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Readiness
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {row.status.replaceAll("_", " ")}
          </p>
          <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
            <li>Action available: {row.actionAvailable ? "yes" : "no"}</li>
            <li>Mutation available: {row.mutationAvailable ? "yes" : "no"}</li>
            <li>Runtime effect: {row.runtimeEffect ? "yes" : "no"}</li>
            <li>Billing effect: {row.billingEffect ? "yes" : "no"}</li>
            <li>Entitlement effect: {row.entitlementEffect ? "yes" : "no"}</li>
            <li>
              Package assignment effect:{" "}
              {row.packageAssignmentEffect ? "yes" : "no"}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Reasons and advisories
          </p>
          {row.reasons.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
              {row.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No blocking reason is present in the read-only model.
            </p>
          )}
          {row.advisoryReasons.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
              {row.advisoryReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function SuperAdminPackageDefinitionDetailPage({
  params
}: SuperAdminPackageDefinitionDetailPageProps) {
  const { packageDefinitionId } = await params;
  const detail = await getPlatformPackageDefinitionDetail(packageDefinitionId);

  return (
    <div
      className="space-y-6"
      data-testid="platform-package-definition-detail-page"
    >
      <SuperAdminTopTabs
        tabs={[
          {
            href: "/super-admin/packages",
            label: "Catalog",
            description: "Back to read-only package catalog"
          },
          {
            href: "#package-definition-summary",
            label: "Summary",
            description: "Definition metadata"
          },
          {
            href: "#package-definition-versions",
            label: "Versions",
            description: "Read-only version snapshots"
          },
          {
            href: "#package-definition-lifecycle-readiness",
            label: "Lifecycle",
            description: "Future transition inspection"
          },
          {
            href: "#package-definition-audit-timeline",
            label: "Audit",
            description: "Read-only audit evidence"
          },
          {
            href: "#package-definition-readiness",
            label: "Readiness",
            description: "Caveats and guidance"
          }
        ]}
      />

      <SettingsSectionCard
        id="package-definition-summary"
        eyebrow="Read-only package detail"
        title={detail.displayName}
        description="This Super Admin package definition detail view inspects one persisted platform package definition and its versions only. It does not create, edit, publish, archive, assign, bill, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          <Link
            href="/super-admin/packages"
            className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Back to Package Definition Catalog
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          Read-only detail generated {formatDateTime(detail.generatedAt)}. No
          package mutation UI, lifecycle mutation controls, package assignment
          behavior, billing/Stripe/subscription behavior,
          entitlement/module/runtime behavior, or contractor permission changes
          are available from this detail view.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detail.summaryCards.map((card) => (
            <DetailSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Definition identity
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Package key
                </dt>
                <dd className="mt-1">{detail.packageKey}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Lifecycle
                </dt>
                <dd className="mt-1">{detail.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Identifier
                </dt>
                <dd className="mt-1 break-all">{detail.packageDefinitionId}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Audience and segment
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {detail.description}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {detail.intendedAudience}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {detail.segmentSummary}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Created
            </p>
            <p className="mt-2 text-sm text-slate-800">
              {formatDateTime(detail.createdAt)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Updated
            </p>
            <p className="mt-2 text-sm text-slate-800">
              {formatDateTime(detail.updatedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Archived
            </p>
            <p className="mt-2 text-sm text-slate-800">
              {formatDateTime(detail.archivedAt)}
            </p>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="package-definition-versions"
        eyebrow="Read-only versions"
        title="Package Versions"
        description="Version rows summarize commercial and intent snapshots without exposing mutation controls, raw provider payloads, runtime resolvers, billing operations, entitlement enforcement, or module gates."
        tone="neutral"
      >
        <BucketGrid buckets={detail.versionStatusBuckets} />

        {detail.versionRows.length > 0 ? (
          <ol className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {detail.versionRows.map((row) => (
              <VersionRow key={row.id} row={row} />
            ))}
          </ol>
        ) : (
          <div
            className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
            data-testid="platform-package-definition-detail-empty-versions"
          >
            No package definition versions are recorded for this package. This
            detail view remains read-only and does not seed, create, publish, or
            infer package behavior from an empty state.
          </div>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="package-definition-lifecycle-readiness"
        eyebrow="Read-only lifecycle readiness"
        title="Lifecycle Readiness"
        description="Future transition checks are inspect-only. They explain eligibility, blockers, unavailable states, and advisories without enabling create, edit, approve, publish, deprecate, archive, assignment, billing, entitlement, module, runtime, or contractor-permission behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="platform-package-definition-lifecycle-readiness"
        >
          Read-only lifecycle readiness generated{" "}
          {formatDateTime(detail.lifecycleReadiness.generatedAt)}. These are
          future checks only: no package create/edit/publish controls, no
          lifecycle or approval controls, no package assignment behavior, no
          billing/Stripe/subscription behavior, no entitlement/module/runtime
          behavior, and no contractor permission changes are available from this
          section.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {detail.lifecycleReadiness.summaryCards.map((card) => (
            <LifecycleSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <ol className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {detail.lifecycleReadiness.transitions.map((row) => (
            <LifecycleTransitionRow key={row.id} row={row} />
          ))}
        </ol>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ListCard
            title="Lifecycle operator guidance"
            items={detail.lifecycleReadiness.operatorGuidance}
          />
          <ListCard
            title="Lifecycle caveats"
            items={detail.lifecycleReadiness.caveats}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="package-definition-audit-timeline"
        eyebrow="Read-only audit evidence"
        title="Package Definition Audit Timeline"
        description="Audit evidence is visible for platform-admin inspection only. This section does not create, edit, approve, publish, deprecate, archive, assign, bill, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="platform-package-definition-audit-read-only-copy"
        >
          Read-only audit timeline generated{" "}
          {formatDateTime(detail.auditTimeline.generatedAt)}. No package
          create/edit/publish controls, no lifecycle or approval controls, no
          package assignment behavior, no billing/Stripe/subscription behavior,
          no entitlement/module/runtime behavior, and no contractor permission
          changes are available from this audit section.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detail.auditTimeline.summaryCards.map((card) => (
            <AuditSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">
            Event type counts
          </p>
          <div className="mt-3">
            <AuditBucketGrid buckets={detail.auditTimeline.eventTypeBuckets} />
          </div>
        </div>

        {detail.auditTimeline.eventRows.length > 0 ? (
          <ol className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {detail.auditTimeline.eventRows.map((row) => (
              <AuditEventRow key={row.id} row={row} />
            ))}
          </ol>
        ) : (
          <div
            className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
            data-testid="platform-package-definition-audit-empty-state"
          >
            No package definition audit events are recorded for this package.
            This is a safe empty audit state, not a prompt to create records,
            seed data, approve packages, publish versions, or infer runtime
            behavior.
          </div>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="package-definition-readiness"
        eyebrow="Read-only caveats"
        title="Catalog Readiness"
        description="These notes are safe operator guidance for package definition inspection only."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ListCard title="Operator guidance" items={detail.operatorGuidance} />
          <ListCard title="Caveats" items={detail.caveats} />
          <ListCard
            title="Audit guidance"
            items={detail.auditTimeline.operatorGuidance}
          />
          <ListCard
            title="Audit caveats"
            items={detail.auditTimeline.caveats}
          />
          <ListCard
            title="Lifecycle guidance"
            items={detail.lifecycleReadiness.operatorGuidance}
          />
          <ListCard
            title="Lifecycle caveats"
            items={detail.lifecycleReadiness.caveats}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
