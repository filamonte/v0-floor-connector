import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

type ReadyToScheduleActionPanelProps = {
  projectId: string;
  projectName: string;
  estimateId?: string | null;
  contractId?: string | null;
  readyToScheduleAt?: string | null;
  jobCount: number;
  unscheduledJobCount: number;
  unscheduledJobId?: string | null;
  source: "contract" | "project";
};

function buildJobsCreateHref(input: {
  projectId: string;
  estimateId?: string | null;
  contractId?: string | null;
}) {
  const searchParams = new URLSearchParams({
    projectId: input.projectId,
    compose: "1"
  });

  if (input.estimateId) {
    searchParams.set("estimateId", input.estimateId);
  }

  if (input.contractId) {
    searchParams.set("contractId", input.contractId);
  }

  return `/jobs?${searchParams.toString()}`;
}

function buildScheduleHref(
  projectId: string,
  unscheduledJobCount: number,
  unscheduledJobId?: string | null
) {
  const searchParams = new URLSearchParams({ projectId });

  if (unscheduledJobCount > 0) {
    searchParams.set("view", "unscheduled");
    searchParams.set("action", "schedule");
  }

  if (unscheduledJobId) {
    searchParams.set("jobId", unscheduledJobId);
  }

  return `/schedule?${searchParams.toString()}`;
}

function formatReadyAt(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "Readiness gate cleared";
}

export function ReadyToScheduleActionPanel({
  projectId,
  projectName,
  estimateId,
  contractId,
  readyToScheduleAt,
  jobCount,
  unscheduledJobCount,
  unscheduledJobId,
  source
}: ReadyToScheduleActionPanelProps) {
  const hasJobs = jobCount > 0;
  const hasUnscheduledJobs = unscheduledJobCount > 0;
  const createJobHref = buildJobsCreateHref({ projectId, estimateId, contractId });
  const scheduleHref = buildScheduleHref(
    projectId,
    unscheduledJobCount,
    unscheduledJobId
  );
  const primaryActionHref = hasJobs || hasUnscheduledJobs ? scheduleHref : createJobHref;
  const primaryActionLabel = hasUnscheduledJobs
    ? "Schedule job"
    : hasJobs
      ? "Open schedule"
      : "Create job";
  const secondaryActionHref = hasJobs || hasUnscheduledJobs ? createJobHref : scheduleHref;
  const secondaryActionLabel = hasUnscheduledJobs
    ? "Create another job"
    : hasJobs
      ? "Create another job"
      : "Open schedule";

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800">
            Ready to schedule
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Sign to schedule handoff is clear
          </h3>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-emerald-900">
            {source === "contract"
              ? "The contract is fully signed and the project readiness gate is clear. Continue into canonical job creation, then place the job on the shared schedule."
              : "The project readiness gate is clear. Continue from signed commercial scope into canonical job creation and scheduling without leaving the project chain."}
          </p>
        </div>
        <span className="inline-flex flex-shrink-0 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
          {formatReadyAt(readyToScheduleAt)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-emerald-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            1. Signed
          </p>
          <p className="mt-2 font-medium text-slate-950">{projectName}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            The commercial gate is complete on the shared project record.
          </p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            2. Create job
          </p>
          <p className="mt-2 font-medium text-slate-950">
            {hasJobs ? `${jobCount} job${jobCount === 1 ? "" : "s"} created` : "No job yet"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {hasJobs
              ? "Use the schedule workspace for timing and crew follow-through."
              : "Jobs remain the canonical execution record for this project."}
          </p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            3. Schedule job
          </p>
          <p className="mt-2 font-medium text-slate-950">
            {hasUnscheduledJobs
              ? `${unscheduledJobCount} waiting on schedule`
              : hasJobs
                ? "Job schedule already set"
                : "Create the job first"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {hasUnscheduledJobs
              ? "Scheduling stays on the existing job schedule fields."
              : hasJobs
                ? "Review calendar timing or crew details on the shared schedule."
                : "Scheduling starts after the first canonical job exists."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <Link
          href={primaryActionHref}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
        >
          {hasJobs || hasUnscheduledJobs ? (
            <CalendarDays className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {primaryActionLabel}
        </Link>
        <Link
          href={secondaryActionHref}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          {hasJobs || hasUnscheduledJobs ? (
            <Plus className="h-4 w-4" />
          ) : (
            <CalendarDays className="h-4 w-4" />
          )}
          {secondaryActionLabel}
        </Link>
      </div>
    </section>
  );
}
