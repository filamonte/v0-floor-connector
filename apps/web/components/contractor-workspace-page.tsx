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
    <div className="space-y-4">
      <section className="rounded-[1.4rem] border border-[#e4d7c9] bg-[linear-gradient(180deg,#fffdf9,#f8f1e8)] px-5 py-4 shadow-[0_18px_40px_-34px_rgba(57,43,30,0.22)] sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a4581a]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-tight text-[#2b2118] sm:text-[30px]">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#665446]">
              {description}
            </p>
          </div>
          {summary ? (
            <div className="xl:max-w-[420px] xl:flex-shrink-0">{summary}</div>
          ) : null}
        </div>
      </section>

      {commandBar ? <WorkspaceCommandBar {...commandBar} /> : null}

      {children}
    </div>
  );
}
