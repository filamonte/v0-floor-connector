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
  customerContactId: z
    .string()
    .trim()
    .uuid("Select a valid related customer contact.")
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  userId: z.string().trim().uuid("Select a valid authenticated user."),
  invitedEmail: optionalEmailField(),
  status: portalAccessGrantStatusSchema.default("invited")
});

export const portalProjectAccessInputSchema = z.object({
  portalAccessGrantId: z.string().trim().uuid("Select a valid portal access grant."),
  projectId: z.string().trim().uuid("Select a valid project."),
  status: portalProjectAccessStatusSchema.default("active")
});

export const portalInviteInputSchema = z.object({
  customerId: z.string().trim().uuid("Select a valid customer."),
  customerContactId: z
    .string()
    .trim()
    .uuid("Select a valid related customer contact.")
    .nullable()
    .optional()
    .transform((value) => value ?? null)
    .refine((value) => value !== null, {
      message: "Select the customer contact receiving portal access."
    }),
  projectId: z.string().trim().uuid("Select a valid project."),
  invitedEmail: optionalEmailField().refine((value) => value !== null, {
    message: "Enter the customer email to invite."
  })
});

export const portalPermissionManagementSourceSchema = z.enum([
  "system_default",
  "contractor_admin",
  "main_contact",
  "migration"
]);

export const customerContactPortalPermissionInputSchema = z.object({
  portalAccessGrantId: z.string().trim().uuid("Select a valid portal access grant."),
  customerContactId: z.string().trim().uuid("Select a valid related customer contact."),
  canViewEstimates: z.boolean().default(true),
  canApproveEstimates: z.boolean().default(true),
  canSignContracts: z.boolean().default(true),
  canApproveChangeOrders: z.boolean().default(true),
  canViewPayInvoices: z.boolean().default(true),
  canRequestQuotes: z.boolean().default(true)
});

export type PortalAccessGrantInput = z.infer<typeof portalAccessGrantInputSchema>;
export type PortalProjectAccessInput = z.infer<typeof portalProjectAccessInputSchema>;
export type PortalInviteInput = z.infer<typeof portalInviteInputSchema>;
export type CustomerContactPortalPermissionInput = z.infer<
  typeof customerContactPortalPermissionInputSchema
>;
export const portalAccessGrantStatusesList = portalAccessGrantStatuses;
export const portalProjectAccessStatusesList = portalProjectAccessStatuses;
