import { z } from "zod";

const invoiceWorkflowRoles = ["standard", "deposit"] as const;
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
  name: lineItemNameField(),
  description: optionalTrimmedString(1000),
  quantity: positiveQuantityField(),
  unit: unitField(),
  unitPrice: currencyAmountField("Unit price")
});

export const invoiceInputSchema = z
  .object({
    projectId: z.string().uuid("Select a valid project."),
    estimateId: optionalUuidField("Select a valid estimate."),
    jobId: optionalUuidField("Select a valid job."),
    workflowRole: invoiceWorkflowRoleSchema,
    status: invoiceStatusSchema,
    issueDate: dateField,
    dueDate: optionalDateField,
    discountAmount: currencyAmountField("Discount"),
    lineItems: z.array(invoiceLineItemInputSchema).min(1, "Add at least one line item."),
    notes: optionalTrimmedString(4000)
  })
  .superRefine((value, ctx) => {
    const subtotal = value.lineItems.reduce(
      (sum, lineItem) => sum + Number(lineItem.quantity) * Number(lineItem.unitPrice),
      0
    );
    const total = subtotal - Number(value.discountAmount);

    if (total < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount cannot reduce the invoice below zero.",
        path: ["discountAmount"]
      });
    }

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
