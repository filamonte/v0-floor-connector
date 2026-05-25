import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DailyLogForm } from "@/components/daily-log-form";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { ExecutionAttachmentForm } from "@/components/execution-attachment-form";
import {
  FieldExecutionCommandBand,
  fieldExecutionHeaderShellClassName
} from "@/components/field-execution-command-band";
import { FieldNoteForm } from "@/components/field-note-form";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import {
  archiveExecutionAttachmentAction,
  createExecutionAttachmentAction,
  createFieldNoteAction,
  restoreExecutionAttachmentAction,
  updateDailyLogAction,
  updateFieldNoteAction
} from "@/lib/daily-logs/actions";
import {
  getDailyLogById,
  getDailyLogLaborSummary
} from "@/lib/daily-logs/data";
import { buildDailyLogSectionHref } from "@/lib/daily-logs/links";
import {
  listExecutionAttachmentsByFieldNotes,
  listExecutionAttachmentsBySubject,
  resolveExecutionAttachmentPreviews,
  type ExecutionAttachmentPreviewListItem
} from "@/lib/execution-attachments/data";
import { partitionExecutionAttachmentsByArchiveState } from "@/lib/execution-attachments/lifecycle";
import { isExternalExecutionAttachmentReference } from "@/lib/execution-attachments/preview";
import { listFieldNotesByDailyLog } from "@/lib/field-notes/data";
import { getFieldNoteTypeLabel } from "@/lib/field-notes/labels";
import { listJobs } from "@/lib/jobs/data";
import { listPeople } from "@/lib/people/data";
import { listProjects } from "@/lib/projects/data";
import { listTimeCardsByProjectAndWorkDate } from "@/lib/time/data";
import type {
  ExecutionAttachment as ExecutionAttachmentRecord,
  FieldNoteType
} from "@floorconnector/types";

type DailyLogDetailPageProps = {
  params: Promise<{
    dailyLogId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    noteType?: string;
  }>;
};

const fieldNoteTypeOrder = [
  "blocker",
  "issue",
  "punch_list",
  "general",
  "labor",
  "material",
  "equipment"
] as const;

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatNoteTypeLabel(value: string) {
  return getFieldNoteTypeLabel(value);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getDailyLogStatusClasses(status: string) {
  return status === "finalized"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
}

function getFieldNoteStatusClasses(status: string) {
  switch (status) {
    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "noted":
      return "border-[#d6d6d6] bg-[#f8f8f8] text-[#2a2a2a]";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

function isQuickFieldNoteType(
  value: string | undefined
): value is FieldNoteType {
  return value === "blocker" || value === "issue";
}

function getFieldNoteCardClasses(noteType: string, status: string) {
  if (status === "open" && noteType === "blocker") {
    return "rounded-lg border border-amber-300 bg-amber-50/70 px-4 py-4 sm:px-5 sm:py-5";
  }

  if (status === "open" && noteType === "issue") {
    return "rounded-lg border border-orange-200 bg-orange-50/60 px-4 py-4 sm:px-5 sm:py-5";
  }

  return "rounded-lg border border-slate-200 bg-white px-4 py-4 sm:px-5 sm:py-5";
}

function renderAttachmentPreviewAction(
  attachment: ExecutionAttachmentPreviewListItem
) {
  if (isExternalExecutionAttachmentReference(attachment.storagePath)) {
    return (
      <a
        href={attachment.storagePath}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-brand-700"
      >
        Open attachment reference
      </a>
    );
  }

  if (!attachment.preview.signedUrl) {
    return attachment.preview.unavailableLabel;
  }

  return (
    <a
      href={attachment.preview.signedUrl}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-brand-700"
    >
      {attachment.preview.actionLabel}
    </a>
  );
}

function renderArchiveAttachmentAction(input: {
  attachment: ExecutionAttachmentPreviewListItem;
  dailyLogId: string;
  projectId: string;
  jobId: string | null;
}) {
  return (
    <form action={archiveExecutionAttachmentAction} className="mt-4 space-y-3">
      <input type="hidden" name="attachmentId" value={input.attachment.id} />
      <input type="hidden" name="dailyLogId" value={input.dailyLogId} />
      <input type="hidden" name="projectId" value={input.projectId} />
      <input type="hidden" name="jobId" value={input.jobId ?? ""} />
      <label className="block text-xs font-medium text-slate-600">
        Archive reason
        <input
          name="reason"
          type="text"
          maxLength={1000}
          placeholder="Optional reason"
          className="mt-2 min-h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Archive evidence
        </button>
        <span className="text-xs leading-5 text-slate-500">
          Hides it from active proof views; the stored file is kept.
        </span>
      </div>
    </form>
  );
}

function renderRestoreAttachmentAction(input: {
  attachment: ExecutionAttachmentRecord;
  dailyLogId: string;
  projectId: string;
  jobId: string | null;
}) {
  return (
    <form action={restoreExecutionAttachmentAction} className="mt-4 space-y-3">
      <input type="hidden" name="attachmentId" value={input.attachment.id} />
      <input type="hidden" name="dailyLogId" value={input.dailyLogId} />
      <input type="hidden" name="projectId" value={input.projectId} />
      <input type="hidden" name="jobId" value={input.jobId ?? ""} />
      <label className="block text-xs font-medium text-slate-600">
        Restore reason
        <input
          name="reason"
          type="text"
          maxLength={1000}
          placeholder="Optional reason"
          className="mt-2 min-h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Restore evidence
      </button>
    </form>
  );
}

function renderArchivedAttachmentCard(input: {
  attachment: ExecutionAttachmentRecord;
  dailyLogId: string;
  projectId: string;
  jobId: string | null;
}) {
  return (
    <div
      key={input.attachment.id}
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {input.attachment.fileName}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {input.attachment.mimeType}
          </p>
        </div>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          Archived
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {input.attachment.caption ?? "No caption provided."}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Hidden from active field evidence and proof counts. Stored file kept for
        record review.
      </p>
      {input.attachment.archivedAt ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Archived {formatDateTime(input.attachment.archivedAt)}
        </p>
      ) : null}
      {input.attachment.archiveReason ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Reason: {input.attachment.archiveReason}
        </p>
      ) : null}
      {renderRestoreAttachmentAction(input)}
    </div>
  );
}

export default async function DailyLogDetailPage({
  params,
  searchParams
}: DailyLogDetailPageProps) {
  const { dailyLogId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const defaultQuickNoteType = isQuickFieldNoteType(
    resolvedSearchParams.noteType
  )
    ? resolvedSearchParams.noteType
    : "general";
  const dailyLog = await getDailyLogById(
    dailyLogId,
    `/daily-logs/${dailyLogId}`
  );

  if (!dailyLog) {
    notFound();
  }

  const [
    projects,
    jobs,
    people,
    fieldNotes,
    laborSummary,
    timeCards,
    rawDailyLogAttachments
  ] = await Promise.all([
    listProjects(),
    listJobs(),
    listPeople(),
    listFieldNotesByDailyLog(dailyLog.id, `/daily-logs/${dailyLog.id}`),
    getDailyLogLaborSummary(dailyLog.id, `/daily-logs/${dailyLog.id}`),
    listTimeCardsByProjectAndWorkDate(
      dailyLog.projectId,
      dailyLog.logDate,
      `/daily-logs/${dailyLog.id}`
    ),
    listExecutionAttachmentsBySubject(
      "daily_log",
      dailyLog.id,
      `/daily-logs/${dailyLog.id}`,
      { includeArchived: true }
    )
  ]);
  const rawFieldNoteAttachmentsWithArchived =
    await listExecutionAttachmentsByFieldNotes(
      fieldNotes.map((fieldNote) => fieldNote.id),
      `/daily-logs/${dailyLog.id}`,
      { includeArchived: true }
    );
  const dailyLogAttachmentPartition =
    partitionExecutionAttachmentsByArchiveState(rawDailyLogAttachments);
  const fieldNoteAttachmentPartition =
    partitionExecutionAttachmentsByArchiveState(
      rawFieldNoteAttachmentsWithArchived
    );
  const dailyLogAttachments = dailyLogAttachmentPartition.active;
  const archivedDailyLogAttachments = dailyLogAttachmentPartition.archived;
  const rawFieldNoteAttachments = fieldNoteAttachmentPartition.active;
  const archivedFieldNoteAttachments = fieldNoteAttachmentPartition.archived;
  const [fieldNoteAttachments, dailyLogAttachmentPreviews] = await Promise.all([
    resolveExecutionAttachmentPreviews(
      rawFieldNoteAttachments,
      `/daily-logs/${dailyLog.id}`
    ),
    resolveExecutionAttachmentPreviews(
      dailyLogAttachments,
      `/daily-logs/${dailyLog.id}`
    )
  ]);

  const projectJobs = jobs
    .filter((job) => job.projectId === dailyLog.projectId)
    .map((job) => ({
      id: job.id,
      label: job.project?.name ?? "Job",
      dispatchStatus: job.dispatchStatus
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
  const activePeople = people
    .filter((person) => person.isActive)
    .map((person) => ({
      id: person.id,
      displayName: person.displayName,
      personType: person.personType
    }));
  const timeCardOptions = timeCards.map((timeCard) => ({
    id: timeCard.id,
    label: timeCard.person?.displayName ?? "Unknown worker",
    meta: `${formatDuration(timeCard.workedMinutes)} | ${formatStatusLabel(timeCard.status)}`
  }));
  const openBlockerNotes = fieldNotes.filter(
    (fieldNote) =>
      fieldNote.status === "open" && fieldNote.noteType === "blocker"
  );
  const openIssueNotes = fieldNotes.filter(
    (fieldNote) => fieldNote.status === "open" && fieldNote.noteType === "issue"
  );
  const unresolvedFieldNotes = fieldNotes.filter(
    (fieldNote) => fieldNote.status !== "resolved"
  );
  const activeEvidenceCount =
    dailyLogAttachments.length + fieldNoteAttachments.length;
  const nextAction =
    dailyLog.status === "draft"
      ? {
          title: "Finish the execution record",
          description:
            "This Daily Job Log is still in draft, so the next practical step is tightening the narrative, blockers, and Job Notes before treating the day as complete."
        }
      : {
          title: "Use this as the project-day reference",
          description:
            "This execution record is finalized, so the main task now is using it as the day-level reference point for field context on the connected project and job chain."
        };
  const notesByType = new Map<string, typeof fieldNotes>();
  const attachmentsByFieldNoteId = new Map<
    string,
    typeof fieldNoteAttachments
  >();
  const archivedAttachmentsByFieldNoteId = new Map<
    string,
    typeof archivedFieldNoteAttachments
  >();

  for (const noteType of fieldNoteTypeOrder) {
    notesByType.set(
      noteType,
      fieldNotes.filter((fieldNote) => fieldNote.noteType === noteType)
    );
  }

  for (const fieldNote of fieldNotes) {
    attachmentsByFieldNoteId.set(
      fieldNote.id,
      fieldNoteAttachments.filter(
        (attachment) => attachment.subjectId === fieldNote.id
      )
    );
    archivedAttachmentsByFieldNoteId.set(
      fieldNote.id,
      archivedFieldNoteAttachments.filter(
        (attachment) => attachment.subjectId === fieldNote.id
      )
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className={fieldExecutionHeaderShellClassName}>
          <div className="p-5 sm:p-6">
            <DetailPageHeader
              eyebrow="Daily Execution Workspace"
              title={
                dailyLog.summary?.trim() ||
                `${formatDate(dailyLog.logDate)} field log`
              }
              description="Use this page as the project-day execution workspace for field narrative, blockers, Job Notes, field evidence, and connected labor continuity on the same project/job chain."
              backHref="/daily-logs"
              backLabel="Back to daily logs"
              actions={
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/projects/${dailyLog.projectId}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Open Project Workspace
                  </Link>
                  {dailyLog.jobId ? (
                    <Link
                      href={`/jobs/${dailyLog.jobId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Open linked job
                    </Link>
                  ) : null}
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getDailyLogStatusClasses(
                      dailyLog.status
                    )}`}
                  >
                    {formatStatusLabel(dailyLog.status)}
                  </span>
                </div>
              }
            />

            <FieldExecutionCommandBand
              title="Daily execution summary"
              description="Review the project-day record, Job Notes, field evidence, and labor continuity without creating a separate field system."
              statusLabel={`${formatStatusLabel(dailyLog.status)} log`}
              projectHref={`/projects/${dailyLog.projectId}`}
              jobHref={dailyLog.jobId ? `/jobs/${dailyLog.jobId}` : undefined}
              items={[
                {
                  label: "Project day",
                  value: formatDate(dailyLog.logDate),
                  detail: dailyLog.project?.name ?? "Project-linked record"
                },
                {
                  label: "Job Notes",
                  value: `${fieldNotes.length} note${
                    fieldNotes.length === 1 ? "" : "s"
                  }`,
                  detail: `${activeEvidenceCount} evidence item${
                    activeEvidenceCount === 1 ? "" : "s"
                  } linked`
                },
                {
                  label: "Labor",
                  value: `${laborSummary?.peopleOnSiteCount ?? 0} people on site`,
                  detail: laborSummary
                    ? `${laborSummary.totalHoursWorked.toFixed(1)} total hours`
                    : "No time-card continuity yet"
                },
                {
                  label: "Linked job",
                  value: dailyLog.jobId
                    ? `Job ${dailyLog.jobId.slice(0, 8)}`
                    : "Project-day log",
                  detail: dailyLog.jobId
                    ? "Job execution context is linked"
                    : "No dominant job attached"
                }
              ]}
            />

            {resolvedSearchParams.error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
                {resolvedSearchParams.error}
              </div>
            ) : null}

            {resolvedSearchParams.message ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
                {resolvedSearchParams.message}
              </div>
            ) : null}

            <div className="mt-8">
              <WorkspaceSummaryBand
                items={[
                  {
                    key: "purpose",
                    label: "What this page is for",
                    content: (
                      <p className="text-sm leading-6 text-slate-600">
                        Review the project-day record first, then use field Job
                        Notes, field evidence, and labor continuity to explain
                        what happened in the job/schedule stage.
                      </p>
                    )
                  },
                  {
                    key: "weather",
                    label: "Weather snapshot",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {dailyLog.weatherSummary ?? "No weather summary"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {dailyLog.temperatureLowF !== null ||
                          dailyLog.temperatureHighF !== null
                            ? `${dailyLog.temperatureLowF ?? "?"}F to ${dailyLog.temperatureHighF ?? "?"}F`
                            : (dailyLog.weatherConditions ??
                              "No weather details entered")}
                        </p>
                      </>
                    )
                  },
                  {
                    key: "labor",
                    label: "Labor continuity",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {laborSummary?.peopleOnSiteCount ?? 0} people on site
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {laborSummary
                            ? `${laborSummary.totalHoursWorked.toFixed(1)} total hours from ${laborSummary.totalTimeCardCount} time card${laborSummary.totalTimeCardCount === 1 ? "" : "s"}`
                            : "No time-card continuity is connected to this project day yet; use Time when labor attribution is missing."}
                        </p>
                      </>
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

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link
                href={buildDailyLogSectionHref(dailyLog.id, "job-notes")}
                className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
              >
                Add Job Note
              </Link>
              <Link
                href={buildDailyLogSectionHref(dailyLog.id, "job-notes", {
                  noteType: "blocker"
                })}
                className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                Add blocker
              </Link>
              <Link
                href={buildDailyLogSectionHref(dailyLog.id, "field-evidence")}
                className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Add field evidence
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Open blockers",
                  value: openBlockerNotes.length,
                  detail:
                    openBlockerNotes.length > 0
                      ? "Needs project/job follow-up"
                      : "No open blockers",
                  tone:
                    openBlockerNotes.length > 0
                      ? "border-amber-300 bg-amber-50 text-amber-950"
                      : "border-slate-200 bg-white text-slate-950"
                },
                {
                  label: "Open issues",
                  value: openIssueNotes.length,
                  detail:
                    openIssueNotes.length > 0
                      ? "Keep visible until reviewed"
                      : "No open issues",
                  tone:
                    openIssueNotes.length > 0
                      ? "border-orange-200 bg-orange-50 text-orange-950"
                      : "border-slate-200 bg-white text-slate-950"
                },
                {
                  label: "Unresolved notes",
                  value: unresolvedFieldNotes.length,
                  detail: `${fieldNotes.length} total Job Note${
                    fieldNotes.length === 1 ? "" : "s"
                  }`,
                  tone: "border-slate-200 bg-white text-slate-950"
                },
                {
                  label: "Field evidence",
                  value: activeEvidenceCount,
                  detail: `${archivedDailyLogAttachments.length + archivedFieldNoteAttachments.length} archived`,
                  tone: "border-slate-200 bg-white text-slate-950"
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className={`min-w-0 rounded-lg border px-4 py-3 ${item.tone}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <DetailPanel
            title="Daily Narrative"
            description="This is the main project-day record. Review the summary, completed work, planned next work, and blockers before dropping into note-level detail; upstream readiness or commercial issues should still resolve in Project Workspace."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Summary</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {dailyLog.summary ?? "No summary captured yet."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">
                    Work completed
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {dailyLog.workCompleted ??
                      "No completed-work narrative captured yet."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">
                    Work planned next
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {dailyLog.workPlannedNext ??
                      "No next-step narrative captured yet."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">
                    Delays and blockers
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {dailyLog.delaysOrBlockers ??
                      "No blockers or delays were entered for this day."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">
                    Safety notes
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {dailyLog.safetyNotes ??
                      "No safety notes were captured for this day."}
                  </p>
                </div>
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Labor and Time Continuity"
            description="Daily logs reuse existing time cards for job/schedule labor visibility instead of persisting a second labor-entry model."
          >
            <div className="grid gap-4">
              {laborSummary?.entries.length ? (
                laborSummary.entries.map((entry) => (
                  <div
                    key={`${entry.personId}-${entry.jobId ?? "project"}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {entry.personDisplayName ?? "Unknown worker"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {entry.jobLabel ?? "Project-level labor"}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatDuration(entry.workedMinutes)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No labor continuity yet"
                  title="No time cards are connected to this project day"
                  description="Time continuity will appear here automatically when time cards exist for the same project and log date. Use Time when crew labor exists but is not attributed yet."
                />
              )}

              {timeCards.length > 0 ? (
                <div className="grid gap-4 pt-2">
                  {timeCards.slice(0, 5).map((timeCard) => (
                    <LinkedRecordCard
                      key={timeCard.id}
                      href={`/time-cards/${timeCard.id}`}
                      title={timeCard.person?.displayName ?? "Unknown worker"}
                      subtitle={formatDate(timeCard.workDate)}
                      meta={`${formatDuration(timeCard.workedMinutes)} worked${timeCard.job ? ` | Job ${timeCard.job.id.slice(0, 8)}` : ""}`}
                      badge={
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {formatStatusLabel(timeCard.status)}
                        </span>
                      }
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Job Notes"
          description="Quick job notes, blockers, issues, and closeout-ready observations stay inside the Daily Job Log and project/job chain."
        >
          <div id="job-notes" className="scroll-mt-24 space-y-8">
            <section className="rounded-[6px] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex flex-col gap-2">
                <p className="text-base font-semibold text-slate-950">
                  Add Job Note
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  Capture a Job Note, blocker, issue, or field observation and
                  optionally connect it to a job, person, or time card.
                </p>
              </div>
              <div className="mt-5">
                <FieldNoteForm
                  action={createFieldNoteAction}
                  submitLabel="Save Job Note"
                  pendingLabel="Saving Job Note..."
                  dailyLogId={dailyLog.id}
                  projectId={dailyLog.projectId}
                  jobs={projectJobs}
                  people={activePeople}
                  timeCards={timeCardOptions}
                  defaultJobId={dailyLog.jobId}
                  defaultNoteType={defaultQuickNoteType}
                />
              </div>
            </section>

            {fieldNotes.length > 0 ? (
              fieldNoteTypeOrder.map((noteType) => {
                const notes = notesByType.get(noteType) ?? [];

                if (notes.length === 0) {
                  return null;
                }

                return (
                  <section key={noteType} className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {formatNoteTypeLabel(noteType)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {notes.length} note{notes.length === 1 ? "" : "s"} in
                        this execution category
                        {notes.some((note) => note.status === "open")
                          ? `, ${notes.filter((note) => note.status === "open").length} open`
                          : ""}
                        .
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {notes.map((fieldNote) => (
                        <div
                          key={fieldNote.id}
                          className={getFieldNoteCardClasses(
                            fieldNote.noteType,
                            fieldNote.status
                          )}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-950">
                                {fieldNote.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                Created {formatDateTime(fieldNote.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                                {formatNoteTypeLabel(fieldNote.noteType)}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getFieldNoteStatusClasses(
                                  fieldNote.status
                                )}`}
                              >
                                {formatStatusLabel(fieldNote.status)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-5">
                            <FieldNoteForm
                              action={updateFieldNoteAction}
                              submitLabel="Save Job Note"
                              pendingLabel="Saving Job Note..."
                              dailyLogId={dailyLog.id}
                              projectId={dailyLog.projectId}
                              jobs={projectJobs}
                              people={activePeople}
                              timeCards={timeCardOptions}
                              fieldNote={fieldNote}
                              defaultJobId={dailyLog.jobId}
                            />
                          </div>
                          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                            <p className="text-sm font-medium text-slate-950">
                              Field evidence
                            </p>
                            <div className="mt-4 grid gap-3">
                              {(
                                attachmentsByFieldNoteId.get(fieldNote.id) ?? []
                              ).length > 0 ? (
                                (
                                  attachmentsByFieldNoteId.get(fieldNote.id) ??
                                  []
                                ).map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-950">
                                          {attachment.fileName}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                          {attachment.mimeType}
                                        </p>
                                      </div>
                                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        {attachment.preview.statusLabel}
                                      </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                      {attachment.caption ??
                                        "No caption provided."}
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                      {renderAttachmentPreviewAction(
                                        attachment
                                      )}
                                    </p>
                                    {renderArchiveAttachmentAction({
                                      attachment,
                                      dailyLogId: dailyLog.id,
                                      projectId: dailyLog.projectId,
                                      jobId: fieldNote.jobId ?? dailyLog.jobId
                                    })}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm leading-6 text-slate-500">
                                  No field evidence is linked to this Job Note
                                  yet. Add photos or PDFs here when the
                                  observation needs support.
                                </p>
                              )}
                            </div>
                            {(
                              archivedAttachmentsByFieldNoteId.get(
                                fieldNote.id
                              ) ?? []
                            ).length > 0 ? (
                              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4">
                                <p className="text-sm font-medium text-slate-950">
                                  Archived field evidence
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  Archived items are hidden from active proof
                                  views. Restore them when they should count
                                  again.
                                </p>
                                <div className="mt-4 grid gap-3">
                                  {(
                                    archivedAttachmentsByFieldNoteId.get(
                                      fieldNote.id
                                    ) ?? []
                                  ).map((attachment) =>
                                    renderArchivedAttachmentCard({
                                      attachment,
                                      dailyLogId: dailyLog.id,
                                      projectId: dailyLog.projectId,
                                      jobId: fieldNote.jobId ?? dailyLog.jobId
                                    })
                                  )}
                                </div>
                              </div>
                            ) : null}
                            <div className="mt-5">
                              <ExecutionAttachmentForm
                                action={createExecutionAttachmentAction}
                                submitLabel="Add evidence"
                                pendingLabel="Adding evidence..."
                                dailyLogId={dailyLog.id}
                                projectId={dailyLog.projectId}
                                jobId={fieldNote.jobId ?? dailyLog.jobId}
                                subjectType="field_note"
                                subjectId={fieldNote.id}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <AppEmptyState
                eyebrow="No Job Notes yet"
                title="Capture the first Job Note"
                description="Blockers, issues, labor notes, and closeout-ready observations all stay under this Daily Job Log."
              />
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Field Evidence"
          description="Field evidence stays lightweight and subject-scoped. Photos and files hang directly off the Daily Job Log or a Job Note on the same project/job chain."
        >
          <div id="field-evidence" className="scroll-mt-24 space-y-6">
            <div className="grid gap-4">
              {dailyLogAttachments.length > 0 ? (
                dailyLogAttachmentPreviews.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 px-5 py-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {attachment.fileName}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {attachment.mimeType}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {attachment.preview.statusLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {attachment.caption ?? "No caption provided."}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {renderAttachmentPreviewAction(attachment)}
                    </p>
                    {renderArchiveAttachmentAction({
                      attachment,
                      dailyLogId: dailyLog.id,
                      projectId: dailyLog.projectId,
                      jobId: dailyLog.jobId
                    })}
                  </div>
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No field evidence yet"
                  title="Add the first field evidence"
                  description="Field evidence can capture progress photos, delivery PDFs, or other job context without turning this slice into a full file-management system."
                />
              )}
            </div>

            {archivedDailyLogAttachments.length > 0 ? (
              <section className="rounded-[6px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Archived field evidence
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Archived evidence is hidden from active Daily Job Log rows,
                  FieldTrail, Proof Center, and CloseoutTrail counts. The stored
                  file is kept for record review.
                </p>
                <div className="mt-4 grid gap-3">
                  {archivedDailyLogAttachments.map((attachment) =>
                    renderArchivedAttachmentCard({
                      attachment,
                      dailyLogId: dailyLog.id,
                      projectId: dailyLog.projectId,
                      jobId: dailyLog.jobId
                    })
                  )}
                </div>
              </section>
            ) : null}

            <section className="rounded-[6px] border border-slate-200 bg-white px-5 py-5">
              <p className="text-sm font-medium text-slate-950">
                Add evidence to the Daily Job Log
              </p>
              <div className="mt-5">
                <ExecutionAttachmentForm
                  action={createExecutionAttachmentAction}
                  submitLabel="Add evidence"
                  pendingLabel="Adding evidence..."
                  dailyLogId={dailyLog.id}
                  projectId={dailyLog.projectId}
                  jobId={dailyLog.jobId}
                  subjectType="daily_log"
                  subjectId={dailyLog.id}
                />
              </div>
            </section>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Edit Daily Log"
          description="Keep the project-day record editable here while schedule, time-card, readiness, and invoice rules stay owned by their existing workflows."
        >
          <DailyLogForm
            action={updateDailyLogAction}
            submitLabel="Save Daily Job Log"
            pendingLabel="Saving Daily Job Log..."
            projects={projectOptions}
            jobs={jobOptions}
            dailyLog={dailyLog}
          />
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Daily Log Context"
          description="Compact context stays in the rail so the main column can focus on the execution record itself."
        >
          <ContextFactsList
            items={[
              {
                label: "Log date",
                value: formatDate(dailyLog.logDate)
              },
              {
                label: "Status",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(dailyLog.status)}
                  </span>
                )
              },
              {
                label: "Project",
                value: dailyLog.project ? (
                  <Link
                    href={`/projects/${dailyLog.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {dailyLog.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Job",
                value: dailyLog.jobId ? (
                  <Link
                    href={`/jobs/${dailyLog.jobId}`}
                    className="font-medium text-brand-700"
                  >
                    {`Job ${dailyLog.jobId.slice(0, 8)}`}
                  </Link>
                ) : (
                  "Project-day record"
                )
              },
              {
                label: "Job Notes",
                value: `${fieldNotes.length} note${fieldNotes.length === 1 ? "" : "s"}`
              },
              {
                label: "Field evidence",
                value: `${activeEvidenceCount} total`
              },
              {
                label: "People on site",
                value: String(laborSummary?.peopleOnSiteCount ?? 0)
              },
              {
                label: "Created",
                value: formatDateTime(dailyLog.createdAt)
              },
              {
                label: "Updated",
                value: formatDateTime(dailyLog.updatedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Linked Workflow"
          description="Daily execution supports the shared customer/project -> job/schedule chain instead of becoming a parallel execution workspace."
        >
          <div className="grid gap-4">
            {dailyLog.project ? (
              <LinkedRecordCard
                href={`/projects/${dailyLog.project.id}`}
                title={dailyLog.project.name}
                subtitle="Project Workspace"
                meta="Use Project Workspace for broader readiness, commercial, and execution continuity."
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    Project
                  </span>
                }
              />
            ) : null}
            {dailyLog.jobId ? (
              <LinkedRecordCard
                href={`/jobs/${dailyLog.jobId}`}
                title={`Job ${dailyLog.jobId.slice(0, 8)}`}
                subtitle="Linked job"
                meta="Use Job Workspace for schedule, crew, execution-state, and downstream billing continuity."
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    Job
                  </span>
                }
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                No dominant job is attached to this project-day log. It still
                belongs to the project-day execution chain.
              </div>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
