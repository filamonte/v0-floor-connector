import { z } from "zod";

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

const paymentStatuses = ["recorded", "void"] as const;

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

export const invoiceStatusSchema = z.enum(invoiceStatuses);
export const editableInvoiceStatusSchema = z.enum(editableInvoiceStatuses);
export const paymentStatusSchema = z.enum(paymentStatuses);

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
  });

export const invoicePaymentInputSchema = z.object({
  invoiceId: z.string().uuid("Invoice id is required."),
  amount: currencyAmountField("Payment amount"),
  paymentDate: dateField,
  paymentMethod: z.string().trim().min(1, "Payment method is required.").max(80),
  reference: optionalTrimmedString(160),
  notes: optionalTrimmedString(1000)
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemInputSchema>;
export type InvoicePaymentInput = z.infer<typeof invoicePaymentInputSchema>;
export const invoiceStatusesList = invoiceStatuses;
export const editableInvoiceStatusesList = editableInvoiceStatuses;
export const paymentStatusesList = paymentStatuses;
