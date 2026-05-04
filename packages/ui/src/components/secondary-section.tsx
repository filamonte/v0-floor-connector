import type { ReactNode } from "react";

export type SecondarySectionProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SecondarySection({
  title,
  description,
  children,
  className
}: SecondarySectionProps) {
  return (
    <section
      className={[
        "space-y-4 rounded-lg border border-[#e2e5e9] bg-white px-4 py-4 sm:px-5",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
      {children}
    </section>
  );
}
