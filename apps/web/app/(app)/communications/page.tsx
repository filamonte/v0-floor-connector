import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { CommunicationNotificationTriageForm } from "@/components/communication-notification-triage-form";
import { CommunicationReplyForm } from "@/components/communication-reply-form";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { parseAiCopilotCommunicationHandoffSearchParams } from "@/lib/ai-operational-copilot/communication-handoff";
import { listCommunicationMessages } from "@/lib/communications/data";
import { deriveCustomerCommunicationSendReadiness } from "@/lib/communications/send-readiness";
import {
  listContractorCommunicationContextEvents,
  listContractorCommunicationThreadSummary,
  listContractorCommunicationThreads,
  type ContractorCommunicationSourceFilter,
  type ContractorCommunicationThreadListItem,
  type ContractorCommunicationThreadView
} from "@/lib/communications/contractor-data";
import { deriveCommunicationWorkspaceSummary } from "@/lib/communications/workspace-summary";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContractorNotifications } from "@/lib/notifications/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type CommunicationView = ContractorCommunicationThreadView;
type CommunicationSourceFilter = ContractorCommunicationSourceFilter;

type CommunicationsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    q?: string;
    view?: CommunicationView;
    source?: string;
    threadId?: string;
    copilotDraft?: string;
    copilotDraftId?: string;
    copilotActionType?: string;
    copilotAudience?: string;
    copilotTitle?: string;
    copilotSubject?: string;
    copilotBody?: string;
    copilotReason?: string;
    copilotSignals?: string;
    copilotProjectId?: string;
    copilotProjectName?: string;
    copilotCustomerId?: string;
    copilotCustomerName?: string;
  }>;
};

const communicationSourceFilters = [
  { key: "all", label: "All sources" },
  { key: "opportunity", label: "Lead" },
  { key: "appointment", label: "Appointment" },
  { key: "customer", label: "Customer" },
  { key: "project", label: "Project" },
  { key: "estimate", label: "Estimate" },
  { key: "contract", label: "Contract" },
  { key: "invoice", label: "Invoice" },
  { key: "change_order", label: "Change order" },
  { key: "payment", label: "Payment" }
] as const satisfies ReadonlyArray<{
  key: CommunicationSourceFilter;
  label: string;
}>;

const supportedCommunicationSources = communicationSourceFilters
  .filter((filterOption) => filterOption.key !== "all")
  .map((filterOption) => filterOption.key) as ReadonlyArray<
  Exclude<CommunicationSourceFilter, "all">
>;

const supportedCommunicationSourceLabel = communicationSourceFilters
  .filter((filterOption) => filterOption.key !== "all")
  .map((filterOption) => filterOption.label.toLowerCase())
  .join(", ");

function buildCommunicationsHref(input: {
  q?: string;
  view?: CommunicationView;
  source?: CommunicationSourceFilter;
  threadId?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.source && input.source !== "all") {
    searchParams.set("source", input.source);
  }

  if (input.threadId) {
    searchParams.set("threadId", input.threadId);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/communications?${query}` : "/communications";
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "No messages yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatSubjectType(value: string) {
  return value.replaceAll("_", " ");
}

function getCommunicationSourceLabel(value: CommunicationSourceFilter) {
  return (
    communicationSourceFilters.find(
      (filterOption) => filterOption.key === value
    )?.label ?? value
  );
}

function isSupportedCommunicationSource(
  value: string
): value is Exclude<CommunicationSourceFilter, "all"> {
  return supportedCommunicationSources.includes(
    value as Exclude<CommunicationSourceFilter, "all">
  );
}

function getMessageSenderLabel(
  senderType: "organization_user" | "portal_user" | "system"
) {
  switch (senderType) {
    case "portal_user":
      return "Customer portal";
    case "system":
      return "System";
    default:
      return "Internal";
  }
}

function getMessageVisibilityLabel(value: "internal" | "customer_visible") {
  return value === "customer_visible" ? "Customer-visible" : "Internal only";
}

function getMessageSenderTone(
  senderType: "organization_user" | "portal_user" | "system"
) {
  switch (senderType) {
    case "portal_user":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "system":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
}

function filterThreadsByQuery(
  threads: ContractorCommunicationThreadListItem[],
  query: string
) {
  const normalizedQuery = query.toLowerCase();

  return threads.filter((thread) => {
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            thread.customer.label,
            thread.project.label,
            thread.subject.label,
            thread.subjectSecondaryLink?.label ?? "",
            thread.lastMessagePreview ?? "",
            thread.subject.type
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesQuery;
  });
}

function getThreadEmptyState(input: {
  totalThreads: number;
  query: string;
  view: CommunicationView;
  source: CommunicationSourceFilter;
  unsupportedSource: string | null;
}) {
  if (input.unsupportedSource) {
    return {
      eyebrow: "Unsupported source filter",
      title: `Source "${input.unsupportedSource}" is not available in communications`,
      description: `This queue currently supports canonical conversation sources for ${supportedCommunicationSourceLabel}. Unsupported sources are not shown here so internal testers do not mistake them for active communication workflows.`
    };
  }

  if (input.totalThreads === 0) {
    return {
      eyebrow: "No communication threads yet",
      title: "Canonical conversation history will appear here",
      description:
        "This surface only reads the shared communication threads and notifications foundation. Once estimate, contract, invoice, project, or customer conversations accumulate, they will show here without creating a second inbox system."
    };
  }

  if (input.query.length > 0) {
    return {
      eyebrow: "No matching threads",
      title: "Nothing matches this communication search",
      description:
        "Try a broader search term or clear the current source and status filters to return to the full review queue."
    };
  }

  if (input.source !== "all") {
    return {
      eyebrow: "No matching source records",
      title: `No ${formatSubjectType(input.source)} threads match this queue`,
      description:
        "This filter only reads canonical communication threads already attached to that source record type. Try another source or switch back to all sources."
    };
  }

  if (input.view === "needs_response") {
    return {
      eyebrow: "No response pressure",
      title: "No portal customer replies are waiting right now",
      description:
        "Threads move into this queue when canonical message history or thread state shows a customer-visible portal reply after the latest contractor customer-visible response."
    };
  }

  if (input.view === "unread") {
    return {
      eyebrow: "No unread activity",
      title: "No unread communication notifications are open",
      description:
        "Unread communication records will appear here when the canonical notification layer flags new message activity."
    };
  }

  return {
    eyebrow: "No recent activity",
    title: "Nothing new in the recent communication window",
    description:
      "Recent threads are currently defined from stored canonical message timestamps, so this view will populate as more communication history accumulates."
  };
}

export default async function CommunicationsPage({
  searchParams
}: CommunicationsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/communications");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Communications need an active organization before shared threads and
        notifications can be reviewed.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const view = resolvedSearchParams.view ?? "all";
  const requestedSource = resolvedSearchParams.source?.trim() ?? "";
  const source =
    requestedSource.length === 0
      ? "all"
      : requestedSource === "all"
        ? "all"
        : isSupportedCommunicationSource(requestedSource)
          ? requestedSource
          : "all";
  const unsupportedSource =
    requestedSource.length > 0 && source === "all" && requestedSource !== "all"
      ? requestedSource
      : null;
  const pageError = resolvedSearchParams.error?.trim() ?? "";
  const pageMessage = resolvedSearchParams.message?.trim() ?? "";
  const requestedThreadId = resolvedSearchParams.threadId?.trim() ?? "";
  const copilotDraftHandoff =
    parseAiCopilotCommunicationHandoffSearchParams(resolvedSearchParams);

  const [threads, summary, notifications, contextEvents] = await Promise.all([
    listContractorCommunicationThreads({
      view,
      source
    }),
    listContractorCommunicationThreadSummary(),
    listContractorNotifications(),
    listContractorCommunicationContextEvents()
  ]);

  const filteredThreads = unsupportedSource
    ? []
    : filterThreadsByQuery(threads, query);
  const selectedThread =
    requestedThreadId.length > 0
      ? (filteredThreads.find((thread) => thread.id === requestedThreadId) ??
        null)
      : (filteredThreads[0] ?? null);
  const requestedThreadUnavailable =
    requestedThreadId.length > 0 && !selectedThread && !unsupportedSource;
  const selectedMessages = selectedThread
    ? await listCommunicationMessages(selectedThread.id)
    : [];
  const customerSendReadiness = copilotDraftHandoff
    ? deriveCustomerCommunicationSendReadiness({
        audience: copilotDraftHandoff.audience,
        actionType: copilotDraftHandoff.actionType,
        subject: copilotDraftHandoff.subject,
        body: copilotDraftHandoff.draftBody,
        customer: {
          id: selectedThread?.customer.id || copilotDraftHandoff.customerId,
          label:
            selectedThread?.customer.label ||
            copilotDraftHandoff.customerName ||
            null
        },
        relatedRecord: selectedThread
          ? {
              type: selectedThread.subject.type,
              id: selectedThread.subject.id,
              label: selectedThread.subject.label,
              href: selectedThread.subject.href
            }
          : {
              type: "project",
              id: copilotDraftHandoff.projectId,
              label: copilotDraftHandoff.projectName,
              href: `/projects/${copilotDraftHandoff.projectId}`
            }
      })
    : null;

  const sourceCounts = communicationSourceFilters.map((filterOption) => ({
    ...filterOption,
    count:
      filterOption.key === "all"
        ? summary.totalCount
        : summary.sourceCounts[filterOption.key]
  }));
  const threadViews = [
    { key: "all", label: "All threads", count: summary.totalCount },
    {
      key: "needs_response",
      label: "Needs response",
      count: summary.needsResponseCount
    },
    { key: "unread", label: "Unread", count: summary.unreadCount },
    { key: "recent", label: "Recent", count: summary.recentCount }
  ] as const;
  const threadEmptyState = getThreadEmptyState({
    totalThreads: summary.totalCount,
    query,
    view,
    source,
    unsupportedSource
  });
  const hasSourceContext =
    source !== "all" ||
    requestedThreadId.length > 0 ||
    unsupportedSource !== null;
  const sourceContextSourceLabel =
    unsupportedSource ??
    (source !== "all" ? getCommunicationSourceLabel(source) : null);
  const workspaceSummary = deriveCommunicationWorkspaceSummary({
    threads,
    threadSummary: summary,
    contextEvents,
    notificationCount: notifications.totalCount
  });

  return (
    <ContractorWorkspacePage
      eyebrow="Communications"
      title={`Record-linked communications for ${organizationContext.organization.displayName}`}
      description="Review operational memory across opportunity, customer, project, estimate, contract, change order, invoice, and payment records without creating a second inbox, provider integration, or portal-only copy."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Workspace status
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {workspaceSummary.primaryStatus}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {workspaceSummary.workflowCoverageLabel}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Reply / review
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {workspaceSummary.followUpCount}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {workspaceSummary.notificationReviewDetail}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Customer boundary
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {workspaceSummary.customerBoundaryLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {workspaceSummary.customerBoundaryDetail}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Delivery proof
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {workspaceSummary.deliveryProofLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {workspaceSummary.deliveryProofDetail}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Replies and triage stay anchored to canonical
            <code className="mx-1 rounded bg-white px-1.5 py-0.5">
              communication_threads
            </code>
            ,
            <code className="mx-1 rounded bg-white px-1.5 py-0.5">
              communication_messages
            </code>
            , and stored per-user notifications. No email/SMS send or automation
            execution runs from this queue.
          </p>
        ),
        searchSlot: (
          <form
            action="/communications"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {view !== "all" ? (
              <input type="hidden" name="view" value={view} />
            ) : null}
            {source !== "all" ? (
              <input type="hidden" name="source" value={source} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search customer, project, source record, or latest message preview"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" ? (
              <Link
                href="/communications"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: threadViews.map((threadView) => {
          const isActive = view === threadView.key;

          return (
            <Link
              key={threadView.key}
              href={buildCommunicationsHref({
                q: query,
                view: threadView.key,
                source
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{threadView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {threadView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <div className="flex flex-wrap items-center gap-2">
            <CommunicationNotificationTriageForm
              mode="all"
              query={query}
              view={view}
              source={source}
              threadId={selectedThread?.id}
              disabled={notifications.totalCount === 0}
            />
            <div
              className={[
                "inline-flex items-center rounded-[4px] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]",
                selectedThread
                  ? "border border-[#d6e6d9] bg-[#f4fbf5] text-[#2f6b3b]"
                  : "border border-[#ead9c7] bg-[#fff8f2] text-[#8f5b32]"
              ].join(" ")}
            >
              {selectedThread ? "Reply enabled" : "Select a thread"}
            </div>
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

        {copilotDraftHandoff ? (
          <section className="border border-[#e4d7ca] bg-[#fffcf7] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                  Copilot draft handoff
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  {copilotDraftHandoff.title}
                </h2>
                <p className="mt-1 max-w-[74ch] text-sm leading-6 text-slate-600">
                  AI prepared this draft from canonical project context. Review
                  and edit it here; FloorConnector will not send email or SMS,
                  create a new thread, or run automation from this handoff.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  <span className="inline-flex rounded-full border border-[#e4d7ca] bg-white px-2.5 py-1 text-[#8f5b32]">
                    {copilotDraftHandoff.audience}
                  </span>
                  <Link
                    href={`/projects/${copilotDraftHandoff.projectId}`}
                    className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                  >
                    {copilotDraftHandoff.projectName}
                  </Link>
                  {copilotDraftHandoff.customerId ? (
                    <Link
                      href={`/customers/${copilotDraftHandoff.customerId}`}
                      className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                    >
                      {copilotDraftHandoff.customerName ?? "Customer"}
                    </Link>
                  ) : null}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Why: {copilotDraftHandoff.operationalReason}
                </p>
                {customerSendReadiness ? (
                  <div className="mt-4 border border-[#ead9c7] bg-white px-4 py-3 text-xs leading-5 text-slate-600">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                          Customer send readiness
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {customerSendReadiness.recommendedNextStep}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-[#ead9c7] bg-[#fff8f2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                        {customerSendReadiness.readinessStatus.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </div>
                    <p className="mt-2">
                      Intended for {customerSendReadiness.targetCustomerLabel}{" "}
                      about {customerSendReadiness.relatedRecordLabel}. Nothing
                      is sent automatically.
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="w-full shrink-0 lg:w-[22rem]">
                <label
                  htmlFor="copilot-draft-review-body"
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]"
                >
                  Draft body
                </label>
                <textarea
                  id="copilot-draft-review-body"
                  readOnly={Boolean(selectedThread)}
                  rows={6}
                  defaultValue={copilotDraftHandoff.draftBody}
                  className="mt-2 min-h-[132px] w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm leading-6 text-slate-800"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {selectedThread
                    ? "The selected canonical thread composer below is prefilled with this draft."
                    : "Review and edit this draft here for copy/paste use, or select an existing canonical thread to save an edited internal note. New communication thread creation is intentionally deferred."}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="border border-[#d6d6d6] bg-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Record-linked communication control room
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {workspaceSummary.primaryStatus}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {workspaceSummary.primaryDetail}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {workspaceSummary.workflowCoverageDetail}
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                  Latest customer activity
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {formatDateTime(workspaceSummary.latestCustomerActivityAt)}
                </p>
              </div>
              <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                  Latest context
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {formatDateTime(workspaceSummary.latestContextActivityAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspaceSummary.lanes.map((lane) => (
              <Link
                key={lane.key}
                href={lane.href}
                className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 transition hover:border-[#ef7d32] hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                      {lane.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {lane.boundaryLabel}
                      </span>
                      <span className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                        {lane.actionLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {lane.detail}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-slate-950">
                      {lane.count}
                    </p>
                    {lane.attentionCount > 0 ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                        {lane.attentionCount} attention
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-5 rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Conversations by linked record
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  Communications owns the action surface
                </h3>
                <p className="mt-1 max-w-[76ch] text-sm leading-6 text-slate-500">
                  These groups are derived from existing canonical communication
                  threads. Record workspaces can show compact evidence, but
                  message review, replies, unread triage, and portal-safe
                  boundaries stay here.
                </p>
              </div>
              <span className="rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                No duplicate thread model
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {workspaceSummary.recordOwnershipGroups.map((group) => (
                <Link
                  key={group.key}
                  href={group.href}
                  className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3 transition hover:border-[#ef7d32] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                        {group.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {group.count > 0
                          ? group.latestThreadLabel
                          : "No conversations yet"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {group.count > 0 ? group.detail : group.emptyDetail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-semibold text-slate-950">
                        {group.count}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Threads
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.needsResponseCount > 0 ? (
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                        {group.needsResponseCount} needs response
                      </span>
                    ) : null}
                    {group.unreadCount > 0 ? (
                      <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {group.unreadCount} unread
                      </span>
                    ) : null}
                    <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      {group.customerVisibleCount} customer-visible
                    </span>
                    <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      {group.internalCount} internal
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs leading-5 text-slate-500">
                      Latest: {formatDateTime(group.latestActivityAt)}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                      {group.actionLabel}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#fffcf7] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                Follow-up intelligence
              </p>
              {workspaceSummary.attentionItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {workspaceSummary.attentionItems.slice(0, 4).map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={[
                        "block rounded-[4px] border bg-white px-3 py-2 transition hover:bg-slate-50",
                        item.tone === "critical"
                          ? "border-rose-200"
                          : "border-amber-200"
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-950">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(item.occurredAt)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.detail}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No unanswered customer message, stale thread, or delivery
                  issue is currently visible in the communications read model.
                  Notification read state remains separate from reply triage.
                </p>
              )}
            </div>

            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Delivery and evidence context
              </p>
              <div className="mt-2 rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {workspaceSummary.deliveryProofLabel}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {workspaceSummary.deliveryProofDetail}
                    </p>
                  </div>
                  <span
                    className={[
                      "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                      workspaceSummary.deliveryProofReviewCount > 0
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-[#d6e6d9] bg-[#f4fbf5] text-[#2f6b3b]"
                    ].join(" ")}
                  >
                    {workspaceSummary.deliveryProofReviewCount > 0
                      ? "Needs review"
                      : "Read-only proof"}
                  </span>
                </div>
              </div>
              <div className="mt-2 rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {workspaceSummary.deliveryProofReviewSummary.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {workspaceSummary.deliveryProofReviewSummary.detail}
                    </p>
                  </div>
                  <Link
                    href={workspaceSummary.deliveryProofReviewSummary.href}
                    className="inline-flex shrink-0 items-center rounded-[4px] border border-[#d6d6d6] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                  >
                    Review proof
                  </Link>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Delivery Proof by Record
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Grouped read-only evidence by canonical source record.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {workspaceSummary.deliveryProofRecordGroups.length} record
                    {workspaceSummary.deliveryProofRecordGroups.length === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
                {workspaceSummary.deliveryProofRecordGroups.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {workspaceSummary.deliveryProofRecordGroups
                      .slice(0, 5)
                      .map((group) => (
                        <article
                          key={group.key}
                          className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={group.sourceHref}
                                className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                              >
                                {group.sourceLabel}
                              </Link>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {group.latestDescription}
                              </p>
                            </div>
                            <div className="shrink-0 text-left sm:text-right">
                              <p className="text-xs font-semibold text-slate-900">
                                {group.proofCount} proof{" "}
                                {group.proofCount === 1 ? "event" : "events"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatDateTime(group.latestEventAt)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={[
                                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                group.needsReview
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-[#d6e6d9] bg-[#f4fbf5] text-[#2f6b3b]"
                              ].join(" ")}
                            >
                              {group.needsReview
                                ? "Needs review"
                                : group.latestProofStateLabel}
                            </span>
                            {[
                              ...group.proofSourceLabels,
                              ...group.proofBoundaryLabels,
                              ...group.audienceLabels
                            ].map((label) => (
                              <span
                                key={`${group.key}:${label}`}
                                className="inline-flex rounded-full border border-[#d6d6d6] bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={group.sourceHref}
                              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                            >
                              Open source record
                            </Link>
                            <Link
                              href={group.communicationsHref}
                              className="inline-flex items-center rounded-[4px] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                            >
                              Review communication activity
                            </Link>
                          </div>
                        </article>
                      ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-[4px] border border-dashed border-[#d6d6d6] bg-white px-3 py-3 text-sm leading-6 text-slate-500">
                    No delivery proof has been recorded yet. That does not mean
                    a send failed; it means no proof evidence exists in the
                    current communications read model.
                  </p>
                )}
              </div>
              {workspaceSummary.recentContextEvents.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {workspaceSummary.recentContextEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={event.href}
                      className="block rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 transition hover:border-[#ef7d32]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-950">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(event.occurredAt)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {event.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                            event.needsReview
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : event.tone === "positive"
                                ? "border-[#d6e6d9] bg-[#f4fbf5] text-[#2f6b3b]"
                                : "border-[#d6d6d6] bg-slate-50 text-slate-600"
                          ].join(" ")}
                        >
                          {event.proofStateLabel}
                        </span>
                        <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                          {event.proofSourceLabel}
                        </span>
                        <span className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                          {event.proofBoundaryLabel}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No delivery proof yet. Document sends and shared-evidence
                  proof will appear here when canonical delivery or portal
                  evidence events exist; this panel does not send, resend, or
                  mutate delivery state.
                </p>
              )}
            </div>
          </div>
        </section>

        {hasSourceContext ? (
          <section className="border border-[#d6d6d6] bg-[#f8f8f8] px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Source context
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {sourceContextSourceLabel ? (
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-1",
                        unsupportedSource
                          ? "border border-amber-200 bg-amber-50 text-amber-800"
                          : "border border-[#d6d6d6] bg-white text-slate-700"
                      ].join(" ")}
                    >
                      Source: {sourceContextSourceLabel}
                    </span>
                  ) : null}
                  {requestedThreadId.length > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2.5 py-1 text-[#8f5b32]">
                      Thread:{" "}
                      {selectedThread?.id === requestedThreadId
                        ? selectedThread.subject.label
                        : `Unavailable ${requestedThreadId.slice(0, 8)}`}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-[72ch] text-sm leading-6 text-slate-500">
                  {unsupportedSource
                    ? `Source "${unsupportedSource}" is not available yet. Detail pages can still show conversation summaries, but replies stay inside /communications for supported sources only.`
                    : selectedThread
                      ? "Detail pages show conversation summaries only. Review this thread here and send replies from /communications on the same canonical record."
                      : requestedThreadUnavailable
                        ? "The requested thread is not visible in the current queue. It may be outside the selected filters, unavailable to this organization, or no longer match the current source context."
                        : source !== "all"
                          ? `This queue is scoped to ${getCommunicationSourceLabel(source).toLowerCase()} conversations. Detail pages only summarize related threads, and reply actions stay in /communications.`
                          : "This workspace was opened from a direct thread link. Review the canonical thread here and keep any reply on /communications."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedThread ? (
                  <Link
                    href={selectedThread.subject.href}
                    className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                  >
                    Open source record
                  </Link>
                ) : null}
                <Link
                  href="/communications"
                  className="inline-flex items-center rounded-[4px] border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                >
                  Clear context
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <section className="overflow-hidden border border-[#d6d6d6] bg-white">
            <div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Record-linked queue
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Review workflow conversations, not a detached inbox
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Detail pages summarize related conversations only. Full
                  history, replies, notification triage, and customer-safe
                  boundaries stay in this workspace for supported canonical
                  sources.
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {filteredThreads.length} visible
              </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] bg-[#f8f8f8] px-5 py-3 sm:px-6">
              {sourceCounts.map((filterOption) => {
                const isActive = source === filterOption.key;

                return (
                  <Link
                    key={filterOption.key}
                    href={buildCommunicationsHref({
                      q: query,
                      view,
                      source: filterOption.key,
                      threadId: selectedThread?.id
                    })}
                    className={[
                      "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-[#171717] text-white"
                        : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
                    ].join(" ")}
                  >
                    <span>{filterOption.label}</span>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      ].join(" ")}
                    >
                      {filterOption.count}
                    </span>
                  </Link>
                );
              })}
            </div>

            {unsupportedSource ? (
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-900 sm:px-6">
                Source{" "}
                <span className="font-semibold">{unsupportedSource}</span> is
                not available yet. Communications currently support lead,
                customer, project, estimate, contract, invoice, change order,
                and payment threads only. Unsupported source filters do not
                create placeholder queues.
              </div>
            ) : null}
            {requestedThreadUnavailable ? (
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-900 sm:px-6">
                The requested thread is not available in this filtered queue.
                Clear context or broaden the filters to review available
                canonical communication threads.
              </div>
            ) : null}

            {filteredThreads.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredThreads.map((thread) => {
                  const isSelected = selectedThread?.id === thread.id;

                  return (
                    <div
                      key={thread.id}
                      className={[
                        "px-5 py-4 transition sm:px-6",
                        isSelected ? "bg-[#fffaf5]" : "hover:bg-slate-50/70"
                      ].join(" ")}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={buildCommunicationsHref({
                                q: query,
                                view,
                                source,
                                threadId: thread.id
                              })}
                              className="text-base font-semibold text-slate-950 transition hover:text-brand-700"
                            >
                              {thread.subject.label}
                            </Link>
                            <span className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                              {formatSubjectType(thread.subject.type)}
                            </span>
                            <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              {thread.lastMessageVisibility === "internal"
                                ? "Internal only"
                                : "Customer-visible"}
                            </span>
                            <span className="inline-flex rounded-full border border-[#d6d6d6] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              {formatSubjectType(thread.threadStatus)}
                            </span>
                            {thread.needsResponse ? (
                              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                                Needs response
                              </span>
                            ) : null}
                            {thread.unreadCount > 0 ? (
                              <span className="inline-flex rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                {thread.unreadCount} unread
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {thread.customerReplyNeedsResponse &&
                            thread.latestCustomerReplyPreview
                              ? `Latest portal reply: ${thread.latestCustomerReplyPreview}`
                              : (thread.lastMessagePreview ??
                                "No message preview stored yet.")}
                          </p>
                          {thread.customerReplyNeedsResponse ? (
                            <p className="mt-1 text-xs font-medium leading-5 text-amber-800">
                              Waiting on contractor response. Marking
                              notifications read does not clear this derived
                              reply state; a customer-visible contractor reply
                              does.
                            </p>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            <Link
                              href={thread.customer.href}
                              className="hover:text-slate-900"
                            >
                              {thread.customer.label}
                            </Link>
                            <span className="text-slate-300">/</span>
                            <Link
                              href={thread.project.href}
                              className="hover:text-slate-900"
                            >
                              {thread.project.label}
                            </Link>
                            <span className="text-slate-300">/</span>
                            <Link
                              href={thread.subject.href}
                              className="hover:text-slate-900"
                            >
                              Open source
                            </Link>
                            {thread.subjectSecondaryLink ? (
                              <>
                                <span className="text-slate-300">/</span>
                                <Link
                                  href={thread.subjectSecondaryLink.href}
                                  className="hover:text-slate-900"
                                >
                                  {thread.subjectSecondaryLink.label}
                                </Link>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="shrink-0 text-left lg:text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Latest activity
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDateTime(thread.lastActivityAt)}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Last message: {formatDateTime(thread.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow={threadEmptyState.eyebrow}
                  title={threadEmptyState.title}
                  description={threadEmptyState.description}
                />
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="border border-[#d6d6d6] bg-white">
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Thread preview
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {selectedThread
                    ? selectedThread.subject.label
                    : requestedThreadUnavailable
                      ? "Requested thread unavailable"
                      : "Select a thread"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {selectedThread
                    ? "Review the stored canonical summary and message history here. Replies stay on this same thread inside /communications."
                    : requestedThreadUnavailable
                      ? "The direct thread link did not resolve inside the current filters. Pick a visible thread or clear the context."
                      : "Choose a thread from the queue to inspect its stored canonical messages. Detail pages only surface summary handoff."}
                </p>
              </div>

              {selectedThread ? (
                <div className="space-y-4 px-5 py-4">
                  <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-sm leading-6 text-slate-600">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                          Source context
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                          <Link
                            href={selectedThread.customer.href}
                            className="inline-flex items-center rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                          >
                            {selectedThread.customer.label}
                          </Link>
                          <Link
                            href={selectedThread.project.href}
                            className="inline-flex items-center rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                          >
                            {selectedThread.project.label}
                          </Link>
                          <Link
                            href={selectedThread.subject.href}
                            className="inline-flex items-center rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2.5 py-1 text-[#8f5b32] transition hover:text-[#6c4324]"
                          >
                            {selectedThread.subject.label}
                          </Link>
                          {selectedThread.subjectSecondaryLink ? (
                            <Link
                              href={selectedThread.subjectSecondaryLink.href}
                              className="inline-flex items-center rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1 text-slate-700 transition hover:text-slate-950"
                            >
                              {selectedThread.subjectSecondaryLink.label}
                            </Link>
                          ) : null}
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <p>
                            Latest thread activity{" "}
                            <span className="font-medium text-slate-700">
                              {formatDateTime(selectedThread.lastActivityAt)}
                            </span>
                          </p>
                          <p>
                            Last stored message{" "}
                            <span className="font-medium text-slate-700">
                              {formatDateTime(selectedThread.lastMessageAt)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                          Notification triage
                        </p>
                        <div className="flex flex-wrap justify-end gap-2">
                          <CommunicationNotificationTriageForm
                            mode="thread"
                            threadId={selectedThread.id}
                            query={query}
                            view={view}
                            source={source}
                            disabled={selectedThread.unreadCount === 0}
                          />
                        </div>
                        <p className="text-xs leading-5 text-slate-500">
                          {selectedThread.unreadCount > 0
                            ? `${selectedThread.unreadCount} unread communication notification${
                                selectedThread.unreadCount === 1 ? "" : "s"
                              } on this thread.`
                            : "No unread communication notifications are open on this thread."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedMessages.length > 0 ? (
                    <section className="rounded-[4px] border border-[#e5e5e5] bg-white">
                      <div className="border-b border-[#e5e5e5] px-4 py-3">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                              Conversation history
                            </p>
                            <h4 className="mt-2 text-base font-semibold text-slate-950">
                              Canonical messages on this thread
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500">
                            {selectedMessages.length} stored message
                            {selectedMessages.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-0 px-4 py-4">
                        {selectedMessages.map((message, index) => {
                          const isLast = index === selectedMessages.length - 1;

                          return (
                            <article key={message.id} className="relative pl-8">
                              {!isLast ? (
                                <div className="absolute bottom-0 left-[11px] top-8 w-px bg-[#d6d6d6]" />
                              ) : null}
                              <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border border-[#d6d6d6] bg-white" />
                              <div
                                className={["pb-5", isLast ? "pb-0" : ""].join(
                                  " "
                                )}
                              >
                                <div className="rounded-[4px] border border-[#e5e5e5] bg-[#ffffff] px-4 py-3">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span
                                          className={[
                                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                            getMessageSenderTone(
                                              message.senderType
                                            )
                                          ].join(" ")}
                                        >
                                          {getMessageSenderLabel(
                                            message.senderType
                                          )}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          Message {index + 1}
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                          {getMessageVisibilityLabel(
                                            message.visibility
                                          )}
                                        </span>
                                      </div>
                                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                        {message.body}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-left sm:text-right">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                                        Sent
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        {formatDateTime(message.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ) : (
                    <section className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-white px-4 py-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                        Conversation history
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        No stored messages exist on this thread yet
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        This selected canonical thread exists, but no
                        <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">
                          communication_messages
                        </code>
                        rows are available to review yet.
                      </p>
                    </section>
                  )}

                  <section className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                          Thread reply
                        </p>
                        <h4 className="mt-2 text-base font-semibold text-slate-950">
                          Reply on the existing canonical thread
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Replies are only available from /communications. This
                          saves one new message into the current
                          <code className="mx-1 rounded bg-white px-1.5 py-0.5">
                            communication_messages
                          </code>
                          chain without creating a second inbox, provider send,
                          email/SMS, automation run, or new thread record.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <CommunicationReplyForm
                        threadId={selectedThread.id}
                        query={query}
                        view={view}
                        source={source}
                        copilotHandoff={copilotDraftHandoff}
                        sendReadiness={customerSendReadiness}
                      />
                    </div>
                  </section>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={selectedThread.subject.href}
                      className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#2a2a2a]"
                    >
                      Open source record
                    </Link>
                    <Link
                      href={selectedThread.project.href}
                      className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                    >
                      Open project
                    </Link>
                    <Link
                      href={selectedThread.customer.href}
                      className="inline-flex items-center rounded-[4px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                    >
                      Open customer
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 px-5 py-6">
                  <div className="text-sm leading-6 text-slate-500">
                    Review the queue to choose a stored thread. This page does
                    not create local-only drafts, duplicate portal-side
                    conversations, provider sends, or reply actions outside the
                    shared communications workspace.
                  </div>
                  <section className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Thread reply
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Replies are disabled until you select an existing
                      canonical communication thread from the queue. If a direct
                      thread link is unavailable, clear context or broaden the
                      filters first.
                    </p>
                    <textarea
                      rows={4}
                      disabled
                      placeholder="Select a thread to reply."
                      className="mt-4 min-h-[120px] w-full rounded-[4px] border border-[#d6d6d6] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-500"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-9 items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 text-sm font-medium text-slate-400"
                      >
                        Post reply
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </section>

            <section className="border border-[#d6d6d6] bg-white">
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Unread workflow alerts
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      Stored notifications
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Triage here only updates canonical per-user notification
                      read state. It does not send follow-up messages or trigger
                      automation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <CommunicationNotificationTriageForm
                        mode="all"
                        query={query}
                        view={view}
                        source={source}
                        threadId={selectedThread?.id}
                        disabled={notifications.totalCount === 0}
                      />
                    </div>
                    <p className="text-right text-xs leading-5 text-slate-500">
                      {notifications.totalCount > 0
                        ? `${notifications.totalCount} unread communication notification${
                            notifications.totalCount === 1 ? "" : "s"
                          } are open across this contractor user.`
                        : "No unread communication notifications are open."}
                    </p>
                  </div>
                </div>
              </div>

              {notifications.visibleItems.length > 0 ? (
                <div className="space-y-3 px-5 py-4">
                  {notifications.visibleItems.map((item) => (
                    <article
                      key={item.notificationId}
                      className="rounded-[4px] border border-[#e5e5e5] bg-[#fffcf7] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={item.href}
                            className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fbf5ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32]">
                          {item.badge}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                          {formatDateTime(item.occurredAt)}
                        </p>
                        <Link
                          href={item.href}
                          className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                        >
                          Open record
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                  No unread notifications are currently open for this contractor
                  user.
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
