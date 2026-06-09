"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAssessmentSpace,
  updateAssessmentSpace
} from "./assessment-space-data";
import { assessmentSpaceInputSchema } from "./assessment-space-schemas";

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

function parseAssessmentSpaceInput(formData: FormData) {
  return assessmentSpaceInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    spaceType: getFieldValue(formData, "spaceType") || "area",
    floorLevel: getFieldValue(formData, "floorLevel"),
    lengthFeet: getFieldValue(formData, "lengthFeet"),
    widthFeet: getFieldValue(formData, "widthFeet"),
    squareFeet: getFieldValue(formData, "squareFeet"),
    perimeterFeet: getFieldValue(formData, "perimeterFeet"),
    substrate: getFieldValue(formData, "substrate"),
    currentFlooring: getFieldValue(formData, "currentFlooring"),
    conditionSummary: getFieldValue(formData, "conditionSummary"),
    prepNotes: getFieldValue(formData, "prepNotes"),
    moistureNotes: getFieldValue(formData, "moistureNotes"),
    accessNotes: getFieldValue(formData, "accessNotes"),
    sortOrder: getFieldValue(formData, "sortOrder")
  });
}

function getAssessmentPackagePath(input: {
  projectId: string;
  assessmentPackageId: string;
}) {
  return `/projects/${input.projectId}/assessment-packages/${input.assessmentPackageId}`;
}

function revalidateAssessmentSpaceRoutes(input: {
  projectId: string;
  assessmentPackageId: string;
}) {
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath(getAssessmentPackagePath(input));
}

export async function createAssessmentSpaceAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const assessmentPackageId = getFieldValue(formData, "assessmentPackageId");
  const result = parseAssessmentSpaceInput(formData);

  if (!projectId || !assessmentPackageId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project and assessment package ids are required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(
        getAssessmentPackagePath({ projectId, assessmentPackageId }),
        {
          error:
            result.error.issues[0]?.message ??
            "Unable to create assessment area/space."
        }
      )
    );
  }

  try {
    await createAssessmentSpace(projectId, assessmentPackageId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(
        getAssessmentPackagePath({ projectId, assessmentPackageId }),
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to create assessment area/space."
        }
      )
    );
  }

  revalidateAssessmentSpaceRoutes({ projectId, assessmentPackageId });

  redirect(
    buildRedirect(
      getAssessmentPackagePath({ projectId, assessmentPackageId }),
      {
        message: "Assessment area/space was created."
      }
    )
  );
}

export async function updateAssessmentSpaceAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const assessmentPackageId = getFieldValue(formData, "assessmentPackageId");
  const assessmentSpaceId = getFieldValue(formData, "assessmentSpaceId");
  const result = parseAssessmentSpaceInput(formData);

  if (!projectId || !assessmentPackageId || !assessmentSpaceId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project, assessment package, and area/space ids are required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(
        getAssessmentPackagePath({ projectId, assessmentPackageId }),
        {
          error:
            result.error.issues[0]?.message ??
            "Unable to update assessment area/space."
        }
      )
    );
  }

  try {
    await updateAssessmentSpace(
      projectId,
      assessmentPackageId,
      assessmentSpaceId,
      result.data
    );
  } catch (error) {
    redirect(
      buildRedirect(
        getAssessmentPackagePath({ projectId, assessmentPackageId }),
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to update assessment area/space."
        }
      )
    );
  }

  revalidateAssessmentSpaceRoutes({ projectId, assessmentPackageId });

  redirect(
    buildRedirect(
      getAssessmentPackagePath({ projectId, assessmentPackageId }),
      {
        message: "Assessment area/space was updated."
      }
    )
  );
}
