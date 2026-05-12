"use client";

import type { ReactNode } from "react";
import {
  FileText,
  MoreVertical,
  Pencil,
} from "lucide-react";

import {
  StandardWorkspaceLayout,
  type StandardWorkspaceSidebarItem
} from "@/components/workspace/standard-workspace-layout";
import { getStatusBadgeClassName } from "@floorconnector/ui";

export type EstimateWorkspaceSectionId =
  | "details"
  | "items"
  | "terms"
  | "scope"
  | "bidding"
  | "files"
  | "cover-sheet"
  | "notes"
  | "review-submit";

type EstimateWorkspaceShellProps = {
  title: string;
  subtitle?: string | null;
  estimateNumber?: string | null;
  statusLabel?: string | null;
  activeSection: EstimateWorkspaceSectionId;
  onSectionChange: (sectionId: EstimateWorkspaceSectionId) => void;
  children: ReactNode;
  statusStrip: ReactNode;
  headerActions?: ReactNode;
  saveAction?: ReactNode;
  titleEditing?: boolean;
  onTitleEditToggle?: () => void;
  onTitleChange?: (value: string) => void;
  onTitleBlur?: () => void;
};

const sectionConfig: Array<StandardWorkspaceSidebarItem<EstimateWorkspaceSectionId>> = [
  { id: "items", label: "Items", iconName: "wallet" },
  { id: "details", label: "Details", iconName: "file-text" },
  { id: "terms", label: "Terms", iconName: "scroll-text" },
  { id: "scope", label: "Scope of Work", iconName: "check-square" },
  { id: "bidding", label: "Bidding", iconName: "briefcase" },
  { id: "files", label: "Files", iconName: "folder-open" },
  { id: "cover-sheet", label: "Cover Sheet", iconName: "package-check" },
  { id: "notes", label: "Notes", iconName: "notebook-pen" },
  { id: "review-submit", label: "Review Estimate", iconName: "send" }
];

function formatStatusBadge(statusLabel?: string | null) {
  if (!statusLabel) {
    return "DRAFT";
  }

  return statusLabel.toUpperCase();
}

export function EstimateWorkspaceShell({
  title,
  subtitle,
  estimateNumber,
  statusLabel,
  activeSection,
  onSectionChange,
  children,
  statusStrip,
  headerActions,
  saveAction,
  titleEditing,
  onTitleEditToggle,
  onTitleChange,
  onTitleBlur
}: EstimateWorkspaceShellProps) {
  return (
    <StandardWorkspaceLayout
      header={{
        eyebrow: "Estimate Editor",
        title,
        description: subtitle ?? "Project/Opportunity",
        actions: (
          <div className="border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-5 text-[var(--text-primary)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Estimate status
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-primary)]">
              <span
                className={[
                  "rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
                  getStatusBadgeClassName(statusLabel ?? "draft")
                ].join(" ")}
              >
                {formatStatusBadge(statusLabel)}
              </span>
              {estimateNumber ? <span>Estimate #{estimateNumber}</span> : null}
            </div>
          </div>
        )
      }}
      sidebar={sectionConfig.map((section) => ({
        ...section,
        onSelect: () => onSectionChange(section.id)
      }))}
      currentView={activeSection}
    >
      <div className="flex min-h-[620px] min-w-0 flex-col bg-white">
        <header className="border-b border-[var(--border-warm)]">
          <div className="flex flex-col gap-4 px-4 py-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--copper-light)] bg-[var(--copper)] text-white">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {titleEditing ? (
                    <input
                      value={title}
                      onChange={(event) => onTitleChange?.(event.target.value)}
                      onBlur={onTitleBlur}
                      className="h-9 min-w-[260px] max-w-[460px] border border-[var(--border-medium)] px-3 text-[18px] font-semibold text-[var(--text-primary)] outline-none"
                    />
                  ) : (
                    <h1 className="whitespace-normal break-words text-[18px] font-semibold leading-6 text-[var(--text-primary)] [overflow-wrap:anywhere]">
                      {title}
                    </h1>
                  )}
                  {onTitleEditToggle ? (
                    <button
                      type="button"
                      onClick={onTitleEditToggle}
                      className={[
                        "inline-flex h-8 w-8 items-center justify-center border border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--highlight)]",
                        titleEditing ? "bg-[var(--highlight)]" : ""
                      ].join(" ")}
                      title="Edit estimate title"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
                  {subtitle ?? "Project/Opportunity"}
                </p>
                <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                  Build items, review scope, then open the customer-facing estimate.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start xl:flex-shrink-0">
              <div>{statusStrip}</div>

              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <div>{headerActions ?? <MoreVertical className="h-5 w-5" />}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-white">{children}</main>

        <footer className="border-t border-[var(--border-warm)] bg-white px-4 py-2.5">
          <div className="flex items-center justify-end">
            {saveAction ?? (
              <button
                type="submit"
                className="inline-flex h-9 min-w-[124px] items-center justify-center border border-[var(--copper)] bg-[var(--copper)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--copper-light)]"
              >
                Save
              </button>
            )}
          </div>
        </footer>
      </div>
    </StandardWorkspaceLayout>
  );
}
