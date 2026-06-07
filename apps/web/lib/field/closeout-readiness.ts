import type { FieldAssignedWorkJob } from "./assigned-work-read-model";

export type FieldCloseoutReadinessStatus =
  | "blocked"
  | "needs_evidence"
  | "in_progress"
  | "ready_for_review";

export type FieldCloseoutReadinessSignal = {
  key:
    | "daily_log"
    | "field_notes"
    | "field_blockers"
    | "execution_evidence"
    | "completion_handoff";
  label: string;
  status: "clear" | "missing" | "blocked" | "review";
  detail: string;
  href: string;
  actionLabel: string;
};

export type FieldCloseoutReadinessSummary = {
  status: FieldCloseoutReadinessStatus;
  label: string;
  detail: string;
  officeHandoffLabel: string;
  billingReadinessLabel: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  signals: FieldCloseoutReadinessSignal[];
};

function getDailyLogHref(job: FieldAssignedWorkJob) {
  return job.latestDailyLog
    ? `/daily-logs/${job.latestDailyLog.id}`
    : `/daily-logs?compose=1&projectId=${job.project?.id ?? ""}&jobId=${
        job.id
      }#daily-log-create`;
}

function getJobNoteHref(job: FieldAssignedWorkJob) {
  return job.latestDailyLog
    ? `/daily-logs/${job.latestDailyLog.id}?jobId=${job.id}#job-notes`
    : getDailyLogHref(job);
}

function getEvidenceHref(job: FieldAssignedWorkJob) {
  return job.latestDailyLog
    ? `/daily-logs/${job.latestDailyLog.id}#execution-evidence`
    : getDailyLogHref(job);
}

function getBlockerHref(job: FieldAssignedWorkJob) {
  return job.latestOpenFieldBlocker
    ? `/daily-logs/${job.latestOpenFieldBlocker.dailyLogId}#job-notes`
    : getJobNoteHref(job);
}

function getProjectHref(job: FieldAssignedWorkJob) {
  return job.project ? `/projects/${job.project.id}` : `/jobs/${job.id}`;
}

export function buildFieldCloseoutReadinessSummary(
  job: FieldAssignedWorkJob
): FieldCloseoutReadinessSummary {
  const isComplete = job.dispatchStatus === "completed";
  const needsDailyLog = !job.latestDailyLog;
  const needsFieldNotes = job.fieldNoteCount === 0;
  const hasOpenBlockers = job.openFieldBlockerCount > 0;
  const needsEvidence = job.executionAttachmentCount === 0;
  const signals: FieldCloseoutReadinessSignal[] = [
    {
      key: "daily_log",
      label: job.latestDailyLog ? "Daily Log present" : "Daily Log missing",
      status: job.latestDailyLog ? "clear" : "missing",
      detail: job.latestDailyLog
        ? `Latest Daily Log ${job.latestDailyLog.logDate} is linked to this job.`
        : "Closeout review needs the day narrative on the canonical Daily Job Log.",
      href: getDailyLogHref(job),
      actionLabel: job.latestDailyLog ? "Open log" : "Start log"
    },
    {
      key: "field_notes",
      label: needsFieldNotes ? "No Job Notes yet" : "Job Notes present",
      status: needsFieldNotes ? "missing" : "clear",
      detail: needsFieldNotes
        ? "Capture final work completed, remaining work, or site condition context before office handoff."
        : `${job.fieldNoteCount} Job Note${
            job.fieldNoteCount === 1 ? "" : "s"
          } linked to this job.`,
      href: getJobNoteHref(job),
      actionLabel: needsFieldNotes ? "Add note" : "Review notes"
    },
    {
      key: "field_blockers",
      label: hasOpenBlockers ? "Blocker unresolved" : "No open blockers",
      status: hasOpenBlockers ? "blocked" : "clear",
      detail:
        job.latestOpenFieldBlocker?.title ??
        "No open blocker or issue Job Notes are linked to this job.",
      href: getBlockerHref(job),
      actionLabel: hasOpenBlockers ? "Review blocker" : "Open notes"
    },
    {
      key: "execution_evidence",
      label: needsEvidence ? "Evidence missing" : "Evidence present",
      status: needsEvidence ? "missing" : "clear",
      detail: needsEvidence
        ? "Attach field photos or PDFs to the Daily Job Log or Job Notes before closeout review."
        : `${job.executionAttachmentCount} evidence file${
            job.executionAttachmentCount === 1 ? "" : "s"
          } available for office review.`,
      href: getEvidenceHref(job),
      actionLabel: needsEvidence ? "Add evidence" : "Review evidence"
    },
    {
      key: "completion_handoff",
      label: isComplete ? "Job marked complete" : "Execution still active",
      status: isComplete ? "review" : "missing",
      detail: isComplete
        ? "Office can review closeout context before billing action in Financials."
        : "Closeout readiness stays advisory until the canonical job reaches completed status.",
      href: isComplete ? getProjectHref(job) : `/jobs/${job.id}`,
      actionLabel: isComplete ? "Open project" : "Open job"
    }
  ];

  if (hasOpenBlockers) {
    return {
      status: "blocked",
      label: "Closeout blocked",
      detail:
        "Resolve or route open blocker and issue Job Notes before treating this job as closeout-ready.",
      officeHandoffLabel: "Office attention needed",
      billingReadinessLabel: "Not ready to bill",
      primaryActionLabel: "Review blocker",
      primaryActionHref: getBlockerHref(job),
      signals
    };
  }

  if (needsDailyLog || needsFieldNotes || needsEvidence) {
    return {
      status: "needs_evidence",
      label: "Closeout evidence incomplete",
      detail:
        "Daily Log, Job Note, and evidence coverage should be complete before office closeout review.",
      officeHandoffLabel: "Needs field capture",
      billingReadinessLabel: "Proof not complete",
      primaryActionLabel: needsDailyLog
        ? "Start Daily Log"
        : needsFieldNotes
          ? "Add Job Note"
          : "Add evidence",
      primaryActionHref: needsDailyLog
        ? getDailyLogHref(job)
        : needsFieldNotes
          ? getJobNoteHref(job)
          : getEvidenceHref(job),
      signals
    };
  }

  if (!isComplete) {
    return {
      status: "in_progress",
      label: "Capture ready, execution active",
      detail:
        "Field proof is present, but the job is not complete yet. Keep closeout review advisory.",
      officeHandoffLabel: "Monitor execution",
      billingReadinessLabel: "Wait for completion",
      primaryActionLabel: "Open job",
      primaryActionHref: `/jobs/${job.id}`,
      signals
    };
  }

  return {
    status: "ready_for_review",
    label: "Ready for office closeout review",
    detail:
      "Daily Log, Job Notes, field evidence, and completion status are present for office review before Financials acts.",
    officeHandoffLabel: "Ready for office review",
    billingReadinessLabel: "Review before billing",
    primaryActionLabel: "Open project",
    primaryActionHref: getProjectHref(job),
    signals
  };
}
