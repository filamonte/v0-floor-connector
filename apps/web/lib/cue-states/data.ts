import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CueStateValue,
  WorkflowCueIdentity,
  WorkflowCueStateRecord
} from "./types";

type WorkflowCueStateRow = {
  id: string;
  company_id: string;
  cue_family: "operational" | "project_guidance";
  cue_key: string;
  cue_version: number;
  cue_fingerprint: string;
  subject_type: WorkflowCueIdentity["subjectType"];
  subject_id: string;
  project_id: string | null;
  scope: "user" | "company";
  user_id: string | null;
  state: CueStateValue;
  snoozed_until: string | null;
  dismissed_at: string | null;
  resolved_at: string | null;
};

function mapWorkflowCueState(row: WorkflowCueStateRow): WorkflowCueStateRecord {
  return {
    id: row.id,
    companyId: row.company_id,
    cueFamily: row.cue_family,
    cueKey: row.cue_key,
    cueVersion: row.cue_version,
    cueFingerprint: row.cue_fingerprint,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    projectId: row.project_id,
    scope: row.scope,
    userId: row.user_id,
    state: row.state,
    snoozedUntil: row.snoozed_until,
    dismissedAt: row.dismissed_at,
    resolvedAt: row.resolved_at
  };
}

function identityKey(identity: WorkflowCueIdentity) {
  return [
    identity.companyId,
    identity.cueFamily,
    identity.cueKey,
    identity.cueVersion,
    identity.cueFingerprint,
    identity.subjectType,
    identity.subjectId
  ].join("|");
}

export async function listWorkflowCueStatesForIdentities(input: {
  companyId: string;
  currentUserId: string;
  identities: WorkflowCueIdentity[];
}) {
  if (input.identities.length === 0) {
    return [];
  }

  const cueKeys = Array.from(new Set(input.identities.map((identity) => identity.cueKey)));
  const subjectIds = Array.from(
    new Set(input.identities.map((identity) => identity.subjectId))
  );
  const fingerprints = Array.from(
    new Set(input.identities.map((identity) => identity.cueFingerprint))
  );
  const requestedIdentityKeys = new Set(input.identities.map(identityKey));
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("workflow_cue_states")
    .select(
      "id, company_id, cue_family, cue_key, cue_version, cue_fingerprint, subject_type, subject_id, project_id, scope, user_id, state, snoozed_until, dismissed_at, resolved_at"
    )
    .eq("company_id", input.companyId)
    .in("cue_key", cueKeys)
    .in("subject_id", subjectIds)
    .in("cue_fingerprint", fingerprints);

  if (response.error) {
    throw new Error(`Unable to load workflow cue states: ${response.error.message}`);
  }

  return ((response.data ?? []) as WorkflowCueStateRow[])
    .filter(
      (row) =>
        (row.scope === "company" || row.user_id === input.currentUserId) &&
        requestedIdentityKeys.has(
          identityKey({
            companyId: row.company_id,
            cueFamily: row.cue_family,
            cueKey: row.cue_key,
            cueVersion: row.cue_version,
            cueFingerprint: row.cue_fingerprint,
            subjectType: row.subject_type,
            subjectId: row.subject_id,
            projectId: row.project_id
          })
        )
    )
    .map(mapWorkflowCueState);
}
