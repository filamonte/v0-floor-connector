import { z } from "zod";

export const companyDocumentCategories = [
  "agreement",
  "employee_document",
  "subcontractor_document",
  "safety_compliance",
  "operations_sop",
  "training",
  "customer_service",
  "warranty_service",
  "other"
] as const;

export const companyDocumentStatuses = ["draft", "active", "archived"] as const;

export const companyDocumentAudiences = [
  "internal",
  "employee",
  "subcontractor",
  "customer_service",
  "other"
] as const;

export type CompanyDocumentCategory =
  (typeof companyDocumentCategories)[number];
export type CompanyDocumentStatus = (typeof companyDocumentStatuses)[number];
export type CompanyDocumentAudience = (typeof companyDocumentAudiences)[number];

export type CompanyDocument = {
  id: string;
  organizationId: string;
  title: string;
  category: CompanyDocumentCategory;
  documentKind: string;
  status: CompanyDocumentStatus;
  audience: CompanyDocumentAudience;
  description: string | null;
  body: string | null;
  effectiveDate: string | null;
  expiresAt: string | null;
  archivedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export const companyDocumentCategoryLabels: Record<
  CompanyDocumentCategory,
  string
> = {
  agreement: "Agreement",
  employee_document: "Employee document",
  subcontractor_document: "Subcontractor document",
  safety_compliance: "Safety / compliance",
  operations_sop: "Operations / SOP",
  training: "Training",
  customer_service: "Customer service",
  warranty_service: "Warranty / service",
  other: "Other"
};

export const companyDocumentStatusLabels: Record<
  CompanyDocumentStatus,
  string
> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived"
};

export const companyDocumentAudienceLabels: Record<
  CompanyDocumentAudience,
  string
> = {
  internal: "Internal",
  employee: "Employee",
  subcontractor: "Subcontractor",
  customer_service: "Customer service",
  other: "Other"
};

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

function optionalDateField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

function optionalDateTimeField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null)
    .refine(
      (value) => value === null || !Number.isNaN(new Date(value).getTime()),
      { message: "Expiration date must be valid." }
    )
    .transform((value) => (value ? new Date(value).toISOString() : null));
}

const optionalCompanyDocumentId = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .transform((value) => value ?? null)
  .refine(
    (value) => value === null || z.string().uuid().safeParse(value).success,
    { message: "Select a valid company document." }
  )
  .transform((value) => value);

export const companyDocumentUpsertInputSchema = z.object({
  documentId: optionalCompanyDocumentId,
  title: z.string().trim().min(1, "Title is required.").max(180),
  category: z.enum(companyDocumentCategories),
  documentKind: z.string().trim().min(1, "Document kind is required.").max(120),
  status: z.enum(companyDocumentStatuses),
  audience: z.enum(companyDocumentAudiences),
  description: optionalTrimmedString(2000),
  body: optionalTrimmedString(50000),
  effectiveDate: optionalDateField(),
  expiresAt: optionalDateTimeField()
});

export const companyDocumentActionInputSchema = z.object({
  documentId: z.string().uuid("Company document id is required.")
});

export type CompanyDocumentUpsertInput = z.infer<
  typeof companyDocumentUpsertInputSchema
>;
export type CompanyDocumentActionInput = z.infer<
  typeof companyDocumentActionInputSchema
>;
