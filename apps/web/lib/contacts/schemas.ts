import { z } from "zod";

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

export const customerContactInputSchema = z.object({
  customerId: z.string().uuid("Customer id is required."),
  displayName: z.string().trim().min(1, "Contact name is required.").max(120),
  companyName: optionalTrimmedString(120),
  email: z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    })
    .transform((value) => value ?? null),
  phone: optionalTrimmedString(40),
  relationshipLabel: optionalTrimmedString(120),
  notes: optionalTrimmedString(4000),
  setAsMainContact: z.boolean().default(false)
});

export const updateCustomerContactInputSchema = customerContactInputSchema.extend({
  customerContactId: z.string().uuid("Customer contact id is required.")
});

export const makePrimaryCustomerContactInputSchema = z.object({
  customerId: z.string().uuid("Customer id is required."),
  customerContactId: z.string().uuid("Customer contact id is required.")
});

export type CustomerContactInput = z.infer<typeof customerContactInputSchema>;
export type UpdateCustomerContactInput = z.infer<typeof updateCustomerContactInputSchema>;
export type MakePrimaryCustomerContactInput = z.infer<
  typeof makePrimaryCustomerContactInputSchema
>;
