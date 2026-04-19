import { z } from "zod";

const portalAccessGrantStatuses = ["invited", "active", "revoked"] as const;
const portalProjectAccessStatuses = ["active", "revoked"] as const;

function optionalEmailField() {
  return z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value.length > 0 ? value.toLowerCase() : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid invited email address."
    })
    .transform((value) => value ?? null);
}

export const portalAccessGrantStatusSchema = z.enum(portalAccessGrantStatuses);
export const portalProjectAccessStatusSchema = z.enum(portalProjectAccessStatuses);

export const portalAccessGrantInputSchema = z.object({
  customerId: z.string().trim().uuid("Select a valid customer."),
  userId: z.string().trim().uuid("Select a valid authenticated user."),
  invitedEmail: optionalEmailField(),
  status: portalAccessGrantStatusSchema.default("invited")
});

export const portalProjectAccessInputSchema = z.object({
  portalAccessGrantId: z.string().trim().uuid("Select a valid portal access grant."),
  projectId: z.string().trim().uuid("Select a valid project."),
  status: portalProjectAccessStatusSchema.default("active")
});

export type PortalAccessGrantInput = z.infer<typeof portalAccessGrantInputSchema>;
export type PortalProjectAccessInput = z.infer<typeof portalProjectAccessInputSchema>;
export const portalAccessGrantStatusesList = portalAccessGrantStatuses;
export const portalProjectAccessStatusesList = portalProjectAccessStatuses;
