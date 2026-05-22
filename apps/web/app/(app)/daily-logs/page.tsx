import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { DailyLogQuickCreateForm } from "@/components/daily-log-quick-create-form";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateDailyLogAction } from "@/lib/daily-logs/actions";
import { listDailyLogs } from "@/lib/daily-logs/data";
import { isDailyLogDateKey } from "@/lib/daily-logs/links";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type DailyLogsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    status?: "all" | "draft" | "finalized" | "blocked";
    projectId?: string;
    jobId?: string;
    logDate?: string;
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

function buildDailyLogsHref(input: {
  q?: string;
  status?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/daily-logs?${query}` : "/daily-logs";
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
        Daily execution records need an active organization before they can be
        created. Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [dailyLogs, projects, jobs] = await Promise.all([
    listDailyLogs(),
    listProjects(),
    listJobs()
  ]);

  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId) ||
    Boolean(resolvedSearchParams.jobId);
  const draftCount = dailyLogs.filter((log) => log.status === "draft").length;
  const blockedCount = dailyLogs.filter((log) =>
    Boolean(log.delaysOrBlockers)
  ).length;
  const nextAction =
    draftCount > 0
      ? {
          title: "Requires follow-up: tighten the open draft logs",
          description:
            "Draft daily logs already exist, so the highest-value next step is finishing narrative details, blockers, field notes, and labor evidence before more project days stack up."
        }
      : {
          title: "Ready: capture the next project day",
          description:
            "No draft execution records are waiting, so the next operational step is creating the next daily log as work moves through the job/schedule stage."
        };
  const filteredDailyLogs = dailyLogs.filter((dailyLog) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "blocked"
          ? Boolean(dailyLog.delaysOrBlockers)
          : dailyLog.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            dailyLog.project?.name ?? "",
            dailyLog.job?.id ?? "",
            dailyLog.summary ?? "",
            dailyLog.workCompleted ?? "",
            dailyLog.weatherSummary ?? "",
            dailyLog.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
  const dailyLogViews = [
    { key: "all", label: "All logs", count: dailyLogs.length },
    { key: "draft", label: "Draft", count: draftCount },
    {
      key: "finalized",
      label: "Finalized",
      count: dailyLogs.filter((log) => log.status === "finalized").length
    },
    { key: "blocked", label: "With blockers", count: blockedCount }
  ] as const;

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
  const defaultProjectId = projects.some(
    (project) => project.id === resolvedSearchParams.projectId
  )
    ? resolvedSearchParams.projectId
    : undefined;
  const defaultJobId = jobs.some((job) => job.id === resolvedSearchParams.jobId)
    ? resolvedSearchParams.jobId
    : undefined;
  const defaultLogDate = isDailyLogDateKey(resolvedSearchParams.logDate)
    ? resolvedSearchParams.logDate
    : undefined;

  return (
    <ContractorWorkspacePage
      eyebrow="Daily Logs"
      title={`Project-day field logs for ${organizationContext.organization.displayName}`}
      description="Use daily logs as the canonical project-day record for what happened on site, what is blocked, and how labor, attachments, and job execution connect back to the same project spine."
      summary={
        <WorkspaceSummaryBand
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)]"
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
      }
      commandBar={{
        supportSlot: (
          <p>
            Review project-day execution records, see which project or job each
            one came from, and open the full workspace when the next field
            follow-up is ready. Upstream readiness still belongs in Project
            Workspace.
          </p>
        ),
        searchSlot: (
          <form
            action="/daily-logs"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, summary, weather, or work completed"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
              <Link
                href="/daily-logs"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: dailyLogViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildDailyLogsHref({
                q: query,
                status: view.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildDailyLogsHref({
                q: query,
                status: statusFilter,
                compose: "1"
              }) + "#daily-log-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New daily log
          </Link>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_400px]"
            : "space-y-4"
        }
      >
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

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1fr)_220px_160px_120px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
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
                <p className="text-sm leading-6 text-slate-500">
                  {filteredDailyLogs.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredDailyLogs.length > 0 ? (
                filteredDailyLogs.map((dailyLog) => (
                  <Link
                    key={dailyLog.id}
                    href={`/daily-logs/${dailyLog.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_160px_120px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {dailyLog.summary?.trim() ||
                            `${formatDate(dailyLog.logDate)} field log`}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {formatDate(dailyLog.logDate)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {dailyLog.workCompleted?.trim() ||
                            "Work-completed narrative has not been captured yet."}
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
                          {dailyLog.job
                            ? `Job ${dailyLog.job.id.slice(0, 8)} | job/schedule evidence stays tied to the same job record`
                            : "Project-day log | supports the wider project execution chain"}
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
                          {dailyLog.temperatureHighF !== null ||
                          dailyLog.temperatureLowF !== null
                            ? `${dailyLog.temperatureLowF ?? "?"}F to ${dailyLog.temperatureHighF ?? "?"}F`
                            : (dailyLog.weatherConditions ??
                              "No conditions entered")}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span
                          className={`inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
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
                    eyebrow={
                      dailyLogs.length > 0
                        ? "No matching daily logs"
                        : "No daily logs yet"
                    }
                    title={
                      dailyLogs.length > 0
                        ? "Adjust the execution filters"
                        : "Create the first project-day execution record"
                    }
                    description={
                      dailyLogs.length > 0
                        ? "Try a broader search or switch views to find the execution record you need."
                        : "Daily logs become the canonical field execution layer for the job/schedule stage without inventing separate issue, blocker, or punch-list modules."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="daily-log-create"
          title="Quick create daily log"
          description="Capture the minimum project-day context here, create the canonical daily log, and then finish field notes, blockers, labor, and attachments in the full workspace."
          open={showComposer}
          openHref={
            buildDailyLogsHref({
              q: query,
              status: statusFilter,
              compose: "1"
            }) + "#daily-log-create"
          }
          closeHref={buildDailyLogsHref({ q: query, status: statusFilter })}
          openLabel="Open daily-log quick create"
        >
          <DailyLogQuickCreateForm
            action={quickCreateDailyLogAction}
            projects={projectOptions}
            jobs={jobOptions}
            defaultProjectId={defaultProjectId}
            defaultJobId={defaultJobId}
            defaultLogDate={defaultLogDate}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
