"use server";

import {
  runCustomerContactImportDryRun
} from "@/lib/data-export/import-dry-run-server";
import type { ImportDryRunResult } from "@/lib/data-export/import-dry-run";
import { createDataImportBatchFromDryRun } from "@/lib/data-export/import-batches";

export type ImportDryRunActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  result: ImportDryRunResult | null;
  savedBatchId?: string | null;
};

const MAX_UPLOAD_BYTES = 512 * 1024;

export async function runImportDryRunAction(
  _previousState: ImportDryRunActionState,
  formData: FormData
): Promise<ImportDryRunActionState> {
  const file = formData.get("importCsv");

  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Choose a CSV file before running the dry run.",
      result: null
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      status: "error",
      message: "CSV dry runs are limited to 512 KB in this validation phase.",
      result: null
    };
  }

  try {
    const csvText = await file.text();
    const result = await runCustomerContactImportDryRun(csvText);

    return {
      status: "success",
      message: "Dry run complete. No records were created or changed.",
      result,
      savedBatchId: null
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? sanitizeImportDryRunError(error.message)
          : "Unable to run the import dry run.",
      result: null,
      savedBatchId: null
    };
  }
}

export async function saveImportReviewBatchAction(
  _previousState: ImportDryRunActionState,
  formData: FormData
): Promise<ImportDryRunActionState> {
  const payload = formData.get("dryRunResultJson");
  const sourceFilename = getStringValue(formData.get("sourceFilename"));

  if (typeof payload !== "string" || payload.trim().length === 0) {
    return {
      status: "error",
      message: "Run a dry run before saving a review batch.",
      result: null,
      savedBatchId: null
    };
  }

  try {
    const result = parseDryRunResultPayload(payload);
    const batchId = await createDataImportBatchFromDryRun({
      result,
      sourceFilename
    });

    return {
      status: "success",
      message: "Review batch saved. No records were created or changed.",
      result,
      savedBatchId: batchId
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? sanitizeImportDryRunError(error.message)
          : "Unable to save the import review batch.",
      result: null,
      savedBatchId: null
    };
  }
}

function sanitizeImportDryRunError(message: string) {
  return message
    .replace(/token=[^&\s]+/gi, "token=[redacted]")
    .replace(/password=[^&\s]+/gi, "password=[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseDryRunResultPayload(value: string): ImportDryRunResult {
  const parsed = JSON.parse(value) as ImportDryRunResult;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray(parsed.headers) ||
    !parsed.mapping ||
    typeof parsed.mapping !== "object" ||
    !Array.isArray(parsed.rows) ||
    !parsed.summary ||
    typeof parsed.summary !== "object"
  ) {
    throw new Error("Import dry-run payload is not valid.");
  }

  return parsed;
}
