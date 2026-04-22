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
      <div className="space-y-2 border-b border-[#eadfce] pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
          {eyebrow}
        </p>
        <h3 className="text-xl font-semibold text-[#2b2118]">{title}</h3>
        <p className="text-[14px] leading-6 text-[#665446]">{description}</p>
      </div>

      {children}

      {footer ? (
        <div className="rounded-[1rem] border border-[#eadfce] bg-[#fbf5ee] px-4 py-3 text-[13px] leading-6 text-[#786454]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
