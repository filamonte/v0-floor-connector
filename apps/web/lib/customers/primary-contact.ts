import "server-only";

import {
  createContactForOrganization,
  upsertCustomerContactLink
} from "@/lib/contacts/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ensurePrimaryCustomerContactWithRepository,
  type PrimaryContactInput,
  type PrimaryContactLookup
} from "./primary-contact-core";

type ContactLookupRow = {
  contact_id?: string;
  customer_contact_id?: string;
  is_primary?: boolean;
  contacts?: {
    id?: string;
    display_name?: string;
    company_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

type ContactRow = {
  id?: string;
  display_name?: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

function toPrimaryContactLookup(row: ContactLookupRow | null): PrimaryContactLookup | null {
  const contact = row?.contacts;

  if (!row?.contact_id || !contact?.display_name) {
    return null;
  }

  return {
    contactId: row.contact_id,
    customerContactId: row.customer_contact_id ?? null,
    displayName: contact.display_name,
    companyName: contact.company_name ?? null,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    isPrimary: row.is_primary ?? false
  };
}

function toOrganizationContactLookup(row: ContactRow | null): PrimaryContactLookup | null {
  if (!row?.id || !row.display_name) {
    return null;
  }

  return {
    contactId: row.id,
    customerContactId: null,
    displayName: row.display_name,
    companyName: row.company_name ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null
  };
}

async function findCustomerContactByEmail(input: {
  organizationId: string;
  customerId: string;
  email: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        customer_contact_id:id,
        contact_id,
        is_primary,
        contacts:contacts!customer_contacts_contact_company_fkey!inner (
          id,
          display_name,
          company_name,
          email,
          phone
        )
      `
    )
    .eq("company_id", input.organizationId)
    .eq("customer_id", input.customerId)
    .ilike("contacts.email", input.email)
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to find the existing customer contact: ${response.error.message}`
    );
  }

  return toPrimaryContactLookup(response.data as ContactLookupRow | null);
}

async function findOrganizationContactByEmail(input: {
  organizationId: string;
  email: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contacts")
    .select("id, display_name, company_name, email, phone")
    .eq("company_id", input.organizationId)
    .ilike("email", input.email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to find the existing contact: ${response.error.message}`);
  }

  return toOrganizationContactLookup(response.data as ContactRow | null);
}

export async function ensurePrimaryCustomerContact(input: PrimaryContactInput) {
  return ensurePrimaryCustomerContactWithRepository(input, {
    findCustomerContactByEmail,
    findOrganizationContactByEmail,
    async createContact(contactInput) {
      const contact = await createContactForOrganization({
        organizationId: contactInput.organizationId,
        userId: contactInput.userId,
        contact: {
          displayName: contactInput.displayName,
          companyName: contactInput.companyName,
          email: contactInput.email,
          phone: contactInput.phone,
          contactKind: "customer_contact",
          notes: contactInput.notes
        }
      });

      return {
        contactId: contact.id,
        displayName: contact.displayName,
        companyName: contact.companyName,
        email: contact.email,
        phone: contact.phone
      };
    },
    async upsertCustomerContactLink(linkInput) {
      return upsertCustomerContactLink(linkInput);
    }
  });
}
