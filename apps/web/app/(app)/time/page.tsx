import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { NextActionCard } from "@/components/next-action-card";
import { TimePunchForm } from "@/components/time-punch-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPeople } from "@/lib/people/data";
import { listProjects } from "@/lib/projects/data";
import { recordTimePunchEventAction } from "@/lib/time/actions";
import { listOpenTimeCardStates, listTimeCards } from "@/lib/time/data";
import { listJobs } from "@/lib/jobs/data";

type TimePageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    view?: "all" | "open" | "today";
  }>;
};

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

function buildTimeHref(input: {
  q?: string;
  view?: string;
  compose?: string;
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
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayCards = timeCards.filter((card) => card.workDate === todayDate);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view = resolvedSearchParams.view ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const nextAction =
    openStates.length > 0
      ? {
          title: "Track the next punch event",
          description:
            "Open sessions already exist, so the highest-value action is recording the next punch-out or break event cleanly on the canonical log."
        }
      : {
          title: "Record the next punch in",
          description:
            "No sessions are currently open, so the next operational step is starting the next workforce time event with the right person and attribution."
        };
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
    status: job.status
  }));

  return (
    <ContractorWorkspacePage
      eyebrow="Time Tracking"
      title={`Workforce time for ${organizationContext.organization.displayName}`}
      description="Capture audit-friendly punch events and review derived time cards without stepping into payroll, field logs, or scheduling workflows yet."
      summary={
        <WorkspaceSummaryBand
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)]"
          items={[
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
              key: "active-people",
              label: "Active people",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {activePeople.length}
                </p>
              )
            },
            {
              key: "next-action",
              label: "Next best action",
              content: (
                <NextActionCard
                  eyebrow="Time guidance"
                  title={nextAction.title}
                  description={nextAction.description}
                  className="space-y-3 text-sm leading-6 text-slate-600"
                />
              )
            }
          ]}
        />
      }
      commandBar={{
        supportSlot: (
          <p>
            Review open punch state, search recent time cards, and open the punch composer only when you are ready to record the next event.
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
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
              href={buildTimeHref({ q: query, view: timeView.key, compose: showComposer ? "1" : undefined })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
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
            href={buildTimeHref({ q: query, view, compose: "1" }) + "#time-punch-create"}
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            Record punch
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_400px]" : "space-y-4"}>
        <section className="space-y-6">
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

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f7d92]">
                    Current punch state
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                    Open workforce sessions
                  </h3>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {openStates.length} open
                </p>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:p-6">
              {openStates.length > 0 ? (
                openStates.map((state) => (
                  <div
                    key={state.id}
                    className="rounded-[4px] border border-[#e5ebf2] bg-[#fbfcfe] px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {state.person?.displayName ?? "Unknown worker"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {state.project?.name ?? "No project selected"}
                          {state.job ? ` | Job ${state.job.id.slice(0, 8)}` : ""}
                        </p>
                      </div>
                      <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                        {state.currentPunchState === "on_break" ? "On break" : "Punched in"}
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
                  title="Everyone is currently punched out"
                  description="Open sessions will show up here once workforce people start punching in."
                />
              )}
            </div>
          </section>

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.2fr)_200px_180px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Time card</span>
                  <span>Project/job</span>
                  <span>Status</span>
                  <span className="text-right">Worked</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Recent time cards
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {recentTimeCards.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {recentTimeCards.length > 0 ? (
                recentTimeCards.map((timeCard) => (
                  <Link
                    key={timeCard.id}
                    href={`/time-cards/${timeCard.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_200px_180px_140px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {timeCard.person?.displayName ?? "Unknown worker"}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()} |{" "}
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
                          {timeCard.job ? `Job ${timeCard.job.id.slice(0, 8)}` : "No job"}
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
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={timeCards.length > 0 ? "No matching time cards" : "No time cards yet"}
                    title={timeCards.length > 0 ? "Adjust the time filters" : "Record the first punch"}
                    description={
                      timeCards.length > 0
                        ? "Try a broader search or switch views to find the time record you need."
                        : "Time cards appear here automatically once canonical punch events are recorded."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="time-punch-create"
          title="Record punch"
          description="Choose a workforce person, optionally add project or job attribution, and record the next canonical punch event."
          open={showComposer}
          openHref={buildTimeHref({ q: query, view, compose: "1" }) + "#time-punch-create"}
          closeHref={buildTimeHref({ q: query, view })}
          openLabel="Open punch composer"
        >
          {personOptions.length > 0 ? (
            <TimePunchForm
              action={recordTimePunchEventAction}
              people={personOptions}
              projects={projectOptions}
              jobs={jobOptions}
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
