import Link from "next/link";
import type { ReactNode } from "react";

import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { AppEmptyState } from "@/components/app-empty-state";
import type { SharedEvidenceReceiptRollup } from "@/lib/portal-evidence-grants/receipt-rollup";
import type {
  PortalEvidenceSharingItem,
  ProjectPortalEvidenceSharingSummary
} from "@/lib/portal-evidence-grants/summary";
import type {
  ProjectEvidenceContinuityDocumentTone,
  ProjectEvidenceContinuitySummary,
  ProjectEvidenceContinuityTimelineType,
  ProjectEvidenceContinuityTone
} from "@/lib/projects/evidence-continuity";
import type {
  ProofCenterItemTone,
  ProofCenterSummary,
  ProofCenterTone
} from "@/lib/proofcenter/summary";

const projectWorkspacePanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]";

const projectWorkspacePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]";

export type ProjectProofCenterSectionProps = {
  summary: ProofCenterSummary;
};

export type ProjectEvidenceContinuitySectionProps = {
  summary: ProjectEvidenceContinuitySummary;
  portalSharing: ProjectPortalEvidenceSharingSummary;
  receiptRollup: SharedEvidenceReceiptRollup;
  receiptPrintHref: string;
  renderPortalEvidenceAction: (item: PortalEvidenceSharingItem) => ReactNode;
};

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not marked yet";
}

function getProofCenterToneClassName(tone: ProofCenterTone) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "missing":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

function getProofCenterItemClassName(tone: ProofCenterItemTone) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "missing":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function getProofCenterStatusLabel(tone: ProofCenterTone) {
  switch (tone) {
    case "ready":
      return "Proof connected";
    case "attention":
      return "Needs review";
    case "missing":
      return "Proof missing";
    case "neutral":
      return "Building proof";
  }
}

function getEvidenceContinuityToneClassName(
  tone: ProjectEvidenceContinuityTone
) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

function getEvidenceDocumentToneClassName(
  tone: ProjectEvidenceContinuityDocumentTone
) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "missing":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function getEvidenceTimelineLabel(type: ProjectEvidenceContinuityTimelineType) {
  switch (type) {
    case "document":
      return "Document";
    case "field":
      return "Field proof";
    case "archive":
      return "Archived proof";
    case "closeout":
      return "Closeout";
  }
}

export function ProjectProofCenterSection({
  summary
}: ProjectProofCenterSectionProps) {
  const countTiles = [
    {
      label: "Commercial",
      value: `${summary.counts.estimates} estimates / ${summary.counts.contracts} contracts`
    },
    {
      label: "Signed",
      value: `${summary.counts.signedContracts} contracts`
    },
    {
      label: "Billing",
      value: `${summary.counts.invoices} invoices / ${summary.counts.paymentTrailItems} events`
    },
    {
      label: "Field proof",
      value: `${summary.counts.dailyJobLogs} logs / ${summary.counts.evidenceItems} files`
    },
    {
      label: "Customer Access",
      value: `${summary.counts.customerAccessItems} contacts`
    }
  ];

  return (
    <section id="proofcenter" className={projectWorkspacePanelClassName}>
      <div
        className={`${projectWorkspacePanelHeaderClassName} px-4 py-4 sm:px-5`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              Proof Center
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Project document and evidence index
            </h3>
            <p className="mt-2 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
              {summary.primaryMessage}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                getProofCenterToneClassName(summary.proofTone)
              ].join(" ")}
            >
              {getProofCenterStatusLabel(summary.proofTone)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              Proof Next Move
            </span>
            <Link
              href={summary.nextMove.href}
              className={primaryActionClassName}
            >
              {summary.nextMove.label}
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            {summary.nextMove.reason}
          </p>
          {summary.missingProofItems.length > 0 ? (
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {summary.missingProofItems.slice(0, 2).map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-5">
        {summary.sections.map((section) => (
          <article key={section.id} className="bg-white px-4 py-4 sm:px-5">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              {section.title}
            </h4>
            <div className="mt-3 grid gap-3">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    "rounded-lg border px-3 py-3 text-sm leading-6 transition hover:border-[var(--copper)] hover:bg-white",
                    getProofCenterItemClassName(item.tone)
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{item.label}</p>
                    <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 opacity-80">
                    {item.detail}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-[var(--border-warm)] px-4 py-3 sm:px-5">
        <div className="grid gap-3 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-2 lg:grid-cols-5">
          {countTiles.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
            >
              <p className="font-semibold uppercase tracking-[0.14em]">
                {item.label}
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectEvidenceContinuitySection({
  summary,
  portalSharing,
  receiptRollup,
  receiptPrintHref,
  renderPortalEvidenceAction
}: ProjectEvidenceContinuitySectionProps) {
  const countTiles = [
    {
      label: "Active evidence",
      value: `${summary.counts.activeEvidence} files`,
      detail: `${summary.counts.photos} photos / ${summary.counts.pdfs} PDFs`
    },
    {
      label: "Archived evidence",
      value: `${summary.counts.archivedEvidence} items`,
      detail: "Internal review only"
    },
    {
      label: "Field records",
      value: `${summary.counts.dailyLogs} logs / ${summary.counts.fieldNotes} notes`,
      detail: `${summary.counts.unresolvedFieldNotes} unresolved`
    },
    {
      label: "Customer-safe",
      value: `${summary.counts.customerSafeRecords} records`,
      detail: "Requires explicit access"
    },
    {
      label: "Closeout docs",
      value: `${summary.counts.closeoutDocuments} items`,
      detail: "Warranty/service handoff"
    }
  ];

  return (
    <section id="project-evidence" className={projectWorkspacePanelClassName}>
      <div
        className={`${projectWorkspacePanelHeaderClassName} px-4 py-4 sm:px-5`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              Project Evidence
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Evidence, documents, and closeout continuity
            </h3>
            <p className="mt-2 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
              {summary.primaryMessage}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                getEvidenceContinuityToneClassName(summary.tone)
              ].join(" ")}
            >
              {summary.statusLabel}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              Evidence Next Move
            </span>
            <Link
              href={summary.nextMove.href}
              className={primaryActionClassName}
            >
              {summary.nextMove.label}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">
              {summary.nextMove.reason}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                summary.boundary.customerSafeLabel,
                summary.boundary.internalEvidenceLabel,
                summary.boundary.archiveLabel
              ].map((item) => (
                <p
                  key={item}
                  className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-xs leading-5"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              Office review
            </p>
            {summary.officeReviewItems.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-[var(--text-secondary)]">
                {summary.officeReviewItems.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-xs leading-5"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                No evidence or closeout review blockers are showing from the
                current records.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-[var(--border-warm)] px-4 py-4 sm:px-5 lg:grid-cols-5">
        {countTiles.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--border-warm)] bg-white px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              {item.label}
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
              {item.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-3">
        {summary.documentGroups.map((group) => (
          <article key={group.id} className="bg-white px-4 py-4 sm:px-5">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              {group.title}
            </h4>
            <div className="mt-3 grid gap-3">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    "rounded-lg border px-3 py-3 text-sm leading-6 transition hover:border-[var(--copper)] hover:bg-white",
                    getEvidenceDocumentToneClassName(item.tone)
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{item.label}</p>
                    <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">
                      {item.customerSafe ? "Customer-safe" : "Internal"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-75">
                    {item.status}
                  </p>
                  <p className="mt-2 text-xs leading-5 opacity-80">
                    {item.detail}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-[var(--border-warm)] px-4 py-4 sm:px-5">
        <section
          id="portal-evidence-sharing"
          className="rounded-lg border border-[var(--border-warm)] bg-white"
        >
          <div className="border-b border-[var(--border-warm)] px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
                  Portal evidence sharing
                </p>
                <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  Explicit customer visibility grants
                </h4>
                <p className="mt-2 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
                  {portalSharing.primaryMessage}
                </p>
              </div>
              <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {portalSharing.statusLabel}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-4">
              <p className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
                Shared: {portalSharing.sharedCount}
              </p>
              <p className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
                Internal only: {portalSharing.internalCount}
              </p>
              <p className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
                Revoked: {portalSharing.revokedCount}
              </p>
              <p className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
                Archived: {portalSharing.archivedCount}
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                    Customer receipt history
                  </p>
                  <h5 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {receiptRollup.statusLabel}
                  </h5>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                    {receiptRollup.primaryMessage}
                  </p>
                </div>
                <Link
                  href={receiptPrintHref}
                  className={secondaryActionClassName}
                >
                  Print Receipt
                </Link>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-3">
                <p className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2">
                  Viewed or downloaded:{" "}
                  {receiptRollup.viewedCount + receiptRollup.downloadedCount}
                </p>
                <p className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2">
                  Acknowledged: {receiptRollup.acknowledgedCount}
                </p>
                <p className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2">
                  Outstanding acknowledgements:{" "}
                  {receiptRollup.unacknowledgedSharedCount}
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">
                {receiptRollup.acknowledgementDisclaimer}
              </p>
            </div>
          </div>

          {portalSharing.items.length > 0 ? (
            <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-2">
              {portalSharing.items.slice(0, 6).map((item) => (
                <article key={item.id} className="bg-white px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                        {item.attachmentType === "photo" ? "Photo" : "File"} /
                        {item.statusLabel}
                      </p>
                      <h5 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h5>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        {item.reason}
                      </p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        item.status === "shared"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : item.status === "revoked"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]"
                      ].join(" ")}
                    >
                      {item.statusLabel}
                    </span>
                  </div>

                  {item.customerNote ? (
                    <p className="mt-3 rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                      Customer note: {item.customerNote}
                    </p>
                  ) : null}

                  {item.status !== "internal" ? (
                    <div className="mt-3 grid gap-2 rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-2">
                      <p>
                        Shared:{" "}
                        {formatDateTime(item.deliveryProof.firstSharedAt)}
                      </p>
                      <p>
                        Viewed in portal:{" "}
                        {item.deliveryProof.viewCount > 0
                          ? `${item.deliveryProof.viewCount} time${item.deliveryProof.viewCount === 1 ? "" : "s"}`
                          : "Not yet"}
                      </p>
                      <p>
                        Download requested:{" "}
                        {item.deliveryProof.downloadCount > 0
                          ? `${item.deliveryProof.downloadCount} time${item.deliveryProof.downloadCount === 1 ? "" : "s"}`
                          : "Not yet"}
                      </p>
                      <p>
                        Customer acknowledged receipt:{" "}
                        {item.deliveryProof.acknowledgedAt
                          ? formatDateTime(item.deliveryProof.acknowledgedAt)
                          : "Not yet"}
                      </p>
                      {item.deliveryProof.revokedAt ? (
                        <p className="sm:col-span-2">
                          Revoked:{" "}
                          {formatDateTime(item.deliveryProof.revokedAt)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4">{renderPortalEvidenceAction(item)}</div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-4 py-4">
              <AppEmptyState
                eyebrow="Portal evidence"
                title="No field evidence is eligible for sharing yet"
                description="Upload field evidence through Daily Logs or Job Notes first. Sharing remains explicit and customer-safe."
              />
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-[var(--border-warm)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              Proof Trail
            </p>
            <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              Recent evidence and document movement
            </h4>
          </div>
          <Link href="#proofcenter" className={secondaryActionClassName}>
            Open Proof Center
          </Link>
        </div>

        <div className="mt-4 grid gap-3">
          {summary.timeline.length > 0 ? (
            summary.timeline.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 transition hover:border-[var(--copper)] hover:bg-[var(--highlight)]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                      {getEvidenceTimelineLabel(item.type)} |{" "}
                      {item.customerSafe ? "Customer-safe" : "Internal"}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {item.detail}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                    {formatDateTime(item.occurredAt)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <AppEmptyState
              eyebrow="No proof trail yet"
              title="Evidence will appear as real records connect"
              description="Daily Logs, Job Notes, field evidence, signed contracts, paid invoices, approved change orders, and warranty documents will appear here when they exist."
              actionHref="#fieldtrail"
              actionLabel="Review FieldTrail"
            />
          )}
        </div>
      </div>
    </section>
  );
}
