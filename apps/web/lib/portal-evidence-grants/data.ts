import "server-only";

import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import type {
  ExecutionAttachment,
  MembershipRole,
  PortalEvidenceGrant
} from "@floorconnector/types";

import { requireDailyLogScope } from "@/lib/daily-logs/data";
import { getFieldNoteById } from "@/lib/field-notes/data";
import {
  isPrivateFieldEvidenceStoragePath,
  EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS
} from "@/lib/execution-attachments/preview";
import { getDailyLogById } from "@/lib/daily-logs/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  derivePortalSharedEvidenceSummary,
  type PortalSharedEvidenceSummary
} from "./summary";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";

type PortalEvidenceGrantRow = {
  id: string;
  company_id: string;
  project_id: string;
  subject_type: "execution_attachment";
  subject_id: string;
  status: "shared" | "revoked";
  title_override: string | null;
  customer_note: string | null;
  shared_by: string | null;
  shared_at: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

type ExecutionAttachmentRow = {
  id: string;
  company_id: string;
  subject_type: ExecutionAttachment["subjectType"];
  subject_id: string;
  attachment_type: ExecutionAttachment["attachmentType"];
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

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

const portalEvidenceGrantSelect = `
  id,
  company_id,
  project_id,
  subject_type,
  subject_id,
  status,
  title_override,
  customer_note,
  shared_by,
  shared_at,
  revoked_by,
  revoked_at,
  created_at,
  updated_at
`;

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

function mapGrant(row: PortalEvidenceGrantRow): PortalEvidenceGrant {
  return {
    id: row.id,
    organizationId: row.company_id,
    projectId: row.project_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    status: row.status,
    titleOverride: row.title_override,
    customerNote: row.customer_note,
    sharedByUserId: row.shared_by,
    sharedAt: row.shared_at,
    revokedByUserId: row.revoked_by,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAttachment(row: ExecutionAttachmentRow): ExecutionAttachment {
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

function normalizeOptionalText(value: string | null | undefined, max = 500) {
  const trimmed = value?.trim();

  return trimmed ? trimmed.slice(0, max) : null;
}

function assertCanManagePortalEvidence(role: MembershipRole) {
  if (!mutationRoles.has(role)) {
    throw new Error("Manager access is required to share portal evidence.");
  }
}

async function loadExecutionAttachmentForGrant(
  organizationId: string,
  attachmentId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .eq("company_id", organizationId)
    .eq("id", attachmentId)
    .maybeSingle();
  const row = response.data as ExecutionAttachmentRow | null;

  if (response.error) {
    throw new Error(`Unable to load evidence: ${response.error.message}`);
  }

  if (!row) {
    throw new Error("Field evidence was not found for this organization.");
  }

  return mapAttachment(row);
}

async function validateExecutionAttachmentProject(input: {
  organizationId: string;
  projectId: string;
  attachment: ExecutionAttachment;
  next: string;
}) {
  if (input.attachment.organizationId !== input.organizationId) {
    throw new Error("Field evidence was not found for this organization.");
  }

  if (input.attachment.archivedAt) {
    throw new Error("Archived evidence cannot be newly shared to the portal.");
  }

  if (!isPrivateFieldEvidenceStoragePath(input.attachment)) {
    throw new Error("Only private field evidence can be shared to the portal.");
  }

  if (input.attachment.subjectType === "daily_log") {
    const dailyLog = await getDailyLogById(
      input.attachment.subjectId,
      input.next
    );

    if (
      !dailyLog ||
      dailyLog.organizationId !== input.organizationId ||
      dailyLog.projectId !== input.projectId
    ) {
      throw new Error("Field evidence does not belong to this project.");
    }

    return;
  }

  const fieldNote = await getFieldNoteById(
    input.attachment.subjectId,
    input.next
  );

  if (
    !fieldNote ||
    fieldNote.organizationId !== input.organizationId ||
    fieldNote.projectId !== input.projectId
  ) {
    throw new Error("Field evidence does not belong to this project.");
  }

  const dailyLog = await getDailyLogById(fieldNote.dailyLogId, input.next);

  if (
    !dailyLog ||
    dailyLog.organizationId !== input.organizationId ||
    dailyLog.projectId !== input.projectId
  ) {
    throw new Error(
      "Field evidence parent log does not belong to this project."
    );
  }
}

async function isPortalSharedAttachmentProjectScoped(input: {
  organizationId: string;
  projectId: string;
  attachment: ExecutionAttachment;
}) {
  const admin = getSupabaseAdminClient();

  if (input.attachment.organizationId !== input.organizationId) {
    return false;
  }

  if (input.attachment.subjectType === "daily_log") {
    const dailyLogResponse = await admin
      .from("daily_logs")
      .select("id")
      .eq("company_id", input.organizationId)
      .eq("project_id", input.projectId)
      .eq("id", input.attachment.subjectId)
      .maybeSingle();

    return Boolean(dailyLogResponse.data) && !dailyLogResponse.error;
  }

  const fieldNoteResponse = await admin
    .from("field_notes")
    .select("id,daily_log_id")
    .eq("company_id", input.organizationId)
    .eq("project_id", input.projectId)
    .eq("id", input.attachment.subjectId)
    .maybeSingle();
  const fieldNote = fieldNoteResponse.data as {
    id: string;
    daily_log_id: string;
  } | null;

  if (fieldNoteResponse.error || !fieldNote) {
    return false;
  }

  const dailyLogResponse = await admin
    .from("daily_logs")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("project_id", input.projectId)
    .eq("id", fieldNote.daily_log_id)
    .maybeSingle();

  return Boolean(dailyLogResponse.data) && !dailyLogResponse.error;
}

export async function listPortalEvidenceGrantsByProject(
  projectId: string,
  next = `/projects/${projectId}`
): Promise<PortalEvidenceGrant[]> {
  const scope = await requireDailyLogScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_evidence_grants")
    .select(portalEvidenceGrantSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalEvidenceGrantRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal evidence grants: ${response.error.message}`
    );
  }

  return rows.map(mapGrant);
}

export async function shareExecutionAttachmentToPortal(input: {
  projectId: string;
  attachmentId: string;
  titleOverride?: string | null;
  customerNote?: string | null;
  next?: string;
}) {
  const next = input.next ?? `/projects/${input.projectId}`;
  const scope = await requireDailyLogScope(next);

  assertCanManagePortalEvidence(scope.role);

  const attachment = await loadExecutionAttachmentForGrant(
    scope.organizationId,
    input.attachmentId
  );

  await validateExecutionAttachmentProject({
    organizationId: scope.organizationId,
    projectId: input.projectId,
    attachment,
    next
  });

  const now = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_evidence_grants")
    .upsert(
      {
        company_id: scope.organizationId,
        project_id: input.projectId,
        subject_type: "execution_attachment",
        subject_id: input.attachmentId,
        status: "shared",
        title_override: normalizeOptionalText(input.titleOverride, 160),
        customer_note: normalizeOptionalText(input.customerNote, 500),
        shared_by: scope.userId,
        shared_at: now,
        revoked_by: null,
        revoked_at: null
      },
      {
        onConflict: "company_id,project_id,subject_type,subject_id"
      }
    )
    .select(portalEvidenceGrantSelect)
    .single();

  if (response.error) {
    throw new Error(
      `Unable to share field evidence to the portal: ${response.error.message}`
    );
  }

  return mapGrant(response.data as PortalEvidenceGrantRow);
}

export async function revokeExecutionAttachmentPortalShare(input: {
  projectId: string;
  attachmentId: string;
  next?: string;
}) {
  const next = input.next ?? `/projects/${input.projectId}`;
  const scope = await requireDailyLogScope(next);

  assertCanManagePortalEvidence(scope.role);

  const attachment = await loadExecutionAttachmentForGrant(
    scope.organizationId,
    input.attachmentId
  );

  await validateExecutionAttachmentProject({
    organizationId: scope.organizationId,
    projectId: input.projectId,
    attachment,
    next
  });

  const response = await (
    await getSupabaseServerClient()
  )
    .from("portal_evidence_grants")
    .update({
      status: "revoked",
      revoked_by: scope.userId,
      revoked_at: new Date().toISOString()
    })
    .eq("company_id", scope.organizationId)
    .eq("project_id", input.projectId)
    .eq("subject_type", "execution_attachment")
    .eq("subject_id", input.attachmentId)
    .select(portalEvidenceGrantSelect)
    .single();

  if (response.error) {
    throw new Error(
      `Unable to revoke the portal evidence share: ${response.error.message}`
    );
  }

  return mapGrant(response.data as PortalEvidenceGrantRow);
}

async function getPortalProjectScope(next = "/portal") {
  const activeGrants = (
    await listPortalAccessGrantsForCurrentUser(next)
  ).filter((grant) => grant.status === "active");

  if (activeGrants.length === 0) {
    return {
      activeGrantIds: [],
      accessibleProjectIds: []
    };
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");

  if (response.error) {
    throw new Error(
      `Unable to load portal project scope: ${response.error.message}`
    );
  }

  return {
    activeGrantIds: activeGrants.map((grant) => grant.id),
    accessibleProjectIds: [
      ...new Set(
        ((response.data as Array<{ project_id?: string }> | null) ?? [])
          .map((row) => row.project_id)
          .filter((value): value is string => typeof value === "string")
      )
    ]
  };
}

export async function getPortalSharedEvidenceSummary(
  projectId: string,
  next = `/portal/projects/${projectId}`
): Promise<PortalSharedEvidenceSummary> {
  const scope = await getPortalProjectScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return derivePortalSharedEvidenceSummary({ attachments: [] });
  }

  const admin = getSupabaseAdminClient();
  const grantResponse = await admin
    .from("portal_evidence_grants")
    .select(portalEvidenceGrantSelect)
    .eq("project_id", projectId)
    .eq("status", "shared")
    .order("shared_at", { ascending: false });
  const grantRows =
    (grantResponse.data as PortalEvidenceGrantRow[] | null) ?? [];

  if (grantResponse.error) {
    throw new Error(
      `Unable to load shared portal evidence: ${grantResponse.error.message}`
    );
  }

  if (grantRows.length === 0) {
    return derivePortalSharedEvidenceSummary({ attachments: [] });
  }

  const attachmentResponse = await admin
    .from("execution_attachments")
    .select(executionAttachmentSelect)
    .in(
      "id",
      grantRows.map((grant) => grant.subject_id)
    );
  const attachmentRows =
    (attachmentResponse.data as ExecutionAttachmentRow[] | null) ?? [];

  if (attachmentResponse.error) {
    throw new Error(
      `Unable to load shared portal evidence files: ${attachmentResponse.error.message}`
    );
  }

  const grantsBySubjectId = new Map(
    grantRows.map((grant) => [grant.subject_id, mapGrant(grant)])
  );
  const eligibleAttachments = await Promise.all(
    attachmentRows.map(async (row) => {
      const attachment = mapAttachment(row);
      const grant = grantsBySubjectId.get(attachment.id);

      if (
        !grant ||
        attachment.organizationId !== grant.organizationId ||
        attachment.archivedAt ||
        !isPrivateFieldEvidenceStoragePath(attachment)
      ) {
        return null;
      }

      const isProjectScoped = await isPortalSharedAttachmentProjectScoped({
        organizationId: grant.organizationId,
        projectId,
        attachment
      });

      return isProjectScoped ? attachment : null;
    })
  );
  const signedAttachments = await Promise.all(
    eligibleAttachments
      .filter(
        (attachment): attachment is ExecutionAttachment => attachment !== null
      )
      .map(async (attachment) => {
        const grant = grantsBySubjectId.get(attachment.id);

        if (!grant) {
          return null;
        }

        const response = await admin.storage
          .from(STORAGE_BUCKET_NAMES.documents)
          .createSignedUrl(
            attachment.storagePath,
            EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS
          );

        return {
          ...attachment,
          signedUrl: response.data?.signedUrl ?? null,
          grant
        };
      })
  );

  return derivePortalSharedEvidenceSummary({
    attachments: signedAttachments.filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        Boolean(attachment)
    )
  });
}
