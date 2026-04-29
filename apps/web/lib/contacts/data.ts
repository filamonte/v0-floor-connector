import "server-only";

import type { Contact as ContactRecord, ContactKind } from "@floorconnector/types";

import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { requireCustomerScope } from "@/lib/customers/data";
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

type CustomerContactRow = {
  id: string;
  company_id: string;
  customer_id: string;
  contact_id: string;
  relationship_label: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  contacts?: ContactRow | null;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | null;
};

export type CustomerContactListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  contactId: string;
  relationshipLabel: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  contact: ContactRecord | null;
};

export type DirectoryCustomerContactListItem = CustomerContactListItem & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
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

function isCustomerContactRow(value: unknown): value is CustomerContactRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<CustomerContactRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.contact_id === "string" &&
    typeof row.is_primary === "boolean" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isCustomerContactRowArray(value: unknown): value is CustomerContactRow[] {
  return Array.isArray(value) && value.every((row) => isCustomerContactRow(row));
}

function mapCustomerContact(row: CustomerContactRow): CustomerContactListItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    contactId: row.contact_id,
    relationshipLabel: row.relationship_label,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contact: row.contacts ? mapContact(row.contacts) : null
  };
}

function mapDirectoryCustomerContact(row: CustomerContactRow): DirectoryCustomerContactListItem {
  return {
    ...mapCustomerContact(row),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          email: row.customers.email,
          phone: row.customers.phone
        }
      : null
  };
}

async function ensureScopedCustomerForAdmin(organizationId: string, customerId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", customerId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the customer contact scope: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Customer not found for this organization.");
  }
}

async function getCustomerContactRowForAdmin(input: {
  organizationId: string;
  customerContactId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        id,
        company_id,
        customer_id,
        contact_id,
        relationship_label,
        is_primary,
        created_at,
        updated_at,
        contacts:contacts!customer_contacts_contact_company_fkey (
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
        )
      `
    )
    .eq("company_id", input.organizationId)
    .eq("id", input.customerContactId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the customer contact: ${response.error.message}`);
  }

  if (!isCustomerContactRow(data)) {
    throw new Error("Customer contact not found for this organization.");
  }

  return data;
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

export async function listCustomerContactsByCustomer(
  customerId: string,
  next = "/customers"
): Promise<CustomerContactListItem[]> {
  const scope = await requireCustomerScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        id,
        company_id,
        customer_id,
        contact_id,
        relationship_label,
        is_primary,
        created_at,
        updated_at,
        contacts:contacts!customer_contacts_contact_company_fkey (
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
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load related customer contacts: ${response.error.message}`);
  }

  if (!isCustomerContactRowArray(data)) {
    return [];
  }

  return data.map(mapCustomerContact);
}

export async function listCustomerContactsForDirectory(
  next = "/directory"
): Promise<DirectoryCustomerContactListItem[]> {
  const scope = await requireCustomerScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        id,
        company_id,
        customer_id,
        contact_id,
        relationship_label,
        is_primary,
        created_at,
        updated_at,
        contacts:contacts!customer_contacts_contact_company_fkey (
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
        ),
        customers (
          id,
          name,
          company_name,
          email,
          phone
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load directory customer contacts: ${response.error.message}`);
  }

  if (!isCustomerContactRowArray(data)) {
    return [];
  }

  return data.map(mapDirectoryCustomerContact);
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
  if (input.isPrimary === true) {
    const supabase = await getSupabaseServerClient();
    const clearResponse = await supabase
      .from("customer_contacts")
      .update({
        is_primary: false,
        updated_by: input.userId
      })
      .eq("company_id", input.organizationId)
      .eq("customer_id", input.customerId)
      .neq("contact_id", input.contactId);

    if (clearResponse.error) {
      throw new Error(
        `Unable to update the existing main customer contact: ${clearResponse.error.message}`
      );
    }
  }

  const upsertPayload: {
    company_id: string;
    customer_id: string;
    contact_id: string;
    relationship_label: string | null;
    updated_by: string;
    created_by: string;
    is_primary?: boolean;
  } = {
    company_id: input.organizationId,
    customer_id: input.customerId,
    contact_id: input.contactId,
    relationship_label: input.relationshipLabel ?? "primary_contact",
    updated_by: input.userId,
    created_by: input.userId
  };

  if (input.isPrimary !== undefined) {
    upsertPayload.is_primary = input.isPrimary;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .upsert(
      upsertPayload,
      {
        onConflict: "company_id,customer_id,contact_id"
      }
    );

  if (response.error) {
    throw new Error(`Unable to link customer and contact: ${response.error.message}`);
  }
}

export async function createCustomerContactForCustomer(input: {
  customerId: string;
  contact: ContactMutationInput;
  relationshipLabel?: string | null;
  isPrimary?: boolean;
}) {
  const scope = await requireOrganizationAdminScope(`/customers/${input.customerId}`);
  await ensureScopedCustomerForAdmin(scope.organizationId, input.customerId);
  const contact = await createContactForOrganization({
    organizationId: scope.organizationId,
    userId: scope.userId,
    contact: input.contact
  });

  await upsertCustomerContactLink({
    organizationId: scope.organizationId,
    userId: scope.userId,
    customerId: input.customerId,
    contactId: contact.id,
    relationshipLabel: input.relationshipLabel ?? "additional_contact",
    isPrimary: input.isPrimary ?? false
  });

  return contact;
}

export async function updateCustomerContactForCustomer(input: {
  customerId: string;
  customerContactId: string;
  contact: ContactMutationInput;
  relationshipLabel?: string | null;
}) {
  const scope = await requireOrganizationAdminScope(`/customers/${input.customerId}`);
  await ensureScopedCustomerForAdmin(scope.organizationId, input.customerId);
  const customerContact = await getCustomerContactRowForAdmin({
    organizationId: scope.organizationId,
    customerContactId: input.customerContactId
  });

  if (customerContact.customer_id !== input.customerId) {
    throw new Error("Customer contact does not belong to this customer account.");
  }

  const contact = await updateContactForOrganization({
    organizationId: scope.organizationId,
    userId: scope.userId,
    contactId: customerContact.contact_id,
    contact: input.contact
  });

  await upsertCustomerContactLink({
    organizationId: scope.organizationId,
    userId: scope.userId,
    customerId: input.customerId,
    contactId: customerContact.contact_id,
    relationshipLabel:
      input.relationshipLabel ?? customerContact.relationship_label ?? "additional_contact",
    isPrimary: customerContact.is_primary
  });

  return contact;
}

export async function markCustomerContactAsPrimary(input: {
  customerId: string;
  customerContactId: string;
}) {
  const scope = await requireOrganizationAdminScope(`/customers/${input.customerId}`);
  await ensureScopedCustomerForAdmin(scope.organizationId, input.customerId);
  const customerContact = await getCustomerContactRowForAdmin({
    organizationId: scope.organizationId,
    customerContactId: input.customerContactId
  });

  if (customerContact.customer_id !== input.customerId) {
    throw new Error("Customer contact does not belong to this customer account.");
  }

  await upsertCustomerContactLink({
    organizationId: scope.organizationId,
    userId: scope.userId,
    customerId: input.customerId,
    contactId: customerContact.contact_id,
    relationshipLabel: customerContact.relationship_label ?? "additional_contact",
    isPrimary: true
  });
}
