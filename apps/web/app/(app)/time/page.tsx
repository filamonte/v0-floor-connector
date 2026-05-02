import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { TimePunchForm } from "@/components/time-punch-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPeople } from "@/lib/people/data";
import { listProjects } from "@/lib/projects/data";
import { recordTimePunchEventAction } from "@/lib/time/actions";
import { listOpenTimeCardStates, listTimeCards } from "@/lib/time/data";

type TimePageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    eventType?: "punch_in" | "punch_out" | "break_start" | "break_end";
    jobId?: string;
    message?: string;
    personId?: string;
    projectId?: string;
    q?: string;
    view?: "all" | "open" | "today";
  }>;
};

type CurrentStateTone = "positive" | "warning" | "neutral";

function formatTimeCardStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Still open";
  }

  return new Date(value).toLocaleString();
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatEventLabel(eventType: string) {
  switch (eventType) {
    case "punch_in":
      return "Punch in";
    case "punch_out":
      return "Punch out";
    case "break_start":
      return "Break start";
    case "break_end":
      return "Break end";
    default:
      return eventType.replaceAll("_", " ");
  }
}

function getStateBadgeClassName(tone: CurrentStateTone) {
  switch (tone) {
    case "positive":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getActionLinkClassName(tone: "primary" | "secondary" = "secondary") {
  return tone === "primary"
    ? "inline-flex items-center justify-center rounded-[4px] border border-[#17120f] bg-[#17120f] px-4 py-2.5 text-sm font-medium text-[#ffd7bb] transition hover:border-[#17120f] hover:bg-[#2a1c13]"
    : "inline-flex items-center justify-center rounded-[4px] border border-[#d9cdc2] bg-white px-4 py-2.5 text-sm font-medium text-[#4f4034] transition hover:border-[#ef7d32] hover:text-[#221a14]";
}

function buildTimeHref(input: {
  compose?: string;
  eventType?: string;
  jobId?: string;
  personId?: string;
  projectId?: string;
  q?: string;
  view?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  if (input.personId) {
    searchParams.set("personId", input.personId);
  }

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.jobId) {
    searchParams.set("jobId", input.jobId);
  }

  if (input.eventType) {
    searchParams.set("eventType", input.eventType);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/time?${query}` : "/time";
}

export default async function TimePage({ searchParams }: TimePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/time");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Time tracking needs an active organization before punches can be recorded.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [people, projects, jobs, openStates, timeCards] = await Promise.all([
    listPeople(),
    listProjects(),
    listJobs(),
    listOpenTimeCardStates(),
    listTimeCards()
  ]);

  const activePeople = people.filter((person) => person.isActive);
  const linkedPerson =
    activePeople.find((person) => person.membershipUserId === user.id) ?? null;
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayCards = timeCards.filter((card) => card.workDate === todayDate);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view = resolvedSearchParams.view ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);

  const currentUserOpenState = linkedPerson
    ? openStates.find((state) => state.personId === linkedPerson.id) ?? null
    : null;
  const currentUserTodayCards = linkedPerson
    ? todayCards.filter((card) => card.personId === linkedPerson.id)
    : [];
  const currentUserWorkedMinutesToday = currentUserTodayCards.reduce(
    (sum, card) => sum + card.workedMinutes,
    0
  );
  const recentCurrentUserCard =
    currentUserTodayCards[0] ??
    (linkedPerson ? timeCards.find((card) => card.personId === linkedPerson.id) ?? null : null);
  const openSessionsExcludingCurrentUser = linkedPerson
    ? openStates.filter((state) => state.personId !== linkedPerson.id)
    : openStates;
  const teamWorkedMinutesToday = todayCards.reduce(
    (sum, card) => sum + card.workedMinutes,
    0
  );

  const visibleTimeCards = timeCards.filter((timeCard) => {
    const matchesView =
      view === "all"
        ? true
        : view === "open"
          ? timeCard.status === "open"
          : timeCard.workDate === todayDate;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            timeCard.person?.displayName ?? "",
            timeCard.project?.name ?? "",
            timeCard.job?.id ?? "",
            timeCard.status,
            timeCard.entryMode
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesView && matchesQuery;
  });

  const recentTimeCards = visibleTimeCards.slice(0, 12);
  const recentTodayCards = todayCards.slice(0, 6);
  const timeViews = [
    { key: "all", label: "All time cards", count: timeCards.length },
    {
      key: "open",
      label: "Open sessions",
      count: timeCards.filter((card) => card.status === "open").length
    },
    { key: "today", label: "Today", count: todayCards.length }
  ] as const;

  const personOptions = activePeople.map((person) => ({
    id: person.id,
    displayName: person.displayName,
    personType: person.personType
  }));

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name
  }));

  const jobOptions = jobs.map((job) => ({
    id: job.id,
    projectId: job.projectId,
    label: job.project?.name ?? "Job",
    dispatchStatus: job.dispatchStatus
  }));

  const selectedPersonId =
    resolvedSearchParams.personId ?? linkedPerson?.id ?? "";
  const selectedProjectId =
    resolvedSearchParams.projectId ?? currentUserOpenState?.projectId ?? "";
  const selectedJobId =
    resolvedSearchParams.jobId ?? currentUserOpenState?.jobId ?? "";
  const recommendedEventType =
    resolvedSearchParams.eventType ??
    (currentUserOpenState
      ? currentUserOpenState.currentPunchState === "on_break"
        ? "break_end"
        : "punch_out"
      : "punch_in");

  const currentState = linkedPerson
    ? currentUserOpenState
      ? currentUserOpenState.currentPunchState === "on_break"
        ? {
            badge: "On break",
            title: "You are currently on break",
            detail:
              "Your time session is still open. The next canonical event should usually be ending the break before work continues.",
            tone: "warning" as CurrentStateTone
          }
        : {
            badge: "Clocked in",
            title: "You are currently clocked in",
            detail:
              "Your time session is open on the canonical project and job chain. The next event is usually starting a break or punching out.",
            tone: "positive" as CurrentStateTone
          }
      : {
          badge: "Clocked out",
          title: "You are currently clocked out",
          detail:
            "No open time session exists for your linked workforce record. The next canonical event is a punch in.",
          tone: "neutral" as CurrentStateTone
        }
    : {
        badge: "No linked person",
        title: "No workforce person is linked to this login",
        detail:
          "You can still review team time here, but quick personal punch actions need a linked active workforce person record.",
        tone: "warning" as CurrentStateTone
      };

  const quickActionLinks = linkedPerson
    ? currentUserOpenState
      ? currentUserOpenState.currentPunchState === "on_break"
        ? [
            {
              key: "break-end",
              label: "End break",
              href:
                buildTimeHref({
                  compose: "1",
                  eventType: "break_end",
                  personId: linkedPerson.id,
                  projectId: currentUserOpenState.projectId ?? undefined,
                  jobId: currentUserOpenState.jobId ?? undefined
                }) + "#time-punch-create",
              tone: "primary" as const
            }
          ]
        : [
            {
              key: "punch-out",
              label: "Punch out",
              href:
                buildTimeHref({
                  compose: "1",
                  eventType: "punch_out",
                  personId: linkedPerson.id,
                  projectId: currentUserOpenState.projectId ?? undefined,
                  jobId: currentUserOpenState.jobId ?? undefined
                }) + "#time-punch-create",
              tone: "primary" as const
            },
            {
              key: "break-start",
              label: "Start break",
              href:
                buildTimeHref({
                  compose: "1",
                  eventType: "break_start",
                  personId: linkedPerson.id,
                  projectId: currentUserOpenState.projectId ?? undefined,
                  jobId: currentUserOpenState.jobId ?? undefined
                }) + "#time-punch-create",
              tone: "secondary" as const
            }
          ]
      : [
          {
            key: "punch-in",
            label: "Punch in",
            href:
              buildTimeHref({
                compose: "1",
                eventType: "punch_in",
                personId: linkedPerson.id
              }) + "#time-punch-create",
            tone: "primary" as const
          }
        ]
    : [
        {
          key: "record-punch",
          label: "Record punch",
          href:
            buildTimeHref({
              compose: "1",
              eventType: "punch_in"
            }) + "#time-punch-create",
          tone: "primary" as const
        }
      ];

  return (
    <ContractorWorkspacePage
      eyebrow="Time Tracking"
      title={`Time home for ${organizationContext.organization.displayName}`}
      description="Use this as the daily operational time surface: know whether you are clocked in, record the next canonical punch event quickly, and review today’s workforce time without leaving the shared contractor system."
      summary={
        <WorkspaceSummaryBand
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)]"
          items={[
            {
              key: "my-state",
              label: linkedPerson ? "My current state" : "Current state",
              content: (
                <div className="space-y-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStateBadgeClassName(
                      currentState.tone
                    )}`}
                  >
                    {currentState.badge}
                  </span>
                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {linkedPerson ? linkedPerson.displayName : "Team review only"}
                  </p>
                </div>
              )
            },
            {
              key: "open-sessions",
              label: "Open sessions",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {openStates.length}
                </p>
              )
            },
            {
              key: "cards-today",
              label: "Cards today",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {todayCards.length}
                </p>
              )
            },
            {
              key: "worked-today",
              label: linkedPerson ? "My worked time today" : "Team worked today",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {formatDuration(
                    linkedPerson ? currentUserWorkedMinutesToday : teamWorkedMinutesToday
                  )}
                </p>
              )
            }
          ]}
        />
      }
      commandBar={{
        supportSlot: (
          <p>
            Record canonical punch events quickly, keep project and job attribution explicit,
            and review open sessions and today’s time without leaving the shared execution
            chain.
          </p>
        ),
        searchSlot: (
          <form action="/time" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search worker, project, job, or time-card status"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" || showComposer ? (
              <Link
                href="/time"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: timeViews.map((timeView) => {
          const isActive = view === timeView.key;

          return (
            <Link
              key={timeView.key}
              href={buildTimeHref({
                q: query,
                view: timeView.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{timeView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {timeView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildTimeHref({
                compose: "1",
                eventType: recommendedEventType,
                personId: selectedPersonId || undefined,
                projectId: selectedProjectId || undefined,
                jobId: selectedJobId || undefined
              }) + "#time-punch-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#17120f] bg-[#17120f] px-4 py-2.5 text-sm font-medium text-[#ffd7bb] transition hover:border-[#17120f] hover:bg-[#2a1c13]"
          >
            Record punch
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_420px]" : "space-y-4"}>
        <section className="space-y-4">
          {resolvedSearchParams.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <DetailPanel
            title="Current State"
            description="The time home should answer immediately whether you are clocked in, on break, or clocked out, then make the next punch action obvious."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <section className="space-y-5 rounded-[1.75rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fff8ef,#ffffff)] px-6 py-6 shadow-[0_24px_70px_-46px_rgba(57,43,30,0.28)]">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${getStateBadgeClassName(
                      currentState.tone
                    )}`}
                  >
                    {currentState.badge}
                  </span>
                  {linkedPerson ? (
                    <span className="rounded-full border border-[#e3d6c7] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c4a3d]">
                      {linkedPerson.displayName}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <h3 className="text-[1.6rem] font-semibold tracking-tight text-[#2b2118]">
                    {currentState.title}
                  </h3>
                  <p className="max-w-[62ch] text-sm leading-6 text-[#665446]">
                    {currentState.detail}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {quickActionLinks.map((action) => (
                    <Link
                      key={action.key}
                      href={action.href}
                      className={getActionLinkClassName(action.tone)}
                    >
                      {action.label}
                    </Link>
                  ))}
                  {currentUserOpenState ? (
                    <Link
                      href={`/time-cards/${currentUserOpenState.id}`}
                      className={getActionLinkClassName("secondary")}
                    >
                      Review active card
                    </Link>
                  ) : null}
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <section className="rounded-[1.45rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Current attribution
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {currentUserOpenState?.project?.name ??
                      recentCurrentUserCard?.project?.name ??
                      "No project selected"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {currentUserOpenState?.job
                      ? `Job ${currentUserOpenState.job.id.slice(0, 8)} stays on the same execution chain.`
                      : recentCurrentUserCard?.job
                        ? `Recent job attribution: ${recentCurrentUserCard.job.id.slice(0, 8)}.`
                        : "Project-level attribution is valid when no specific job applies."}
                  </p>
                </section>
                <section className="rounded-[1.45rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Today for me
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {linkedPerson
                      ? `${currentUserTodayCards.length} cards / ${formatDuration(
                          currentUserWorkedMinutesToday
                        )}`
                      : "No linked workforce record"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {currentUserOpenState
                      ? `Open since ${formatDateTime(currentUserOpenState.punchInAt)}.`
                      : linkedPerson
                        ? recentCurrentUserCard
                          ? `Most recent punch in was ${formatDateTime(
                              recentCurrentUserCard.punchInAt
                            )}.`
                          : "No time cards have been derived for your workforce record yet."
                        : "Link this login to an active workforce person to make personal punch guidance faster."}
                  </p>
                </section>
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Today Visibility"
            description="Use this section to understand what is active right now and how today’s time is shaping up across the team."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Active sessions
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      Open workforce sessions
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">{openStates.length} open</p>
                </div>
                <div className="grid gap-3">
                  {openStates.length > 0 ? (
                    openStates.slice(0, 6).map((state) => (
                      <div
                        key={state.id}
                        className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-slate-950">
                              {state.person?.displayName ?? "Unknown worker"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {state.project?.name ?? "No project selected"}
                              {state.job
                                ? ` / Job ${state.job.id.slice(0, 8)}`
                                : " / Project-level time"}
                            </p>
                          </div>
                          <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                            {state.currentPunchState === "on_break" ? "On break" : "Clocked in"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          Started {formatDateTime(state.punchInAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <AppEmptyState
                      eyebrow="No open sessions"
                      title="Everyone is currently clocked out"
                      description="Active sessions will show up here once workforce people start punching in."
                    />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Today
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      Today’s team time
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    {todayCards.length} cards / {formatDuration(teamWorkedMinutesToday)}
                  </p>
                </div>
                <div className="grid gap-3">
                  {recentTodayCards.length > 0 ? (
                    recentTodayCards.map((timeCard) => (
                      <LinkedRecordCard
                        key={timeCard.id}
                        href={`/time-cards/${timeCard.id}`}
                        title={timeCard.person?.displayName ?? "Unknown worker"}
                        subtitle={
                          timeCard.project?.name ??
                          "No project attribution"
                        }
                        meta={`${formatDuration(timeCard.workedMinutes)} worked / ${
                          timeCard.job
                            ? `Job ${timeCard.job.id.slice(0, 8)}`
                            : "Project-level time"
                        } / ${formatTimeCardStatusLabel(timeCard.status)}`}
                        badge={
                          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                            {timeCard.personId === linkedPerson?.id ? "You" : "Today"}
                          </span>
                        }
                      />
                    ))
                  ) : (
                    <AppEmptyState
                      eyebrow="No cards today"
                      title="No derived time cards for today yet"
                      description="Today’s time cards will appear here automatically once canonical punch events are recorded."
                    />
                  )}
                </div>
              </section>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Attribution Clarity"
            description="Project and job attribution should stay explicit and safe so time remains useful for project continuity, job review, and daily execution."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <section className="rounded-[1.45rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Project attribution
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    Pick the project when you know it
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Project attribution is valid on its own and keeps time connected to the same delivery record chain as jobs, daily logs, and project review.
                  </p>
                </section>
                <section className="rounded-[1.45rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Job attribution
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    Choose the job only after the project
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The form narrows jobs by project so attribution stays explicit and aligned to the same canonical execution chain.
                  </p>
                </section>
                <section className="rounded-[1.45rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Open-session continuity
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    Break and punch-out events stay on the open session
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The current open time card remains the canonical source for continuing the same work session; this page only makes that state easier to see and act on.
                  </p>
                </section>
              </div>

              <section className="rounded-[1.6rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fdf7ef,#ffffff)] px-5 py-5 shadow-[0_18px_40px_-34px_rgba(57,43,30,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfce] pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                      Primary punch action
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#2b2118]">
                      {formatEventLabel(recommendedEventType)}
                    </h3>
                  </div>
                  <Link
                    href={
                      buildTimeHref({
                        compose: "1",
                        eventType: recommendedEventType,
                        personId: selectedPersonId || undefined,
                        projectId: selectedProjectId || undefined,
                        jobId: selectedJobId || undefined
                      }) + "#time-punch-create"
                    }
                    className={getActionLinkClassName("primary")}
                  >
                    Open punch composer
                  </Link>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[#665446]">
                  <p>
                    The composer stays explicit: choose the workforce person, confirm project
                    attribution, then select a job only when it applies.
                  </p>
                  <p>
                    This does not create a second live-session model. It still records a canonical
                    punch event and lets derived time cards refresh from that event history.
                  </p>
                </div>
              </section>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Manager Review"
            description="Operators and managers can review active sessions and recent time without turning the time home into a reporting page."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Active team
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      Team sessions needing attention
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    {openSessionsExcludingCurrentUser.length} additional open
                  </p>
                </div>
                <div className="grid gap-3">
                  {openSessionsExcludingCurrentUser.length > 0 ? (
                    openSessionsExcludingCurrentUser.slice(0, 5).map((state) => (
                      <div
                        key={state.id}
                        className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {state.person?.displayName ?? "Unknown worker"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {state.project?.name ?? "No project selected"}
                              {state.job ? ` / Job ${state.job.id.slice(0, 8)}` : ""}
                            </p>
                          </div>
                          <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                            {state.currentPunchState === "on_break" ? "Break" : "Live"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Started {formatDateTime(state.punchInAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                      No additional active team sessions need review right now.
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                      Recent cards
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      Recent team time
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    {recentTimeCards.length} visible
                  </p>
                </div>
                <div className="grid gap-3">
                  {timeCards.slice(0, 6).map((timeCard) => (
                    <LinkedRecordCard
                      key={timeCard.id}
                      href={`/time-cards/${timeCard.id}`}
                      title={timeCard.person?.displayName ?? "Unknown worker"}
                      subtitle={new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()}
                      meta={`${timeCard.project?.name ?? "No project"} / ${formatDuration(
                        timeCard.workedMinutes
                      )} worked / ${formatTimeCardStatusLabel(timeCard.status)}`}
                      badge={
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {timeCard.job ? "Job-linked" : "Project-level"}
                        </span>
                      }
                    />
                  ))}
                </div>
              </section>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Historical and Recent Cards"
            description="Use filters and search when you need to review broader recent time without turning the page into a reporting-heavy admin view."
          >
            <div className="space-y-4">
              {recentTimeCards.length > 0 ? (
                recentTimeCards.map((timeCard) => (
                  <Link
                    key={timeCard.id}
                    href={`/time-cards/${timeCard.id}`}
                    className="group block rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-4 transition hover:bg-slate-50/70"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_220px_180px_150px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {timeCard.person?.displayName ?? "Unknown worker"}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()} /{" "}
                          {formatDateTime(timeCard.punchInAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Attribution
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {timeCard.project?.name ?? "No project"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {timeCard.job
                            ? `Job ${timeCard.job.id.slice(0, 8)} / same execution chain`
                            : "Project-level attribution"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <p className="text-sm font-medium capitalize text-slate-700">
                          {formatTimeCardStatusLabel(timeCard.status)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {timeCard.entryMode.replaceAll("_", " ")}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Worked
                        </p>
                        <p className="text-sm font-medium text-slate-950">
                          {formatDuration(timeCard.workedMinutes)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Breaks {formatDuration(timeCard.breakMinutes)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <AppEmptyState
                  eyebrow={timeCards.length > 0 ? "No matching time cards" : "No time cards yet"}
                  title={timeCards.length > 0 ? "Adjust the time filters" : "Record the first punch"}
                  description={
                    timeCards.length > 0
                      ? "Try a broader search or switch views to find the time record you need."
                      : "Time cards appear here automatically once canonical punch events are recorded."
                  }
                />
              )}
            </div>
          </DetailPanel>
        </section>

        <WorkspaceComposerSheet
          id="time-punch-create"
          title="Record punch"
          description="Choose a workforce person, confirm project and optional job attribution, and record the next canonical punch event."
          open={showComposer}
          openHref={
            buildTimeHref({
              q: query,
              view,
              compose: "1",
              eventType: recommendedEventType,
              personId: selectedPersonId || undefined,
              projectId: selectedProjectId || undefined,
              jobId: selectedJobId || undefined
            }) + "#time-punch-create"
          }
          closeHref={buildTimeHref({ q: query, view })}
          openLabel="Open punch composer"
        >
          {personOptions.length > 0 ? (
            <TimePunchForm
              action={recordTimePunchEventAction}
              people={personOptions}
              projects={projectOptions}
              jobs={jobOptions}
              defaultPersonId={selectedPersonId}
              defaultProjectId={selectedProjectId}
              defaultJobId={selectedJobId}
              recommendedEventType={recommendedEventType}
            />
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Create at least one active workforce person before recording time.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
