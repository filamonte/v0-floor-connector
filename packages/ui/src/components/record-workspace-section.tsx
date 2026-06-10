import type { ReactNode } from "react";

export type RecordWorkspaceSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function RecordWorkspaceSection({
  id,
  eyebrow,
  title,
  description,
  action,
  meta,
  children,
  className,
  contentClassName
}: RecordWorkspaceSectionProps) {
  const titleId = id ? `${id}-title` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={[
        "overflow-hidden rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3 border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)] px-4 py-4 md:flex-row md:items-start md:justify-between sm:px-5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={titleId}
            className="mt-1 whitespace-normal break-words text-lg font-semibold text-[var(--text-primary)] [overflow-wrap:anywhere]"
          >
            {title}
          </h2>
          {description ? (
            <div className="mt-1 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
              {description}
            </div>
          ) : null}
        </div>
        {action || meta ? (
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {meta}
            {action}
          </div>
        ) : null}
      </div>

      {children ? <div className={contentClassName}>{children}</div> : null}
    </section>
  );
}
