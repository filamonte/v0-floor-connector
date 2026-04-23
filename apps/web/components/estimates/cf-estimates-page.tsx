"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  ChevronDown,
  Calendar,
  MoreVertical,
  ExternalLink,
  X
} from "lucide-react";

type EstimateListItem = {
  id: string;
  referenceNumber: string;
  status: string;
  totalAmount: string;
  opportunity?: { id: string; title: string } | null;
  customer?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
};

type StatusCount = {
  status: string;
  label: string;
  count: number;
  color: string;
};

type CFEstimatesPageProps = {
  organizationName: string;
  estimates: EstimateListItem[];
  statusCounts: StatusCount[];
  totalPipelineValue: string;
  newEstimateHref: string;
  composerContent?: React.ReactNode;
  showComposer?: boolean;
};

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "draft":
      return "bg-[#ef7d32] text-white";
    case "sent":
      return "bg-amber-100 text-amber-700";
    case "approved":
      return "bg-emerald-500 text-white";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "completed":
      return "bg-[#233a64] text-white";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Estimating";
    case "sent":
      return "Pending Ap...";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function InitialsAvatar({ name, color = "bg-[#ef7d32]" }: { name: string; color?: string }) {
  return (
    <div className={`w-6 h-6 rounded-full ${color} text-white text-[10px] font-semibold flex items-center justify-center`}>
      {getInitials(name)}
    </div>
  );
}

export function CFEstimatesPage({
  organizationName,
  estimates,
  statusCounts,
  totalPipelineValue,
  newEstimateHref,
  composerContent,
  showComposer
}: CFEstimatesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEstimates = estimates.filter((est) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      est.referenceNumber.toLowerCase().includes(q) ||
      (est.customer?.name ?? "").toLowerCase().includes(q) ||
      (est.project?.name ?? "").toLowerCase().includes(q) ||
      (est.opportunity?.title ?? "").toLowerCase().includes(q)
    );
  });

  const draftCount = estimates.filter((e) => e.status === "draft").length;
  const sentCount = estimates.filter((e) => e.status === "sent").length;
  const approvedCount = estimates.filter((e) => e.status === "approved").length;
  const totalCount = estimates.length;

  // Get status percentages
  const statusPercents = statusCounts.map((sc) => ({
    ...sc,
    percent: totalCount > 0 ? (sc.count / totalCount) * 100 : 0
  }));

  // Recent client responses (approved/rejected)
  const recentResponses = estimates.filter((e) => e.status === "approved" || e.status === "rejected").slice(0, 5);
  
  // Pending approval (sent)
  const pendingApproval = estimates.filter((e) => e.status === "sent").slice(0, 5);

  // Draft queue
  const draftQueue = estimates.filter((e) => e.status === "draft").slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* TOP HEADER BAR - CF style breadcrumb */}
      <div className="h-[36px] bg-[#233a64] text-white flex items-center px-4 text-[12px] shrink-0">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium">Estimates</span>
        <div className="ml-auto text-[11px] text-[#a3bbd9]">
          {organizationName}
        </div>
      </div>

      {/* SEARCH BAR ROW */}
      <div className="h-[44px] bg-white border-b border-[#e1e4e8] px-4 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6b778c]" />
          <input
            type="text"
            placeholder="Search for Estimates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-[32px] text-[13px] text-[#172b4d] placeholder:text-[#a5adba] outline-none"
          />
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-[#6b778c] hover:bg-[#f4f5f7] rounded">
          <span className="w-5 h-5 border border-current rounded flex items-center justify-center text-[10px] font-bold">ID</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-[#6b778c] hover:bg-[#f4f5f7] rounded">
          <Filter className="w-4 h-4" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={newEstimateHref}
            className="h-[32px] px-3 bg-[#233a64] hover:bg-[#1b2d4d] text-white text-[12px] font-medium rounded flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Estimate
          </Link>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* LEFT SIDEBAR - Status counts with progress bars */}
        <aside className="w-[300px] bg-white border-r border-[#e1e4e8] overflow-y-auto shrink-0">
          {/* Recent Client Responses */}
          <div className="p-4 border-b border-[#e1e4e8]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-[#172b4d]">Recent Client Responses</h3>
              <button className="text-[#6b778c] hover:text-[#172b4d]">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-[50px_1fr_40px_70px] gap-1 text-[10px] font-medium text-[#6b778c] uppercase tracking-wide pb-1">
                <span>EST. #</span>
                <span>Title</span>
                <span>Cust</span>
                <span>Status</span>
              </div>
              {recentResponses.length > 0 ? (
                recentResponses.map((est) => (
                  <Link
                    key={est.id}
                    href={`/estimates/${est.id}`}
                    className="grid grid-cols-[50px_1fr_40px_70px] gap-1 text-[11px] py-1.5 hover:bg-[#f4f5f7] -mx-2 px-2 rounded items-center"
                  >
                    <span className="text-[#172b4d] font-medium">{est.referenceNumber.replace("EST-", "")}</span>
                    <span className="text-[#172b4d] truncate">{est.project?.name ?? est.opportunity?.title ?? "—"}</span>
                    <InitialsAvatar name={est.customer?.name ?? "??"} color="bg-[#5e6c84]" />
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium text-center ${getStatusColor(est.status)}`}>
                      {getStatusLabel(est.status)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-[11px] text-[#6b778c] py-2">No responses yet</p>
              )}
            </div>
          </div>

          {/* Estimates by Status */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-[#172b4d]">Estimates by Status</h3>
              <button className="text-[#6b778c] hover:text-[#172b4d]">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {statusPercents.map((sc) => (
                <div key={sc.status}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#172b4d]">{sc.label} ({sc.count})</span>
                    <span className="text-[#6b778c]">{sc.percent.toFixed(2)}%</span>
                  </div>
                  <div className="h-[6px] bg-[#ebecf0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(sc.percent, 0.5)}%`,
                        backgroundColor: sc.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 overflow-y-auto min-w-0">
          {/* TOP KPI TILES ROW */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Estimates Pending Approval */}
            <div className="bg-white border border-[#e1e4e8] rounded">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e4e8]">
                <h3 className="text-[12px] font-semibold text-[#172b4d]">Estimates Pending Approval</h3>
                <button className="text-[#6b778c] hover:text-[#172b4d]">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-[50px_1fr_70px_40px] gap-1 text-[10px] font-medium text-[#6b778c] uppercase tracking-wide mb-1 pb-1 border-b border-[#f0f0f0]">
                  <span>EST. #</span>
                  <span>Submitted</span>
                  <span>Expires</span>
                  <span>Cust</span>
                </div>
                {pendingApproval.length > 0 ? (
                  pendingApproval.map((est) => (
                    <Link
                      key={est.id}
                      href={`/estimates/${est.id}`}
                      className="grid grid-cols-[50px_1fr_70px_40px] gap-1 text-[11px] py-1.5 hover:bg-[#f4f5f7] -mx-1 px-1 rounded items-center"
                    >
                      <span className="text-[#172b4d] font-medium">{est.referenceNumber.replace("EST-", "")}</span>
                      <span className="flex items-center gap-1 text-[#6b778c]">
                        <Calendar className="w-3 h-3" />
                        —
                      </span>
                      <span className="flex items-center gap-1 text-[#6b778c]">
                        <Calendar className="w-3 h-3" />
                        —
                      </span>
                      <InitialsAvatar name={est.customer?.name ?? "??"} color="bg-[#5e6c84]" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4 text-[11px] text-[#6b778c]">
                    No Records Available
                  </div>
                )}
              </div>
            </div>

            {/* Won & Lost Estimates with donut charts */}
            <div className="bg-white border border-[#e1e4e8] rounded">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e4e8]">
                <h3 className="text-[12px] font-semibold text-[#172b4d]">Won & Lost Estimates</h3>
                <button className="flex items-center gap-1 text-[11px] text-[#6b778c] hover:text-[#172b4d]">
                  Last Month / This Month
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-around">
                {/* Last Month Donut */}
                <div className="text-center">
                  <div className="relative w-[90px] h-[90px]">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e3a5f"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[9px] text-[#6b778c]">Count ({approvedCount})</span>
                      <span className="text-[12px] font-semibold text-[#172b4d]">{formatMoney(totalPipelineValue)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#6b778c] mt-1">Last Month</p>
                </div>
                {/* This Month Donut */}
                <div className="text-center">
                  <div className="relative w-[90px] h-[90px]">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e3a5f"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[9px] text-[#6b778c]">Count (0)</span>
                      <span className="text-[12px] font-semibold text-[#172b4d]">$0</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#6b778c] mt-1">This Month</p>
                </div>
              </div>
            </div>

            {/* Estimates Out for Bid / Bid Responses - Split panel */}
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-white border border-[#e1e4e8] rounded">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#e1e4e8]">
                  <h3 className="text-[11px] font-semibold text-[#172b4d]">Estimates Out for Bid</h3>
                  <button className="text-[#6b778c] hover:text-[#172b4d]">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 text-center text-[11px] text-[#6b778c]">
                  No Records Available
                </div>
              </div>
              <div className="bg-white border border-[#e1e4e8] rounded">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#e1e4e8]">
                  <h3 className="text-[11px] font-semibold text-[#172b4d]">Bid Responses</h3>
                  <button className="text-[#6b778c] hover:text-[#172b4d]">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 text-center text-[11px] text-[#6b778c]">
                  No Records Available
                </div>
              </div>
            </div>
          </div>

          {/* MAIN DATA TABLE */}
          <div className="bg-white border border-[#e1e4e8] rounded">
            {/* Table Header with collapse toggle */}
            <div className="px-4 py-2 border-b border-[#e1e4e8] flex items-center">
              <button className="w-6 h-6 flex items-center justify-center text-[#6b778c]">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* Column Headers */}
            <div className="grid grid-cols-[60px_minmax(140px,1.5fr)_minmax(140px,1.5fr)_70px_70px_90px_90px_70px_50px_80px_80px_50px] gap-1 px-4 py-2 bg-[#f4f5f7] border-b border-[#e1e4e8] text-[10px] font-semibold text-[#6b778c] uppercase tracking-wide">
              <span>EST. #</span>
              <span>Title</span>
              <span>Customer</span>
              <span>Estimator</span>
              <span>PM</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Total</span>
              <span className="text-right">Profit</span>
              <span className="text-right">MU%</span>
              <span>Type</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#e1e4e8] max-h-[400px] overflow-y-auto">
              {filteredEstimates.map((est) => {
                const cost = Number(est.totalAmount) * 0.7; // Estimate cost as 70% of total
                const profit = Number(est.totalAmount) - cost;
                const markup = cost > 0 ? Math.round((profit / cost) * 100) : 0;

                return (
                  <Link
                    key={est.id}
                    href={`/estimates/${est.id}`}
                    className="grid grid-cols-[60px_minmax(140px,1.5fr)_minmax(140px,1.5fr)_70px_70px_90px_90px_70px_50px_80px_80px_50px] gap-1 px-4 py-2 hover:bg-[#f4f5f7] items-center text-[11px]"
                  >
                    <span className="text-[#172b4d] font-medium">{est.referenceNumber.replace("EST-", "")}</span>
                    <span className="text-[#172b4d] truncate">{est.project?.name ?? est.opportunity?.title ?? "—"}</span>
                    <span className="text-[#172b4d] truncate">{est.customer?.name ?? "—"}</span>
                    <InitialsAvatar name="JF" color="bg-[#ef7d32]" />
                    <InitialsAvatar name="JF" color="bg-[#5e6c84]" />
                    <span className="text-right text-[#172b4d]">{formatMoney(cost.toFixed(2))}</span>
                    <span className="text-right text-[#172b4d] font-medium">{formatMoney(est.totalAmount)}</span>
                    <span className="text-right text-[#172b4d]">{formatMoney(profit.toFixed(2))}</span>
                    <span className="text-right text-[#172b4d] font-medium">{markup}%</span>
                    <span className="text-[#6b778c] truncate">—</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium text-center ${getStatusColor(est.status)}`}>
                      {getStatusLabel(est.status)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button className="w-5 h-5 flex items-center justify-center text-[#6b778c] hover:text-[#172b4d]">
                        <Calendar className="w-3 h-3" />
                      </button>
                      <button className="w-5 h-5 flex items-center justify-center text-[#6b778c] hover:text-[#172b4d]">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>

        {/* Quick Create Slide-over */}
        {showComposer && (
          <aside className="w-[480px] bg-white border-l border-[#e1e4e8] shrink-0 overflow-y-auto">
            {composerContent}
          </aside>
        )}
      </div>
    </div>
  );
}
