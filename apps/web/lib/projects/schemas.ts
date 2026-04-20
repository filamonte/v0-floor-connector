import { z } from "zod";

const projectStatuses = [
  "lead",
  "estimating",
  "approved",
  "scheduled",
  "in_progress",
  "completed"
] as const;

const financingStatuses = [
  "not_applicable",
  "offered",
  "prequalified",
  "pending",
  "approved",
  "declined"
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

export const projectStatusSchema = z.enum(projectStatuses);
export const financingStatusSchema = z.enum(financingStatuses);

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(160),
  customerId: z.string().uuid("Select a valid customer."),
  status: projectStatusSchema,
  financingStatus: financingStatusSchema,
  description: optionalTrimmedString(4000),
  addressLine1: optionalTrimmedString(160),
  addressLine2: optionalTrimmedString(160),
  city: optionalTrimmedString(120),
  stateRegion: optionalTrimmedString(120),
  postalCode: optionalTrimmedString(40),
  countryCode: optionalTrimmedString(2).transform((value) =>
    value ? value.toUpperCase() : null
  )
});

export const projectQuickCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(160),
  customerId: z.string().uuid("Select a valid customer.")
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectQuickCreateInput = z.infer<typeof projectQuickCreateInputSchema>;
export const projectStatusesList = projectStatuses;
export const financingStatusesList = financingStatuses;
