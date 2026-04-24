import { z } from "zod";

const estimateStatuses = ["draft", "sent", "approved", "rejected"] as const;

function normalizeNumericInput(value: string) {
  return value.replace(/[$,\s]/g, "");
}

function optionalTrimmedString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

function optionalUuidishString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

function currencyAmountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .transform((value) => normalizeNumericInput(value))
    .refine((value) => value.length > 0 && !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0, {
      message: `${label} cannot be negative.`
    })
    .transform((value) => value.toFixed(2));
}

function positiveQuantityField() {
  return z
    .string()
    .trim()
    .min(1, "Quantity is required.")
    .transform((value) => normalizeNumericInput(value))
    .refine((value) => value.length > 0 && !Number.isNaN(Number(value)), {
      message: "Quantity must be a valid number."
    })
    .transform((value) => Number(value))
    .refine((value) => value > 0, {
      message: "Quantity must be greater than zero."
    })
    .transform((value) => value.toFixed(2));
}

function lineItemNameField() {
  return z.string().trim().min(1, "Line item name is required.").max(160);
}

function unitField() {
  return z.string().trim().min(1, "Unit is required.").max(40);
}

function percentageField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .transform((value) => normalizeNumericInput(value))
    .refine((value) => value.length > 0 && !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0, {
      message: `${label} cannot be negative.`
    })
    .transform((value) => value.toFixed(2));
}

function optionalCurrencyAmountField(label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? normalizeNumericInput(value) : ""))
    .refine((value) => value.length === 0 || !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => (value.length === 0 ? null : Number(value)))
    .refine((value) => value === null || value >= 0, {
      message: `${label} cannot be negative.`
    })
    .transform((value) => (value == null ? null : value.toFixed(2)));
}

function optionalDateField(label: string) {
  return z
    .string()
    .trim()
    .max(40)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) =>
        value == null ||
        /^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isNaN(Date.parse(value)),
      {
        message: `${label} must be a valid date.`
      }
    )
    .transform((value) => {
      if (!value) {
        return null;
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }

      return new Date(value).toISOString().slice(0, 10);
    });
}

export const estimateStatusSchema = z.enum(estimateStatuses);

export const estimateScopeItemInputSchema = z.object({
  id: z.string().trim().min(1).max(120),
  text: z.string().trim().min(1, "Scope of work text is required.").max(2000),
  includeInOutput: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative()
});

export const estimateWorkspaceContentInputSchema = z.object({
  termsHtml: optionalTrimmedString(50000),
  inclusionsHtml: optionalTrimmedString(50000),
  exclusionsHtml: optionalTrimmedString(50000),
  notesHtml: optionalTrimmedString(50000),
  scopeSummaryHtml: optionalTrimmedString(50000),
  scopeItems: z.array(estimateScopeItemInputSchema).default([]),
  itemGroups: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(120),
        label: z.string().trim().min(1, "Group label is required.").max(160),
        sortOrder: z.number().int().nonnegative()
      })
    )
    .default([]),
  itemRows: z
    .array(
      z.object({
        rowKey: z.string().trim().min(1).max(120),
        groupId: optionalTrimmedString(120),
        baseUnitPrice: currencyAmountField("Legacy base unit price"),
        markupPercent: percentageField("Legacy markup"),
        taxCode: z.enum(["taxable", "non-taxable"] as const).default("taxable"),
        assignedTo: optionalTrimmedString(120)
      })
    )
    .default([])
});

export const estimateLineItemInputSchema = z.object({
  rowKey: z.string().trim().min(1, "Line item row key is required.").max(120),
  catalogItemId: optionalUuidishString(120),
  sourceType: z.enum(["catalog_item", "system_component"] as const),
  sourceSystemId: optionalUuidishString(120),
  sourceComponentId: optionalUuidishString(120),
  itemType: z.enum(
    [
      "material",
      "labor",
      "service",
      "equipment",
      "subcontractor",
      "other",
      "system"
    ] as const
  ),
  name: lineItemNameField(),
  description: optionalTrimmedString(1000),
  quantity: positiveQuantityField(),
  unit: unitField(),
  unitPrice: currencyAmountField("Unit price"),
  baseUnitCost: currencyAmountField("Base unit cost"),
  baseUnitPrice: optionalCurrencyAmountField("Base unit price"),
  markupPercent: percentageField("Markup"),
  hiddenMarkupPercent: percentageField("Hidden markup"),
  unitPriceBeforeHiddenMarkup: currencyAmountField("Pre-hidden-markup unit price"),
  visibleMarkupAmount: currencyAmountField("Visible markup amount"),
  hiddenMarkupAmount: currencyAmountField("Hidden markup amount"),
  taxCode: z.enum(["taxable", "non-taxable"] as const).default("taxable"),
  assignedTo: optionalTrimmedString(120),
  groupName: optionalTrimmedString(120)
});

export const estimateInputSchema = z.object({
  opportunityId: z.string().uuid("Estimate continuity requires a valid opportunity."),
  projectId: z.string().uuid("Select a valid project."),
  title: optionalTrimmedString(160),
  status: estimateStatusSchema,
  estimateDate: optionalDateField("Estimate date"),
  expirationDate: optionalDateField("Expiration date"),
  projectType: optionalTrimmedString(120),
  sector: optionalTrimmedString(120),
  discountAmount: currencyAmountField("Discount"),
  lineItems: z.array(estimateLineItemInputSchema),
  notes: optionalTrimmedString(4000),
  content: estimateWorkspaceContentInputSchema
}).superRefine((value, ctx) => {
  const subtotal = value.lineItems.reduce(
    (sum, lineItem) => sum + Number(lineItem.quantity) * Number(lineItem.unitPrice),
    0
  );
  const total = subtotal - Number(value.discountAmount);

  if (total < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Discount cannot reduce the estimate below zero.",
      path: ["discountAmount"]
    });
  }

  if (
    value.estimateDate &&
    value.expirationDate &&
    value.expirationDate < value.estimateDate
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expiration date cannot be before the estimate date.",
      path: ["expirationDate"]
    });
  }

});

export const estimateQuickCreateInputSchema = z.object({
  creationMode: z.enum(["opportunity", "customer", "standalone"] as const),
  opportunityId: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
      message: "Select a valid opportunity."
    })
    .transform((value) => value ?? null),
  customerId: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
      message: "Select a valid customer."
    })
    .transform((value) => value ?? null),
  projectId: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
      message: "Select a valid site or job."
    })
    .transform((value) => value ?? null),
  title: z.string().trim().min(1, "Estimate title is required.").max(160)
}).superRefine((value, ctx) => {
  if (value.creationMode === "opportunity" && !value.opportunityId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select an opportunity to start the estimate.",
      path: ["opportunityId"]
    });
  }

  if ((value.creationMode === "customer" || value.creationMode === "standalone") && !value.opportunityId) {
    if (!value.customerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a customer before creating the estimate.",
        path: ["customerId"]
      });
    }
  }
});

export type EstimateInput = z.infer<typeof estimateInputSchema>;
export type EstimateLineItemInput = z.infer<typeof estimateLineItemInputSchema>;
export type EstimateQuickCreateInput = z.infer<typeof estimateQuickCreateInputSchema>;
export const estimateStatusesList = estimateStatuses;
