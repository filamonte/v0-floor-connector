"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  List,
  FileText,
  ClipboardList,
  Folder,
  FileSpreadsheet,
  StickyNote,
  Send,
  RefreshCw,
  Lock,
  MoreVertical,
  Calendar,
  Clock,
  User,
  FileDown,
  CheckSquare,
  Copy,
  Download,
  Upload,
  Trash2,
  Share2,
  Printer,
  DollarSign,
  Gavel
} from "lucide-react";
import { useState } from "react";

export type CFWorkspaceStage = {
  id: string;
  label: string;
  status: "active" | "pending" | "complete";
};

export type CFWorkspaceSection = {
  id: string;
  label: string;
};

type CFWorkspaceShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string | null;
  referenceNumber?: string | null;
  statusBadge?: string | null;
  stages?: CFWorkspaceStage[];
  sections: CFWorkspaceSection[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  createdAt?: string;
  createdTime?: string;
  createdBy?: string;
  onRefresh?: () => void;
  onLock?: () => void;
  onReviewSubmit?: () => void;
  children: ReactNode;
};

const sectionIcons: Record<string, typeof List> = {
  details: List,
  items: DollarSign,
  terms: FileText,
  "scope-of-work": ClipboardList,
  bidding: Gavel,
  files: Folder,
  "cover-sheet": FileSpreadsheet,
  notes: StickyNote
};

export function CFWorkspaceShell({
  backHref,
  backLabel,
  title,
  subtitle,
  referenceNumber,
  statusBadge,
  stages = [],
  sections,
  activeSection,
  onSectionChange,
  createdAt,
  createdTime,
  createdBy,
  onRefresh,
  onLock,
  onReviewSubmit,
  children
}: CFWorkspaceShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5f7]">
      {/* Left Sidebar - Dark Navy - CF Style */}
      <aside className="w-[200px] bg-[#1e3a5f] text-white flex flex-col shrink-0">
        {/* Back Link - Tight */}
        <div className="border-b border-white/10 px-3 py-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#b8c9e8] transition hover:text-white"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Nav Items - Dense */}
        <nav className="flex-1 py-1">
          {sections.map((section) => {
            const Icon = sectionIcons[section.id] ?? List;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange?.(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition text-left ${
                  isActive
                    ? "bg-[#ef7d32] text-white"
                    : "text-[#c5d4eb] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 opacity-90" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Review CTA - CF Orange */}
        <div className="border-t border-white/10 p-2">
          <button
            type="button"
            onClick={onReviewSubmit}
            className="flex items-center justify-center gap-2 w-full h-10 bg-[#ef7d32] hover:bg-[#d96b1f] text-white text-[13px] font-semibold rounded transition"
          >
            <Send className="w-4 h-4" />
            <span>Review and Submit</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Strip - Compact 56px */}
        <header className="h-14 bg-white border-b border-[#dfe1e6] px-4 flex items-center justify-between shrink-0">
          {/* Left - Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#fff4e8] border-2 border-[#ef7d32] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#ef7d32]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold text-[#172b4d] truncate">
                  {title}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                {subtitle && (
                  <span className="text-[#5e6c84] truncate">{subtitle}</span>
                )}
                {statusBadge && (
                  <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-[#fff4e8] text-[#b35a1f]">
                    {statusBadge}
                  </span>
                )}
                {referenceNumber && (
                  <span className="text-[#5e6c84]">EST. #{referenceNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Center - Status Stages */}
          {stages.length > 0 && (
            <div className="hidden lg:flex items-center gap-0">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        stage.status === "active"
                          ? "bg-[#ef7d32] border-[#ef7d32]"
                          : stage.status === "complete"
                            ? "bg-[#36b37e] border-[#36b37e]"
                            : "bg-white border-[#dfe1e6]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stage.status === "active" || stage.status === "complete"
                            ? "bg-white"
                            : "bg-[#dfe1e6]"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-[#5e6c84] mt-0.5 max-w-[60px] truncate text-center">
                      {stage.label}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className="w-8 h-0.5 bg-[#dfe1e6] mx-0.5 mt-[-16px]" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Right - Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#5e6c84]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onLock}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#5e6c84]"
            >
              <Lock className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#5e6c84]"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 w-52 bg-white border border-[#dfe1e6] rounded shadow-lg z-50 py-1">
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-[#172b4d] hover:bg-[#f4f5f7]">
                      <FileDown className="w-3.5 h-3.5" />
                      View/Email PDF
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-[#172b4d] hover:bg-[#f4f5f7]">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Submit for Approval
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-[#172b4d] hover:bg-[#f4f5f7]">
                      <Folder className="w-3.5 h-3.5" />
                      Generate a Project
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-[#172b4d] hover:bg-[#f4f5f7]">
                      <Copy className="w-3.5 h-3.5" />
                      Make a Copy
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-[#172b4d] hover:bg-[#f4f5f7]">
                      <Download className="w-3.5 h-3.5" />
                      Download Import Template
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-[#172b4d] hover:bg-[#f4f5f7]">
                      <Upload className="w-3.5 h-3.5" />
                      Export Items to CSV
                    </button>
                    <div className="border-t border-[#dfe1e6] my-1" />
                    <div className="px-3 py-1.5 flex items-center gap-2">
                      <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#5e6c84]">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#5e6c84]">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area - Full bleed, no padding */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Footer - Compact 40px */}
        <footer className="h-10 bg-white border-t border-[#dfe1e6] px-4 flex items-center justify-between shrink-0 text-[11px]">
          <div className="flex items-center gap-3 text-[#5e6c84]">
            <span className="font-medium text-[#172b4d]">Created:</span>
            {createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {createdAt}
              </span>
            )}
            {createdTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {createdTime}
              </span>
            )}
            {createdBy && (
              <span className="flex items-center gap-1">
                By
                <User className="w-3 h-3" />
                {createdBy}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[#5e6c84] cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-[#dfe1e6]"
              />
              Save Estimate as Template
            </label>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#5e6c84] border border-[#dfe1e6] rounded hover:bg-[#f4f5f7] transition"
            >
              <Clock className="w-3 h-3" />
              Timeline
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
