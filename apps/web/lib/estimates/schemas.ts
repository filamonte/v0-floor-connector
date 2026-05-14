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

function optionalUuidField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || z.string().uuid().safeParse(value).success, {
      message
    })
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
  quantity: positiveQuantityField(),
  unitPriceOverride: currencyAmountField("Unit price override").nullable().optional(),
  taxableOverride: z.boolean().optional(),
  assignedTo: optionalTrimmedString(120),
  groupName: optionalTrimmedString(120)
}).superRefine((value, ctx) => {
  if (!value.catalogItemId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Estimate rows must reference a catalog item.",
      path: ["catalogItemId"]
    });
  }

  if (value.sourceType === "catalog_item") {
    if (value.sourceSystemId || value.sourceComponentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Catalog-item rows cannot include system lineage.",
        path: ["sourceType"]
      });
    }

    return;
  }

  if (!value.sourceSystemId || !value.sourceComponentId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "System component rows must include system lineage.",
      path: ["sourceComponentId"]
    });
  }
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
  projectName: z
    .string()
    .trim()
    .max(160, "Project name must be 160 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
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

  if (!value.opportunityId && value.customerId && !value.projectId && !value.projectName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select an existing project or enter a new project name for this customer.",
      path: ["projectName"]
    });
  }
});

export const estimateLineItemImportInputSchema = z.object({
  destinationEstimateId: z
    .string()
    .trim()
    .uuid("Select a valid destination estimate."),
  sourceEstimateId: z
    .string()
    .trim()
    .min(1, "Select an estimate to import from.")
    .uuid("Select a valid source estimate.")
});

export const estimateReusableContentImportSectionSchema = z.enum([
  "scope",
  "terms",
  "inclusions",
  "exclusions"
] as const);

export const estimateReusableContentImportInputSchema = z.object({
  destinationEstimateId: z
    .string()
    .trim()
    .uuid("Select a valid destination estimate."),
  sourceEstimateId: z
    .string()
    .trim()
    .min(1, "Select an estimate to import from.")
    .uuid("Select a valid source estimate."),
  section: estimateReusableContentImportSectionSchema
});

export const estimateSendToCustomerInputSchema = z.object({
  estimateId: z.string().uuid("Estimate id is required."),
  portalUserId: optionalUuidField("Select a valid contact recipient.")
});

export const estimatePortalDecisionInputSchema = z.object({
  estimateId: z.string().uuid("Estimate id is required."),
  decisionNote: optionalTrimmedString(1000)
});

export const estimatePortalCommentInputSchema = z.object({
  estimateId: z.string().uuid("Estimate id is required."),
  comment: z.string().trim().min(1, "Enter a note for the contractor.").max(1000)
});

const estimateInsertPayloadGuardKeys = [
  "lineItems",
  "rows",
  "componentRows",
  "unitPrice",
  "unit_price",
  "markup",
  "markupPercent",
  "markup_percent",
  "baseUnitPrice",
  "base_unit_price",
  "baseUnitCost",
  "base_unit_cost",
  "costOverride",
  "cost_override"
] as const;

function rejectClientOwnedEstimateInsertPayload(
  value: Record<string, unknown>,
  ctx: z.RefinementCtx
) {
  const forbiddenKey = estimateInsertPayloadGuardKeys.find((key) => key in value);

  if (forbiddenKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Estimate insert actions only accept canonical source identifiers. Client pricing, overrides, and row arrays are not allowed.",
      path: [forbiddenKey]
    });
  }
}

export const estimateCatalogInsertInputSchema = z
  .object({
    estimateId: z.string().uuid("Estimate id is required."),
    catalogItemId: z.string().uuid("Select a valid catalog item."),
    groupName: optionalTrimmedString(120)
  })
  .strict()
  .superRefine(rejectClientOwnedEstimateInsertPayload);

export const estimateSystemInsertInputSchema = z
  .object({
    estimateId: z.string().uuid("Estimate id is required."),
    systemCatalogItemId: z.string().uuid("Select a valid system."),
    inputMode: z.enum(["dimensions", "direct"] as const).default("direct"),
    length: positiveQuantityField().nullable().optional(),
    width: positiveQuantityField().nullable().optional(),
    squareFootage: positiveQuantityField(),
    linearFootage: currencyAmountField("Linear footage").nullable().optional(),
    count: positiveQuantityField().nullable().optional(),
    groupName: optionalTrimmedString(160)
  })
  .strict()
  .superRefine(rejectClientOwnedEstimateInsertPayload);

export type EstimateInput = z.infer<typeof estimateInputSchema>;
export type EstimateLineItemInput = z.infer<typeof estimateLineItemInputSchema>;
export type EstimateQuickCreateInput = z.infer<typeof estimateQuickCreateInputSchema>;
export type EstimateSendToCustomerInput = z.infer<
  typeof estimateSendToCustomerInputSchema
>;
export type EstimatePortalDecisionInput = z.infer<
  typeof estimatePortalDecisionInputSchema
>;
export type EstimatePortalCommentInput = z.infer<
  typeof estimatePortalCommentInputSchema
>;
export type EstimateCatalogInsertInput = z.infer<typeof estimateCatalogInsertInputSchema>;
export type EstimateSystemInsertInput = z.infer<typeof estimateSystemInsertInputSchema>;
export const estimateStatusesList = estimateStatuses;
