import "server-only";

import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  type ExportModuleDefinition,
  type ExportModuleKey,
  type ExportOrganizationMetadata
} from "./core";

export type DataExportScope = Awaited<
  ReturnType<typeof requireOrganizationAdminScope>
>;

export type ModuleExportData = {
  organization: ExportOrganizationMetadata;
  rows: Array<Record<string, unknown>>;
};

type RawRow = Record<string, unknown>;

export async function loadModuleExportData(
  module: ExportModuleDefinition,
  existingScope?: DataExportScope
): Promise<ModuleExportData> {
  const scope = existingScope ?? (await getDataExportScope());

  const organization = {
    id: scope.organization.id,
    displayName: scope.organization.displayName,
    slug: scope.organization.slug
  };

  const rows = await loadRowsByModule(module.key, scope.organizationId);

  return {
    organization,
    rows
  };
}

export async function getDataExportScope() {
  return requireOrganizationAdminScope("/settings/export");
}

async function loadRowsByModule(moduleKey: ExportModuleKey, organizationId: string) {
  switch (moduleKey) {
    case "customers":
      return loadCustomers(organizationId);
    case "customer_contacts":
      return loadCustomerContacts(organizationId);
    case "projects":
      return loadProjects(organizationId);
    case "estimates":
      return loadEstimates(organizationId);
    case "estimate_line_items":
      return loadEstimateLineItems(organizationId);
    case "invoices":
      return loadInvoices(organizationId);
    case "invoice_line_items":
      return loadInvoiceLineItems(organizationId);
    case "payments":
      return loadPayments(organizationId);
    case "jobs":
      return loadJobs(organizationId);
    case "job_assignments":
      return loadJobAssignments(organizationId);
  }
}

async function loadCustomers(organizationId: string) {
  const rows = await selectRows("customers", organizationId, `
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
    country_code,
    is_tax_exempt,
    tax_exemption_reason,
    tax_exemption_expires_on,
    created_at,
    updated_at
  `, "name");

  return rows.map((row) => ({
    customer_id: row.id,
    customer_name: row.name,
    company_name: row.company_name,
    email: row.email,
    phone: row.phone,
    address_line_1: row.address_line_1,
    address_line_2: row.address_line_2,
    city: row.city,
    state_region: row.state_region,
    postal_code: row.postal_code,
    country_code: row.country_code,
    is_tax_exempt: row.is_tax_exempt,
    tax_exemption_reason: row.tax_exemption_reason,
    tax_exemption_expires_on: row.tax_exemption_expires_on,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));
}

async function loadCustomerContacts(organizationId: string) {
  const rows = await selectRows("customer_contacts", organizationId, `
    id,
    customer_id,
    contact_id,
    relationship_label,
    is_primary,
    created_at,
    updated_at,
    contacts:contacts!customer_contacts_contact_company_fkey (
      id,
      display_name,
      company_name,
      email,
      phone,
      contact_kind
    ),
    customers (
      id,
      name
    )
  `, "created_at");

  return rows.map((row) => {
    const contact = relation(row, "contacts");
    const customer = relation(row, "customers");

    return {
      customer_contact_id: row.id,
      customer_id: row.customer_id,
      customer_name: customer?.name ?? null,
      contact_id: row.contact_id,
      display_name: contact?.display_name ?? null,
      company_name: contact?.company_name ?? null,
      email: contact?.email ?? null,
      phone: contact?.phone ?? null,
      contact_kind: contact?.contact_kind ?? null,
      relationship_label: row.relationship_label,
      is_primary: row.is_primary,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function loadProjects(organizationId: string) {
  const rows = await selectRows("projects", organizationId, `
    id,
    customer_id,
    name,
    status,
    commercial_readiness_status,
    financing_status,
    ready_to_schedule_at,
    address_line_1,
    city,
    state_region,
    postal_code,
    created_at,
    updated_at,
    customers (
      id,
      name
    )
  `, "updated_at", false);

  return rows.map((row) => {
    const customer = relation(row, "customers");

    return {
      project_id: row.id,
      project_name: row.name,
      customer_id: row.customer_id,
      customer_name: customer?.name ?? null,
      status: row.status,
      commercial_readiness_status: row.commercial_readiness_status,
      financing_status: row.financing_status,
      ready_to_schedule_at: row.ready_to_schedule_at,
      address_line_1: row.address_line_1,
      city: row.city,
      state_region: row.state_region,
      postal_code: row.postal_code,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function loadEstimates(organizationId: string) {
  const rows = await selectRows("estimates", organizationId, `
    id,
    reference_number,
    title,
    customer_id,
    project_id,
    status,
    estimate_date,
    subtotal_amount,
    tax_amount,
    discount_amount,
    total_amount,
    sent_at,
    approved_at,
    created_at,
    updated_at,
    customers (
      id,
      name
    ),
    projects (
      id,
      name
    )
  `, "updated_at", false);

  return rows.map((row) => {
    const customer = relation(row, "customers");
    const project = relation(row, "projects");

    return {
      estimate_id: row.id,
      reference_number: row.reference_number,
      title: row.title,
      customer_id: row.customer_id,
      customer_name: customer?.name ?? null,
      project_id: row.project_id,
      project_name: project?.name ?? null,
      status: row.status,
      estimate_date: row.estimate_date,
      subtotal_amount: row.subtotal_amount,
      tax_amount: row.tax_amount,
      discount_amount: row.discount_amount,
      total_amount: row.total_amount,
      sent_at: row.sent_at,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function loadEstimateLineItems(organizationId: string) {
  const rows = await selectRows("estimate_line_items", organizationId, `
    id,
    estimate_id,
    group_name,
    name,
    description,
    quantity,
    unit,
    unit_price,
    taxable,
    line_subtotal,
    tax_amount,
    line_total,
    sort_order
  `, "sort_order");

  return rows.map((row) => ({
    line_item_id: row.id,
    estimate_id: row.estimate_id,
    group_name: row.group_name,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    unit_price: row.unit_price,
    taxable: row.taxable,
    line_subtotal: row.line_subtotal,
    tax_amount: row.tax_amount,
    line_total: row.line_total,
    sort_order: row.sort_order
  }));
}

async function loadInvoices(organizationId: string) {
  const rows = await selectRows("invoices", organizationId, `
    id,
    reference_number,
    customer_id,
    project_id,
    estimate_id,
    job_id,
    workflow_role,
    status,
    issue_date,
    due_date,
    subtotal_amount,
    tax_amount,
    discount_amount,
    retainage_held_amount,
    total_amount,
    balance_due_amount,
    created_at,
    updated_at,
    customers (
      id,
      name
    ),
    projects (
      id,
      name
    )
  `, "updated_at", false);

  return rows.map((row) => {
    const customer = relation(row, "customers");
    const project = relation(row, "projects");

    return {
      invoice_id: row.id,
      reference_number: row.reference_number,
      customer_id: row.customer_id,
      customer_name: customer?.name ?? null,
      project_id: row.project_id,
      project_name: project?.name ?? null,
      estimate_id: row.estimate_id,
      job_id: row.job_id,
      workflow_role: row.workflow_role,
      status: row.status,
      issue_date: row.issue_date,
      due_date: row.due_date,
      subtotal_amount: row.subtotal_amount,
      tax_amount: row.tax_amount,
      discount_amount: row.discount_amount,
      retainage_held_amount: row.retainage_held_amount,
      total_amount: row.total_amount,
      balance_due_amount: row.balance_due_amount,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function loadInvoiceLineItems(organizationId: string) {
  const rows = await selectRows("invoice_line_items", organizationId, `
    id,
    invoice_id,
    lineage_type,
    name,
    description,
    quantity,
    unit,
    unit_price,
    taxable,
    line_subtotal,
    tax_amount,
    line_total,
    sort_order
  `, "sort_order");

  return rows.map((row) => ({
    line_item_id: row.id,
    invoice_id: row.invoice_id,
    lineage_type: row.lineage_type,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    unit_price: row.unit_price,
    taxable: row.taxable,
    line_subtotal: row.line_subtotal,
    tax_amount: row.tax_amount,
    line_total: row.line_total,
    sort_order: row.sort_order
  }));
}

async function loadPayments(organizationId: string) {
  const rows = await selectRows("payments", organizationId, `
    id,
    invoice_id,
    amount,
    payment_date,
    payment_method,
    payment_source,
    recorded_via,
    reference,
    status,
    created_at,
    updated_at,
    invoices (
      id,
      reference_number,
      customers (
        id,
        name
      ),
      projects (
        id,
        name
      )
    )
  `, "payment_date", false);

  return rows.map((row) => {
    const invoice = relation(row, "invoices");
    const customer = relation(invoice ?? {}, "customers");
    const project = relation(invoice ?? {}, "projects");

    return {
      payment_id: row.id,
      invoice_id: row.invoice_id,
      invoice_reference: invoice?.reference_number ?? null,
      customer_name: customer?.name ?? null,
      project_name: project?.name ?? null,
      amount: row.amount,
      payment_date: row.payment_date,
      payment_method: row.payment_method,
      payment_source: row.payment_source,
      recorded_via: row.recorded_via,
      reference: row.reference,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function loadJobs(organizationId: string) {
  const rows = await selectRows("jobs", organizationId, `
    id,
    customer_id,
    project_id,
    estimate_id,
    dispatch_status,
    scheduled_date,
    scheduled_start_at,
    scheduled_end_at,
    crew_vendor_id,
    created_at,
    updated_at,
    customers (
      id,
      name
    ),
    projects (
      id,
      name
    )
  `, "updated_at", false);

  return rows.map((row) => {
    const customer = relation(row, "customers");
    const project = relation(row, "projects");

    return {
      job_id: row.id,
      customer_id: row.customer_id,
      customer_name: customer?.name ?? null,
      project_id: row.project_id,
      project_name: project?.name ?? null,
      estimate_id: row.estimate_id,
      dispatch_status: row.dispatch_status,
      scheduled_date: row.scheduled_date,
      scheduled_start_at: row.scheduled_start_at,
      scheduled_end_at: row.scheduled_end_at,
      crew_vendor_id: row.crew_vendor_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function loadJobAssignments(organizationId: string) {
  const rows = await selectRows("job_assignments", organizationId, `
    id,
    job_id,
    person_id,
    vendor_id,
    role,
    assigned_start_at,
    assigned_end_at,
    created_at,
    updated_at,
    people (
      id,
      display_name
    ),
    vendors (
      id,
      name
    )
  `, "created_at");

  return rows.map((row) => {
    const person = relation(row, "people");
    const vendor = relation(row, "vendors");

    return {
      assignment_id: row.id,
      job_id: row.job_id,
      person_id: row.person_id,
      person_name: person?.display_name ?? null,
      vendor_id: row.vendor_id,
      vendor_name: vendor?.name ?? null,
      role: row.role,
      assigned_start_at: row.assigned_start_at,
      assigned_end_at: row.assigned_end_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

async function selectRows(
  table: string,
  organizationId: string,
  select: string,
  orderColumn: string,
  ascending = true
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(table)
    .select(select)
    .eq("company_id", organizationId)
    .order(orderColumn, { ascending });

  if (response.error) {
    throw new Error(`Unable to load ${table} export rows: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []) as unknown as RawRow[];
}

function relation(row: RawRow, key: string): RawRow | null {
  const value = row[key];

  if (Array.isArray(value)) {
    return (value[0] as RawRow | undefined) ?? null;
  }

  if (value && typeof value === "object") {
    return value as RawRow;
  }

  return null;
}
