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
  ExternalLink
} from "lucide-react";

type EstimateRecord = {
  id: string;
  referenceNumber: string;
  title: string;
  customerName: string;
  customerInitials: string;
  estimatorName: string;
  estimatorInitials: string;
  pmName?: string;
  pmInitials?: string;
  cost: number;
  total: number;
  profit: number;
  markupPercent: number;
  type?: string;
  status: "estimating" | "pending_approval" | "approved_to_bid" | "re_estimating" | "approved" | "completed" | "lost";
  submittedDate?: string;
  expiresDate?: string;
};

type StatusCount = {
  status: string;
  label: string;
  count: number;
  percent: number;
  color: string;
};

type CFEstimateManagerProps = {
  organizationName: string;
  estimates: EstimateRecord[];
  statusCounts: StatusCount[];
  recentClientResponses: EstimateRecord[];
  pendingApproval: EstimateRecord[];
  wonLostStats: {
    lastMonth: { count: number; value: number };
    thisMonth: { count: number; value: number };
  };
  onNewEstimate?: () => void;
  onRefresh?: () => void;
};

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatMoneyFull(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "estimating":
      return "bg-[#ef7d32] text-white";
    case "pending_approval":
      return "bg-amber-100 text-amber-700";
    case "approved_to_bid":
      return "bg-emerald-100 text-emerald-700";
    case "approved":
      return "bg-emerald-500 text-white";
    case "completed":
      return "bg-[#233a64] text-white";
    case "lost":
      return "bg-rose-100 text-rose-700";
    case "re_estimating":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "estimating":
      return "Estimating";
    case "pending_approval":
      return "Pending Ap...";
    case "approved_to_bid":
      return "Approved - ...";
    case "approved":
      return "Approved";
    case "completed":
      return "Completed";
    case "lost":
      return "Lost";
    case "re_estimating":
      return "Re-Estimating";
    default:
      return status;
  }
}

function InitialsAvatar({ initials, color = "bg-[#ef7d32]" }: { initials: string; color?: string }) {
  return (
    <div className={`w-6 h-6 rounded-full ${color} text-white text-[10px] font-semibold flex items-center justify-center`}>
      {initials}
    </div>
  );
}

export function CFEstimateManager({
  organizationName,
  estimates,
  statusCounts,
  recentClientResponses,
  pendingApproval,
  wonLostStats,
  onNewEstimate,
  onRefresh
}: CFEstimateManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Last Month / This Month");

  const filteredEstimates = estimates.filter((est) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      est.referenceNumber.toLowerCase().includes(q) ||
      est.title.toLowerCase().includes(q) ||
      est.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* TOP HEADER BAR - CF style breadcrumb */}
      <div className="h-[36px] bg-[#233a64] text-white flex items-center px-4 text-[12px]">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium">Estimates</span>
        <div className="ml-auto text-[11px] text-[#a3bbd9]">
          {organizationName}
        </div>
      </div>

      {/* SEARCH BAR ROW */}
      <div className="h-[44px] bg-white border-b border-[#e1e4e8] px-4 flex items-center gap-3">
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
          <button
            onClick={onNewEstimate}
            className="h-[32px] px-3 bg-[#233a64] hover:bg-[#1b2d4d] text-white text-[12px] font-medium rounded flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Estimate
          </button>
        </div>
      </div>

      <div className="flex">
        {/* LEFT SIDEBAR - Status counts with progress bars */}
        <aside className="w-[280px] bg-white border-r border-[#e1e4e8] p-4 shrink-0">
          {/* Recent Client Responses */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-[#172b4d]">Recent Client Responses</h3>
              <button onClick={onRefresh} className="text-[#6b778c] hover:text-[#172b4d]">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-[11px] font-medium text-[#6b778c] uppercase tracking-wide">
                <span>EST. #</span>
                <span>Title</span>
                <span>Customer</span>
                <span>Status</span>
              </div>
              {recentClientResponses.slice(0, 5).map((est) => (
                <Link
                  key={est.id}
                  href={`/estimates/${est.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-[11px] py-1.5 hover:bg-[#f4f5f7] -mx-2 px-2 rounded items-center"
                >
                  <span className="text-[#172b4d] font-medium">{est.referenceNumber.replace("EST-", "")}</span>
                  <span className="text-[#172b4d] truncate">{est.title}</span>
                  <InitialsAvatar initials={est.customerInitials} color="bg-[#5e6c84]" />
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(est.status)}`}>
                    {getStatusLabel(est.status)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Estimates by Status */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-[#172b4d]">Estimates by Status</h3>
              <button onClick={onRefresh} className="text-[#6b778c] hover:text-[#172b4d]">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {statusCounts.map((sc) => (
                <div key={sc.status} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-[#172b4d]">{sc.label} ({sc.count})</span>
                      <span className="text-[#6b778c]">{sc.percent.toFixed(2)}%</span>
                    </div>
                    <div className="h-[6px] bg-[#ebecf0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sc.percent}%`,
                          backgroundColor: sc.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 min-w-0">
          {/* TOP KPI TILES ROW */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Estimates Pending Approval */}
            <div className="bg-white border border-[#e1e4e8] rounded">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e4e8]">
                <h3 className="text-[12px] font-semibold text-[#172b4d]">Estimates Pending Approval</h3>
                <button onClick={onRefresh} className="text-[#6b778c] hover:text-[#172b4d]">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-[10px] font-medium text-[#6b778c] uppercase tracking-wide mb-2">
                  <span>EST. #</span>
                  <span>Submitted</span>
                  <span>Expires</span>
                  <span>Customer</span>
                </div>
                {pendingApproval.slice(0, 5).map((est) => (
                  <Link
                    key={est.id}
                    href={`/estimates/${est.id}`}
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-[11px] py-1.5 hover:bg-[#f4f5f7] -mx-2 px-2 rounded items-center"
                  >
                    <span className="text-[#172b4d] font-medium">{est.referenceNumber.replace("EST-", "")}</span>
                    <span className="flex items-center gap-1 text-[#6b778c]">
                      <Calendar className="w-3 h-3" />
                      {est.submittedDate ?? "—"}
                    </span>
                    <span className="flex items-center gap-1 text-[#6b778c]">
                      <Calendar className="w-3 h-3" />
                      {est.expiresDate ?? "—"}
                    </span>
                    <InitialsAvatar initials={est.customerInitials} color="bg-[#5e6c84]" />
                  </Link>
                ))}
                {pendingApproval.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-[#6b778c]">
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
                  {dateFilter}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-around">
                {/* Last Month Donut */}
                <div className="text-center">
                  <div className="relative w-[100px] h-[100px]">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e3a5f"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-[#6b778c]">Count ({wonLostStats.lastMonth.count})</span>
                      <span className="text-[14px] font-semibold text-[#172b4d]">{formatMoney(wonLostStats.lastMonth.value)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6b778c] mt-2">Last Month</p>
                </div>
                {/* This Month Donut */}
                <div className="text-center">
                  <div className="relative w-[100px] h-[100px]">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e3a5f"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-[#6b778c]">Count ({wonLostStats.thisMonth.count})</span>
                      <span className="text-[14px] font-semibold text-[#172b4d]">{formatMoney(wonLostStats.thisMonth.value)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6b778c] mt-2">This Month</p>
                </div>
              </div>
            </div>

            {/* Estimates Out for Bid / Bid Responses - Split panel */}
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-white border border-[#e1e4e8] rounded">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#e1e4e8]">
                  <h3 className="text-[11px] font-semibold text-[#172b4d]">Estimates Out for Bid</h3>
                  <button onClick={onRefresh} className="text-[#6b778c] hover:text-[#172b4d]">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 text-center text-[11px] text-[#6b778c]">
                  No Records Available
                </div>
              </div>
              <div className="bg-white border border-[#e1e4e8] rounded">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#e1e4e8]">
                  <h3 className="text-[11px] font-semibold text-[#172b4d]">Bid Responses</h3>
                  <button onClick={onRefresh} className="text-[#6b778c] hover:text-[#172b4d]">
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
            {/* Table Header */}
            <div className="px-4 py-2 border-b border-[#e1e4e8] flex items-center">
              <button className="w-6 h-6 flex items-center justify-center text-[#6b778c]">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* Column Headers */}
            <div className="grid grid-cols-[60px_minmax(120px,1fr)_minmax(120px,1fr)_80px_80px_100px_100px_80px_60px_80px_100px_40px] gap-2 px-4 py-2 bg-[#f4f5f7] border-b border-[#e1e4e8] text-[10px] font-semibold text-[#6b778c] uppercase tracking-wide">
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
            <div className="divide-y divide-[#e1e4e8]">
              {filteredEstimates.map((est) => (
                <Link
                  key={est.id}
                  href={`/estimates/${est.id}`}
                  className="grid grid-cols-[60px_minmax(120px,1fr)_minmax(120px,1fr)_80px_80px_100px_100px_80px_60px_80px_100px_40px] gap-2 px-4 py-2 hover:bg-[#f4f5f7] items-center text-[12px]"
                >
                  <span className="text-[#172b4d] font-medium">{est.referenceNumber.replace("EST-", "")}</span>
                  <span className="text-[#172b4d] truncate">{est.title}</span>
                  <span className="text-[#172b4d] truncate">{est.customerName}</span>
                  <InitialsAvatar initials={est.estimatorInitials} />
                  {est.pmInitials ? (
                    <InitialsAvatar initials={est.pmInitials} color="bg-[#5e6c84]" />
                  ) : (
                    <span className="text-[#a5adba]">—</span>
                  )}
                  <span className="text-right text-[#172b4d]">{formatMoneyFull(est.cost)}</span>
                  <span className="text-right text-[#172b4d] font-medium">{formatMoneyFull(est.total)}</span>
                  <span className="text-right text-[#172b4d]">{formatMoneyFull(est.profit)}</span>
                  <span className="text-right text-[#172b4d] font-medium">{est.markupPercent}%</span>
                  <span className="text-[#6b778c] truncate">{est.type ?? "—"}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium text-center ${getStatusColor(est.status)}`}>
                    {getStatusLabel(est.status)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center text-[#6b778c] hover:text-[#172b4d]">
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center text-[#6b778c] hover:text-[#172b4d]">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
