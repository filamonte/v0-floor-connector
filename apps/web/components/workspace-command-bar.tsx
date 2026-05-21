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
    <section className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 shadow-[0_1px_2px_rgba(34,26,20,0.04)]">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          {supportSlot ? (
            <div className="text-[11px] leading-4 text-[var(--text-secondary)]">{supportSlot}</div>
          ) : null}
          {filterSlot ? <div className="flex flex-wrap gap-1.5">{filterSlot}</div> : null}
        </div>

        <div className="flex flex-col gap-1.5 xl:min-w-[420px] xl:max-w-[620px] xl:items-end">
          {searchSlot ? <div className="w-full">{searchSlot}</div> : null}
          {actionSlot ? <div className="flex flex-wrap justify-end gap-1.5">{actionSlot}</div> : null}
        </div>
      </div>
    </section>
  );
}
