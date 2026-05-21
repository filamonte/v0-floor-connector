import "server-only";

import type { ExecutionAttachment as ExecutionAttachmentRecord } from "@floorconnector/types";

import type { ExecutionAttachmentInput } from "./schemas";
import { getDailyLogById, requireDailyLogScope } from "@/lib/daily-logs/data";
import { getFieldNoteById } from "@/lib/field-notes/data";
import { assertProjectReadinessGate } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ExecutionAttachmentRow = {
  id: string;
  company_id: string;
  subject_type: ExecutionAttachmentRecord["subjectType"];
  subject_id: string;
  attachment_type: ExecutionAttachmentRecord["attachmentType"];
  storage_path: string;
  file_name: string;
  mime_type: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExecutionAttachmentListItem = ExecutionAttachmentRecord;

const executionAttachmentSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  attachment_type,
  storage_path,
  file_name,
  mime_type,
  caption,
  uploaded_by,
  created_at,
  updated_at
`;

function isExecutionAttachmentRow(value: unknown): value is ExecutionAttachmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ExecutionAttachmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.subject_type === "string" &&
    typeof row.subject_id === "string" &&
    typeof row.attachment_type === "string" &&
    typeof row.storage_path === "string" &&
    typeof row.file_name === "string" &&
    typeof row.mime_type === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isExecutionAttachmentRowArray(value: unknown): value is ExecutionAttachmentRow[] {
  return Array.isArray(value) && value.every((row) => isExecutionAttachmentRow(row));
}

function mapExecutionAttachment(
  row: ExecutionAttachmentRow
): ExecutionAttachmentRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    attachmentType: row.attachment_type,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    caption: row.caption,
    uploadedByUserId: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function validateExecutionAttachmentInput(
  organizationId: string,
  input: ExecutionAttachmentInput
) {
  if (input.subjectType === "daily_log") {
    const dailyLog = await getDailyLogById(input.subjectId, `/daily-logs/${input.subjectId}`);

    if (!dailyLog || dailyLog.organizationId !== organizationId) {
      throw new Error("Daily log not found for this organization.");
    }

    await assertProjectReadinessGate({
      organizationId,
      projectId: dailyLog.projectId,
      errorMessage:
        "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before adding execution attachments."
    });

    return;
  }

  const fieldNote = await getFieldNoteById(input.subjectId, `/daily-logs`);

  if (!fieldNote || fieldNote.organizationId !== organizationId) {
    throw new Error("Field note not found for this organization.");
  }

  await assertProjectReadinessGate({
    organizationId,
    projectId: fieldNote.projectId,
    errorMessage:
      "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before adding execution attachments."
  });
}

export async function listExecutionAttachmentsBySubject(
  subjectType: ExecutionAttachmentRecord["subjectType"],
  subjectId: string,
  next = "/daily-logs"
): Promise<ExecutionAttachmentListItem[]> {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load execution attachments: ${response.error.message}`);
  }

  if (!isExecutionAttachmentRowArray(data)) {
    return [];
  }

  return data.map(mapExecutionAttachment);
}

export async function listExecutionAttachmentsByFieldNotes(
  fieldNoteIds: string[],
  next = "/daily-logs"
): Promise<ExecutionAttachmentListItem[]> {
  if (fieldNoteIds.length === 0) {
    return [];
  }

  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", "field_note")
    .in("subject_id", fieldNoteIds)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load field-note execution attachments: ${response.error.message}`
    );
  }

  if (!isExecutionAttachmentRowArray(data)) {
    return [];
  }

  return data.map(mapExecutionAttachment);
}

export async function createExecutionAttachment(input: ExecutionAttachmentInput) {
  const scope = await requireDailyLogScope("/daily-logs");
  await validateExecutionAttachmentInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("execution_attachments")
    .insert({
      company_id: scope.organizationId,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      attachment_type: input.attachmentType,
      storage_path: input.storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType,
      caption: input.caption,
      uploaded_by: scope.userId
    })
    .select(executionAttachmentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the execution attachment: ${response.error.message}`);
  }

  if (!isExecutionAttachmentRow(data)) {
    throw new Error("Unexpected execution attachment response after create.");
  }

  return mapExecutionAttachment(data);
}
