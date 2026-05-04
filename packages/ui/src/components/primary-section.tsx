import type { ReactNode } from "react";

export type PrimarySectionProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PrimarySection({
  title,
  description,
  action,
  children,
  className
}: PrimarySectionProps) {
  return (
    <section
      className={[
        "space-y-4 rounded-lg border border-[#e2e5e9] bg-white px-4 py-4 sm:px-5",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-6 text-[#171717]">
            {title}
          </h2>
          {description ? (
            <div className="mt-1 max-w-3xl text-[13px] leading-5 text-[#4b5563]">
              {description}
            </div>
          ) : null}
        </div>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
