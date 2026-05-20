import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import {
  acceptGateKeeperArtifactAction,
  approveGateKeeperSuggestionReviewAction,
  dismissGateKeeperArtifactAction,
  dismissGateKeeperSuggestionAction,
  rejectGateKeeperArtifactAction,
  rejectGateKeeperSuggestionAction,
  seedGateKeeperDemoFixtureAction,
  seedGateKeeperManualIntakeAction
} from "@/lib/gatekeeper/actions";
import { gateKeeperDemoFixtures } from "@/lib/gatekeeper/demo-fixtures";
import {
  gateKeeperManualSeedSourceOptions,
  gateKeeperManualSeedSubjectOptions
} from "@/lib/gatekeeper/manual-seed";
import {
  getGateKeeperReviewQueue,
  getGateKeeperSubjectContext
} from "@/lib/gatekeeper/memory";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import type {
  GateKeeperActionSuggestion,
  GateKeeperActionSuggestionStatus,
  GateKeeperArtifact,
  GateKeeperArtifactReviewStatus
} from "@floorconnector/types";

type GateKeeperPageView = "memory" | "suggestions";
type GateKeeperStatusFilter = "all" | "proposed" | "reviewed" | "dismissed";

type GateKeeperPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    status?: string;
    view?: string;
  }>;
};

const viewOptions = [
  { key: "memory", label: "Memory artifacts" },
  { key: "suggestions", label: "Action suggestions" }
] as const satisfies ReadonlyArray<{ key: GateKeeperPageView; label: string }>;

const statusOptions = [
  { key: "proposed", label: "Proposed" },
  { key: "reviewed", label: "Reviewed" },
  { key: "dismissed", label: "Dismissed / rejected" },
  { key: "all", label: "All" }
] as const satisfies ReadonlyArray<{
  key: GateKeeperStatusFilter;
  label: string;
}>;

function buildGateKeeperHref(input: {
  view?: GateKeeperPageView;
  status?: GateKeeperStatusFilter;
}) {
  const searchParams = new URLSearchParams();

  if (input.view && input.view !== "memory") {
    searchParams.set("view", input.view);
  }

  if (input.status && input.status !== "proposed") {
    searchParams.set("status", input.status);
  }

  const query = searchParams.toString();

  return query ? `/gatekeeper?${query}` : "/gatekeeper";
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function truncate(value: string, maxLength = 340) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function formatJsonPreview(value: Record<string, unknown>) {
  if (Object.keys(value).length === 0) {
    return "No structured payload.";
  }

  return truncate(JSON.stringify(value, null, 2), 620);
}

function getArtifactPreview(artifact: GateKeeperArtifact) {
  return artifact.contentText?.trim()
    ? truncate(artifact.contentText.trim())
    : formatJsonPreview(artifact.content);
}

function getArtifactStatusTone(status: GateKeeperArtifactReviewStatus) {
  switch (status) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "dismissed":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

function getSuggestionStatusTone(status: GateKeeperActionSuggestionStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "dismissed":
    case "superseded":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

function getArtifactSourceLabel(artifact: GateKeeperArtifact) {
  if (artifact.communicationMessageId) {
    return `Message ${artifact.communicationMessageId.slice(0, 8)}`;
  }

  if (artifact.communicationThreadId) {
    return `Thread ${artifact.communicationThreadId.slice(0, 8)}`;
  }

  return "No communication source";
}

function getSuggestionSourceLabel(suggestion: GateKeeperActionSuggestion) {
  if (suggestion.sourceArtifactId) {
    return `Artifact ${suggestion.sourceArtifactId.slice(0, 8)}`;
  }

  if (suggestion.communicationMessageId) {
    return `Message ${suggestion.communicationMessageId.slice(0, 8)}`;
  }

  if (suggestion.communicationThreadId) {
    return `Thread ${suggestion.communicationThreadId.slice(0, 8)}`;
  }

  return "No source artifact";
}

function matchesArtifactStatus(
  artifact: GateKeeperArtifact,
  status: GateKeeperStatusFilter
) {
  if (status === "all") {
    return true;
  }

  if (status === "reviewed") {
    return artifact.reviewStatus === "accepted";
  }

  if (status === "dismissed") {
    return ["dismissed", "rejected"].includes(artifact.reviewStatus);
  }

  return artifact.reviewStatus === "proposed";
}

function matchesSuggestionStatus(
  suggestion: GateKeeperActionSuggestion,
  status: GateKeeperStatusFilter
) {
  if (status === "all") {
    return true;
  }

  if (status === "reviewed") {
    return suggestion.status === "approved";
  }

  if (status === "dismissed") {
    return ["dismissed", "rejected", "superseded"].includes(suggestion.status);
  }

  return suggestion.status === "proposed";
}

function ReviewActionForm({
  action,
  children,
  id,
  idName,
  returnTo,
  tone = "default"
}: {
  action: (formData: FormData) => Promise<void>;
  children: string;
  id: string;
  idName: "artifactId" | "suggestionId";
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
      <input type="hidden" name={idName} value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={[
          "inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
          toneClass
        ].join(" ")}
      >
        {children}
      </button>
    </form>
  );
}

function SubjectLink({
  subjectId,
  subjectType
}: {
  subjectId: string | null;
  subjectType: GateKeeperArtifact["subjectType"];
}) {
  const subject = getGateKeeperSubjectContext({ subjectId, subjectType });

  if (!subject.href) {
    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {subject.label}
      </span>
    );
  }

  return (
    <Link
      href={subject.href}
      className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32] transition hover:text-[#6c4324]"
    >
      {subject.label}
    </Link>
  );
}

function ArtifactCard({
  artifact,
  returnTo
}: {
  artifact: GateKeeperArtifact;
  returnTo: string;
}) {
  const isProposed = artifact.reviewStatus === "proposed";

  return (
    <article className="border border-[#e5e5e5] bg-white px-4 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              {formatLabel(artifact.artifactType)}
            </span>
            <span
              className={[
                "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                getArtifactStatusTone(artifact.reviewStatus)
              ].join(" ")}
            >
              {formatLabel(artifact.reviewStatus)}
            </span>
            {artifact.confidence ? (
              <span className="text-xs text-slate-500">
                Confidence {artifact.confidence}
              </span>
            ) : null}
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {getArtifactPreview(artifact)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <SubjectLink
              subjectId={artifact.subjectId}
              subjectType={artifact.subjectType}
            />
            <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {getArtifactSourceLabel(artifact)}
            </span>
          </div>
        </div>

        <div className="min-w-[190px] shrink-0 space-y-3 lg:text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Created
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(artifact.createdAt)}
            </p>
          </div>

          {isProposed ? (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <ReviewActionForm
                action={acceptGateKeeperArtifactAction}
                id={artifact.id}
                idName="artifactId"
                returnTo={returnTo}
                tone="primary"
              >
                Accept
              </ReviewActionForm>
              <ReviewActionForm
                action={rejectGateKeeperArtifactAction}
                id={artifact.id}
                idName="artifactId"
                returnTo={returnTo}
                tone="danger"
              >
                Reject
              </ReviewActionForm>
              <ReviewActionForm
                action={dismissGateKeeperArtifactAction}
                id={artifact.id}
                idName="artifactId"
                returnTo={returnTo}
              >
                Dismiss
              </ReviewActionForm>
            </div>
          ) : (
            <p className="text-xs leading-5 text-slate-500">
              Reviewed {formatDateTime(artifact.reviewedAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function SuggestionCard({
  returnTo,
  suggestion
}: {
  returnTo: string;
  suggestion: GateKeeperActionSuggestion;
}) {
  const isProposed = suggestion.status === "proposed";

  return (
    <article className="border border-[#e5e5e5] bg-white px-4 py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              {formatLabel(suggestion.suggestionType)}
            </span>
            <span
              className={[
                "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                getSuggestionStatusTone(suggestion.status)
              ].join(" ")}
            >
              {formatLabel(suggestion.status)}
            </span>
          </div>

          <h3 className="mt-3 text-base font-semibold text-slate-950">
            {suggestion.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {suggestion.rationale ??
              "No rationale was stored for this suggestion."}
          </p>

          <div className="mt-4 rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Proposed payload
            </p>
            <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600">
              {formatJsonPreview(suggestion.proposedPayload)}
            </pre>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <SubjectLink
              subjectId={suggestion.subjectId}
              subjectType={suggestion.subjectType}
            />
            <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {getSuggestionSourceLabel(suggestion)}
            </span>
          </div>
        </div>

        <div className="min-w-[220px] shrink-0 space-y-3 xl:text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Created
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(suggestion.createdAt)}
            </p>
          </div>

          {isProposed ? (
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <ReviewActionForm
                action={approveGateKeeperSuggestionReviewAction}
                id={suggestion.id}
                idName="suggestionId"
                returnTo={returnTo}
                tone="primary"
              >
                Approve review
              </ReviewActionForm>
              <ReviewActionForm
                action={rejectGateKeeperSuggestionAction}
                id={suggestion.id}
                idName="suggestionId"
                returnTo={returnTo}
                tone="danger"
              >
                Reject
              </ReviewActionForm>
              <ReviewActionForm
                action={dismissGateKeeperSuggestionAction}
                id={suggestion.id}
                idName="suggestionId"
                returnTo={returnTo}
              >
                Dismiss
              </ReviewActionForm>
            </div>
          ) : (
            <p className="text-xs leading-5 text-slate-500">
              Reviewed {formatDateTime(suggestion.reviewedAt)}
            </p>
          )}

          <p className="text-xs leading-5 text-slate-500">
            Approval records human review only. It does not create, schedule,
            send, update, or execute anything.
          </p>
        </div>
      </div>
    </article>
  );
}

export default async function GateKeeperPage({
  searchParams
}: GateKeeperPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/gatekeeper");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-[4px] border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        GateKeeper needs an active organization before memory artifacts and
        suggestions can be reviewed.
      </section>
    );
  }

  const requestedView = resolvedSearchParams.view?.trim() ?? "";
  const view: GateKeeperPageView =
    requestedView === "suggestions" ? "suggestions" : "memory";
  const requestedStatus = resolvedSearchParams.status?.trim() ?? "";
  const status: GateKeeperStatusFilter = statusOptions.some(
    (option) => option.key === requestedStatus
  )
    ? (requestedStatus as GateKeeperStatusFilter)
    : "proposed";
  const returnTo = buildGateKeeperHref({ view, status });
  const pageError = resolvedSearchParams.error?.trim() ?? "";
  const pageMessage = resolvedSearchParams.message?.trim() ?? "";
  const queue = await getGateKeeperReviewQueue({
    artifactStatus: "all",
    suggestionStatus: "all",
    limit: 100
  });
  const visibleArtifacts = queue.artifacts.filter((artifact) =>
    matchesArtifactStatus(artifact, status)
  );
  const visibleSuggestions = queue.suggestions.filter((suggestion) =>
    matchesSuggestionStatus(suggestion, status)
  );
  const activeItems =
    view === "memory" ? visibleArtifacts.length : visibleSuggestions.length;

  return (
    <ContractorWorkspacePage
      eyebrow="GateKeeper"
      title="GateKeeper"
      description={`Operational memory and assistant review queue for ${organizationContext.organization.displayName}. Review decisions update GateKeeper status only; nothing executes automatically.`}
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Proposed artifacts
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {queue.summary.proposedArtifactCount}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Proposed actions
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {queue.summary.proposedSuggestionCount}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Accepted reviews
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {queue.summary.acceptedReviewedCount}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Rejected / dismissed
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {queue.summary.dismissedRejectedCount}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This queue reviews stored GateKeeper artifacts and suggestions only.
            Approval means reviewed, not executed, and does not mutate canonical
            opportunities, projects, jobs, invoices, schedules, messages, or
            provider systems.
          </p>
        ),
        filterSlot: (
          <div className="flex flex-wrap gap-2">
            {viewOptions.map((option) => {
              const isActive = view === option.key;

              return (
                <Link
                  key={option.key}
                  href={buildGateKeeperHref({ status, view: option.key })}
                  className={[
                    "inline-flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#171717] text-white"
                      : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
                  ].join(" ")}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        ),
        actionSlot: (
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isActive = status === option.key;

              return (
                <Link
                  key={option.key}
                  href={buildGateKeeperHref({ status: option.key, view })}
                  className={[
                    "inline-flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#171717] text-white"
                      : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
                  ].join(" ")}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {pageError ? (
          <section className="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900">
            {pageError}
          </section>
        ) : null}

        {pageMessage ? (
          <section className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            {pageMessage}
          </section>
        ) : null}

        <section className="border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#e5e5e5] px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Demo examples
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Seed a repeatable GateKeeper review flow
                </h2>
                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  These examples use static demo-only content and the same
                  deterministic manual seed path. They create reviewable
                  GateKeeper rows only, with no AI, provider call, customer
                  message, schedule change, or canonical record mutation.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Static fixtures
              </span>
            </div>
          </div>

          <div className="grid gap-3 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
            {gateKeeperDemoFixtures.map((fixture) => (
              <form
                key={fixture.key}
                action={seedGateKeeperDemoFixtureAction}
                className="flex min-h-[190px] flex-col justify-between border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4"
              >
                <input type="hidden" name="fixtureKey" value={fixture.key} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                    Demo fixture
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-950">
                    {fixture.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {fixture.description}
                  </p>
                </div>
                <button
                  type="submit"
                  className="mt-4 inline-flex items-center justify-center rounded-[4px] border border-[#171717] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
                >
                  Seed demo
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#e5e5e5] px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Manual memory seed
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Simulate GateKeeper intake
                </h2>
                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Paste a call, chat, voicemail, or intake summary to create
                  provider-neutral GateKeeper artifacts and proposed review
                  actions. This form calls no AI or provider, sends no customer
                  communication, creates no business records, and executes no
                  suggestions.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                Manual only
              </span>
            </div>
          </div>

          <form action={seedGateKeeperManualIntakeAction} className="px-5 py-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                    Summary / source text
                  </span>
                  <textarea
                    name="body"
                    rows={6}
                    required
                    placeholder="Paste the manually captured intake summary, voicemail note, chat recap, or contractor observation."
                    className="mt-2 min-h-[150px] w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Customer name
                    </span>
                    <input
                      name="customerName"
                      className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Raw entered name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Requested service
                    </span>
                    <input
                      name="requestedService"
                      className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Epoxy garage floor, polish, repair..."
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Customer phone
                    </span>
                    <input
                      name="customerPhone"
                      className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Raw entered phone"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Customer email
                    </span>
                    <input
                      name="customerEmail"
                      type="email"
                      className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Raw entered email"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Requested appointment / date text
                    </span>
                    <input
                      name="requestedAppointment"
                      className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Raw request, for example: Friday morning or May 28 after 2"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Notes
                    </span>
                    <textarea
                      name="notes"
                      rows={3}
                      className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Any raw manual notes. Leave blank if there are none."
                    />
                  </label>
                </div>
              </div>

              <aside className="space-y-4 border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                    Source type
                  </span>
                  <select
                    name="sourceType"
                    className="mt-2 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                    defaultValue="phone_call"
                  >
                    {gateKeeperManualSeedSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      Optional linked subject
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      If left blank, GateKeeper memory is still created without
                      a communication thread. No fake lead or project is
                      created.
                    </p>
                  </div>
                  <label className="block">
                    <span className="sr-only">Subject type</span>
                    <select
                      name="subjectType"
                      className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                      defaultValue=""
                    >
                      {gateKeeperManualSeedSubjectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="sr-only">Subject id</span>
                    <input
                      name="subjectId"
                      className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                      placeholder="Existing subject id"
                    />
                  </label>
                </div>

                <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
                  Generated suggestions stay proposed in the review queue. This
                  form does not create opportunities, tasks, appointments, jobs,
                  invoices, contracts, schedules, or messages to customers.
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
                >
                  Seed review items
                </button>
              </aside>
            </div>
          </form>
        </section>

        <section className="border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#e5e5e5] px-5 py-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  {view === "memory"
                    ? "Memory artifacts"
                    : "Action suggestions"}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {view === "memory"
                    ? "Proposed operational memory"
                    : "Proposed next actions"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {view === "memory"
                    ? "Artifacts capture summaries, commitments, requirements, risks, and workflow observations for human review."
                    : "Suggestions are prepared recommendations only. Reviewing them never executes the proposed payload."}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {activeItems} visible item{activeItems === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {view === "memory" ? (
            visibleArtifacts.length > 0 ? (
              <div className="space-y-3 px-5 py-4">
                {visibleArtifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    returnTo={returnTo}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-8">
                <AppEmptyState
                  eyebrow="No memory artifacts"
                  title="Future GateKeeper observations will appear here"
                  description="Call notes, chat summaries, workflow observations, and extracted commitments will enter this review queue after GateKeeper sources are connected. This pass only exposes the tenant-safe review surface."
                />
              </div>
            )
          ) : visibleSuggestions.length > 0 ? (
            <div className="space-y-3 px-5 py-4">
              {visibleSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  returnTo={returnTo}
                  suggestion={suggestion}
                />
              ))}
            </div>
          ) : (
            <div className="px-5 py-8">
              <AppEmptyState
                eyebrow="No action suggestions"
                title="Future GateKeeper suggestions will wait here for approval"
                description="Follow-up ideas, scheduling recommendations, review flags, and workflow observations will be reviewable here before any future execution path exists. This queue currently updates review state only."
              />
            </div>
          )}
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
