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
    <section className="rounded-[1.2rem] border border-[#e4d7c9] bg-[#fffaf3] px-4 py-3 shadow-[0_14px_30px_-28px_rgba(57,43,30,0.26)] sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          {supportSlot ? (
            <div className="text-[13px] leading-5 text-[#7a6656]">{supportSlot}</div>
          ) : null}
          {filterSlot ? <div className="flex flex-wrap gap-2">{filterSlot}</div> : null}
        </div>

        <div className="flex flex-col gap-2 xl:min-w-[460px] xl:max-w-[640px] xl:items-end">
          {searchSlot ? <div className="w-full">{searchSlot}</div> : null}
          {actionSlot ? <div className="flex flex-wrap justify-end gap-2">{actionSlot}</div> : null}
        </div>
      </div>
    </section>
  );
}
