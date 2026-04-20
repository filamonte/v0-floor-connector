"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assignCrew,
  createJob,
  scheduleJob,
  unassignCrew,
  unscheduleJob,
  updateJob
} from "./data";
import {
  jobAssignmentInputSchema,
  jobInputSchema,
  jobScheduleInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getRedirectTarget(formData: FormData, fallback: string) {
  const redirectTo = getFieldValue(formData, "redirectTo");

  return redirectTo || fallback;
}

function buildRedirect(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function revalidateJobRoutes(job: {
  id: string;
  projectId: string;
  estimateId: string | null;
}) {
  revalidatePath("/jobs");
  revalidatePath("/schedule");
  revalidatePath(`/jobs/${job.id}`);
  revalidatePath(`/projects/${job.projectId}`);
  revalidatePath("/dashboard");
  if (job.estimateId) {
    revalidatePath(`/estimates/${job.estimateId}`);
  }
}

function parseJobInput(formData: FormData) {
  return jobInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    dispatchStatus: getFieldValue(formData, "dispatchStatus"),
    scheduledDate: getFieldValue(formData, "scheduledDate"),
    scheduledStartAt: getFieldValue(formData, "scheduledStartAt"),
    scheduledEndAt: getFieldValue(formData, "scheduledEndAt"),
    scheduleNotes: getFieldValue(formData, "scheduleNotes"),
    crewVendorId: getFieldValue(formData, "crewVendorId"),
    notes: getFieldValue(formData, "notes")
  });
}

function parseJobScheduleInput(formData: FormData) {
  return jobScheduleInputSchema.safeParse({
    scheduledDate: getFieldValue(formData, "scheduledDate"),
    scheduledStartAt: getFieldValue(formData, "scheduledStartAt"),
    scheduledEndAt: getFieldValue(formData, "scheduledEndAt"),
    scheduleNotes: getFieldValue(formData, "scheduleNotes")
  });
}

function parseJobAssignmentInput(formData: FormData) {
  return jobAssignmentInputSchema.safeParse({
    personId: getFieldValue(formData, "personId"),
    vendorId: getFieldValue(formData, "vendorId"),
    role: getFieldValue(formData, "role"),
    assignedStartAt: getFieldValue(formData, "assignedStartAt"),
    assignedEndAt: getFieldValue(formData, "assignedEndAt")
  });
}

export async function createJobAction(formData: FormData) {
  const result = parseJobInput(formData);
  const projectId = getFieldValue(formData, "projectId");
  const estimateId = getFieldValue(formData, "estimateId");

  if (!result.success) {
    redirect(
      buildRedirect("/jobs", {
        projectId,
        estimateId,
        error: result.error.issues[0]?.message ?? "Unable to create job."
      })
    );
  }

  let job;

  try {
    job = await createJob(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/jobs", {
        projectId,
        estimateId,
        error: error instanceof Error ? error.message : "Unable to create job."
      })
    );
  }

  revalidateJobRoutes(job);

  redirect(
    buildRedirect("/jobs", {
      message: "Job was created successfully."
    })
  );
}

export async function updateJobAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const fallbackRedirect = jobId ? `/jobs/${jobId}` : "/jobs";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);
  const result = parseJobInput(formData);

  if (!jobId) {
    redirect(
      buildRedirect("/jobs", {
        error: "Job id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error: result.error.issues[0]?.message ?? "Unable to update job."
      })
    );
  }

  let job;

  try {
    job = await updateJob(jobId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error: error instanceof Error ? error.message : "Unable to update job."
      })
    );
  }

  revalidateJobRoutes(job);

  redirect(
    buildRedirect(redirectTarget, {
      message: "Job was updated successfully."
    })
  );
}

export async function scheduleJobAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const fallbackRedirect = jobId ? `/jobs/${jobId}` : "/jobs";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);
  const result = parseJobScheduleInput(formData);

  if (!jobId) {
    redirect(
      buildRedirect("/jobs", {
        error: "Job id is required for scheduling."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error: result.error.issues[0]?.message ?? "Unable to schedule job."
      })
    );
  }

  let job;

  try {
    job = await scheduleJob(jobId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error: error instanceof Error ? error.message : "Unable to schedule job."
      })
    );
  }

  revalidateJobRoutes(job);

  redirect(
    buildRedirect(redirectTarget, {
      message: "Job schedule was updated successfully."
    })
  );
}

export async function unscheduleJobAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const fallbackRedirect = jobId ? `/jobs/${jobId}` : "/jobs";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);

  if (!jobId) {
    redirect(
      buildRedirect("/jobs", {
        error: "Job id is required for unscheduling."
      })
    );
  }

  let job;

  try {
    job = await unscheduleJob(jobId);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error: error instanceof Error ? error.message : "Unable to unschedule job."
      })
    );
  }

  revalidateJobRoutes(job);

  redirect(
    buildRedirect(redirectTarget, {
      message: "Job was moved back to unscheduled."
    })
  );
}

export async function assignCrewAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const fallbackRedirect = jobId ? `/jobs/${jobId}` : "/jobs";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);
  const projectId = getFieldValue(formData, "projectId");
  const estimateId = getFieldValue(formData, "estimateId");
  const result = parseJobAssignmentInput(formData);

  if (!jobId) {
    redirect(
      buildRedirect("/jobs", {
        error: "Job id is required for crew assignments."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error: result.error.issues[0]?.message ?? "Unable to assign crew."
      })
    );
  }

  try {
    await assignCrew(jobId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error: error instanceof Error ? error.message : "Unable to assign crew."
      })
    );
  }

  revalidateJobRoutes({
    id: jobId,
    projectId,
    estimateId: estimateId || null
  });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Crew assignment was added successfully."
    })
  );
}

export async function unassignCrewAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const fallbackRedirect = jobId ? `/jobs/${jobId}` : "/jobs";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);
  const assignmentId = getFieldValue(formData, "assignmentId");
  const projectId = getFieldValue(formData, "projectId");
  const estimateId = getFieldValue(formData, "estimateId");

  if (!jobId || !assignmentId) {
    redirect(
      buildRedirect("/jobs", {
        error: "Job id and assignment id are required for unassignment."
      })
    );
  }

  try {
    await unassignCrew(jobId, assignmentId);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error: error instanceof Error ? error.message : "Unable to unassign crew."
      })
    );
  }

  revalidateJobRoutes({
    id: jobId,
    projectId,
    estimateId: estimateId || null
  });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Crew assignment was removed successfully."
    })
  );
}
