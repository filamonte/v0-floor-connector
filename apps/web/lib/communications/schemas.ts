import { z } from "zod";

export const opportunityManualCommunicationKinds = [
  "manual_call",
  "manual_email_note",
  "manual_text_note",
  "voicemail",
  "internal_note",
  "appointment_note"
] as const;

export const communicationVisibilityValues = [
  "internal",
  "customer_visible"
] as const;

export const opportunityManualCommunicationInputSchema = z.object({
  opportunityId: z.string().uuid("A valid lead is required."),
  messageKind: z.enum(opportunityManualCommunicationKinds, {
    required_error: "Select a communication type.",
    invalid_type_error: "Select a communication type."
  }),
  visibility: z.enum(communicationVisibilityValues, {
    required_error: "Select message visibility.",
    invalid_type_error: "Select message visibility."
  }),
  body: z
    .string()
    .trim()
    .min(1, "Communication note is required.")
    .max(5_000, "Communication notes must stay under 5,000 characters.")
});

export type OpportunityManualCommunicationInput = z.infer<
  typeof opportunityManualCommunicationInputSchema
>;
