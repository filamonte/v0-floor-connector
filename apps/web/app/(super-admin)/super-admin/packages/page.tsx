import Link from "next/link";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import {
  getContractorPackageBillingMappingReadModel,
  getContractorPackageBillingSupportReviewReadModel,
  getContractorPackageAssignmentReadModel,
  getPlatformPackageDefinitionCatalog,
  getPlatformPackageGovernance
} from "@/lib/platform-admin/data";
import type {
  ContractorPackageBillingSupportReviewBucket,
  ContractorPackageBillingSupportReviewEventRow,
  ContractorPackageBillingSupportReviewReadModelTone,
  ContractorPackageBillingSupportReviewRow,
  ContractorPackageBillingSupportReviewSummaryCard
} from "@/lib/platform-admin/contractor-package-billing-support-review-read-model-core";
import type {
  ContractorPackageBillingMappingAuditRow,
  ContractorPackageBillingMappingBucket,
  ContractorPackageBillingMappingReadModelTone,
  ContractorPackageBillingMappingRow,
  ContractorPackageBillingMappingSummaryCard
} from "@/lib/platform-admin/contractor-package-billing-mapping-read-model-core";
import type {
  ContractorPackageAssignmentAuditTimelineRow,
  ContractorPackageAssignmentReadModelBucket,
  ContractorPackageAssignmentReadModelRow,
  ContractorPackageAssignmentReadModelSummaryCard,
  ContractorPackageAssignmentReadModelTone
} from "@/lib/platform-admin/contractor-package-assignment-read-model-core";
import type {
  PlatformPackageDefinitionCatalogBucket,
  PlatformPackageDefinitionCatalogRow,
  PlatformPackageDefinitionCatalogSummaryCard,
  PlatformPackageDefinitionCatalogTone,
  PlatformPackageDefinitionVersionRow
} from "@/lib/platform-admin/package-definition-catalog-core";
import { buildPlatformPackageDefinitionPlanningModel } from "@/lib/platform-admin/package-definition-planning-core";
import type { PlatformPackagePlanningConcept } from "@/lib/platform-admin/package-definition-planning-core";
import type {
  PlatformPackageGovernanceBucket,
  PlatformPackageGovernanceSummaryCard,
  PlatformPackageGovernanceTenantRow,
  PlatformPackageGovernanceTone
} from "@/lib/platform-admin/package-governance-core";

const toneClasses: Record<PlatformPackageGovernanceTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const catalogToneClasses: Record<PlatformPackageDefinitionCatalogTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const assignmentToneClasses: Record<ContractorPackageAssignmentReadModelTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const providerMappingToneClasses: Record<
  ContractorPackageBillingMappingReadModelTone,
  string
> = assignmentToneClasses;

const supportReviewToneClasses: Record<
  ContractorPackageBillingSupportReviewReadModelTone,
  string
> = assignmentToneClasses;

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function SummaryCard({ card }: { card: PlatformPackageGovernanceSummaryCard }) {
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

function CatalogSummaryCard({
  card
}: {
  card: PlatformPackageDefinitionCatalogSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${catalogToneClasses[card.tone]}`}
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

function AssignmentSummaryCard({
  card
}: {
  card: ContractorPackageAssignmentReadModelSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${assignmentToneClasses[card.tone]}`}
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

function ProviderMappingSummaryCard({
  card
}: {
  card: ContractorPackageBillingMappingSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${providerMappingToneClasses[card.tone]}`}
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

function SupportReviewSummaryCard({
  card
}: {
  card: ContractorPackageBillingSupportReviewSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${supportReviewToneClasses[card.tone]}`}
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

function BucketGrid({ buckets }: { buckets: PlatformPackageGovernanceBucket[] }) {
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

function CatalogBucketGrid({
  buckets
}: {
  buckets: PlatformPackageDefinitionCatalogBucket[];
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

function AssignmentBucketGrid({
  buckets
}: {
  buckets: ContractorPackageAssignmentReadModelBucket[];
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

function ProviderMappingBucketGrid({
  buckets
}: {
  buckets: ContractorPackageBillingMappingBucket[];
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

function SupportReviewBucketGrid({
  buckets
}: {
  buckets: ContractorPackageBillingSupportReviewBucket[];
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

function PlanningConceptGrid({
  concepts
}: {
  concepts: PlatformPackagePlanningConcept[];
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {concepts.map((concept) => (
        <div
          key={concept.id}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">
              {concept.label}
            </p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {concept.classification.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {concept.futurePurpose}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {concept.currentBoundary}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlanningList({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
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

function TenantRow({ row }: { row: PlatformPackageGovernanceTenantRow }) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.9fr)_minmax(170px,0.8fr)_minmax(170px,0.8fr)_minmax(220px,1fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          {row.organizationLabel}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.tenantStatus} / {row.lifecycleState}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Package
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.planLabel}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Billing
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.billingSetupLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {row.subscriptionStatusLabel}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Activation
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.earlyAccessLabel}</p>
        {row.caveats.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
            {row.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function PackageDefinitionRow({ row }: { row: PlatformPackageDefinitionCatalogRow }) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(220px,1fr)_minmax(160px,0.7fr)_minmax(220px,1fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.displayName}</p>
        <p className="mt-1 text-xs text-slate-500">{row.packageKey}</p>
        <Link
          href={`/super-admin/packages/${row.id}`}
          className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
        >
          Open read-only detail
        </Link>
      </div>
      <div>
        <p className="text-sm leading-6 text-slate-700">{row.description}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {row.intendedAudience}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Lifecycle
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.status}</p>
        <p className="mt-1 text-xs text-slate-500">
          {row.versionCount} version{row.versionCount === 1 ? "" : "s"} /{" "}
          {row.publishedVersionCount} published
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Segment
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.segmentSummary}</p>
        {row.caveats.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
            {row.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function PackageVersionRow({ row }: { row: PlatformPackageDefinitionVersionRow }) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(160px,0.6fr)_minmax(240px,1fr)_minmax(220px,1fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.packageLabel}</p>
        <p className="mt-1 text-xs text-slate-500">{row.packageKey}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Version
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.versionLabel}</p>
        <p className="mt-1 text-xs text-slate-500">{row.status}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Commercial summary
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {row.commercialSummary}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Intent snapshots
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          {row.intentSummary.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function ContractorPackageAssignmentRow({
  row
}: {
  row: ContractorPackageAssignmentReadModelRow;
}) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(160px,0.6fr)_minmax(260px,1fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.companyLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {row.status} / {row.lifecycleState}
        </p>
        <Link
          href={`/super-admin/packages/assignments/${row.id}`}
          className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
        >
          Open read-only assignment detail
        </Link>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Package
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.packageLabel}</p>
        <p className="mt-1 text-xs text-slate-500">{row.versionLabel}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Timing
        </p>
        <p className="mt-2 text-sm text-slate-800">
          Effective {formatDateTime(row.effectiveAt)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Scheduled {formatDateTime(row.scheduledFor)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Safe summaries
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>{row.assignmentSnapshotSummary}</li>
          <li>{row.billingImpactSummary}</li>
          <li>{row.entitlementModuleImpactSummary}</li>
          <li>{row.starterPackImplicationSummary}</li>
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function ContractorPackageAssignmentAuditRow({
  row
}: {
  row: ContractorPackageAssignmentAuditTimelineRow;
}) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(200px,1fr)_minmax(260px,1.2fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.eventLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDateTime(row.occurredAt)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Operator evidence
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {row.reasonSummary}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {row.confirmationSummary}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Snapshot summaries
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>{row.beforeSnapshotSummary}</li>
          <li>{row.afterSnapshotSummary}</li>
          <li>{row.metadataSummary}</li>
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function ContractorPackageBillingMappingRow({
  row
}: {
  row: ContractorPackageBillingMappingRow;
}) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(170px,0.7fr)_minmax(190px,0.8fr)_minmax(230px,1fr)_minmax(260px,1.2fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.providerLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {row.providerEnvironmentLabel}
        </p>
        <p className="mt-2 break-all text-xs leading-5 text-slate-500">
          Mapping {row.id}
        </p>
        <Link
          href={`/super-admin/packages/provider-mappings/${row.id}`}
          className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
        >
          Open read-only provider mapping detail
        </Link>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Reconciliation
        </p>
        <p className="mt-2 text-sm text-slate-800">
          {row.billingState} / {row.reconciliationState}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Last verified {formatDateTime(row.lastVerifiedAt)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          References
        </p>
        <p className="mt-2 break-all text-sm text-slate-800">
          {row.subscriptionReferenceLabel}
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>Assignment: {row.assignmentId ?? "Missing assignment reference"}</li>
          <li>Company: {row.companyId ?? "Missing company reference"}</li>
          <li>Package: {row.packageDefinitionId ?? "Missing package reference"}</li>
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Safe summaries
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>{row.expectedProviderStateSummary}</li>
          <li>{row.observedProviderStateSummary}</li>
          <li>{row.mappingSnapshotSummary}</li>
          <li>{row.mismatchSummary}</li>
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function ContractorPackageBillingMappingAuditRow({
  row
}: {
  row: ContractorPackageBillingMappingAuditRow;
}) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(200px,1fr)_minmax(260px,1.2fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.eventLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDateTime(row.occurredAt)}
        </p>
        <p className="mt-2 break-all text-xs leading-5 text-slate-500">
          Mapping {row.mappingId ?? "Not recorded"}
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
          {row.eventType}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Snapshot summaries
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>{row.beforeSnapshotSummary}</li>
          <li>{row.afterSnapshotSummary}</li>
          <li>{row.metadataSummary}</li>
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function ContractorPackageBillingSupportReviewRow({
  row
}: {
  row: ContractorPackageBillingSupportReviewRow;
}) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(260px,1fr)_minmax(280px,1.2fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          {row.reviewStatus}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.resolutionCategory}
        </p>
        <p className="mt-2 break-all text-xs leading-5 text-slate-500">
          Review {row.id}
        </p>
        <Link
          href={`/super-admin/packages/support-reviews/${row.id}`}
          className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
        >
          Open read-only support review detail
        </Link>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Links
        </p>
        <p className="mt-2 break-all text-sm text-slate-800">
          Mapping {row.mappingId ?? "Not recorded"}
        </p>
        <p className="mt-1 break-all text-xs text-slate-500">
          Assignment {row.assignmentId ?? "Not recorded"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.providerEnvironmentLabel}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Support notes
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {row.supportSummary}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Blocker: {row.blockedReasonSummary}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Escalation: {row.escalationReasonSummary}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Evidence summaries
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>{row.providerReferenceSummary}</li>
          <li>{row.reconciliationEvidenceSummary}</li>
          <li>{row.webhookEvidenceSummary}</li>
          <li>{row.operatorEvidenceSummary}</li>
          <li>{row.rollbackRecoverySummary}</li>
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function ContractorPackageBillingSupportReviewEventRow({
  row
}: {
  row: ContractorPackageBillingSupportReviewEventRow;
}) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(200px,1fr)_minmax(260px,1.2fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{row.eventLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDateTime(row.occurredAt)}
        </p>
        <p className="mt-2 break-all text-xs leading-5 text-slate-500">
          Review {row.supportReviewId}
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
          {row.eventType}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Snapshot summaries
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          <li>{row.beforeSnapshotSummary}</li>
          <li>{row.afterSnapshotSummary}</li>
          <li>{row.metadataSummary}</li>
          {row.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default async function SuperAdminPackagesPage() {
  const [
    governance,
    packageDefinitionCatalog,
    contractorPackageAssignments,
    contractorPackageBillingMappings,
    contractorPackageBillingSupportReviews
  ] = await Promise.all([
    getPlatformPackageGovernance(),
    getPlatformPackageDefinitionCatalog(),
    getContractorPackageAssignmentReadModel(),
    getContractorPackageBillingMappingReadModel(),
    getContractorPackageBillingSupportReviewReadModel()
  ]);
  const packageDefinitionPlanning = buildPlatformPackageDefinitionPlanningModel();

  return (
    <div className="space-y-6" data-testid="platform-package-governance-page">
      <SuperAdminTopTabs
        tabs={[
          {
            href: "#package-billing-overview",
            label: "Overview",
            description: "Read-only package and billing counts"
          },
          {
            href: "#contractor-plan-state",
            label: "Plan state",
            description: "Existing subscription-plan records"
          },
          {
            href: "#billing-setup-readiness",
            label: "Billing",
            description: "Safe setup-readiness references"
          },
          {
            href: "#future-package-controls",
            label: "Future controls",
            description: "Not implemented here"
          },
          {
            href: "#future-package-definition-model",
            label: "Definition model",
            description: "Planning only, no enforcement"
          },
          {
            href: "#package-definition-catalog",
            label: "Catalog",
            description: "Read-only persisted definitions"
          },
          {
            href: "#contractor-package-assignments",
            label: "Assignments",
            description: "Read-only contractor assignments"
          },
          {
            href: "#provider-mapping-readiness",
            label: "Provider mapping",
            description: "Read-only reconciliation"
          },
          {
            href: "#provider-support-review-readiness",
            label: "Support review",
            description: "Read-only evidence"
          }
        ]}
      />

      <SettingsSectionCard
        id="package-billing-overview"
        eyebrow="Read-only governance"
        title="Package / Billing Overview"
        description="This Super Admin package governance foundation reads existing tenant, subscription-plan, and billing setup references only. It does not change billing, call Stripe, create charges or subscriptions, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="platform-package-read-only-copy"
        >
          Read-only view generated {formatDateTime(governance.generatedAt)}. No
          package, billing, Stripe, entitlement, module, permission, or runtime
          controls are available from this page.
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {governance.summaryCards.map((card) => (
            <SummaryCard key={card.id} card={card} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="contractor-plan-state"
        eyebrow="Existing records"
        title="Contractor Plan State"
        description="Plan state is inferred from current company subscription rows and their linked subscription plan names when those records exist."
        tone="neutral"
      >
        <BucketGrid buckets={governance.planBuckets} />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Tenant status
            </p>
            <div className="mt-3">
              <BucketGrid buckets={governance.tenantStatusBuckets} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Lifecycle state
            </p>
            <div className="mt-3">
              <BucketGrid buckets={governance.lifecycleBuckets} />
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="billing-setup-readiness"
        eyebrow="Billing setup readiness"
        title="Billing Setup Readiness"
        description="Billing setup readiness uses safe stored company references and safe configuration-presence checks only. This page does not inspect secret values and does not call Stripe."
        tone="neutral"
      >
        <BucketGrid buckets={governance.billingReadinessBuckets} />
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            Stripe setup notes
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {governance.stripeReadinessNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="early-access-activation-status"
        eyebrow="Activation status"
        title="Early-Access / Activation Status"
        description="Activation grouping is derived from existing company tenant status and lifecycle state fields."
        tone="neutral"
      >
        <BucketGrid buckets={governance.earlyAccessBuckets} />
        <ol className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {governance.tenantRows.map((row) => (
            <TenantRow key={row.id} row={row} />
          ))}
        </ol>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="future-package-controls"
        eyebrow="Not yet governed"
        title="Not Yet Governed / Future Package Controls"
        description="These are explicit boundaries for future package, billing, plan, entitlement, and module-control work. They are not implemented as controls on this page."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Operator guidance
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {governance.operatorGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Current caveats
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {governance.caveats.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Future controls
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {governance.futureControls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="future-package-definition-model"
        eyebrow="Planning model"
        title="Future Package Definition Model"
        description="This static planning model separates future package definitions, billing plans, module visibility, limits, entitlements, onboarding defaults, segmentation, provider mapping, trials, and custom contracts before any real package schema or enforcement exists."
        tone="neutral"
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Read-only planning output only. Package definition persistence exists
          for catalog inspection in this slice, but package mutation, package
          assignment, billing enforcement, entitlements, module gates,
          Stripe-backed subscription operations, permission changes,
          activation changes, and runtime behavior are not implemented here.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Read-only
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {packageDefinitionPlanning.readOnly ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Runtime enforcement
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {packageDefinitionPlanning.runtimeEnforcement ? "Enabled" : "Not implemented"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Mutation controls
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {packageDefinitionPlanning.mutationControlsAvailable
                ? "Available"
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <PlanningConceptGrid concepts={packageDefinitionPlanning.proposedDimensions} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Future lifecycle states
            </p>
            <div className="mt-3 space-y-3">
              {packageDefinitionPlanning.futureLifecycleStates.map((item) => (
                <div key={item.state}>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.state}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <PlanningList
            title="Future required approvals"
            items={packageDefinitionPlanning.futureRequiredApprovals}
          />
          <PlanningList
            title="Future data dependencies"
            items={packageDefinitionPlanning.futureDataDependencies}
          />
          <PlanningList
            title="Future enforcement boundaries"
            items={packageDefinitionPlanning.futureEnforcementBoundaries}
          />
        </div>

        <div className="mt-5">
          <PlanningList
            title="Risks and caveats"
            items={packageDefinitionPlanning.risksAndCaveats}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="package-definition-catalog"
        eyebrow="Read-only catalog"
        title="Package Definition Catalog"
        description="Persisted platform package definitions and versions are visible here for platform-admin inspection only. There are no package create, edit, publish, assign, billing, entitlement, module, runtime, or contractor-permission controls in this slice."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="platform-package-definition-catalog-read-only-copy"
        >
          Read-only catalog generated {formatDateTime(packageDefinitionCatalog.generatedAt)}.
          No package mutation UI, no package assignment behavior, no
          billing/Stripe/subscription behavior, no entitlement/module/runtime
          behavior, and no contractor permission changes are available from this
          section.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {packageDefinitionCatalog.summaryCards.map((card) => (
            <CatalogSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Definition lifecycle
            </p>
            <div className="mt-3">
              <CatalogBucketGrid buckets={packageDefinitionCatalog.definitionStatusBuckets} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Version lifecycle
            </p>
            <div className="mt-3">
              <CatalogBucketGrid buckets={packageDefinitionCatalog.versionStatusBuckets} />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-950">
            Catalog Readiness
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {packageDefinitionCatalog.catalogReadiness.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">
            Package Definitions
          </p>
          {packageDefinitionCatalog.definitionRows.length > 0 ? (
            <ol className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {packageDefinitionCatalog.definitionRows.map((row) => (
                <PackageDefinitionRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="platform-package-definition-empty-state"
            >
              No package definitions are recorded yet. This is an empty
              read-only catalog state, not a prompt to seed data or create
              packages from the browser.
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">
            Package Versions
          </p>
          {packageDefinitionCatalog.versionRows.length > 0 ? (
            <ol className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {packageDefinitionCatalog.versionRows.map((row) => (
                <PackageVersionRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="platform-package-definition-version-empty-state"
            >
              No package definition versions are recorded yet. Version snapshots
              remain empty and no package can be inferred as assignable,
              billable, entitled, module-enabled, or runtime-active from this
              catalog.
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PlanningList
            title="Operator guidance"
            items={packageDefinitionCatalog.operatorGuidance}
          />
          <PlanningList title="Read-only caveats" items={packageDefinitionCatalog.caveats} />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="contractor-package-assignments"
        eyebrow="Read-only assignments"
        title="Contractor Package Assignments"
        description="Platform-governed contractor package assignment records and audit evidence are visible here for inspection only. There are no assignment create, approve, schedule, activate, cancel, billing, entitlement, module, runtime, contractor-permission, or starter-pack controls in this slice."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-assignment-read-only-copy"
        >
          Read-only assignment model generated {formatDateTime(contractorPackageAssignments.generatedAt)}.
          No assignment create/approve/schedule/activate/cancel controls, no
          package assignment activation behavior, no billing/Stripe/subscription
          behavior, no entitlement/module/runtime behavior, and no contractor
          permission changes are available from this section.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contractorPackageAssignments.summaryCards.map((card) => (
            <AssignmentSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Assignment Readiness
            </p>
            <div className="mt-3">
              <PlanningList
                title="Read-only readiness"
                items={contractorPackageAssignments.assignmentReadiness}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Assignment lifecycle
            </p>
            <div className="mt-3">
              <AssignmentBucketGrid
                buckets={contractorPackageAssignments.assignmentStatusBuckets}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">
            Assignment Records
          </p>
          {contractorPackageAssignments.assignmentRows.length > 0 ? (
            <ol className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {contractorPackageAssignments.assignmentRows.map((row) => (
                <ContractorPackageAssignmentRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-assignment-empty-state"
            >
              No contractor package assignments are recorded yet. This is a
              read-only empty state; no assignment records are seeded, activated,
              scheduled, approved, canceled, or changed from the browser.
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Assignment Audit Evidence
            </p>
            <div className="mt-3">
              <AssignmentBucketGrid
                buckets={contractorPackageAssignments.auditEventTypeBuckets}
              />
            </div>
          </div>
          <div>
            <PlanningList
              title="Operator guidance"
              items={contractorPackageAssignments.operatorGuidance}
            />
          </div>
        </div>

        <div className="mt-5">
          {contractorPackageAssignments.auditTimelineRows.length > 0 ? (
            <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {contractorPackageAssignments.auditTimelineRows.map((row) => (
                <ContractorPackageAssignmentAuditRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-assignment-audit-empty-state"
            >
              No contractor package assignment audit evidence is recorded yet.
              The timeline renders safely without adding approval, activation,
              billing, entitlement, runtime, or package-assignment mutation
              behavior.
            </div>
          )}
        </div>

        <div className="mt-5">
          <PlanningList
            title="Read-only caveats"
            items={contractorPackageAssignments.caveats}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-mapping-readiness"
        eyebrow="Read-only provider mapping"
        title="Billing / Provider Mapping Readiness"
        description="Internal package-to-provider mapping references and reconciliation evidence are visible here for inspection only. There are no Stripe calls, subscription operations, billing execution, package assignment mutation, entitlement/module/runtime behavior, contractor permission changes, or provider mutation controls in this slice."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-billing-mapping-read-only-copy"
        >
          Read-only provider mapping model generated{" "}
          {formatDateTime(contractorPackageBillingMappings.generatedAt)}. No
          Stripe calls, no provider API calls, no subscription
          create/update/cancel behavior, no billing execution, no package
          assignment mutation, no entitlement/module/runtime behavior, and no
          contractor permission changes are available from this section.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contractorPackageBillingMappings.summaryCards.map((card) => (
            <ProviderMappingSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Provider buckets
            </p>
            <div className="mt-3">
              <ProviderMappingBucketGrid
                buckets={contractorPackageBillingMappings.providerBuckets}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Provider environments
            </p>
            <div className="mt-3">
              <ProviderMappingBucketGrid
                buckets={contractorPackageBillingMappings.environmentBuckets}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Billing state
            </p>
            <div className="mt-3">
              <ProviderMappingBucketGrid
                buckets={contractorPackageBillingMappings.billingStateBuckets}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Reconciliation state
            </p>
            <div className="mt-3">
              <ProviderMappingBucketGrid
                buckets={contractorPackageBillingMappings.reconciliationStateBuckets}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PlanningList
            title="Provider Reconciliation Inspection"
            items={contractorPackageBillingMappings.mismatchCaveats}
          />
          <PlanningList
            title="Operator guidance"
            items={contractorPackageBillingMappings.operatorGuidance}
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">
            Provider Mapping Rows
          </p>
          {contractorPackageBillingMappings.mappingRows.length > 0 ? (
            <ol className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {contractorPackageBillingMappings.mappingRows.map((row) => (
                <ContractorPackageBillingMappingRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-billing-mapping-empty-state"
            >
              No package billing/provider mapping rows are recorded yet. This
              read-only empty state does not call Stripe, create subscriptions,
              execute billing, mutate assignments, enforce entitlements, gate
              modules, change permissions, or seed provider mapping records.
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Provider Mapping Audit Evidence
            </p>
            <div className="mt-3">
              <ProviderMappingBucketGrid
                buckets={contractorPackageBillingMappings.auditEventTypeBuckets}
              />
            </div>
          </div>
          <PlanningList
            title="Read-only caveats"
            items={contractorPackageBillingMappings.caveats}
          />
        </div>

        <div className="mt-5">
          {contractorPackageBillingMappings.auditRows.length > 0 ? (
            <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {contractorPackageBillingMappings.auditRows.map((row) => (
                <ContractorPackageBillingMappingAuditRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-billing-mapping-audit-empty-state"
            >
              No package billing/provider mapping audit evidence is recorded
              yet. The timeline renders safely without adding Stripe,
              subscription, billing execution, entitlement, runtime,
              assignment-mutation, or provider-mutation behavior.
            </div>
          )}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-support-review-readiness"
        eyebrow="Read-only support review"
        title="Billing / Provider Support Review Readiness"
        description="Future billing/provider support-review evidence is visible here for inspection only. Support review is evidence and review only: there is no corrective-action execution, Stripe/provider call, subscription operation, billing execution, package assignment mutation, entitlement/module/runtime behavior, contractor permission change, reporting/export behavior, automation, or AI behavior in this slice."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-billing-support-review-read-only-copy"
        >
          Read-only support review model generated{" "}
          {formatDateTime(contractorPackageBillingSupportReviews.generatedAt)}.
          Support review is evidence/review only. No corrective-action
          execution, no Stripe/provider calls, no subscription operations, no
          billing execution, no package assignment mutation, no
          entitlement/module/runtime behavior, and no contractor permission
          changes are available from this section.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contractorPackageBillingSupportReviews.summaryCards.map((card) => (
            <SupportReviewSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Review status
            </p>
            <div className="mt-3">
              <SupportReviewBucketGrid
                buckets={contractorPackageBillingSupportReviews.reviewStatusBuckets}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Resolution category
            </p>
            <div className="mt-3">
              <SupportReviewBucketGrid
                buckets={
                  contractorPackageBillingSupportReviews.resolutionCategoryBuckets
                }
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Provider environment
            </p>
            <div className="mt-3">
              <SupportReviewBucketGrid
                buckets={
                  contractorPackageBillingSupportReviews.providerEnvironmentBuckets
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PlanningList
            title="Manual Resolution Readiness"
            items={contractorPackageBillingSupportReviews.attentionCaveats}
          />
          <PlanningList
            title="Operator guidance"
            items={contractorPackageBillingSupportReviews.operatorGuidance}
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">
            Support Review Evidence
          </p>
          {contractorPackageBillingSupportReviews.supportReviewRows.length > 0 ? (
            <ol className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {contractorPackageBillingSupportReviews.supportReviewRows.map((row) => (
                <ContractorPackageBillingSupportReviewRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-billing-support-review-empty-state"
            >
              No billing/provider support review rows are recorded yet. This
              read-only empty state does not execute corrective actions, call
              Stripe/providers, operate subscriptions, execute billing, mutate
              package assignments, enforce entitlements, gate modules, change
              contractor permissions, report/export, run automation/AI, or seed
              support review records.
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Support Review Event Evidence
            </p>
            <div className="mt-3">
              <SupportReviewBucketGrid
                buckets={
                  contractorPackageBillingSupportReviews.supportReviewEventTypeBuckets
                }
              />
            </div>
          </div>
          <PlanningList
            title="Read-only caveats"
            items={contractorPackageBillingSupportReviews.caveats}
          />
        </div>

        <div className="mt-5">
          {contractorPackageBillingSupportReviews.supportReviewEventRows.length > 0 ? (
            <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {contractorPackageBillingSupportReviews.supportReviewEventRows.map(
                (row) => (
                  <ContractorPackageBillingSupportReviewEventRow
                    key={row.id}
                    row={row}
                  />
                )
              )}
            </ol>
          ) : (
            <div
              className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-billing-support-review-event-empty-state"
            >
              No billing/provider support review event evidence is recorded
              yet. The timeline renders safely without adding corrective-action
              execution, Stripe/provider calls, subscription operations, billing
              execution, entitlement/module/runtime behavior,
              package-assignment mutation, or provider-mutation behavior.
            </div>
          )}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
