import { z } from "zod";

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

const percentField = z
  .string()
  .trim()
  .min(1, "Percent complete is required.")
  .refine((value) => !Number.isNaN(Number(value)), {
    message: "Percent complete must be a valid number."
  })
  .transform((value) => Number(value))
  .refine((value) => value >= 0 && value <= 100, {
    message: "Percent complete must stay between 0 and 100."
  })
  .transform((value) => value.toFixed(2));

export const progressBillingItemInputSchema = z.object({
  id: z.string().uuid("Select a valid schedule-of-values item."),
  percentComplete: percentField
});

export const progressBillingInvoiceInputSchema = z
  .object({
    scheduleOfValuesId: z.string().uuid("Schedule of values id is required."),
    issueDate: dateField,
    dueDate: optionalDateField,
    notes: optionalTrimmedString(4000),
    items: z
      .array(progressBillingItemInputSchema)
      .min(1, "At least one schedule-of-values item is required.")
  })
  .superRefine((value, ctx) => {
    const seenIds = new Set<string>();

    for (const item of value.items) {
      if (seenIds.has(item.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Schedule-of-values items cannot repeat in the same billing request.",
          path: ["items"]
        });
        break;
      }

      seenIds.add(item.id);
    }

    if (value.dueDate && value.dueDate < value.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be before issue date.",
        path: ["dueDate"]
      });
    }
  });

export type ProgressBillingInvoiceInput = z.infer<
  typeof progressBillingInvoiceInputSchema
>;
