import "server-only";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type WorkflowErrorEventRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  subject_type: string;
  subject_id: string | null;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type WorkflowErrorEventListItem = {
  id: string;
  organizationId: string;
  userId: string | null;
  action: string;
  subjectType: string;
  subjectId: string | null;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

function mapWorkflowErrorEvent(row: WorkflowErrorEventRow): WorkflowErrorEventListItem {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    action: row.action,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    message: row.message,
    metadata: row.metadata,
    createdAt: row.created_at
  };
}

export async function recordWorkflowErrorForCurrentUser(input: {
  action: string;
  subjectType: string;
  subjectId?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const user = await requireAuthenticatedUser("/contracts");
    const organizationContext = await getActiveOrganizationContext(user.id);

    if (!organizationContext) {
      return;
    }

    const supabase = await getSupabaseServerClient();
    const response = await supabase.from("workflow_error_events").insert({
      organization_id: organizationContext.organization.id,
      user_id: user.id,
      action: input.action,
      subject_type: input.subjectType,
      subject_id: input.subjectId ?? null,
      message: input.message,
      metadata: input.metadata ?? {}
    });

    void response.error;
  } catch (error) {
    void error;
  }
}

export async function listRecentWorkflowErrorEventsForAdmin(limit = 10) {
  const scope = await requireOrganizationAdminScope("/settings/admin");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("workflow_error_events")
    .select(
      `
        id,
        organization_id,
        user_id,
        action,
        subject_type,
        subject_id,
        message,
        metadata,
        created_at
      `
    )
    .eq("organization_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    throw new Error(`Unable to load workflow error events: ${response.error.message}`);
  }

  const rows = Array.isArray(response.data)
    ? (response.data as WorkflowErrorEventRow[])
    : [];

  return rows.map(mapWorkflowErrorEvent);
}
