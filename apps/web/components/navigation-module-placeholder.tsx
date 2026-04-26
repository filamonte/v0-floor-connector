import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import {
  getNavigationItemByHref,
  getNavigationSectionByPathname
} from "@/lib/navigation/navigation-config";

type NavigationModulePlaceholderProps = {
  href: string;
};

export function NavigationModulePlaceholder({
  href
}: NavigationModulePlaceholderProps) {
  const item = getNavigationItemByHref(href);
  const section = getNavigationSectionByPathname(href);

  if (!item) {
    return null;
  }

  return (
    <ContractorWorkspacePage
      eyebrow="Contractor Module"
      title={item.label}
      description={item.description}
      summary={
        <div className="rounded-[1rem] border border-[#e2d4c5] bg-white/80 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                {section?.label ?? "Contractor module"}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#2b2118]">
                {item.status === "live" ? "Module connected" : "Foundation shell active"}
              </p>
            </div>
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                item.status === "live"
                  ? "bg-[#edf7ef] text-[#2f6a3e]"
                  : "bg-[#f3ebe4] text-[#8f5b32]"
              ].join(" ")}
            >
              {item.status === "live" ? "Live route" : "Coming soon"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#665446]">
            This module keeps the shared contractor shell, canonical route, and grouped
            navigation context in place while the workflow itself is still being built out.
          </p>
        </div>
      }
    >
      <AppEmptyState
        eyebrow={section ? `${section.label} module` : "Contractor module"}
        title={`${item.label} is using the shared module shell`}
        description="The route is intentionally visible in navigation now so teams can move through the contractor workspace using canonical module routes, even where the deeper workflow is still in foundation status."
        actionHref="/dashboard"
        actionLabel="Back to dashboard"
      />
    </ContractorWorkspacePage>
  );
}
