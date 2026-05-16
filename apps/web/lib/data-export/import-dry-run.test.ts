import test from "node:test";
import assert from "node:assert/strict";

import {
  applyDuplicateDetection,
  parseCustomerContactImportCsv,
  sanitizeCsvReportCell,
  suggestColumnMapping
} from "./import-dry-run";

void test("suggests customer and contact column mappings from common CSV headers", () => {
  assert.deepEqual(
    suggestColumnMapping([
      "Client Name",
      "Company",
      "Primary Contact",
      "Email Address",
      "Phone Number"
    ]),
    {
      "Client Name": "customer_name",
      Company: "customer_company_name",
      "Primary Contact": "primary_contact_name",
      "Email Address": "email",
      "Phone Number": "phone"
    }
  );
});

void test("parses customer/contact CSV rows with normalized values", () => {
  const result = parseCustomerContactImportCsv(
    'Customer Name,Primary Contact,Email,Phone\n"Acme, North",Pat Owner,PAT@EXAMPLE.TEST,(555) 010-1000\n'
  );

  assert.equal(result.summary.totalRows, 1);
  assert.equal(result.summary.validRows, 1);
  assert.equal(result.rows[0].values.customer_name, "Acme, North");
  assert.equal(result.rows[0].values.email, "pat@example.test");
});

void test("reports missing customer fields and invalid email without throwing", () => {
  const result = parseCustomerContactImportCsv(
    "Customer Name,Email,Phone\n,not-an-email,12\n"
  );

  assert.equal(result.summary.errorRows, 1);
  assert.match(result.rows[0].errors.join(" "), /Customer name/);
  assert.match(result.rows[0].errors.join(" "), /Email is not valid/);
  assert.match(result.rows[0].warnings.join(" "), /Phone looks incomplete/);
});

void test("fails safely for malformed CSV", () => {
  assert.throws(
    () => parseCustomerContactImportCsv('Customer Name,Email\n"Acme,ops@example.test\n'),
    /unclosed quoted cell/
  );
});

void test("detects tenant-scoped customer/contact duplicate candidates", () => {
  const parsed = parseCustomerContactImportCsv(
    "Customer Name,Primary Contact,Email,Phone\nAcme,Pat Owner,pat@example.test,555-0100\nNew Co,Riley,riley@example.test,555-0200\n"
  );

  const result = applyDuplicateDetection(parsed, {
    customers: [
      {
        id: "customer_1",
        name: "Acme",
        companyName: null,
        email: null,
        phone: null
      }
    ],
    contacts: [
      {
        id: "contact_1",
        displayName: "Pat Owner",
        companyName: null,
        email: "pat@example.test",
        phone: null,
        customerIds: ["customer_1"]
      }
    ]
  });

  assert.equal(result.rows[0].duplicateSignal, "existing_relationship");
  assert.equal(result.summary.likelyDuplicates, 1);
  assert.equal(result.rows[1].duplicateSignal, "none");
});

void test("sanitizes CSV report cells that could trigger spreadsheet formulas", () => {
  assert.equal(sanitizeCsvReportCell("=IMPORTXML()"), "'=IMPORTXML()");
  assert.equal(sanitizeCsvReportCell("Acme"), "Acme");
});
