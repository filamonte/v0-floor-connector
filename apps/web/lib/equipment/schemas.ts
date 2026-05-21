import { z } from "zod";

import {
  equipmentAssignmentStatuses,
  equipmentOperationalStatuses,
  equipmentOwnershipStatuses,
  equipmentTypes
} from "@floorconnector/domain";

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

function optionalDateString() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Use a valid date."
    })
    .transform((value) => value ?? null);
}

function optionalUuidString() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) => value == null || z.string().uuid().safeParse(value).success,
      {
        message: "Selected vendor is invalid."
      }
    )
    .transform((value) => value ?? null);
}

function optionalDecimalString() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Use a valid cost with up to two decimals."
    })
    .transform((value) => value ?? null);
}

export const equipmentTypeSchema = z.enum(equipmentTypes);
export const equipmentOwnershipStatusSchema = z.enum(
  equipmentOwnershipStatuses
);
export const equipmentOperationalStatusSchema = z.enum(
  equipmentOperationalStatuses
);
export const equipmentAssignmentStatusSchema = z.enum(
  equipmentAssignmentStatuses
);

export const equipmentAssetInputSchema = z
  .object({
    name: z.string().trim().min(1, "Equipment name is required.").max(160),
    vendorId: optionalUuidString(),
    assetTag: optionalTrimmedString(80),
    serialNumber: optionalTrimmedString(120),
    equipmentType: equipmentTypeSchema,
    ownershipStatus: equipmentOwnershipStatusSchema,
    operationalStatus: equipmentOperationalStatusSchema,
    manufacturer: optionalTrimmedString(120),
    model: optionalTrimmedString(120),
    year: z
      .number()
      .int()
      .min(1900, "Use a valid equipment year.")
      .max(2200, "Use a valid equipment year.")
      .nullable(),
    purchaseDate: optionalDateString(),
    purchaseCost: optionalDecimalString(),
    rentalStartDate: optionalDateString(),
    rentalEndDate: optionalDateString(),
    notes: optionalTrimmedString(4000),
    isActive: z.boolean().default(true)
  })
  .refine(
    (value) =>
      value.rentalStartDate === null ||
      value.rentalEndDate === null ||
      value.rentalEndDate >= value.rentalStartDate,
    {
      message: "Rental end date must be on or after the rental start date.",
      path: ["rentalEndDate"]
    }
  );

export type EquipmentAssetInput = z.infer<typeof equipmentAssetInputSchema>;

export const jobEquipmentRequirementInputSchema = z.object({
  jobId: z.string().uuid("Job id is required."),
  equipmentType: equipmentTypeSchema,
  quantity: z.number().int().min(1, "Quantity must be at least 1.").max(99),
  required: z.boolean().default(true),
  notes: optionalTrimmedString(1000)
});

export type JobEquipmentRequirementInput = z.infer<
  typeof jobEquipmentRequirementInputSchema
>;

export const equipmentAssignmentInputSchema = z
  .object({
    jobId: z.string().uuid("Job id is required."),
    equipmentAssetId: z.string().uuid("Equipment asset is required."),
    assignedDate: optionalDateString(),
    scheduledStartAt: optionalTrimmedString(40),
    scheduledEndAt: optionalTrimmedString(40),
    assignmentStatus: equipmentAssignmentStatusSchema.default("planned"),
    notes: optionalTrimmedString(1000)
  })
  .refine(
    (value) =>
      value.scheduledStartAt === null ||
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value.scheduledStartAt),
    {
      message: "Use a valid scheduled start.",
      path: ["scheduledStartAt"]
    }
  )
  .refine(
    (value) =>
      value.scheduledEndAt === null ||
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value.scheduledEndAt),
    {
      message: "Use a valid scheduled end.",
      path: ["scheduledEndAt"]
    }
  )
  .refine(
    (value) =>
      value.scheduledStartAt === null ||
      value.scheduledEndAt === null ||
      value.scheduledEndAt >= value.scheduledStartAt,
    {
      message: "Scheduled end must be on or after scheduled start.",
      path: ["scheduledEndAt"]
    }
  );

export type EquipmentAssignmentInput = z.infer<
  typeof equipmentAssignmentInputSchema
>;

export const equipmentTypesList = equipmentTypes;
export const equipmentOwnershipStatusesList = equipmentOwnershipStatuses;
export const equipmentOperationalStatusesList = equipmentOperationalStatuses;
export const equipmentAssignmentStatusesList = equipmentAssignmentStatuses;
