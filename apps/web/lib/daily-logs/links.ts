export function getDailyLogDateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

export function isDailyLogDateKey(
  value: string | null | undefined
): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function buildDailyLogCaptureHref(input: {
  projectId: string;
  jobId?: string | null;
  logDate?: string | null;
}) {
  const searchParams = new URLSearchParams({
    compose: "1",
    projectId: input.projectId
  });

  if (input.jobId) {
    searchParams.set("jobId", input.jobId);
  }

  if (isDailyLogDateKey(input.logDate)) {
    searchParams.set("logDate", input.logDate);
  }

  return `/daily-logs?${searchParams.toString()}#daily-log-create`;
}

export type DailyLogSectionAnchor = "job-notes" | "field-evidence";
export type DailyLogQuickNoteType = "blocker" | "issue";

export function buildDailyLogSectionHref(
  dailyLogId: string,
  section: DailyLogSectionAnchor,
  options?: {
    noteType?: DailyLogQuickNoteType;
  }
) {
  const searchParams = new URLSearchParams();

  if (options?.noteType) {
    searchParams.set("noteType", options.noteType);
  }

  const query = searchParams.toString();

  return `/daily-logs/${dailyLogId}${query ? `?${query}` : ""}#${section}`;
}

export function findDailyLogForJobDate<
  TDailyLog extends {
    id: string;
    jobId: string | null;
    logDate: string;
  }
>(dailyLogs: TDailyLog[], input: { jobId: string; logDate: string }) {
  return (
    dailyLogs.find(
      (dailyLog) =>
        dailyLog.jobId === input.jobId && dailyLog.logDate === input.logDate
    ) ?? null
  );
}
