import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import { listOpportunities, requireOpportunityScope } from "./data";
import { buildLeadFollowUpQueue } from "./follow-up-read-model";

type CommunicationThreadFollowUpRow = {
  subject_id: string | null;
  last_message_at: string | null;
};

async function listLastCommunicationByOpportunityId(
  organizationId: string,
  opportunityIds: string[]
) {
  const lastCommunicationByOpportunityId = new Map<string, string | null>();

  if (opportunityIds.length === 0) {
    return lastCommunicationByOpportunityId;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_threads")
    .select("subject_id, last_message_at")
    .eq("company_id", organizationId)
    .eq("subject_type", "opportunity")
    .in("subject_id", opportunityIds);

  if (response.error) {
    throw new Error(
      `Unable to load opportunity communication recency: ${response.error.message}`
    );
  }

  for (const row of (response.data as CommunicationThreadFollowUpRow[] | null) ?? []) {
    if (!row.subject_id || !row.last_message_at) {
      continue;
    }

    const current = lastCommunicationByOpportunityId.get(row.subject_id);

    if (!current || row.last_message_at > current) {
      lastCommunicationByOpportunityId.set(row.subject_id, row.last_message_at);
    }
  }

  return lastCommunicationByOpportunityId;
}

export async function listLeadFollowUpQueue(input?: {
  includeNoFollowUp?: boolean;
  upcomingDays?: number;
  nowIso?: string;
}) {
  const scope = await requireOpportunityScope("/leads");
  const opportunities = await listOpportunities();
  const opportunityIds = opportunities.map((opportunity) => opportunity.id);
  const lastCommunicationByOpportunityId = await listLastCommunicationByOpportunityId(
    scope.organizationId,
    opportunityIds
  );

  return buildLeadFollowUpQueue({
    opportunities,
    lastCommunicationByOpportunityId,
    nowIso: input?.nowIso ?? new Date().toISOString(),
    includeNoFollowUp: input?.includeNoFollowUp ?? false,
    upcomingDays: input?.upcomingDays ?? 7
  });
}
