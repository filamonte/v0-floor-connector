import type { ReactNode } from "react";

import { WorkspaceCommandBar } from "@/components/workspace-command-bar";

type ContractorWorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  summary?: ReactNode;
  commandBar?: {
    searchSlot?: ReactNode;
    filterSlot?: ReactNode;
    actionSlot?: ReactNode;
    supportSlot?: ReactNode;
  };
  children: ReactNode;
};

export function ContractorWorkspacePage({
  eyebrow,
  title,
  description,
  summary,
  commandBar,
  children
}: ContractorWorkspacePageProps) {
  return (
    <div className="space-y-2">
      {/* Page header - matches CF clean white panel pattern */}
      <section className="border border-[#e2dcd5] bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-[#221a14] sm:text-[22px]">
              {title}
            </h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#5f564d]">
              {description}
            </p>
          </div>
          {summary ? (
            <div className="xl:max-w-[520px] xl:flex-shrink-0">{summary}</div>
          ) : null}
        </div>
      </section>

      {commandBar ? <WorkspaceCommandBar {...commandBar} /> : null}

      {children}
    </div>
  );
}
