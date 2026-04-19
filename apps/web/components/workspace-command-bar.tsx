import type { ReactNode } from "react";

type WorkspaceCommandBarProps = {
  searchSlot?: ReactNode;
  filterSlot?: ReactNode;
  actionSlot?: ReactNode;
  supportSlot?: ReactNode;
};

export function WorkspaceCommandBar({
  searchSlot,
  filterSlot,
  actionSlot,
  supportSlot
}: WorkspaceCommandBarProps) {
  if (!searchSlot && !filterSlot && !actionSlot && !supportSlot) {
    return null;
  }

  return (
    <section className="rounded-[1.9rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.45)] backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          {supportSlot ? (
            <div className="text-sm leading-6 text-slate-600">{supportSlot}</div>
          ) : null}
          {filterSlot ? <div className="flex flex-wrap gap-2">{filterSlot}</div> : null}
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[420px] xl:max-w-[520px] xl:items-end">
          {searchSlot ? <div className="w-full">{searchSlot}</div> : null}
          {actionSlot ? <div className="flex flex-wrap justify-end gap-2">{actionSlot}</div> : null}
        </div>
      </div>
    </section>
  );
}
