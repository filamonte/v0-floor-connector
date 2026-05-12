import { z } from "zod";

import type { CueStateScope, CueStateValue } from "./types";

export const cueFamilies = ["operational", "project_guidance"] as const;
export const cueStateScopes = ["user", "company"] as const;
export const cueStateValues = ["dismissed", "snoozed", "resolved"] as const;
export const cueStateSnoozePresets = [
  "later_today",
  "tomorrow",
  "next_week"
] as const;

export type CueStateSnoozePreset = (typeof cueStateSnoozePresets)[number];

const subjectTypes = [
  "opportunity",
  "appointment",
  "customer",
  "project",
  "estimate",
  "contract",
  "invoice",
  "job",
  "change_order",
  "payment"
] as const;

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function trimmedString(maxLength: number, message: string) {
  return z.string().trim().min(1, message).max(maxLength);
}

const optionalUuid = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: "Expected a valid id."
  })
  .transform((value) => value ?? null);

const returnToSchema = z
  .string()
  .trim()
  .transform((value) => (value.startsWith("/") ? value : "/dashboard"));

export const workflowCueIdentitySchema = z.object({
  companyId: z.string().uuid("Company id is required."),
  cueFamily: z.enum(cueFamilies),
  cueKey: trimmedString(120, "Cue key is required."),
  cueVersion: z.coerce.number().int().positive().default(1),
  cueFingerprint: trimmedString(128, "Cue fingerprint is required."),
  subjectType: z.enum(subjectTypes),
  subjectId: z.string().uuid("Subject id is required."),
  projectId: optionalUuid
});

export const workflowCueStateActionSchema = workflowCueIdentitySchema.extend({
  returnTo: returnToSchema
});

export const workflowCueSnoozeActionSchema = workflowCueStateActionSchema.extend({
  snoozePreset: z.enum(cueStateSnoozePresets)
});

export type WorkflowCueStateActionInput = z.infer<
  typeof workflowCueStateActionSchema
>;
export type WorkflowCueSnoozeActionInput = z.infer<
  typeof workflowCueSnoozeActionSchema
>;

export function parseWorkflowCueStateActionFormData(formData: FormData) {
  return workflowCueStateActionSchema.safeParse({
    returnTo: getFieldValue(formData, "returnTo"),
    companyId: getFieldValue(formData, "companyId"),
    cueFamily: getFieldValue(formData, "cueFamily"),
    cueKey: getFieldValue(formData, "cueKey"),
    cueVersion: getFieldValue(formData, "cueVersion"),
    cueFingerprint: getFieldValue(formData, "cueFingerprint"),
    subjectType: getFieldValue(formData, "subjectType"),
    subjectId: getFieldValue(formData, "subjectId"),
    projectId: getFieldValue(formData, "projectId")
  });
}

export function parseWorkflowCueSnoozeActionFormData(formData: FormData) {
  return workflowCueSnoozeActionSchema.safeParse({
    returnTo: getFieldValue(formData, "returnTo"),
    companyId: getFieldValue(formData, "companyId"),
    cueFamily: getFieldValue(formData, "cueFamily"),
    cueKey: getFieldValue(formData, "cueKey"),
    cueVersion: getFieldValue(formData, "cueVersion"),
    cueFingerprint: getFieldValue(formData, "cueFingerprint"),
    subjectType: getFieldValue(formData, "subjectType"),
    subjectId: getFieldValue(formData, "subjectId"),
    projectId: getFieldValue(formData, "projectId"),
    snoozePreset: getFieldValue(formData, "snoozePreset")
  });
}

export function isCueStateValue(value: string): value is CueStateValue {
  return (cueStateValues as readonly string[]).includes(value);
}

export function isCueStateScope(value: string): value is CueStateScope {
  return (cueStateScopes as readonly string[]).includes(value);
}
