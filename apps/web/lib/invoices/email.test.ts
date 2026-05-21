import test from "node:test";
import assert from "node:assert/strict";

import { buildInvoicePortalEmailContent } from "./email";

void test("invoice email content escapes customer and project content", () => {
  const content = buildInvoicePortalEmailContent({
    recipientName: "<Customer>",
    organizationName: "ACME & Floors",
    invoiceReferenceNumber: "INV-100",
    projectName: "Lobby & Hallway",
    amountDue: "$1,234.56",
    portalUrl: "https://app.example.test/portal/invoices/123"
  });

  assert.equal(content.subject, "ACME & Floors shared invoice INV-100");
  assert.match(content.htmlBody, /Hi &lt;Customer&gt;/);
  assert.match(content.htmlBody, /ACME &amp; Floors/);
  assert.match(content.htmlBody, /invoice <strong>INV-100<\/strong>/);
  assert.match(content.htmlBody, /Project: Lobby &amp; Hallway/);
  assert.match(content.htmlBody, /Amount due: \$1,234\.56/);
  assert.match(
    content.textBody,
    /Review and pay the invoice here:\nhttps:\/\/app\.example\.test\/portal\/invoices\/123/
  );
});

void test("invoice email content falls back to safe generic labels", () => {
  const content = buildInvoicePortalEmailContent({
    recipientName: null,
    organizationName: " ",
    invoiceReferenceNumber: " ",
    projectName: null,
    amountDue: "$0.00",
    portalUrl: "https://app.example.test/invoice"
  });

  assert.match(content.htmlBody, /Hi there/);
  assert.match(content.htmlBody, /your contractor/);
  assert.match(content.htmlBody, /invoice <strong>Invoice<\/strong>/);
  assert.doesNotMatch(content.htmlBody, /Project:/);
});
