import Link from "next/link";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import { getContractorPackageAssignmentDetail } from "@/lib/platform-admin/data";
import type {
  ContractorPackageAssignmentActivationReadinessSummaryCard,
  ContractorPackageAssignmentActivationReadinessTone,
  ContractorPackageAssignmentActivationReadinessTransition
} from "@/lib/platform-admin/contractor-package-assignment-activation-readiness-core";
import type {
  ContractorPackageAssignmentDetailAuditRow,
  ContractorPackageAssignmentDetailSnapshotSection,
  ContractorPackageAssignmentDetailSummaryCard,
  ContractorPackageAssignmentDetailTone
} from "@/lib/platform-admin/contractor-package-assignment-detail-core";

type SuperAdminPackageAssignmentDetailPageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

const toneClasses: Record<ContractorPackageAssignmentDetailTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

const readinessToneClasses: Record<
  ContractorPackageAssignmentActivationReadinessTone,
  string
> = toneClasses;

const readinessStatusClasses: Record<
  ContractorPackageAssignmentActivationReadinessTransition["status"],
  string
> = {
  eligible: "border-emerald-200 bg-emerald-50 text-emerald-800",
  blocked: "border-amber-200 bg-amber-50 text-amber-800",
  unavailable: "border-slate-200 bg-slate-50 text-slate-600",
  already_in_state: "border-sky-200 bg-sky-50 text-sky-800",
  advisory: "border-indigo-200 bg-indigo-50 text-indigo-800"
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
  card: ContractorPackageAssignmentDetailSummaryCard;
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

function ReadinessSummaryCard({
  card
}: {
  card: ContractorPackageAssignmentActivationReadinessSummaryCard;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessToneClasses[card.tone]}`}
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

function SnapshotSection({
  section
}: {
  section: ContractorPackageAssignmentDetailSnapshotSection;
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

function AuditRow({ row }: { row: ContractorPackageAssignmentDetailAuditRow }) {
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

function ReadinessTransitionRow({
  row
}: {
  row: ContractorPackageAssignmentActivationReadinessTransition;
}) {
  return (
    <li className="border-t border-slate-200 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(180px,0.8fr)_minmax(220px,1fr)_minmax(260px,1.2fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-950">{row.label}</p>
          <p className="mt-1 text-xs text-slate-500">
            {row.fromState} -&gt; {row.toState}
          </p>
          <span
            className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessStatusClasses[row.status]}`}
          >
            {row.status.replaceAll("_", " ")}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Blocking reasons
          </p>
          {row.reasons.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
              {row.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No blockers are modeled for this future transition.
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Advisory notes
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
            {row.advisoryReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
            <li>No action, mutation, billing, entitlement, runtime, contractor permission, or assignment write is available.</li>
          </ul>
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

export default async function SuperAdminPackageAssignmentDetailPage({
  params
}: SuperAdminPackageAssignmentDetailPageProps) {
  const { assignmentId } = await params;
  const detail = await getContractorPackageAssignmentDetail(assignmentId);

  return (
    <div
      className="space-y-6"
      data-testid="contractor-package-assignment-detail-page"
    >
      <SuperAdminTopTabs
        tabs={[
          {
            href: "/super-admin/packages#contractor-package-assignments",
            label: "Assignments",
            description: "Back to read-only assignments"
          },
          {
            href: "#assignment-summary",
            label: "Summary",
            description: "Assignment metadata"
          },
          {
            href: "#assignment-snapshots",
            label: "Snapshots",
            description: "Safe summarized fields"
          },
          {
            href: "#assignment-audit-timeline",
            label: "Audit",
            description: "Read-only audit evidence"
          },
          {
            href: "#assignment-activation-readiness",
            label: "Activation",
            description: "Future transition inspection"
          },
          {
            href: "#assignment-readiness",
            label: "Readiness",
            description: "Caveats and guidance"
          }
        ]}
      />

      <SettingsSectionCard
        id="assignment-summary"
        eyebrow="Read-only assignment detail"
        title={detail.companyLabel}
        description="This Super Admin assignment detail view inspects one contractor package assignment and its audit evidence only. It does not create, approve, schedule, activate, cancel, supersede, archive, bill, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-assignment-detail-read-only-copy"
        >
          <Link
            href="/super-admin/packages#contractor-package-assignments"
            className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Back to Contractor Package Assignments
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          Read-only assignment detail generated {formatDateTime(detail.generatedAt)}.
          No assignment create/approve/schedule/activate/cancel controls, no
          package assignment activation behavior, no billing/Stripe/subscription
          behavior, no entitlement/module/runtime behavior, and no contractor
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
              Contractor and package
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Company
                </dt>
                <dd className="mt-1">{detail.companyLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Package definition
                </dt>
                <dd className="mt-1">{detail.packageDefinitionLabel}</dd>
                <dd className="mt-1 text-xs text-slate-500">
                  {detail.packageDefinitionKey}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Package version
                </dt>
                <dd className="mt-1">{detail.packageDefinitionVersionLabel}</dd>
                <dd className="mt-1 text-xs text-slate-500">
                  {detail.packageDefinitionVersionStatus}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Assignment lifecycle
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Status / lifecycle
                </dt>
                <dd className="mt-1">
                  {detail.status} / {detail.lifecycleState}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Assignment id
                </dt>
                <dd className="mt-1 break-all">{detail.assignmentId}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Company id
                </dt>
                <dd className="mt-1 break-all">
                  {detail.companyId ?? "Not available"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Effective", detail.effectiveAt],
            ["Scheduled", detail.scheduledFor],
            ["Activated", detail.activatedAt],
            ["Archived", detail.archivedAt]
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-sm text-slate-800">
                {formatDateTime(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Supersession context
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Supersedes
                </dt>
                <dd className="mt-1 break-all">
                  {detail.supersedesAssignmentId ?? "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Superseded by
                </dt>
                <dd className="mt-1 break-all">
                  {detail.supersededByAssignmentId ?? "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Supersession reason
                </dt>
                <dd className="mt-1">{detail.supersessionReasonSummary}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Cancellation / contract context
            </p>
            <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Canceled
                </dt>
                <dd className="mt-1">{formatDateTime(detail.canceledAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Cancellation reason
                </dt>
                <dd className="mt-1">{detail.cancellationReasonSummary}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Grandfathered / custom
                </dt>
                <dd className="mt-1">
                  {detail.grandfatheredContract ? "Grandfathered" : "Not grandfathered"} /{" "}
                  {detail.customContractLabel}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="assignment-snapshots"
        eyebrow="Safe summaries"
        title="Assignment Snapshot Summaries"
        description="Snapshot fields are summarized by top-level keys only. They are not raw provider payloads, secret storage, runtime entitlement truth, billing instructions, or starter-pack provisioning instructions."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {detail.snapshotSections.map((section) => (
            <SnapshotSection key={section.key} section={section} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="assignment-audit-timeline"
        eyebrow="Read-only audit evidence"
        title="Assignment Audit Timeline"
        description="Audit evidence is visible for platform-admin inspection only. This section does not approve, schedule, activate, cancel, supersede, archive, bill, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
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
            data-testid="contractor-package-assignment-detail-audit-empty-state"
          >
            No contractor package assignment audit evidence is recorded for this
            assignment. This is a safe empty audit state, not a prompt to create,
            approve, schedule, activate, cancel, bill, enforce entitlements, gate
            modules, change permissions, or seed data.
          </div>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        id="assignment-activation-readiness"
        eyebrow="Future transition inspection"
        title="Assignment Activation Readiness"
        description="These read-only checks explain future assignment approval, scheduling, activation, cancellation, supersession, and archive readiness. They do not expose controls, server actions, billing behavior, entitlement behavior, module gates, contractor permission changes, or runtime effects."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
          data-testid="contractor-package-assignment-activation-readiness-read-only-copy"
        >
          Future checks only. No assignment create/approve/schedule/activate/cancel
          controls, no package assignment activation behavior, no billing/Stripe/subscription
          behavior, no entitlement/module/runtime behavior, no contractor permission
          changes, and no package assignment writes are available.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detail.activationReadiness.summaryCards.map((card) => (
            <ReadinessSummaryCard key={card.id} card={card} />
          ))}
        </div>

        <ol
          className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white"
          data-testid="contractor-package-assignment-activation-readiness"
        >
          {detail.activationReadiness.transitions.map((row) => (
            <ReadinessTransitionRow key={row.id} row={row} />
          ))}
        </ol>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="assignment-readiness"
        eyebrow="Read-only caveats"
        title="Assignment Readiness"
        description="These notes are safe operator guidance for assignment inspection only."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ListCard title="Operator guidance" items={detail.operatorGuidance} />
          <ListCard title="Caveats" items={detail.caveats} />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
