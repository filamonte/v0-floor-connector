import type { OpportunityStatus } from "@floorconnector/types";

export type LeadFollowUpBucket =
  | "overdue"
  | "due_today"
  | "upcoming"
  | "no_follow_up";

export type LeadFollowUpOpportunity = {
  id: string;
  title: string;
  status: OpportunityStatus;
  prospectName: string | null;
  prospectCompanyName: string | null;
  customerId: string | null;
  projectId: string | null;
  nextFollowUpAt: string | null;
  nextFollowUpNote: string | null;
  updatedAt: string;
  primaryContact?: {
    displayName: string;
    companyName: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
};

export type LeadFollowUpQueueItem = {
  opportunityId: string;
  title: string;
  status: OpportunityStatus;
  contactName: string | null;
  companyName: string | null;
  customerName: string | null;
  customerId: string | null;
  projectId: string | null;
  projectName: string | null;
  nextFollowUpAt: string | null;
  nextFollowUpNote: string | null;
  lastCommunicationAt: string | null;
  bucket: LeadFollowUpBucket;
};

export type SalesEstimateReadinessTone = "ready" | "attention" | "blocked";

export type SalesEstimateReadinessInput = {
  status: OpportunityStatus;
  customerId: string | null;
  projectId: string | null;
  siteAssessmentStatus: string;
  requirementsSummary: string | null;
  measurementCount: number;
  observationCount: number;
  attachmentCount: number;
  estimateWriterName?: string | null;
};

export type SalesEstimateReadinessSummary = {
  title: string;
  description: string;
  blockers: string[];
  statusTone: SalesEstimateReadinessTone;
  recommendedNextAction: string;
};

const closedLeadStatuses = new Set<OpportunityStatus>([
  "won",
  "lost",
  "converted"
]);

const bucketRank: Record<LeadFollowUpBucket, number> = {
  overdue: 0,
  due_today: 1,
  upcoming: 2,
  no_follow_up: 3
};

function toDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function isActiveLeadFollowUpStatus(status: OpportunityStatus) {
  return !closedLeadStatuses.has(status);
}

export function classifyLeadFollowUp(
  nextFollowUpAt: string | null | undefined,
  nowIso: string
): LeadFollowUpBucket {
  if (!nextFollowUpAt) {
    return "no_follow_up";
  }

  const dueDateKey = toDateKey(nextFollowUpAt);
  const todayKey = toDateKey(nowIso);

  if (dueDateKey < todayKey) {
    return "overdue";
  }

  if (dueDateKey === todayKey) {
    return "due_today";
  }

  return "upcoming";
}

export function labelLeadFollowUpBucket(bucket: LeadFollowUpBucket) {
  switch (bucket) {
    case "overdue":
      return "Overdue";
    case "due_today":
      return "Due today";
    case "upcoming":
      return "Upcoming";
    case "no_follow_up":
      return "No follow-up";
  }
}

export function deriveSalesEstimateReadiness(
  input: SalesEstimateReadinessInput
): SalesEstimateReadinessSummary {
  if (input.status === "lost") {
    return {
      title: "Lead is not ready for estimate work",
      description:
        "Lost leads stay outside the estimate handoff until sales intentionally reopens qualification.",
      blockers: ["Reopen or requalify the lead before estimating."],
      statusTone: "blocked",
      recommendedNextAction: "Review qualification before estimate handoff."
    };
  }

  const hasCapturedScope =
    input.siteAssessmentStatus === "completed" ||
    Boolean(input.requirementsSummary?.trim()) ||
    input.measurementCount > 0 ||
    input.observationCount > 0 ||
    input.attachmentCount > 0;
  const blockers: string[] = [];

  if (!hasCapturedScope) {
    blockers.push(
      "Capture site assessment requirements, measurements, or notes."
    );
  }

  if (!input.customerId) {
    blockers.push("Link or create the canonical customer record.");
  }

  if (!input.projectId) {
    blockers.push("Link or create the canonical project record.");
  }

  if (blockers.length > 0) {
    return {
      title: "Sales context needs work before estimating",
      description:
        "Keep qualification, site requirements, customer, and project context on this lead so the estimate does not start from re-entered intake.",
      blockers,
      statusTone: "blocked",
      recommendedNextAction: blockers[0]
    };
  }

  if (!input.estimateWriterName) {
    return {
      title: "Ready to assign estimate ownership",
      description:
        "Sales context is linked to the canonical customer and project chain. Assign the estimate writer before or alongside starting the estimate flow.",
      blockers: [],
      statusTone: "attention",
      recommendedNextAction: "Assign Estimate Writer from this lead."
    };
  }

  return {
    title: "Ready for estimate handoff",
    description:
      "Requirements, customer, project, and estimate ownership are lined up for the downstream estimate workspace.",
    blockers: [],
    statusTone: "ready",
    recommendedNextAction: "Continue estimating handoff."
  };
}

export function buildLeadFollowUpQueue(input: {
  opportunities: LeadFollowUpOpportunity[];
  lastCommunicationByOpportunityId?: Map<string, string | null>;
  nowIso: string;
  includeNoFollowUp?: boolean;
  upcomingDays?: number;
}): LeadFollowUpQueueItem[] {
  const {
    opportunities,
    lastCommunicationByOpportunityId = new Map<string, string | null>(),
    nowIso,
    includeNoFollowUp = false,
    upcomingDays = 7
  } = input;
  const nowMs = new Date(nowIso).getTime();
  const upcomingLimitMs = nowMs + upcomingDays * 24 * 60 * 60 * 1000;

  return opportunities
    .filter((opportunity) => isActiveLeadFollowUpStatus(opportunity.status))
    .map((opportunity) => {
      const bucket = classifyLeadFollowUp(opportunity.nextFollowUpAt, nowIso);

      return {
        opportunityId: opportunity.id,
        title: opportunity.title,
        status: opportunity.status,
        contactName:
          opportunity.primaryContact?.displayName ??
          opportunity.prospectName ??
          null,
        companyName:
          opportunity.primaryContact?.companyName ??
          opportunity.prospectCompanyName ??
          null,
        customerName: opportunity.customer?.name ?? null,
        customerId: opportunity.customerId,
        projectId: opportunity.projectId,
        projectName: opportunity.project?.name ?? null,
        nextFollowUpAt: opportunity.nextFollowUpAt,
        nextFollowUpNote: opportunity.nextFollowUpNote,
        lastCommunicationAt:
          lastCommunicationByOpportunityId.get(opportunity.id) ?? null,
        bucket
      };
    })
    .filter((item) => {
      if (item.bucket === "no_follow_up") {
        return includeNoFollowUp;
      }

      if (
        item.bucket !== "upcoming" ||
        upcomingDays <= 0 ||
        !item.nextFollowUpAt
      ) {
        return true;
      }

      return new Date(item.nextFollowUpAt).getTime() <= upcomingLimitMs;
    })
    .sort((left, right) => {
      const bucketComparison =
        bucketRank[left.bucket] - bucketRank[right.bucket];

      if (bucketComparison !== 0) {
        return bucketComparison;
      }

      if (left.bucket === "no_follow_up") {
        return left.title.localeCompare(right.title);
      }

      return (left.nextFollowUpAt ?? "").localeCompare(
        right.nextFollowUpAt ?? ""
      );
    });
}
