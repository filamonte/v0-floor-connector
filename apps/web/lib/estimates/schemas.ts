import { z } from "zod";

const estimateStatuses = ["draft", "sent", "approved", "rejected"] as const;

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

export const estimateStatusSchema = z.enum(estimateStatuses);

export const estimateLineItemInputSchema = z.object({
  name: lineItemNameField(),
  description: optionalTrimmedString(1000),
  quantity: positiveQuantityField(),
  unit: unitField(),
  unitPrice: currencyAmountField("Unit price")
});

export const estimateInputSchema = z.object({
  projectId: z.string().uuid("Select a valid project."),
  status: estimateStatusSchema,
  taxAmount: currencyAmountField("Tax"),
  discountAmount: currencyAmountField("Discount"),
  lineItems: z
    .array(estimateLineItemInputSchema)
    .min(1, "Add at least one line item."),
  notes: optionalTrimmedString(4000)
}).superRefine((value, ctx) => {
  const subtotal = value.lineItems.reduce(
    (sum, lineItem) => sum + Number(lineItem.quantity) * Number(lineItem.unitPrice),
    0
  );
  const total = subtotal + Number(value.taxAmount) - Number(value.discountAmount);

  if (total < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Discount cannot reduce the estimate below zero.",
      path: ["discountAmount"]
    });
  }
});

export type EstimateInput = z.infer<typeof estimateInputSchema>;
export type EstimateLineItemInput = z.infer<typeof estimateLineItemInputSchema>;
export const estimateStatusesList = estimateStatuses;
