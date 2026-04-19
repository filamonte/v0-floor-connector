import type { ReactNode } from "react";

type NextActionCardProps = {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
};

export function NextActionCard({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "space-y-3 text-sm leading-6 text-slate-600"
}: NextActionCardProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <p className="text-base font-semibold text-slate-950">{title}</p>
      <div>{description}</div>
      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
