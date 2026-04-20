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
      <div className="space-y-2 border-b border-[#e5ebf2] pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f7d92]">
          {eyebrow}
        </p>
        <h3 className="text-xl font-semibold text-[#17243b]">{title}</h3>
        <p className="text-[14px] leading-6 text-slate-600">{description}</p>
      </div>

      {children}

      {footer ? (
        <div className="rounded-[4px] border border-[#e5ebf2] bg-[#fbfcfe] px-4 py-3 text-[13px] leading-6 text-slate-500">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
