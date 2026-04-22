import "server-only";

import type { Contact as ContactRecord, ContactKind } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type ContactRow = {
  id: string;
  company_id: string;
  display_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  contact_kind: ContactKind;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ContactMutationInput = {
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  contactKind: ContactKind;
  notes?: string | null;
};

const contactSelect = `
  id,
  company_id,
  display_name,
  company_name,
  email,
  phone,
  contact_kind,
  notes,
  created_at,
  updated_at
`;

function isContactRow(value: unknown): value is ContactRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContactRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.display_name === "string" &&
    typeof row.contact_kind === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isContactRowArray(value: unknown): value is ContactRow[] {
  return Array.isArray(value) && value.every((row) => isContactRow(row));
}

function mapContact(row: ContactRow): ContactRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    displayName: row.display_name,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone,
    contactKind: row.contact_kind,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listContactsByIds(input: {
  organizationId: string;
  contactIds: string[];
}) {
  const uniqueIds = [...new Set(input.contactIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map<string, ContactRecord>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contacts")
    .select(contactSelect)
    .eq("company_id", input.organizationId)
    .in("id", uniqueIds);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contacts: ${response.error.message}`);
  }

  if (!isContactRowArray(data)) {
    return new Map<string, ContactRecord>();
  }

  return new Map(data.map((row) => [row.id, mapContact(row)]));
}

export async function createContactForOrganization(input: {
  organizationId: string;
  userId: string;
  contact: ContactMutationInput;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contacts")
    .insert({
      company_id: input.organizationId,
      display_name: input.contact.displayName,
      company_name: input.contact.companyName,
      email: input.contact.email,
      phone: input.contact.phone,
      contact_kind: input.contact.contactKind,
      notes: input.contact.notes ?? null,
      created_by: input.userId,
      updated_by: input.userId
    })
    .select(contactSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the contact: ${response.error.message}`);
  }

  if (!isContactRow(data)) {
    throw new Error("Unexpected contact response after create.");
  }

  return mapContact(data);
}

export async function updateContactForOrganization(input: {
  organizationId: string;
  userId: string;
  contactId: string;
  contact: ContactMutationInput;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contacts")
    .update({
      display_name: input.contact.displayName,
      company_name: input.contact.companyName,
      email: input.contact.email,
      phone: input.contact.phone,
      contact_kind: input.contact.contactKind,
      notes: input.contact.notes ?? null,
      updated_by: input.userId
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.contactId)
    .select(contactSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the contact: ${response.error.message}`);
  }

  if (!isContactRow(data)) {
    throw new Error("Contact not found for this organization.");
  }

  return mapContact(data);
}

export async function upsertCustomerContactLink(input: {
  organizationId: string;
  userId: string;
  customerId: string;
  contactId: string;
  relationshipLabel?: string | null;
  isPrimary?: boolean;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .upsert(
      {
        company_id: input.organizationId,
        customer_id: input.customerId,
        contact_id: input.contactId,
        relationship_label: input.relationshipLabel ?? "primary_contact",
        is_primary: input.isPrimary ?? true,
        updated_by: input.userId,
        created_by: input.userId
      },
      {
        onConflict: "company_id,customer_id,contact_id"
      }
    );

  if (response.error) {
    throw new Error(`Unable to link customer and contact: ${response.error.message}`);
  }
}
