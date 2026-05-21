import { z } from "zod";

const fieldNoteTypes = [
  "general",
  "labor",
  "material",
  "equipment",
  "blocker",
  "issue",
  "punch_list"
] as const;
const fieldNoteStatuses = ["open", "noted", "resolved"] as const;
const fieldNoteVisibilities = ["internal"] as const;

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

export const fieldNoteTypeSchema = z.enum(fieldNoteTypes);
export const fieldNoteStatusSchema = z.enum(fieldNoteStatuses);
export const fieldNoteVisibilitySchema = z.enum(fieldNoteVisibilities);

export const fieldNoteInputSchema = z.object({
  dailyLogId: z.string().trim().uuid("Select a valid daily log."),
  projectId: z.string().trim().uuid("Select a valid project."),
  jobId: optionalUuidField("Select a valid job."),
  personId: optionalUuidField("Select a valid workforce person."),
  timeCardId: optionalUuidField("Select a valid time card."),
  noteType: fieldNoteTypeSchema.default("general"),
  title: z.string().trim().min(1, "Title is required.").max(200),
  body: optionalTrimmedString(6000),
  status: fieldNoteStatusSchema.default("open"),
  visibility: fieldNoteVisibilitySchema.default("internal")
});

export type FieldNoteInput = z.infer<typeof fieldNoteInputSchema>;
export const fieldNoteTypesList = fieldNoteTypes;
export const fieldNoteStatusesList = fieldNoteStatuses;
export const fieldNoteVisibilitiesList = fieldNoteVisibilities;
