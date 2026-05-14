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

const optionalCustomerIdSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .refine((value) => value == null || z.string().uuid().safeParse(value).success, {
    message: "Select a valid customer."
  })
  .transform((value) => value ?? null);

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

export const projectCreateInputSchema = projectInputSchema
  .extend({
    customerId: optionalCustomerIdSchema,
    newCustomerName: optionalTrimmedString(120),
    newCustomerCompanyName: optionalTrimmedString(120),
    newCustomerEmail: z
      .string()
      .trim()
      .max(255)
      .transform((value) => (value.length > 0 ? value : null))
      .nullable()
      .optional()
      .refine((value) => value === null || z.string().email().safeParse(value).success, {
        message: "Enter a valid customer email address."
      })
      .transform((value) => value ?? null),
    newCustomerPhone: optionalTrimmedString(40)
  })
  .superRefine((value, ctx) => {
    if (value.customerId || value.newCustomerName) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select an existing customer or create a new customer.",
      path: ["customerId"]
    });
  });

export const projectQuickCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(160),
  customerId: z.string().uuid("Select a valid customer.")
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateInputSchema>;
export type ProjectQuickCreateInput = z.infer<typeof projectQuickCreateInputSchema>;
export const projectStatusesList = projectStatuses;
export const financingStatusesList = financingStatuses;
