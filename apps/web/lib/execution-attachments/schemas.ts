import { z } from "zod";

const executionAttachmentSubjectTypes = ["daily_log", "field_note"] as const;
const executionAttachmentTypes = ["photo", "file"] as const;

function trimmedString(minLength: number, maxLength: number, message: string) {
  return z.string().trim().min(minLength, message).max(maxLength);
}

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

export const executionAttachmentSubjectTypeSchema = z.enum(
  executionAttachmentSubjectTypes
);

export const executionAttachmentTypeSchema = z.enum(executionAttachmentTypes);

export const executionAttachmentInputSchema = z.object({
  subjectType: executionAttachmentSubjectTypeSchema,
  subjectId: z.string().trim().uuid("Select a valid attachment subject."),
  attachmentType: executionAttachmentTypeSchema.default("file"),
  storagePath: trimmedString(1, 1000, "File reference is required."),
  fileName: trimmedString(1, 255, "File name is required."),
  mimeType: trimmedString(1, 255, "MIME type is required."),
  caption: optionalTrimmedString(1000)
});

export const executionAttachmentUploadInputSchema = z.object({
  subjectType: executionAttachmentSubjectTypeSchema,
  subjectId: z.string().trim().uuid("Select a valid attachment subject."),
  caption: optionalTrimmedString(1000)
});

export type ExecutionAttachmentInput = z.infer<
  typeof executionAttachmentInputSchema
>;
export type ExecutionAttachmentUploadFormInput = z.infer<
  typeof executionAttachmentUploadInputSchema
>;
export const executionAttachmentSubjectTypesList =
  executionAttachmentSubjectTypes;
export const executionAttachmentTypesList = executionAttachmentTypes;
