import type { ReactNode } from "react";

type WorkspaceCommandBarProps = {
  searchSlot?: ReactNode;
  filterSlot?: ReactNode;
  actionSlot?: ReactNode;
  supportSlot?: ReactNode;
  embedded?: boolean;
};

export function WorkspaceCommandBar({
  searchSlot,
  filterSlot,
  actionSlot,
  supportSlot,
  embedded = false
}: WorkspaceCommandBarProps) {
  if (!searchSlot && !filterSlot && !actionSlot && !supportSlot) {
    return null;
  }

  const content = (
    <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0 flex-1 space-y-1.5">
        {supportSlot ? (
          <div className="rounded-md border-l-2 border-[var(--copper)] bg-white/70 px-3 py-2 text-[11px] leading-4 text-[var(--text-secondary)]">
            {supportSlot}
          </div>
        ) : null}
        {filterSlot ? (
          <div className="flex flex-wrap gap-1.5">{filterSlot}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 xl:min-w-[420px] xl:max-w-[620px] xl:items-end">
        {searchSlot ? <div className="w-full">{searchSlot}</div> : null}
        {actionSlot ? (
          <div className="flex flex-wrap justify-start gap-1.5 sm:justify-end">
            {actionSlot}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="rounded-lg border border-[var(--border-warm)] bg-white px-3 py-2 shadow-[0_14px_36px_-34px_rgba(31,41,55,0.5)]">
      {content}
    </section>
  );
}
