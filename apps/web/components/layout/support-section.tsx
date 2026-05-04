import type { ReactNode } from "react";

import { SecondarySection } from "@floorconnector/ui";

type SupportSectionProps = {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SupportSection({
  title = "Support",
  description = "Notes, files, activity, and secondary record context.",
  children,
  className
}: SupportSectionProps) {
  return (
    <SecondarySection title={title} description={description} className={className}>
      <div className="grid gap-3 lg:grid-cols-2">{children}</div>
    </SecondarySection>
  );
}
