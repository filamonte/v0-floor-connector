import test from "node:test";
import assert from "node:assert/strict";

import { buildContractPortalEmailContent } from "./email";

void test("contract signature email content escapes customer-controlled values", () => {
  const content = buildContractPortalEmailContent({
    recipientName: "<Customer>",
    organizationName: "ACME & Floors",
    contractReferenceNumber: "CON-100",
    contractTitle: "Quartz <System>",
    projectName: "Lobby & Hallway",
    portalUrl: "https://app.example.test/portal/contracts/123"
  });

  assert.equal(content.subject, "ACME & Floors shared contract CON-100");
  assert.match(content.htmlBody, /Hi &lt;Customer&gt;/);
  assert.match(content.htmlBody, /ACME &amp; Floors/);
  assert.match(content.htmlBody, /Quartz &lt;System&gt;/);
  assert.match(content.htmlBody, /Project: Lobby &amp; Hallway/);
  assert.doesNotMatch(content.htmlBody, /<System>/);
  assert.match(
    content.textBody,
    /Review and sign the contract here:\nhttps:\/\/app\.example\.test\/portal\/contracts\/123/
  );
});

void test("contract signature email falls back to reference number and generic recipient", () => {
  const content = buildContractPortalEmailContent({
    recipientName: null,
    organizationName: "FloorConnector",
    contractReferenceNumber: "CON-200",
    contractTitle: "   ",
    projectName: null,
    portalUrl: "https://app.example.test/portal/contracts/abc"
  });

  assert.match(content.htmlBody, /Hi there/);
  assert.match(content.htmlBody, /contract <strong>CON-200<\/strong>/);
  assert.doesNotMatch(content.htmlBody, /Project:/);
});
