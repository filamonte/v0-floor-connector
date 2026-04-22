import { z } from "zod";

const punchlistStatuses = ["open", "in_progress", "resolved", "closed"] as const;

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

function optionalDateField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) => value == null || /^\d{4}-\d{2}-\d{2}$/.test(value),
      { message }
    )
    .transform((value) => value ?? null);
}

export const punchlistStatusSchema = z.enum(punchlistStatuses);

export const punchlistItemInputSchema = z.object({
  projectId: z.string().trim().uuid("Select a valid project."),
  jobId: optionalUuidField("Select a valid job."),
  assigneePersonId: optionalUuidField("Select a valid assignee."),
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(160, "Title must be 160 characters or less."),
  details: optionalTrimmedString(4000),
  dueDate: optionalDateField("Enter a valid due date."),
  status: punchlistStatusSchema.default("open")
});

export const punchlistQuickCreateInputSchema = z.object({
  projectId: z.string().trim().uuid("Select a valid project."),
  jobId: optionalUuidField("Select a valid job."),
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(160, "Title must be 160 characters or less.")
});

export type PunchlistItemInput = z.infer<typeof punchlistItemInputSchema>;
export type PunchlistQuickCreateInput = z.infer<typeof punchlistQuickCreateInputSchema>;
export const punchlistStatusesList = punchlistStatuses;
