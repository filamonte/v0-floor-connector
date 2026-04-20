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
      <section className="border border-[#dde3eb] bg-[#fbfcfe] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f7d92]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-tight text-[#17243b] sm:text-[30px]">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-slate-600">
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
