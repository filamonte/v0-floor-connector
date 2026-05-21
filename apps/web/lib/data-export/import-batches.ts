import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getDataExportScope, type DataExportScope } from "./data";
import type {
  DuplicateSignal,
  ImportDryRunFieldKey,
  ImportDryRunResult,
  ImportDryRunRowResult
} from "./import-dry-run";

export const IMPORT_SCHEMA_VERSION = "2026-05-15.import.v1";
export const IMPORT_MAPPING_VERSION = "2026-05-15.customer-contact.v1";

export type DataImportBatchStatus =
  | "dry_run"
  | "review_ready"
  | "approved_pending_write"
  | "completed"
  | "failed"
  | "canceled"
  | "rolled_back";

export type DataImportRowValidationStatus =
  | "valid"
  | "warning"
  | "error"
  | "duplicate"
  | "needs_review";

export type DataImportRowDecision =
  | "create_customer"
  | "create_contact"
  | "link_contact"
  | "skip"
  | "needs_review"
  | "invalid";

export type DataImportBatchListItem = {
  id: string;
  companyId: string;
  requestedBy: string;
  requestedByLabel: string;
  importType: "customer_contacts";
  sourceFilename: string | null;
  status: DataImportBatchStatus;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  mappingVersion: string;
  schemaVersion: string;
  createdAt: string;
};

export type DataImportRowListItem = {
  id: string;
  rowNumber: number;
  normalizedPreview: Partial<Record<ImportDryRunFieldKey, string>>;
  validationStatus: DataImportRowValidationStatus;
  proposedDecision: DataImportRowDecision;
  userDecision: DataImportRowDecision | null;
  duplicateCandidates: {
    signal: DuplicateSignal;
    messages: string[];
  } | null;
  errors: string[];
  warnings: string[];
  createdRecordRefs: null;
  createdAt: string;
};

export type DataImportBatchHistoryResult = {
  batches: DataImportBatchListItem[];
  unavailableReason: string | null;
};

export type DataImportBatchReviewResult =
  | {
      batch: DataImportBatchListItem;
      rows: DataImportRowListItem[];
      unavailableReason: null;
    }
  | {
      batch: null;
      rows: [];
      unavailableReason: string;
    };

type BatchRow = {
  id: string;
  company_id: string;
  requested_by: string;
  import_type: "customer_contacts";
  source_filename: string | null;
  status: DataImportBatchStatus;
  total_rows: number;
  valid_rows: number;
  warning_rows: number;
  error_rows: number;
  duplicate_rows: number;
  mapping_version: string;
  schema_version: string;
  created_at: string;
};

type ImportRow = {
  id: string;
  row_number: number;
  normalized_preview: Partial<Record<ImportDryRunFieldKey, string>>;
  validation_status: DataImportRowValidationStatus;
  proposed_decision: DataImportRowDecision;
  user_decision: DataImportRowDecision | null;
  duplicate_candidates: {
    signal?: DuplicateSignal;
    messages?: string[];
  } | null;
  errors: string[] | null;
  warnings: string[] | null;
  created_record_refs: null;
  created_at: string;
};

type UserSummaryRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export async function createDataImportBatchFromDryRun(input: {
  result: ImportDryRunResult;
  sourceFilename?: string | null;
  existingScope?: DataExportScope;
}) {
  const scope = input.existingScope ?? (await getDataExportScope());
  const supabase = await getSupabaseServerClient();
  const rows = input.result.rows.map(buildImportRowDraft);
  const duplicateRows = input.result.rows.filter((row) =>
    row.duplicateSignal !== "none"
  ).length;

  const batchResponse = await supabase
    .from("data_import_batches")
    .insert({
      company_id: scope.organizationId,
      requested_by: scope.userId,
      import_type: "customer_contacts",
      source_filename: sanitizeSourceFilename(input.sourceFilename ?? null),
      status: "review_ready",
      total_rows: input.result.summary.totalRows,
      valid_rows: input.result.summary.validRows,
      warning_rows: input.result.summary.warningRows,
      error_rows: input.result.summary.errorRows,
      duplicate_rows: duplicateRows,
      mapping_version: IMPORT_MAPPING_VERSION,
      schema_version: IMPORT_SCHEMA_VERSION,
      safe_summary: {
        source: "settings_import_dry_run",
        noCanonicalWrites: true,
        rawFileStored: false
      }
    })
    .select("id")
    .single();

  if (batchResponse.error) {
    throw new Error(
      `Unable to create import review batch: ${batchResponse.error.message}`
    );
  }

  const batchId = (batchResponse.data as { id?: string } | null)?.id;

  if (!batchId) {
    throw new Error("Unexpected import review batch response.");
  }

  if (rows.length > 0) {
    const rowResponse = await supabase.from("data_import_rows").insert(
      rows.map((row) => ({
        company_id: scope.organizationId,
        batch_id: batchId,
        ...row
      }))
    );

    if (rowResponse.error) {
      await markImportBatchFailed(batchId, scope, rowResponse.error.message);
      throw new Error(
        `Unable to create import review rows: ${rowResponse.error.message}`
      );
    }
  }

  return batchId;
}

export async function listRecentDataImportBatches(
  limit = 6,
  existingScope?: DataExportScope
): Promise<DataImportBatchHistoryResult> {
  const scope = existingScope ?? (await getDataExportScope());
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("data_import_batches")
    .select(batchSelect)
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    if (isDataImportTablesUnavailable(response.error.message)) {
      return {
        batches: [],
        unavailableReason:
          "Import review batches will appear after the data import batch migration is applied."
      };
    }

    throw new Error(`Unable to load import review batches: ${response.error.message}`);
  }

  const batches = ((response.data ?? []) as BatchRow[]);
  const userLabels = await loadUserLabels(batches.map((batch) => batch.requested_by));

  return {
    batches: batches.map((batch) => mapBatch(batch, userLabels)),
    unavailableReason: null
  };
}

export async function getDataImportBatchReview(
  batchId: string,
  existingScope?: DataExportScope
): Promise<DataImportBatchReviewResult> {
  const scope = existingScope ?? (await getDataExportScope());
  const supabase = await getSupabaseServerClient();
  const batchResponse = await supabase
    .from("data_import_batches")
    .select(batchSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", batchId)
    .maybeSingle();

  if (batchResponse.error) {
    if (isDataImportTablesUnavailable(batchResponse.error.message)) {
      return {
        batch: null,
        rows: [],
        unavailableReason:
          "Import review batches will appear after the data import batch migration is applied."
      };
    }

    throw new Error(`Unable to load import review batch: ${batchResponse.error.message}`);
  }

  if (!batchResponse.data) {
    return {
      batch: null,
      rows: [],
      unavailableReason: "Import review batch was not found for this organization."
    };
  }

  const rowResponse = await supabase
    .from("data_import_rows")
    .select(
      `
        id,
        row_number,
        normalized_preview,
        validation_status,
        proposed_decision,
        user_decision,
        duplicate_candidates,
        errors,
        warnings,
        created_record_refs,
        created_at
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("batch_id", batchId)
    .order("row_number", { ascending: true });

  if (rowResponse.error) {
    throw new Error(`Unable to load import review rows: ${rowResponse.error.message}`);
  }

  const batch = batchResponse.data as BatchRow;
  const userLabels = await loadUserLabels([batch.requested_by]);

  return {
    batch: mapBatch(batch, userLabels),
    rows: ((rowResponse.data ?? []) as ImportRow[]).map(mapImportRow),
    unavailableReason: null
  };
}

const batchSelect = `
  id,
  company_id,
  requested_by,
  import_type,
  source_filename,
  status,
  total_rows,
  valid_rows,
  warning_rows,
  error_rows,
  duplicate_rows,
  mapping_version,
  schema_version,
  created_at
`;

function buildImportRowDraft(row: ImportDryRunRowResult) {
  const validationStatus = getValidationStatus(row);

  return {
    row_number: row.rowNumber,
    normalized_preview: sanitizeNormalizedPreview(row.values),
    validation_status: validationStatus,
    proposed_decision: getProposedDecision(row, validationStatus),
    duplicate_candidates:
      row.duplicateSignal === "none"
        ? null
        : {
            signal: row.duplicateSignal,
            messages: row.duplicateMessages
          },
    errors: row.errors,
    warnings: row.warnings,
    created_record_refs: null
  };
}

function getValidationStatus(row: ImportDryRunRowResult): DataImportRowValidationStatus {
  if (row.errors.length > 0) {
    return "error";
  }

  if (row.duplicateSignal !== "none") {
    return row.duplicateSignal === "existing_relationship"
      ? "duplicate"
      : "needs_review";
  }

  if (row.warnings.length > 0) {
    return "warning";
  }

  return "valid";
}

function getProposedDecision(
  row: ImportDryRunRowResult,
  validationStatus: DataImportRowValidationStatus
): DataImportRowDecision {
  if (validationStatus === "error") {
    return "invalid";
  }

  if (row.duplicateSignal === "existing_relationship") {
    return "skip";
  }

  if (row.duplicateSignal !== "none") {
    return "needs_review";
  }

  return "create_customer";
}

function sanitizeNormalizedPreview(values: ImportDryRunRowResult["values"]) {
  const safe: Partial<Record<ImportDryRunFieldKey, string>> = {};

  for (const [key, value] of Object.entries(values) as Array<
    [ImportDryRunFieldKey, string | undefined]
  >) {
    if (typeof value === "string" && value.trim().length > 0) {
      safe[key] = value.trim().slice(0, 500);
    }
  }

  return safe;
}

function sanitizeSourceFilename(value: string | null) {
  const filename = (value ?? "")
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 160);

  return filename || null;
}

async function markImportBatchFailed(
  batchId: string,
  scope: DataExportScope,
  message: string
) {
  const supabase = await getSupabaseServerClient();
  await supabase
    .from("data_import_batches")
    .update({
      status: "failed",
      safe_summary: {
        source: "settings_import_dry_run",
        noCanonicalWrites: true,
        rawFileStored: false,
        errorSummary: summarizeImportBatchError(message)
      }
    })
    .eq("company_id", scope.organizationId)
    .eq("id", batchId);
}

function mapBatch(row: BatchRow, labels: Map<string, string>): DataImportBatchListItem {
  return {
    id: row.id,
    companyId: row.company_id,
    requestedBy: row.requested_by,
    requestedByLabel: labels.get(row.requested_by) ?? "Unknown user",
    importType: row.import_type,
    sourceFilename: row.source_filename,
    status: row.status,
    totalRows: row.total_rows,
    validRows: row.valid_rows,
    warningRows: row.warning_rows,
    errorRows: row.error_rows,
    duplicateRows: row.duplicate_rows,
    mappingVersion: row.mapping_version,
    schemaVersion: row.schema_version,
    createdAt: row.created_at
  };
}

function mapImportRow(row: ImportRow): DataImportRowListItem {
  return {
    id: row.id,
    rowNumber: row.row_number,
    normalizedPreview: row.normalized_preview ?? {},
    validationStatus: row.validation_status,
    proposedDecision: row.proposed_decision,
    userDecision: row.user_decision,
    duplicateCandidates:
      row.duplicate_candidates?.signal && Array.isArray(row.duplicate_candidates.messages)
        ? {
            signal: row.duplicate_candidates.signal,
            messages: row.duplicate_candidates.messages
          }
        : null,
    errors: Array.isArray(row.errors) ? row.errors : [],
    warnings: Array.isArray(row.warnings) ? row.warnings : [],
    createdRecordRefs: null,
    createdAt: row.created_at
  };
}

async function loadUserLabels(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
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

function isDataImportTablesUnavailable(message: string) {
  return /data_import_batches|data_import_rows|schema cache|relation .* does not exist/i.test(
    message
  );
}

function summarizeImportBatchError(message: string) {
  return message
    .replace(/token=[^&\s]+/gi, "token=[redacted]")
    .replace(/password=[^&\s]+/gi, "password=[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}
