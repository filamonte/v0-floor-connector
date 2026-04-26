import {
  CostItemsWorkspacePage,
  type CostItemsWorkspaceView
} from "@/components/cost-items-database/workspace-page";
import { getCostItemsManagerData } from "@/lib/cost-items-database/module-data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    view?: string;
  }>;
};

const allowedViews = [
  "all",
  "materials",
  "labor",
  "equipment",
  "subcontractor",
  "other",
  "systems",
  "groups"
] as const;

function isAllowedView(value: string): value is (typeof allowedViews)[number] {
  return allowedViews.includes(value as (typeof allowedViews)[number]);
}

export default async function CostItemsItemsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getCostItemsManagerData("/cost-items-database/items");
  const requestedView = resolvedSearchParams.view;
  const view: CostItemsWorkspaceView =
    requestedView && isAllowedView(requestedView) ? requestedView : "all";

  return (
    <CostItemsWorkspacePage
      data={data}
      view={view}
      flash={{
        error: resolvedSearchParams.error,
        message: resolvedSearchParams.message
      }}
    />
  );
}
