import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildWarrantyDocumentReviewEmailContent,
  isWarrantyDocumentEmailSignerEligible
} from "./email";

void test("warranty document email content escapes customer-controlled values", () => {
  const content = buildWarrantyDocumentReviewEmailContent({
    recipientName: "<Customer>",
    organizationName: "FloorConnector Floors",
    warrantyTitle: "Warranty <script>",
    customerName: "Acme & Sons",
    projectName: "Warehouse <Polish>",
    reviewUrl: "https://example.com/portal/warranty-documents/doc-1"
  });

  assert.match(content.htmlBody, /Hi &lt;Customer&gt;/);
  assert.match(content.htmlBody, /Warranty &lt;script&gt;/);
  assert.match(content.htmlBody, /Acme &amp; Sons/);
  assert.match(content.htmlBody, /Warehouse &lt;Polish&gt;/);
  assert.doesNotMatch(content.htmlBody, /<script>/);
  assert.match(
    content.textBody,
    /https:\/\/example\.com\/portal\/warranty-documents\/doc-1/
  );
});

void test("warranty document provider email is limited to requested customer signers", () => {
  assert.equal(
    isWarrantyDocumentEmailSignerEligible({
      signerRole: "customer",
      signerStatus: "requested",
      signerEmail: "customer@example.com"
    }),
    true
  );
  assert.equal(
    isWarrantyDocumentEmailSignerEligible({
      signerRole: "customer",
      signerStatus: "viewed",
      signerEmail: "customer@example.com"
    }),
    true
  );
  assert.equal(
    isWarrantyDocumentEmailSignerEligible({
      signerRole: "customer",
      signerStatus: "pending",
      signerEmail: "customer@example.com"
    }),
    false
  );
  assert.equal(
    isWarrantyDocumentEmailSignerEligible({
      signerRole: "contractor",
      signerStatus: "requested",
      signerEmail: "contractor@example.com"
    }),
    false
  );
  assert.equal(
    isWarrantyDocumentEmailSignerEligible({
      signerRole: "customer",
      signerStatus: "requested",
      signerEmail: ""
    }),
    false
  );
});
