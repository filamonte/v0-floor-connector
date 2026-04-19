import type { ReactNode } from "react";

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
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600">
              {description}
            </p>
          </div>
          {summary && <div className="lg:max-w-xs">{summary}</div>}
        </div>
      </section>

      {commandBar && (
        <section className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              {commandBar.supportSlot && (
                <div className="text-sm text-neutral-600">{commandBar.supportSlot}</div>
              )}
              {commandBar.filterSlot && (
                <div className="flex flex-wrap gap-2">{commandBar.filterSlot}</div>
              )}
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              {commandBar.searchSlot && <div className="w-full lg:w-auto">{commandBar.searchSlot}</div>}
              {commandBar.actionSlot && (
                <div className="flex flex-wrap gap-2">{commandBar.actionSlot}</div>
              )}
            </div>
          </div>
        </section>
      )}

      {children}
    </div>
  );
}
