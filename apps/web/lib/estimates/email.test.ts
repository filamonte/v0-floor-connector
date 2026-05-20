import test from "node:test";
import assert from "node:assert/strict";

import { buildEstimatePortalEmailContent } from "./email";

void test("estimate review email content escapes customer and project content", () => {
  const content = buildEstimatePortalEmailContent({
    recipientName: "<Customer>",
    organizationName: "ACME & Floors",
    estimateReferenceNumber: "EST-100",
    estimateTitle: "Quartz <System>",
    projectName: "Lobby & Hallway",
    trackedPortalLink: "https://app.example.test/portal/estimates/123",
    trackedOpenPixelUrl: "https://app.example.test/api/open?token=abc"
  });

  assert.equal(content.subject, "ACME & Floors shared estimate EST-100");
  assert.match(content.htmlBody, /Hi &lt;Customer&gt;/);
  assert.match(content.htmlBody, /ACME &amp; Floors/);
  assert.match(content.htmlBody, /Quartz &lt;System&gt;/);
  assert.match(content.htmlBody, /Project: Lobby &amp; Hallway/);
  assert.match(
    content.textBody,
    /Review the estimate here:\nhttps:\/\/app\.example\.test\/portal\/estimates\/123/
  );
});

void test("estimate review email falls back to reference number and generic recipient", () => {
  const content = buildEstimatePortalEmailContent({
    recipientName: null,
    organizationName: "FloorConnector",
    estimateReferenceNumber: "EST-200",
    estimateTitle: "   ",
    projectName: null,
    trackedPortalLink: "https://app.example.test/review",
    trackedOpenPixelUrl: "https://app.example.test/open"
  });

  assert.match(content.htmlBody, /Hi there/);
  assert.match(content.htmlBody, /estimate <strong>EST-200<\/strong>/);
  assert.doesNotMatch(content.htmlBody, /Project:/);
});
