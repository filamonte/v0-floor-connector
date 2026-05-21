import type { ReactNode } from "react";

type QuickCreateFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function QuickCreateFormShell({
  eyebrow,
  title,
  description,
  children,
  footer
}: QuickCreateFormShellProps) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]">
        <div className="h-1 bg-[var(--copper)]" />
        <div className="space-y-2 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            {eyebrow}
          </p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>

      {children}

      {footer ? (
        <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-[13px] leading-6 text-[var(--text-secondary)]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
