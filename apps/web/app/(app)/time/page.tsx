import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { NextActionCard } from "@/components/next-action-card";
import { TimePunchForm } from "@/components/time-punch-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPeople } from "@/lib/people/data";
import { listProjects } from "@/lib/projects/data";
import { recordTimePunchEventAction } from "@/lib/time/actions";
import { listOpenTimeCardStates, listTimeCards } from "@/lib/time/data";
import { listJobs } from "@/lib/jobs/data";

type TimePageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
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
  const recentTimeCards = timeCards.slice(0, 12);
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayCards = timeCards.filter((card) => card.workDate === todayDate);
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
    <div className="space-y-6">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Time Tracking
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Workforce time for {organizationContext.organization.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Capture audit-friendly punch events and review derived time cards without stepping into payroll, field logs, or scheduling workflows yet.
          </p>

          <div className="mt-8">
            <WorkspaceSummaryBand
              className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)]"
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
          </div>
        </section>

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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.88fr)]">
          <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
              Current Punch State
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Review who is currently punched in before recording the next event. This keeps the
              current state and the next action in the same workspace instead of splitting them
              across separate page zones.
            </p>
            <div className="mt-5 grid gap-4">
              {openStates.length > 0 ? (
                openStates.map((state) => (
                  <div
                    key={state.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4"
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
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
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

          <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
              Record Punch
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Choose a workforce person, optionally attribute the punch to a project or job, and
              record the next event on the canonical punch log.
            </p>
            {personOptions.length > 0 ? (
              <div className="mt-6">
                <TimePunchForm
                  action={recordTimePunchEventAction}
                  people={personOptions}
                  projects={projectOptions}
                  jobs={jobOptions}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Create at least one active workforce person before recording time.
              </div>
            )}
          </aside>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_200px_180px_140px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
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
          </div>

          <div className="divide-y divide-slate-200">
            {recentTimeCards.length > 0 ? (
              recentTimeCards.map((timeCard) => (
                <Link
                  key={timeCard.id}
                  href={`/time-cards/${timeCard.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
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
                  eyebrow="No time cards yet"
                  title="Record the first punch"
                  description="Time cards appear here automatically once canonical punch events are recorded."
                />
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
