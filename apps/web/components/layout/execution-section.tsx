import type { ReactNode } from "react";

import { SecondarySection } from "@floorconnector/ui";

type ExecutionSectionProps = {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ExecutionSection({
  title = "Execution",
  description = "Schedule, crew, field activity, and readiness context.",
  children,
  className
}: ExecutionSectionProps) {
  return (
    <SecondarySection title={title} description={description} className={className}>
      <div className="grid gap-3 lg:grid-cols-2">{children}</div>
    </SecondarySection>
  );
}
