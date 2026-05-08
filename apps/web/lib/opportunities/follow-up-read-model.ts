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

const closedLeadStatuses = new Set<OpportunityStatus>(["won", "lost", "converted"]);

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
          opportunity.primaryContact?.displayName ?? opportunity.prospectName ?? null,
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

      if (item.bucket !== "upcoming" || upcomingDays <= 0 || !item.nextFollowUpAt) {
        return true;
      }

      return new Date(item.nextFollowUpAt).getTime() <= upcomingLimitMs;
    })
    .sort((left, right) => {
      const bucketComparison = bucketRank[left.bucket] - bucketRank[right.bucket];

      if (bucketComparison !== 0) {
        return bucketComparison;
      }

      if (left.bucket === "no_follow_up") {
        return left.title.localeCompare(right.title);
      }

      return (left.nextFollowUpAt ?? "").localeCompare(right.nextFollowUpAt ?? "");
    });
}
