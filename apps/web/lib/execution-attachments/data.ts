import "server-only";

import { randomUUID } from "node:crypto";

import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import type {
  ExecutionAttachment as ExecutionAttachmentRecord,
  MembershipRole
} from "@floorconnector/types";

import type { ExecutionAttachmentInput } from "./schemas";
import {
  EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS,
  buildExecutionAttachmentPreviewState,
  isPrivateFieldEvidenceStoragePath,
  type ExecutionAttachmentPreviewState
} from "./preview";
import {
  buildExecutionAttachmentStoragePath,
  validateExecutionAttachmentUploadFile
} from "./storage";
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
  archived_at: string | null;
  archived_by: string | null;
  archive_reason: string | null;
  restored_at: string | null;
  restored_by: string | null;
  restore_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type ExecutionAttachmentListItem = ExecutionAttachmentRecord;

export type ExecutionAttachmentUploadInput = {
  subjectType: ExecutionAttachmentRecord["subjectType"];
  subjectId: string;
  file: File;
  caption: string | null;
};

export type ExecutionAttachmentListOptions = {
  includeArchived?: boolean;
};

export type ExecutionAttachmentLifecycleInput = {
  attachmentId: string;
  reason?: string | null;
  next?: string;
};

type ExecutionAttachmentSubjectContext = {
  subjectType: ExecutionAttachmentRecord["subjectType"];
  subjectId: string;
  projectId: string;
  jobId: string | null;
  dailyLogId: string | null;
  fieldNoteId: string | null;
  workItemId: string | null;
};

export type ExecutionAttachmentLifecycleResult = {
  attachment: ExecutionAttachmentRecord;
  context: ExecutionAttachmentSubjectContext;
};

export type ExecutionAttachmentPreviewListItem = ExecutionAttachmentRecord & {
  preview: ExecutionAttachmentPreviewState;
};

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
  archived_at,
  archived_by,
  archive_reason,
  restored_at,
  restored_by,
  restore_reason,
  created_at,
  updated_at
`;

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

function isExecutionAttachmentRow(
  value: unknown
): value is ExecutionAttachmentRow {
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

function isExecutionAttachmentRowArray(
  value: unknown
): value is ExecutionAttachmentRow[] {
  return (
    Array.isArray(value) && value.every((row) => isExecutionAttachmentRow(row))
  );
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
    archivedAt: row.archived_at,
    archivedByUserId: row.archived_by,
    archiveReason: row.archive_reason,
    restoredAt: row.restored_at,
    restoredByUserId: row.restored_by,
    restoreReason: row.restore_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeLifecycleReason(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed.slice(0, 1000) : null;
}

function assertCanManageExecutionAttachment(role: MembershipRole) {
  if (!mutationRoles.has(role)) {
    throw new Error("Field evidence management access is required.");
  }
}

function attachmentNotFoundError() {
  return new Error(
    "Field evidence attachment not found for this organization."
  );
}

async function resolveExecutionAttachmentSubjectContext(
  organizationId: string,
  input: Pick<ExecutionAttachmentInput, "subjectType" | "subjectId">
): Promise<ExecutionAttachmentSubjectContext> {
  if (input.subjectType === "daily_log") {
    const dailyLog = await getDailyLogById(
      input.subjectId,
      `/daily-logs/${input.subjectId}`
    );

    if (!dailyLog || dailyLog.organizationId !== organizationId) {
      throw new Error("Daily log not found for this organization.");
    }

    await assertProjectReadinessGate({
      organizationId,
      projectId: dailyLog.projectId,
      errorMessage:
        "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before adding execution attachments."
    });

    return {
      subjectType: "daily_log",
      subjectId: dailyLog.id,
      projectId: dailyLog.projectId,
      jobId: dailyLog.jobId,
      dailyLogId: dailyLog.id,
      fieldNoteId: null,
      workItemId: null
    };
  }

  if (input.subjectType === "work_item") {
    const workItem = await getWorkItemAttachmentSubject(
      organizationId,
      input.subjectId
    );

    await assertProjectReadinessGate({
      organizationId,
      projectId: workItem.projectId,
      errorMessage:
        "Project is not ready for execution workflows yet. Complete contract, financial, and workflow readiness from the project hub before adding work item evidence."
    });

    return {
      subjectType: "work_item",
      subjectId: workItem.id,
      projectId: workItem.projectId,
      jobId: workItem.jobId,
      dailyLogId: null,
      fieldNoteId: null,
      workItemId: workItem.id
    };
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

  return {
    subjectType: "field_note",
    subjectId: fieldNote.id,
    projectId: fieldNote.projectId,
    jobId: fieldNote.jobId,
    dailyLogId: fieldNote.dailyLogId,
    fieldNoteId: fieldNote.id,
    workItemId: null
  };
}

async function getWorkItemAttachmentSubject(
  organizationId: string,
  workItemId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .select("id, company_id, project_id, source_type, source_id, status")
    .eq("company_id", organizationId)
    .eq("id", workItemId)
    .maybeSingle();
  const row = response.data as {
    id: string;
    company_id: string;
    project_id: string | null;
    source_type: string | null;
    source_id: string | null;
    status: string;
  } | null;

  if (response.error) {
    throw new Error(`Unable to validate work item: ${response.error.message}`);
  }

  if (!row || row.company_id !== organizationId) {
    throw new Error("Work item not found for this organization.");
  }

  if (!row.project_id) {
    throw new Error("Work item evidence requires project context.");
  }

  let jobId: string | null = null;

  if (row.source_type === "job" && row.source_id) {
    const jobResponse = await supabase
      .from("jobs")
      .select("id, project_id")
      .eq("company_id", organizationId)
      .eq("id", row.source_id)
      .maybeSingle();
    const job = jobResponse.data as { id: string; project_id: string } | null;

    if (jobResponse.error) {
      throw new Error(
        `Unable to validate work item job: ${jobResponse.error.message}`
      );
    }

    if (!job || job.project_id !== row.project_id) {
      throw new Error("Work item job context must belong to the same project.");
    }

    jobId = job.id;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    jobId
  };
}

async function validateExecutionAttachmentPreviewParent(
  organizationId: string,
  attachment: Pick<
    ExecutionAttachmentRecord,
    "subjectType" | "subjectId" | "organizationId"
  >,
  next: string
) {
  if (attachment.organizationId !== organizationId) {
    throw attachmentNotFoundError();
  }

  if (attachment.subjectType === "daily_log") {
    const dailyLog = await getDailyLogById(attachment.subjectId, next);

    if (!dailyLog || dailyLog.organizationId !== organizationId) {
      throw attachmentNotFoundError();
    }

    return;
  }

  if (attachment.subjectType === "work_item") {
    await getWorkItemAttachmentSubject(organizationId, attachment.subjectId);
    return;
  }

  const fieldNote = await getFieldNoteById(attachment.subjectId, next);

  if (!fieldNote || fieldNote.organizationId !== organizationId) {
    throw attachmentNotFoundError();
  }

  const dailyLog = await getDailyLogById(fieldNote.dailyLogId, next);

  if (
    !dailyLog ||
    dailyLog.organizationId !== organizationId ||
    dailyLog.projectId !== fieldNote.projectId
  ) {
    throw attachmentNotFoundError();
  }
}

async function resolveExecutionAttachmentLifecycleContext(
  organizationId: string,
  attachment: Pick<
    ExecutionAttachmentRecord,
    "subjectType" | "subjectId" | "organizationId"
  >,
  next: string
): Promise<ExecutionAttachmentSubjectContext> {
  if (attachment.organizationId !== organizationId) {
    throw attachmentNotFoundError();
  }

  if (attachment.subjectType === "daily_log") {
    const dailyLog = await getDailyLogById(attachment.subjectId, next);

    if (!dailyLog || dailyLog.organizationId !== organizationId) {
      throw attachmentNotFoundError();
    }

    return {
      subjectType: "daily_log",
      subjectId: dailyLog.id,
      projectId: dailyLog.projectId,
      jobId: dailyLog.jobId,
      dailyLogId: dailyLog.id,
      fieldNoteId: null,
      workItemId: null
    };
  }

  if (attachment.subjectType === "work_item") {
    const workItem = await getWorkItemAttachmentSubject(
      organizationId,
      attachment.subjectId
    );

    return {
      subjectType: "work_item",
      subjectId: workItem.id,
      projectId: workItem.projectId,
      jobId: workItem.jobId,
      dailyLogId: null,
      fieldNoteId: null,
      workItemId: workItem.id
    };
  }

  const fieldNote = await getFieldNoteById(attachment.subjectId, next);

  if (!fieldNote || fieldNote.organizationId !== organizationId) {
    throw attachmentNotFoundError();
  }

  const dailyLog = await getDailyLogById(fieldNote.dailyLogId, next);

  if (
    !dailyLog ||
    dailyLog.organizationId !== organizationId ||
    dailyLog.projectId !== fieldNote.projectId
  ) {
    throw attachmentNotFoundError();
  }

  return {
    subjectType: "field_note",
    subjectId: fieldNote.id,
    projectId: fieldNote.projectId,
    jobId: fieldNote.jobId,
    dailyLogId: fieldNote.dailyLogId,
    fieldNoteId: fieldNote.id,
    workItemId: null
  };
}

async function getExecutionAttachmentById(
  attachmentId: string,
  organizationId: string,
  options: ExecutionAttachmentListOptions = {}
) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .eq("company_id", organizationId)
    .eq("id", attachmentId);

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  const response = await query.maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load field evidence attachment: ${response.error.message}`
    );
  }

  if (!isExecutionAttachmentRow(data)) {
    throw attachmentNotFoundError();
  }

  return mapExecutionAttachment(data);
}

export async function listExecutionAttachmentsBySubject(
  subjectType: ExecutionAttachmentRecord["subjectType"],
  subjectId: string,
  next = "/daily-logs",
  options: ExecutionAttachmentListOptions = {}
): Promise<ExecutionAttachmentListItem[]> {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId);

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  const response = await query.order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load execution attachments: ${response.error.message}`
    );
  }

  if (!isExecutionAttachmentRowArray(data)) {
    return [];
  }

  return data.map(mapExecutionAttachment);
}

export async function listExecutionAttachmentsBySubjects(
  subjects: Array<{
    subjectType: ExecutionAttachmentRecord["subjectType"];
    subjectId: string;
  }>,
  next = "/daily-logs",
  options: ExecutionAttachmentListOptions = {}
): Promise<ExecutionAttachmentListItem[]> {
  if (subjects.length === 0) {
    return [];
  }

  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const dailyLogIds = subjects
    .filter((subject) => subject.subjectType === "daily_log")
    .map((subject) => subject.subjectId);
  const fieldNoteIds = subjects
    .filter((subject) => subject.subjectType === "field_note")
    .map((subject) => subject.subjectId);
  const workItemIds = subjects
    .filter((subject) => subject.subjectType === "work_item")
    .map((subject) => subject.subjectId);
  const dailyLogQuery =
    dailyLogIds.length > 0
      ? supabase
          .from("execution_attachments")
          .select(executionAttachmentSelect)
          .eq("company_id", scope.organizationId)
          .eq("subject_type", "daily_log")
          .in("subject_id", dailyLogIds)
      : null;
  const fieldNoteQuery =
    fieldNoteIds.length > 0
      ? supabase
          .from("execution_attachments")
          .select(executionAttachmentSelect)
          .eq("company_id", scope.organizationId)
          .eq("subject_type", "field_note")
          .in("subject_id", fieldNoteIds)
      : null;
  const workItemQuery =
    workItemIds.length > 0
      ? supabase
          .from("execution_attachments")
          .select(executionAttachmentSelect)
          .eq("company_id", scope.organizationId)
          .eq("subject_type", "work_item")
          .in("subject_id", workItemIds)
      : null;

  if (dailyLogQuery && !options.includeArchived) {
    dailyLogQuery.is("archived_at", null);
  }

  if (fieldNoteQuery && !options.includeArchived) {
    fieldNoteQuery.is("archived_at", null);
  }

  if (workItemQuery && !options.includeArchived) {
    workItemQuery.is("archived_at", null);
  }

  const responses = await Promise.all([
    dailyLogQuery
      ? dailyLogQuery.order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    fieldNoteQuery
      ? fieldNoteQuery.order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    workItemQuery
      ? workItemQuery.order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null })
  ]);
  const error = responses.find((response) => response.error)?.error;

  if (error) {
    throw new Error(`Unable to load execution attachments: ${error.message}`);
  }

  const data: unknown[] = responses.flatMap((response) => response.data ?? []);

  if (!isExecutionAttachmentRowArray(data)) {
    return [];
  }

  return data
    .map(mapExecutionAttachment)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function listExecutionAttachmentsByFieldNotes(
  fieldNoteIds: string[],
  next = "/daily-logs",
  options: ExecutionAttachmentListOptions = {}
): Promise<ExecutionAttachmentListItem[]> {
  if (fieldNoteIds.length === 0) {
    return [];
  }

  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", "field_note")
    .in("subject_id", fieldNoteIds);

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  const response = await query.order("created_at", { ascending: false });
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

export async function createExecutionAttachmentSignedUrl(
  attachmentId: string,
  next = "/daily-logs"
) {
  const scope = await requireDailyLogScope(next);
  const attachment = await getExecutionAttachmentById(
    attachmentId,
    scope.organizationId
  );

  await validateExecutionAttachmentPreviewParent(
    scope.organizationId,
    attachment,
    next
  );

  if (!isPrivateFieldEvidenceStoragePath(attachment)) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .createSignedUrl(
      attachment.storagePath,
      EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS
    );

  if (response.error) {
    return null;
  }

  return response.data?.signedUrl ?? null;
}

export async function resolveExecutionAttachmentPreviews(
  attachments: ExecutionAttachmentRecord[],
  next = "/daily-logs"
): Promise<ExecutionAttachmentPreviewListItem[]> {
  const signedUrlEntries = await Promise.all(
    attachments.map(async (attachment) => {
      const signedUrl = await createExecutionAttachmentSignedUrl(
        attachment.id,
        next
      );

      return [attachment.id, signedUrl] as const;
    })
  );
  const signedUrlMap = new Map<string, string | null>(signedUrlEntries);

  return attachments.map((attachment) => ({
    ...attachment,
    preview: buildExecutionAttachmentPreviewState(
      attachment,
      signedUrlMap.get(attachment.id) ?? null
    )
  }));
}

export async function createExecutionAttachment(
  input: ExecutionAttachmentInput
) {
  const scope = await requireDailyLogScope("/daily-logs");
  await resolveExecutionAttachmentSubjectContext(scope.organizationId, input);
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
    throw new Error(
      `Unable to create the execution attachment: ${response.error.message}`
    );
  }

  if (!isExecutionAttachmentRow(data)) {
    throw new Error("Unexpected execution attachment response after create.");
  }

  return mapExecutionAttachment(data);
}

export async function archiveExecutionAttachment(
  input: ExecutionAttachmentLifecycleInput
): Promise<ExecutionAttachmentLifecycleResult> {
  const scope = await requireDailyLogScope(input.next ?? "/daily-logs");
  assertCanManageExecutionAttachment(scope.role);
  const attachment = await getExecutionAttachmentById(
    input.attachmentId,
    scope.organizationId,
    { includeArchived: true }
  );
  const context = await resolveExecutionAttachmentLifecycleContext(
    scope.organizationId,
    attachment,
    input.next ?? "/daily-logs"
  );

  if (attachment.archivedAt) {
    return { attachment, context };
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("execution_attachments")
    .update({
      archived_at: new Date().toISOString(),
      archived_by: scope.userId,
      archive_reason: normalizeLifecycleReason(input.reason),
      restored_at: null,
      restored_by: null,
      restore_reason: null
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.attachmentId)
    .select(executionAttachmentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to archive field evidence: ${response.error.message}`
    );
  }

  if (!isExecutionAttachmentRow(data)) {
    throw new Error("Unexpected field evidence response after archive.");
  }

  return {
    attachment: mapExecutionAttachment(data),
    context
  };
}

export async function restoreExecutionAttachment(
  input: ExecutionAttachmentLifecycleInput
): Promise<ExecutionAttachmentLifecycleResult> {
  const scope = await requireDailyLogScope(input.next ?? "/daily-logs");
  assertCanManageExecutionAttachment(scope.role);
  const attachment = await getExecutionAttachmentById(
    input.attachmentId,
    scope.organizationId,
    { includeArchived: true }
  );
  const context = await resolveExecutionAttachmentLifecycleContext(
    scope.organizationId,
    attachment,
    input.next ?? "/daily-logs"
  );

  if (!attachment.archivedAt) {
    return { attachment, context };
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("execution_attachments")
    .update({
      archived_at: null,
      archived_by: null,
      archive_reason: null,
      restored_at: new Date().toISOString(),
      restored_by: scope.userId,
      restore_reason: normalizeLifecycleReason(input.reason)
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.attachmentId)
    .select(executionAttachmentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to restore field evidence: ${response.error.message}`
    );
  }

  if (!isExecutionAttachmentRow(data)) {
    throw new Error("Unexpected field evidence response after restore.");
  }

  return {
    attachment: mapExecutionAttachment(data),
    context
  };
}

export async function createUploadedExecutionAttachment(
  input: ExecutionAttachmentUploadInput
) {
  const scope = await requireDailyLogScope("/daily-logs");
  const subjectContext = await resolveExecutionAttachmentSubjectContext(
    scope.organizationId,
    input
  );
  const fileValidation = validateExecutionAttachmentUploadFile(input.file);

  if (!fileValidation.ok) {
    throw new Error(fileValidation.message);
  }

  const supabase = await getSupabaseServerClient();
  const attachmentId = randomUUID();
  const storagePath = buildExecutionAttachmentStoragePath({
    companyId: scope.organizationId,
    projectId: subjectContext.projectId,
    dailyLogId: subjectContext.dailyLogId,
    fieldNoteId: subjectContext.fieldNoteId,
    workItemId: subjectContext.workItemId,
    attachmentId,
    fileName: fileValidation.safeFileName
  });
  const uploadResponse = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .upload(storagePath, input.file, {
      contentType: fileValidation.mimeType,
      upsert: false
    });

  if (uploadResponse.error) {
    throw new Error(
      `Unable to upload field evidence: ${uploadResponse.error.message}`
    );
  }

  const insertResponse = await supabase
    .from("execution_attachments")
    .insert({
      id: attachmentId,
      company_id: scope.organizationId,
      subject_type: subjectContext.subjectType,
      subject_id: subjectContext.subjectId,
      attachment_type: fileValidation.attachmentType,
      storage_path: storagePath,
      file_name: fileValidation.fileName,
      mime_type: fileValidation.mimeType,
      caption: input.caption,
      uploaded_by: scope.userId
    })
    .select(executionAttachmentSelect)
    .single();
  const data: unknown = insertResponse.data;

  if (insertResponse.error) {
    await supabase.storage
      .from(STORAGE_BUCKET_NAMES.documents)
      .remove([storagePath]);

    throw new Error(
      `Unable to save the field evidence record: ${insertResponse.error.message}`
    );
  }

  if (!isExecutionAttachmentRow(data)) {
    await supabase.storage
      .from(STORAGE_BUCKET_NAMES.documents)
      .remove([storagePath]);

    throw new Error("Unexpected field evidence response after upload.");
  }

  return {
    attachment: mapExecutionAttachment(data),
    context: subjectContext
  };
}
