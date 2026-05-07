import { z } from "zod";

const appointmentTypes = [
  "site_visit",
  "customer_meeting",
  "estimate_appointment",
  "follow_up",
  "internal"
] as const;

const appointmentStatuses = [
  "scheduled",
  "completed",
  "canceled",
  "no_show"
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

function optionalDateTimeField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || !Number.isNaN(new Date(value).getTime()), {
      message
    })
    .transform((value) => (value ? new Date(value).toISOString() : null));
}

function optionalBooleanField() {
  return z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => value === true || value === "true" || value === "on");
}

export const appointmentTypeSchema = z.enum(appointmentTypes);
export const appointmentStatusSchema = z.enum(appointmentStatuses);

export const appointmentInputSchema = z
  .object({
    opportunityId: optionalUuidField("Select a valid linked lead."),
    customerId: optionalUuidField("Select a valid linked customer."),
    projectId: optionalUuidField("Select a valid linked project."),
    assignedPersonId: optionalUuidField("Select a valid assigned person."),
    title: z
      .string()
      .trim()
      .min(1, "Enter a title.")
      .max(160, "Title must be 160 characters or less."),
    appointmentType: appointmentTypeSchema,
    startsAt: z
      .string()
      .trim()
      .min(1, "Enter a start time.")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Enter a valid start time."
      })
      .transform((value) => new Date(value).toISOString()),
    endsAt: optionalDateTimeField("Enter a valid end time."),
    location: optionalTrimmedString(240),
    notes: optionalTrimmedString(4000),
    customerVisible: optionalBooleanField(),
    customerNotes: optionalTrimmedString(4000),
    internalNotes: optionalTrimmedString(4000),
    status: appointmentStatusSchema.default("scheduled")
  })
  .superRefine((value, context) => {
    if (value.endsAt && value.endsAt <= value.startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "End time must be after the start time."
      });
    }
  });

export const appointmentQuickCreateInputSchema = z.object({
  opportunityId: optionalUuidField("Select a valid linked lead."),
  customerId: optionalUuidField("Select a valid linked customer."),
  projectId: optionalUuidField("Select a valid linked project."),
  assignedPersonId: optionalUuidField("Select a valid assigned person."),
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(160, "Title must be 160 characters or less."),
  appointmentType: appointmentTypeSchema,
  startsAt: z
    .string()
    .trim()
    .min(1, "Enter a start time.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Enter a valid start time."
    })
    .transform((value) => new Date(value).toISOString()),
  customerVisible: optionalBooleanField().default(false),
  customerNotes: optionalTrimmedString(4000)
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
export type AppointmentQuickCreateInput = z.infer<
  typeof appointmentQuickCreateInputSchema
>;
export const appointmentTypesList = appointmentTypes;
export const appointmentStatusesList = appointmentStatuses;
