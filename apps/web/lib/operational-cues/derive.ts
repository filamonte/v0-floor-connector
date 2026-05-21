import type { OperationalCueKey } from "@floorconnector/types";

import type { OperationalCue, OperationalCueRule } from "./types";
import { resolveOperationalCueResponsibility } from "./responsibility";
import type { OperationalCueOwnerResolutionStatus } from "./owner-strategies";
import type { OperationalCueResponsibilityDefault } from "./responsibility-defaults";

type CueCustomer = {
  name: string | null;
};

type CueProject = {
  id?: string | null;
  name: string | null;
};

export type OperationalCueEstimateSource = {
  id: string;
  organizationId: string;
  referenceNumber: string;
  status: string;
  sentAt: string | null;
  updatedAt: string;
  customer: CueCustomer | null;
  project: CueProject | null;
};

export type OperationalCueContractSource = {
  id: string;
  organizationId: string;
  title: string;
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
  customerViewedAt: string | null;
  updatedAt: string;
  customer: CueCustomer | null;
  project: CueProject | null;
};

export type OperationalCueInvoiceSource = {
  id: string;
  organizationId: string;
  referenceNumber: string;
  status: string;
  workflowRole: string | null;
  issueDate: string | null;
  dueDate: string | null;
  balanceDueAmount: string | number;
  updatedAt: string;
  customer: CueCustomer | null;
  project: CueProject | null;
};

export type OperationalCueJobSource = {
  id: string;
  organizationId: string;
  dispatchStatus: string;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  crewVendorId: string | null;
  updatedAt: string;
  assignmentCount: number;
  projectReadinessStatus: string | null;
  projectReadyToScheduleAt: string | null;
  customer: CueCustomer | null;
  project: CueProject | null;
};

export type DeriveOperationalCuesInput = {
  organizationId: string;
  now: Date;
  rules: OperationalCueRule[];
  responsibilityDefaults?: OperationalCueResponsibilityDefault[];
  estimates: OperationalCueEstimateSource[];
  contracts: OperationalCueContractSource[];
  invoices: OperationalCueInvoiceSource[];
  jobs: OperationalCueJobSource[];
};

function differenceInDays(now: Date, value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const then = new Date(value);
  if (Number.isNaN(then.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
}

function daysUntil(now: Date, dateKey: string | null | undefined) {
  if (!dateKey) {
    return null;
  }

  const target = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function dateKeyToIso(dateKey: string | null | undefined) {
  return dateKey ? `${dateKey}T00:00:00.000Z` : null;
}

function pluralizeDays(days: number) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

function formatDateSourceValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatThresholdLabel(rule: OperationalCueRule) {
  return rule.thresholdDays === null
    ? null
    : `Rule threshold: ${pluralizeDays(rule.thresholdDays)}`;
}

function formatTriggeredAfterLabel(ageDays: number) {
  return `Triggered after ${pluralizeDays(ageDays)}`;
}

function getRule(
  rulesByKey: Map<OperationalCueKey, OperationalCueRule>,
  cueKey: OperationalCueKey,
  organizationId: string
) {
  const rule = rulesByKey.get(cueKey);
  return rule?.enabled && rule.organizationId === organizationId ? rule : null;
}

function isPastThreshold(ageDays: number, rule: OperationalCueRule) {
  return ageDays >= (rule.thresholdDays ?? 0);
}

function buildCue(input: {
  rule: OperationalCueRule;
  subjectId: string;
  projectId: string | null;
  title: string;
  message: string;
  ageDays: number;
  customerName: string | null;
  projectName: string | null;
  actionHref: string;
  actionLabel: string;
  reason: string;
  explanation: string;
  sourceLabel: string;
  sourceValue?: string | null;
  thresholdLabel?: string | null;
  triggeredAtLabel?: string | null;
  responsibilityDefaults?: OperationalCueResponsibilityDefault[];
}): OperationalCue {
  const responsibility = resolveOperationalCueResponsibility({
    ownerStrategy: input.rule.ownerStrategy,
    responsibilityDefaults: input.responsibilityDefaults
  });
  const ownerResolutionStatus: OperationalCueOwnerResolutionStatus =
    responsibility.resolutionStatus === "organization_queue"
      ? "organization_queue"
      : responsibility.resolutionStatus === "record_owner_unavailable"
        ? "fallback_only"
        : "strategy_only";

  return {
    cueKey: input.rule.cueKey,
    subjectType: input.rule.subjectType,
    subjectId: input.subjectId,
    projectId: input.projectId,
    organizationId: input.rule.organizationId,
    assignedUserId: responsibility.userId,
    ownerStrategy: responsibility.strategy,
    ownerStrategyLabel: responsibility.strategyLabel,
    ownerResolutionStatus,
    responsibility,
    title: input.title,
    message: input.message,
    urgency: input.rule.urgency,
    ageDays: input.ageDays,
    customerName: input.customerName,
    projectName: input.projectName,
    actionHref: input.actionHref,
    actionLabel: input.actionLabel,
    reason: input.reason,
    explanation: input.explanation,
    sourceLabel: input.sourceLabel,
    sourceValue: input.sourceValue ?? null,
    thresholdLabel: input.thresholdLabel ?? formatThresholdLabel(input.rule),
    triggeredAtLabel: input.triggeredAtLabel ?? formatTriggeredAfterLabel(input.ageDays)
  };
}

export function filterOperationalCuesForSubject(
  cues: OperationalCue[],
  input: { subjectType: OperationalCue["subjectType"]; subjectId: string }
) {
  return cues.filter(
    (cue) =>
      cue.subjectType === input.subjectType && cue.subjectId === input.subjectId
  );
}

export function filterOperationalCuesForProject(
  cues: OperationalCue[],
  input: { projectId: string }
) {
  return cues.filter((cue) => cue.projectId === input.projectId);
}

function compareCues(left: OperationalCue, right: OperationalCue) {
  const urgencyRank = { critical: 0, high: 1, normal: 2 };
  const urgencyComparison = urgencyRank[left.urgency] - urgencyRank[right.urgency];

  if (urgencyComparison !== 0) {
    return urgencyComparison;
  }

  return right.ageDays - left.ageDays;
}

export function groupOperationalCuesBySubject(cues: OperationalCue[]) {
  return {
    estimates: cues.filter((cue) => cue.subjectType === "estimate"),
    contracts: cues.filter((cue) => cue.subjectType === "contract"),
    invoices: cues.filter((cue) => cue.subjectType === "invoice"),
    jobs: cues.filter((cue) => cue.subjectType === "job")
  };
}

export function deriveOperationalCues(input: DeriveOperationalCuesInput) {
  const rulesByKey = new Map(input.rules.map((rule) => [rule.cueKey, rule]));
  const responsibilityDefaults = input.responsibilityDefaults ?? [];
  const cues: OperationalCue[] = [];

  const estimateFollowupRule = getRule(
    rulesByKey,
    "estimate_sent_followup",
    input.organizationId
  );
  if (estimateFollowupRule) {
    for (const estimate of input.estimates) {
      if (estimate.organizationId !== input.organizationId) {
        continue;
      }

      if (estimate.status !== "sent") {
        continue;
      }

      const sourceAt = estimate.sentAt ?? estimate.updatedAt;
      const ageDays = differenceInDays(input.now, sourceAt);
      if (!isPastThreshold(ageDays, estimateFollowupRule)) {
        continue;
      }
      const fallbackNote = estimate.sentAt
        ? ""
        : " Using last updated date because a sent timestamp was not available.";

      cues.push(
        buildCue({
          rule: estimateFollowupRule,
          subjectId: estimate.id,
          projectId: estimate.project?.id ?? null,
          title: `Follow up on ${estimate.referenceNumber}`,
          message: "Estimate was sent and is still awaiting a customer decision.",
          ageDays,
          customerName: estimate.customer?.name ?? null,
          projectName: estimate.project?.name ?? null,
          actionHref: `/estimates/${estimate.id}`,
          actionLabel: "Open estimate",
          reason: estimate.sentAt
            ? `Sent ${pluralizeDays(ageDays)} ago.`
            : `No sent timestamp is available, so updated_at is used as a conservative fallback.`
          ,
          explanation: `Estimate was sent ${pluralizeDays(ageDays)} ago. This rule triggers after ${pluralizeDays(estimateFollowupRule.thresholdDays ?? 0)}.${fallbackNote}`,
          sourceLabel: estimate.sentAt ? "Estimate sent date" : "Estimate last updated date",
          sourceValue: formatDateSourceValue(sourceAt),
          responsibilityDefaults
        })
      );
    }
  }

  const contractSentRule = getRule(
    rulesByKey,
    "contract_sent_unsigned",
    input.organizationId
  );
  const contractViewedRule = getRule(
    rulesByKey,
    "contract_viewed_unsigned",
    input.organizationId
  );
  for (const contract of input.contracts) {
    if (contract.organizationId !== input.organizationId) {
      continue;
    }

    if (contract.status === "signed" || contract.status === "void") {
      continue;
    }

    if (contractViewedRule && contract.status === "viewed") {
      const viewedAt = contract.customerViewedAt ?? contract.viewedAt ?? contract.updatedAt;
      const ageDays = differenceInDays(input.now, viewedAt);
      if (isPastThreshold(ageDays, contractViewedRule)) {
        const fallbackNote =
          contract.customerViewedAt || contract.viewedAt
            ? ""
            : " Using last updated date because a viewed timestamp was not available.";
        cues.push(
          buildCue({
            rule: contractViewedRule,
            subjectId: contract.id,
            projectId: contract.project?.id ?? null,
            title: "Viewed contract is still unsigned",
            message: "Customer activity exists, but signature has not completed.",
            ageDays,
            customerName: contract.customer?.name ?? null,
            projectName: contract.project?.name ?? null,
            actionHref: `/contracts/${contract.id}`,
            actionLabel: "Open contract",
            reason: `Viewed ${pluralizeDays(ageDays)} ago without signature completion.`,
            explanation: `Contract was viewed ${pluralizeDays(ageDays)} ago and has not been signed. This rule triggers after ${pluralizeDays(contractViewedRule.thresholdDays ?? 0)}.${fallbackNote}`,
            sourceLabel:
              contract.customerViewedAt || contract.viewedAt
                ? "Contract viewed date"
                : "Contract last updated date",
            sourceValue: formatDateSourceValue(viewedAt),
            responsibilityDefaults
          })
        );
      }

      continue;
    }

    if (contractSentRule && contract.status === "sent") {
      const sentAt = contract.sentAt ?? contract.updatedAt;
      const ageDays = differenceInDays(input.now, sentAt);
      if (isPastThreshold(ageDays, contractSentRule)) {
        const fallbackNote = contract.sentAt
          ? ""
          : " Using last updated date because a sent timestamp was not available.";
        cues.push(
          buildCue({
            rule: contractSentRule,
            subjectId: contract.id,
            projectId: contract.project?.id ?? null,
            title: "Sent contract is still unsigned",
            message: "Contract is out for signature and has not completed.",
            ageDays,
            customerName: contract.customer?.name ?? null,
            projectName: contract.project?.name ?? null,
            actionHref: `/contracts/${contract.id}`,
            actionLabel: "Open contract",
            reason: contract.sentAt
              ? `Sent ${pluralizeDays(ageDays)} ago.`
              : "No sent timestamp is available, so updated_at is used as a conservative fallback.",
            explanation: `Contract was sent ${pluralizeDays(ageDays)} ago and has not been signed. This rule triggers after ${pluralizeDays(contractSentRule.thresholdDays ?? 0)}.${fallbackNote}`,
            sourceLabel: contract.sentAt ? "Contract sent date" : "Contract last updated date",
            sourceValue: formatDateSourceValue(sentAt),
            responsibilityDefaults
          })
        );
      }
    }
  }

  const invoiceOverdueRule = getRule(
    rulesByKey,
    "invoice_overdue",
    input.organizationId
  );
  const depositUnpaidRule = getRule(
    rulesByKey,
    "deposit_invoice_unpaid",
    input.organizationId
  );
  for (const invoice of input.invoices) {
    if (invoice.organizationId !== input.organizationId) {
      continue;
    }

    if (invoice.status === "paid" || invoice.status === "void") {
      continue;
    }

    const balanceDue = Number(invoice.balanceDueAmount);
    if (!Number.isFinite(balanceDue) || balanceDue <= 0) {
      continue;
    }

    if (invoiceOverdueRule && invoice.dueDate) {
      const dueAgeDays = differenceInDays(input.now, dateKeyToIso(invoice.dueDate));
      if (dueAgeDays >= (invoiceOverdueRule.thresholdDays ?? 0)) {
        cues.push(
          buildCue({
            rule: invoiceOverdueRule,
            subjectId: invoice.id,
            projectId: invoice.project?.id ?? null,
            title: `${invoice.referenceNumber} is overdue`,
            message: "Invoice still has an open balance after the due date.",
            ageDays: dueAgeDays,
            customerName: invoice.customer?.name ?? null,
            projectName: invoice.project?.name ?? null,
            actionHref: `/invoices/${invoice.id}`,
            actionLabel: "Open invoice",
            reason: `Due ${pluralizeDays(dueAgeDays)} ago with ${balanceDue.toLocaleString("en-US", { style: "currency", currency: "USD" })} open.`,
            explanation: "Invoice due date has passed and the invoice is still open.",
            sourceLabel: "Invoice due date",
            sourceValue: formatDateSourceValue(dateKeyToIso(invoice.dueDate)),
            responsibilityDefaults
          })
        );
      }
    }

    if (depositUnpaidRule && invoice.workflowRole === "deposit") {
      const sourceAt = dateKeyToIso(invoice.issueDate) ?? invoice.updatedAt;
      const ageDays = differenceInDays(input.now, sourceAt);
      if (isPastThreshold(ageDays, depositUnpaidRule)) {
        const fallbackNote = invoice.issueDate
          ? ""
          : " Using last updated date because an issue date was not available.";
        cues.push(
          buildCue({
            rule: depositUnpaidRule,
            subjectId: invoice.id,
            projectId: invoice.project?.id ?? null,
            title: "Deposit invoice is unpaid",
            message:
              "Deposit readiness is still waiting on payment before downstream scheduling can continue.",
            ageDays,
            customerName: invoice.customer?.name ?? null,
            projectName: invoice.project?.name ?? null,
            actionHref: `/invoices/${invoice.id}`,
            actionLabel: "Open deposit invoice",
            reason: `${invoice.referenceNumber} has ${balanceDue.toLocaleString("en-US", { style: "currency", currency: "USD" })} open.`,
            explanation: `Deposit invoice has remained unpaid for ${pluralizeDays(ageDays)}. This rule triggers after ${pluralizeDays(depositUnpaidRule.thresholdDays ?? 0)}.${fallbackNote}`,
            sourceLabel: invoice.issueDate ? "Deposit invoice issue date" : "Invoice last updated date",
            sourceValue: formatDateSourceValue(sourceAt),
            responsibilityDefaults
          })
        );
      }
    }
  }

  const readyUnscheduledRule = getRule(
    rulesByKey,
    "job_ready_unscheduled",
    input.organizationId
  );
  const missingCrewRule = getRule(
    rulesByKey,
    "job_scheduled_missing_crew",
    input.organizationId
  );
  for (const job of input.jobs) {
    if (job.organizationId !== input.organizationId) {
      continue;
    }

    const isProjectReady =
      job.projectReadinessStatus === "ready_to_schedule" ||
      Boolean(job.projectReadyToScheduleAt);

    if (readyUnscheduledRule && job.dispatchStatus === "unscheduled" && isProjectReady) {
      const sourceAt = job.projectReadyToScheduleAt ?? job.updatedAt;
      const ageDays = differenceInDays(input.now, sourceAt);
      if (isPastThreshold(ageDays, readyUnscheduledRule)) {
        const fallbackNote = job.projectReadyToScheduleAt
          ? ""
          : " Using last updated date because a ready-to-schedule timestamp was not available.";
        cues.push(
          buildCue({
            rule: readyUnscheduledRule,
            subjectId: job.id,
            projectId: job.project?.id ?? null,
            title: "Ready job is still unscheduled",
            message: "Project readiness is clear, but this canonical job has no schedule.",
            ageDays,
            customerName: job.customer?.name ?? null,
            projectName: job.project?.name ?? null,
            actionHref: `/schedule?jobId=${job.id}&view=unscheduled&action=schedule`,
            actionLabel: "Open schedule",
            reason: "Project is ready to schedule and the job remains unscheduled.",
            explanation: `Project is ready to schedule, but this job is still unscheduled.${fallbackNote}`,
            sourceLabel: job.projectReadyToScheduleAt
              ? "Project ready-to-schedule date"
              : "Job last updated date",
            sourceValue: formatDateSourceValue(sourceAt),
            responsibilityDefaults
          })
        );
      }
    }

    if (missingCrewRule && job.dispatchStatus === "scheduled") {
      const daysToScheduled = daysUntil(input.now, job.scheduledDate);
      const missingCrew = !job.crewVendorId && job.assignmentCount === 0;
      if (
        missingCrew &&
        daysToScheduled !== null &&
        daysToScheduled >= 0 &&
        daysToScheduled <= (missingCrewRule.thresholdDays ?? 0)
      ) {
        cues.push(
          buildCue({
            rule: missingCrewRule,
            subjectId: job.id,
            projectId: job.project?.id ?? null,
            title: "Scheduled job is missing crew",
            message: "The job has a scheduled date but no crew assignment yet.",
            ageDays: Math.max(0, (missingCrewRule.thresholdDays ?? 0) - daysToScheduled),
            customerName: job.customer?.name ?? null,
            projectName: job.project?.name ?? null,
            actionHref: `/jobs/${job.id}`,
            actionLabel: "Open job",
            reason: `Scheduled in ${pluralizeDays(daysToScheduled)} with no crew assignment.`,
            explanation: "Job is scheduled, but no crew or vendor assignment was found.",
            sourceLabel: "Job scheduled date",
            sourceValue: formatDateSourceValue(dateKeyToIso(job.scheduledDate)),
            triggeredAtLabel: `Triggered ${pluralizeDays((missingCrewRule.thresholdDays ?? 0) - daysToScheduled)} into the crew-assignment window`,
            responsibilityDefaults
          })
        );
      }
    }
  }

  return cues.sort(compareCues);
}
