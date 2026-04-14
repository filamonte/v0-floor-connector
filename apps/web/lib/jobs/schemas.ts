import { z } from "zod";

const jobStatuses = [
  "unscheduled",
  "scheduled",
  "in_progress",
  "completed",
  "canceled"
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

export const jobStatusSchema = z.enum(jobStatuses);

export const jobInputSchema = z.object({
  projectId: z.string().uuid("Select a valid project."),
  estimateId: optionalUuidField("Select a valid estimate."),
  status: jobStatusSchema,
  scheduledDate: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) =>
        value == null ||
        /^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isNaN(Date.parse(value)),
      {
        message: "Scheduled date must be a valid date."
      }
    )
    .transform((value) => value ?? null),
  notes: optionalTrimmedString(4000)
});

export type JobInput = z.infer<typeof jobInputSchema>;
export const jobStatusesList = jobStatuses;
