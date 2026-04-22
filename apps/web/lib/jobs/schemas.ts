import { z } from "zod";

const jobStatuses = [
  "unscheduled",
  "scheduled",
  "in_progress",
  "completed"
] as const;

const jobAssignmentRoles = ["lead", "crew", "subcontractor"] as const;

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

function optionalDateField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) =>
        value == null ||
        /^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isNaN(Date.parse(value)),
      { message }
    )
    .transform((value) => {
      if (!value) {
        return null;
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }

      return new Date(value).toISOString().slice(0, 10);
    });
}

function optionalDateTimeField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || !Number.isNaN(Date.parse(value)), {
      message
    })
    .transform((value) => (value ? new Date(value).toISOString() : null));
}

export const jobStatusSchema = z.enum(jobStatuses);
export const jobAssignmentRoleSchema = z.enum(jobAssignmentRoles);

const jobScheduleFields = {
  scheduledDate: optionalDateField("Scheduled date must be a valid date."),
  scheduledStartAt: optionalDateTimeField("Scheduled start must be a valid date and time."),
  scheduledEndAt: optionalDateTimeField("Scheduled end must be a valid date and time."),
  scheduleNotes: optionalTrimmedString(4000)
};

export const jobScheduleInputSchema = z
  .object(jobScheduleFields)
  .superRefine((value, context) => {
    if (
      value.scheduledStartAt &&
      value.scheduledEndAt &&
      value.scheduledEndAt < value.scheduledStartAt
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled end must be after the scheduled start.",
        path: ["scheduledEndAt"]
      });
    }

    if (
      value.scheduledDate &&
      value.scheduledStartAt &&
      value.scheduledStartAt.slice(0, 10) !== value.scheduledDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled start must match the scheduled date.",
        path: ["scheduledStartAt"]
      });
    }

    if (
      value.scheduledDate &&
      value.scheduledEndAt &&
      value.scheduledEndAt.slice(0, 10) !== value.scheduledDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled end must match the scheduled date.",
        path: ["scheduledEndAt"]
      });
    }
  });

export const jobInputSchema = z.object({
  projectId: z.string().uuid("Select a valid project."),
  estimateId: optionalUuidField("Select a valid estimate."),
  dispatchStatus: jobStatusSchema,
  crewVendorId: optionalUuidField("Select a valid crew vendor."),
  ...jobScheduleFields,
  notes: optionalTrimmedString(4000)
});

export const jobQuickCreateInputSchema = z.object({
  projectId: z.string().uuid("Select a valid project.")
});

export const jobAssignmentInputSchema = z
  .object({
    personId: optionalUuidField("Select a valid crew member."),
    vendorId: optionalUuidField("Select a valid subcontractor vendor."),
    role: jobAssignmentRoleSchema,
    assignedStartAt: optionalDateTimeField("Assignment start must be a valid date and time."),
    assignedEndAt: optionalDateTimeField("Assignment end must be a valid date and time.")
  })
  .superRefine((value, context) => {
    const selectedCount = Number(Boolean(value.personId)) + Number(Boolean(value.vendorId));

    if (selectedCount !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select either one crew member or one subcontractor vendor.",
        path: ["personId"]
      });
    }

    if (value.vendorId && value.role !== "subcontractor") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vendor assignments must use the subcontractor role.",
        path: ["role"]
      });
    }

    if (
      value.assignedStartAt &&
      value.assignedEndAt &&
      value.assignedEndAt < value.assignedStartAt
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assignment end must be after the assignment start.",
        path: ["assignedEndAt"]
      });
    }
  });

export type JobInput = z.infer<typeof jobInputSchema>;
export type JobScheduleInput = z.infer<typeof jobScheduleInputSchema>;
export type JobAssignmentInput = z.infer<typeof jobAssignmentInputSchema>;
export type JobQuickCreateInput = z.infer<typeof jobQuickCreateInputSchema>;
export const jobStatusesList = jobStatuses;
export const jobAssignmentRolesList = jobAssignmentRoles;
