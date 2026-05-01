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
    <div className="space-y-4">
      <div className="space-y-1.5 border-b border-[#e2dcd5] pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#ef7d32]">
          {eyebrow}
        </p>
        <h3 className="text-[16px] font-semibold text-[#221a14]">{title}</h3>
        <p className="text-[13px] leading-5 text-[#5f564d]">{description}</p>
      </div>

      {children}

      {footer ? (
        <div className="border border-[#e2dcd5] bg-[#f8f6f4] px-4 py-3 text-[12px] leading-5 text-[#5f564d]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
