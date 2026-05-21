import Link from "next/link";

import { getPerspectiveLabel, type PerspectiveView } from "@/lib/perspectives/types";

type PerspectiveSwitcherProps = {
  value: PerspectiveView;
  hrefForView: (view: PerspectiveView) => string;
};

const views: PerspectiveView[] = ["my", "company"];

export function PerspectiveSwitcher({ value, hrefForView }: PerspectiveSwitcherProps) {
  return (
    <div className="inline-flex rounded-[4px] border border-[var(--border-warm)] bg-white p-0.5">
      {views.map((view) => {
        const isActive = value === view;

        return (
          <Link
            key={view}
            href={hrefForView(view)}
            className={[
              "inline-flex items-center rounded-[3px] px-3 py-1.5 text-sm font-medium transition",
              isActive
                ? "bg-[var(--graphite)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
            ].join(" ")}
          >
            {getPerspectiveLabel(view)}
          </Link>
        );
      })}
    </div>
  );
}
