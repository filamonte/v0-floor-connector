import "server-only";

import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { getGateKeeperCreateOpportunityDuplicatePreviewForDraft } from "./create-opportunity-duplicates-data";
import {
  buildGateKeeperCreateOpportunityPreflight,
  buildGateKeeperCreateOpportunitySavedDraftAttempt,
  selectLatestGateKeeperCreateOpportunityDraftAttempts,
  type GateKeeperCreateOpportunityPreflight,
  type GateKeeperCreateOpportunitySavedDraftAttempt
} from "./create-opportunity-preflight";

type ExecutionAttemptRow = {
  id: string;
  suggestion_id: string;
  status: string;
  idempotency_key: string;
  executed_at: string | null;
  executed_by: string | null;
  execution_error: string | null;
  requested_at: string | null;
  requested_by: string | null;
  result_subject_id: string | null;
  result_subject_type: string | null;
  validated_payload: unknown;
  validation_errors: unknown;
  created_at: string;
  updated_at: string;
};

async function requireCreateOpportunityPreflightScope() {
  const user = await requireAuthenticatedUser("/gatekeeper");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error(
      "No active organization is available for GateKeeper execution preflight."
    );
  }

  return {
    organizationId: organizationContext.organization.id
  };
}

export async function getLatestCreateOpportunityExecutionDraftsForSuggestions(input: {
  suggestions: Pick<GateKeeperActionSuggestion, "id" | "suggestionType">[];
}): Promise<Map<string, GateKeeperCreateOpportunitySavedDraftAttempt>> {
  const suggestionIds = input.suggestions
    .filter((suggestion) => suggestion.suggestionType === "create_opportunity")
    .map((suggestion) => suggestion.id);

  if (suggestionIds.length === 0) {
    return new Map<string, GateKeeperCreateOpportunitySavedDraftAttempt>();
  }

  const scope = await requireCreateOpportunityPreflightScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("gatekeeper_execution_attempts")
    .select(
      "id, suggestion_id, status, idempotency_key, requested_at, requested_by, executed_at, executed_by, result_subject_type, result_subject_id, validated_payload, validation_errors, execution_error, created_at, updated_at"
    )
    .eq("company_id", scope.organizationId)
    .eq("action_type", "create_opportunity")
    .in("status", [
      "draft",
      "confirmation_started",
      "execution_requested",
      "executed",
      "failed"
    ])
    .in("suggestion_id", suggestionIds)
    .order("updated_at", { ascending: false })
    .limit(Math.max(suggestionIds.length * 3, 10));

  if (response.error) {
    throw new Error(
      `Unable to load GateKeeper create-opportunity execution drafts: ${response.error.message}`
    );
  }

  const attempts = ((response.data as ExecutionAttemptRow[] | null) ?? [])
    .map((row) =>
      buildGateKeeperCreateOpportunitySavedDraftAttempt({
        id: row.id,
        suggestionId: row.suggestion_id,
        status: row.status,
        idempotencyKey: row.idempotency_key,
        requestedAt: row.requested_at,
        requestedBy: row.requested_by,
        executedAt: row.executed_at,
        executedBy: row.executed_by,
        executionError: row.execution_error,
        resultSubjectId: row.result_subject_id,
        resultSubjectType: row.result_subject_type,
        validatedPayload: row.validated_payload,
        validationErrors: row.validation_errors,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })
    )
    .filter((attempt): attempt is NonNullable<typeof attempt> =>
      Boolean(attempt)
    );

  return selectLatestGateKeeperCreateOpportunityDraftAttempts(attempts);
}

export async function getGateKeeperCreateOpportunityPreflights(input: {
  suggestions: GateKeeperActionSuggestion[];
}): Promise<Map<string, GateKeeperCreateOpportunityPreflight>> {
  const savedDrafts =
    await getLatestCreateOpportunityExecutionDraftsForSuggestions({
      suggestions: input.suggestions
    });
  const entries = await Promise.all(
    Array.from(savedDrafts.entries()).map(
      async ([suggestionId, savedDraft]) => {
        const duplicatePreview =
          await getGateKeeperCreateOpportunityDuplicatePreviewForDraft({
            draft: savedDraft.draft,
            excludeExecutionAttemptId: savedDraft.id,
            suggestionId
          });

        return [
          suggestionId,
          buildGateKeeperCreateOpportunityPreflight({
            duplicatePreview,
            savedDraft
          })
        ] as const;
      }
    )
  );

  return new Map(entries);
}
