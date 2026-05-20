import { z } from "zod";

export const documentDeliverySubjectTypes = [
  "warranty_document",
  "estimate",
  "invoice",
  "contract"
] as const;

export const documentDeliveryManualEventTypes = [
  "delivery_recorded",
  "send_requested"
] as const;

export const documentDeliveryManualChannels = [
  "internal",
  "manual",
  "print"
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

const optionalRecipientEmailSchema = z
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

export const documentDeliveryEventInputSchema = z.object({
  subjectType: z.enum(documentDeliverySubjectTypes),
  subjectId: z.string().uuid("Document id is required."),
  eventType: z.enum(documentDeliveryManualEventTypes),
  recipientName: optionalTrimmedString(160),
  recipientEmail: optionalRecipientEmailSchema,
  recipientRole: optionalTrimmedString(80),
  channel: z.enum(documentDeliveryManualChannels),
  eventNote: optionalTrimmedString(1000)
});

export type DocumentDeliveryEventInput = z.infer<
  typeof documentDeliveryEventInputSchema
>;
