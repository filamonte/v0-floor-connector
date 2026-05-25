import type {
  AiCopilotDraftActionType,
  AiOperationalCopilotActionKind
} from "./summary";

export type AiOperationalDigestCategory =
  | "needs_attention"
  | "ready_to_move"
  | "financial_follow_up"
  | "signature_follow_up"
  | "field_execution_review"
  | "suggested_draft_action";

export type AiOperationalDigestPriority = "critical" | "high" | "normal";

export type AiOperationalDigestSignal = {
  id: string;
  category: AiOperationalDigestCategory;
  title: string;
  summary: string;
  reason: string;
  priority: AiOperationalDigestPriority;
  href: string;
  linkedRecordLabel: string;
  sourceSignals: string[];
  recommendedNextStep: string;
  draftActionAvailable: boolean;
  draftActionType?: AiCopilotDraftActionType;
  actionKind?: AiOperationalCopilotActionKind;
};

export type AiOperationalDigestSection = {
  key: AiOperationalDigestCategory;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: AiOperationalDigestSignal[];
};

export type AiOperationalDashboardDigest = {
  headlineSummary: string;
  attentionCount: number;
  derivedAt: string;
  urgentItems: AiOperationalDigestSignal[];
  recommendedActions: AiOperationalDigestSignal[];
  stalledWorkflows: AiOperationalDigestSignal[];
  financialFollowUps: AiOperationalDigestSignal[];
  signatureApprovalFollowUps: AiOperationalDigestSignal[];
  schedulingReadinessItems: AiOperationalDigestSignal[];
  fieldExecutionReviewItems: AiOperationalDigestSignal[];
  suggestedDraftActions: AiOperationalDigestSignal[];
  sourceSignals: string[];
  sections: AiOperationalDigestSection[];
};

export type DeriveAiOperationalDashboardDigestInput = {
  derivedAt: string;
  signals: AiOperationalDigestSignal[];
  limitPerSection?: number;
};

const priorityWeight: Record<AiOperationalDigestPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2
};

function sortByPriority(
  left: AiOperationalDigestSignal,
  right: AiOperationalDigestSignal
) {
  const prioritySort =
    priorityWeight[left.priority] - priorityWeight[right.priority];

  if (prioritySort !== 0) {
    return prioritySort;
  }

  return left.title.localeCompare(right.title);
}

function uniqueSignals(signals: string[]) {
  return [...new Set(signals.filter(Boolean))];
}

function selectByCategory(
  signals: AiOperationalDigestSignal[],
  category: AiOperationalDigestCategory,
  limit: number
) {
  return signals
    .filter((signal) => signal.category === category)
    .sort(sortByPriority)
    .slice(0, limit);
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function buildSection(input: {
  key: AiOperationalDigestCategory;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: AiOperationalDigestSignal[];
}): AiOperationalDigestSection {
  return input;
}

export function deriveAiOperationalDashboardDigest(
  input: DeriveAiOperationalDashboardDigestInput
): AiOperationalDashboardDigest {
  const limit = input.limitPerSection ?? 4;
  const sortedSignals = [...input.signals].sort(sortByPriority);
  const urgentItems = sortedSignals
    .filter(
      (signal) =>
        signal.priority === "critical" || signal.category === "needs_attention"
    )
    .slice(0, limit);
  const recommendedActions = sortedSignals.slice(0, limit);
  const stalledWorkflows = sortedSignals
    .filter((signal) =>
      ["needs_attention", "signature_follow_up"].includes(signal.category)
    )
    .slice(0, limit);
  const financialFollowUps = selectByCategory(
    sortedSignals,
    "financial_follow_up",
    limit
  );
  const signatureApprovalFollowUps = selectByCategory(
    sortedSignals,
    "signature_follow_up",
    limit
  );
  const schedulingReadinessItems = selectByCategory(
    sortedSignals,
    "ready_to_move",
    limit
  );
  const fieldExecutionReviewItems = selectByCategory(
    sortedSignals,
    "field_execution_review",
    limit
  );
  const suggestedDraftActions = sortedSignals
    .filter((signal) => signal.draftActionAvailable)
    .slice(0, limit);
  const attentionCount = sortedSignals.filter(
    (signal) => signal.priority !== "normal"
  ).length;
  const sourceSignals = uniqueSignals(
    sortedSignals.flatMap((signal) => signal.sourceSignals)
  );

  return {
    headlineSummary:
      sortedSignals.length === 0
        ? "No Copilot digest items need attention from current dashboard signals."
        : `${formatCount(attentionCount, "high-priority item")} and ${formatCount(
            suggestedDraftActions.length,
            "review-first draft"
          )} are visible from current project and workflow signals.`,
    attentionCount,
    derivedAt: input.derivedAt,
    urgentItems,
    recommendedActions,
    stalledWorkflows,
    financialFollowUps,
    signatureApprovalFollowUps,
    schedulingReadinessItems,
    fieldExecutionReviewItems,
    suggestedDraftActions,
    sourceSignals,
    sections: [
      buildSection({
        key: "needs_attention",
        title: "Needs attention",
        emptyTitle: "No urgent Copilot attention items.",
        emptyDescription:
          "Blocked, stalled, or high-priority project signals will appear here.",
        items: urgentItems
      }),
      buildSection({
        key: "ready_to_move",
        title: "Ready to move",
        emptyTitle: "No ready handoffs are waiting.",
        emptyDescription:
          "Ready-to-schedule projects and unscheduled canonical jobs will appear here.",
        items: schedulingReadinessItems
      }),
      buildSection({
        key: "financial_follow_up",
        title: "Financial follow-up",
        emptyTitle: "No payment or collection follow-up is active.",
        emptyDescription:
          "Open deposits, overdue invoices, and collection risk will appear here.",
        items: financialFollowUps
      }),
      buildSection({
        key: "field_execution_review",
        title: "Field / execution review",
        emptyTitle: "No field execution review items.",
        emptyDescription:
          "Field blockers, active work, and readiness warnings will appear here.",
        items: fieldExecutionReviewItems
      }),
      buildSection({
        key: "suggested_draft_action",
        title: "Suggested draft actions",
        emptyTitle: "No review-first drafts are suggested.",
        emptyDescription:
          "When a customer or internal follow-up draft is useful, the digest will flag it without sending or saving anything.",
        items: suggestedDraftActions
      })
    ]
  };
}
