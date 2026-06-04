import {
  buildDailyLogCaptureHref,
  buildDailyLogSectionHref
} from "../daily-logs/links";
import {
  buildScheduleWarningDisplaySummary,
  type ScheduleWarningDisplayTone
} from "./read-model";
import type { ScheduleWarningSummary } from "./warnings";

export type ScheduleFieldHandoffJob = {
  id: string;
  projectId: string;
  scheduledDate: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  scheduleNotes?: string | null;
  dispatchStatus: string;
  assignmentCount: number;
  crewSummary?: string[];
  crewVendor?: { name: string } | null;
  title?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  project?: {
    id: string;
    name: string;
    onsiteRepPersonId: string | null;
    relationshipOwnerPersonId: string | null;
    followUpOwnerPersonId: string | null;
  } | null;
  estimate?: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  serviceTicket?: {
    id: string;
    title: string;
    status: string;
  } | null;
};

export type ScheduleFieldHandoffDailyLog = {
  id: string;
  jobId: string | null;
  logDate: string;
  status: string;
  updatedAt: string;
};

export type ScheduleFieldHandoffFieldNote = {
  id: string;
  jobId: string | null;
  noteType: string;
  status: string;
  updatedAt: string;
};

export type ScheduleFieldHandoffTimeCard = {
  id: string;
  jobId: string | null;
  workDate: string;
  status: string;
  updatedAt: string;
};

export type ScheduleFieldHandoffSummary = {
  jobId: string;
  title: string;
  contextLabel: string;
  targetDate: string;
  hasCrewAssigned: boolean;
  dailyLog: {
    id: string;
    logDate: string;
    status: string;
  } | null;
  latestDailyLog: {
    id: string;
    logDate: string;
    status: string;
  } | null;
  openBlockerCount: number;
  fieldNoteCount: number;
  targetDateTimeCardCount: number;
  openTimeCardCount: number;
  latestFieldActivityAt: string | null;
  jobHref: string;
  projectHref: string;
  dailyLogHref: string;
  fieldWorkHref: string;
  blockerHref: string;
  tone: "ready" | "warning" | "blocked" | "neutral";
  label: string;
  detail: string;
};

export type ScheduleFieldHandoffCommandItem = {
  id: string;
  jobId: string;
  title: string;
  contextLabel: string;
  targetDate: string;
  label: string;
  detail: string;
  tone: ScheduleFieldHandoffSummary["tone"];
  jobHref: string;
  projectHref: string;
  dailyLogHref: string;
  fieldWorkHref: string;
  blockerHref: string;
  latestFieldActivityAt: string | null;
};

export type ScheduleFieldHandoffCommandLane = {
  key: "readyToWork" | "needsAttention" | "recentFieldActivity";
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ScheduleFieldHandoffCommandItem[];
};

export type ScheduleFieldHandoffCommandView = {
  readyToWork: ScheduleFieldHandoffCommandLane;
  needsAttention: ScheduleFieldHandoffCommandLane;
  recentFieldActivity: ScheduleFieldHandoffCommandLane;
};

export type ScheduleFieldHandoffPacketPerson = {
  id: string;
  displayName: string;
};

export type ScheduleFieldHandoffReadinessContext = {
  isReadyToSchedule: boolean;
  blockers: string[];
  estimateId: string | null;
  estimateStatus: string | null;
  contractId: string | null;
  contractStatus: string | null;
  contractSignedAt: string | null;
};

export type ScheduleFieldHandoffPacketOwner = {
  id: "onsite_rep" | "relationship_owner" | "follow_up_owner";
  label: string;
  value: string;
  detail: string;
  href: string | null;
};

export type ScheduleFieldHandoffPacketLink = {
  label: string;
  href: string;
};

export type ScheduleFieldHandoffPacket = {
  title: string;
  statusLabel: string;
  scheduleLabel: string;
  crewLabel: string;
  scope: {
    projectLabel: string;
    customerLabel: string;
    locationLabel: string;
    estimateLabel: string;
    contractLabel: string;
    scheduleNotesLabel: string;
    serviceTicketLabel: string | null;
  };
  readiness: {
    label: string;
    detail: string;
    tone: ScheduleWarningDisplayTone | "ready";
    warningLabel: string;
  };
  owners: ScheduleFieldHandoffPacketOwner[];
  fieldNotes: {
    dailyLogLabel: string;
    blockersLabel: string;
    latestActivityLabel: string;
  };
  links: ScheduleFieldHandoffPacketLink[];
};

function sortLatestByDate<T extends { logDate: string; updatedAt: string }>(
  rows: T[]
) {
  return [...rows].sort((left, right) => {
    const dateComparison = right.logDate.localeCompare(left.logDate);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function getLatestActivityAt(input: {
  dailyLogs: ScheduleFieldHandoffDailyLog[];
  fieldNotes: ScheduleFieldHandoffFieldNote[];
  timeCards: ScheduleFieldHandoffTimeCard[];
}) {
  const latest = [
    ...input.dailyLogs.map((row) => row.updatedAt),
    ...input.fieldNotes.map((row) => row.updatedAt),
    ...input.timeCards.map((row) => row.updatedAt)
  ]
    .filter(Boolean)
    .sort()
    .at(-1);

  return latest ?? null;
}

function getTargetDate(job: ScheduleFieldHandoffJob, todayDateKey: string) {
  return job.scheduledDate ?? todayDateKey;
}

function getJobTitle(job: ScheduleFieldHandoffJob) {
  return job.title?.trim() || `Job ${job.id.slice(0, 8)}`;
}

function getContextLabel(job: ScheduleFieldHandoffJob) {
  const projectName = job.projectName?.trim();
  const customerName = job.customerName?.trim();

  if (projectName && customerName) {
    return `${customerName} - ${projectName}`;
  }

  return projectName ?? customerName ?? "Project context";
}

function formatStatusLabel(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "Not linked";
}

function formatScheduleDate(value: string | null | undefined) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString()
    : "No schedule date";
}

function formatScheduleDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : null;
}

function formatScheduleWindow(job: ScheduleFieldHandoffJob) {
  const date = formatScheduleDate(job.scheduledDate);
  const start = formatScheduleDateTime(job.scheduledStartAt);
  const end = formatScheduleDateTime(job.scheduledEndAt);

  if (start && end) {
    return `${date} · ${start} to ${end}`;
  }

  if (start) {
    return `${date} · starts ${start}`;
  }

  return date;
}

function formatLatestActivity(value: string | null) {
  return value ? new Date(value).toLocaleString() : "No field activity yet";
}

function getCrewLabel(job: ScheduleFieldHandoffJob) {
  if (job.crewSummary && job.crewSummary.length > 0) {
    return job.crewSummary.join(", ");
  }

  if (job.crewVendor?.name) {
    return job.crewVendor.name;
  }

  if (job.assignmentCount > 0) {
    return `${job.assignmentCount} assignment${
      job.assignmentCount === 1 ? "" : "s"
    }`;
  }

  return "No crew assigned";
}

function findPersonName(
  people: ScheduleFieldHandoffPacketPerson[],
  personId: string | null | undefined
) {
  if (!personId) {
    return null;
  }

  return people.find((person) => person.id === personId)?.displayName ?? null;
}

function buildOwner(input: {
  id: ScheduleFieldHandoffPacketOwner["id"];
  label: string;
  detail: string;
  personId: string | null | undefined;
  people: ScheduleFieldHandoffPacketPerson[];
  projectHref: string | null;
}): ScheduleFieldHandoffPacketOwner {
  const name = findPersonName(input.people, input.personId);
  const value = input.personId
    ? (name ?? "Person not available")
    : "Not captured yet";

  return {
    id: input.id,
    label: input.label,
    value,
    detail: input.detail,
    href: input.projectHref
  };
}

function getReadinessDetail(input: {
  readiness: ScheduleFieldHandoffReadinessContext | null | undefined;
  warnings: ScheduleWarningSummary[];
}) {
  if (!input.readiness) {
    return {
      label: "Readiness not loaded",
      detail:
        "Open Project Workspace to confirm commercial readiness before field work.",
      tone: "neutral" as const
    };
  }

  if (!input.readiness.isReadyToSchedule) {
    const blockerLabel =
      input.readiness.blockers.length > 0
        ? input.readiness.blockers.map(formatStatusLabel).join(", ")
        : "Project readiness blocker";

    return {
      label: "Readiness blocked",
      detail: blockerLabel,
      tone: "blocked" as const
    };
  }

  if (input.warnings.length > 0) {
    return {
      label: "Ready with schedule warnings",
      detail: buildScheduleWarningDisplaySummary({
        warnings: input.warnings
      }).detailLabel,
      tone: "warning" as const
    };
  }

  return {
    label: "Ready for field handoff",
    detail:
      "Project readiness and schedule warnings do not currently block the handoff.",
    tone: "ready" as const
  };
}

export function buildScheduleFieldHandoffPacket(input: {
  job: ScheduleFieldHandoffJob;
  handoff: ScheduleFieldHandoffSummary | null;
  readiness?: ScheduleFieldHandoffReadinessContext | null;
  warnings?: ScheduleWarningSummary[];
  people?: ScheduleFieldHandoffPacketPerson[];
}): ScheduleFieldHandoffPacket {
  const warnings = input.warnings ?? [];
  const projectHref = input.job.projectId
    ? `/projects/${input.job.projectId}`
    : null;
  const jobHref = `/jobs/${input.job.id}`;
  const estimate = input.job.estimate;
  const readiness = input.readiness;
  const estimateLabel = estimate
    ? `Estimate ${estimate.referenceNumber} · ${formatStatusLabel(estimate.status)}`
    : readiness?.estimateStatus
      ? `Estimate context · ${formatStatusLabel(readiness.estimateStatus)}`
      : "No estimate scope summary linked.";
  const contractLabel = readiness?.contractId
    ? `Contract · ${formatStatusLabel(readiness.contractStatus)}`
    : "No contract context linked.";
  const readinessDetail = getReadinessDetail({ readiness, warnings });
  const warningSummary = buildScheduleWarningDisplaySummary({
    warnings,
    readinessBlocked: readiness ? !readiness.isReadyToSchedule : false
  });
  const warningLabel = warningSummary.hasWarnings
    ? warningSummary.compactLabel
    : "No schedule warnings";
  const project = input.job.project;
  const people = input.people ?? [];
  const owners: ScheduleFieldHandoffPacketOwner[] = [
    buildOwner({
      id: "onsite_rep",
      label: "Onsite Rep",
      detail: "Person who gathered or owns onsite production context.",
      personId: project?.onsiteRepPersonId,
      people,
      projectHref
    }),
    buildOwner({
      id: "relationship_owner",
      label: "Relationship Owner",
      detail: "Person who owns customer relationship context.",
      personId: project?.relationshipOwnerPersonId,
      people,
      projectHref
    }),
    buildOwner({
      id: "follow_up_owner",
      label: "Follow-Up Owner",
      detail: "Internal owner for follow-through after field execution.",
      personId: project?.followUpOwnerPersonId,
      people,
      projectHref
    })
  ];
  const links: ScheduleFieldHandoffPacketLink[] = [
    { label: "Job", href: jobHref },
    ...(projectHref ? [{ label: "Project", href: projectHref }] : []),
    ...(estimate
      ? [{ label: "Estimate", href: `/estimates/${estimate.id}` }]
      : []),
    ...(readiness?.contractId
      ? [{ label: "Contract", href: `/contracts/${readiness.contractId}` }]
      : []),
    ...(input.handoff
      ? [
          {
            label: input.handoff.dailyLog ? "Daily Log" : "Start Daily Log",
            href: input.handoff.dailyLogHref
          }
        ]
      : [])
  ];

  return {
    title: getJobTitle(input.job),
    statusLabel: formatStatusLabel(input.job.dispatchStatus),
    scheduleLabel: formatScheduleWindow(input.job),
    crewLabel: getCrewLabel(input.job),
    scope: {
      projectLabel:
        input.job.projectName ?? project?.name ?? "No project name linked.",
      customerLabel: input.job.customerName ?? "No customer linked.",
      locationLabel: "No field location summary linked.",
      estimateLabel,
      contractLabel,
      scheduleNotesLabel:
        input.job.scheduleNotes?.trim() || "No schedule notes captured.",
      serviceTicketLabel: input.job.serviceTicket
        ? `${input.job.serviceTicket.title} · ${formatStatusLabel(
            input.job.serviceTicket.status
          )}`
        : null
    },
    readiness: {
      ...readinessDetail,
      warningLabel
    },
    owners,
    fieldNotes: {
      dailyLogLabel: input.handoff?.dailyLog
        ? `Daily Log ${formatStatusLabel(input.handoff.dailyLog.status)}`
        : "No Daily Log yet.",
      blockersLabel: input.handoff
        ? `${input.handoff.openBlockerCount} open field blocker${
            input.handoff.openBlockerCount === 1 ? "" : "s"
          }`
        : "No field handoff activity loaded.",
      latestActivityLabel: formatLatestActivity(
        input.handoff?.latestFieldActivityAt ?? null
      )
    },
    links
  };
}

function getHandoffState(input: {
  hasCrewAssigned: boolean;
  dailyLog: ScheduleFieldHandoffSummary["dailyLog"];
  openBlockerCount: number;
  latestFieldActivityAt: string | null;
}) {
  if (input.openBlockerCount > 0) {
    return {
      tone: "blocked" as const,
      label: "Blockers open",
      detail: `${input.openBlockerCount} open field blocker or issue ${
        input.openBlockerCount === 1 ? "note" : "notes"
      } need review before the handoff is clear.`
    };
  }

  if (!input.hasCrewAssigned) {
    return {
      tone: "warning" as const,
      label: "Crew missing",
      detail:
        "No person or labor-provider assignment is attached to this scheduled job yet."
    };
  }

  if (!input.dailyLog) {
    return {
      tone: "warning" as const,
      label: "Daily Log not started",
      detail:
        "No Daily Log exists for the scheduled field date yet; use the canonical Daily Log flow."
    };
  }

  if (input.latestFieldActivityAt) {
    return {
      tone: "ready" as const,
      label: "Field handoff active",
      detail:
        "Crew, Daily Log, and field activity are connected to this job record."
    };
  }

  return {
    tone: "neutral" as const,
    label: "Field handoff ready",
    detail:
      "Crew and Daily Log context are present; field activity will appear here once notes or time are recorded."
  };
}

export function buildScheduleFieldHandoffSummaries(input: {
  jobs: ScheduleFieldHandoffJob[];
  todayDateKey: string;
  dailyLogs: ScheduleFieldHandoffDailyLog[];
  fieldNotes: ScheduleFieldHandoffFieldNote[];
  timeCards: ScheduleFieldHandoffTimeCard[];
}): Map<string, ScheduleFieldHandoffSummary> {
  const dailyLogsByJobId = new Map<string, ScheduleFieldHandoffDailyLog[]>();
  const fieldNotesByJobId = new Map<string, ScheduleFieldHandoffFieldNote[]>();
  const timeCardsByJobId = new Map<string, ScheduleFieldHandoffTimeCard[]>();

  for (const row of input.dailyLogs) {
    if (!row.jobId) {
      continue;
    }

    dailyLogsByJobId.set(row.jobId, [
      ...(dailyLogsByJobId.get(row.jobId) ?? []),
      row
    ]);
  }

  for (const row of input.fieldNotes) {
    if (!row.jobId) {
      continue;
    }

    fieldNotesByJobId.set(row.jobId, [
      ...(fieldNotesByJobId.get(row.jobId) ?? []),
      row
    ]);
  }

  for (const row of input.timeCards) {
    if (!row.jobId) {
      continue;
    }

    timeCardsByJobId.set(row.jobId, [
      ...(timeCardsByJobId.get(row.jobId) ?? []),
      row
    ]);
  }

  const summaries = new Map<string, ScheduleFieldHandoffSummary>();

  for (const job of input.jobs) {
    const targetDate = getTargetDate(job, input.todayDateKey);
    const dailyLogs = dailyLogsByJobId.get(job.id) ?? [];
    const fieldNotes = fieldNotesByJobId.get(job.id) ?? [];
    const timeCards = timeCardsByJobId.get(job.id) ?? [];
    const targetDailyLog =
      dailyLogs.find((row) => row.logDate === targetDate) ?? null;
    const latestDailyLog = sortLatestByDate(dailyLogs)[0] ?? null;
    const openBlockerCount = fieldNotes.filter(
      (row) =>
        row.status === "open" &&
        (row.noteType === "blocker" || row.noteType === "issue")
    ).length;
    const targetDateTimeCardCount = timeCards.filter(
      (row) => row.workDate === targetDate
    ).length;
    const openTimeCardCount = timeCards.filter(
      (row) => row.status === "open"
    ).length;
    const latestFieldActivityAt = getLatestActivityAt({
      dailyLogs,
      fieldNotes,
      timeCards
    });
    const dailyLogHref = targetDailyLog
      ? `/daily-logs/${targetDailyLog.id}`
      : buildDailyLogCaptureHref({
          projectId: job.projectId,
          jobId: job.id,
          logDate: targetDate
        });
    const blockerHref = targetDailyLog
      ? buildDailyLogSectionHref(targetDailyLog.id, "job-notes", {
          noteType: "blocker"
        })
      : dailyLogHref;
    const state = getHandoffState({
      hasCrewAssigned: job.assignmentCount > 0,
      dailyLog: targetDailyLog
        ? {
            id: targetDailyLog.id,
            logDate: targetDailyLog.logDate,
            status: targetDailyLog.status
          }
        : null,
      openBlockerCount,
      latestFieldActivityAt
    });

    summaries.set(job.id, {
      jobId: job.id,
      title: getJobTitle(job),
      contextLabel: getContextLabel(job),
      targetDate,
      hasCrewAssigned: job.assignmentCount > 0,
      dailyLog: targetDailyLog
        ? {
            id: targetDailyLog.id,
            logDate: targetDailyLog.logDate,
            status: targetDailyLog.status
          }
        : null,
      latestDailyLog: latestDailyLog
        ? {
            id: latestDailyLog.id,
            logDate: latestDailyLog.logDate,
            status: latestDailyLog.status
          }
        : null,
      openBlockerCount,
      fieldNoteCount: fieldNotes.length,
      targetDateTimeCardCount,
      openTimeCardCount,
      latestFieldActivityAt,
      jobHref: `/jobs/${job.id}`,
      projectHref: `/projects/${job.projectId}`,
      dailyLogHref,
      fieldWorkHref: "/field/work-items",
      blockerHref,
      ...state
    });
  }

  return summaries;
}

function toCommandItem(
  summary: ScheduleFieldHandoffSummary
): ScheduleFieldHandoffCommandItem {
  return {
    id: summary.jobId,
    jobId: summary.jobId,
    title: summary.title,
    contextLabel: summary.contextLabel,
    targetDate: summary.targetDate,
    label: summary.label,
    detail: summary.detail,
    tone: summary.tone,
    jobHref: summary.jobHref,
    projectHref: summary.projectHref,
    dailyLogHref: summary.dailyLogHref,
    fieldWorkHref: summary.fieldWorkHref,
    blockerHref: summary.blockerHref,
    latestFieldActivityAt: summary.latestFieldActivityAt
  };
}

function sortByTargetDateThenTitle(
  left: ScheduleFieldHandoffCommandItem,
  right: ScheduleFieldHandoffCommandItem
) {
  const dateComparison = left.targetDate.localeCompare(right.targetDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.title.localeCompare(right.title);
}

function sortByLatestActivity(
  left: ScheduleFieldHandoffCommandItem,
  right: ScheduleFieldHandoffCommandItem
) {
  return (
    (right.latestFieldActivityAt ?? "").localeCompare(
      left.latestFieldActivityAt ?? ""
    ) || sortByTargetDateThenTitle(left, right)
  );
}

export function buildScheduleFieldHandoffCommandView(input: {
  handoffs: Iterable<ScheduleFieldHandoffSummary>;
  limitPerLane?: number;
}): ScheduleFieldHandoffCommandView {
  const limit = input.limitPerLane ?? 4;
  const items = [...input.handoffs].map(toCommandItem);
  const readyToWork = items
    .filter((item) => item.tone === "ready" || item.tone === "neutral")
    .sort(sortByTargetDateThenTitle)
    .slice(0, limit);
  const needsAttention = items
    .filter((item) => item.tone === "blocked" || item.tone === "warning")
    .sort((left, right) => {
      const toneComparison =
        Number(right.tone === "blocked") - Number(left.tone === "blocked");

      return toneComparison || sortByTargetDateThenTitle(left, right);
    })
    .slice(0, limit);
  const recentFieldActivity = items
    .filter((item) => item.latestFieldActivityAt)
    .sort(sortByLatestActivity)
    .slice(0, limit);

  return {
    readyToWork: {
      key: "readyToWork",
      title: "Ready to work",
      description:
        "Scheduled jobs with crew, Daily Log continuity, and no open field blockers.",
      emptyTitle: "No ready field handoffs right now.",
      emptyDescription:
        "Ready field handoffs will appear here when scheduled jobs have crew, Daily Log context, and no open field blockers.",
      items: readyToWork
    },
    needsAttention: {
      key: "needsAttention",
      title: "Needs attention",
      description:
        "Crew gaps, missing Daily Logs, or open blocker notes that need review before field handoff is clear.",
      emptyTitle: "No field handoff attention items.",
      emptyDescription:
        "Crew gaps, missing Daily Logs, and open field blockers will appear here when existing job records need review.",
      items: needsAttention
    },
    recentFieldActivity: {
      key: "recentFieldActivity",
      title: "Recent field activity",
      description:
        "Latest Daily Log, field note, and time-card movement tied back to scheduled jobs.",
      emptyTitle: "No recent field activity in this view.",
      emptyDescription:
        "Recent Daily Log, field note, and time-card activity will appear here after crews record work on existing jobs.",
      items: recentFieldActivity
    }
  };
}
