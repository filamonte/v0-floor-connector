"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  List,
  Grid3X3,
  FileText,
  ClipboardList,
  Gavel,
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
  Printer
} from "lucide-react";
import { useState } from "react";

export type CFWorkspaceStage = {
  id: string;
  label: string;
  icon?: ReactNode;
  status: "active" | "pending" | "complete";
};

export type CFWorkspaceSection = {
  id: string;
  label: string;
  icon?: string;
  href?: string;
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
  createdAt?: string;
  createdTime?: string;
  createdBy?: string;
  onRefresh?: () => void;
  onLock?: () => void;
  children: ReactNode;
};

const sectionIcons: Record<string, typeof List> = {
  details: List,
  items: Grid3X3,
  terms: FileText,
  "scope-of-work": ClipboardList,
  bidding: Gavel,
  files: Folder,
  "cover-sheet": FileSpreadsheet,
  notes: StickyNote,
  "review-send": Send
};

function StageNode({
  stage,
  isLast
}: {
  stage: CFWorkspaceStage;
  isLast: boolean;
}) {
  const baseClasses = "flex flex-col items-center";
  const nodeClasses =
    stage.status === "active"
      ? "w-9 h-9 rounded-full bg-[#ef7d32] border-2 border-[#ef7d32] flex items-center justify-center"
      : stage.status === "complete"
        ? "w-9 h-9 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center"
        : "w-9 h-9 rounded-full bg-white border-2 border-[#e5e7eb] flex items-center justify-center";

  const iconColor =
    stage.status === "active" || stage.status === "complete"
      ? "text-white"
      : "text-gray-400";

  return (
    <div className={baseClasses}>
      <div className="flex items-center">
        <div className={nodeClasses}>
          {stage.icon ? (
            <span className={iconColor}>{stage.icon}</span>
          ) : (
            <span
              className={`w-2.5 h-2.5 rounded-full ${stage.status === "active" ? "bg-white" : stage.status === "complete" ? "bg-white" : "bg-gray-300"}`}
            />
          )}
        </div>
        {!isLast && (
          <div className="w-[60px] h-[2px] bg-[#e5e7eb] mx-1" />
        )}
      </div>
      <span className="mt-1.5 text-[11px] text-gray-600 text-center max-w-[80px] truncate">
        {stage.label}
      </span>
    </div>
  );
}

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
  createdAt,
  createdTime,
  createdBy,
  onRefresh,
  onLock,
  children
}: CFWorkspaceShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar - Dark Navy */}
      <aside className="w-[200px] bg-[#1e3a5f] text-white flex flex-col shrink-0">
        {/* Back Link */}
        <div className="border-b border-white/10 px-4 py-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#dce7fb] transition hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {sections.map((section) => {
            const Icon = sectionIcons[section.id] ?? List;
            const isActive = activeSection === section.id;

            return (
              <a
                key={section.id}
                href={section.href ?? `#${section.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded transition ${
                  isActive
                    ? "bg-white/10 text-white border-l-[3px] border-[#ef7d32] -ml-[3px] pl-[19px]"
                    : "text-[#e6eefc] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-[18px] h-[18px] opacity-80" />
                <span>{section.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Review and Submit CTA */}
        <div className="border-t border-white/10 p-4">
          <Link
            href={`#review-send`}
            className="flex items-center justify-center gap-2 w-full h-11 bg-[#ef7d32] hover:bg-[#d95c1f] text-white text-[14px] font-semibold rounded-md transition"
          >
            <Send className="w-4 h-4" />
            <span>Review and Submit</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Identity Strip */}
        <header className="h-[72px] bg-white border-b border-[#e5e7eb] px-6 flex items-center justify-between shrink-0">
          {/* Left Block - Identity */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#fff4e8] border-2 border-[#ef7d32] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#ef7d32]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[18px] font-semibold text-[#17243b] truncate">
                {title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {subtitle && (
                  <span className="text-[12px] text-gray-500 truncate">
                    {subtitle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {statusBadge && (
                  <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-[#fff4e8] text-[#a65724] border border-[#fde2ce]">
                    {statusBadge}
                  </span>
                )}
                {referenceNumber && (
                  <span className="text-[12px] text-gray-600">
                    EST. #{referenceNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Block - Status Progression */}
          {stages.length > 0 && (
            <div className="hidden lg:flex items-start gap-0">
              {stages.map((stage, index) => (
                <StageNode
                  key={stage.id}
                  stage={stage}
                  isLast={index === stages.length - 1}
                />
              ))}
            </div>
          )}

          {/* Right Block - Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-500"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onLock}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-500"
            >
              <Lock className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-500"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                    <FileDown className="w-4 h-4" />
                    View/Email PDF
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                    <CheckSquare className="w-4 h-4" />
                    Submit for Approval
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                    <Folder className="w-4 h-4" />
                    Generate a Project
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                    <Copy className="w-4 h-4" />
                    Make a Copy
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Download Import Template
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    Export Items to CSV
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <div className="px-4 py-2 flex items-center gap-3">
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#f9fafb] p-4">
          {children}
        </main>

        {/* Footer Bar */}
        <footer className="h-12 bg-white border-t border-[#e5e7eb] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-[12px] text-gray-600">
            <span className="font-medium">Created:</span>
            {createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {createdAt}
              </span>
            )}
            {createdTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {createdTime}
              </span>
            )}
            {createdBy && (
              <span className="flex items-center gap-1.5">
                By
                <User className="w-3.5 h-3.5" />
                {createdBy}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[12px] text-gray-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              Save Estimate as Template
            </label>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
