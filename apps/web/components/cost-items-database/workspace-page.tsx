import Link from "next/link";

import { InventoryManager } from "@/components/catalog-manager/inventory-manager";
import { CostItemsDashboardContent } from "@/components/cost-items-database/dashboard-content";
import { RowsPerViewControl } from "@/components/rows-per-view-control";
import { WorkspaceCommandBar } from "@/components/workspace-command-bar";
import { StandardWorkspaceLayout } from "@/components/workspace/standard-workspace-layout";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { upsertEstimateContentBlockAction } from "@/lib/estimate-content-blocks/actions";
import { getCostItemsManagerData } from "@/lib/cost-items-database/module-data";
import {
  deleteOrganizationCatalogItemFileAction,
  updateOrganizationCatalogItemAction,
  updateOrganizationCatalogSystemComponentsAction
} from "@/lib/settings/actions";

export type CostItemsWorkspaceView =
  | "dashboard"
  | "all"
  | "materials"
  | "labor"
  | "equipment"
  | "subcontractor"
  | "other"
  | "systems"
  | "groups";

type CostItemsWorkspacePageProps = {
  data: Awaited<ReturnType<typeof getCostItemsManagerData>>;
  view: CostItemsWorkspaceView;
  flash?: {
    error?: string;
    message?: string;
  };
};

const COST_ITEMS_ROWS_PER_VIEW_STORAGE_KEY = "fc.grid.rows.cost-items";

const workspaceViews: Array<{
  id: CostItemsWorkspaceView;
  label: string;
  iconName:
    | "home"
    | "package"
    | "briefcase"
    | "wrench"
    | "hard-hat"
    | "clipboard-list"
    | "layers-3"
    | "folder-kanban"
    | "receipt-text";
}> = [
  { id: "dashboard", label: "Dashboard", iconName: "home" },
  { id: "all", label: "All items", iconName: "receipt-text" },
  { id: "materials", label: "Materials", iconName: "package" },
  { id: "labor", label: "Labor", iconName: "briefcase" },
  { id: "equipment", label: "Equipment", iconName: "wrench" },
  { id: "subcontractor", label: "Subcontractor", iconName: "hard-hat" },
  { id: "other", label: "Other", iconName: "clipboard-list" },
  { id: "systems", label: "Systems and packages", iconName: "layers-3" },
  { id: "groups", label: "Item groups", iconName: "folder-kanban" }
];

function getWorkspaceHref(view: CostItemsWorkspaceView) {
  if (view === "dashboard") {
    return "/cost-items-database";
  }

  if (view === "all") {
    return "/cost-items-database/items";
  }

  return `/cost-items-database/items?view=${view}`;
}

export function CostItemsWorkspacePage({
  data,
  view,
  flash
}: CostItemsWorkspacePageProps) {
  const activeItems = data.items.filter((item) => item.status === "active");
  const trackedInventory = data.inventoryItems.filter(
    (item) => item.status === "active" && item.catalogItemId
  );
  const lowStockItems = trackedInventory.filter(
    (item) => Number(item.currentQuantity) <= Number(item.reorderPoint)
  );
  const missingCostItems = activeItems.filter(
    (item) => Number(item.defaultUnitCost) <= 0
  );
  const missingPriceItems = activeItems.filter(
    (item) =>
      item.defaultUnitPrice == null || Number(item.defaultUnitPrice) <= 0
  );

  return (
    <StandardWorkspaceLayout
      header={{
        eyebrow: "Financials module",
        title: "Cost Library",
        description:
          "Manage reusable cost items, systems, and optional inventory from one shared Financials workspace.",
        actions: (
          <div className="border border-[#d7c7b4] bg-[#fbf7f1] px-3 py-2 text-sm leading-5 text-[#665446]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
              Workspace status
            </p>
            <p className="mt-1">
              {activeItems.length} active items,{" "}
              {data.inventoryEnabled ? trackedInventory.length : 0} tracked
              inventory rows, {data.inventoryEnabled ? lowStockItems.length : 0}{" "}
              low-stock records, {missingCostItems.length} missing cost values,
              and {missingPriceItems.length} missing price values.
            </p>
          </div>
        )
      }}
      sidebar={workspaceViews.map((workspaceView) => ({
        ...workspaceView,
        href: getWorkspaceHref(workspaceView.id)
      }))}
      currentView={view}
      summaryBand={
        <WorkspaceSummaryBand
          items={[
            {
              key: "purpose",
              label: "Purpose",
              content:
                view === "dashboard"
                  ? "Use the dashboard state to review summary counts, jump into daily cost-item work, and move between categories without leaving the shared Cost Items workspace."
                  : "Use the shared workspace grid to filter catalog rows, open the item drawer, edit reusable pricing inputs, and move across category views without changing the surrounding layout."
            }
          ]}
        />
      }
      commandBar={
        <WorkspaceCommandBar
          supportSlot="Cost Library stays one operational workspace. Configuration defaults remain under Cost Items & Inventory Settings."
          actionSlot={
            <>
              {view !== "dashboard" ? (
                <RowsPerViewControl
                  storageKey={COST_ITEMS_ROWS_PER_VIEW_STORAGE_KEY}
                />
              ) : null}
              <Link
                href="/cost-items-database"
                className="inline-flex h-8 items-center border border-[#d6d6d6] bg-white px-3 text-sm font-medium text-[#4f4f4f] transition hover:bg-[#f8f8f8]"
              >
                Open dashboard
              </Link>
              <Link
                href="/cost-items-database/items"
                className="inline-flex h-8 items-center border border-[#d8731f] bg-[#d8731f] px-3 text-sm font-medium text-white transition hover:bg-[#bf6519]"
              >
                Open item grid
              </Link>
              <Link
                href="/settings/catalogs"
                className="inline-flex h-8 items-center border border-[#d6d6d6] bg-white px-3 text-sm font-medium text-[#4f4f4f] transition hover:bg-[#f8f8f8]"
              >
                Open settings
              </Link>
            </>
          }
        />
      }
    >
      {flash?.error ? (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {flash.error}
        </div>
      ) : null}

      {flash?.message ? (
        <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {flash.message}
        </div>
      ) : null}

      {view === "dashboard" ? (
        <div className="space-y-3 p-3">
          <CostItemsDashboardContent
            items={data.items}
            inventoryItems={data.inventoryItems}
            inventoryEnabled={data.inventoryEnabled}
          />
          <InventoryManager
            returnTo={getWorkspaceHref(view)}
            inventoryEnabled={data.inventoryEnabled}
            items={data.items}
            taxCodes={data.taxCodes}
            inventoryItems={data.inventoryItems}
            inventoryTransactions={data.inventoryTransactions}
            catalogItemFilesById={data.catalogItemFilesById}
            vendors={data.vendors}
            contentBlocks={data.contentBlocks}
            saveItemAction={updateOrganizationCatalogItemAction}
            saveSystemComponentsAction={
              updateOrganizationCatalogSystemComponentsAction
            }
            saveContentBlockAction={upsertEstimateContentBlockAction}
            deleteCatalogItemFileAction={
              deleteOrganizationCatalogItemFileAction
            }
            initialSidebarView="all"
            lockedSidebarView="all"
          />
        </div>
      ) : (
        <InventoryManager
          returnTo={getWorkspaceHref(view)}
          inventoryEnabled={data.inventoryEnabled}
          items={data.items}
          taxCodes={data.taxCodes}
          inventoryItems={data.inventoryItems}
          inventoryTransactions={data.inventoryTransactions}
          catalogItemFilesById={data.catalogItemFilesById}
          vendors={data.vendors}
          contentBlocks={data.contentBlocks}
          saveItemAction={updateOrganizationCatalogItemAction}
          saveSystemComponentsAction={
            updateOrganizationCatalogSystemComponentsAction
          }
          saveContentBlockAction={upsertEstimateContentBlockAction}
          deleteCatalogItemFileAction={deleteOrganizationCatalogItemFileAction}
          initialSidebarView={view}
          lockedSidebarView={view}
        />
      )}
    </StandardWorkspaceLayout>
  );
}
