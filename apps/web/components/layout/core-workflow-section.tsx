import type { ReactNode } from "react";

import { PrimarySection } from "@floorconnector/ui";

type CoreWorkflowSectionProps = {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function CoreWorkflowSection({
  title = "Core workflow",
  description = "Estimate, contract, job, and invoice continuity for this record.",
  action,
  children,
  className
}: CoreWorkflowSectionProps) {
  return (
    <PrimarySection
      title={title}
      description={description}
      action={action}
      className={className}
    >
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">{children}</div>
    </PrimarySection>
  );
}
