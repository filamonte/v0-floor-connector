import { z } from "zod";

export const serviceTicketSourceTypes = [
  "internal",
  "closeout_follow_up",
  "punchlist_conversion",
  "customer_reported_future",
  "other"
] as const;

export const serviceTicketTypes = [
  "warranty",
  "service",
  "callback",
  "inspection",
  "other"
] as const;

export const serviceTicketStatuses = [
  "open",
  "scheduled",
  "in_progress",
  "resolved",
  "closed",
  "canceled"
] as const;

export const serviceTicketPriorities = [
  "low",
  "normal",
  "high",
  "urgent"
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
    .refine(
      (value) => value === null || z.string().uuid().safeParse(value).success,
      { message }
    )
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

export const serviceTicketInputSchema = z
  .object({
    customerId: z.string().trim().uuid("Select a valid customer."),
    projectId: optionalUuidField("Select a valid project."),
    jobId: optionalUuidField("Select a valid job."),
    sourceType: z.enum(serviceTicketSourceTypes).default("internal"),
    ticketType: z.enum(serviceTicketTypes).default("warranty"),
    status: z.enum(serviceTicketStatuses).default("open"),
    priority: z.enum(serviceTicketPriorities).default("normal"),
    title: z.string().trim().min(1, "Title is required.").max(180),
    description: optionalTrimmedString(4000),
    reportedOn: z.string().trim().min(1, "Reported date is required."),
    warrantyStartDate: optionalDateField(),
    warrantyEndDate: optionalDateField(),
    warrantyBasis: optionalTrimmedString(1000),
    resolutionSummary: optionalTrimmedString(4000)
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

export const serviceTicketStatusInputSchema = z.object({
  status: z.enum(serviceTicketStatuses),
  resolutionSummary: optionalTrimmedString(4000)
});

export type ServiceTicketInput = z.infer<typeof serviceTicketInputSchema>;
export type ServiceTicketStatusInput = z.infer<
  typeof serviceTicketStatusInputSchema
>;
