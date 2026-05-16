"use client";

import { useActionState, useState } from "react";

import {
  runImportDryRunAction,
  saveImportReviewBatchAction,
  type ImportDryRunActionState
} from "./actions";
import Link from "next/link";
import { importDryRunFieldDefinitions } from "@/lib/data-export/import-dry-run";

const initialState: ImportDryRunActionState = {
  status: "idle",
  message: null,
  result: null
};

export function ImportDryRunPanel() {
  const [state, formAction, pending] = useActionState(
    runImportDryRunAction,
    initialState
  );
  const [saveState, saveAction, savePending] = useActionState(
    saveImportReviewBatchAction,
    initialState
  );
  const [sourceFilename, setSourceFilename] = useState("");
  const result = state.result;

  return (
    <div className="space-y-5">
      <div className="border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-950">
          Dry run only. No records will be created or changed.
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          CSV uploads are parsed for validation and duplicate checks only. Uploaded
          file contents are not stored.
        </p>
      </div>

      <form action={formAction} className="border border-[#d9cdc2] bg-white px-5 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-[#221a14]">
              Customer/contact CSV
            </span>
            <input
              type="file"
              name="importCsv"
              accept=".csv,text/csv"
              onChange={(event) => {
                setSourceFilename(event.currentTarget.files?.[0]?.name ?? "");
              }}
              className="mt-2 block w-full border border-[#d9cdc2] bg-white px-3 py-2 text-sm text-[#221a14] file:mr-3 file:border-0 file:bg-[#171717] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-10 items-center justify-center border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Checking..." : "Run dry run"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#7b6a5b]">
          Accepted fields include customer name/company, primary contact name,
          email, phone, address fields, relationship, and primary flag.
        </p>
      </form>

      {state.status === "error" && state.message ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {state.message}
        </p>
      ) : null}

      {saveState.status === "error" && saveState.message ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {saveState.message}
        </p>
      ) : null}

      {saveState.status === "success" && saveState.savedBatchId ? (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">
            {saveState.message}
          </p>
          <Link
            href={`/settings/export/imports/${saveState.savedBatchId}`}
            className="mt-2 inline-flex text-sm font-semibold text-emerald-900 underline"
          >
            Open read-only review batch
          </Link>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-5">
          <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-5">
            <ImportStat label="Rows" value={String(result.summary.totalRows)} />
            <ImportStat label="Valid" value={String(result.summary.validRows)} />
            <ImportStat label="Warnings" value={String(result.summary.warningRows)} />
            <ImportStat label="Errors" value={String(result.summary.errorRows)} />
            <ImportStat
              label="Duplicates"
              value={String(
                result.summary.likelyDuplicates + result.summary.possibleDuplicates
              )}
            />
          </div>

          <section className="border border-[#d9cdc2] bg-white px-5 py-4">
            <h3 className="text-sm font-semibold text-[#221a14]">
              Column mapping preview
            </h3>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {Object.entries(result.mapping).map(([header, target]) => (
                <div
                  key={header}
                  className="flex items-center justify-between gap-3 border border-[#eadfd5] px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate text-[#594839]">{header}</span>
                  <span className="shrink-0 font-medium text-[#221a14]">
                    {target ? fieldLabel(target) : "Not mapped"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-[#d9cdc2] bg-white px-5 py-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <h3 className="text-sm font-semibold text-[#221a14]">
                  Save review batch
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6f6256]">
                  Saves normalized preview rows, validation results, and review
                  decisions only. It does not store the uploaded file and does
                  not create or change customer records.
                </p>
              </div>
              <form action={saveAction}>
                <input
                  type="hidden"
                  name="sourceFilename"
                  value={sourceFilename}
                />
                <input
                  type="hidden"
                  name="dryRunResultJson"
                  value={JSON.stringify(buildReviewBatchPayload(result))}
                />
                <button
                  type="submit"
                  disabled={savePending}
                  className="inline-flex min-h-10 items-center justify-center border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savePending ? "Saving..." : "Save review batch"}
                </button>
              </form>
            </div>
          </section>

          <section className="border border-[#d9cdc2] bg-white px-5 py-4">
            <h3 className="text-sm font-semibold text-[#221a14]">
              Row validation preview
            </h3>
            <div className="mt-4 divide-y divide-[#eadfd5] border border-[#eadfd5]">
              {result.rows.slice(0, 25).map((row) => (
                <div
                  key={row.rowNumber}
                  className="grid gap-3 px-4 py-3 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <span className="text-sm font-semibold text-[#221a14]">
                    Row {row.rowNumber}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#221a14]">
                      {row.values.customer_name ||
                        row.values.customer_company_name ||
                        "Missing customer"}
                    </p>
                    <p className="mt-1 text-sm text-[#6f6256]">
                      {row.values.primary_contact_name ||
                        row.values.email ||
                        row.values.phone ||
                        "No contact preview"}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <StatusLine
                      tone={row.errors.length > 0 ? "error" : "success"}
                      text={row.errors.length > 0 ? row.errors.join(" ") : "Valid for dry run"}
                    />
                    {row.warnings.map((warning) => (
                      <StatusLine key={warning} tone="warning" text={warning} />
                    ))}
                    {row.duplicateMessages.map((message) => (
                      <StatusLine key={message} tone="warning" text={message} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {result.rows.length > 25 ? (
              <p className="mt-3 text-xs text-[#7b6a5b]">
                Showing the first 25 rows from this dry-run report.
              </p>
            ) : null}
          </section>
        </div>
      ) : (
        <section className="border border-[#d9cdc2] bg-white px-5 py-4">
          <h3 className="text-sm font-semibold text-[#221a14]">
            Supported dry-run fields
          </h3>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {importDryRunFieldDefinitions.map((definition) => (
              <div
                key={definition.key}
                className="border border-[#eadfd5] px-3 py-2"
              >
                <p className="text-sm font-medium text-[#221a14]">
                  {definition.label}
                  {definition.required ? " *" : ""}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7b6a5b]">
                  {definition.target} · {definition.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ImportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f6256]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[#221a14]">{value}</p>
    </div>
  );
}

function StatusLine({
  tone,
  text
}: {
  tone: "success" | "warning" | "error";
  text: string;
}) {
  const className =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-800"
        : "text-red-700";

  return <p className={`font-medium ${className}`}>{text}</p>;
}

function fieldLabel(key: string) {
  return (
    importDryRunFieldDefinitions.find((definition) => definition.key === key)?.label ??
    key
  );
}

function buildReviewBatchPayload(
  result: NonNullable<ImportDryRunActionState["result"]>
) {
  return {
    headers: result.headers,
    mapping: result.mapping,
    summary: result.summary,
    rows: result.rows.map((row) => ({
      rowNumber: row.rowNumber,
      values: row.values,
      errors: row.errors,
      warnings: row.warnings,
      duplicateSignal: row.duplicateSignal,
      duplicateMessages: row.duplicateMessages
    }))
  };
}
