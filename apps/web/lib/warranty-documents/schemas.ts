import { z } from "zod";

export const warrantyDocumentStatuses = [
  "draft",
  "issued",
  "sent",
  "viewed",
  "signed",
  "void"
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

function optionalDateField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

export const createWarrantyDocumentFromServiceTicketSchema = z.object({
  serviceTicketId: z.string().uuid("Service ticket id is required."),
  documentTemplateId: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) => value === null || z.string().uuid().safeParse(value).success,
      { message: "Select a valid warranty template." }
    )
    .transform((value) => value ?? null)
});

export const warrantyDocumentDraftInputSchema = z
  .object({
    warrantyDocumentId: z.string().uuid("Warranty document id is required."),
    title: z.string().trim().min(1, "Title is required.").max(180),
    warrantyStartDate: optionalDateField(),
    warrantyEndDate: optionalDateField(),
    warrantyBasis: optionalTrimmedString(2000)
  })
  .superRefine((value, ctx) => {
    if (
      value.warrantyStartDate &&
      value.warrantyEndDate &&
      value.warrantyEndDate < value.warrantyStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["warrantyEndDate"],
        message: "Warranty end date must be on or after start date."
      });
    }
  });

export const warrantyDocumentStatusInputSchema = z.object({
  warrantyDocumentId: z.string().uuid("Warranty document id is required."),
  status: z.enum(["issued", "void"] as const)
});

export const warrantyDocumentSignerRoles = ["customer", "contractor"] as const;

export const warrantyDocumentSignerInputSchema = z.object({
  warrantyDocumentId: z.string().uuid("Warranty document id is required."),
  signerId: z
    .string()
    .uuid("Signer id is required.")
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  signerRole: z.enum(warrantyDocumentSignerRoles),
  signerName: z.string().trim().min(1, "Signer name is required.").max(160),
  signerEmail: z.string().trim().email("Signer email must be valid.").max(320)
});

export const warrantyDocumentSignerActionSchema = z.object({
  warrantyDocumentId: z.string().uuid("Warranty document id is required."),
  signerId: z.string().uuid("Signer id is required.")
});

const manualDeliveryRecipientEmailSchema = z
  .string()
  .trim()
  .max(320)
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .transform((value) => value ?? null)
  .refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    { message: "Recipient email must be valid." }
  );

export const warrantyDocumentDeliveryEventInputSchema = z.object({
  warrantyDocumentId: z.string().uuid("Warranty document id is required."),
  eventType: z.enum(["delivery_recorded", "send_requested"] as const),
  recipientName: optionalTrimmedString(160),
  recipientEmail: manualDeliveryRecipientEmailSchema,
  recipientRole: optionalTrimmedString(80),
  channel: z.enum(["internal", "manual", "print"] as const),
  eventNote: optionalTrimmedString(1000)
});

export const warrantyDocumentEmailSendInputSchema = z.object({
  warrantyDocumentId: z.string().uuid("Warranty document id is required."),
  signerId: z.string().uuid("Signer id is required.")
});

export type CreateWarrantyDocumentFromServiceTicketInput = z.infer<
  typeof createWarrantyDocumentFromServiceTicketSchema
>;
export type WarrantyDocumentDraftInput = z.infer<
  typeof warrantyDocumentDraftInputSchema
>;
export type WarrantyDocumentStatusInput = z.infer<
  typeof warrantyDocumentStatusInputSchema
>;
export type WarrantyDocumentSignerInput = z.infer<
  typeof warrantyDocumentSignerInputSchema
>;
export type WarrantyDocumentSignerActionInput = z.infer<
  typeof warrantyDocumentSignerActionSchema
>;
export type WarrantyDocumentDeliveryEventInput = z.infer<
  typeof warrantyDocumentDeliveryEventInputSchema
>;
export type WarrantyDocumentEmailSendInput = z.infer<
  typeof warrantyDocumentEmailSendInputSchema
>;
