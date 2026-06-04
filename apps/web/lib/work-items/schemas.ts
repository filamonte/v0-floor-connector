import { z } from "zod";

import {
  workItemKinds,
  workItemPriorities,
  workItemSourceTypes,
  workItemVisibilities
} from "./constants";

function trimmedNullableString(maxLength: number) {
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
    .refine(
      (value) => value === null || z.string().uuid().safeParse(value).success,
      {
        message
      }
    )
    .transform((value) => value ?? null);
}

function nullableDateTimeField(message: string) {
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

const metadataSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .optional()
  .transform((value) => value ?? {});

const linkPathSchema = trimmedNullableString(800).refine(
  (value) => value === null || value.startsWith("/"),
  {
    message: "Link path must be an internal app path."
  }
);

const sourceFields = {
  sourceType: z
    .enum(workItemSourceTypes)
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  sourceId: optionalUuidField("Select a valid source record.")
};

export const workItemCreateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200),
    description: trimmedNullableString(4000),
    priority: z.enum(workItemPriorities).default("normal"),
    kind: z.enum(workItemKinds).default("manual"),
    dueAt: nullableDateTimeField("Enter a valid due date and time."),
    assignedPersonId: optionalUuidField("Select a valid assigned person."),
    ...sourceFields,
    customerId: optionalUuidField("Select a valid customer."),
    projectId: optionalUuidField("Select a valid project."),
    linkPath: linkPathSchema,
    visibility: z.enum(workItemVisibilities).default("internal"),
    dedupeKey: trimmedNullableString(300),
    metadata: metadataSchema
  })
  .refine(
    (value) => (value.sourceType === null) === (value.sourceId === null),
    {
      message: "Source type and source id must be provided together."
    }
  )
  .refine((value) => value.visibility === "internal", {
    message: "Work items are internal-only in V1."
  });

export const workItemUpdateSchema = z
  .object({
    workItemId: optionalUuidField("Select a valid work item.").refine(
      (value) => value !== null,
      {
        message: "Work item id is required."
      }
    ),
    title: z.string().trim().min(1, "Title is required.").max(200),
    description: trimmedNullableString(4000),
    priority: z.enum(workItemPriorities),
    kind: z.enum(workItemKinds),
    dueAt: nullableDateTimeField("Enter a valid due date and time."),
    assignedPersonId: optionalUuidField("Select a valid assigned person."),
    customerId: optionalUuidField("Select a valid customer."),
    projectId: optionalUuidField("Select a valid project."),
    linkPath: linkPathSchema,
    visibility: z.enum(workItemVisibilities).default("internal"),
    metadata: metadataSchema
  })
  .refine((value) => value.visibility === "internal", {
    message: "Work items are internal-only in V1."
  });

export const workItemSourceSchema = z.object({
  sourceType: z.enum(workItemSourceTypes),
  sourceId: z.string().uuid("Select a valid source record.")
});

export const workItemIdSchema = z.object({
  workItemId: z.string().uuid("Select a valid work item.")
});

export const workItemAssignmentSchema = z.object({
  workItemId: z.string().uuid("Select a valid work item."),
  assignedPersonId: optionalUuidField("Select a valid assigned person.")
});

export const workItemReadyForReviewSchema = z.object({
  workItemId: z.string().uuid("Select a valid work item.")
});

export const workItemNextActionSchema = z.object({
  workItemId: z.string().uuid("Select a valid work item."),
  nextAction: trimmedNullableString(500)
});

export const assignedWorkItemFieldStateSchema = z.object({
  workItemId: z.string().uuid("Select a valid work item."),
  fieldState: z.enum(["not_started", "in_progress", "blocked"]),
  blockerReason: trimmedNullableString(1000)
});

export const assignedWorkItemCompletionSchema = z.object({
  workItemId: z.string().uuid("Select a valid work item."),
  completionNote: trimmedNullableString(2000)
});

export type WorkItemCreateInput = z.infer<typeof workItemCreateSchema>;
export type WorkItemUpdateInput = z.infer<typeof workItemUpdateSchema>;
export type WorkItemSourceInput = z.infer<typeof workItemSourceSchema>;
export type WorkItemAssignmentInput = z.infer<typeof workItemAssignmentSchema>;
export type WorkItemReadyForReviewInput = z.infer<
  typeof workItemReadyForReviewSchema
>;
export type WorkItemNextActionInput = z.infer<typeof workItemNextActionSchema>;
export type AssignedWorkItemFieldStateInput = z.infer<
  typeof assignedWorkItemFieldStateSchema
>;
export type AssignedWorkItemCompletionInput = z.infer<
  typeof assignedWorkItemCompletionSchema
>;
