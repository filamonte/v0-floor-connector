import Link from "next/link";

import type { CatalogItem, InventoryItem } from "@floorconnector/types";

type DashboardContentProps = {
  items: CatalogItem[];
  inventoryItems: InventoryItem[];
  inventoryEnabled: boolean;
};

function summaryValue(items: CatalogItem[], itemTypes: CatalogItem["itemType"][]) {
  return items.filter(
    (item) => item.status === "active" && itemTypes.includes(item.itemType)
  ).length;
}

export function CostItemsDashboardContent({
  items,
  inventoryItems,
  inventoryEnabled
}: DashboardContentProps) {
  const activeItems = items.filter((item) => item.status === "active");
  const trackedInventoryItems = inventoryItems.filter(
    (item) => item.status === "active" && item.catalogItemId
  );
  const lowStockItems = trackedInventoryItems.filter(
    (item) => Number(item.currentQuantity) <= Number(item.reorderPoint)
  );
  const missingCostItems = activeItems.filter((item) => Number(item.defaultUnitCost) <= 0);
  const missingPriceItems = activeItems.filter((item) => {
    return item.defaultUnitPrice == null || Number(item.defaultUnitPrice) <= 0;
  });
  const taxableItems = activeItems.filter((item) => item.taxable);
  const nonTaxableItems = activeItems.filter((item) => !item.taxable);
  const recentlyUpdatedItems = [...activeItems]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 6);

  const summaryCards = [
    { label: "Total active cost items", value: activeItems.length },
    { label: "Materials", value: summaryValue(activeItems, ["material"]) },
    { label: "Labor", value: summaryValue(activeItems, ["labor", "service"]) },
    { label: "Systems / packages", value: summaryValue(activeItems, ["system"]) },
    { label: "Inventory tracked", value: trackedInventoryItems.length },
    { label: "Low stock", value: inventoryEnabled ? lowStockItems.length : 0 }
  ];

  const quickActions = [
    { label: "Open all items", href: "/cost-items-database/items" },
    { label: "Open materials", href: "/cost-items-database/items?view=materials" },
    { label: "Open labor", href: "/cost-items-database/items?view=labor" },
    { label: "Open systems", href: "/cost-items-database/items?view=systems" },
    { label: "Open groups", href: "/cost-items-database/items?view=groups" },
    ...(inventoryEnabled
      ? [{ label: "Review low stock", href: "/cost-items-database/items?view=materials" }]
      : []),
    { label: "Review missing pricing", href: "/cost-items-database/items" }
  ];

  const workQueues = [
    ...(inventoryEnabled
      ? [
          {
            label: "Low stock",
            value: lowStockItems.length,
            href: "/cost-items-database/items?view=materials"
          }
        ]
      : []),
    {
      label: "Missing cost",
      value: missingCostItems.length,
      href: "/cost-items-database/items"
    },
    {
      label: "Missing price",
      value: missingPriceItems.length,
      href: "/cost-items-database/items"
    },
    {
      label: "Non-taxable review",
      value: nonTaxableItems.length,
      href: "/cost-items-database/items?view=all"
    },
    {
      label: "Taxable review",
      value: taxableItems.length,
      href: "/cost-items-database/items?view=all"
    },
    {
      label: "Recently updated",
      value: recentlyUpdatedItems.length,
      href: "/cost-items-database/items?view=all"
    }
  ];

  const categoryLinks = [
    {
      label: "Materials",
      count: summaryValue(activeItems, ["material"]),
      href: "/cost-items-database/items?view=materials"
    },
    {
      label: "Labor",
      count: summaryValue(activeItems, ["labor", "service"]),
      href: "/cost-items-database/items?view=labor"
    },
    {
      label: "Equipment",
      count: summaryValue(activeItems, ["equipment"]),
      href: "/cost-items-database/items?view=equipment"
    },
    {
      label: "Subcontractor",
      count: summaryValue(activeItems, ["subcontractor"]),
      href: "/cost-items-database/items?view=subcontractor"
    },
    {
      label: "Other",
      count: summaryValue(activeItems, ["other"]),
      href: "/cost-items-database/items?view=other"
    },
    {
      label: "Systems / Packages",
      count: summaryValue(activeItems, ["system"]),
      href: "/cost-items-database/items?view=systems"
    }
  ];

  return (
    <div className="space-y-3">
      <section className="grid gap-px border border-[#d6dde7] bg-[#d6dde7] md:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#75859f]">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-[#17243b]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="border border-[#dde3eb] bg-white">
          <div className="border-b border-[#e5ebf2] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Quick Actions
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 py-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex h-8 items-center border border-[#d6dde7] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border border-[#dde3eb] bg-white">
          <div className="border-b border-[#e5ebf2] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Recently Updated
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {recentlyUpdatedItems.map((item) => (
              <Link
                key={item.id}
                href={`/cost-items-database/items?view=${
                  item.itemType === "material"
                    ? "materials"
                    : item.itemType === "labor" || item.itemType === "service"
                      ? "labor"
                      : item.itemType === "equipment"
                        ? "equipment"
                        : item.itemType === "subcontractor"
                          ? "subcontractor"
                          : item.itemType === "system"
                            ? "systems"
                            : "other"
                }`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.category ?? item.itemType} - {item.unit}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
            {recentlyUpdatedItems.length === 0 ? (
              <p className="px-4 py-5 text-sm leading-6 text-slate-500">
                Recently updated cost items will appear here as work moves through the module.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="border border-[#dde3eb] bg-white">
          <div className="border-b border-[#e5ebf2] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Work Queues
            </p>
          </div>
          <div className="divide-y divide-slate-200 text-sm text-slate-700">
            {workQueues.map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center justify-between px-4 py-2.5 transition hover:bg-slate-50"
              >
                <span>{row.label}</span>
                <span className="font-semibold text-slate-900">{row.value}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border border-[#dde3eb] bg-white">
          <div className="border-b border-[#e5ebf2] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Category Entry Points
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {categoryLinks.map((entry) => (
              <Link
                key={entry.label}
                href={entry.href}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span>{entry.label}</span>
                <span className="font-semibold text-slate-900">{entry.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
