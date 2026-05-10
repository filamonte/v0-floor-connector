import Link from "next/link";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import { getContractorPackageBillingSupportReviewDetail } from "@/lib/platform-admin/data";
import type {
  ContractorPackageBillingSupportReviewDetailEventRow,
  ContractorPackageBillingSupportReviewDetailEvidenceSection,
  ContractorPackageBillingSupportReviewDetailReference,
  ContractorPackageBillingSupportReviewDetailSummaryCard,
  ContractorPackageBillingSupportReviewDetailTone
} from "@/lib/platform-admin/contractor-package-billing-support-review-detail-core";

type SuperAdminSupportReviewDetailPageProps = {
  params: Promise<{
    supportReviewId: string;
  }>;
};

const toneClasses: Record<ContractorPackageBillingSupportReviewDetailTone, string> = {
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

function SummaryCard({
  card
}: {
  card: ContractorPackageBillingSupportReviewDetailSummaryCard;
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

function ReferenceCard({
  title,
  reference
}: {
  title: string;
  reference: ContractorPackageBillingSupportReviewDetailReference;
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

function EvidenceSection({
  section
}: {
  section: ContractorPackageBillingSupportReviewDetailEvidenceSection;
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

function EventRow({
  row
}: {
  row: ContractorPackageBillingSupportReviewDetailEventRow;
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

export default async function SuperAdminSupportReviewDetailPage({
  params
}: SuperAdminSupportReviewDetailPageProps) {
  const { supportReviewId } = await params;
  const detail = await getContractorPackageBillingSupportReviewDetail(
    supportReviewId
  );

  return (
    <div
      className="space-y-6"
      data-testid="contractor-package-billing-support-review-detail-page"
    >
      <SuperAdminTopTabs
        tabs={[
          {
            href: "/super-admin/packages#provider-support-review-readiness",
            label: "Support Reviews",
            description: "Back to read-only support evidence"
          },
          {
            href: "#support-review-summary",
            label: "Summary",
            description: "Review status and category"
          },
          {
            href: "#support-review-references",
            label: "References",
            description: "Linked read-only records"
          },
          {
            href: "#support-review-evidence",
            label: "Evidence",
            description: "Safe summarized fields"
          },
          {
            href: "#support-review-event-timeline",
            label: "Events",
            description: "Read-only event evidence"
          },
          {
            href: "#support-review-caveats",
            label: "Caveats",
            description: "Guidance and boundaries"
          }
        ]}
      />

      <SettingsSectionCard
        id="support-review-summary"
        eyebrow="Read-only support review detail"
        title={detail.found ? detail.reviewStatus : "Support review unavailable"}
        description="This Super Admin support review detail view inspects one billing/provider support review and its event evidence only. Support review is evidence/review only. This view does not execute corrective actions, call Stripe or providers, operate subscriptions, execute billing, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-billing-support-review-detail-read-only-copy"
        >
          <Link
            href="/super-admin/packages#provider-support-review-readiness"
            className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Back to Billing / Provider Support Review Readiness
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          Read-only support review detail generated{" "}
          {formatDateTime(detail.generatedAt)}. No corrective-action execution,
          no Stripe/provider calls, no subscription operations, no billing
          execution, no package assignment mutation, no entitlement/module/runtime
          behavior, and no contractor permission changes are available here.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detail.summaryCards.map((card) => (
            <SummaryCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Review classification
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Status / category
                </dt>
                <dd className="mt-1">
                  {detail.reviewStatus} / {detail.resolutionCategory}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Provider environment
                </dt>
                <dd className="mt-1">{detail.providerEnvironment}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Support review id
                </dt>
                <dd className="mt-1 break-all">{detail.supportReviewId}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Support notes
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Support summary
                </dt>
                <dd className="mt-1">{detail.supportSummary}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Blocked / escalation
                </dt>
                <dd className="mt-1">
                  {detail.blockedReasonSummary} / {detail.escalationReasonSummary}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="support-review-references"
        eyebrow="Read-only references"
        title="Linked Provider Mapping, Assignment, Company, Package, and Version"
        description="Linked records are shown for context only. Provider references are not business truth, payment methods, raw provider payloads, secrets, provider truth, or billing execution instructions."
        tone="neutral"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ReferenceCard
            title="Provider mapping"
            reference={detail.providerMappingReference}
          />
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
            Review timestamps
          </p>
          <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Created
              </dt>
              <dd className="mt-1">{formatDateTime(detail.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Updated
              </dt>
              <dd className="mt-1">{formatDateTime(detail.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Archived
              </dt>
              <dd className="mt-1">{formatDateTime(detail.archivedAt)}</dd>
            </div>
          </dl>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="support-review-evidence"
        eyebrow="Safe evidence summaries"
        title="Provider, Reconciliation, Webhook, Operator, and Recovery Evidence"
        description="Support review evidence is summarized by top-level keys only. It is not raw provider payload storage, secret storage, payment detail storage, billing execution instruction, entitlement truth, module truth, or runtime truth."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {detail.evidenceSections.map((section) => (
            <EvidenceSection key={section.key} section={section} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="support-review-event-timeline"
        eyebrow="Read-only event evidence"
        title="Support Review Event Timeline"
        description="Support review events are visible for platform-admin inspection only. This section does not execute corrective actions, call Stripe or providers, operate subscriptions, execute billing, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        {detail.eventTimelineRows.length > 0 ? (
          <ol className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {detail.eventTimelineRows.map((row) => (
              <EventRow key={row.id} row={row} />
            ))}
          </ol>
        ) : (
          <div
            className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
            data-testid="contractor-package-billing-support-review-detail-events-empty-state"
          >
            No billing/provider support review event evidence is recorded for
            this review. This is a safe empty event state, not a prompt to call
            Stripe or providers, operate subscriptions, execute billing, mutate
            assignments, enforce entitlements, gate modules, change permissions,
            or seed support review data.
          </div>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="support-review-caveats"
        eyebrow="Read-only caveats"
        title="Support Review Inspection Boundaries"
        description="These notes are safe operator guidance for billing/provider support-review evidence inspection only."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <ListCard
            title="Blocked / escalation caveats"
            items={detail.blockedEscalationCaveats}
          />
          <ListCard title="Operator guidance" items={detail.operatorGuidance} />
          <ListCard title="Caveats" items={detail.caveats} />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
