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
  className = "space-y-4.5 text-sm leading-6 text-slate-600"
}: NextActionCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a4581a]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2.5">
        <p className="text-xl font-semibold tracking-tight text-[#2b2118] sm:text-[1.45rem]">
          {title}
        </p>
        <div className="max-w-[62ch] text-sm leading-6 text-[#665446]">{description}</div>
      </div>
      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap gap-2.5 pt-2.5">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
