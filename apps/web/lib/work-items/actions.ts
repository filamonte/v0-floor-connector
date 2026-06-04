"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createUploadedExecutionAttachment } from "@/lib/execution-attachments/data";
import { executionAttachmentUploadInputSchema } from "@/lib/execution-attachments/schemas";

import {
  completeAssignedWorkItem,
  completeWorkItem,
  createWorkItem,
  dismissWorkItem,
  markAssignedWorkItemReadyForReview,
  updateAssignedWorkItemFieldState,
  updateWorkItemAssignment,
  updateWorkItem
} from "./data";
import {
  assignedWorkItemCompletionSchema,
  assignedWorkItemFieldStateSchema,
  workItemAssignmentSchema,
  workItemCreateSchema,
  workItemIdSchema,
  workItemReadyForReviewSchema,
  workItemUpdateSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function getReturnTo(formData: FormData) {
  const returnTo = getFieldValue(formData, "returnTo");

  return returnTo.startsWith("/") ? returnTo : "/dashboard";
}

function revalidateWorkItemSurfaces(returnTo: string) {
  revalidatePath("/dashboard");
  revalidatePath("/field/work-items");
  revalidatePath("/leads");
  revalidatePath("/appointments");
  revalidatePath("/projects");
  revalidatePath("/jobs");
  revalidatePath(returnTo);
}

function getMetadata(formData: FormData): Record<string, unknown> {
  const raw = getFieldValue(formData, "metadata");

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function getContextRichMetadata(formData: FormData) {
  const metadata = getMetadata(formData);
  const measurementNotes = getFieldValue(formData, "measurementNotes").trim();

  if (measurementNotes) {
    return {
      ...metadata,
      measurementNotes
    };
  }

  const nextMetadata = { ...metadata };
  delete nextMetadata.measurementNotes;

  return nextMetadata;
}

function parseWorkItemEvidenceInput(formData: FormData) {
  return executionAttachmentUploadInputSchema.safeParse({
    subjectType: "work_item",
    subjectId: getFieldValue(formData, "workItemId"),
    caption: getFieldValue(formData, "caption")
  });
}

export async function createWorkItemAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = workItemCreateSchema.safeParse({
    title: getFieldValue(formData, "title"),
    description: getFieldValue(formData, "description"),
    priority: getFieldValue(formData, "priority") || "normal",
    kind: getFieldValue(formData, "kind") || "manual",
    dueAt: getFieldValue(formData, "dueAt"),
    assignedPersonId: getFieldValue(formData, "assignedPersonId"),
    sourceType: getFieldValue(formData, "sourceType") || null,
    sourceId: getFieldValue(formData, "sourceId"),
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    linkPath: getFieldValue(formData, "linkPath"),
    visibility: getFieldValue(formData, "visibility") || "internal",
    dedupeKey: getFieldValue(formData, "dedupeKey"),
    metadata: getContextRichMetadata(formData)
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to create work item."
      })
    );
  }

  try {
    await createWorkItem(result.data);
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error ? error.message : "Unable to create work item."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item created." }));
}

export async function updateWorkItemAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = workItemUpdateSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId"),
    title: getFieldValue(formData, "title"),
    description: getFieldValue(formData, "description"),
    priority: getFieldValue(formData, "priority") || "normal",
    kind: getFieldValue(formData, "kind") || "manual",
    dueAt: getFieldValue(formData, "dueAt"),
    assignedPersonId: getFieldValue(formData, "assignedPersonId"),
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    linkPath: getFieldValue(formData, "linkPath"),
    visibility: getFieldValue(formData, "visibility") || "internal",
    metadata: getContextRichMetadata(formData)
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to update work item."
      })
    );
  }

  try {
    await updateWorkItem(result.data);
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error ? error.message : "Unable to update work item."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item updated." }));
}

export async function updateWorkItemAssignmentAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = workItemAssignmentSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId"),
    assignedPersonId: getFieldValue(formData, "assignedPersonId")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to reassign work item."
      })
    );
  }

  try {
    await updateWorkItemAssignment({
      ...result.data,
      next: returnTo
    });
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reassign work item."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item reassigned." }));
}

export async function completeWorkItemAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = workItemIdSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId")
  });

  if (!result.success) {
    redirect(buildRedirect(returnTo, { error: "Select a valid work item." }));
  }

  try {
    await completeWorkItem(result.data.workItemId);
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete work item."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item completed." }));
}

export async function dismissWorkItemAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = workItemIdSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId")
  });

  if (!result.success) {
    redirect(buildRedirect(returnTo, { error: "Select a valid work item." }));
  }

  try {
    await dismissWorkItem(result.data.workItemId);
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to dismiss work item."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item dismissed." }));
}

export async function updateAssignedWorkItemFieldStateAction(
  formData: FormData
) {
  const returnTo = getReturnTo(formData);
  const result = assignedWorkItemFieldStateSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId"),
    fieldState: getFieldValue(formData, "fieldState") || "not_started",
    blockerReason: getFieldValue(formData, "blockerReason")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update work item field status."
      })
    );
  }

  try {
    await updateAssignedWorkItemFieldState({
      ...result.data,
      next: returnTo
    });
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update work item field status."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item status updated." }));
}

export async function markAssignedWorkItemReadyForReviewAction(
  formData: FormData
) {
  const returnTo = getReturnTo(formData);
  const result = workItemReadyForReviewSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId")
  });

  if (!result.success) {
    redirect(buildRedirect(returnTo, { error: "Select a valid work item." }));
  }

  try {
    await markAssignedWorkItemReadyForReview({
      ...result.data,
      next: returnTo
    });
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to mark work item ready for review."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item ready for review." }));
}

export async function completeAssignedWorkItemAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = assignedWorkItemCompletionSchema.safeParse({
    workItemId: getFieldValue(formData, "workItemId"),
    completionNote: getFieldValue(formData, "completionNote")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ??
          "Unable to complete assigned work item."
      })
    );
  }

  try {
    await completeAssignedWorkItem({
      ...result.data,
      next: returnTo
    });
    revalidateWorkItemSurfaces(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete assigned work item."
      })
    );
  }

  redirect(buildRedirect(returnTo, { message: "Work item completed." }));
}

export async function createWorkItemEvidenceAttachmentAction(
  formData: FormData
) {
  const returnTo = getReturnTo(formData);
  const uploadFile = formData.get("evidenceFile");
  const result = parseWorkItemEvidenceInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to add work item evidence."
      })
    );
  }

  if (!(uploadFile instanceof File)) {
    redirect(
      buildRedirect(returnTo, {
        error: "Choose a photo or PDF before adding work item evidence."
      })
    );
  }

  try {
    const created = await createUploadedExecutionAttachment({
      ...result.data,
      file: uploadFile
    });

    revalidatePath("/dashboard");
    revalidatePath("/field/work-items");
    revalidatePath("/projects");
    revalidatePath(`/projects/${created.context.projectId}`);

    if (created.context.jobId) {
      revalidatePath(`/jobs/${created.context.jobId}`);
    }

    revalidatePath(returnTo);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add work item evidence."
      })
    );
  }

  redirect(
    buildRedirect(returnTo, {
      message: "Work item evidence uploaded successfully."
    })
  );
}
