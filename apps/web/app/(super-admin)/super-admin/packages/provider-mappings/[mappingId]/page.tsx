import Link from "next/link";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import {
  getContractorPackageBillingMappingDetail,
  getContractorPackageBillingSupportReviewReadModelForMapping
} from "@/lib/platform-admin/data";
import type {
  ContractorPackageBillingMappingDetailAuditRow,
  ContractorPackageBillingMappingDetailReference,
  ContractorPackageBillingMappingDetailSnapshotSection,
  ContractorPackageBillingMappingDetailSummaryCard,
  ContractorPackageBillingMappingDetailTone
} from "@/lib/platform-admin/contractor-package-billing-mapping-detail-core";
import type {
  ContractorPackageBillingSupportReviewBucket,
  ContractorPackageBillingSupportReviewReadModelTone,
  ContractorPackageBillingSupportReviewRow,
  ContractorPackageBillingSupportReviewSummaryCard
} from "@/lib/platform-admin/contractor-package-billing-support-review-read-model-core";

type SuperAdminProviderMappingDetailPageProps = {
  params: Promise<{
    mappingId: string;
  }>;
};

const toneClasses: Record<ContractorPackageBillingMappingDetailTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const supportReviewToneClasses: Record<
  ContractorPackageBillingSupportReviewReadModelTone,
  string
> = toneClasses;

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function SummaryCard({
  card
}: {
  card: ContractorPackageBillingMappingDetailSummaryCard;
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
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {card.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
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

function ReferenceCard({
  title,
  reference
}: {
  title: string;
  reference: ContractorPackageBillingMappingDetailReference;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">
        {reference.label}
      </p>
      <p className="mt-2 break-all text-xs leading-5 text-slate-500">
        {reference.secondaryLabel}
      </p>
    </div>
  );
}

function SnapshotSection({
  section
}: {
  section: ContractorPackageBillingMappingDetailSnapshotSection;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{section.label}</p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {section.state}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {section.summary}
      </p>
    </div>
  );
}

function AuditRow({
  row
}: {
  row: ContractorPackageBillingMappingDetailAuditRow;
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
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Operator evidence
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {row.reasonSummary}
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
            {[row.beforeSnapshotSummary, row.afterSnapshotSummary, row.metadataSummary].map(
              (summary) => (
                <p
                  key={summary}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500"
                >
                  {summary}
                </p>
              )
            )}
          </div>
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

function SupportReviewRow({
  row
}: {
  row: ContractorPackageBillingSupportReviewRow;
}) {
  return (
    <li className="border-t border-slate-200 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(170px,0.7fr)_minmax(240px,1fr)_minmax(280px,1.2fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {row.reviewStatus}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {row.resolutionCategory}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {row.providerEnvironmentLabel}
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
            Support review notes
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
            Safe evidence summaries
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
      </div>
    </li>
  );
}

export default async function SuperAdminProviderMappingDetailPage({
  params
}: SuperAdminProviderMappingDetailPageProps) {
  const { mappingId } = await params;
  const [detail, supportReviews] = await Promise.all([
    getContractorPackageBillingMappingDetail(mappingId),
    getContractorPackageBillingSupportReviewReadModelForMapping(mappingId)
  ]);

  return (
    <div
      className="space-y-6"
      data-testid="contractor-package-billing-mapping-detail-page"
    >
      <SuperAdminTopTabs
        tabs={[
          {
            href: "/super-admin/packages#provider-mapping-readiness",
            label: "Provider Mappings",
            description: "Back to read-only mapping readiness"
          },
          {
            href: "#provider-mapping-summary",
            label: "Summary",
            description: "Mapping and reconciliation state"
          },
          {
            href: "#provider-mapping-references",
            label: "References",
            description: "Linked records and provider refs"
          },
          {
            href: "#provider-mapping-snapshots",
            label: "Snapshots",
            description: "Safe summarized fields"
          },
          {
            href: "#provider-mapping-audit-timeline",
            label: "Audit",
            description: "Read-only audit evidence"
          },
          {
            href: "#provider-mapping-support-review-readiness",
            label: "Support review",
            description: "Read-only evidence"
          },
          {
            href: "#provider-mapping-readiness",
            label: "Caveats",
            description: "Guidance and boundaries"
          }
        ]}
      />

      <SettingsSectionCard
        id="provider-mapping-summary"
        eyebrow="Read-only provider mapping detail"
        title={detail.found ? detail.billingProvider : "Provider mapping unavailable"}
        description="This Super Admin provider mapping detail view inspects one package billing/provider mapping and its audit evidence only. Provider references are not business truth. This view does not call Stripe or providers, operate subscriptions, execute billing, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-billing-mapping-detail-read-only-copy"
        >
          <Link
            href="/super-admin/packages#provider-mapping-readiness"
            className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Back to Billing / Provider Mapping Readiness
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          Read-only provider mapping detail generated{" "}
          {formatDateTime(detail.generatedAt)}. No Stripe/provider calls, no
          subscription operations, no billing execution, no package assignment
          mutation, no entitlement/module/runtime behavior, and no contractor
          permission changes are available from this detail view.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detail.summaryCards.map((card) => (
            <SummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Billing / reconciliation state
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Provider / environment
                </dt>
                <dd className="mt-1">
                  {detail.billingProvider} / {detail.providerEnvironment}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Billing / reconciliation
                </dt>
                <dd className="mt-1">
                  {detail.billingState} / {detail.reconciliationState}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Mapping id
                </dt>
                <dd className="mt-1 break-all">{detail.mappingId}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Verification metadata
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Last verified
                </dt>
                <dd className="mt-1">{formatDateTime(detail.lastVerifiedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Created / updated
                </dt>
                <dd className="mt-1">
                  {formatDateTime(detail.createdAt)} /{" "}
                  {formatDateTime(detail.updatedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Archived
                </dt>
                <dd className="mt-1">{formatDateTime(detail.archivedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-mapping-references"
        eyebrow="Read-only references"
        title="Linked Records and Provider References"
        description="Linked records are shown for context only. Provider customer, product, price, subscription, and subscription-item values are references, not payment methods, raw provider payloads, secrets, provider truth, or billing execution instructions."
        tone="neutral"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReferenceCard title="Assignment" reference={detail.assignmentReference} />
          <ReferenceCard title="Company" reference={detail.companyReference} />
          <ReferenceCard
            title="Package definition"
            reference={detail.packageDefinitionReference}
          />
          <ReferenceCard
            title="Package version"
            reference={detail.packageDefinitionVersionReference}
          />
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-950">
            Provider reference labels
          </p>
          <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
            {[
              ["Customer reference", detail.providerCustomerReferenceLabel],
              ["Product reference", detail.providerProductReferenceLabel],
              ["Price reference", detail.providerPriceReferenceLabel],
              ["Subscription reference", detail.providerSubscriptionReferenceLabel],
              [
                "Subscription item reference",
                detail.providerSubscriptionItemReferenceLabel
              ],
              ["Trial / early access", detail.trialOrEarlyAccessState],
              [
                "Custom / grandfathered marker",
                detail.customOrGrandfatheredTermsMarker
              ]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-mapping-snapshots"
        eyebrow="Safe summaries"
        title="Expected vs Observed Provider State"
        description="Expected, observed, and mapping snapshots are summarized by top-level keys only. They are not raw provider payloads, secrets, payment details, billing execution instructions, entitlement truth, module truth, or runtime truth."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {detail.snapshotSections.map((section) => (
            <SnapshotSection key={section.key} section={section} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-mapping-audit-timeline"
        eyebrow="Read-only audit evidence"
        title="Provider Mapping Audit Timeline"
        description="Audit evidence is visible for platform-admin inspection only. This section does not call Stripe or providers, operate subscriptions, execute billing, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        {detail.auditTimelineRows.length > 0 ? (
          <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {detail.auditTimelineRows.map((row) => (
              <AuditRow key={row.id} row={row} />
            ))}
          </ol>
        ) : (
          <div
            className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
            data-testid="contractor-package-billing-mapping-detail-audit-empty-state"
          >
            No package billing/provider mapping audit evidence is recorded for
            this mapping. This is a safe empty audit state, not a prompt to call
            Stripe or providers, operate subscriptions, execute billing, mutate
            assignments, enforce entitlements, gate modules, change permissions,
            or seed provider mapping data.
          </div>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-mapping-support-review-readiness"
        eyebrow="Read-only support review"
        title="Support Review Evidence"
        description="Support reviews linked to this provider mapping are visible for inspection only. This section does not execute corrective actions, call Stripe/providers, operate subscriptions, execute billing, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-billing-mapping-detail-support-review-copy"
        >
          Read-only support review summary generated{" "}
          {formatDateTime(supportReviews.generatedAt)}. Support review is
          evidence/review only: no corrective-action execution, no
          Stripe/provider calls, no subscription operations, no billing
          execution, no package assignment mutation, no entitlement/module/runtime
          behavior, and no contractor permission changes are available here.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {supportReviews.summaryCards.map((card) => (
            <SupportReviewSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Review status
            </p>
            <div className="mt-3">
              <SupportReviewBucketGrid buckets={supportReviews.reviewStatusBuckets} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Resolution category
            </p>
            <div className="mt-3">
              <SupportReviewBucketGrid
                buckets={supportReviews.resolutionCategoryBuckets}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ListCard
            title="Manual resolution readiness"
            items={supportReviews.attentionCaveats}
          />
          <ListCard title="Operator guidance" items={supportReviews.operatorGuidance} />
        </div>

        <div className="mt-5">
          {supportReviews.supportReviewRows.length > 0 ? (
            <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {supportReviews.supportReviewRows.map((row) => (
                <SupportReviewRow key={row.id} row={row} />
              ))}
            </ol>
          ) : (
            <div
              className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              data-testid="contractor-package-billing-mapping-detail-support-review-empty-state"
            >
              No billing/provider support reviews are recorded for this mapping.
              This safe empty state does not execute corrective actions, call
              Stripe/providers, operate subscriptions, execute billing, mutate
              assignments, enforce entitlements, gate modules, change
              permissions, or seed support review records.
            </div>
          )}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="provider-mapping-readiness"
        eyebrow="Read-only caveats"
        title="Provider Reconciliation Inspection"
        description="These notes are safe operator guidance for provider mapping inspection only."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <ListCard title="Mismatch caveats" items={detail.mismatchCaveats} />
          <ListCard title="Operator guidance" items={detail.operatorGuidance} />
          <ListCard title="Caveats" items={detail.caveats} />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
