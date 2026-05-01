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
      {/* Page header - CF charcoal header band pattern */}
      <section className="bg-[#2f3d33] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#ef7d32]">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-[18px] font-semibold text-white sm:text-[20px]">
              {title}
            </h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#c5d1c8]">
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
