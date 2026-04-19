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
    <section className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          {supportSlot && (
            <div className="text-sm text-neutral-600">{supportSlot}</div>
          )}
          {filterSlot && <div className="flex flex-wrap gap-2">{filterSlot}</div>}
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[320px] lg:max-w-[420px] lg:items-end">
          {searchSlot && <div className="w-full">{searchSlot}</div>}
          {actionSlot && (
            <div className="flex flex-wrap justify-end gap-2">{actionSlot}</div>
          )}
        </div>
      </div>
    </section>
  );
}
