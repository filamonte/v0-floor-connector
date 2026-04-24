import type { TaxBehavior } from "@floorconnector/types";

type NumericLike = string | number | null | undefined;

export type SharedPricingInput = {
  baseUnitCost: NumericLike;
  baseUnitPrice: NumericLike;
  markupPercent: NumericLike;
  hiddenMarkupPercent: NumericLike;
};

export type SharedPricingBreakdown = {
  startingPrice: number;
  baseUnitCost: number;
  baseUnitPrice: number | null;
  markupPercent: number;
  hiddenMarkupPercent: number;
  unitPriceBeforeHiddenMarkup: number;
  visibleMarkupAmount: number;
  hiddenMarkupAmount: number;
  finalUnitPrice: number;
};

export function parseNumericValue(value: NumericLike) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.replace(/[$,%\s,]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parseNullableMoney(value: NumericLike) {
  if (value == null) {
    return null;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return null;
  }

  return parseNumericValue(value);
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function formatMoneyValue(value: number) {
  return roundMoney(value).toFixed(2);
}

export function formatQuantityValue(value: number) {
  return value.toFixed(4);
}

export function calculateSharedUnitPricing(
  input: SharedPricingInput
): SharedPricingBreakdown {
  const baseUnitCost = roundMoney(parseNumericValue(input.baseUnitCost));
  const baseUnitPrice = parseNullableMoney(input.baseUnitPrice);
  const markupPercent = parseNumericValue(input.markupPercent);
  const hiddenMarkupPercent = parseNumericValue(input.hiddenMarkupPercent);
  const startingPrice = roundMoney(baseUnitPrice ?? baseUnitCost);
  const unitPriceBeforeHiddenMarkup = roundMoney(
    startingPrice * (1 + markupPercent / 100)
  );
  const finalUnitPrice = roundMoney(
    unitPriceBeforeHiddenMarkup * (1 + hiddenMarkupPercent / 100)
  );
  const visibleMarkupAmount = roundMoney(unitPriceBeforeHiddenMarkup - startingPrice);
  const hiddenMarkupAmount = roundMoney(finalUnitPrice - unitPriceBeforeHiddenMarkup);

  return {
    startingPrice,
    baseUnitCost,
    baseUnitPrice: baseUnitPrice == null ? null : roundMoney(baseUnitPrice),
    markupPercent: roundMoney(markupPercent),
    hiddenMarkupPercent: roundMoney(hiddenMarkupPercent),
    unitPriceBeforeHiddenMarkup,
    visibleMarkupAmount,
    hiddenMarkupAmount,
    finalUnitPrice
  };
}

export function calculateLineTotal(quantity: NumericLike, unitPrice: NumericLike) {
  return roundMoney(parseNumericValue(quantity) * parseNumericValue(unitPrice));
}

export function calculateDiscountedTaxableSales(input: {
  subtotal: number;
  taxableSubtotal: number;
  discountAmount: number;
  taxBehavior: TaxBehavior;
  taxRate: number;
  customerTaxExempt: boolean;
}) {
  const discountedSubtotal = Math.max(0, roundMoney(input.subtotal - input.discountAmount));

  if (input.customerTaxExempt || input.taxBehavior === "none" || input.taxRate <= 0) {
    return {
      discountedSubtotal,
      taxableSales: 0,
      exemptSales: discountedSubtotal,
      taxAmount: 0,
      total: discountedSubtotal
    };
  }

  const ratio = input.subtotal > 0 ? discountedSubtotal / input.subtotal : 0;
  let taxableSales = roundMoney(input.taxableSubtotal * ratio);
  let exemptSales = roundMoney(discountedSubtotal - taxableSales);

  if (input.taxBehavior === "inclusive") {
    const taxAmount = roundMoney(taxableSales - taxableSales / (1 + input.taxRate));
    taxableSales = roundMoney(taxableSales - taxAmount);
    exemptSales = roundMoney(discountedSubtotal - taxableSales - taxAmount);

    return {
      discountedSubtotal,
      taxableSales,
      exemptSales,
      taxAmount,
      total: discountedSubtotal
    };
  }

  const taxAmount = roundMoney(taxableSales * input.taxRate);

  return {
    discountedSubtotal,
    taxableSales,
    exemptSales,
    taxAmount,
    total: roundMoney(discountedSubtotal + taxAmount)
  };
}
