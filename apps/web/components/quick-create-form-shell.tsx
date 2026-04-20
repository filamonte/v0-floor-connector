import type { ReactNode } from "react";

type QuickCreateFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
};

function DefaultIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-orange-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function QuickCreateFormShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  icon
}: QuickCreateFormShellProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-3 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-50">
            {icon ?? <DefaultIcon />}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {eyebrow}
            </p>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          </div>
        </div>
        <p className="text-[14px] leading-6 text-neutral-600">{description}</p>
      </div>

      {children}

      {footer ? (
        <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13px] leading-6 text-neutral-500">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
