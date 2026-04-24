"use client";

import { Search, Star, UserRound, Users, X } from "lucide-react";

type CustomerOption = {
  id: string;
  label: string;
  type?: string;
  initials?: string;
};

type CustomerSelectorModalProps = {
  open: boolean;
  customers: CustomerOption[];
  leads?: CustomerOption[];
  activeTab?: "customers" | "leads";
  selectedLabel?: string;
};

function initialsFor(label: string) {
  const parts = label.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "CU";
}

export function CustomerSelectorModal({
  open,
  customers,
  leads = [],
  activeTab = "customers",
  selectedLabel,
}: CustomerSelectorModalProps) {
  if (!open) {
    return null;
  }

  const rows = activeTab === "customers" ? customers : leads;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
      <div className="grid max-h-[80vh] w-full max-w-[800px] overflow-hidden rounded-xl bg-white shadow-2xl md:grid-cols-[200px_minmax(0,1fr)_220px]">
        <aside className="border-r border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2">
            <button
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium ${
                activeTab === "customers"
                  ? "border-l-4 border-[#ef7d32] bg-white text-slate-900"
                  : "text-slate-600"
              }`}
            >
              <Users className="h-4 w-4" />
              Customers
            </button>
            <button
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium ${
                activeTab === "leads" ? "border-l-4 border-[#ef7d32] bg-white text-slate-900" : "text-slate-600"
              }`}
            >
              <UserRound className="h-4 w-4" />
              Leads
            </button>
          </div>
        </aside>

        <div className="min-w-0 border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Users className="h-4 w-4" />
              </span>
              <h2 className="text-[16px] font-semibold text-slate-900">Select Contact</h2>
            </div>
            <button type="button" className="text-slate-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 border-b border-slate-200 px-4 py-3">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                readOnly
                value=""
                placeholder="Search for Customer"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm placeholder:text-slate-400"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" readOnly />
              Show Favorites Only
            </label>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex h-12 items-center gap-4 border-b border-slate-100 px-4 text-sm hover:bg-slate-50"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                  {row.initials ?? initialsFor(row.label)}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-800">{row.label}</span>
                <span className="text-slate-500">{row.type ?? "Customer"}</span>
                <Star className="h-4 w-4 text-orange-400" />
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-slate-50 px-5 py-5">
          <div className="mb-2 text-base font-semibold text-slate-900">Currently Selected</div>
          <p className="text-sm text-slate-400">
            {selectedLabel ? selectedLabel : "Selected contact will appear here!"}
          </p>
        </aside>
      </div>
    </div>
  );
}
