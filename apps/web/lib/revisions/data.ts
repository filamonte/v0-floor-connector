import "server-only";

import type {
  RecordRevision,
  RecordRevisionKind,
  RecordRevisionSubjectType
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRecordRevisionDisplayMetadata,
  parseRecordRevisionKind,
  parseRecordRevisionSubjectType,
  type RecordRevisionListItem,
  type RecordRevisionSnapshot
} from "./types";

type RecordRevisionRow = {
  id: string;
  company_id: string;
  subject_type: string;
  subject_id: string;
  revision_number: number;
  is_current: boolean;
  revision_reason: string | null;
  revision_kind: string;
  snapshot: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

type CreateRecordRevisionInput = {
  organizationId: string;
  subjectType: RecordRevisionSubjectType;
  subjectId: string;
  revisionKind: RecordRevisionKind;
  revisionReason?: string | null;
  snapshot: RecordRevisionSnapshot;
  createdByUserId?: string | null;
};

function mapRecordRevision(row: RecordRevisionRow): RecordRevision {
  const subjectType = parseRecordRevisionSubjectType(row.subject_type);
  const revisionKind = parseRecordRevisionKind(row.revision_kind);

  if (!subjectType || !revisionKind) {
    throw new Error("Record revision row contains an unsupported subject type or kind.");
  }

  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType,
    subjectId: row.subject_id,
    revisionNumber: row.revision_number,
    isCurrent: row.is_current,
    revisionReason: row.revision_reason,
    revisionKind,
    snapshot: row.snapshot,
    createdByUserId: row.created_by,
    createdAt: row.created_at
  };
}

export async function listRecordRevisions(input: {
  organizationId: string;
  subjectType: RecordRevisionSubjectType;
  subjectId: string;
}): Promise<RecordRevisionListItem[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("record_revisions")
    .select(
      `
        id,
        company_id,
        subject_type,
        subject_id,
        revision_number,
        is_current,
        revision_reason,
        revision_kind,
        snapshot,
        created_by,
        created_at
      `
    )
    .eq("company_id", input.organizationId)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .order("revision_number", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load record revisions: ${response.error.message}`);
  }

  const rows = (response.data ?? []) as RecordRevisionRow[];
  return rows.map((row) => getRecordRevisionDisplayMetadata(mapRecordRevision(row)));
}

export async function getCurrentRecordRevision(input: {
  organizationId: string;
  subjectType: RecordRevisionSubjectType;
  subjectId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("record_revisions")
    .select(
      `
        id,
        company_id,
        subject_type,
        subject_id,
        revision_number,
        is_current,
        revision_reason,
        revision_kind,
        snapshot,
        created_by,
        created_at
      `
    )
    .eq("company_id", input.organizationId)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .eq("is_current", true)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load current record revision: ${response.error.message}`);
  }

  return response.data
    ? getRecordRevisionDisplayMetadata(mapRecordRevision(response.data as RecordRevisionRow))
    : null;
}

export async function createRecordRevision(input: CreateRecordRevisionInput) {
  if (input.snapshot.subjectType !== input.subjectType || input.snapshot.subjectId !== input.subjectId) {
    throw new Error("Record revision snapshot subject does not match the canonical record.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .rpc("create_record_revision", {
      p_company_id: input.organizationId,
      p_subject_type: input.subjectType,
      p_subject_id: input.subjectId,
      p_revision_kind: input.revisionKind,
      p_snapshot: input.snapshot,
      p_revision_reason: input.revisionReason ?? null,
      p_created_by: input.createdByUserId ?? null
    })
    .single();

  if (response.error) {
    throw new Error(`Unable to create record revision: ${response.error.message}`);
  }

  return getRecordRevisionDisplayMetadata(
    mapRecordRevision(response.data as RecordRevisionRow)
  );
}

export async function ensureInitialRecordRevision(input: CreateRecordRevisionInput) {
  const current = await getCurrentRecordRevision({
    organizationId: input.organizationId,
    subjectType: input.subjectType,
    subjectId: input.subjectId
  });

  if (current) {
    return current;
  }

  return createRecordRevision(input);
}
