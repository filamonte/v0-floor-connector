import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { compareOpportunityStatuses } from "@floorconnector/domain";
import type {
  Opportunity as OpportunityRecord,
  OpportunityAttachment as OpportunityAttachmentRecord,
  OpportunityObservation as OpportunityObservationRecord,
  OpportunityMeasurement as OpportunityMeasurementRecord,
  SiteAssessmentStatus
} from "@floorconnector/types";

import {
  createContactForOrganization,
  listContactsByIds,
  updateContactForOrganization
} from "@/lib/contacts/data";
import { ensurePrimaryCustomerContact } from "@/lib/customers/primary-contact";
import type { OpportunityFollowUpInput, OpportunityInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { getProjectById } from "@/lib/projects/data";
import { syncProjectCommercialReadiness } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OpportunityRow = {
  id: string;
  company_id: string;
  primary_contact_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  status: OpportunityRecord["status"];
  title: string;
  source: string | null;
  source_detail: string | null;
  service_type: string | null;
  job_type: string | null;
  site_name: string | null;
  prospect_name: string;
  prospect_company_name: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  notes: string | null;
  next_follow_up_at: string | null;
  next_follow_up_note: string | null;
  site_assessment_status: SiteAssessmentStatus;
  site_assessment_scheduled_at: string | null;
  site_assessment_completed_at: string | null;
  requirements_summary: string | null;
  qualified_at: string | null;
  converted_at: string | null;
  lost_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

type ScheduleOpportunityAssessmentRow = {
  id: string;
  company_id: string;
  primary_contact_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  status: OpportunityRecord["status"];
  title: string;
  job_type: string | null;
  site_name: string | null;
  prospect_name: string;
  site_assessment_scheduled_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

type OpportunityMeasurementRow = {
  id: string;
  company_id: string;
  opportunity_id: string;
  area_label: string | null;
  measurement_type: string;
  value_numeric: string | number;
  unit: string;
  quantity: number | null;
  capture_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type OpportunityAttachmentRow = {
  id: string;
  company_id: string;
  opportunity_id: string;
  attachment_type: OpportunityAttachmentRecord["attachmentType"];
  storage_path: string;
  file_name: string;
  mime_type: string;
  caption: string | null;
  tag: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

type OpportunityObservationRow = {
  id: string;
  company_id: string;
  opportunity_id: string;
  observation_type: string;
  title: string;
  body: string | null;
  severity: OpportunityObservationRecord["severity"];
  related_attachment_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type OpportunityScope = {
  userId: string;
  organizationId: string;
};

type IdRow = {
  id: string;
};

type OpportunityDisplayTitleInput = {
  title?: string | null;
  contactName?: string | null;
  jobType?: string | null;
  siteName?: string | null;
};

type EstimateCustomerRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
};

type CustomerContactLookupRow = {
  contact_id: string;
  contacts: {
    id: string;
    display_name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type OpportunityListItem = OpportunityRecord & {
  primaryContact: Awaited<ReturnType<typeof listContactsByIds>> extends Map<
    string,
    infer T
  >
    ? T | null
    : never;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
};

export type ScheduleOpportunityAssessment = {
  id: string;
  customerId: string | null;
  projectId: string | null;
  status: OpportunityRecord["status"];
  title: string;
  siteName: string | null;
  siteAssessmentScheduledAt: string;
  primaryContact: {
    displayName: string | null;
  } | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
};

export type OpportunityDetail = OpportunityListItem & {
  measurements: OpportunityMeasurementRecord[];
  attachments: OpportunityAttachmentRecord[];
  observations: OpportunityObservationRecord[];
};

const opportunitySelect = `
  id,
  company_id,
  primary_contact_id,
  customer_id,
  project_id,
  status,
  title,
  source,
  source_detail,
  service_type,
  job_type,
  site_name,
  prospect_name,
  prospect_company_name,
  email,
  phone,
  address_line_1,
  address_line_2,
  city,
  state_region,
  postal_code,
  country_code,
  notes,
  next_follow_up_at,
  next_follow_up_note,
  site_assessment_status,
  site_assessment_scheduled_at,
  site_assessment_completed_at,
  requirements_summary,
  qualified_at,
  converted_at,
  lost_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  )
`;

const scheduleOpportunityAssessmentSelect = `
  id,
  company_id,
  primary_contact_id,
  customer_id,
  project_id,
  status,
  title,
  job_type,
  site_name,
  prospect_name,
  site_assessment_scheduled_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  )
`;

const opportunityMeasurementSelect = `
  id,
  company_id,
  opportunity_id,
  area_label,
  measurement_type,
  value_numeric,
  unit,
  quantity,
  capture_method,
  notes,
  created_at,
  updated_at
`;

const opportunityAttachmentSelect = `
  id,
  company_id,
  opportunity_id,
  attachment_type,
  storage_path,
  file_name,
  mime_type,
  caption,
  tag,
  uploaded_by,
  created_at,
  updated_at
`;

const opportunityObservationSelect = `
  id,
  company_id,
  opportunity_id,
  observation_type,
  title,
  body,
  severity,
  related_attachment_id,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

function buildOpportunityDisplayTitle(input: OpportunityDisplayTitleInput) {
  if (input.title && input.title.trim().length > 0) {
    return input.title.trim();
  }

  const contactName = input.contactName?.trim();
  const jobType = input.jobType?.trim();
  const siteName = input.siteName?.trim();
  const base = [contactName, jobType, siteName].filter(
    (value): value is string => Boolean(value && value.length > 0)
  );

  if (base.length > 0) {
    return base.join(" - ").slice(0, 160);
  }

  return "Untitled opportunity";
}

function isOpportunityRow(value: unknown): value is OpportunityRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OpportunityRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    (row.primary_contact_id === null ||
      typeof row.primary_contact_id === "string") &&
    (row.customer_id === null || typeof row.customer_id === "string") &&
    (row.project_id === null || typeof row.project_id === "string") &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    typeof row.prospect_name === "string" &&
    typeof row.site_assessment_status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isOpportunityRowArray(value: unknown): value is OpportunityRow[] {
  return Array.isArray(value) && value.every((row) => isOpportunityRow(row));
}

function isScheduleOpportunityAssessmentRow(
  value: unknown
): value is ScheduleOpportunityAssessmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ScheduleOpportunityAssessmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    (row.primary_contact_id === null ||
      typeof row.primary_contact_id === "string") &&
    (row.customer_id === null || typeof row.customer_id === "string") &&
    (row.project_id === null || typeof row.project_id === "string") &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    (row.job_type === null || typeof row.job_type === "string") &&
    (row.site_name === null || typeof row.site_name === "string") &&
    typeof row.prospect_name === "string" &&
    typeof row.site_assessment_scheduled_at === "string"
  );
}

function isScheduleOpportunityAssessmentRowArray(
  value: unknown
): value is ScheduleOpportunityAssessmentRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isScheduleOpportunityAssessmentRow(row))
  );
}

function isOpportunityMeasurementRow(
  value: unknown
): value is OpportunityMeasurementRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OpportunityMeasurementRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.opportunity_id === "string" &&
    typeof row.measurement_type === "string" &&
    (typeof row.value_numeric === "string" ||
      typeof row.value_numeric === "number") &&
    typeof row.unit === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isOpportunityMeasurementRowArray(
  value: unknown
): value is OpportunityMeasurementRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isOpportunityMeasurementRow(row))
  );
}

function isOpportunityAttachmentRow(
  value: unknown
): value is OpportunityAttachmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OpportunityAttachmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.opportunity_id === "string" &&
    typeof row.attachment_type === "string" &&
    typeof row.storage_path === "string" &&
    typeof row.file_name === "string" &&
    typeof row.mime_type === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isOpportunityAttachmentRowArray(
  value: unknown
): value is OpportunityAttachmentRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isOpportunityAttachmentRow(row))
  );
}

function isOpportunityObservationRow(
  value: unknown
): value is OpportunityObservationRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OpportunityObservationRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.opportunity_id === "string" &&
    typeof row.observation_type === "string" &&
    typeof row.title === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isOpportunityObservationRowArray(
  value: unknown
): value is OpportunityObservationRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isOpportunityObservationRow(row))
  );
}

function isIdRow(value: unknown): value is IdRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as Partial<IdRow>).id === "string";
}

function mapOpportunity(
  row: OpportunityRow,
  primaryContact?: OpportunityListItem["primaryContact"]
): OpportunityRecord {
  const resolvedContact = primaryContact ?? null;

  return {
    id: row.id,
    organizationId: row.company_id,
    primaryContactId: row.primary_contact_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    status: row.status,
    title: buildOpportunityDisplayTitle({
      title: row.title,
      contactName: resolvedContact?.displayName ?? row.prospect_name,
      jobType: row.job_type,
      siteName: row.site_name
    }),
    source: row.source,
    sourceDetail: row.source_detail,
    serviceType: row.service_type,
    jobType: row.job_type,
    siteName: row.site_name,
    prospectName: resolvedContact?.displayName ?? row.prospect_name,
    prospectCompanyName:
      resolvedContact?.companyName ?? row.prospect_company_name,
    email: resolvedContact?.email ?? row.email,
    phone: resolvedContact?.phone ?? row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    notes: row.notes,
    nextFollowUpAt: row.next_follow_up_at,
    nextFollowUpNote: row.next_follow_up_note,
    siteAssessmentStatus: row.site_assessment_status,
    siteAssessmentScheduledAt: row.site_assessment_scheduled_at,
    siteAssessmentCompletedAt: row.site_assessment_completed_at,
    requirementsSummary: row.requirements_summary,
    qualifiedAt: row.qualified_at,
    convertedAt: row.converted_at,
    lostAt: row.lost_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOpportunityMeasurement(
  row: OpportunityMeasurementRow
): OpportunityMeasurementRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    areaLabel: row.area_label,
    measurementType: row.measurement_type,
    valueNumeric: Number(row.value_numeric).toFixed(2),
    unit: row.unit,
    quantity: row.quantity,
    captureMethod:
      row.capture_method as OpportunityMeasurementRecord["captureMethod"],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOpportunityAttachment(
  row: OpportunityAttachmentRow
): OpportunityAttachmentRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    attachmentType: row.attachment_type,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    caption: row.caption,
    tag: row.tag,
    uploadedByUserId: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOpportunityObservation(
  row: OpportunityObservationRow
): OpportunityObservationRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    observationType: row.observation_type,
    title: row.title,
    body: row.body,
    severity: row.severity,
    relatedAttachmentId: row.related_attachment_id,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toStoredAssessmentTimestamp(
  date: string | null,
  time?: string | null
) {
  if (!date) {
    return null;
  }

  if (!time) {
    return `${date}T12:00:00.000Z`;
  }

  return new Date(`${date}T${time}:00`).toISOString();
}

function resolveSiteAssessmentState(
  status: OpportunityRecord["status"],
  input: {
    siteAssessmentScheduledOn: string | null;
    siteAssessmentScheduledTime?: string | null;
    siteAssessmentCompletedOn: string | null;
  },
  current?: Pick<
    OpportunityRecord,
    | "siteAssessmentStatus"
    | "siteAssessmentScheduledAt"
    | "siteAssessmentCompletedAt"
  >
) {
  const scheduledAt =
    toStoredAssessmentTimestamp(
      input.siteAssessmentScheduledOn,
      input.siteAssessmentScheduledTime
    ) ??
    current?.siteAssessmentScheduledAt ??
    null;
  const completedAt =
    toStoredAssessmentTimestamp(input.siteAssessmentCompletedOn) ??
    current?.siteAssessmentCompletedAt ??
    null;

  if (completedAt || status === "site_assessment_complete") {
    return {
      siteAssessmentStatus: "completed" as const,
      siteAssessmentScheduledAt: scheduledAt ?? completedAt,
      siteAssessmentCompletedAt: completedAt ?? scheduledAt
    };
  }

  if (scheduledAt || status === "site_assessment_scheduled") {
    return {
      siteAssessmentStatus: "scheduled" as const,
      siteAssessmentScheduledAt: scheduledAt,
      siteAssessmentCompletedAt: null
    };
  }

  return {
    siteAssessmentStatus: "pending" as const,
    siteAssessmentScheduledAt: null,
    siteAssessmentCompletedAt: null
  };
}

function mapOpportunityListItem(
  row: OpportunityRow,
  primaryContact: OpportunityListItem["primaryContact"]
): OpportunityListItem {
  return {
    ...mapOpportunity(row, primaryContact),
    primaryContact,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null
  };
}

function mapScheduleOpportunityAssessment(
  row: ScheduleOpportunityAssessmentRow,
  primaryContact: OpportunityListItem["primaryContact"]
): ScheduleOpportunityAssessment {
  return {
    id: row.id,
    customerId: row.customer_id,
    projectId: row.project_id,
    status: row.status,
    title: buildOpportunityDisplayTitle({
      title: row.title,
      contactName: primaryContact?.displayName ?? row.prospect_name,
      jobType: row.job_type,
      siteName: row.site_name
    }),
    siteName: row.site_name,
    siteAssessmentScheduledAt: row.site_assessment_scheduled_at,
    primaryContact: primaryContact
      ? {
          displayName: primaryContact.displayName
        }
      : null,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null
  };
}

async function getOpportunityScope(
  next = "/leads"
): Promise<OpportunityScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

export async function requireOpportunityScope(next = "/leads") {
  const scope = await getOpportunityScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for leads yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

function sortOpportunities(opportunities: OpportunityListItem[]) {
  return opportunities.sort((left, right) => {
    const statusComparison = compareOpportunityStatuses(
      left.status,
      right.status
    );

    if (statusComparison !== 0) {
      return statusComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

async function hydrateOpportunityListItems(
  organizationId: string,
  rows: OpportunityRow[]
): Promise<OpportunityListItem[]> {
  const contactMap = await listContactsByIds({
    organizationId,
    contactIds: rows
      .map((row) => row.primary_contact_id)
      .filter((contactId): contactId is string => Boolean(contactId))
  });

  return rows.map((row) =>
    mapOpportunityListItem(
      row,
      row.primary_contact_id
        ? (contactMap.get(row.primary_contact_id) ?? null)
        : null
    )
  );
}

async function getOpportunityMeasurements(
  organizationId: string,
  opportunityId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunity_measurements")
    .select(opportunityMeasurementSelect)
    .eq("company_id", organizationId)
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load opportunity measurements: ${response.error.message}`
    );
  }

  if (!isOpportunityMeasurementRowArray(data)) {
    return [];
  }

  return data.map(mapOpportunityMeasurement);
}

async function getOpportunityAttachments(
  organizationId: string,
  opportunityId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunity_attachments")
    .select(opportunityAttachmentSelect)
    .eq("company_id", organizationId)
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load opportunity attachments: ${response.error.message}`
    );
  }

  if (!isOpportunityAttachmentRowArray(data)) {
    return [];
  }

  return data.map(mapOpportunityAttachment);
}

async function getOpportunityObservations(
  organizationId: string,
  opportunityId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunity_observations")
    .select(opportunityObservationSelect)
    .eq("company_id", organizationId)
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load opportunity observations: ${response.error.message}`
    );
  }

  if (!isOpportunityObservationRowArray(data)) {
    return [];
  }

  return data.map(mapOpportunityObservation);
}

async function replaceOpportunityMeasurements(input: {
  organizationId: string;
  userId: string;
  opportunityId: string;
  measurements: OpportunityInput["measurements"];
}) {
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("opportunity_measurements")
    .delete()
    .eq("company_id", input.organizationId)
    .eq("opportunity_id", input.opportunityId);

  if (deleteResponse.error) {
    throw new Error(
      `Unable to clear existing opportunity measurements: ${deleteResponse.error.message}`
    );
  }

  if (input.measurements.length === 0) {
    return;
  }

  const insertResponse = await supabase.from("opportunity_measurements").insert(
    input.measurements.map((measurement) => ({
      company_id: input.organizationId,
      opportunity_id: input.opportunityId,
      area_label: measurement.areaLabel,
      measurement_type: measurement.measurementType,
      value_numeric: measurement.valueNumeric,
      unit: measurement.unit,
      quantity: measurement.quantity ? Number(measurement.quantity) : null,
      capture_method: measurement.captureMethod,
      notes: measurement.notes,
      created_by: input.userId,
      updated_by: input.userId
    }))
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to save opportunity measurements: ${insertResponse.error.message}`
    );
  }
}

async function replaceOpportunityAttachments(input: {
  organizationId: string;
  userId: string;
  opportunityId: string;
  attachments: OpportunityInput["attachments"];
}) {
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("opportunity_attachments")
    .delete()
    .eq("company_id", input.organizationId)
    .eq("opportunity_id", input.opportunityId);

  if (deleteResponse.error) {
    throw new Error(
      `Unable to clear existing opportunity attachments: ${deleteResponse.error.message}`
    );
  }

  if (input.attachments.length === 0) {
    return;
  }

  const insertResponse = await supabase.from("opportunity_attachments").insert(
    input.attachments.map((attachment) => ({
      company_id: input.organizationId,
      opportunity_id: input.opportunityId,
      attachment_type: attachment.attachmentType,
      storage_path: attachment.storagePath,
      file_name: attachment.fileName,
      mime_type: attachment.mimeType,
      caption: attachment.caption,
      tag: attachment.tag,
      uploaded_by: input.userId
    }))
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to save opportunity attachments: ${insertResponse.error.message}`
    );
  }
}

async function replaceOpportunityObservations(input: {
  organizationId: string;
  userId: string;
  opportunityId: string;
  observations: OpportunityInput["observations"];
}) {
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("opportunity_observations")
    .delete()
    .eq("company_id", input.organizationId)
    .eq("opportunity_id", input.opportunityId);

  if (deleteResponse.error) {
    throw new Error(
      `Unable to clear existing opportunity observations: ${deleteResponse.error.message}`
    );
  }

  if (input.observations.length === 0) {
    return;
  }

  const insertResponse = await supabase.from("opportunity_observations").insert(
    input.observations.map((observation) => ({
      company_id: input.organizationId,
      opportunity_id: input.opportunityId,
      observation_type: observation.observationType,
      title: observation.title,
      body: observation.body,
      severity: observation.severity,
      created_by: input.userId,
      updated_by: input.userId
    }))
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to save opportunity observations: ${insertResponse.error.message}`
    );
  }
}

async function replaceOpportunityStructuredIntake(input: {
  organizationId: string;
  userId: string;
  opportunityId: string;
  opportunity: OpportunityInput;
}) {
  await Promise.all([
    replaceOpportunityMeasurements({
      organizationId: input.organizationId,
      userId: input.userId,
      opportunityId: input.opportunityId,
      measurements: input.opportunity.measurements
    }),
    replaceOpportunityAttachments({
      organizationId: input.organizationId,
      userId: input.userId,
      opportunityId: input.opportunityId,
      attachments: input.opportunity.attachments
    }),
    replaceOpportunityObservations({
      organizationId: input.organizationId,
      userId: input.userId,
      opportunityId: input.opportunityId,
      observations: input.opportunity.observations
    })
  ]);
}

async function getOpportunityRecordById(
  organizationId: string,
  opportunityId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("company_id", organizationId)
    .eq("id", opportunityId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the lead: ${response.error.message}`);
  }

  return isOpportunityRow(data) ? data : null;
}

export const listOpportunities = cache(
  async (): Promise<OpportunityListItem[]> => {
    const scope = await requireOpportunityScope("/leads");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("opportunities")
      .select(opportunitySelect)
      .eq("company_id", scope.organizationId)
      .order("updated_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(`Unable to load leads: ${response.error.message}`);
    }

    if (!isOpportunityRowArray(data)) {
      return [];
    }

    return sortOpportunities(
      await hydrateOpportunityListItems(scope.organizationId, data)
    );
  }
);

export const listScheduleOpportunityAssessments = cache(
  async (): Promise<ScheduleOpportunityAssessment[]> => {
    const scope = await requireOpportunityScope("/schedule");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("opportunities")
      .select(scheduleOpportunityAssessmentSelect)
      .eq("company_id", scope.organizationId)
      .eq("status", "site_assessment_scheduled")
      .not("site_assessment_scheduled_at", "is", null)
      .order("site_assessment_scheduled_at", { ascending: true });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load scheduled lead assessments: ${response.error.message}`
      );
    }

    if (!isScheduleOpportunityAssessmentRowArray(data)) {
      return [];
    }

    const contactMap = await listContactsByIds({
      organizationId: scope.organizationId,
      contactIds: data
        .map((row) => row.primary_contact_id)
        .filter((contactId): contactId is string => Boolean(contactId))
    });

    return data.map((row) =>
      mapScheduleOpportunityAssessment(
        row,
        row.primary_contact_id
          ? (contactMap.get(row.primary_contact_id) ?? null)
          : null
      )
    );
  }
);

export async function getOpportunityById(
  opportunityId: string,
  next = "/leads"
): Promise<OpportunityDetail | null> {
  const scope = await requireOpportunityScope(next);
  const row = await getOpportunityRecordById(
    scope.organizationId,
    opportunityId
  );

  if (!row) {
    return null;
  }

  const [listItem, measurements, attachments, observations] = await Promise.all(
    [
      hydrateOpportunityListItems(scope.organizationId, [row]).then(
        (items) => items[0] ?? null
      ),
      getOpportunityMeasurements(scope.organizationId, opportunityId),
      getOpportunityAttachments(scope.organizationId, opportunityId),
      getOpportunityObservations(scope.organizationId, opportunityId)
    ]
  );

  if (!listItem) {
    return null;
  }

  return {
    ...listItem,
    measurements,
    attachments,
    observations
  };
}

export async function createOpportunity(input: OpportunityInput) {
  const scope = await requireOpportunityScope("/leads");
  const supabase = await getSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const siteAssessmentState = resolveSiteAssessmentState(input.status, input);
  const generatedTitle = buildOpportunityDisplayTitle({
    title: input.title,
    contactName: input.contactName,
    jobType: input.jobType,
    siteName: input.siteName
  });
  const primaryContact = await createContactForOrganization({
    organizationId: scope.organizationId,
    userId: scope.userId,
    contact: {
      displayName: input.contactName,
      companyName: input.contactCompanyName,
      email: input.email,
      phone: input.contactPhone,
      contactKind: "customer_contact",
      notes: null
    }
  });

  const response = await supabase
    .from("opportunities")
    .insert({
      company_id: scope.organizationId,
      primary_contact_id: primaryContact.id,
      status: input.status,
      title: generatedTitle,
      source: input.source,
      source_detail: input.sourceDetail,
      service_type: input.serviceType,
      job_type: input.jobType,
      site_name: input.siteName,
      prospect_name: primaryContact.displayName,
      prospect_company_name: primaryContact.companyName,
      email: primaryContact.email,
      phone: primaryContact.phone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      notes: input.notes,
      site_assessment_status: siteAssessmentState.siteAssessmentStatus,
      site_assessment_scheduled_at:
        siteAssessmentState.siteAssessmentScheduledAt,
      site_assessment_completed_at:
        siteAssessmentState.siteAssessmentCompletedAt,
      requirements_summary: input.requirementsSummary,
      qualified_at: input.status === "qualified" ? nowIso : null,
      lost_at: input.status === "lost" ? nowIso : null,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;

  if (response.error || !isIdRow(data)) {
    throw new Error(
      `Unable to create the lead: ${response.error?.message ?? "Unknown error."}`
    );
  }

  try {
    await replaceOpportunityStructuredIntake({
      organizationId: scope.organizationId,
      userId: scope.userId,
      opportunityId: data.id,
      opportunity: input
    });
  } catch (error) {
    await supabase
      .from("opportunities")
      .delete()
      .eq("company_id", scope.organizationId)
      .eq("id", data.id);
    throw error;
  }

  const created = await getOpportunityById(data.id, `/leads/${data.id}`);

  if (!created) {
    throw new Error("Unexpected lead response after create.");
  }

  return created;
}

export async function updateOpportunity(
  opportunityId: string,
  input: OpportunityInput
) {
  const scope = await requireOpportunityScope(`/leads/${opportunityId}`);
  const currentOpportunity = await getOpportunityById(
    opportunityId,
    `/leads/${opportunityId}`
  );

  if (!currentOpportunity) {
    throw new Error("Lead not found for this organization.");
  }

  const primaryContact = currentOpportunity.primaryContactId
    ? await updateContactForOrganization({
        organizationId: scope.organizationId,
        userId: scope.userId,
        contactId: currentOpportunity.primaryContactId,
        contact: {
          displayName: input.contactName,
          companyName: input.contactCompanyName,
          email: input.email,
          phone: input.contactPhone,
          contactKind: "customer_contact",
          notes: null
        }
      })
    : await createContactForOrganization({
        organizationId: scope.organizationId,
        userId: scope.userId,
        contact: {
          displayName: input.contactName,
          companyName: input.contactCompanyName,
          email: input.email,
          phone: input.contactPhone,
          contactKind: "customer_contact",
          notes: null
        }
      });

  if (currentOpportunity.customerId) {
    await ensurePrimaryCustomerContact({
      organizationId: scope.organizationId,
      userId: scope.userId,
      customerId: currentOpportunity.customerId,
      contactId: primaryContact.id,
      name: primaryContact.displayName,
      companyName: primaryContact.companyName,
      email: primaryContact.email,
      phone: primaryContact.phone,
      source: "opportunity_conversion"
    });

    await syncCustomerDirectEmailFromOpportunityContact({
      organizationId: scope.organizationId,
      userId: scope.userId,
      customerId: currentOpportunity.customerId,
      previousEmail:
        currentOpportunity.primaryContact?.email ?? currentOpportunity.email,
      nextEmail: primaryContact.email
    });
  }

  const supabase = await getSupabaseServerClient();
  const generatedTitle = buildOpportunityDisplayTitle({
    title: input.title,
    contactName: input.contactName,
    jobType: input.jobType,
    siteName: input.siteName
  });
  const siteAssessmentState = resolveSiteAssessmentState(
    input.status,
    input,
    currentOpportunity
  );
  const qualifiedAt =
    input.status === "qualified" && !currentOpportunity.qualifiedAt
      ? new Date().toISOString()
      : currentOpportunity.qualifiedAt;
  const lostAt =
    input.status === "lost"
      ? (currentOpportunity.lostAt ?? new Date().toISOString())
      : null;

  const response = await supabase
    .from("opportunities")
    .update({
      primary_contact_id: primaryContact.id,
      status: input.status,
      title: generatedTitle,
      source: input.source,
      source_detail: input.sourceDetail,
      service_type: input.serviceType,
      job_type: input.jobType,
      site_name: input.siteName,
      prospect_name: primaryContact.displayName,
      prospect_company_name: primaryContact.companyName,
      email: primaryContact.email,
      phone: primaryContact.phone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      notes: input.notes,
      site_assessment_status: siteAssessmentState.siteAssessmentStatus,
      site_assessment_scheduled_at:
        siteAssessmentState.siteAssessmentScheduledAt,
      site_assessment_completed_at:
        siteAssessmentState.siteAssessmentCompletedAt,
      requirements_summary: input.requirementsSummary,
      qualified_at: qualifiedAt,
      lost_at: lostAt,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", opportunityId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the lead: ${response.error.message}`);
  }

  if (!isIdRow(data)) {
    throw new Error("Lead not found for this organization.");
  }

  await replaceOpportunityStructuredIntake({
    organizationId: scope.organizationId,
    userId: scope.userId,
    opportunityId,
    opportunity: input
  });

  const updated = await getOpportunityById(
    opportunityId,
    `/leads/${opportunityId}`
  );

  if (!updated) {
    throw new Error("Lead not found for this organization.");
  }

  if (updated.projectId) {
    await syncProjectCommercialReadiness({
      organizationId: scope.organizationId,
      projectId: updated.projectId
    });
  }

  return updated;
}

export async function updateOpportunityFollowUp(
  input: OpportunityFollowUpInput
) {
  const scope = await requireOpportunityScope(`/leads/${input.opportunityId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .update({
      next_follow_up_at: input.nextFollowUpAt,
      next_follow_up_note: input.nextFollowUpNote,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.opportunityId)
    .select(opportunitySelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update the lead follow-up: ${response.error.message}`
    );
  }

  if (!isOpportunityRow(data)) {
    throw new Error("Lead not found for this organization.");
  }

  const hydrated = await hydrateOpportunityListItems(scope.organizationId, [
    data
  ]);
  return hydrated[0] ?? null;
}

export async function getOpportunityByProjectId(
  projectId: string,
  next = "/projects"
) {
  const scope = await requireOpportunityScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load the project lead context: ${response.error.message}`
    );
  }

  if (!isOpportunityRow(data)) {
    return null;
  }

  const hydrated = await hydrateOpportunityListItems(scope.organizationId, [
    data
  ]);
  return hydrated[0] ?? null;
}

export async function ensureOpportunityEstimateFlow(opportunityId: string) {
  const scope = await requireOpportunityScope(`/leads/${opportunityId}`);
  const opportunity = await getOpportunityById(
    opportunityId,
    `/leads/${opportunityId}`
  );

  if (!opportunity) {
    throw new Error("Lead not found for this organization.");
  }

  if (!opportunity.primaryContact) {
    throw new Error(
      "Lead is missing its primary contact. Save the lead contact before starting the estimate flow."
    );
  }

  const supabase = await getSupabaseServerClient();
  let customerId = opportunity.customerId;
  let projectId = opportunity.projectId;

  if (!customerId) {
    const financialSettings = await getOrganizationFinancialSettings(
      scope.organizationId
    );
    const customerResponse = await supabase
      .from("customers")
      .insert({
        company_id: scope.organizationId,
        name: opportunity.primaryContact.displayName,
        company_name: opportunity.primaryContact.companyName,
        phone: opportunity.primaryContact.phone,
        email: opportunity.primaryContact.email,
        address_line_1: opportunity.addressLine1,
        address_line_2: opportunity.addressLine2,
        city: opportunity.city,
        state_region: opportunity.stateRegion,
        postal_code: opportunity.postalCode,
        country_code: opportunity.countryCode,
        notes: opportunity.notes,
        is_tax_exempt: false,
        retainage_percentage_default:
          financialSettings.defaultRetainagePercentage,
        created_by: scope.userId,
        updated_by: scope.userId
      })
      .select("id")
      .single();
    const customerData: unknown = customerResponse.data;

    if (customerResponse.error || !isIdRow(customerData)) {
      throw new Error(
        `Unable to create a customer from this lead: ${customerResponse.error?.message ?? "Unknown error."}`
      );
    }

    customerId = customerData.id;
  } else {
    await syncCustomerDirectEmailFromOpportunityContact({
      organizationId: scope.organizationId,
      userId: scope.userId,
      customerId,
      previousEmail: opportunity.email,
      nextEmail: opportunity.primaryContact.email
    });
  }

  await ensurePrimaryCustomerContact({
    organizationId: scope.organizationId,
    userId: scope.userId,
    customerId,
    contactId: opportunity.primaryContact.id,
    name: opportunity.primaryContact.displayName,
    companyName: opportunity.primaryContact.companyName,
    email: opportunity.primaryContact.email,
    phone: opportunity.primaryContact.phone,
    source: "opportunity_conversion"
  });

  if (!projectId) {
    const projectResponse = await supabase
      .from("projects")
      .insert({
        company_id: scope.organizationId,
        customer_id: customerId,
        name: opportunity.siteName ?? opportunity.title,
        status: "estimating",
        description: opportunity.requirementsSummary ?? opportunity.notes,
        address_line_1: opportunity.addressLine1,
        address_line_2: opportunity.addressLine2,
        city: opportunity.city,
        state_region: opportunity.stateRegion,
        postal_code: opportunity.postalCode,
        country_code: opportunity.countryCode,
        created_by: scope.userId,
        updated_by: scope.userId
      })
      .select("id")
      .single();
    const projectData: unknown = projectResponse.data;

    if (projectResponse.error || !isIdRow(projectData)) {
      throw new Error(
        `Unable to create a project from this lead: ${projectResponse.error?.message ?? "Unknown error."}`
      );
    }

    projectId = projectData.id;
  } else if (opportunity.requirementsSummary || opportunity.notes) {
    const projectSeedResponse = await supabase
      .from("projects")
      .update({
        description: opportunity.requirementsSummary ?? opportunity.notes,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", projectId)
      .is("description", null);

    if (projectSeedResponse.error) {
      throw new Error(
        `Unable to carry assessment context into the project: ${projectSeedResponse.error.message}`
      );
    }
  }

  if (!customerId || !projectId) {
    throw new Error(
      "Lead could not be linked to the canonical customer and project chain."
    );
  }

  const conversionTimestamp =
    opportunity.convertedAt ?? new Date().toISOString();
  const updateResponse = await supabase
    .from("opportunities")
    .update({
      customer_id: customerId,
      project_id: projectId,
      status: "estimating",
      site_assessment_status:
        opportunity.siteAssessmentStatus === "pending"
          ? "completed"
          : opportunity.siteAssessmentStatus,
      site_assessment_completed_at:
        opportunity.siteAssessmentCompletedAt ??
        opportunity.siteAssessmentScheduledAt ??
        new Date().toISOString(),
      qualified_at: opportunity.qualifiedAt ?? new Date().toISOString(),
      converted_at: conversionTimestamp,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", opportunity.id);

  if (updateResponse.error) {
    throw new Error(
      `Unable to prepare the estimate flow: ${updateResponse.error.message}`
    );
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId
  });

  return {
    opportunityId: opportunity.id,
    customerId,
    projectId
  };
}

async function getCustomerForEstimateFlow(
  organizationId: string,
  customerId: string
): Promise<EstimateCustomerRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select(
      `
        id,
        name,
        company_name,
        email,
        phone,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code
      `
    )
    .eq("company_id", organizationId)
    .eq("id", customerId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load the selected customer: ${response.error.message}`
    );
  }

  const data = response.data as EstimateCustomerRow | null;
  return data?.id ? data : null;
}

async function syncCustomerDirectEmailFromOpportunityContact(input: {
  organizationId: string;
  userId: string;
  customerId: string;
  previousEmail: string | null;
  nextEmail: string | null;
}) {
  const nextEmail = input.nextEmail?.trim() ?? null;

  if (!nextEmail) {
    return;
  }

  const customer = await getCustomerForEstimateFlow(
    input.organizationId,
    input.customerId
  );

  if (!customer) {
    return;
  }

  const currentCustomerEmail = customer.email?.trim() ?? null;
  const previousEmail = input.previousEmail?.trim() ?? null;
  const shouldUpdateCustomerEmail =
    currentCustomerEmail === null || currentCustomerEmail === previousEmail;

  if (!shouldUpdateCustomerEmail || currentCustomerEmail === nextEmail) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .update({
      email: nextEmail,
      updated_by: input.userId
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.customerId);

  if (response.error) {
    throw new Error(
      `Unable to sync the customer email from the lead contact: ${response.error.message}`
    );
  }
}

async function getPrimaryCustomerContactForEstimateFlow(
  organizationId: string,
  customerId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        contact_id,
        contacts:contacts!customer_contacts_contact_company_fkey (
          id,
          display_name,
          company_name,
          email,
          phone
        )
      `
    )
    .eq("company_id", organizationId)
    .eq("customer_id", customerId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load the customer's primary contact: ${response.error.message}`
    );
  }

  const data = response.data as CustomerContactLookupRow | null;
  return data?.contacts ?? null;
}

export async function ensureOpportunityEstimateFlowFromCustomer(input: {
  customerId: string;
  projectId: string | null;
  projectName?: string | null;
  title: string;
}) {
  const scope = await requireOpportunityScope("/estimates");
  const customer = await getCustomerForEstimateFlow(
    scope.organizationId,
    input.customerId
  );

  if (!customer) {
    throw new Error("Selected customer was not found for this organization.");
  }

  const existingContact = await getPrimaryCustomerContactForEstimateFlow(
    scope.organizationId,
    customer.id
  );
  const primaryContact = existingContact
    ? {
        id: existingContact.id,
        displayName: existingContact.display_name,
        companyName: existingContact.company_name,
        email: existingContact.email,
        phone: existingContact.phone,
        contactKind: "customer_contact" as const,
        notes: null,
        organizationId: scope.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    : null;

  const primaryContactResult = primaryContact
    ? await ensurePrimaryCustomerContact({
        organizationId: scope.organizationId,
        userId: scope.userId,
        customerId: customer.id,
        contactId: primaryContact.id,
        name: primaryContact.displayName,
        companyName: primaryContact.companyName,
        email: primaryContact.email,
        phone: primaryContact.phone,
        source: "estimate_customer_start"
      })
    : await ensurePrimaryCustomerContact({
        organizationId: scope.organizationId,
        userId: scope.userId,
        customerId: customer.id,
        name: customer.name,
        companyName: customer.company_name,
        email: customer.email,
        phone: customer.phone,
        source: "estimate_customer_start"
      });

  if (primaryContactResult.outcome === "skipped") {
    throw new Error(
      "Selected customer needs a primary contact before starting the estimate."
    );
  }

  const resolvedPrimaryContact = {
    id: primaryContactResult.contactId,
    displayName: primaryContactResult.displayName,
    companyName: primaryContactResult.companyName,
    email: primaryContactResult.email,
    phone: primaryContactResult.phone
  };

  let selectedProjectName: string | null = input.projectName?.trim() || null;

  if (input.projectId) {
    const project = await getProjectById(input.projectId, "/estimates");

    if (!project || project.customerId !== customer.id) {
      throw new Error("Selected site or job does not belong to this customer.");
    }

    const existingProjectOpportunity = await getOpportunityByProjectId(
      input.projectId,
      "/estimates"
    );

    if (existingProjectOpportunity?.customerId === customer.id) {
      return ensureOpportunityEstimateFlow(existingProjectOpportunity.id);
    }

    selectedProjectName = project.name;
  }

  const generatedTitle = buildOpportunityDisplayTitle({
    title: input.title,
    contactName: resolvedPrimaryContact.displayName,
    siteName: selectedProjectName
  });
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .insert({
      company_id: scope.organizationId,
      primary_contact_id: resolvedPrimaryContact.id,
      customer_id: customer.id,
      project_id: input.projectId,
      status: "estimating",
      title: generatedTitle,
      job_type: null,
      site_name: selectedProjectName,
      prospect_name: resolvedPrimaryContact.displayName,
      prospect_company_name: resolvedPrimaryContact.companyName,
      email: resolvedPrimaryContact.email,
      phone: resolvedPrimaryContact.phone,
      address_line_1: customer.address_line_1,
      address_line_2: customer.address_line_2,
      city: customer.city,
      state_region: customer.state_region,
      postal_code: customer.postal_code,
      country_code: customer.country_code,
      site_assessment_status: "pending",
      qualified_at: new Date().toISOString(),
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;

  if (response.error || !isIdRow(data)) {
    throw new Error(
      `Unable to create an estimating opportunity from this customer: ${response.error?.message ?? "Unknown error."}`
    );
  }

  return ensureOpportunityEstimateFlow(data.id);
}

export async function ensureOpportunityEstimateFlowFromStandalone(input: {
  customerId: string;
  projectId: string | null;
  projectName?: string | null;
  title: string;
}) {
  return ensureOpportunityEstimateFlowFromCustomer({
    customerId: input.customerId,
    projectId: input.projectId,
    projectName: input.projectName,
    title: input.title
  });
}
