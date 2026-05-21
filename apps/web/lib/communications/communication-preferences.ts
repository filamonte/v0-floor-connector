import "server-only";

import { cache } from "react";
import type {
  CommunicationPreference,
  CommunicationPreferenceChannel,
  CommunicationPreferenceMessageCategory,
  CommunicationPreferenceSource,
  CommunicationPreferenceStatus,
  CommunicationPreferenceSubjectType
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCustomerContactsByCustomer } from "@/lib/contacts/data";
import { getCustomerById } from "@/lib/customers/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  customerAppointmentReminderPreferenceInputSchema,
  communicationPreferenceInputSchema,
  type CustomerAppointmentReminderPreferenceInput,
  type CommunicationPreferenceInput
} from "./communication-preferences-schema";
import {
  buildCustomerAppointmentReminderPreferenceSummary,
  type CustomerAppointmentReminderPreferenceSummaryRow
} from "./customer-communication-preferences-core";

type CommunicationPreferenceScope = {
  userId: string;
  organizationId: string;
};

type CommunicationPreferenceRow = {
  id: string;
  company_id: string;
  subject_type: CommunicationPreferenceSubjectType;
  subject_id: string;
  channel: CommunicationPreferenceChannel;
  message_category: CommunicationPreferenceMessageCategory;
  status: CommunicationPreferenceStatus;
  source: CommunicationPreferenceSource;
  reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type PreferenceSubjectTable = "customers" | "customer_contacts" | "contacts";

const subjectTables: Record<CommunicationPreferenceSubjectType, PreferenceSubjectTable> = {
  customer: "customers",
  customer_contact: "customer_contacts",
  contact: "contacts"
};

async function requireCommunicationPreferenceScope(next = "/settings") {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for communication preferences.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  } satisfies CommunicationPreferenceScope;
}

function mapCommunicationPreference(
  row: CommunicationPreferenceRow
): CommunicationPreference {
  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    channel: row.channel,
    messageCategory: row.message_category,
    status: row.status,
    source: row.source,
    reason: row.reason,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function assertPreferenceSubjectBelongsToCompany(input: {
  organizationId: string;
  subjectType: CommunicationPreferenceSubjectType;
  subjectId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(subjectTables[input.subjectType])
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("id", input.subjectId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to validate preference subject: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Preference subject must belong to the active organization.");
  }
}

export const listCommunicationPreferencesForContext = cache(
  async (input: {
    subjectIds: Array<{
      subjectType: CommunicationPreferenceSubjectType;
      subjectId: string | null | undefined;
    }>;
    channel?: CommunicationPreferenceChannel;
    messageCategory?: CommunicationPreferenceMessageCategory;
    next?: string;
  }): Promise<CommunicationPreference[]> => {
    const scope = await requireCommunicationPreferenceScope(input.next);
    const subjectIds = input.subjectIds
      .filter((subject): subject is {
        subjectType: CommunicationPreferenceSubjectType;
        subjectId: string;
      } => Boolean(subject.subjectId))
      .map((subject) => `${subject.subjectType}:${subject.subjectId}`);

    if (subjectIds.length === 0) {
      return [];
    }

    const supabase = await getSupabaseServerClient();
    let query = supabase
      .from("communication_preferences")
      .select(
        `
          id,
          company_id,
          subject_type,
          subject_id,
          channel,
          message_category,
          status,
          source,
          reason,
          created_by,
          updated_by,
          created_at,
          updated_at
        `
      )
      .eq("company_id", scope.organizationId);

    if (input.channel) {
      query = query.eq("channel", input.channel);
    }

    if (input.messageCategory) {
      query = query.eq("message_category", input.messageCategory);
    }

    const response = await query;

    if (response.error) {
      throw new Error(`Unable to load communication preferences: ${response.error.message}`);
    }

    return ((response.data as CommunicationPreferenceRow[] | null) ?? [])
      .filter((row) => subjectIds.includes(`${row.subject_type}:${row.subject_id}`))
      .map(mapCommunicationPreference);
  }
);

export async function upsertCommunicationPreference(
  input: CommunicationPreferenceInput,
  next = "/settings"
) {
  const parsed = communicationPreferenceInputSchema.parse(input);
  const scope = await requireCommunicationPreferenceScope(next);

  await assertPreferenceSubjectBelongsToCompany({
    organizationId: scope.organizationId,
    subjectType: parsed.subjectType,
    subjectId: parsed.subjectId
  });

  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("communication_preferences")
    .select("id")
    .eq("company_id", scope.organizationId)
    .eq("subject_type", parsed.subjectType)
    .eq("subject_id", parsed.subjectId)
    .eq("channel", parsed.channel)
    .eq("message_category", parsed.messageCategory)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load communication preference: ${existingResponse.error.message}`
    );
  }

  const select = `
    id,
    company_id,
    subject_type,
    subject_id,
    channel,
    message_category,
    status,
    source,
    reason,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;
  const response = existingResponse.data
    ? await supabase
        .from("communication_preferences")
        .update({
          status: parsed.status,
          source: parsed.source,
          reason: parsed.reason,
          updated_by: scope.userId
        })
        .eq("company_id", scope.organizationId)
        .eq("id", (existingResponse.data as { id: string }).id)
        .select(select)
        .single()
    : await supabase
    .from("communication_preferences")
        .insert({
        company_id: scope.organizationId,
        subject_type: parsed.subjectType,
        subject_id: parsed.subjectId,
        channel: parsed.channel,
        message_category: parsed.messageCategory,
        status: parsed.status,
        source: parsed.source,
        reason: parsed.reason,
        created_by: scope.userId,
        updated_by: scope.userId
        })
        .select(select)
        .single();

  if (response.error) {
    throw new Error(`Unable to save communication preference: ${response.error.message}`);
  }

  return mapCommunicationPreference(response.data as CommunicationPreferenceRow);
}

async function assertCustomerContactBelongsToCustomer(input: {
  organizationId: string;
  customerId: string;
  customerContactId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("customer_id", input.customerId)
    .eq("id", input.customerContactId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to validate customer contact preference: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Customer contact preference must belong to the displayed customer.");
  }
}

export async function listCustomerAppointmentReminderPreferenceSummary(
  customerId: string,
  next = "/customers"
): Promise<CustomerAppointmentReminderPreferenceSummaryRow[]> {
  const [customer, customerContacts] = await Promise.all([
    getCustomerById(customerId, next),
    listCustomerContactsByCustomer(customerId, next)
  ]);

  if (!customer) {
    return [];
  }

  const preferences = await listCommunicationPreferencesForContext({
    subjectIds: [
      {
        subjectType: "customer",
        subjectId: customer.id
      },
      ...customerContacts.map((customerContact) => ({
        subjectType: "customer_contact" as const,
        subjectId: customerContact.id
      }))
    ],
    channel: "email",
    messageCategory: "appointment_reminder",
    next
  });

  return buildCustomerAppointmentReminderPreferenceSummary({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email
    },
    contacts: customerContacts.map((customerContact) => ({
      id: customerContact.id,
      displayName: customerContact.contact?.displayName ?? "Linked contact",
      email: customerContact.contact?.email ?? null,
      relationshipLabel: customerContact.relationshipLabel,
      isPrimary: customerContact.isPrimary
    })),
    preferences
  });
}

export async function upsertCustomerAppointmentReminderPreference(
  input: CustomerAppointmentReminderPreferenceInput,
  next = "/customers"
) {
  const parsed = customerAppointmentReminderPreferenceInputSchema.parse(input);
  const scope = await requireOrganizationAdminScope(next);

  const customer = await getCustomerById(parsed.customerId, next);

  if (!customer || customer.organizationId !== scope.organizationId) {
    throw new Error("Customer preference must belong to the active organization.");
  }

  if (parsed.subjectType === "customer" && parsed.subjectId !== customer.id) {
    throw new Error("Customer preference subject must match the displayed customer.");
  }

  if (parsed.subjectType === "customer_contact") {
    await assertCustomerContactBelongsToCustomer({
      organizationId: scope.organizationId,
      customerId: customer.id,
      customerContactId: parsed.subjectId
    });
  }

  return upsertCommunicationPreference(
    {
      subjectType: parsed.subjectType,
      subjectId: parsed.subjectId,
      channel: "email",
      messageCategory: "appointment_reminder",
      status: parsed.status,
      source: "manual",
      reason: parsed.reason
    },
    next
  );
}
