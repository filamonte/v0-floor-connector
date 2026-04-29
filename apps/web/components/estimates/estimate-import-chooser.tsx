"use client";

import { useState, useTransition } from "react";
import { FileDown, Search } from "lucide-react";
import type { EstimateStatus } from "@floorconnector/types";

export type EstimateImportSourceOption = {
  id: string;
  referenceNumber: string;
  title: string | null;
  customerName: string | null;
  projectName: string | null;
  status: EstimateStatus;
  updatedAt: string;
  hasScopeContent: boolean;
  hasTermsContent: boolean;
  hasInclusionsContent: boolean;
  hasExclusionsContent: boolean;
};

type EstimateImportChooserProps = {
  estimateStatus: EstimateStatus;
  importSourceEstimates: EstimateImportSourceOption[];
  onImportLineItemsFromEstimate: (
    sourceEstimateId: string
  ) => Promise<{ ok: boolean; message: string }>;
  onImportReusableContentFromEstimate: (
    sourceEstimateId: string,
    section: "scope" | "terms" | "inclusions" | "exclusions"
  ) => Promise<{ ok: boolean; message: string }>;
};

export function EstimateImportChooser({
  estimateStatus,
  importSourceEstimates,
  onImportLineItemsFromEstimate,
  onImportReusableContentFromEstimate
}: EstimateImportChooserProps) {
  const [selectedImportEstimateId, setSelectedImportEstimateId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EstimateStatus | "all">("all");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isImportPending, startImportTransition] = useTransition();
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const hasActiveFilters = normalizedSearch.length > 0 || statusFilter !== "all";
  const orderedImportSourceEstimates = [...importSourceEstimates]
    .map((estimate, index) => ({ estimate, index }))
    .sort((left, right) => {
      const leftTime = Date.parse(left.estimate.updatedAt);
      const rightTime = Date.parse(right.estimate.updatedAt);
      const leftValid = Number.isFinite(leftTime);
      const rightValid = Number.isFinite(rightTime);

      if (leftValid && rightValid && leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      if (leftValid !== rightValid) {
        return leftValid ? -1 : 1;
      }

      return left.index - right.index;
    })
    .map(({ estimate }) => estimate);
  const filteredImportSourceEstimates = orderedImportSourceEstimates.filter((estimate) => {
    if (statusFilter !== "all" && estimate.status !== statusFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableLabel = [
      estimate.referenceNumber,
      estimate.title,
      estimate.customerName,
      estimate.projectName,
      estimate.status
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableLabel.includes(normalizedSearch);
  });
  const selectedImportEstimate =
    filteredImportSourceEstimates.find((estimate) => estimate.id === selectedImportEstimateId) ??
    null;
  const selectedEstimateHasReusableContent = Boolean(
    selectedImportEstimate?.hasScopeContent ||
      selectedImportEstimate?.hasTermsContent ||
      selectedImportEstimate?.hasInclusionsContent ||
      selectedImportEstimate?.hasExclusionsContent
  );
  const quickPickEstimates = filteredImportSourceEstimates.slice(0, 5);

  function formatEstimateDateLabel(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function buildReusableAvailabilityLabel(estimate: EstimateImportSourceOption) {
    const labels = [];

    if (estimate.hasScopeContent) {
      labels.push("Scope");
    }

    if (estimate.hasTermsContent) {
      labels.push("Terms");
    }

    if (estimate.hasInclusionsContent) {
      labels.push("Incl");
    }

    if (estimate.hasExclusionsContent) {
      labels.push("Excl");
    }

    return labels.length > 0 ? labels.join(" / ") : "No reusable content";
  }

  function buildSelectionAvailabilityLabel(estimate: EstimateImportSourceOption) {
    const labels = ["Line items"];

    if (estimate.hasScopeContent) {
      labels.push("Scope / SOW");
    }

    if (estimate.hasTermsContent) {
      labels.push("Terms");
    }

    if (estimate.hasInclusionsContent) {
      labels.push("Inclusions");
    }

    if (estimate.hasExclusionsContent) {
      labels.push("Exclusions");
    }

    return labels.join(" · ");
  }

  function runImport(
    action:
      | { type: "line-items" }
      | { type: "reusable"; section: "scope" | "terms" | "inclusions" | "exclusions" }
  ) {
    if (estimateStatus !== "draft") {
      setImportMessage("Only draft estimates can import from another estimate.");
      return;
    }

    if (!selectedImportEstimateId) {
      setImportMessage("Select an estimate to import from.");
      return;
    }

    startImportTransition(async () => {
      const result =
        action.type === "line-items"
          ? await onImportLineItemsFromEstimate(selectedImportEstimateId)
          : await onImportReusableContentFromEstimate(
              selectedImportEstimateId,
              action.section
            );

      setImportMessage(result.message);
    });
  }

  return (
    <div className="rounded-[10px] border border-[#d7deea] bg-white p-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
        Import from another estimate
      </p>
      <p className="mt-2 text-[12px] leading-5 text-[#6b7c96]">
        Pick one source estimate, then import line items or reusable estimating content into this
        draft estimate. Imported rows and content append here only. Defaults and downstream billing
        records are not changed.
      </p>
      {estimateStatus !== "draft" ? (
        <div className="mt-3 rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] leading-5 text-rose-800">
          Only draft estimates can import from another estimate.
        </div>
      ) : importSourceEstimates.length === 0 ? (
        <div className="mt-3 rounded-[8px] border border-[#d7deea] bg-[#f7f8fb] px-3 py-2 text-[12px] leading-5 text-[#6b7c96]">
          No other estimates in this organization are available to import from yet.
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <label className="block text-[12px] font-medium text-[#5d6f8a]">
              Search estimates
              <div className="mt-1.5 flex h-11 items-center rounded-[8px] border border-[#d7deea] bg-white px-3">
                <Search className="h-4 w-4 text-[#7b8aa3]" />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setImportMessage(null);
                  }}
                  placeholder="Number, name, customer, project, status"
                  className="h-full w-full border-0 bg-transparent px-3 text-[14px] text-[#334a70] outline-none"
                />
              </div>
            </label>
            <label className="block text-[12px] font-medium text-[#5d6f8a]">
              Status filter
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as EstimateStatus | "all");
                  setImportMessage(null);
                }}
                className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>
          {hasActiveFilters ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-[8px] border border-[#d7deea] bg-[#f7f8fb] px-3 py-2 text-[12px] leading-5 text-[#6b7c96]">
              <span>Filters are narrowing the available source estimates.</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setImportMessage(null);
                }}
                className="font-medium text-[#28456f]"
              >
                Clear filters
              </button>
            </div>
          ) : null}
          <label className="mt-3 block text-[12px] font-medium text-[#5d6f8a]">
            Source estimate
            <select
              value={selectedImportEstimateId}
              onChange={(event) => {
                setSelectedImportEstimateId(event.target.value);
                setImportMessage(null);
              }}
              className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
            >
              <option value="">Select estimate</option>
              {filteredImportSourceEstimates.map((estimate) => (
                <option key={estimate.id} value={estimate.id}>
                  {estimate.referenceNumber}
                  {estimate.title ? ` - ${estimate.title}` : ""}
                </option>
              ))}
            </select>
          </label>
          {filteredImportSourceEstimates.length === 0 ? (
            <div className="mt-3 rounded-[8px] border border-[#d7deea] bg-[#f7f8fb] px-3 py-2 text-[12px] leading-5 text-[#6b7c96]">
              No source estimates match the current search or status filter.
            </div>
          ) : null}
          {quickPickEstimates.length > 0 ? (
            <div className="mt-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a8aa3]">
                Recent matches
              </div>
              <div className="grid gap-2">
                {quickPickEstimates.map((estimate) => {
                  const updatedLabel = formatEstimateDateLabel(estimate.updatedAt);
                  const isSelected = estimate.id === selectedImportEstimateId;

                  return (
                    <button
                      key={estimate.id}
                      type="button"
                      onClick={() => {
                        setSelectedImportEstimateId(estimate.id);
                        setImportMessage(null);
                      }}
                      className={`rounded-[8px] border px-3 py-2 text-left ${
                        isSelected
                          ? "border-[#1f5fd6] bg-[#eef4ff]"
                          : "border-[#d7deea] bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                        <span className="font-semibold text-[#334a70]">
                          {estimate.referenceNumber}
                        </span>
                        {estimate.title ? (
                          <span className="text-[#5d6f8a]">{estimate.title}</span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-[11px] leading-5 text-[#6b7c96]">
                        {[estimate.customerName, estimate.projectName, estimate.status, updatedLabel]
                          .filter(Boolean)
                          .join(" - ")}
                      </div>
                      <div className="mt-1 text-[11px] leading-5 text-[#7a8aa3]">
                        Reusable: {buildReusableAvailabilityLabel(estimate)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {selectedImportEstimate ? (
            <div className="mt-3 rounded-[10px] border border-[#cfdaf0] bg-[#eef4ff] px-3 py-3 text-[12px] leading-5 text-[#4d6283]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                    Selected source estimate
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-[#1f3f68]">
                      {selectedImportEstimate.referenceNumber}
                    </span>
                    {selectedImportEstimate.title ? (
                      <span className="text-[#4d6283]">{selectedImportEstimate.title}</span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImportEstimateId("");
                    setImportMessage(null);
                  }}
                  className="shrink-0 text-[12px] font-medium text-[#28456f]"
                >
                  Clear selected source
                </button>
              </div>
              <div className="mt-1 text-[12px] leading-5 text-[#5d6f8a]">
                {[
                  selectedImportEstimate.customerName,
                  selectedImportEstimate.projectName,
                  selectedImportEstimate.status,
                  formatEstimateDateLabel(selectedImportEstimate.updatedAt)
                ]
                  .filter(Boolean)
                  .join(" - ")}
              </div>
              <div className="mt-1 text-[11px] leading-5 text-[#607492]">
                Available to import: {buildSelectionAvailabilityLabel(selectedImportEstimate)}
              </div>
            </div>
          ) : null}
          {selectedImportEstimate && !selectedEstimateHasReusableContent ? (
            <div className="mt-3 rounded-[8px] border border-[#d7deea] bg-[#f7f8fb] px-3 py-2 text-[12px] leading-5 text-[#6b7c96]">
              This estimate has no reusable Scope / SOW, Terms, Inclusions, or Exclusions yet.
            </div>
          ) : null}
          <div
            className={`mt-3 rounded-[10px] border px-3 py-3 ${
              selectedImportEstimate
                ? "border-[#cfdaf0] bg-[#f7fbff]"
                : "border-[#d7deea] bg-[#fbfcfe]"
            }`}
          >
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
              Import actions
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isImportPending || !selectedImportEstimate}
                onClick={() => runImport({ type: "line-items" })}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#d7deea] bg-white px-3 text-[12px] font-medium text-[#28456f] disabled:cursor-not-allowed disabled:bg-[#f4f6fa] disabled:text-[#8b99b0]"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Import line items</span>
              </button>
              <button
                type="button"
                disabled={
                  isImportPending ||
                  !selectedImportEstimate ||
                  !selectedImportEstimate.hasScopeContent
                }
                onClick={() => runImport({ type: "reusable", section: "scope" })}
                className="inline-flex h-9 items-center rounded-[8px] border border-[#d7deea] bg-white px-3 text-[12px] font-medium text-[#28456f] disabled:cursor-not-allowed disabled:bg-[#f4f6fa] disabled:text-[#8b99b0]"
              >
                Import Scope / SOW
              </button>
              <button
                type="button"
                disabled={
                  isImportPending ||
                  !selectedImportEstimate ||
                  !selectedImportEstimate.hasTermsContent
                }
                onClick={() => runImport({ type: "reusable", section: "terms" })}
                className="inline-flex h-9 items-center rounded-[8px] border border-[#d7deea] bg-white px-3 text-[12px] font-medium text-[#28456f] disabled:cursor-not-allowed disabled:bg-[#f4f6fa] disabled:text-[#8b99b0]"
              >
                Import Terms
              </button>
              <button
                type="button"
                disabled={
                  isImportPending ||
                  !selectedImportEstimate ||
                  !selectedImportEstimate.hasInclusionsContent
                }
                onClick={() => runImport({ type: "reusable", section: "inclusions" })}
                className="inline-flex h-9 items-center rounded-[8px] border border-[#d7deea] bg-white px-3 text-[12px] font-medium text-[#28456f] disabled:cursor-not-allowed disabled:bg-[#f4f6fa] disabled:text-[#8b99b0]"
              >
                Import Inclusions
              </button>
              <button
                type="button"
                disabled={
                  isImportPending ||
                  !selectedImportEstimate ||
                  !selectedImportEstimate.hasExclusionsContent
                }
                onClick={() => runImport({ type: "reusable", section: "exclusions" })}
                className="inline-flex h-9 items-center rounded-[8px] border border-[#d7deea] bg-white px-3 text-[12px] font-medium text-[#28456f] disabled:cursor-not-allowed disabled:bg-[#f4f6fa] disabled:text-[#8b99b0]"
              >
                Import Exclusions
              </button>
            </div>
          </div>
          {importMessage ? (
            <div
              className={`mt-3 rounded-[8px] px-3 py-2 text-[12px] leading-5 ${
                importMessage.startsWith("Imported ")
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-[#d7deea] bg-[#f7f8fb] text-[#5d6f8a]"
              }`}
            >
              {importMessage}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
