import { z } from "zod";

export const communicationPreferenceSubjectTypes = [
  "customer",
  "customer_contact",
  "contact"
] as const;

export const communicationPreferenceChannels = ["email", "sms"] as const;

export const communicationPreferenceMessageCategories = [
  "appointment_confirmation",
  "appointment_reminder"
] as const;

export const communicationPreferenceStatuses = [
  "allowed",
  "opted_out",
  "suppressed"
] as const;

export const communicationPreferenceSources = [
  "manual",
  "portal",
  "provider",
  "import",
  "system"
] as const;

export const communicationPreferenceInputSchema = z.object({
  subjectType: z.enum(communicationPreferenceSubjectTypes),
  subjectId: z.string().uuid("Select a valid preference subject."),
  channel: z.enum(communicationPreferenceChannels),
  messageCategory: z.enum(communicationPreferenceMessageCategories),
  status: z.enum(communicationPreferenceStatuses),
  source: z.enum(communicationPreferenceSources).default("manual"),
  reason: z
    .string()
    .trim()
    .max(1000, "Reason must stay under 1,000 characters.")
    .nullable()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
});

export type CommunicationPreferenceInput = z.infer<
  typeof communicationPreferenceInputSchema
>;

export const customerAppointmentReminderPreferenceInputSchema = z.object({
  customerId: z.string().uuid("Customer id is required."),
  subjectType: z.enum(["customer", "customer_contact"]),
  subjectId: z.string().uuid("Select a valid preference subject."),
  status: z.enum(["allowed", "opted_out", "suppressed"]),
  reason: z
    .string()
    .trim()
    .max(1000, "Reason must stay under 1,000 characters.")
    .nullable()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
});

export type CustomerAppointmentReminderPreferenceInput = z.infer<
  typeof customerAppointmentReminderPreferenceInputSchema
>;
