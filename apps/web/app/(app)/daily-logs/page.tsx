import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { DailyLogForm } from "@/components/daily-log-form";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { createDailyLogAction } from "@/lib/daily-logs/actions";
import { listDailyLogs } from "@/lib/daily-logs/data";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type DailyLogsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    projectId?: string;
    jobId?: string;
  }>;
};

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getStatusClasses(status: string) {
  return status === "finalized"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
}

export default async function DailyLogsPage({
  searchParams
}: DailyLogsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/daily-logs");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Daily execution records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [dailyLogs, projects, jobs] = await Promise.all([
    listDailyLogs(),
    listProjects(),
    listJobs()
  ]);

  const draftCount = dailyLogs.filter((log) => log.status === "draft").length;
  const blockedCount = dailyLogs.filter((log) => Boolean(log.delaysOrBlockers)).length;
  const nextAction =
    draftCount > 0
      ? {
          title: "Tighten the open draft logs",
          description:
            "Draft daily logs already exist, so the highest-value next step is finishing narrative details and field notes before more project days stack up."
        }
      : {
          title: "Capture the next project day",
          description:
            "No draft execution records are waiting, so the next operational step is creating the next daily log as work moves through the field."
        };

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
  const defaultProjectId = projects.some(
    (project) => project.id === resolvedSearchParams.projectId
  )
    ? resolvedSearchParams.projectId
    : undefined;
  const defaultJobId = jobs.some((job) => job.id === resolvedSearchParams.jobId)
    ? resolvedSearchParams.jobId
    : undefined;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Daily Execution
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Project-day field logs for {organizationContext.organization.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Use daily logs as the canonical execution record for what happened on site, what is blocked, and what labor continuity already exists on the same project day.
          </p>

          <div className="mt-8">
            <WorkspaceSummaryBand
              className="grid gap-4 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)]"
              items={[
                {
                  key: "total-logs",
                  label: "Daily logs",
                  content: (
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                      {dailyLogs.length}
                    </p>
                  )
                },
                {
                  key: "drafts",
                  label: "Draft logs",
                  content: (
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                      {draftCount}
                    </p>
                  )
                },
                {
                  key: "blocked-days",
                  label: "Days with blockers",
                  content: (
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                      {blockedCount}
                    </p>
                  )
                },
                {
                  key: "next-action",
                  label: "Next best action",
                  content: (
                    <NextActionCard
                      eyebrow="Execution guidance"
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

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="hidden grid-cols-[minmax(0,1fr)_220px_160px_120px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
              <span>Daily log</span>
              <span>Project / job</span>
              <span>Weather</span>
              <span className="text-right">Status</span>
            </div>
            <div className="md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Daily logs
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {dailyLogs.length > 0 ? (
              dailyLogs.map((dailyLog) => (
                <Link
                  key={dailyLog.id}
                  href={`/daily-logs/${dailyLog.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_160px_120px] md:items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {dailyLog.summary?.trim() || `${formatDate(dailyLog.logDate)} field log`}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {formatDate(dailyLog.logDate)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {dailyLog.workCompleted?.trim() || "Work-completed narrative has not been captured yet."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Attribution
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {dailyLog.project?.name ?? "No project"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {dailyLog.job ? `Job ${dailyLog.job.id.slice(0, 8)}` : "Project-day log"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Weather
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {dailyLog.weatherSummary ?? "No weather summary"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {dailyLog.temperatureHighF !== null || dailyLog.temperatureLowF !== null
                          ? `${dailyLog.temperatureLowF ?? "?"}F to ${dailyLog.temperatureHighF ?? "?"}F`
                          : dailyLog.weatherConditions ?? "No conditions entered"}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                          dailyLog.status
                        )}`}
                      >
                        {formatStatusLabel(dailyLog.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No daily logs yet"
                  title="Create the first project-day execution record"
                  description="Daily logs become the canonical field execution layer without inventing separate issue, blocker, or punch-list modules."
                />
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          New Daily Log
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Start a project-day record, optionally attach one dominant job, and keep execution notes inside the same daily-log workflow.
        </p>
        <div className="mt-6">
          <DailyLogForm
            action={createDailyLogAction}
            submitLabel="Create daily log"
            pendingLabel="Creating daily log..."
            projects={projectOptions}
            jobs={jobOptions}
            defaultProjectId={defaultProjectId}
            defaultJobId={defaultJobId}
          />
        </div>
      </aside>
    </div>
  );
}
