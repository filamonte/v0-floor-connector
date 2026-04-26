import { z } from "zod";

const invoiceWorkflowRoles = ["standard", "deposit"] as const;
const invoiceBaseSourceTypes = [
  "none",
  "estimate_snapshot",
  "sov_items",
  "change_order_snapshot_items"
] as const;
const invoiceStatuses = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "void"
] as const;

const editableInvoiceStatuses = [
  "draft",
  "sent",
  "void"
] as const;

const paymentStatuses = ["pending", "recorded", "void"] as const;
const paymentEventActorTypes = [
  "portal_user",
  "organization_user",
  "provider",
  "system"
] as const;

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

function currencyAmountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
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
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => (value == null ? null : Number(value)))
    .refine((value) => value == null || value >= 0, {
      message: `${label} cannot be negative.`
    })
    .transform((value) => (value == null ? null : value.toFixed(2)));
}

function positiveCurrencyAmountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => value > 0, {
      message: `${label} must be greater than zero.`
    })
    .transform((value) => value.toFixed(2));
}

function signedCurrencyAmountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value).toFixed(2));
}

function nonnegativeQuantityField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
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
    .refine((value) => !Number.isNaN(Number(value)), {
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

function optionalUuidField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
      message
    })
    .transform((value) => value ?? null);
}

const dateField = z
  .string()
  .trim()
  .min(1, "Issue date is required.")
  .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Issue date must be a valid date."
  });

const optionalDateField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .refine((value) => value == null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Due date must be a valid date."
  })
  .transform((value) => value ?? null);

const optionalDateTimeField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .refine((value) => value == null || !Number.isNaN(Date.parse(value)), {
    message: "Timestamp must be a valid date-time."
  })
  .transform((value) => value ?? null);

const optionalPayloadField = z
  .record(z.string(), z.unknown())
  .nullable()
  .optional()
  .transform((value) => value ?? null);

export const invoiceStatusSchema = z.enum(invoiceStatuses);
export const invoiceWorkflowRoleSchema = z.enum(invoiceWorkflowRoles);
export const editableInvoiceStatusSchema = z.enum(editableInvoiceStatuses);
export const paymentStatusSchema = z.enum(paymentStatuses);
export const paymentEventActorTypeSchema = z.enum(paymentEventActorTypes);

export const invoiceLineItemInputSchema = z.object({
  catalogItemId: optionalUuidField("Select a valid catalog item."),
  name: lineItemNameField(),
  description: optionalTrimmedString(1000),
  quantity: positiveQuantityField(),
  unit: unitField(),
  unitPrice: currencyAmountField("Unit price"),
  taxable: z.boolean().default(true),
  baseUnitCost: currencyAmountField("Base unit cost"),
  baseUnitPrice: optionalCurrencyAmountField("Base unit price"),
  markupPercent: currencyAmountField("Markup percentage"),
  hiddenMarkupPercent: currencyAmountField("Hidden markup percentage"),
  unitPriceBeforeHiddenMarkup: currencyAmountField("Pre-hidden-markup unit price"),
  visibleMarkupAmount: currencyAmountField("Visible markup amount"),
  hiddenMarkupAmount: currencyAmountField("Hidden markup amount"),
  costCode: optionalTrimmedString(120)
});

const invoiceManualCatalogItemInputSchema = z.object({
  catalogItemId: z.string().uuid("Select a valid catalog item."),
  quantity: nonnegativeQuantityField("Manual item quantity")
});

const invoiceExplicitAdjustmentInputSchema = z.object({
  name: lineItemNameField(),
  description: optionalTrimmedString(1000),
  amount: signedCurrencyAmountField("Adjustment amount")
});

export const invoiceSourceConfigurationSchema = z
  .object({
    baseSourceType: z.enum(invoiceBaseSourceTypes),
    selectedSovItemIds: z
      .array(z.string().uuid("Select a valid schedule-of-values item."))
      .default([]),
    selectedChangeOrderSnapshotItemIds: z
      .array(z.string().uuid("Select a valid change-order snapshot item."))
      .default([]),
    manualCatalogItems: z.array(invoiceManualCatalogItemInputSchema).default([]),
    explicitAdjustments: z.array(invoiceExplicitAdjustmentInputSchema).default([])
  })
  .superRefine((value, ctx) => {
    if (value.baseSourceType === "sov_items" && value.selectedSovItemIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one SOV item.",
        path: ["selectedSovItemIds"]
      });
    }

    if (
      value.baseSourceType === "change_order_snapshot_items" &&
      value.selectedChangeOrderSnapshotItemIds.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one approved change-order item.",
        path: ["selectedChangeOrderSnapshotItemIds"]
      });
    }
  });

export const invoiceInputSchema = z
  .object({
    projectId: z.string().uuid("Select a valid project."),
    estimateId: optionalUuidField("Select a valid approved estimate."),
    jobId: optionalUuidField("Select a valid job."),
    workflowRole: invoiceWorkflowRoleSchema,
    status: invoiceStatusSchema,
    issueDate: dateField,
    dueDate: optionalDateField,
    discountAmount: currencyAmountField("Discount"),
    notes: optionalTrimmedString(4000),
    sourceConfiguration: invoiceSourceConfigurationSchema
      .nullable()
      .optional()
      .transform((value) => value ?? null)
  })
  .superRefine((value, ctx) => {
    if (value.dueDate && value.dueDate < value.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be before issue date.",
        path: ["dueDate"]
      });
    }

    if (value.workflowRole === "deposit" && value.jobId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Deposit invoices should stay tied to project and estimate context, not a job.",
        path: ["jobId"]
      });
    }

    if (
      value.sourceConfiguration?.baseSourceType === "estimate_snapshot" &&
      !value.estimateId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an approved estimate before building a full snapshot invoice.",
        path: ["estimateId"]
      });
    }
  });

export const invoiceQuickCreateInputSchema = z
  .object({
    projectId: z.string().uuid("Select a valid project."),
    estimateId: optionalUuidField("Select a valid approved estimate."),
    jobId: optionalUuidField("Select a valid job."),
    workflowRole: invoiceWorkflowRoleSchema
  })
  .superRefine((value, ctx) => {
    if (value.workflowRole === "deposit" && value.jobId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Deposit invoices should stay tied to project and estimate context, not a job.",
        path: ["jobId"]
      });
    }
  });

export const invoicePaymentInputSchema = z.object({
  invoiceId: z.string().uuid("Invoice id is required."),
  amount: positiveCurrencyAmountField("Payment amount"),
  paymentDate: dateField,
  paymentMethod: z.string().trim().min(1, "Payment method is required.").max(80),
  reference: optionalTrimmedString(160),
  notes: optionalTrimmedString(1000)
});

const paymentActorContextShape = {
  actorType: paymentEventActorTypeSchema,
  actorUserId: optionalUuidField("Select a valid acting organization user."),
  portalUserId: optionalUuidField("Select a valid acting portal user.")
} as const;

function withPaymentActorContextValidation<
  T extends z.ZodRawShape
>(schema: z.ZodObject<T>) {
  return schema.superRefine((value, ctx) => {
    if (value.actorType === "portal_user" && !value.portalUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Portal payment actions require a portal user id.",
        path: ["portalUserId"]
      });
    }

    if (value.actorType === "organization_user" && !value.actorUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization payment actions require an acting user id.",
        path: ["actorUserId"]
      });
    }
  });
}

export const invoiceCustomerPaymentRequestInputSchema = withPaymentActorContextValidation(
  z.object({
    ...paymentActorContextShape,
  invoiceId: z.string().uuid("Invoice id is required."),
  amount: positiveCurrencyAmountField("Requested payment amount"),
  payerEmail: optionalTrimmedString(320),
  notes: optionalTrimmedString(1000),
  occurredAt: optionalDateTimeField,
  payload: optionalPayloadField
  })
);

export const invoiceCheckoutStartInputSchema = withPaymentActorContextValidation(
  z.object({
    ...paymentActorContextShape,
  paymentId: z.string().uuid("Payment id is required."),
  invoiceId: z.string().uuid("Invoice id is required."),
  amount: positiveCurrencyAmountField("Checkout amount"),
  gatewayProvider: z.string().trim().min(1, "Gateway provider is required.").max(80),
  gatewayCheckoutSessionReference: z
    .string()
    .trim()
    .min(1, "Checkout session reference is required.")
    .max(160),
  gatewayPaymentIntentReference: optionalTrimmedString(160),
  gatewayStatus: optionalTrimmedString(80),
  payerEmail: optionalTrimmedString(320),
  occurredAt: optionalDateTimeField,
  payload: optionalPayloadField
  })
);

export const invoicePaymentSuccessInputSchema = withPaymentActorContextValidation(
  z.object({
    ...paymentActorContextShape,
  organizationId: z.string().uuid("Organization id is required."),
  invoiceId: z.string().uuid("Invoice id is required."),
  amount: positiveCurrencyAmountField("Payment amount"),
  paymentDate: optionalDateField,
  paymentMethod: z.string().trim().min(1, "Payment method is required.").max(80),
  gatewayProvider: z.string().trim().min(1, "Gateway provider is required.").max(80),
  gatewayPaymentIntentReference: optionalTrimmedString(160),
  gatewayCheckoutSessionReference: optionalTrimmedString(160),
  gatewayStatus: optionalTrimmedString(80),
  paymentMethodSummary: optionalTrimmedString(160),
  payerEmail: optionalTrimmedString(320),
  reference: optionalTrimmedString(160),
  notes: optionalTrimmedString(1000),
  providerEventId: optionalTrimmedString(160),
  occurredAt: optionalDateTimeField,
  payload: optionalPayloadField
  })
);

export const invoicePaymentFailureInputSchema = withPaymentActorContextValidation(
  z.object({
    ...paymentActorContextShape,
  organizationId: z.string().uuid("Organization id is required."),
  invoiceId: z.string().uuid("Invoice id is required."),
  amount: positiveCurrencyAmountField("Payment amount"),
  gatewayProvider: z.string().trim().min(1, "Gateway provider is required.").max(80),
  gatewayPaymentIntentReference: optionalTrimmedString(160),
  gatewayCheckoutSessionReference: optionalTrimmedString(160),
  gatewayStatus: optionalTrimmedString(80),
  payerEmail: optionalTrimmedString(320),
  notes: optionalTrimmedString(1000),
  providerEventId: optionalTrimmedString(160),
  occurredAt: optionalDateTimeField,
  payload: optionalPayloadField
  })
);

export const invoicePaymentVoidInputSchema = withPaymentActorContextValidation(
  z.object({
    ...paymentActorContextShape,
  invoiceId: z.string().uuid("Invoice id is required."),
  paymentId: z.string().uuid("Payment id is required."),
  notes: optionalTrimmedString(1000),
  providerEventId: optionalTrimmedString(160),
  occurredAt: optionalDateTimeField,
  payload: optionalPayloadField
  })
);

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemInputSchema>;
export type InvoiceSourceConfiguration = z.infer<
  typeof invoiceSourceConfigurationSchema
>;
export type InvoiceQuickCreateInput = z.infer<typeof invoiceQuickCreateInputSchema>;
export type InvoicePaymentInput = z.infer<typeof invoicePaymentInputSchema>;
export type InvoiceCustomerPaymentRequestInput = z.infer<
  typeof invoiceCustomerPaymentRequestInputSchema
>;
export type InvoiceCheckoutStartInput = z.infer<typeof invoiceCheckoutStartInputSchema>;
export type InvoicePaymentSuccessInput = z.infer<typeof invoicePaymentSuccessInputSchema>;
export type InvoicePaymentFailureInput = z.infer<typeof invoicePaymentFailureInputSchema>;
export type InvoicePaymentVoidInput = z.infer<typeof invoicePaymentVoidInputSchema>;
export const invoiceStatusesList = invoiceStatuses;
export const editableInvoiceStatusesList = editableInvoiceStatuses;
export const paymentStatusesList = paymentStatuses;
export const invoiceWorkflowRolesList = invoiceWorkflowRoles;
export const invoiceBaseSourceTypesList = invoiceBaseSourceTypes;
