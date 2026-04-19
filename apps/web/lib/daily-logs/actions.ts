"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createDailyLog, updateDailyLog } from "./data";
import { dailyLogInputSchema } from "./schemas";
import { createExecutionAttachment } from "@/lib/execution-attachments/data";
import { executionAttachmentInputSchema } from "@/lib/execution-attachments/schemas";
import { createFieldNote, updateFieldNote } from "@/lib/field-notes/data";
import { fieldNoteInputSchema } from "@/lib/field-notes/schemas";

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

function parseDailyLogInput(formData: FormData) {
  return dailyLogInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    logDate: getFieldValue(formData, "logDate"),
    status: getFieldValue(formData, "status"),
    summary: getFieldValue(formData, "summary"),
    workCompleted: getFieldValue(formData, "workCompleted"),
    workPlannedNext: getFieldValue(formData, "workPlannedNext"),
    delaysOrBlockers: getFieldValue(formData, "delaysOrBlockers"),
    safetyNotes: getFieldValue(formData, "safetyNotes"),
    weatherSummary: getFieldValue(formData, "weatherSummary"),
    weatherConditions: getFieldValue(formData, "weatherConditions"),
    temperatureHighF: getFieldValue(formData, "temperatureHighF"),
    temperatureLowF: getFieldValue(formData, "temperatureLowF")
  });
}

function parseFieldNoteInput(formData: FormData) {
  return fieldNoteInputSchema.safeParse({
    dailyLogId: getFieldValue(formData, "dailyLogId"),
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    personId: getFieldValue(formData, "personId"),
    timeCardId: getFieldValue(formData, "timeCardId"),
    noteType: getFieldValue(formData, "noteType"),
    title: getFieldValue(formData, "title"),
    body: getFieldValue(formData, "body"),
    status: getFieldValue(formData, "status"),
    visibility: getFieldValue(formData, "visibility") || "internal"
  });
}

function parseExecutionAttachmentInput(formData: FormData) {
  return executionAttachmentInputSchema.safeParse({
    subjectType: getFieldValue(formData, "subjectType"),
    subjectId: getFieldValue(formData, "subjectId"),
    attachmentType: getFieldValue(formData, "attachmentType"),
    storagePath: getFieldValue(formData, "storagePath"),
    fileName: getFieldValue(formData, "fileName"),
    mimeType: getFieldValue(formData, "mimeType"),
    caption: getFieldValue(formData, "caption")
  });
}

function revalidateDailyExecutionPaths(projectId: string, jobId: string | null, dailyLogId: string) {
  revalidatePath("/daily-logs");
  revalidatePath(`/daily-logs/${dailyLogId}`);
  revalidatePath(`/projects/${projectId}`);

  if (jobId) {
    revalidatePath(`/jobs/${jobId}`);
  }
}

export async function createDailyLogAction(formData: FormData) {
  const result = parseDailyLogInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/daily-logs", {
        error: result.error.issues[0]?.message ?? "Unable to create the daily log."
      })
    );
  }

  let dailyLog;

  try {
    dailyLog = await createDailyLog(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/daily-logs", {
        error: error instanceof Error ? error.message : "Unable to create the daily log."
      })
    );
  }

  revalidateDailyExecutionPaths(dailyLog.projectId, dailyLog.jobId, dailyLog.id);

  redirect(
    buildRedirect(`/daily-logs/${dailyLog.id}`, {
      message: "Daily log created successfully."
    })
  );
}

export async function updateDailyLogAction(formData: FormData) {
  const dailyLogId = getFieldValue(formData, "dailyLogId");
  const result = parseDailyLogInput(formData);

  if (!dailyLogId) {
    redirect(
      buildRedirect("/daily-logs", {
        error: "Daily log id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/daily-logs/${dailyLogId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update the daily log."
      })
    );
  }

  let dailyLog;

  try {
    dailyLog = await updateDailyLog(dailyLogId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/daily-logs/${dailyLogId}`, {
        error: error instanceof Error ? error.message : "Unable to update the daily log."
      })
    );
  }

  revalidateDailyExecutionPaths(dailyLog.projectId, dailyLog.jobId, dailyLog.id);

  redirect(
    buildRedirect(`/daily-logs/${dailyLog.id}`, {
      message: "Daily log updated successfully."
    })
  );
}

export async function createFieldNoteAction(formData: FormData) {
  const result = parseFieldNoteInput(formData);

  if (!result.success) {
    const dailyLogId = getFieldValue(formData, "dailyLogId");

    redirect(
      buildRedirect(`/daily-logs/${dailyLogId}`, {
        error: result.error.issues[0]?.message ?? "Unable to create the field note."
      })
    );
  }

  let fieldNote;

  try {
    fieldNote = await createFieldNote(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/daily-logs/${result.data.dailyLogId}`, {
        error: error instanceof Error ? error.message : "Unable to create the field note."
      })
    );
  }

  revalidateDailyExecutionPaths(
    fieldNote.projectId,
    fieldNote.jobId,
    fieldNote.dailyLogId
  );

  redirect(
    buildRedirect(`/daily-logs/${fieldNote.dailyLogId}`, {
      message: "Field note created successfully."
    })
  );
}

export async function updateFieldNoteAction(formData: FormData) {
  const fieldNoteId = getFieldValue(formData, "fieldNoteId");
  const result = parseFieldNoteInput(formData);

  if (!fieldNoteId) {
    const dailyLogId = getFieldValue(formData, "dailyLogId");

    redirect(
      buildRedirect(`/daily-logs/${dailyLogId}`, {
        error: "Field note id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/daily-logs/${getFieldValue(formData, "dailyLogId")}`, {
        error: result.error.issues[0]?.message ?? "Unable to update the field note."
      })
    );
  }

  let fieldNote;

  try {
    fieldNote = await updateFieldNote(fieldNoteId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/daily-logs/${result.data.dailyLogId}`, {
        error: error instanceof Error ? error.message : "Unable to update the field note."
      })
    );
  }

  revalidateDailyExecutionPaths(
    fieldNote.projectId,
    fieldNote.jobId,
    fieldNote.dailyLogId
  );

  redirect(
    buildRedirect(`/daily-logs/${fieldNote.dailyLogId}`, {
      message: "Field note updated successfully."
    })
  );
}

export async function createExecutionAttachmentAction(formData: FormData) {
  const dailyLogId = getFieldValue(formData, "dailyLogId");
  const projectId = getFieldValue(formData, "projectId");
  const jobId = getFieldValue(formData, "jobId") || null;
  const result = parseExecutionAttachmentInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect(`/daily-logs/${dailyLogId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to create the execution attachment."
      })
    );
  }

  try {
    await createExecutionAttachment(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/daily-logs/${dailyLogId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the execution attachment."
      })
    );
  }

  revalidateDailyExecutionPaths(projectId, jobId, dailyLogId);

  redirect(
    buildRedirect(`/daily-logs/${dailyLogId}`, {
      message: "Execution attachment added successfully."
    })
  );
}
