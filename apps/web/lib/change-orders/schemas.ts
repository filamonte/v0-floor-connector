import { z } from "zod";

const changeOrderStatuses = ["draft", "sent", "approved", "rejected"] as const;

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

function moneyField(message: string) {
  return z
    .union([z.number(), z.string()])
    .transform((value) => {
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed.toFixed(2) : "NaN";
    })
    .refine((value) => value !== "NaN", { message });
}

export const changeOrderStatusSchema = z.enum(changeOrderStatuses);

export const changeOrderQuickCreateInputSchema = z.object({
  projectId: z.string().trim().uuid("Select a valid project."),
  contractId: optionalUuidField("Select a valid contract."),
  invoiceId: optionalUuidField("Select a valid invoice."),
  title: z.string().trim().min(1, "Enter a change order title.").max(160),
  priceAdjustment: moneyField("Enter a valid price adjustment.")
});

export const changeOrderInputSchema = z.object({
  projectId: z.string().trim().uuid("Select a valid project."),
  contractId: optionalUuidField("Select a valid contract."),
  invoiceId: optionalUuidField("Select a valid invoice."),
  title: z.string().trim().min(1, "Enter a change order title.").max(160),
  description: optionalTrimmedString(4000),
  scopeChangeNotes: optionalTrimmedString(6000),
  priceAdjustment: moneyField("Enter a valid price adjustment.")
});

export const changeOrderStatusActionInputSchema = z.object({
  changeOrderId: z.string().trim().uuid("Change order id is required."),
  nextStatus: changeOrderStatusSchema
});

export const changeOrderPortalDecisionInputSchema = z.object({
  changeOrderId: z.string().trim().uuid("Change order id is required."),
  decisionNote: optionalTrimmedString(1000)
});

export type ChangeOrderQuickCreateInput = z.infer<
  typeof changeOrderQuickCreateInputSchema
>;
export type ChangeOrderInput = z.infer<typeof changeOrderInputSchema>;
export type ChangeOrderStatusActionInput = z.infer<
  typeof changeOrderStatusActionInputSchema
>;
export type ChangeOrderPortalDecisionInput = z.infer<
  typeof changeOrderPortalDecisionInputSchema
>;
export const changeOrderStatusesList = changeOrderStatuses;
