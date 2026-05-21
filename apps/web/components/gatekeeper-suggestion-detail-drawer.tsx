"use client";

import Link from "next/link";
import { useState } from "react";

import {
  approveGateKeeperSuggestionReviewAction,
  dismissGateKeeperSuggestionAction,
  rejectGateKeeperSuggestionAction
} from "@/lib/gatekeeper/actions";
import { GateKeeperCreateOpportunityConfirmation } from "./gatekeeper-create-opportunity-confirmation";
import type { GateKeeperCreateOpportunityDuplicatePreview } from "@/lib/gatekeeper/create-opportunity-duplicates";
import type { GateKeeperCreateOpportunityPreflight } from "@/lib/gatekeeper/create-opportunity-preflight";
import type { GateKeeperExecutionPreview } from "@/lib/gatekeeper/execution-preview";
import { buildGateKeeperCreateOpportunityPreview } from "@/lib/gatekeeper/opportunity-preview";
import { buildGateKeeperSiteAssessmentPreview } from "@/lib/gatekeeper/site-assessment-preview";
import type { GateKeeperActionSuggestion } from "@floorconnector/types";

type GateKeeperSuggestionDetailDrawerProps = {
  createdLabel: string;
  duplicatePreview: GateKeeperCreateOpportunityDuplicatePreview | null;
  executionPreview: GateKeeperExecutionPreview;
  preflight: GateKeeperCreateOpportunityPreflight | null;
  returnTo: string;
  sourceContext: {
    artifactLabel: string | null;
    messageLabel: string | null;
    sourceLabel: string;
    threadLabel: string | null;
  };
  subjectContext: {
    href: string | null;
    label: string;
  };
  suggestion: GateKeeperActionSuggestion;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatReviewStatus(value: string) {
  return value === "approved" ? "reviewed" : formatLabel(value);
}

function truncate(value: string, maxLength = 1800) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function formatJsonPreview(value: Record<string, unknown>) {
  if (Object.keys(value).length === 0) {
    return "No structured payload.";
  }

  return truncate(JSON.stringify(value, null, 2));
}

function getRiskTone(riskTier: string) {
  switch (riskTier) {
    case "high_customer_facing":
    case "high_schedule":
    case "high_financial_legal":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "forbidden":
      return "border-slate-300 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

function ReviewActionForm({
  action,
  children,
  id,
  returnTo,
  tone = "default"
}: {
  action: (formData: FormData) => Promise<void>;
  children: string;
  id: string;
  returnTo: string;
  tone?: "default" | "primary" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "border-[#171717] bg-[#171717] text-white hover:bg-[#2a2a2a]"
      : tone === "danger"
        ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
        : "border-[#d6d6d6] bg-white text-[#3f3f3f] hover:bg-slate-50";

  return (
    <form action={action}>
      <input type="hidden" name="suggestionId" value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={[
          "inline-flex items-center justify-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
          toneClass
        ].join(" ")}
      >
        {children}
      </button>
    </form>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 sm:grid-cols-[150px_minmax(0,1fr)]">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm leading-6 text-slate-700">
        {value}
      </dd>
    </div>
  );
}

function OpportunityDraftPreviewSection({
  proposedPayload
}: {
  proposedPayload: GateKeeperActionSuggestion["proposedPayload"];
}) {
  const preview = buildGateKeeperCreateOpportunityPreview(proposedPayload);

  return (
    <section className="border border-[#e4d7ca] bg-white px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Opportunity draft preview
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Reviewed intake details for future lead workflow
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {preview.safetyCopy}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            No opportunity has been created by this preview.
          </p>
        </div>
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          canCreateNow: {String(preview.canCreateNow)}
        </span>
      </div>

      <dl className="mt-4 space-y-2">
        <DetailRow label="Future owner" value={preview.futureOwningWorkflow} />
        <DetailRow label="Contact" value={preview.proposedContactName} />
        <DetailRow label="Phone" value={preview.proposedPhone} />
        <DetailRow label="Email" value={preview.proposedEmail} />
        <DetailRow label="Service" value={preview.proposedService} />
        <DetailRow label="Location" value={preview.proposedLocationText} />
        <DetailRow
          label="Requested visit"
          value={preview.requestedAppointmentText}
        />
        <DetailRow label="Source" value={preview.sourceLabel} />
        <DetailRow label="Notes" value={preview.proposedNotes} />
      </dl>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Missing recommended fields
          </p>
          {preview.missingRecommendedFields.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
              {preview.missingRecommendedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              No recommended preview fields are missing. Future workflow
              validation is still required.
            </p>
          )}
        </div>

        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Future validation
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            {preview.futureValidationRequirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
      </div>

      {preview.additionalUntrustedData.length > 0 ? (
        <div className="mt-4 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900">
            Additional untrusted data
          </p>
          <dl className="mt-2 space-y-1 text-xs leading-5 text-amber-900">
            {preview.additionalUntrustedData.map((field) => (
              <div
                key={field.key}
                className="grid gap-1 sm:grid-cols-[150px_minmax(0,1fr)]"
              >
                <dt className="font-semibold">{field.label}</dt>
                <dd className="min-w-0 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="mt-4 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
        {preview.blockers.map((blocker) => (
          <p key={blocker.code}>
            <span className="font-semibold">{formatLabel(blocker.code)}:</span>{" "}
            {blocker.message}
          </p>
        ))}
      </div>
    </section>
  );
}

function SiteAssessmentPreviewSection({
  proposedPayload,
  subjectId,
  subjectType
}: {
  proposedPayload: GateKeeperActionSuggestion["proposedPayload"];
  subjectId: string | null;
  subjectType: string | null;
}) {
  const preview = buildGateKeeperSiteAssessmentPreview({
    proposedPayload,
    subjectId,
    subjectType
  });

  return (
    <section className="border border-[#e4d7ca] bg-white px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Site assessment scheduling preview
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Requested inspection timing for future scheduling review
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {preview.safetyCopy}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            No appointment has been scheduled by this preview.
          </p>
        </div>
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          canScheduleNow: {String(preview.canScheduleNow)}
        </span>
      </div>

      <dl className="mt-4 space-y-2">
        <DetailRow label="Future owner" value={preview.futureOwningWorkflow} />
        <DetailRow label="Linked subject" value={preview.linkedSubjectLabel} />
        <DetailRow label="Contact" value={preview.proposedContactName} />
        <DetailRow label="Phone" value={preview.proposedPhone} />
        <DetailRow label="Email" value={preview.proposedEmail} />
        <DetailRow label="Service" value={preview.proposedService} />
        <DetailRow label="Location" value={preview.proposedLocationText} />
        <DetailRow
          label="Requested timing"
          value={preview.requestedAppointmentText}
        />
        <DetailRow label="Scheduling notes" value={preview.schedulingNotes} />
        <DetailRow label="Source" value={preview.sourceLabel} />
      </dl>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Missing recommended fields
          </p>
          {preview.missingRecommendedFields.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
              {preview.missingRecommendedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              No recommended preview fields are missing. Future scheduling
              validation is still required.
            </p>
          )}
        </div>

        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Future validation
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            {preview.futureValidationRequirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
      </div>

      {preview.additionalUntrustedData.length > 0 ? (
        <div className="mt-4 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900">
            Additional untrusted data
          </p>
          <dl className="mt-2 space-y-1 text-xs leading-5 text-amber-900">
            {preview.additionalUntrustedData.map((field) => (
              <div
                key={field.key}
                className="grid gap-1 sm:grid-cols-[150px_minmax(0,1fr)]"
              >
                <dt className="font-semibold">{field.label}</dt>
                <dd className="min-w-0 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="mt-4 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
        {preview.blockers.map((blocker) => (
          <p key={blocker.code}>
            <span className="font-semibold">{formatLabel(blocker.code)}:</span>{" "}
            {blocker.message}
          </p>
        ))}
      </div>
    </section>
  );
}

export function GateKeeperSuggestionDetailDrawer({
  createdLabel,
  duplicatePreview,
  executionPreview,
  preflight,
  returnTo,
  sourceContext,
  subjectContext,
  suggestion
}: GateKeeperSuggestionDetailDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isProposed = suggestion.status === "proposed";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
      >
        Review details
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-[#17120f]/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`gatekeeper-suggestion-${suggestion.id}-title`}
        >
          <div className="ml-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[8px] bg-[#f8f5f1] shadow-2xl">
            <div className="border-b border-[#d9cdc2] bg-white px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                    GateKeeper suggestion detail
                  </p>
                  <h2
                    id={`gatekeeper-suggestion-${suggestion.id}-title`}
                    className="mt-2 text-2xl font-semibold tracking-tight text-slate-950"
                  >
                    {suggestion.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Reviewing this suggestion does not run it. Any available
                    execution must use a separate controlled confirmation and
                    ledger request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-4">
                <section className="border border-[#e5e5e5] bg-white px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                      {formatLabel(suggestion.suggestionType)}
                    </span>
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                      {formatReviewStatus(suggestion.status)}
                    </span>
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                        getRiskTone(executionPreview.riskTier)
                      ].join(" ")}
                    >
                      {formatLabel(executionPreview.riskTier)}
                    </span>
                  </div>

                  <dl className="mt-4 space-y-2">
                    <DetailRow label="Created" value={createdLabel} />
                    <DetailRow
                      label="Source"
                      value={sourceContext.sourceLabel}
                    />
                    <DetailRow
                      label="Artifact"
                      value={sourceContext.artifactLabel}
                    />
                    <DetailRow
                      label="Thread"
                      value={sourceContext.threadLabel}
                    />
                    <DetailRow
                      label="Message"
                      value={sourceContext.messageLabel}
                    />
                  </dl>

                  <div className="mt-4">
                    {subjectContext.href ? (
                      <Link
                        href={subjectContext.href}
                        className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32] transition hover:text-[#6c4324]"
                      >
                        {subjectContext.label}
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {subjectContext.label}
                      </span>
                    )}
                  </div>
                </section>

                <section className="border border-[#e5e5e5] bg-white px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                    Source rationale
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {suggestion.rationale ??
                      "No rationale was stored for this suggestion."}
                  </p>
                </section>

                <section className="border border-[#e4d7ca] bg-[#fbf5ee] px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                        Future action preview
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {executionPreview.futureActionSummary}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                      Owner: {formatLabel(executionPreview.owner)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[4px] border border-white/70 bg-white px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                        Blockers
                      </p>
                      <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                        {executionPreview.blockers.map((blocker) => (
                          <li key={blocker.code}>
                            <span className="font-semibold">
                              {formatLabel(blocker.code)}:
                            </span>{" "}
                            {blocker.message}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[4px] border border-white/70 bg-white px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                        Validation needed later
                      </p>
                      <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                        {executionPreview.validationSummary.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
                    <p>{executionPreview.payloadTrustMessage}</p>
                    <p className="mt-1">
                      {executionPreview.reviewSeparationMessage}
                    </p>
                    <p className="mt-1">
                      Future execution must be handled by the owning workflow.
                    </p>
                    <p className="mt-1 font-semibold">
                      canExecuteNow: {String(executionPreview.canExecuteNow)}
                    </p>
                  </div>
                </section>

                {suggestion.suggestionType === "create_opportunity" ? (
                  <>
                    <OpportunityDraftPreviewSection
                      proposedPayload={suggestion.proposedPayload}
                    />
                    <GateKeeperCreateOpportunityConfirmation
                      duplicatePreview={duplicatePreview}
                      preflight={preflight}
                      proposedPayload={suggestion.proposedPayload}
                      returnTo={returnTo}
                      suggestionId={suggestion.id}
                      suggestionStatus={suggestion.status}
                    />
                  </>
                ) : null}

                {suggestion.suggestionType === "schedule_site_assessment" ? (
                  <SiteAssessmentPreviewSection
                    proposedPayload={suggestion.proposedPayload}
                    subjectId={suggestion.subjectId}
                    subjectType={suggestion.subjectType}
                  />
                ) : null}

                <section className="border border-[#e5e5e5] bg-white px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                    Proposed payload
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Display-only and untrusted. This is rendered as text, not
                    HTML.
                  </p>
                  <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3 text-xs leading-5 text-slate-600">
                    {formatJsonPreview(suggestion.proposedPayload)}
                  </pre>
                </section>
              </div>
            </div>

            <div className="border-t border-[#d9cdc2] bg-white px-5 py-4 sm:px-6">
              {isProposed ? (
                <div className="flex flex-wrap gap-2">
                  <ReviewActionForm
                    action={approveGateKeeperSuggestionReviewAction}
                    id={suggestion.id}
                    returnTo={returnTo}
                    tone="primary"
                  >
                    Approve review
                  </ReviewActionForm>
                  <ReviewActionForm
                    action={rejectGateKeeperSuggestionAction}
                    id={suggestion.id}
                    returnTo={returnTo}
                    tone="danger"
                  >
                    Reject
                  </ReviewActionForm>
                  <ReviewActionForm
                    action={dismissGateKeeperSuggestionAction}
                    id={suggestion.id}
                    returnTo={returnTo}
                  >
                    Dismiss
                  </ReviewActionForm>
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  This suggestion has already been reviewed. Review state is not
                  execution state.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
