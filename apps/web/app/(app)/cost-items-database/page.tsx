import { CostItemsWorkspacePage } from "@/components/cost-items-database/workspace-page";
import { getCostItemsManagerData } from "@/lib/cost-items-database/module-data";

export default async function CostItemsDatabasePage() {
  const data = await getCostItemsManagerData("/cost-items-database");
  return <CostItemsWorkspacePage data={data} view="dashboard" />;
}
