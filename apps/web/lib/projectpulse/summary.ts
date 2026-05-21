import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

export type ProjectPulseTone = "good" | "attention" | "blocked" | "neutral";

export type ProjectPulseNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type ProjectPulseSignal = {
  id: "commercial" | "schedule" | "fieldtrail" | "messagecenter" | "billing";
  label: string;
  status: string;
  detail: string;
  href: string;
  tone: ProjectPulseTone;
};

export type ProjectPulseSummary = {
  stageLabel: string;
  healthTone: ProjectPulseTone;
  primaryMessage: string;
  nextMove: ProjectPulseNextMove;
  blockers: string[];
  warnings: string[];
  highlights: string[];
  linkedCounts: {
    jobs: number;
    openBlockers: number;
    dailyLogs: number;
    communicationItems: number;
    unpaidInvoices: number;
    pendingSignatureItems: number;
    paymentAttentionItems: number;
  };
  signals: ProjectPulseSignal[];
};

export type ProjectPulseJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate: string | null;
};

export type ProjectPulseInvoice = {
  id: string;
  status: string;
  balanceDueAmount: string | number;
};

export type ProjectPulseInput = {
  projectId: string;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  readyCheckBlockers: string[];
  approvedEstimateId: string | null;
  latestContractId: string | null;
  latestContractStatus: string | null;
  jobs: ProjectPulseJob[];
  invoices: ProjectPulseInvoice[];
  fieldTrail: FieldTrailSummary;
  messageCenter: MessageCenterSummary;
  scheduleHref: string;
  todayIsoDate: string;
};

function hasOpenBalance(invoice: ProjectPulseInvoice) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function hasRecentDailyLog(input: {
  fieldTrail: FieldTrailSummary;
  todayIsoDate: string;
}) {
  const latestDate = input.fieldTrail.latestDailyLog?.logDate;

  return Boolean(latestDate && latestDate >= input.todayIsoDate);
}

function countPendingSignatureItems(messageCenter: MessageCenterSummary) {
  return messageCenter.timeline.filter(
    (item) =>
      item.kind === "signature" &&
      (item.tone === "warning" || item.tone === "critical")
  ).length;
}

function countPaymentAttentionItems(messageCenter: MessageCenterSummary) {
  return messageCenter.timeline.filter(
    (item) =>
      item.kind === "payment" &&
      (item.tone === "warning" || item.tone === "critical")
  ).length;
}

function deriveStageLabel(input: {
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  jobs: ProjectPulseJob[];
  invoices: ProjectPulseInvoice[];
  latestContractStatus: string | null;
}) {
  if (input.jobs.some((job) => job.dispatchStatus === "in_progress")) {
    return "Execution active";
  }

  if (input.jobs.some((job) => job.dispatchStatus === "completed")) {
    return input.invoices.some(hasOpenBalance)
      ? "Closeout and collection"
      : "Work completed";
  }

  if (input.jobs.some((job) => job.scheduledDate)) {
    return "Scheduled for production";
  }

  if (input.readinessSnapshot?.isReadyToSchedule) {
    return "Ready for scheduling";
  }

  if (input.latestContractStatus) {
    return input.latestContractStatus === "signed"
      ? "Contract signed"
      : "Contract in progress";
  }

  if (input.readinessSnapshot?.estimateStatus === "approved") {
    return "Approved scope";
  }

  return "Project setup";
}

function buildNextMove(input: ProjectPulseInput): ProjectPulseNextMove {
  const readinessBlocked =
    input.readyCheckBlockers.length > 0 &&
    !input.readinessSnapshot?.isReadyToSchedule;
  const hasApprovedEstimateWithoutContract =
    Boolean(input.approvedEstimateId) && !input.latestContractId;
  const hasPendingSignature =
    input.latestContractId &&
    input.latestContractStatus &&
    input.latestContractStatus !== "signed";
  const unscheduledJob = input.jobs.find(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const activeJob = input.jobs.find(
    (job) => job.dispatchStatus === "in_progress"
  );
  const openInvoice = input.invoices.find(hasOpenBalance);

  if (readinessBlocked) {
    return {
      label: "Resolve Ready Check",
      href: "#projectpulse",
      reason:
        input.readyCheckBlockers[0] ??
        "GateKeeper is holding this project until the Ready Check is clear."
    };
  }

  if (hasApprovedEstimateWithoutContract) {
    return {
      label: "Prepare contract",
      href: `/contracts?estimateId=${input.approvedEstimateId}`,
      reason:
        "Approved scope exists, but the contract has not been generated yet."
    };
  }

  if (hasPendingSignature) {
    return {
      label: "Review Signature Trail",
      href: `/contracts/${input.latestContractId}`,
      reason:
        "The contract is still waiting on signature or contract follow-through."
    };
  }

  if (input.readinessSnapshot?.isReadyToSchedule && unscheduledJob) {
    return {
      label: "Open CrewBoard",
      href: input.scheduleHref,
      reason:
        "The Ready Check is clear and at least one job still needs schedule placement."
    };
  }

  if (
    activeJob &&
    !hasRecentDailyLog({
      fieldTrail: input.fieldTrail,
      todayIsoDate: input.todayIsoDate
    })
  ) {
    return {
      label: "Review Daily Job Log",
      href: input.fieldTrail.nextMove.href,
      reason:
        "Field work is active and the latest Daily Job Log is not current."
    };
  }

  if (input.fieldTrail.openBlockerCount > 0) {
    return {
      label: "Review FieldTrail",
      href: "#fieldtrail",
      reason: `${input.fieldTrail.openBlockerCount} open field blocker or issue note${
        input.fieldTrail.openBlockerCount === 1 ? "" : "s"
      } need attention.`
    };
  }

  if (openInvoice || countPaymentAttentionItems(input.messageCenter) > 0) {
    return {
      label: "Review Payment Trail",
      href: openInvoice ? `/invoices/${openInvoice.id}` : "#messagecenter",
      reason:
        openInvoice != null
          ? "An invoice still has an open balance."
          : "Payment Trail has activity that needs review."
    };
  }

  if (input.messageCenter.attentionCount > 0) {
    return {
      label: "Review MessageCenter",
      href: "#messagecenter",
      reason: input.messageCenter.nextMove.detail
    };
  }

  return {
    label: "Continue project review",
    href: `/projects/${input.projectId}`,
    reason:
      "No blocking project health signals are showing from the current records."
  };
}

function buildSignal(input: {
  id: ProjectPulseSignal["id"];
  label: string;
  status: string;
  detail: string;
  href: string;
  tone: ProjectPulseTone;
}): ProjectPulseSignal {
  return input;
}

export function deriveProjectPulseSummary(
  input: ProjectPulseInput
): ProjectPulseSummary {
  const openInvoices = input.invoices.filter(hasOpenBalance);
  const unscheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const activeJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const scheduledJobs = input.jobs.filter((job) => job.scheduledDate);
  const pendingSignatureItems = countPendingSignatureItems(input.messageCenter);
  const paymentAttentionItems = countPaymentAttentionItems(input.messageCenter);
  const readinessBlocked =
    input.readyCheckBlockers.length > 0 &&
    !input.readinessSnapshot?.isReadyToSchedule;
  const missingRecentDailyLog =
    activeJobs.length > 0 &&
    !hasRecentDailyLog({
      fieldTrail: input.fieldTrail,
      todayIsoDate: input.todayIsoDate
    });

  const blockers = [
    ...input.readyCheckBlockers,
    ...(input.fieldTrail.openBlockerCount > 0
      ? [
          `${input.fieldTrail.openBlockerCount} FieldTrail blocker or issue note${
            input.fieldTrail.openBlockerCount === 1 ? "" : "s"
          } still open.`
        ]
      : [])
  ];
  const warnings = [
    ...(unscheduledJobs.length > 0
      ? [
          `${unscheduledJobs.length} job${
            unscheduledJobs.length === 1 ? "" : "s"
          } still need CrewBoard scheduling.`
        ]
      : []),
    ...(missingRecentDailyLog
      ? ["Execution is active, but no current Daily Job Log was found."]
      : []),
    ...(openInvoices.length > 0
      ? [
          `${openInvoices.length} invoice${
            openInvoices.length === 1 ? "" : "s"
          } still have an open balance.`
        ]
      : []),
    ...(input.messageCenter.attentionCount > 0
      ? [
          `${input.messageCenter.attentionCount} MessageCenter item${
            input.messageCenter.attentionCount === 1 ? "" : "s"
          } need review.`
        ]
      : [])
  ];
  const highlights = [
    ...(input.readinessSnapshot?.isReadyToSchedule
      ? ["Ready Check is clear for scheduling."]
      : []),
    ...(scheduledJobs.length > 0
      ? [
          `${scheduledJobs.length} job${
            scheduledJobs.length === 1 ? " is" : "s are"
          } already on the schedule.`
        ]
      : []),
    ...(input.fieldTrail.dailyLogCount > 0
      ? [
          `${input.fieldTrail.dailyLogCount} Daily Job Log${
            input.fieldTrail.dailyLogCount === 1 ? "" : "s"
          } captured.`
        ]
      : []),
    ...(input.messageCenter.latestActivityAt
      ? ["MessageCenter has connected project communication history."]
      : [])
  ];

  const healthTone: ProjectPulseTone = readinessBlocked
    ? "blocked"
    : blockers.length > 0 || warnings.length > 0
      ? "attention"
      : highlights.length > 0
        ? "good"
        : "neutral";
  const nextMove = buildNextMove(input);
  const stageLabel = deriveStageLabel({
    readinessSnapshot: input.readinessSnapshot,
    jobs: input.jobs,
    invoices: input.invoices,
    latestContractStatus: input.latestContractStatus
  });
  const primaryMessage =
    healthTone === "blocked"
      ? "GateKeeper is holding movement until the Ready Check is clear."
      : healthTone === "attention"
        ? "ProjectPulse found a few project signals that need review."
        : healthTone === "good"
          ? "The current project signals look healthy from existing records."
          : "ProjectPulse is waiting on more connected project activity.";

  return {
    stageLabel,
    healthTone,
    primaryMessage,
    nextMove,
    blockers,
    warnings,
    highlights,
    linkedCounts: {
      jobs: input.jobs.length,
      openBlockers: input.fieldTrail.openBlockerCount,
      dailyLogs: input.fieldTrail.dailyLogCount,
      communicationItems:
        input.messageCenter.messageCount +
        input.messageCenter.sendTrailCount +
        input.messageCenter.signatureTrailCount +
        input.messageCenter.paymentTrailCount,
      unpaidInvoices: openInvoices.length,
      pendingSignatureItems,
      paymentAttentionItems
    },
    signals: [
      buildSignal({
        id: "commercial",
        label: "Commercial",
        status: input.readinessSnapshot?.isReadyToSchedule
          ? "Ready Check clear"
          : input.readyCheckBlockers.length > 0
            ? "GateKeeper holding"
            : "Commercial review",
        detail:
          input.readyCheckBlockers[0] ??
          (input.readinessSnapshot?.isReadyToSchedule
            ? "Scheduling handoff is allowed by the existing readiness rules."
            : "Commercial records are still upstream of scheduling."),
        href: "#projectpulse",
        tone: readinessBlocked
          ? "blocked"
          : input.readinessSnapshot?.isReadyToSchedule
            ? "good"
            : "neutral"
      }),
      buildSignal({
        id: "schedule",
        label: "Schedule / CrewBoard",
        status:
          activeJobs.length > 0
            ? "Work in progress"
            : scheduledJobs.length > 0
              ? "Scheduled"
              : unscheduledJobs.length > 0
                ? "Needs scheduling"
                : "No jobs yet",
        detail:
          unscheduledJobs.length > 0
            ? `${unscheduledJobs.length} job${
                unscheduledJobs.length === 1 ? "" : "s"
              } need CrewBoard follow-through.`
            : activeJobs.length > 0
              ? `${activeJobs.length} active job${
                  activeJobs.length === 1 ? "" : "s"
                } on this project.`
              : scheduledJobs.length > 0
                ? `${scheduledJobs.length} scheduled job${
                    scheduledJobs.length === 1 ? "" : "s"
                  } connected.`
                : "Create or schedule production work when the handoff is ready.",
        href: input.scheduleHref,
        tone:
          unscheduledJobs.length > 0
            ? "attention"
            : activeJobs.length > 0 || scheduledJobs.length > 0
              ? "good"
              : "neutral"
      }),
      buildSignal({
        id: "fieldtrail",
        label: "FieldTrail",
        status:
          input.fieldTrail.openBlockerCount > 0
            ? "Open blockers"
            : missingRecentDailyLog
              ? "Log needs review"
              : input.fieldTrail.dailyLogCount > 0
                ? "Field history captured"
                : "No field history yet",
        detail:
          input.fieldTrail.openBlockerCount > 0
            ? `${input.fieldTrail.openBlockerCount} blocker or issue note${
                input.fieldTrail.openBlockerCount === 1 ? "" : "s"
              } open.`
            : missingRecentDailyLog
              ? "Execution is active and the latest Daily Job Log is not current."
              : `${input.fieldTrail.dailyLogCount} Daily Job Log${
                  input.fieldTrail.dailyLogCount === 1 ? "" : "s"
                }, ${input.fieldTrail.attachmentCount} evidence file${
                  input.fieldTrail.attachmentCount === 1 ? "" : "s"
                }.`,
        href: "#fieldtrail",
        tone:
          input.fieldTrail.openBlockerCount > 0 || missingRecentDailyLog
            ? "attention"
            : input.fieldTrail.dailyLogCount > 0
              ? "good"
              : "neutral"
      }),
      buildSignal({
        id: "messagecenter",
        label: "MessageCenter",
        status:
          input.messageCenter.attentionCount > 0
            ? "Needs follow-up"
            : input.messageCenter.latestActivityAt
              ? "Communication connected"
              : "No communication yet",
        detail:
          input.messageCenter.attentionCount > 0
            ? `${input.messageCenter.attentionCount} communication item${
                input.messageCenter.attentionCount === 1 ? "" : "s"
              } need review.`
            : `${input.messageCenter.threadCount} thread${
                input.messageCenter.threadCount === 1 ? "" : "s"
              }, ${input.messageCenter.messageCount} message${
                input.messageCenter.messageCount === 1 ? "" : "s"
              }.`,
        href: "#messagecenter",
        tone:
          input.messageCenter.attentionCount > 0
            ? "attention"
            : input.messageCenter.latestActivityAt
              ? "good"
              : "neutral"
      }),
      buildSignal({
        id: "billing",
        label: "Billing / Payment Trail",
        status:
          openInvoices.length > 0
            ? "Payment attention"
            : paymentAttentionItems > 0
              ? "Payment Trail review"
              : input.invoices.length > 0
                ? "Billing connected"
                : "No invoices yet",
        detail:
          openInvoices.length > 0
            ? `${openInvoices.length} invoice${
                openInvoices.length === 1 ? "" : "s"
              } with open balance.`
            : paymentAttentionItems > 0
              ? `${paymentAttentionItems} Payment Trail item${
                  paymentAttentionItems === 1 ? "" : "s"
                } need review.`
              : `${input.invoices.length} invoice${
                  input.invoices.length === 1 ? "" : "s"
                } connected.`,
        href: openInvoices[0] ? `/invoices/${openInvoices[0].id}` : "/invoices",
        tone:
          openInvoices.length > 0 || paymentAttentionItems > 0
            ? "attention"
            : input.invoices.length > 0
              ? "good"
              : "neutral"
      })
    ]
  };
}
