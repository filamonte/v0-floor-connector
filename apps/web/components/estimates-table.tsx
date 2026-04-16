"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { EstimateStatus } from "@floorconnector/types";

import type { EstimateListItem } from "@/lib/estimates/data";

type ProjectOption = {
  id: string;
  name: string;
  customerId: string;
  customerName: string | null;
};

type EstimatesTableProps = {
  estimates: EstimateListItem[];
  projects: ProjectOption[];
  initialFilters?: {
    status?: string;
    projectId?: string;
    search?: string;
  };
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];

function getStatusBadgeStyles(status: EstimateStatus) {
  switch (status) {
    case "draft":
      return "bg-[--muted]/20 text-[--muted] border-[--muted]/30";
    case "sent":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "approved":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "rejected":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-[--muted]/20 text-[--muted] border-[--muted]/30";
  }
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function EstimatesTable({
  estimates,
  projects,
  initialFilters = {}
}: EstimatesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState(initialFilters.status ?? "");
  const [projectFilter, setProjectFilter] = useState(initialFilters.projectId ?? "");
  const [searchQuery, setSearchQuery] = useState(initialFilters.search ?? "");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filteredEstimates = useMemo(() => {
    return estimates.filter((estimate) => {
      // Status filter
      if (statusFilter && estimate.status !== statusFilter) {
        return false;
      }

      // Project filter
      if (projectFilter && estimate.projectId !== projectFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesRef = estimate.referenceNumber.toLowerCase().includes(query);
        const matchesCustomer = estimate.customer?.name.toLowerCase().includes(query);
        const matchesProject = estimate.project?.name.toLowerCase().includes(query);
        if (!matchesRef && !matchesCustomer && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [estimates, statusFilter, projectFilter, searchQuery]);

  function updateFilters(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/estimates?${params.toString()}`, { scroll: false });
    });
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    updateFilters("status", value);
  }

  function handleProjectChange(value: string) {
    setProjectFilter(value);
    updateFilters("projectId", value);
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    updateFilters("search", value);
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[--line] bg-[--surface] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--muted]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-[--line] bg-[--background] py-2 pl-10 pr-4 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-[--muted]">
          {filteredEstimates.length} estimate{filteredEstimates.length !== 1 ? "s" : ""}
          {isPending && (
            <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border border-[--muted] border-t-white" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[--line] bg-[--surface]">
        {filteredEstimates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[--line] text-left text-xs font-medium uppercase tracking-wider text-[--muted]">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--line]">
                {filteredEstimates.map((estimate) => (
                  <tr
                    key={estimate.id}
                    className="group transition hover:bg-[--surface-strong]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {estimate.customer?.name ?? "Unknown"}
                        </p>
                        <p className="mt-0.5 text-sm text-[--muted]">
                          {estimate.referenceNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {estimate.project?.name ?? "Unknown project"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadgeStyles(estimate.status)}`}
                      >
                        {formatStatusLabel(estimate.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium tabular-nums text-white">
                        {formatMoney(estimate.totalAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[--muted]">
                        {formatDate(estimate.updatedAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === estimate.id ? null : estimate.id
                            )
                          }
                          className="rounded-lg p-2 text-[--muted] transition hover:bg-[--line]/50 hover:text-white"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="6" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="18" r="1.5" />
                          </svg>
                        </button>

                        {openDropdown === estimate.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 z-20 mt-1 w-40 origin-top-right rounded-lg border border-[--line] bg-[--surface] py-1 shadow-xl">
                              <Link
                                href={`/estimates/${estimate.id}`}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white transition hover:bg-[--surface-strong]"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View
                              </Link>
                              <Link
                                href={`/estimates/${estimate.id}/edit`}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white transition hover:bg-[--surface-strong]"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </Link>
                              {estimate.status === "approved" && (
                                <Link
                                  href={`/contracts/new?estimateId=${estimate.id}`}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[--accent] transition hover:bg-[--surface-strong]"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Convert
                                </Link>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[--surface-strong]">
              <svg
                className="h-6 w-6 text-[--muted]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-white">No estimates found</h3>
            <p className="mt-1 text-sm text-[--muted]">
              {searchQuery || statusFilter || projectFilter
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first estimate."}
            </p>
            {!searchQuery && !statusFilter && !projectFilter && (
              <Link
                href="/estimates/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Estimate
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
