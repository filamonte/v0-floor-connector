"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { quickCreateEstimateFromContext } from "@/lib/estimates/data";
import {
  createOpportunity,
  updateOpportunity
} from "./data";
import { opportunityInputSchema, opportunityQuickCreateInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value : ""));
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

function parseOpportunityInput(formData: FormData) {
  const measurementAreaLabels = getFieldValues(formData, "measurementAreaLabel");
  const measurementTypes = getFieldValues(formData, "measurementType");
  const measurementValues = getFieldValues(formData, "measurementValue");
  const measurementUnits = getFieldValues(formData, "measurementUnit");
  const measurementQuantities = getFieldValues(formData, "measurementQuantity");
  const measurementCaptureMethods = getFieldValues(
    formData,
    "measurementCaptureMethod"
  );
  const measurementNotes = getFieldValues(formData, "measurementNotes");

  const observationTypes = getFieldValues(formData, "observationType");
  const observationTitles = getFieldValues(formData, "observationTitle");
  const observationBodies = getFieldValues(formData, "observationBody");
  const observationSeverities = getFieldValues(formData, "observationSeverity");

  const attachmentTypes = getFieldValues(formData, "attachmentType");
  const attachmentPaths = getFieldValues(formData, "attachmentStoragePath");
  const attachmentFileNames = getFieldValues(formData, "attachmentFileName");
  const attachmentMimeTypes = getFieldValues(formData, "attachmentMimeType");
  const attachmentCaptions = getFieldValues(formData, "attachmentCaption");
  const attachmentTags = getFieldValues(formData, "attachmentTag");

  const measurements = measurementTypes
    .map((measurementType, index) => ({
      areaLabel: measurementAreaLabels[index] ?? "",
      measurementType,
      valueNumeric: measurementValues[index] ?? "",
      unit: measurementUnits[index] ?? "",
      quantity: measurementQuantities[index] ?? "",
      captureMethod: measurementCaptureMethods[index] ?? "",
      notes: measurementNotes[index] ?? ""
    }))
    .filter((measurement) =>
      Object.values(measurement).some((value) => value.trim().length > 0)
    );

  const observations = observationTitles
    .map((title, index) => ({
      observationType: observationTypes[index] ?? "",
      title,
      body: observationBodies[index] ?? "",
      severity: observationSeverities[index] ?? ""
    }))
    .filter((observation) =>
      Object.values(observation).some((value) => value.trim().length > 0)
    );

  const attachments = attachmentPaths
    .map((storagePath, index) => ({
      attachmentType: attachmentTypes[index] ?? "",
      storagePath,
      fileName: attachmentFileNames[index] ?? "",
      mimeType: attachmentMimeTypes[index] ?? "",
      caption: attachmentCaptions[index] ?? "",
      tag: attachmentTags[index] ?? ""
    }))
    .filter((attachment) =>
      Object.values(attachment).some((value) => value.trim().length > 0)
    );

  return opportunityInputSchema.safeParse({
    title: getFieldValue(formData, "title"),
    status: getFieldValue(formData, "status"),
    source: getFieldValue(formData, "source"),
    sourceDetail: getFieldValue(formData, "sourceDetail"),
    serviceType: getFieldValue(formData, "serviceType"),
    jobType: getFieldValue(formData, "jobType"),
    siteName: getFieldValue(formData, "siteName"),
    contactName: getFieldValue(formData, "contactName"),
    contactCompanyName: getFieldValue(formData, "contactCompanyName"),
    email: getFieldValue(formData, "email"),
    contactPhone: getFieldValue(formData, "contactPhone"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode"),
    siteAssessmentScheduledOn: getFieldValue(formData, "siteAssessmentScheduledOn"),
    siteAssessmentCompletedOn: getFieldValue(formData, "siteAssessmentCompletedOn"),
    requirementsSummary: getFieldValue(formData, "requirementsSummary"),
    notes: getFieldValue(formData, "notes"),
    measurements,
    observations,
    attachments
  });
}

function parseOpportunityQuickCreateInput(formData: FormData) {
  return opportunityQuickCreateInputSchema.safeParse({
    firstName: getFieldValue(formData, "firstName"),
    lastName: getFieldValue(formData, "lastName"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode"),
    phoneNumber: getFieldValue(formData, "phoneNumber"),
    email: getFieldValue(formData, "email"),
    cellPhone: getFieldValue(formData, "cellPhone"),
    leadStage: getFieldValue(formData, "leadStage"),
    companyName: getFieldValue(formData, "companyName")
  });
}

export async function createOpportunityAction(formData: FormData) {
  const result = parseOpportunityInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/leads", {
        error: result.error.issues[0]?.message ?? "Unable to create lead."
      })
    );
  }

  let opportunity;

  try {
    opportunity = await createOpportunity(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/leads", {
        error: error instanceof Error ? error.message : "Unable to create lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunity.id}`);

  redirect(
    buildRedirect("/leads", {
      message: `${opportunity.title} was created successfully.`
    })
  );
}

export async function quickCreateOpportunityAction(formData: FormData) {
  const result = parseOpportunityQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/leads", {
        compose: "1",
        error: result.error.issues[0]?.message ?? "Unable to create lead."
      })
    );
  }

  let opportunity;

  try {
    const contactName = `${result.data.firstName} ${result.data.lastName}`.trim();
    const phoneSummary =
      result.data.phoneNumber === result.data.cellPhone
        ? `Primary phone: ${result.data.cellPhone}`
        : `Phone: ${result.data.phoneNumber}\nCell: ${result.data.cellPhone}`;

    opportunity = await createOpportunity({
      title: null,
      status: result.data.leadStage,
      source: null,
      sourceDetail: null,
      serviceType: null,
      jobType: "Lead intake",
      siteName: result.data.addressLine1,
      contactName,
      contactCompanyName: result.data.companyName,
      email: result.data.email,
      contactPhone: result.data.cellPhone,
      addressLine1: result.data.addressLine1,
      addressLine2: result.data.addressLine2,
      city: result.data.city,
      stateRegion: result.data.stateRegion,
      postalCode: result.data.postalCode,
      countryCode: result.data.countryCode,
      siteAssessmentScheduledOn: null,
      siteAssessmentCompletedOn: null,
      requirementsSummary: null,
      notes: phoneSummary,
      measurements: [],
      observations: [],
      attachments: []
    });
  } catch (error) {
    redirect(
      buildRedirect("/leads", {
        compose: "1",
        error: error instanceof Error ? error.message : "Unable to create lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunity.id}`);

  redirect(
    buildRedirect(`/leads/${opportunity.id}`, {
      message: `${opportunity.title} was created. Finish qualification and capture in this workspace.`
    })
  );
}

export async function updateOpportunityAction(formData: FormData) {
  const opportunityId = getFieldValue(formData, "opportunityId");
  const result = parseOpportunityInput(formData);

  if (!opportunityId) {
    redirect(
      buildRedirect("/leads", {
        error: "Lead id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update lead."
      })
    );
  }

  let opportunity;

  try {
    opportunity = await updateOpportunity(opportunityId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error: error instanceof Error ? error.message : "Unable to update lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunity.id}`);

  redirect(
    buildRedirect(`/leads/${opportunity.id}`, {
      message: `${opportunity.title} was updated successfully.`
    })
  );
}

export async function startEstimateFromOpportunityAction(formData: FormData) {
  const opportunityId = getFieldValue(formData, "opportunityId");

  if (!opportunityId) {
    redirect(
      buildRedirect("/leads", {
        error: "Lead id is required to start the estimate flow."
      })
    );
  }

  let estimate;

  try {
    estimate = await quickCreateEstimateFromContext({
      creationMode: "opportunity",
      opportunityId,
      customerId: null,
      projectId: null,
      projectName: null,
      title: ""
    });
  } catch (error) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start the estimate flow."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunityId}`);
  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath(`/estimates/${estimate.id}/edit`);

  redirect(
    buildRedirect(`/estimates/${estimate.id}/edit`, {
      message: "Estimate created from the opportunity. Finish the scope in the estimate workspace."
    })
  );
}
