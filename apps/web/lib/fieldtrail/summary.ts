import type {
  DailyLogStatus,
  ExecutionAttachmentSubjectType,
  ExecutionAttachmentType,
  FieldNoteStatus,
  FieldNoteType,
  JobStatus,
  TimeCardStatus
} from "@floorconnector/types";

export type FieldTrailDailyLog = {
  id: string;
  jobId: string | null;
  logDate: string;
  status: DailyLogStatus;
  summary: string | null;
  workCompleted: string | null;
  workPlannedNext: string | null;
  delaysOrBlockers: string | null;
  weatherSummary: string | null;
  updatedAt: string;
};

export type FieldTrailFieldNote = {
  id: string;
  dailyLogId: string;
  jobId: string | null;
  noteType: FieldNoteType;
  title: string;
  status: FieldNoteStatus;
  updatedAt: string;
};

export type FieldTrailAttachment = {
  id: string;
  subjectType: ExecutionAttachmentSubjectType;
  subjectId: string;
  attachmentType: ExecutionAttachmentType;
  fileName: string;
  caption: string | null;
  createdAt: string;
};

export type FieldTrailTimeCard = {
  id: string;
  jobId: string | null;
  workDate: string;
  workedMinutes: number;
  status: TimeCardStatus;
  person: { displayName: string } | null;
};

export type FieldTrailJob = {
  id: string;
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  updatedAt: string;
};

export type FieldTrailTimelineItem = {
  dailyLog: FieldTrailDailyLog;
  notes: FieldTrailFieldNote[];
  attachmentCount: number;
  photoCount: number;
  laborMinutes: number;
  timeCardCount: number;
  openBlockerCount: number;
};

export type FieldTrailNextMove = {
  label: string;
  href: string;
  detail: string;
};

export type FieldTrailSummary = {
  latestDailyLog: FieldTrailDailyLog | null;
  latestJob: FieldTrailJob | null;
  dailyLogCount: number;
  fieldNoteCount: number;
  openBlockerCount: number;
  attachmentCount: number;
  photoCount: number;
  totalWorkedMinutes: number;
  timeline: FieldTrailTimelineItem[];
  nextMove: FieldTrailNextMove;
};

function isOpenBlocker(note: FieldTrailFieldNote) {
  return (
    note.status === "open" &&
    (note.noteType === "blocker" || note.noteType === "issue")
  );
}

function sortByNewestDate<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

function getLatestJob(jobs: FieldTrailJob[]) {
  const activeJob = sortByNewestDate(
    jobs.filter((job) => job.dispatchStatus === "in_progress")
  )[0];

  if (activeJob) {
    return activeJob;
  }

  const scheduledJob = [...jobs]
    .filter((job) => job.scheduledDate)
    .sort((left, right) =>
      (right.scheduledDate ?? "").localeCompare(left.scheduledDate ?? "")
    )[0];

  return scheduledJob ?? sortByNewestDate(jobs)[0] ?? null;
}

function buildNextMove(input: {
  latestDailyLog: FieldTrailDailyLog | null;
  latestJob: FieldTrailJob | null;
  openBlockerCount: number;
}): FieldTrailNextMove {
  if (input.openBlockerCount > 0 && input.latestDailyLog) {
    return {
      label: "Open latest Daily Job Log",
      href: `/daily-logs/${input.latestDailyLog.id}`,
      detail: `${input.openBlockerCount} open blocker or issue note${
        input.openBlockerCount === 1 ? "" : "s"
      } need attention.`
    };
  }

  if (input.latestDailyLog) {
    return {
      label: "Open latest Daily Job Log",
      href: `/daily-logs/${input.latestDailyLog.id}`,
      detail: "Review the most recent field narrative, notes, and evidence."
    };
  }

  if (input.latestJob) {
    return {
      label: "Open job",
      href: `/jobs/${input.latestJob.id}`,
      detail:
        "No Daily Job Logs exist yet, so start from the current job context."
    };
  }

  return {
    label: "Open CrewBoard",
    href: "/schedule",
    detail:
      "No field history exists yet. Start with schedule or job handoff when work is ready."
  };
}

export function deriveFieldTrailSummary(input: {
  projectId: string;
  dailyLogs: FieldTrailDailyLog[];
  fieldNotes: FieldTrailFieldNote[];
  attachments: FieldTrailAttachment[];
  timeCards: FieldTrailTimeCard[];
  jobs: FieldTrailJob[];
}): FieldTrailSummary {
  const notesByDailyLogId = new Map<string, FieldTrailFieldNote[]>();
  const attachmentsBySubject = new Map<string, FieldTrailAttachment[]>();
  const timeCardsByWorkDate = new Map<string, FieldTrailTimeCard[]>();

  for (const note of input.fieldNotes) {
    const existing = notesByDailyLogId.get(note.dailyLogId) ?? [];
    existing.push(note);
    notesByDailyLogId.set(note.dailyLogId, existing);
  }

  for (const attachment of input.attachments) {
    const key = `${attachment.subjectType}:${attachment.subjectId}`;
    const existing = attachmentsBySubject.get(key) ?? [];
    existing.push(attachment);
    attachmentsBySubject.set(key, existing);
  }

  for (const timeCard of input.timeCards) {
    const existing = timeCardsByWorkDate.get(timeCard.workDate) ?? [];
    existing.push(timeCard);
    timeCardsByWorkDate.set(timeCard.workDate, existing);
  }

  const timeline = [...input.dailyLogs]
    .sort((left, right) => {
      const dateSort = right.logDate.localeCompare(left.logDate);

      return dateSort === 0
        ? right.updatedAt.localeCompare(left.updatedAt)
        : dateSort;
    })
    .map((dailyLog) => {
      const notes = sortByNewestDate(notesByDailyLogId.get(dailyLog.id) ?? []);
      const dailyLogAttachments =
        attachmentsBySubject.get(`daily_log:${dailyLog.id}`) ?? [];
      const noteAttachments = notes.flatMap(
        (note) => attachmentsBySubject.get(`field_note:${note.id}`) ?? []
      );
      const attachments = [...dailyLogAttachments, ...noteAttachments];
      const timeCards = timeCardsByWorkDate
        .get(dailyLog.logDate)
        ?.filter((timeCard) => {
          if (!dailyLog.jobId) {
            return true;
          }

          return !timeCard.jobId || timeCard.jobId === dailyLog.jobId;
        });

      return {
        dailyLog,
        notes,
        attachmentCount: attachments.length,
        photoCount: attachments.filter(
          (attachment) => attachment.attachmentType === "photo"
        ).length,
        laborMinutes: (timeCards ?? []).reduce(
          (sum, timeCard) => sum + timeCard.workedMinutes,
          0
        ),
        timeCardCount: timeCards?.length ?? 0,
        openBlockerCount: notes.filter(isOpenBlocker).length
      };
    });

  const latestDailyLog = timeline[0]?.dailyLog ?? null;
  const latestJob = getLatestJob(input.jobs);
  const openBlockerCount = input.fieldNotes.filter(isOpenBlocker).length;

  return {
    latestDailyLog,
    latestJob,
    dailyLogCount: input.dailyLogs.length,
    fieldNoteCount: input.fieldNotes.length,
    openBlockerCount,
    attachmentCount: input.attachments.length,
    photoCount: input.attachments.filter(
      (attachment) => attachment.attachmentType === "photo"
    ).length,
    totalWorkedMinutes: input.timeCards.reduce(
      (sum, timeCard) => sum + timeCard.workedMinutes,
      0
    ),
    timeline,
    nextMove: buildNextMove({
      latestDailyLog,
      latestJob,
      openBlockerCount
    })
  };
}
