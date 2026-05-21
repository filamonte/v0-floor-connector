import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getDataExportScope } from "./data";
import {
  applyDuplicateDetection,
  parseCustomerContactImportCsv,
  type ExistingContactCandidate,
  type ExistingCustomerCandidate,
  type ImportDryRunResult
} from "./import-dry-run";

type CustomerDuplicateRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
};

type CustomerContactDuplicateRow = {
  customer_id: string;
  contact_id: string;
  contacts:
    | {
        id: string;
        display_name: string;
        company_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | {
        id: string;
        display_name: string;
        company_name: string | null;
        email: string | null;
        phone: string | null;
      }[]
    | null;
};

export async function runCustomerContactImportDryRun(
  csvText: string
): Promise<ImportDryRunResult> {
  const parsed = parseCustomerContactImportCsv(csvText);
  const scope = await getDataExportScope();
  const [customers, contacts] = await Promise.all([
    loadExistingCustomers(scope.organizationId),
    loadExistingContacts(scope.organizationId)
  ]);

  return applyDuplicateDetection(parsed, {
    customers,
    contacts
  });
}

async function loadExistingCustomers(
  organizationId: string
): Promise<ExistingCustomerCandidate[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id, name, company_name, email, phone")
    .eq("company_id", organizationId);

  if (response.error) {
    throw new Error(`Unable to load existing customers for dry run: ${response.error.message}`);
  }

  return ((response.data ?? []) as CustomerDuplicateRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone
  }));
}

async function loadExistingContacts(
  organizationId: string
): Promise<ExistingContactCandidate[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        customer_id,
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
    .eq("company_id", organizationId);

  if (response.error) {
    throw new Error(`Unable to load existing contacts for dry run: ${response.error.message}`);
  }

  const contacts = new Map<string, ExistingContactCandidate>();

  for (const row of (response.data ?? []) as CustomerContactDuplicateRow[]) {
    const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;

    if (!contact?.id) {
      continue;
    }

    const existing = contacts.get(contact.id);

    if (existing) {
      existing.customerIds.push(row.customer_id);
      continue;
    }

    contacts.set(contact.id, {
      id: contact.id,
      displayName: contact.display_name,
      companyName: contact.company_name,
      email: contact.email,
      phone: contact.phone,
      customerIds: [row.customer_id]
    });
  }

  return Array.from(contacts.values());
}
