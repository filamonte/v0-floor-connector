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
    <div className="space-y-3">
      <section className="border border-[#d7c7b4] bg-[#fbf7f1] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a4581a]">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-[#2b2118] sm:text-[24px]">
              {title}
            </h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#665446]">
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
