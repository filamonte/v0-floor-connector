import { z } from "zod";

const workforcePersonTypes = ["employee", "subcontractor_worker"] as const;

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

function optionalEmailField() {
  return z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    })
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

export const workforcePersonTypeSchema = z.enum(workforcePersonTypes);

export const personInputSchema = z
  .object({
    membershipUserId: optionalUuidField("Select a valid linked user."),
    vendorId: optionalUuidField("Select a valid vendor."),
    personType: workforcePersonTypeSchema,
    displayName: z.string().trim().min(1, "Display name is required.").max(160),
    firstName: optionalTrimmedString(120),
    lastName: optionalTrimmedString(120),
    email: optionalEmailField(),
    phone: optionalTrimmedString(40),
    jobTitle: optionalTrimmedString(120),
    trade: optionalTrimmedString(120),
    classification: optionalTrimmedString(120),
    isAssignable: z.boolean().default(true),
    isActive: z.boolean().default(true),
    notes: optionalTrimmedString(4000)
  })
  .superRefine((value, ctx) => {
    if (value.personType === "employee" && value.vendorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vendorId"],
        message: "Employees cannot be linked to a vendor."
      });
    }

    if (value.personType === "subcontractor_worker" && !value.vendorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vendorId"],
        message: "Subcontractor workers must be linked to a vendor."
      });
    }
  });

export type PersonInput = z.infer<typeof personInputSchema>;
export const workforcePersonTypesList = workforcePersonTypes;
