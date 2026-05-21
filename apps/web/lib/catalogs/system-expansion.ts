import type {
  CatalogItem,
  CatalogItemType,
  CatalogSystemComponent
} from "@floorconnector/types";

import {
  buildCatalogItemPricingSnapshot,
  calculateLineTotal,
  calculateSharedUnitPricing,
  type CommercialLineItemSnapshot,
  formatMoneyValue,
  formatQuantityValue,
  parseNumericValue
} from "@/lib/catalogs/pricing";

export type ExpandedSystemRow = {
  componentId: string;
  catalogItemId: string | null;
  sourceSystemId: string;
  itemType: CatalogItemType;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  baseUnitCost: string;
  baseUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  costCode: string | null;
  taxable: boolean;
  lineCost: string;
  linePrice: string;
};

export type ExpandedSystemPreview = {
  rows: ExpandedSystemRow[];
  totalCost: string;
  totalPrice: string;
  taxablePrice: string;
  exemptPrice: string;
  area: string;
  perimeter: string;
  count: string;
};

export type ExpandedSystemSnapshot = CommercialLineItemSnapshot & {
  sourceSystemId: string;
  sourceComponentId: string;
};

export type SystemMeasurementInput = {
  area: number;
  perimeter: number;
  count?: number;
};

export function normalizeCatalogSystemComponents(
  catalogItem: CatalogItem
): CatalogSystemComponent[] {
  const components = catalogItem.metadata.systemComponents;

  if (!Array.isArray(components)) {
    return [];
  }

  return components.filter((component): component is CatalogSystemComponent => {
    if (!component || typeof component !== "object") {
      return false;
    }

    const candidate = component as Partial<CatalogSystemComponent>;

    return (
      typeof candidate.id === "string" &&
      typeof candidate.systemCatalogItemId === "string" &&
      typeof candidate.componentCatalogItemId === "string" &&
      typeof candidate.componentName === "string" &&
      typeof candidate.unit === "string" &&
      typeof candidate.quantityPerUnit === "string" &&
      typeof candidate.basisUnit === "string"
    );
  });
}

export function buildExpandedSystemPreview(input: {
  systemCatalogItem: CatalogItem;
  catalogItems: CatalogItem[];
  squareFootage: number;
  perimeter?: number;
  count?: number;
}): ExpandedSystemPreview {
  const measurements = normalizeSystemMeasurements(input);
  const systemComponents = normalizeCatalogSystemComponents(input.systemCatalogItem);
  const catalogItemsById = new Map(input.catalogItems.map((item) => [item.id, item] as const));
  const rows: ExpandedSystemRow[] = systemComponents.map((component) => {
    const componentCatalogItem =
      catalogItemsById.get(component.componentCatalogItemId) ?? null;
    const quantityPerUnit = parseNumericValue(component.quantityPerUnit);
    const quantity = quantityPerUnit * resolveSystemComponentBasisQuantity(
      component.basisUnit,
      measurements
    );
    const baseUnitCost = componentCatalogItem?.defaultUnitCost ?? "0.00";
    const pricing = calculateSharedUnitPricing({
      baseUnitCost,
      baseUnitPrice: componentCatalogItem?.defaultUnitPrice ?? null,
      markupPercent: componentCatalogItem?.markupPercent ?? "0.00",
      hiddenMarkupPercent: componentCatalogItem?.hiddenMarkupPercent ?? "0.00"
    });
    const lineCost = calculateLineTotal(quantity, pricing.baseUnitCost);
    const linePrice = calculateLineTotal(quantity, pricing.finalUnitPrice);

    return {
      componentId: component.id,
      catalogItemId: componentCatalogItem?.id ?? component.componentCatalogItemId ?? null,
      sourceSystemId: input.systemCatalogItem.id,
      itemType:
        componentCatalogItem?.itemType ?? component.componentItemType ?? "service",
      name: component.componentName,
      description:
        component.componentDescription ??
        `Generated from ${input.systemCatalogItem.name} at ${formatQuantityValue(
          measurements.area
        )} sqft / ${formatQuantityValue(measurements.perimeter)} lf.`,
      quantity: formatQuantityValue(quantity),
      unit: component.unit,
      baseUnitCost: formatMoneyValue(pricing.baseUnitCost),
      baseUnitPrice:
        pricing.baseUnitPrice == null ? null : formatMoneyValue(pricing.baseUnitPrice),
      markupPercent: formatMoneyValue(pricing.markupPercent),
      hiddenMarkupPercent: formatMoneyValue(pricing.hiddenMarkupPercent),
      unitPriceBeforeHiddenMarkup: formatMoneyValue(pricing.unitPriceBeforeHiddenMarkup),
      visibleMarkupAmount: formatMoneyValue(pricing.visibleMarkupAmount),
      hiddenMarkupAmount: formatMoneyValue(pricing.hiddenMarkupAmount),
      unitPrice: formatMoneyValue(pricing.finalUnitPrice),
      costCode: componentCatalogItem?.costCode ?? null,
      taxable: componentCatalogItem?.taxable !== false,
      lineCost: formatMoneyValue(lineCost),
      linePrice: formatMoneyValue(linePrice)
    };
  });

  const totals = rows.reduce(
    (accumulator, row) => {
      const linePrice = parseNumericValue(row.linePrice);
      const lineCost = parseNumericValue(row.lineCost);

      accumulator.totalCost += lineCost;
      accumulator.totalPrice += linePrice;

      if (row.taxable) {
        accumulator.taxablePrice += linePrice;
      } else {
        accumulator.exemptPrice += linePrice;
      }

      return accumulator;
    },
    {
      totalCost: 0,
      totalPrice: 0,
      taxablePrice: 0,
      exemptPrice: 0
    }
  );

  return {
    rows,
    totalCost: formatMoneyValue(totals.totalCost),
    totalPrice: formatMoneyValue(totals.totalPrice),
    taxablePrice: formatMoneyValue(totals.taxablePrice),
    exemptPrice: formatMoneyValue(totals.exemptPrice),
    area: formatQuantityValue(measurements.area),
    perimeter: formatQuantityValue(measurements.perimeter),
    count: formatQuantityValue(measurements.count ?? 1)
  };
}

export function buildExpandedSystemLineItemSnapshots(input: {
  systemCatalogItem: CatalogItem;
  catalogItems: CatalogItem[];
  squareFootage: number;
  perimeter?: number;
  count?: number;
  groupName?: string | null;
  assignedTo?: string | null;
}): ExpandedSystemSnapshot[] {
  const measurements = normalizeSystemMeasurements(input);
  const systemComponents = normalizeCatalogSystemComponents(input.systemCatalogItem);
  const catalogItemsById = new Map(input.catalogItems.map((item) => [item.id, item] as const));

  return systemComponents.flatMap((component) => {
    const componentCatalogItem =
      catalogItemsById.get(component.componentCatalogItemId) ?? null;

    if (!componentCatalogItem) {
      return [];
    }

    const quantityPerUnit = parseNumericValue(component.quantityPerUnit);
    const quantity = quantityPerUnit * resolveSystemComponentBasisQuantity(
      component.basisUnit,
      measurements
    );

    return [
      {
        ...buildCatalogItemPricingSnapshot({
          catalogItem: componentCatalogItem,
          quantity,
          sourceType: "system_component",
          sourceSystemId: input.systemCatalogItem.id,
          sourceComponentId: component.id,
          groupName: input.groupName,
          assignedTo: input.assignedTo,
          name: component.componentName,
          description:
            component.componentDescription ??
            `Generated from ${input.systemCatalogItem.name} at ${formatQuantityValue(
              measurements.area
            )} sqft / ${formatQuantityValue(measurements.perimeter)} lf.`,
          unit: component.unit
        }),
        sourceSystemId: input.systemCatalogItem.id,
        sourceComponentId: component.id
      }
    ];
  });
}

function normalizeSystemMeasurements(input: {
  squareFootage: number;
  perimeter?: number;
  count?: number;
}): Required<SystemMeasurementInput> {
  return {
    area: Math.max(0, input.squareFootage),
    perimeter: Math.max(0, input.perimeter ?? 0),
    count: Math.max(1, input.count ?? 1)
  };
}

function resolveSystemComponentBasisQuantity(
  basisUnit: string,
  measurements: Required<SystemMeasurementInput>
) {
  const normalizedBasis = basisUnit.trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (["sqft", "sf", "ft2", "squarefoot", "squarefeet", "area"].includes(normalizedBasis)) {
    return measurements.area;
  }

  if (
    [
      "lf",
      "linearft",
      "linearfeet",
      "linearfoot",
      "perimeter",
      "linealft",
      "linealfeet"
    ].includes(normalizedBasis)
  ) {
    return measurements.perimeter;
  }

  if (["count", "each", "ea", "unit", "units"].includes(normalizedBasis)) {
    return measurements.count;
  }

  return 1;
}
