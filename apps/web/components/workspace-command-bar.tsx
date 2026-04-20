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
    <section className="border border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          {supportSlot ? (
            <div className="text-[13px] leading-5 text-neutral-500">{supportSlot}</div>
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
