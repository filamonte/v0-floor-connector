import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  EXPORT_SCHEMA_VERSION,
  buildExportRequestContext,
  summarizeExportError,
  type ExportFormat,
  type ExportModuleKey
} from "./core";
import { getDataExportScope, type DataExportScope } from "./data";

export type DataExportEventStatus = "success" | "failed";

export type DataExportEventListItem = {
  id: string;
  companyId: string;
  requestedBy: string | null;
  requestedByLabel: string;
  moduleKey: ExportModuleKey;
  format: ExportFormat;
  status: DataExportEventStatus;
  recordCount: number | null;
  schemaVersion: string;
  filename: string | null;
  errorSummary: string | null;
  createdAt: string;
};

export type DataExportHistoryResult = {
  events: DataExportEventListItem[];
  unavailableReason: string | null;
};

type DataExportEventRow = {
  id: string;
  company_id: string;
  requested_by: string | null;
  module_key: ExportModuleKey;
  format: ExportFormat;
  status: DataExportEventStatus;
  record_count: number | null;
  schema_version: string;
  filename: string | null;
  error_summary: string | null;
  created_at: string;
};

type UserSummaryRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export async function recordDataExportEvent(input: {
  scope: DataExportScope;
  moduleKey: ExportModuleKey;
  format: ExportFormat;
  status: DataExportEventStatus;
  recordCount?: number | null;
  filename?: string | null;
  error?: unknown;
  requestRoute?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase.from("data_export_events").insert({
    company_id: input.scope.organizationId,
    requested_by: input.scope.userId,
    module_key: input.moduleKey,
    format: input.format,
    status: input.status,
    record_count: input.recordCount ?? null,
    schema_version: EXPORT_SCHEMA_VERSION,
    filename: input.filename ?? null,
    error_summary:
      input.status === "failed" ? summarizeExportError(input.error) : null,
    request_context: buildExportRequestContext({
      route: input.requestRoute ?? `/settings/export/${input.moduleKey}`
    })
  });

  if (response.error) {
    if (isDataExportEventsUnavailable(response.error.message)) {
      return;
    }

    throw new Error(`Unable to record data export event: ${response.error.message}`);
  }
}

export async function listRecentDataExportEvents(
  limit = 8,
  existingScope?: DataExportScope
): Promise<DataExportHistoryResult> {
  const scope = existingScope ?? (await getDataExportScope());
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("data_export_events")
    .select(
      `
        id,
        company_id,
        requested_by,
        module_key,
        format,
        status,
        record_count,
        schema_version,
        filename,
        error_summary,
        created_at
      `
    )
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    if (isDataExportEventsUnavailable(response.error.message)) {
      return {
        events: [],
        unavailableReason: "Export history will appear after the data export events migration is applied."
      };
    }

    throw new Error(`Unable to load data export history: ${response.error.message}`);
  }

  const rows = Array.isArray(response.data)
    ? (response.data as DataExportEventRow[])
    : [];
  const userLabels = await loadUserLabels(
    rows.map((row) => row.requested_by).filter((userId): userId is string => Boolean(userId))
  );

  return {
    events: rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      requestedBy: row.requested_by,
      requestedByLabel:
        (row.requested_by ? userLabels.get(row.requested_by) : null) ??
        "Unknown user",
      moduleKey: row.module_key,
      format: row.format,
      status: row.status,
      recordCount: row.record_count,
      schemaVersion: row.schema_version,
      filename: row.filename,
      errorSummary: row.error_summary,
      createdAt: row.created_at
    })),
    unavailableReason: null
  };
}

async function loadUserLabels(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds));
  const labels = new Map<string, string>();

  if (uniqueUserIds.length === 0) {
    return labels;
  }

  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("users")
    .select("id, email, full_name")
    .in("id", uniqueUserIds);

  if (response.error) {
    return labels;
  }

  for (const user of (response.data ?? []) as UserSummaryRow[]) {
    labels.set(user.id, user.full_name || user.email || user.id);
  }

  return labels;
}

function isDataExportEventsUnavailable(message: string) {
  return /data_export_events|schema cache|relation .* does not exist/i.test(message);
}
