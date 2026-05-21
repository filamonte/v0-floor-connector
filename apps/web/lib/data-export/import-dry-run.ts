export type ImportDryRunFieldKey =
  | "customer_name"
  | "customer_company_name"
  | "primary_contact_name"
  | "email"
  | "phone"
  | "address_line_1"
  | "address_line_2"
  | "city"
  | "state_region"
  | "postal_code"
  | "country_code"
  | "relationship_label"
  | "is_primary";

export type ImportDryRunFieldDefinition = {
  key: ImportDryRunFieldKey;
  label: string;
  target: "customer" | "contact" | "customer_contact";
  required: boolean;
  description: string;
};

export type ParsedImportRow = {
  rowNumber: number;
  raw: Record<string, string>;
  values: Partial<Record<ImportDryRunFieldKey, string>>;
  errors: string[];
  warnings: string[];
};

export type ImportDryRunParseResult = {
  headers: string[];
  mapping: Record<string, ImportDryRunFieldKey | null>;
  rows: ParsedImportRow[];
  summary: {
    totalRows: number;
    validRows: number;
    warningRows: number;
    errorRows: number;
  };
};

export type ExistingCustomerCandidate = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
};

export type ExistingContactCandidate = {
  id: string;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  customerIds: string[];
};

export type DuplicateSignal =
  | "none"
  | "possible_duplicate"
  | "likely_duplicate"
  | "existing_contact"
  | "existing_relationship";

export type ImportDryRunRowResult = ParsedImportRow & {
  duplicateSignal: DuplicateSignal;
  duplicateMessages: string[];
};

export type ImportDryRunResult = Omit<ImportDryRunParseResult, "rows" | "summary"> & {
  rows: ImportDryRunRowResult[];
  summary: ImportDryRunParseResult["summary"] & {
    likelyDuplicates: number;
    possibleDuplicates: number;
    existingContacts: number;
  };
};

const MAX_ROWS = 250;

export const importDryRunFieldDefinitions: readonly ImportDryRunFieldDefinition[] = [
  field(
    "customer_name",
    "Customer name",
    "customer",
    true,
    "Canonical customer account label."
  ),
  field(
    "customer_company_name",
    "Customer company",
    "customer",
    false,
    "Optional company or business name for the customer account."
  ),
  field(
    "primary_contact_name",
    "Primary contact",
    "contact",
    false,
    "Contact display name for the customer relationship preview."
  ),
  field("email", "Email", "contact", false, "Contact or customer email."),
  field("phone", "Phone", "contact", false, "Contact or customer phone."),
  field("address_line_1", "Address line 1", "customer", false, "Customer address."),
  field("address_line_2", "Address line 2", "customer", false, "Customer address detail."),
  field("city", "City", "customer", false, "Customer address city."),
  field("state_region", "State/region", "customer", false, "Customer address state or region."),
  field("postal_code", "Postal code", "customer", false, "Customer address postal code."),
  field("country_code", "Country", "customer", false, "Customer address country code."),
  field(
    "relationship_label",
    "Relationship",
    "customer_contact",
    false,
    "Relationship label for the customer-contact link preview."
  ),
  field(
    "is_primary",
    "Primary flag",
    "customer_contact",
    false,
    "Whether the contact should be considered primary in a future write phase."
  )
] as const;

const fieldKeys = new Set<ImportDryRunFieldKey>(
  importDryRunFieldDefinitions.map((definition) => definition.key)
);

const headerAliases: Record<string, ImportDryRunFieldKey> = {
  account: "customer_name",
  account_name: "customer_name",
  client: "customer_name",
  client_name: "customer_name",
  customer: "customer_name",
  customer_name: "customer_name",
  name: "customer_name",
  company: "customer_company_name",
  company_name: "customer_company_name",
  customer_company: "customer_company_name",
  customer_company_name: "customer_company_name",
  business: "customer_company_name",
  business_name: "customer_company_name",
  contact: "primary_contact_name",
  contact_name: "primary_contact_name",
  primary_contact: "primary_contact_name",
  primary_contact_name: "primary_contact_name",
  full_name: "primary_contact_name",
  email: "email",
  email_address: "email",
  contact_email: "email",
  phone: "phone",
  phone_number: "phone",
  mobile: "phone",
  contact_phone: "phone",
  address: "address_line_1",
  address_1: "address_line_1",
  address_line_1: "address_line_1",
  street: "address_line_1",
  address_2: "address_line_2",
  address_line_2: "address_line_2",
  suite: "address_line_2",
  city: "city",
  state: "state_region",
  state_region: "state_region",
  province: "state_region",
  region: "state_region",
  postal: "postal_code",
  postal_code: "postal_code",
  zip: "postal_code",
  zip_code: "postal_code",
  country: "country_code",
  country_code: "country_code",
  relationship: "relationship_label",
  relationship_label: "relationship_label",
  role: "relationship_label",
  is_primary: "is_primary",
  primary: "is_primary"
};

export function parseCustomerContactImportCsv(input: string): ImportDryRunParseResult {
  const table = parseCsv(input);

  if (table.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const headers = table[0].map((header) => stripBom(header).trim());

  if (headers.every((header) => header.length === 0)) {
    throw new Error("CSV header row is empty.");
  }

  const dataRows = table.slice(1).filter((row) => !isEmptyCsvRow(row));

  if (dataRows.length > MAX_ROWS) {
    throw new Error(`Dry run CSV is limited to ${MAX_ROWS} rows.`);
  }

  const mapping = suggestColumnMapping(headers);
  const rows = dataRows.map((row, index) => normalizeImportRow({
    headers,
    mapping,
    row,
    rowNumber: index + 2
  }));

  return {
    headers,
    mapping,
    rows,
    summary: summarizeRows(rows)
  };
}

export function suggestColumnMapping(headers: string[]) {
  const usedTargets = new Set<ImportDryRunFieldKey>();
  const mapping: Record<string, ImportDryRunFieldKey | null> = {};

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    const exactKey = fieldKeys.has(normalized as ImportDryRunFieldKey)
      ? (normalized as ImportDryRunFieldKey)
      : null;
    const target = exactKey ?? headerAliases[normalized] ?? null;

    if (target && !usedTargets.has(target)) {
      mapping[header] = target;
      usedTargets.add(target);
    } else {
      mapping[header] = null;
    }
  }

  return mapping;
}

export function applyDuplicateDetection(
  parsed: ImportDryRunParseResult,
  existing: {
    customers: ExistingCustomerCandidate[];
    contacts: ExistingContactCandidate[];
  }
): ImportDryRunResult {
  const customerByName = new Map<string, ExistingCustomerCandidate[]>();
  const customerByCompany = new Map<string, ExistingCustomerCandidate[]>();
  const contactByEmail = new Map<string, ExistingContactCandidate[]>();
  const contactByPhone = new Map<string, ExistingContactCandidate[]>();

  for (const customer of existing.customers) {
    addCandidate(customerByName, normalizeMatchText(customer.name), customer);
    addCandidate(customerByCompany, normalizeMatchText(customer.companyName), customer);
  }

  for (const contact of existing.contacts) {
    addCandidate(contactByEmail, normalizeEmail(contact.email), contact);
    addCandidate(contactByPhone, normalizePhone(contact.phone), contact);
  }

  const rows = parsed.rows.map((row) => {
    const messages: string[] = [];
    const values = row.values;
    const matchingCustomers = [
      ...new Set([
        ...lookup(customerByName, normalizeMatchText(values.customer_name)),
        ...lookup(customerByCompany, normalizeMatchText(values.customer_company_name))
      ])
    ];
    const matchingContacts = [
      ...new Set([
        ...lookup(contactByEmail, normalizeEmail(values.email)),
        ...lookup(contactByPhone, normalizePhone(values.phone))
      ])
    ];

    let duplicateSignal: DuplicateSignal = "none";

    if (
      matchingCustomers.length > 0 &&
      matchingContacts.some((contact) =>
        contact.customerIds.some((customerId) =>
          matchingCustomers.some((customer) => customer.id === customerId)
        )
      )
    ) {
      duplicateSignal = "existing_relationship";
      messages.push("Existing customer-contact relationship candidate.");
    } else if (matchingCustomers.length > 0 && matchingContacts.length > 0) {
      duplicateSignal = "likely_duplicate";
      messages.push("Likely duplicate customer and existing contact candidate.");
    } else if (matchingContacts.length > 0) {
      duplicateSignal = "existing_contact";
      messages.push("Existing contact candidate matched by email or phone.");
    } else if (matchingCustomers.length > 0) {
      duplicateSignal = "possible_duplicate";
      messages.push("Possible duplicate customer account matched by name or company.");
    }

    return {
      ...row,
      duplicateSignal,
      duplicateMessages: messages
    };
  });

  return {
    ...parsed,
    rows,
    summary: {
      ...summarizeRows(rows),
      likelyDuplicates: rows.filter((row) =>
        row.duplicateSignal === "likely_duplicate" ||
        row.duplicateSignal === "existing_relationship"
      ).length,
      possibleDuplicates: rows.filter((row) => row.duplicateSignal === "possible_duplicate").length,
      existingContacts: rows.filter((row) => row.duplicateSignal === "existing_contact").length
    }
  };
}

export function sanitizeCsvReportCell(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();

  if (/^[=+\-@]/.test(trimmed)) {
    return `'${trimmed}`;
  }

  return trimmed;
}

function normalizeImportRow(input: {
  headers: string[];
  mapping: Record<string, ImportDryRunFieldKey | null>;
  row: string[];
  rowNumber: number;
}): ParsedImportRow {
  const raw: Record<string, string> = {};
  const values: Partial<Record<ImportDryRunFieldKey, string>> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  for (let index = 0; index < input.headers.length; index += 1) {
    const header = input.headers[index];
    const value = (input.row[index] ?? "").trim();
    raw[header] = value;

    const target = input.mapping[header];

    if (!target) {
      continue;
    }

    values[target] = normalizeFieldValue(target, value);
  }

  if (!values.customer_name && !values.customer_company_name) {
    errors.push("Customer name or customer company is required.");
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.push("Email is not valid.");
  }

  if (values.phone && !isUsablePhone(values.phone)) {
    warnings.push("Phone looks incomplete.");
  }

  if (!values.primary_contact_name && !values.email && !values.phone) {
    warnings.push("No contact name, email, or phone was provided.");
  }

  return {
    rowNumber: input.rowNumber,
    raw,
    values,
    errors,
    warnings
  };
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";

      if (char === "\r" && next === "\n") {
        index += 1;
      }
      continue;
    }

    cell += char;
  }

  if (inQuotes) {
    throw new Error("CSV has an unclosed quoted cell.");
  }

  row.push(cell);

  if (!isEmptyCsvRow(row) || rows.length === 0) {
    rows.push(row);
  }

  return rows;
}

function normalizeFieldValue(fieldKey: ImportDryRunFieldKey, value: string) {
  const trimmed = value.trim();

  if (fieldKey === "email") {
    return normalizeEmail(trimmed);
  }

  if (fieldKey === "phone") {
    return trimmed.replace(/\s+/g, " ");
  }

  if (fieldKey === "country_code") {
    return trimmed.toUpperCase();
  }

  if (fieldKey === "is_primary") {
    return /^(true|yes|y|1|primary)$/i.test(trimmed) ? "true" : trimmed;
  }

  return trimmed;
}

function summarizeRows(rows: Array<Pick<ParsedImportRow, "errors" | "warnings">>) {
  return {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.errors.length === 0).length,
    warningRows: rows.filter((row) => row.warnings.length > 0).length,
    errorRows: rows.filter((row) => row.errors.length > 0).length
  };
}

function normalizeHeader(value: string) {
  return stripBom(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeMatchText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizePhone(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/[^\d+]/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUsablePhone(value: string) {
  return normalizePhone(value).replace(/^\+/, "").length >= 7;
}

function isEmptyCsvRow(row: string[]) {
  return row.every((cell) => cell.trim().length === 0);
}

function stripBom(value: string) {
  return value.replace(/^\uFEFF/, "");
}

function addCandidate<T>(map: Map<string, T[]>, key: string, value: T) {
  if (!key) {
    return;
  }

  const existing = map.get(key) ?? [];
  existing.push(value);
  map.set(key, existing);
}

function lookup<T>(map: Map<string, T[]>, key: string) {
  if (!key) {
    return [];
  }

  return map.get(key) ?? [];
}

function field(
  key: ImportDryRunFieldKey,
  label: string,
  target: ImportDryRunFieldDefinition["target"],
  required: boolean,
  description: string
): ImportDryRunFieldDefinition {
  return {
    key,
    label,
    target,
    required,
    description
  };
}
